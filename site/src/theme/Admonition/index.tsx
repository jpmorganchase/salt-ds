import React from "react";
import { makePrefixer } from "@salt-ds/core";
import Admonition from "@theme-original/Admonition";

const withBaseName = makePrefixer("uitkAdmonition");

import "./Admonition.css";

export default function AdmonitionWrapper(props) {
  const { title, type, ...restProps } = props;
  return (
    <div className={withBaseName()}>
      <hr className={withBaseName(type)} />
      <h4>{title}</h4>
      <Admonition {...restProps} />
    </div>
  );
}
