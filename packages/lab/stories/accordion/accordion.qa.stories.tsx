import { ComponentMeta, ComponentStory, Story } from "@storybook/react";
import { ComponentType, ReactNode } from "react";

import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import {
  Accordion,
  AccordionSection,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@jpmorganchase/uitk-lab";
import { QAContainer } from "docs/components";
import { BackgroundBlock } from "docs/components/BackgroundBlock";

export default {
  title: "Lab/Accordion/QA",
  component: Accordion,
} as ComponentMeta<typeof Accordion>;

type PanelsData = {
  content: ReactNode;
  summary: ReactNode;
};

const panelsData: PanelsData[] = [
  {
    summary: "My first Panel",
    content: (
      <div>
        My first panel content <Link href="#">Link 1</Link>
      </div>
    ),
  },
  {
    summary: "My second Panel",
    content: (
      <div>
        My second panel content <Link href="#">Link 2</Link>
      </div>
    ),
  },
];

type ExampleProps = {
  readonly title?: string;
  readonly bordered?: boolean;
  className?: string | undefined;
};

const Default: ComponentType<ExampleProps> = (props) => (
  <div style={{ width: 400 }}>
    <h3>{props.title}</h3>
    <Accordion
      className={props.className}
      maxExpandedItems={1}
      bordered={props.bordered}
      // disabled={props.disabled}
    >
      {panelsData.map((panel) => {
        const { content, summary } = panel;
        return (
          <AccordionSection key={summary?.toString()}>
            <AccordionSummary>{summary}</AccordionSummary>
            <AccordionDetails>{content}</AccordionDetails>
          </AccordionSection>
        );
      })}
    </Accordion>
  </div>
);

// const Expanded: ComponentType<ExampleProps> = (props) => (
//   <div style={{ width: 400 }}>
//     <h3>{props.title}</h3>
//     <Accordion
//       // bordered={props.bordered}
//       defaultExpandedSectionIds={["panel1"]}
//       panels={["panel1", "panel2"]}
//       renderPanel={({ value, getPanelProps }) => {
//         const panel = panelsData[value];
//         return (
//           <ExpansionPanel
//             content={panel.content}
//             summary={panel.summary}
//             {...getPanelProps()}
//           />
//         );
//       }}
//     />
//   </div>
// );

// const Disabled: ComponentType<ExampleProps> = (props) => (
//   <div style={{ width: 400 }}>
//     <h3>{props.title}</h3>
//     <Accordion
//       // bordered={props.bordered}
//       disabled={["panel1"]}
//       panels={["panel1", "panel2"]}
//       renderPanel={({ value, getPanelProps }) => {
//         const panel = panelsData[value];
//         return (
//           <ExpansionPanel
//             content={panel.content}
//             summary={panel.summary}
//             {...getPanelProps()}
//           />
//         );
//       }}
//     />
//   </div>
// );

const AccordionExamples = (props: { className?: string | undefined }) => (
  <div>
    <Default title="Default" className={props.className} />
    <Default title="Default bordered" bordered className={props.className} />
    {/* <Expanded title="Expanded" />
    <Expanded bordered title="Expanded bordered" />
    <Disabled title="Disabled" />
    <Disabled bordered title="Disabled bordered " /> */}
  </div>
);

export const AllExamplesGrid: Story = (props: { className?: string }) => {
  return (
    <div style={{ width: 700, display: "flex", flex: 1 }}>
      <ToolkitProvider theme={"light"}>
        <BackgroundBlock style={{ background: "white" }}>
          <AccordionExamples className={props.className} />
        </BackgroundBlock>
      </ToolkitProvider>
      <ToolkitProvider theme={"dark"}>
        <BackgroundBlock>
          <AccordionExamples className={props.className} />
        </BackgroundBlock>
      </ToolkitProvider>
    </div>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const BackwardsCompatGrid = AllExamplesGrid.bind({});
BackwardsCompatGrid.args = {
  className: "backwardsCompat",
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<
  typeof Accordion
> = () => {
  return (
    <QAContainer
      width={700}
      className="uitkMetricQA"
      imgSrc="/visual-regression-screenshots/Accordion-vr-snapshot.png"
    >
      <BackwardsCompatGrid className="backwardsCompat" />
    </QAContainer>
  );
};
