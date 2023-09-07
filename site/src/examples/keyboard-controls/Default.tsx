import { ReactElement } from "react";
import {
  KeyboardControls,
  KeyboardControl,
} from "../../components/keyboard-controls";

export const Default = (): ReactElement => (
  <KeyboardControls>
    <KeyboardControl keyOrCombos="CTRL + X / CMD + X">
      Performs the "Cut" command, which removes the currently selected text or
      item, and places a copy into the system's clipboard.
    </KeyboardControl>
    <KeyboardControl keyOrCombos="CTRL + C / CMD + C">
      Performs the "Copy" command, which copies the currently selected text or
      item into the system's clipboard.
    </KeyboardControl>
    <KeyboardControl keyOrCombos="CTRL + V / CMD + V">
      Performs the "Paste" command, which inserts the contents of the system's
      clipboard into the currently selected location.
    </KeyboardControl>
  </KeyboardControls>
);
