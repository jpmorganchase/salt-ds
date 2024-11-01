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

// Warning https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?m=auto&node-id=7997-78021

// Success Banner
figma.connect(
  Banner,
  "https://www.figma.com/design/ChsbbO7pLomT4F5H6tQyLP/Salt-(Next)-Components-%26-Patterns?node-id=7997%3A78070",
  {
    props: {
      // inlineContent: figma.instance("🔁 Inline content"), // Icon next to the close button
      title: figma.boolean("👁️ Title", {
        true: (
          <Text>
            <strong>{figma.string("✏️ Title")}</strong>
          </Text>
        ),
        false: undefined,
      }),
      // inlineSwap: figma.boolean("👁️ Inline swap"),
      contentArea: figma.boolean("👁️ Content area", {
        true: figma.instance("🔁 Banner content"),
        false: undefined,
      }),
      description: figma.string("✏️ Description"),
      closeButton: figma.boolean("👁️ Close button", {
        true: (
          <BannerActions>
            <Button aria-label="close" variant="secondary">
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
            {props.title}
            {props.description}
            {props.contentArea}
          </StackLayout>
        </BannerContent>
        {props.closeButton}
      </Banner>
    ),
  },
);
