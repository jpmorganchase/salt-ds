import { makePrefixer, useForkRef, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSubMenuContext } from "./SubMenuContext";
import { useVerticalNavigationItem } from "./VerticalNavigationItem";
import verticalNavigationItemContentCss from "./VerticalNavigationItemContent.css";

export interface VerticalNavigationItemContentProps
  extends ComponentPropsWithoutRef<"span"> {}

const withBaseName = makePrefixer("saltVerticalNavigationItemContent");

export const VerticalNavigationItemContent = forwardRef<
  HTMLSpanElement,
  VerticalNavigationItemContentProps
>(function VerticalNavigationItemContent(props, ref) {
  const { children, className, style, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-item-content",
    css: verticalNavigationItemContentCss,
    window: targetWindow,
  });

  const containerRef = useRef<HTMLSpanElement>(null);
  const handleRef = useForkRef(ref, containerRef);

  const { active, focusVisible } = useVerticalNavigationItem();
  const { setDirectIcons, iconPaddingCount } = useSubMenuContext();
  const [hasIcon, setHasIcon] = useState(false);

  const iconId = useId();

  useEffect(() => {
    const checkForIcons = () => {
      const iconElement = containerRef.current?.querySelector<HTMLElement>(
        ".saltIcon:not(.saltVerticalNavigationItemExpansionIcon)",
      );

      setHasIcon(Boolean(iconElement));
      if (iconElement && iconId && setDirectIcons) {
        setDirectIcons((icons) => {
          if (!icons.includes(iconId)) {
            return icons.concat(iconId);
          }
          return icons;
        });
      } else if (!iconElement && iconId && setDirectIcons) {
        setDirectIcons((icons) => icons.filter((id) => id !== iconId));
      }
    };

    const mutationObserver = new MutationObserver(() => {
      checkForIcons();
    });
    checkForIcons();

    if (containerRef.current) {
      mutationObserver.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      mutationObserver.disconnect();
    };
  }, [iconId, setDirectIcons]);

  return (
    <span
      ref={handleRef}
      className={clsx(
        withBaseName(),
        {
          [withBaseName("active")]: active,
          [withBaseName("focused")]: focusVisible,
        },
        className,
      )}
      style={
        {
          "--saltVerticalNavigationItem-iconPaddingMultiplier": hasIcon
            ? iconPaddingCount - 1
            : iconPaddingCount,
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </span>
  );
});
