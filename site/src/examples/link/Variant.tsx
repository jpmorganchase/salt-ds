import { ReactElement } from "react";
import { Link, StackLayout } from "@salt-ds/core";

export const Variant = (): ReactElement => (
  <StackLayout>
    <Link href="/" variant="primary">
      Primary Variant
    </Link>
    <Link href="/" variant="secondary">
      Secondary Variant
    </Link>
  </StackLayout>
);
