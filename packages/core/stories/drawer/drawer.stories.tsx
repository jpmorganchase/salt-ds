import {
  Button,
  Card,
  Checkbox,
  ComboBox,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  type DrawerProps,
  FlexItem,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H2,
  Input,
  Option,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";

export default {
  title: "Core/Drawer",
  component: Drawer,
} as Meta<typeof Drawer>;

const UnmountLogger = () => {
  useEffect(() => {
    return () => {
      console.log(Date.now(), "Dummy unmount");
    };
  }, []);
  return null;
};

export const Default: StoryFn<DrawerProps> = (args) => {
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);
  const [openTertiary, setOpenTertiary] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpenPrimary(true)}>Open Primary Drawer</Button>
      <Drawer
        {...args}
        open={openPrimary}
        onOpenChange={(newOpen) => setOpenPrimary(newOpen)}
        style={{ width: 300 }}
      >
        <DrawerHeader
          header="Primary drawer"
          actions={<DrawerCloseButton onClick={() => setOpenPrimary(false)} />}
        />
        <DrawerContent>
          <Text>Primary drawers sit on the container primary background.</Text>
        </DrawerContent>
        <UnmountLogger />
      </Drawer>
      <Button onClick={() => setOpenSecondary(true)}>
        Open Secondary Drawer
      </Button>
      <Drawer
        {...args}
        open={openSecondary}
        onOpenChange={(newOpen) => setOpenSecondary(newOpen)}
        variant="secondary"
        style={{ width: 300 }}
      >
        <DrawerHeader
          header="Secondary drawer"
          actions={
            <DrawerCloseButton onClick={() => setOpenSecondary(false)} />
          }
        />
        <DrawerContent>
          <Text>
            Secondary drawers sit on the container secondary background.
          </Text>
        </DrawerContent>
      </Drawer>
      <Button onClick={() => setOpenTertiary(true)}>
        Open Tertiary Drawer
      </Button>
      <Drawer
        {...args}
        open={openTertiary}
        onOpenChange={(newOpen) => setOpenTertiary(newOpen)}
        variant="tertiary"
        style={{ width: 300 }}
      >
        <DrawerHeader
          header="Tertiary drawer"
          actions={<DrawerCloseButton onClick={() => setOpenTertiary(false)} />}
        />
        <DrawerContent>
          <Text>
            Tertiary drawers sit on the container tertiary background.
          </Text>
        </DrawerContent>
      </Drawer>
    </StackLayout>
  );
};

export const Position: StoryFn<DrawerProps> = (args) => {
  const [openLeft, setOpenLeft] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const [openTop, setOpenTop] = useState(false);
  const [openBottom, setOpenBottom] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpenLeft(true)}>Open Left Drawer</Button>
      <Drawer
        {...args}
        open={openLeft}
        onOpenChange={(newOpen) => setOpenLeft(newOpen)}
        style={{ width: 300 }}
      >
        <DrawerHeader
          header="Left drawer"
          actions={<DrawerCloseButton onClick={() => setOpenLeft(false)} />}
        />
        <DrawerContent>
          <Text>Left drawers slide in from the leading edge.</Text>
        </DrawerContent>
      </Drawer>
      <Button onClick={() => setOpenRight(true)}>Open Right Drawer</Button>
      <Drawer
        {...args}
        open={openRight}
        onOpenChange={(newOpen) => setOpenRight(newOpen)}
        position="right"
        style={{ width: 300 }}
      >
        <DrawerHeader
          header="Right drawer"
          actions={<DrawerCloseButton onClick={() => setOpenRight(false)} />}
        />
        <DrawerContent>
          <Text>Right drawers slide in from the trailing edge.</Text>
        </DrawerContent>
      </Drawer>
      <Button onClick={() => setOpenTop(true)}>Open Top Drawer</Button>
      <Drawer
        {...args}
        open={openTop}
        onOpenChange={(newOpen) => setOpenTop(newOpen)}
        position="top"
        style={{ height: 200 }}
      >
        <DrawerHeader
          header="Top drawer"
          actions={<DrawerCloseButton onClick={() => setOpenTop(false)} />}
        />
        <DrawerContent>
          <Text>Top drawers slide down from the top of the screen.</Text>
        </DrawerContent>
      </Drawer>
      <Button onClick={() => setOpenBottom(true)}>Open Bottom Drawer</Button>
      <Drawer
        {...args}
        open={openBottom}
        onOpenChange={(newOpen) => setOpenBottom(newOpen)}
        position="bottom"
        style={{ height: 200 }}
      >
        <DrawerHeader
          header="Bottom drawer"
          actions={<DrawerCloseButton onClick={() => setOpenBottom(false)} />}
        />
        <DrawerContent>
          <Text>Bottom drawers slide up from the bottom of the screen.</Text>
        </DrawerContent>
      </Drawer>
    </StackLayout>
  );
};

const FormFieldExample = () => (
  <FormField>
    <FormFieldLabel>Label</FormFieldLabel>
    <Input />
    <FormFieldHelperText>Help text appears here</FormFieldHelperText>
  </FormField>
);

export const TopDrawerUsageExample = () => {
  const [open, setOpen] = useState(false);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Top Drawer</Button>
      <Drawer open={open} onOpenChange={onOpenChange} position="top">
        <DrawerHeader
          header="Section title"
          actions={<DrawerCloseButton onClick={handleClose} />}
        />
        <DrawerContent>
          <StackLayout>
            <Text>
              Incididunt adipisicing deserunt nostrud ullamco consequat
              consectetur magna id do irure labore fugiat. Eiusmod pariatur
              officia elit ad. Ullamco adipisicing Lorem amet velit in do
              reprehenderit nostrud eu aute voluptate quis quis.
            </Text>
            <FlexLayout>
              <FormFieldExample />
              <FormFieldExample />
              <FormFieldExample />
              <FormFieldExample />
            </FlexLayout>
          </StackLayout>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export const RightDrawerUsageExample = () => {
  const [open, setOpen] = useState(false);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Right Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="right"
        style={{ width: 500 }}
      >
        <DrawerHeader
          header="Section title"
          actions={<DrawerCloseButton onClick={handleClose} />}
        />
        <DrawerContent>
          <StackLayout>
            <Text>
              Incididunt adipisicing deserunt nostrud ullamco consequat
              consectetur magna id do irure labore fugiat. Eiusmod pariatur
              officia elit ad. Ullamco adipisicing Lorem amet velit in do
              reprehenderit nostrud eu aute voluptate quis quis.
            </Text>
            <FormFieldExample />
            <FormFieldExample />
            <FormFieldExample />
            <FormFieldExample />
            <FormFieldExample />
            <FormFieldExample />
            <FormFieldExample />
          </StackLayout>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export const BottomDrawerUsageExample = () => {
  const [open, setOpen] = useState(false);

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const exampleData = [
    {
      title: "Sustainable investing products",
      content:
        "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values.",
    },
    {
      title: "Our expertise",
      content:
        "Our team of more than 200 experts in 28 offices worldwide is on hand to help you with your investment decisions.",
    },
    {
      title: "Market-leading insights",
      content:
        "Our award-winning strategists provide unique and regular insights about market events and current trends.",
    },
  ];

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Bottom Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="bottom"
        style={{ height: 350 }}
      >
        <DrawerHeader
          header="Bottom drawer use case"
          actions={<DrawerCloseButton onClick={handleClose} />}
        />
        <DrawerContent>
          <FlowLayout>
            <Card style={{ width: "256px" }}>
              <H2>{exampleData[0].title}</H2>
              <Text>{exampleData[0].content}</Text>
            </Card>
            <Card style={{ width: "256px" }}>
              <H2>{exampleData[1].title}</H2>
              <Text>{exampleData[1].content}</Text>
            </Card>
            <Card style={{ width: "256px" }}>
              <H2>{exampleData[2].title}</H2>
              <Text>{exampleData[2].content}</Text>
            </Card>
          </FlowLayout>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export const OptionalCloseAction = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const postcodes = ["05011", "01050", "03040", "11050"];

  const handleRequestOpen = () => {
    setOpen(true);
  };

  const onOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValue(value);
  };

  const handleSelectionChange = (
    _event: SyntheticEvent,
    newSelected: string[],
  ) => {
    return newSelected.length === 1 ? setValue(newSelected[0]) : setValue("");
  };

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="right"
        style={{ width: 500 }}
      >
        <DrawerHeader header="Add your delivery details" />
        <DrawerContent>
          <StackLayout>
            <FormField>
              <FormFieldLabel>House no.</FormFieldLabel>
              <Input />
            </FormField>
            <FormField>
              <FormFieldLabel>Street name</FormFieldLabel>
              <Input />
            </FormField>
            <FormField>
              <FormFieldLabel>Postcode</FormFieldLabel>
              <ComboBox
                onChange={handleChange}
                onSelectionChange={handleSelectionChange}
                value={value}
                placeholder="Search for your postcode"
              >
                {postcodes.map((postcode) => (
                  <Option value={postcode} key={postcode}>
                    {postcode}
                  </Option>
                ))}
              </ComboBox>
              <FormFieldHelperText>Do not include space</FormFieldHelperText>
            </FormField>
            <FormField>
              <FormFieldLabel>City/Town</FormFieldLabel>
              <Input />
            </FormField>
            <FormField>
              <FormFieldLabel>Country</FormFieldLabel>
              <Input />
            </FormField>
            <FormField>
              <Checkbox label="Dog(s) present at my property" />
            </FormField>
            <FlexItem align="end">
              <Button onClick={handleClose}>Submit</Button>
            </FlexItem>
          </StackLayout>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export const InitialFocusIndex: StoryFn<DrawerProps> = (args) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer
        {...args}
        open={open}
        onOpenChange={setOpen}
        initialFocus={args.initialFocus ?? 2}
      >
        <DrawerHeader header="Initial focus by index" />
        <DrawerContent>
          <StackLayout>
            <Button>First</Button>
            <Button>Second</Button>
            <Input inputProps={{ "aria-label": "Third" }} />
            <Button>Fourth</Button>
          </StackLayout>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export const InitialFocusRef: StoryFn<DrawerProps> = (args) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer
        {...args}
        open={open}
        onOpenChange={setOpen}
        initialFocus={inputRef}
      >
        <DrawerHeader header="Initial focus by ref" />
        <DrawerContent>
          <StackLayout>
            <Button>First</Button>
            <Button>Second</Button>
            <Input inputRef={inputRef} inputProps={{ "aria-label": "Third" }} />
            <Button>Fourth</Button>
          </StackLayout>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export const PreheaderAndDescription: StoryFn<DrawerProps> = (args) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer
        {...args}
        open={open}
        onOpenChange={setOpen}
        position="right"
        style={{ width: 400 }}
      >
        <DrawerHeader
          preheader="Payments"
          header="Check deposit #1278"
          description="Pending transaction review"
          actions={<DrawerCloseButton onClick={handleClose} />}
        />
        <DrawerContent>
          <StackLayout>
            <Text>
              Incididunt adipisicing deserunt nostrud ullamco consequat
              consectetur magna id do irure labore fugiat. Eiusmod pariatur
              officia elit ad. Ullamco adipisicing Lorem amet velit in do
              reprehenderit nostrud eu aute voluptate quis quis. Incididunt
              adipisicing deserunt nostrud ullamco consequat consectetur magna
              id do irure labore fugiat. Eiusmod pariatur officia elit ad.
              Ullamco adipisicing Lorem amet velit in do reprehenderit nostrud
              eu aute voluptate quis quis. reprehenderit nostrud eu aute
              voluptate quis quis. reprehenderit nostrud eu aute voluptate quis
              quis.
              Incididunt adipisicing deserunt nostrud ullamco consequat
              consectetur magna id do irure labore fugiat. Eiusmod pariatur
              officia elit ad. Ullamco adipisicing Lorem amet velit in do
              reprehenderit nostrud eu aute voluptate quis quis. Incididunt
              adipisicing deserunt nostrud ullamco consequat consectetur magna
              id do irure labore fugiat. Eiusmod pariatur officia elit ad.
              Ullamco adipisicing Lorem amet velit in do reprehenderit nostrud
              eu aute voluptate quis quis. reprehenderit nostrud eu aute
              voluptate quis quis. reprehenderit nostrud eu aute voluptate quis
              quis.
              Incididunt adipisicing deserunt nostrud ullamco consequat
              consectetur magna id do irure labore fugiat. Eiusmod pariatur
              officia elit ad. Ullamco adipisicing Lorem amet velit in do
              reprehenderit nostrud eu aute voluptate quis quis. Incididunt
              adipisicing deserunt nostrud ullamco consequat consectetur magna
              id do irure labore fugiat. Eiusmod pariatur officia elit ad.
              Ullamco adipisicing Lorem amet velit in do reprehenderit nostrud
              eu aute voluptate quis quis. reprehenderit nostrud eu aute
              voluptate quis quis. reprehenderit nostrud eu aute voluptate quis
              quis.
              Incididunt adipisicing deserunt nostrud ullamco consequat
              consectetur magna id do irure labore fugiat. Eiusmod pariatur
              officia elit ad. Ullamco adipisicing Lorem amet velit in do
              reprehenderit nostrud eu aute voluptate quis quis. Incididunt
              adipisicing deserunt nostrud ullamco consequat consectetur magna
              id do irure labore fugiat. Eiusmod pariatur officia elit ad.
              Ullamco adipisicing Lorem amet velit in do reprehenderit nostrud
              eu aute voluptate quis quis. reprehenderit nostrud eu aute
              voluptate quis quis. reprehenderit nostrud eu aute voluptate quis
              quis.
              Incididunt adipisicing deserunt nostrud ullamco consequat
              consectetur magna id do irure labore fugiat. Eiusmod pariatur
              officia elit ad. Ullamco adipisicing Lorem amet velit in do
              reprehenderit nostrud eu aute voluptate quis quis. Incididunt
              adipisicing deserunt nostrud ullamco consequat consectetur magna
              id do irure labore fugiat. Eiusmod pariatur officia elit ad.
              Ullamco adipisicing Lorem amet velit in do reprehenderit nostrud
              eu aute voluptate quis quis. reprehenderit nostrud eu aute
              voluptate quis quis. reprehenderit nostrud eu aute voluptate quis
              quis.
              Incididunt adipisicing deserunt nostrud ullamco consequat
              consectetur magna id do irure labore fugiat. Eiusmod pariatur
              officia elit ad. Ullamco adipisicing Lorem amet velit in do
              reprehenderit nostrud eu aute voluptate quis quis. Incididunt
              adipisicing deserunt nostrud ullamco consequat consectetur magna
              id do irure labore fugiat. Eiusmod pariatur officia elit ad.
              Ullamco adipisicing Lorem amet velit in do reprehenderit nostrud
              eu aute voluptate quis quis. reprehenderit nostrud eu aute
              voluptate quis quis. reprehenderit nostrud eu aute voluptate quis
              quis.
              Incididunt adipisicing deserunt nostrud ullamco consequat
              consectetur magna id do irure labore fugiat. Eiusmod pariatur
              officia elit ad. Ullamco adipisicing Lorem amet velit in do
              reprehenderit nostrud eu aute voluptate quis quis. Incididunt
              adipisicing deserunt nostrud ullamco consequat consectetur magna
              id do irure labore fugiat. Eiusmod pariatur officia elit ad.
              Ullamco adipisicing Lorem amet velit in do reprehenderit nostrud
              eu aute voluptate quis quis. reprehenderit nostrud eu aute
              voluptate quis quis. reprehenderit nostrud eu aute voluptate quis
              quis.
            </Text>
          </StackLayout>
        </DrawerContent>
      </Drawer>
    </>
  );
};
