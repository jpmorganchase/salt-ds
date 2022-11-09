import { ElementType, useMemo } from "react";
import { AddDocumentIcon, Icon, IconProps } from "@jpmorganchase/uitk-icons";
import { allIcons } from "./icon.all";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Icons/Icon",
  component: Icon,
} as ComponentMeta<typeof Icon>;

const sizes = [1, 2, 3, 4, 5] as const;

const IconGrid = ({
  Icon: IconComponent,
}: {
  Icon: ElementType<IconProps>;
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${sizes.length}, 100px)`,

        gridGap: 10,
      }}
    >
      {sizes.map((size) => (
        <IconComponent size={size} />
      ))}
    </div>
  );
};

export const ToolkitIcon: ComponentStory<typeof Icon> = (props) => (
  <AddDocumentIcon {...props} />
);
export const ToolkitIconMultipleSizes: ComponentStory<typeof Icon> = () => (
  <IconGrid Icon={AddDocumentIcon} />
);

export const CustomSVGIcon: ComponentStory<typeof Icon> = () => {
  const CustomIcon = useMemo(
    () => (props: IconProps) => {
      return (
        <Icon viewBox="0 0 18 18" {...props}>
          <path d="M16,2V16H2V2Zm.5-1H1.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h15a.5.5,0,0,0,.5-.5V1.5A.5.5,0,0,0,16.5,1Z" />
          <rect height="4" rx="0.25" width="12" x="3" y="11" />
        </Icon>
      );
    },
    []
  );

  return <IconGrid Icon={CustomIcon} />;
};

export const CustomIconFullSVG: ComponentStory<typeof Icon> = () => {
  const CustomIcon = useMemo(
    () => (props: IconProps) => {
      return (
        <Icon {...props}>
          <svg viewBox="0 0 18 18">
            <path d="M16,2V16H2V2Zm.5-1H1.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h15a.5.5,0,0,0,.5-.5V1.5A.5.5,0,0,0,16.5,1Z" />
            <rect height="4" rx="0.25" width="12" x="3" y="11" />
          </svg>
        </Icon>
      );
    },
    []
  );

  return <IconGrid Icon={CustomIcon} />;
};

export const AllIcons: ComponentStory<typeof Icon> = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(15, auto)",
        gap: 8,
      }}
    >
      {allIcons.map((IconComponent, i) => (
        <IconComponent key={i} size={2} />
      ))}
    </div>
  );
};
