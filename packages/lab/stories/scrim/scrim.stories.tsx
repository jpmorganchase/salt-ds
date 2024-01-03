import React, { useState } from "react";
import { Button, Spinner, Text, H1, H2, Card } from "@salt-ds/core";
import { Scrim } from "@salt-ds/lab";
import { StoryFn, Meta } from "@storybook/react";

export default {
  title: "Lab/Scrim",
  component: Scrim,
} as Meta<typeof Scrim>;

const Content = () => (
  <>
    <H1>What we do</H1>
    <article id="main">
      <section>
        <H2>Investment Banking</H2>
        <Text>
          A global leader, we deliver strategic advice and solutions, including
          capital raising, risk management, and trade finance to corporations,
          institutions and governments.
        </Text>
      </section>
      <section>
        <H2>Markets</H2>
        <Text>
          Serving the world&apos;s largest corporate clients and institutional
          investors, we support the investment cycle with market-leading
          research, analytics and trade execution across multiple asset classes.
        </Text>
      </section>
    </article>
  </>
);

const cardStyle: React.CSSProperties = {
  position: "relative",
  maxWidth: 500,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 30,
  textAlign: "right",
};

export const Default: StoryFn<typeof Scrim> = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Card style={cardStyle}>
      <Content />
      <div style={buttonStyle}>
        <Button onClick={handleOpen}>Click to open scrim</Button>
        <Scrim open={open}>
          <Button onClick={handleClose}>Click to close scrim</Button>
        </Scrim>
      </div>
    </Card>
  );
};

export const CloseOnClick: StoryFn<typeof Scrim> = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Card style={cardStyle}>
      <Content />
      <div style={buttonStyle}>
        <Button onClick={handleOpen}>Click to open scrim</Button>
        <Scrim open={open} onClick={handleClose}>
          <Text>Click to close scrim</Text>
        </Scrim>
      </div>
    </Card>
  );
};

export const WithSpinner: StoryFn<typeof Scrim> = () => {
  return (
    <Card style={cardStyle}>
      <Content />
      <div style={buttonStyle}>
        <Scrim open>
          <Spinner size="medium" />
        </Scrim>
      </div>
    </Card>
  );
};

export const Fixed: StoryFn<typeof Scrim> = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Card style={cardStyle}>
      <Content />
      <div style={buttonStyle}>
        <Button onClick={handleOpen}>Click to open scrim</Button>
        <Scrim open={open} fixed>
          <Button onClick={handleClose}>Click to close scrim</Button>
        </Scrim>
      </div>
    </Card>
  );
};
