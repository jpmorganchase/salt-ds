import { H3, Link, Text, useId } from "@salt-ds/core";
import { CarouselCard } from "@salt-ds/embla-carousel";

import carouselSlide1 from "@stories/assets/carouselSlide1.png";
import carouselSlide2 from "@stories/assets/carouselSlide2.png";
import carouselSlide3 from "@stories/assets/carouselSlide3.png";
import carouselSlide4 from "@stories/assets/carouselSlide4.png";

export const renderSlides = ({
  withActions,
}: {
  withActions?: boolean;
} = {}) => {
  const content = [
    {
      title: "Your accounts. On the move",
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
    const slideId = useId();
    return (
      <CarouselCard
        key={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
        id={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
        appearance="bordered"
        header={<H3>{slide.title}</H3>}
        aria-label={`label for slide ${index + 1}`}
        media={
          <img
            className="carouselImagePlaceholder"
            alt="stock content to show carousel slide"
            src={slide.image}
          />
        }
        actions={withActions && <Link href="#">{slide.link}</Link>}
      >
        <Text>{slide.content}</Text>
      </CarouselCard>
    );
  });
};
