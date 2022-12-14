import { ReactElement } from "react";
import cn from "classnames";
import { makePrefixer } from "@salt-ds/core";
import {
  AccordionSection,
  AccordionDetails,
  AccordionSummary,
  capitalize,
} from "@salt-ds/lab";
import { JSONObj } from "../../../helpers/parseToJson";
import { getShadowParts } from "./getShadowParts";
import { ShadowPatternProps } from "./ShadowPatternProps";
import { ShadowInnerPattern } from "./ShadowInnerPattern";
import { URLSearchParamsInit } from "react-router-dom";
import "./FlatShadow.css";

const withBaseName = makePrefixer("uitkFlatShadow");

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
    <AccordionSection
      key={`${props.themeName}-${props.innerPattern}-accordion`}
      expanded={props.expandedSections.includes(props.innerPattern)}
      onChange={(isExpanded) => {
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
      <AccordionSummary>
        {capitalize(props.innerPattern) as string}
      </AccordionSummary>
      <AccordionDetails>
        <div className={cn(withBaseName("ValueSection"))}>
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
                uitkColorOverrides={props.uitkColorOverrides}
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
      </AccordionDetails>
    </AccordionSection>
  );
};
