import {
  FloatingList,
  flip,
  limitShift,
  shift,
  size,
} from "@floating-ui/react";
import {
  makePrefixer,
  useFloatingComponent,
  useFloatingUI,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type FocusEvent,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import megaMenuContainerCss from "./MegaMenuContainer.css";
import { MegaMenuContext } from "./MegaMenuContext";
import { useMegaMenuFocusManagement } from "./useMegaMenuFocusManagement";
import { useMegaMenuKeyboardNavigation } from "./useMegaMenuKeyboardNavigation";
import { useMegaMenuListNavigation } from "./useMegaMenuListNavigation";

const withBaseName = makePrefixer("saltMegaMenuContainer");
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

export interface MegaMenuContainerProps extends HTMLAttributes<HTMLElement> {
  /**
   * The content of the mega menu container, typically MegaMenuHeader, MegaMenuGroup, and MegaMenuItem components.
   */
  children?: ReactNode;
}

export const MegaMenuContainer = forwardRef<
  HTMLElement,
  MegaMenuContainerProps
>(function MegaMenuContainer({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-mega-menu-container",
    css: megaMenuContainerCss,
    window: targetWindow,
  });

  const { Component: FloatingComponent } = useFloatingComponent();
  const megaMenu = useContext(MegaMenuContext);

  if (!megaMenu) {
    throw new Error("MegaMenuContainer must be used within a MegaMenu");
  }

  const floatingUIResult = useFloatingUI({
    rootContext: megaMenu.floatingRootContext,
    placement: megaMenu.placement,
    middleware: [
      flip(),
      shift({ limiter: limitShift() }),
      size({
        apply({ availableWidth, elements }) {
          elements.floating.style.setProperty(
            "--saltMegaMenuContainer-availableWidth",
            `${availableWidth}px`,
          );
        },
      }),
    ],
  });

  const handleRef = useForkRef<HTMLElement>(ref, megaMenu.setFloating);

  const isOpen = megaMenu.openState;
  const { menuRegionId } = megaMenu;
  const { requestFocusFirstItemOnOpen, setRequestFocusFirstItemOnOpen } =
    megaMenu;
  const floatingProps = megaMenu.getFloatingProps;
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const {
    focusFirstFocusableInMenu,
    focusReference,
    closeAndFocusNextAfterReference,
  } = useMegaMenuFocusManagement({
    reference: megaMenu.floatingRootContext.elements
      .reference as HTMLElement | null,
    floating: megaMenu.floatingRootContext.elements
      .floating as HTMLElement | null,
  });

  const { getListNavigationFloatingProps } = useMegaMenuListNavigation({
    context: floatingUIResult.context,
    elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    isEnabled: isOpen,
  });

  const { handleContainerKeyDown } = useMegaMenuKeyboardNavigation({
    isOpen,
    reference: megaMenu.floatingRootContext.elements
      .reference as HTMLElement | null,
    floating: megaMenu.floatingRootContext.elements
      .floating as HTMLElement | null,
    elementsRef,
    onFocusReference: focusReference,
    onCloseAndFocusNext: (container: HTMLElement) =>
      closeAndFocusNextAfterReference(container, megaMenu.setOpen),
  });

  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      elementsRef.current = [];
      setActiveIndex(null);
      return;
    }

    const floating = megaMenu.floatingRootContext.elements
      .floating as HTMLElement | null;
    if (!floating) return;

    if (elementsRef.current.length === 0) {
      elementsRef.current = getFocusableElements(floating);
    }

    if (requestFocusFirstItemOnOpen) {
      setRequestFocusFirstItemOnOpen(false);
      focusFirstFocusableInMenu(elementsRef);
    }
  }, [
    isOpen,
    megaMenu.floatingRootContext.elements.floating,
    requestFocusFirstItemOnOpen,
    setRequestFocusFirstItemOnOpen,
    focusFirstFocusableInMenu,
  ]);

  const handleFocus = useCallback((event: FocusEvent<HTMLElement>) => {
    const index = elementsRef.current.indexOf(event.target as HTMLElement);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, []);

  const floatingInteractionProps = getListNavigationFloatingProps(
    floatingProps({
      ...rest,
      onKeyDown: handleContainerKeyDown,
      onFocus: handleFocus,
      style: {
        ...rest.style,
        position: floatingUIResult.strategy,
        top: floatingUIResult.y ?? 0,
        left: floatingUIResult.x ?? 0,
      },
    }),
  );
  const {
    id: floatingId,
    "aria-orientation": _ariaOrientation,
    ...floatingPropsWithoutAriaOrientation
  } = floatingInteractionProps;
  const menuContainerId =
    typeof rest.id === "string"
      ? rest.id
      : typeof floatingId === "string"
        ? floatingId
        : menuRegionId;

  return (
    <FloatingComponent
      open={isOpen}
      focusManagerProps={{
        context: floatingUIResult.context,
        modal: false,
        initialFocus: -1,
        returnFocus: false,
        closeOnFocusOut: false,
        guards: false,
      }}
    >
      <nav
        className={clsx(withBaseName(), className)}
        ref={handleRef}
        id={menuContainerId}
        {...floatingPropsWithoutAriaOrientation}
      >
        <FloatingList elementsRef={elementsRef}>{children}</FloatingList>
      </nav>
    </FloatingComponent>
  );
});
