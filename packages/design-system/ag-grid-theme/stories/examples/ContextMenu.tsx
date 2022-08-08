import React, { useEffect } from "react";
import "../../uitk-ag-theme.css";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import windows from "../dependencies/windows.png";
import mac from "../dependencies/mac.png";
import { GetContextMenuItemsParams } from "ag-grid-community";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const ContextMenuExample = function ContextMenuExample(
  props: AgGridReactProps
) {
  const { isGridReady, api, agGridProps, containerProps } = useAgGridHelpers();

  useEffect(() => {
    if (isGridReady) {
      api?.sizeColumnsToFit();
    }
  }, [isGridReady]);

  const getContextMenuItems = (params: GetContextMenuItemsParams) => {
    const result = [
      {
        name: `Alert ${params.value}`,
        action() {
          window.alert(`Alerting about ${params.value}`);
        },
        cssClasses: ["redFont", "bold"],
      },
      {
        name: "Always Disabled",
        disabled: true,
        tooltip:
          "Very long tooltip, did I mention that I am very long, well I am! Long!  Very Long!",
      },
      {
        name: "Country",
        subMenu: [
          {
            name: "Ireland",
            action() {
              console.log("Ireland was pressed");
            },
          },
          {
            name: "UK",
            action() {
              console.log("UK was pressed");
            },
          },
          {
            name: "France",
            action() {
              console.log("France was pressed");
            },
          },
        ],
      },
      {
        name: "Person",
        subMenu: [
          {
            name: "Niall",
            action() {
              console.log("Niall was pressed");
            },
          },
          {
            name: "Sean",
            action() {
              console.log("Sean was pressed");
            },
          },
          {
            name: "John",
            action() {
              console.log("John was pressed");
            },
          },
          {
            name: "Alberto",
            action() {
              console.log("Alberto was pressed");
            },
          },
          {
            name: "Tony",
            action() {
              console.log("Tony was pressed");
            },
          },
          {
            name: "Andrew",
            action() {
              console.log("Andrew was pressed");
            },
          },
          {
            name: "Kev",
            action() {
              console.log("Kev was pressed");
            },
          },
          {
            name: "Will",
            action() {
              console.log("Will was pressed");
            },
          },
          {
            name: "Armaan",
            action() {
              console.log("Armaan was pressed");
            },
          },
        ],
      },
      "separator",
      {
        name: "Windows",
        shortcut: "Alt + W",
        action() {
          console.log("Windows Item Selected");
        },
        icon: `<img src='${windows}' />`,
      },
      {
        name: "Mac",
        shortcut: "Alt + M",
        action() {
          console.log("Mac Item Selected");
        },
        icon: `<img src='${mac}' />`,
      },
      "separator",
      {
        name: "Checked",
        checked: true,
        action() {
          console.log("Checked Selected");
        },
        icon: `<img src='${windows}' />`,
      },
      "copy",
    ];
    return result;
  };

  return (
    <div style={{ marginTop: 25, height: 800, width: 800 }} {...containerProps}>
      <AgGridReact
        allowContextMenuWithControlKey
        getContextMenuItems={getContextMenuItems}
        {...agGridProps}
        {...props}
      />
    </div>
  );
};

ContextMenuExample.defaultProps = {
  columnDefs: dataGridExampleColumns,
  rowData: dataGridExampleData,
};

export default function ContextMenu(props: AgGridReactProps) {
  return <ContextMenuExample {...props} />;
}
