'use client'

import { useMemo, useState } from 'react'

import { CASES, type TrajectoryCase } from './cases'

type FilterKey = 'agent' | 'domain' | 'result'

type FilterOption = {
  value: string
  label: string
}

function replayUrl(item: TrajectoryCase) {
  const params = new URLSearchParams({
    trace: item.trace,
    config: item.config,
    result: item.resultFile,
    embed: '1',
  })

  return `/cli-gui-viewer/viewer.html?${params.toString()}`
}

function resultClass(result: TrajectoryCase['result']) {
  if (result === 'pass') return 'border-emerald-500/30 text-emerald-300'
  if (result === 'fail') return 'border-rose-500/30 text-rose-300'
  return 'border-zinc-600 text-zinc-400'
}

export function TrajectoryBrowser() {
  const [selectedId, setSelectedId] = useState(CASES[0].id)
  const [view, setView] = useState<'list' | 'replay'>('list')
  const [query, setQuery] = useState('')
  const [agentFilter, setAgentFilter] = useState('all')
  const [domainFilter, setDomainFilter] = useState('all')
  const [resultFilter, setResultFilter] = useState('all')
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)
  const selected = useMemo(
    () => CASES.find((item) => item.id === selectedId) ?? CASES[0],
    [selectedId],
  )
  const domains = useMemo(
    () => Array.from(new Set(CASES.map((item) => item.domain))).sort(),
    [],
  )
  const agentOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'all', label: 'All agents' },
      { value: 'Claude Code', label: 'Claude Code' },
      { value: 'Codex', label: 'Codex' },
    ],
    [],
  )
  const domainOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'all', label: 'All domains' },
      ...domains.map((domain) => ({ value: domain, label: domain })),
    ],
    [domains],
  )
  const resultOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'all', label: 'All results' },
      { value: 'pass', label: 'Pass' },
      { value: 'fail', label: 'Fail' },
    ],
    [],
  )
  const filteredCases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return CASES.filter((item) => {
      const haystack = [
        item.agent,
        item.run,
        item.model,
        item.domain,
        item.taskId,
        item.instruction,
        item.result,
      ]
        .join(' ')
        .toLowerCase()

      return (
        (!normalizedQuery || haystack.includes(normalizedQuery)) &&
        (agentFilter === 'all' || item.agent === agentFilter) &&
        (domainFilter === 'all' || item.domain === domainFilter) &&
        (resultFilter === 'all' || item.result === resultFilter)
      )
    })
  }, [agentFilter, domainFilter, query, resultFilter])

  function openCase(item: TrajectoryCase) {
    setSelectedId(item.id)
    setView('replay')
  }

  return (
    <div className="mt-8 overflow-hidden rounded-md border border-zinc-800 bg-[#0c0c0e] shadow-xl">
      <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Browser cases
          </div>
          <div className="font-mono text-[11px] text-zinc-500">
            {CASES.length} local trajectories · searchable index
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <div>
          <div className="grid gap-2 border-b border-zinc-800 bg-[#101114] p-4 lg:grid-cols-[1fr_150px_150px_120px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search instruction, task id, model, run..."
              className="h-10 rounded border border-zinc-700 bg-zinc-950 px-3 font-mono text-[12px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-400"
            />
            <FilterMenu
              id="agent"
              label="Agent"
              options={agentOptions}
              value={agentFilter}
              openFilter={openFilter}
              setOpenFilter={setOpenFilter}
              onChange={setAgentFilter}
            />
            <FilterMenu
              id="domain"
              label="Domain"
              options={domainOptions}
              value={domainFilter}
              openFilter={openFilter}
              setOpenFilter={setOpenFilter}
              onChange={setDomainFilter}
            />
            <FilterMenu
              id="result"
              label="Result"
              options={resultOptions}
              value={resultFilter}
              openFilter={openFilter}
              setOpenFilter={setOpenFilter}
              onChange={setResultFilter}
            />
          </div>

          <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 font-mono text-[11px] text-zinc-500">
            showing {filteredCases.length} / {CASES.length} cases
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {filteredCases.length === 0 ? (
              <div className="px-4 py-12 text-center font-mono text-[12px] text-zinc-500">
                No cases match the current filters.
              </div>
            ) : (
              filteredCases.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openCase(item)}
                  className="grid w-full gap-3 border-b border-zinc-800 px-4 py-4 text-left transition last:border-b-0 hover:bg-zinc-900/70 focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-400/60 lg:grid-cols-[116px_130px_1fr_72px]"
                >
                  <div className="font-mono text-[11px] text-amber-300">
                    {item.agent}
                  </div>
                  <div className="font-mono text-[11px] text-zinc-400">
                    <div className="text-zinc-200">{item.domain}</div>
                    <div className="mt-1 truncate">{item.model}</div>
                  </div>
                  <div>
                    <div className="text-[14px] leading-6 text-zinc-100">
                      {item.instruction}
                    </div>
                    <div className="mt-2 break-all font-mono text-[11px] text-zinc-600">
                      {item.taskId}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3 lg:block">
                    <span
                      className={[
                        'inline-flex rounded-sm border px-1.5 py-0.5 font-mono text-[11px]',
                        resultClass(item.result),
                      ].join(' ')}
                    >
                      {item.result}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500 lg:mt-3 lg:block">
                      open
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="border-b border-zinc-800 bg-[#101114] px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="grid gap-2 font-mono text-[11px] text-zinc-500 sm:grid-cols-[auto_1fr] sm:gap-x-4">
                <span className="text-zinc-300">selected</span>
                <span className="break-all">{selected.taskId}</span>
                <span className="text-zinc-300">run</span>
                <span className="break-all">{selected.run}</span>
              </div>
              <button
                type="button"
                onClick={() => setView('list')}
                className="h-9 shrink-0 rounded border border-zinc-700 px-3 font-mono text-[11px] text-zinc-300 transition hover:border-amber-400 hover:text-amber-300"
              >
                All cases
              </button>
            </div>
            <div className="mt-3 text-[14px] leading-6 text-zinc-200">
              {selected.instruction}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-zinc-500">
              <span>{selected.agent}</span>
              <span>{selected.domain}</span>
              <span>{selected.model}</span>
              {selected.elapsed ? <span>{selected.elapsed}</span> : null}
              <span
                className={
                  selected.result === 'pass'
                    ? 'text-emerald-300'
                    : selected.result === 'fail'
                      ? 'text-rose-300'
                      : 'text-zinc-400'
                }
              >
                {selected.result}
              </span>
            </div>
          </div>

          <iframe
            key={selected.id}
            title={`${selected.agent} trajectory replay`}
            src={replayUrl(selected)}
            className="h-[640px] w-full border-0 bg-[#0c0c0e] md:h-[700px]"
          />
        </div>
      )}
    </div>
  )
}

function FilterMenu({
  id,
  label,
  options,
  value,
  openFilter,
  setOpenFilter,
  onChange,
}: {
  id: FilterKey
  label: string
  options: FilterOption[]
  value: string
  openFilter: FilterKey | null
  setOpenFilter: (value: FilterKey | null) => void
  onChange: (value: string) => void
}) {
  const isOpen = openFilter === id
  const selected = options.find((option) => option.value === value) ?? options[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenFilter(isOpen ? null : id)}
        className={[
          'flex h-10 w-full items-center justify-between gap-2 rounded border px-3 text-left font-mono text-[12px] outline-none transition',
          isOpen
            ? 'border-amber-400 bg-zinc-900 text-zinc-50'
            : 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:border-zinc-500',
        ].join(' ')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="min-w-0">
          <span className="block text-[9px] uppercase tracking-[0.14em] text-zinc-500">
            {label}
          </span>
          <span className="block truncate leading-4">{selected.label}</span>
        </span>
        <span
          className={[
            'text-zinc-500 transition',
            isOpen ? 'rotate-180 text-amber-300' : '',
          ].join(' ')}
        >
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-11 z-20 overflow-hidden rounded border border-zinc-700 bg-zinc-950 py-1 shadow-2xl shadow-black/50"
        >
          {options.map((option) => {
            const active = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value)
                  setOpenFilter(null)
                }}
                className={[
                  'flex w-full items-center justify-between px-3 py-2 text-left font-mono text-[12px] transition',
                  active
                    ? 'bg-amber-400/10 text-amber-300'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-50',
                ].join(' ')}
              >
                <span className="truncate">{option.label}</span>
                {active ? <span className="text-[10px]">selected</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
