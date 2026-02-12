import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexItem,
  H3,
  SplitLayout,
  StackLayout,
  type StackLayoutProps,
  Text,
  useResponsiveProp,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type ElementType, useState } from "react";
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
    header: "Seamless Trade Execution",
    subheader: "Trading",
    body: "Execute trades efficiently across multiple markets with smart routing technology and integrated compliance checks to ensure regulatory adherence.",
  },
  {
    preheader: "New feature",
    header: "Risk Management Tools",
    subheader: "Protection",
    body: "Monitor and manage risk exposure with advanced analytics, scenario modeling, and automated alerts that keep your portfolio within defined parameters.",
  },
];

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <Button aria-label="Close dialog" appearance="transparent" onClick={onClick}>
    <CloseIcon aria-hidden />
  </Button>
);

export const AnnouncementDialog: StoryFn = () => {
  const [open, setOpen] = useState(true);

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
          <SplitLayout
            direction={{ xs: "column", sm: "row" }}
            startItem={
              <StackLayout gap={1} className="announcementContent">
                <H3 style={{ margin: "0" }}>Builder</H3>
                <Text>
                  Create your own optimised corporate bond portfolios targeting
                  specific characteristics using a wide range of parameters and
                  constraints including Yield, Risk, churn, costs and more.
                </Text>
                <Text>
                  Our advanced algorithm analyzes market conditions in real-time
                  to suggest optimal portfolio compositions. You can set custom
                  thresholds for risk tolerance, expected returns, and
                  diversification requirements.
                </Text>
                <Text>
                  Get started today and discover how easy it is to build
                  institutional-grade portfolios with just a few clicks. Your
                  team can collaborate on shared portfolios and track
                  performance across all your investments.
                </Text>
              </StackLayout>
            }
            endItem={
              <img alt="" src={exampleImage} className="announcementImage" />
            }
          />
        </DialogContent>
        <DialogActions>
          <Button sentiment="accented">Try it now</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const MultiAnnouncementDialog: StoryFn = () => {
  const [open, setOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentSlide = multiSlideAnnouncementContent[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === multiSlideAnnouncementContent.length - 1;

  const handlePrevious = () => {
    if (!isFirst) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader
          preheader={currentSlide.preheader}
          header={currentSlide.header}
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <SplitLayout
            direction={{ xs: "column", sm: "row" }}
            startItem={
              <StackLayout gap={1} className="announcementContent">
                {currentSlide.subheader && (
                  <H3 style={{ margin: "0 0 var(--salt-spacing-100) 0" }}>
                    {currentSlide.subheader}
                  </H3>
                )}
                <Text>{currentSlide.body}</Text>
              </StackLayout>
            }
            endItem={
              <img alt="" src={exampleImage} className="announcementImage" />
            }
          />
        </DialogContent>
        <DialogActions>
          <SplitLayout
            startItem={
              <Button sentiment="accented" appearance="transparent">
                Go to Dashboard
              </Button>
            }
            endItem={
              <StackLayout direction="row" gap={1} align="center">
                <Text
                  role="status"
                  color="secondary"
                  style={{ marginRight: "var(--salt-spacing-200)" }}
                >
                  {activeIndex + 1}/{multiSlideAnnouncementContent.length}
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
                {!isLast && (
                  <Button
                    sentiment="accented"
                    onClick={handleNext}
                    disabled={isLast}
                  >
                    Next
                  </Button>
                )}
              </StackLayout>
            }
            style={{ width: "100%" }}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export const WithDisclaimer: StoryFn = () => {
  const [open, setOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentSlide = multiSlideAnnouncementContent[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === multiSlideAnnouncementContent.length - 1;

  const handlePrevious = () => {
    if (!isFirst) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const disclaimer =
    "By continuing, you agree to our Terms of Service and Privacy Policy. Your use of these features is subject to applicable regulations and may vary by jurisdiction. Market data is provided for informational purposes only and should not be construed as investment advice. Past performance is not indicative of future results. Please consult with a qualified financial advisor before making investment decisions.";

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader
          preheader={currentSlide.preheader}
          header={currentSlide.header}
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <SplitLayout
            direction={{ xs: "column", sm: "row" }}
            startItem={
              <StackLayout gap={1} className="announcementContent">
                {currentSlide.subheader && (
                  <H3 style={{ margin: "0 0 var(--salt-spacing-100) 0" }}>
                    {currentSlide.subheader}
                  </H3>
                )}
                <Text>{currentSlide.body}</Text>
              </StackLayout>
            }
            endItem={
              <img alt="" src={exampleImage} className="announcementImage" />
            }
          />
        </DialogContent>
        <DialogActions>
          <StackLayout gap={2} style={{ width: "100%" }}>
            <SplitLayout
              startItem={
                <Button sentiment="accented" appearance="transparent">
                  Go to Dashboard
                </Button>
              }
              endItem={
                <StackLayout direction="row" gap={1} align="center">
                  <Text
                    color="secondary"
                    style={{ marginRight: "var(--salt-spacing-200)" }}
                  >
                    {activeIndex + 1}/{multiSlideAnnouncementContent.length}
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
                  {!isLast && (
                    <Button
                      sentiment="accented"
                      onClick={handleNext}
                      disabled={isLast}
                    >
                      Next
                    </Button>
                  )}
                </StackLayout>
              }
              style={{ width: "100%" }}
            />
            <Text>{disclaimer}</Text>
          </StackLayout>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const FullImage: StoryFn = () => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen} style={{ maxWidth: 400 }}>
        <DialogHeader
          preheader="Product Update"
          header="New Dashboard Experience"
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
          <Button sentiment="accented">Try It Now</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ContentScrolling: StoryFn = () => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen} style={{ maxHeight: 420 }}>
        <DialogHeader
          preheader="Major Update"
          header="What's New in Version 3.0"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <SplitLayout
            direction={{ xs: "column", sm: "row" }}
            startItem={
              <StackLayout gap={1} className="announcementContent">
                <H3 style={{ margin: "0 0 var(--salt-spacing-100) 0" }}>
                  Analytics Engine
                </H3>
                <Text>
                  The new analytics engine processes data up to 10x faster than
                  before, enabling real-time insights that help you make
                  informed decisions quickly. With our improved visualization
                  tools, you can create stunning charts that communicate complex
                  information.
                </Text>
                <H3>Collaboration Features</H3>
                <Text>
                  Share insights seamlessly across your organization with
                  enhanced collaboration tools. Team members can annotate data,
                  create shared workspaces, and receive real-time notifications
                  when important metrics change. Export capabilities support
                  multiple formats including PDF, Excel, and interactive web
                  reports. Version control ensures everyone works with the most
                  up-to-date information.
                </Text>
                <H3>Security & Compliance</H3>
                <Text>
                  Enhanced security protocols and compliance certifications
                  ensure your data remains protected and meets industry
                  standards.
                </Text>
              </StackLayout>
            }
            endItem={
              <img alt="" src={exampleImage} className="announcementImage" />
            }
          />
        </DialogContent>
        <DialogActions>
          <Button sentiment="accented">Got It</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ResponsiveStackedContent: StoryFn = () => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Announcement Trigger</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader
          preheader="Product Update"
          header="Change the viewport to see how the content stacks"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <SplitLayout
            direction={{ xs: "column", sm: "row" }}
            startItem={
              <StackLayout gap={1} className="announcementContent">
                <Text>
                  We're excited to announce a powerful new analytics dashboard
                  that helps you visualize your data in real-time.
                </Text>
              </StackLayout>
            }
            endItem={
              <img alt="" src={exampleImage} className="announcementImage" />
            }
          />
        </DialogContent>
        <DialogActions>
          <Button sentiment="accented">Get Started</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ResponsiveStackedButtonBar: StoryFn = () => {
  const [open, setOpen] = useState(true);

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
          preheader="Product Update"
          header="Change the viewport to see how the buttons stack"
          actions={<CloseButton onClick={() => setOpen(false)} />}
          disableAccent
        />
        <DialogContent>
          <SplitLayout
            direction={{ xs: "column", sm: "row" }}
            startItem={
              <StackLayout gap={1} className="announcementContent">
                <Text>
                  We're excited to announce a powerful new analytics dashboard
                  that helps you visualize your data in real-time.
                </Text>
              </StackLayout>
            }
            endItem={
              <img alt="" src={exampleImage} className="announcementImage" />
            }
          />
        </DialogContent>
        <DialogActions>
          {direction === "column" ? (
            <StackLayout direction="column" gap={1} style={{ width: "100%" }}>
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
              style={{ width: "100%" }}
            />
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};
