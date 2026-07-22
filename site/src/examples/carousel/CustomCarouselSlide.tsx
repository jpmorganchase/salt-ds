import {
  Avatar,
  type AvatarProps,
  FlexLayout,
  H2,
  StackLayout,
  useBreakpoint,
  useId,
} from "@salt-ds/core";
import {
  Carousel,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import styles from "./index.module.css";

type AvatarInfo = {
  name: string;
  color: AvatarProps["color"];
};

const avatars: AvatarInfo[] = [
  { name: "Alex Brown", color: "accent" },
  { name: "Priya Patel", color: "category-1" },
  { name: "Chen Wei", color: "category-2" },
  { name: "Maria Silva", color: "category-3" },
  { name: "Sam Taylor", color: "category-4" },
  { name: "Yuki Tanaka", color: "category-5" },
  { name: "Liam O'Neill", color: "category-6" },
  { name: "Fatima Khan", color: "category-7" },
  { name: "Noah Cohen", color: "category-8" },
  { name: "Ava Rossi", color: "category-9" },
  { name: "Diego Morales", color: "category-10" },
  { name: "Zara Ahmed", color: "category-11" },
  { name: "Ethan Clark", color: "category-12" },
  { name: "Sofia Novak", color: "category-13" },
  { name: "Kenji Sato", color: "category-14" },
];

export const CustomCarouselSlide = (): ReactElement => {
  const carouselId = useId();
  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1;
  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className={clsx(styles.carousel, {
        [styles.avatarCarousel]: !isMobile,
      })}
      emblaOptions={{ align: "start", slidesToScroll: "auto" }}
    >
      <H2 id={`${carouselId}-title`} className={styles.carouselHeading}>
        Carousel example with avatar as slides
      </H2>
      <StackLayout gap={1} direction="column-reverse">
        <FlexLayout gap={1} wrap={true} align={"center"}>
          <CarouselPreviousButton aria-label="Previous avatar group" />
          <CarouselNextButton aria-label="Next avatar group" />
          <CarouselProgressLabel />
        </FlexLayout>
        <CarouselSlides>
          {avatars.map((avatar, index) => {
            const slideId = `${carouselId}-slide${index}`;
            return (
              <div
                aria-label={avatar.name}
                role="group"
                aria-roledescription="slide"
                className={styles.avatarSlide}
                key={slideId}
              >
                <span className={styles.avatarSlideIndicator} aria-hidden>
                  <Avatar name={avatar.name} color={avatar.color} size={2} />
                </span>
              </div>
            );
          })}
        </CarouselSlides>
      </StackLayout>
    </Carousel>
  );
};
