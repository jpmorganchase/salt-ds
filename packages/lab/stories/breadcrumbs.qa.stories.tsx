import { ComponentMeta, ComponentStory, Story } from "@storybook/react";

import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import { Breadcrumbs, Breadcrumb } from "@jpmorganchase/uitk-lab";
import { HomeIcon, TreeIcon } from "@jpmorganchase/uitk-icons";
import { QAContainer } from "docs/components";
import { BackgroundBlock } from "docs/components/BackgroundBlock";

export default {
  title: "Lab/Breadcrumbs/QA",
  component: Breadcrumbs,
} as ComponentMeta<typeof Breadcrumbs>;

export const AllExamplesGrid: Story = (props: {
  className?: string;
  imgSrc?: string;
}) => {
  return (
    <QAContainer
      cols={4}
      transposeDensity
      vertical
      className="uitkMetricQA"
      imgSrc={props.imgSrc}
    >
      <Breadcrumbs
        className={props.className}
        data-jpmui-test="breadcrumbs-example"
      >
        <Breadcrumb href="#">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#">Level 2 Entity</Breadcrumb>
        <Breadcrumb href="#">Level 3 Entity</Breadcrumb>
      </Breadcrumbs>
      <Breadcrumbs
        className={props.className}
        data-jpmui-test="breadcrumbs-example"
      >
        <Breadcrumb href="#" Icon={HomeIcon} overflowLabel="Home" />
        <Breadcrumb href="#" Icon={TreeIcon} overflowLabel="Level 2 Entity">
          Level 2 Entity
        </Breadcrumb>
        <Breadcrumb href="#" overflowLabel="Level 3 Entity">
          Level 3 Entity
        </Breadcrumb>
      </Breadcrumbs>
      <Breadcrumbs
        className={props.className}
        data-jpmui-test="breadcrumbs-example"
        itemsMaxWidth={60}
      >
        <Breadcrumb href="#">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#">Level 2 Entity</Breadcrumb>
        <Breadcrumb href="#">Level 3 Entity</Breadcrumb>
      </Breadcrumbs>
      <Breadcrumbs
        className={props.className}
        data-jpmui-test="breadcrumbs-example"
        style={{ width: 250 }}
        wrap
      >
        <Breadcrumb href="#">Root Level Entity</Breadcrumb>
        <Breadcrumb href="#">Level 2 Entity</Breadcrumb>
        <Breadcrumb href="#">Level 3 Entity</Breadcrumb>
      </Breadcrumbs>
      <Breadcrumbs
        className={props.className}
        data-jpmui-test="breadcrumbs-example"
        maxItems={2}
      >
        <Breadcrumb
          href="#"
          onItemClick={(sourceItem, event) =>
            console.log(
              "Clicked Root Level Entity from menu",
              sourceItem,
              event
            )
          }
        >
          Root Level Entity
        </Breadcrumb>
        <Breadcrumb
          href="#"
          onItemClick={(sourceItem, event) =>
            console.log("Clicked Level 2 Entity from menu", sourceItem, event)
          }
        >
          Level 2 Entity
        </Breadcrumb>
        <Breadcrumb
          href="#"
          onItemClick={(sourceItem, event) =>
            console.log("Clicked Level 3 Entity from menu", sourceItem, event)
          }
        >
          Level 3 Entity
        </Breadcrumb>
        <Breadcrumb
          href="#"
          onItemClick={(sourceItem, event) =>
            console.log("Clicked Level 4 Entity from menu", sourceItem, event)
          }
        >
          Level 4 Entity
        </Breadcrumb>
      </Breadcrumbs>
      <Breadcrumbs
        className={props.className}
        data-jpmui-test="breadcrumbs-example"
        itemsBeforeCollapse={0}
        maxItems={2}
      >
        <Breadcrumb
          href="#"
          onItemClick={(sourceItem, event) =>
            console.log(
              "Clicked Root Level Entity from menu",
              sourceItem,
              event
            )
          }
        >
          Root Level Entity
        </Breadcrumb>
        <Breadcrumb
          href="#"
          onItemClick={(sourceItem, event) =>
            console.log("Clicked Level 2 Entity from menu", sourceItem, event)
          }
        >
          Level 2 Entity
        </Breadcrumb>
        <Breadcrumb
          href="#"
          onItemClick={(sourceItem, event) =>
            console.log("Clicked Level 3 Entity from menu", sourceItem, event)
          }
        >
          Level 3 Entity
        </Breadcrumb>
        <Breadcrumb
          href="#"
          onItemClick={(sourceItem, event) =>
            console.log("Clicked Level 4 Entity from menu", sourceItem, event)
          }
        >
          Level 4 Entity
        </Breadcrumb>
      </Breadcrumbs>
    </QAContainer>
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

export const CompareWithOriginalToolkit = AllExamplesGrid.bind({});
CompareWithOriginalToolkit.args = {
  className: "backwardsCompat",
  imgSrc: "/visual-regression-screenshots/Breadcrumbs-vr-snapshot.png",
};
