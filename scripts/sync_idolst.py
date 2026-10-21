from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlparse

import requests
from bs4 import BeautifulSoup, Tag

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "content" / "Wiki" / "idols.json"
BASE = "https://idol.st"
LIST_URL = f"{BASE}/idols/"
DELAY_SECONDS = 0.65
TIMEOUT = 30
MAX_LIST_PAGES = 200
RETRIES = 3

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; LoveLiveWikiDataSync/1.2; personal project)",
    "Accept-Language": "en-US,en;q=0.9",
}

FIELD_LABELS = {
    "name": ["name", "english name"],
    "japanese_name": ["japanese name", "name in japanese", "氏名"],
    "main_unit": ["unit", "main unit"],
    "sub_unit": ["subunit", "sub unit"],
    "voice_actress": ["voice actress", "voice actor", "voice actress name"],
    "school": ["school"],
    "year": ["school year", "year"],
    "birthday": ["birthday"],
    "astrological_sign": ["astrological sign", "zodiac sign"],
    "blood": ["blood type", "blood"],
    "height": ["height"],
    "measurements": ["measurements"],
    "age": ["age"],
    "color": ["color", "image color"],
    "penlight_color": ["penlight color"],
    "specialty": ["specialty", "speciality"],
    "skill": ["skill"],
    "hobbies": ["hobbies", "hobby"],
    "favorite_food": ["liked food", "favorite food", "favourite food"],
    "least_favorite_food": ["disliked food", "least favorite food", "least favourite food"],
    "introduction": ["introduction"],
    "summary": ["description", "summary"],
}

JAPANESE_RE = re.compile(r"[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff々〆ヵヶ]+")


def clean(value: str | None) -> str | None:
    if not value:
        return None
    value = value.replace("\xa0", " ")
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"^(?:image\s*:\s*)", "", value, flags=re.I).strip()
    # No tratar el nombre de una etiqueta como si fuera el dato.
    if value.lower() in {"description", "summary", "name", "voice actress", "open voice actress"}:
        return None
    return value or None


def norm_label(value: str) -> str:
    return re.sub(r"[^a-z0-9ぁ-んァ-ヶ一-龯]+", " ", value.lower()).strip()


NORMALIZED_LABELS = {
    norm_label(alias): key
    for key, aliases in FIELD_LABELS.items()
    for alias in aliases
}


def label_key(label: str) -> str | None:
    return NORMALIZED_LABELS.get(norm_label(label.rstrip(":：")))


def text_of(node: Tag) -> str:
    return clean(node.get_text(" ", strip=True)) or ""


def clean_field_value(key: str, value: str | None) -> str | None:
    """Retira del valor el nombre de la etiqueta que Idol.st incluye en el texto."""
    value = clean(value)
    if not value:
        return None

    prefixes = {
        "name": r"name",
        "japanese_name": r"japanese\s+name|name\s+in\s+japanese",
        "main_unit": r"main\s+unit|unit",
        "sub_unit": r"sub\s*unit|sub\s+unit",
        "voice_actress": r"voice\s+actress|voice\s+actor",
        "school": r"school",
        "year": r"school\s+year|year",
        "birthday": r"birthday",
        "astrological_sign": r"astrological\s+sign|zodiac\s+sign",
        "blood": r"blood\s+type|blood",
        "height": r"height",
        "measurements": r"measurements",
        "age": r"age",
        "color": r"image\s+color|color",
        "penlight_color": r"penlight\s+color",
        "specialty": r"specialty|speciality",
        "skill": r"skill",
        "hobbies": r"hobbies|hobby",
        "favorite_food": r"liked\s+food|favorite\s+food|favourite\s+food",
        "least_favorite_food": r"disliked\s+food|least\s+favorite\s+food|least\s+favourite\s+food",
        "introduction": r"introduction",
        "summary": r"description|summary",
    }
    prefix = prefixes.get(key)
    if prefix:
        value = re.sub(rf"^(?:{prefix})\s*[:：–—-]?\s*", "", value, count=1, flags=re.I).strip()

    if key in {"summary", "introduction"}:
        # Description puede aparecer duplicado y los separadores HTML pueden
        # llegar como texto literal. Se conserva el contenido biográfico.
        value = re.sub(r"^(?:(?:description|summary|introduction)\s*)+", "", value, flags=re.I).strip()
        value = re.sub(r"<\s*hr\s*/?\s*>", " | ", value, flags=re.I)
        value = re.sub(r"<\s*br\s*/?\s*>", " ", value, flags=re.I)
        value = re.sub(r"\s+", " ", value).strip(" |")

    return value or None


def put(data: dict, key: str, value: str | None) -> None:
    value = clean_field_value(key, value)
    if not value:
        return

    # Los datos muy largos suelen ser el texto de una tarjeta/contenedor completo,
    # no el valor de un campo de perfil.
    if key not in {"summary", "introduction"} and len(value) > 350:
        return

    if not data.get(key):
        data[key] = value


def value_from_node(node: Tag) -> str | None:
    """Extrae el valor sin incluir etiquetas vecinas ni todo el contenedor."""
    # Los atributos semánticos suelen ser más fiables que el texto del bloque.
    for attr in ("data-value", "content", "title", "aria-label"):
        val = node.get(attr)
        if isinstance(val, str) and clean(val):
            return clean(val)

    # Preferir hijos directos de texto; si no hay, usar texto del nodo.
    direct_text = " ".join(
        str(child).strip()
        for child in node.children
        if not isinstance(child, Tag) and str(child).strip()
    )
    if clean(direct_text):
        return clean(direct_text)
    return clean(text_of(node))


def extract_pairs(soup: BeautifulSoup) -> dict:
    data: dict = {}

    # Tablas: etiqueta en la primera celda y valor en la segunda.
    for row in soup.select("tr"):
        cells = row.find_all(["th", "td"], recursive=False)
        if len(cells) >= 2:
            key = label_key(text_of(cells[0]))
            if key:
                put(data, key, text_of(cells[1]))

    # Listas de definición.
    for dt in soup.select("dt"):
        key = label_key(text_of(dt))
        dd = dt.find_next_sibling("dd")
        if key and dd:
            put(data, key, text_of(dd))

    # Etiquetas explícitas: evitar buscar sobre divs/sections genéricos porque
    # su texto suele incluir varios campos y provoca valores cruzados.
    for node in soup.find_all(["label", "strong", "b", "th"]):
        label = text_of(node)
        key = label_key(label)
        if not key:
            continue

        # Primero, hermanos siguientes inmediatos.
        for sibling in list(node.next_siblings)[:3]:
            if isinstance(sibling, Tag):
                candidate = text_of(sibling)
            else:
                candidate = clean(str(sibling))
            if candidate and norm_label(candidate) != norm_label(label):
                put(data, key, candidate)
                break

        # Si no se encontró un valor, inspeccionar solo hijos directos del padre.
        if data.get(key):
            continue
        parent = node.parent if isinstance(node.parent, Tag) else None
        if parent:
            siblings = list(parent.find_all(recursive=False))
            try:
                pos = siblings.index(node)
            except ValueError:
                pos = -1
            if pos >= 0:
                for sibling in siblings[pos + 1:pos + 3]:
                    candidate = text_of(sibling)
                    if candidate and norm_label(candidate) != norm_label(label):
                        put(data, key, candidate)
                        break

    # Algunas páginas exponen campos con atributos de datos.
    for node in soup.select("[data-label], [data-field], [itemprop]"):
        label = node.get("data-label") or node.get("data-field") or node.get("itemprop")
        if not isinstance(label, str):
            continue
        key = label_key(label)
        if key:
            put(data, key, value_from_node(node))

    return data


def extract_section(soup: BeautifulSoup, headings: set[str]) -> str | None:
    wanted = {norm_label(h) for h in headings}
    for heading in soup.find_all(["h1", "h2", "h3", "h4", "h5"]):
        if norm_label(text_of(heading).rstrip(":")) not in wanted:
            continue

        parts = []
        for sibling in heading.next_siblings:
            if isinstance(sibling, Tag) and sibling.name in {
                "h1", "h2", "h3", "h4", "h5"
            }:
                break
            value = text_of(sibling) if isinstance(sibling, Tag) else clean(str(sibling))
            if not value:
                continue
            if norm_label(value) in wanted:
                continue
            # Ignorar botones y enlaces de navegación de la sección.
            if isinstance(sibling, Tag) and sibling.name in {"button", "nav"}:
                continue
            parts.append(value)
            if sum(len(part) for part in parts) > 4000:
                break

        result = clean(" ".join(parts))
        if result and len(result) > 10 and norm_label(result) not in wanted:
            return result

        # Fallback estrecho: solo el siguiente bloque hermano del encabezado.
        parent = heading.parent if isinstance(heading.parent, Tag) else None
        if parent:
            following = heading.find_next_sibling()
            if isinstance(following, Tag):
                result = clean(text_of(following))
                if result and len(result) > 10 and norm_label(result) not in wanted:
                    return result
    return None


def split_names(data: dict, title_text: str | None = None) -> None:
    """Separa el nombre japonés si el sitio lo entrega combinado en un solo campo."""
    raw_name = clean(data.get("name")) or clean(title_text)
    raw_japanese = clean(data.get("japanese_name"))

    if raw_name:
        # Quitar sufijos comunes de título SEO.
        raw_name = re.split(r"\s*[|｜]\s*", raw_name)[0].strip()

    if raw_name and not raw_japanese:
        japanese_parts = JAPANESE_RE.findall(raw_name)
        if japanese_parts:
            japanese = " ".join(japanese_parts).strip()
            english = JAPANESE_RE.sub(" ", raw_name)
            english = re.sub(r"\s+", " ", english).strip(" -–—|｜")
            if english:
                data["name"] = english
            else:
                data.pop("name", None)
            data["japanese_name"] = japanese

    elif raw_name and raw_japanese:
        # Si name contiene inglés y japonés, retirar del campo name los caracteres japoneses.
        english = JAPANESE_RE.sub(" ", raw_name)
        english = re.sub(r"\s+", " ", english).strip(" -–—|｜")
        if english:
            data["name"] = english
        data["japanese_name"] = raw_japanese


def clean_voice_actress(value: str | None) -> str | None:
    value = clean(value)
    if not value:
        return None
    value = re.sub(r"\s*(?:open\s*)?voice actress\b.*$", "", value, flags=re.I).strip(" -–—|")
    value = re.sub(r"\s+", " ", value).strip()
    if norm_label(value) in {"voice actress", "open voice actress", "unknown", "n a"}:
        return None
    return value or None


def profile_urls_from_listing(soup: BeautifulSoup) -> set[str]:
    found = set()
    for a in soup.select("a[href]"):
        href = urljoin(BASE, a.get("href", ""))
        parsed = urlparse(href)
        if parsed.netloc.endswith("idol.st") and re.match(r"^/idol/\d+/", parsed.path):
            found.add(href.split("#")[0])
    return found


def listing_next_urls(soup: BeautifulSoup, current_url: str) -> list[str]:
    result = []
    current = urlparse(current_url)

    for a in soup.select('a[href]'):
        href = urljoin(current_url, a.get("href", ""))
        parsed = urlparse(href)
        if parsed.netloc != current.netloc or parsed.path.rstrip("/") != "/idols":
            continue
        query = parse_qs(parsed.query)
        if "page" in query and href not in result:
            result.append(href)

    for a in soup.select('a[rel~="next"][href]'):
        href = urljoin(current_url, a.get("href", ""))
        parsed = urlparse(href)
        if parsed.netloc == current.netloc and parsed.path.rstrip("/") == "/idols" and href not in result:
            result.append(href)

    return result


def get_with_retries(session: requests.Session, url: str) -> requests.Response:
    last_error = None
    for attempt in range(1, RETRIES + 1):
        try:
            response = session.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            return response
        except requests.RequestException as exc:
            last_error = exc
            if attempt < RETRIES:
                wait = attempt * 2
                print(f"    Reintento {attempt}/{RETRIES} fallido; esperando {wait}s: {exc}", file=sys.stderr)
                time.sleep(wait)
    raise last_error  # type: ignore[misc]


def parse_profile(session: requests.Session, url: str) -> dict | None:
    response = get_with_retries(session, url)
    soup = BeautifulSoup(response.text, "html.parser")
    data = extract_pairs(soup)

    title = soup.select_one("h1")
    title_text = text_of(title) if title else None

    # El título es el respaldo del nombre, no el texto de toda la página.
    if not data.get("name") and title_text:
        data["name"] = clean_field_value("name", re.split(r"\s*[|｜]\s*", title_text)[0].strip()) or title_text

    split_names(data, title_text)

    og_image = soup.select_one('meta[property="og:image"][content]')
    if og_image:
        image_url = clean(og_image.get("content"))
        if image_url:
            data["image"] = urljoin(BASE, image_url)

    # Description no debe convertirse en el valor literal "Description".
    description = extract_section(soup, {"Description", "Introduction"})
    if description:
        if norm_label(description) not in {"description", "summary", "introduction"}:
            data["summary"] = clean_field_value("summary", description) or description

    # Limpiar valores contaminados por texto de botones/enlaces.
    if data.get("voice_actress"):
        cleaned_voice = clean_voice_actress(data["voice_actress"])
        if cleaned_voice:
            data["voice_actress"] = cleaned_voice
        else:
            data.pop("voice_actress", None)

    if data.get("year"):
        data["year"] = re.sub(r"\s+year$", "", data["year"], flags=re.I).strip()

    if data.get("height"):
        data["height"] = re.sub(r"\s+", " ", data["height"]).strip()

    # Si un campo se obtuvo como etiqueta genérica, descartarlo.
    for key in ("summary", "introduction", "voice_actress", "school", "main_unit", "sub_unit"):
        value = data.get(key)
        if value and norm_label(value) in {
            "description", "summary", "introduction", "voice actress",
            "open voice actress", "school", "unit", "main unit", "sub unit",
        }:
            data.pop(key, None)

    data["idolst_url"] = url
    data["source"] = "Idol.st"

    if not data.get("name"):
        print(f"  [AVISO] No pude extraer el nombre de {url}", file=sys.stderr)
        return None

    return data


def main() -> int:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers.update(HEADERS)

    queue = [LIST_URL]
    visited_list_pages: set[str] = set()
    profile_urls: set[str] = set()

    print("1/2 - Buscando fichas en el catálogo de Idol.st...")
    while queue and len(visited_list_pages) < MAX_LIST_PAGES:
        page_url = queue.pop(0)
        if page_url in visited_list_pages:
            continue
        visited_list_pages.add(page_url)

        try:
            response = get_with_retries(session, page_url)
            soup = BeautifulSoup(response.text, "html.parser")
            before = len(profile_urls)
            profile_urls.update(profile_urls_from_listing(soup))
            for next_url in listing_next_urls(soup, page_url):
                if next_url not in visited_list_pages and next_url not in queue:
                    queue.append(next_url)
            print(
                f"  Catálogo {len(visited_list_pages)}: "
                f"+{len(profile_urls) - before} fichas (total {len(profile_urls)})"
            )
        except requests.RequestException as exc:
            print(f"  [AVISO] No se pudo leer {page_url}: {exc}", file=sys.stderr)
        time.sleep(DELAY_SECONDS)

    if not profile_urls:
        print(
            "No encontré fichas. Idol.st podría haber cambiado su HTML "
            "o estar bloqueando la petición."
        )
        return 1

    print(f"\n2/2 - Leyendo {len(profile_urls)} fichas (pausa de {DELAY_SECONDS}s)...")
    records = []
    ordered_urls = sorted(
        profile_urls,
        key=lambda u: int(re.search(r"/idol/(\d+)/", urlparse(u).path).group(1)),
    )

    for index, url in enumerate(ordered_urls, start=1):
        try:
            record = parse_profile(session, url)
            if record:
                records.append(record)
            print(f"  [{index}/{len(ordered_urls)}] {record.get('name') if record else 'Sin datos'}")
        except requests.RequestException as exc:
            print(f"  [ERROR] {url}: {exc}", file=sys.stderr)
        time.sleep(DELAY_SECONDS)

    # Deduplicar por URL y mantener el orden estable.
    unique = {}
    for item in records:
        unique[item["idolst_url"]] = item
    records = list(unique.values())

    payload = {
        "source": "Idol.st",
        "sourceUrl": LIST_URL,
        "generatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
        "count": len(records),
        "idols": records,
    }

    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\nListo: {len(records)} personajes guardados en:\n  {OUTPUT}")
    print("Nota: los campos que no aparecen en la ficha se dejan ausentes.")
    print("Revisa algunos perfiles en idols.json antes de usar los datos en React.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
