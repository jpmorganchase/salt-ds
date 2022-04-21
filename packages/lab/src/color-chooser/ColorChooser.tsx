import { useState, useCallback } from "react";
import cn from "classnames";
import { Overlay } from "../overlay";
import { Button, ButtonProps, makePrefixer } from "@jpmorganchase/uitk-core";
import { RefreshIcon } from "@jpmorganchase/icons";
import { Color } from "./Color";
import { isTransparent } from "./color-utils";

import {
  hexValueWithoutAlpha,
  getColorNameByHexValue,
  convertColorMapValueToHex,
  getHexValue,
} from "./ColorHelpers";
import { uitkColorMap } from "./colorMap";
import { ColorChooserTabs, DictTabs } from "./DictTabs";
import { getColorPalettes } from "./GetColorPalettes";
import { createTabsMapping } from "./createTabsMapping";

import "./ColorChooser.css";

const withBaseName = makePrefixer("uitkColorChooser");

function getActiveTab(
  hexValue: string | undefined,
  tabs: ColorChooserTabs,
  UITKColorOverrides: Record<string, string> | undefined
): number {
  if (tabs["Swatches"] && tabs["Color Picker"]) {
    const hexNoAlpha: string | undefined = hexValueWithoutAlpha(hexValue);
    const colors = UITKColorOverrides ?? uitkColorMap;
    // if hexNoAlpha is a UITK color or null/undefined then set the active tab as Swatches
    if (
      hexNoAlpha &&
      !Object.keys(colors).find(
        (key: string) =>
          convertColorMapValueToHex(colors[key])?.toLowerCase() ===
          hexNoAlpha?.toLowerCase()
      )
    ) {
      return 1;
    }
  }
  return 0;
}

export interface ColorChooserProps {
  color: Color | undefined;
  defaultAlpha?: number;
  disableAlphaChooser?: boolean;
  displayHexOnly?: boolean;
  hideLabel?: boolean;
  onClear: () => void; // called when user clicks "default" button
  onSelect: (
    color: Color | undefined,
    finalSelection: boolean,
    e?: React.ChangeEvent
  ) => void;
  placeholder?: string;
  buttonProps?: Partial<ButtonProps>;
  UITKColorOverrides?: Record<string, string>;
  showSwatches?: boolean;
  showColorPicker?: boolean;
  readOnly?: boolean;
}

export const ColorChooser = ({
  onClear,
  onSelect,
  color,
  showSwatches = true,
  showColorPicker = true,
  defaultAlpha = 1,
  disableAlphaChooser = false,
  hideLabel = false,
  placeholder,
  buttonProps,
  UITKColorOverrides,
  readOnly = false,
  displayHexOnly = false,
}: ColorChooserProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [node, setNode] = useState();
  const setRef = useCallback((node) => {
    if (node) {
      setNode(node);
    }
  }, []);

  const allColors: string[][] = UITKColorOverrides
    ? getColorPalettes(UITKColorOverrides)
    : getColorPalettes();
  const displayColorName = displayHexOnly
    ? getHexValue(color?.hex, disableAlphaChooser)
    : getColorNameByHexValue(
        color?.hex,
        disableAlphaChooser,
        UITKColorOverrides
      );

  const handleClickButton = (): void => {
    setOpen(true);
  };
  const handleClose = (): void => setOpen(false);

  const alphaForTabs = isTransparent(color?.hex)
    ? defaultAlpha
    : color?.rgba?.a ?? defaultAlpha;

  const tabsMapping = createTabsMapping({
    swatches: showSwatches,
    colorPicker: showColorPicker,
    disableAlphaChooser,
    allColors,
    color,
    alpha: alphaForTabs,
    handleColorChange: onSelect,
    displayColorName,
    placeholder,
    onDialogClosed: () => {
      setOpen(false);
    },
  });

  const [activeTab, setActiveTab] = useState<number>(
    getActiveTab(color?.hex, tabsMapping, UITKColorOverrides)
  );
  const onDefaultSelected = (): void => {
    if (activeTab === 0 && showSwatches) {
      onClear();
      handleClose();
    } else {
      onClear();
    }
  };
  const onTabClick = (index: number): void => {
    setActiveTab(index);
  };

  return (
    <>
      <Button
        className={cn(withBaseName("overlayButton"), {
          [withBaseName("overlayButtonHiddenLabel")]: hideLabel,
        })}
        data-testid="color-chooser-overlay-button"
        disabled={readOnly}
        ref={setRef}
        onClick={handleClickButton}
        {...buttonProps}
      >
        {color && (
          <div
            className={cn(withBaseName("overlayButtonSwatch"), {
              [withBaseName("overlayButtonSwatchWithBorder")]:
                color?.hex.startsWith("#ffffff"),
              [withBaseName("overlayButtonSwatchTransparent")]: isTransparent(
                color?.hex
              ),
            })}
            style={{
              backgroundColor: color?.hex,
            }}
          />
        )}
        {!hideLabel && (
          <div className={withBaseName("overlayButtonText")}>
            {displayColorName ?? placeholder ?? "No color selected"}
          </div>
        )}
      </Button>
      <Overlay
        adaExceptions={{ showClose: false }}
        data-testid="color-chooser-overlay"
        className={cn(withBaseName("overlayButtonClose"))}
        anchorEl={node}
        onClose={handleClose}
        // onBackdropClick={(e): void => onSelect(initialColor, true, e)}
        open={open}
        placement={"bottom"}
      >
        <div
          className={cn(withBaseName("overlayContent"))}
          data-testid="overlay-content"
        >
          <Button
            data-testid="default-button"
            variant="secondary"
            className={cn(withBaseName("defaultButton"))}
            onClick={onDefaultSelected}
          >
            <RefreshIcon className={cn(withBaseName("refreshIcon"))} />
            Default
          </Button>
          <DictTabs
            tabs={tabsMapping}
            hexValue={color?.hex}
            onTabClick={onTabClick}
            activeTab={activeTab}
          />
        </div>
      </Overlay>
    </>
  );
};
