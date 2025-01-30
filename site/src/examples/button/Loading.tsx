import { Button } from "@salt-ds/core";
import { useState } from "react";

function fetchPDFDocument() {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve({});
    }, 2000);
  });
}

export function Loading() {
  const [loading, setLoading] = useState(false);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState("");

  async function handleClick() {
    setLoading(true);
    setLoadingAnnouncement("Downloading");

    await fetchPDFDocument().then(() => {
      setLoading(false);
      setLoadingAnnouncement("");
    });
  }

  return (
    <Button
      loading={loading}
      loadingAnnouncement={loadingAnnouncement}
      onClick={handleClick}
    >
      Download PDF
    </Button>
  );
}
