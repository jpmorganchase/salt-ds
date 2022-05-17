import { CSSByPattern, parseJSONtoCSS } from "@jpmorganchase/theme-editor";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import "@jpmorganchase/uitk-theme/index.css";
import { useState } from "react";
import "./App.css";
import { useHeadStyle } from "./hooks/useHeadStyle";
import { experimentTheme } from "./theme";
import {
  parseCssToFlowData,
  DeclarationData,
  Declaration,
} from "./utils/parseCssToFlowData";
import { FlowView } from "./views/FlowView";
import { PreviewView } from "./views/PreviewView";
import { Node, Edge } from "react-flow-renderer";
import { getIdFromPropertyName } from "./utils/getIdFromPropertyName";
import {
  UITK_CHARACTERISTICS,
  UITK_COMPONENTS,
  UITK_PALETTES,
} from "@jpmorganchase/theme-editor/src/utils/uitkValues";

function joinCssByPattern(cssByPatterns: CSSByPattern[]) {
  let result = "";
  for (let i = 0; i < cssByPatterns.length; i++) {
    const pattern = cssByPatterns[i];
    // Some might be empty string
    if (pattern.cssObj) {
      result += pattern.cssObj + "\n";
    }
  }
  return result;
}

const cssVarNodeHeight = 50;
const cssVarGroupWidth = 400;

function declarationDataToFlowNodes(data: DeclarationData): {
  nodes: Node<Declaration>[];
  edges: Edge[];
} {
  console.log({ data });
  const nodes: Node<Declaration>[] = [];
  const edges: Edge[] = [];
  const groupIdSet: Set<string> = new Set();
  // let lastHeight = 0;
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    // Group
    const idFromPropertyName = getIdFromPropertyName(
      d.declarations[0].property
    );
    const groupId = UITK_COMPONENTS.includes(idFromPropertyName)
      ? d.groupName
      : UITK_PALETTES.includes(idFromPropertyName)
      ? "PaletteGroup"
      : UITK_CHARACTERISTICS.includes(idFromPropertyName)
      ? "CharateristicsGroup"
      : idFromPropertyName;
    // Only add group once
    console.log({ groupId, d });
    if (!groupIdSet.has(groupId)) {
      groupIdSet.add(groupId);
      nodes.push({
        id: groupId,
        type: "group",
        data: {
          property: "group" + i.toString(),
          value: "group" + i.toString(),
        },
        // Each group apart
        position: { x: i * cssVarGroupWidth, y: 0 },
        style: {
          width: cssVarGroupWidth - 30,
          height: d.declarations.length * cssVarNodeHeight + 20,
        },
      });
    }
    //  else {
    //   const height = nodes.find((n) => n.id === groupId)?.style?.height;
    //   if (height) {
    //     lastHeight =
    //       typeof height === "number" ? height : Number.parseInt(height);

    //     nodes.find((n) => n.id === groupId)!.style!.height =
    //       lastHeight + d.declarations.length * cssVarNodeHeight;
    //   }
    // }

    // Children declarations
    // eslint-disable-next-line no-loop-func
    d.declarations.forEach((declaration, dIndex) => {
      const nodeId = declaration.property.startsWith("--uitk")
        ? declaration.property
        : groupId + "-" + i.toString() + "-" + dIndex.toString();
      nodes.push({
        parentNode: groupId,
        type: "flowCssVarNode",
        id: nodeId,
        data: declaration,
        // Each one gap
        position: { x: 10, y: dIndex * cssVarNodeHeight + 10 },
        // set the child extent to 'parent' so that we can't move them out of the parent node
        extent: "parent",
      });
      if (declaration.value.startsWith("var")) {
        // console.log("declaration value", declaration.value);
        edges.push({
          id: "edge-" + nodeId,
          target: nodeId,
          // from "var(" ---- to ")"
          source: declaration.value.substring(4, declaration.value.length - 1),
        });
      }
    });
  }

  return { nodes, edges };
}

function updateStyle(
  patterns: CSSByPattern[],
  property: string,
  newValue: string
): CSSByPattern[] {
  return patterns.map((p) => {
    if (p.cssObj.includes(property)) {
      p.cssObj = p.cssObj.replace(
        new RegExp(`${property}.*;`, "g"),
        `${property}: ${newValue};`
      );
      return p;
    } else {
      return p;
    }
  });
}

function App(): JSX.Element {
  const [overrideStyle, setOverrideStyle] = useState(
    parseJSONtoCSS(experimentTheme)
  );
  console.log(overrideStyle);
  const allCssSheet = joinCssByPattern(overrideStyle);

  // Join all the styles, write to <head>
  useHeadStyle(allCssSheet);

  const data = parseCssToFlowData(allCssSheet);
  const { nodes, edges } = declarationDataToFlowNodes(data);
  console.log({ data, nodes, edges });

  const handleFlowViewValueChange = (property: string, newValue: string) => {
    console.log({ property, newValue });
    setOverrideStyle((oldStyle) => updateStyle(oldStyle, property, newValue));
  };

  return (
    <ToolkitProvider>
      <div className="App">
        <div className="App-flow">
          <FlowView
            initialNodes={nodes}
            initialEdges={edges}
            onValueChange={handleFlowViewValueChange}
          />
        </div>
        <PreviewView className="App-preview" />
        <div className="App-debug">
          <code>{JSON.stringify(overrideStyle)}</code>
        </div>
      </div>
    </ToolkitProvider>
  );
}

export default App;
