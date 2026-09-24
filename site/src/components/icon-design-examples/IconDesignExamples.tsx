import {
  BankIcon,
  CalendarIcon,
  CalendarSolidIcon,
  CloudSyncIcon,
  CloudSyncSolidIcon,
  CsvIcon,
  DashboardIcon,
  DashboardSolidIcon,
  DevicesIcon,
  DevicesSolidIcon,
  DocumentIcon,
  DocumentSolidIcon,
  Forward10Icon,
  GlobeIcon,
  type IconProps,
  LaptopIcon,
  LightIcon,
  LikeIcon,
  PanelOpenLeftIcon,
  PanelOpenLeftSolidIcon,
  PdfIcon,
  Replay10Icon,
  ScheduleTimeIcon,
  TagClearIcon,
  TagClearSolidIcon,
  TextBoldIcon,
  TextItalicsIcon,
  ZipIcon,
} from "@salt-ds/icons";
import type { ComponentType, CSSProperties } from "react";
import styles from "./IconDesignExamples.module.css";

export type IconDesignExample =
  | "family"
  | "scale"
  | "stroke"
  | "gauge"
  | "text-lines"
  | "geometry"
  | "variants"
  | "lettering"
  | "cutouts";

export interface IconDesignExamplesProps {
  example: IconDesignExample;
}

interface Sample {
  Icon: ComponentType<IconProps>;
  label: string;
}

interface Group {
  label: string;
  samples: Sample[];
  pixels?: number;
  description?: string;
}

interface Figure {
  groups: Group[];
  caption: string;
}

const scaleSamples: Sample[] = [
  { Icon: BankIcon, label: "Bank" },
  { Icon: CalendarIcon, label: "Calendar" },
  { Icon: DevicesIcon, label: "Devices" },
];

const figures: Record<IconDesignExample, Figure> = {
  family: {
    groups: [
      {
        label: "Shared visual language",
        samples: [
          { Icon: BankIcon, label: "Bank" },
          { Icon: CalendarIcon, label: "Calendar" },
          { Icon: GlobeIcon, label: "Globe" },
          { Icon: LikeIcon, label: "Like" },
          { Icon: LaptopIcon, label: "Laptop" },
          { Icon: LightIcon, label: "Light" },
        ],
      },
    ],
    caption:
      "Different silhouettes share a restrained level of detail, open geometry, and balanced visual weight. Shown at 64px with the standard line weight.",
  },
  scale: {
    groups: [12, 16, 64].map((pixels) => ({
      label: `${pixels}px${pixels === 64 ? " · enlarged" : " · native"}`,
      samples: scaleSamples,
      pixels,
    })),
    caption:
      "The same artwork at 12px, 16px, and 64px. The configured line weight scales with the icon. Judge recognition at native size and construction in the enlarged view.",
  },
  stroke: {
    groups: [
      {
        label: "Primary strokes",
        samples: [{ Icon: BankIcon, label: "Bank" }],
        description:
          "Primary strokes use approximately 4/3 units in high/medium density, 8/7 in low, and 1 in touch/mobile. Each gives approximately 1px at the default icon size.",
      },
      {
        label: "Secondary details",
        samples: [{ Icon: ScheduleTimeIcon, label: "Schedule time" }],
        description:
          "The clock hands retain their finer proportion as the stroke width changes.",
      },
      {
        label: "Filled surfaces and lines",
        samples: [{ Icon: CalendarSolidIcon, label: "Calendar solid" }],
        description:
          "The bindings remain open lines alongside the filled body.",
      },
    ],
    caption:
      "These React icons inherit the density's primary stroke: approximately 4/3 units in high/medium, 8/7 in low, and 1 in touch/mobile. Secondary details keep their proportions. The 64px views scale the configured weight; filled contours retain their geometry.",
  },
  gauge: {
    groups: [12, 16, 64].map((pixels) => ({
      label: `${pixels}px${pixels === 64 ? " · enlarged" : " · native"}`,
      samples: [
        { Icon: DashboardIcon, label: "Outline" },
        { Icon: DashboardSolidIcon, label: "Solid" },
      ],
      pixels,
    })),
    caption:
      "Dashboard keeps its ticks separate from the rim without thinning them. Compare the tick and needle weight in both variants at native size.",
  },
  "text-lines": {
    groups: [12, 16, 64].map((pixels) => ({
      label: `${pixels}px${pixels === 64 ? " · enlarged" : " · native"}`,
      samples: [
        { Icon: DocumentIcon, label: "Painted bars" },
        { Icon: DocumentSolidIcon, label: "Transparent slots" },
      ],
      pixels,
    })),
    caption:
      "Document preserves the line count and rhythm. Painted bars have flat ends; transparent slots can soften their interior corners while retaining a flat end section.",
  },
  geometry: {
    groups: [
      {
        label: "Crisp structure",
        samples: [{ Icon: BankIcon, label: "Bank" }],
        pixels: 80,
        description:
          "Sharp outer roof and plinth corners surround softened openings and column attachments.",
      },
      {
        label: "Inner joins",
        samples: [{ Icon: CalendarIcon, label: "Calendar" }],
        pixels: 80,
        description:
          "A straight frame with eased binding and divider connections.",
      },
      {
        label: "Continuous curves",
        samples: [{ Icon: GlobeIcon, label: "Globe" }],
        pixels: 80,
        description:
          "A shared sphere with internal curves that follow its shape.",
      },
    ],
    caption:
      "Enlarged to 80px at the themed line weight. Soften exposed inner joins and opening corners, retain sharp outward-facing corners and flat ends, and preserve natural curves. The visible result determines the local radius.",
  },
  variants: {
    groups: [
      {
        label: "Calendar",
        samples: [
          { Icon: CalendarIcon, label: "Outline" },
          { Icon: CalendarSolidIcon, label: "Solid" },
        ],
        description:
          "Bindings and the header divider keep their shared positions.",
      },
      {
        label: "Panel open left",
        samples: [
          { Icon: PanelOpenLeftIcon, label: "Outline" },
          { Icon: PanelOpenLeftSolidIcon, label: "Solid" },
        ],
        description: "The frame, rail, and arrow retain their alignment.",
      },
    ],
    caption:
      "Outline and solid variants share their construction landmarks. Filling a surface preserves useful open lines, such as calendar bindings and panel controls. Both variants are shown at 64px with their standard line weight.",
  },
  lettering: {
    groups: [
      {
        label: "File labels",
        pixels: 48,
        samples: [
          { Icon: PdfIcon, label: "PDF" },
          { Icon: CsvIcon, label: "CSV" },
          { Icon: ZipIcon, label: "ZIP" },
        ],
      },
      {
        label: "Timer numerals",
        pixels: 48,
        samples: [
          { Icon: Forward10Icon, label: "Forward 10" },
          { Icon: Replay10Icon, label: "Replay 10" },
        ],
      },
      {
        label: "Text controls",
        pixels: 48,
        samples: [
          { Icon: TextBoldIcon, label: "Bold" },
          { Icon: TextItalicsIcon, label: "Italics" },
        ],
      },
    ],
    caption:
      "Letters and numerals are vector contours from the shared lettering system. Compare their spacing, counters, and alignment within file labels, timers, and text controls. Shown at 48px with their standard line weight.",
  },
  cutouts: {
    groups: [
      {
        label: "Devices",
        samples: [
          { Icon: DevicesIcon, label: "Outline" },
          { Icon: DevicesSolidIcon, label: "Solid" },
        ],
        description:
          "The display's clearance follows the phone's painted edges and sharp outer corners.",
      },
      {
        label: "Tag clear",
        samples: [
          { Icon: TagClearIcon, label: "Outline" },
          { Icon: TagClearSolidIcon, label: "Solid" },
        ],
        description:
          "The empty buffer follows the X, including its cap corners.",
      },
      {
        label: "Cloud sync",
        samples: [
          { Icon: CloudSyncIcon, label: "Outline" },
          { Icon: CloudSyncSolidIcon, label: "Solid" },
        ],
        description:
          "The cloud clears the arrows without leaving narrow slivers.",
      },
    ],
    caption:
      "The foreground remains distinct from the background at the standard line weight. These 64px views expose curved offsets, diagonal cap corners, and overlapping clearances. Empty areas reveal the page background.",
  },
};

export function IconDesignExamples({ example }: IconDesignExamplesProps) {
  const { groups, caption } = figures[example];

  return (
    <figure className={styles.figure}>
      <div className={styles.groups}>
        {groups.map(({ label, samples, pixels = 64, description }) => {
          const style: CSSProperties & { "--saltIcon-size": string } = {
            "--saltIcon-size": `${pixels}px`,
          };
          return (
            <div className={styles.group} key={label}>
              <p className={styles.groupLabel}>{label}</p>
              <ul className={styles.samples}>
                {samples.map(({ Icon, label: iconLabel }) => (
                  <li className={styles.sample} key={iconLabel}>
                    <div className={styles.glyph}>
                      <Icon aria-hidden style={style} />
                    </div>
                    <span className={styles.label}>{iconLabel}</span>
                  </li>
                ))}
              </ul>
              {description ? (
                <p className={styles.description}>{description}</p>
              ) : null}
            </div>
          );
        })}
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
