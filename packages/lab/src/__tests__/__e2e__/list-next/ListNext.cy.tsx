import {ListNext, ListItemNext} from "@salt-ds/lab";

type ItemType = { label: string; value: string };
const ITEMS: ItemType[] = [
  {label: "list item 1", value: "item 1"},
  {label: "list item 2", value: "item 2"},
  {label: "list item 3", value: "item 3"},
];

// Single select tests (default)
describe("A single select list", () => {
  it("should render all its items", () => {
    cy.mount(<ListNext>
      {ITEMS.map((item, index) => {
        return <ListItemNext key={index}>
          {item.label}
        </ListItemNext>
      })}
    </ListNext>);

  }); // they are children rn, do we need this one?
  it("should render with default height and width of 100%", () => {
  });
  it("should wrap text if width is smaller than content", () => {
  });
  it("should update height depending on displayedItemCount", () => {
  });
  it("should allow a single item to be selected", () => {
  });
  it("should not allow a disabled item to be selected", () => {
  });
  // it("should deselect a selected item if it gets disabled", () => {}); // should disabling a selected item deselect it?
  it("should deselect previous item when a new one is selected", () => {
  });
  it("should keep its selected item when the same item is selected", () => {
  });
  // interactions
  it("should select first item on tab when no item was previously focused or selected", () => {
  }); // on tab or on tab followed by arrow?
  it("should not wrap on arrow down if focus is on the last item", () => {
  });
  it("should not wrap on arrow up if focus is on the first item", () => {
  });
  describe("when the list is disabled", () => {
    it("should not allow any items to be selected", () => {
    });
  });
  describe("when the list is deselectable", () => {
    it("should allow to deselect an item if deselectable is active", () => {
    });
  });

});

// Multi select tests
describe("A multi select list", () => {
  it("should allow multiple items to be selected", () => {
  });
  it("should not allow a disabled item to be selected", () => {
  });
  it("should not allow items to be selected if list is disabled", () => {
  });
  it("should allow to deselect an item", () => {
  });
  it("should allow selecting a range without disabled items", () => {
  });
  it("should allow to selecting all items without disabled items", () => {
  });
  it("should allow to deselect all items", () => {
  });
  // interactions
  it("", () => {
  });
});


describe("A list with no items", () => {
  it("should render an empty list with the default placeholder", () => {
    cy.mount(<ListNext/>)
  });
  it("should wrap text if width is smaller than content", () => {
  });
  // interactions
});
