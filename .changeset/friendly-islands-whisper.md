---
"@salt-ds/lab": patch
---

Optional prop `id` is no longer passed down from `Overlay` to aria-labelledby in `OverlayPanel`
aria-labelledBy should be passed down directly to the `OverlayPanel` via the a11yProps and id attached to the title element

```tsx
export const Default = (): ReactElement => {
  const id = useId();
  return (
    <Overlay>
      <OverlayTrigger>
        <Button>Show Overlay</Button>
      </OverlayTrigger>
      <OverlayPanel a11yProps={{ "aria-labelledBy": `${id}` }}>
        <h3 className={styles.contentHeading} id={id}>
          Title
        </h3>
        <div>
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
