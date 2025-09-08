type PlanetData = {
  planet: string;
  type: string;
  average_au: number;
  diameter_km: number;
  moons: number;
  atmosphere: string;
};

export const planetData: PlanetData[] = [
  {
    planet: "Mercury",
    type: "Terrestrial",
    average_au: 0.39,
    diameter_km: 4879,
    moons: 0,
    atmosphere:
      "Negligible, consisting mainly of traces of sodium, potassium, and helium.",
  },
  {
    planet: "Venus",
    type: "Terrestrial",
    average_au: 0.72,
    diameter_km: 12104,
    moons: 0,
    atmosphere: "96.5% Carbon Dioxide, 3.5% Nitrogen.",
  },
  {
    planet: "Earth",
    type: "Terrestrial",
    average_au: 1.0,
    diameter_km: 12756,
    moons: 1,
    atmosphere: "78% Nitrogen, 21% Oxygen.",
  },
  {
    planet: "Mars",
    type: "Terrestrial",
    average_au: 1.52,
    diameter_km: 6792,
    moons: 2,
    atmosphere: "95.1% Carbon Dioxide, 2.6% Nitrogen.",
  },
  {
    planet: "Jupiter",
    type: "Gas Giant",
    average_au: 5.2,
    diameter_km: 142984,
    moons: 95,
    atmosphere: "90% Hydrogen, 10% Helium.",
  },
  {
    planet: "Saturn",
    type: "Gas Giant",
    average_au: 9.58,
    diameter_km: 120536,
    moons: 146,
    atmosphere: "96.3% Hydrogen, 3.25% Helium.",
  },
  {
    planet: "Uranus",
    type: "Ice Giant",
    average_au: 19.2,
    diameter_km: 51118,
    moons: 27,
    atmosphere: "82.5% Hydrogen, 15.2% Helium, 2.3% Methane.",
  },
  {
    planet: "Neptune",
    type: "Ice Giant",
    average_au: 30.05,
    diameter_km: 49528,
    moons: 14,
    atmosphere: "80% Hydrogen, 19% Helium, 1% Methane.",
  },
];

export const planetDataColumns: {
  key: keyof PlanetData;
  title: string;
  type: "string" | "number";
}[] = [
  { key: "planet", title: "Planet", type: "string" },
  { key: "type", title: "Type", type: "string" },
  { key: "average_au", title: "Distance from Sun (AU)", type: "number" },
  { key: "diameter_km", title: "Diameter (km)", type: "number" },
  { key: "moons", title: "Moons", type: "number" },
  {
    key: "atmosphere",
    title: "Primary atmospheric components",
    type: "string",
  },
];

export const planetDataDisclaimer =
  "Note: The number of moons for Jupiter and Saturn are based on 2023 estimates, whi can fluctuate as new discoveries are made.";

export const termDefinitions = [
  {
    term: "Terrestrial planets",
    definition:
      "Planets with a solid, rocky, or metallic surface, similar to Earth. These are the inner, denser planets of the solar system.",
  },
  {
    term: "Gas Giants",
    definition:
      "Large planets composed primarily of the light gases hydrogen and helium, and lacking a solid surface. Jupiter and Saturn are the gas giants of our solar system.",
  },
  {
    term: "Ice Giants",
    definition:
      'A class of giant planets, distinct from gas giants, composed primarily of heavier, volatile elements such as oxygen, carbon, nitrogen, and sulfur (often referred to as "ices"). Uranus and Neptune are the ice giants of our solar system.',
  },
  {
    term: "Astronomical Unit (AU)",
    definition:
      "A unit of length used for measuring distances within the solar system. One AU is defined as the average distance between the Earth and the Sun, which is approximately 150 million kilometers (or 93 million miles).",
  },
  {
    term: "Diameter (km)",
    definition:
      "The width of the planet measured in kilometers. This is often the equatorial diameter.",
  },
  {
    term: "Moons",
    definition:
      "Natural satellites that orbit a planet. The number of moons for the outer planets can change as new ones are discovered.",
  },
  {
    term: "Primary atmospheric components",
    definition:
      "The main gases that make up the planet's atmosphere. This includes the major gases, such as nitrogen on Earth or hydrogen on Jupiter.",
  },
];
