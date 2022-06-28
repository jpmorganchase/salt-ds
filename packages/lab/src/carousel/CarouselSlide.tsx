import {
  ElementType,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  useRef,
} from "react";
import { makePrefixer, useAriaAnnouncer } from "@jpmorganchase/uitk-core";

import cx from "classnames";
import { ButtonBar, ButtonBarProps } from "../buttonbar";

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
  ButtonBar?: ElementType<Partial<ButtonBarProps>>;
  Media: ReactElement;
  description: string;
  title: string;
  contentAlignment: "center" | "left" | "right";
}

const withBaseName = makePrefixer("uitkCarouselSlide");

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide(
    { ButtonBar, Media, description, title, contentAlignment },
    ref
  ) {
    const buttonBarRef = useRef(null);
    const { announce } = useAriaAnnouncer();

    const renderSlideContent = () => (
      <div ref={ref}>
        {Media && <div className={withBaseName("mediaContainer")}>{Media}</div>}
        <div className={withBaseName("fixedContainer")} ref={buttonBarRef}>
          <div
            className={cx({
              [withBaseName("textContainer")]: contentAlignment === "center",
              [withBaseName("textContainerLeft")]: contentAlignment === "left",
            })}
          >
            {title && (
              <div
                aria-level={1}
                className={withBaseName("titleContainer")}
                role="heading"
              >
                {title}
              </div>
            )}
            {description && (
              <div className={withBaseName("descriptionContainer")}>
                {description}
              </div>
            )}
          </div>
          {ButtonBar && (
            <div
              className={cx({
                [withBaseName("buttonBarOverride")]:
                  contentAlignment === "center",
                [withBaseName("buttonBarOverrideLeft")]:
                  contentAlignment === "left",
              })}
            >
              <ButtonBar
                className={cx({
                  [withBaseName("buttonBarContainer")]:
                    contentAlignment === "center",
                  [withBaseName("buttonBarContainerLeft")]:
                    contentAlignment === "left",
                })}
                stackAtBreakpoint={0}
              ></ButtonBar>
            </div>
          )}
        </div>
      </div>
    );

    return renderSlideContent();
  }
);
