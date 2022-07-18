import { makePrefixer, useId } from "@jpmorganchase/uitk-core";
import { IconProps } from "@jpmorganchase/uitk-icons";
import cn from "classnames";
import { ComponentType, forwardRef, HTMLAttributes, useEffect } from "react";
import { Div } from "../typography";
import { useContactDetailsContext } from "./internal";

const withBaseName = makePrefixer("uitkContactTertiaryInfo");

export interface ContactTertiaryInfoProps
  extends HTMLAttributes<HTMLDivElement> {
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
    <Div
      {...restProps}
      truncate={variant === "compact" ? false : true}
      maxRows={1}
      styleAs={variant === "default" ? "h4" : undefined}
      id={id}
      ref={ref}
      className={cn(withBaseName(), className)}
      data-testid="tertiary"
    >
      {Icon ? <Icon className={withBaseName("icon")} /> : null}
      {text}
    </Div>
  );
});
