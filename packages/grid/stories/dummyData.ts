import { randomAmount, randomDate } from "./utils";
import { RowKeyGetter } from "../src";

export interface Investor {
  name: string;
  addedInvestors: string[];
  location: string;
  strategy: string[];
  cohort: string[];
  notes: string;
  amount: number;
  score?: string;
  date: string;
}

export const investorKeyGetter = (rowData: Investor) => rowData.name;

export const allLocations = [
  "New York, NY",
  "Jersey City, NJ",
  "Boston, MA",
  "San Francisco, CA",
];

export function createDummyInvestors(): Investor[] {
  const a = [
    "Apple",
    "Orange",
    "Dragonfruit",
    "Coffee",
    "Fig",
    "Grape",
    "Hazelnut",
  ];
  const b = ["Investment", "Venture Capital", "Private Wealth"];
  const c = ["", "Inc."];
  const str = [
    ["FO"],
    ["PE"],
    ["VC"],
    ["FO", "PE"],
    ["FO", "PE", "VC"],
    ["VC", "PE"],
  ];
  const coh = [
    ["Potential Leads"],
    ["Top VCs"],
    ["Potential Leads", "Top VCs"],
  ];

  const investors: Investor[] = [];
  let i = 0;
  for (const x of a) {
    for (const y of b) {
      for (const z of c) {
        investors.push({
          name: [x, y, z].join(" "),
          addedInvestors: [],
          location: allLocations[i % allLocations.length],
          cohort: coh[i % coh.length],
          strategy: str[i % str.length],
          notes: "",
          amount: randomAmount(100, 300, 4),
          date: randomDate(new Date(2000, 0, 1), new Date())
            .toISOString()
            .substring(0, 10),
        });
        ++i;
      }
    }
  }

  return investors;
}

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
