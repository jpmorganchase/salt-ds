import {
  Button,
  ButtonProps,
  Divider,
  Dropdown,
  FlexLayout,
  Label,
  Option,
  Overlay,
  OverlayPanel,
  OverlayPanelContent,
  OverlayTrigger,
  SplitLayout,
  StackLayout,
  Text,
  FormField,
  FormFieldLabel as FormLabel,
  Input,
  FlexItem,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerTrigger,
  DatePickerSingleInput,
  DatePickerOverlay,
  DatePickerSinglePanel,
  OverlayHeader,
  StepperInput,
} from "@salt-ds/lab";
import { useState } from "react";
import { ChevronRightIcon, CloseIcon } from "@salt-ds/icons";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import mockTicketCss from "./MockTicket.css";

const CloseButton: React.FC<ButtonProps> = (props) => (
  <Button
    aria-label="Close overlay"
    appearance="transparent"
    sentiment="neutral"
    {...props}
  >
    <CloseIcon aria-hidden />
  </Button>
);

export const MockTicket = () => {
  const [open, setOpen] = useState(false);

  const onChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleClose = () => setOpen(false);

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-date-input-range",
    css: mockTicketCss,
    window: targetWindow,
  });

  return (
    <div className={"app"}>
      <Overlay open={open} onOpenChange={onChange}>
        <OverlayTrigger>
          <Button>Open Ticket</Button>
        </OverlayTrigger>
        <OverlayPanel className={"ticket"}>
          <OverlayHeader
            description="Single Order"
            actions={<CloseButton onClick={handleClose} />}
          />
          <Divider />
          <OverlayPanelContent>
            <StackLayout direction="column" gap={2}>
              <SplitLayout
                endItem={
                  <Button appearance="transparent">
                    <strong>Additional Parameters</strong>
                    <ChevronRightIcon aria-hidden />
                  </Button>
                }
              />
              <StackLayout direction={"row"} gap={0}>
                <StackLayout
                  direction={"row"}
                  gap={0}
                  className="hatched-left"
                  style={{ width: "50%" }}
                >
                  <div className={"price-panel"}>
                    <Label className={"left-aligned"}>BUY AND SELL EUR</Label>
                    <FlexLayout align={"center"} gap={0}>
                      <Text className="price" as="h1" size={"large"}>
                        +19.346
                      </Text>
                    </FlexLayout>
                  </div>
                </StackLayout>
                <StackLayout
                  direction={"row"}
                  gap={0}
                  className="hatched-right"
                  style={{ width: "50%" }}
                >
                  <div className={"price-panel"}>
                    <Label className={"right-aligned"}>SELL AND BUY EUR</Label>
                    <FlexLayout align={"center"} gap={0}>
                      <Text className="price" as="h1" size={"large"}>
                        +19.535
                      </Text>
                    </FlexLayout>
                  </div>
                </StackLayout>
              </StackLayout>
              <FormField labelPlacement="left">
                <FormLabel size="large" textAlign={"right"}>Currency Pair</FormLabel>
                <Input bordered size={"large"} defaultValue="EURUSD" />
              </FormField>
              <FormField labelPlacement="left">
                <FormLabel size="large" textAlign={"right"}>Order Type</FormLabel>
                <Dropdown bordered defaultSelected={["Swap Take Profit"]}>
                  <Option value="1" key={"option1"}>
                    Swap Take Profit
                  </Option>
                </Dropdown>
              </FormField>
              <StackLayout direction={"row"}>
                <FormField labelPlacement="left">
                  <FormLabel textAlign={"right"}>Amount</FormLabel>
                  <Input bordered defaultValue="1m" />
                </FormField>
                <Button>EUR</Button>
              </StackLayout>
              <StackLayout direction={"row"}>
                <Button appearance="solid" sentiment="accented">
                  Sell <ChevronRightIcon aria-hidden />
                </Button>
                <DatePicker selectionVariant="single">
                  <DatePickerTrigger>
                    <DatePickerSingleInput bordered />
                  </DatePickerTrigger>
                  <DatePickerOverlay>
                    <DatePickerSinglePanel />
                  </DatePickerOverlay>
                </DatePicker>
              </StackLayout>
              <StackLayout direction={"row"}>
                <Button appearance="solid" sentiment="accented">
                  Buy <ChevronRightIcon aria-hidden />
                </Button>
                <DatePicker selectionVariant="single">
                  <DatePickerTrigger>
                    <DatePickerSingleInput bordered />
                  </DatePickerTrigger>
                  <DatePickerOverlay>
                    <DatePickerSinglePanel />
                  </DatePickerOverlay>
                </DatePicker>
              </StackLayout>
              <StackLayout direction={"row"}>
                <FlexItem>
                  <FormField>
                    <FormLabel>Limit Price</FormLabel>
                    <Button appearance="solid" sentiment="accented">
                      <ChevronRightIcon aria-hidden />
                    </Button>
                  </FormField>
                </FlexItem>
                <FlexItem>
                  <StepperInput
                    className="stepper-input"
                    decimalPlaces={2}
                    step={0.01}
                  />
                </FlexItem>
              </StackLayout>
              <FormField labelPlacement="left">
                <FormLabel textAlign={"right"}>Client Account</FormLabel>
                <Dropdown bordered defaultSelected={["SDI BTUG"]}>
                  <Option value="1" key={"option1"}>
                    Swap Take Profit
                  </Option>
                </Dropdown>
              </FormField>
              <Button>Submit Sell & Buy Order</Button>
            </StackLayout>
          </OverlayPanelContent>
        </OverlayPanel>
      </Overlay>
    </div>
  );
};
