import { ColumnDefinition, GridModel } from "../../grid";

interface DummyData {
  key: string;
  city: string;
  country: string;
  population: number;
}

const dummyColumnDefinitions: ColumnDefinition<DummyData>[] = [
  {
    key: "col_city",
    width: 200,
    title: "City",
  },
  {
    key: "col_country",
    width: 200,
    title: "Country",
  },
  {
    key: "col_population",
    width: 200,
    title: "Population",
  },
];

describe("GridModel", () => {
  it("Should calculate visible columns and groups", () => {
    const model = new GridModel<DummyData>((x) => x.key);
    //model.
    model.setColumnDefinitions(dummyColumnDefinitions);
  });
});
