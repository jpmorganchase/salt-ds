import { useEffect } from "react";
// @ts-ignore
import iconCss from "../../packages/icons/src/icon/Icon.css?inline";

// @ts-ignore
import coreCss from "../css/salt-core.css?inline";
// @ts-ignore
import countriesCss from "../css/salt-countries.css?inline";

// @ts-ignore
import labCss from "../css/salt-lab.css?inline";
import { QAContainer, type QAContainerProps } from "./QAContainer";

export const useDynamicStyleSheet = (styleSheet: string, id: string): void => {
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = id;
    styleElement.innerHTML = styleSheet;
    document.head.append(styleElement);
    return () => styleElement.remove();
  }, [styleSheet, id]);
};

export interface QAContainerNoStyleInjectionProps extends QAContainerProps {
  enableStyleInjection: false;
}

export const QAContainerNoStyleInjection = (
  props: QAContainerNoStyleInjectionProps,
) => {
  // order is important!
  useDynamicStyleSheet(String(iconCss), "salt-icon-css");
  useDynamicStyleSheet(String(coreCss), "salt-core-css");
  useDynamicStyleSheet(String(labCss), "salt-lab-css");
  useDynamicStyleSheet(String(countriesCss), "salt-countries-css");

  return <QAContainer {...props} enableStyleInjection={false} />;
};
