import { ICellEditorParams } from "ag-grid-community";
import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { Dropdown } from "@jpmorganchase/uitk-lab";
import { SelectHandler } from "@jpmorganchase/uitk-lab/src/common-hooks";

type SourceItem = {
  value: number;
  text: string;
  id: number;
};

const generateSourceItems: () => SourceItem[] = () =>
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => ({
    value: k * 10,
    text: `Option ${k}`,
    id: k,
  }));

function ownerDocument(node: HTMLElement | null) {
  return (node && node.ownerDocument) || document;
}

const RatingDropdown = forwardRef<HTMLDivElement, ICellEditorParams>(
  function RatingDropdown(props, ref) {
    const source = generateSourceItems();
    const previousActiveElement = useRef<HTMLElement | null>(null);

    const [selectedItem, setSelectedItem] = useState<SourceItem>(
      source.find((item) => item.value === props.value) || source[0]
    );

    const [selectionMade, setSelectionMade] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const focusDropdown = () => {
      /* In order for the component to receive focus it must be deferred to the next frame */
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.focus();
        }
      });
    };

    useEffect(() => {
      previousActiveElement.current = ownerDocument(buttonRef.current)
        .activeElement as HTMLElement;
      focusDropdown();
    }, []);

    useEffect(() => {
      if (selectionMade) {
        console.log(`Rating changed to ${selectedItem.value}`);

        /* Refocus the cell renderer before we remove the editor for keyboard usage */
        previousActiveElement.current?.focus();
        props.api?.stopEditing();
      }
    }, [props.api, selectedItem, selectionMade]);

    /**
     * Required by ag-grid, refer to ag-grid docs for details
     * https://www.ag-grid.com/react-grid/component-cell-editor/
     */
    // useImperativeHandle(ref, () => ({
    //   getValue: () => selectedItem.value,
    //   isPopup: () => true,
    //   isCancelAfterEnd: () => false,
    // }));

    const itemToString = ({ text }: SourceItem) => text;

    const onSelect: SelectHandler<SourceItem> = (_event, item) => {
      setSelectedItem(item as SourceItem);
      setSelectionMade(true);
    };

    const { column } = props;

    return (
      <Dropdown
        disablePortal={true}
        ref={buttonRef}
        defaultIsOpen
        defaultSelected={selectedItem}
        itemToString={itemToString}
        onSelect={onSelect}
        source={source}
        width={column.getActualWidth()}
      />
    );
  }
);

export default RatingDropdown;
