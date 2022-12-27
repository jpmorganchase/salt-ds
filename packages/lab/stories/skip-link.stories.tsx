import { useRef } from "react";
import { Button } from "@salt-ds/core";
import { SkipLink, SkipLinks } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import "./skip-link.stories.css";

export default {
  title: "Lab/Skip Link",
  component: SkipLink,
} as Meta<typeof SkipLink>;

export const Default: StoryFn<typeof SkipLink> = () => {
  const articleRef = useRef<HTMLElement>(null);

  return (
    <>
      <span style={{ height: 50, lineHeight: "50px" }} tabIndex={-1}>
        Click here and press the Tab key to see the Skip Link
      </span>
      <div style={{ position: "relative", maxWidth: 500 }}>
        <SkipLinks>
          <SkipLink data-testid="skipLink" href="#main" targetRef={articleRef}>
            Skip to main content
          </SkipLink>
        </SkipLinks>

        <div
          style={{
            borderTop: "2px solid grey",
            fontSize: 24,
            lineHeight: 3.5,
          }}
        >
          What we do
        </div>

        <article id="main" ref={articleRef}>
          <section>
            <h1>Salt</h1>
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
            <h1>Goals</h1>
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
        <div style={{ overflow: "auto" }}>
          <Button style={{ marginTop: 30, float: "right" }}>Next</Button>
        </div>
      </div>
    </>
  );
};

export const MultipleLinks: StoryFn<typeof SkipLink> = () => {
  const sectionRef1 = useRef<HTMLElement>(null);
  const sectionRef2 = useRef<HTMLElement>(null);

  return (
    <>
      <span style={{ height: 50, lineHeight: "50px" }} tabIndex={-1}>
        Click here and press the Tab key to see the Skip Link
      </span>
      <div style={{ position: "relative", maxWidth: 500 }}>
        <SkipLinks>
          <SkipLink href="#introduction" targetRef={sectionRef1}>
            Skip to Introduction
          </SkipLink>
          <SkipLink href="#goals" targetRef={sectionRef2}>
            Skip to Goals
          </SkipLink>
        </SkipLinks>

        <div
          style={{
            borderTop: "2px solid grey",
            fontSize: 24,
            lineHeight: 3.5,
          }}
        >
          What we do
        </div>

        <article>
          <section id="introduction" ref={sectionRef1}>
            <h1>Salt</h1>
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
            <h1>Goals</h1>
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
        <div style={{ overflow: "auto" }}>
          <Button style={{ marginTop: 30, float: "right" }}>Next</Button>
        </div>
      </div>
    </>
  );
};
