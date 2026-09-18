"use client";

import {
  Button,
  FlexLayout,
  SaltProviderNext,
  type Density,
  type Mode,
} from "@salt-ds/core";
import { DarkIcon, LightIcon } from "@salt-ds/icons";
import { type ReactNode, useState } from "react";

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");
  const [density, setDensity] = useState<Density>("low");

  return (
    <SaltProviderNext mode={mode} density={density} accent="teal" corner="rounded">
      <div className="appShell" data-mode={mode} data-density={density}>
        <header className="appHeader">
          <a className="brand" href="#main">Salt workspace</a>
          <nav aria-label="Primary navigation">
            <a aria-current="page" href="#overview">Overview</a>
            <a href="#activity">Activity</a>
            <a href="#people">People</a>
          </nav>
          <FlexLayout className="headerControls" gap={1}>
            <Button
              data-testid="mode-toggle"
              appearance="transparent"
              aria-label={`Use ${mode === "light" ? "dark" : "light"} mode`}
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
            >
              {mode === "light" ? <DarkIcon aria-hidden /> : <LightIcon aria-hidden />}
            </Button>
            <Button
              data-testid="density-toggle"
              appearance="bordered"
              onClick={() => setDensity(density === "low" ? "high" : "low")}
            >
              Density: {density}
            </Button>
          </FlexLayout>
        </header>
        {children}
      </div>
    </SaltProviderNext>
  );
}
