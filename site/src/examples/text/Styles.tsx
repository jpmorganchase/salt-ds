import { ReactElement } from "react";
import {
  Display1,
  Display2,
  Display3,
  H1,
  H2,
  H3,
  H4,
  Text,
  Label,
  StackLayout,
} from "@salt-ds/core";

export const Styles = (): ReactElement => (
  <StackLayout>
    <Display1>Display 1</Display1>
    <Display2>Display 2</Display2>
    <Display3>Display 3</Display3>
    <H1>H1</H1>
    <H2>H2</H2>
    <H3>H3</H3>
    <H4>H4</H4>
    <Text>Text</Text>
    <Label>Label</Label>
  </StackLayout>
);
