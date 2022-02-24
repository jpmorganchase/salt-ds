import { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import cx from "classnames";
import { makePrefixer } from "@brandname/core";
import { Tab, Tabstrip, capitalize } from "@brandname/lab";
import { JSONByScope } from "../../helpers/parseToJson";
import { ThemeMode } from "../../header/ScopeSelector";
import { UITK_FOUNDATIONS, UITK_COLOURS } from "../../utils/uitkValues";
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
  "/foundations/shadow",
  "/foundations/size",
  "/foundations/spacing",
  "/foundations/typography",
  "/foundations/zindex",
];

export const FoundationsView = (props: FoundationsViewProps): ReactElement => {
  const patternsInScope =
    props.selectedTabIndex === 0
      ? UITK_COLOURS
      : [
          foundationPathnames[props.selectedTabIndex].replace(
            "/foundations/",
            ""
          ),
        ];

  return (
    <div className={cx(withBaseName())}>
      <div className={cx(withBaseName("tabs"))}>
        <Tabstrip
          centered
          onChange={props.handleTabSelection}
          overflowMenu={true}
          value={props.selectedTabIndex}
        >
          {UITK_FOUNDATIONS.map((label, i) => (
            <Tab
              aria-label={label}
              label={capitalize(label) as string}
              key={i}
            />
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
