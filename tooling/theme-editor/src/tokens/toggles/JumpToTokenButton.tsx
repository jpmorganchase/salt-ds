import { useNavigate } from "react-router-dom";
import { Button } from "@jpmorganchase/uitk-core";
import { AddDocumentIcon } from "@jpmorganchase/icons";

import {
  UITK_CHARACTERISTICS,
  UITK_COLOURS,
  UITK_FOUNDATIONS,
} from "../../utils/uitkValues";

interface JumpToTokenButtonProps {
  disabled: boolean;
  pathname: string;
  search: string;
  sectionToJumpTo:
    | typeof UITK_COLOURS
    | typeof UITK_CHARACTERISTICS
    | typeof UITK_FOUNDATIONS;
  value: string;
}

export const JumpToTokenButton = (props: JumpToTokenButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      disabled={props.disabled}
      onClick={(e) => {
        props.sectionToJumpTo.includes(props.value) &&
          navigate({
            pathname: props.pathname,
            search: props.search,
          });
      }}
      variant="secondary"
    >
      <AddDocumentIcon />
    </Button>
  );
};
