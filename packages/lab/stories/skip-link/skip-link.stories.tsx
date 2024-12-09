import {
  Button,
  Divider,
  H2,
  H3,
  SplitLayout,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { SkipLink, SkipLinks } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { useRef } from "react";

export default {
  title: "Lab/Skip Link",
  component: SkipLink,
} as Meta<typeof SkipLink>;

export const Default: StoryFn<typeof SkipLink> = () => {
  const articleRef = useRef<HTMLElement>(null);

  return (
    <StackLayout style={{ maxWidth: 500 }}>
      <Text tabIndex={-1}>
        Click here and press the Tab key to see the Skip Link
      </Text>
      <div>
        <SkipLinks>
          <SkipLink data-testid="skipLink" href="#main" targetRef={articleRef}>
            Skip to main content
          </SkipLink>
        </SkipLinks>
        <Divider />
        <H2>What we do</H2>

        <article id="main" ref={articleRef}>
          <section>
            <H3>Salt</H3>
            <p>
              Salt provides you with a suite of UI components and a flexible
              theming system. With no customisation, the default theme offers an
              attractive and modern look-and-feel, with both light and dark
              variants and support for a range of UI densities. We have included
              a theming system which allows you to easily create theme
              variations, or in fact substitute alternate themes.
            </p>
          </section>
          <section>
            <H3>Goals</H3>
            <p>Salt has been developed with the following design goals:</p>
            <ul className="goalsList">
              <li>
                Providing a comprehensive set of commonly-used UI controls
              </li>
              <li>Complying with WCAG 2.1 accessibility guidelines</li>
              <li> To be lightweight and performant</li>
              <li> Offering flexible styling and theming support</li>
              <li> Minimizing dependencies on third-party libraries</li>
            </ul>
          </section>
        </article>
        <SplitLayout endItem={<Button style={{}}>Next</Button>} />
      </div>
    </StackLayout>
  );
};

export const MultipleLinks: StoryFn<typeof SkipLink> = () => {
  const sectionRef1 = useRef<HTMLElement>(null);
  const sectionRef2 = useRef<HTMLElement>(null);

  return (
    <StackLayout style={{ maxWidth: 500 }}>
      <Text tabIndex={-1}>
        Click here and press the Tab key to see the Skip Link
      </Text>
      <div>
        <SkipLinks>
          <SkipLink href="#introduction" targetRef={sectionRef1}>
            Skip to Introduction
          </SkipLink>
          <SkipLink href="#goals" targetRef={sectionRef2}>
            Skip to Goals
          </SkipLink>
        </SkipLinks>
        <Divider />
        <H2>What we do</H2>

        <article>
          <section id="intro" ref={sectionRef1}>
            <H3>Salt</H3>
            <p>
              Salt provides you with a suite of UI components and a flexible
              theming system. With no customisation, the default theme offers an
              attractive and modern look-and-feel, with both light and dark
              variants and support for a range of UI densities. We have included
              a theming system which allows you to easily create theme
              variations, or in fact substitute alternate themes.
            </p>
          </section>
          <section id="goals" ref={sectionRef2}>
            <H3>Goals</H3>
            <p>Salt has been developed with the following design goals:</p>
            <ul className="goalsList">
              <li>
                Providing a comprehensive set of commonly-used UI controls
              </li>
              <li>Complying with WCAG 2.1 accessibility guidelines</li>
              <li> To be lightweight and performant</li>
              <li> Offering flexible styling and theming support</li>
              <li> Minimizing dependencies on third-party libraries</li>
            </ul>
          </section>
        </article>
        <SplitLayout endItem={<Button style={{}}>Next</Button>} />
      </div>
    </StackLayout>
  );
};
