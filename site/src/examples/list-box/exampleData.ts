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

export const shortColorWithHex = [
  { color: "Baby blue", hex: "#89CFF0" },
  { color: "Black", hex: "#000000" },
  { color: "Blue", hex: "#0000FF" },
  { color: "Brown", hex: "#A52A2A" },
  { color: "Green", hex: "#008000" },
  { color: "Orange", hex: "#FFA500" },
  { color: "Pink", hex: "#FFC0CB" },
  { color: "Purple", hex: "#800080" },
  { color: "Red", hex: "#FF0000" },
  { color: "White", hex: "#FFFFFF" },
  { color: "Yellow", hex: "#FFFF00" },
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
