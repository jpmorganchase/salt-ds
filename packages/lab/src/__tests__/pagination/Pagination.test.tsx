import React, { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { Pagination, Paginator, GoToInput } from "../../pagination";

describe("GIVEN an Pagination", () => {
  describe("WHEN navigation using the mouse", () => {
    describe("THEN clicking the next arrow button", () => {
      it("THEN should move to the next page", () => {
        const pageChangeSpy = jest.fn();
        const { getByRole } = render(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        expect(getByRole("link", { name: "Page 3" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        fireEvent.click(getByRole("link", { name: "Next Page" }));
        expect(getByRole("link", { name: "Page 4" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        expect(pageChangeSpy.mock.calls[0][0]).toEqual(4);
      });
    });

    describe("THEN clicking the previous arrow button", () => {
      it("THEN should move to the previous page", () => {
        const pageChangeSpy = jest.fn();
        const { getByRole } = render(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        expect(getByRole("link", { name: "Page 3" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        fireEvent.click(getByRole("link", { name: "Previous Page" }));
        expect(getByRole("link", { name: "Page 2" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        expect(pageChangeSpy.mock.calls[0][0]).toEqual(2);
      });
    });

    describe("THEN clicking a paginator item", () => {
      it("THEN should move to the clicked page", () => {
        const pageChangeSpy = jest.fn();
        const { getByRole } = render(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        expect(getByRole("link", { name: "Page 3" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        fireEvent.click(getByRole("link", { name: "Page 5" }));
        expect(getByRole("link", { name: "Page 5" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        expect(pageChangeSpy.mock.calls[0][0]).toEqual(5);
      });
    });
  });

  describe("WHEN navigation using the keyboard", () => {
    describe("THEN using the next arrow button", () => {
      it("THEN should move to the next page", () => {
        const pageChangeSpy = jest.fn();
        const { getByRole } = render(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        expect(getByRole("link", { name: "Page 3" })).toHaveAttribute(
          "aria-current",
          "page"
        );

        fireEvent.keyDown(getByRole("link", { name: "Next Page" }), {
          key: "Enter",
        });
        expect(getByRole("link", { name: "Page 4" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        expect(pageChangeSpy.mock.calls[0][0]).toEqual(4);
      });
    });

    describe("THEN using the previous arrow button", () => {
      it("THEN should move to the previous page", () => {
        const pageChangeSpy = jest.fn();
        const { getByRole } = render(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        expect(getByRole("link", { name: "Page 3" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        fireEvent.keyDown(getByRole("link", { name: "Previous Page" }), {
          key: "Enter",
        });
        expect(getByRole("link", { name: "Page 2" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        expect(pageChangeSpy.mock.calls[0][0]).toEqual(2);
      });
    });

    describe("THEN using a paginator item", () => {
      it("THEN should move to the clicked page", () => {
        const pageChangeSpy = jest.fn();
        const { getByRole } = render(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        expect(getByRole("link", { name: "Page 3" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        fireEvent.keyDown(getByRole("link", { name: "Page 5" }), {
          key: "Enter",
        });
        expect(getByRole("link", { name: "Page 5" })).toHaveAttribute(
          "aria-current",
          "page"
        );
        expect(pageChangeSpy.mock.calls[0][0]).toEqual(5);
      });
    });
  });

  describe("WHEN on the first page", () => {
    it("THEN should disable the previous button", () => {
      const { getByRole } = render(
        <Pagination count={10} initialPage={1}>
          <Paginator />
        </Pagination>
      );

      expect(getByRole("link", { name: "Page 1" })).toHaveAttribute(
        "aria-current",
        "page"
      );
      expect(getByRole("link", { name: "Previous Page" })).toBeDisabled();
    });
  });

  describe("WHEN on the last page", () => {
    it("THEN should disable the next button", () => {
      const { getByRole } = render(
        <Pagination count={10} initialPage={10}>
          <Paginator />
        </Pagination>
      );

      expect(getByRole("link", { name: "Page 10" })).toHaveAttribute(
        "aria-current",
        "page"
      );
      expect(getByRole("link", { name: "Next Page" })).toBeDisabled();
    });
  });

  describe("WHEN using the compact variant", () => {
    describe("AND navigating using the mouse", () => {
      describe("THEN clicking the next arrow button", () => {
        it("THEN should move to the next page", () => {
          const pageChangeSpy = jest.fn();
          const { getByRole } = render(
            <Pagination
              compact={true}
              count={10}
              initialPage={3}
              onPageChange={pageChangeSpy}
            >
              <Paginator />
            </Pagination>
          );

          expect(getByRole("textbox")).toHaveValue("3");
          fireEvent.click(getByRole("link", { name: "Next Page" }));
          expect(getByRole("textbox")).toHaveValue("4");
          expect(pageChangeSpy.mock.calls[0][0]).toEqual(4);
        });
      });

      describe("THEN clicking the previous arrow button", () => {
        it("THEN should move to the previous page", () => {
          const pageChangeSpy = jest.fn();
          const { getByRole } = render(
            <Pagination
              compact
              count={10}
              initialPage={3}
              onPageChange={pageChangeSpy}
            >
              <Paginator />
            </Pagination>
          );

          expect(getByRole("textbox")).toHaveValue("3");
          fireEvent.click(getByRole("link", { name: "Previous Page" }));
          expect(getByRole("textbox")).toHaveValue("2");
          expect(pageChangeSpy.mock.calls[0][0]).toEqual(2);
        });
      });

      describe("THEN clicking a the count item", () => {
        it("THEN should move to the last page", () => {
          const pageChangeSpy = jest.fn();
          const { getByRole } = render(
            <Pagination
              compact
              count={10}
              initialPage={3}
              onPageChange={pageChangeSpy}
            >
              <Paginator />
            </Pagination>
          );

          expect(getByRole("textbox")).toHaveValue("3");
          fireEvent.click(getByRole("link", { name: "Page 10" }));
          expect(getByRole("textbox")).toHaveValue("10");
          expect(pageChangeSpy.mock.calls[0][0]).toEqual(10);
        });
      });
    });

    describe("AND navigating using the keyboard", () => {
      describe("THEN using the next arrow button", () => {
        it("THEN should move to the next page", () => {
          const pageChangeSpy = jest.fn();
          const { getByRole } = render(
            <Pagination
              compact
              count={10}
              initialPage={3}
              onPageChange={pageChangeSpy}
            >
              <Paginator />
            </Pagination>
          );

          expect(getByRole("textbox")).toHaveValue("3");
          fireEvent.keyDown(getByRole("link", { name: "Next Page" }), {
            key: "Enter",
          });
          expect(getByRole("textbox")).toHaveValue("4");
          expect(pageChangeSpy.mock.calls[0][0]).toEqual(4);
        });
      });

      describe("THEN clicking the previous arrow button", () => {
        it("THEN should move to the previous page", () => {
          const pageChangeSpy = jest.fn();
          const { getByRole } = render(
            <Pagination
              compact
              count={10}
              initialPage={3}
              onPageChange={pageChangeSpy}
            >
              <Paginator />
            </Pagination>
          );

          expect(getByRole("textbox")).toHaveValue("3");
          fireEvent.keyDown(getByRole("link", { name: "Previous Page" }), {
            key: "Enter",
          });
          expect(getByRole("textbox")).toHaveValue("2");
          expect(pageChangeSpy.mock.calls[0][0]).toEqual(2);
        });
      });

      describe("THEN clicking a the count item", () => {
        it("THEN should move to the last page", () => {
          const pageChangeSpy = jest.fn();
          const { getByRole } = render(
            <Pagination
              compact
              count={10}
              initialPage={3}
              onPageChange={pageChangeSpy}
            >
              <Paginator />
            </Pagination>
          );

          expect(getByRole("textbox")).toHaveValue("3");
          fireEvent.keyDown(getByRole("link", { name: "Page 10" }), {
            key: "Enter",
          });
          expect(getByRole("textbox")).toHaveValue("10");
          expect(pageChangeSpy.mock.calls[0][0]).toEqual(10);
        });
      });
    });

    describe("AND using the embedded go to", () => {
      it("SHOULD then reset to the current page on blur", () => {
        const pageChangeSpy = jest.fn();
        const { getByRole } = render(
          <Pagination
            compact
            count={10}
            initialPage={3}
            onPageChange={pageChangeSpy}
          >
            <Paginator />
          </Pagination>
        );

        expect(getByRole("textbox")).toHaveValue("3");
        getByRole("textbox").focus();
        fireEvent.change(getByRole("textbox"), { target: { value: "4" } });
        expect(getByRole("textbox")).toHaveValue("4");
        getByRole("textbox").blur();
        expect(getByRole("textbox")).toHaveValue("3");
        expect(pageChangeSpy).not.toHaveBeenCalled();
      });

      it("SHOULD go to the page entered when enter is pressed", () => {
        const pageChangeSpy = jest.fn();
        const { getByRole } = render(
          <Pagination
            compact
            count={10}
            initialPage={3}
            onPageChange={pageChangeSpy}
          >
            <Paginator />
          </Pagination>
        );

        expect(getByRole("textbox")).toHaveValue("3");
        getByRole("textbox").focus();
        fireEvent.change(getByRole("textbox"), { target: { value: "4" } });
        expect(getByRole("textbox")).toHaveValue("4");
        fireEvent.keyDown(getByRole("textbox"), { key: "Enter" });
        expect(getByRole("textbox")).toHaveValue("4");
        expect(pageChangeSpy).toHaveBeenCalled();
      });
    });
  });

  // describe("WHEN customizing the compact prop", () => {
  //   describe("AND setting it to medium screens", () => {
  //     let matchMediaInstances;
  //
  //     beforeEach(() => {
  //       matchMediaInstances = [];
  //       const fakeMatchMedia = createMatchMedia(1279, matchMediaInstances);
  //       // jsdom does not implement window.matchMedia
  //       window.matchMedia = fakeMatchMedia;
  //       window.matchMedia.restore = () => {
  //         delete window.matchMedia;
  //       };
  //     });
  //
  //     afterEach(() => {
  //       window.matchMedia.restore();
  //     });
  //
  //     it("SHOULD render in compact mode when compact is `md`", () => {
  //       const { getByRole, queryByRole, queryAllByRole } = render(
  //         <Pagination compact="md" count={10} initialPage={3}>
  //           <Paginator />
  //         </Pagination>
  //       );
  //
  //       expect(queryByRole("textbox")).not.toEqual(null);
  //       expect(getByRole("textbox")).toHaveValue("3");
  //       expect(queryAllByRole("link", { name: /^Page.*/ })).toHaveLength(1);
  //     });
  //
  //     it("SHOULD render normally when compact is `xs`", () => {
  //       const { queryAllByRole } = render(
  //         <Pagination compact="xs" count={10} initialPage={3}>
  //           <Paginator />
  //         </Pagination>
  //       );
  //
  //       expect(queryAllByRole("link", { name: /^Page.*/ })).toHaveLength(8);
  //     });
  //   });
  // });

  describe("WHEN customizing the siblingCount", () => {
    describe("AND setting it to `3`", () => {
      it("THEN should render 11 buttons when the count is 11", () => {
        const { queryAllByRole } = render(
          <Pagination count={11}>
            <Paginator siblingCount={3} />
          </Pagination>
        );

        expect(queryAllByRole("link", { name: /^Page.*/ })).toHaveLength(11);
      });

      it("THEN should render 9 buttons when the count is 12", () => {
        const { queryAllByRole } = render(
          <Pagination count={12}>
            <Paginator siblingCount={3} />
          </Pagination>
        );

        expect(queryAllByRole("link", { name: /^Page.*/ })).toHaveLength(10);
      });
    });

    //   describe("AND setting it to medium breakpoint", () => {
    //     let matchMediaInstances;
    //
    //     beforeEach(() => {
    //       matchMediaInstances = [];
    //       const fakeMatchMedia = createMatchMedia(1279, matchMediaInstances);
    //       // jsdom does not implement window.matchMedia
    //       window.matchMedia = fakeMatchMedia;
    //       window.matchMedia.restore = () => {
    //         delete window.matchMedia;
    //       };
    //     });
    //
    //     afterEach(() => {
    //       window.matchMedia.restore();
    //     });
    //
    //     it("THEN should render 6 buttons when the count is 20 and siblingCount is 1 on medium screens", () => {
    //       const { queryAllByRole } = render(
    //         <Pagination count={20}>
    //           <Paginator siblingCount={{ md: 1, lg: 2 }} />
    //         </Pagination>
    //       );
    //
    //       expect(queryAllByRole("link", { name: /^Page.*/ })).toHaveLength(6);
    //     });
    //
    //     it("THEN should render 6 buttons when the count is 20 and siblingCount is 1 on screens less than 961px", () => {
    //       const { queryAllByRole } = render(
    //         <Pagination count={20}>
    //           <Paginator siblingCount={{ 1278: 1, 1280: 2 }} />
    //         </Pagination>
    //       );
    //
    //       expect(queryAllByRole("link", { name: /^Page.*/ })).toHaveLength(6);
    //     });
    //   });
  });

  describe("WHEN using the GoToInput", () => {
    describe("AND changing the order of the components", () => {
      it("SHOULD then render on the left if GoToInput is before Paginator", () => {
        const paginatorRef = createRef<HTMLDivElement>();
        const { getByRole } = render(
          <Pagination count={10} initialPage={3}>
            <GoToInput />
            <Paginator ref={paginatorRef} />
          </Pagination>
        );

        expect(
          // eslint-disable-next-line no-bitwise
          getByRole("textbox").compareDocumentPosition(paginatorRef.current!) &
            Node.DOCUMENT_POSITION_PRECEDING
        ).toEqual(0);
      });

      it("SHOULD then render on the right if GoToInput is after Paginator", () => {
        const paginatorRef = createRef<HTMLDivElement>();
        const { getByRole } = render(
          <Pagination count={10} initialPage={3}>
            <Paginator ref={paginatorRef} />
            <GoToInput />
          </Pagination>
        );

        expect(
          // eslint-disable-next-line no-bitwise
          getByRole("textbox").compareDocumentPosition(paginatorRef.current!) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ).toEqual(0);
      });
    });

    describe("AND entering text into the input", () => {
      it("SHOULD accept any value", () => {
        const { getByRole } = render(
          <Pagination count={10} initialPage={3}>
            <GoToInput />
            <Paginator />
          </Pagination>
        );

        fireEvent.change(getByRole("textbox"), { target: { value: "abc" } });
        expect(getByRole("textbox")).toHaveValue("abc");
        fireEvent.change(getByRole("textbox"), { target: { value: "-2" } });
        expect(getByRole("textbox")).toHaveValue("-2");
        fireEvent.change(getByRole("textbox"), { target: { value: "200" } });
        expect(getByRole("textbox")).toHaveValue("200");
      });

      it("SHOULD not change page when the value is invalid", () => {
        const { getByRole } = render(
          <Pagination count={10} initialPage={3}>
            <GoToInput />
            <Paginator />
          </Pagination>
        );

        fireEvent.change(getByRole("textbox"), { target: { value: "abc" } });
        expect(getByRole("textbox")).toHaveValue("abc");
        fireEvent.keyDown(getByRole("textbox"), { key: "Enter" });
        expect(getByRole("link", { name: "Page 3" })).toHaveAttribute(
          "aria-current",
          "page"
        );
      });

      it("SHOULD change page when the value is valid", () => {
        const { getByRole } = render(
          <Pagination count={10} initialPage={3}>
            <GoToInput />
            <Paginator />
          </Pagination>
        );

        fireEvent.change(getByRole("textbox"), { target: { value: "5" } });
        expect(getByRole("textbox")).toHaveValue("5");
        fireEvent.keyDown(getByRole("textbox"), { key: "Enter" });
        expect(getByRole("link", { name: "Page 5" })).toHaveAttribute(
          "aria-current",
          "page"
        );
      });

      it("SHOULD clear on blur", () => {
        const { getByRole } = render(
          <Pagination count={10} initialPage={3}>
            <GoToInput />
            <Paginator />
          </Pagination>
        );

        getByRole("textbox").focus();
        fireEvent.change(getByRole("textbox"), { target: { value: "5" } });
        expect(getByRole("textbox")).toHaveValue("5");
        getByRole("textbox").blur();
        expect(getByRole("textbox")).toHaveValue("");
      });
    });

    describe("AND pagination is in compact mode", () => {
      it("SHOULD then be hidden", () => {
        const { queryAllByRole } = render(
          <Pagination compact count={10} initialPage={3}>
            <GoToInput />
            <Paginator />
          </Pagination>
        );

        expect(queryAllByRole("textbox")).toHaveLength(1);
      });
    });
  });

  describe("WHEN the count is 1", () => {
    it("should collapse the pagination", () => {
      const { queryByRole } = render(
        <Pagination count={1}>
          <Paginator />
        </Pagination>
      );

      expect(queryByRole("navigation")).toEqual(null);
    });
  });

  describe("WHEN using keyboard shortcuts", () => {
    test("Alt+PageDown moves to the next page", () => {
      const pageChangeSpy = jest.fn();
      const { getByRole } = render(
        <Pagination count={10} onPageChange={pageChangeSpy}>
          <Paginator />
        </Pagination>
      );

      expect(getByRole("link", { name: "Page 1" })).toHaveAttribute(
        "aria-current",
        "page"
      );
      fireEvent.keyDown(getByRole("navigation"), {
        altKey: true,
        key: "PageDown",
      });
      expect(pageChangeSpy.mock.calls[0][0]).toEqual(2);
    });

    test("Alt+PageUp moves to the next page", () => {
      const pageChangeSpy = jest.fn();
      const { getByRole } = render(
        <Pagination count={10} initialPage={2} onPageChange={pageChangeSpy}>
          <Paginator />
        </Pagination>
      );

      expect(getByRole("link", { name: "Page 2" })).toHaveAttribute(
        "aria-current",
        "page"
      );
      fireEvent.keyDown(getByRole("navigation"), {
        altKey: true,
        key: "PageUp",
      });
      expect(pageChangeSpy.mock.calls[0][0]).toEqual(1);
    });
  });
});
