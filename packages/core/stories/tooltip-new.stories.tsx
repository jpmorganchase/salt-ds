import {
  Button,
  TooltipNew,
  TooltipNewProps,
  useForkRef,
  useTooltip,
  UseTooltipProps,
} from "@jpmorganchase/uitk-core";
import { ComponentMeta, Story } from "@storybook/react";
import { useCallback } from "react";

export default {
  title: "Core/TooltipNew",
  component: TooltipNew,
} as ComponentMeta<typeof TooltipNew>;

export const Default: Story<TooltipNewProps & UseTooltipProps> = (props) => (
  <TooltipNew
    title="I am a tooltip"
    status="success"
    placement="top"
    {...props}
  >
    <Button>Hover</Button>
  </TooltipNew>
);

export const OpenTooltip: Story<TooltipNewProps & UseTooltipProps> = (
  props
) => (
  <TooltipNew title="I am a tooltip" status="info" open={true} {...props}>
    <Button>Hover</Button>
  </TooltipNew>
);

// export const ScrollTooltip: Story<TooltipNewProps & UseTooltipProps> = (
//   props
// ) => {
//   // const handleScrollButton = useCallback((node: HTMLButtonElement | null) => {
//   //   node?.scrollIntoView({ block: "center", inline: "center" });
//   // }, []);

//   // const handleButtonRef = useForkRef(handleScrollButton, ref);

//   return (
//     <div
//       style={{
//         maxHeight: "100%",
//         height: "300vh",
//         maxWidth: "100%",
//         width: "300vw",
//       }}
//     >
//       <TooltipNew {...props}>
//         <Button>Hover</Button>
//       </TooltipNew>
//     </div>
//   );
// };
// ScrollTooltip.args = {
//   title: "I am a tooltip",
//   open: true,
//   placement: "top",
// };

export const ErrorTooltip: Story<TooltipNewProps & UseTooltipProps> = (
  props
) => {
  const { status = "error", title = "We found an issue", ...rest } = props;

  return (
    <>
      <TooltipNew status={status} title={title} {...rest}>
        <Button>Hover</Button>
      </TooltipNew>
    </>
  );
};

export const WarningTooltip: Story<TooltipNewProps & UseTooltipProps> = (
  props
) => {
  const { status = "warning", title = "Are you sure?", ...rest } = props;

  return (
    <>
      <TooltipNew status={status} title={title} {...rest}>
        <Button>Hover</Button>
      </TooltipNew>
    </>
  );
};

export const SuccessTooltip: Story<TooltipNewProps & UseTooltipProps> = (
  props
) => {
  const { status = "success", title = "Well done!", ...rest } = props;

  return (
    <>
      <TooltipNew status={status} title={title} {...rest}>
        <Button>Hover</Button>
      </TooltipNew>
    </>
  );
};
