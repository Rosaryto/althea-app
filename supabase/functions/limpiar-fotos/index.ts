// Limpieza automática de fotos viejas.
// Todas las noches (ver supabase/limpieza-fotos.sql) borra del Storage las fotos de
// las visitas de hace más de DIAS días y las saca del registro de la visita.
// La visita queda (fecha, lista de control, notas): solo se van las fotos.
// No toca la foto de portada de cada casa.
//
// Es seguro que cualquiera la llame: solo hace lo mismo que haría esa noche
// (borrar lo que ya venció), así que no necesita usuario ni clave.
import { createClient } from 'npm:@supabase/supabase-js@2'

const DIAS = 60
const MARCA = '/object/public/fotos/'

type Item = { fotos?: string[] } & Record<string, unknown>
type Visita = { id: string; fotos: string[] | null; items: Item[] | null }

const ruta = (url: string) => {
  const i = typeof url === 'string' ? url.indexOf(MARCA) : -1
  return i < 0 ? null : url.slice(i + MARCA.length)
}

Deno.serve(async () => {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })
  const corte = new Date(Date.now() - DIAS * 864e5).toISOString()

  // Fotos de portada de las casas: nunca se borran.
  const { data: casas, error: e1 } = await sb.from('casas').select('foto')
  if (e1) return Response.json({ error: e1.message }, { status: 500 })
  const portadas = new Set((casas ?? []).map((c) => c.foto).filter(Boolean))

  let visitas = 0, fotos = 0
  for (;;) {
    // Solo las visitas viejas que todavía tienen alguna foto.
    const { data, error } = await sb.rpc('visitas_con_fotos_vencidas', { p_corte: corte })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    const lote = (data ?? []) as Visita[]
    if (!lote.length) break

    for (const v of lote) {
      const urls = [...(v.fotos ?? []), ...(v.items ?? []).flatMap((i) => i.fotos ?? [])]
      const rutas = [...new Set(urls.filter((u) => !portadas.has(u)).map(ruta).filter(Boolean))] as string[]
      if (rutas.length) {
        const { error: e2 } = await sb.storage.from('fotos').remove(rutas)
        if (e2) return Response.json({ error: e2.message, visitas, fotos }, { status: 500 })
      }
      const items = (v.items ?? []).map((i) => ({ ...i, fotos: [] }))
      const { error: e3 } = await sb.from('visitas').update({ fotos: [], items }).eq('id', v.id)
      if (e3) return Response.json({ error: e3.message, visitas, fotos }, { status: 500 })
      visitas++; fotos += rutas.length
    }
  }
  return Response.json({ ok: true, dias: DIAS, visitas, fotos })
})
