import { fireEvent, screen, render } from "@testing-library/react";
import { Checkbox, CheckboxGroup } from "../../checkbox";

describe("GIVEN a CheckboxGroup component", () => {
  it("THEN should render checkboxes", () => {
    render(
      <CheckboxGroup>
        <Checkbox label="one" value="one" />
        <Checkbox label="two" value="two" />
        <Checkbox label="three" value="three" />
      </CheckboxGroup>
    );

    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(
      screen
        .getAllByRole("checkbox")
        .map((checkbox) => (checkbox as HTMLInputElement).value)
    ).toEqual(["one", "two", "three"]);
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should respect defaultCheckedValues", () => {
      render(
        <CheckboxGroup defaultCheckedValues={["one"]}>
          <Checkbox label="one" value="one" />
          <Checkbox label="two" value="two" />
          <Checkbox label="three" value="three" />
        </CheckboxGroup>
      );
      expect(screen.getByRole("checkbox", { name: "one" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "two" })).not.toBeChecked();
      expect(screen.getByRole("checkbox", { name: "three" })).not.toBeChecked();
    });

    describe("AND a checkbox is checked and unchecked", () => {
      it("THEN should call onChange and update the DOM", () => {
        let eventValue;
        render(
          <CheckboxGroup
            defaultCheckedValues={["one"]}
            onChange={(event) => {
              eventValue = event.target.value;
            }}
          >
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
        );

        expect(screen.getByRole("checkbox", { name: "one" })).toBeChecked();
        fireEvent.click(screen.getByRole("checkbox", { name: "two" }));
        expect(eventValue).toEqual("two");
        expect(screen.getByRole("checkbox", { name: "one" })).toBeChecked();
        expect(screen.getByRole("checkbox", { name: "two" })).toBeChecked();
        fireEvent.click(screen.getByRole("checkbox", { name: "two" }));
        expect(screen.getByRole("checkbox", { name: "one" })).toBeChecked();
        expect(screen.getByRole("checkbox", { name: "two" })).not.toBeChecked();
      });
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should respect checkedValues", () => {
      render(
        <CheckboxGroup checkedValues={["one"]}>
          <Checkbox label="one" value="one" />
          <Checkbox label="two" value="two" />
          <Checkbox label="three" value="three" />
        </CheckboxGroup>
      );
      expect(screen.getByRole("checkbox", { name: "one" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "two" })).not.toBeChecked();
      expect(screen.getByRole("checkbox", { name: "three" })).not.toBeChecked();
    });

    describe("AND a checkbox is checked and unchecked", () => {
      it("THEN should call onChange and not update the DOM", () => {
        let eventValue;
        render(
          <CheckboxGroup
            checkedValues={["one"]}
            onChange={(event) => {
              eventValue = event.target.value;
            }}
          >
            <Checkbox label="one" value="one" />
            <Checkbox label="two" value="two" />
            <Checkbox label="three" value="three" />
          </CheckboxGroup>
        );

        expect(screen.getByRole("checkbox", { name: "one" })).toBeChecked();
        fireEvent.click(screen.getByRole("checkbox", { name: "two" }));
        expect(eventValue).toEqual("two");
        expect(screen.getByRole("checkbox", { name: "two" })).not.toBeChecked();
        fireEvent.click(screen.getByRole("checkbox", { name: "two" }));
        expect(screen.getByRole("checkbox", { name: "two" })).not.toBeChecked();
      });
    });
  });
});
