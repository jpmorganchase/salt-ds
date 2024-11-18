import { Button, FlowLayout, MultilineInput } from "@salt-ds/core";
import {
  BankCheckSolidIcon,
  BookmarkSolidIcon,
  EditSolidIcon,
  HelpSolidIcon,
  SendIcon,
  UserBadgeIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ButtonAdornment = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <MultilineInput
      startAdornment={
        <Button sentiment="accented">
          <EditSolidIcon />
        </Button>
      }
      endAdornment={
        <>
          <Button appearance="transparent">
            <HelpSolidIcon />
          </Button>
          <Button sentiment="accented">
            <SendIcon />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <MultilineInput
      endAdornment={
        <Button>
          <BookmarkSolidIcon />
        </Button>
      }
      defaultValue="Value"
    />
    <MultilineInput
      disabled
      endAdornment={
        <Button disabled>
          <UserBadgeIcon />
        </Button>
      }
      defaultValue="Disabled value"
    />
    <MultilineInput
      readOnly
      endAdornment={
        <Button appearance="transparent" disabled>
          <BankCheckSolidIcon />
        </Button>
      }
      defaultValue="Readonly value"
    />
  </FlowLayout>
);
