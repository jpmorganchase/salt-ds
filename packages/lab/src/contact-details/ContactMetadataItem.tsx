import { makePrefixer } from "@jpmorganchase/uitk-core";
import { IconProps } from "@jpmorganchase/uitk-icons";
import { ComponentType, forwardRef, HTMLAttributes } from "react";
import { Div } from "../typography";

const withBaseName = makePrefixer("uitkContactMetadataItem");

export interface ContactMetadataItemProps
  extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  value: string;
  icon?: ComponentType<IconProps>;
}

export const ContactMetadataItem = forwardRef<
  HTMLDivElement,
  ContactMetadataItemProps
>(function ContactMetadataItem(props, ref) {
  const { label, value, icon: Icon, ...restProps } = props;
  return (
    <Div {...restProps} ref={ref} className={withBaseName()}>
      {!Icon ? <div className={withBaseName("label")}>{label}</div> : null}
      {Icon ? <Icon className={withBaseName("icon")} /> : null}

      {value}
    </Div>
  );
});
