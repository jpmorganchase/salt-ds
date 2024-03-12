import { ReactElement } from "react";
import { FlowLayout, StatusIndicator } from "@salt-ds/core";
import {
  GlobeIcon,
  LinkedIcon,
  SaltShakerSolidIcon,
  VisibleSolidIcon,
} from "@salt-ds/icons";

export const CustomIcon = (): ReactElement => (
  <FlowLayout>
    <StatusIndicator status="info" icon={LinkedIcon} />
    <StatusIndicator status="error" icon={VisibleSolidIcon} />
    <StatusIndicator status="warning" icon={GlobeIcon} />
    <StatusIndicator status="success" icon={SaltShakerSolidIcon} />
  </FlowLayout>
);
