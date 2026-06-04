import { flip, limitShift, offset, shift, size } from "@floating-ui/react";
import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type CSSProperties,
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { MegaMenuBand } from "./MegaMenuBand";
import { MegaMenuGroups } from "./MegaMenuGroups";
import megaMenuPanelCss from "./MegaMenuPanel.css";
import { MegaMenuRegion } from "./MegaMenuRegion";
import { useMegaMenu } from "./useMegaMenu";

const withBaseName = makePrefixer("saltMegaMenuPanel");

/**
 * Assign each first-layer child to a grid area from its component type and
 * source order relative to `MegaMenuGroups`:
 * - `MegaMenuGroups` → the center cell.
 * - `MegaMenuRegion` → `left` when before groups, `right` when after.
 * - `MegaMenuBand`   → `top` when before groups, `bottom` when after.
 * Other children are left untouched (auto-placed). This lets authors position
 * content by source order alone, without wrapper scaffolding.
 */
function positionChildren(children: ReactNode): ReactNode {
  const childArray = Children.toArray(children);
  const groupsIndex = childArray.findIndex(
    (child) => isValidElement(child) && child.type === MegaMenuGroups,
  );

  if (groupsIndex === -1) {
    return children;
  }

  return childArray.map((child, index) => {
    if (!isValidElement(child)) return child;

    let gridArea: string | undefined;
    if (child.type === MegaMenuGroups) {
      gridArea = "center";
    } else if (child.type === MegaMenuRegion) {
      gridArea = index < groupsIndex ? "left" : "right";
    } else if (child.type === MegaMenuBand) {
      gridArea = index < groupsIndex ? "top" : "bottom";
    }

    if (!gridArea) return child;

    const element = child as ReactElement<{ style?: CSSProperties }>;
    return cloneElement(element, {
      style: { ...element.props.style, gridArea },
    });
  });
}

export interface MegaMenuPanelProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The content of the mega menu panel.
   */
  children?: ReactNode;
}

export const MegaMenuPanel = forwardRef<HTMLDivElement, MegaMenuPanelProps>(
  function MegaMenuPanel({ children, className, id: idProp, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-panel",
      css: megaMenuPanelCss,
      window: targetWindow,
    });

    const { Component: FloatingComponent } = useFloatingComponent();
    const {
      openState: isOpen,
      floatingRootContext,
      placement,
      getFloatingProps,
      setFloating,
      focusFirstItemOnOpen,
      setPanelId,
    } = useMegaMenu();

    const id = useId(idProp);

    // Register the panel id in context so the trigger can reference it via aria-controls.
    useEffect(() => {
      setPanelId(id);
      return () => setPanelId(undefined);
    }, [id, setPanelId]);

    // Resolve the panel's page-margin to a pixel value to override the margin as required.
    const [pageMargin, setPageMargin] = useState(0);
    useEffect(() => {
      if (!targetWindow) return;
      const referenceEl = floatingRootContext.elements.domReference as
        | HTMLElement
        | null
        | undefined;
      const host = referenceEl ?? targetWindow.document.body;
      const doc = targetWindow.document;
      const measure = () => {
        const probe = doc.createElement("div");
        probe.style.cssText =
          "position:absolute;visibility:hidden;pointer-events:none;width:var(--saltMegaMenuPanel-pageMargin, var(--salt-layout-page-margin));";
        host.appendChild(probe);
        const width = probe.getBoundingClientRect().width;
        probe.remove();
        setPageMargin((prev) => (prev === width ? prev : width));
      };
      measure();
      targetWindow.addEventListener("resize", measure);
      return () => targetWindow.removeEventListener("resize", measure);
    }, [targetWindow, floatingRootContext]);

    const floatingUIResult = useFloatingUI({
      rootContext: floatingRootContext,
      placement,
      middleware: [
        offset(1),
        flip({ padding: pageMargin }),
        shift({ padding: pageMargin, limiter: limitShift() }),
        size({
          padding: pageMargin,
          apply({ availableWidth, elements }) {
            elements.floating.style.setProperty(
              "--saltMegaMenuPanel-availableWidth",
              `${availableWidth}px`,
            );
          },
        }),
      ],
    });

    const floatingProps = getFloatingProps();

    return (
      <FloatingComponent
        open={isOpen}
        position={floatingUIResult.strategy}
        top={floatingUIResult.y ?? 0}
        left={floatingUIResult.x ?? 0}
        focusManagerProps={{
          context: floatingUIResult.context,
          modal: false,
          initialFocus: focusFirstItemOnOpen ? 0 : -1,
          returnFocus: true,
          closeOnFocusOut: false,
          guards: false,
        }}
        ref={setFloating}
      >
        <div
          className={clsx(withBaseName(), className)}
          id={id}
          role="region"
          ref={ref}
          {...floatingProps}
          {...rest}
        >
          {positionChildren(children)}
        </div>
      </FloatingComponent>
    );
  },
);
