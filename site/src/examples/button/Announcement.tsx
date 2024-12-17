import { useEffect, type MouseEvent } from "react";
import { Button } from "@salt-ds/core";
import { useState } from "react";

// example request
function downloadPDF() {
  return new Promise((resolve, reject) => {
    const random = Math.random();
    setTimeout(() => {
      if (random > 0.5) {
        resolve({});
      }
      reject({});
    }, 2_000);
  });
}

export function Announcement() {
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (announcement) {
      const interval = setTimeout(() => setAnnouncement(""), 3_000);

      return () => clearInterval(interval);
    }

    return () => {};
  }, [announcement]);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    setLoading(true);
    setAnnouncement("Downloading PDF...");

    downloadPDF()
      .then(() => setAnnouncement("Download succeeded!"))
      .catch(() => setAnnouncement("Download failed!"))
      .finally(() => setLoading(false));
  }

  return (
    <Button
      type="button"
      loading={loading}
      announcement={announcement}
      onClick={handleClick}
    >
      Download PDF
    </Button>
  );
}
