import { useColorMode, useStoreActions } from "@jpmorganchase/mosaic-store";
import { Button, Tooltip } from "@salt-ds/core";
import { DarkIcon, LightIcon } from "@salt-ds/icons";
import { type ComponentPropsWithoutRef, useEffect, useState } from "react";

export function ModeToggle(props: ComponentPropsWithoutRef<typeof Button>) {
  const colorMode = useColorMode();
  const { setColorMode } = useStoreActions();

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Tooltip
      content={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
      placement="bottom"
      aria-hidden="true"
    >
      <Button
        appearance="bordered"
        sentiment="neutral"
        onClick={() => {
          if (colorMode === "light") {
            setColorMode("dark");
          } else {
            setColorMode("light");
          }
        }}
        aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
        {...props}
      >
        {colorMode === "dark" && <LightIcon aria-hidden />}
        {colorMode === "light" && <DarkIcon aria-hidden />}
      </Button>
    </Tooltip>
  );
}
