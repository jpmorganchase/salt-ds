import { HomeIcon, TreeIcon } from "@salt-ds/icons";
import { Breadcrumb, Breadcrumbs } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer } from "docs/components";

export default {
  title: "Lab/Breadcrumbs/QA",
  component: Breadcrumbs,
} as Meta<typeof Breadcrumbs>;

export const AllExamplesGrid: StoryFn = (props: { className?: string }) => {
  return (
    <QAContainer cols={4} transposeDensity vertical className="saltMetricQA">
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
              event,
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
              event,
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
