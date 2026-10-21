/**
 * Adaptador de los datos descargados desde Idol.st.
 * Wiki.tsx puede seguir usando su interfaz Idol; este módulo normaliza
 * los nombres de campos sin modificar el diseño de la página.
 */
import idolstData from './content/Wiki/idols.json';

export interface Idol {
  name: string;
  japanese_name?: string | null;
  age?: string | number | null;
  school?: string | null;
  birthday?: string | null;
  astrological_sign?: string | null;
  blood?: string | null;
  height?: string | number | null;
  measurements?: string | null;
  favorite_food?: string | null;
  least_favorite_food?: string | null;
  hobbies?: string | null;
  attribute?: string | null;
  year?: string | null;
  main_unit?: string | null;
  sub_unit?: string | null;
  summary?: string | null;
  image?: string | null;
  voice_actress?: string | null;
  color?: string | null;
  penlight_color?: string | null;
  specialty?: string | null;
  skill?: string | null;
  introduction?: string | null;
  idolst_url?: string | null;
  source?: string | null;
  [key: string]: unknown;
}

interface IdolStPayload {
  idols?: Record<string, unknown>[];
}

const payload = idolstData as IdolStPayload;

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return null;
}

function normalizeIdol(raw: Record<string, unknown>): Idol {
  return {
    ...raw,
    name: firstString(raw.name, raw.english_name, raw.title) ?? 'Personaje sin nombre',
    japanese_name: firstString(raw.japanese_name, raw.name_japanese),
    main_unit: firstString(raw.main_unit, raw.unit),
    sub_unit: firstString(raw.sub_unit, raw.subunit),
    year: firstString(raw.year, raw.school_year),
    school: firstString(raw.school),
    birthday: firstString(raw.birthday),
    astrological_sign: firstString(raw.astrological_sign, raw.zodiac_sign),
    blood: firstString(raw.blood, raw.blood_type),
    height: firstString(raw.height),
    favorite_food: firstString(raw.favorite_food, raw.liked_food),
    least_favorite_food: firstString(raw.least_favorite_food, raw.disliked_food),
    hobbies: firstString(raw.hobbies, raw.hobby),
    summary: firstString(raw.summary, raw.description, raw.introduction),
    image: firstString(raw.image, raw.image_url, raw.avatar),
    idolst_url: firstString(raw.idolst_url, raw.url),
    source: 'Idol.st',
  };
}

export const idolstIdols: Idol[] = (payload.idols ?? []).map(normalizeIdol);

export function getIdolstIdols(): Idol[] {
  return idolstIdols;
}
