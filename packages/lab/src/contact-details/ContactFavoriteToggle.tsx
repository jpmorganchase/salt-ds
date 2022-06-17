import { TooltipProps, useControlled, useId } from "@jpmorganchase/uitk-core";
import { forwardRef } from "react";
import {
  FavoriteToggleWithTooltip,
  FavoriteToggleWithTooltipProps,
} from "./internal";

export interface ContactFavoriteToggleProps
  extends FavoriteToggleWithTooltipProps {
  isFavorite?: boolean;
  defaultIsFavorite?: boolean;
  onChange?: (isFavorite: boolean) => void;
  tooltipProps?: TooltipProps;
}

export const ContactFavoriteToggle = forwardRef<
  HTMLSpanElement,
  ContactFavoriteToggleProps
>(function ContactFavoriteToggle(props, ref) {
  const {
    id: idProp,
    isFavorite: isFavoriteProp,
    defaultIsFavorite = false,
    onChange: onChangeProp,
    tooltipProps,
    ...restProps
  } = props;

  const id = useId(idProp);

  const [isFavorite, setIsFavorite] = useControlled({
    controlled: isFavoriteProp,
    default: defaultIsFavorite,
    name: "ContactDetails",
    state: "isFavorite",
  });

  const onChange = (isSelected: boolean) => {
    setIsFavorite(isSelected);
    if (onChangeProp) {
      onChangeProp(isSelected);
    }
  };

  const tooltipTitle = `${isFavorite ? "Remove" : "Mark"} as favorite`;

  return (
    <FavoriteToggleWithTooltip
      {...restProps}
      id={id}
      ref={ref}
      tooltipProps={tooltipProps}
      aria-label="Favorite"
      isSelected={isFavorite}
      onChange={onChange}
      tooltipTitle={tooltipTitle}
    />
  );
});
