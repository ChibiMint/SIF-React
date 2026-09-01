import { Link, useParams } from 'react-router-dom'

import {
  getChaptersForItem,
  type CapituloRow,
} from './detailChapters'

import {
  getItemById,
} from './itemCatalog'

import './ItemDetail.css'


function cleanUrl(value?: string): string {
  if (!value) {
    return ''
  }

  const markdownMatch = value.match(
    /\]\((https?:\/\/[^)]+)\)/
  )

  if (markdownMatch) {
    return markdownMatch[1]
  }

  return value
}


function ChapterCard({
  chapter,
  itemId,
}: {
  chapter: CapituloRow
  itemId: string
}) {
  const image = cleanUrl(chapter.Imagen)

  return (
    <Link
      to={
        `/multimedia/item/${encodeURIComponent(itemId)}` +
        `/cap/${encodeURIComponent(chapter.Capitulo)}`
      }
      className="item-detail__chapter"
    >

      <div className="item-detail__chapter-image-wrapper">

        {image ? (
          <img
            src={image}
            alt=""
            className="item-detail__chapter-image"
          />
        ) : (
          <div className="item-detail__chapter-image item-detail__chapter-image--empty">
            <span>
              {chapter.Capitulo}
            </span>
          </div>
        )}

      </div>


      <div className="item-detail__chapter-content">

        <span className="item-detail__chapter-number">
          {chapter.Capitulo === 'OVA'
            ? 'OVA'
            : `Ep. ${chapter.Capitulo}`}
        </span>

        <span className="item-detail__chapter-title">
          {chapter.Name}
        </span>

      </div>

    </Link>
  )
}


function ItemInformation({
  item,
}: {
  item: NonNullable<ReturnType<typeof getItemById>>
}) {
  return (
    <section className="item-detail__information">

      <div className="item-detail__cover-wrapper">

        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="item-detail__cover"
          />
        ) : (
          <div className="item-detail__cover item-detail__cover--empty">
            Sin imagen
          </div>
        )}

      </div>


      <div className="item-detail__basic">

        <h1 className="item-detail__title">
          {item.name}
        </h1>


        <div className="item-detail__categories">

          <span className="item-detail__category">
            {item.kind}
          </span>

          <span className="item-detail__category">
            {item.grup}
          </span>

        </div>


        <div className="item-detail__wiki-section">

          <h2>
            Información
          </h2>

          <div className="item-detail__info-table">

            <div className="item-detail__info-row">
              <span className="item-detail__info-label">
                Nombre
              </span>

              <span className="item-detail__info-value">
                {item.name}
              </span>
            </div>


            <div className="item-detail__info-row">
              <span className="item-detail__info-label">
                Grupo
              </span>

              <span className="item-detail__info-value">
                {item.grup}
              </span>
            </div>


            <div className="item-detail__info-row">
              <span className="item-detail__info-label">
                Tipo
              </span>

              <span className="item-detail__info-value">
                {item.kind}
              </span>
            </div>

          </div>

        </div>


        <div className="item-detail__wiki-section">

          <h2>
            Descripción
          </h2>

          <p className="item-detail__description">
            Información sobre {item.name}.
          </p>

        </div>

      </div>

    </section>
  )
}


export default function ItemDetail() {

  const {
    itemId = '',
  } = useParams<{
    itemId: string
  }>()


  const item = getItemById(
    decodeURIComponent(itemId)
  )


  if (!item) {
    return (
      <div className="item-detail item-detail--error">

        <h1>
          No se encontró este contenido
        </h1>

      </div>
    )
  }


  const chapters = getChaptersForItem(item)


  return (
    <div className="item-detail">

      <div className="item-detail__container">



        {/* TÍTULO PRINCIPAL */}

        <header className="item-detail__header">

          <h1>
            {item.name}
          </h1>

        </header>


        {/* CONTENIDO PRINCIPAL */}

        <div className="item-detail__layout">


          {/* INFORMACIÓN */}

          <main className="item-detail__main">

            <ItemInformation
              item={item}
            />

          </main>


          {/* CAPÍTULOS */}

          <aside className="item-detail__sidebar">

            <div className="item-detail__sidebar-header">

              <div>

                <h2>
                  Episodios
                </h2>

                <p>
                  Lista de capítulos disponibles
                </p>

              </div>

              {chapters && (
                <span className="item-detail__episode-count">
                  {chapters.length}
                </span>
              )}

            </div>


            {!chapters || chapters.length === 0 ? (

              <div className="item-detail__empty">

                <p>
                  Aún no hay capítulos disponibles
                  para este contenido.
                </p>

              </div>

            ) : (

              <div className="item-detail__chapter-list">

                {chapters.map((chapter) => (

                  <ChapterCard
                    key={`${chapter.Capitulo}-${chapter.Name}`}
                    chapter={chapter}
                    itemId={item.id}
                  />

                ))}

              </div>

            )}

          </aside>


        </div>

      </div>

    </div>
  )
}
