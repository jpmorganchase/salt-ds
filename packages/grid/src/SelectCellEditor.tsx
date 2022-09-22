import {
  isDesktop,
  makePrefixer,
  Portal,
  useFloatingUI,
  useForkRef,
  useId,
  useWindow,
} from "@jpmorganchase/uitk-core";
import { useEditorContext } from "./EditorContext";
import { Dropdown, List } from "@jpmorganchase/uitk-lab";
import { GridEditorProps } from "./GridColumn";
import "./SelectCellEditor.css";
import {
  FocusEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  flip,
  limitShift,
  shift,
  size,
} from "@floating-ui/react-dom-interactions";
import { GridColumnModel, GridRowModel } from "./Grid";

const withBaseName = makePrefixer("uitkGridSelectCellEditor");

export interface SelectCellEditorProps<T> {
  options: string[];
  row?: GridRowModel<T>;
  column?: GridColumnModel<T>;
}

export function SelectCellEditor<T>(props: SelectCellEditorProps<T>) {
  const { options, column, row } = props;
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const id = useId();
  const Window = useWindow();
  const value = column!.info.props.getValue!(row!.data);

  const [maxPopupHeight, setMaxPopupHeight] = useState<number | undefined>(
    undefined
  );

  const middleware = isDesktop
    ? []
    : [
        flip({
          fallbackPlacements: ["bottom-start", "top-start"],
        }),
        shift({ limiter: limitShift() }),
        size({
          apply({ availableHeight }) {
            setMaxPopupHeight(availableHeight);
          },
        }),
      ];

  const placement = "bottom-start";

  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement,
    middleware,
  });

  const windowRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const floatingWindowRef = useForkRef<HTMLDivElement>(windowRef, floating);
  const forkedValueRef = useForkRef<HTMLDivElement>(valueRef, reference);

  const { endEditMode, cancelEditMode } = useEditorContext();

  const onKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === "Enter") {
      // endEditMode();
      cancelEditMode(); // TODO
      event.preventDefault();
      event.stopPropagation();
    }
    if (event.key === "Escape") {
      cancelEditMode();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onBlur: FocusEventHandler<HTMLDivElement> = (event) => {
    console.log(`Dropdown blur`);
    // endEditMode();
    cancelEditMode(); // TODO
  };

  const onSelect = (event: any, item: string) => {
    endEditMode(item);
  };

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!windowRef.current || !windowRef.current.contains(target)) {
        if (!valueRef.current || !valueRef.current.contains(target)) {
          // endEditMode();
          cancelEditMode();
        }
      }
    };
    document.body.addEventListener("mousedown", onMouseDown, true);
    return () => {
      document.body.removeEventListener("mousedown", onMouseDown, true);
    };
  }, [endEditMode]);

  return (
    <td className={withBaseName()}>
      <div className={withBaseName("selectContainer")}>
        <div className={withBaseName("currentValue")} ref={forkedValueRef}>
          {value}
        </div>
        {isOpen && (
          <Portal>
            <Window
              className={withBaseName("window")}
              id={`${id}-window`}
              style={{
                top: y ?? "",
                left: x ?? "",
                position: strategy,
              }}
              ref={floatingWindowRef}
            >
              <List source={options} onSelect={onSelect} />
            </Window>
          </Portal>
        )}
      </div>
    </td>
  );
}
