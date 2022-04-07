import { Text, H1 } from "@brandname/lab";

describe("GIVEN a Text", () => {
  it('should be a "div" html tag', () => {
    cy.mount(
      <Text>
        Far far away, behind the word mountains, far from the countries Vokalia
        and Consonantia, there live the blind texts. Separated they live in
        Bookmarksgrove right at the coast of the Semantics, a large language
        ocean. A small river named Duden flows by their place and supplies it
      </Text>
    );
    cy.get("div").should("have.class", "uitkText");
  });
  it("should be a 'p' html tag", () => {
    cy.mount(
      <Text elementType="p">
        Far far away, behind the word mountains, far from the countries Vokalia
        and Consonantia, there live the blind texts. Separated they live in
        Bookmarksgrove right at the coast of the Semantics, a large language
        ocean. A small river named Duden flows by their place and supplies it
      </Text>
    );
    cy.get("p").should("have.class", "uitkText");
  });
  it("should display only 2 rows", () => {
    cy.mount(
      <Text maxRows={2}>
        Far far away, behind the word mountains, far from the countries Vokalia
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
        subline of her own road, the Line Lane.
      </Text>
    );
    cy.get(".uitkText").should("have.class", "uitkText-lineClamp");
  });
  it("should truncate when text doesn't fit inside container", () => {
    cy.mount(
      <div style={{ height: 60 }}>
        <Text>
          Far far away, behind the word mountains, far from the countries
          Vokalia and Consonantia, there live the blind texts. Separated they
          live in Bookmarksgrove right at the coast of the Semantics, a large
          language ocean. A small river named Duden flows by their place and
          supplies it with the necessary regelialia. It is a paradisematic
          country, in which roasted parts of sentences fly into your mouth. Even
          the all-powerful Pointing has no control about the blind texts it is
          an almost unorthographic life One day however a small line of blind
          text by the name of Lorem Ipsum decided to leave for the far World of
          Grammar. The Big Oxmox advised her not to do so, because there were
          thousands of bad Commas, wild Question Marks and devious Semikoli, but
          the Little Blind Text didn't listen. She packed her seven versalia,
          put her initial into the belt and made herself on the way. When she
          reached the first hills of the Italic Mountains, she had a last view
          back on the skyline of her hometown Bookmarksgrove, the headline of
          Alphabet Village and the subline of her own road, the Line Lane.
        </Text>
      </div>
    );
    cy.get(".uitkText").should("have.class", "uitkText-lineClamp");
  });
});

describe("GIVEN an expandable Text", () => {
  it("should collapse", () => {
    cy.mount(
      <Text maxRows={2} expanded={false}>
        Far far away, behind the word mountains, far from the countries Vokalia
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
        subline of her own road, the Line Lane.
      </Text>
    );
    cy.get(".uitkText").should("have.class", "uitkText-lineClamp");
  });
  it("should expand", () => {
    cy.mount(
      <Text maxRows={2} expanded={true}>
        Far far away, behind the word mountains, far from the countries Vokalia
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
        subline of her own road, the Line Lane.
      </Text>
    );
    cy.get(".uitkText").should("not.have.class", "uitkText-lineClamp");
  });
});

describe("GIVEN an H1", () => {
  it("should be an h1 html tag width strong emphasis", () => {
    cy.mount(
      <H1>
        Testing Heading 1 <strong>component</strong>
      </H1>
    );
    cy.contains(/Testing Heading 1 component/);
    cy.get("h1.uitkText").then(($heading) => {
      expect($heading).to.have.css("font-size", "24px");
      expect($heading).to.have.css("font-weight", "700");
    });
    cy.get("strong").then(($emphasis) => {
      expect($emphasis).to.have.css("font-weight", "800");
    });
  });
  it("should be an h1 html tag syled as h2 with small emphasis", () => {
    cy.mount(
      <H1 styleAs="h2">
        Testing Heading 1 <small>component</small>
      </H1>
    );
    cy.contains(/Testing Heading 1 component/);
    cy.get("h1.uitkText").then(($heading) => {
      expect($heading).to.have.css("font-size", "18px");
      expect($heading).to.have.css("font-weight", "600");
    });
    cy.get("small").then(($emphasis) => {
      expect($emphasis).to.have.css("font-weight", "400");
    });
  });
});
