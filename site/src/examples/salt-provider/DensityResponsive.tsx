import { Card, FlexLayout, SaltProvider, useDensity } from "@salt-ds/core";
import { type ReactElement, useSyncExternalStore } from "react";

function DensityCard() {
  const density = useDensity();
  return (
    <Card>
      <FlexLayout justify="center" align="center">
        Current density: "{density}"
      </FlexLayout>
    </Card>
  );
}

const getSnapshot = () => {
  return window.matchMedia("(pointer: coarse)").matches;
};

const subscribe = (callback: () => void) => {
  const matchMedia = window.matchMedia("(pointer: coarse)");
  matchMedia.addEventListener("change", callback);

  return () => matchMedia.removeEventListener("change", callback);
};

export const DensityResponsive = (): ReactElement => {
  const isTouchscreen = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <SaltProvider density={isTouchscreen ? "touch" : "low"}>
      <FlexLayout justify="center" align="center">
        <DensityCard />
      </FlexLayout>
    </SaltProvider>
  );
};
