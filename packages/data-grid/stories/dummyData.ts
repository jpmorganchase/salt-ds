import { faker } from "@faker-js/faker";
import { Collection } from "@msw/data";
import * as Yup from "yup";
import type { RowKeyGetter } from "../src";

faker.seed(5417);

export interface Investor {
  id: string;
  name: string;
  location: string;
  strategy: string[];
  cohort: string[];
  amount: number;
  date?: string;
}

export const investorKeyGetter = (rowData: Investor) => rowData.id;

export const allLocations = [
  "New York, NY",
  "Jersey City, NJ",
  "Boston, MA",
  "San Francisco, CA",
];

const fruits = [
  "Apple",
  "Orange",
  "Dragonfruit",
  "Coffee",
  "Fig",
  "Grape",
  "Hazelnut",
];
const types = ["Investment", "Venture Capital", "Private Wealth"];
const suffixes = ["", "Inc."];

const strategies = [
  ["FO"],
  ["PE"],
  ["VC"],
  ["FO", "PE"],
  ["FO", "PE", "VC"],
  ["VC", "PE"],
];
const cohorts = [
  ["Potential Leads"],
  ["Top VCs"],
  ["Potential Leads", "Top VCs"],
];

export const investors = new Collection({
  schema: Yup.object({
    id: Yup.string(),
    name: Yup.string(),
    location: Yup.string(),
    cohort: Yup.array(Yup.string()),
    strategy: Yup.array(Yup.string()),
    amount: Yup.string(),
    score: Yup.string(),
    date: Yup.string().datetime(),
  }),
});

// Create 2000 investors
await investors.createMany(2000, () => ({
  id: faker.string.uuid(),
  name: `${faker.helpers.arrayElement(fruits)} ${faker.helpers.arrayElement(
    types,
  )} ${faker.helpers.arrayElement(suffixes)}`,
  location: faker.helpers.arrayElement(allLocations),
  cohort: faker.helpers.arrayElement(cohorts),
  strategy: faker.helpers.arrayElement(strategies),
  amount: faker.finance.amount(100, 300, 4),
  date: faker.date
    .between({ from: "2000-01-01", to: "2020-12-31" })
    .toISOString(),
}));

export const createDummyInvestors = ({ limit }: { limit?: number } = {}) => {
  return investors.findMany(undefined, {
    take: limit ?? 50,
  }) as unknown as Investor[];
};

export interface DummyRow {
  id: string;
  a: string;
  b: number;
  c: string;
}

export const dummyRowKeyGetter: RowKeyGetter<DummyRow> = (r) => r.id;

export const rowData: DummyRow[] = Array.from({ length: 50 }, (_, i) => ({
  id: `Row${i}`,
  a: `A${i}`,
  b: i * 100,
  c: `C${i}`,
}));
