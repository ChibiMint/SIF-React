import { useCallback, useEffect, useMemo, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
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
 * Con ambos `null` devuelve la lista completa.
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

/** Clase CSS según qué tan lejos está el slide del seleccionado: centro (nombre), vecinos, orillas. */
function slideRingClass(index: number, selectedIndex: number): 'center' | 'adj' | 'edge' {
  const d = Math.abs(index - selectedIndex)
  if (d === 0) return 'center'
  if (d === 1) return 'adj'
  return 'edge'
}

type SlideItem = Item & { loopKey: string }

/**
 * Embla pide `loop: true` pero en el código interno, si `slideLooper.canLoop()` es false,
 * vuelve a crear el motor con `loop: false` (sin avisar). Eso pasa cuando el carril es
 * demasiado corto respecto al viewport — típico con ~5 slides visibles y pocos ítems o un filtro agresivo.
 * Repetimos la misma lista (claves únicas en `loopKey`) hasta un mínimo para que el loop sea posible.
 */
const MIN_SLIDES_FOR_LOOP = 18

function expandItemsForEmblaLoop(items: Item[]): SlideItem[] {
  if (items.length === 0) return []
  if (items.length >= MIN_SLIDES_FOR_LOOP) {
    return items.map((it) => ({ ...it, loopKey: it.id }))
  }
  const out: SlideItem[] = []
  let round = 0
  while (out.length < MIN_SLIDES_FOR_LOOP) {
    for (const it of items) {
      out.push({ ...it, loopKey: `${it.id}__r${round}` })
    }
    round += 1
  }
  return out
}

export default function Swipe() {
  const { selectedGroup, selectedCategory } = useMultimedia()
  const items = useMemo(
    () => filtrar(ALL, selectedGroup, selectedCategory),
    [selectedGroup, selectedCategory],
  )

  const loopSlides = useMemo(() => expandItemsForEmblaLoop(items), [items])

  /**
   * useEmblaCarousel: engancha Embla al DOM (ref en .embla) y expone la API para scroll/prev/next.
   * - loop: carrusel infinito cuando hay slides suficientes.
   * - align 'center': el slide activo queda centrado en el viewport (coincide con el que muestra nombre).
   * - slidesToScroll: cada gesto/botón avanza un slide.
   * - watchSlides: si cambian hijos del track, Embla se re-inicializa solo.
   */
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    slidesToScroll: 1,
    watchSlides: true,
  })

  /** Índice del slide “seleccionado” por Embla (el centrado al hacer snap); sincroniza título y escalas. */
  const [selectedIndex, setSelectedIndex] = useState(0)

  /**
   * Lee de la API cuál es el snap actual y guarda su índice en estado para:
   * - mostrar `loopSlides[selectedIndex]` en la franja de información (mismo dato que el ítem filtrado)
   * - asignar clases center | adj | edge según distancia a ese índice
   */
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  /** Suscripción a eventos de Embla: al cambiar de slide o tras reInit, actualizamos selectedIndex. */
  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  /**
   * Al cambiar filtros o la lista derivada, Embla debe recalcular medidas y volver al primer ítem filtrado.
   * items en dependencias: mismo grupo/categoría puede devolver nueva referencia de array desde useMemo.
   */
  useEffect(() => {
    if (!emblaApi) return
    emblaApi.reInit()
    emblaApi.scrollTo(0, true)
  }, [emblaApi, loopSlides, selectedGroup, selectedCategory])

  const n = items.length
  const current =
    loopSlides.length > 0 ? (loopSlides[selectedIndex] ?? loopSlides[0]) : null

  const prev = () => emblaApi?.scrollPrev()
  const next = () => emblaApi?.scrollNext()

  return (
    <div className="swipe">
      <div className="container">
        <img src={t1} className="buttomS" alt="Anterior" height={100} onClick={prev} />
        {/*
          ref={emblaRef}: viewport del carrusel (overflow hidden). Dentro, .embla__container es el carril
          que Embla desplaza; cada .embla__slide es un “cajón” del 20% para ver 5 a la vez.
        */}
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {n === 0 ? (
              <div className="embla__slide embla__slide--solo">
                <div className="swipe-card">
                  <p>Perame aun no acabo.</p>
                </div>
              </div>
            ) : (
              loopSlides.map((it, i) => {
                const ring = slideRingClass(i, selectedIndex)
                return (
                  <div
                    className={`embla__slide embla__slide--${ring}`}
                    key={it.loopKey}
                    aria-current={ring === 'center' ? 'true' : undefined}
                  >
                    {/*
                      .embla__slide-inner: envoltorio solo visual; el scale se aplica aquí para no alterar
                      el ancho lógico del slide (Embla sigue midiendo 20% por slide).
                    */}
                    <div className="embla__slide-inner">
                      <div className="swipe-card">
                        {it.image ? <img src={it.image} alt="" className="swipe-card__img" /> : null}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
        <img src={t2} className="buttomS" alt="Siguiente" height={100} onClick={next} />
      </div>

      <div className="informacion">
        <p>{current?.name ?? 'Love Live!'}</p>
      </div>
    </div>
  )
}
