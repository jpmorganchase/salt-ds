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
        <Button aria-label="Note">
          <NoteIcon aria-hidden />
        </Button>
      }
      defaultValue="Value"
    />
    <Input
      endAdornment={
        <Button aria-label="Refresh" sentiment="accented">
          <RefreshIcon aria-hidden />
        </Button>
      }
      defaultValue="Value"
    />
    <Input
      startAdornment={
        <>
          <Button aria-label="Send">
            <SendIcon aria-hidden />
          </Button>
          <Button aria-label="Flag" sentiment="accented">
            <FlagIcon aria-hidden />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <Input
      endAdornment={
        <>
          <Button aria-label="Clear" appearance="transparent">
            <CloseIcon aria-hidden />
          </Button>
          <Button aria-label="Flag" sentiment="accented">
            <FlagIcon aria-hidden />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <Input
      disabled
      endAdornment={
        <>
          <Button aria-label="Send" disabled>
            <SendIcon aria-hidden />
          </Button>
          <Button aria-label="Clear" disabled appearance="transparent">
            <CloseIcon aria-hidden />
          </Button>
          <Button aria-label="Flag" disabled sentiment="accented">
            <FlagIcon aria-hidden />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <Input
      readOnly
      startAdornment={
        <>
          <Button aria-label="Send" disabled>
            <SendIcon aria-hidden />
          </Button>
          <Button aria-label="Clear" disabled appearance="transparent">
            <CloseIcon aria-hidden />
          </Button>
          <Button aria-label="Flag" disabled sentiment="accented">
            <FlagIcon aria-hidden />
          </Button>
        </>
      }
      defaultValue="Value"
    />
    <Input
      disabled
      startAdornment={
        <>
          <Button aria-label="Clear" disabled>
            <CloseIcon aria-hidden />
          </Button>
          <Button aria-label="Flag" disabled appearance="transparent">
            <FlagIcon aria-hidden />
          </Button>
        </>
      }
      endAdornment={
        <Button aria-label="Send" sentiment="accented" disabled>
          <SendIcon aria-hidden />
        </Button>
      }
      defaultValue="Value"
    />
  </FlowLayout>
);
