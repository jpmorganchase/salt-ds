import { Dropdown } from "@jpmorganchase/uitk-lab";
import "./TextColumnFilter.css";
import {
  FlexLayout,
  makePrefixer,
  FormField,
  Input,
} from "@jpmorganchase/uitk-core";
import { TextColumnFilterModel } from "./TextColumnFilterModel";

const withBaseName = makePrefixer("uitkDataGridTextColumnFilter");

export interface TextColumnFilterProps {
  model: TextColumnFilterModel;
}

export const TextColumnFilter = function TextColumnFilter(
  props: TextColumnFilterProps
) {
  const { model } = props;
  const operations = model.operations;
  const selectedOperation = model.useOperation();
  const onOperationChange = (event: any, item: string | null) => {
    if (item) {
      model.setOperation(item);
    }
  };
  const query = model.useQuery();
  const onQueryChange = (event: any, value: string) => {
    model.setQuery(value);
  };
  return (
    <div className={withBaseName()}>
      <FlexLayout direction={"column"}>
        <Dropdown
          source={operations}
          onSelectionChange={onOperationChange}
          selected={selectedOperation}
        />
        <FormField>
          <Input
            placeholder="Filter query"
            value={query}
            onChange={onQueryChange}
          />
        </FormField>
        {/*<RadioButtonGroup row={true} defaultValue="and">*/}
        {/*  <RadioButton key="and" label="And" value="and" />*/}
        {/*  <RadioButton key="or" label="Or" value="or" />*/}
        {/*</RadioButtonGroup>*/}
      </FlexLayout>
    </div>
  );
};
