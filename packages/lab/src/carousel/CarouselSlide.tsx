import {
  ElementType,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  useRef,
} from "react";
import { DeckItem } from "../layout/DeckItem";
import { makePrefixer, useAriaAnnouncer } from "@jpmorganchase/uitk-core";

import cx from "classnames";
import { ButtonBarProps } from "../buttonbar";

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
  ButtonBar?: ElementType<ButtonBarProps>;
  Media: ReactElement;
  description: string;
  index: number;
  title: string;
  contentAlignment: "center" | "left" | "right";
}

const withBaseName = makePrefixer("uitkCarouselSlide");

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide(
    { ButtonBar, Media, description, title, contentAlignment, index },
    ref
  ) {
    const buttonBarRef = useRef(null);
    const { announce } = useAriaAnnouncer();

    const renderSlideContent = () => (
      <DeckItem index={index}>
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
              />
            </div>
          )}
        </div>
      </DeckItem>
    );

    return renderSlideContent();
  }
);
