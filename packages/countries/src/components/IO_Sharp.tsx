// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type IO_SharpProps = CountrySymbolProps;

const IO_Sharp = forwardRef<SVGSVGElement, IO_SharpProps>(function IO_Sharp(
  props: IO_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="IO_Sharp"
      aria-label="British Indian Ocean Territory (the)"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-IO-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-IO-a)`}>
        <path fill="#004692" d="M0 0h72v50H0z" />
        <path
          fill="#F5F7F8"
          d="M71.234-2.544c.772-.709 1.544-1.417 3.048-1.453a38.852 38.852 0 0 1 .062 5.09c-1.545.017-2.328.735-3.11 1.453C70.442 3.273 69.65 4 68.066 4c-1.583 0-2.375-.727-3.166-1.454-.792-.728-1.584-1.455-3.167-1.455-1.583 0-2.375.727-3.167 1.455C57.775 3.273 56.983 4 55.4 4c-1.584 0-2.375-.727-3.167-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.375.727-3.167 1.454C45.11 3.273 44.317 4 42.733 4c-1.583 0-2.375-.727-3.167-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.375.727-3.167 1.454C32.441 3.273 31.65 4 30.066 4c-1.583 0-2.374-.727-3.166-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.376.727-3.167 1.455C19.775 3.273 18.983 4 17.4 4c-1.584 0-2.375-.727-3.167-1.454-.792-.728-1.584-1.455-3.167-1.455-1.583 0-2.375.727-3.166 1.454C7.108 3.273 6.316 4 4.733 4 3.15 4 2.358 3.273 1.566 2.546.783 1.828 0 1.11-1.544 1.093a38.533 38.533 0 0 1 .062-5.09C.02-3.96.793-3.253 1.565-2.544c.793.726 1.585 1.453 3.168 1.453 1.583 0 2.375-.727 3.167-1.454C8.69-3.273 9.483-4 11.066-4s2.375.727 3.167 1.455c.791.727 1.583 1.454 3.167 1.454 1.583 0 2.375-.727 3.167-1.454C21.358-3.273 22.15-4 23.733-4c1.584 0 2.375.727 3.167 1.455.792.727 1.583 1.454 3.166 1.454s2.375-.727 3.167-1.454C34.024-3.273 34.816-4 36.399-4c1.584 0 2.376.727 3.167 1.455.792.727 1.584 1.454 3.167 1.454 1.584 0 2.375-.727 3.167-1.454C46.692-3.273 47.483-4 49.066-4c1.584 0 2.375.727 3.167 1.455.792.727 1.583 1.454 3.167 1.454 1.583 0 2.374-.727 3.166-1.454C59.358-3.273 60.15-4 61.733-4c1.583 0 2.375.727 3.167 1.455.791.727 1.583 1.454 3.166 1.454 1.584 0 2.376-.727 3.168-1.453Zm0 30c.772-.709 1.544-1.417 3.048-1.453a38.85 38.85 0 0 1 .062 5.09c-1.545.017-2.328.735-3.11 1.453-.792.727-1.584 1.454-3.168 1.454-1.583 0-2.375-.727-3.166-1.454-.792-.728-1.584-1.455-3.167-1.455-1.583 0-2.375.727-3.167 1.454C57.775 33.273 56.983 34 55.4 34c-1.584 0-2.375-.727-3.167-1.455-.791-.727-1.583-1.454-3.166-1.454-1.584 0-2.375.727-3.167 1.454-.791.728-1.583 1.455-3.167 1.455-1.583 0-2.375-.727-3.167-1.455-.791-.727-1.583-1.454-3.166-1.454-1.584 0-2.375.727-3.167 1.454-.792.728-1.583 1.455-3.167 1.455-1.583 0-2.374-.727-3.166-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.376.727-3.167 1.454C19.775 33.273 18.983 34 17.4 34c-1.584 0-2.375-.727-3.167-1.455-.792-.727-1.584-1.454-3.167-1.454-1.583 0-2.375.727-3.166 1.454C7.108 33.273 6.316 34 4.733 34c-1.583 0-2.375-.727-3.167-1.454-.783-.718-1.565-1.436-3.11-1.453a38.53 38.53 0 0 1 .062-5.09c1.503.036 2.275.744 3.047 1.453.793.727 1.585 1.453 3.168 1.453 1.583 0 2.375-.727 3.167-1.454C8.69 26.727 9.483 26 11.066 26s2.375.727 3.167 1.455c.791.727 1.583 1.454 3.167 1.454 1.583 0 2.375-.727 3.167-1.454.791-.728 1.583-1.455 3.166-1.455 1.584 0 2.375.727 3.167 1.455.792.727 1.583 1.454 3.166 1.454s2.375-.727 3.167-1.454c.791-.728 1.583-1.455 3.166-1.455 1.584 0 2.376.727 3.167 1.455.792.727 1.584 1.454 3.167 1.454 1.584 0 2.375-.727 3.167-1.454.792-.728 1.583-1.455 3.166-1.455 1.584 0 2.375.727 3.167 1.455.792.727 1.583 1.454 3.167 1.454 1.583 0 2.374-.727 3.166-1.454.792-.728 1.583-1.455 3.167-1.455 1.583 0 2.375.727 3.167 1.455.791.727 1.583 1.454 3.166 1.454 1.584 0 2.376-.727 3.168-1.453Zm3.048 8.547c-1.504.036-2.276.744-3.048 1.453-.792.726-1.584 1.453-3.168 1.453-1.583 0-2.375-.727-3.166-1.454-.792-.728-1.584-1.455-3.167-1.455-1.584 0-2.375.727-3.167 1.455-.792.727-1.583 1.454-3.166 1.454-1.584 0-2.375-.727-3.167-1.454C51.441 36.727 50.65 36 49.067 36c-1.584 0-2.375.727-3.167 1.455-.792.727-1.584 1.454-3.167 1.454-1.583 0-2.375-.727-3.167-1.454C38.775 36.727 37.983 36 36.4 36s-2.375.727-3.166 1.455c-.792.727-1.584 1.454-3.167 1.454-1.583 0-2.374-.727-3.166-1.454C26.11 36.727 25.317 36 23.733 36c-1.583 0-2.375.727-3.166 1.455-.792.727-1.584 1.454-3.167 1.454-1.584 0-2.376-.727-3.167-1.454C13.44 36.727 12.649 36 11.066 36c-1.583 0-2.375.727-3.166 1.455-.792.727-1.584 1.454-3.167 1.454-1.583 0-2.375-.727-3.168-1.453-.772-.709-1.544-1.417-3.047-1.453a38.935 38.935 0 0 0-.062 5.09c1.545.017 2.327.735 3.11 1.453C2.358 43.273 3.15 44 4.733 44c1.583 0 2.375-.727 3.167-1.455.791-.727 1.583-1.454 3.166-1.454s2.375.727 3.167 1.454C15.025 43.273 15.816 44 17.4 44c1.583 0 2.375-.727 3.167-1.455.791-.727 1.583-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.455.792.727 1.583 1.454 3.166 1.454 1.584 0 2.375-.727 3.167-1.455.792-.727 1.583-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.454.792.728 1.584 1.455 3.167 1.455 1.584 0 2.376-.727 3.167-1.455.792-.727 1.584-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.454.792.728 1.584 1.455 3.167 1.455 1.583 0 2.375-.727 3.166-1.455.792-.727 1.584-1.454 3.167-1.454 1.583 0 2.375.727 3.167 1.455.791.727 1.583 1.454 3.166 1.454 1.584 0 2.376-.727 3.168-1.454.782-.718 1.565-1.436 3.11-1.453a38.85 38.85 0 0 0-.062-5.09ZM71.234 7.456c.772-.709 1.544-1.417 3.048-1.453a38.852 38.852 0 0 1 .062 5.09c-1.545.017-2.328.735-3.11 1.453-.792.727-1.584 1.454-3.168 1.454-1.583 0-2.375-.727-3.166-1.454-.792-.728-1.584-1.455-3.167-1.455-1.583 0-2.375.727-3.167 1.455C57.775 13.273 56.983 14 55.4 14c-1.584 0-2.375-.727-3.167-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.375.727-3.167 1.454-.791.728-1.583 1.455-3.167 1.455-1.583 0-2.375-.727-3.167-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.375.727-3.167 1.455-.792.727-1.583 1.454-3.167 1.454-1.583 0-2.374-.727-3.166-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.376.727-3.167 1.455C19.775 13.273 18.983 14 17.4 14c-1.584 0-2.375-.727-3.167-1.454-.792-.728-1.584-1.455-3.167-1.455-1.583 0-2.375.727-3.166 1.454C7.108 13.273 6.316 14 4.733 14c-1.583 0-2.375-.727-3.167-1.454-.783-.718-1.565-1.436-3.11-1.454a38.531 38.531 0 0 1 .062-5.089C.02 6.04.793 6.747 1.565 7.456c.793.726 1.585 1.453 3.168 1.453 1.583 0 2.375-.727 3.167-1.454C8.69 6.727 9.483 6 11.066 6s2.375.727 3.167 1.455c.791.727 1.583 1.454 3.167 1.454 1.583 0 2.375-.727 3.167-1.454C21.358 6.727 22.15 6 23.733 6c1.584 0 2.375.727 3.167 1.455.792.727 1.583 1.454 3.166 1.454s2.375-.727 3.167-1.454C34.024 6.727 34.816 6 36.399 6c1.584 0 2.376.727 3.167 1.455.792.727 1.584 1.454 3.167 1.454 1.584 0 2.375-.727 3.167-1.454C46.692 6.727 47.483 6 49.066 6c1.584 0 2.375.727 3.167 1.455.792.727 1.583 1.454 3.167 1.454 1.583 0 2.374-.727 3.166-1.454C59.358 6.727 60.15 6 61.733 6c1.583 0 2.375.727 3.167 1.455.791.727 1.583 1.454 3.166 1.454 1.584 0 2.376-.727 3.168-1.453Zm3.048 38.547c-1.504.036-2.276.744-3.048 1.453-.792.726-1.584 1.453-3.168 1.453-1.583 0-2.375-.727-3.166-1.454-.792-.728-1.584-1.455-3.167-1.455-1.584 0-2.375.727-3.167 1.455-.792.727-1.583 1.454-3.166 1.454-1.584 0-2.375-.727-3.167-1.454C51.441 46.727 50.65 46 49.067 46c-1.584 0-2.375.727-3.167 1.455-.792.727-1.584 1.454-3.167 1.454-1.583 0-2.375-.727-3.167-1.454C38.775 46.727 37.983 46 36.4 46s-2.375.727-3.166 1.455c-.792.727-1.584 1.454-3.167 1.454-1.583 0-2.374-.727-3.166-1.454C26.11 46.727 25.317 46 23.733 46c-1.583 0-2.375.727-3.166 1.455-.792.727-1.584 1.454-3.167 1.454-1.584 0-2.376-.727-3.167-1.454C13.44 46.727 12.649 46 11.066 46c-1.583 0-2.375.727-3.166 1.455-.792.727-1.584 1.454-3.167 1.454-1.583 0-2.375-.727-3.168-1.453-.772-.709-1.544-1.417-3.047-1.453a38.935 38.935 0 0 0-.062 5.09c1.545.017 2.327.735 3.11 1.453C2.358 53.273 3.15 54 4.733 54c1.583 0 2.375-.727 3.167-1.455.791-.727 1.583-1.454 3.166-1.454s2.375.727 3.167 1.454C15.025 53.273 15.816 54 17.4 54c1.583 0 2.375-.727 3.167-1.455.791-.727 1.583-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.455.792.727 1.583 1.454 3.166 1.454 1.584 0 2.375-.727 3.167-1.455.792-.727 1.583-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.454.792.728 1.584 1.455 3.167 1.455 1.584 0 2.376-.727 3.167-1.455.792-.727 1.584-1.454 3.167-1.454 1.583 0 2.375.727 3.166 1.454.792.728 1.584 1.455 3.167 1.455 1.583 0 2.375-.727 3.166-1.455.792-.727 1.584-1.454 3.167-1.454 1.583 0 2.375.727 3.167 1.455.791.727 1.583 1.454 3.166 1.454 1.584 0 2.376-.727 3.168-1.454.782-.718 1.565-1.436 3.11-1.453a38.85 38.85 0 0 0-.062-5.09Zm-3.048-28.547c.772-.709 1.544-1.417 3.048-1.453a38.85 38.85 0 0 1 .062 5.09c-1.545.017-2.328.735-3.11 1.453-.792.727-1.584 1.454-3.168 1.454-1.583 0-2.375-.727-3.166-1.454-.792-.728-1.584-1.455-3.167-1.455-1.583 0-2.375.727-3.167 1.454C57.775 23.274 56.983 24 55.4 24c-1.584 0-2.375-.727-3.167-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.375.727-3.167 1.454-.791.728-1.583 1.455-3.167 1.455-1.583 0-2.375-.727-3.167-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.375.727-3.167 1.454-.792.728-1.583 1.455-3.167 1.455-1.583 0-2.374-.727-3.166-1.454-.791-.728-1.583-1.455-3.166-1.455-1.584 0-2.376.727-3.167 1.454C19.775 23.274 18.983 24 17.4 24c-1.584 0-2.375-.727-3.167-1.454-.792-.728-1.584-1.455-3.167-1.455-1.583 0-2.375.727-3.166 1.454C7.108 23.273 6.316 24 4.733 24c-1.583 0-2.375-.727-3.167-1.454-.783-.718-1.565-1.436-3.11-1.453a38.53 38.53 0 0 1 .062-5.09c1.503.036 2.275.744 3.047 1.453.793.727 1.585 1.453 3.168 1.453 1.583 0 2.375-.727 3.167-1.454C8.69 16.727 9.483 16 11.066 16s2.375.727 3.167 1.455c.791.727 1.583 1.454 3.167 1.454 1.583 0 2.375-.727 3.167-1.454.791-.728 1.583-1.455 3.166-1.455 1.584 0 2.375.727 3.167 1.455.792.727 1.583 1.454 3.166 1.454s2.375-.727 3.167-1.454c.791-.728 1.583-1.455 3.166-1.455 1.584 0 2.376.727 3.167 1.455.792.727 1.584 1.454 3.167 1.454 1.584 0 2.375-.727 3.167-1.454.792-.728 1.583-1.455 3.166-1.455 1.584 0 2.375.727 3.167 1.455.792.727 1.583 1.454 3.167 1.454 1.583 0 2.374-.727 3.166-1.454.792-.728 1.583-1.455 3.167-1.455 1.583 0 2.375.727 3.167 1.455.791.727 1.583 1.454 3.166 1.454 1.584 0 2.376-.727 3.168-1.453Z"
        />
        <mask
          id={`${uid}-IO-b`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#002F6C" d="M0 30V0h36v30H0Z" />
        </mask>
        <g mask={`url(#${uid}-IO-b)`}>
          <path fill="#004692" d="M0 0h36v36H0z" />
          <path
            fill="#F5F7F8"
            d="m12.79 1.005-2.12 2.12 26.197 26.198 2.12-2.121L12.792 1.005ZM7.134 6.661l-3.536 3.536 26.197 26.197 3.536-3.535L7.134 6.66Z"
          />
          <path
            fill="#DD2033"
            d="m7.134 6.661 3.535-3.535 26.198 26.197-3.536 3.535L7.134 6.662Z"
          />
          <path fill="#F5F7F8" d="M6 35h4.002V9H36V5H6v30Z" />
          <path fill="#DD2033" d="M0 35h6.002V5h30V0H0v35Z" />
        </g>
        <path
          fill="#F5F7F8"
          d="M56.217 20.378v2.988h.142v1.5h2.286v3.84c2.59.463 4.572 2.698 4.572 5.41a5.446 5.446 0 0 1-1.524 3.78v2.47h-5.476v8h-4v-8H46.74v-2.47a5.446 5.446 0 0 1-1.523-3.78c0-2.712 1.981-4.947 4.571-5.41v-3.84h2.286v-1.5h.143v-2.988l-2.566 2.11.015-6.008L44 15.17l4.553-3.704-2.545-5.383 5.677 1.346L54.218 2l2.53 5.429 5.678-1.346-2.545 5.383 4.553 3.704-5.666 1.31.015 6.009-2.565-2.111Z"
        />
        <path fill="#936846" d="M53.217 16.366h2v31h-2z" />
        <path
          fill="#F1B434"
          fillRule="evenodd"
          d="M53.074 24.366h2.285v1.5h2.286v2.25H55.36v2.103a4.606 4.606 0 0 1 2.286-.603c2.525 0 4.572 2.015 4.572 4.5 0 1.333-.589 2.53-1.524 3.355v1.896H47.74V37.47a4.459 4.459 0 0 1-1.523-3.354c0-2.486 2.046-4.5 4.571-4.5.833 0 1.613.219 2.286.601v-2.102h-2.286v-2.25h2.286v-1.5Zm1.143 6.774-.022-.024h.043l-.021.024Zm-.022 5.977.022-.024.02.023h-.042Z"
          clipRule="evenodd"
        />
        <path
          fill="#009B77"
          d="m54.217 4.366 1.968 4.224 4.447-1.054-1.991 4.212 3.576 2.908-4.453 1.03.013 4.68-3.56-2.928-3.56 2.928.012-4.68-4.452-1.03 3.575-2.908-1.99-4.212 4.446 1.054 1.969-4.224Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default IO_Sharp;
