import { FlowLayout } from "@salt-ds/core";
import {
  UrgencyHighIcon,
  UrgencyLowIcon,
  UrgencyMediumIcon,
  UrgencyNoneIcon,
} from "@salt-ds/icons";

export const Urgency = () => {
  return (
    <FlowLayout>
      <UrgencyNoneIcon
        size={2}
        style={{ color: "var(--salt-color-gray-500)" }}
      />
      <UrgencyLowIcon
        size={2}
        style={{ color: "var(--salt-palette-accent)" }}
      />
      <UrgencyMediumIcon
        size={2}
        style={{ color: "var(--salt-color-orange-500)" }}
      />
      <UrgencyHighIcon
        size={2}
        style={{ color: "var(--salt-color-red-500)" }}
      />
    </FlowLayout>
  );
};
