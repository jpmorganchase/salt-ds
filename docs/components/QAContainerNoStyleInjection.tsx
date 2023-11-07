import { useEffect } from "react";
import { QAContainer, QAContainerProps } from "./QAContainer";

// eslint-disable-next-line import/no-unresolved
import coreCss from "../../dist/salt-ds-core/css/salt-core.css?inline";

// eslint-disable-next-line import/no-unresolved
import iconCss from "../../packages/icons/src/icon/Icon.css?inline";

// eslint-disable-next-line import/no-unresolved
import labCss from "../../dist/salt-ds-lab/css/salt-lab.css?inline";

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
  useDynamicStyleSheet(String(coreCss), "salt-core-css");
  useDynamicStyleSheet(String(iconCss), "salt-icon-css");
  useDynamicStyleSheet(String(labCss), "salt-lab-css");

  return <QAContainer {...props} enableStyleInjection={false} />;
};
