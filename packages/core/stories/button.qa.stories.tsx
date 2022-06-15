import { Button, ButtonVariantValues } from "@jpmorganchase/uitk-core";
import { SearchIcon } from "@jpmorganchase/uitk-icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { AllRenderer, QAContainer } from "docs/components";

export default {
  title: "Core/Button/QA",
  component: Button,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof Button>;

const ButtonText = () => <>Button</>;
const ButtonIcon = () => <SearchIcon size={12} />;
const ButtonIconText = () => (
  <>
    <SearchIcon size={12} /> Button
  </>
);

const ButtonChildrenVariants = [
  <ButtonText />,
  <ButtonIcon />,
  <ButtonIconText />,
];

export const AllVariantsGrid: ComponentStory<typeof Button> = (props) => {
  return (
    <AllRenderer>
      <div
        style={{
          background: "inherit",
          display: "inline-grid",
          gridTemplate: "auto / repeat(3,auto)",
          gap: "4px",
        }}
      >
        {ButtonVariantValues.map((v) =>
          ButtonChildrenVariants.map((c, i) => (
            <Button {...props} variant={v} key={`${v}-${i}`}>
              {c}
            </Button>
          ))
        )}
      </div>
    </AllRenderer>
  );
};

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<typeof Button> = (
  props
) => {
  return (
    <QAContainer imgSrc="/visual-regression-screenshots/Button-vr-snapshot.png">
      <AllRenderer>
        <div
          style={{
            background: "inherit",
            display: "inline-grid",
            gridTemplate: "auto / repeat(3,auto)",
            gap: "4px",
          }}
        >
          {ButtonVariantValues.map((v) =>
            ButtonChildrenVariants.map((c, i) => (
              <Button {...props} variant={v} key={`${v}-${i}`}>
                {c}
              </Button>
            ))
          )}
        </div>
      </AllRenderer>
    </QAContainer>
  );
};
