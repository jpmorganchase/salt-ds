import { fireEvent, render } from "@testing-library/react";
import { RadioButton, RadioButtonGroup } from "../../radio-button";

describe("GIVEN a RadioButtonGroup component", () => {
  it("THEN should exist", () => expect(RadioButtonGroup).toBeDefined());

  describe("WHEN three radio buttons are passed as a prop", () => {
    let radioButtonGroup: HTMLElement;
    const radios = [
      { value: "button one", label: "button one", disabled: false },
      { value: "button two", label: "button two", disabled: false },
      {
        value: "button three",
        label: "button three",
        disabled: false,
      },
    ];
    beforeAll(() => {
      const { getByTestId } = render(
        <RadioButtonGroup
          data-testid="radio-button-group-test"
          radios={radios}
          value="button one"
        />
      );
      radioButtonGroup = getByTestId("radio-button-group-test");
    });

    it("THEN it should render three children", () => {
      expect(radioButtonGroup.children.length).toBe(3);
    });
  });

  describe("WHEN rendered in horizontal (row) layout", () => {
    let radioButtonGroup: HTMLElement;
    beforeAll(() => {
      const { getByTestId } = render(
        <RadioButtonGroup data-testid="radio-button-group-test" row>
          <RadioButton label="Spot" value="spot" />
          <RadioButton label="Forward" value="forward" />
        </RadioButtonGroup>
      );

      radioButtonGroup = getByTestId("radio-button-group-test");
    });

    it("THEN should have the horizontal class name", () => {
      expect(radioButtonGroup.className).toContain("uitkFormGroup-row");
    });
  });
});

describe("GIVEN a RadioButtonGroup uncontrolled component with children as function", () => {
  describe("WHEN defaultValue is set", () => {
    it("THEN it should render with the specified radio being checked", () => {
      const { getByRole } = render(
        <RadioButtonGroup
          aria-label="Uncontrolled Example"
          defaultValue="forward"
          legend="Uncontrolled Group"
          name="fx"
        >
          <RadioButton key="spot" label="Spot" value="spot" />
          <RadioButton key="forward" label="Forward" value="forward" />
          <RadioButton
            disabled
            key="option"
            label="Option (disabled)"
            value="option"
          />
        </RadioButtonGroup>
      );
      expect(getByRole("radio", { name: "Forward" })).toBeChecked();
    });
  });

  it("THEN selecting an option should work", () => {
    const changeSpy = jest.fn((event) => {
      event.persist();
    });

    const { getByLabelText } = render(
      <RadioButtonGroup onChange={changeSpy}>
        <RadioButton label="Spot" value="spot" />
        <RadioButton label="Forward" value="forward" />
      </RadioButtonGroup>
    );

    const spotRadioButton = getByLabelText("Spot") as HTMLInputElement;
    const forwardRadioButton = getByLabelText("Forward") as HTMLInputElement;

    expect(spotRadioButton.checked).toBe(false);
    expect(forwardRadioButton.checked).toBe(false);

    fireEvent.click(forwardRadioButton);

    expect(spotRadioButton.checked).toBe(false);
    expect(forwardRadioButton.checked).toBe(true);
    expect(changeSpy).toHaveBeenCalledTimes(1);
    expect(changeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ target: forwardRadioButton })
    );

    fireEvent.click(spotRadioButton);

    expect(spotRadioButton.checked).toBe(true);
    expect(forwardRadioButton.checked).toBe(false);
    expect(changeSpy).toHaveBeenCalledTimes(2);
    expect(changeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ target: spotRadioButton })
    );
  });
});
