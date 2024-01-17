import { CountryCode } from "@salt-ds/countries";

export const shortColorData = [
  "Baby blue",
  "Black",
  "Blue",
  "Brown",
  "Green",
  "Orange",
  "Pink",
  "Purple",
  "Red",
  "White",
  "Yellow",
];

export const citiesWithCountries = [
  {
    value: "Chicago",
    country: "US",
  },
  {
    value: "Miami",
    country: "US",
  },
  {
    value: "New York",
    country: "US",
  },
  {
    value: "Liverpool",
    country: "GB",
  },
  {
    value: "London",
    country: "GB",
  },
  {
    value: "Manchester",
    country: "GB",
  },
];

export type LargeCity = {
  name: string;
  countryCode: CountryCode;
};

export const largestCities: LargeCity[] = [
  { name: "Tokyo", countryCode: "JP" },
  { name: "Delhi", countryCode: "IN" },
  { name: "Shanghai", countryCode: "CN" },
  { name: "São Paulo", countryCode: "BR" },
  { name: "Mexico City", countryCode: "MX" },
  { name: "Cairo", countryCode: "EG" },
  { name: "Mumbai", countryCode: "IN" },
  { name: "Beijing", countryCode: "CN" },
  { name: "Dhaka", countryCode: "BD" },
  { name: "Osaka", countryCode: "JP" },
  { name: "New York City", countryCode: "US" },
  { name: "Karachi", countryCode: "PK" },
  { name: "Buenos Aires", countryCode: "AR" },
  { name: "Chongqing", countryCode: "CN" },
  { name: "Istanbul", countryCode: "TR" },
  { name: "Kolkata", countryCode: "IN" },
  { name: "Manila", countryCode: "PH" },
  { name: "Lagos", countryCode: "NG" },
  { name: "Rio de Janeiro", countryCode: "BR" },
  { name: "Tianjin", countryCode: "CN" },
];
