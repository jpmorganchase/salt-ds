import { PrintIcon } from "@jpmorganchase/uitk-icons";
import { ToolkitProvider, useTheme } from "@jpmorganchase/uitk-core";

import styles from "./IconsTable.module.css";

const IconsTable = () => (
  <table className={styles.iconsTable}>
    <thead>
      <tr>
        <th>Size</th>
        <th>High Density (HD)</th>
        <th>Medium Density (HD)</th>
        <th>Low Density (HD)</th>
        <th>Touch Density (HD)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          1X <span className={styles.colored}>(default)</span>
        </td>
        <td>
          <ToolkitProvider density="high">
            <PrintIcon size={1} />
          </ToolkitProvider>
          <p className={styles.colored}>12px</p>
        </td>
        <td>
          <ToolkitProvider density="medium">
            <PrintIcon size={1} />
          </ToolkitProvider>
          <p className={styles.colored}>12px</p>
        </td>
        <td>
          <ToolkitProvider density="low">
            <PrintIcon size={1} />
          </ToolkitProvider>
          <p className={styles.colored}>14px</p>
        </td>
        <td>
          <ToolkitProvider density="touch">
            <PrintIcon size={1} />
          </ToolkitProvider>
          <p className={styles.colored}>16px</p>
        </td>
      </tr>
      <tr>
        <td>2X</td>
        <td>
          <ToolkitProvider density="high">
            <PrintIcon size={2} />
          </ToolkitProvider>
          <p className={styles.colored}>20px</p>
        </td>
        <td>
          <ToolkitProvider density="medium">
            <PrintIcon size={2} />
          </ToolkitProvider>
          <p className={styles.colored}>24px</p>
        </td>
        <td>
          <ToolkitProvider density="low">
            <PrintIcon size={2} />
          </ToolkitProvider>
          <p className={styles.colored}>28px</p>
        </td>
        <td>
          <ToolkitProvider density="touch">
            <PrintIcon size={2} />
          </ToolkitProvider>
          <p className={styles.colored}>32px</p>
        </td>
      </tr>
      <tr>
        <td>3X</td>
        <td>
          <ToolkitProvider density="high">
            <PrintIcon size={3} />
          </ToolkitProvider>
          <p className={styles.colored}>30px</p>
        </td>
        <td>
          <ToolkitProvider density="medium">
            <PrintIcon size={3} />
          </ToolkitProvider>
          <p className={styles.colored}>36px</p>
        </td>
        <td>
          <ToolkitProvider density="low">
            <PrintIcon size={3} />
          </ToolkitProvider>
          <p className={styles.colored}>42px</p>
        </td>
        <td>
          <ToolkitProvider density="touch">
            <PrintIcon size={3} />
          </ToolkitProvider>
          <p className={styles.colored}>48px</p>
        </td>
      </tr>
    </tbody>
  </table>
);

export default IconsTable;
