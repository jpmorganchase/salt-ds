import {
  Code,
  Display1,
  Display2,
  Display3,
  Display4,
  Editorial1,
  Editorial2,
  Editorial3,
  Editorial4,
  Eyebrow,
  H1,
  H2,
  H3,
  H4,
  Label,
  Text,
  TextAction,
  TextNotation,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Text/Text QA",
  component: Text,
} as Meta<typeof Text>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} cols={1} {...props}>
    <Text>
      Primary <strong>strong</strong> and <small>small</small> text
    </Text>
    <Text disabled>
      Primary disabled <strong>strong</strong> and <small>small</small> text
    </Text>
    <Text color="secondary">
      Secondary <strong>strong</strong> and <small>small</small> text
    </Text>
    <Text color="secondary" disabled>
      Secondary disabled <strong>strong</strong> and <small>small</small> text
    </Text>
    <Text color="info">
      Info <strong>strong</strong> and <small>small</small> text
    </Text>
    <Text color="error">
      Error <strong>strong</strong> and <small>small</small> text
    </Text>
    <Text color="warning">
      Warning <strong>strong</strong> and <small>small</small> text
    </Text>
    <Text color="success">
      Success <strong>strong</strong> and <small>small</small> text
    </Text>
    <Text color="inherit">
      Inherit <strong>strong</strong> and <small>small</small> text
    </Text>
    <Display1>
      Display 1 <strong>strong</strong> and <small>small</small> text
    </Display1>
    <Display2>
      Display 2 <strong>strong</strong> and <small>small</small> text
    </Display2>
    <Display3>
      Display 3 <strong>strong</strong> and <small>small</small> text
    </Display3>
    <Display4>
      Display 4 <strong>strong</strong> and <small>small</small> text
    </Display4>
    <H1>
      H1 <strong>strong</strong> and <small>small</small> text
    </H1>
    <H2>
      H2 <strong>strong</strong> and <small>small</small> text
    </H2>
    <H3>
      H3 <strong>strong</strong> and <small>small</small> text
    </H3>
    <H4>
      H4 <strong>strong</strong> and <small>small</small> text
    </H4>
    <Eyebrow>
      Eyebrow <strong>strong</strong> and <small>small</small> text
    </Eyebrow>
    <Text styleAs="bodyLarge">
      Body large <strong>strong</strong> and <small>small</small> text
    </Text>
    <Label>
      Label <strong>strong</strong> and <small>small</small> text
    </Label>
    <Label styleAs="labelLarge">
      Label large <strong>strong</strong> and <small>small</small> text
    </Label>
    <TextNotation>
      Notation <strong>strong</strong> and <small>small</small> text
    </TextNotation>
    <TextAction>
      Action <strong>strong</strong> and <small>small</small> text
    </TextAction>
    <Code>
      Code <strong>strong</strong> and <small>small</small> text
    </Code>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};

export const EditorialVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={3200} width={2000} cols={1} vertical {...props}>
    <Editorial1>
      Editorial 1 <strong>strong</strong> <small>small</small>
    </Editorial1>
    <Editorial2>
      Editorial 2 <strong>strong</strong> <small>small</small>
    </Editorial2>
    <Editorial3>
      Editorial 3 <strong>strong</strong> <small>small</small>
    </Editorial3>
    <Editorial4>
      Editorial 4 <strong>strong</strong> <small>small</small>
    </Editorial4>
  </QAContainer>
);

EditorialVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
