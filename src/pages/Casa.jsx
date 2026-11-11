import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, LinkSimple, PencilSimple, Play, WhatsappLogo } from '@phosphor-icons/react'
import { obtenerCasa, listarVisitas, borrarVisita, modoDemo } from '../lib/store.js'
import { linkInforme, linkWhatsApp, novedades } from '../lib/formato.js'
import { estadoCasa, ultimaCorta } from '../lib/agenda.js'
import { MARCA } from '../config.js'
import VisitaDetalle from '../components/VisitaDetalle.jsx'
import Esqueleto from '../components/Esqueleto.jsx'
import Barra from '../components/Barra.jsx'
import Pase from '../components/Pase.jsx'
import { codigoPlan } from '../lib/planes.js'

export default function Casa() {
  const { id } = useParams()
  const [casa, setCasa] = useState(null)
  const [visitas, setVisitas] = useState([])
  const [copiado, setCopiado] = useState(false)
  const [error, setError] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [ahora] = useState(() => Date.now())

  useEffect(() => {
    Promise.all([obtenerCasa(id), listarVisitas(id)])
      .then(([c, v]) => {
        if (!c) return setError('No se encontró esta casa. Puede que se haya borrado.')
        setCasa(c)
        setVisitas(v)
      })
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <><Barra volver="/" /><main className="pantalla"><p className="error" role="alert">{error}</p></main></>
  if (!casa) return <><Barra volver="/" /><Esqueleto /></>

  const link = linkInforme(casa.token)
  const ultima = visitas[0]
  const estado = estadoCasa(casa, ultima, ahora)
  const portada = casa.foto || visitas.find((v) => v.fotos?.length)?.fotos[0]
  const delMes = visitas.filter((v) => new Date(v.inicio) >= ahora - 30 * 864e5)
  const novMes = delMes.reduce((n, v) => n + novedades(v).length, 0)
  const primerNombre = casa.dueno_nombre?.split(' ')[0]

  async function copiar() {
    await navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function borrar(v) {
    if (!confirm('¿Borrar esta visita? No se puede deshacer.')) return
    setErrorAccion('')
    try {
      await borrarVisita(v.id)
      setVisitas((vs) => vs.filter((x) => x.id !== v.id))
    } catch (e) {
      setErrorAccion(e.message || 'No se pudo borrar la visita. Probá de nuevo.')
    }
  }

  return (
    <>
      <header className={`portada ${portada ? '' : 'sin-foto'}`}>
        {portada && <img src={portada} alt="" />}
        <div className="portada-barra">
          <Link to="/" className="icono vidrio" aria-label="Volver"><ArrowLeft size={20} /></Link>
          <Link to={`/casa/${id}/editar`} className="pildora vidrio"><PencilSimple size={18} /> Editar datos</Link>
        </div>
        <h1>{casa.nombre}</h1>
        {casa.direccion && <p>{casa.direccion}</p>}
        <div className="chips">
          {casa.plan && <span className="chip">{casa.plan}</span>}
          <span className={`chip ${estado.clave === 'toca' ? 'alerta' : ''}`}>{estado.texto}</span>
        </div>
      </header>

      <main className="pantalla con-pie">
        <Pase
          className="pase-casa"
          banda={`FICHA DE LA CASA · SLA · ${codigoPlan(casa.plan)}`}
          desde={{ etiqueta: 'DESDE', valor: 'SLA' }}
          hacia={{ etiqueta: 'HACIA', valor: (casa.direccion || casa.nombre).split(',').pop().trim() }}
          campos={[
            casa.dueno_nombre && { etiqueta: 'DUEÑO/A', valor: casa.dueno_nombre },
            casa.plan && { etiqueta: 'PLAN', valor: casa.plan.replace(/^Plan /, '') },
            casa.mascotas && { etiqueta: 'MASCOTAS · TODOS LOS DÍAS', valor: casa.mascotas, ancho: true },
          ]}
          pie={<>
            <span className="etq">ÚLTIMOS 30 DÍAS</span>
            <span className="pase-numeros">
              <b>{delMes.length}</b> {delMes.length === 1 ? 'visita' : 'visitas'} · <b className={novMes ? 'alerta' : ''}>{novMes}</b> {novMes === 1 ? 'problema' : 'problemas'}
              {ultima && <> · <b>{ultimaCorta(ultima.inicio, ahora).valor}</b> última</>}
            </span>
          </>}
        />

        {(casa.dueno_telefono || casa.notas) && (
          <section className="bloque">
            {casa.dueno_telefono && (
              <a className="btn sec ancho" href={linkWhatsApp(casa.dueno_telefono, `Hola ${primerNombre}!`)} target="_blank" rel="noopener">
                <WhatsappLogo size={20} weight="fill" color="var(--wa)" /> Escribirle a {primerNombre || 'el dueño'}
              </a>
            )}
            {casa.notas && <p className="notas-internas"><b>Notas (el dueño no las ve):</b> {casa.notas}</p>}
          </section>
        )}

        <h2 className="sec-titulo">Enlace para el dueño</h2>
        <section className="bloque explicado">
          <p className="t-xs muted">
            <LinkSimple size={16} /> Con este enlace {primerNombre || 'el dueño'} ve todas las visitas con fotos desde su celular, sin usuario ni contraseña.
            Mandáselo una sola vez; se actualiza solo con cada visita.
            {modoDemo && ' (En modo demo solo abre en este navegador.)'}
          </p>
          <div className="botones-col">
            {casa.dueno_telefono && (
              <a className="btn wa ancho" target="_blank" rel="noopener"
                href={linkWhatsApp(casa.dueno_telefono, `Hola ${primerNombre}! Te comparto el enlace donde vas a ver los informes de cada visita a tu casa, con fotos: ${link}

${MARCA}`)}>
                <WhatsappLogo size={20} weight="fill" /> Mandar el enlace por WhatsApp
              </a>
            )}
            <button type="button" className="btn sec ancho" onClick={copiar}>
              {copiado ? <><Check size={20} weight="bold" color="var(--ok)" /> Copiado</> : <><Copy size={20} /> Copiar el enlace</>}
            </button>
          </div>
        </section>

        <h2 className="sec-titulo">Visitas anteriores <span className="muted t-xs mono">{visitas.length}</span></h2>
        {errorAccion && <p className="error" role="alert">{errorAccion}</p>}
        {visitas.length === 0 ? (
          <p className="muted">Todavía no hay visitas. Cuando llegues a la casa, tocá el botón azul de abajo, Empezar visita.</p>
        ) : (
          <ol className="timeline">
            {visitas.map((v, i) => (
              <VisitaDetalle key={v.id} visita={v} i={i}
                acciones={<button type="button" className="link peligro" onClick={() => borrar(v)}>Borrar visita</button>} />
            ))}
          </ol>
        )}
      </main>

      <div className="pie-fijo">
        <Link to={`/casa/${id}/visita`} className="btn grande"><Play size={20} weight="fill" /> Empezar visita</Link>
      </div>
    </>
  )
}
