import { NotificationIcon } from "@salt-ds/icons";
import { OnSolidButton } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import type { ReactNode } from "react";

export default {
  title: "Lab/OnSolidButton/QA",
  component: OnSolidButton,
  globals: {
    a11y: {
      manual: true,
    },
  },
} as Meta<typeof OnSolidButton>;

const surfaces = [
  { name: "error", background: "var(--salt-status-error-bold-background)" },
  { name: "info", background: "var(--salt-status-info-bold-background)" },
  { name: "warning", background: "var(--salt-status-warning-bold-background)" },
  { name: "success", background: "var(--salt-status-success-bold-background)" },
];

const Surface = ({
  background,
  children,
}: {
  background: string;
  children: ReactNode;
}) => (
  <div
    style={{
      background,
      display: "flex",
      alignItems: "center",
      gap: "var(--salt-spacing-300)",
      padding: "var(--salt-spacing-300)",
      borderRadius: "var(--salt-palette-corner-weak)",
    }}
  >
    {children}
  </div>
);

export const AllExamplesGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={1} itemPadding={12} itemWidthAuto {...props}>
    {surfaces.map(({ name, background }) => (
      <Surface key={name} background={background}>
        <OnSolidButton>OnSolidButton</OnSolidButton>
        <OnSolidButton>
          <NotificationIcon aria-hidden />
          OnSolidButton
        </OnSolidButton>
        <OnSolidButton aria-label="OnSolidButton">
          <NotificationIcon aria-hidden />
        </OnSolidButton>
        <OnSolidButton disabled>OnSolidButton</OnSolidButton>
      </Surface>
    ))}
  </QAContainer>
);

AllExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
