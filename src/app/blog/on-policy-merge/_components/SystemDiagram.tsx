// Figure 3: the OPM system. One unit of ordinary asynchronous RL per domain,
// shared services underneath, a small merge coordinator on top.
// Plain HTML/CSS (see _styles/system.css) so the labels stay readable on phones.

const UNITS = [
  { name: 'Math', cls: 'am-sys-d1', engines: 'few engines' },
  { name: 'Code', cls: 'am-sys-d2', engines: 'more engines' },
  { name: 'Agent', cls: 'am-sys-d3', engines: 'most engines' },
]

export default function SystemDiagram() {
  return (
    <div
      className="am-sys"
      role="img"
      aria-label="One unit per domain, each a trainer with its own rollout engines; shared verifiers, sandboxes and an anchor scorer below; a merge coordinator above that collects drifts and broadcasts the merged model"
    >
      <div className="am-sys-coord">
        <div className="am-sys-title">Merge coordinator</div>
        <div className="am-sys-sub">
          tracks each drift D<sub>i</sub> / δ<sub>i</sub>, triggers a rendezvous,
          solves (2) across trainers, broadcasts θ⁺
        </div>
      </div>
      <div className="am-sys-wire">
        <span>↑ drifts, Fisher products</span>
        <span>↓ merged model θ⁺</span>
      </div>
      <div className="am-sys-units">
        {UNITS.map((u, i) => (
          <div key={u.name} className={`am-sys-unit ${u.cls}`}>
            {i === 2 ? <div className="am-sys-dots" aria-hidden="true">⋯</div> : null}
            <div className="am-sys-unit-name">{u.name}</div>
            <div className="am-sys-box">
              <div className="am-sys-title">Trainer</div>
              <div className="am-sys-sub">own optimizer, learning rate, clip</div>
            </div>
            <div className="am-sys-step">weights ↓ every step · rollouts ↑</div>
            <div className="am-sys-box">
              <div className="am-sys-title">Rollout engines</div>
              <div className="am-sys-sub">serve this trainer’s weights; {u.engines}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="am-sys-wire">
        <span>↕ rewards, sandboxes, drift scores</span>
      </div>
      <div className="am-sys-shared">
        <div className="am-sys-title">Shared services</div>
        <div className="am-sys-sub">
          verifiers · sandboxes and environments · anchor scorer in the
          reference-model slot
        </div>
      </div>
    </div>
  )
}
