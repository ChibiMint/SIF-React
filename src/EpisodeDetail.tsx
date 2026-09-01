import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  getChapterByNumber,
  getChaptersForItem,
  type CapituloRow,
} from './detailChapters'

import {
  getItemById,
} from './itemCatalog'

import './EpisodeDetail.css'


type Server = 'Reso' | 'Urses'


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


function getDriveId(url?: string): string {
  if (!url) {
    return ''
  }

  const cleaned = cleanUrl(url)

  const fileMatch = cleaned.match(
    /\/file\/d\/([^/]+)/
  )

  if (fileMatch) {
    return fileMatch[1]
  }

  const idMatch = cleaned.match(
    /[?&]id=([^&]+)/
  )

  if (idMatch) {
    return idMatch[1]
  }

  return ''
}


function getDriveEmbedUrl(url?: string): string {
  const id = getDriveId(url)

  if (!id) {
    return ''
  }

  return `https://drive.google.com/file/d/${id}/preview`
}


function ChapterThumbnail({
  chapter,
}: {
  chapter: CapituloRow
}) {
  const image = cleanUrl(chapter.Imagen)

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="episode-detail__episode-image"
      />
    )
  }

  return (
    <div className="episode-detail__episode-image episode-detail__episode-image--empty">

      <span>
        {chapter.Capitulo}
      </span>

    </div>
  )
}


export default function EpisodeDetail() {

  const {
    itemId = '',
    capitulo = '',
  } = useParams<{
    itemId: string
    capitulo: string
  }>()


  const item = getItemById(
    decodeURIComponent(itemId)
  )


  const chapters = item
    ? getChaptersForItem(item)
    : null


  const currentChapter =
    item && chapters && capitulo
      ? getChapterByNumber(
          item,
          decodeURIComponent(capitulo)
        )
      : undefined


  const [server, setServer] =
    useState<Server>('Reso')


  const videoUrl = useMemo(() => {

    if (!currentChapter) {
      return ''
    }


    const selectedUrl =
      server === 'Reso'
        ? currentChapter.LinkA
        : currentChapter.LinkB


    return getDriveEmbedUrl(selectedUrl)

  }, [currentChapter, server])


  /*
   * CONTENIDO NO ENCONTRADO
   */

  if (!item) {
    return (
      <div className="episode-detail episode-detail--error">

        <p>
          No se encontró este contenido.
        </p>

        <Link to="/multimedia">
          ← Volver al carrusel
        </Link>

      </div>
    )
  }


  /*
   * SIN CAPÍTULOS
   */

  if (!chapters || chapters.length === 0) {
    return (
      <div className="episode-detail episode-detail--error">

        <p>
          Este contenido no tiene capítulos.
        </p>

        <Link
          to={`/multimedia/item/${item.id}`}
        >
          ← Volver al contenido
        </Link>

      </div>
    )
  }


  /*
   * CAPÍTULO NO ENCONTRADO
   */

  if (!currentChapter) {
    return (
      <div className="episode-detail episode-detail--error">

        <p>
          No se encontró el capítulo {capitulo}.
        </p>

        <Link
          to={`/multimedia/item/${item.id}`}
        >
          ← Volver al contenido
        </Link>

      </div>
    )
  }


  return (
    <div className="episode-detail">

      <div className="episode-detail__container">


        {/* VOLVER */}

        <div className="episode-detail__top">

          <Link
            to={`/multimedia/item/${item.id}`}
            className="episode-detail__back"
          >
            ← Volver a {item.name}
          </Link>

        </div>


        {/* VIDEO */}

        <section className="episode-detail__cinema">

          <div className="episode-detail__player-wrapper">

            {videoUrl ? (

              <iframe
                key={videoUrl}
                src={videoUrl}
                title={`${currentChapter.Name} - ${server}`}
                className="episode-detail__player"
                allow="autoplay; fullscreen"
                allowFullScreen
              />

            ) : (

              <div className="episode-detail__player-empty">

                <p>
                  Este capítulo no tiene un vídeo disponible
                  para el servidor {server}.
                </p>

              </div>

            )}

          </div>

        </section>


        {/* INFORMACIÓN DEL EPISODIO */}

        <section className="episode-detail__info">


          {/* SERVIDORES */}

          <div className="episode-detail__server-buttons">

            <button
              type="button"
              className={
                `episode-detail__server ${
                  server === 'Reso'
                    ? 'episode-detail__server--active'
                    : ''
                }`
              }
              onClick={() => setServer('Reso')}
              disabled={!currentChapter.LinkA}
            >
              Reso
            </button>


            <button
              type="button"
              className={
                `episode-detail__server ${
                  server === 'Urses'
                    ? 'episode-detail__server--active'
                    : ''
                }`
              }
              onClick={() => setServer('Urses')}
              disabled={!currentChapter.LinkB}
            >
              Urses
            </button>

          </div>


          {/* NÚMERO */}

          <div className="episode-detail__number">

            {currentChapter.Capitulo === 'OVA'
              ? 'OVA'
              : `Episodio ${currentChapter.Capitulo}`}

          </div>


          {/* TÍTULO */}

          <h1 className="episode-detail__title">
            {currentChapter.Name}
          </h1>


          {/* JAPONÉS */}

          {currentChapter.Jap && (
            <p className="episode-detail__japanese">
              {currentChapter.Jap}
            </p>
          )}


          {/* ROMAJI */}

          {currentChapter.Romangi && (
            <p className="episode-detail__romaji">
              {currentChapter.Romangi}
            </p>
          )}


          {/* DATOS */}

          <div className="episode-detail__meta">

            {currentChapter.Fecha && (
              <span>
                📅 {currentChapter.Fecha}
              </span>
            )}

            {currentChapter.Canciones && (
              <span>
                🎵 {currentChapter.Canciones}
              </span>
            )}

          </div>


          {/* INFORMACIÓN */}

          {currentChapter.Info && (
            <div className="episode-detail__description">

              <h2>
                Información
              </h2>

              <p>
                {currentChapter.Info}
              </p>

            </div>
          )}

        </section>


        {/* EPISODIOS */}

        <section className="episode-detail__chapters">

          <div className="episode-detail__chapters-header">

            <div>

              <h2>
                Episodios
              </h2>

              <p>
                Más capítulos de {item.name}
              </p>

            </div>

            <span>
              {chapters.length}
            </span>

          </div>


          <div className="episode-detail__episode-grid">

            {chapters.map((chapter) => {

              const isActive =
                String(chapter.Capitulo) ===
                String(currentChapter.Capitulo)


              return (

                <Link
                  key={`${chapter.Capitulo}-${chapter.Name}`}
                  to={
                    `/multimedia/item/${encodeURIComponent(item.id)}` +
                    `/cap/${encodeURIComponent(chapter.Capitulo)}`
                  }
                  className={
                    `episode-detail__episode ${
                      isActive
                        ? 'episode-detail__episode--active'
                        : ''
                    }`
                  }
                >

                  <ChapterThumbnail
                    chapter={chapter}
                  />


                  <div className="episode-detail__episode-info">

                    <span className="episode-detail__episode-number">

                      {chapter.Capitulo === 'OVA'
                        ? 'OVA'
                        : item.kind === 'Libros'
                          ? `Parte ${chapter.Capitulo}`
                          : `Ep. ${chapter.Capitulo}`}

                    </span>


                    <span className="episode-detail__episode-title">
                      {chapter.Name}
                    </span>

                  </div>

                </Link>

              )
            })}

          </div>

        </section>


      </div>

    </div>
  )
}