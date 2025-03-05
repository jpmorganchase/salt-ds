import figma from "@figma/code-connect";
import { CloseIcon } from "@salt-ds/icons";
import { Banner } from "../src/banner/Banner";
import {
  BannerActions,
  BannerContent,
  Button,
  StackLayout,
  Text,
} from "../src/index";

// Warning https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?m=auto&node-id=7997-78021

// Success Banner
// Need to split to 2 blocks - see issue https://github.com/figma/code-connect/issues/200#issuecomment-2457330375
figma.connect(
  Banner,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=7997%3A78070",
  {
    variant: { "Show title": true },
    props: {
      // inlineContent: figma.instance("🔁 Inline content"), // Icon next to the close button
      title: figma.string("Title text"),
      // inlineSwap: figma.boolean("👁️ Inline swap"),
      contentArea: figma.boolean("Content area", {
        true: figma.instance("Banner content"),
        false: undefined,
      }),
      description: figma.string("Description text"),
      closeButton: figma.boolean("Close button", {
        true: (
          <BannerActions>
            <Button aria-label="close" appearance="transparent">
              <CloseIcon />
            </Button>
          </BannerActions>
        ),
        false: undefined,
      }),
      variant: figma.enum("Variant", {
        Primary: "primary",
        Secondary: "secondary",
      }),
    },
    example: (props) => (
      <Banner status="success" variant={props.variant}>
        <BannerContent>
          <StackLayout gap={1}>
            <Text>
              <strong>{props.title}</strong>
            </Text>
            {props.description}
            {props.contentArea}
          </StackLayout>
        </BannerContent>
        {props.closeButton}
      </Banner>
    ),
  },
);
figma.connect(
  Banner,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=7997%3A78070",
  {
    variant: { "Show title": false },
    props: {
      // inlineContent: figma.instance("🔁 Inline content"), // Icon next to the close button
      // title: figma.string("Title text"),
      // inlineSwap: figma.boolean("👁️ Inline swap"),
      contentArea: figma.boolean("Content area", {
        true: figma.instance("Banner content"),
        false: undefined,
      }),
      description: figma.string("Description text"),
      closeButton: figma.boolean("Close button", {
        true: (
          <BannerActions>
            <Button aria-label="close" appearance="transparent">
              <CloseIcon />
            </Button>
          </BannerActions>
        ),
        false: undefined,
      }),
      variant: figma.enum("Variant", {
        Primary: "primary",
        Secondary: "secondary",
      }),
    },
    example: (props) => (
      <Banner status="success" variant={props.variant}>
        <BannerContent>
          <StackLayout gap={1}>
            {props.description}
            {props.contentArea}
          </StackLayout>
        </BannerContent>
        {props.closeButton}
      </Banner>
    ),
  },
);
