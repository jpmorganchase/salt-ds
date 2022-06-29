import { FormField } from "@jpmorganchase/uitk-core";
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  within,
} from "@testing-library/react";
import { ComponentType, FC } from "react";
import {
  Dropdown,
  DropdownButton,
  DropdownControllerStateAndHelpers,
  MultiSelectDropdown,
} from "../../dropdown";
import { IndexedListItemProps, ListItemBase, useListItem } from "../../list";

/**
 * Change made so far
 * - Use data-testid
 * - await menu in setup when list is open to avoid act warning
 * - Skipped form field test
 */

["MultiSelect", ""].forEach((type) => {
  const isMultiSelect = !!type;
  const Component: ComponentType<any> = isMultiSelect
    ? MultiSelectDropdown
    : Dropdown;

  describe(`Given a ${type}Dropdown component`, () => {
    const simpleSource = ["Option 1", "Option 2", "Option 3", "Option 4"];

    it("Then it should be defined", () => {
      expect(Component).toBeDefined();
    });

    describe("When initialized without a initial item", () => {
      beforeEach(() => {
        render(<Component source={simpleSource} />);
      });

      it("Then the LIST should not be visible", () => {
        expect(screen.queryByTestId("dropdown-list")).toBeNull();
      });

      it("Then no item should be presented", () => {
        simpleSource.forEach((item) => {
          expect(screen.queryByText(item)).toBeNull();
        });
      });
    });

    describe("When clicking on the button", () => {
      let menu: HTMLElement;
      beforeEach(async () => {
        render(<Component source={simpleSource} />);
        fireEvent.click(screen.getByTestId("dropdown-button"));
        menu = await screen.findByTestId("dropdown-list");
      });

      it("Then the LIST should be visible", () => {
        expect(menu).toBeInTheDocument();
      });

      it("Then all items should be on the list", () => {
        expect(within(menu).getAllByRole("option").length).toEqual(
          simpleSource.length
        );
      });
    });

    describe("When initialized with a selected default item", () => {
      const defaultIndex = 0;

      beforeEach(() => {
        render(
          <Component
            disablePortal
            initialSelectedItem={
              isMultiSelect
                ? [simpleSource[defaultIndex]]
                : simpleSource[defaultIndex]
            }
            source={simpleSource}
          />
        );
      });

      it("selection attributes are set on button label", () => {
        const dropdown = screen.getByTestId("dropdown");
        const dummyNodeWhenCollapsed = within(dropdown).getByTestId(
          "dropdown-button-label"
        );
        if (isMultiSelect) {
          expect(dummyNodeWhenCollapsed).not.toHaveAttribute("aria-selected");
          expect(dummyNodeWhenCollapsed).not.toHaveAttribute("aria-posinset");
          expect(dummyNodeWhenCollapsed).not.toHaveAttribute("aria-setsize");
          // aria-activedescendant should be applied for multiselect only in expanded state
          expect(dropdown).not.toHaveAttribute("aria-activedescendant");
        } else {
          expect(dummyNodeWhenCollapsed).toHaveAttribute(
            "aria-selected",
            "true"
          );
          expect(dummyNodeWhenCollapsed).toHaveAttribute("aria-posinset", "1");
          expect(dummyNodeWhenCollapsed).toHaveAttribute(
            "aria-setsize",
            simpleSource.length.toString()
          );
        }
      });

      it("Then should render the list as closed and show the default item", () => {
        expect(
          screen.getByText(simpleSource[defaultIndex])
        ).toBeInTheDocument();
        expect(screen.queryByTestId("dropdown-list")).toBeNull();
      });

      describe("And clicking the button", () => {
        let dropdownList: HTMLElement;

        beforeEach(async () => {
          // `fireEvent.click` does not automatically fire focus
          fireEvent.focus(screen.getByTestId("dropdown-button"));
          fireEvent.click(screen.getByTestId("dropdown-button"));
          dropdownList = await screen.findByTestId("dropdown-list");
        });

        it("Then the initial selected item should have selected and highlighted class", () => {
          // Use getByRole {[isMultiSelect ? 'selected' : 'checked']: true} with @testing-library/dom@^7.21
          // https://github.com/testing-library/dom-testing-library/issues/691#issuecomment-658756858
          const optionElement = within(dropdownList)
            .getAllByRole("option")
            .filter((el) => el.textContent === simpleSource[defaultIndex])[0];
          expect(optionElement).toHaveClass("uitkListItem-highlighted");
          expect(optionElement).toHaveClass("uitkListItem-selected");
        });

        it("Selection attributes set on the dropdown button label", () => {
          const dropDownButton = screen.getByTestId("dropdown-button");
          const label = within(dropDownButton).getByTestId(
            "dropdown-button-label"
          );
          if (isMultiSelect) {
            expect(dropDownButton).toHaveAttribute("aria-activedescendant");
            expect(label).not.toHaveAttribute("aria-posinset");
            expect(label).not.toHaveAttribute("aria-setsize");
            expect(label).not.toHaveAttribute("aria-selected");
          } else {
            expect(dropDownButton).toHaveAttribute("aria-activedescendant");
            expect(label).toHaveAttribute("aria-posinset", "1");
            expect(label).toHaveAttribute(
              "aria-setsize",
              simpleSource.length.toString()
            );
            expect(label).toHaveAttribute("aria-selected", "true");
          }
        });

        describe("Then choosing another option", () => {
          const newOptionIndex = defaultIndex + 1;

          beforeEach(() => {
            fireEvent.click(
              screen
                .getAllByRole("option")
                .filter(
                  (el) => el.textContent === simpleSource[newOptionIndex]
                )[0]
            );
          });

          isMultiSelect
            ? it("Then the new item should have selected and highlighted class", () => {
                const optionElement = within(dropdownList)
                  .getAllByRole("option")
                  .filter(
                    (el) => el.textContent === simpleSource[newOptionIndex]
                  )[0];
                expect(optionElement).toHaveClass("uitkListItem-highlighted");
                expect(optionElement).toHaveClass("uitkListItem-selected");
              })
            : it("should close the menu", () => {
                expect(screen.queryByTestId("dropdown-list")).toBeNull();
              });

          isMultiSelect
            ? it('should show "2 items selected" in the button', () => {
                expect(
                  within(screen.getByTestId("dropdown-button")).getByText(
                    "2 items selected"
                  )
                ).toBeInTheDocument();
              })
            : it("should show new item label in the button", () => {
                expect(
                  within(screen.getByTestId("dropdown-button")).getByText(
                    simpleSource[newOptionIndex]
                  )
                ).toBeInTheDocument();
              });
        });
      });
    });

    describe("When initialized with a defined container", () => {
      let hostContainer: HTMLElement;
      let menu: HTMLElement;

      beforeEach(async () => {
        const { container } = render(<div data-testid="dropdown" />);
        hostContainer = container;
        render(
          <Component container={container.firstChild} source={simpleSource} />
        );
        fireEvent.click(screen.getByTestId("dropdown-button"));
        menu = await screen.findByTestId("dropdown-list");
      });

      it("Then container element should have child appended", () => {
        expect(hostContainer.firstChild).not.toBeNull();
      });

      it("Then DropdownList should be rendered inside container", async () => {
        expect(menu).toBeInTheDocument();
      });
    });

    describe("When the dropdown is disabled", () => {
      beforeEach(() => {
        render(<Component disabled source={simpleSource} />);
      });

      it("Then the dropdown button is dropdown", () => {
        // Given we don't use `button` tag, toBeDisabled() check doesn't work out of box
        expect(screen.getByTestId("dropdown-button")).toHaveAttribute(
          "tabindex",
          "-1"
        );
        expect(screen.getByTestId("dropdown-button")).toHaveAttribute(
          "aria-disabled",
          "true"
        );
      });
    });

    test("A borderless dropdown has a borderless menu", async () => {
      const { findByTestId } = render(
        <Component borderless initialIsOpen source={simpleSource} />
      );
      const list = await findByTestId("dropdown-list");
      expect(list.parentNode).toHaveClass("uitkList-borderless");
    });

    describe("Event handlers", () => {
      describe("When mousing on and off a dropdown", () => {
        const onMouseLeave = jest.fn();
        const onMouseOver = jest.fn();
        beforeEach(() => {
          onMouseLeave.mockClear();
          onMouseOver.mockClear();
          render(
            <Component
              onMouseLeave={onMouseLeave}
              onMouseOver={onMouseOver}
              source={simpleSource}
            />
          );
        });

        describe("AND onMouseLeave is triggered", () => {
          beforeEach(() => {
            fireEvent.mouseLeave(screen.getByTestId("dropdown-button"));
          });

          it("Then onMouseLeave should be called", () => {
            expect(onMouseLeave).toHaveBeenCalled();
          });
        });

        describe("AND onMouseOver is triggered", () => {
          beforeEach(() => {
            fireEvent.mouseOver(screen.getByTestId("dropdown-button"));
          });

          it("Then onMouseOver should be called", () => {
            expect(onMouseOver).toHaveBeenCalled();
          });
        });
      });

      describe("onChange onSelect events", () => {
        const defaultIndex = 0;

        const onSelectSpy = jest.fn();
        const onChangeSpy = jest.fn();

        let menu: HTMLElement;

        beforeEach(async () => {
          onSelectSpy.mockClear();
          onChangeSpy.mockClear();
          render(
            <Component
              initialIsOpen
              initialSelectedItem={
                isMultiSelect
                  ? [simpleSource[defaultIndex]]
                  : simpleSource[defaultIndex]
              }
              onChange={onChangeSpy}
              onSelect={onSelectSpy}
              source={simpleSource}
            />
          );
          menu = await screen.findByTestId("dropdown-list");
        });

        describe("select the selected item again", () => {
          beforeEach(async () => {
            fireEvent.click(
              within(menu)
                .getAllByRole("option")
                .filter(
                  (el) => el.textContent === simpleSource[defaultIndex]
                )[0]
            );
          });

          it("should fire onSelect event", () => {
            expect(onSelectSpy).toHaveBeenCalledWith(
              expect.anything(),
              simpleSource[defaultIndex]
            );
          });

          isMultiSelect
            ? it("should fire onChange event", () => {
                expect(onChangeSpy).toHaveBeenCalledWith(expect.anything(), []);
              })
            : it("should NOT fire onChange event", () => {
                expect(onChangeSpy).not.toHaveBeenCalled();
              });
        });

        describe("select another item", () => {
          beforeEach(() => {
            fireEvent.click(
              screen
                .getAllByRole("option")
                .filter(
                  (el) => el.textContent === simpleSource[defaultIndex + 1]
                )[0]
            );
          });

          it("should fire onSelect event", () => {
            expect(onSelectSpy).toHaveBeenCalledWith(
              expect.anything(),
              simpleSource[defaultIndex + 1]
            );
          });

          it("should fire onChange event", () => {
            expect(onChangeSpy).toHaveBeenCalledWith(
              expect.anything(),
              isMultiSelect
                ? [simpleSource[defaultIndex], simpleSource[defaultIndex + 1]]
                : simpleSource[defaultIndex + 1]
            );
          });
        });
      });

      describe("Focus and blur events", () => {
        const onFocusSpy = jest.fn();
        const onBlurSpy = jest.fn();

        beforeEach(() => {
          jest.clearAllMocks();
          render(
            <Component
              onBlur={onBlurSpy}
              onFocus={onFocusSpy}
              source={simpleSource}
            />
          );
          fireEvent.focus(screen.getByTestId("dropdown-button"));
        });

        it("Focus event on button triggers onFocus handler", () => {
          expect(onFocusSpy).toBeCalled();
        });

        it("Blur event on button triggers onBlur event", () => {
          fireEvent.blur(screen.getByTestId("dropdown-button"));
          expect(onBlurSpy).toBeCalled();
        });

        it("should not fire blur event when clicking on a list item", async () => {
          fireEvent.click(screen.getByTestId("dropdown-button"));
          const dropdownList = await screen.findByTestId("dropdown-list");
          fireEvent.click(within(dropdownList).getAllByRole("option")[0]);
          expect(onBlurSpy).not.toBeCalled();
        });
      });

      describe("Focus and blur events in Form Field", () => {
        const onFocusSpy = jest.fn();
        const onBlurSpy = jest.fn();

        beforeEach(() => {
          jest.clearAllMocks();
          render(
            <FormField onBlur={onBlurSpy} onFocus={onFocusSpy}>
              <Component source={simpleSource} />
            </FormField>
          );
          fireEvent.focus(screen.getByTestId("dropdown-button"));
        });

        it("Focus event on button triggers onFocus handler", () => {
          expect(onFocusSpy).toBeCalled();
        });

        it("Blur event on button triggers onBlur event", () => {
          fireEvent.blur(screen.getByTestId("dropdown-button"));
          expect(onBlurSpy).toBeCalled();
        });

        it("should not fire blur event when clicking on a list item", async () => {
          fireEvent.click(screen.getByTestId("dropdown-button"));
          const dropdownList = await screen.findByTestId("dropdown-list");
          fireEvent.click(within(dropdownList).getAllByRole("option")[0]);
          expect(onBlurSpy).not.toBeCalled();
        });
      });
    });

    describe("Custom renderers", () => {
      describe("Custom item renderer", () => {
        const customTestId = "custom-test-list-id";

        const CustomListItem: FC<IndexedListItemProps<string>> = (props) => {
          const { item, itemProps } = useListItem(props);

          return (
            <ListItemBase {...itemProps} data-testid={customTestId}>
              <i>{item}</i>
            </ListItemBase>
          );
        };

        let menu: HTMLElement;

        beforeEach(async () => {
          render(<Component ListItem={CustomListItem} source={simpleSource} />);
          fireEvent.click(screen.getByTestId("dropdown-button"));
          menu = await screen.findByTestId("dropdown-list");
        });

        it("Then the LIST should be visible", () => {
          expect(menu).toBeInTheDocument();
        });

        it("Then all items should be on screen", () => {
          simpleSource.forEach((item) => {
            expect(screen.queryByText(item)).toBeInTheDocument();
          });

          expect(screen.getAllByTestId(customTestId).length).toEqual(
            simpleSource.length
          );
        });
      });

      describe("Custom button renderer", () => {
        const customTestButtonId = "custom-test-button-id";

        beforeEach(() => {
          render(
            <Component source={simpleSource}>
              {({ DropdownButtonProps }: DropdownControllerStateAndHelpers) => {
                const { style, ...restButtonProps } = DropdownButtonProps;
                return (
                  <DropdownButton
                    {...restButtonProps}
                    data-testid={customTestButtonId}
                  />
                );
              }}
            </Component>
          );
        });

        it("can render the custom button", () => {
          expect(screen.getByTestId(customTestButtonId)).toBeInTheDocument();
        });
      });
    });

    describe("Style overrides", () => {
      describe("When width is set", () => {
        const width = 234;
        let view: RenderResult;

        beforeEach(async () => {
          view = render(
            <div style={{ width }}>
              <Component isOpen source={simpleSource} width={width} />
            </div>
          );
          await view.findByTestId("dropdown-list");
        });

        test("Dropdown button has width set", () => {
          expect(view.getByTestId("dropdown-button")).toHaveStyle({
            width: `${width}px`,
          });
        });

        test("Dropdown list has width set", async () => {
          expect(view.getByTestId("dropdown-list")).toHaveStyle({
            width: `${width}px`,
          });
        });
      });
      describe("When width and listWidth is set", () => {
        const width = 234;
        const listWidth = 432;
        let view: RenderResult;

        beforeEach(async () => {
          view = render(
            <div style={{ width }}>
              <Component
                isOpen
                listWidth={listWidth}
                source={simpleSource}
                width={width}
              />
            </div>
          );
          await view.findByTestId("dropdown-list");
        });

        test("Dropdown button has width set", () => {
          expect(view.getByTestId("dropdown-button")).toHaveStyle({
            width: `${width}px`,
          });
        });

        test("Dropdown list has width set", () => {
          expect(view.getByTestId("dropdown-list")).toHaveStyle({
            width: `${listWidth}px`,
          });
        });
      });

      describe("When fullWidth is set", () => {
        const width = 234;
        let view: RenderResult;

        beforeEach(async () => {
          view = render(
            <div style={{ width }}>
              <Component fullWidth isOpen source={simpleSource} />
            </div>
          );
          await view.findByTestId("dropdown-list");
        });

        test("The root element should have fullWidth set", () => {
          expect(view.getByTestId("dropdown")).toHaveClass(
            "uitkDropdown-fullwidth"
          );
        });
      });
    });

    describe("Controlled props", () => {
      describe("When initialIsOpen is set", () => {
        beforeEach(async () => {
          const view = render(
            <Component initialIsOpen source={simpleSource} />
          );
          await view.findByTestId("dropdown-list");
        });

        it("Then the list should be visible", () => {
          expect(screen.getByTestId("dropdown-list")).toBeInTheDocument();
        });

        it("Then all items should be on the list", () => {
          expect(
            within(screen.getByTestId("dropdown-list")).getAllByRole("option")
              .length
          ).toEqual(simpleSource.length);
        });

        it("Then should still respect subsequent click", async () => {
          fireEvent.click(screen.getByTestId("dropdown-button"));
          expect(screen.queryByTestId("dropdown-list")).toBeNull();

          fireEvent.click(screen.getByTestId("dropdown-button"));
          expect(
            await screen.findByTestId("dropdown-list")
          ).toBeInTheDocument();
        });
      });

      it("Respects isOpen set from external component", async () => {
        const { rerender } = render(<Component isOpen source={simpleSource} />);

        expect(await screen.findByTestId("dropdown-list")).toBeInTheDocument();

        rerender(<Component isOpen={false} source={simpleSource} />);
        expect(screen.queryByTestId("dropdown-list")).toBeNull();
      });
    });

    describe("ARIA attributes", () => {
      let dropdownButton: HTMLElement;
      beforeEach(async () => {
        render(
          <Component ListProps={{ id: "aria-test-id" }} source={simpleSource} />
        );
        dropdownButton = screen.getByTestId("dropdown-button");
      });

      describe("aria-owns", () => {
        test("should not exist when closed", () => {
          expect(dropdownButton).not.toHaveAttribute("aria-owns");
        });

        test("should  match list id when open", async () => {
          fireEvent.click(dropdownButton);
          expect(await screen.findByTestId("dropdown-list")).toHaveAttribute(
            "id",
            "aria-test-id"
          );
          expect(dropdownButton).toHaveAttribute("aria-owns", "aria-test-id");
        });
      });

      describe("aria-hidden", () => {
        test("should be set on button label when menu is open by mouse click", async () => {
          fireEvent.click(dropdownButton);
          await screen.findByTestId("dropdown-list");
          expect(
            within(dropdownButton).getByRole("option", {
              hidden: true,
            })
          ).toHaveAttribute("aria-hidden", "true");
        });

        test("should be set on button label when menu is open by keyboard", async () => {
          fireEvent.focus(dropdownButton);
          fireEvent.keyDown(dropdownButton, { key: "Enter" });
          await screen.findByTestId("dropdown-list");
          expect(
            within(dropdownButton).getByRole("option", {
              hidden: true,
            })
          ).toHaveAttribute("aria-hidden", "true");
        });

        test("should not be set when menu is closed", () => {
          expect(
            within(dropdownButton).getByRole("option")
          ).not.toHaveAttribute("aria-hidden");
        });
      });

      describe("aria-activedescendant", () => {
        test("matches id of the first item when open by keyboard", async () => {
          fireEvent.focus(dropdownButton);
          fireEvent.keyDown(dropdownButton, { key: "Enter" });
          const firstItem = (await screen.findByTestId("dropdown-list"))
            .firstChild as Element;
          expect(dropdownButton).toHaveAttribute(
            "aria-activedescendant",
            firstItem.id
          );
        });

        test("matches id of the first item when opened by mouse click", async () => {
          fireEvent.click(dropdownButton);
          const firstItem = (await screen.findByTestId("dropdown-list"))
            .firstChild as Element;
          expect(dropdownButton).toHaveAttribute(
            "aria-activedescendant",
            firstItem.id
          );
        });

        test("matches button label id when closed", () => {
          if (isMultiSelect) {
            expect(dropdownButton).not.toHaveAttribute("aria-activedescendant");
          } else {
            expect(dropdownButton).toHaveAttribute(
              "aria-activedescendant",
              within(dropdownButton).getByRole("option").id
            );
          }
        });

        test("matches id of the option when mouse over an item", async () => {
          fireEvent.click(dropdownButton);
          const secondOption = within(
            await screen.findByTestId("dropdown-list")
          ).getAllByRole("option")[1];
          fireEvent.mouseMove(secondOption);

          expect(dropdownButton).toHaveAttribute(
            "aria-activedescendant",
            secondOption.id
          );
        });
      });

      describe("aria-multiselectable", () => {
        it(`is ${
          isMultiSelect ? "" : "not "
        }set on both button and list`, async () => {
          fireEvent.click(dropdownButton);
          if (isMultiSelect) {
            expect(dropdownButton).toHaveAttribute(
              "aria-multiselectable",
              "true"
            );
            expect(await screen.findByTestId("dropdown-list")).toHaveAttribute(
              "aria-multiselectable",
              "true"
            );
          } else {
            expect(dropdownButton).not.toHaveAttribute("aria-multiselectable");
            expect(
              await screen.findByTestId("dropdown-list")
            ).not.toHaveAttribute("aria-multiselectable");
          }
        });
      });

      test("listbox role is set on both both button and list", async () => {
        fireEvent.click(dropdownButton);
        expect(dropdownButton).toHaveAttribute("role", "listbox");
        expect(await screen.findByTestId("dropdown-list")).toHaveAttribute(
          "role",
          "listbox"
        );
      });
    });

    test("aria-labelledby is set on both button and list when used in FormField", async () => {
      const label = "Some label";
      const labelId = "label-id";
      const { getByTestId } = render(
        <FormField LabelProps={{ id: labelId }} label={label}>
          <Component source={simpleSource} />
        </FormField>
      );

      const dropdownButton = screen.getByTestId("dropdown-button");

      const labelElem = getByTestId("dropdown-button-label");
      expect(labelElem).toBeDefined();

      const expectedLabelledBy = isMultiSelect
        ? [labelElem.id, labelId].join(" ")
        : labelId;

      expect(dropdownButton).toHaveAttribute(
        "aria-labelledby",
        expectedLabelledBy
      );

      fireEvent.click(dropdownButton);

      expect(await screen.findByTestId("dropdown-list")).toHaveAttribute(
        "aria-labelledby",
        labelId
      );
    });
  });
});
