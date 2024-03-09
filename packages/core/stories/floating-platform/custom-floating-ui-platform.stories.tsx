import { Meta, StoryFn } from "@storybook/react";
import React, {
  forwardRef,
  useMemo,
  ComponentPropsWithoutRef,
  useState,
  Ref,
} from "react";
import { createPortal } from "react-dom";
import { platform, offset } from "@floating-ui/dom";
import { Platform } from "@floating-ui/react";

import {
  Button,
  FloatingPlatformProvider,
  Tooltip,
  TooltipProps,
  StackLayout,
  Text,
  H3,
  FloatingComponentProvider,
  FloatingComponentProps,
} from "@salt-ds/core";
import { ComboBoxNext, DropdownNext, Option } from "@salt-ds/lab";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import floatingCss from "./floating-platform.css";

import { NewWindow, FloatingComponentWindow } from "./NewWindow";

export default {
  title: "Core/Floating Platform",
  component: Tooltip,
} as Meta<typeof Tooltip>;

const defaultArgs: Omit<TooltipProps, "children"> = {
  content:
    "I am a tooltip, rendered into my own iframe within the global coordinate space",
  hideArrow: true,
};

type RootComponentProps = FloatingComponentProps &
  ComponentPropsWithoutRef<"div">;

type NewWindowTestProps = Pick<TooltipProps, "placement" | "content">;

const offscreenStyles: React.CSSProperties = {
  top: -9999,
  left: -9999,
  position: "fixed",
  opacity: 0,
};

const source = [
  "Baby blue",
  "Black",
  "Blue",
  "Brown",
  "Green",
  "Orange",
  "Pink",
  "Purple",
  "Red",
  "White",
  "Yellow",
];

const NewWindowTest = (props: NewWindowTestProps) => {
  /*
   * This ref is a little awkward in that the platform needs the iframe element for correct positioning
   * but the iframe element isn't rendered until the tooltip is open which requires the Platform
   */
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const [showExtraContent, setShowExtraContent] = useState(false);

  const rootBody = useWindow()?.document.body;

  const customPlatform: Platform = useMemo(
    () => ({
      ...platform,
      async getElementRects({ ...data }) {
        const result = await platform.getElementRects({
          ...data,
        });

        const referenceRect = data.reference.getBoundingClientRect();
        const iframeRect = iframe?.getBoundingClientRect();

        const reference = iframeRect
          ? {
              ...result.reference,
              x: referenceRect.x + iframeRect.x,
              y: referenceRect.y + iframeRect.y,
            }
          : result.reference;

        return {
          ...result,
          reference: reference,
          floating: {
            ...result.floating,
            x: 0,
            y: 0,
          },
        };
      },
      getDimensions: platform.getDimensions,
      getClippingRect: () => window.document.body.getBoundingClientRect(),
    }),
    [iframe]
  );

  const FloatingUIComponent = useMemo(
    () =>
      forwardRef<HTMLDivElement, RootComponentProps>(
        function FloatingUIComponent(
          {
            style,
            open,
            top,
            left,
            width,
            height,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            position,
            ...rest
          },
          ref
        ) {
          const FloatingRoot = (
            /* In thise case to avoid Flash of Unstyled Text (FOUT) in the tooltip, due to being in an iframe, we are always rendering the tooltip.
             * We are visually hiding it until it is open to 'eagerly load' the font
             * In a more realistic example e.g. desktop you would take a different approach e.g. re-using an existing window which could have fonts loaded in advance
             * Alternatively you could use the Font Loader API to check fonts have been loaded before showing the tooltip, or use a better fallback system font which would cause less layout shift
             */
            <FloatingComponentWindow
              style={{
                ...style,
                top,
                left,
                border: "none",
                padding: 0,
                position: "fixed",
                width,
                height,
                ...(!open ? offscreenStyles : undefined),
              }}
            >
              {/* max-content allows tooltip to size itself, the TooltipWindow will resize to fit this */}
              <div
                style={{ width: "max-content" }}
                {...rest}
                ref={ref as Ref<HTMLIFrameElement>}
              />
            </FloatingComponentWindow>
          );

          // In this case tooltip is portalled back to the root document this may not be the case if tooltips were opened as new windows
          return rootBody ? createPortal(FloatingRoot, rootBody) : null;
        }
      ),
    [rootBody]
  );

  const [value, setValue] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <NewWindow ref={setIframe} style={{ height: 300 }}>
      <div style={{ padding: 10 }}>
        <StackLayout gap={3}>
          <H3>This is an iframe with a button</H3>
          <Text>It represents a portalled window within an application</Text>
          {showExtraContent && <H3>Some Extra Content!</H3>}
          <FloatingPlatformProvider platform={customPlatform} animationFrame>
            <FloatingComponentProvider Component={FloatingUIComponent}>
              <Tooltip {...props} open>
                <Button
                  onClick={() => {
                    setShowExtraContent((old) => !old);
                  }}
                >
                  Click to show extra content
                </Button>
              </Tooltip>
              <ComboBoxNext disabled={false} onChange={handleChange}>
                {source
                  .filter((item) =>
                    item.toLowerCase().includes(value.trim().toLowerCase())
                  )
                  .map((item) => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
              </ComboBoxNext>
              <DropdownNext>
                {source.map((item) => (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                ))}
              </DropdownNext>
            </FloatingComponentProvider>
          </FloatingPlatformProvider>
        </StackLayout>
      </div>
    </NewWindow>
  );
};

export const CustomFloatingUiPlatform: StoryFn<typeof Tooltip> = (args) => {
  return (
    <NewWindow style={{ width: "600px", height: "550px", border: "none" }}>
      <StackLayout gap={2}>
        <H3>This is the root of the application</H3>
        <Text>
          It represents a global coordinate space (e.g. a users screen)
        </Text>
        <StackLayout gap={10} direction="row">
          <NewWindowTest {...args} />
        </StackLayout>
      </StackLayout>
    </NewWindow>
  );
};
CustomFloatingUiPlatform.args = defaultArgs;

export const AnimationFrame: StoryFn = () => {
  const targetWindow = useWindow();
  useComponentCssInjection({ css: floatingCss, window: targetWindow });

  return (
    <div className="animated-container">
      <FloatingPlatformProvider animationFrame>
        <StackLayout align="start" direction={"column"}>
          <Tooltip
            content="I move with the Button due to animationFrame being enabled"
            open
          >
            <Button>I am a moving button</Button>
          </Tooltip>
          <div style={{ width: 200, position: "relative" }}>
            <ComboBoxNext disabled={false}>
              {source.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </ComboBoxNext>
            <DropdownNext>
              {source.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </DropdownNext>
          </div>
        </StackLayout>
      </FloatingPlatformProvider>
    </div>
  );
};

export const CustomMiddleware: StoryFn = () => {
  const targetWindow = useWindow();
  useComponentCssInjection({ css: floatingCss, window: targetWindow });

  return (
    <FloatingPlatformProvider
      middleware={(defaultMiddleware) => [...defaultMiddleware, offset(100)]}
    >
      <StackLayout align="start" direction={"column"}>
        <div style={{ width: 200, position: "relative" }}>
          <ComboBoxNext disabled={false}>
            {source.map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </ComboBoxNext>
          <DropdownNext>
            {source.map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </DropdownNext>
        </div>
        <Tooltip content="I am offset due to custom middleware" open>
          <Button>I am a button</Button>
        </Tooltip>
      </StackLayout>
    </FloatingPlatformProvider>
  );
};
