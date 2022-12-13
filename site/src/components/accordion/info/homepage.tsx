import Link from "@docusaurus/Link";
import { AccordionBaseProps } from "../Accordion";

export const homePageInfo: AccordionBaseProps["accordionInfo"] = [
  {
    id: "why-trust-us",
    summary: <h2>Why trust us?</h2>,
    details: (
      <>
        <p>In a nutshell, we’ve done this before.</p>
        <p>
          The team behind Salt created the J.P Morgan UI Toolkit, a design
          system that’s used and trusted by internal product owners, visual and
          UX designers, developers, content specialists and more.
        </p>
        <p>
          The UI Toolkit has a proven track record of increasing efficiency,
          ensuring design consistency and driving significant cost savings for
          product teams. It provides a robust component set, business patterns
          and sample apps as well as usage, design, content and accessibility
          guidance. All of this work is the foundation on which we plan to
          improve and migrate to Salt.
        </p>
        <p>
          Eventually, Salt will provide everything you need to create
          consistent, fully accessible, beautifully designed user interfaces.
        </p>
      </>
    ),
  },
  {
    id: "future-of-finance",
    summary: <h2>The future of financial user experiences</h2>,
    details: (
      <>
        <p>
          We believe that beautiful, responsive designs belong in financial
          applications. Complex interfaces, such as trading screens and
          data-heavy tables, are often challenging to design and development
          teams.
        </p>
        <p>We hope to bridge that gap.</p>
        <p>
          Salt components are tried and tested in the investment banking arena.
          Underpinned by beautiful and functional design, they support the
          creation of great user experiences across all devices—even in the
          financial sector.
        </p>
      </>
    ),
  },
  {
    id: "join-us",
    summary: <h2>Join us on this odyssey</h2>,
    details: (
      <>
        <p>
          This is our first foray into the public domain. But we have ambitious
          plans.
        </p>
        <p>
          Salt’s predecessor was built with multiple third-party dependencies,
          which added significant weight and complexity to our library. We’re
          rebuilding and enhancing each and every component—striving for
          accessibility, lightweight code and flexibility in theming and
          presentation.
        </p>
        <p>
          We’d love to share this journey with you, with your input and
          contributions informing and shaping our next steps.{" "}
          <Link href="./support-and-contributions">Get in touch</Link> to share
          your feedback.
        </p>
      </>
    ),
  },
];
