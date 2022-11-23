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
  { component: Display1, name: "Display1", tag: "span" },
  { component: Display2, name: "Display", tag: "span" },
  { component: Display3, name: "Display", tag: "span" },
  { component: H1, name: "H1", tag: "h1" },
  { component: H2, name: "H2", tag: "h2" },
  { component: H3, name: "H3", tag: "h3" },
  { component: H4, name: "H4", tag: "h4" },
  { component: Label, name: "Label", tag: "label" },
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

// Truncation
describe("GIVEN a Text component with maxRows=2 ", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should not be truncated`, () => {
      const Component = component;

      cy.mount(<Component maxRows={2}>{textExample}</Component>);
      cy.get(".uitkText")
        .should("have.class", "uitkText-lineClamp")
        .and("have.css", "-webkit-line-clamp", "2");
    });
  });
});

// Variant
describe("GIVEN a Text component with variant=primary ", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should have class uitkText-primary`, () => {
      const Component = component;

      cy.mount(<Component variant="primary">{textExample}</Component>);
      cy.get(".uitkText").should("have.class", "uitkText-primary");
    });
  });
});
describe("GIVEN a Text component with variant=secondary ", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should have class uitkText-primary`, () => {
      const Component = component;

      cy.mount(<Component variant="secondary">{textExample}</Component>);
      cy.get(".uitkText").should("have.class", "uitkText-secondary");
    });
  });
});

// styleAs
describe("GIVEN Text component with styleAs=h1", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be styled as h1`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h1">{textExample}</Component>);
      cy.get(".uitkText")
        .should("have.class", "uitkText-h1")
        .and("have.css", "font-size", "24px");
    });
  });
});
describe("GIVEN Text component with styleAs=h2", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be styled as h2`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h2">{textExample}</Component>);
      cy.get(".uitkText")
        .should("have.class", "uitkText-h2")
        .and("have.css", "font-size", "18px");
    });
  });
});
describe("GIVEN Text component with styleAs=h3", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be styled as h3`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h3">{textExample}</Component>);
      cy.get(".uitkText")
        .should("have.class", "uitkText-h3")
        .and("have.css", "font-size", "14px");
    });
  });
});
describe("GIVEN Text component with styleAs=h4", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be styled as h4`, () => {
      const Component = component;

      cy.mount(<Component styleAs="h4">{textExample}</Component>);
      cy.get(".uitkText")
        .should("have.class", "uitkText-h4")
        .and("have.css", "font-size", "12px");
    });
  });
});
describe("GIVEN Text component with styleAs=label", () => {
  componentsArray.forEach(({ component, name }) => {
    it(`${name} should be styled as label`, () => {
      const Component = component;

      cy.mount(<Component styleAs="label">{textExample}</Component>);
      cy.get(".uitkText")
        .should("have.class", "uitkText-label")
        .and("have.css", "font-size", "11px");
    });
  });
});
