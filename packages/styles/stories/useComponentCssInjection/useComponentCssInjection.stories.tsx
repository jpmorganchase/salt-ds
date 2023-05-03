import React, { useState } from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import Frame from "react-frame-component";
import { Button, StackLayout } from "@salt-ds/core";

import TestComponent from "./TestComponent";
import Root from "./Root";
import StyleHtmlRender from "./StyleHtmlRenderer";

export default {
  title: "Styles/CssInjection",
  component: TestComponent,
} as ComponentMeta<typeof TestComponent>;

const googleFonts = `
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=PT+Mono&display=swap"
  rel="stylesheet"
/>
`;

const initialContent = `
<!DOCTYPE html>
<html>
  <head>
    ${googleFonts}
  </head>
  <body>
  <div></div>
  </body>
</html>
`;

const testComponentCss = `
  .TestComponent1 {
    background-color: red;
  }
`;

const testComponentCss2 = `
  .TestComponent2 {
    background-color: blue;
  }
`;

const frameStyles = {
  width: 600,
  height: 600,
};

export const DuplicateIds: ComponentStory<typeof TestComponent> = () => {
  return (
    <Frame initialContent={initialContent} style={frameStyles}>
      <Root>
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss}
        />
        <TestComponent
          className="TestComponent2"
          injectionId="test-component"
          injectionCss={testComponentCss2}
        />
        <StyleHtmlRender />
      </Root>
    </Frame>
  );
};

export const NoIds: ComponentStory<typeof TestComponent> = () => {
  return (
    <Frame initialContent={initialContent} style={frameStyles}>
      <Root>
        <TestComponent
          className="TestComponent1"
          injectionCss={testComponentCss}
        />
        <TestComponent
          className="TestComponent2"
          injectionCss={testComponentCss2}
        />
        <StyleHtmlRender />
      </Root>
    </Frame>
  );
};

export const SaltComponent: ComponentStory<typeof TestComponent> = () => {
  return (
    <Frame initialContent={initialContent} style={frameStyles}>
      <Root>
        <Button>A Button</Button>
        <StyleHtmlRender />
      </Root>
    </Frame>
  );
};

export const RemovableComponent: ComponentStory<typeof TestComponent> = () => {
  const [isShowing, setIsShowing] = useState(true);

  return (
    <div>
      <StackLayout>
        <Button
          onClick={() => {
            setIsShowing(!isShowing);
          }}
        >
          Toggle Content
        </Button>
        <Frame initialContent={initialContent} style={frameStyles}>
          <Root>
            {isShowing && (
              <TestComponent
                className="TestComponent1"
                injectionId="test-component"
                injectionCss={testComponentCss}
              />
            )}
            <StyleHtmlRender />
          </Root>
        </Frame>
      </StackLayout>
    </div>
  );
};
