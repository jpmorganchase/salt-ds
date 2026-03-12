import { DocumentIcon, FolderClosedIcon, FolderOpenIcon } from "@salt-ds/icons";
import { Tree, TreeNode } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import "./tree-spacing.stories.css";

export default {
  title: "Lab/Tree/Spacing Examples",
  component: Tree,
  argTypes: {
    showDebug: {
      control: { type: "boolean" },
      name: "Show spacing overlay",
    },
  },
  args: {
    showDebug: true,
  },
} as Meta<typeof Tree>;

const COLORS = {
  spacing100: "rgba(52, 168, 83, 0.30)",
  spacing150: "rgba(251, 188, 4, 0.35)",
  fixed1200: "rgba(171, 71, 188, 0.35)",
  element: "rgba(0, 0, 0, 0.06)",
} as const;

interface OverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
  color: string;
}

interface SpacingConfig {
  gapColor: string;
  iconLabelColor?: string;
}

const UNIFORM_150: SpacingConfig = {
  gapColor: COLORS.spacing150,
};
const UNIFORM_FIXED: SpacingConfig = {
  gapColor: COLORS.fixed1200,
};
const MIXED_150: SpacingConfig = {
  gapColor: COLORS.spacing150,
  iconLabelColor: COLORS.spacing100,
};
const MIXED_FIXED: SpacingConfig = {
  gapColor: COLORS.fixed1200,
  iconLabelColor: COLORS.spacing100,
};

function buildRects(wrapEl: HTMLElement, config: SpacingConfig): OverlayRect[] {
  const rects: OverlayRect[] = [];
  const wrapRect = wrapEl.getBoundingClientRect();

  const triggers = wrapEl.querySelectorAll<HTMLSpanElement>(
    ".saltTreeNodeTrigger",
  );

  for (const trigger of triggers) {
    const tRect = trigger.getBoundingClientRect();
    const cs = getComputedStyle(trigger);
    const padLeft = Number.parseFloat(cs.paddingLeft);
    const padRight = Number.parseFloat(cs.paddingRight);
    const tTop = tRect.top - wrapRect.top;
    const tLeft = tRect.left - wrapRect.left;

    const li = trigger.closest<HTMLElement>(".saltTreeNode");
    const level = li
      ? Number.parseInt(
          li.style.getPropertyValue("--saltTreeNode-level") || "1",
          10,
        )
      : 1;

    if (padLeft > 0.5) {
      const firstChild = trigger.children[0] as HTMLElement | undefined;
      const elementW = firstChild
        ? firstChild.getBoundingClientRect().width
        : 0;
      const spacing100 = Number.parseFloat(
        cs.getPropertyValue("--salt-spacing-100"),
      );
      const baseGap = spacing100 || padLeft;

      if (level <= 1 || elementW < 0.5) {
        rects.push({
          top: tTop,
          left: tLeft,
          width: padLeft,
          height: tRect.height,
          color: COLORS.spacing100,
        });
      } else {
        const remaining = padLeft - baseGap;
        const indentStep = remaining / (level - 1);
        const variantGap = indentStep - elementW;
        let x = tLeft;

        rects.push({
          top: tTop,
          left: x,
          width: baseGap,
          height: tRect.height,
          color: COLORS.spacing100,
        });
        x += baseGap;

        for (let lvl = 0; lvl < level - 1; lvl++) {
          rects.push({
            top: tTop,
            left: x,
            width: elementW,
            height: tRect.height,
            color: COLORS.element,
          });
          x += elementW;
          rects.push({
            top: tTop,
            left: x,
            width: Math.max(variantGap, 0),
            height: tRect.height,
            color: config.gapColor,
          });
          x += variantGap;
        }
      }
    }

    const children = trigger.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      const childRect = child.getBoundingClientRect();
      const isLabel = child.classList.contains("saltTreeNodeLabel");

      if (!isLabel) {
        rects.push({
          top: tTop,
          left: childRect.left - wrapRect.left,
          width: childRect.width,
          height: tRect.height,
          color: COLORS.element,
        });
      }

      const next = children[i + 1] as HTMLElement | undefined;
      if (!next) continue;

      const nextRect = next.getBoundingClientRect();
      const gapLeft = childRect.right - wrapRect.left;
      const gapWidth = nextRect.left - childRect.right;

      if (gapWidth < 0.5) continue;

      const isIconBeforeLabel =
        (child.classList.contains("saltTreeNode-icon") ||
          child.classList.contains("saltIcon")) &&
        next.classList.contains("saltTreeNodeLabel");

      const color =
        isIconBeforeLabel && config.iconLabelColor
          ? config.iconLabelColor
          : config.gapColor;

      rects.push({
        top: tTop,
        left: gapLeft,
        width: gapWidth,
        height: tRect.height,
        color,
      });
    }

    if (padRight > 0.5) {
      rects.push({
        top: tTop,
        left: tRect.right - padRight - wrapRect.left,
        width: padRight,
        height: tRect.height,
        color: COLORS.spacing100,
      });
    }
  }

  return rects;
}

function DebugOverlay({
  children,
  config,
  legend,
  enabled = true,
}: {
  children: ReactNode;
  config: SpacingConfig;
  legend: { color: string; label: string }[];
  enabled?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [rects, setRects] = useState<OverlayRect[]>([]);

  const refresh = useCallback(() => {
    if (!wrapRef.current || !enabled) {
      setRects([]);
      return;
    }
    setRects(buildRects(wrapRef.current, config));
  }, [config, enabled]);

  useEffect(() => {
    refresh();
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(refresh);
    ro.observe(el);
    const mo = new MutationObserver(refresh);
    mo.observe(el, { childList: true, subtree: true, attributes: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [refresh]);

  return (
    <div>
      {enabled && (
        <div className="treeSpacingLegend">
          {legend.map((item) => (
            <span key={item.label}>
              <span
                className="treeSpacingLegend-swatch"
                style={{ background: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
      <div className="treeSpacingDebugWrap" ref={wrapRef}>
        {children}
        {enabled && (
          <div className="treeSpacingDebugOverlay">
            {rects.map((r) => {
              const key = `${r.top}-${r.left}-${r.width}`;
              return (
                <div
                  key={key}
                  className="treeSpacingDebugRect"
                  style={
                    {
                      top: r.top,
                      left: r.left,
                      width: r.width,
                      height: r.height,
                      background: r.color,
                    } as CSSProperties
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const DemoTree = ({
  className,
  multiselect,
  showIcons = true,
}: {
  className: string;
  multiselect?: boolean;
  showIcons?: boolean;
}) => {
  const [expanded, setExpanded] = useState([
    "documents",
    "reports",
    "pictures",
  ]);

  const folderIcon = (value: string) =>
    expanded.includes(value) ? FolderOpenIcon : FolderClosedIcon;

  return (
    <Tree
      aria-label="File browser"
      className={className}
      multiselect={multiselect}
      expanded={expanded}
      onExpandedChange={(_, next) => setExpanded(next)}
    >
      <TreeNode
        value="documents"
        label="Documents"
        icon={showIcons ? folderIcon("documents") : undefined}
      >
        <TreeNode
          value="reports"
          label="Reports"
          icon={showIcons ? folderIcon("reports") : undefined}
        >
          <TreeNode
            value="annual-report"
            label="Annual Report"
            icon={showIcons ? DocumentIcon : undefined}
          />
          <TreeNode
            value="quarterly-report"
            label="Quarterly Report"
            icon={showIcons ? DocumentIcon : undefined}
          />
        </TreeNode>
        <TreeNode
          value="invoices"
          label="Invoices"
          icon={showIcons ? folderIcon("invoices") : undefined}
        >
          <TreeNode
            value="invoice-001"
            label="Invoice 001"
            icon={showIcons ? DocumentIcon : undefined}
          />
          <TreeNode
            value="invoice-002"
            label="Invoice 002"
            icon={showIcons ? DocumentIcon : undefined}
          />
        </TreeNode>
      </TreeNode>
      <TreeNode
        value="pictures"
        label="Pictures"
        icon={showIcons ? folderIcon("pictures") : undefined}
      >
        <TreeNode
          value="vacation"
          label="Vacation"
          icon={showIcons ? folderIcon("vacation") : undefined}
        >
          <TreeNode
            value="beach"
            label="Beach"
            icon={showIcons ? DocumentIcon : undefined}
          />
          <TreeNode
            value="mountains"
            label="Mountains"
            icon={showIcons ? DocumentIcon : undefined}
          />
        </TreeNode>
      </TreeNode>
      <TreeNode
        value="downloads"
        label="Downloads"
        icon={showIcons ? FolderClosedIcon : undefined}
      />
    </Tree>
  );
};

const Column = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <div style={{ marginBottom: 8 }}>
      <strong>{label}</strong>
    </div>
    {children}
  </div>
);

export const UniformSpacing150: StoryFn<{ showDebug: boolean }> = ({
  showDebug,
}) => (
  <DebugOverlay
    config={UNIFORM_150}
    enabled={showDebug}
    legend={[
      { color: COLORS.spacing100, label: "spacing-100 (padding)" },
      { color: COLORS.spacing150, label: "spacing-150 (gap)" },
      {
        color: COLORS.element,
        label: "size-selectable (chevron / checkbox / icon)",
      },
    ]}
  >
    <div style={{ display: "flex", gap: 48 }}>
      <Column label="Single-select">
        <DemoTree className="treeSpacing150" />
      </Column>
      <Column label="Multi-select">
        <DemoTree className="treeSpacing150" multiselect />
      </Column>
      <Column label="No icons">
        <DemoTree className="treeSpacing150" showIcons={false} />
      </Column>
      <Column label="No icons (multi-select)">
        <DemoTree className="treeSpacing150" showIcons={false} multiselect />
      </Column>
    </div>
  </DebugOverlay>
);

export const UniformFixed1200: StoryFn<{ showDebug: boolean }> = ({
  showDebug,
}) => (
  <DebugOverlay
    config={UNIFORM_FIXED}
    enabled={showDebug}
    legend={[
      { color: COLORS.spacing100, label: "spacing-100 (padding)" },
      { color: COLORS.fixed1200, label: "fixed-1200 (gap)" },
      {
        color: COLORS.element,
        label: "size-selectable (chevron / checkbox / icon)",
      },
    ]}
  >
    <div style={{ display: "flex", gap: 48 }}>
      <Column label="Single-select">
        <DemoTree className="treeSpacingFixed1200" />
      </Column>
      <Column label="Multi-select">
        <DemoTree className="treeSpacingFixed1200" multiselect />
      </Column>
      <Column label="No icons">
        <DemoTree className="treeSpacingFixed1200" showIcons={false} />
      </Column>
      <Column label="No icons (multi-select)">
        <DemoTree
          className="treeSpacingFixed1200"
          showIcons={false}
          multiselect
        />
      </Column>
    </div>
  </DebugOverlay>
);

export const MixedSpacing150: StoryFn<{ showDebug: boolean }> = ({
  showDebug,
}) => (
  <DebugOverlay
    config={MIXED_150}
    enabled={showDebug}
    legend={[
      {
        color: COLORS.spacing100,
        label: "spacing-100 (padding / icon \u2192 label)",
      },
      { color: COLORS.spacing150, label: "spacing-150 (chevron / checkbox)" },
      {
        color: COLORS.element,
        label: "size-selectable (chevron / checkbox / icon)",
      },
    ]}
  >
    <div style={{ display: "flex", gap: 48 }}>
      <Column label="Single-select">
        <DemoTree className="treeSpacingMixed150" />
      </Column>
      <Column label="Multi-select">
        <DemoTree className="treeSpacingMixed150" multiselect />
      </Column>
      <Column label="No icons">
        <DemoTree className="treeSpacingMixed150" showIcons={false} />
      </Column>
      <Column label="No icons (multi-select)">
        <DemoTree
          className="treeSpacingMixed150"
          showIcons={false}
          multiselect
        />
      </Column>
    </div>
  </DebugOverlay>
);

export const MixedFixed1200: StoryFn<{ showDebug: boolean }> = ({
  showDebug,
}) => (
  <DebugOverlay
    config={MIXED_FIXED}
    enabled={showDebug}
    legend={[
      {
        color: COLORS.spacing100,
        label: "spacing-100 (padding / icon \u2192 label)",
      },
      { color: COLORS.fixed1200, label: "fixed-1200 (chevron / checkbox)" },
      {
        color: COLORS.element,
        label: "size-selectable (chevron / checkbox / icon)",
      },
    ]}
  >
    <div style={{ display: "flex", gap: 48 }}>
      <Column label="Single-select">
        <DemoTree className="treeSpacingMixedFixed1200" />
      </Column>
      <Column label="Multi-select">
        <DemoTree className="treeSpacingMixedFixed1200" multiselect />
      </Column>
      <Column label="No icons">
        <DemoTree className="treeSpacingMixedFixed1200" showIcons={false} />
      </Column>
      <Column label="No icons (multi-select)">
        <DemoTree
          className="treeSpacingMixedFixed1200"
          showIcons={false}
          multiselect
        />
      </Column>
    </div>
  </DebugOverlay>
);
