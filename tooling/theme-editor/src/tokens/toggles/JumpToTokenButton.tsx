import { useNavigate } from "react-router-dom";
import { Button, makePrefixer } from "@brandname/core";
import { AddDocumentIcon } from "@brandname/icons";

import { UITK_CHARACTERISTICS, UITK_FOUNDATIONS } from "../../utils/uitkValues";
import "../foundations/color/ColorValueEditor.css";

interface JumpToTokenButtonProps {
  disabled: boolean;
  pathname: string;
  search: string;
  sectionToJumpTo: typeof UITK_CHARACTERISTICS | typeof UITK_FOUNDATIONS;
  value: string;
}

const withBaseName = makePrefixer("uitkColorValueEditor");

export const JumpToTokenButton = (props: JumpToTokenButtonProps) => {
  const navigate = useNavigate();

  return (
    <div className={withBaseName("jumpToFoundationButton")}>
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
    </div>
  );
};
