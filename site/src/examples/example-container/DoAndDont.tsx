import { ReactElement } from "react";
import { FlexLayout, FlexItem } from "@salt-ds/core";
import { ExampleContainer } from "../../components/example-container";

export const DoAndDont = (): ReactElement => (
  <>
    <p>
      Simplify sentences, keeping them as short as possible, so they aren’t
      complex or convoluted. You should also limit the number of challenging
      words—with more than four syllables, for example—that you have in one
      sentence.
    </p>
    <FlexLayout>
      <FlexItem basis="50%">
        <ExampleContainer type="positive">
          <p>
            Our newly built Accordion component displays a series of panes
            containing summary content.
          </p>
          <p>
            Users can expand or collapse the panes to show or hide content. This
            allows them to control the complexity of a given view to suit their
            needs.
          </p>
        </ExampleContainer>
        <p>Three relatively short sentences split into two paragraphs.</p>
      </FlexItem>
      <FlexItem basis="50%">
        <ExampleContainer type="negative">
          <p>
            Our newly built Accordion component displays a series of panes
            containing summary content, which can then be expanded or collapsed
            to allow the user to show or hide content and control the complexity
            of a given view to suit their needs.
          </p>
        </ExampleContainer>
        <p>One sentence, with 41 words.</p>
      </FlexItem>
    </FlexLayout>
  </>
);
