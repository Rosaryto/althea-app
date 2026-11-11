// Código corto del plan, como en las tarjetas de la web (SLA · ESN).
const CODIGOS = { esencial: 'ESN', mascotas: 'MSC', semanal: 'SEM', quincenal: 'QNC', mensual: 'MEN', minero: 'TMN', dia: 'DIA', 'día': 'DIA' }
export function codigoPlan(plan = '') {
  const p = plan.toLowerCase()
  const k = Object.keys(CODIGOS).find((c) => p.includes(c))
  return k ? CODIGOS[k] : 'ALT'
}
