import { ReactElement } from "react";
import { Button, FlowLayout, Input } from "@salt-ds/core";
import { NoteIcon, SendIcon, FlagIcon, RefreshIcon, CloseIcon } from "@salt-ds/icons";

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
