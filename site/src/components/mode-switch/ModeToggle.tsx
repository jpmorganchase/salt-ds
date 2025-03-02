import { useColorMode, useStoreActions } from "@jpmorganchase/mosaic-store";
import { Button } from "@salt-ds/core";
import { DarkIcon, LightIcon } from "@salt-ds/icons";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const colorMode = useColorMode();
  const { setColorMode } = useStoreActions();

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
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
    >
      {colorMode === "dark" && <LightIcon aria-hidden />}
      {colorMode === "light" && <DarkIcon aria-hidden />}
    </Button>
  );
}
