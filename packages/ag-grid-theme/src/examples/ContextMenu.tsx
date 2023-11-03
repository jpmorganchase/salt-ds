import { GetContextMenuItemsParams } from "ag-grid-community";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { StackLayout } from "@salt-ds/core";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import windows from "../dependencies/windows.png";
import mac from "../dependencies/mac.png";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";

const ContextMenu = (props: AgGridReactProps) => {
  const { themeName, switcher } = useAgGridThemeSwitcher();
  const { agGridProps, containerProps } = useAgGridHelpers({
    agThemeName: `ag-theme-${themeName}`,
  });

  const getContextMenuItems = (params: GetContextMenuItemsParams) => {
    const result = [
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        name: `Alert ${params.value}`,
        action() {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
    <StackLayout gap={4}>
      {switcher}
      <div {...containerProps}>
        <AgGridReact
          allowContextMenuWithControlKey
          getContextMenuItems={getContextMenuItems}
          columnDefs={dataGridExampleColumns}
          rowData={dataGridExampleData}
          {...agGridProps}
          {...props}
        />
      </div>
    </StackLayout>
  );
};

ContextMenu.parameters = {
  chromatic: { disableSnapshot: false, delay: 1000 },
};

export default ContextMenu;
