import { PrintIcon } from "@salt-ds/icons";
import { ToolkitProvider, useTheme } from "@salt-ds/core";

import styles from "./IconsTable.module.css";

const IconsTable = () => (
  <div className={styles.iconsTableContainer}>
    <table className={styles.iconsTable}>
      <caption>
        Example of an icon (print) in different densities and sizes
      </caption>
      <thead>
        <tr>
          <th>Size</th>
          <th>High Density (HD)</th>
          <th>Medium Density (MD)</th>
          <th>Low Density (LD)</th>
          <th>Touch Density (TD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            1X <span className={styles.colored}>(default)</span>
          </td>
          <td>
            <ToolkitProvider density="high">
              <PrintIcon />
            </ToolkitProvider>
            <p className={styles.colored}>12px</p>
          </td>
          <td>
            <ToolkitProvider density="medium">
              <PrintIcon />
            </ToolkitProvider>
            <p className={styles.colored}>12px</p>
          </td>
          <td>
            <ToolkitProvider density="low">
              <PrintIcon />
            </ToolkitProvider>
            <p className={styles.colored}>14px</p>
          </td>
          <td>
            <ToolkitProvider density="touch">
              <PrintIcon />
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
  </div>
);

export default IconsTable;
