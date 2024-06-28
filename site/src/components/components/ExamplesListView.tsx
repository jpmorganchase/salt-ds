import {
  FC,
  ReactElement,
  useState,
  Children,
  useEffect,
  useMemo,
  SyntheticEvent,
} from "react";
import {
  ListBox,
  Option,
  Dropdown,
  FormField,
  FormFieldLabel,
} from "@salt-ds/core";
import useIsMobileView from "../../utils/useIsMobileView";
import { formatComponentExampleName } from "./formatComponentExampleName";

import styles from "./ExamplesListView.module.css";
import { useParams } from "next/navigation";

type ExamplesListViewProps = { examples: ReactElement[] };

function exampleNameToHash(exampleName: string) {
  return exampleName.toLowerCase().replaceAll(" ", "-");
}

const ExamplesListView: FC<ExamplesListViewProps> = ({ examples }) => {
  const params = useParams();

  const examplesList: string[] = useMemo(
    () =>
      Children.map(examples, ({ props }) =>
        formatComponentExampleName(props.exampleName, props.displayName)
      ),
    [examples]
  );

  const [selectedItem, setSelectedItem] = useState<string[]>([]);

  useEffect(() => {
    // window.location.hash could be #hash?query=string and we only want the #hash part.
    const hash = window.location.hash.substring(1).split("?")[0];
    const exampleInHash = examplesList.find(
      (example) => exampleNameToHash(example) === hash
    );
    setSelectedItem((old) => {
      if (exampleInHash) {
        return [exampleInHash];
      }

      return [examplesList[0]];
    });
  }, [examplesList, params]);

  const isMobileView = useIsMobileView();

  const handleSelectionChange = (_: SyntheticEvent, newSelected: string[]) => {
    const selectedItem = newSelected[0];
    setSelectedItem(newSelected);

    if (selectedItem) {
      const hash = `#${exampleNameToHash(selectedItem)}`;
      window.history.pushState(null, "", hash);
    }
  };

  const examplesArray = Children.toArray(examples) as ReactElement[];

  const selectedExample: ReactElement =
    examplesArray.find(
      ({ props }) =>
        formatComponentExampleName(props.exampleName, props.displayName) ===
        selectedItem[0]
    ) || examplesArray[0];

  const {
    props: { children: exampleCopy, ...restProps },
    ...rest
  } = selectedExample;

  const list = isMobileView ? (
    <Dropdown
      aria-label="Select an example"
      selected={selectedItem}
      onSelectionChange={handleSelectionChange}
    >
      {examplesList.map((example) => (
        <Option value={example} key={example} />
      ))}
    </Dropdown>
  ) : (
    <div className={styles.list}>
      <div className={styles.label}>
        <span>Select an example</span>
      </div>
      <ListBox
        className={styles.exampleList}
        aria-label="Examples list"
        onSelectionChange={handleSelectionChange}
        selected={selectedItem}
      >
        {examplesList.map((example) => (
          <Option value={example} key={example} />
        ))}
      </ListBox>
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
