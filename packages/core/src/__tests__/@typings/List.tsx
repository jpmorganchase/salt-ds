import {
  List,
  ListItem,
  ListItemContent,
  ListItemTrigger,
} from "@salt-ds/core";
import { createRef } from "react";

const unorderedListRef = createRef<HTMLUListElement>();
const renderedListRef = createRef<HTMLUListElement>();
const buttonRef = createRef<HTMLButtonElement>();
const linkRef = createRef<HTMLAnchorElement>();

<List aria-label="Reports" onClick={() => undefined} ref={unorderedListRef}>
  <ListItem data-row="quarterly" onPointerDown={() => undefined}>
    <ListItemContent data-content="quarterly">Quarterly report</ListItemContent>
  </ListItem>
</List>;

<List ref={renderedListRef} render={<ol reversed start={3} />}>
  <ListItem>
    <ListItemContent>Third report</ListItemContent>
  </ListItem>
</List>;

<List render={(props) => <ol {...props} data-custom-list />} />;

<ListItemTrigger
  onClick={(event) => {
    event.currentTarget.disabled = true;
  }}
  ref={buttonRef}
  render={(props) => <button {...props} data-custom-button />}
>
  <ListItemContent>Run report</ListItemContent>
</ListItemTrigger>;

<ListItemTrigger
  href="/reports/quarterly"
  onClick={(event) => {
    event.currentTarget.href;
  }}
  ref={linkRef}
  render={({ href, ...props }) => <a {...props} href={href} />}
  target="_blank"
>
  <ListItemContent>Open report</ListItemContent>
</ListItemTrigger>;

// @ts-expect-error -- customize the list element with render, not as
<List as="ol" />;

// @ts-expect-error -- ordered-list props belong on the render element
<List start={3} />;

// @ts-expect-error -- links use anchor refs
<ListItemTrigger href="/reports" ref={buttonRef} />;

// @ts-expect-error -- buttons use button refs
<ListItemTrigger ref={linkRef} />;
