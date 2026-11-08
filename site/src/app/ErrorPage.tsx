"use client";

import { usePathname } from "next/navigation";
import { Page404 } from "../Body/404";
import { Page500 } from "../Body/500";
import { FrameSync } from "./[namespace]/NamespaceFrame";
import { StoreShell } from "./providers";

export function ErrorPage({
  status,
  retry,
}: {
  status: 404 | 500;
  retry?: () => void;
}) {
  const route = usePathname() || "/salt/index";
  return (
    <StoreShell storeProps={{ layout: "DetailError", route }}>
      <FrameSync route={route} />
      {status === 404 ? <Page404 /> : <Page500 retry={retry} />}
    </StoreShell>
  );
}
