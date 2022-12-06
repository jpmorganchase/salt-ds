import { makePrefixer, Text } from "@jpmorganchase/uitk-core";
import { IconProps } from "@jpmorganchase/uitk-icons";
import { ComponentType, forwardRef, HTMLAttributes } from "react";
import { MailLinkComponent } from "./MailLinkComponent";
import { ValueComponentProps } from "./types";

const withBaseName = makePrefixer("uitkContactMetadataItem");

export interface ContactMetadataItemProps
  extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  value: string;
  icon?: ComponentType<IconProps>;
  ValueComponent?: ComponentType<ValueComponentProps>;
}

export const ContactMetadataItem = forwardRef<
  HTMLDivElement,
  ContactMetadataItemProps
>(function ContactMetadataItem(props, ref) {
  const { label, value, icon: Icon, ValueComponent, ...restProps } = props;
  return (
    <div {...restProps} ref={ref} className={withBaseName()}>
      {!Icon ? (
        <Text maxRows={1} className={withBaseName("label")}>
          {label}
        </Text>
      ) : null}
      {Icon ? <Icon className={withBaseName("icon")} /> : null}

      {ValueComponent ? (
        <ValueComponent value={value} />
      ) : (
        <MailLinkComponent value={value} />
      )}
    </div>
  );
});
