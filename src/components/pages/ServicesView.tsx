'use client'

import { useRouter } from 'next/navigation'
import { Icon } from '@/components/primitives/Icon'
import { StackedBar } from '@/components/primitives/Charts'
import { useRepos } from '@/lib/hooks'
import { useTweaks } from '@/lib/tweaks'

export function ServicesView() {
  const router = useRouter()
  const { data, loading, error, refetch } = useRepos()
  const scope = useTweaks((s) => s.scope)
  const activeRepo = useTweaks((s) => s.activeRepo)
  const set = useTweaks((s) => s.set)
  const allRepos = data ?? []
  const repos = scope === 'single' && activeRepo
    ? allRepos.filter((r) => r.id === activeRepo)
    : allRepos

  const drillIn = (id: string) => {
    set('scope', 'single')
    set('activeRepo', id)
    router.push('/graph')
  }

  return (
    <>
      <div className="page-hd">
        <div>
          <h1>Services</h1>
          <div className="sub">
            {loading
              ? 'Loading…'
              : scope === 'single' && activeRepo
                ? `Scoped to ${activeRepo} · click to open its graph`
                : `${repos.length} indexed services · click to drill in`}
          </div>
        </div>
        <div className="actions">
          {scope === 'single' && activeRepo && (
            <button type="button" className="btn ghost" onClick={() => set('scope', 'federated')}>
              Show all
            </button>
          )}
          <button type="button" className="btn" onClick={refetch}>
            <Icon name="history" size={12} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 22, color: 'var(--danger)', fontSize: 13 }}>
          Failed to load services: {error}
        </div>
      )}

      {!error && repos.length === 0 && !loading && (
        <div style={{ padding: 22, color: 'var(--fg-2)', fontSize: 13 }}>
          No repositories indexed yet.
        </div>
      )}

      <div style={{ padding: 18, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
          {repos.map((r) => (
            <div
              key={r.id + ':' + r.owner}
              className="card"
              style={{ padding: 14, cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onClick={() => drillIn(r.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  drillIn(r.id)
                }
              }}
            >
              <div className="hstack" style={{ gap: 8 }}>
                <span style={{ width: 8, height: 28, borderRadius: 3, background: r.color }} />
                <div>
                  <div className="mono" style={{ fontSize: 14, color: 'var(--fg-0)' }}>{r.id}</div>
                  <div className="mono faint" style={{ fontSize: 11 }}>
                    {r.owner ? `${r.owner}/${r.id}` : r.id} · {r.lang || 'mixed'}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 12 }}>{r.nodes.toLocaleString()}</div>
                  <div className="mono faint" style={{ fontSize: 10.5 }}>nodes</div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <StackedBar
                  parts={[
                    { value: r.funcs,      color: 'var(--k-function)' },
                    { value: r.methods,    color: 'var(--k-method)' },
                    { value: r.types,      color: 'var(--k-type)' },
                    { value: r.interfaces, color: 'var(--k-interface)' },
                    { value: r.vars,       color: 'var(--k-variable)' },
                  ]}
                  height={5}
                />
              </div>
              <div className="hstack" style={{ gap: 10, marginTop: 10, fontSize: 11, color: 'var(--fg-2)', flexWrap: 'wrap' }}>
                <span>{r.funcs} fn</span>
                <span>{r.methods} meth</span>
                <span>{r.types} ty</span>
                <span>{r.interfaces} iface</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
