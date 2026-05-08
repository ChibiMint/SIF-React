import { Link, useParams } from 'react-router-dom'
import { getChaptersForItem, type CapituloRow } from './detailChapters.ts'
import { getItemById, type Item } from './itemCatalog'
import './ItemDetail.css'

function ItemDetailChapters({ item, rows }: { item: Item; rows: CapituloRow[] }) {
  const sectionTitle = item.kind === 'Libros' ? 'Contenido' : 'Capítulos'

  return (
    <div className="item-detail item-detail--chapters">
      <header className="item-detail__hero">
        {item.image ? (
          <img src={item.image} alt="" className="item-detail__img item-detail__img--thumb" />
        ) : null}
        <h1 className="item-detail__title">{item.name}</h1>
        <p className="item-detail__meta">
          {item.grup} · {item.kind}
        </p>
      </header>

      <section className="item-detail__chapters" aria-label={sectionTitle}>
        <h2 className="item-detail__chapters-title">{sectionTitle}</h2>
        {rows.length === 0 ? (
          <p className="item-detail__empty">Aún no hay entradas en el JSON para este título.</p>
        ) : (
          <ol className="item-detail__chapter-list">
            {rows.map((row) => (
              <li key={`${row.Capitulo}-${row.Name}`} className="item-detail__chapter">
                <span className="item-detail__chapter-num">
                  {item.kind === 'Libros' ? `Parte ${row.Capitulo}` : `Ep. ${row.Capitulo}`}
                </span>
                <span className="item-detail__chapter-name">{row.Name}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function ItemDetailGeneric({ item }: { item: Item }) {
  return (
    <article className="item-detail__card">
      {item.image ? <img src={item.image} alt="" className="item-detail__img" /> : null}
      <h1 className="item-detail__title">{item.name}</h1>
      <p className="item-detail__meta">
        {item.grup} · {item.kind}
      </p>
    </article>
  )
}

/**
 * Detalle del carrusel: anime y libros con JSON en `detailChapters.ts` muestran lista de capítulos/contenido.
 */
export default function ItemDetail() {
  const { itemId = '' } = useParams<{ itemId: string }>()
  const decoded = decodeURIComponent(itemId)
  const item = getItemById(decoded)
  const chapters = item ? getChaptersForItem(item) : null

  return (
    <div className="item-detail item-detail--root">
      <Link to="/multimedia" className="item-detail__back">
        ← Volver al carrusel
      </Link>
      {!item ? (
        <p className="item-detail__missing">No se encontró este ítem.</p>
      ) : chapters !== null ? (
        <ItemDetailChapters item={item} rows={chapters} />
      ) : (
        <ItemDetailGeneric item={item} />
      )}
    </div>
  )
}
