import { ComponentMeta, Story } from "@storybook/react";
import React, {
  ForwardedRef,
  forwardRef,
  useMemo,
  ComponentPropsWithoutRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { platform } from "@floating-ui/dom";
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
import { useWindow } from "@salt-ds/window";

import { NewWindow, TooltipWindow } from "./NewWindow";

export default {
  title: "Core/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

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

const NewWindowTest = (props: NewWindowTestProps) => {
  /*
   * This ref is a little awkward in that the platform needs the iframe element for correct positioning
   * but the iframe element isn't rendered until the tooltip is open which requires the Platform
   */
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);

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
        };
      },
    }),
    [iframe]
  );

  const rootBody = useWindow()?.document.body;

  const FloatingUIComponent = useMemo(
    () =>
      forwardRef(
        (
          { style, open, ...rest }: RootComponentProps,
          ref: ForwardedRef<HTMLIFrameElement>
        ) => {
          const FloatingRoot = (
            /* In thise case to avoid Flash of Unstyled Text (FOUT) in the tooltip, due to being in an iframe, we are always rendering the tooltip.
             * We are visually hiding it until it is open to 'eagerly load' the font
             * In a more realistic example e.g. desktop you would take a different approach e.g. re-using an existing window which could have fonts loaded in advance
             * Alternatively you could use the Font Loader API to check fonts have been loaded before showing the tooltip, or use a better fallback system font which would cause less layout shift
             */
            <TooltipWindow
              style={{
                ...style,
                border: "none",
                padding: 0,
                position: "fixed",
                ...(!open ? offscreenStyles : undefined),
              }}
              ref={ref}
            >
              {/* max-content allows tooltip to size itself, the TooltipWindow will resize to fit this */}
              <div style={{ width: "max-content" }} {...rest} />
            </TooltipWindow>
          );

          // In this case tooltip is portalled back to the root document this may not be the case if tooltips were opened as new windows
          return rootBody ? createPortal(FloatingRoot, rootBody) : null;
        }
      ),
    [rootBody]
  );

  return (
    <NewWindow ref={setIframe} style={{ height: 200 }}>
      <div style={{ padding: 10 }}>
        <StackLayout gap={3}>
          <H3>This is an iframe with a button</H3>
          <Text>It represents a portalled window within an application</Text>
          <FloatingPlatformProvider platform={customPlatform}>
            <FloatingComponentProvider Component={FloatingUIComponent}>
              <Tooltip {...props}>
                <Button>Hover Me</Button>
              </Tooltip>
            </FloatingComponentProvider>
          </FloatingPlatformProvider>
        </StackLayout>
      </div>
    </NewWindow>
  );
};

export const CustomFloatingUiPlatform: Story<TooltipProps> = (
  props: TooltipProps
) => {
  return (
    <StackLayout gap={2}>
      <H3>This is the root of the application</H3>
      <Text>It represents a global coordinate space (e.g. a users screen)</Text>
      <StackLayout gap={10} direction="row">
        <NewWindowTest {...props} />
      </StackLayout>
    </StackLayout>
  );
};
CustomFloatingUiPlatform.args = defaultArgs;
