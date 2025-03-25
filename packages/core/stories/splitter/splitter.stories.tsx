import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout,
  type ImperativePanelHandle,
  SplitHandle,
  SplitPanel,
  Splitter,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import {
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
  EditIcon,
  InboxIcon,
  SendIcon,
} from "@salt-ds/icons";
import type { Meta } from "@storybook/react";
import clsx from "clsx";
import { useRef, useState } from "react";

import "./splitter.stories.css";

export default {
  title: "Core/Splitter",
  components: Splitter,
  subcomponents: {
    SplitPanel,
    SplitHandle,
  },
} as Meta<typeof Splitter>;

export function Horizontal() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="horizontal">
        <SplitPanel id="top" className="center">
          <Text>Top</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Top/Center" />
        <SplitPanel id="center" className="center">
          <Text>Center</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Center/Bottom" />
        <SplitPanel id="bottom" className="center">
          <Text>Bottom</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Vertical() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical">
        <SplitPanel id="left" className="center">
          <Text>Left</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Left/Center" />
        <SplitPanel id="center" className="center">
          <Text>Center</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Center/Right" />
        <SplitPanel id="right" className="center">
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function MultipleOrientations() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical">
        <SplitPanel>
          <Splitter orientation="horizontal">
            <SplitPanel className="center">
              <Text>Top Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Center Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Bottom Left</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel>
          <Splitter orientation="horizontal">
            <SplitPanel className="center">
              <Text>Top Right</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Bottom Right</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Transparent() {
  return (
    <FlexLayout className="box boxSecondary">
      <Splitter orientation="vertical" appearance="transparent">
        <SplitPanel>
          <Splitter orientation="horizontal">
            <SplitPanel className="center">
              <Text>Top Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Center Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Bottom Left</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel>
          <Splitter orientation="horizontal">
            <SplitPanel className="center">
              <Text>Top Right</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Bottom Right</Text>
            </SplitPanel>
          </Splitter>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Border() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical">
        <SplitPanel id="left" minSize={0} defaultSize={25} className="center">
          <Text>Left</Text>
        </SplitPanel>
        <SplitHandle border="right" />
        <SplitPanel minSize={50} className="center">
          <Text>Center</Text>
        </SplitPanel>
        <SplitHandle border="left" />
        <SplitPanel minSize={0} defaultSize={25} className="center">
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Variant() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical">
        <SplitPanel variant="primary" className="center">
          <Text>Primary</Text>
        </SplitPanel>
        <SplitHandle variant="secondary" border="left" />
        <SplitPanel variant="secondary" className="center">
          <Text>Secondary</Text>
        </SplitPanel>
        <SplitHandle variant="tertiary" border="left" />
        <SplitPanel variant="tertiary" className="center">
          <Text>Tertiary</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function Size() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical" appearance="bordered">
        <SplitPanel minSize={20} className="center">
          <Text>Left [20%, X]</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel id="center" minSize={40} maxSize={60} className="center">
          <Text>Center [30%, 60%]</Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel minSize={20} className="center">
          <Text>Right [20%, X]</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function CollapsibleSetSize() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical" appearance="bordered">
        <SplitPanel
          collapsible
          collapsedSize={15}
          minSize={30}
          maxSize={50}
          className="center"
        >
          <Text>
            Left <br />
            {"[30, 50]"} <br />
            {"{15%}"}
          </Text>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel className="center">
          <Text>Right</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function CollapsibleContainerQuery() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical" appearance="bordered">
        <SplitPanel
          collapsible
          collapsedSize={10}
          defaultSize={30}
          minSize={20}
          maxSize={50}
          className="sidePanel"
        >
          <ToggleButtonGroup orientation="vertical" defaultValue="inbox">
            <ToggleButton value="inbox">
              <InboxIcon aria-label="Inbox" />
              <span aria-hidden>Inbox</span>
            </ToggleButton>
            <ToggleButton value="draft">
              <EditIcon aria-label="Draft" />
              <span aria-hidden>Draft</span>
            </ToggleButton>
            <ToggleButton value="sent">
              <SendIcon aria-label="Sent" />
              <span aria-hidden>Sent</span>
            </ToggleButton>
          </ToggleButtonGroup>
        </SplitPanel>
        <SplitHandle />
        <SplitPanel className="center">
          <Text>Content</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function CollapsibleTo0() {
  const ref = useRef<ImperativePanelHandle>(null);
  const [expanded, setExpanded] = useState(true);

  function toggle() {
    if (!ref.current) return;

    const { expand, collapse, isExpanded } = ref.current;

    if (isExpanded()) {
      collapse();
      setExpanded(false);
    } else {
      expand();
      setExpanded(true);
    }
  }

  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical">
        <SplitPanel
          collapsible
          collapsedSize={0}
          minSize={10}
          maxSize={30}
          onExpand={() => setExpanded(true)}
          onCollapse={() => setExpanded(false)}
          ref={ref}
          id="left"
          className="center"
        />
        <SplitHandle onDoubleClick={toggle} />
        <SplitPanel>
          <Button
            id="right"
            appearance="solid"
            sentiment="neutral"
            onClick={toggle}
            aria-label="toggle left split panel"
            aria-controls="left"
            style={{ margin: "8px" }}
          >
            {expanded ? <DoubleChevronLeftIcon /> : <DoubleChevronRightIcon />}
          </Button>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

export function ProgrammableResize() {
  const ref = useRef<ImperativePanelHandle>(null);

  function handleResizeLeft(size: number) {
    return () => {
      ref.current?.resize(size);
    };
  }

  return (
    <FlexLayout align="center">
      <StackLayout gap={2}>
        <Button onClick={handleResizeLeft(10)}>10 | 90</Button>
        <Button onClick={handleResizeLeft(25)}>25 | 75</Button>
        <Button onClick={handleResizeLeft(50)}>50 | 50</Button>
        <Button onClick={handleResizeLeft(75)}>75 | 25</Button>
        <Button onClick={handleResizeLeft(90)}>90 | 10</Button>
      </StackLayout>
      <StackLayout>
        <FlexLayout className="box">
          <Splitter orientation="vertical" appearance="bordered">
            <SplitPanel ref={ref} className="center">
              <Text>Left</Text>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel className="center">
              <Text>Right</Text>
            </SplitPanel>
          </Splitter>
        </FlexLayout>
      </StackLayout>
    </FlexLayout>
  );
}

export function LocalPersistence() {
  return (
    <FlexLayout className="box">
      <Splitter orientation="vertical" autoSaveId="splitter-persistence">
        <SplitPanel id="left" className="center">
          <Text>1. Resize the panel</Text>
        </SplitPanel>
        <SplitHandle aria-label="Resize Left/Right" />
        <SplitPanel id="right" className="center">
          <Text>2. Refresh the page</Text>
        </SplitPanel>
      </Splitter>
    </FlexLayout>
  );
}

const nameToQuote = new Map([
  ["Leonardo", "Simplicity is the ultimate sophistication."],
  ["Albert", "Imagination is more important than knowledge."],
  ["Isaac", "Nature and nature's laws lay hid in night."],
  ["Marie", "Nothing in life is to be feared, it is only to be understood."],
  ["Ada", "That brain of mine is something more than merely mortal."],
  ["Roosevelt", "The only thing we have to fear is fear itself"],
  ["Churchill", "Success is not final, failure is not fatal."],
  ["Gandhi", "Be the change that you wish to see in the world."],
  ["Mandela", "It always seems impossible until it's done."],
  ["King", "The time is always right to do what is right."],
  ["Jobs", "Stay hungry, stay foolish."],
  ["Lennon", "Life is what happens when you're busy making other plans."],
  ["Twain", "The secret of getting ahead is getting started."],
]);

function Quotes() {
  return (
    <>
      {[...nameToQuote].map(([name, quote], index) => (
        <Text key={name} style={{ whiteSpace: "nowrap" }}>
          {`Quote ${index + 1} of ${nameToQuote.size}: ${quote}`}
        </Text>
      ))}
    </>
  );
}

export function Overflow() {
  const [enableScroll, setEnableScroll] = useState(false);

  function toggleScroll() {
    setEnableScroll(!enableScroll);
  }

  return (
    <StackLayout direction="column">
      <FlexLayout className="box">
        <Splitter orientation="vertical">
          <SplitPanel>
            <FlexLayout
              gap={1}
              padding={1}
              direction="column"
              className={clsx("h100", enableScroll && "scroll")}
            >
              <Quotes />
            </FlexLayout>
          </SplitPanel>
          <SplitHandle />
          <SplitPanel>
            <FlexLayout
              gap={1}
              padding={1}
              direction="column"
              className={clsx("h100", enableScroll && "scroll")}
            >
              <Quotes />
            </FlexLayout>
          </SplitPanel>
        </Splitter>
      </FlexLayout>
      <Button onClick={toggleScroll}>
        {enableScroll ? "Disable Scroll" : "Enable Scroll"}
      </Button>
    </StackLayout>
  );
}

export const InsideWindow = () => {
  const [open, setOpen] = useState(false);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (value: boolean) => {
    setOpen(value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button data-testid="dialog-button" onClick={handleRequestOpen}>
        Click to open dialog
      </Button>
      <Dialog
        style={{ width: "420px" }}
        role="alertdialog"
        open={open}
        onOpenChange={onOpenChange}
        // focus the ok instead of the cancel button
        initialFocus={1}
      >
        <DialogHeader header="Splitter inside Portalled window" />
        <DialogContent
          className="box"
          style={{ width: "100%", padding: 0, margin: 0 }}
        >
          <Splitter orientation="vertical">
            <SplitPanel>
              <Splitter orientation="horizontal">
                <SplitPanel className="center">
                  <Text>Top Left</Text>
                </SplitPanel>
                <SplitHandle />
                <SplitPanel className="center">
                  <Text>Center Left</Text>
                </SplitPanel>
                <SplitHandle />
                <SplitPanel className="center">
                  <Text>Bottom Left</Text>
                </SplitPanel>
              </Splitter>
            </SplitPanel>
            <SplitHandle />
            <SplitPanel>
              <Splitter orientation="horizontal">
                <SplitPanel className="center">
                  <Text>Top Right</Text>
                </SplitPanel>
                <SplitHandle />
                <SplitPanel className="center">
                  <Text>Bottom Right</Text>
                </SplitPanel>
              </Splitter>
            </SplitPanel>
          </Splitter>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button sentiment="accented" onClick={handleClose}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
