import { Button } from "@salt-ds/core";
import {
  DownloadIcon,
  SearchIcon,
  SendIcon,
  SettingsSolidIcon,
} from "@salt-ds/icons";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";

const ButtonVariants = () => {
  const code = `
  <>
    <Button variant="cta">CTA</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
  </>
  `;
  return (
    <LiveProvider code={code} scope={{ Button }}>
      <LiveEditor />
      <LiveError />
      <LivePreview />
    </LiveProvider>
  );
};

export default ButtonVariants;

export const ButtonIconLabel = () => {
  const code = `
    <>
      <Button variant="cta">
        Send <SendIcon aria-hidden />
      </Button>
      <Button variant="primary">
        <SearchIcon aria-hidden /> Search
      </Button>
      <Button variant="secondary">
        Setting <SettingsSolidIcon aria-hidden />
      </Button>
      <Button aria-label="download">
        <DownloadIcon aria-hidden />
      </Button>
    </>
  `;
  return (
    <LiveProvider
      code={code}
      scope={{ Button, SendIcon, SearchIcon, SettingsSolidIcon, DownloadIcon }}
    >
      <LiveEditor />
      <LiveError />
      <LivePreview />
    </LiveProvider>
  );
};

export const DisabledButtons = () => {
  const code = `
    <>
    <Button disabled>
      Disabled <SendIcon aria-hidden />
    </Button>
    <Button disabled focusableWhenDisabled>
      Focusable When Disabled
    </Button>
    </>
  `;
  return (
    <LiveProvider code={code} scope={{ Button, SendIcon }}>
      <LiveEditor />
      <LiveError />
      <LivePreview />
    </LiveProvider>
  );
};
