
import "./KotoriApiTest.css";
import { useEffect, useState } from "react";

const API_URL =
  "https://schoolido.lu/api/idols/Minami%20Kotori/";

interface Idol {
  name: string;
  japanese_name?: string;
  age?: number;
  school?: string;
  birthday?: string;
  astrological_sign?: string;
  blood?: string;
  height?: number;
  favorite_food?: string;
  least_favorite_food?: string;
  hobbies?: string;
  main_unit?: string;
  sub_unit?: string;
  year?: string;
  attribute?: string;
  summary?: string;
  chibi?: string;
  chibi_small?: string;
  website_url?: string;
}

export default function KotoriApiTest() {
  const [idol, setIdol] = useState<Idol | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadIdol() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `La API respondió con HTTP ${response.status}`
          );
        }

        const data: Idol = await response.json();
        setIdol(data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo conectar con SchoolIdolAPI."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadIdol();

    return () => controller.abort();
  }, []);

  if (loading) {
    return <section className="kotori-api">
      <p>Conectando con SchoolIdolAPI...</p>
    </section>;
  }

  if (error) {
    return (
      <section className="kotori-api">
        <h2>Prueba de SchoolIdolAPI</h2>
        <p className="api-error">Error: {error}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
        <a href={API_URL} target="_blank" rel="noreferrer">
          Abrir endpoint directamente
        </a>
      </section>
    );
  }

  if (!idol) return <p>No se recibieron datos.</p>;

  return (
    <section className="kotori-api">
      <header className="kotori-api__header">
        <div>
          <p className="kotori-api__eyebrow">
            SCHOOL IDOL API · TEST
          </p>
          <h2>{idol.name}</h2>
          {idol.japanese_name && (
            <p>{idol.japanese_name}</p>
          )}
        </div>

        {idol.chibi && (
          <img
            className="kotori-api__avatar"
            src={idol.chibi}
            alt={idol.name}
          />
        )}
      </header>

      <p className="api-success">
        Conexión correcta: personaje recibido desde la API.
      </p>

      <dl className="kotori-api__data">
        <dt>Edad</dt>
        <dd>{idol.age ?? "Sin datos"}</dd>

        <dt>Escuela</dt>
        <dd>{idol.school ?? "Sin datos"}</dd>

        <dt>Cumpleaños</dt>
        <dd>{idol.birthday ?? "Sin datos"}</dd>

        <dt>Signo zodiacal</dt>
        <dd>{idol.astrological_sign ?? "Sin datos"}</dd>

        <dt>Tipo de sangre</dt>
        <dd>{idol.blood ?? "Sin datos"}</dd>

        <dt>Altura</dt>
        <dd>
          {idol.height != null
            ? `${idol.height} cm`
            : "Sin datos"}
        </dd>

        <dt>Unidad</dt>
        <dd>{idol.main_unit ?? "Sin datos"}</dd>

        <dt>Subunidad</dt>
        <dd>{idol.sub_unit ?? "Sin datos"}</dd>

        <dt>Año escolar</dt>
        <dd>{idol.year ?? "Sin datos"}</dd>

        <dt>Comida favorita</dt>
        <dd>{idol.favorite_food ?? "Sin datos"}</dd>

        <dt>Aficiones</dt>
        <dd>{idol.hobbies ?? "Sin datos"}</dd>
      </dl>

      {idol.summary && (
        <div className="kotori-api__summary">
          <h3>Descripción</h3>
          <p>{idol.summary}</p>
        </div>
      )}

      {idol.website_url && (
        <a
          href={idol.website_url}
          target="_blank"
          rel="noreferrer"
        >
          Ver ficha original
        </a>
      )}

      <details>
        <summary>Ver JSON recibido</summary>
        <pre>{JSON.stringify(idol, null, 2)}</pre>
      </details>
    </section>
  );
}
