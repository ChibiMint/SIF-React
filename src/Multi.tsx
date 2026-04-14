import './Multi.css'
import { useMultimedia } from './MultimediaContext'

const GRUPOS = ["μ's", 'Aquors', 'Nijigasaki', 'Liella', 'Hasu no sora', 'Ikizu', 'Musical'] as const
const CATEGORIAS = ['Anime', 'Musica', 'Conciertos', 'Libros', 'Extras'] as const

/** Barra de filtros: al pulsar grupo/categoría se actualiza el contexto que consume Swipe; “Filtros” limpia la selección. */
export default function Multi() {
  const {
    selectedGroup,
    setSelectedGroup,
    selectedCategory,
    setSelectedCategory,
    resetFilters,
  } = useMultimedia()

  return (
    <div className="songs">
      <div className="grupos">
        {GRUPOS.map((g) => (
          <div
            key={g}
            className={`grupo ${selectedGroup === g ? 'active' : ''}`}
            onClick={() => setSelectedGroup(selectedGroup === g ? null : g)}
            role="button"
            tabIndex={0}
          >
            <p>{g}</p>
          </div>
        ))}
      </div>
      <div className="categorias">
        {CATEGORIAS.map((c) => (
          <div
            key={c}
            className={`categoria ${selectedCategory === c ? 'active' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === c ? null : c)}
            role="button"
            tabIndex={0}
          >
            <p>{c}</p>
          </div>
        ))}
        <div className="filtro" onClick={resetFilters} role="button" tabIndex={0}>
          <p>Filtros</p>
        </div>
      </div>
    </div>
  )
}