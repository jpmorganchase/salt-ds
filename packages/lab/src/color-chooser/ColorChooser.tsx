import {
  Button,
  type ButtonProps,
  makePrefixer,
  Overlay,
  OverlayPanel,
  OverlayPanelCloseButton,
  OverlayPanelContent,
  OverlayTrigger,
} from "@salt-ds/core";
import { RefreshIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ChangeEvent, useState } from "react";
import type { Color } from "./Color";
import colorChooserCss from "./ColorChooser.css";
import {
  convertColorMapValueToHex,
  getColorNameByHexValue,
  getHexValue,
  hexValueWithoutAlpha,
} from "./ColorHelpers";
import { isTransparent } from "./color-utils";
import { saltColorMap } from "./colorMap";
import { createTabsMapping } from "./createTabsMapping";
import { type ColorChooserTabs, DictTabs } from "./DictTabs";
import { getColorPalettes } from "./GetColorPalettes";

const withBaseName = makePrefixer("saltColorChooser");

function getActiveTab(
  hexValue: string | undefined,
  tabs: ColorChooserTabs,
  saltColorOverrides: Record<string, string> | undefined,
): number {
  if (tabs.Swatches && tabs["Color Picker"]) {
    const hexNoAlpha: string | undefined = hexValueWithoutAlpha(hexValue);
    const colors = saltColorOverrides ?? saltColorMap;
    // if hexNoAlpha is a Salt color or null/undefined then set the active tab as Swatches
    if (
      hexNoAlpha &&
      !Object.keys(colors).find(
        (key: string) =>
          convertColorMapValueToHex(colors[key])?.toLowerCase() ===
          hexNoAlpha?.toLowerCase(),
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
    event?: ChangeEvent,
  ) => void;
  placeholder?: string;
  buttonProps?: Partial<ButtonProps>;
  saltColorOverrides?: Record<string, string>;
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
  saltColorOverrides,
  readOnly = false,
  displayHexOnly = false,
}: ColorChooserProps): JSX.Element => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-color-chooser",
    css: colorChooserCss,
    window: targetWindow,
  });

  const [open, setOpen] = useState(false);

  const allColors: string[][] = saltColorOverrides
    ? getColorPalettes(saltColorOverrides)
    : getColorPalettes();
  const displayColorName = displayHexOnly
    ? getHexValue(color?.hex, disableAlphaChooser)
    : getColorNameByHexValue(
        color?.hex,
        disableAlphaChooser,
        saltColorOverrides,
      );

  const handleOpenChange = (open: boolean) => setOpen(open);

  const alphaForTabs = isTransparent(color?.hex)
    ? defaultAlpha
    : (color?.rgba?.a ?? defaultAlpha);

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
    getActiveTab(color?.hex, tabsMapping, saltColorOverrides),
  );
  const onDefaultSelected = (): void => {
    if (activeTab === 0 && showSwatches) {
      onClear();
      handleOpenChange(false);
    } else {
      onClear();
    }
  };

  const onTabClick = (index: number): void => {
    setActiveTab(index);
  };

  const overlayContent = (
    <div
      className={clsx(withBaseName("overlayContent"))}
      data-testid="overlay-content"
    >
      <Button
        data-testid="default-button"
        variant="secondary"
        className={clsx(withBaseName("defaultButton"))}
        onClick={onDefaultSelected}
      >
        <RefreshIcon className={clsx(withBaseName("refreshIcon"))} />
        Default
      </Button>
      <DictTabs
        tabs={tabsMapping}
        hexValue={color?.hex}
        onTabClick={onTabClick}
        activeTab={activeTab}
      />
    </div>
  );

  return (
    <Overlay placement="bottom" data-testid="color-chooser-overlay">
      <OverlayTrigger>
        <Button
          className={clsx(withBaseName("overlayButton"), {
            [withBaseName("overlayButtonHiddenLabel")]: hideLabel,
          })}
          data-testid="color-chooser-overlay-button"
          disabled={readOnly}
          {...buttonProps}
        >
          {color && (
            <div
              className={clsx(withBaseName("overlayButtonSwatch"), {
                [withBaseName("overlayButtonSwatchWithBorder")]:
                  color?.hex.startsWith("#ffffff"),
                [withBaseName("overlayButtonSwatchTransparent")]: isTransparent(
                  color?.hex,
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
      </OverlayTrigger>
      <OverlayPanel>
        <OverlayPanelCloseButton />
        <OverlayPanelContent>{overlayContent}</OverlayPanelContent>
      </OverlayPanel>
    </Overlay>
  );
};
