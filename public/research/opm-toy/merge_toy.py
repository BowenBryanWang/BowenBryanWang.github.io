"""Exact toy: consolidating RL specialists by weight merging, distillation, or joint RL.

Policy: one-hidden-layer tanh MLP shared by all tasks, logits z(x) = W2 tanh(W1 x).
Task i is a chain of T_i decision steps with fixed context vectors.
  * main context phi_t: 1-2 "acceptable" actions pass to step t+1;
    one "detour" action leads to a recovery context chi_t; every other action fails.
  * recovery context chi_t: one acceptable action returns to step t+1, anything else fails.
  * failure: the episode runs L_f more steps through contexts psi_1..psi_Lf, reward 0.
Reward 1 iff the chain is completed.  All quantities (J, policy gradient, Fisher
matrices, trajectory KL) are computed in closed form: there is no sampling noise.
"""
import json
import os
import sys

# The matrices are tiny; multi-threaded BLAS only adds contention.
for _v in ('OMP_NUM_THREADS', 'OPENBLAS_NUM_THREADS', 'VECLIB_MAXIMUM_THREADS'):
    os.environ.setdefault(_v, '1')

import numpy as np
from scipy.stats import spearmanr

A, D, H = 6, 16, 32
P = H * D + A * H
BASE_TARGET = 0.25
LR = 0.003


def unpack(th):
    return th[: H * D].reshape(H, D), th[H * D:].reshape(A, H)


def forward(th, X):
    W1, W2 = unpack(th)
    Hh = np.tanh(X @ W1.T)
    Z = Hh @ W2.T
    Z = Z - Z.max(1, keepdims=True)
    return Hh, Z - np.log(np.exp(Z).sum(1, keepdims=True))


def backprop(th, X, dZ):
    if X.shape[0] == 0:
        return np.zeros(P)
    W1, W2 = unpack(th)
    Hh, _ = forward(th, X)
    dW2 = dZ.T @ Hh
    dW1 = ((dZ @ W2) * (1 - Hh ** 2)).T @ X
    return np.concatenate([dW1.ravel(), dW2.ravel()])


def ggn(th, X, w):
    """sum_c w_c J_c^T (diag pi_c - pi_c pi_c^T) J_c  (the Fisher at contexts X)."""
    if X.shape[0] == 0:
        return np.zeros((P, P))
    W1, W2 = unpack(th)
    Hh, lp = forward(th, X)
    p = np.exp(lp)
    C = X.shape[0]
    dh = 1 - Hh ** 2
    JW1 = np.einsum('kj,cj,cm->ckjm', W2, dh, X).reshape(C, A, H * D)
    JW2 = np.einsum('kl,cj->cklj', np.eye(A), Hh).reshape(C, A, A * H)
    J = np.concatenate([JW1, JW2], axis=2)                      # C x A x P
    M = (np.sqrt(w[:, None] * p)[:, :, None] * J).reshape(C * A, P)
    N = np.sqrt(w)[:, None] * np.einsum('ck,ckp->cp', p, J)
    return M.T @ M - N.T @ N


class Task:
    def __init__(self, rng, T, Lf):
        self.T, self.Lf = T, Lf
        self.Phi = rng.normal(size=(T, D)) / np.sqrt(D)
        self.Chi = rng.normal(size=(T, D)) / np.sqrt(D)
        self.Psi = rng.normal(size=(Lf, D)) / np.sqrt(D)
        self.acc = np.zeros((T, A), bool)
        self.det = np.zeros((T, A), bool)
        self.acc2 = np.zeros((T, A), bool)
        for t in range(T):
            k = 2 if rng.random() < 0.5 else 1
            perm = rng.permutation(A)
            self.acc[t, perm[:k]] = True
            self.det[t, perm[k]] = True
            self.acc2[t, rng.integers(A)] = True

    def st(self, th):
        lp = forward(th, self.Phi)[1]
        lp2 = forward(th, self.Chi)[1]
        p, p2 = np.exp(lp), np.exp(lp2)
        pacc = (p * self.acc).sum(1)
        pdet = (p * self.det).sum(1)
        r = (p2 * self.acc2).sum(1)
        s = pacc + pdet * r
        rho = np.concatenate([[1.0], np.cumprod(s)[:-1]])
        return dict(lp=lp, lp2=lp2, p=p, p2=p2, pacc=pacc, pdet=pdet, r=r, s=s,
                    rho=rho, J=float(np.prod(s)))

    def logJ(self, th):
        return float(np.log(self.st(th)['s']).sum())

    def J(self, th):
        return self.st(th)['J']

    def grad_logJ(self, th):
        q = self.st(th)
        c = self.acc + q['r'][:, None] * self.det
        dZ = q['p'] * (c - q['s'][:, None]) / q['s'][:, None]
        dZ2 = (q['pdet'] / q['s'])[:, None] * q['p2'] * (self.acc2 - q['r'][:, None])
        return backprop(th, self.Phi, dZ) + backprop(th, self.Chi, dZ2)

    def rl_grad(self, th):
        return self.J(th) * self.grad_logJ(th)          # exact policy gradient of J

    # ---- state-visitation weights and targets ---------------------------------
    def visit(self, th):
        """Expected visits of (main, recovery, failure) contexts under policy th."""
        q = self.st(th)
        return q['rho'], q['rho'] * q['pdet'], np.full(self.Lf, 1 - q['J'])

    def visit_succ(self, th):
        """Expected visits conditioned on success."""
        q = self.st(th)
        return np.ones(self.T), q['pdet'] * q['r'] / q['s'], np.zeros(self.Lf)

    def succ_targets(self, th):
        """Action distribution of the specialist conditioned on success."""
        q = self.st(th)
        c = self.acc + q['r'][:, None] * self.det
        return q['p'] * c / q['s'][:, None], q['p2'] * self.acc2 / q['r'][:, None]

    def fisher(self, th, kind):
        wm, wd, wf = self.visit(th) if kind == 'all' else self.visit_succ(th)
        F = ggn(th, self.Phi, wm) + ggn(th, self.Chi, wd)
        if kind == 'all':
            F = F + ggn(th, self.Psi, wf)
        return F

    def traj_kl(self, tha, thb):
        """KL(P_a || P_b) over whole trajectories = expected SUM of per-step KLs under a."""
        a, b = self.st(tha), self.st(thb)
        k1 = (a['p'] * (a['lp'] - b['lp'])).sum(1)
        k2 = (a['p2'] * (a['lp2'] - b['lp2'])).sum(1)
        out = (a['rho'] * (k1 + a['pdet'] * k2)).sum()
        la, lb = forward(tha, self.Psi)[1], forward(thb, self.Psi)[1]
        out += (1 - a['J']) * (np.exp(la) * (la - lb)).sum()
        return float(out)

    def exp_len(self, th):
        wm, wd, wf = self.visit(th)
        return float(wm.sum() + wd.sum() + wf.sum())

    def em_bound(self, th_i, th):
        """log J(th) >= log J(th_i) + E_{success rollouts of th_i}[log P_th - log P_thi]."""
        a, b = self.st(th_i), self.st(th)
        q, q2 = self.succ_targets(th_i)
        _, wd, _ = self.visit_succ(th_i)
        return (self.logJ(th_i) + (q * (b['lp'] - a['lp'])).sum()
                + (wd[:, None] * q2 * (b['lp2'] - a['lp2'])).sum())


def adam_run(grad_fn, th0, steps, lr=LR, state=None):
    th = th0.copy()
    if state is None:
        state = dict(m=np.zeros(P), v=np.zeros(P), t=0)
    for _ in range(steps):
        g = grad_fn(th)
        state['t'] += 1
        state['m'] = 0.9 * state['m'] + 0.1 * g
        state['v'] = 0.999 * state['v'] + 0.001 * g * g
        mh = state['m'] / (1 - 0.9 ** state['t'])
        vh = state['v'] / (1 - 0.999 ** state['t'])
        th = th + lr * mh / (np.sqrt(vh) + 1e-8)
    return th, state


def make_problem(seed, horizons, Lf):
    rng = np.random.default_rng(seed)
    tasks = [Task(rng, T, Lf) for T in horizons]
    th = rng.normal(size=P) * 0.3
    st = None
    for _ in range(20000):                      # "pretraining" to J ~ 0.25 on every task
        below = [t for t in tasks if t.J(th) < BASE_TARGET]
        if not below:
            break
        th, st = adam_run(lambda x: sum(t.grad_logJ(x) for t in below), th, 1, LR, st)
    return tasks, th


# ---- closed-form merges -----------------------------------------------------------
def fisher_merge(thetas, Fs, prior, mu_rel=1e-3, diag=False, grads=None):
    """argmin sum_i 0.5 (th - th_i)^T F_i (th - th_i) [- g_i^T (th - th_i)], damped toward `prior`."""
    if diag:
        Fs = [np.diag(np.diag(F)) for F in Fs]
    S = sum(Fs)
    mu = mu_rel * np.trace(S) / P
    rhs = sum(F @ th for F, th in zip(Fs, thetas)) + mu * prior
    if grads is not None:
        rhs = rhs + sum(grads)
    return np.linalg.solve(S + mu * np.eye(P), rhs)


def ties(th0, taus, density=0.2, lam=1.0):
    T = np.stack(taus)
    k = int(P * density)
    Tt = np.zeros_like(T)
    for i in range(T.shape[0]):
        idx = np.argsort(-np.abs(T[i]))[:k]
        Tt[i, idx] = T[i, idx]
    sign = np.sign(Tt.sum(0))
    agree = (np.sign(Tt) == sign) & (Tt != 0)
    return th0 + lam * (Tt * agree).sum(0) / np.maximum(agree.sum(0), 1)


def project_range(F, v, tol=1e-6):
    lam, U = np.linalg.eigh(F)
    keep = lam > tol * lam.max()
    return U[:, keep] @ (U[:, keep].T @ v), int(keep.sum())


# ---- function-space consolidation -------------------------------------------------
def consolidate(tasks, specs, start, steps, kind):
    """kind:
      sft_all   forward KL to the specialist on the SPECIALIST's rollouts (all of them)
      sft_succ  cross-entropy on the specialist's SUCCESSFUL rollouts (the EM bound)
      opd_fwd   forward KL to the specialist on the STUDENT's rollouts
      opd       reverse KL to the specialist on the STUDENT's rollouts (MOPD-style)
      rl        joint policy gradient on sum_i J_i
      kick      opd + rl
    Visitation weights are treated as constants (no gradient through the sampler)."""
    fixed = []
    for t, s in zip(tasks, specs):
        q = t.st(s)
        tgt_psi = np.exp(forward(s, t.Psi)[1])
        if kind == 'sft_succ':
            qm, qd = t.succ_targets(s)
            fixed.append((t.visit_succ(s), (qm, qd, tgt_psi)))
        else:
            fixed.append((t.visit(s), (q['p'], q['p2'], tgt_psi)))

    def g(th):
        out = np.zeros(P)
        for t, (w_teacher, tg) in zip(tasks, fixed):
            if kind in ('rl', 'kick'):
                out += t.rl_grad(th)
                if kind == 'rl':
                    continue
            w = w_teacher if kind.startswith('sft') else t.visit(th)
            for X, wt, target in zip((t.Phi, t.Chi, t.Psi), w, tg):
                if X.shape[0] == 0:
                    continue
                lp = forward(th, X)[1]
                p = np.exp(lp)
                if kind in ('opd', 'kick'):
                    lt = np.log(np.maximum(target, 1e-300))
                    kl = (p * (lp - lt)).sum(1, keepdims=True)
                    dZ = -wt[:, None] * p * (lp - lt - kl)
                else:
                    dZ = wt[:, None] * (target - p)
                out += backprop(th, X, dZ)
        return out
    return adam_run(g, start, steps)[0]


def scores(tasks, th):
    return np.array([t.J(th) for t in tasks])


# ---- experiments ------------------------------------------------------------------
def exp_main(seed, horizons, Lf, K, budgets):
    tasks, th0 = make_problem(seed, horizons, Lf)
    n = len(tasks)
    specs = [adam_run(t.rl_grad, th0, K)[0] for t in tasks]
    taus = [s - th0 for s in specs]
    avg = th0 + sum(taus) / n
    Fs = [t.fisher(s, 'succ') for t, s in zip(tasks, specs)]
    Fa = [t.fisher(s, 'all') for t, s in zip(tasks, specs)]
    out = {}
    out['base'] = scores(tasks, th0)
    out['specialists (each on its own task)'] = np.array([t.J(s) for t, s in zip(tasks, specs)])
    out['merge: average'] = scores(tasks, avg)
    out['merge: task arithmetic, lam=1'] = scores(tasks, th0 + sum(taus))
    lam = max((scores(tasks, th0 + l * sum(taus)).mean(), l) for l in np.linspace(0.1, 1.0, 19))[1]
    ta_or = th0 + lam * sum(taus)
    out['merge: task arithmetic, oracle lam'] = scores(tasks, ta_or)
    out['merge: TIES'] = scores(tasks, ties(th0, taus))
    out['merge: Fisher diagonal (successes)'] = scores(tasks, fisher_merge(specs, Fs, avg, diag=True))
    fm_all = fisher_merge(specs, Fa, avg)
    fm_succ = fisher_merge(specs, Fs, avg)
    out['merge: Fisher full matrix (all rollouts)'] = scores(tasks, fm_all)
    out['merge: Fisher full matrix (successes)'] = scores(tasks, fm_succ)
    proj = [project_range(F, tau) for F, tau in zip(Fs, taus)]
    out['merge: task arithmetic on Fisher-range part'] = scores(tasks, th0 + sum(p[0] for p in proj))
    own_keep = np.array([t.J(th0 + p[0]) for t, p in zip(tasks, proj)])
    frac_norm = np.array([np.linalg.norm(p[0]) ** 2 / np.linalg.norm(tau) ** 2 for p, tau in zip(proj, taus)])
    rank = np.array([p[1] for p in proj])
    for B in budgets:
        for kind, lab in [('sft_all', 'distill: specialist rollouts, all'),
                          ('sft_succ', 'distill: specialist rollouts, successes only'),
                          ('opd_fwd', 'distill: student rollouts, forward KL'),
                          ('opd', 'distill: student rollouts, reverse KL (MOPD-style)'),
                          ('rl', 'joint RL from the average merge'),
                          ('kick', 'joint RL + MOPD loss from the average merge')]:
            out[f'{lab} | {B}'] = scores(tasks, consolidate(tasks, specs, avg, B, kind))
        joint = adam_run(lambda x: sum(t.rl_grad(x) for t in tasks), th0, K + B)[0]
        out[f'joint RL from base, no specialists | {B}'] = scores(tasks, joint)
    B0 = budgets[0]
    for name, init in [('base', th0), ('average', avg), ('task arith', ta_or), ('Fisher full', fm_succ)]:
        out[f'init={name}: MOPD-style | {B0}'] = scores(tasks, consolidate(tasks, specs, init, B0, 'opd'))
        out[f'init={name}: successes-only | {B0}'] = scores(tasks, consolidate(tasks, specs, init, B0, 'sft_succ'))

    # diagnostics: does cosine or cross-KL predict interference?
    pairs = []
    for j in range(n):
        for i in range(n):
            if i == j:
                continue
            th = specs[j] + taus[i]
            cos = taus[i] @ taus[j] / (np.linalg.norm(taus[i]) * np.linalg.norm(taus[j]))
            pairs.append(dict(cos=float(cos), kl=tasks[j].traj_kl(specs[j], th),
                              quad=float(0.5 * taus[i] @ Fa[j] @ taus[i]),
                              dlogJ=tasks[j].logJ(th) - tasks[j].logJ(specs[j])))
    # bounds
    bnd = []
    for name, th in [('average', avg), ('fisher', fm_succ)]:
        for j in range(n):
            bnd.append(dict(m=name, logJ=tasks[j].logJ(th), em=float(tasks[j].em_bound(specs[j], th)),
                            dJ=tasks[j].J(th) - tasks[j].J(specs[j]),
                            pinsker=float(np.sqrt(tasks[j].traj_kl(specs[j], th) / 2))))
    extra = dict(own_keep=own_keep, frac_norm=frac_norm, rank=rank,
                 spec_r=np.array([t.st(s)['r'].mean() for t, s in zip(tasks, specs)]),
                 base_r=np.array([t.st(th0)['r'].mean() for t in tasks]),
                 fail_share=np.array([(1 - t.J(s)) * t.Lf / t.exp_len(s) for t, s in zip(tasks, specs)]))
    return out, pairs, bnd, extra


def exp_radius(seed, horizons, Lf, Ks):
    tasks, th0 = make_problem(seed, horizons, Lf)
    n = len(tasks)
    rows = []
    for K in Ks:
        specs = [adam_run(t.rl_grad, th0, K)[0] for t in tasks]
        taus = [s - th0 for s in specs]
        avg = th0 + sum(taus) / n
        Fs = [t.fisher(s, 'succ') for t, s in zip(tasks, specs)]
        Fa = [t.fisher(s, 'all') for t, s in zip(tasks, specs)]
        base = scores(tasks, th0).mean()
        spec = np.mean([t.J(s) for t, s in zip(tasks, specs)])
        row = dict(K=K, spec=float(spec), base=float(base))
        cands = {'average': avg, 'task arithmetic': th0 + sum(taus),
                 'Fisher diagonal': fisher_merge(specs, Fs, avg, diag=True),
                 'Fisher full': fisher_merge(specs, Fs, avg),
                 'Fisher full, all rollouts': fisher_merge(specs, Fa, avg),
                 'Fisher full + gradient term': fisher_merge(
                     specs, Fs, avg, grads=[t.grad_logJ(s) for t, s in zip(tasks, specs)]),
                 'successes-only distill, 30 steps': consolidate(tasks, specs, avg, 30, 'sft_succ'),
                 'MOPD-style, 30 steps': consolidate(tasks, specs, avg, 30, 'opd')}
        for name, th in cands.items():
            row[name] = float((scores(tasks, th).mean() - base) / (spec - base))
        fm = cands['Fisher full']
        kl = [t.traj_kl(s, fm) for t, s in zip(tasks, specs)]
        quad = [0.5 * (fm - s) @ F @ (fm - s) for s, F in zip(specs, Fa)]
        row['kl_fisher'] = float(np.mean(kl))
        row['kl_over_quad'] = float(np.mean(kl) / max(np.mean(quad), 1e-12))
        row['kl_base_spec'] = float(np.mean([t.traj_kl(s, th0) for t, s in zip(tasks, specs)]))
        rows.append(row)
    return rows


def exp_periodic(seed, horizons, Lf, total, K, how):
    tasks, th0 = make_problem(seed, horizons, Lf)
    n = len(tasks)
    if how == 'joint':
        th = adam_run(lambda x: sum(t.rl_grad(x) for t in tasks), th0, total)[0]
        return scores(tasks, th), 0.0
    th = th0.copy()
    states = [None] * n
    kls = []
    for _ in range(total // K):
        loc = []
        for i, t in enumerate(tasks):
            x, states[i] = adam_run(t.rl_grad, th, K, LR, states[i])
            loc.append(x)
        avg = sum(loc) / n
        if how == 'average':
            new = avg
        elif how == 'sum':
            new = th + sum(l - th for l in loc)
        else:
            kind = 'all' if 'all' in how else 'succ'
            Fs = [t.fisher(s, kind) for t, s in zip(tasks, loc)]
            if 'mean' in how:      # per-token average instead of the per-rollout sum
                Fs = [F / (t.T + t.visit_succ(s)[1].sum()) for F, t, s in zip(Fs, tasks, loc)]
            new = fisher_merge(loc, Fs, avg, diag=('diag' in how))
        kls.append(np.mean([t.traj_kl(s, new) for t, s in zip(tasks, loc)]))
        th = new
    return scores(tasks, th), float(np.max(kls))


def exp_horizon(seed, T, Lf, K):
    tasks, th0 = make_problem(seed, [T] * 4, Lf)
    specs = [adam_run(t.rl_grad, th0, K)[0] for t in tasks]
    taus = [s - th0 for s in specs]
    avg = th0 + sum(taus) / 4
    ta = th0 + sum(taus)
    base = scores(tasks, th0).mean()
    spec = np.mean([t.J(s) for t, s in zip(tasks, specs)])
    row = dict(T=T, spec=float(spec), tau_norm=float(np.mean([np.linalg.norm(x) for x in taus])))
    for name, th in [('average', avg), ('task arithmetic', ta)]:
        kl = np.mean([t.traj_kl(s, th) for t, s in zip(tasks, specs)])
        ln = np.mean([t.exp_len(s) for t, s in zip(tasks, specs)])
        row[name] = dict(captured=float((scores(tasks, th).mean() - base) / (spec - base)),
                         traj_kl=float(kl), tok_kl=float(kl / ln),
                         retention=float(np.mean([t.J(th) / t.J(s) for t, s in zip(tasks, specs)])))
    return row


def ms(v):
    v = np.asarray(v, float)
    return v.mean(), v.std(ddof=1) / np.sqrt(len(v))


if __name__ == '__main__':
    mode = sys.argv[1]
    seeds = range(int(sys.argv[2]) if len(sys.argv) > 2 else 10)
    horizons = [2, 6, 16, 16]
    Lf = 20
    dump = {}
    if mode == 'main':
        K, budgets = 30, [30, 100, 300]
        res, pairs, bnd, ext = {}, [], [], {}
        for s in seeds:
            o, pr, b, e = exp_main(s, horizons, Lf, K, budgets)
            pairs += pr
            bnd += b
            for k, v in o.items():
                res.setdefault(k, []).append(v)
            for k, v in e.items():
                ext.setdefault(k, []).append(v)
        print(f'# horizons={horizons} Lf={Lf} K={K} seeds={len(seeds)}')
        print(f'{"method":58s} meanJ   se    | per-task J')
        for k, v in res.items():
            v = np.array(v)
            m, se = ms(v.mean(1))
            dump[k] = dict(mean=m, se=se, per_task=v.mean(0).tolist())
            print(f'{k:58s} {m:.3f}  {se:.3f} | ' + ' '.join(f'{x:.2f}' for x in v.mean(0)))
        ac = np.abs([p['cos'] for p in pairs]); kl = [p['kl'] for p in pairs]
        qd = [p['quad'] for p in pairs]; dj = np.abs([p['dlogJ'] for p in pairs])
        print(f'pairs={len(pairs)}  mean|cos|={ac.mean():.3f} max|cos|={ac.max():.3f}')
        print(f'spearman(|dlogJ|, |cos|)   = {spearmanr(dj, ac)[0]:.3f}')
        print(f'spearman(|dlogJ|, traj KL) = {spearmanr(dj, kl)[0]:.3f}')
        print(f'spearman(|dlogJ|, 0.5 tau F tau) = {spearmanr(dj, qd)[0]:.3f}')
        dump['pairs'] = dict(mean_abs_cos=float(ac.mean()), max_abs_cos=float(ac.max()),
                             rho_cos=float(spearmanr(dj, ac)[0]), rho_kl=float(spearmanr(dj, kl)[0]),
                             rho_quad=float(spearmanr(dj, qd)[0]))
        print('EM bound violations:', sum(b['logJ'] < b['em'] - 1e-9 for b in bnd), 'of', len(bnd),
              '| Pinsker violations:', sum(abs(b['dJ']) > b['pinsker'] + 1e-9 for b in bnd))
        for m in ['average', 'fisher']:
            bb = [b for b in bnd if b['m'] == m]
            print(f'  {m}: mean logJ {np.mean([b["logJ"] for b in bb]):.3f}  mean EM lower bound {np.mean([b["em"] for b in bb]):.3f}')
        for k, v in ext.items():
            print(f'{k:10s}', ' '.join(f'{x:.3f}' for x in np.array(v).mean(0)))
            dump['ext_' + k] = np.array(v).mean(0).tolist()
    if mode == 'radius':
        Ks = [1, 2, 5, 10, 20, 30, 50, 100]
        allr = [exp_radius(s, horizons, Lf, Ks) for s in seeds]
        keys = [k for k in allr[0][0] if k != 'K']
        print('K    ' + '  '.join(f'{k[:22]:>22s}' for k in keys))
        dump['rows'] = []
        for i, K in enumerate(Ks):
            row = {k: float(np.mean([r[i][k] for r in allr])) for k in keys}
            row['K'] = K
            dump['rows'].append(row)
            print(f'{K:4d} ' + '  '.join(f'{row[k]:22.3f}' for k in keys))
    if mode == 'periodic':
        total = 50
        dump['rows'] = []
        for how in ['joint', 'sum', 'average', 'fisher', 'fisher-mean', 'fisher-diag', 'fisher-diag-mean', 'fisher-all']:
            for K in ([total] if how == 'joint' else [1, 5, 10, 25, 50]):
                r = [exp_periodic(s, horizons, Lf, total, K, how) for s in seeds]
                m, se = ms([x[0].mean() for x in r])
                kl = float(np.mean([x[1] for x in r]))
                per = np.mean([x[0] for x in r], axis=0)
                dump['rows'].append(dict(how=how, K=K, mean=m, se=se, max_kl=kl, per_task=per.tolist()))
                print(f'{how:16s} K={K:3d} meanJ {m:.3f} se {se:.3f}  max trajKL(worker||merge) {kl:.3f}  '
                      + ' '.join(f'{x:.2f}' for x in per))
    if mode == 'local':
        # Do the distillation objectives converge to the closed-form Fisher merge?
        dump['rows'] = []
        for K in [2, 30]:
            acc = {}
            for seed in seeds:
                tasks, th0 = make_problem(seed, horizons, Lf)
                specs = [adam_run(t.rl_grad, th0, K)[0] for t in tasks]
                avg = sum(specs) / len(tasks)
                base = scores(tasks, th0).mean()
                spec = np.mean([t.J(s) for t, s in zip(tasks, specs)])
                cand = {'Fisher merge (all rollouts)': fisher_merge(
                    specs, [t.fisher(s, 'all') for t, s in zip(tasks, specs)], avg), 'average': avg}
                for kind, lab in [('sft_all', 'off-policy distill, 1500 steps'), ('opd', 'MOPD-style, 1500 steps')]:
                    cand[lab] = consolidate(tasks, specs, avg, 1500, kind)
                for name, th in cand.items():
                    acc.setdefault(name, []).append((
                        (scores(tasks, th).mean() - base) / (spec - base),
                        np.mean([t.traj_kl(s, th) for t, s in zip(tasks, specs)])))
            for name, v in acc.items():
                v = np.array(v).mean(0)
                dump['rows'].append(dict(K=K, name=name, captured=float(v[0]), kl_spec=float(v[1])))
                print(f'K={K:3d} {name:34s} captured {v[0]:.3f}  KL(specialist||x) {v[1]:.4f}')
    if mode == 'horizon':
        dump['rows'] = []
        for T in [2, 4, 8, 16, 32]:
            r = [exp_horizon(s, T, Lf, 30) for s in seeds]
            row = dict(T=T, spec=float(np.mean([x['spec'] for x in r])),
                       tau_norm=float(np.mean([x['tau_norm'] for x in r])))
            for name in ['average', 'task arithmetic']:
                row[name] = {k: float(np.mean([x[name][k] for x in r])) for k in r[0][name]}
            dump['rows'].append(row)
            print(json.dumps(row))
    json.dump(dump, open(f'out_{mode}.json', 'w'), indent=1, default=float)
