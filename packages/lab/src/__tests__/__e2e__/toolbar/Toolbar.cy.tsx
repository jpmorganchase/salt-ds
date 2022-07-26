import { composeStories } from "@storybook/testing-react";
import * as toolbarStories from "@stories/toolbar.cypress.stories";

const {
  SimpleToolbar,
  SimpleToolbarOverflowLabel,
  SimpleToolbarCollapsibleItems,
  SingleDynamicCollapseTooltray,
  ToolbarUsingOverflowPriorities,
} = composeStories(toolbarStories);

const NOT_OVERFLOW_IND = `:not([data-overflow-indicator="true"])`;
const OVERFLOWED = `[data-overflowed="true"]`;
const NOT_OVERFLOWED = `:not([data-overflowed="true"])`;

describe("GIVEN a Toolbar component, with overflow behaviour", () => {
  describe("WHEN initial size is sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      it("THEN all the content items will be visible", () => {
        cy.mount(<SimpleToolbar width={400} />);
        const toolbar = cy.findByRole("toolbar");
        toolbar.should("have.class", "uitkToolbar");
        cy.get(".Responsive-inner > *")
          .should("have.length", 10)
          .filter(":visible")
          .should("have.length", 10);
      });
      it("THEN no items will be overflowed", () => {
        cy.mount(<SimpleToolbar width={400} />);
        const toolbar = cy.findByRole("toolbar");
        toolbar.should("have.class", "uitkToolbar");
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          0
        );
      });
      it("THEN no overflow indicator will be present", () => {
        cy.mount(<SimpleToolbar width={400} />);
        const toolbar = cy.findByRole("toolbar");
        toolbar.should("have.class", "uitkToolbar");
        cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
          "have.length",
          0
        );
      });
    });

    describe("WHEN resized to just below required width", () => {
      it("THEN overflowed items will be hidden", () => {
        // Test with the default overflow indicator
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "350px");
        cy.get(".Responsive-inner > *")
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 9);
        // Test with the a custom overflow indicator, whose size is not known in advance
        cy.mount(<SimpleToolbarOverflowLabel />);
        cy.get(".uitkToolbar").invoke("css", "width", "350px");
        cy.get(".Responsive-inner > *")
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 8);
      });
      it("THEN items will be overflowed", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "350px");
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          2
        );
        cy.mount(<SimpleToolbarOverflowLabel />);
        cy.get(".uitkToolbar").invoke("css", "width", "350px");
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          3
        );
      });
      it("THEN overflowIndicator will be rendered", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "350px");
        cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
          "have.length",
          1
        );
        cy.mount(<SimpleToolbarOverflowLabel />);
        cy.get(".uitkToolbar").invoke("css", "width", "350px");
        cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
          "have.length",
          1
        );
      });
    });

    describe("WHEN resized slightly further", () => {
      it("THEN another item will be hidden", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "300px");
        cy.get(".Responsive-inner > *")
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 8);
      });
      it("THEN another item will be overflowed", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "300px");
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          3
        );
      });
      it("THEN overflowIndicator will still be rendered", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "300px");
        cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
          "have.length",
          1
        );
      });
    });

    describe("WHEN resized so small that only one item can be displayed", () => {
      it("THEN all items except overflow indicator will be hidden", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "50px");
        cy.get(".Responsive-inner > *")
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 1);
      });
      it("THEN all items except for overflow indicator will be overflowed", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "50px");
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          10
        );
      });
      it("THEN overflowIndicator will still be rendered", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "50px");
        cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
          "have.length",
          1
        );
      });
    });

    describe("WHEN resized to less than the width of a single item", () => {
      it("THEN all items except overflow indicator will be hidden", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "30px");
        cy.get(".Responsive-inner > *")
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 1);
      });
      it("THEN all items except for overflow indicator will be overflowed", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "30px");
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          10
        );
      });
      it("THEN overflowIndicator will still be rendered", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "30px");
        cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
          "have.length",
          1
        );
      });

      it("THEN minimum size will be applied to the Responsive-inner", () => {
        cy.mount(<SimpleToolbar width={400} />);
        cy.get(".uitkToolbar").invoke("css", "width", "30px");
        cy.get(".Responsive-inner").should("have.css", "min-width", "36px");
      });
    });
  });

  describe("WHEN initial size is insufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      it("THEN overflowed items will be hidden", () => {
        cy.mount(<SimpleToolbar width={350} />);
        cy.get(".Responsive-inner > *")
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 9);
      });
      it("THEN the correct items will be overflowed", () => {
        cy.mount(<SimpleToolbar width={350} />);
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          2
        );
        cy.get(
          '.Responsive-inner > *[data-overflowed="true"][data-index="8"]'
        ).should("have.length", 1);
        cy.get(
          '.Responsive-inner > *[data-overflowed="true"][data-index="9"]'
        ).should("have.length", 1);
      });
      it("THEN overflowIndicator will be rendered", () => {
        cy.mount(<SimpleToolbar width={350} />);
        cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
          "have.length",
          1
        );
      });
    });
  });

  describe("WHEN size increased so that overflowed items re-appear in Toolbar", () => {
    it("THEN overflowed items should be reinstated in the correct order", () => {
      cy.mount(<SimpleToolbar width={250} />);
      cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
        "have.length",
        5
      );
      cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
        "have.length",
        1
      );
      cy.get(".uitkToolbar").invoke("css", "width", "350px");
      cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
        "have.length",
        2
      );
      cy.get(
        '.Responsive-inner > *[data-overflowed="true"][data-index="8"]'
      ).should("have.length", 1);
      cy.get(
        '.Responsive-inner > *[data-overflowed="true"][data-index="9"]'
      ).should("have.length", 1);
    });
  });

  describe("WHEN one or more managed items use priority to determine overflow sequence", () => {
    describe("WHEN resized to trigger first overflow", () => {
      it("THEN rightmost priority 5 item will overflow", () => {
        cy.mount(<ToolbarUsingOverflowPriorities width={600} />);
        cy.get(".uitkToolbar").invoke("css", "width", "520px");
        cy.get(".Responsive-inner > *")
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 10);
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          1
        );
        cy.get(
          '.Responsive-inner > *:nth-child(9)[data-overflowed="true"]'
        ).should("have.length", 1);
      });
    });
    describe("WHEN resized further to trigger second overflow", () => {
      it("THEN remaining priority 5 item will overflow", () => {
        cy.mount(<ToolbarUsingOverflowPriorities width={600} />);
        cy.get(".uitkToolbar").invoke("css", "width", "520px");
        cy.wait(50);
        cy.get(".uitkToolbar").invoke("css", "width", "500px");
        cy.get(".Responsive-inner > *")
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 9);
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          2
        );
        cy.get(
          '.Responsive-inner > *:nth-child(8)[data-overflowed="true"]'
        ).should("have.length", 1);
        cy.get(
          '.Responsive-inner > *:nth-child(9)[data-overflowed="true"]'
        ).should("have.length", 1);
      });
    });
    describe("WHEN resized further to trigger third overflow", () => {
      it("THEN priority 3 item will overflow", () => {
        cy.mount(<ToolbarUsingOverflowPriorities width={600} />);
        cy.get(".uitkToolbar").invoke("css", "width", "520px");
        cy.wait(50);
        cy.get(".uitkToolbar").invoke("css", "width", "510px");
        cy.wait(50);
        cy.get(".uitkToolbar").invoke("css", "width", "450px");
        cy.get(".Responsive-inner > *")
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 8);
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          3
        );
        cy.get(
          '.Responsive-inner > *:nth-child(4)[data-overflowed="true"]'
        ).should("have.length", 1);
        cy.get(
          '.Responsive-inner > *:nth-child(8)[data-overflowed="true"]'
        ).should("have.length", 1);
        cy.get(
          '.Responsive-inner > *:nth-child(9)[data-overflowed="true"]'
        ).should("have.length", 1);
      });
    });

    describe("WHEN initial size only allows 4 items to display", () => {
      it("THEN all displayed items will be priority 2", () => {
        cy.mount(<ToolbarUsingOverflowPriorities width={250} />);
        cy.get(".Responsive-inner > *")
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 5);
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          6
        );
        // The 4 visible items should all be priority 2
        cy.get(
          `.Responsive-inner > *${NOT_OVERFLOW_IND}${NOT_OVERFLOWED}[data-priority="2"]`
        ).should("have.length", 4);
      });
    });

    describe("WHEN resized to show only 3 items, THEN gradually resized to show more items", () => {
      // commented out until we understand why this test fails (in CI only)
      // it("THEN priority 2 items will be first to be displayed", () => {
      //   cy.mount(<ToolbarUsingOverflowPriorities width={200} />);
      //   cy.get(".uitkToolbar").invoke("css", "width", "250px");
      //   cy.wait(50);
      //   cy.get(".Responsive-inner > *")
      //     .filter(":visible")
      //     .should("have.length", 5);
      //   cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
      //     "have.length",
      //     6
      //   );
      //   // The 4 visible items should all be priority 2
      //   cy.get(
      //     `.Responsive-inner > *${NOT_OVERFLOW_IND}${NOT_OVERFLOWED}[data-priority="2"]`
      //   ).should("have.length", 4);
      //   cy.get(".uitkToolbar").invoke("css", "width", "310px");
      //   cy.get(
      //     `.Responsive-inner > *${NOT_OVERFLOW_IND}${NOT_OVERFLOWED}[data-priority="2"]`
      //   ).should("have.length", 5);
      //   cy.get(".uitkToolbar").invoke("css", "width", "420px");
      //   cy.get(
      //     `.Responsive-inner > *${NOT_OVERFLOW_IND}${NOT_OVERFLOWED}[data-priority="2"]`
      //   ).should("have.length", 7);
      // });
      it("THEN priority 3 item will be displayed next", () => {
        cy.mount(<ToolbarUsingOverflowPriorities width={600} />);
        cy.get(".uitkToolbar").invoke("css", "width", "420px");
        cy.wait(50);
        cy.get(".uitkToolbar").invoke("css", "width", "470px");
        cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
          "have.length",
          2
        );
        // The 2 remaining overflowed items should both be priority 5
        cy.get(`.Responsive-inner > *${OVERFLOWED}`).should("have.length", 2);
        cy.get(`.Responsive-inner > *${OVERFLOWED}[data-priority="5"]`).should(
          "have.length",
          2
        );
      });
    });
  });
});

describe("GIVEN a Toolbar with 'instant' collapse child items", () => {
  describe("WHEN it initially renders", () => {
    it("THEN all the content items will be visible", () => {
      cy.mount(<SimpleToolbarCollapsibleItems width={500} />);
      cy.get(".Responsive-inner > *")
        .should("have.length", 5)
        .filter(":visible")
        .should("have.length", 5);
    });
    it("THEN no items will be overflowed or collapsed", () => {
      cy.mount(<SimpleToolbarCollapsibleItems width={500} />);
      cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
        "have.length",
        0
      );
      cy.get('.Responsive-inner > *[data-collapsed="true"]').should(
        "have.length",
        0
      );
    });
    it("THEN no overflow indicator will be present", () => {
      cy.mount(<SimpleToolbarCollapsibleItems width={500} />);
      cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
        "have.length",
        0
      );
    });
  });

  describe("WHEN resized to just below required width", () => {
    it("THEN last item will collapse", () => {
      // Test with the default overflow indicator
      cy.mount(<SimpleToolbarCollapsibleItems width={500} />);
      cy.get(".uitkToolbar").invoke("css", "width", "450px");
      cy.get(".Responsive-inner > *")
        .should("have.length", 5)
        .filter(":visible")
        .should("have.length", 5);
      cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
        "have.length",
        0
      );
      cy.get('.Responsive-inner > *[data-collapsed="true"]').should(
        "have.length",
        1
      );
      cy.get('.Responsive-inner > *:last-child[data-collapsed="true"]').should(
        "have.length",
        1
      );
    });
  });
  describe("WHEN resized once more", () => {
    it("THEN next item will collapse", () => {
      // Test with the default overflow indicator
      cy.mount(<SimpleToolbarCollapsibleItems width={500} />);
      cy.get(".uitkToolbar").invoke("css", "width", "450px");
      cy.get(".uitkToolbar").invoke("css", "width", "350px");
      cy.get(".Responsive-inner > *")
        .should("have.length", 5)
        .filter(":visible")
        .should("have.length", 5);
      cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
        "have.length",
        0
      );
      cy.get('.Responsive-inner > *[data-collapsed="true"]').should(
        "have.length",
        2
      );
      cy.get('.Responsive-inner > *:last-child[data-collapsed="true"]').should(
        "have.length",
        1
      );
      cy.get(
        '.Responsive-inner > *:nth-last-child(2)[data-collapsed="true"]'
      ).should("have.length", 1);
    });
  });
  describe("WHEN progressively resized to minimum that can still render all", () => {
    it("THEN all items will collapse and no overflow indicator will be present", () => {
      // Test with the default overflow indicator
      cy.mount(<SimpleToolbarCollapsibleItems width={500} />);
      cy.get(".uitkToolbar").invoke("css", "width", "450px");
      cy.get(".uitkToolbar").invoke("css", "width", "350px");
      cy.get(".uitkToolbar").invoke("css", "width", "210px");
      cy.get(".Responsive-inner > *")
        .should("have.length", 5)
        .filter(":visible")
        .should("have.length", 5);
      cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
        "have.length",
        0
      );
      cy.get('.Responsive-inner > *[data-collapsed="true"]').should(
        "have.length",
        5
      );
      cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
        "have.length",
        0
      );
    });
  });

  describe("WHEN progressively resized beyond minimum that can still render all", () => {
    it("THEN all items will collapse and overflow indicator will be present", () => {
      // Test with the default overflow indicator
      cy.mount(<SimpleToolbarCollapsibleItems width={500} />);
      cy.get(".uitkToolbar").invoke("css", "width", "450px");
      cy.wait(50);
      cy.get(".uitkToolbar").invoke("css", "width", "350px");
      cy.wait(50);
      cy.get(".uitkToolbar").invoke("css", "width", "210px");
      cy.wait(50);
      cy.get(".uitkToolbar").invoke("css", "width", "200px");
      cy.get(".Responsive-inner > *")
        .should("have.length", 6)
        .filter(":visible")
        .should("have.length", 4);
      cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
        "have.length",
        2
      );
      cy.get('.Responsive-inner > *[data-collapsed="true"]').should(
        "have.length",
        5
      );
      cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
        "have.length",
        1
      );
    });
  });
  describe("WHEN resized directly from full size to beyond minimum that can still render all", () => {
    it("THEN all items will collapse and overflow indicator will be present", () => {
      // Test with the default overflow indicator
      cy.mount(<SimpleToolbarCollapsibleItems width={500} />);
      cy.get(".uitkToolbar").invoke("css", "width", "200px");
      cy.get(".Responsive-inner > *")
        .should("have.length", 6)
        .filter(":visible")
        .should("have.length", 4);
      cy.get('.Responsive-inner > *[data-overflowed="true"]').should(
        "have.length",
        2
      );
      cy.get('.Responsive-inner > *[data-collapsed="true"]').should(
        "have.length",
        5
      );
      cy.get('.Responsive-inner > *[data-overflow-indicator="true"]').should(
        "have.length",
        1
      );
    });
  });
  describe("WHEN resized to trigger collapse, then restored to original size, collapsed items are uncollapsed", () => {
    it("THEN all items will collapse and overflow indicator will be present", () => {
      // Test with the default overflow indicator
      cy.mount(<SimpleToolbarCollapsibleItems width={500} />);
      cy.get(".uitkToolbar").invoke("css", "width", "300px");
      cy.wait(50);
      cy.get(".uitkToolbar").invoke("css", "width", "500px");
      cy.get(".Responsive-inner > *")
        .should("have.length", 5)
        .filter(":visible")
        .should("have.length", 5);
      cy.get('.Responsive-inner > *[data-collapsed="true"]').should(
        "have.length",
        0
      );
    });
  });
});

describe("GIVEN a Toolbar with a single 'dynamic' collapse Tooltray", () => {
  describe("WHEN initial size is sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      const TOOLBAR_ITEMS_SELECTOR = ".uitkToolbar > .Responsive-inner > *";
      const TOOLTRAY_ITEMS_SELECTOR = ".uitkTooltray > .Responsive-inner > *";
      it("THEN the Tooltray will be visible", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={310} />);
        cy.get(TOOLBAR_ITEMS_SELECTOR)
          .should("have.length", 1)
          .filter(":visible")
          .should("have.length", 1);
      });
      it("THEN no items will be overflowed", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={310} />);
        cy.get(`${TOOLBAR_ITEMS_SELECTOR}[data-overflowed="true"]`).should(
          "have.length",
          0
        );
      });
      it("THEN no overflow indicator will be present on the Toolbar", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={310} />);
        cy.get(
          `${TOOLBAR_ITEMS_SELECTOR}[data-overflow-indicator="true"]`
        ).should("have.length", 0);
      });
      it("THEN the Toolbar Responsive inner will be collapsing", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={310} />);
        cy.get(
          `.uitkToolbar > .Responsive-inner[data-collapsing="true"]`
        ).should("have.length", 1);
      });
      it("THEN the tooltray will be collapsing", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={310} />);
        cy.get(`${TOOLBAR_ITEMS_SELECTOR}[data-collapsing="true"]`).should(
          "have.length",
          1
        );
      });
      it("THEN all of the tooltray contents will be visible", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={310} />);
        cy.get(TOOLTRAY_ITEMS_SELECTOR)
          .should("have.length", 10)
          .filter(":visible")
          .should("have.length", 10);
      });
      it("THEN none of the tooltray contents will be overflowing", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={310} />);
        cy.get(`${TOOLTRAY_ITEMS_SELECTOR}[data-overflowed="true"]`).should(
          "have.length",
          0
        );
      });
      it("THEN no overflow indicator will be present on the Tooltray", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={310} />);
        cy.get(
          `${TOOLTRAY_ITEMS_SELECTOR}[data-overflow-indicator="true"]`
        ).should("have.length", 0);
      });
    });
  });
  describe("WHEN initial size is not sufficient to display all contents", () => {
    describe("WHEN it initially renders", () => {
      const TOOLBAR_ITEMS_SELECTOR = ".uitkToolbar > .Responsive-inner > *";
      const TOOLTRAY_ITEMS_SELECTOR = ".uitkTooltray > .Responsive-inner > *";
      it("THEN the Tooltray will be visible", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={200} />);
        cy.get(TOOLBAR_ITEMS_SELECTOR)
          .should("have.length", 1)
          .filter(":visible")
          .should("have.length", 1);
      });
      it("THEN no items will be overflowed", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={200} />);
        cy.get(`${TOOLBAR_ITEMS_SELECTOR}[data-overflowed="true"]`).should(
          "have.length",
          0
        );
      });
      it("THEN no overflow indicator will be present on the Toolbar", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={200} />);
        cy.get(
          `${TOOLBAR_ITEMS_SELECTOR}[data-overflow-indicator="true"]`
        ).should("have.length", 0);
      });
      it("THEN the Toolbar Responsive inner will be collapsing", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={200} />);
        cy.get(
          `.uitkToolbar > .Responsive-inner[data-collapsing="true"]`
        ).should("have.length", 1);
      });
      it("THEN the tooltray will be collapsing", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={200} />);
        cy.get(`${TOOLBAR_ITEMS_SELECTOR}[data-collapsing="true"]`).should(
          "have.length",
          1
        );
      });
      it("THEN not all of the tooltray contents will be visible", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={200} />);
        cy.get(TOOLTRAY_ITEMS_SELECTOR)
          .should("have.length", 11)
          .filter(":visible")
          .should("have.length", 6);
      });
      it("THEN some of the tooltray contents will be overflowing", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={200} />);
        cy.get(`${TOOLTRAY_ITEMS_SELECTOR}[data-overflowed="true"]`).should(
          "have.length",
          5
        );
      });
      it("THEN an overflow indicator will be present on the Tooltray", () => {
        cy.mount(<SingleDynamicCollapseTooltray width={200} />);
        cy.get(
          `${TOOLTRAY_ITEMS_SELECTOR}[data-overflow-indicator="true"]`
        ).should("have.length", 1);
      });
    });
  });
});
