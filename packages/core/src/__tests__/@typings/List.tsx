import {
  List,
  ListItem,
  ListItemAction,
  ListItemActions,
  ListItemContent,
  type ListProps,
} from "@salt-ds/core";
import {
  type ComponentProps,
  type ComponentPropsWithRef,
  createRef,
} from "react";

const unorderedListRef = createRef<HTMLUListElement>();
const orderedListRef = createRef<HTMLOListElement>();
const itemRef = createRef<HTMLLIElement>();
const contentRef = createRef<HTMLSpanElement>();
const buttonRef = createRef<HTMLButtonElement>();
const linkRef = createRef<HTMLAnchorElement>();
const actionsRef = createRef<HTMLDivElement>();

const extractedUnorderedListProps: ComponentPropsWithRef<typeof List> = {
  "aria-label": "Extracted unordered list",
  ref: unorderedListRef,
};
const extractedOrderedListProps: ComponentPropsWithRef<typeof List> = {
  as: "ol",
  ref: orderedListRef,
  start: 3,
};
const orderedOnlyProps = { start: 3 };
const orderedRefOnlyProps = { ref: orderedListRef };

const extractedActionProps: ComponentProps<typeof ListItemAction> = {
  children: <ListItemContent>Extracted button props</ListItemContent>,
};
const extractedButtonProps: ComponentPropsWithRef<typeof ListItemAction> = {
  children: <ListItemContent>Extracted button ref</ListItemContent>,
  ref: buttonRef,
};
const extractedLinkProps: ComponentPropsWithRef<typeof ListItemAction> = {
  children: <ListItemContent>Extracted link ref</ListItemContent>,
  href: "/reports/extracted",
  ref: linkRef,
};

const WrappedAction = (props: typeof extractedActionProps) => (
  <ListItemAction {...props} />
);

<WrappedAction {...extractedActionProps} />;
<ListItemAction {...extractedButtonProps} />;
<ListItemAction {...extractedLinkProps} />;
<List {...extractedUnorderedListProps} />;
<List {...extractedOrderedListProps} />;

<List aria-label="Reports" data-list="reports" ref={unorderedListRef}>
  <ListItem aria-label="Quarterly report" data-row="quarterly" ref={itemRef}>
    <ListItemContent ref={contentRef}>Quarterly report</ListItemContent>
  </ListItem>
</List>;

<List as="ol" ref={orderedListRef} start={3}>
  <ListItem>
    <ListItemContent>Third report</ListItemContent>
  </ListItem>
</List>;

<List>
  <ListItem>
    <ListItemAction
      ref={buttonRef}
      onClick={(event) => {
        event.currentTarget.disabled = true;
      }}
      render={(props) => <button {...props} data-custom-button />}
    >
      <ListItemContent>Run report</ListItemContent>
    </ListItemAction>
    <ListItemActions aria-label="Report actions" ref={actionsRef} role="group">
      <button type="button">Download</button>
    </ListItemActions>
  </ListItem>
</List>;

<List>
  <ListItem>
    <ListItemAction
      href="/reports/quarterly"
      ref={linkRef}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        event.currentTarget.href;
      }}
      render={({ href, ...props }) => (
        <a {...props} data-router-to={href.toUpperCase()} href={href} />
      )}
    >
      <ListItemContent>Open report</ListItemContent>
    </ListItemAction>
  </ListItem>
</List>;

// @ts-expect-error -- only native list roots are supported
<List as="div" />;

// @ts-expect-error -- ordered-list props require as="ol"
<List start={3} />;

// @ts-expect-error -- spread ordered-list props require as="ol"
<List {...orderedOnlyProps} />;

// @ts-expect-error -- an ordered-list ref requires as="ol"
<List ref={orderedListRef} />;

// @ts-expect-error -- a spread ordered-list ref requires as="ol"
<List {...orderedRefOnlyProps} />;

// @ts-expect-error -- as="ol" requires an ordered-list ref
<List as="ol" ref={unorderedListRef} />;

// @ts-expect-error -- as="ul" requires an unordered-list ref
<List as="ul" ref={orderedListRef} />;

// @ts-expect-error -- ListProps<"ol"> requires the ordered discriminator
const orderedPropsWithoutAs: ListProps<"ol"> = { start: 2 };
void orderedPropsWithoutAs;

// @ts-expect-error -- extracted props retain the as/ref pairing
const extractedMismatchedListRef: ComponentPropsWithRef<typeof List> = {
  as: "ol",
  ref: unorderedListRef,
};
void extractedMismatchedListRef;

// @ts-expect-error -- extracted ordered-list props require as="ol"
const extractedOrderedPropsWithoutAs: ComponentPropsWithRef<typeof List> = {
  start: 3,
};
void extractedOrderedPropsWithoutAs;

// @ts-expect-error -- structural roots cannot become event targets
<List onClick={() => undefined} />;

// @ts-expect-error -- structural roots cannot become composite widgets
<List role="listbox" />;

// @ts-expect-error -- structural roots do not accept tabIndex
<List tabIndex={0} />;

// @ts-expect-error -- structural rows cannot become event targets
<ListItem onPointerDown={() => undefined} />;

// @ts-expect-error -- structural rows cannot intercept captured keyboard events
<ListItem onKeyDownCapture={() => undefined} />;

// @ts-expect-error -- structural rows do not accept tabIndex
<ListItem tabIndex={0} />;

// @ts-expect-error -- structural rows cannot be assigned synthetic roles
<ListItem role="button" />;

// @ts-expect-error -- structural rows cannot become editable/focusable
<ListItem contentEditable />;

// @ts-expect-error -- structural rows do not expose access-key activation
<ListItem accessKey="r" />;

// @ts-expect-error -- structural rows cannot opt into native dragging
<ListItem draggable />;

// @ts-expect-error -- passive content cannot become an event target
<ListItemContent onClick={() => undefined} />;

// @ts-expect-error -- disabled links are not part of the API
<ListItemAction href="/reports" disabled />;

// @ts-expect-error -- formAction belongs to the button branch
<ListItemAction href="/reports" formAction="/submit" />;

// @ts-expect-error -- target belongs to the link branch selected by href
<ListItemAction target="_blank" />;

// @ts-expect-error -- a link action needs an anchor ref
<ListItemAction href="/reports" ref={buttonRef} />;

// @ts-expect-error -- a button action needs a button ref
<ListItemAction ref={linkRef} />;

// @ts-expect-error -- extracted link props still require an anchor ref
const extractedMismatchedRef: ComponentPropsWithRef<typeof ListItemAction> = {
  href: "/reports",
  ref: buttonRef,
};
void extractedMismatchedRef;

// @ts-expect-error -- trailing regions cannot intercept child events
<ListItemActions onClick={() => undefined} />;

// @ts-expect-error -- trailing regions do not accept tabIndex
<ListItemActions tabIndex={0} />;

// @ts-expect-error -- group is the only supported explicit role
<ListItemActions role="toolbar" />;
