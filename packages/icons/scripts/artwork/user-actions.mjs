import { softenedFrame as SF } from "./contour-profiles.mjs";
import { C } from "./primitives.mjs";

// Addition/removal changes the action, not how much of the person is drawn.
// The complete shoulders and baseline stay below the separate side modifier.
export const actionPerson =
  C(10.5, 7, 3.25) +
  SF("M3.75 21V18C3.75 14.75 6.75 13.5 10.5 13.5S17.25 14.75 17.25 18V21Z");
