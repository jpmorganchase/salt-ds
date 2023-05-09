import { ReactElement } from "react";
import { Button } from "@salt-ds/core";
import { SearchIcon, SendIcon } from "@salt-ds/icons";

export const IconAndLabel = (): ReactElement => (
  <>
    <Button variant="primary">
      <SearchIcon /> Search
    </Button>
    <Button variant="cta">
      Send <SendIcon />
    </Button>
  </>
);
