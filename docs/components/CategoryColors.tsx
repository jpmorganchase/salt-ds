import { H2, StackLayout } from "@salt-ds/core";
import { ColorContainer } from "./ColorContainer";
import { ColorItem, ColorPalette } from "@storybook/blocks";

export const CategoryColors = () => {
  return (
    <StackLayout>
      {new Array(20).fill(0).map((_, index) => {
        const cat = index + 1;
        return (
          <StackLayout key={`cat-${cat}-stack`}>
            <H2>Category {cat}</H2>
            <ColorContainer className="paletteContainer">
              <ColorPalette>
                <ColorItem
                  title="Subtle foreground"
                  subtitle={`--salt-category-${cat}-subtle-foreground`}
                  colors={{
                    [`--salt-category-${cat}-subtle-foreground`]: `var(--salt-category-${cat}-subtle-foreground)`,
                  }}
                />
                <ColorItem
                  title="Subtle background"
                  subtitle={`--salt-category-${cat}-subtle-background`}
                  colors={{
                    [`--salt-category-${cat}-subtle-background`]: `var(--salt-category-${cat}-subtle-background)`,
                  }}
                />
                <ColorItem
                  title="Subtle border"
                  subtitle={`--salt-category-${cat}-subtle-borderColor`}
                  colors={{
                    [`--salt-category-${cat}-subtle-borderColor`]: `var(--salt-category-${cat}-subtle-borderColor)`,
                  }}
                />
                <ColorItem
                  title="Bold foreground"
                  subtitle={`--salt-category-${cat}-bold-foreground`}
                  colors={{
                    [`--salt-category-${cat}-bold-foreground`]: `var(--salt-category-${cat}-bold-foreground)`,
                  }}
                />
                <ColorItem
                  title="Bold background"
                  subtitle={`--salt-category-${cat}-bold-background`}
                  colors={{
                    [`--salt-category-${cat}-bold-background`]: `var(--salt-category-${cat}-bold-background)`,
                  }}
                />
              </ColorPalette>
            </ColorContainer>
          </StackLayout>
        );
      })}
    </StackLayout>
  );
};
