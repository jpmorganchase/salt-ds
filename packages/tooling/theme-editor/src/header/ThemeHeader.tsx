import { ReactElement, useMemo, useState } from "react";
import { Button } from "@jpmorganchase/uitk-core";
import {
  CloneIcon,
  DownloadIcon,
  MicroMenuIcon,
  RedoIcon,
  RefreshIcon,
  UndoIcon,
  UploadIcon,
} from "@jpmorganchase/uitk-icons";
import {
  DropdownButton,
  Dropdown,
  SelectionChangeHandler,
  MenuDescriptor,
} from "@jpmorganchase/uitk-lab";
import { handleThemeUpload } from "./handleThemeUpload";
import { JSONByScope } from "../helpers/parseToJson";
import "./ThemeHeader.css";

interface ThemeHeaderProps {
  currentTheme: string;
  onChangeTheme: (themeName: string) => void;
  onClone: () => void;
  onSave: () => void;
  onRedo: () => void;
  onReset: () => void;
  onUpload: (jsonByScope: JSONByScope[], themeName: string) => void;
  onUndo: () => void;
  redoDisabled: boolean;
  resetDisabled: boolean;
  themeNames: string[];
  undoDisabled: boolean;
}

const download: MenuDescriptor["icon"] = DownloadIcon;
const undo: MenuDescriptor["icon"] = UndoIcon;
const redo: MenuDescriptor["icon"] = RedoIcon;
const reset: MenuDescriptor["icon"] = RefreshIcon;

type menuItem = {
  title: string;
  disabled?: boolean;
  icon: MenuDescriptor["icon"];
};

export const ThemeHeader = (props: ThemeHeaderProps): ReactElement => {
  const handleChange: SelectionChangeHandler<string> = (e, item) => {
    props.onChangeTheme(item as string);
  };
  const menuItems: menuItem[] = useMemo(
    () => [
      {
        title: "Download",
        icon: download,
      },
      {
        title: "Undo",
        disabled: props.undoDisabled,
        icon: undo,
      },
      {
        title: "Redo",
        disabled: props.redoDisabled,
        icon: redo,
      },
      {
        title: "Reset",
        disabled: props.resetDisabled,
        icon: reset,
      },
    ],

    [props.undoDisabled, props.redoDisabled, props.resetDisabled]
  );

  const microMenuClickHandler: SelectionChangeHandler<menuItem> = (
    _evt,
    selectedItem
  ) => {
    switch (selectedItem?.title) {
      case "Download":
        props.onSave();
        break;
      case "Undo":
        props.onUndo();
        break;
      case "Redo":
        props.onRedo();
        break;
      case "Reset":
        props.onReset();
        break;
      default:
        break;
    }
  };

  return (
    <div className="uitkThemeHeader">
      <div className="ThemeTitleBar">
        <span className="ThemeTitle">Theme</span>
        <span>
          <Button
            variant="secondary"
            onClick={() => void handleThemeUpload(props.onUpload)}
          >
            <UploadIcon />
          </Button>
          <Button variant="secondary" onClick={props.onClone}>
            <CloneIcon />
          </Button>
          <Dropdown<menuItem>
            triggerComponent={<DropdownButton IconComponent={MicroMenuIcon} />}
            itemToString={(item) => item.title}
            onSelectionChange={microMenuClickHandler}
            source={menuItems}
            className="ThemeHeaderMicroMenu"
          />
        </span>
      </div>
      <Dropdown
        source={props.themeNames}
        selected={
          props.themeNames[props.themeNames.indexOf(props.currentTheme)]
        }
        onSelectionChange={handleChange}
        className="themeSelector"
      />
    </div>
  );
};
