"""On-Policy Merging (OPM): exact-toy experiments.

One RL trainer per task. Every trainer starts from a shared anchor, trains on its own
task, and all trainers are merged into a new anchor (a "rendezvous"). The merge is the
second-order KL barycenter of the trainers' policies, measured on each trainer's own
current rollouts:  theta+ = (sum_i F_i)^-1 sum_i F_i theta_i.

Reuses the environment and exact quantities from merge_toy.py (same directory).
Usage:  python opm_toy.py <mode> [seeds]
        modes: checks h2h practical rules cg metric trigger slow mismatch
"""
import json
import os
import sys

for _v in ('OMP_NUM_THREADS', 'OPENBLAS_NUM_THREADS', 'VECLIB_MAXIMUM_THREADS'):
    os.environ.setdefault(_v, '1')

import numpy as np

import merge_toy as m
from merge_toy import A, D, H, P

HORIZONS = [2, 6, 16, 16]
LF = 20


# ---- metrics measured on a trainer's own visit distribution ----------------------------
def visits(task, th):
    wm, wd, wf = task.visit(th)
    return np.concatenate([task.Phi, task.Chi, task.Psi]), np.concatenate([wm, wd, wf])


def block(a, b):
    out = np.zeros((P, P))
    out[: H * D, : H * D] = a
    out[H * D:, H * D:] = b
    return out


def metric(task, th, rule):
    """P x P matrix M_i for one trainer. All variants use only the trainer's own rollouts."""
    if rule == 'identity':
        return np.eye(P)
    if rule == 'full':
        return task.fisher(th, 'all')
    if rule == 'full-succ':
        return task.fisher(th, 'succ')
    if rule == 'diag':
        return np.diag(np.diag(task.fisher(th, 'all')))
    X, w = visits(task, th)
    W1, W2 = m.unpack(th)
    Hh, lp = m.forward(th, X)
    p = np.exp(lp)
    A1 = (X * w[:, None]).T @ X                 # input Gram of layer 1
    A2 = (Hh * w[:, None]).T @ Hh               # input Gram of layer 2
    if rule == 'regmean':                       # layer-wise input Grams only
        return block(np.kron(np.eye(H), A1), np.kron(np.eye(A), A2))
    if rule == 'kfac':                          # Kronecker factors: input Gram x output-gradient covariance
        S = np.einsum('ca,ab->cab', p, np.eye(A)) - np.einsum('ca,cb->cab', p, p)
        G2 = np.einsum('c,cab->ab', w, S) / w.sum()
        B = W2[None, :, :] * (1 - Hh ** 2)[:, None, :]          # d logits / d pre-activation
        G1 = np.einsum('c,cah,cab,cbk->hk', w, B, S, B) / w.sum()
        return block(np.kron(G1, A1), np.kron(G2, A2))
    raise ValueError(rule)


def merge(tasks, anchor, loc, rule, metric_at='worker', base=None, prior='avg'):
    n = len(tasks)
    avg = sum(loc) / n
    summed = anchor + sum(x - anchor for x in loc)
    if rule == 'avg':
        return avg
    if rule == 'sum':
        return summed
    if rule.startswith('distill'):               # a few KL steps on the trainers' own rollouts
        steps = int(rule.split('-')[1])
        return m.consolidate(tasks, loc, summed, steps, 'sft_all')
    where = {'worker': loc, 'anchor': [anchor] * n, 'base': [base] * n}[metric_at]
    if rule.startswith('cg'):                    # matrix-free version: k conjugate-gradient iterations
        iters = int(rule.split('-')[1])          # each iteration costs one Fisher-vector product per trainer
        Ms = [metric(t, w, 'full') for t, w in zip(tasks, where)]
        return cg_merge(loc, Ms, summed if 'sum' in rule else avg, iters)
    Ms = [metric(t, w, rule) for t, w in zip(tasks, where)]
    return m.fisher_merge(loc, Ms, avg if prior == 'avg' else summed)


def cg_merge(loc, Ms, start, iters, mu_rel=1e-3):
    """Solve (sum_i F_i + mu I) x = sum_i F_i theta_i + mu * start by conjugate gradient from `start`,
    touching the F_i only through matrix-vector products."""
    mu = mu_rel * sum(np.trace(F) for F in Ms) / P
    mv = lambda v: sum(F @ v for F in Ms) + mu * v
    b = sum(F @ th for F, th in zip(Ms, loc)) + mu * start
    x = start.copy()
    r = b - mv(x)
    p = r.copy()
    rs = r @ r
    for _ in range(iters):
        Ap = mv(p)
        alpha = rs / (p @ Ap)
        x = x + alpha * p
        r = r - alpha * Ap
        rs_new = r @ r
        if rs_new < 1e-30:
            break
        p = r + (rs_new / rs) * p
        rs = rs_new
    return x


def chi2(task, tha, thb):
    """chi^2(P_b || P_a) = E_a[w^2] - 1 with w = P_b / P_a over whole rollouts (exact)."""
    a, b = task.st(tha), task.st(thb)
    r1 = b['p'] ** 2 / a['p']
    r2 = b['p2'] ** 2 / a['p2']
    m_acc = (r1 * task.acc).sum(1)
    m_det = (r1 * task.det).sum(1)
    m_wrong = r1.sum(1) - m_acc - m_det
    n_acc = (r2 * task.acc2).sum(1)
    n_wrong = r2.sum(1) - n_acc
    la, lb = m.forward(tha, task.Psi)[1], m.forward(thb, task.Psi)[1]
    Mf = np.exp(np.log(np.exp(2 * lb - la).sum(1)).sum())
    s2 = m_acc + m_det * n_acc
    f = (m_wrong + m_det * n_wrong) * Mf
    pre = np.concatenate([[1.0], np.cumprod(s2)[:-1]])
    return float(np.prod(s2) + (pre * f).sum() - 1.0)


# ---- the training loop ------------------------------------------------------------------
def run_opm(seed, total, rule, K=5, trigger=None, speeds=None, metric_at='worker', prior='avg',
            record=False):
    """total: local steps for a speed-1 trainer. speeds[i]: local steps per round = K * speeds[i].
    trigger: if set, ignore K and merge when max_i KL(P_i || P_anchor) over rollouts exceeds it."""
    tasks, th0 = m.make_problem(seed, HORIZONS, LF)
    n = len(tasks)
    speeds = speeds or [1.0] * n
    th = th0.copy()
    states = [None] * n
    done, merges, log = 0, 0, []
    while done < total:
        loc = [th.copy() for _ in range(n)]
        steps = 0
        while True:
            k = 1 if trigger is not None else min(K, total - done)
            for i, t in enumerate(tasks):
                ki = int(round(k * speeds[i]))
                if ki > 0:
                    loc[i], states[i] = m.adam_run(t.rl_grad, loc[i], ki, m.LR, states[i])
            steps += k
            if trigger is None or done + steps >= total:
                break
            if max(t.traj_kl(x, th) for t, x in zip(tasks, loc)) >= trigger:
                break
        new = merge(tasks, th, loc, rule, metric_at, th0, prior)
        if record:
            for t, x in zip(tasks, loc):
                d = new - x
                log.append(dict(eps=t.traj_kl(x, new), quad=float(0.5 * d @ t.fisher(x, 'all') @ d),
                                chi2=chi2(t, x, new), J_worker=t.J(x), J_merged=t.J(new),
                                first_order=float(t.rl_grad(x) @ d)))
        th = new
        done += steps
        merges += 1
    return m.scores(tasks, th), merges, log


def joint_rl(seed, steps, weights=None):
    tasks, th0 = m.make_problem(seed, HORIZONS, LF)
    weights = weights or [1.0] * len(tasks)
    th = m.adam_run(lambda x: sum(w * t.rl_grad(x) for w, t in zip(weights, tasks)), th0, steps)[0]
    return m.scores(tasks, th)


def specialists_then(seed, S, B, how):
    """Train specialists for S steps each, then consolidate.
    how: 'ta' (task arithmetic, oracle coefficient), 'avg', or 'mopd' (B MOPD-style steps from the
    oracle task-arithmetic point)."""
    tasks, th0 = m.make_problem(seed, HORIZONS, LF)
    specs = [m.adam_run(t.rl_grad, th0, S)[0] for t in tasks]
    taus = [s - th0 for s in specs]
    if how == 'avg':
        return m.scores(tasks, th0 + sum(taus) / len(tasks))
    lam = max((m.scores(tasks, th0 + l * sum(taus)).mean(), l) for l in np.linspace(0.1, 1.0, 19))[1]
    ta = th0 + lam * sum(taus)
    if how == 'ta':
        return m.scores(tasks, ta)
    return m.scores(tasks, m.consolidate(tasks, specs, ta, B, 'opd'))


def ms(v):
    v = np.asarray(v, float)
    return float(v.mean()), float(v.std(ddof=1) / np.sqrt(len(v)))


def show(label, rows, extra=''):
    v = np.array(rows)
    mean, se = ms(v.mean(1))
    print(f'{label:46s} mean {mean:.3f} se {se:.3f} | ' + ' '.join(f'{x:.2f}' for x in v.mean(0)) + extra, flush=True)
    return dict(label=label, mean=mean, se=se, per_task=v.mean(0).tolist())


if __name__ == '__main__':
    mode = sys.argv[1]
    seeds = range(int(sys.argv[2]) if len(sys.argv) > 2 else 10)
    out = []

    if mode == 'checks':
        # (a) Theorem 3: one natural-gradient step per trainer + Fisher merge = natural gradient on sum_i J_i
        # (b) Theorem 2: the merged point keeps every trainer's first-order gain
        for seed in seeds:
            tasks, th0 = m.make_problem(seed, HORIZONS, LF)
            Fs = [t.fisher(th0, 'all') for t in tasks]
            gs = [t.rl_grad(th0) for t in tasks]
            eta = 1e-3
            deltas = [eta * np.linalg.pinv(F, rcond=1e-10) @ g for F, g in zip(Fs, gs)]
            Sp = np.linalg.pinv(sum(Fs), rcond=1e-10)
            merged = Sp @ sum(F @ d for F, d in zip(Fs, deltas))
            npg = eta * Sp @ sum(gs)
            in_range = max(np.linalg.norm(g - F @ np.linalg.pinv(F, rcond=1e-10) @ g) / np.linalg.norm(g)
                           for F, g in zip(Fs, gs))
            rel = np.linalg.norm(merged - npg) / np.linalg.norm(npg)
            # first-order gain kept: g_i . (merged - delta_i) relative to g_i . delta_i
            kept_opm = [g @ merged / (g @ d) for g, d in zip(gs, deltas)]
            kept_sum = [g @ sum(deltas) / (g @ d) for g, d in zip(gs, deltas)]
            kept_avg = [g @ (sum(deltas) / len(tasks)) / (g @ d) for g, d in zip(gs, deltas)]
            row = dict(seed=seed, npg_rel_err=float(rel), grad_outside_range=float(in_range),
                       kept_opm=float(np.mean(kept_opm)), kept_sum=float(np.mean(kept_sum)),
                       kept_avg=float(np.mean(kept_avg)), rank_sum=int(np.linalg.matrix_rank(sum(Fs), tol=1e-8)))
            out.append(row)
            print(row, flush=True)
        print('mean first-order gain kept: OPM %.4f  sum %.4f  avg %.4f' % tuple(
            np.mean([r[k] for r in out]) for k in ('kept_opm', 'kept_sum', 'kept_avg')))

    if mode == 'h2h':
        for N in [25, 50, 100, 200]:
            print(f'--- budget: {N} optimizer steps per task', flush=True)
            def add(label, rows, **kw):
                r = show(label, rows)
                r.update(N=N, **kw)
                out.append(r)
            add('multi-task RL (mixed gradient)', [joint_rl(s, N) for s in seeds])
            add('specialists -> average', [specialists_then(s, N, 0, 'avg') for s in seeds])
            add('specialists -> task arithmetic (oracle coef)', [specialists_then(s, N, 0, 'ta') for s in seeds])
            best = None
            for frac in [0.25, 0.5, 0.75]:
                S = int(N * frac)
                r = show(f'specialists({S}) -> MOPD({N - S})', [specialists_then(s, S, N - S, 'mopd') for s in seeds])
                r.update(N=N, split=frac)
                out.append(r)
                best = r if best is None or r['mean'] > best['mean'] else best
            out.append(dict(label='specialists -> MOPD (best split)', N=N, mean=best['mean'], se=best['se']))
            add('periodic sum, K=5', [run_opm(s, N, 'sum')[0] for s in seeds])
            add('OPM full Fisher, K=5', [run_opm(s, N, 'full')[0] for s in seeds])
            add('OPM K-FAC, K=5', [run_opm(s, N, 'kfac')[0] for s in seeds])
            add('OPM RegMean, K=5', [run_opm(s, N, 'regmean')[0] for s in seeds])
            r = [run_opm(s, N, 'full', trigger=0.1) for s in seeds]
            add('OPM full Fisher, KL trigger 0.1', [x[0] for x in r], merges=float(np.mean([x[1] for x in r])))

    if mode == 'rules':
        N = 50
        for rule in ['avg', 'sum', 'diag', 'regmean', 'kfac', 'full', 'full-succ', 'distill-3', 'distill-10']:
            for K in [1, 5, 10, 25, 50]:
                if rule.startswith('distill') and K == 1:
                    continue
                r = show(f'{rule:10s} K={K:2d}', [run_opm(s, N, rule, K=K)[0] for s in seeds])
                r.update(rule=rule, K=K)
                out.append(r)
        r = show('full, prior=sum K= 5', [run_opm(s, N, 'full', K=5, prior='sum')[0] for s in seeds])
        r.update(rule='full-prior-sum', K=5)
        out.append(r)

    if mode == 'cg':
        for N in [50, 100]:
            for rule in ['cg-1', 'cg-3', 'cg-10', 'cg-30', 'cg-100', 'cg-3-sum', 'cg-10-sum', 'cg-30-sum', 'full']:
                r = show(f'N={N} {rule:10s} K=5', [run_opm(s, N, rule, K=5)[0] for s in seeds])
                r.update(N=N, rule=rule)
                out.append(r)

    if mode == 'practical':
        # the configuration we would actually run: 10 CG iterations, KL-triggered rendezvous
        for N in [25, 50, 100, 200]:
            for delta in [0.1, 0.3]:
                r = [run_opm(s, N, 'cg-10', trigger=delta) for s in seeds]
                row = show(f'N={N} OPM cg-10, trigger {delta}', [x[0] for x in r],
                           extra=f' | merges {np.mean([x[1] for x in r]):.1f}')
                row.update(N=N, delta=delta, merges=float(np.mean([x[1] for x in r])))
                out.append(row)

    if mode == 'metric':
        # where is the metric measured? the trainer's current rollouts, the anchor's, or the base model's
        for N in [50, 100]:
            for rule in ['full', 'kfac']:
                for at in ['worker', 'anchor', 'base']:
                    for K in [5, 10]:
                        r = show(f'N={N} {rule:5s} metric on {at:6s} K={K}',
                                 [run_opm(s, N, rule, K=K, metric_at=at)[0] for s in seeds])
                        r.update(N=N, rule=rule, at=at, K=K)
                        out.append(r)

    if mode == 'trigger':
        N = 100
        for delta in [0.01, 0.03, 0.1, 0.3, 1.0, 3.0]:
            for rule in ['full', 'kfac', 'sum']:
                r = [run_opm(s, N, rule, trigger=delta) for s in seeds]
                row = show(f'{rule:5s} trigger KL>={delta:<5}', [x[0] for x in r],
                           extra=f' | merges {np.mean([x[1] for x in r]):.1f}')
                row.update(rule=rule, delta=delta, merges=float(np.mean([x[1] for x in r])))
                out.append(row)
        for K in [2, 5, 10, 20, 50]:
            for rule in ['full', 'kfac']:
                row = show(f'{rule:5s} fixed K={K}', [run_opm(s, N, rule, K=K)[0] for s in seeds],
                           extra=f' | merges {N // K}')
                row.update(rule=rule, K=K, merges=N // K)
                out.append(row)

    if mode == 'slow':
        N = 100
        for name, speeds, w in [('slow x5 (task 4 gets 1 step per 5)', [1, 1, 1, 0.2], [1, 1, 1, 0.2]),
                                ('stalled (task 4 never trains)', [1, 1, 1, 0.0], [1, 1, 1, 0.0])]:
            print('---', name, flush=True)
            def add(label, rows):
                r = show(label, rows)
                r.update(case=name)
                out.append(r)
            add('multi-task RL, gradient weights = sample share', [joint_rl(s, N, w) for s in seeds])
            for rule in ['sum', 'avg', 'kfac', 'full']:
                add(f'periodic {rule}, K=5', [run_opm(s, N, rule, K=5, speeds=speeds)[0] for s in seeds])
        base = [m.scores(*m.make_problem(s, HORIZONS, LF)) for s in seeds]
        add('base model', base)

    if mode == 'mismatch':
        N = 50
        for rule in ['full', 'sum']:
            for K in [1, 5, 10, 25]:
                logs = sum((run_opm(s, N, rule, K=K, record=True)[2] for s in seeds), [])
                eps = np.array([l['eps'] for l in logs])
                c2 = np.array([l['chi2'] for l in logs])
                dJ = np.array([l['J_merged'] - l['J_worker'] for l in logs])
                viol = int(np.sum(-dJ > np.sqrt(eps / 2) + 1e-9))
                row = dict(rule=rule, K=K, eps=float(eps.mean()), eps_med=float(np.median(eps)),
                           quad=float(np.mean([l['quad'] for l in logs])),
                           quad_med=float(np.median([l['quad'] for l in logs])),
                           chi2=float(np.median(c2)), ess=float(np.median(1 / (1 + c2))),
                           loss=float(np.mean(np.maximum(-dJ, 0))), dJ=float(dJ.mean()),
                           bound=float(np.mean(np.sqrt(eps / 2))), violations=viol, n=len(logs))
                out.append(row)
                print(f'{rule:5s} K={K:2d}  KL(worker||merged) mean {row["eps"]:.4f} median {row["eps_med"]:.4f} '
                      f'(quadratic median {row["quad_med"]:.4f})  '
                      f'chi2 {row["chi2"]:.4f}  ESS {row["ess"]:.3f}  mean return change {row["dJ"]:+.4f}  '
                      f'mean loss {row["loss"]:.4f} <= bound {row["bound"]:.4f}  violations {viol}/{len(logs)}', flush=True)

    json.dump(out, open(f'opm_{mode}.json', 'w'), indent=1, default=float)
