import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "../utils";
import "./Card.css";

const withBaseName = makePrefixer("saltCard");

export const Card = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  function Card(props, ref) {
    const { className, children, ...rest } = props;

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        <div className={withBaseName("content")}>{children}</div>
      </div>
    );
  }
);
