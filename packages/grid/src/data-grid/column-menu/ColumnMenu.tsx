import {
  Card,
  makePrefixer,
  Portal,
  useFloatingUI,
  useWindow,
  useId,
} from "@jpmorganchase/uitk-core";
import "./ColumnMenu.css";
import { MenuIcon } from "@jpmorganchase/uitk-icons";
import { useRef, useState } from "react";
import { Tab, Tabstrip } from "@jpmorganchase/uitk-lab";
import { flip, limitShift, shift } from "@floating-ui/react-dom-interactions";
import { TextColumnFilter } from "./TextColumnFilter";
import { ColumnMenuModel } from "./ColumnMenuModel";
import { ColumnSettings } from "./ColumnSettings";

const withBaseName = makePrefixer("uitkDataGridColumnMenu");

export interface ColumnMenuProps {
  model: ColumnMenuModel;
}

const useTabSelection = (
  initialValue?: number
): [number, (tabIndex: number) => void] => {
  const [selectedTab, setSelectedTab] = useState(initialValue ?? 0);
  const onTabSelected = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };
  return [selectedTab, onTabSelected];
};

export const ColumnMenu = function ColumnMenu(props: ColumnMenuProps) {
  const { model } = props;
  const buttonRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, onTabChange] = useTabSelection();

  const id = useId();
  const Window = useWindow();
  const { reference, floating, x, y, strategy } = useFloatingUI({
    placement: "bottom-start",
    middleware: [
      flip({
        fallbackPlacements: ["bottom-start", "top-start"],
      }),
      shift({ limiter: limitShift() }),
    ],
  });

  const windowStyle = {
    top: y ?? "",
    left: x ?? "",
    position: strategy,
    zIndex: 2,
  };

  const onClick = () => {
    console.log(`Column menu button click.`);
    setIsOpen((x) => !x);
  };

  return (
    <span className={withBaseName()} ref={reference}>
      <MenuIcon
        ref={buttonRef}
        className={withBaseName("menu")}
        onClick={onClick}
      />
      {buttonRef.current && isOpen ? (
        <Portal>
          <Window id={id} style={windowStyle} ref={floating}>
            <Card>
              <Tabstrip onActiveChange={onTabChange}>
                <Tab label={"Menu"} />
                <Tab label={"Filter"} />
                <Tab label={"search"} />
              </Tabstrip>
              {selectedTab === 0 ? (
                <ColumnSettings model={model.settings} />
              ) : null}
              {selectedTab === 1 ? (
                <TextColumnFilter model={model.filter} />
              ) : null}
              {selectedTab === 2 ? <div>Content for Search</div> : null}
            </Card>
          </Window>
        </Portal>
      ) : null}
    </span>
  );
};
