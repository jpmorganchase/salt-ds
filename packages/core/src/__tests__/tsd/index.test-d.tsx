import { expectError } from "tsd";

import { GridLayout } from "./GridLayout";

expectError(
  <GridLayout as="div" href="www.google.com">
    Grid layout content
  </GridLayout>
);
