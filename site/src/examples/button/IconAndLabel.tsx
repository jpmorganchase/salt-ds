import { Button } from "@salt-ds/core";
import { SearchIcon, SendIcon } from "@salt-ds/icons";

export const IconAndLabel = () => (
  <>
    <Button variant="primary">
      <SearchIcon /> Search
    </Button>
    <Button variant="cta">
      Send <SendIcon />
    </Button>
  </>
);
