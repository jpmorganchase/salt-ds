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
import type { ValueComponentProps } from "./types";

const withBaseName = makePrefixer("saltContactSecondaryInfo");

export interface ContactSecondaryInfoProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  icon?: ComponentType<IconProps>;
  text: string;
  ValueComponent?: ComponentType<ValueComponentProps>;
}

export const ContactSecondaryInfo = forwardRef<
  HTMLDivElement,
  ContactSecondaryInfoProps
>(function ContactSecondaryInfo(props, ref) {
  const {
    id: idProp,
    text,
    icon: Icon,
    className,
    ValueComponent,
    ...restProps
  } = props;
  const { setSecondary, setSecondaryId, variant } = useContactDetailsContext();
  const id = useId(idProp);

  useEffect(() => {
    setSecondary(text || "");
    setSecondaryId(id);
    return () => {
      setSecondary(undefined);
      setSecondaryId(undefined);
    };
  }, [id, text, setSecondary, setSecondaryId]);

  return (
    <Text
      styleAs={variant === "default" ? "h4" : undefined}
      maxRows={1}
      {...restProps}
      id={id}
      ref={ref}
      className={clsx(withBaseName(), className)}
      data-testid="secondary"
    >
      {Icon ? <Icon className={withBaseName("icon")} /> : null}
      {text}
    </Text>
  );
});
