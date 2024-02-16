import { useState } from "react";
import {
  H3,
  Text,
  StackLayout,
  RadioButtonGroup,
  RadioButton,
  Link,
} from "@salt-ds/core";
import { LinkCard, LinkCardProps } from "@salt-ds/lab";

export const Accent = () => {
  const [placement, setPlacement] = useState<LinkCardProps["accent"]>("top");

  return (
    <StackLayout style={{ width: "266px" }} align="center">
      <LinkCard accent={placement}>
        <StackLayout gap={1} align="start">
          <H3>Sustainable investing products</H3>
          <Text>
            We have a commitment to provide a wide range of investment solutions
            to enable you to align your financial goals to your values.
          </Text>
          <Link href="#">Learn more</Link>
        </StackLayout>
      </LinkCard>
      <RadioButtonGroup
        value={placement}
        onChange={(e) =>
          setPlacement(e.target.value as LinkCardProps["accent"])
        }
        direction="horizontal"
      >
        <RadioButton label="Top" value="top" key="top" />
        <RadioButton label="Right" value="right" key="right" />
        <RadioButton label="Bottom" value="bottom" key="bottom" />
        <RadioButton label="Left" value="left" key="left" />
      </RadioButtonGroup>
    </StackLayout>
  );
};
