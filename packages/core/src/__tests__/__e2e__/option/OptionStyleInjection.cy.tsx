import {
  ComboBox,
  Dropdown,
  type FloatingComponentProps,
  FloatingComponentProvider,
  ListBox,
  Option,
  OptionGroup,
  SaltProvider,
} from "@salt-ds/core";
import { WindowProvider } from "@salt-ds/window";
import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useCallback,
  useState,
} from "react";
import { createPortal } from "react-dom";

const OPTION_STYLE_SELECTOR = 'style[data-salt-style="salt-option"]';
let originalTextContent: PropertyDescriptor | undefined;

const ManyOptions = ({ count = 20 }: { count?: number }) =>
  Array.from({ length: count }, (_, index) => `Option ${index}`).map(
    (value) => <Option key={value} value={value} />,
  );

function FakeWindow({ children }: { children: ReactNode }) {
  const [mountNode, setMountNode] = useState<HTMLElement>();
  const handleFrameRef = useCallback((node: HTMLIFrameElement | null) => {
    setMountNode(node?.contentWindow?.document.body);
  }, []);

  return (
    <iframe ref={handleFrameRef} title="Option target window">
      <WindowProvider window={mountNode?.ownerDocument.defaultView ?? null}>
        {mountNode && createPortal(children, mountNode)}
      </WindowProvider>
    </iframe>
  );
}

const InlineFloatingComponent = forwardRef<
  HTMLDivElement,
  FloatingComponentProps
>(function InlineFloatingComponent(props, ref) {
  const { open, top, left, width, height, position, ...rest } = props;

  return open ? (
    <div
      {...rest}
      ref={ref}
      style={{ top, left, width, height, position } as CSSProperties}
    />
  ) : null;
});

describe("Option stylesheet ownership", () => {
  afterEach(() => {
    if (originalTextContent) {
      Object.defineProperty(Node.prototype, "textContent", originalTextContent);
      originalTextContent = undefined;
    }
  });

  it("writes Option CSS once for each Dropdown, ComboBox, and ListBox owner", () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      Node.prototype,
      "textContent",
    );
    if (!descriptor?.get || !descriptor.set) {
      throw new Error("Node.textContent descriptor is unavailable");
    }
    originalTextContent = descriptor;
    let writes = 0;
    Object.defineProperty(Node.prototype, "textContent", {
      ...descriptor,
      set(value) {
        if (
          this instanceof HTMLStyleElement &&
          this.getAttribute("data-salt-style") === "salt-option"
        ) {
          writes += 1;
        }
        descriptor.set?.call(this, value);
      },
    });

    cy.mount(
      <>
        <Dropdown open>
          <ManyOptions />
        </Dropdown>
        <ComboBox open>
          <ManyOptions />
        </ComboBox>
        <ListBox data-testid="listbox">
          <ManyOptions />
        </ListBox>
      </>,
    );
    cy.findByTestId("listbox")
      .should("exist")
      .then(() => {
        expect(writes).to.equal(3);
        expect(document.querySelectorAll(OPTION_STYLE_SELECTOR)).to.have.length(
          1,
        );
      });
  });

  it("keeps one stylesheet until the final owner in a document unmounts", () => {
    const Fixture = () => {
      const [first, setFirst] = useState(true);
      const [second, setSecond] = useState(true);
      return (
        <>
          <button onClick={() => setFirst(false)}>Remove first</button>
          <button onClick={() => setSecond(false)}>Remove second</button>
          {first && (
            <ListBox aria-label="first list">
              <Option value="One" />
            </ListBox>
          )}
          {second && (
            <ListBox aria-label="second list">
              <Option value="Two" />
            </ListBox>
          )}
        </>
      );
    };

    cy.mount(<Fixture />);
    cy.get(OPTION_STYLE_SELECTOR).should("have.length", 1);
    cy.findByRole("button", { name: "Remove first" }).click();
    cy.get(OPTION_STYLE_SELECTOR).should("have.length", 1);
    cy.findByRole("button", { name: "Remove second" }).click();
    cy.get(OPTION_STYLE_SELECTOR).should("not.exist");
  });

  it("owns floating Option CSS in the custom floating target window", () => {
    cy.mount(
      <FakeWindow>
        <SaltProvider>
          <FloatingComponentProvider Component={InlineFloatingComponent}>
            <Dropdown open>
              <Option value="One" />
            </Dropdown>
          </FloatingComponentProvider>
        </SaltProvider>
      </FakeWindow>,
    );

    cy.get(OPTION_STYLE_SELECTOR).should("not.exist");
    cy.findByTitle("Option target window")
      .its("0.contentDocument.body")
      .find(".saltOption")
      .should("have.length", 1);
    cy.findByTitle("Option target window")
      .its("0.contentDocument.head")
      .find(OPTION_STYLE_SELECTOR)
      .should("have.length", 1);
  });

  it("removes floating Option CSS when a control closes", () => {
    cy.mount(
      <Dropdown>
        <Option value="One" />
      </Dropdown>,
    );
    cy.findByRole("combobox").click();
    cy.get(OPTION_STYLE_SELECTOR).should("have.length", 1);
    cy.get("body").click(0, 0);
    cy.get(OPTION_STYLE_SELECTOR).should("not.exist");
  });

  it("does not inject Option CSS when style injection is disabled", () => {
    cy.mount(
      <SaltProvider enableStyleInjection={false}>
        <ListBox>
          <Option value="One" />
        </ListBox>
      </SaltProvider>,
    );

    cy.get(OPTION_STYLE_SELECTOR).should("not.exist");
    cy.findByRole("option").should("exist");
  });

  it("injects one Option stylesheet in each target document", () => {
    cy.mount(
      <>
        <ListBox aria-label="main list">
          <Option value="Main" />
        </ListBox>
        <FakeWindow>
          <SaltProvider>
            <ListBox aria-label="frame list">
              <Option value="Frame" />
            </ListBox>
          </SaltProvider>
        </FakeWindow>
      </>,
    );

    cy.get(OPTION_STYLE_SELECTOR).should("have.length", 1);
    cy.findByTitle("Option target window")
      .its("0.contentDocument.head")
      .then((head) => {
        expect(head?.querySelectorAll(OPTION_STYLE_SELECTOR)).to.have.length(1);
      });
  });

  it("styles grouped and custom Option content", () => {
    cy.mount(
      <ListBox>
        <OptionGroup label="Group">
          <Option value="Custom">
            <span>Custom content</span>
          </Option>
        </OptionGroup>
      </ListBox>,
    );

    cy.findByRole("option").then(($option) => {
      expect(getComputedStyle($option[0]).display).to.equal("flex");
    });
    cy.findByText("Custom content").should("exist");
  });
});
