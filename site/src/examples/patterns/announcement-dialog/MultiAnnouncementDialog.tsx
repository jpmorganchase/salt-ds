import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexItem,
  FlexLayout,
  H3,
  SplitLayout,
  StackLayout,
  type StackLayoutProps,
  Text,
  useResponsiveProp,
} from "@salt-ds/core";
import { type ElementType, useEffect, useRef, useState } from "react";
import { CloseButton } from "./AnnouncementDialog";
import importedStyles from "./example.module.css";

const exampleImage = "/img/examples/exampleImage4x.png";

const styles = importedStyles as unknown as Record<string, string>;

interface AnnouncementContent {
  preheader: string;
  header: string;
  subheader?: string;
  body: string;
}

const multiSlideAnnouncementContent: AnnouncementContent[] = [
  {
    preheader: "New feature",
    header: "Trade across markets",
    subheader: "Builder",
    body: "Create your own optimized corporate bond portfolios targeting specific characteristics using a wide range of parameters and constraints including yield, risk, churn, costs and more.",
  },
  {
    preheader: "New feature",
    header: "Seamless trade execution",
    subheader: "Trading",
    body: "Execute trades efficiently across multiple markets with smart routing technology and integrated compliance checks to ensure regulatory adherence.",
  },
  {
    preheader: "New feature",
    header: "Risk management tools",
    subheader: "Protection",
    body: "Monitor and manage risk exposure with advanced analytics, scenario modeling, and automated alerts that keep your portfolio within defined parameters.",
  },
];

export const MultiAnnouncementDialog = () => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const headingRef = useRef<HTMLSpanElement>(null);
  const navigatedRef = useRef(false);
  const currentSlide = multiSlideAnnouncementContent[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === multiSlideAnnouncementContent.length - 1;

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  // biome-ignore lint/correctness/useExhaustiveDependencies: Focus heading when active slide changes via navigation
  useEffect(() => {
    if (!navigatedRef.current) return;
    navigatedRef.current = false;
    headingRef.current?.focus();
  }, [activeIndex]);

  const handlePrevious = () => {
    if (!isFirst) {
      navigatedRef.current = true;
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      navigatedRef.current = true;
      setActiveIndex((prev) => prev + 1);
    }
  };

  const primaryLabel = isLast ? "Try it now" : "Next";

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader
          preheader={currentSlide.preheader}
          header={
            <span tabIndex={-1} ref={headingRef}>
              {currentSlide.header}
              <span className="salt-visuallyHidden">
                {`, slide ${activeIndex + 1} of ${multiSlideAnnouncementContent.length}`}
              </span>
            </span>
          }
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <FlexLayout direction={{ xs: "column", sm: "row" }}>
            <FlexItem grow={1} basis="50%" style={{ minWidth: 0 }}>
              <StackLayout gap={1}>
                {currentSlide.subheader && <H3>{currentSlide.subheader}</H3>}
                <Text>{currentSlide.body}</Text>
              </StackLayout>
            </FlexItem>
            <FlexItem
              grow={1}
              basis="50%"
              align="start"
              style={{ minWidth: 0 }}
            >
              <img
                alt=""
                src={exampleImage}
                className={styles.announcementImage}
              />
            </FlexItem>
          </FlexLayout>
        </DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              <Text color="secondary" style={{ textAlign: "center" }}>
                {`${activeIndex + 1} of ${multiSlideAnnouncementContent.length}`}
              </Text>
              <Button
                sentiment="accented"
                onClick={isLast ? () => setOpen(false) : handleNext}
                style={{ width: "100%" }}
              >
                {primaryLabel}
              </Button>
              {!isFirst && (
                <Button
                  sentiment="accented"
                  appearance="bordered"
                  onClick={handlePrevious}
                  style={{ width: "100%" }}
                >
                  Previous
                </Button>
              )}
              <Button
                sentiment="accented"
                appearance="transparent"
                onClick={() => setOpen(false)}
                style={{ width: "100%" }}
              >
                Go to dashboard
              </Button>
            </StackLayout>
          ) : (
            <SplitLayout
              startItem={
                <Button
                  sentiment="accented"
                  appearance="transparent"
                  onClick={() => setOpen(false)}
                >
                  Go to dashboard
                </Button>
              }
              endItem={
                <StackLayout direction="row" gap={3} align="center">
                  <Text color="secondary">
                    {`${activeIndex + 1} of ${multiSlideAnnouncementContent.length}`}
                  </Text>
                  <StackLayout direction="row" gap={1} align="center">
                    {!isFirst && (
                      <Button
                        sentiment="accented"
                        appearance="bordered"
                        onClick={handlePrevious}
                      >
                        Previous
                      </Button>
                    )}
                    <Button
                      sentiment="accented"
                      onClick={isLast ? () => setOpen(false) : handleNext}
                    >
                      {primaryLabel}
                    </Button>
                  </StackLayout>
                </StackLayout>
              }
            />
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
