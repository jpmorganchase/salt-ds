import { Button, makePrefixer, useIcon, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useState } from "react";
import { useContactDetailsContext } from "./internal";

const withBaseName = makePrefixer("saltContactMetadata");

export interface ContactMetadataProps extends HTMLAttributes<HTMLDivElement> {
  collapsible?: boolean;
  collapseButtonId?: string;
}

export const ContactMetadata = forwardRef<HTMLDivElement, ContactMetadataProps>(
  function ContactMetadata(props, ref) {
    const { collapsible, children, collapseButtonId, className, ...restProps } =
      props;
    const { primaryId, variant, isStacked } = useContactDetailsContext();
    const { CollapseIcon, ExpandIcon } = useIcon();
    const [showMetadata, setShowMetadata] = useState<boolean>(!collapsible);

    const toggleShowMetadata = () => {
      setShowMetadata(!showMetadata);
    };

    if (variant !== "default") {
      return null;
    }

    const variantClassName = withBaseName(isStacked ? "stacked" : "default");

    const id = useId(collapseButtonId);

    return (
      <>
        {collapsible ? (
          <Button
            aria-expanded={showMetadata}
            aria-label={showMetadata ? "Collapse" : "Expand"}
            aria-labelledby={`${id} ${primaryId}`}
            id={id}
            onClick={toggleShowMetadata}
            variant="secondary"
            className={withBaseName("expander")}
          >
            {showMetadata ? <CollapseIcon /> : <ExpandIcon />}
          </Button>
        ) : null}
        {!collapsible || showMetadata ? (
          <div
            {...restProps}
            ref={ref}
            className={clsx(withBaseName(), variantClassName, className)}
          >
            {collapsible ? <div className={withBaseName("separator")} /> : null}
            {children}
          </div>
        ) : null}
      </>
    );
  },
);
