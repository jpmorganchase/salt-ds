import type { Meta } from "@storybook/react-vite";
import coreCss from "docs/css/salt-core.css?inline";
import countriesCss from "docs/css/salt-countries.css?inline";
import labCss from "docs/css/salt-lab.css?inline";
import { useEffect } from "react";

import iconCss from "../../../icons/src/icon/Icon.css?inline";
import { Components } from "./kitchen-sink.stories";

export default {
  title: "Experimental/Kitchen Sink/NoStyleInjection QA",
} as Meta;

const useDynamicStyleSheet = (styleSheet: string, id: string): void => {
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = id;
    styleElement.innerHTML = styleSheet;
    document.head.append(styleElement);
    return () => styleElement.remove();
  }, [styleSheet, id]);
};

export const KitchenSinkNoStyleInjectionQA = () => {
  // order is important!
  useDynamicStyleSheet(String(iconCss), "salt-icon-css");
  useDynamicStyleSheet(String(coreCss), "salt-core-css");
  useDynamicStyleSheet(String(labCss), "salt-lab-css");
  useDynamicStyleSheet(String(countriesCss), "salt-countries-css");

  return <Components />;
};

KitchenSinkNoStyleInjectionQA.globals = {
  styleInjection: "disable",
};

KitchenSinkNoStyleInjectionQA.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
