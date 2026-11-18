import {
  Banner,
  BannerContent,
  Button,
  FlowLayout,
  Link,
  StackLayout,
  Text,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const MultilineBanners = (): ReactElement => (
  <StackLayout style={{ width: "80%" }}>
    <Banner status="error">
      <BannerContent>
        <StackLayout gap={1}>
          <Text fontWeight="bolder">Unable to process transaction</Text>
          <Text>
            There was an error processing your transaction. Please check that
            your payment details are correct and try again.
          </Text>
          <Link href="#">Find out more</Link>
        </StackLayout>
      </BannerContent>
    </Banner>
    <Banner status="success">
      <BannerContent>
        <StackLayout gap={1}>
          <Text>
            An invite has been sent to <b>Person 1</b>. Once they accept, you
            will receive a notification.
          </Text>
          <FlowLayout gap={1}>
            <Button appearance="transparent">Cancel invite</Button>
            <Button sentiment="neutral">Resend invite</Button>
          </FlowLayout>
        </StackLayout>
      </BannerContent>
    </Banner>
  </StackLayout>
);
