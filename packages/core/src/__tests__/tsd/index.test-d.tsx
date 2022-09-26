import { expectError } from "tsd";

import { GridLayout } from "@jpmorganchase/uitk-core";

expectError(
  <GridLayout as="div" href="www.google.com">
    Grid layout content
  </GridLayout>
);
