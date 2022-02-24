import { ReactElement, useMemo, useState } from "react";
import {
  Button,
  CloneIcon,
  DownloadIcon,
  MicroMenuIcon,
  RedoIcon,
  RefreshIcon,
  UndoIcon,
  UploadIcon,
} from "@brandname/core";
import {
  CascadingMenu,
  Dropdown,
  itemToString,
  ListChangeHandler,
  MenuDescriptor,
} from "@brandname/lab";
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

export const ThemeHeader = (props: ThemeHeaderProps): ReactElement => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const handleChange: ListChangeHandler<string> = (e, item) => {
    props.onChangeTheme(item as string);
  };
  const source = useMemo(
    () => ({
      menuItems: [
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
    }),
    [props.undoDisabled, props.redoDisabled, props.resetDisabled]
  );

  const microMenuClickHandler = (evt: any, selectedItem: any) => {
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
          <Dropdown
            IconComponent={MicroMenuIcon}
            itemToString={(item) => item.title}
            onChange={microMenuClickHandler}
            source={source.menuItems}
            className="ThemeHeaderMicroMenu"
          />
          {/* <CascadingMenu
            source={source}
            rootPlacement="bottom-end"
            minWidth="124px"
            maxWidth="124px"
            // eslint-disable-next-line
            itemToString={(item) => item?.title}
            onClose={() => {
              setMenuOpen(false);
            }}
            onItemClick={(sourceItem) => {
              switch (sourceItem.title) {
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
              setMenuOpen(false);
            }}
            open={menuOpen}
          >
            <Button variant="secondary" onClick={() => setMenuOpen((o) => !o)}>
              <MicroMenuIcon />
            </Button>
          </CascadingMenu> */}
        </span>
      </div>
      <Dropdown
        source={props.themeNames}
        selectedItem={
          props.themeNames[props.themeNames.indexOf(props.currentTheme)]
        }
        onChange={handleChange}
        className="themeSelector"
      />
    </div>
  );
};
