import { Progress } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Linear = (): ReactElement => (
  <div style={{ width: 320 }}>
    <Progress label="Uploading report.pdf" value={38} />
  </div>
);
