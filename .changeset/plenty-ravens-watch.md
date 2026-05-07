---
"@salt-ds/core": minor
---

Added `Tab`, `TabAction`, `TabBar`, `TabList`, `TabPanel`, `Tabs`, `TabTrigger`.

`Tabs` allow users to move between different views of related content without leave the current page.

```tsx
<Tabs defaultValue="Home">
  <TabBar>
    <TabList aria-label="Example tablist">
      <Tab value="Home">
        <TabTrigger>Home</TabTrigger>
      </Tab>
      <Tab value="Transactions">
        <TabTrigger>Transactions</TabTrigger>
      </Tab>
      <Tab value="Checks">
        <TabTrigger>Checks</TabTrigger>
      </Tab>
    </TabList>
  </TabBar>
</Tabs>
```
