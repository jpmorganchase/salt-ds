import { Button, FlowLayout, Input } from "@salt-ds/core";
import {
  CloseIcon,
  FlagIcon,
  NoteIcon,
  RefreshIcon,
  SendIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ButtonAdornments = (): ReactElement => (
  <FlowLayout style={{ width: "266px" }}>
    <Input
      startAdornment={
        <Button>
          <NoteIcon />
        </Button>
      }
      defaultValue="Value"
    />
    <Input
      endAdornment={
        <Button sentiment="accented">
          <RefreshIcon />
        </Button>
      }
      defaultValue="Value"
    />
    <Input
      startAdornment={
        <>
          <Button>
            <SendIcon />
          </Button>
          <Button sentiment="accented">
            <FlagIcon />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <Input
      endAdornment={
        <>
          <Button appearance="transparent">
            <CloseIcon />
          </Button>
          <Button sentiment="accented">
            <FlagIcon />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <Input
      disabled
      endAdornment={
        <>
          <Button disabled>
            <SendIcon />
          </Button>
          <Button disabled appearance="transparent">
            <CloseIcon />
          </Button>
          <Button disabled sentiment="accented">
            <FlagIcon />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <Input
      readOnly
      startAdornment={
        <>
          <Button disabled>
            <SendIcon />
          </Button>
          <Button disabled appearance="transparent">
            <CloseIcon />
          </Button>
          <Button disabled sentiment="accented">
            <FlagIcon />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <Input
      disabled
      startAdornment={
        <>
          <Button disabled>
            <CloseIcon />
          </Button>
          <Button disabled appearance="transparent">
            <FlagIcon />
          </Button>
        </>
      }
      endAdornment={
        <Button sentiment="accented" disabled>
          <SendIcon />
        </Button>
      }
      defaultValue="Value"
    />
  </FlowLayout>
);
