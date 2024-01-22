import "@salt-ds/countries/saltCountries.css";

const code = "AD" as const;

export const CssClassName = () => <div className={`saltCountry-${code}`} />;
