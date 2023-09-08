import { ReactElement } from "react";
import { ExampleContainer } from "../../components/example-container";

export const CustomPillText = (): ReactElement => (
  <>
    <ExampleContainer type="positive" customPillText="Good">
      Positive example content
    </ExampleContainer>
    <ExampleContainer type="negative" customPillText="Bad">
      Negative example content
    </ExampleContainer>
    <ExampleContainer type="neutral" customPillText="Neutral">
      Neutral example content
    </ExampleContainer>
  </>
);
