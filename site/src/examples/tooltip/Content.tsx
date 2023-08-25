import { ReactElement } from "react";
import { Button, Text, Tooltip } from "@salt-ds/core";

export const Content = (): ReactElement => (
  <Tooltip
    content={
      <>
        <Text styleAs="h3">Persona B</Text>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Role</li>
          <li>Position</li>
          <li>Location</li>
          <li>City, Country</li>
        </ul>
      </>
    }
  >
    <Button>Custom Content</Button>
  </Tooltip>
);
