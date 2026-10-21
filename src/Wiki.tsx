import { useEffect, useMemo, useState } from "react";
import idolsData from "../content/Wiki/idols.json";
import wikiConfig from "./content/Wiki/wikiConfig.json";
import "./Wiki.css";

type Idol = {
  name?: string;
  [key: string]: unknown;
};

type WikiGroup = {
  name: string;
  label: string;
  order: number;
  characters: string[];
};

type WikiConfiguration = {
  groups: WikiGroup[];
  characterDisplay: {
    order: string[];
    hidden: string[];
  };
  sorting: {
    mode: string;
    showUnlistedCharacters: boolean;
  };
};

const idols = idolsData.idols as Idol[];
const config = wikiConfig as WikiConfiguration;

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  japanese_name: "Nombre japonés",
  summary: "Descripción",
  school: "Escuela",
  main_unit: "Grupo principal",
  sub_unit: "Subgrupo",
  year: "Año escolar",
  age: "Edad",
  birthday: "Cumpleaños",
  blood: "Tipo de sangre",
  height: "Estatura",
  favorite_food: "Comida favorita",
  least_favorite_food: "Comida menos favorita",
  hobbies: "Pasatiempos",
};

function normalizeName(value: unknown): string {
  return String(value ?? "")
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase();
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(displayValue).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(displayValue)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  return String(value);
}

function getCharacterName(idol: Idol): string {
  return String(idol.name ?? "");
}

function getCharacterImage(idol: Idol): string {
  const possibleFields = [
    "image",
    "image_url",
    "photo",
    "picture",
    "portrait",
  ];

  for (const field of possibleFields) {
    const value = idol[field];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sortCharacters(characters: Idol[]): Idol[] {
  const mode = config.sorting.mode.toLowerCase();

  if (
    mode === "alphabetical" ||
    mode === "alphabetic" ||
    mode === "alpha" ||
    mode === "name"
  ) {
    return [...characters].sort((a, b) =>
      getCharacterName(a).localeCompare(getCharacterName(b), "es")
    );
  }

  // En modo custom, conserva el orden definido por la configuración.
  return characters;
}

function getConfiguredGroups(): WikiGroup[] {
  const groups = [...config.groups].sort(
    (a, b) => a.order - b.order
  );

  if (!config.sorting.showUnlistedCharacters) {
    return groups;
  }

  return groups.map((group) => {
    const configuredNames = new Set(
      group.characters.map(normalizeName)
    );

    const additionalNames = idols
      .filter(
        (idol) =>
          normalizeName(idol.main_unit) === normalizeName(group.name) &&
          !configuredNames.has(normalizeName(idol.name))
      )
      .map(getCharacterName)
      .filter(Boolean);

    return {
      ...group,
      characters: [...group.characters, ...additionalNames],
    };
  });
}

export default function Wiki() {
  const groups = useMemo(() => getConfiguredGroups(), []);

  const charactersByGroup = useMemo(() => {
    return groups.map((group) => {
      const characters = group.characters
        .map((characterName) =>
          idols.find(
            (idol) =>
              normalizeName(idol.name) === normalizeName(characterName)
          )
        )
        .filter((idol): idol is Idol => Boolean(idol));

      return {
        ...group,
        characters: sortCharacters(characters),
      };
    });
  }, [groups]);

  const visibleGroups = charactersByGroup.filter(
    (group) => group.characters.length > 0
  );

  const [activeGroupName, setActiveGroupName] = useState(
    visibleGroups[0]?.name ?? ""
  );

  const activeGroup = visibleGroups.find(
    (group) => group.name === activeGroupName
  ) ?? visibleGroups[0];

  const [selectedCharacterName, setSelectedCharacterName] = useState(
    activeGroup?.characters[0]
      ? getCharacterName(activeGroup.characters[0])
      : ""
  );

  useEffect(() => {
    if (!activeGroup) {
      setSelectedCharacterName("");
      return;
    }

    const characterStillExists = activeGroup.characters.some(
      (idol) =>
        normalizeName(idol.name) === normalizeName(selectedCharacterName)
    );

    if (!characterStillExists) {
      setSelectedCharacterName(
        getCharacterName(activeGroup.characters[0] ?? {})
      );
    }
  }, [activeGroup, selectedCharacterName]);

  const selectedCharacter =
    activeGroup?.characters.find(
      (idol) =>
        normalizeName(idol.name) === normalizeName(selectedCharacterName)
    ) ?? activeGroup?.characters[0];

  const hiddenFields = new Set(config.characterDisplay.hidden);
  const orderedFields = config.characterDisplay.order.filter(
    (field) => !hiddenFields.has(field)
  );

  const profileFields = orderedFields
    .filter((field) => field !== "name")
    .map((field) => ({
      key: field,
      label: getFieldLabel(field),
      value: selectedCharacter
        ? displayValue(selectedCharacter[field])
        : "",
    }))
    .filter(({ value }) => value !== "");

  const image = selectedCharacter
    ? getCharacterImage(selectedCharacter)
    : "";

  function selectGroup(groupName: string) {
    const nextGroup = visibleGroups.find(
      (group) => group.name === groupName
    );

    setActiveGroupName(groupName);
    setSelectedCharacterName(
      nextGroup?.characters[0]
        ? getCharacterName(nextGroup.characters[0])
        : ""
    );
  }

  if (visibleGroups.length === 0 || !selectedCharacter) {
    return (
      <main className="wiki">
        <section className="wiki-empty">
          <p>
            No hay personajes para mostrar. Revisa los nombres de
            <code> wikiConfig.json </code>
            y comprueba que existan en
            <code> idols.json </code>.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="wiki">
      <header className="wiki-header">

        <nav className="wiki-groups" aria-label="Grupos">
          {visibleGroups.map((group) => (
            <button
              key={group.name}
              type="button"
              className={`wiki-group-button ${
                activeGroup?.name === group.name ? "is-active" : ""
              }`}
              onClick={() => selectGroup(group.name)}
              aria-pressed={activeGroup?.name === group.name}
            >
              {group.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="wiki-content">
        

        <article className="wiki-profile" key={String(selectedCharacter.name)}>
          <div className="wiki-profile-image">
            {image ? (
              <img
                src={image}
                alt={getCharacterName(selectedCharacter)}
                loading="lazy"
              />
            ) : (
              <div className="wiki-image-placeholder">
                <span>{getCharacterName(selectedCharacter).slice(0, 1)}</span>
              </div>
            )}
          </div>

          <div className="wiki-profile-details">
            <div className="wiki-profile-heading">
              <span className="wiki-profile-group">
                {activeGroup?.label}
              </span>

              <h2>{getCharacterName(selectedCharacter)}</h2>

              {orderedFields.includes("japanese_name") &&
                displayValue(selectedCharacter.japanese_name) && (
                  <p className="wiki-japanese-name">
                    {displayValue(selectedCharacter.japanese_name)}
                  </p>
                )}
            </div>

            <div className="wiki-profile-fields">
              {profileFields.map((field) => (
                <section
                  className={`wiki-field ${
                    field.key === "summary" ? "wiki-field-summary" : ""
                  }`}
                  id={`wiki-field-${field.key}`}
                  key={field.key}
                >
                  <h3>{field.label}</h3>
                  <p>{field.value}</p>
                </section>
              ))}
            </div>
          </div>
        </article>
      </section>

      <footer className="wiki-character-footer">
        <div className="wiki-character-footer-heading">
          <span>PERSONAJES</span>
          <span className="wiki-character-count">
            {activeGroup?.characters.length ?? 0}
          </span>
        </div>

        <nav
          className="wiki-character-list"
          aria-label="Seleccionar personaje"
        >
          {(activeGroup?.characters ?? []).map((idol) => {
            const name = getCharacterName(idol);
            const isSelected =
              normalizeName(name) === normalizeName(selectedCharacter.name);
            const characterImage = typeof idol.simbol === "string" ? idol.simbol : "";

            return (
              <button
                className={`wiki-character-button ${
                  isSelected ? "is-active" : ""
                }`}
                key={name}
                type="button"
                onClick={() => setSelectedCharacterName(name)}
                aria-pressed={isSelected}
                title={name}
              >
                <span className="wiki-character-avatar">
                  {characterImage ? (
                    <img src={characterImage} alt="" loading="lazy" />
                  ) : (
                    <span>{name.slice(0, 1)}</span>
                  )}
                </span>

                <span className="wiki-character-name">{name}</span>
              </button>
            );
          })}
        </nav>
      </footer>
    </main>
  );
}
