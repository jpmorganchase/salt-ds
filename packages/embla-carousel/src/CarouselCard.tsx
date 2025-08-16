import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentProps, forwardRef, type ReactNode } from "react";
import saltCarouselCardCss from "./CarouselCard.css";
import { useCarouselContext } from "./CarouselContext";

const withBaseName = makePrefixer("saltCarouselCard");

/**
 * Props for the CarouselCard component.
 */
export interface CarouselCardProps extends ComponentProps<"div"> {
  /**
   * Actions to be displayed in the content footer.
   * This can include buttons or any other interactive elements.
   */
  actions?: ReactNode;

  /**
   * Media content to be displayed inside the slide.
   * This could include images, videos, etc., that are visually prominent.
   * It differs from children in that media is intended to be the main visual element of the slide.
   */
  media?: ReactNode;

  /**
   * The appearance of the slide. Options are 'bordered', and 'transparent'.
   * 'transparent' is the default value.
   **/
  appearance?: "bordered" | "transparent";

  /**
   * Header content to be displayed at the top of the slide.
   * This can be text or any other React node.
   */
  header?: ReactNode;

  /**
   * Carousel slide id.
   * This can be used to uniquely identify the slide.
   */
  id?: string;
}

export const CarouselCard = forwardRef<HTMLDivElement, CarouselCardProps>(
  function CarouselCard(
    { actions, appearance, children, className, header, media, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-card",
      css: saltCarouselCardCss,
      window: targetWindow,
    });

    const { ariaVariant } = useCarouselContext();

    return (
      <div
        aria-roledescription={ariaVariant === "tabpanel" ? "tab" : "slide"}
        className={clsx([withBaseName(), className])}
        ref={ref}
        role={ariaVariant}
        {...rest}
      >
        <div
          className={clsx(withBaseName("content"), {
            [withBaseName("bordered")]: appearance === "bordered",
          })}
        >
          {media}
          {children && (
            <div className={withBaseName("body")}>
              <div>{header}</div>
              <div>{children}</div>
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  },
);
