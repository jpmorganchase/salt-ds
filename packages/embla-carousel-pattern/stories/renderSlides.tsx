import { H3, Link, Text } from "@salt-ds/core";
import { CarouselCard } from "@salt-ds/embla-carousel-pattern";

import carouselSlide1 from "@stories/assets/carouselSlide1.png";
import carouselSlide2 from "@stories/assets/carouselSlide2.png";
import carouselSlide3 from "@stories/assets/carouselSlide3.png";
import carouselSlide4 from "@stories/assets/carouselSlide4.png";

export const renderSlides = ({
  withActions,
}: { withActions?: boolean } = {}) => {
  const content = [
    {
      headerId: 0,
      title: "Your accounts. On the move",
      image: carouselSlide1,
      content: "Discover our latest personal accounts app for iOS.",
      link: "Open an account",
    },
    {
      headerId: 1,
      title: "Preview your account information",
      image: carouselSlide2,
      content:
        "The new dashboard provides a complete overview of all your key account details.",
      link: "Go to dashboard",
    },
    {
      headerId: 2,
      title: "Clear view of your cash positions",
      image: carouselSlide3,
      content:
        "Dedicated screen showing your positions, currencies and accounts.",
      link: "Learn more about views",
    },
    {
      headerId: 3,
      title: "Redesigned accounts",
      image: carouselSlide4,
      content:
        "Simplified view of all your accounts, with search functionality across all transactions.",
      link: "Download app",
    },
  ];

  return content.map((slide, index) => (
    <CarouselCard
      key={slide.title}
      appearance="bordered"
      header={<H3 id={`slide-title-${slide.headerId}`}>{slide.title}</H3>}
      aria-labelledby={`slide-title-${slide.headerId}`}
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
  ));
};
