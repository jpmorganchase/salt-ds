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

export function LoadingAnnouncement() {
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setAnnouncement("Downloading...");

    await fetchPDFDocument()
      .then(() => setAnnouncement("Download Successful!"))
      .catch(() => setAnnouncement("Download Failed!"))
      .finally(() => {
        setLoading(false);
        setTimeout(() => {
          setAnnouncement("");
        }, 1000);
      });
  }

  return (
    <Button loading={loading} announcement={announcement} onClick={handleClick}>
      Download PDF
    </Button>
  );
}
