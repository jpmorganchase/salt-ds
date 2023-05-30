import { ReactElement } from "react";
import { clsx } from "clsx";
import { capitalize, makePrefixer } from "@salt-ds/core";
import { Accordion, AccordionPanel, AccordionHeader } from "@salt-ds/lab";
import { JSONObj } from "../../../helpers/parseToJson";
import { getShadowParts } from "./getShadowParts";
import { ShadowPatternProps } from "./ShadowPatternProps";
import { ShadowInnerPattern } from "./ShadowInnerPattern";
import { URLSearchParamsInit } from "react-router-dom";
import "./FlatShadow.css";

const withBaseName = makePrefixer("saltFlatShadow");

interface FlatShadowProps extends ShadowPatternProps {
  innerPattern: string;
  searchParams: URLSearchParams;
  setSearchParams: (
    nextInit: URLSearchParamsInit,
    navigateOptions?: { replace?: boolean | undefined; state?: any } | undefined
  ) => void;
  expandedSections: string[];
}

export const FlatShadow = (props: FlatShadowProps): ReactElement => {
  const patternParts = getShadowParts(props.shadowPattern);

  return (
    <Accordion
      key={`${props.themeName}-${props.innerPattern}-accordion`}
      value={props.innerPattern}
      expanded={props.expandedSections.includes(props.innerPattern)}
      onToggle={(isExpanded) => {
        let shadows;
        if (isExpanded) {
          const openShadows = props.searchParams.get("open");
          shadows = props.innerPattern;
          if (openShadows) {
            shadows = [shadows, openShadows].join("&");
          }
        } else {
          const shadowsOpen = props.searchParams.get("open")?.split("&");
          if (shadowsOpen) {
            shadows = shadowsOpen
              .filter((shadow) => shadow !== props.innerPattern)
              .join("&");
          }
        }
        shadows
          ? props.setSearchParams({ open: shadows })
          : props.setSearchParams({});
      }}
    >
      <AccordionHeader>
        {capitalize(props.innerPattern) as string}
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
                entireValue={patternParts.join(" ")}
                key={`${props.themeName}-${props.pattern}-${props.innerPattern}-${label}`}
                patternName={`${props.pattern}-${props.innerPattern}`}
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
};
