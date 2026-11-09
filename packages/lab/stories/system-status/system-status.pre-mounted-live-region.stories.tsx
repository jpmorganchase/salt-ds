import { OnSolidButton, Text } from "@salt-ds/core";
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

// POC: an empty live region is on the page from the start and SystemStatus is
// added inside it. Not part of the component's public docs.
export default {
  title: "Lab/System Status/Announcement POC/Pre-mounted Live Region",
  component: SystemStatus,
  globals: pocGlobals,
} as Meta<typeof SystemStatus>;

export const InfoPolite: StoryFn<typeof SystemStatus> = () => {
  const toggle = usePocToggle();

  return (
    <PocLayout
      toggle={toggle}
      description='An empty container with role="status" is on the page from the start. When you show the system status, it is added inside that container, with its "View status" and dismiss buttons. SystemStatus has role="none", so the container is the only live region.'
      listenFor="Listen for whether the button labels are read out together with the message."
    >
      <div role="status">
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
      </div>
    </PocLayout>
  );
};

export const ErrorAssertive: StoryFn<typeof SystemStatus> = () => {
  const toggle = usePocToggle();

  return (
    <PocLayout
      toggle={toggle}
      description='Same as Info Polite, but with the error message, and the container on the page from the start has role="alert" instead of role="status".'
      listenFor="Listen for whether the button labels are read out together with the message."
    >
      <div role="alert">
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
      </div>
    </PocLayout>
  );
};
