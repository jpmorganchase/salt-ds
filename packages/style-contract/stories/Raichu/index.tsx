import { SaltProviderNext, FlexLayout } from "@salt-ds/core";
import AppHeader from "./components/AppHeader";
import VerticalNav from "./components/VerticalNav";
import { Dashboard } from "./Dashboard";

import "./styles";

export default function Raichu() {
  return (
    <>
      <AppHeader />
      <FlexLayout gap={0}>
        <VerticalNav />
        <Dashboard />
      </FlexLayout>
    </>
  );
}
