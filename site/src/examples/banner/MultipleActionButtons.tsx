import { ReactElement } from "react";
import {
  Banner,
  BannerContent,
  FlowLayout,
  Text,
  FlexItem,
  Button,
  StackLayout,
} from "@salt-ds/core";

export const MultipleActionButtons = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <Banner>
      <BannerContent>
        <StackLayout gap={2}>
          <Text>Information missing in form submission</Text>
          <FlowLayout gap={1}>
            <FlexItem>
              <Button variant="primary">Primary Button</Button>
            </FlexItem>
            <FlexItem>
              <Button variant="secondary">Secondary Button</Button>
            </FlexItem>
          </FlowLayout>
        </StackLayout>
      </BannerContent>
    </Banner>
  </div>
);
