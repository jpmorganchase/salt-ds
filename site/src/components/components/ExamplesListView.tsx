import { FC, ReactElement, useState, Children } from "react";
import {
  List,
  SelectionChangeHandler,
  FormField,
  Dropdown,
} from "@salt-ds/lab";
import useIsMobileView from "../../utils/useIsMobileView";
import { Heading3 } from "../mdx/h3";
import { formatComponentExampleName } from "./formatComponentExampleName";

import styles from "./ExamplesListView.module.css";

type ExamplesListViewProps = { examples: ReactElement[] };

const ExamplesListView: FC<ExamplesListViewProps> = ({ examples }) => {
  const examplesList: string[] = Children.map(examples, ({ props }) =>
    props.title ? props.title : props.exampleName
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
    examplesArray.find(({ props }) => props.exampleName === selectedItem) ||
    examplesArray[0];

  const {
    props: { children: exampleCopy, title, exampleName, ...restProps },
    ...rest
  } = selectedExample;

  const list = isMobileView ? (
    <FormField label="Select an example">
      <Dropdown
        defaultSelected={examplesList[0]}
        source={examplesList}
        selected={selectedItem}
        onSelectionChange={handleSelect}
        itemToString={(item) => formatComponentExampleName(item)}
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
        defaultSelected={examplesList[0]}
        itemToString={(item) => formatComponentExampleName(item)}
      />
    </div>
  );

  const componentExample = {
    props: { list, exampleName, ...restProps },
    ...rest,
  };

  return (
    <>
      {componentExample}
      <Heading3>
        {title ? title : formatComponentExampleName(exampleName)}
      </Heading3>
      {exampleCopy}
    </>
  );
};

export default ExamplesListView;
