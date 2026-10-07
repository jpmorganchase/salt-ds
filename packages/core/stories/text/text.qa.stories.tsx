import {
  Code,
  Display1,
  Display2,
  Display3,
  Display4,
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
import type { ReactNode } from "react";

const LighterText = ({ children }: { children: ReactNode }) => (
  <Text as="span" styleAs="inherit" fontWeight="lighter">
    {children}
  </Text>
);

export default {
  title: "Core/Text/Text QA",
  component: Text,
} as Meta<typeof Text>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} cols={1} {...props}>
    <Text>
      Primary <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Text>
    <Text disabled>
      Primary disabled <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Text>
    <Text color="secondary">
      Secondary <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Text>
    <Text color="secondary" disabled>
      Secondary disabled <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Text>
    <Text color="info">
      Info <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Text>
    <Text color="error">
      Error <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Text>
    <Text color="warning">
      Warning <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Text>
    <Text color="success">
      Success <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Text>
    <Text color="inherit">
      Inherit <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Text>
    <Display1>
      Display 1 <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Display1>
    <Display2>
      Display 2 <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Display2>
    <Display3>
      Display 3 <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Display3>
    <Display4>
      Display 4 <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Display4>
    <H1>
      H1 <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </H1>
    <H2>
      H2 <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </H2>
    <H3>
      H3 <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </H3>
    <H4>
      H4 <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </H4>
    <Label>
      Label <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Label>
    <TextNotation>
      Notation <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </TextNotation>
    <TextAction>
      Action <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </TextAction>
    <Code>
      Code <strong>strong</strong>, <b>b</b> and{" "}
      <LighterText>lighter</LighterText> text
    </Code>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};

export const FontWeightGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={1500} width={1000} cols={1} {...props}>
    <Text fontWeight="lighter">Body lighter text</Text>
    <Text fontWeight="bolder">
      Body bolder text with <b>b</b>
    </Text>
    <Display1 fontWeight="lighter">Display 1 lighter text</Display1>
    <Display1 fontWeight="bolder">
      Display 1 bolder text with <b>b</b>
    </Display1>
    <Display2 fontWeight="lighter">Display 2 lighter text</Display2>
    <Display2 fontWeight="bolder">
      Display 2 bolder text with <b>b</b>
    </Display2>
    <Display3 fontWeight="lighter">Display 3 lighter text</Display3>
    <Display3 fontWeight="bolder">
      Display 3 bolder text with <b>b</b>
    </Display3>
    <Display4 fontWeight="lighter">Display 4 lighter text</Display4>
    <Display4 fontWeight="bolder">
      Display 4 bolder text with <b>b</b>
    </Display4>
    <H1 fontWeight="lighter">H1 lighter text</H1>
    <H1 fontWeight="bolder">
      H1 bolder text with <b>b</b>
    </H1>
    <H2 fontWeight="lighter">H2 lighter text</H2>
    <H2 fontWeight="bolder">
      H2 bolder text with <b>b</b>
    </H2>
    <H3 fontWeight="lighter">H3 lighter text</H3>
    <H3 fontWeight="bolder">
      H3 bolder text with <b>b</b>
    </H3>
    <H4 fontWeight="lighter">H4 lighter text</H4>
    <H4 fontWeight="bolder">
      H4 bolder text with <b>b</b>
    </H4>
    <Label fontWeight="lighter">Label lighter text</Label>
    <Label fontWeight="bolder">
      Label bolder text with <b>b</b>
    </Label>
    <TextNotation fontWeight="lighter">Notation lighter text</TextNotation>
    <TextNotation fontWeight="bolder">
      Notation bolder text with <b>b</b>
    </TextNotation>
    <TextAction fontWeight="lighter">Action lighter text</TextAction>
    <TextAction fontWeight="bolder">
      Action bolder text with <b>b</b>
    </TextAction>
    <Text color="secondary">
      Body text with{" "}
      <Text as="span" styleAs="inherit" fontWeight="lighter">
        inherited lighter
      </Text>{" "}
      and{" "}
      <Text as="span" styleAs="inherit" fontWeight="bolder">
        inherited bolder
      </Text>{" "}
      text
    </Text>
    <H1 color="secondary">
      H1 text with{" "}
      <Text as="span" styleAs="inherit" fontWeight="lighter">
        inherited lighter
      </Text>{" "}
      text
    </H1>
    <Display2>
      Display 2 text with{" "}
      <Text as="span" styleAs="inherit" fontWeight="bolder">
        inherited bolder
      </Text>{" "}
      text
    </Display2>
    <Label>
      Label text with{" "}
      <Text as="span" styleAs="inherit" fontWeight="lighter">
        inherited lighter
      </Text>{" "}
      text
    </Label>
    <TextAction>
      Action text with{" "}
      <Text as="span" styleAs="inherit" fontWeight="lighter">
        inherited lighter
      </Text>{" "}
      text
    </TextAction>
    <Text styleAs="h2" fontWeight="bolder">
      Text styled as H2 bolder text
    </Text>
    <H2 styleAs="label" fontWeight="lighter">
      H2 styled as label lighter text
    </H2>
    <Text>
      Body <small>small</small> text
    </Text>
    <H1>
      H1 <small>small</small> text
    </H1>
    <Label>
      Label <small>small</small> text
    </Label>
    <TextNotation>
      Notation <small>small</small> text
    </TextNotation>
    <TextAction>
      Action <small>small</small> text
    </TextAction>
    <Display1>
      Display 1 <small>small</small> text
    </Display1>
  </QAContainer>
);

FontWeightGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
