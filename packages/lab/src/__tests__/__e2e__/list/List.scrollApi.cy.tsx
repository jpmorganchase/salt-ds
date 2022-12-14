import { List, ListProps, ListScrollHandles } from "@salt-ds/lab";
import { useRef } from "react";

type ItemType = { label: string; value: string };
const ITEMS: ItemType[] = [
  { label: "list item 1", value: "item 1" },
  { label: "list item 2", value: "item 2" },
  { label: "list item 3", value: "item 3" },
  { label: "list item 4", value: "item 4" },
  { label: "list item 5", value: "item 5" },
];

const TestComponent = (props: ListProps<ItemType>) => {
  const listScrollRef = useRef<ListScrollHandles<ItemType>>(null);
  const handleScrollToLast = () => {
    listScrollRef.current?.scrollToIndex(ITEMS.length - 1);
  };
  const handleScrollToFirst = () => {
    listScrollRef.current?.scrollToIndex(0);
  };

  return (
    <div>
      <button onClick={handleScrollToFirst}>Scroll to first</button>
      <button onClick={handleScrollToLast}>Scroll to last</button>

      <List {...props} scrollingApiRef={listScrollRef} />
    </div>
  );
};

describe("A list", () => {
  it("should scroll to item when using scrollingApiRef", () => {
    cy.mount(<TestComponent source={ITEMS} displayedItemCount={2} />);
    cy.findByText("list item 1").should("be.visible");
    cy.findByText("list item 4").should("not.be.visible");

    cy.findByRole("button", { name: "Scroll to last" }).click();
    cy.findByText("list item 5").should("be.visible");
    cy.findByText("list item 1").should("not.be.visible");

    cy.findByRole("button", { name: "Scroll to first" }).click();
    cy.findByText("list item 1").should("be.visible");
    cy.findByText("list item 5").should("not.be.visible");
  });
});

describe("A VirtualizedList", () => {
  it.skip("should scroll to item when using scrollingApiRef", () => {
    // Test a scenario where item is beyond render buffer
  });
});
