import { Spinner } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
} from "docs/components";
import "./spinner.qa.stories.css";

export default {
  title: "Core/Spinner/Spinner QA",
  component: Spinner,
} as Meta<typeof Spinner>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} cols={4} {...props}>
    <Spinner className="noSpin" />
    <Spinner className="noSpin" size="small" />
    <Spinner className="noSpin" size="medium" />
    <Spinner className="noSpin" size="large" />
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props,
) => (
  <QAContainerNoStyleInjection height={500} width={1000} cols={4} {...props}>
    <Spinner className="noSpin" />
    <Spinner className="noSpin" size="small" />
    <Spinner className="noSpin" size="medium" />
    <Spinner className="noSpin" size="large" />
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
