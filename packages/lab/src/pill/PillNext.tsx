import {
  forwardRef,
  MouseEvent,
  PropsWithChildren,
  ReactElement,
  HTMLAttributes,
} from "react";
import { useWindow } from "@salt-ds/window";
import { CloseIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer, useButton } from "@salt-ds/core";
import pillCss from "./Pill.css";
import clsx from "clsx";

type ClickEvent = MouseEvent<HTMLDivElement, globalThis.MouseEvent>;

interface BasePillProps {
  onClick?: (e: ClickEvent) => void;
  disabled?: boolean;
  icon?: ReactElement;
  className?: string;
}

interface ClosableVariant
  extends BasePillProps,
    HTMLAttributes<HTMLDivElement> {
  variant: "closable";
  onClose: (e: ClickEvent) => void;
}

export type PillVariant = "basic" | "closable";

export interface PillVariantProps<T extends PillVariant = "basic"> {
  /**
   * Determines the variant of pill
   */
  variant?: T;
}

// Generic checks makes sure that incompatiable props like `onChange` can be inferred correctly when using different variants
export type PillProps<T extends PillVariant = "basic"> = T extends "closable"
  ? ClosableVariant & PillVariantProps<T>
  : BasePillProps & PillVariantProps<T>;

const withBaseName = makePrefixer("saltPill");

export const Pill = forwardRef<HTMLDivElement, PropsWithChildren<PillProps>>(
  function Pill(
    {
      variant,
      onClose,
      onClick,
      children,
      className,
      icon,
      disabled,
      ...restProps
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-pill",
      css: pillCss,
      window: targetWindow,
    });

    const clickable = onClick !== undefined && !disabled;
    const interactive = clickable || variant === "closable";

    if (interactive) {
      return (
        <InteractivePill
          disabled={disabled}
          onClose={onClose}
          onClick={onClick}
          variant={variant}
        >
          {children}
        </InteractivePill>
      );
    }

    return (
      <div
        ref={ref}
        onClick={onClick}
        {...restProps}
        className={clsx(withBaseName(), className)}
      >
        {icon}
        <PillContent>{children}</PillContent>
      </div>
    );
  }
);

const InteractivePill = forwardRef<
  HTMLDivElement,
  PropsWithChildren<PillProps>
>(function InteractivePill(
  {
    disabled,
    onClick,
    className,
    variant,
    onClose,
    icon,
    children,
    ...restProps
  },
  ref
) {
  const clickable = onClick !== undefined && !disabled;
  const { buttonProps, active } = useButton({ disabled, onClick });

  return (
    <div
      ref={ref}
      onClick={onClick}
      {...restProps}
      {...buttonProps}
      className={clsx(withBaseName(), className, {
        [withBaseName("clickable")]: clickable,
        [withBaseName("active")]: active,
        [withBaseName("closable")]: variant === "closable",
      })}
      aria-disabled={disabled}
      tabIndex={!disabled ? 0 : -1}
      role="button"
    >
      {icon}
      <PillContent>{children}</PillContent>
      {variant === "closable" ? <PillCloseButton onClick={onClose} /> : null}
    </div>
  );
});

const PillCloseButton = ({ onClick }: { onClick: (e: ClickEvent) => void }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <CloseIcon />
    </div>
  );
};

const PillContent = ({ children }: PropsWithChildren) => {
  return <span className={withBaseName("label")}>{children}</span>;
};

/* 
<Pill>Label</Pill> || <Pill variant="basic">Label</Pill> 

<Pill icon={<StarIcon/>}>Label</Pill>

<Pill><StarIcon/> Label</Pill>

<Pill variant="basic" onClick={handleClick}>Label</Pill>

<Pill onClose={handleDelete} variant="closable" onClick={handleClick}>
  Label
</Pill>

<Pill onClose={handleDelete} variant="closable">Label</Pill>

<Pill onChange={handleChange} variant="selectable">Label</Pill>

or...

<Pill onClick={handleClick}>
  <PillContent>Label</PillContent>
  <PillCloseButton onClick={handleDelete}/>
</Pill>

<Pill onClick={handleClick}>
  <PillIcon>
    <StarIcon/>
  </PillIcon>
  <PillContent>Label</PillContent>
  <PillCloseButton onClick={handleDelete}/>
</Pill>

<Pill variant="selectable" onChange={handleChange}>
  <PillCheckBox/>
  <PillContent>Label</PillContent>
</Pill>
*/
