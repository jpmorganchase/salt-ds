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
import { CloseIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ElementType, useEffect, useRef, useState } from "react";
import exampleImage from "../../assets/exampleImage4x.png";
import "./announcement-dialog.stories.css";

export default {
  title: "Patterns/Announcement Dialog",
} as Meta;

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
    body: "Create your own optimised corporate bond portfolios targeting specific characteristics using a wide range of parameters and constraints including Yield, Risk, churn, costs and more.",
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

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <Button aria-label="Close" appearance="transparent" onClick={onClick}>
    <CloseIcon aria-hidden />
  </Button>
);

export const AnnouncementDialog: StoryFn = () => {
  const [open, setOpen] = useState(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader
          preheader="New feature"
          header="Trade across markets"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <FlexLayout direction={{ xs: "column", sm: "row" }}>
            <FlexItem grow={1} basis="50%" style={{ minWidth: 0 }}>
              <StackLayout gap={1}>
                <H3 className="announcementHeading">Builder</H3>
                <Text>
                  Create your own optimised corporate bond portfolios targeting
                  specific characteristics using a wide range of parameters and
                  constraints including Yield, Risk, churn, costs and more.
                </Text>
              </StackLayout>
            </FlexItem>
            <FlexItem
              grow={1}
              basis="50%"
              align="start"
              style={{ minWidth: 0 }}
            >
              <img alt="" src={exampleImage} className="announcementImage" />
            </FlexItem>
          </FlexLayout>
        </DialogContent>
        <DialogActions>
          <Button
            sentiment="accented"
            style={direction === "column" ? { width: "100%" } : undefined}
          >
            Try it now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const MultiAnnouncementDialog: StoryFn = () => {
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
                {currentSlide.subheader && (
                  <H3 className="announcementHeading">
                    {currentSlide.subheader}
                  </H3>
                )}
                <Text>{currentSlide.body}</Text>
              </StackLayout>
            </FlexItem>
            <FlexItem
              grow={1}
              basis="50%"
              align="start"
              style={{ minWidth: 0 }}
            >
              <img alt="" src={exampleImage} className="announcementImage" />
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
                onClick={isLast ? undefined : handleNext}
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
                style={{ width: "100%" }}
              >
                Go to dashboard
              </Button>
            </StackLayout>
          ) : (
            <SplitLayout
              startItem={
                <Button sentiment="accented" appearance="transparent">
                  Go to dashboard
                </Button>
              }
              endItem={
                <StackLayout direction="row" gap={1} align="center">
                  <Text
                    color="secondary"
                    style={{ marginRight: "var(--salt-spacing-200)" }}
                  >
                    {`${activeIndex + 1} of ${multiSlideAnnouncementContent.length}`}
                  </Text>
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
                    onClick={isLast ? undefined : handleNext}
                  >
                    {primaryLabel}
                  </Button>
                </StackLayout>
              }
            />
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export const FullImage: StoryFn = () => {
  const [open, setOpen] = useState(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen} style={{ maxWidth: 400 }}>
        <DialogHeader
          preheader="Product update"
          header="New dashboard experience"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <StackLayout>
            <Text>
              Experience a completely redesigned dashboard with improved
              navigation, faster loading times, and a cleaner interface that
              helps you focus on what matters most.
            </Text>
            <img alt="" src={exampleImage} />
          </StackLayout>
        </DialogContent>
        <DialogActions>
          <Button
            sentiment="accented"
            style={direction === "column" ? { width: "100%" } : undefined}
          >
            Try it now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ContentScrolling: StoryFn = () => {
  const [open, setOpen] = useState(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen} style={{ maxHeight: 420 }}>
        <DialogHeader
          preheader="Major update"
          header="What's new in version 3.0"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <FlexLayout direction={{ xs: "column", sm: "row" }}>
            <FlexItem grow={1} basis="50%" style={{ minWidth: 0 }}>
              <StackLayout gap={1}>
                <H3 className="announcementHeading">Analytics engine</H3>
                <Text>
                  The new analytics engine processes data up to 10x faster than
                  before, enabling real-time insights that help you make
                  informed decisions quickly. With our improved visualization
                  tools, you can create stunning charts that communicate complex
                  information.
                </Text>
                <H3 className="announcementHeading">Collaboration features</H3>
                <Text>
                  Share insights seamlessly across your organization with
                  enhanced collaboration tools. Team members can annotate data,
                  create shared workspaces, and receive real-time notifications
                  when important metrics change. Export capabilities support
                  multiple formats including PDF, Excel, and interactive web
                  reports. Version control ensures everyone works with the most
                  up-to-date information.
                </Text>
                <H3 className="announcementHeading">Security & compliance</H3>
                <Text>
                  Enhanced security protocols and compliance certifications
                  ensure your data remains protected and meets industry
                  standards.
                </Text>
                <H3 className="announcementHeading">
                  Performance & reliability
                </H3>
                <Text>
                  Faster load times and fewer outages keep your team productive.
                  We maintain high availability and optimise resource use across
                  all environments.
                </Text>
                <H3 className="announcementHeading">Accessibility & theming</H3>
                <Text>
                  Built-in support for screen readers, keyboard navigation, and
                  high-contrast modes. Customise colours, density, and layout to
                  match your brand and user needs.
                </Text>
              </StackLayout>
            </FlexItem>
            <FlexItem
              grow={1}
              basis="50%"
              align="start"
              style={{ minWidth: 0 }}
            >
              <img alt="" src={exampleImage} className="announcementImage" />
            </FlexItem>
          </FlexLayout>
        </DialogContent>
        <DialogActions>
          <Button
            sentiment="accented"
            style={direction === "column" ? { width: "100%" } : undefined}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ResponsiveStackedContent: StoryFn = () => {
  const [open, setOpen] = useState(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader
          preheader="Product update"
          header="Change the viewport to see how the content stacks"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <FlexLayout direction={{ xs: "column", sm: "row" }}>
            <FlexItem grow={1} basis="50%" style={{ minWidth: 0 }}>
              <StackLayout gap={1}>
                <Text>
                  We're excited to announce a powerful new analytics dashboard
                  that helps you visualize your data in real-time.
                </Text>
              </StackLayout>
            </FlexItem>
            <FlexItem
              grow={1}
              basis="50%"
              align="start"
              style={{ minWidth: 0 }}
            >
              <img alt="" src={exampleImage} className="announcementImage" />
            </FlexItem>
          </FlexLayout>
        </DialogContent>
        <DialogActions>
          <Button
            sentiment="accented"
            style={direction === "column" ? { width: "100%" } : undefined}
          >
            Get started
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ResponsiveStackedButtonBar: StoryFn = () => {
  const [open, setOpen] = useState(false);

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp({ xs: "column", sm: "row" }, "row");

  const remindMeLater = (
    <FlexItem>
      <Button
        sentiment="accented"
        appearance="transparent"
        style={{ width: "100%" }}
      >
        Remind me later
      </Button>
    </FlexItem>
  );

  const goToDashboard = (
    <FlexItem>
      <Button
        sentiment="accented"
        appearance="bordered"
        style={{ width: "100%" }}
      >
        Go to dashboard
      </Button>
    </FlexItem>
  );

  const tryItNow = (
    <FlexItem>
      <Button sentiment="accented" style={{ width: "100%" }}>
        Try it now
      </Button>
    </FlexItem>
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader
          preheader="Product update"
          header="Change the viewport to see how the buttons stack"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <FlexLayout direction={{ xs: "column", sm: "row" }}>
            <FlexItem grow={1} basis="50%" style={{ minWidth: 0 }}>
              <StackLayout gap={1}>
                <Text>
                  We're excited to announce a powerful new analytics dashboard
                  that helps you visualize your data in real-time.
                </Text>
              </StackLayout>
            </FlexItem>
            <FlexItem
              grow={1}
              basis="50%"
              align="start"
              style={{ minWidth: 0 }}
            >
              <img alt="" src={exampleImage} className="announcementImage" />
            </FlexItem>
          </FlexLayout>
        </DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout gap={1} style={{ width: "100%" }}>
              {tryItNow}
              {goToDashboard}
              {remindMeLater}
            </StackLayout>
          ) : (
            <SplitLayout
              startItem={remindMeLater}
              endItem={
                <StackLayout direction="row" gap={1}>
                  {goToDashboard}
                  {tryItNow}
                </StackLayout>
              }
            />
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
