import React, { useState } from "react";

import { Tree, Node } from "@salt-ds/lab";

export default {
  title: "Lab/Tree",
  component: Tree,
  subcomponents: { Node },
  parameters: {
    layout: "centered",
  },
};

export function Basic() {
  return (
    <Tree>
      <Node id="0" label="Node.tsx" />
      <Node id="1" label="Tree.tsx" />
      <Node id="2" label="index.ts" />
    </Tree>
  );
}

export function Depth1() {
  const [show, setShow] = useState(false);

  const children = [
    <Node key="2-0" id="2-0" label="Node.tsx" />,
    <Node key="2-1" id="2-1" label="Tree.tsx" />,
    <Node key="2-2" id="2-2" label="index.ts" />,
  ];

  return (
    <>
      <button onClick={() => setShow(!show)}>Show / Hide</button>
      <Tree>
        <Node id="0" label="Tree">
          <Node id="0-0" label="Node.tsx" />
          <Node id="0-1" label="Tree.tsx" />
          <Node id="0-2" label="index.ts" />
        </Node>
        <Node id="1" label="Button.tsx" />
        {show && children}
      </Tree>
    </>
  );
}

export function Depth2() {
  return (
    <Tree>
      <Node label="components">
        <Node label="Tree">
          <Node label="Node.css.ts" />
          <Node label="Node.tsx" />
          <Node label="Tree.css.ts" />
          <Node label="Tree.reducer.ts" />
          <Node label="Tree.tsx" />
          <Node label="index.ts" />
          <Node label="utils.ts" />
        </Node>
        <Node label="Button">
          <Node label="Button.tsx" />
          <Node label="index.ts" />
        </Node>
      </Node>
      <Node label="containers" />
    </Tree>
  );
}

export function DefaultExpanded() {
  return (
    <Tree>
      <Node id="0" label="Tree" defaultExpanded>
        <Node id="0-0" label="Node.tsx" />
        <Node id="0-1" label="Tree.tsx" />
        <Node id="0-2" label="index.ts" />
      </Node>
      <Node id="1" label="Button.tsx" />
    </Tree>
  );
}

export function Controlled() {
  return (
    <Tree>
      <Node id="0" label="Node.tsx" />
      <Node id="1" label="Tree.tsx" />
      <Node id="2" label="index.ts" />
    </Tree>
  );
}
