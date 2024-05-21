import { ReactElement } from "react";
import {
  Banner,
  BannerContent,
  FlowLayout,
  Text,
  Button,
  StackLayout,
  Link,
} from "@salt-ds/core";

export const MultilineBanners = (): ReactElement => (
  <StackLayout style={{ width: "80%" }}>
    <Banner status="error">
      <BannerContent>
        <StackLayout gap={1}>
          <Text>
            <strong>Unable to process transaction</strong>
          </Text>
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
            An invite has been sent to <strong>Person 1</strong>. Once they
            accept, you will receive a notification.
          </Text>
          <FlowLayout gap={1}>
            <Button variant="secondary">Cancel invite</Button>
            <Button variant="primary">Resend invite</Button>
          </FlowLayout>
        </StackLayout>
      </BannerContent>
    </Banner>
  </StackLayout>
);
