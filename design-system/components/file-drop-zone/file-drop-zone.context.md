# File Drop Zone (Copilot Context)

Lightweight upload target for drag-and-drop or browse-file selection.

- API: ./file-drop-zone.json
- Guidance: ./file-drop-zone.md

## Key rules
- Use exact import: `import { FileDropZone, FileDropZoneIcon, FileDropZoneTrigger } from "@salt-ds/core"`
- Compose with icon + clear instruction text + browse trigger
- Put file validation in `onDrop`/`onChange`; do not rely on `accept` as enforcement
- Use `status="error"` or `status="success"` only after validation/upload outcome is known
- Keep `disabled` behavior consistent across zone and trigger
- Provide user-facing criteria text (file types, size limits) before upload attempts

## Example

```tsx
import {
	FileDropZone,
	FileDropZoneIcon,
	FileDropZoneTrigger,
	Text,
} from "@salt-ds/core";
import type { DragEvent } from "react";

function ExampleFileDropZone() {
	const handleDrop = (_event: DragEvent<HTMLDivElement>, files: File[]) => {
		console.log(files);
	};

	return (
		<FileDropZone onDrop={handleDrop} style={{ width: 320 }}>
			<FileDropZoneIcon />
			<strong>Drop files here or</strong>
			<FileDropZoneTrigger accept=".png,.jpg" multiple />
			<Text>Images only, max 5MB total.</Text>
		</FileDropZone>
	);
}
```
