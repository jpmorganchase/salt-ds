import { Card, FlexLayout, SaltProvider, useDensity } from "@salt-ds/core";
import type { ReactElement } from "react";

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

export const DensityResponsive = (): ReactElement => {
  const isTouchscreen =
    typeof window !== "undefined"
      ? window.matchMedia("(pointer: coarse)")
      : false;

  return (
    <FlexLayout>
      <SaltProvider
        density={{
          xs: "touch",
          sm: "low",
          md: "medium",
          lg: "medium",
          xl: "high",
        }}
      >
        <FlexLayout justify="center" align="center">
          <DensityCard />
        </FlexLayout>
      </SaltProvider>
      <SaltProvider density={isTouchscreen ? "touch" : "low"}>
        <FlexLayout justify="center" align="center">
          <DensityCard />
        </FlexLayout>
      </SaltProvider>
    </FlexLayout>
  );
};
