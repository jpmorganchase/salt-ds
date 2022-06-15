import { FC } from "react";

import { Story } from "@storybook/react";
import { Panel, ToolkitProvider } from "@jpmorganchase/uitk-core";
import { Tabstrip, TabstripProps } from "@jpmorganchase/uitk-lab";
import { QAContainer } from "docs/components";

import "docs/story.css";

export default {
  title: "Lab/Tabstrip/QA",
  component: Tabstrip,
};

const initialTabs = ["Home", "Transactions", "Loans", "Checks", "Liquidity"];

type ExampleProps = Pick<TabstripProps, "onChange"> & {
  // Passed through by Storybook, generating warning causing issue for cypress
  themeType?: "light" | "dark";
};

const TabExamples: FC<TabstripProps> = (props) => (
  <Panel style={{ width: "700px", maxWidth: "100%" }}>
    <Tabstrip tabs={initialTabs} {...props} />
  </Panel>
);

export const QA: Story = () => (
  <>
    <ToolkitProvider theme="light" density="high">
      <TabExamples />
      <ToolkitProvider density="medium">
        <TabExamples />
        <TabExamples centered />
        <TabExamples
          enableAddTab
          tabs={initialTabs
            .concat(["More Services"])
            .map((label, i) => ({ label, closeable: i > 0 }))}
        />
      </ToolkitProvider>
      <ToolkitProvider density="low">
        <TabExamples />
      </ToolkitProvider>
      <ToolkitProvider density="touch">
        <TabExamples />
      </ToolkitProvider>
    </ToolkitProvider>
    <ToolkitProvider theme="dark">
      <ToolkitProvider density="high">
        <TabExamples />
      </ToolkitProvider>
      <ToolkitProvider density="medium">
        <TabExamples />
        <TabExamples
          enableAddTab
          tabs={initialTabs
            .concat(["More Services"])
            .map((label, i) => ({ label, closeable: i > 0 }))}
        />
      </ToolkitProvider>
      <ToolkitProvider density="low">
        <TabExamples />
      </ToolkitProvider>
      <ToolkitProvider density="touch">
        <TabExamples />
      </ToolkitProvider>
    </ToolkitProvider>
  </>
);

QA.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: Story<TabstripProps> = () => {
  return (
    <QAContainer
      height={1200}
      // @ts-ignore
      style={{ "--uitkPanel-height": "auto" }}
      imgSrc="/visual-regression-screenshots/Tabs-vr-snapshot.png"
    >
      <QA />
    </QAContainer>
  );
};
