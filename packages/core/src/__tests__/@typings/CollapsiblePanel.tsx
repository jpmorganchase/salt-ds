import { CollapsiblePanel } from "@salt-ds/core";

/*
 * Important: These tests are meant for testing TypeScript type errors only
 */

<CollapsiblePanel render={<section />}>Content</CollapsiblePanel>;

// Callback renderers cannot be reliably inspected by parent components.
// @ts-expect-error
<CollapsiblePanel render={() => <section />}>Content</CollapsiblePanel>;
