import { isDesktop } from "@salt-ds/lab";
import { JSONByScope, parseCSStoJSON, tidyUp } from "../helpers/parseToJson";
import { UITK_CHARACTERISTICS, UITK_FOUNDATIONS } from "../utils/uitkValues";

export const handleThemeUpload = async (
  onFileUpload: (jsonByScope: JSONByScope[], themeName: string) => void
) => {
  /* User should pick directory containing
  index.css file and all related theme files */
  try {
    let allContents;
    let themeName;
    if (isDesktop) {
      // eslint-disable-next-line
      [allContents, themeName] = await (window as any).ipcRenderer.invoke(
        "select-dir"
      );
    } else {
      //@ts-ignore
      const dirHandle = await window.showDirectoryPicker();
      if (!dirHandle) {
        return;
      }

      const rootFileHandle = await dirHandle.getFileHandle("index.css");
      if (!rootFileHandle) {
        return;
      }

      const file = await rootFileHandle.getFile();
      const rootContents = await file.text();
      allContents = await recurseDirectory(rootContents, dirHandle);
      themeName = dirHandle.name;
    }
    const css = tidyUp(allContents); // Remove CSS comments etc
    onFileUpload(parseCSStoJSON(css), themeName ?? "");
  } catch (error) {
    alert(
      `Please ensure you select the appropriate directory containing the theme. Error occurred: ${error}`
    );
  }
};

async function getImportedContents(importURL: string, dirHandle: any) {
  let subDirHandle = dirHandle;
  let url = importURL;

  if (importURL.split("/").length > 1) {
    subDirHandle = await dirHandle.getDirectoryHandle(importURL.split("/")[0]);
    if (!subDirHandle) {
      return;
    }
    url = importURL.split("/")[1];
  }

  const innerFileHandle = await subDirHandle.getFileHandle(url);
  if (!innerFileHandle) {
    return;
  }
  const innerFile = await innerFileHandle.getFile();

  let fileContents = await innerFile.text();
  if (fileContents) {
    return fileContents;
  }

  return;
}

async function recurseDirectory(fileContents: string, dirHandle: any) {
  let allContents = "";
  for (var line of fileContents.split("\n")) {
    if (line.startsWith("@import")) {
      var importURL = /\(\s*([^)]+?)\s*\)/.exec(line);

      if (importURL) {
        const url = importURL[1];
        const importedContents = await getImportedContents(url, dirHandle);
        if (
          UITK_CHARACTERISTICS.concat(UITK_FOUNDATIONS).indexOf(
            url.split("/")[1].replace(".css", "")
          ) !== -1
        ) {
          allContents += importedContents;
        } else {
          const subDirHandle = await dirHandle.getDirectoryHandle(
            url.split("/")[0]
          );
          allContents += await recurseDirectory(importedContents, subDirHandle);
        }
      }
    }
  }

  return allContents;
}
