import { ReactElement } from "react";
import { GridLayout, GridItem } from "@salt-ds/core";
import styles from "./ColumnTemplateAndAutoRows.module.css";

export const ColumnTemplateAndAutoRows = (): ReactElement => (
  <GridLayout columns={["20%", 1, 1]} rows="100px" className={styles.grid}>
    <GridItem rowSpan={2}>1</GridItem>
    <GridItem>2</GridItem>
    <GridItem>3</GridItem>
    <GridItem>4</GridItem>
    <GridItem>5</GridItem>
  </GridLayout>
);
