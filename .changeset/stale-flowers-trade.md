---
"@salt-ds/core": minor
---

- Promote `Overlay`, `Overlay Trigger` and `Overlay Panel` from labs to core
- Overlay reveals supplementary content when the user clicks a UI trigger element. It remains active and open until the user dismisses it. It can contain interactive and focusable elements, such as buttons and links.

```tsx
export const Default = (): ReactElement => {
  const id = useId();

  return (
    <Overlay id={id}>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel>
        <h3 id={`${id}-header`} className={styles.contentHeading}>
          Title
        </h3>
        <div id={`${id}-content`}>
          Content of Overlay
          <br />
          <br />
          <Tooltip content={"im a tooltip"}>
            <Button>hover me</Button>
          </Tooltip>
        </div>
      </OverlayPanel>
    </Overlay>
  );
};
```
