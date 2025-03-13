/**
 * Use REST API to query node
 * e.g.: https://api.figma.com/v1/files/7Fh5JbUUM84pYwLt9tpJh2/nodes?ids=7992-77669&depth=2'
 *
 * Then get a mapping of node id of component sets
 * Object.entries(componentSets).map(([key, value])=> `// ${value.name}: ${key}`).join('\n')
 */

// .Controls/Stepper input/Primary: 41693:11008
// .Controls/Stepper input/Secondary: 41693:11564
// .Controls/Stepper input/Status/Error: 41693:12357
// .Controls/Stepper input/Status/Success: 41693:12631
// .Controls/Stepper input/Status/Warning: 41693:12552
// .Status adornment icon: 24695:51059
// Adornments/Button–Accented: 51513:41502
// Adornments/Button–Neutral: 51513:39485
// Adornments/Icon: 25868:18926
// Adornments/Text: 25868:18931
// Controls/Combo Box/Primary combo box: 25871:43304
// Controls/Combo Box/Secondary combo box: 25871:43411
// Controls/Combo Box/Status/Error combo box: 25871:43333
// Controls/Combo Box/Status/Success combo box: 25871:43385
// Controls/Combo Box/Status/Warning combo box: 25871:43359
// Controls/Date Input/Primary single date: 25871:42567
// Controls/Date Input/Secondary single date: 25871:42674
// Controls/Date Input/Status/Error single date: 25871:42596
// Controls/Date Input/Status/Success single date: 25871:42648
// Controls/Date Input/Status/Warning single date: 25871:42622
// Controls/Dropdown/Primary dropdown: 25871:24452
// Controls/Dropdown/Secondary dropdown: 25871:24546
// Controls/Dropdown/Status/Error dropdown: 25871:24477
// Controls/Dropdown/Status/Success dropdown: 25871:24523
// Controls/Dropdown/Status/Warning dropdown: 25871:24500
// Controls/Multiline + Adornments/Primary input: 25871:23356
// Controls/Multiline + Adornments/Secondary input: 25871:23436
// Controls/Multiline + Adornments/Status/Error input: 25871:23285
// Controls/Multiline + Adornments/Status/Success input: 25871:23587
// Controls/Multiline + Adornments/Status/Warning input: 25871:23516
// Controls/Multiline/Primary input: 25871:23017
// Controls/Multiline/Secondary input: 25871:23152
// Controls/Multiline/Status/Error input: 25868:21396
// Controls/Multiline/Status/Success input: 25871:24412
// Controls/Multiline/Status/Warning input: 25871:24377
// Controls/Multiselect Combo Box/Primary combo box: 36447:328084
// Controls/Multiselect Combo Box/Secondary combo box: 36723:15549
// Controls/Multiselect Combo Box/Status/Error combo box: 36724:341093
// Controls/Multiselect Combo Box/Status/Success combo box: 36724:341915
// Controls/Multiselect Combo Box/Status/Warning combo box: 36724:341481
// Form Field sticker: 24744:1666
// Helper Text/Help: 7992:80956
// Helper Text/Status: 7992:80017
// Info banner: 7997:77923
// Label: 7992:80973
// swap: 57496:57742
// Warning banner: 7997:78021

import figma from "@figma/code-connect";
import { Input } from "../src/input/";

// Controls/Input/Primary input: 25868:20970
figma.connect(
  Input,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=25868:20970",
  {
    props: {
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      value: figma.string("Value text"),
    },
    example: (props) => (
      <Input defaultValue={props.value} disabled={props.disabled} />
    ),
  },
);
// Controls/Input/Secondary input: 25868:21132
figma.connect(
  Input,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=25868:21132",
  {
    props: {
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      value: figma.string("Value text"),
    },
    example: (props) => (
      <Input
        variant="secondary"
        defaultValue={props.value}
        disabled={props.disabled}
      />
    ),
  },
);
// Controls/Input/Status/Error input: 25868:21015
figma.connect(
  Input,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=25868:21015",
  {
    props: {
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      value: figma.string("Value text"),
    },
    example: (props) => (
      <Input
        validationStatus="error"
        defaultValue={props.value}
        disabled={props.disabled}
      />
    ),
  },
);

// Controls/Input/Status/Success input: 25868:21093
figma.connect(
  Input,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=25868:21093",
  {
    props: {
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      value: figma.string("Value text"),
    },
    example: (props) => (
      <Input
        validationStatus="success"
        defaultValue={props.value}
        disabled={props.disabled}
      />
    ),
  },
);
// Controls/Input/Status/Warning input: 25868:21054
figma.connect(
  Input,
  "https://www.figma.com/design/7Fh5JbUUM84pYwLt9tpJh2/Salt-DS-Components-and-Patterns?node-id=25868:21054",
  {
    props: {
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      value: figma.string("Value text"),
    },
    example: (props) => (
      <Input
        validationStatus="warning"
        defaultValue={props.value}
        disabled={props.disabled}
      />
    ),
  },
);

// Controls/Input + Adornments/Primary input: 25868:14126
// Controls/Input + Adornments/Secondary input: 25868:20162
// Controls/Input + Adornments/Status/Error input: 25868:20332
// Controls/Input + Adornments/Status/Success input: 25868:20789
// Controls/Input + Adornments/Status/Warning input: 25868:20625
