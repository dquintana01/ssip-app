import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

// ── Paleta ────────────────────────────────────────────────────
const C = {
  azul: '#0D2137', azulMed: '#1B3A5C', naranja: '#E8631A',
  gris: '#F4F6F8', grisMed: '#E2E8EE', grisDark: '#8A9AB0',
  blanco: '#FFFFFF', texto: '#1A2B3C',
  rojo: '#C00000', rojoClar: '#FDECEA',
  amarillo: '#B8860B', amarilloClar: '#FFF8E6',
  verde: '#2E7D32', verdeClar: '#EBF5EB',
}

const s = {
  input: { width: '100%', padding: '9px 11px', borderRadius: 8, fontSize: 13,
    border: '1.5px solid #E2E8EE', background: C.blanco, color: C.texto, outline: 'none',
    fontFamily: "'DM Sans', sans-serif" },
  label: { fontSize: 11, fontWeight: 700, color: C.grisDark, letterSpacing: .6,
    textTransform: 'uppercase', marginBottom: 5, display: 'block' },
  card: { background: C.blanco, borderRadius: 12, border: `1px solid ${C.grisMed}`,
    padding: 20, marginBottom: 12 },
  btn: { background: C.naranja, color: C.blanco, border: 'none', borderRadius: 8,
    padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    width: '100%', marginTop: 16, fontFamily: "'DM Sans', sans-serif" },
}

// ── Helpers visuales ──────────────────────────────────────────
const Badge = ({ tipo }) => (
  <span style={{ background: tipo === 'roja' ? C.rojoClar : C.amarilloClar,
    color: tipo === 'roja' ? C.rojo : C.amarillo,
    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
    {tipo === 'roja' ? '🔴 Roja' : '🟡 Amarilla'}
  </span>
)

const FormBadge = ({ form }) => (
  <span style={{ background: C.azulMed, color: C.blanco, fontSize: 10,
    fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: .5 }}>
    {form}
  </span>
)

const Tag = ({ label, bg = C.grisMed, color = C.grisDark }) => (
  <span style={{ background: bg, color, fontSize: 10, padding: '2px 6px',
    borderRadius: 4, fontWeight: 600 }}>{label}</span>
)

const Toast = ({ msg, ok }) => (
  <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999,
    background: ok ? C.verde : C.rojo, color: C.blanco,
    padding: '11px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
    boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
    {ok ? '✓' : '✕'}  {msg}
  </div>
)

// ── Formularios config ────────────────────────────────────────
const FOS = [
  { id: 'FO-01', name: 'Control Diario de Asistencia', freq: 'Diario' },
  { id: 'FO-02', name: 'Parte Diario de Obra', freq: 'Diario' },
  { id: 'FO-03', name: 'Planificación Semanal', freq: 'Semanal' },
  { id: 'FO-04', name: 'Informe Semanal', freq: 'Semanal' },
  { id: 'FO-05', name: 'Lista de Materiales', freq: 'Miércoles' },
  { id: 'FO-06', name: 'Documentos de Ingeniería', freq: 'Miércoles' },
  { id: 'FO-07', name: 'Status Cronograma', freq: 'Martes/Miér.' },
  { id: 'FO-08', name: 'Minuta de Reunión', freq: 'Jueves' },
  { id: 'FO-09', name: 'Look Ahead', freq: 'Jueves' },
  { id: 'FO-10', name: 'Issues de Obra', freq: 'Permanente' },
  { id: 'RES-01', name: 'Resumen de Alertas', freq: 'Solo lectura' },
]

const SEMANAS = [
  { id: 'S12', label: 'Semana 12 — 10/03 al 14/03' },
  { id: 'S11', label: 'Semana 11 — 03/03 al 07/03' },
  { id: 'S10', label: 'Semana 10 — 24/02 al 28/02' },
]

// ══════════════════════════════════════════════════════════════
export default function App() {
  const [vista, setVista] = useState('res01')
  const [foActivo, setFoActivo] = useState('FO-10')
  const [semana, setSemana] = useState('S12')
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [filtroForm, setFiltroForm] = useState('todas')
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Cargar issues desde Supabase ──────────────────────────
  const loadIssues = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { showToast('Error al cargar datos', false); setLoading(false); return }
    setIssues(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadIssues() }, [loadIssues])

  // ── Alertas derivadas de issues ───────────────────────────
  const alertasDeIssues = issues
    .filter(i => i.estado !== 'cerrado' && i.semana === semana)
    .filter(i => i.criticidad === 'alta' || i.criticidad === 'media')
    .map(i => ({
      id: i.id, form: 'FO-10',
      tipo: i.criticidad === 'alta' ? 'roja' : 'amarilla',
      disc: i.disciplina, sistema: i.sistema,
      desc: i.descripcion, resp: i.responsable || '—',
      fecha: i.fecha_compromiso || i.created_at?.slice(0, 10),
    }))

  // Alertas demo estáticas (FO-05, FO-06, FO-07)
  const alertasEstaticas = semana === 'S12' ? [
    { id: 's1', form: 'FO-07', tipo: 'roja', disc: 'Piping', sistema: 'Compr-01', desc: 'Bajada tubería DN500 — 65% vs 100% plan', resp: 'Sup. Méndez', fecha: '2026-03-10' },
    { id: 's2', form: 'FO-07', tipo: 'roja', disc: 'Eléctrico', sistema: 'Compr-01', desc: 'Tablero MCC — no iniciado, vencido', resp: 'Sup. López', fecha: '2026-03-08' },
    { id: 's3', form: 'FO-05', tipo: 'roja', disc: 'Piping', sistema: 'Compr-01', desc: 'Válvula de alivio 4" — ROJO sin arribo', resp: 'Ing. Compras', fecha: '2026-03-05' },
    { id: 's4', form: 'FO-06', tipo: 'roja', disc: 'Instrumentos', sistema: 'Control', desc: 'Lazo de control — no emitido, vencido 25/02', resp: 'Ing. Vargas', fecha: '2026-02-25' },
    { id: 's5', form: 'FO-07', tipo: 'amarilla', disc: 'Civil', sistema: 'Compr-01', desc: 'Cruces Ruta 22 — 70% vs 100% plan', resp: 'Sup. Vega', fecha: '2026-03-02' },
    { id: 's6', form: 'FO-05', tipo: 'amarilla', disc: 'Eléctrico', sistema: 'Tablero', desc: 'Variador frecuencia 200A — AMARILLO', resp: 'ABB Argentina', fecha: '2026-03-10' },
  ] : semana === 'S11' ? [
    { id: 's7', form: 'FO-07', tipo: 'roja', disc: 'Piping', sistema: 'Compr-01', desc: 'Bajada tubería — inicio demorado 3 días', resp: 'Sup. Méndez', fecha: '2026-03-03' },
    { id: 's8', form: 'FO-05', tipo: 'amarilla', disc: 'Piping', sistema: 'Compr-02', desc: 'Codo 6" SCH40 — AMARILLO', resp: 'Tuboflex SA', fecha: '2026-03-05' },
  ] : [
    { id: 's9', form: 'FO-06', tipo: 'roja', disc: 'Eléctrico', sistema: 'Tablero', desc: 'Diagrama unifilar — vencido sin emisión', resp: 'Ing. Ríos', fecha: '2026-02-28' },
  ]

  const todasAlertas = [...alertasEstaticas, ...alertasDeIssues]
  const alertasFiltradas = todasAlertas.filter(a => {
    if (filtroTipo !== 'todas' && a.tipo !== filtroTipo) return false
    if (filtroForm !== 'todas' && a.form !== filtroForm) return false
    return true
  })

  const rojas = todasAlertas.filter(a => a.tipo === 'roja')
  const amarillas = todasAlertas.filter(a => a.tipo === 'amarilla')

  // ── Cerrar issue ──────────────────────────────────────────
  const cerrarIssue = async (id) => {
    const { error } = await supabase.from('issues').update({ estado: 'cerrado' }).eq('id', id)
    if (error) { showToast('Error al cerrar issue', false); return }
    showToast(`Issue cerrado — alerta eliminada del RES-01`)
    loadIssues()
  }

  // ── Layout ────────────────────────────────────────────────
  const navItems = [
    { id: 'res01', label: '📊  RES-01' },
    { id: 'formularios', label: '📝  Formularios' },
    { id: 'historial', label: '📅  Historial' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {toast && <Toast {...toast} />}

      {/* Header */}
      <div style={{ background: C.azul, padding: '0 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', height: 56,
        borderBottom: `3px solid ${C.naranja}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: C.naranja, borderRadius: 8, width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 15, color: C.blanco }}>S</div>
          <div>
            <div style={{ color: C.blanco, fontWeight: 700, fontSize: 15, letterSpacing: .3 }}>SSIP</div>
            <div style={{ color: C.grisDark, fontSize: 10, letterSpacing: .3 }}>Sistema de Seguimiento Integral de Proyectos</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: C.verdeClar, color: C.verde, fontSize: 10,
            fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>● EN VIVO</div>
          <div style={{ color: C.grisDark, fontSize: 11 }}>Planta Compresión Norte</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: C.azulMed, display: 'flex', gap: 4,
        padding: '0 20px', height: 44, alignItems: 'center', flexShrink: 0 }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setVista(n.id)} style={{
            background: vista === n.id ? C.naranja : 'transparent',
            color: vista === n.id ? C.blanco : C.grisDark,
            border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700, fontSize: 12, padding: '8px 16px', borderRadius: 6,
            transition: 'all .15s', letterSpacing: .3,
          }}>{n.label}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: 20, maxWidth: 1100, margin: '0 auto', width: '100%' }}>

        {/* ══ RES-01 ══ */}
        {vista === 'res01' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Resumen de Alertas</h2>
            <p style={{ color: C.grisDark, fontSize: 13, marginBottom: 16 }}>RES-01 · datos en tiempo real desde Supabase</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <select value={semana} onChange={e => setSemana(e.target.value)}
                style={{ ...s.input, width: 'auto', flex: 1, maxWidth: 280 }}>
                {SEMANAS.map(sm => <option key={sm.id} value={sm.id}>{sm.label}</option>)}
              </select>
              {loading && <span style={{ fontSize: 12, color: C.grisDark }}>Cargando...</span>}
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Alertas Rojas', val: rojas.length, color: C.rojo, bg: C.rojoClar },
                { label: 'Alertas Amarillas', val: amarillas.length, color: C.amarillo, bg: C.amarilloClar },
                { label: 'Total Alertas', val: todasAlertas.length, color: C.azul, bg: C.grisMed },
              ].map((k, i) => (
                <div key={i} style={{ background: k.bg, borderRadius: 12, padding: '16px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: k.color,
                      letterSpacing: .6, textTransform: 'uppercase', opacity: .8 }}>{k.label}</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {['todas', 'roja', 'amarilla'].map(f => (
                <button key={f} onClick={() => setFiltroTipo(f)} style={{
                  background: filtroTipo === f ? C.azul : C.blanco,
                  color: filtroTipo === f ? C.blanco : C.grisDark,
                  border: `1.5px solid ${filtroTipo === f ? C.azul : C.grisMed}`,
                  borderRadius: 20, padding: '5px 14px', fontSize: 11,
                  fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}>
                  {f === 'todas' ? 'Todas' : f === 'roja' ? '🔴 Rojas' : '🟡 Amarillas'}
                </button>
              ))}
              <span style={{ color: C.grisMed, margin: '0 4px' }}>|</span>
              {['todas', 'FO-05', 'FO-06', 'FO-07', 'FO-10'].map(f => (
                <button key={f} onClick={() => setFiltroForm(f)} style={{
                  background: filtroForm === f ? C.azulMed : C.blanco,
                  color: filtroForm === f ? C.blanco : C.grisDark,
                  border: `1.5px solid ${filtroForm === f ? C.azulMed : C.grisMed}`,
                  borderRadius: 20, padding: '5px 12px', fontSize: 11,
                  fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}>
                  {f === 'todas' ? 'Todos' : f}
                </button>
              ))}
            </div>

            {/* Tabla */}
            <div style={{ background: C.blanco, borderRadius: 12, overflow: 'hidden',
              border: `1px solid ${C.grisMed}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 70px 110px 110px 1fr 120px 95px',
                background: C.azul, padding: '9px 14px', gap: 8 }}>
                {['Alerta', 'Form.', 'Disciplina', 'Sistema', 'Descripción', 'Responsable', 'Fecha'].map(h => (
                  <div key={h} style={{ color: C.grisDark, fontSize: 10, fontWeight: 700,
                    letterSpacing: .6, textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>
              {alertasFiltradas.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center',
                  color: C.grisDark, fontSize: 14 }}>✅ Sin alertas para los filtros seleccionados</div>
              ) : alertasFiltradas.map((a, i) => (
                <div key={a.id} style={{ display: 'grid',
                  gridTemplateColumns: '90px 70px 110px 110px 1fr 120px 95px',
                  padding: '11px 14px', gap: 8, alignItems: 'center',
                  background: i % 2 === 0 ? C.blanco : C.gris,
                  borderBottom: `1px solid ${C.grisMed}` }}>
                  <Badge tipo={a.tipo} />
                  <FormBadge form={a.form} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{a.disc}</span>
                  <Tag label={a.sistema} />
                  <span style={{ fontSize: 12 }}>{a.desc}</span>
                  <span style={{ fontSize: 11, color: C.grisDark }}>{a.resp}</span>
                  <span style={{ fontSize: 11, color: C.grisDark,
                    fontFamily: "'DM Mono', monospace" }}>{a.fecha}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ FORMULARIOS ══ */}
        {vista === 'formularios' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Formularios SSIP</h2>
            <p style={{ color: C.grisDark, fontSize: 13, marginBottom: 16 }}>Seleccioná un formulario para cargar datos</p>

            {/* Nav formularios */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 8, marginBottom: 20 }}>
              {FOS.map(f => (
                <button key={f.id} onClick={() => setFoActivo(f.id)} style={{
                  background: foActivo === f.id ? C.blanco : C.blanco,
                  border: foActivo === f.id ? `2px solid ${C.naranja}` : `1px solid ${C.grisMed}`,
                  borderRadius: 10, padding: '12px 10px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all .15s',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.naranja, letterSpacing: .5 }}>{f.id}</div>
                  <div style={{ fontSize: 11, color: C.grisDark, marginTop: 2 }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: C.grisDark, opacity: .7, marginTop: 3 }}>{f.freq}</div>
                </button>
              ))}
            </div>

            {/* Contenido del formulario activo */}
            {foActivo === 'FO-10' && <FO10Form semana={semana} onSubmit={loadIssues} onCerrar={cerrarIssue} issues={issues} showToast={showToast} />}
            {foActivo === 'FO-07' && <FO07Form showToast={showToast} />}
            {foActivo === 'FO-05' && <FO05Form showToast={showToast} />}
            {foActivo === 'FO-06' && <FO06Form showToast={showToast} />}
            {foActivo === 'FO-01' && <FO01Form showToast={showToast} />}
            {foActivo === 'FO-02' && <FO02Form showToast={showToast} />}
            {foActivo === 'FO-03' && <FO03Form showToast={showToast} />}
            {foActivo === 'FO-04' && <FO04Form showToast={showToast} />}
            {foActivo === 'FO-08' && <FO08Form showToast={showToast} />}
            {foActivo === 'FO-09' && <FO09Form showToast={showToast} />}
            {foActivo === 'RES-01' && (
              <div style={s.card}>
                <p style={{ fontSize: 13, color: C.grisDark, marginBottom: 12 }}>
                  El RES-01 es de solo lectura. Se genera automáticamente desde FO-05, FO-06, FO-07 y FO-10.
                </p>
                <button style={{ ...s.btn, width: 'auto', padding: '10px 20px' }}
                  onClick={() => setVista('res01')}>Ver tablero RES-01</button>
              </div>
            )}
          </div>
        )}

        {/* ══ HISTORIAL ══ */}
        {vista === 'historial' && (
          <Historial issues={issues} />
        )}

      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// FO-10 — Issues (con Supabase)
// ══════════════════════════════════════════════════════════════
function FO10Form({ semana, onSubmit, onCerrar, issues, showToast }) {
  const [form, setForm] = useState({
    disciplina: '', sistema: '', subsistema: '', ubicacion: '',
    descripcion: '', origen: 'construcción', criticidad: 'alta',
    accion: '', fecha_compromiso: '', responsable: '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.disciplina || !form.sistema || !form.descripcion) {
      showToast('Completá Disciplina, Sistema y Descripción', false); return
    }
    setSaving(true)
    const { error } = await supabase.from('issues').insert([{
      ...form, semana, estado: 'abierto',
    }])
    setSaving(false)
    if (error) { showToast('Error al guardar: ' + error.message, false); return }
    showToast('Issue registrado — RES-01 actualizado')
    setForm({ disciplina: '', sistema: '', subsistema: '', ubicacion: '',
      descripcion: '', origen: 'construcción', criticidad: 'alta',
      accion: '', fecha_compromiso: '', responsable: '' })
    onSubmit()
  }

  const abiertos = issues.filter(i => i.estado === 'abierto')

  return (
    <div>
      <div style={s.card}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.grisDark, marginBottom: 14,
          paddingBottom: 10, borderBottom: `1px solid ${C.grisMed}` }}>
          FO-10 — Registrar nuevo issue
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={s.label}>Disciplina *</label>
            <select value={form.disciplina} onChange={e => set('disciplina', e.target.value)} style={s.input}>
              <option value="">Seleccionar...</option>
              {['Piping', 'Eléctrico', 'Instrumentos', 'Civil', 'QA/QC', 'Integridad', 'Ingeniería'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Sistema *</label>
            <input value={form.sistema} onChange={e => set('sistema', e.target.value)}
              placeholder="Ej: Compr-01, Edificio..." style={s.input} />
          </div>
          <div>
            <label style={s.label}>Subsistema</label>
            <input value={form.subsistema} onChange={e => set('subsistema', e.target.value)}
              placeholder="Ej: Descarga, MCC..." style={s.input} />
          </div>
          <div>
            <label style={s.label}>Ubicación / Frente</label>
            <input value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)}
              placeholder="Ej: Frente Norte..." style={s.input} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={s.label}>Descripción *</label>
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            rows={3} placeholder="Describí el problema de forma clara y concreta..."
            style={{ ...s.input, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <div>
            <label style={s.label}>Responsable</label>
            <input value={form.responsable} onChange={e => set('responsable', e.target.value)}
              placeholder="Nombre y rol" style={s.input} />
          </div>
          <div>
            <label style={s.label}>Fecha compromiso</label>
            <input type="date" value={form.fecha_compromiso}
              onChange={e => set('fecha_compromiso', e.target.value)} style={s.input} />
          </div>
          <div>
            <label style={s.label}>Origen</label>
            <select value={form.origen} onChange={e => set('origen', e.target.value)} style={s.input}>
              {['construcción', 'procura', 'ingeniería', 'comisionado', 'logística', 'calidad'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Acción requerida</label>
            <input value={form.accion} onChange={e => set('accion', e.target.value)}
              placeholder="Acción concreta..." style={s.input} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={s.label}>Criticidad</label>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {[['alta', C.rojo, C.rojoClar], ['media', C.amarillo, C.amarilloClar], ['baja', C.verde, C.verdeClar]].map(([c, col, bg]) => (
              <button key={c} onClick={() => set('criticidad', c)} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                fontWeight: 700, fontSize: 13, border: 'none',
                fontFamily: "'DM Sans', sans-serif",
                background: form.criticidad === c ? col : C.grisMed,
                color: form.criticidad === c ? C.blanco : C.grisDark,
              }}>{c[0].toUpperCase() + c.slice(1)}</button>
            ))}
          </div>
        </div>
        {form.criticidad !== 'baja' && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: form.criticidad === 'alta' ? C.rojoClar : C.amarilloClar,
            color: form.criticidad === 'alta' ? C.rojo : C.amarillo }}>
            {form.criticidad === 'alta' ? '🔴 Issue Alta: aparecerá como alerta ROJA en el RES-01.' : '🟡 Issue Media: aparecerá como alerta AMARILLA en el RES-01.'}
          </div>
        )}
        <button style={s.btn} onClick={handleSubmit} disabled={saving}>
          {saving ? 'Guardando...' : 'Registrar Issue → RES-01'}
        </button>
      </div>

      {abiertos.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Issues abiertos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {abiertos.map(issue => (
              <div key={issue.id} style={{ background: C.blanco, borderRadius: 10,
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
                border: `1px solid ${C.grisMed}`,
                borderLeft: `4px solid ${issue.criticidad === 'alta' ? C.rojo : issue.criticidad === 'media' ? C.amarillo : C.verde}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                    <Tag label={issue.disciplina} />
                    <Tag label={issue.criticidad[0].toUpperCase() + issue.criticidad.slice(1)}
                      bg={issue.criticidad === 'alta' ? C.rojoClar : issue.criticidad === 'media' ? C.amarilloClar : C.verdeClar}
                      color={issue.criticidad === 'alta' ? C.rojo : issue.criticidad === 'media' ? C.amarillo : C.verde} />
                  </div>
                  <div style={{ fontSize: 13 }}>{issue.descripcion}</div>
                  <div style={{ fontSize: 11, color: C.grisDark, marginTop: 2 }}>
                    Compromiso: {issue.fecha_compromiso || '—'} · {issue.responsable || 'sin responsable'}
                  </div>
                </div>
                <button onClick={() => onCerrar(issue.id)} style={{
                  background: C.verdeClar, color: C.verde, border: 'none', borderRadius: 8,
                  padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
                }}>✓ Cerrar</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// Formularios estáticos (guardan en Supabase tabla genérica)
// ══════════════════════════════════════════════════════════════
function FormWrapper({ titulo, tabla, campos, showToast }) {
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    setSaving(true)
    const { error } = await supabase.from(tabla).insert([{ ...form }])
    setSaving(false)
    if (error) { showToast('Error al guardar: ' + error.message, false); return }
    showToast(`${titulo} guardado correctamente`)
    setForm({})
  }

  return (
    <div style={s.card}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.grisDark, marginBottom: 14,
        paddingBottom: 10, borderBottom: `1px solid ${C.grisMed}` }}>{titulo}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {campos.map(c => (
          <div key={c.key} style={c.full ? { gridColumn: '1 / -1' } : {}}>
            <label style={s.label}>{c.label}{c.req ? ' *' : ''}</label>
            {c.type === 'select' ? (
              <select value={form[c.key] || ''} onChange={e => set(c.key, e.target.value)} style={s.input}>
                <option value="">Seleccionar...</option>
                {c.options.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : c.type === 'textarea' ? (
              <textarea value={form[c.key] || ''} onChange={e => set(c.key, e.target.value)}
                rows={3} placeholder={c.placeholder || ''} style={{ ...s.input, resize: 'vertical' }} />
            ) : (
              <input type={c.type || 'text'} value={form[c.key] || ''}
                onChange={e => set(c.key, e.target.value)}
                placeholder={c.placeholder || ''} style={s.input} />
            )}
          </div>
        ))}
      </div>
      <button style={s.btn} onClick={handleSubmit} disabled={saving}>
        {saving ? 'Guardando...' : `Guardar ${titulo}`}
      </button>
    </div>
  )
}

const DISCS = ['Piping', 'Eléctrico', 'Civil', 'Instrumentos', 'QA/QC']

const FO07Form = ({ showToast }) => <FormWrapper titulo="FO-07 — Status Cronograma" tabla="fo07_cronograma" showToast={showToast} campos={[
  { key: 'codigo', label: 'Código actividad', placeholder: 'ACT-001' },
  { key: 'disciplina', label: 'Disciplina', type: 'select', options: DISCS },
  { key: 'descripcion', label: 'Descripción', placeholder: 'Nombre de la actividad', full: true },
  { key: 'sistema', label: 'Sistema', placeholder: 'Ej: Compr-01' },
  { key: 'avance_plan', label: 'Avance plan (%)', type: 'number', placeholder: '100' },
  { key: 'avance_real', label: 'Avance real (%)', type: 'number', placeholder: '0' },
  { key: 'fecha_fin_plan', label: 'Fecha fin plan', type: 'date' },
  { key: 'fecha_fin_forecast', label: 'Fecha fin forecast', type: 'date' },
  { key: 'alerta', label: 'Alerta', type: 'select', options: ['sin alerta', 'amarilla', 'roja'] },
]} />

const FO05Form = ({ showToast }) => <FormWrapper titulo="FO-05 — Lista de Materiales" tabla="fo05_materiales" showToast={showToast} campos={[
  { key: 'codigo', label: 'Código material', placeholder: 'MAT-001' },
  { key: 'descripcion', label: 'Descripción', placeholder: 'Nombre del material', full: true },
  { key: 'cantidad', label: 'Cantidad', type: 'number', placeholder: '0' },
  { key: 'unidad', label: 'Unidad', type: 'select', options: ['und', 'm', 'kg', 'ton', 'gl'] },
  { key: 'proveedor', label: 'Proveedor', placeholder: 'Razón social' },
  { key: 'sistema', label: 'Sistema destino', placeholder: 'Ej: Compr-01' },
  { key: 'fecha_estimada', label: 'Fecha estimada arribo', type: 'date' },
  { key: 'fecha_real', label: 'Fecha real arribo', type: 'date' },
  { key: 'estado', label: 'Estado', type: 'select', options: ['VERDE', 'AMARILLO', 'ROJO'] },
]} />

const FO06Form = ({ showToast }) => <FormWrapper titulo="FO-06 — Documentos de Ingeniería" tabla="fo06_documentos" showToast={showToast} campos={[
  { key: 'codigo', label: 'Código documento', placeholder: 'IN-001' },
  { key: 'descripcion', label: 'Descripción', placeholder: 'Nombre del documento', full: true },
  { key: 'disciplina', label: 'Disciplina', type: 'select', options: [...DISCS, 'Procesos'] },
  { key: 'revision', label: 'Revisión', placeholder: 'Rev. 0, Rev. A...' },
  { key: 'fecha_plan', label: 'Fecha plan emisión', type: 'date' },
  { key: 'fecha_real', label: 'Fecha real emisión', type: 'date' },
  { key: 'critico', label: 'Crítico para construcción', type: 'select', options: ['Sí', 'No'] },
]} />

const FO01Form = ({ showToast }) => <FormWrapper titulo="FO-01 — Control Diario de Asistencia" tabla="fo01_asistencia" showToast={showToast} campos={[
  { key: 'fecha', label: 'Fecha', type: 'date' },
  { key: 'empresa', label: 'Empresa', placeholder: 'Razón social contratista' },
  { key: 'nombre', label: 'Apellido y nombre', placeholder: 'Apellido, Nombre', full: true },
  { key: 'legajo', label: 'Legajo / DNI', placeholder: '12345' },
  { key: 'rol', label: 'Rol', type: 'select', options: ['Operario', 'Oficial', 'Supervisor', 'Ingeniero', 'Administrativo'] },
  { key: 'presencia', label: 'Presencia', type: 'select', options: ['P — Presente', 'A — Ausente', 'M — Médico'] },
]} />

const FO02Form = ({ showToast }) => <FormWrapper titulo="FO-02 — Parte Diario de Obra" tabla="fo02_parte_diario" showToast={showToast} campos={[
  { key: 'fecha', label: 'Fecha', type: 'date' },
  { key: 'frente', label: 'Frente / Área', placeholder: 'Ej: Frente Norte' },
  { key: 'disciplina', label: 'Disciplina', type: 'select', options: DISCS },
  { key: 'personal', label: 'Cantidad de personal', type: 'number', placeholder: '0' },
  { key: 'actividades', label: 'Actividades ejecutadas', type: 'textarea', full: true, placeholder: 'Describí las actividades realizadas...' },
  { key: 'avance', label: 'Avance físico estimado (%)', type: 'number', placeholder: '0' },
  { key: 'equipos', label: 'Equipos activos', placeholder: 'Ej: Grúa 50T, Compactadora...' },
]} />

const FO03Form = ({ showToast }) => <FormWrapper titulo="FO-03 — Planificación Semanal" tabla="fo03_planificacion" showToast={showToast} campos={[
  { key: 'semana_num', label: 'Semana N°', type: 'number', placeholder: '12' },
  { key: 'fecha_inicio', label: 'Fecha inicio semana', type: 'date' },
  { key: 'tarea', label: 'Descripción de la tarea', full: true, placeholder: 'Tarea planificada' },
  { key: 'responsable', label: 'Responsable', placeholder: 'Nombre' },
  { key: 'fase', label: 'Fase MSIP', type: 'select', options: ['CO — Construcción', 'PL — Planeamiento', 'SE — Seguimiento', 'PC — Precomisionado', 'CM — Comisionado'] },
  { key: 'dia', label: 'Día', type: 'select', options: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] },
]} />

const FO04Form = ({ showToast }) => <FormWrapper titulo="FO-04 — Informe Semanal de Proyecto" tabla="fo04_informe" showToast={showToast} campos={[
  { key: 'semana_num', label: 'Semana N°', type: 'number', placeholder: '12' },
  { key: 'fecha_emision', label: 'Fecha de emisión', type: 'date' },
  { key: 'avance_plan', label: 'Avance plan acumulado (%)', type: 'number', placeholder: '0' },
  { key: 'avance_real', label: 'Avance real acumulado (%)', type: 'number', placeholder: '0' },
  { key: 'resumen', label: 'Resumen ejecutivo', type: 'textarea', full: true, placeholder: 'Estado general del proyecto, logros y desvíos...' },
  { key: 'desvios', label: 'Desvíos y acciones correctivas', type: 'textarea', full: true, placeholder: 'Listá los desvíos y acciones propuestas...' },
]} />

const FO08Form = ({ showToast }) => <FormWrapper titulo="FO-08 — Minuta de Reunión" tabla="fo08_minuta" showToast={showToast} campos={[
  { key: 'fecha', label: 'Fecha reunión', type: 'date' },
  { key: 'lugar', label: 'Lugar', placeholder: 'Ej: Sala de reuniones, Comedor obra' },
  { key: 'participantes', label: 'Participantes', type: 'textarea', full: true, placeholder: 'Nombre y rol de cada participante...' },
  { key: 'decision', label: 'Decisión / Acción acordada', type: 'textarea', full: true, placeholder: 'Descripción de la decisión...' },
  { key: 'responsable', label: 'Responsable', placeholder: 'Nombre' },
  { key: 'fecha_compromiso', label: 'Fecha compromiso', type: 'date' },
]} />

const FO09Form = ({ showToast }) => <FormWrapper titulo="FO-09 — Look Ahead" tabla="fo09_lookahead" showToast={showToast} campos={[
  { key: 'semana_ref', label: 'Semana de referencia', type: 'number', placeholder: '12' },
  { key: 'horizonte', label: 'Horizonte (semanas)', type: 'select', options: ['2', '3', '4', '6'] },
  { key: 'actividad', label: 'Actividad planificada', full: true, placeholder: 'Descripción de la actividad' },
  { key: 'semana_ejec', label: 'Semana de ejecución (N°)', type: 'number', placeholder: '13' },
  { key: 'responsable', label: 'Responsable disciplina', placeholder: 'Nombre' },
  { key: 'restriccion', label: 'Restricción a levantar', placeholder: 'Ej: Ingeniería pendiente' },
  { key: 'estado_rest', label: 'Estado de la restricción', type: 'select', options: ['Pendiente', 'En gestión', 'Levantada'] },
]} />

// ══════════════════════════════════════════════════════════════
// Historial
// ══════════════════════════════════════════════════════════════
function Historial({ issues }) {
  const sems = [
    { id: 'S12', label: 'Semana 12 — 10/03 al 14/03', cur: true },
    { id: 'S11', label: 'Semana 11 — 03/03 al 07/03', cur: false },
    { id: 'S10', label: 'Semana 10 — 24/02 al 28/02', cur: false },
  ]

  const issuesPorSemana = (semId) =>
    issues.filter(i => i.semana === semId && i.estado !== 'cerrado' && (i.criticidad === 'alta' || i.criticidad === 'media'))
      .map(i => ({
        tipo: i.criticidad === 'alta' ? 'roja' : 'amarilla',
        form: 'FO-10', desc: i.descripcion, disc: i.disciplina,
      }))

  const alertasEstaticas = {
    S12: [
      { tipo: 'roja', form: 'FO-07', desc: 'Bajada tubería DN500', disc: 'Piping' },
      { tipo: 'roja', form: 'FO-05', desc: 'Válvula de alivio — ROJO', disc: 'Piping' },
      { tipo: 'amarilla', form: 'FO-07', desc: 'Cruces Ruta 22 — 70%', disc: 'Civil' },
    ],
    S11: [
      { tipo: 'roja', form: 'FO-07', desc: 'Bajada tubería — demorada', disc: 'Piping' },
      { tipo: 'amarilla', form: 'FO-05', desc: 'Codo 6" SCH40 — AMARILLO', disc: 'Piping' },
    ],
    S10: [
      { tipo: 'roja', form: 'FO-06', desc: 'Diagrama unifilar — vencido', disc: 'Eléctrico' },
    ],
  }

  const maxVal = 8

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Historial por semana</h2>
      <p style={{ color: C.grisDark, fontSize: 13, marginBottom: 16 }}>Evolución de alertas en el proyecto</p>

      {/* Gráfico */}
      <div style={{ background: C.blanco, borderRadius: 12, padding: 20,
        border: `1px solid ${C.grisMed}`, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Evolución de alertas</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', height: 110 }}>
          {sems.map(sm => {
            const als = [...(alertasEstaticas[sm.id] || []), ...issuesPorSemana(sm.id)]
            const r = als.filter(a => a.tipo === 'roja').length
            const am = als.filter(a => a.tipo === 'amarilla').length
            const rh = Math.max(r > 0 ? 6 : 0, Math.round((r / maxVal) * 80))
            const amh = Math.max(am > 0 ? 6 : 0, Math.round((am / maxVal) * 80))
            return (
              <div key={sm.id} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
                  <div style={{ width: 22, background: C.rojo, borderRadius: '3px 3px 0 0', height: rh }} />
                  <div style={{ width: 22, background: C.amarillo, borderRadius: '3px 3px 0 0', height: amh }} />
                </div>
                <div style={{ fontSize: 10, color: C.grisDark, textAlign: 'center' }}>
                  {sm.label.split('—')[0].trim()}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700 }}>
                  <span style={{ color: C.rojo }}>{r}R </span>
                  <span style={{ color: C.amarillo }}>{am}A</span>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
          {[['rojo', C.rojo, 'Rojas'], ['amarillo', C.amarillo, 'Amarillas']].map(([k, col, lbl]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.grisDark }}>
              <div style={{ width: 10, height: 10, background: col, borderRadius: 2 }} />
              {lbl}
            </div>
          ))}
        </div>
      </div>

      {/* Detalle por semana */}
      {sems.map(sm => {
        const als = [...(alertasEstaticas[sm.id] || []), ...issuesPorSemana(sm.id)]
        const r = als.filter(a => a.tipo === 'roja').length
        const am = als.filter(a => a.tipo === 'amarilla').length
        return (
          <div key={sm.id} style={{ background: C.blanco, borderRadius: 12,
            border: `1px solid ${C.grisMed}`, marginBottom: 10, overflow: 'hidden' }}>
            <div style={{ background: sm.cur ? C.azul : C.azulMed, padding: '12px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderLeft: sm.cur ? `3px solid ${C.naranja}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: C.blanco, fontWeight: 700, fontSize: 13 }}>{sm.label}</span>
                {sm.cur && <span style={{ background: C.naranja, color: C.blanco, fontSize: 10,
                  fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>EN CURSO</span>}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                <span style={{ color: '#F4A0A0', fontWeight: 700 }}>🔴 {r}</span>
                <span style={{ color: '#F0D080', fontWeight: 700 }}>🟡 {am}</span>
                <span style={{ color: C.grisDark }}>Total: {als.length}</span>
              </div>
            </div>
            {als.slice(0, 3).map((a, i) => (
              <div key={i} style={{ padding: '9px 18px', display: 'flex', alignItems: 'center',
                gap: 10, fontSize: 12, borderBottom: `1px solid ${C.grisMed}` }}>
                <Badge tipo={a.tipo} />
                <FormBadge form={a.form} />
                <span style={{ fontWeight: 600, minWidth: 80, color: C.azulMed }}>{a.disc}</span>
                <span style={{ flex: 1 }}>{a.desc}</span>
              </div>
            ))}
            {als.length > 3 && (
              <div style={{ padding: '7px 18px', background: C.gris, fontSize: 11,
                color: C.grisDark, textAlign: 'center' }}>
                + {als.length - 3} alertas más
              </div>
            )}
            {als.length === 0 && (
              <div style={{ padding: '14px 18px', fontSize: 13, color: C.grisDark }}>
                ✅ Sin alertas esta semana
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
