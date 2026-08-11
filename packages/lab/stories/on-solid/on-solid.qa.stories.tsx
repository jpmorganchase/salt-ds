import { NotificationIcon } from "@salt-ds/icons";
import { OnSolid } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import type { ReactNode } from "react";

export default {
  title: "Lab/Button/OnSolid QA",
  component: OnSolid,
  globals: {
    a11y: {
      manual: true,
    },
  },
} as Meta<typeof OnSolid>;

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

export const AllStatesGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={1} itemPadding={12} itemWidthAuto {...props}>
    {surfaces.map(({ name, background }) => (
      <Surface key={name} background={background}>
        <OnSolid>OnSolid</OnSolid>
        <OnSolid>
          <NotificationIcon aria-hidden />
          OnSolid
        </OnSolid>
        <OnSolid aria-label="OnSolid">
          <NotificationIcon aria-hidden />
        </OnSolid>
        {/* Active state forced via the core Button `saltButton-active` class
            hook, so it is captured in the static snapshot. Hover is styled by
            the core Button using the `:hover` pseudo-class only (no class hook)
            and there is no pseudo-states addon, so it cannot be reliably forced
            into a Chromatic snapshot and is intentionally omitted. */}
        <OnSolid className="saltButton-active">OnSolid</OnSolid>
        <OnSolid disabled>OnSolid</OnSolid>
      </Surface>
    ))}
  </QAContainer>
);

AllStatesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
