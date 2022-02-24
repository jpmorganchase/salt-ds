import { Story } from "@storybook/react";
import { Breadcrumb, Breadcrumbs } from "@brandname/lab";
import { HomeIcon, TreeIcon } from "@brandname/icons";

export default {
  title: "Lab/Breadcrumbs",
  component: "Bread",
};

interface BasicBreadcrumbsStoryProps {}

const BasicBreadcrumbsTemplate: Story<BasicBreadcrumbsStoryProps> = (props) => {
  return (
    <Breadcrumbs>
      <Breadcrumb href="#">Root Level Entity</Breadcrumb>
      <Breadcrumb href="#">Level 2 Entity</Breadcrumb>
      <Breadcrumb href="#">Level 3 Entity</Breadcrumb>
    </Breadcrumbs>
  );
};

export const BasicBreadcrumbs = BasicBreadcrumbsTemplate.bind({});

interface BreadcrumbsWrappingStoryProps {}

const BreadcrumbsWrappingTemplate: Story<BreadcrumbsWrappingStoryProps> = (
  props
) => {
  return (
    <Breadcrumbs data-testid="breadcrumbs-example" style={{ width: 250 }} wrap>
      <Breadcrumb href="#">Root Level Entity</Breadcrumb>
      <Breadcrumb href="#">Level 2 Entity</Breadcrumb>
      <Breadcrumb href="#">Level 3 Entity</Breadcrumb>
    </Breadcrumbs>
  );
};

export const BreadcrumbsWrapping = BreadcrumbsWrappingTemplate.bind({});

interface IconDescriptorsStoryProps {}

const IconDescriptorsStory: Story<IconDescriptorsStoryProps> = (props) => (
  <Breadcrumbs data-testid="breadcrumbs-example">
    <Breadcrumb href="#" overflowLabel="Home" Icon={HomeIcon} />
    <Breadcrumb href="#" overflowLabel="Level 2 Entity" Icon={TreeIcon}>
      Level 2 Entity
    </Breadcrumb>
    <Breadcrumb href="#" overflowLabel="Level 3 Entity">
      Level 3 Entity
    </Breadcrumb>
  </Breadcrumbs>
);

export const IconDescriptors = IconDescriptorsStory.bind({});

interface MaximumItemWidthAndTruncationStoryProps {}

const MaximumItemWidthAndTruncationStory: Story<
  MaximumItemWidthAndTruncationStoryProps
> = (props) => {
  return (
    <Breadcrumbs data-testid="breadcrumbs-example" itemsMaxWidth={60}>
      <Breadcrumb href="#">Root Level Entity</Breadcrumb>
      <Breadcrumb href="#">Level 2 Entity</Breadcrumb>
      <Breadcrumb href="#">Level 3 Entity</Breadcrumb>
    </Breadcrumbs>
  );
};

export const MaximumItemWidthAndTruncation =
  MaximumItemWidthAndTruncationStory.bind({});

interface WithoutCurrentLevelStoryProps {}

const WithoutCurrentLevelStory: Story<WithoutCurrentLevelStoryProps> = (
  props
) => {
  return (
    <Breadcrumbs data-testid="breadcrumbs-example" hideCurrentLevel>
      <Breadcrumb href="#">Root Level Entity</Breadcrumb>
      <Breadcrumb href="#">Level 2 Entity</Breadcrumb>
      <Breadcrumb href="#">Level 3 Entity</Breadcrumb>
    </Breadcrumbs>
  );
};

export const WithoutCurrentLevel = WithoutCurrentLevelStory.bind({});

interface WithOverflowMenuStoryProps {}

const WithOverflowMenuStory: Story<WithOverflowMenuStoryProps> = (props) => {
  return (
    <Breadcrumbs data-testid="breadcrumbs-example" maxItems={2}>
      <Breadcrumb
        href="#"
        onItemClick={(sourceItem, event) =>
          console.log("Clicked Root Level Entity from menu", sourceItem, event)
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
  );
};

export const WithOverflowMenu = WithOverflowMenuStory.bind({});

interface OverflowAtFirstPositionStoryProps {}

const OverflowAtFirstPositionStory: Story<OverflowAtFirstPositionStoryProps> = (
  props
) => {
  return (
    <Breadcrumbs
      data-testid="breadcrumbs-example"
      itemsBeforeCollapse={0}
      maxItems={2}
    >
      <Breadcrumb
        href="#"
        onItemClick={(sourceItem, event) =>
          console.log("Clicked Root Level Entity from menu", sourceItem, event)
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
  );
};

export const OverflowAtFirstPosition = OverflowAtFirstPositionStory.bind({});
