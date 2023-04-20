import { factory, primaryKey } from "@mswjs/data";
import { faker } from "@faker-js/faker";
import { RowKeyGetter } from "../src";

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

export const db = factory({
  investor: {
    id: primaryKey(faker.datatype.uuid),
    name: () =>
      `${faker.helpers.arrayElement(fruits)} ${faker.helpers.arrayElement(
        types
      )} ${faker.helpers.arrayElement(suffixes)}`,
    location: () => faker.helpers.arrayElement(allLocations),
    cohort: () => faker.helpers.arrayElement(cohorts),
    strategy: () => faker.helpers.arrayElement(strategies),
    amount: () => faker.finance.amount(100, 300, 4),
    score: () => "",
    date: () =>
      faker.date
        .between("2000-01-01", "2020-12-31")
        .toISOString()
        .substring(0, 10),
  },
});

// Create 50 investors
Array.from({ length: 2000 }).forEach(() => db.investor.create());

export const createDummyInvestors = ({ limit }: { limit?: number } = {}) => {
  return db.investor.findMany({ take: limit ?? 50 }) as unknown as Investor[];
};

export interface DummyRow {
  id: string;
  a: string;
  b: number;
  c: string;
}

export const dummyRowKeyGetter: RowKeyGetter<DummyRow> = (r) => r.id;

export const rowData: DummyRow[] = [...new Array(50)].map((_, i) => ({
  id: `Row${i}`,
  a: `A${i}`,
  b: i * 100,
  c: `C${i}`,
}));
