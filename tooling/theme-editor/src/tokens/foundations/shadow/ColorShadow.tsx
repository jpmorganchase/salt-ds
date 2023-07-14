import { clsx } from "clsx";
import { capitalize, makePrefixer } from "@salt-ds/core";
import { Accordion, AccordionPanel, AccordionHeader } from "@salt-ds/lab";
import { ReactElement } from "react";
import { JSONObj } from "../../../helpers/parseToJson";
import { ShadowInnerPattern } from "./ShadowInnerPattern";
import { getShadowParts } from "./getShadowParts";
import { ShadowPatternProps } from "./ShadowPatternProps";
import { URLSearchParamsInit } from "react-router-dom";
import "./ColorShadow.css";

const withBaseName = makePrefixer("saltColorShadow");
interface ColorShadowProps extends ShadowPatternProps {
  innerPattern: string;
  searchParams: URLSearchParams;
  setSearchParams: (
    nextInit: URLSearchParamsInit,
    navigateOptions?: { replace?: boolean | undefined; state?: any } | undefined
  ) => void;
  expandedSections: string[];
}

export const ColorShadow = (props: ColorShadowProps): ReactElement => {
  return (
    <div className={clsx(withBaseName())}>
      {Object.keys(props.shadowPattern).map(function (shadowKey) {
        const patternParts = getShadowParts(props.shadowPattern[shadowKey]);

        return (
          <Accordion
            key={`${props.themeName}-${props.innerPattern}-${shadowKey}-accordion`}
            value={`${props.innerPattern}${shadowKey}`}
            expanded={props.expandedSections.includes(
              `${props.innerPattern}${shadowKey}`
            )}
            onToggle={() => {
              let shadows;
              if (
                props.expandedSections.includes(
                  `${props.innerPattern}${shadowKey}`
                )
              ) {
                const openShadows = props.searchParams.get("open");
                shadows = `${props.innerPattern}${shadowKey}`;
                if (openShadows) {
                  shadows = [shadows, openShadows].join("&");
                }
              } else {
                const shadowsOpen = props.searchParams.get("open")?.split("&");
                if (shadowsOpen) {
                  shadows = shadowsOpen
                    .filter(
                      (shadow) => shadow !== `${props.innerPattern}${shadowKey}`
                    )
                    .join("&");
                }
              }
              shadows
                ? props.setSearchParams({ open: shadows })
                : props.setSearchParams({});
            }}
          >
            <AccordionHeader>
              {capitalize(props.innerPattern) as string}-{shadowKey}
            </AccordionHeader>
            <AccordionPanel>
              <div className={clsx(withBaseName("ValueSection"))}>
                {patternParts.map((shadowPart: string, index) => {
                  const jsonObj: JSONObj = {};
                  jsonObj["value"] = shadowPart;
                  let label = "";
                  switch (index) {
                    case 0:
                      label = "X";
                      break;
                    case 1:
                      label = "Y";
                      break;
                    case 2:
                      label = "Blur";
                      break;
                    case 3:
                      label = "Spread";
                      break;
                    case 4:
                      label = "Color";
                      break;
                  }
                  return (
                    <ShadowInnerPattern
                      saltColorOverrides={props.saltColorOverrides}
                      entireValue={
                        props.shadowPattern[shadowKey]["value"] ?? ""
                      }
                      key={`${props.themeName}-${props.pattern}-${props.innerPattern}-${shadowKey}-${label}`}
                      patternName={`${props.pattern}-${props.innerPattern}-${shadowKey}`}
                      values={jsonObj}
                      label={label}
                      themeName={props.themeName}
                      onUpdateJSON={props.onUpdateJSON}
                      extractValue={props.extractValue}
                      scope={props.scope}
                      value={shadowPart}
                    />
                  );
                })}
              </div>
            </AccordionPanel>
          </Accordion>
        );
      })}
    </div>
  );
};
