import { Button, FlowLayout, MultilineInput } from "@salt-ds/core";
import {
  BookmarkSolidIcon,
  EditSolidIcon,
  HelpSolidIcon,
  SendIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const ButtonAdornment = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <MultilineInput
      startAdornment={
        <Button sentiment="accented" aria-label="Edit">
          <EditSolidIcon aria-hidden />
        </Button>
      }
      endAdornment={
        <>
          <Button appearance="transparent" aria-label="Help">
            <HelpSolidIcon aria-hidden />
          </Button>
          <Button sentiment="accented" aria-label="Send">
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
        <Button disabled sentiment="accented" aria-label="Send">
          <SendIcon aria-hidden />
        </Button>
      }
      defaultValue="Disabled value"
    />
    <MultilineInput
      readOnly
      endAdornment={
        <Button disabled sentiment="accented" aria-label="Send">
          <SendIcon aria-hidden />
        </Button>
      }
      defaultValue="Readonly value"
    />
  </FlowLayout>
);
