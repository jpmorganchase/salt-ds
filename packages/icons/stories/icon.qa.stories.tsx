import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerNoStyleInjection } from "docs/components";
import { allIcons } from "./icon.all";
import { AddDocumentIcon } from "@salt-ds/icons";
import "@salt-ds/icons/saltIcons.css";
export default {
  title: "Icons/Icon/Icon QA",
} as Meta;

const sizes = [1, 2, 3] as const;
export const IconSizes: StoryFn = () => {
  return (
    <QAContainer height={500} width={1500} cols={4}>
      <AddDocumentIcon size={1} />
      <AddDocumentIcon size={2} />
      <AddDocumentIcon size={3} />
      <AddDocumentIcon size={4} />
    </QAContainer>
  );
};

export const AllIcons: StoryFn = () => {
  return (
    <>
      {sizes.map((size) => (
        <div
          key={size}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(15, auto)",
            gap: 8,
            padding: "12px 0",
          }}
        >
          {allIcons.map((IconComponent, i) => (
            <IconComponent key={i} size={size} />
          ))}
        </div>
      ))}
    </>
  );
};

AllIcons.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjection: StoryFn = () => {
  return (
    <QAContainerNoStyleInjection
      height={500}
      width={1500}
      cols={4}
      enableStyleInjection={false}
    >
      <AddDocumentIcon size={1} />
      <AddDocumentIcon size={2} />
      <AddDocumentIcon size={3} />
      <AddDocumentIcon size={4} />
    </QAContainerNoStyleInjection>
  );
};

NoStyleInjection.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CssBackground: StoryFn = () => {
  return (
    <QAContainer height={500} width={350}>
      <div className="saltIcons-AddDocument" />
    </QAContainer>
  );
};
