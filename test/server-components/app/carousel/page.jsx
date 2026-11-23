import {
  Carousel,
  CarouselCard,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselSlides,
} from "@salt-ds/embla-carousel";

export default function CarouselPage() {
  return (
    <Carousel aria-label="Carousel">
      <CarouselPreviousButton />
      <CarouselNextButton />
      <CarouselSlides>
        <CarouselCard>First slide</CarouselCard>
        <CarouselCard>Second slide</CarouselCard>
      </CarouselSlides>
    </Carousel>
  );
}
