import { Link } from "@salt-ds/core";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import { StackoverflowIcon } from "@salt-ds/icons";

export default {
  title: "Core/Link",
  component: Link,
} as ComponentMeta<typeof Link>;

export const Default: ComponentStory<typeof Link> = () => {
  return <Link href="https://www.google.com">Link to URL</Link>;
};

export const TargetBlank: ComponentStory<typeof Link> = () => {
  return (
    <Link href="https://www.google.com" target="_blank">
      Link to URL
    </Link>
  );
};

export const TargetBlankCustomIcon: ComponentStory<typeof Link> = () => {
  return (
    <Link
      IconComponent={StackoverflowIcon}
      href="https://www.google.com"
      target="_blank"
    >
      Link to URL
    </Link>
  );
};

// export const WithTooltip: ComponentStory<typeof Link> = () => {
//   return (
//     <div style={{ width: 50 }}>
//       <Link
//         // truncate={true} maxRows={1}
//         href="https://www.google.com"
//       >
//         Link to URL with tooltip
//       </Link>
//     </div>
//   );
// };
