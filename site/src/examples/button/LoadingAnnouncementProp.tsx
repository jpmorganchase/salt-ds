import { Button } from "@salt-ds/core";
import { useState } from "react";

function fetchPDFDocument() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const rand = Math.random();
      if (rand < 0.5) {
        return resolve({});
      }

      return reject({});
    }, 2000);
  });
}

export function LoadingAnnouncementProp() {
  const [loading, setLoading] = useState(false);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState("");

  async function handleClick() {
    setLoading(true);
    setLoadingAnnouncement("Downloading");

    await fetchPDFDocument().finally(() => {
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
