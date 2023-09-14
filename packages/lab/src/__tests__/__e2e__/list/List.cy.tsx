import { List } from "@salt-ds/lab";

type ItemType = { label: string; value: string };
const ITEMS: ItemType[] = [
  { label: "list item 1", value: "item 1" },
  { label: "list item 2", value: "item 2" },
  { label: "list item 3", value: "item 3" },
];

describe("A list", () => {
  it("should render all its items", () => {
    cy.mount(<List source={ITEMS} />);
    cy.findByText("list item 1").should("exist");
    cy.findByText("list item 2").should("exist");
    cy.findByText("list item 3").should("exist");
  });
  it("should render with a customised id", () => {
    cy.mount(<List id="my-list" source={ITEMS} />);
    cy.findAllByRole("option")
      .eq(0)
      .should("have.attr", "id", "my-list-item-0");
    cy.findAllByRole("option")
      .eq(1)
      .should("have.attr", "id", "my-list-item-1");
    cy.findAllByRole("option")
      .eq(2)
      .should("have.attr", "id", "my-list-item-2");
  });
  it('should render with a customised "getItemId"', () => {
    const getItemId = (index: number) => `my-item-${index}`;
    cy.mount(<List getItemId={getItemId} id="my-list" source={ITEMS} />);
    cy.findAllByRole("option").eq(0).should("have.attr", "id", "my-item-0");
    cy.findAllByRole("option").eq(1).should("have.attr", "id", "my-item-1");
    cy.findAllByRole("option").eq(2).should("have.attr", "id", "my-item-2");
  });
  it('should render with a customised "displayedItemCount"', () => {
    cy.mount(
      <List borderless displayedItemCount={2} itemHeight={10} source={ITEMS} />
    );
    // 20 = itemHeight * displayedItemCount + gaps (1 gap * 0)
    cy.findByRole("listbox").should("have.css", "max-height", "20px");
  });
  it("should respectgap size", () => {
    cy.mount(
      <List
        borderless
        displayedItemCount={2}
        itemGapSize={1}
        itemHeight={10}
        source={ITEMS}
      />
    );
    // 21 = itemHeight * displayedItemCount + gaps (1 gap * 1)
    cy.findByRole("listbox").should("have.css", "max-height", "21px");
  });
  it("should render by default at 100% width, 100% height", () => {
    cy.mount(
      <div style={{ width: 600 }}>
        <List source={ITEMS} />
      </div>
    );
    cy.findByRole("listbox")
      .should("have.attr", "style")
      .and("match", /width: 100%/);
    cy.findByRole("listbox")
      .should("have.attr", "style")
      .and("match", /height: 100%/);
    cy.findByRole("listbox").should("have.css", "width", "600px");
  });

  it('should render with a customised "itemToString"', () => {
    cy.mount(<List itemToString={(item) => item.value} source={ITEMS} />);
    cy.findByText("item 1").should("exist");
    cy.findByText("item 2").should("exist");
    cy.findByText("item 3").should("exist");
  });
  // it.skip("should render with a customised indexer", () => {
  //   type ItemType = { label: string; value: string };
  //   const items: ItemType[] = [
  //     { label: "list item 1", value: "item 1" },
  //     { label: "list item 2", value: "item 2" },
  //     { label: "list item 3", value: "item 3" },
  //   ];
  //   const getItemIndex = (item: any) => items.indexOf(item);
  //   const getItemAtIndex = (index: number) => items[index];
  //   cy.mount(
  //     <List
  //       getItemAtIndex={getItemAtIndex}
  //       getItemIndex={getItemIndex}
  //       itemCount={3}
  //       source={ITEMS}
  //     />
  //   );
  //   cy.findByText("list item 1").should("exist");
  //   cy.findByText("list item 2").should("exist");
  //   cy.findByText("list item 3").should("exist");
  // });
  it('should render with a customised "getItemHeight"', () => {
    const height: { [key: number]: number } = {
      0: 20,
      1: 30,
      2: 50,
    };
    const getItemHeight = (index?: number) =>
      index !== undefined ? height[index] : 0;
    cy.mount(
      <List getItemHeight={getItemHeight} itemHeight={50} source={ITEMS} />
    );
    cy.findAllByRole("option").eq(0).should("have.css", "height", "20px");
    cy.findAllByRole("option").eq(1).should("have.css", "height", "30px");
    cy.findAllByRole("option").eq(2).should("have.css", "height", "50px");
  });
  it("should call the mousedown event on list by default", () => {
    const onMouseDown = cy.stub().as("mouseDownHandler");
    cy.mount(<List onMouseDown={onMouseDown} source={ITEMS} />);
    cy.findByText("list item 1").realClick();
    cy.get("@mouseDownHandler").should("have.been.called");
  });
});
