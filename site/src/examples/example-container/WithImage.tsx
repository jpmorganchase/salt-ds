import { ReactElement } from "react";
import { ExampleContainer } from "../../components/example-container";
import { Image } from "@jpmorganchase/mosaic-site-components";

export const WithImage = (): ReactElement => (
  <ExampleContainer type="positive">
    <Image
      src="/img/site/salt-close-up.jpg"
      alt="Close-up photo of some salt granules"
    />
  </ExampleContainer>
);
