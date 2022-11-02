import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CsvSolidIconProps = IconProps;

export const CsvSolidIcon = forwardRef<SVGSVGElement, CsvSolidIconProps>(
  function CsvSolidIcon(props: CsvSolidIconProps, ref) {
    return (
      <Icon
        data-testid="CsvSolidIcon"
        aria-label="csv solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M1.893 7.677c.19-.086.403-.13.643-.13.202 0 .398.03.588.09.189.058.37.129.543.211l.287-.677a3.004 3.004 0 0 0-.677-.236 3.205 3.205 0 0 0-.738-.085c-.38 0-.719.063-1.015.188a1.99 1.99 0 0 0-.742.53 2.33 2.33 0 0 0-.458.813 3.27 3.27 0 0 0-.157 1.04c0 .517.082.968.246 1.353.166.385.417.683.752.895.337.212.761.318 1.272.318.27 0 .51-.018.717-.055.208-.036.413-.094.616-.174v-.697c-.215.07-.422.126-.623.167a3.08 3.08 0 0 1-.618.062c-.342 0-.625-.074-.848-.222a1.342 1.342 0 0 1-.499-.643 2.753 2.753 0 0 1-.164-1.001c0-.29.034-.55.103-.78.068-.232.167-.43.297-.59.13-.165.288-.29.475-.377Z" />
          <path d="M7.291 10.559c0 .296-.073.55-.219.765-.143.214-.35.378-.622.492-.269.114-.59.171-.964.171-.182 0-.356-.01-.523-.03a3.614 3.614 0 0 1-.471-.09 2.559 2.559 0 0 1-.4-.146v-.773c.203.089.43.17.68.243.25.07.506.106.766.106.212 0 .387-.028.526-.082a.66.66 0 0 0 .314-.24.654.654 0 0 0 .103-.365.594.594 0 0 0-.12-.376c-.08-.103-.2-.196-.362-.28a6.058 6.058 0 0 0-.602-.277 4.082 4.082 0 0 1-.471-.226 1.92 1.92 0 0 1-.397-.297 1.285 1.285 0 0 1-.277-.404 1.422 1.422 0 0 1-.099-.553c0-.283.068-.524.202-.725.137-.2.328-.354.574-.461.249-.107.538-.161.868-.161.262 0 .509.027.739.082.232.055.46.132.683.232l-.26.66a4.622 4.622 0 0 0-.598-.202 2.31 2.31 0 0 0-.588-.075c-.173 0-.32.026-.44.079a.617.617 0 0 0-.277.222.595.595 0 0 0-.093.335c0 .146.036.269.106.37.073.097.185.187.335.27.153.081.349.172.588.273.276.114.51.233.7.358.195.126.343.276.445.452.103.173.154.39.154.652Z" />
          <path d="M8.34 6.922H7.5l1.747 4.997h.868l1.746-4.997h-.84l-1.057 3.127a6.414 6.414 0 0 0-.102.335c-.037.13-.072.261-.106.393-.032.132-.057.25-.075.352a4.75 4.75 0 0 0-.079-.352 7.696 7.696 0 0 0-.106-.393c-.036-.13-.07-.24-.102-.331L8.34 6.922Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1 0h7.707L11 2.293V6H1V0Zm7 1H7v3h3V3H8V1Z"
          />
        </>
      </Icon>
    );
  }
);
