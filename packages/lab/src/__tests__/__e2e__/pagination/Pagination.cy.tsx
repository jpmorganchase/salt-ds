import {
  Pagination,
  Paginator,
  GoToInput,
  CompactPaginator,
} from "@salt-ds/lab";

describe("GIVEN an Pagination", () => {
  describe("WHEN Default variant", () => {
    describe("WHEN count is 1", () => {
      it("SHOULD not display", () => {
        cy.mount(
          <Pagination count={1}>
            <Paginator />
          </Pagination>
        );

        cy.findByRole("navigation").should("not.exist");
        cy.findByRole("link", { name: "Page 1" }).should("not.exist");
        cy.findByRole("link", { name: "Previous Page" }).should("not.exist");
        cy.findByRole("link", { name: "Next Page" }).should("not.exist");
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
    describe("WHEN clicking the next arrow button", () => {
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
    describe("WHEN navigation using the keyboard", () => {
      describe("AND pressing the next arrow button", () => {
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
      describe("AND pressing the previous arrow button", () => {
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
      describe("AND pressing a paginator item", () => {
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
      describe("AND pressing Alt+PageDown", () => {
        it("THEN moves to the previous page", () => {
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
          cy.get("@pageChangeSpy").should("have.been.calledWith", 3);
        });
      });
      describe("AND pressing Alt+PageUp", () => {
        it("THEN moves to the next page", () => {
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
          cy.realPress(["Alt", "PageUp"]);
          cy.get("@pageChangeSpy").should("have.been.calledWith", 1);
        });
      });
    });
  });

  describe("WHEN Compact variant", () => {
    describe("WHEN clicking the next arrow button", () => {
      it("THEN should move to the next page", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <CompactPaginator />
          </Pagination>
        );

        cy.findByText("3").should("exist");
        cy.findByRole("link", { name: "Next Page" }).realClick();
        cy.findByText("4").should("exist");
        cy.get("@pageChangeSpy").should("have.been.calledWith", 4);
      });
    });
    describe("THEN clicking the previous arrow button", () => {
      it("THEN should move to the previous page", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <CompactPaginator />
          </Pagination>
        );

        cy.findByText("3").should("exist");
        cy.findByRole("link", { name: "Previous Page" }).realClick();
        cy.findByText("2").should("exist");
        cy.get("@pageChangeSpy").should("have.been.calledWith", 2);
      });
    });
    describe("THEN clicking the count item", () => {
      it("THEN should move to the last page", () => {
        const pageChangeSpy = cy.stub().as("pageChangeSpy");
        cy.mount(
          <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
            <CompactPaginator />
          </Pagination>
        );

        cy.findAllByText("10").should("exist").and("have.length", 1);
        cy.findByRole("link", { name: "Page 10" }).realClick();
        cy.findAllByText("10").should("exist").and("have.length", 2);
        cy.get("@pageChangeSpy").should("have.been.calledWith", 10);
      });
    });
    describe("WHEN navigating using the keyboard", () => {
      describe("AND pressing the next arrow button", () => {
        it("THEN should move to the next page", () => {
          const pageChangeSpy = cy.stub().as("pageChangeSpy");
          cy.mount(
            <Pagination count={10} onPageChange={pageChangeSpy}>
              <CompactPaginator />
            </Pagination>
          );

          cy.findByText("1").should("exist");
          cy.findByRole("link", { name: "Next Page" }).focus();
          cy.realPress("Enter");
          cy.findByText("2").should("exist");
          cy.get("@pageChangeSpy").should("have.been.calledWith", 2);
        });
      });
      describe("AND pressing the previous arrow button", () => {
        it("THEN should move to the previous page", () => {
          const pageChangeSpy = cy.stub().as("pageChangeSpy");
          cy.mount(
            <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
              <CompactPaginator />
            </Pagination>
          );

          cy.findByText("3").should("exist");
          cy.findByRole("link", { name: "Previous Page" }).focus();
          cy.realPress("Enter");
          cy.findByText("2").should("exist");
          cy.get("@pageChangeSpy").should("have.been.calledWith", 2);
        });
      });
      describe("AND pressing the count item", () => {
        it("THEN should move to the last page", () => {
          const pageChangeSpy = cy.stub().as("pageChangeSpy");
          cy.mount(
            <Pagination count={10} initialPage={3} onPageChange={pageChangeSpy}>
              <CompactPaginator />
            </Pagination>
          );

          cy.findByText("3").should("exist");
          cy.findByRole("link", { name: "Page 10" }).focus();
          cy.realPress("Enter");
          cy.findAllByText("10").should("exist").and("have.length", 2);
          cy.get("@pageChangeSpy").should("have.been.calledWith", 10);
        });
      });
      describe("AND pressing Alt+PageDown", () => {
        it("THEN moves to the previous page", () => {
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
          cy.get("@pageChangeSpy").should("have.been.calledWith", 3);
          cy.findByRole("link", { name: "Page 3" }).should(
            "have.attr",
            "aria-current",
            "page"
          );
        });
      });

      describe("AND pressing Alt+PageUp", () => {
        it("THEN moves to the next page", () => {
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
          cy.realPress(["Alt", "PageUp"]);
          cy.get("@pageChangeSpy").should("have.been.calledWith", 1);
          cy.findByRole("link", { name: "Page 1" }).should(
            "have.attr",
            "aria-current",
            "page"
          );
        });
      });
    });
    describe("AND withInput", () => {
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

      it("SHOULD go to the page from input when enter is pressed", () => {
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

  describe("WHEN siblingCount", () => {
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
  });

  describe("WHEN boundaryCount", () => {
    describe("AND setting it to `2`", () => {
      it("THEN should render 10 buttons when the count is 20", () => {
        cy.mount(
          <Pagination count={20}>
            <Paginator boundaryCount={2} />
          </Pagination>
        );

        cy.findAllByRole("link", { name: /^Page.*/ }).should("have.length", 10);
      });

      it("THEN should render 9 buttons when the count is 20 and initial page is 10", () => {
        cy.mount(
          <Pagination count={20} initialPage={10}>
            <Paginator boundaryCount={2} />
          </Pagination>
        );

        cy.findAllByRole("link", { name: /^Page.*/ }).should("have.length", 9);
      });
    });
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
  });
});
