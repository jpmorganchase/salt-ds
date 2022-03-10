import { render, screen, waitFor } from "@testing-library/react";
import { H1, H2, H3, H4, Text } from "@brandname/lab";

describe("GIVEN a Text", () => {
  beforeEach(() => {
    // IntersectionObserver isn't available in test environment
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  describe("WHEN not passing any properties", () => {
    it("THEN should render text within a <div> tag", () => {
      render(<Text>This is some text</Text>);
      const text = screen.getByText(/This is some text/i);

      expect(text.tagName).toEqual("DIV");
    });
  });

  describe("WHEN passing 'p' as elementType", () => {
    it("THEN should render text within a <p> tag", () => {
      render(<Text elementType="p">This is some text</Text>);
      const text = screen.getByText(/This is some text/i);

      expect(text.tagName).toEqual("P");
    });
  });

  describe("WHEN passing 'div' as elementType", () => {
    it("THEN should render text within a <span> tag", () => {
      render(<Text elementType="span">This is some text</Text>);
      const text = screen.getByText(/This is some text/i);

      expect(text.tagName).toEqual("SPAN");
    });
  });

  describe("WHEN using H1, H2, H3 and H4 components", () => {
    it("THEN should render text within heading tags", () => {
      render(
        <>
          <H1>This is header 1</H1>
          <H2>This is header 2</H2>
          <H3>This is header 3</H3>
          <H4>This is header 4</H4>
        </>
      );
      const h1 = screen.getByText(/This is header 1/i);
      const h2 = screen.getByText(/This is header 2/i);
      const h3 = screen.getByText(/This is header 3/i);
      const h4 = screen.getByText(/This is header 4/i);

      expect(h1.tagName).toEqual("H1");
      expect(h2.tagName).toEqual("H2");
      expect(h3.tagName).toEqual("H3");
      expect(h4.tagName).toEqual("H4");
    });
  });

  describe("WHEN passing maxRows", () => {
    it("THEN should render just those rows", () => {
      render(
        <Text maxRows={2} data-testid="text">
          All other components are still under development. There are no shared
          dependencies between the Odyssey components and legacy toolkit
          components. Furthermore, the technologies adopted for styling each are
          quite distinct. These two points mean that Odyssey components can
          safely be introduced into an existing codebase - legacy toolkit
          components and Odyssey components can be rendered side by side within
          the same application or page. Because the visual and behavioural
          aspects of the toolkit design system have been preserved, there will
          be no visual difference between the two when rendered.
        </Text>
      );

      const text = screen.getByTestId("text");

      waitFor(() => {
        expect(text).toBeInTheDocument();
        expect(text).toHaveStyle({
          "--text-max-rows": "2",
        });
      });
    });
  });
});
