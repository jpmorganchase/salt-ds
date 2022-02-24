import { useRef, useState } from "react";
import { Button } from "@brandname/core";
import { Scrim } from "@brandname/lab";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
  title: "Lab/Scrim",
  component: Scrim,
  parameters: {
    layout: "centered",
  },
} as ComponentMeta<typeof Scrim>;

export const DefaultScrim: ComponentStory<typeof Scrim> = () => {
  const [open, setOpen] = useState(false);
  const handleRequestOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Button onClick={handleRequestOpen}>click to open scrim</Button>
      <Scrim
        closeWithEscape
        onBackDropClick={handleClose}
        onClose={handleClose}
        open={open}
        returnFocus
      >
        <p style={{ color: "#fff" }}>
          Click or press Escape to close the Scrim
        </p>
      </Scrim>
    </>
  );
};

export const LighterScrim: ComponentStory<typeof Scrim> = () => {
  const [open, setOpen] = useState(false);
  const handleRequestOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Button onClick={handleRequestOpen}>click to open scrim</Button>
      <Scrim
        closeWithEscape
        variant="lighter"
        onBackDropClick={handleClose}
        onClose={handleClose}
        open={open}
        returnFocus
      >
        <p style={{ color: "#fff" }}>
          Click or press Escape to close the Scrim
        </p>
      </Scrim>
    </>
  );
};

export const ScrimContainer: ComponentStory<typeof Scrim> = () => {
  const [open, setOpen] = useState(false);
  const parentRef = useRef(null);

  const handleRequestOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const sectionStyle = { padding: 0, border: "none" };
  const headerStyle = { fontSize: "1.17em" };

  return (
    <div
      data-testid="skip-link-example-copy-for-scrim"
      ref={parentRef}
      style={{
        position: "relative",
        border: "1px solid grey",
        maxWidth: 500,
        padding: 24,
      }}
    >
      <div
        style={{
          fontSize: 24,
          lineHeight: 3.5,
        }}
      >
        What we do
      </div>

      <article id="main">
        <section style={sectionStyle}>
          <h1 style={headerStyle}>Investment Banking</h1>
          <p>
            A global leader, we deliver strategic advice and solutions,
            including capital raising, risk management, and trade finance to
            corporations, institutions and governments.
          </p>
        </section>

        <section style={{ ...sectionStyle, marginTop: 20 }}>
          <h1 style={headerStyle}>Markets</h1>
          <p>
            Serving the world&apos;s largest corporate clients and institutional
            investors, we support the investment cycle with market-leading
            research, analytics and trade execution across multiple asset
            classes.
          </p>
        </section>
      </article>

      <div style={{ marginTop: 30, textAlign: "right" }}>
        <Button onClick={handleRequestOpen}>CLICK TO OPEN SCRIM</Button>
      </div>
      <Scrim
        closeWithEscape
        containerFix
        onClose={handleClose}
        open={open}
        parentRef={parentRef}
        variant="lighter"
        zIndex={2}
      >
        <Button onClick={handleClose}>CLOSE SCRIM</Button>
      </Scrim>
    </div>
  );
};
