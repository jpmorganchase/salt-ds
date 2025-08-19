import {
  Button,
  Card,
  Checkbox,
  ComboBox,
  Drawer,
  DrawerCloseButton,
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
  useId,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type SyntheticEvent,
  useEffect,
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

  return (
    <StackLayout>
      <Button onClick={() => setOpenPrimary(true)}>Open Primary Drawer</Button>
      <Drawer
        {...args}
        open={openPrimary}
        onOpenChange={(newOpen) => setOpenPrimary(newOpen)}
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenPrimary(false)} />
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
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenSecondary(false)} />
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
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenLeft(false)} />
      </Drawer>
      <Button onClick={() => setOpenRight(true)}>Open Right Drawer</Button>
      <Drawer
        {...args}
        open={openRight}
        onOpenChange={(newOpen) => setOpenRight(newOpen)}
        position="right"
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenRight(false)} />
      </Drawer>
      <Button onClick={() => setOpenTop(true)}>Open Top Drawer</Button>
      <Drawer
        {...args}
        open={openTop}
        onOpenChange={(newOpen) => setOpenTop(newOpen)}
        position="top"
        style={{ height: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenTop(false)} />
      </Drawer>
      <Button onClick={() => setOpenBottom(true)}>Open Bottom Drawer</Button>
      <Drawer
        {...args}
        open={openBottom}
        onOpenChange={(newOpen) => setOpenBottom(newOpen)}
        position="bottom"
        style={{ height: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenBottom(false)} />
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

  const headerId = useId();

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Top Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="top"
        aria-labelledby={headerId}
      >
        <StackLayout>
          <DrawerCloseButton onClick={handleClose} />
          <H2 id={headerId}>Section title</H2>
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

  const headerId = useId();

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Right Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="right"
        style={{ width: 500 }}
        aria-labelledby={headerId}
      >
        <StackLayout>
          <DrawerCloseButton onClick={handleClose} />
          <H2 id={headerId}>Section Title</H2>
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

  const headerId = useId();

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Bottom Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="bottom"
        style={{ height: 350 }}
        aria-labelledby={headerId}
      >
        <DrawerCloseButton onClick={handleClose} />
        <StackLayout>
          <H2 id={headerId}>Bottom drawer use case</H2>
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
        </StackLayout>
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

  const headerId = useId();

  return (
    <>
      <Button onClick={handleRequestOpen}>Open Drawer</Button>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        position="right"
        style={{ width: 500 }}
        aria-labelledby={headerId}
      >
        <StackLayout>
          <H2 id={headerId}>Add your delivery details</H2>
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
      </Drawer>
    </>
  );
};
