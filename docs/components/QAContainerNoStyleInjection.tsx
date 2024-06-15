import { useEffect } from "react";
import { QAContainer, QAContainerProps } from "./QAContainer";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import coreCss from "../css/salt-core.css?inline";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import iconCss from "../../packages/icons/src/icon/Icon.css?inline";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import labCss from "../css/salt-lab.css?inline";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import countriesCss from "../css/salt-countries.css?inline";

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
  props: QAContainerNoStyleInjectionProps
) => {
  // order is important!
  useDynamicStyleSheet(String(iconCss), "salt-icon-css");
  useDynamicStyleSheet(String(coreCss), "salt-core-css");
  useDynamicStyleSheet(String(labCss), "salt-lab-css");
  useDynamicStyleSheet(String(countriesCss), "salt-countries-css");

  return <QAContainer {...props} enableStyleInjection={false} />;
};
