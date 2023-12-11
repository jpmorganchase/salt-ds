import {
  FC,
  ReactElement,
  useState,
  Children,
  useEffect,
  useMemo,
} from "react";
import {
  List,
  SelectionChangeHandler,
  FormField,
  Dropdown,
} from "@salt-ds/lab";
import useIsMobileView from "../../utils/useIsMobileView";
import { formatComponentExampleName } from "./formatComponentExampleName";

import styles from "./ExamplesListView.module.css";
import { useParams, useRouter } from "next/navigation";

type ExamplesListViewProps = { examples: ReactElement[] };

function exampleNameToHash(exampleName: string) {
  return exampleName.toLowerCase().replaceAll(" ", "-");
}

const ExamplesListView: FC<ExamplesListViewProps> = ({ examples }) => {
  const params = useParams();
  const router = useRouter();

  const examplesList: string[] = useMemo(
    () =>
      Children.map(examples, ({ props }) =>
        formatComponentExampleName(props.exampleName, props.displayName)
      ),
    [examples]
  );

  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    // window.location.hash could be #hash?query=string and we only want the #hash part.
    const hash = window.location.hash.substring(1).split("?")[0];
    const exampleInHash = examplesList.find(
      (example) => exampleNameToHash(example) === hash
    );
    setSelectedItem(exampleInHash ?? examplesList[0]);
  }, [examplesList, params]);

  const isMobileView = useIsMobileView();

  const handleSelect: SelectionChangeHandler = (_, selectedItem) => {
    setSelectedItem(selectedItem);
    if (selectedItem) {
      const hash = `#${exampleNameToHash(selectedItem)}`;
      if (window.history.pushState) {
        window.history.pushState(null, "", hash);
      } else {
        window.location.hash = hash;
      }
    }
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
