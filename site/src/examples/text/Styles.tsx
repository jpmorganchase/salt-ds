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
  StackLayout,
  Text,
  TextAction,
  TextNotation,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Styles = (): ReactElement => (
  <StackLayout>
    <Editorial1>Editorial 1</Editorial1>
    <Editorial2>Editorial 2</Editorial2>
    <Editorial3>Editorial 3</Editorial3>
    <Editorial4>Editorial 4</Editorial4>
    <Display1>Display 1</Display1>
    <Display2>Display 2</Display2>
    <Display3>Display 3</Display3>
    <Display4>Display 4</Display4>
    <H1>H1</H1>
    <H2>H2</H2>
    <H3>H3</H3>
    <H4>H4</H4>
    <Eyebrow>Eyebrow</Eyebrow>
    <Text styleAs="bodyLarge">Body large</Text>
    <Text>Text</Text>
    <Label styleAs="labelLarge">Label large</Label>
    <Label>Label</Label>
    <Code>Code</Code>
    <TextNotation>Notation</TextNotation>
    <TextAction>Action</TextAction>
  </StackLayout>
);
