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
        <Button aria-label="Edit" sentiment="accented">
          <EditSolidIcon aria-hidden />
        </Button>
      }
      endAdornment={
        <>
          <Button aria-label="Help" appearance="transparent">
            <HelpSolidIcon aria-hidden />
          </Button>
          <Button aria-label="Send" sentiment="accented">
            <SendIcon aria-hidden />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <MultilineInput
      endAdornment={
        <Button aria-label="Bookmark">
          <BookmarkSolidIcon aria-hidden />
        </Button>
      }
      defaultValue="Value"
    />
    <MultilineInput
      disabled
      endAdornment={
        <Button aria-label="User profile" disabled>
          <UserBadgeIcon aria-hidden />
        </Button>
      }
      defaultValue="Disabled value"
    />
    <MultilineInput
      readOnly
      endAdornment={
        <Button aria-label="Bank check" appearance="transparent" disabled>
          <BankCheckSolidIcon aria-hidden />
        </Button>
      }
      defaultValue="Readonly value"
    />
  </FlowLayout>
);
