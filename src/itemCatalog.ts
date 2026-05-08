import Anime from './content/Multimedia/Anime.json'
import Songs from './content/Multimedia/Songs.json'
import Album from './content/Multimedia/Album.json'
import Conciertos from './content/Multimedia/Conciertos.json'
import Libros from './content/Multimedia/Libros.json'

export type Kind = 'anime' | 'song' | 'album' | 'Conciertos' | 'Libros'

export type Item = {
  id: string
  kind: Kind
  name: string
  grup: string
  image?: string
}

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

  Album.sections.forEach((s, i) => {
    out.push({
      id: `album-${i}`,
      kind: 'album',
      name: s.Name,
      grup: s.Grup,
      image: s.Image,
    })
  })
  Conciertos.sections.forEach((s, i) => {
    out.push({
      id: `Conciertos-${i}`,
      kind: 'Conciertos',
      name: s.Name,
      grup: s.Grup,
      image: s.Image,
    })
  })

  Libros.sections.forEach((s, i) => {
    out.push({
      id: `Libros-${i}`,
      kind: 'Libros',
      name: s.Name,
      grup: s.Grup,
      image: s.Image,
    })
  })

  return out
}

export const ALL = buildAll()

export function getItemById(id: string): Item | undefined {
  return ALL.find((it) => it.id === id)
}
