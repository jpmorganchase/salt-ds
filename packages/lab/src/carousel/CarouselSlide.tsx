import {
  ElementType,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  useRef,
} from "react";
import { makePrefixer } from "@salt-ds/core";

import { clsx } from "clsx";
import { ButtonBarProps } from "../button-bar";

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
  ButtonBar?: ElementType<Partial<ButtonBarProps>>;
  Media: ReactElement;
  description?: string;
  title?: string;
  contentAlignment?: "center" | "left" | "right";
}

const withBaseName = makePrefixer("saltCarouselSlide");

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide(
    { ButtonBar, Media, description, title, contentAlignment },
    ref
  ) {
    const buttonBarRef = useRef(null);

    return (
      <div ref={ref}>
        {Media && <div className={withBaseName("mediaContainer")}>{Media}</div>}
        <div className={withBaseName("fixedContainer")} ref={buttonBarRef}>
          <div
            className={clsx({
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
              className={clsx({
                [withBaseName("buttonBarOverride")]:
                  contentAlignment === "center",
                [withBaseName("buttonBarOverrideLeft")]:
                  contentAlignment === "left",
              })}
            >
              <ButtonBar
                className={clsx({
                  [withBaseName("buttonBarContainer")]:
                    contentAlignment === "center",
                  [withBaseName("buttonBarContainerLeft")]:
                    contentAlignment === "left",
                })}
                stackAtBreakpoint={0}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);
