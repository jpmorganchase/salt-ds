import {
  Button,
  FlexLayout,
  H2,
  StackLayout,
  Text,
  useIcon,
  useId,
} from "@salt-ds/core";
import {
  type ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { useCallback, useRef, useState } from "react";
import { ContentExample } from "./ContentExample";

const ANIMATION_DURATION = 300;

export const Resizable = () => {
  const headingId = useId();
  const { CloseIcon } = useIcon();
  const panelRef = useRef<ImperativePanelHandle>(null);
  const [expanded, setExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const toggle = useCallback(() => {
    if (!panelRef.current) return;
    clearTimeout(timerRef.current);
    const willExpand = !expanded;
    // Set minSize to 0 before resize so the panel can reach 0
    setAnimating(true);
    setExpanded(willExpand);
    // Use rAF to ensure minSize=0 is applied before resize(0)
    requestAnimationFrame(() => {
      if (willExpand) {
        panelRef.current?.resize(30);
      } else {
        panelRef.current?.resize(0);
      }
    });
    timerRef.current = setTimeout(() => setAnimating(false), ANIMATION_DURATION);
  }, [expanded]);

  const panelTransition = animating
    ? `flex-grow ${ANIMATION_DURATION}ms ease-in-out`
    : undefined;

  return (
    <div
      className="react-resizable-panels-theme-salt"
      style={{
        width: "100%",
        height: 300,
        border:
          "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
        borderRadius: "var(--salt-palette-corner-weak)",
        overflow: "hidden",
      }}
    >
      <PanelGroup direction="horizontal">
        <Panel style={{ transition: panelTransition }}>
          <ContentExample>
            <Button
              style={{ width: "fit-content" }}
              onClick={toggle}
            >
              {expanded ? "Close" : "Open"} right panel
            </Button>
          </ContentExample>
        </Panel>
        <PanelResizeHandle
          aria-label="Resize panel"
          className="resize-handle-salt-border-left"
          disabled={animating || !expanded}
          style={{
            width: expanded || animating ? undefined : 0,
            visibility: expanded || animating ? "visible" : "hidden",
          }}
        />
        <Panel
          ref={panelRef}
          defaultSize={0}
          minSize={expanded && !animating ? 15 : 0}
          maxSize={expanded || animating ? 50 : 0}
          style={{
            backgroundColor: "var(--salt-container-primary-background)",
            borderLeft: expanded
              ? "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)"
              : undefined,
            overflow: "hidden",
            transition: panelTransition,
          }}
        >
          <div
            style={{
              padding: "var(--salt-spacing-300)",
              height: "100%",
              boxSizing: "border-box",
              overflow: "auto",
              minWidth: "max-content",
            }}
          >
            <StackLayout>
              <FlexLayout align="center">
                <H2 id={headingId} style={{ flex: 1 }}>
                  Section Title
                </H2>
                <Button
                  aria-label="Close"
                  appearance="transparent"
                  onClick={toggle}
                >
                  <CloseIcon aria-hidden />
                </Button>
              </FlexLayout>
              <Text>Side panel content goes here.</Text>
            </StackLayout>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

