import { useState, MouseEvent } from "react";
import {
  LayerLayout,
  LAYER_POSITIONS,
  ContentStatus,
  ContentStatusProps,
} from "@jpmorganchase/uitk-lab";
import {
  Button,
  FlowLayout,
  StackLayout,
  FlexItem,
  FormField,
  Input,
  FlexLayout,
  Card,
} from "@jpmorganchase/uitk-core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ContactDetailsExample } from "../../../core/stories/layout/flex-layout.stories";
import "./styles.css";

export default {
  title: "Lab/Layout/LayerLayout",
  component: LayerLayout,
  argTypes: {
    position: {
      options: LAYER_POSITIONS,
      control: { type: "select" },
    },
  },
  args: {
    disableScrim: false,
    disableAnimations: false,
    fullScreenAtBreakpoint: "sm",
  },
} as ComponentMeta<typeof LayerLayout>;

type LayerContentExampleProps = {
  onClick: (evt: MouseEvent) => void;
};

const LayerContentExample = ({ onClick }: LayerContentExampleProps) => (
  <StackLayout className="layer-example">
    <FlexItem grow={1}>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nunc lacus,
        scelerisque ut elit nec, commodo blandit est. Duis mollis dui at nisl
        faucibus, id maximus urna pellentesque. Praesent consequat vulputate
        dolor, a mattis metus suscipit vitae. Donec ullamcorper, neque sit amet
        laoreet ornare, diam eros posuere metus, id consectetur tellus nisl id
        ipsum. Fusce sit amet cursus mauris, vel scelerisque enim. Quisque eu
        dolor tortor. Nulla facilisi. Vestibulum at neque sit amet neque
        facilisis porttitor a ac risus.
      </p>
      <p>
        Mauris consequat sollicitudin commodo. Vestibulum ac diam vulputate,
        condimentum purus non, eleifend erat. Nunc auctor iaculis mi eu
        hendrerit. Suspendisse potenti. Cras tristique vehicula iaculis. Morbi
        faucibus volutpat tellus, sit amet fringilla dui rhoncus a. Suspendisse
        nunc nulla, mattis sed commodo ac, cursus ut augue. Quisque libero
        magna, rutrum sit amet elementum eget, pulvinar vel metus. Nam id est id
        odio rutrum venenatis. Donec sodales est lacinia eros pharetra tempor.
        Phasellus sodales venenatis tellus, eget tempor ipsum efficitur
        imperdiet. Sed volutpat porta lorem a fermentum. Curabitur fringilla,
        justo in vestibulum egestas, lacus felis feugiat orci, a congue tortor
        lacus sed mi. Quisque quis ante finibus, posuere urna eget, finibus
        tellus.
      </p>
    </FlexItem>
    <FlowLayout justify="end">
      <Button onClick={onClick}>Close layer</Button>
    </FlowLayout>
  </StackLayout>
);

const DefaultLayerLayoutStory: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const DefaultLayerLayout = DefaultLayerLayoutStory.bind({});
DefaultLayerLayout.args = {
  position: "center",
};

const Top: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const LayerLayoutTop = Top.bind({});
LayerLayoutTop.args = {
  position: "top",
};

const Right: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const LayerLayoutRight = Right.bind({});
LayerLayoutRight.args = {
  position: "right",
};

const Left: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const LayerLayoutLeft = Left.bind({});
LayerLayoutLeft.args = {
  position: "left",
};

const Bottom: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const LayerLayoutBottom = Bottom.bind({});
LayerLayoutBottom.args = {
  position: "bottom",
};

const CustomFullScreenAnimation: ComponentStory<typeof LayerLayout> = (
  args
) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="custom-layer-container">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} className="custom-animation" {...args}>
        <LayerContentExample onClick={hide} />
      </LayerLayout>
    </div>
  );
};

export const LayerCustomFullScreenAnimation = CustomFullScreenAnimation.bind(
  {}
);

LayerCustomFullScreenAnimation.args = {
  position: "bottom",
};

LayerCustomFullScreenAnimation.parameters = {
  viewport: {
    defaultViewport: "mobile1",
  },
};

const ReducedMotion: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <>
      <p>In order to test this on MacOS, follow these steps: </p>
      <p>
        Go to System Preferences, select the Accessibility category, select the
        Display tab, and enable the Reduce Motion option.
      </p>
      <div className="layer-container">
        <Button onClick={show}>Open Layer</Button>
        <LayerLayout isOpen={open} className="reduced-motion" {...args}>
          <LayerContentExample onClick={hide} />
        </LayerLayout>
      </div>
    </>
  );
};

export const LayerReducedMotion = ReducedMotion.bind({});

const LayerLayoutCenterExample: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  const errorProps: ContentStatusProps = {
    status: "error",
    title: "There's been a system error",
    message: "It should be temporary, so please try again.",
    actionLabel: "CLOSE LAYER",
    onActionClick: hide,
  };

  return (
    <>
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout
        isOpen={open}
        className="layer-simple-usage-center"
        {...args}
      >
        <FlowLayout justify="center">
          <ContentStatus {...errorProps} />
        </FlowLayout>
      </LayerLayout>
    </>
  );
};

export const LayerLayoutCenterSimpleUsage = LayerLayoutCenterExample.bind({});
LayerLayoutCenterSimpleUsage.args = {
  position: "center",
};

const FormFieldExample = () => (
  <FormField label="Label" helperText="Help text appears here">
    <Input />
  </FormField>
);

const LayerLayoutLeftExample: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container layer-simple-usage">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <StackLayout>
          <h1>Section title</h1>
          <p>
            Incididunt adipisicing deserunt nostrud ullamco consequat
            consectetur magna id do irure labore fugiat. Eiusmod pariatur
            officia elit ad. Ullamco adipisicing Lorem amet velit in do
            reprehenderit nostrud eu aute voluptate quis quis.
          </p>
          {Array.from({ length: 7 }, (_, index) => (
            <FormFieldExample key={index} />
          ))}
          <FlexItem align="end">
            <Button onClick={hide}>Close layer</Button>
          </FlexItem>
        </StackLayout>
      </LayerLayout>
    </div>
  );
};

export const LayerLayoutLeftSimpleUsage = LayerLayoutLeftExample.bind({});
LayerLayoutLeftSimpleUsage.args = {
  position: "left",
};

const LayerLayoutTopExample: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container layer-simple-usage">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <StackLayout>
          <h1>Section title</h1>
          <p>
            Incididunt adipisicing deserunt nostrud ullamco consequat
            consectetur magna id do irure labore fugiat. Eiusmod pariatur
            officia elit ad. Ullamco adipisicing Lorem amet velit in do
            reprehenderit nostrud eu aute voluptate quis quis.
          </p>
          <FlexLayout disableWrap>
            {Array.from({ length: 4 }, (_, index) => (
              <FormFieldExample key={index} />
            ))}
          </FlexLayout>
          <FlexItem align="end">
            <Button onClick={hide}>Close layer</Button>
          </FlexItem>
        </StackLayout>
      </LayerLayout>
    </div>
  );
};

export const LayerLayoutTopSimpleUsage = LayerLayoutTopExample.bind({});
LayerLayoutTopSimpleUsage.args = {
  position: "top",
};

const LayerLayoutRightExample: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container layer-simple-usage">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <StackLayout>
          <h1>Section title</h1>
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index}>
              <ContactDetailsExample index={index} />
            </Card>
          ))}
          <FlexItem align="end">
            <Button onClick={hide}>Close layer</Button>
          </FlexItem>
        </StackLayout>
      </LayerLayout>
    </div>
  );
};

export const LayerLayoutRightSimpleUsage = LayerLayoutRightExample.bind({});
LayerLayoutRightSimpleUsage.args = {
  position: "right",
};

const ArticleExample = () => (
  <StackLayout className="layer-article-container">
    <div className="layer-article-image"></div>
    <h2>Laborum in sit officia consecte</h2>
    <p>
      Do excepteur id ipsum qui dolor irure dolore commodo labore. Minim sunt
      aliquip eiusmod excepteur qui sunt commodo ex cillum ullamco. Quis magna
      deserunt reprehenderit anim elit laboris laboris fugiat Lorem est culpa
      quis.
    </p>
  </StackLayout>
);

const LayerLayoutBottomExample: ComponentStory<typeof LayerLayout> = (args) => {
  const [open, setOpen] = useState(true);

  const show = () => setOpen(true);

  const hide = () => setOpen(false);

  return (
    <div className="layer-container layer-simple-usage">
      <Button onClick={show}>Open Layer</Button>
      <LayerLayout isOpen={open} {...args}>
        <StackLayout>
          <h1>Section title</h1>
          <FlowLayout>
            {Array.from({ length: 4 }, (_, index) => (
              <ArticleExample key={index} />
            ))}
          </FlowLayout>
          <FlexItem align="end">
            <Button onClick={hide}>Close layer</Button>
          </FlexItem>
        </StackLayout>
      </LayerLayout>
    </div>
  );
};

export const LayerLayoutBottomSimpleUsage = LayerLayoutBottomExample.bind({});
LayerLayoutBottomSimpleUsage.args = {
  position: "bottom",
};
