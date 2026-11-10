export default function Logo({ tam = 30 }) {
  return (
    <span className="marca-icono" style={{ width: tam, height: tam }} aria-hidden="true">
      <img src="./favicon.png" alt="" />
    </span>
  )
}
