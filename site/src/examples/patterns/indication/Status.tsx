import { FlowLayout } from "@salt-ds/core";
import {
  ErrorIcon,
  InfoIcon,
  SuccessCircleIcon,
  WarningIcon,
} from "@salt-ds/icons";

export const Status = () => {
  return (
    <FlowLayout>
      <InfoIcon size={2} style={{ color: "var(--salt-color-blue-500)" }} />
      <WarningIcon size={2} style={{ color: "var(--salt-color-orange-500)" }} />
      <ErrorIcon size={2} style={{ color: "var(--salt-color-red-500)" }} />
      <SuccessCircleIcon
        size={2}
        style={{ color: "var(--salt-color-blue-500)" }}
      />
    </FlowLayout>
  );
};
