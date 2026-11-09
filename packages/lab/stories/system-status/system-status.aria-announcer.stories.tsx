import { OnSolidButton, Text, useAriaAnnouncer } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  SystemStatus,
  SystemStatusActions,
  SystemStatusContent,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  POC_ERROR,
  POC_INFO,
  PocLayout,
  pocGlobals,
  usePocToggle,
} from "./AnnouncementPocHarness";

// POC: SystemStatus is not a live region. The message is sent separately to
// useAriaAnnouncer, which writes it into a visually hidden live region rendered
// by SaltProvider and removes it after 300 ms. Not part of the component's
// public docs.
export default {
  title: "Lab/System Status/Announcement POC/Aria Announcer",
  component: SystemStatus,
  globals: pocGlobals,
} as Meta<typeof SystemStatus>;

export const InfoPolite: StoryFn<typeof SystemStatus> = () => {
  const { announce } = useAriaAnnouncer();
  const toggle = usePocToggle(() =>
    announce(POC_INFO.message, { ariaLive: "polite" }),
  );

  return (
    <PocLayout
      toggle={toggle}
      description='SystemStatus is added to the page with role="none", so it is not a live region. Its message is sent to useAriaAnnouncer, which writes it into a visually hidden polite live region that is already on the page and removes it again after 300 ms. The "View status" and dismiss buttons are not part of the announcement.'
      listenFor="Only the message is announced. Listen for whether there is any cue that the system status has actions, and whether you can find it on the page after the announcement."
    >
      {toggle.open && (
        <SystemStatus status={POC_INFO.status} role="none">
          <SystemStatusContent>
            <Text color="inherit">{POC_INFO.message}</Text>
          </SystemStatusContent>
          <SystemStatusActions>
            <OnSolidButton>View status</OnSolidButton>
            <OnSolidButton
              aria-label="Dismiss system status"
              onClick={toggle.dismiss}
            >
              <CloseIcon aria-hidden />
            </OnSolidButton>
          </SystemStatusActions>
        </SystemStatus>
      )}
    </PocLayout>
  );
};

export const ErrorAssertive: StoryFn<typeof SystemStatus> = () => {
  const { announce } = useAriaAnnouncer();
  const toggle = usePocToggle(() =>
    announce(POC_ERROR.message, { ariaLive: "assertive" }),
  );

  return (
    <PocLayout
      toggle={toggle}
      description="Same as Info Polite, but with the error message, and the message is written into the hidden assertive live region instead of the polite one."
      listenFor="Only the message is announced. Listen for whether there is any cue that the system status has actions, and whether you can find it on the page after the announcement."
    >
      {toggle.open && (
        <SystemStatus status={POC_ERROR.status} role="none">
          <SystemStatusContent>
            <Text color="inherit">{POC_ERROR.message}</Text>
          </SystemStatusContent>
          <SystemStatusActions>
            <OnSolidButton>View status</OnSolidButton>
            <OnSolidButton
              aria-label="Dismiss system status"
              onClick={toggle.dismiss}
            >
              <CloseIcon aria-hidden />
            </OnSolidButton>
          </SystemStatusActions>
        </SystemStatus>
      )}
    </PocLayout>
  );
};
