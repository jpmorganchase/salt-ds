import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type FlagSolidIconProps = IconProps;

export const FlagSolidIcon = forwardRef<SVGSVGElement, FlagSolidIconProps>(
  function FlagSolidIcon(props: FlagSolidIconProps, ref) {
    return (
      <Icon
        data-testid="FlagSolidIcon"
        aria-label="flag solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M5.148.129A7.468 7.468 0 0 0 3.754 0C2.8 0 2.133.07 1.75.21c-.375.142-.578.224-.61.247L1 .551V12h1V7.184c.117-.055.293-.114.512-.176.218-.07.636-.106 1.254-.106.437 0 .867.067 1.289.2.43.125.863.234 1.3.328.446.093.903.183 1.372.27.468.077.953.116 1.453.116.297 0 .578-.015.843-.046.266-.032.508-.06.727-.082.125-.016.34-.047.645-.094.312-.047.511-.078.605-.094V.504a18.81 18.81 0 0 1-.605.082A38.185 38.185 0 0 0 10 .75a7.645 7.645 0 0 1-.867.047 6.47 6.47 0 0 1-1.36-.14c-.43-.095-.859-.184-1.289-.27-.437-.094-.882-.18-1.336-.258Z" />
      </Icon>
    );
  }
);
