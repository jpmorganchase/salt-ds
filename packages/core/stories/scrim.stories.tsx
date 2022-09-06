import { useRef, useState } from "react";
import { Button, Scrim } from "@jpmorganchase/uitk-core";
import { ContentStatus } from "@jpmorganchase/uitk-lab";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
  title: "Core/Scrim",
  component: Scrim,
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
      <Scrim aria-label="Example Scrim" open={open}>
        <Button onClick={handleClose}>CLOSE SCRIM</Button>
      </Scrim>
    </>
  );
};

export const ClosableScrim: ComponentStory<typeof Scrim> = () => {
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
        aria-label="Example Scrim"
        closeWithEscape
        onBackDropClick={handleClose}
        onClose={handleClose}
        open={open}
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
        aria-label="Example Scrim"
        closeWithEscape
        className="uitkEmphasisLow"
        onBackDropClick={handleClose}
        onClose={handleClose}
        open={open}
      >
        <p>Click or press Escape to close the Scrim</p>
      </Scrim>
    </>
  );
};

export const ScrimWithContentStatus: ComponentStory<typeof Scrim> = () => {
  return (
    <Scrim aria-label="Example Scrim" open>
      <ContentStatus status="loading" />
    </Scrim>
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
        aria-label="Example Scrim"
        closeWithEscape
        onClose={handleClose}
        open={open}
        containerRef={parentRef}
        className="uitkEmphasisLow"
        zIndex={2}
      >
        <Button onClick={handleClose}>CLOSE SCRIM</Button>
      </Scrim>
    </div>
  );
};
