import { Link } from "@salt-ds/core";
import { StackoverflowIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Link",
  component: Link,
} as Meta<typeof Link>;

export const Primary: StoryFn<typeof Link> = () => {
  return <Link href="https://www.google.com">Link to URL</Link>;
};

export const Secondary: StoryFn<typeof Link> = () => {
  return (
    <Link variant="secondary" href="https://www.google.com">
      Link to URL
    </Link>
  );
};

export const TargetBlank: StoryFn<typeof Link> = () => {
  return (
    <Link href="https://www.google.com" target="_blank">
      Link to URL
    </Link>
  );
};

export const TargetBlankCustomIcon: StoryFn<typeof Link> = () => {
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

export const Strong: StoryFn<typeof Link> = () => {
  return (
    <Link href="#root" target="_blank">
      This is a <strong>strong</strong> link example
    </Link>
  );
};

export const Small: StoryFn<typeof Link> = () => {
  return (
    <Link href="#root">
      This is a <small>small</small> link example
    </Link>
  );
};

export const StyleAs: StoryFn<typeof Link> = () => {
  return (
    <Link href="#root" styleAs="label">
      This is a styleAs label example
    </Link>
  );
};

export const TargetBlankNoIcon: StoryFn<typeof Link> = () => {
  return (
    <Link IconComponent={null} href="#root" target="_blank">
      This has no icon
    </Link>
  );
};

export const Truncation: StoryFn<typeof Link> = () => {
  return (
    <div style={{ width: 150 }}>
      <Link href="#root" maxRows={1}>
        This is a truncation example
      </Link>
    </div>
  );
};

// export const WithTooltip: StoryFn<typeof Link> = () => {
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
