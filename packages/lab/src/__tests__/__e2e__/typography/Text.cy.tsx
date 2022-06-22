import {
  Text,
  Div,
  P,
  Code,
  Figure1,
  Figure2,
  Figure3,
  H1,
  H2,
  H3,
  H4,
  HelpText,
  LabelCaption,
  Span,
} from "@jpmorganchase/uitk-lab";

const textExample = `Far far away, behind the word mountains, far from the countries Vokalia
and Consonantia, there live the blind texts. Separated they live in
Bookmarksgrove right at the coast of the Semantics, a large language
ocean. A small river named Duden flows by their place and supplies it
with the necessary regelialia. It is a paradisematic country, in which
roasted parts of sentences fly into your mouth. Even the all-powerful
Pointing has no control about the blind texts it is an almost
unorthographic life One day however a small line of blind text by the
name of Lorem Ipsum decided to leave for the far World of Grammar. The
Big Oxmox advised her not to do so, because there were thousands of bad
Commas, wild Question Marks and devious Semikoli, but the Little Blind
Text didn't listen. She packed her seven versalia, put her initial into
the belt and made herself on the way. When she reached the first hills
of the Italic Mountains, she had a last view back on the skyline of her
hometown Bookmarksgrove, the headline of Alphabet Village and the
subline of her own road, the Line Lane.`;

const componentsArray = [
  { component: Text, name: "Text", tag: "div" },
  { component: Div, name: "Div", tag: "div" },
  { component: P, name: "P", tag: "p" },
  { component: Code, name: "Code", tag: "code" },
  { component: Figure1, name: "Figure1", tag: "span" },
  { component: Figure2, name: "Figure2", tag: "span" },
  { component: Figure3, name: "Figure3", tag: "span" },
  { component: H1, name: "H1", tag: "h1" },
  { component: H2, name: "H2", tag: "h2" },
  { component: H3, name: "H3", tag: "h3" },
  { component: H4, name: "H4", tag: "h4" },
  { component: HelpText, name: "HelpText", tag: "div" },
  { component: LabelCaption, name: "LabelCaption", tag: "label" },
  { component: Span, name: "Span", tag: "span" },
];

// Render correctly
describe("GIVEN a Text Component with elementType", () => {
  componentsArray.forEach(({ component, name, tag }) => {
    it(`${name} component should return correct ${tag} element`, () => {
      const Component = component;

      cy.mount(<Component>{textExample}</Component>);
      cy.get(tag).should("have.class", "uitkText");
    });
  });
});

// No Truncation
describe("GIVEN a Text component with maxRows=2 ", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should not be truncated`, () => {
      const Component = component;

      cy.mount(<Component maxRows={2}>{textExample}</Component>);
      cy.get(".uitkText")
        .should("not.have.class", "uitkText-lineClamp")
        .and("not.have.css", "-webkit-line-clamp", "2");
    });
  });
});

// Truncation + Tooltip
describe("GIVEN a Text component with maxRows=2 and truncate=true", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should display only 2 rows and show Tooltip on focus and hover`, () => {
      const Component = component;

      cy.mount(
        <Component truncate={true} maxRows={2}>
          {textExample}
        </Component>
      );
      const textComponent = cy.get(".uitkText");
      textComponent
        .should("have.class", "uitkText-lineClamp")
        .and("have.css", "-webkit-line-clamp", "2");

      cy.realPress("Tab");
      cy.findByRole("tooltip").should("be.visible");

      cy.realPress("Escape");

      cy.get(".uitkText").realHover();
      cy.findByRole("tooltip").should("be.visible");
    });
  });
});

// Truncation + No Tooltip
describe("GIVEN a Text component with maxRows=2, truncate=true and showTooltip=false ", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should display only 2 rows but should not show Tooltip on focus`, () => {
      const Component = component;

      cy.mount(
        <Component truncate={true} maxRows={2} showTooltip={false}>
          {textExample}
        </Component>
      );
      cy.get(".uitkText")
        .should("have.class", "uitkText-lineClamp")
        .and("have.css", "-webkit-line-clamp", "2");

      cy.realPress("Tab");
      cy.findByRole("tooltip").should("not.exist");
    });
  });
});

// Scrollable
describe("GIVEN Text component with parent height 100px", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be scrollable`, () => {
      const Component = component;

      cy.mount(
        <div style={{ width: 200, height: 100 }}>
          <Component>{textExample}</Component>
        </div>
      );
      cy.get(".uitkText").should("have.class", "uitkText-overflow");
    });
  });
});

// Size restricted by parent container
describe("GIVEN Text component with parent height 100px and truncate=true", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be truncated`, () => {
      const Component = component;

      cy.mount(
        <div style={{ width: 200, height: 100 }}>
          <Component truncate={true}>{textExample}</Component>
        </div>
      );
      cy.get(".uitkText").should("have.class", "uitkText-lineClamp");
    });
  });
});

// styleAs
describe("GIVEN Text component with styleAs=h1", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be styled as h1`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h1">{textExample}</Component>);
      cy.get(".uitkText").should("have.class", "uitkText-h1");
    });
  });
});
describe("GIVEN Text component with styleAs=h2", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be styled as h2`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h2">{textExample}</Component>);
      cy.get(".uitkText").should("have.class", "uitkText-h2");
    });
  });
});
describe("GIVEN Text component with styleAs=h3", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be styled as h3`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h3">{textExample}</Component>);
      cy.get(".uitkText").should("have.class", "uitkText-h3");
    });
  });
});
describe("GIVEN Text component with styleAs=h4", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be styled as h4`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h4">{textExample}</Component>);
      cy.get(".uitkText").should("have.class", "uitkText-h4");
    });
  });
});
