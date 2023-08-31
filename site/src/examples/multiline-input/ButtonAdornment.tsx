import { ReactElement } from "react";
import { Text, FlowLayout, Button, MultilineInput } from "@salt-ds/core";
import {
  BankCheckSolidIcon,
  BookmarkSolidIcon,
  EditSolidIcon,
  HelpSolidIcon,
  SendIcon,
  UserBadgeIcon,
} from "@salt-ds/icons";

export const ButtonAdornment = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <MultilineInput
      startAdornment={
        <Button variant="cta">
          <EditSolidIcon />
        </Button>
      }
      endAdornment={
        <>
          <Button variant="secondary">
            <HelpSolidIcon />
          </Button>
          <Button variant="cta">
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
        <Button variant="secondary" disabled>
          <BankCheckSolidIcon />
        </Button>
      }
      defaultValue="Readonly value"
    />
  </FlowLayout>
);
