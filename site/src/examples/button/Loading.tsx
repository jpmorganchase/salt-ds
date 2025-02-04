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

  async function handleClick() {
    setLoading(true);

    await fetchPDFDocument().then(() => {
      setLoading(false);
    });
  }

  return (
    <Button
      loading={loading}
      loadingAnnouncement="Downloading"
      onClick={handleClick}
    >
      Download PDF
    </Button>
  );
}
