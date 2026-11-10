// Firma de quien hizo la plataforma. Va en todas las apps de Lambda Lab Norte.
export default function Firma() {
  return (
    <p className="firma-lambda">
      <span>Plataforma realizada por</span>
      <picture>
        <source srcSet="./lambda-lab-norte-blanco.webp" media="(prefers-color-scheme: dark)" />
        <img src="./lambda-lab-norte-negro.webp" alt="Lambda Lab Norte" width="115" height="14" />
      </picture>
    </p>
  )
}
