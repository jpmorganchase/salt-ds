import { Meta, Story } from "@storybook/react";
import { OverflowLayoutContainer } from "@jpmorganchase/uitk-lab";
import { AdjustableFlexbox } from "./story-components";

export default {
  title: "Lab/Responsive",
} as Meta;

// const ComponentWithOverflow = () => {
//   const [ref] = useOverflowObserver();
//   return <div ref={ref}>I Overflow</div>;
// };

const block = {
  alignItems: "center",
  display: "inline-flex",
  flexDirection: "column",
  fontSize: 12,
  height: 50,
  justifyContent: "center",
};
const blockSmall = {
  ...block,
  backgroundColor: "green",
  color: "white",
  width: 60,
} as any;
const blockMedium = {
  ...block,
  backgroundColor: "red",
  color: "white",
  width: 80,
} as any;
const blockLarge = {
  ...block,
  backgroundColor: "brown",
  color: "white",
  width: 100,
} as any;

// export const DefaultBehaviour: Story = ({ initialWidth = 400 }) => {
//   return (
//     <AdjustableFlexbox height={200} width={initialWidth}>
//       <div style={{ backgroundColor: "yellow", height: 50 }}>
//         <OverflowLayoutContainer label={"Example"}>
//           <span style={blockSmall} data-priority={3}>
//             block 1
//           </span>
//           <span style={blockMedium}>block 2</span>
//           <span style={blockSmall}>block 3</span>
//           <span style={blockLarge}>block 4</span>
//         </OverflowLayoutContainer>
//       </div>
//     </AdjustableFlexbox>
//   );
// };
