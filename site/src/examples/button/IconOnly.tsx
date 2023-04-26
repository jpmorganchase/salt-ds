import { Button } from "@salt-ds/core";
import { SearchIcon, SendIcon, SettingsSolidIcon } from "@salt-ds/icons";

export const IconOnly = () => (
  <>
    <Button variant="cta">
      <SendIcon />
    </Button>
    <Button variant="primary">
      <SearchIcon />
    </Button>
    <Button variant="primary">
      <SettingsSolidIcon />
    </Button>
  </>
);
