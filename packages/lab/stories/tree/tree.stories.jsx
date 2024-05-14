import React from "react";
import { Tree as Tree } from "@salt-ds/lab";
import { groupByInitialLetter, usa_states_cities } from "../list/list.data";
import { folderData } from "./tree.data";

export default {
  title: "Lab/Tree",
  component: Tree,
};

function createSampleTreeData(autoExpanded = true, wideLeafNodeParentId = "") {
  return [
    {
      id: "a",
      label: "1",
      description: "description",
      expanded: autoExpanded,
      childNodes: [
        {
          id: "b",
          label: "2",
          expanded: autoExpanded,
          childNodes: [
            {
              id: "c",
              label: "3",
              expanded: autoExpanded,
              childNodes: [
                {
                  id: wideLeafNodeParentId || "d",
                  label: "4",
                  description: "description",
                  expanded: autoExpanded,
                  childNodes: [
                    {
                      id: `${wideLeafNodeParentId || "e"}-1`,
                      label: "5",
                      description: "description",
                    },
                  ].concat(
                    wideLeafNodeParentId
                      ? [
                          {
                            id: `${wideLeafNodeParentId || "e"}-2`,
                            label: "6",
                            description: "description",
                          },
                          {
                            id: `${wideLeafNodeParentId || "e"}-3`,
                            label: "7",
                            description: "description",
                          },
                        ]
                      : []
                  ),
                },
              ],
            },
            {
              id: "f",
              label: "8",
              expanded: autoExpanded,
              childNodes: [
                {
                  id: "h",
                  label: "9",
                  description: "description",
                  expanded: autoExpanded,
                  childNodes: [
                    {
                      id: "e",
                      label: "10",
                      description: "description",
                    },
                    {
                      id: "z",
                      label: "11",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

const source = [
  {
    id: "expanded-node-1",
    description: "Node with children",
    expanded: true,
    childNodes: [
      {
        selected: true,
        id: "selected-node-1",
        label: "child",
      },
      {
        selected: true,
        id: "selected-node-2",
        label: "child",
      },
    ],
  },
];

export const Default = () => {
  const handleChange = (e, selected) => {
    console.log(`selected ${selected}`);
  };
  return (
    <Tree
      height={800}
      onSelectionChange={handleChange}
      selection="checkbox"
      source={groupByInitialLetter(usa_states_cities, "groups-only")}
      width={350}
    />
  );
};

export const Cypress = () => {
  const handleSelectionChange = (evt, selected) => {
    console.log(`selectionChange`, { selected });
  };

  return (
    <Tree
      height={800}
      onSelectionChange={handleSelectionChange}
      selection="checkbox"
      width={350}
      source={source}
      // defaultSelected={source[0].childNodes[0]}
    />
  );
};

const iconTreeStyle = `
  .arrow-toggle {
    --saltTree-toggle-collapse: var(--svg-triangle-right);
    --saltTree-toggle-expand: var(--svg-triangle-right);
    --saltTree-node-expanded-transform: rotate(45deg) translate(1px, 1px);
   }
`;

export const SimpleTree = () => {
  const source = [
    {
      label: "Fruits",
      childNodes: [
        { label: "Oranges" },
        { label: "Pineapple" },
        {
          label: "Apples",
          childNodes: [
            { label: "Macintosh" },
            { label: "Granny Smith" },
            { label: "Fuji" },
          ],
        },
        { label: "Bananas" },
        { label: "Pears" },
      ],
    },
    { label: "Vegatables" },
    { label: "Grain" },
  ];

  return <Tree groupSelection="single" source={source} />;
};

export const SimpleTreeIcons = () => {
  const handleChange = (e, selected) => {
    console.log(`selected ${selected.join(",")}`);
  };
  return (
    <div
      style={{ width: 900, display: "flex", gap: 50, alignItems: "flex-start" }}
    >
      <style>{iconTreeStyle}</style>
      <Tree
        className="arrow-toggle"
        height={600}
        onSelectionChange={handleChange}
        source={folderData}
        width={400}
      />
    </div>
  );
};

// export const RevealSelected = () => {
//   const handleChange = (e, selected) => {
//     console.log(`selected ${selected.join(",")}`);
//   };

//   const [, source] = useItemsWithIds(folderData);
//   console.log({ source });

//   console.log({ source });
//   return (
//     <div
//       style={{ width: 900, display: "flex", gap: 50, alignItems: "flex-start" }}
//     >
//       <div
//         style={{
//           fontFamily: "Roboto",
//           maxHeight: 800,
//           width: 150,
//           position: "relative",
//         }}
//       >
//         <style>{iconTreeStyle}</style>
//         <Tree
//           className="arrow-toggle"
//           defaultSelected={["root-0.1.0.0.0"]}
//           onSelectionChange={handleChange}
//           source={source}
//           revealSelected
//         />
//       </div>
//     </div>
//   );
// };
