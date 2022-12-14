/* eslint-disable */
import { CSSByPattern } from "@salt-ds/theme-editor/src/helpers/parseToCss";
import {
  SALT_CHARACTERISTICS,
  SALT_FOUNDATIONS,
} from "@salt-ds/theme-editor/src/utils/saltValues";

declare const window: any;

export async function saveToDirectory(cssByPattern: CSSByPattern[]) {
  try {
    /* User should pick directory where they want the files saved */
    const dirHandle = await window.showDirectoryPicker();

    let newFile = await dirHandle.getFileHandle(`index.css`, {
      create: true,
    });
    const stream = await newFile.createWritable();
    SALT_FOUNDATIONS.forEach(
      async (foundation) =>
        await stream.write(`@import url(foundations/${foundation}.css);\n`)
    );
    SALT_CHARACTERISTICS.forEach(
      async (characteristic) =>
        await stream.write(
          `@import url(characteristics/${characteristic}.css);\n`
        )
    );
    await stream.close();

    let characteristicsFolder = await dirHandle.getDirectoryHandle(
      `characteristics`,
      { create: true }
    );
    let foundationsFolder = await dirHandle.getDirectoryHandle(`foundations`, {
      create: true,
    });

    for (var element of cssByPattern) {
      let subDirHandle = SALT_FOUNDATIONS.includes(element.pattern)
        ? foundationsFolder
        : characteristicsFolder;

      let newFile = await subDirHandle.getFileHandle(`${element.pattern}.css`, {
        create: true,
      });

      const stream = await newFile.createWritable();
      await stream.write(element.cssObj);
      await stream.close();
    }

    return dirHandle.name;
  } catch (error) {
    alert(`Error occurred: ${error}`);
    throw error;
  }
}
