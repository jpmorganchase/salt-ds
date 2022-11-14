import { allIcons } from "@jpmorganchase/uitk-icons/stories/icon.all";
import { createElement } from "react";
import { FlexLayout, StackLayout } from "@jpmorganchase/uitk-core";

const formatIconName = (icon: string) => {
  const fullName = icon.replace(/([A-Z])/g, " $1");
  return fullName.substring(0, fullName.lastIndexOf(" "));
};
export const AllIcons = ({ size = 1, withName = false }) => {
  return (
    <FlexLayout
      wrap
      gap={4}
      style={{ paddingBlock: "1rem", maxWidth: "650px" }}
    >
      {allIcons.map((iconComponent, i) => {
        return withName ? (
          <StackLayout align="center" style={{ width: "150px" }}>
            {createElement(iconComponent, { key: i, size: size })}
            {iconComponent.displayName && (
              <p>{formatIconName(iconComponent.displayName)}</p>
            )}
          </StackLayout>
        ) : (
          createElement(iconComponent, { key: i, size: size })
        );
      })}
    </FlexLayout>
  );
};
export const allIconNames = allIcons.map((iconComponent) => ({
  name: iconComponent.displayName && formatIconName(iconComponent.displayName),
  icon: iconComponent,
}));
