"use client";

import { useEffect } from "react";
import { ErrorPage } from "./ErrorPage";

export default function ErrorBoundary({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => console.error(error), [error]);
  return <ErrorPage status={500} retry={retry} />;
}
