import { useEffect, useMemo, useState } from 'react'
import './Swipe.css'
import Anime from './content/Anime.json'
import Songs from './content/Songs.json'
import t1 from './assets/t1.svg'
import t2 from './assets/t2.svg'
import { useMultimedia } from './MultimediaContext'

type Kind = 'anime' | 'song'

type Item = {
  id: string
  kind: Kind
  name: string
  grup: string
  image?: string
}

/** Relaciona el botón de categoría en Multi con tipos de ítem; arrays vacíos = esa categoría no muestra nada aún. */
const CATEGORIA_A_KIND: Record<string, Kind[]> = {
  Anime: ['anime'],
  Musica: ['song'],
  Conciertos: [],
  Libros: [],
}

/**
 * Une Anime.json y Songs.json en un solo array con forma uniforme (`Item`) para el carrusel.
 * No incluye Characters.json.
 */
function buildAll(): Item[] {
  const out: Item[] = []

  Anime.sections.forEach((s, i) => {
    out.push({
      id: `anime-${i}`,
      kind: 'anime',
      name: s.Name,
      grup: s.Grup,
      image: s.Image,
    })
  })

  Songs.sections.forEach((s, i) => {
    out.push({
      id: `song-${i}`,
      kind: 'song',
      name: s.Name,
      grup: s.Grup,
      image: s.Image,
    })
  })

  return out
}

const ALL = buildAll()

/**
 * Aplica filtros del contexto: categoría restringe por `kind`, grupo por `grup`.
 * Con ambos `null` devuelve la lista completa (comportamiento por defecto).
 */
function filtrar(items: Item[], grupo: string | null, categoria: string | null): Item[] {
  let list = items
  if (categoria) {
    const kinds = CATEGORIA_A_KIND[categoria]
    if (kinds) list = items.filter((it) => kinds.includes(it.kind))
  }
  if (grupo) list = list.filter((it) => it.grup === grupo)
  return list
}

export default function Swipe() {
  const { selectedGroup, selectedCategory } = useMultimedia()
  const items = useMemo(
    () => filtrar(ALL, selectedGroup, selectedCategory),
    [selectedGroup, selectedCategory],
  )

  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [selectedGroup, selectedCategory, items.length])

  const n = items.length
  const current = n > 0 ? items[index] : null

  /** Pasa al slide anterior (circular si hay más de un ítem). */
  const prev = () => n && setIndex((i) => (i - 1 + n) % n)
  /** Pasa al siguiente slide (circular si hay más de un ítem). */
  const next = () => n && setIndex((i) => (i + 1) % n)

  return (
    <>
      <div className="container">
        <img src={t1} className="buttomS1" alt="Anterior" height={100} onClick={prev} />
        <div className="swipe-card">
          {!current ? (
            <p>Perame aun no acabo.</p>
          ) : (
            <>
              {current.image ? <img src={current.image} alt="" className="swipe-card__img" /> : null}
            </>
          )}
        </div>
        <img src={t2} className="buttomS2" alt="Siguiente" height={100} onClick={next} />
      </div>

      <div className="informacion">
        <p>{current?.name ?? 'Love Live!'}</p>
      </div>
    </>
  )
}