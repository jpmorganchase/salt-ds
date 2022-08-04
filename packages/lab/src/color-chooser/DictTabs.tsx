import cn from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Tabstrip, TabstripProps, Tab } from "../tabs";
import { ColorPicker, ColorPickerProps } from "./ColorPicker";
import { Swatches, SwatchesTabProps } from "./Swatches";

const withBaseName = makePrefixer("uitkColorChooserDictTabs");

export type ColorChooserTabs = {
  Swatches?: {
    Component: typeof Swatches;
    props: SwatchesTabProps;
  };
  "Color Picker"?: {
    Component: typeof ColorPicker;
    props: ColorPickerProps;
  };
};

export interface DictTabsProps
  extends Omit<TabstripProps, "tabs" | "renderContent" | "classes"> {
  hexValue: string | undefined;
  tabs: ColorChooserTabs;
  onTabClick: (index: number) => void;
  activeTab: number;
}

export const DictTabs = ({
  tabs,
  hexValue,
  onTabClick,
  activeTab,
  ...props
}: DictTabsProps): JSX.Element => {
  return (
    <div>
      <Tabstrip
        {...props}
        data-testid="color-chooser-tabstrip"
        className={cn(withBaseName("wrapper"))}
        activeTabIndex={activeTab}
        onActiveChange={(tabIndex: number) => onTabClick(tabIndex)}
      >
        {[...Object.keys(tabs)].map((label, i) => (
          <Tab className={cn(withBaseName("text"))} label={label} key={i} />
        ))}
      </Tabstrip>
      {[...Object.values(tabs)].map((tab, idx) => {
        if (!tab) {
          return null;
        }
        const TabComponent: typeof Swatches | typeof ColorPicker =
          tab?.Component;

        return (
          <div
            aria-hidden={activeTab !== idx}
            hidden={activeTab !== idx}
            key={idx}
          >
            {tab?.props ? (
              // @ts-ignore
              <TabComponent {...tab?.props} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
