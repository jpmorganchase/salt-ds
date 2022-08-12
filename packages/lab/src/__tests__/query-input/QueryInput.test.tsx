import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryInput, QueryInputCategory } from "../../query-input";
import { Button } from "@jpmorganchase/uitk-core";
import userEvent from "@testing-library/user-event";

const fakeCategories: QueryInputCategory[] = [
  { name: "A", values: ["A1", "A2", "A3"] },
  { name: "B", values: ["B1", "B2", "B3", "B4"] },
  { name: "C", values: ["C1", "C2", "C3", "C4", "C5"] },
];

describe("GIVEN a QueryInput component", () => {
  it("WHEN expanded SHOULD render categories/values", async () => {
    render(<QueryInput categories={fakeCategories} />);
    fireEvent.focus(screen.getByTestId("query-input"));
    await waitFor(() => {
      expect(screen.getByTestId("category-list")).toBeInTheDocument();
    });
    const categoryList = screen.getByTestId("category-list");
    expect(within(categoryList).getByText("A")).toBeInTheDocument();
    expect(within(categoryList).getByText("B")).toBeInTheDocument();
    expect(within(categoryList).getByText("C")).toBeInTheDocument();
    // User clicks category B, its values are expected to appear
    fireEvent.click(within(categoryList).getByText("B"));
    await waitFor(() => {
      expect(screen.getByTestId("value-list")).toBeInTheDocument();
    });
    const valueList = screen.getByTestId("value-list");
    expect(within(valueList).getByText("B1")).toBeInTheDocument();
    expect(within(valueList).getByText("B4")).toBeInTheDocument();
    // User clicks the back button, the list of categories is expected to be visible
    const back = within(valueList).getByText("B");
    fireEvent.click(back);
    await waitFor(() => {
      expect(screen.getByTestId("category-list")).toBeInTheDocument();
    });
  });

  it("WHEN user types in a query SHOULD render the search list", async () => {
    render(<QueryInput categories={fakeCategories} />);
    const queryInput = screen.getByTestId("query-input");
    fireEvent.focus(queryInput);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "2" },
    });
    await waitFor(() => {
      expect(screen.getByTestId("search-list")).toBeInTheDocument();
    });
  });

  it("WHEN autoClose is set to true SHOULD auto close", async () => {
    render(<QueryInput categories={fakeCategories} autoClose={true} />);
    fireEvent.focus(screen.getByTestId("query-input"));
    await waitFor(() => {
      expect(screen.getByTestId("category-list")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("C"));
    await waitFor(() => {
      expect(screen.getByTestId("value-list")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("C2"));
    expect(screen.queryByTestId("value-list")).not.toBeInTheDocument();
  });

  it("WHEN none of the values match the query SHOULD create new tokens", async () => {
    render(<QueryInput categories={fakeCategories} />);
    fireEvent.focus(screen.getByTestId("query-input"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "defg" },
    });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    const pills = screen.getAllByTestId("pill");
    expect(pills).toHaveLength(1);
    expect(pills[0]).toHaveTextContent("defg");
  });

  describe("WHEN Tab is pressed", () => {
    describe("AND focus is on the text edit", () => {
      beforeEach(() => {
        render(<QueryInput categories={fakeCategories} />);
        fireEvent.focus(screen.getByRole("textbox"));
      });

      it("AND there is no text in the input THEN focus should move to the X button", () => {
        userEvent.tab();
        expect(screen.getByTestId("clear-button")).toHaveFocus();
      });

      it("AND there is text in the input THEN the text should be tokenized and X button should be focused", () => {
        const textBox = screen.getByRole("textbox");
        userEvent.type(textBox, "ABCD");
        userEvent.tab();
        const tokens = screen.getAllByRole("option");
        expect(tokens).toHaveLength(1);
        expect(tokens[0]).toHaveTextContent("ABCD");
        expect(screen.getByTestId("clear-button")).toHaveFocus();
      });
    });

    it("AND focus is on the X button THEN focus should move to the boolean selector", () => {
      render(<QueryInput categories={fakeCategories} />);
      fireEvent.focus(screen.getByRole("textbox"));

      userEvent.tab();
      expect(screen.getByTestId("clear-button")).toHaveFocus();
      userEvent.tab();
      expect(screen.getAllByRole("radio")[0]).toHaveFocus();
    });

    it("AND focus is on a menu item THEN focus should move to the X button without making a selection", () => {
      render(<QueryInput categories={fakeCategories} />);
      const textbox = screen.getByRole("textbox");
      fireEvent.focus(textbox);
      userEvent.type(textbox, "2");
      fireEvent.keyDown(textbox, { key: "ArrowDown" });
      userEvent.tab();
      expect(screen.getByTestId("clear-button")).toHaveFocus();
    });
  });

  describe("WHEN Shift+Tab is pressed", () => {
    it("AND focus is on the text edit THEN focus moves to the previous component", () => {
      render(
        <div>
          <Button data-testid="previous-control">PreviousControl</Button>
          <QueryInput categories={fakeCategories} />
        </div>
      );
      const textBox = screen.getByRole("textbox");
      fireEvent.focus(textBox);
      userEvent.tab({ shift: true });
      const previousControl = screen.getByTestId("previous-control");
      // TODO
      // expect(previousControl).toHaveFocus();
    });
  });
});
