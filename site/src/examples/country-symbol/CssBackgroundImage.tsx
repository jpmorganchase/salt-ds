import "@salt-ds/countries/saltCountries.css";

const code = "AD" as const;

export const CssBackgroundImage = () => (
  <div className={`saltCountry-${code}`} />
);
