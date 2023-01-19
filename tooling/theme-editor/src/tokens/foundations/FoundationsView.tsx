import { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { Tab, Tabstrip, capitalize } from "@salt-ds/lab";
import { JSONByScope } from "../../helpers/parseToJson";
import { ThemeMode } from "../../header/ScopeSelector";
import { SALT_FOUNDATIONS } from "../../utils/saltValues";
import { FoundationPatternsList } from "./FoundationsPatternsList";
import "./Foundations.css";

const withBaseName = makePrefixer("saltFoundationsView");
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
    <div className={clsx(withBaseName())}>
      <div className={clsx(withBaseName("tabs"))}>
        <Tabstrip
          centered
          onActiveChange={props.handleTabSelection}
          overflowMenu={true}
          activeTabIndex={props.selectedTabIndex}
        >
          {SALT_FOUNDATIONS.filter((f) => f !== "fade").map((label, i) => (
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
              themeName={"salt"}
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
