import { Link } from "@salt-ds/core";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import { StackoverflowIcon } from "@salt-ds/icons";

export default {
  title: "Core/Link",
  component: Link,
} as ComponentMeta<typeof Link>;

export const Primary: ComponentStory<typeof Link> = () => {
  return <Link href="https://www.google.com">Link to URL</Link>;
};

export const Secondary: ComponentStory<typeof Link> = () => {
  return <Link variant="secondary" href="https://www.google.com">Link to URL</Link>;
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

export const Strong: ComponentStory<typeof Link> = () => {
  return (
    <Link href="#root" target="_blank">
      This is a <strong>strong</strong> link example
    </Link>
  );
};

export const Small: ComponentStory<typeof Link> = () => {
  return (
    <Link href="#root">
      This is a <small>small</small> link example
    </Link>
  );
};

export const StyleAs: ComponentStory<typeof Link> = () => {
  return (
<Link href="#root" styleAs="label">
This is a styleAs label example
</Link>
  );
};

export const Truncation: ComponentStory<typeof Link> = () => {
  return (
<div style={{ width: 150 }}>
<Link href="#root" maxRows={1}>
  This is a truncation example
</Link>
</div>
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
