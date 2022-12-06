import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import Accordion, {
  AccordionBaseProps,
} from "../../src/components/accordion/Accordion";
import styles from "./DevelopFontsAccordion.module.css";

export const fontFileTable: AccordionBaseProps["accordionInfo"] = [
  {
    id: "font-file-table",
    summary: (
      <strong className={styles.summary}>
        View the web fonts, widths and styles
      </strong>
    ),
    details: (
      <>
        <table>
          <thead>
            <tr>
              <th>Font-family</th>
              <th>Font-weight</th>
              <th>Font-style</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>300</code>
              </td>
              <td>
                <code>normal</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>300</code>
              </td>
              <td>
                <code>italic</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>400</code> / <code>normal</code>
              </td>
              <td>
                <code>normal</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>400</code> / <code>normal</code>
              </td>
              <td>
                <code>italic</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>500</code>
              </td>
              <td>
                <code>normal</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>500</code>
              </td>
              <td>
                <code>italic</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>600</code>
              </td>
              <td>
                <code>normal</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>600</code>
              </td>
              <td>
                <code>italic</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>700</code> / <code>bold</code>
              </td>
              <td>
                <code>normal</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>700</code> / <code>bold</code>
              </td>
              <td>
                <code>italic</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>800</code>
              </td>
              <td>
                <code>normal</code>
              </td>
            </tr>
            <tr>
              <td>Open Sans</td>
              <td>
                <code>800</code>
              </td>
              <td>
                <code>italic</code>
              </td>
            </tr>
            <tr>
              <td>PT Sans</td>
              <td>
                <code>400</code> / <code>normal</code>
              </td>
              <td>
                <code>normal</code>
              </td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
];

const DevelopFontsAccordion = (): JSX.Element => {
  return (
    <div className={styles.accordionWrapper}>
      <Accordion accordionInfo={fontFileTable} />
      <ToolkitProvider mode="dark">
        <hr />
      </ToolkitProvider>
    </div>
  );
};

export default DevelopFontsAccordion;
