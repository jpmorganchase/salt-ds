import { FC, ReactElement, useState, Children } from "react";
import {
  List,
  SelectionChangeHandler,
  FormField,
  Dropdown,
} from "@salt-ds/lab";
import useIsMobileView from "../../utils/useIsMobileView";
import { formatComponentExampleName } from "./formatComponentExampleName";

import styles from "./ExamplesListView.module.css";

type ExamplesListViewProps = { examples: ReactElement[] };

const ExamplesListView: FC<ExamplesListViewProps> = ({ examples }) => {
  const examplesList: string[] = Children.map(examples, ({ props }) =>
    formatComponentExampleName(props.exampleName, props.displayName)
  );

  const [selectedItem, setSelectedItem] = useState<string | null>(
    examplesList[0]
  );

  const isMobileView = useIsMobileView();

  const handleSelect: SelectionChangeHandler = (_, selectedItem) => {
    setSelectedItem(selectedItem);
  };

  const examplesArray = Children.toArray(examples) as ReactElement[];

  const selectedExample: ReactElement =
    examplesArray.find(
      ({ props }) =>
        formatComponentExampleName(props.exampleName, props.displayName) ===
        selectedItem
    ) || examplesArray[0];

  const {
    props: { children: exampleCopy, ...restProps },
    ...rest
  } = selectedExample;

  const list = isMobileView ? (
    <FormField label="Select an example">
      <Dropdown
        source={examplesList}
        selected={selectedItem}
        onSelectionChange={handleSelect}
      />
    </FormField>
  ) : (
    <div className={styles.list}>
      <div className={styles.label}>
        <span>Select an example</span>
      </div>
      <List
        aria-label="Examples list"
        borderless
        source={examplesList}
        onSelect={handleSelect}
        selected={selectedItem}
      />
    </div>
  );

  const componentExample = {
    props: { list, ...restProps },
    ...rest,
  };

  return (
    <>
      {componentExample}
      {exampleCopy}
    </>
  );
};

export default ExamplesListView;
