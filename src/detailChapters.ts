import type { Item } from './itemCatalog'
import CapitulosSIP1 from './content/Caps/Cap_SIP1.json'
import CapitulosSIP2 from './content/Caps/Cap_SIP2.json'
import CapitulosSunshine1 from './content/Caps/Cap_Sunshine1.json'
import CapitulosNijigasaki1 from './content/Caps/Cap_Nijigasaki1.json'
import CapitulosSuperstar1 from './content/Caps/Cap_Superstar1.json'
import CapitulosSunshineMirror from './content/Caps/Cap_Stm.json'
import CapitulosNijiyon from './content/Caps/Cap_Nijiyon.json'
import CapitulosLibroSchoolIdolDiary from './content/Caps/Cap_SID.json'
import CapitulosLibroManga from './content/Caps/Cap_Manga.json'

export type CapituloRow = { Capitulo: string; Name: string }

/** Mismo `Name` que en Anime.json / Libros.json → filas de capítulo (o vacío hasta que completes el JSON). */
const CHAPTERS_BY_TITLE: Record<string, CapituloRow[]> = {
  'Love live! the school idol project!': CapitulosSIP1.sections,
  'Love live! the school idol project 2!!': CapitulosSIP2.sections,
  'Love live! Sunshine!!': CapitulosSunshine1.sections,
  'Love live! Nijigasaki High School Idol Club': CapitulosNijigasaki1.sections,
  'Love live! Superstar!!': CapitulosSuperstar1.sections,
  'Sunshine in the mirror': CapitulosSunshineMirror.sections,
  'Love live! Nijiyon': CapitulosNijiyon.sections,
  'Love Live! School idol diary': CapitulosLibroSchoolIdolDiary.sections,
  'Love Live! Manga': CapitulosLibroManga.sections,
}

/**
 * Si el ítem es anime o libro y su `name` está en el mapa, devuelve las filas del JSON asociado.
 * Si no aplica, devuelve `null` (vista genérica en ItemDetail).
 */
export function getChaptersForItem(item: Item): CapituloRow[] | null {
  if (item.kind !== 'anime' && item.kind !== 'Libros') return null
  const rows = CHAPTERS_BY_TITLE[item.name]
  return rows !== undefined ? rows : null
}
