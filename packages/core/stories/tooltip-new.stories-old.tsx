import {
  Button,
  Tooltip,
  TooltipProps,
  useForkRef,
  // useTooltip,
  // UseTooltipProps,
} from "@jpmorganchase/uitk-core";
import { ComponentMeta, Story } from "@storybook/react";
import { useCallback } from "react";

export default {
  title: "Core/Tooltip",
  component: Tooltip,
} as ComponentMeta<typeof Tooltip>;

export const Default: Story<TooltipProps> = (props) => (
  <Tooltip title="I am a tooltip" status="success" placement="top" {...props}>
    <Button>Hover</Button>
  </Tooltip>
);

export const OpenTooltip: Story<TooltipProps> = (props) => (
  <Tooltip title="I am a tooltip" status="info" open={true} {...props}>
    <Button>Hover</Button>
  </Tooltip>
);

// export const ScrollTooltip: Story<TooltipProps & UseTooltipProps> = (
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
//       <Tooltip {...props}>
//         <Button>Hover</Button>
//       </Tooltip>
//     </div>
//   );
// };
// ScrollTooltip.args = {
//   title: "I am a tooltip",
//   open: true,
//   placement: "top",
// };

export const ErrorTooltip: Story<TooltipProps> = (props) => {
  const { status = "error", title = "We found an issue", ...rest } = props;

  return (
    <>
      <Tooltip status={status} title={title} {...rest}>
        <Button>Hover</Button>
      </Tooltip>
    </>
  );
};

export const WarningTooltip: Story<TooltipProps> = (props) => {
  const { status = "warning", title = "Are you sure?", ...rest } = props;

  return (
    <>
      <Tooltip status={status} title={title} {...rest}>
        <Button>Hover</Button>
      </Tooltip>
    </>
  );
};

export const SuccessTooltip: Story<TooltipProps> = (props) => {
  const { status = "success", title = "Well done!", ...rest } = props;

  return (
    <>
      <Tooltip status={status} title={title} {...rest}>
        <Button>Hover</Button>
      </Tooltip>
    </>
  );
};
