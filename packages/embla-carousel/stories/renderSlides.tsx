import { H3, Link, Text, useId } from "@salt-ds/core";
import { CarouselCard } from "@salt-ds/embla-carousel";

import carouselSlide1 from "@stories/assets/carouselSlide1.png";
import carouselSlide2 from "@stories/assets/carouselSlide2.png";
import carouselSlide3 from "@stories/assets/carouselSlide3.png";
import carouselSlide4 from "@stories/assets/carouselSlide4.png";

export const renderSlides = ({
  withActions,
  ...rest
}: {
  withActions?: boolean;
  role?: string;
  "aria-roledescription"?: string;
} = {}) => {
  const carouselId = useId();
  const content = [
    {
      title: "Your accounts, on the move",
      image: carouselSlide1,
      content: "Discover our latest personal accounts app for iOS.",
      link: "Open an account",
    },
    {
      title: "Preview your account information",
      image: carouselSlide2,
      content:
        "The new dashboard provides a complete overview of all your key account details.",
      link: "Go to dashboard",
    },
    {
      title: "Clear view of your cash positions",
      image: carouselSlide3,
      content:
        "Dedicated screen showing your positions, currencies and accounts.",
      link: "Learn more about views",
    },
    {
      title: "Redesigned accounts",
      image: carouselSlide4,
      content:
        "Simplified view of all your accounts, with search functionality across all transactions.",
      link: "Download app",
    },
  ];

  return content.map((slide, index) => {
    const cardId = `${carouselId}-card${index}`;
    return (
      <CarouselCard
        key={cardId}
        appearance="bordered"
        header={<H3 id={`${cardId}-title`}>{slide.title}</H3>}
        aria-labelledby={`${cardId}-title`}
        media={
          <img
            aria-hidden={true}
            className="carouselImagePlaceholder"
            src={slide.image}
          />
        }
        actions={withActions && <Link href="#">{slide.link}</Link>}
        {...rest}
      >
        <Text>{slide.content}</Text>
      </CarouselCard>
    );
  });
};
