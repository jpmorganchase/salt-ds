import { FlexLayout } from "@salt-ds/core";
import AppHeader from "./components/AppHeader";
import VerticalNav from "./components/VerticalNav";
import { Dashboard } from "./Dashboard";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import styles from "./css/index.css";

export default function Raichu() {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-story-raichu",
    css: styles,
    window: targetWindow,
  });

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
