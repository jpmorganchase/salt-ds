import { ChangeEvent, SyntheticEvent, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  FlexItem,
  FlexLayout,
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  H2,
  Text,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { ComboBoxNext, Option, Drawer, DrawerCloseButton } from "@salt-ds/lab";
import { Meta } from "@storybook/react";

export default {
  title: "Lab/Drawer",
  component: Drawer,
} as Meta<typeof Drawer>;

export const Default = ({ position = "left", ...args }) => {
  const [openPrimary, setOpenPrimary] = useState(false);
  const [openSecondary, setOpenSecondary] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpenPrimary(true)}>Open Primary Drawer</Button>
      <Drawer
        open={openPrimary}
        onOpenChange={(newOpen) => setOpenPrimary(newOpen)}
        id="primary"
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenPrimary(false)} />
      </Drawer>
      <Button onClick={() => setOpenSecondary(true)}>
        Open Secondary Drawer
      </Button>
      <Drawer
        open={openSecondary}
        onOpenChange={(newOpen) => setOpenSecondary(newOpen)}
        variant="secondary"
        id="secondary"
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenSecondary(false)} />
      </Drawer>
    </StackLayout>
  );
};

export const Position = ({ position = "left", ...args }) => {
  const [openLeft, setOpenLeft] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const [openTop, setOpenTop] = useState(false);
  const [openBottom, setOpenBottom] = useState(false);

  return (
    <StackLayout>
      <Button onClick={() => setOpenLeft(true)}>Open Left Drawer</Button>
      <Drawer
        open={openLeft}
        onOpenChange={(newOpen) => setOpenLeft(newOpen)}
        id="left"
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenLeft(false)} />
      </Drawer>
      <Button onClick={() => setOpenRight(true)}>Open Right Drawer</Button>
      <Drawer
        open={openRight}
        onOpenChange={(newOpen) => setOpenRight(newOpen)}
        position="right"
        id="right"
        style={{ width: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenRight(false)} />
      </Drawer>
      <Button onClick={() => setOpenTop(true)}>Open Top Drawer</Button>
      <Drawer
        open={openTop}
        onOpenChange={(newOpen) => setOpenTop(newOpen)}
        position="top"
        id="top"
        style={{ height: 200 }}
      >
        <DrawerCloseButton onClick={() => setOpenTop(false)} />
      </Drawer>
      <Button onClick={() => setOpenBottom(true)}>Open Bottom Drawer</Button>
      <Drawer
        open={openBottom}
        onOpenChange={(newOpen) => setOpenBottom(newOpen)}
        position="bottom"
        id="bottom"
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
  const id = "top-drawer";

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
      <Drawer open={open} onOpenChange={onOpenChange} position="top" id="top">
        <StackLayout>
          <DrawerCloseButton onClick={handleClose} />
          <H2 id={`${id}-header`}>Section title</H2>
          <Text>
            Incididunt adipisicing deserunt nostrud ullamco consequat
            consectetur magna id do irure labore fugiat. Eiusmod pariatur
            officia elit ad. Ullamco adipisicing Lorem amet velit in do
            reprehenderit nostrud eu aute voluptate quis quis.
          </Text>
          <FlexLayout>
            {Array.from({ length: 4 }, (_, index) => (
              <FormFieldExample key={index} />
            ))}
          </FlexLayout>
        </StackLayout>
      </Drawer>
    </>
  );
};

export const RightDrawerUsageExample = () => {
  const [open, setOpen] = useState(false);
  const id = "right-drawer";

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
        id={id}
      >
        <StackLayout>
          <DrawerCloseButton onClick={handleClose} />
          <H2 id={`${id}-header`}>Section Title</H2>
          <Text>
            Incididunt adipisicing deserunt nostrud ullamco consequat
            consectetur magna id do irure labore fugiat. Eiusmod pariatur
            officia elit ad. Ullamco adipisicing Lorem amet velit in do
            reprehenderit nostrud eu aute voluptate quis quis.
          </Text>
          {Array.from({ length: 7 }, (_, index) => (
            <FormFieldExample key={index} />
          ))}
        </StackLayout>
      </Drawer>
    </>
  );
};

export const BottomDrawerUsageExample = () => {
  const [open, setOpen] = useState(false);
  const id = "bottom-drawer";

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
        id={id}
      >
        <DrawerCloseButton onClick={handleClose} />
        <StackLayout>
          <H2 id={`${id}-header`}>Bottom drawer use case</H2>
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
  const id = "right-drawer";

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
    event: SyntheticEvent,
    newSelected: string[]
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
        id={id}
      >
        <StackLayout>
          <H2 id={`${id}-header`}>Add your delivery details</H2>
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
            <ComboBoxNext
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
            </ComboBoxNext>
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
