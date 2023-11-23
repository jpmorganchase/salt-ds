import {
  Pagination,
  Paginator,
  GoToInput,
  CompactPaginator,
} from "@salt-ds/lab";

describe("GIVEN an Pagination", () => {
  describe("WHEN navigation using the mouse", () => {
    describe("THEN clicking the next arrow button", () => {
      it("THEN should move to the next page", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        cy.findByRole("link", { name: "Page 3" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.findByRole("link", { name: "Page 4" }).realClick();
        cy.findByRole("link", { name: "Page 4" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.get("@pageChangeSpy").should("have.been.calledWith", 4);
      });
    });

    describe("THEN clicking the previous arrow button", () => {
      it("THEN should move to the previous page", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        cy.findByRole("link", { name: "Page 3" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.findByRole("link", { name: "Page 2" }).realClick();
        cy.findByRole("link", { name: "Page 2" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.get("@pageChangeSpy").should("have.been.calledWith", 2);
      });
    });

    describe("THEN clicking a paginator item", () => {
      it("THEN should move to the clicked page", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        cy.findByRole("link", { name: "Page 3" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.findByRole("link", { name: "Page 5" }).realClick();
        cy.findByRole("link", { name: "Page 5" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.get("@pageChangeSpy").should("have.been.calledWith", 5);
      });
    });
  });

  describe("WHEN navigation using the keyboard", () => {
    describe("THEN using the next arrow button", () => {
      it("THEN should move to the next page", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        cy.findByRole("link", { name: "Page 3" }).should(
          "have.attr",
          "aria-current",
          "page"
        );

        cy.findByRole("link", { name: "Next Page" }).realClick();
        cy.findByRole("link", { name: "Page 4" }).should(
          "have.attr",
          "aria-current",
          "page"
        );

        cy.get("@pageChangeSpy").should("have.been.calledWith", 4);
      });
    });

    describe("THEN using the previous arrow button", () => {
      it("THEN should move to the previous page", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        cy.findByRole("link", { name: "Page 3" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.findByRole("link", { name: "Previous Page" }).focus();
        cy.realPress("Enter");
        cy.findByRole("link", { name: "Page 2" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.get("@pageChangeSpy").should("have.been.calledWith", 2);
      });
    });

    describe("THEN using a paginator item", () => {
      it("THEN should move to the selected page", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <Paginator />
          </Pagination>
        );

        cy.findByRole("link", { name: "Page 3" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.findByRole("link", { name: "Page 5" }).focus();
        cy.realPress("Enter");
        cy.findByRole("link", { name: "Page 5" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.get("@pageChangeSpy").should("have.been.calledWith", 5);
      });
    });
  });

  describe("WHEN on the first page", () => {
    it("THEN should disable the previous button", () => {
      cy.mount(
        <Pagination count={10} initialPage={1}>
          <Paginator />
        </Pagination>
      );

      cy.findByRole("link", { name: "Page 1" }).should(
        "have.attr",
        "aria-current",
        "page"
      );
      cy.findByRole("link", { name: "Previous Page" }).should("be.disabled");
    });
  });

  describe("WHEN on the last page", () => {
    it("THEN should disable the next button", () => {
      cy.mount(
        <Pagination count={10} initialPage={10}>
          <Paginator />
        </Pagination>
      );

      cy.findByRole("link", { name: "Page 10" }).should(
        "have.attr",
        "aria-current",
        "page"
      );
      cy.findByRole("link", { name: "Next Page" }).should("be.disabled");
    });
  });

  describe("WHEN using the compact variant", () => {
    describe("AND navigating using the mouse", () => {
      describe("THEN clicking the next arrow button", () => {
        it("THEN should move to the next page", () => {
          const pageChangeSpy = cy.stub().as("pageChangeSpy");
          cy.mount(
            <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
              <CompactPaginator withInput />
            </Pagination>
          );

          cy.findByRole("textbox").should("have.value", "3");
          cy.findByRole("link", { name: "Next Page" }).realClick();
          cy.findByRole("textbox").should("have.value", "4");
          cy.get("@pageChangeSpy").should("have.been.calledWith", 4);
        });
      });

      describe("THEN clicking the previous arrow button", () => {
        it("THEN should move to the previous page", () => {
          const pageChangeSpy = cy.stub().as("pageChangeSpy");
          cy.mount(
            <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
              <CompactPaginator withInput />
            </Pagination>
          );

          cy.findByRole("textbox").should("have.value", "3");
          cy.findByRole("link", { name: "Previous Page" }).realClick();
          cy.findByRole("textbox").should("have.value", "2");
          cy.get("@pageChangeSpy").should("have.been.calledWith", 2);
        });
      });

      describe("THEN clicking a the count item", () => {
        it("THEN should move to the last page", () => {
          const pageChangeSpy = cy.stub().as("pageChangeSpy");
          cy.mount(
            <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
              <CompactPaginator withInput />
            </Pagination>
          );

          cy.findByRole("textbox").should("have.value", "3");
          cy.findByRole("link", { name: "Page 10" }).realClick();
          cy.findByRole("textbox").should("have.value", "10");
          cy.get("@pageChangeSpy").should("have.been.calledWith", 10);
        });
      });
    });

    describe("AND navigating using the keyboard", () => {
      describe("THEN using the next arrow button", () => {
        it("THEN should move to the next page", () => {
          const pageChangeSpy = cy.stub().as("pageChangeSpy");
          cy.mount(
            <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
              <CompactPaginator withInput />
            </Pagination>
          );

          cy.findByRole("textbox").should("have.value", "3");
          cy.findByRole("link", { name: "Next Page" }).focus();
          cy.realPress("Enter");
          cy.findByRole("textbox").should("have.value", "4");
          cy.get("@pageChangeSpy").should("have.been.calledWith", 4);
        });
      });

      describe("THEN clicking the previous arrow button", () => {
        it("THEN should move to the previous page", () => {
          const pageChangeSpy = cy.stub().as("pageChangeSpy");
          cy.mount(
            <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
              <CompactPaginator withInput />
            </Pagination>
          );

          cy.findByRole("textbox").should("have.value", "3");
          cy.findByRole("link", { name: "Previous Page" }).focus();
          cy.realPress("Enter");
          cy.findByRole("textbox").should("have.value", "2");
          cy.get("@pageChangeSpy").should("have.been.calledWith", 2);
        });
      });

      describe("THEN clicking a the count item", () => {
        it("THEN should move to the last page", () => {
          const pageChangeSpy = cy.stub().as("pageChangeSpy");
          cy.mount(
            <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
              <CompactPaginator withInput />
            </Pagination>
          );

          cy.findByRole("textbox").should("have.value", "3");
          cy.findByRole("link", { name: "Page 10" }).focus();
          cy.realPress("Enter");
          cy.findByRole("textbox").should("have.value", "10");
          cy.get("@pageChangeSpy").should("have.been.calledWith", 10);
        });
      });
    });

    describe("AND using the embedded go to", () => {
      it("SHOULD then reset to the current page on blur", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <CompactPaginator withInput />
          </Pagination>
        );

        cy.findByRole("textbox").should("have.value", "3");
        cy.findByRole("textbox").focus();
        cy.realType("4");
        cy.findByRole("textbox").should("have.value", "34");
        cy.findByRole("textbox").blur();
        cy.findByRole("textbox").should("have.value", "3");
        cy.get("@pageChangeSpy").should("not.have.been.called");
      });

      it("SHOULD go to the page entered when enter is pressed", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <CompactPaginator withInput />
          </Pagination>
        );

        cy.findByRole("textbox").should("have.value", "3");
        cy.findByRole("textbox").focus();
        cy.realPress("Backspace");
        cy.realType("4");
        cy.findByRole("textbox").should("have.value", "4");
        cy.realPress("Enter");
        cy.findByRole("textbox").should("have.value", "4");
        cy.get("@pageChangeSpy").should("have.been.calledWith", 4);
      });
    });
  });

  // describe("WHEN customising the compact prop", () => {
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

  describe("WHEN customising the siblingCount", () => {
    describe("AND setting it to `3`", () => {
      it("THEN should render 11 buttons when the count is 11", () => {
        cy.mount(
          <Pagination count={11}>
            <Paginator siblingCount={3} />
          </Pagination>
        );

        cy.findAllByRole("link", { name: /^Page.*/ }).should("have.length", 11);
      });

      it("THEN should render 9 buttons when the count is 12", () => {
        cy.mount(
          <Pagination count={12}>
            <Paginator siblingCount={3} />
          </Pagination>
        );

        cy.findAllByRole("link", { name: /^Page.*/ }).should("have.length", 10);
      });
    });

    // TODO revisit when we focus on Pagination
    //
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
        cy.mount(
          <Pagination count={10} initialPage={3}>
            <GoToInput />
            <Paginator data-testid="paginator" />
          </Pagination>
        );

        cy.findByRole("textbox").then((input) => {
          cy.findByTestId("paginator").then((paginator) => {
            cy.wrap(
              input[0].compareDocumentPosition(paginator[0]) &
                Node.DOCUMENT_POSITION_PRECEDING
            ).should("equal", 0);
          });
        });
      });

      it("SHOULD then render on the right if GoToInput is after Paginator", () => {
        cy.mount(
          <Pagination count={10} initialPage={3}>
            <Paginator data-testid="paginator" />
            <GoToInput />
          </Pagination>
        );

        cy.findByRole("textbox").then((input) => {
          cy.findByTestId("paginator").then((paginator) => {
            cy.wrap(
              input[0].compareDocumentPosition(paginator[0]) &
                Node.DOCUMENT_POSITION_FOLLOWING
            ).should("equal", 0);
          });
        });
      });
    });

    describe("AND entering text into the input", () => {
      it("SHOULD accept any value", () => {
        cy.mount(
          <Pagination count={10} initialPage={3}>
            <GoToInput />
            <Paginator />
          </Pagination>
        );

        cy.findByRole("textbox").focus();
        cy.realType("abc");
        cy.findByRole("textbox").should("have.value", "abc");
        cy.findByRole("textbox").clear();
        cy.realType("-2");
        cy.findByRole("textbox").should("have.value", "-2");
        cy.findByRole("textbox").clear();
        cy.realType("200");
        cy.findByRole("textbox").should("have.value", "200");
      });

      it("SHOULD not change page when the value is invalid", () => {
        cy.mount(
          <Pagination count={10} initialPage={3}>
            <GoToInput />
            <Paginator />
          </Pagination>
        );

        cy.findByRole("link", { name: "Page 3" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.findByRole("textbox").focus();
        cy.realType("abc");
        cy.findByRole("textbox").should("have.value", "abc");
        cy.realPress("Enter");
        cy.findByRole("link", { name: "Page 3" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
      });

      it("SHOULD change page when the value is valid", () => {
        cy.mount(
          <Pagination count={10} initialPage={3}>
            <GoToInput />
            <Paginator />
          </Pagination>
        );

        cy.findByRole("link", { name: "Page 3" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
        cy.findByRole("textbox").focus();
        cy.realType("5");
        cy.findByRole("textbox").should("have.value", "5");
        cy.realPress("Enter");
        cy.findByRole("link", { name: "Page 5" }).should(
          "have.attr",
          "aria-current",
          "page"
        );
      });

      it("SHOULD clear on blur", () => {
        cy.mount(
          <Pagination count={10} initialPage={3}>
            <GoToInput />
            <Paginator />
          </Pagination>
        );

        cy.findByRole("textbox").focus();
        cy.realType("5");
        cy.findByRole("textbox").should("have.value", "5");
        cy.findByRole("textbox").blur();
        cy.findByRole("textbox").should("have.value", "");
      });
    });

    // describe("AND pagination is in compact mode", () => {
    //   it("SHOULD then be hidden", () => {
    //     cy.mount(
    //       <Pagination compactWithInput count={10} initialPage={3}>
    //         <GoToInput />
    //         <Paginator />
    //       </Pagination>
    //     );

    //     cy.findAllByRole("textbox").should("have.length", 1);
    //   });
    // });
  });

  describe("WHEN the count is 1", () => {
    it("should collapse the pagination", () => {
      cy.mount(
        <Pagination count={1}>
          <Paginator />
        </Pagination>
      );

      cy.findByRole("navigation").should("not.exist");
    });
  });

  describe("WHEN using keyboard shortcuts", () => {
    it("Alt+PageDown moves to the previous page", () => {
      const pageChangeSpy = cy.stub().as("pageChangeSpy");
      cy.mount(
        <Pagination count={10} initialPage={2} onPageChange={pageChangeSpy}>
          <Paginator />
        </Pagination>
      );

      cy.findByRole("link", { name: "Page 2" }).should(
        "have.attr",
        "aria-current",
        "page"
      );
      cy.realPress("Tab");
      cy.realPress(["Alt", "PageDown"]);
      cy.get("@pageChangeSpy").should("have.been.calledWith", 1);
    });

    it("Alt+PageUp moves to the next page", () => {
      const pageChangeSpy = cy.stub().as("pageChangeSpy");
      cy.mount(
        <Pagination count={10} onPageChange={pageChangeSpy}>
          <Paginator />
        </Pagination>
      );

      cy.findByRole("link", { name: "Page 1" }).should(
        "have.attr",
        "aria-current",
        "page"
      );
      cy.realPress("Tab");
      cy.realPress(["Alt", "PageUp"]);
      cy.get("@pageChangeSpy").should("have.been.calledWith", 2);
    });
  });
});
