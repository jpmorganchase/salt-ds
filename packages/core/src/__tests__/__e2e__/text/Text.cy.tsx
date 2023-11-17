import {
  Text,
  Display1,
  Display2,
  Display3,
  H1,
  H2,
  H3,
  H4,
  Label,
  TextNotation,
  TextAction,
} from "../../../text";

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
  { component: Display1, name: "Display1", tag: "span" },
  { component: Display2, name: "Display2", tag: "span" },
  { component: Display3, name: "Display3", tag: "span" },
  { component: H1, name: "H1", tag: "h1" },
  { component: H2, name: "H2", tag: "h2" },
  { component: H3, name: "H3", tag: "h3" },
  { component: H4, name: "H4", tag: "h4" },
  { component: Label, name: "Label", tag: "label" },
  { component: TextNotation, name: "TextNotation", tag: "span" },
  { component: TextAction, name: "TextAction", tag: "span" },
];

// Render correctly
describe("GIVEN a Text Component", () => {
  componentsArray.forEach(({ component, name, tag }) => {
    it(`${name} component should return correct ${tag} element`, () => {
      const Component = component;

      cy.mount(<Component>{textExample}</Component>);
      cy.get(tag).should("have.class", "saltText");
    });
  });
});

// Render correctly
describe('GIVEN a Text Component with as="p"', () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} component should return correct paragraph element`, () => {
      const Component = component;

      cy.mount(<Component as="p">{textExample}</Component>);
      cy.get("p").should("have.class", "saltText");
    });
  });
});

// Truncation
describe("GIVEN a Text component with maxRows=2 ", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be truncated and only display 2 rows`, () => {
      const Component = component;

      cy.mount(<Component maxRows={2}>{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-lineClamp")
        .and("have.css", "-webkit-line-clamp", "2");
    });
  });
});

// Variant
describe("GIVEN a Text component with variant=primary ", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should have class saltText-primary`, () => {
      const Component = component;

      cy.mount(<Component variant="primary">{textExample}</Component>);
      cy.get(".saltText").should("have.class", "saltText-primary");
    });
  });
});
describe("GIVEN a Text component with variant=secondary ", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should have class saltText-secondary`, () => {
      const Component = component;

      cy.mount(<Component variant="secondary">{textExample}</Component>);
      cy.get(".saltText").should("have.class", "saltText-secondary");
    });
  });
});

// styleAs
describe("GIVEN Text component with styleAs=h1", () => {
  [
    { component: Text, name: "Text", tag: "div" },
    { component: H2, name: "H2", tag: "h2" },
    { component: H3, name: "H3", tag: "h3" },
    { component: H4, name: "H4", tag: "h4" },
    { component: Label, name: "Label", tag: "label" },
    { component: TextNotation, name: "TextNotation", tag: "span" },
  ].forEach(({ component, name }) => {
    it(`${name} should be styled as h1`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h1">{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-h1")
        .and("have.css", "font-size", "24px");
    });
  });
});
describe("GIVEN Text component with styleAs=h2", () => {
  [
    { component: Text, name: "Text", tag: "div" },
    { component: H1, name: "H1", tag: "h1" },
    { component: H3, name: "H3", tag: "h3" },
    { component: H4, name: "H4", tag: "h4" },
    { component: Label, name: "Label", tag: "label" },
    { component: TextNotation, name: "TextNotation", tag: "span" },
  ].forEach(({ component, name }) => {
    it(`${name} should be styled as h2`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h2">{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-h2")
        .and("have.css", "font-size", "18px");
    });
  });
});
describe("GIVEN Text component with styleAs=h3", () => {
  [
    { component: Text, name: "Text", tag: "div" },
    { component: H1, name: "H1", tag: "h1" },
    { component: H2, name: "H2", tag: "h2" },
    { component: H4, name: "H4", tag: "h4" },
    { component: Label, name: "Label", tag: "label" },
    { component: TextNotation, name: "TextNotation", tag: "span" },
  ].forEach(({ component, name }) => {
    it(`${name} should be styled as h3`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h3">{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-h3")
        .and("have.css", "font-size", "14px");
    });
  });
});
describe("GIVEN Text component with styleAs=h4", () => {
  [
    { component: Text, name: "Text", tag: "div" },
    { component: H1, name: "H1", tag: "h1" },
    { component: H2, name: "H2", tag: "h2" },
    { component: H3, name: "H3", tag: "h3" },
    { component: Label, name: "Label", tag: "label" },
    { component: TextNotation, name: "TextNotation", tag: "span" },
  ].forEach(({ component, name }) => {
    it(`${name} should be styled as h4`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h4">{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-h4")
        .and("have.css", "font-size", "12px");
    });
  });
});
describe("GIVEN Text component with styleAs=label", () => {
  [
    { component: Text, name: "Text", tag: "div" },
    { component: H1, name: "H1", tag: "h1" },
    { component: H2, name: "H2", tag: "h2" },
    { component: H3, name: "H3", tag: "h3" },
    { component: H4, name: "H4", tag: "h4" },
    { component: TextNotation, name: "TextNotation", tag: "span" },
  ].forEach(({ component, name }) => {
    it(`${name} should be styled as label`, () => {
      const Component = component;

      cy.mount(<Component styleAs="label">{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-label")
        .and("have.css", "font-size", "11px");
    });
  });
});

describe("GIVEN Text component with styleAs=notation", () => {
  [
    { component: Text, name: "Text", tag: "div" },
    { component: H1, name: "H1", tag: "h1" },
    { component: H2, name: "H2", tag: "h2" },
    { component: H3, name: "H3", tag: "h3" },
    { component: H4, name: "H4", tag: "h4" },
    { component: Label, name: "Label", tag: "label" },
  ].forEach(({ component, name }) => {
    it(`${name} should be styled as notation`, () => {
      const Component = component;

      cy.mount(<Component styleAs="notation">{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-notation")
        .and("have.css", "font-size", "10px");
    });
  });
});

describe("GIVEN Text component with styleAs=action", () => {
  [
    { component: Text, name: "Text", tag: "div" },
    { component: H1, name: "H1", tag: "h1" },
    { component: H2, name: "H2", tag: "h2" },
    { component: H3, name: "H3", tag: "h3" },
    { component: H4, name: "H4", tag: "h4" },
    { component: Label, name: "Label", tag: "label" },
    { component: TextNotation, name: "TextNotation", tag: "span" },
  ].forEach(({ component, name }) => {
    it(`${name} should be styled as action`, () => {
      const Component = component;

      cy.mount(<Component styleAs="action">{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-action")
        .and("have.css", "letter-spacing", "0.6px")
        .and("have.css", "text-transform", "uppercase")
        .and("have.css", "text-align", "center")
        .and("have.css", "font-weight", "600");
    });
  });
});
describe("GIVEN Text component with styleAs=display1", () => {
  [
    { component: Text, name: "Text", tag: "div" },
    { component: H1, name: "H1", tag: "h1" },
    { component: H2, name: "H2", tag: "h2" },
    { component: H3, name: "H3", tag: "h3" },
    { component: H4, name: "H4", tag: "h4" },
    { component: Label, name: "Label", tag: "label" },
    { component: TextNotation, name: "TextNotation", tag: "span" },
  ].forEach(({ component, name }) => {
    it(`${name} should be styled as display1`, () => {
      const Component = component;

      cy.mount(<Component styleAs="display1">{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-display1")
        .and("have.css", "font-size", "54px");
    });
  });
});

describe("GIVEN Text component with styleAs=display2", () => {
  [
    { component: Text, name: "Text", tag: "div" },
    { component: H1, name: "H1", tag: "h1" },
    { component: H2, name: "H2", tag: "h2" },
    { component: H3, name: "H3", tag: "h3" },
    { component: H4, name: "H4", tag: "h4" },
    { component: Label, name: "Label", tag: "label" },
    { component: TextNotation, name: "TextNotation", tag: "span" },
  ].forEach(({ component, name }) => {
    it(`${name} should be styled as display2`, () => {
      const Component = component;

      cy.mount(<Component styleAs="display2">{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-display2")
        .and("have.css", "font-size", "36px");
    });
  });
});

describe("GIVEN Text component with styleAs=display3", () => {
  [
    { component: Text, name: "Text", tag: "div" },
    { component: H1, name: "H1", tag: "h1" },
    { component: H2, name: "H2", tag: "h2" },
    { component: H3, name: "H3", tag: "h3" },
    { component: H4, name: "H4", tag: "h4" },
    { component: Label, name: "Label", tag: "label" },
    { component: TextNotation, name: "TextNotation", tag: "span" },
  ].forEach(({ component, name }) => {
    it(`${name} should be styled as display3`, () => {
      const Component = component;

      cy.mount(<Component styleAs="display3">{textExample}</Component>);
      cy.get(".saltText")
        .should("have.class", "saltText-display3")
        .and("have.css", "font-size", "24px");
    });
  });
});

describe("GIVEN Text component within font family CSS var override", () => {
  it("should have non-default font family applied", () => {
    cy.mount(
      <div style={{ "--salt-text-fontFamily": "Lato" } as React.CSSProperties}>
        <Text>{textExample}</Text>
      </div>
    );
    cy.get(".saltText")
      .should("have.class", "saltText")
      .and("have.css", "font-family", "Lato");
  });
});
