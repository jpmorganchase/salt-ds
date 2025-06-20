import { makePrefixer, Text, useId } from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { clsx } from "clsx";
import {
  type ComponentType,
  forwardRef,
  type HTMLAttributes,
  useEffect,
} from "react";
import { useContactDetailsContext } from "./internal";

const withBaseName = makePrefixer("saltContactTertiaryInfo");

export interface ContactTertiaryInfoProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  icon?: ComponentType<IconProps>;
  text: string;
}

export const ContactTertiaryInfo = forwardRef<
  HTMLDivElement,
  ContactTertiaryInfoProps
>(function ContactTertiaryInfo(props, ref) {
  const { id: idProp, text, icon: Icon, className, ...restProps } = props;
  const { variant, setTertiary, setTertiaryId } = useContactDetailsContext();
  const id = useId(idProp);

  useEffect(() => {
    setTertiary(text);
    setTertiaryId(id);
    return () => {
      setTertiary(undefined);
      setTertiaryId(undefined);
    };
  }, [id, text, setTertiary, setTertiaryId]);

  if (variant === "mini") {
    return null;
  }

  return (
    <Text
      {...restProps}
      maxRows={1}
      styleAs={variant === "default" ? "h4" : undefined}
      id={id}
      ref={ref}
      className={clsx(withBaseName(), className)}
      data-testid="tertiary"
    >
      {Icon ? <Icon className={withBaseName("icon")} /> : null}
      {text}
    </Text>
  );
});
