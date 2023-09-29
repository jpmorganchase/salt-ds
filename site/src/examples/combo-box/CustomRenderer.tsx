import { ReactElement, Suspense } from "react";
import { ComboBoxNext, Highlighter, ListItemNext } from "@salt-ds/lab";
import { largestCities } from "./exampleData";
import { ComboBoxItemProps } from "@salt-ds/lab/src/combo-box-next/utils";
import { LazyCountrySymbol } from "@salt-ds/countries";

const CustomListItem = ({
  value,
  matchPattern,
  onMouseDown,
  ...rest
}: ComboBoxItemProps<any>) => {
  return (
    <ListItemNext value={value.name} onMouseDown={onMouseDown} {...rest}>
      <Suspense fallback={null}>
        <LazyCountrySymbol code={value.countryCode} />
      </Suspense>
      <Highlighter matchPattern={matchPattern} text={value.name} />
    </ListItemNext>
  );
};

const customMatchPattern = (
  input: { name: string; countryCode: string },
  filterValue: string
) => {
  return (
    input.name.toLowerCase().includes(filterValue.toLowerCase()) ||
    filterValue === input.countryCode
  );
};

const customItemFilter = (source: any[], filterValue?: string) =>
  source.filter((item) =>
    !filterValue ? item : customMatchPattern(item, filterValue)
  );

export const CustomRenderer = (): ReactElement => {
  return (
    <ComboBoxNext
      style={{ width: "266px" }}
      source={largestCities}
      ListItem={CustomListItem}
      itemFilter={customItemFilter}
    />
  );
};
