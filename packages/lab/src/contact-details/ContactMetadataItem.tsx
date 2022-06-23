import { makePrefixer } from "@jpmorganchase/uitk-core";
import { IconProps } from "@jpmorganchase/uitk-icons";
import { ComponentType, forwardRef, HTMLAttributes } from "react";
import { Div } from "../typography";
import { MailLinkComponent } from "./";

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
    <div {...restProps} ref={ref} className={withBaseName()}>
      {!Icon ? (
        <Div truncate maxRows={1} className={withBaseName("label")}>
          {label}
        </Div>
      ) : null}
      {Icon ? <Icon className={withBaseName("icon")} /> : null}

      <MailLinkComponent value={value} />
    </div>
  );
});
