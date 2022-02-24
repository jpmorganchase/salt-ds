import { fireEvent, screen, render } from "@testing-library/react";

import { SearchInput } from "../../search-input";

describe("GIVEN a Search", () => {
  describe("WHEN it is uncontrolled without a default value", () => {
    it("THEN should render the Search without a clear button and no value", () => {
      render(<SearchInput />);
      expect(screen.getByRole("textbox")).toHaveValue("");
      expect(
        screen.queryByRole("button", { name: "clear input" })
      ).not.toBeInTheDocument();
    });
  });

  describe("WHEN it is uncontrolled with a default value", () => {
    it("THEN should render the Search with a clear button", () => {
      render(<SearchInput defaultValue="default value" />);
      expect(
        screen.getByRole("button", { name: "clear input" })
      ).toBeInTheDocument();
    });

    it("THEN should have the default value", () => {
      render(<SearchInput defaultValue="default value" />);
      expect(screen.getByRole("textbox")).toHaveValue("default value");
    });

    describe("AND Enter key is pressed on the input", () => {
      it("THEN should call onSubmit with the default value", () => {
        const onSubmitSpy = jest.fn();
        render(
          <SearchInput defaultValue="default value" onSubmit={onSubmitSpy} />
        );
        fireEvent.keyUp(screen.getByRole("textbox"), { key: "Enter" });
        expect(onSubmitSpy).toHaveBeenCalledWith("default value");
      });
    });

    describe("AND the clear button is clicked", () => {
      it("THEN should hide the clear button", () => {
        render(<SearchInput defaultValue="default value" />);
        fireEvent.click(screen.getByRole("button", { name: "clear input" }));
        expect(
          screen.queryByRole("button", { name: "clear input" })
        ).not.toBeInTheDocument();
      });

      it("THEN should call onChange with an empty value", () => {
        const onChangeSpy = jest.fn();
        render(
          <SearchInput defaultValue="default value" onChange={onChangeSpy} />
        );
        fireEvent.click(screen.getByRole("button", { name: "clear input" }));
        expect(onChangeSpy).toHaveBeenCalledWith(expect.anything(), "");
      });

      it("THEN should clear the input value", () => {
        render(<SearchInput defaultValue="default value" />);
        fireEvent.click(screen.getByRole("button", { name: "clear input" }));
        expect(screen.getByRole("textbox")).toHaveValue("");
      });

      it("THEN should focus the input", () => {
        render(<SearchInput defaultValue="default value" />);
        fireEvent.click(screen.getByRole("button", { name: "clear input" }));
        expect(screen.getByRole("textbox")).toHaveFocus();
      });

      it("THEN should call onClear", () => {
        const onClearSpy = jest.fn();
        render(
          <SearchInput defaultValue="default value" onClear={onClearSpy} />
        );
        fireEvent.click(screen.getByRole("button", { name: "clear input" }));
        expect(onClearSpy).toHaveBeenCalled();
      });

      describe("AND the Enter key is pressed on the input", () => {
        it("THEN should not call onSubmit", () => {
          const onSubmitSpy = jest.fn();
          render(
            <SearchInput defaultValue="default value" onSubmit={onSubmitSpy} />
          );
          fireEvent.click(screen.getByRole("button", { name: "clear input" }));
          fireEvent.keyUp(screen.getByRole("textbox"), { key: "Enter" });
          expect(onSubmitSpy).not.toHaveBeenCalled();
        });
      });

      describe("AND the input is updated", () => {
        it("THEN should show the clear button", () => {
          render(<SearchInput defaultValue="default value" />);
          fireEvent.click(screen.getByRole("button", { name: "clear input" }));
          fireEvent.change(screen.getByRole("textbox"), {
            target: { value: "new value" },
          });
          expect(
            screen.queryByRole("button", { name: "clear input" })
          ).toBeInTheDocument();
        });

        it("THEN should have the new value", () => {
          render(<SearchInput defaultValue="default value" />);
          fireEvent.click(screen.getByRole("button", { name: "clear input" }));
          fireEvent.change(screen.getByRole("textbox"), {
            target: { value: "new value" },
          });
          expect(screen.getByRole("textbox")).toHaveValue("new value");
        });

        it("THEN should call onChange with the new value", () => {
          const onChangeSpy = jest.fn();
          render(
            <SearchInput defaultValue="default value" onChange={onChangeSpy} />
          );
          fireEvent.click(screen.getByRole("button", { name: "clear input" }));
          fireEvent.change(screen.getByRole("textbox"), {
            target: { value: "new value" },
          });
          expect(onChangeSpy).toHaveBeenCalledWith(
            expect.anything(),
            "new value"
          );
        });

        describe("AND Enter key is pressed on the input", () => {
          it("THEN should call onSubmit", () => {
            const onClearSpy = jest.fn();
            render(
              <SearchInput defaultValue="default value" onClear={onClearSpy} />
            );
            fireEvent.click(
              screen.getByRole("button", { name: "clear input" })
            );
            fireEvent.change(screen.getByRole("textbox"), {
              target: { value: "new value" },
            });
            fireEvent.keyUp(screen.getByRole("textbox"), { key: "Enter" });
            expect(onClearSpy).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe("WHEN it is uncontrolled and disabled", () => {
    it("THEN should render a disabled input", () => {
      render(<SearchInput disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("WHEN it is controlled with an empty value", () => {
    it("THEN should render the Search without a clear button and no value", () => {
      render(<SearchInput value="" />);
      expect(
        screen.queryByRole("button", { name: "clear input" })
      ).not.toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue("");
    });

    describe("AND ENTER is pressed on the input", () => {
      it("THEN should not call onSubmit", () => {
        const onSubmitSpy = jest.fn();
        render(<SearchInput value="" onSubmit={onSubmitSpy} />);
        fireEvent.keyUp(screen.getByRole("textbox"), { key: "Enter" });
        expect(onSubmitSpy).not.toHaveBeenCalled();
      });
    });

    describe("WHEN the value prop has a value", () => {
      it("THEN should render the clear button", () => {
        render(<SearchInput value="value a" />);
        expect(
          screen.queryByRole("button", { name: "clear input" })
        ).toBeInTheDocument();
      });

      it("THEN should set the input value to the value prop", () => {
        render(<SearchInput value="value a" />);
        expect(screen.getByRole("textbox")).toHaveValue("value a");
      });

      describe("AND the Enter key is pressed on the input", () => {
        it("THEN should call onSubmit with the value prop", () => {
          const onSubmitSpy = jest.fn();
          render(<SearchInput value="value a" onSubmit={onSubmitSpy} />);
          fireEvent.keyUp(screen.getByRole("textbox"), { key: "Enter" });
          expect(onSubmitSpy).toHaveBeenCalledWith("value a");
        });
      });

      describe("AND the input is updated", () => {
        it("THEN should render the Search with a clear button", () => {
          render(<SearchInput value="value a" />);
          fireEvent.change(screen.getByRole("textbox"), {
            target: { value: "value b" },
          });
          expect(
            screen.queryByRole("button", { name: "clear input" })
          ).toBeInTheDocument();
        });

        it("THEN should not update the input value", () => {
          render(<SearchInput value="value a" />);
          fireEvent.change(screen.getByRole("textbox"), {
            target: { value: "value b" },
          });
          expect(screen.getByRole("textbox")).toHaveValue("value a");
        });

        it("THEN call onChange with the new value", () => {
          const onChangeSpy = jest.fn();
          render(<SearchInput value="value a" onChange={onChangeSpy} />);
          fireEvent.change(screen.getByRole("textbox"), {
            target: { value: "value b" },
          });
          expect(onChangeSpy).toHaveBeenCalledWith(
            expect.anything(),
            "value b"
          );
        });

        describe("AND the Enter key is pressed on the input", () => {
          it("THEN should call onSubmit with the value prop", () => {
            const onSubmitSpy = jest.fn();
            render(<SearchInput value="value a" onSubmit={onSubmitSpy} />);
            fireEvent.change(screen.getByRole("textbox"), {
              target: { value: "value b" },
            });
            fireEvent.keyUp(screen.getByRole("textbox"), { key: "Enter" });
            expect(onSubmitSpy).toHaveBeenCalledWith("value a");
          });
        });

        describe("WHEN the value prop is changed to a new value", () => {
          it("THEN should render the Search with a clear button", () => {
            const { rerender } = render(<SearchInput value="value a" />);
            fireEvent.change(screen.getByRole("textbox"), {
              target: { value: "value b" },
            });
            rerender(<SearchInput value="value b" />);
            expect(
              screen.getByRole("button", { name: "clear input" })
            ).toBeInTheDocument();
          });

          test("the input value should be the same as the new value prop", () => {
            const { rerender } = render(<SearchInput value="value a" />);
            fireEvent.change(screen.getByRole("textbox"), {
              target: { value: "value b" },
            });
            rerender(<SearchInput value="value b" />);
            expect(screen.getByRole("textbox")).toHaveValue("value b");
          });

          it("THEN should not call onChange", () => {
            const onChangeSpy = jest.fn();
            const { rerender } = render(
              <SearchInput value="value a" onChange={onChangeSpy} />
            );
            fireEvent.change(screen.getByRole("textbox"), {
              target: { value: "value b" },
            });
            onChangeSpy.mockClear();
            rerender(<SearchInput value="value b" />);
            expect(onChangeSpy).not.toHaveBeenCalled();
          });
        });
      });

      describe("AND the clear button is clicked", () => {
        it("THEN should render the clear button", () => {
          render(<SearchInput value="value a" />);
          fireEvent.click(screen.getByRole("button", { name: "clear input" }));
          expect(
            screen.queryByRole("button", { name: "clear input" })
          ).toBeInTheDocument();
        });

        it("THEN should not call onChange", () => {
          const onChangeSpy = jest.fn();
          render(<SearchInput value="value a" onChange={onChangeSpy} />);
          fireEvent.click(screen.getByRole("button", { name: "clear input" }));
          expect(onChangeSpy).not.toHaveBeenCalled();
        });

        test("the value should still be the value prop", () => {
          render(<SearchInput value="value a" />);
          fireEvent.click(screen.getByRole("button", { name: "clear input" }));
          expect(screen.getByRole("textbox")).toHaveValue("value a");
        });

        it("THEN should refocus the input", () => {
          render(<SearchInput value="value a" />);
          fireEvent.click(screen.getByRole("button", { name: "clear input" }));
          expect(screen.getByRole("textbox")).toHaveFocus();
        });

        it("THEN should call onClear", () => {
          const onClearSpy = jest.fn();
          render(<SearchInput value="value a" onClear={onClearSpy} />);
          fireEvent.click(screen.getByRole("button", { name: "clear input" }));
          expect(onClearSpy).toHaveBeenCalled();
        });
      });
    });
  });
});
