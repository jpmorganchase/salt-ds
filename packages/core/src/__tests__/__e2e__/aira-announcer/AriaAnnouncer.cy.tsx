import { AriaAnnouncerProvider } from "@jpmorganchase/uitk-core";

describe("Given a ToolkitProvider", () => {
  describe("with no props set", () => {
    it("should not affect the document flow", () => {
      cy.mount(
        <div id="test-1" style={{ height: "100%", width: "100%" }}>
          <AriaAnnouncerProvider>
            <div style={{ height: "100%", width: "100%" }} />
          </AriaAnnouncerProvider>
        </div>
      );

      cy.document().then((doc) => {
        const style = doc.createElement("style");
        style.innerHTML = `
                body, html {
                    height: 100%;
                    display: block;
                    min-height: auto;
                }
                [data-cy-root] {
                    height: 100%;
                }
            `;
        doc.head.appendChild(style);
        const documentHeight =
          doc.documentElement.getBoundingClientRect().height;
        const documentScrollHeight = document.documentElement.scrollHeight;
        expect(documentHeight).to.equal(documentScrollHeight);
      });
    });
  });
});
