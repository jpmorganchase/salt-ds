import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import type { SandpackFile } from "@codesandbox/sandpack-react/unstyled";
import { Children, FC, ReactNode } from "react";

type SandpackProps = {
  children: ReactNode;
};

export const createFileMap = (codeSnippets: any) => {
  for (const snippet of codeSnippets) {
    console.log(snippet.props.children);
  }
  let fileMap = {};
  // console.log(codeSnippets);
  return fileMap;
  // return codeSnippets.reduce(
  //   (result: Record<string, SandpackFile>, codeSnippet: React.ReactElement) => {
  //     if ((codeSnippet.type as any).mdxName !== "Pre") {
  //       return result;
  //     }
  //     const { props } = codeSnippet.props.children;
  //     let filePath; // path in the folder structure
  //     let fileHidden = false; // if the file is available as a tab
  //     let fileActive = false; // if the file tab is shown by default

  //     if (props.meta) {
  //       const [name, ...params] = props.meta.split(" ");
  //       filePath = "/" + name;
  //       if (params.includes("hidden")) {
  //         fileHidden = true;
  //       }
  //       if (params.includes("active")) {
  //         fileActive = true;
  //       }
  //     } else {
  //       if (props.className === "language-js") {
  //         filePath = "/App.js";
  //       } else if (props.className === "language-css") {
  //         filePath = "/styles.css";
  //       } else {
  //         throw new Error(
  //           `Code block is missing a filename: ${props.children}`
  //         );
  //       }
  //     }
  //     if (result[filePath]) {
  //       throw new Error(
  //         `File ${filePath} was defined multiple times. Each file snippet should have a unique path name`
  //       );
  //     }
  //     result[filePath] = {
  //       code: (props.children || "") as string,
  //       hidden: fileHidden,
  //       active: fileActive,
  //     };

  //     return result;
  //   },
  //   {}
  // );
};

export const SaltSandpack: FC<SandpackProps> = ({ children }): JSX.Element => {
  const fileMap = createFileMap(Children.toArray(children));

  console.log(fileMap);

  const dependencies = {
    "@salt-ds/icons": "latest",
    "@salt-ds/core": "latest",
    "@salt-ds/lab": "latest",
    "@salt-ds/theme": "latest",
  };

  const files = {
    "/index.tsx": `import React from "react";
    import ReactDOM from "react-dom/client";
    import App from "./App";

    // Import <SaltProvider>
    import { SaltProvider } from "@salt-ds/core";
    
    // Import theme CSS
    import "@salt-ds/theme/index.css";
    import "./styles.css";
    
    const rootElement = document.getElementById("root")!;
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <SaltProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </SaltProvider>,
    );
    `,
    "/App.tsx": `import { Button, BorderLayout, BorderItem, Text, FlexItem, StackLayout } from "@salt-ds/core";
import { SymphonyIcon, StackoverflowIcon, GithubIcon } from "@salt-ds/icons";
  
export default function App() {
  return (
    <StackLayout
       direction={{ xs: "column", sm: "row" }}
       style={{ width: "100%" }}
       gap={1}
     >
      <FlexItem>
        <Button variant="cta" style={{ width: "100%" }}>
           Save
         </Button>
       </FlexItem>
       <FlexItem>
         <Button style={{ width: "100%" }}>Cancel</Button>
       </FlexItem>
     </StackLayout>
   );
 }
  `,
    "styles.css": `@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&family=PT+Sans&display=swap');`,
  };

  return (
    <SandpackProvider
      template="react-ts"
      customSetup={{ dependencies: dependencies }}
      files={files}
      options={{
        visibleFiles: ["/App.tsx"],
      }}
    >
      <SandpackLayout>
        <SandpackPreview />
      </SandpackLayout>
      <SandpackLayout>
        <SandpackCodeEditor />
      </SandpackLayout>
    </SandpackProvider>
  );
};
