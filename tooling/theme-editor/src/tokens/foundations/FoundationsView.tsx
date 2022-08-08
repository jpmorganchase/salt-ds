import { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Tab, Tabstrip, capitalize } from "@jpmorganchase/uitk-lab";
import { JSONByScope } from "../../helpers/parseToJson";
import { ThemeMode } from "../../header/ScopeSelector";
import { UITK_FOUNDATIONS } from "../../utils/uitkValues";
import { FoundationPatternsList } from "./FoundationsPatternsList";
import "./Foundations.css";

const withBaseName = makePrefixer("uitkFoundationsView");
interface FoundationsViewProps {
  extractValue: (value: string) => string;
  jsonInCurrentScope: JSONByScope[];
  mode: ThemeMode;
  handleTabSelection: (tabIndex: number, path?: string) => void;
  selectedTabIndex: number;
  onModeChange: (mode: ThemeMode) => void;
  onUpdateJSON: (value: string, pathToUpdate: string, scope: string) => void;
}

export const foundationPathnames = [
  "/foundations/color",
  "/foundations/icon",
  "/foundations/shadow",
  "/foundations/size",
  "/foundations/spacing",
  "/foundations/typography",
  "/foundations/zindex",
];

export const FoundationsView = (props: FoundationsViewProps): ReactElement => {
  const patternsInScope = [
    foundationPathnames[props.selectedTabIndex].replace("/foundations/", ""),
  ];

  return (
    <div className={cx(withBaseName())}>
      <div className={cx(withBaseName("tabs"))}>
        <Tabstrip
          centered
          onActiveChange={props.handleTabSelection}
          overflowMenu={true}
          activeTabIndex={props.selectedTabIndex}
        >
          {UITK_FOUNDATIONS.filter((f) => f !== "fade").map((label, i) => (
            <Tab aria-label={label} label={capitalize(label)} key={i} />
          ))}
        </Tabstrip>
      </div>
      <Routes>
        <Route
          path=":foundation"
          element={
            <FoundationPatternsList
              extractValue={props.extractValue}
              jsonInCurrentScope={props.jsonInCurrentScope}
              mode={props.mode}
              patternsInScope={patternsInScope}
              onUpdateJSON={props.onUpdateJSON}
              onModeChange={props.onModeChange}
              themeName={"uitk"}
            />
          }
        />
        <Route
          path="/*"
          element={
            <div className={withBaseName("routingError")}>
              Routing error occurred.
            </div>
          }
        />
      </Routes>
    </div>
  );
};
