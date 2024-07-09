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
        <Button variant="cta">
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
          <Button variant="cta">
            <FlagIcon />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <Input
      endAdornment={
        <>
          <Button variant="secondary">
            <CloseIcon />
          </Button>
          <Button variant="cta">
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
          <Button disabled variant="secondary">
            <CloseIcon />
          </Button>
          <Button disabled variant="cta">
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
          <Button disabled variant="secondary">
            <CloseIcon />
          </Button>
          <Button disabled variant="cta">
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
          <Button disabled variant="secondary">
            <FlagIcon />
          </Button>
        </>
      }
      endAdornment={
        <Button variant="cta" disabled>
          <SendIcon />
        </Button>
      }
      defaultValue="Value"
    />
  </FlowLayout>
);
