// Pase de abordar: la misma pieza que el "Pase de tranquilidad" de la web.
// Banda azul con el avión, ruta DESDE → HACIA con el avión que despega,
// campos con etiquetas en mono, perforación y talón con código de barras.

const BARRAS = [2, 5, 2, 4, 1, 6, 2, 3, 1, 4, 2, 5, 1, 3]

export function Avion({ className = '' }) {
  return (
    <svg className={`avion ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
    </svg>
  )
}

export default function Pase({ banda, desde, hacia, campos = [], pie, children, className = '' }) {
  return (
    <section className={`pase ${className}`}>
      <div className="pase-cuerpo">
        <div className="pase-banda"><b>{banda}</b><Avion /></div>
        {desde && (
          <div className="pase-ruta">
            <div><span className="etq">{desde.etiqueta}</span><strong>{desde.valor}</strong></div>
            <i><Avion className="vuela" /></i>
            <div className="fin"><span className="etq">{hacia.etiqueta}</span><strong>{hacia.valor}</strong></div>
          </div>
        )}
        {campos.length > 0 && (
          <div className="pase-campos">
            {campos.filter(Boolean).map((c) => (
              <div key={c.etiqueta} className={c.ancho ? 'ancho' : ''}>
                <span className="etq">{c.etiqueta}</span>
                {c.grande ? <span className="al">{c.valor}</span> : c.valor}
              </div>
            ))}
          </div>
        )}
        {children}
      </div>
      <div className="perfo"><i /></div>
      <div className="pase-pie">
        <div>{pie}</div>
        <div className="barras" aria-hidden="true">{BARRAS.map((w, i) => <span key={i} style={{ width: w }} />)}</div>
      </div>
    </section>
  )
}
