import { useNavigate } from "react-router-dom";
import { Button, makePrefixer } from "@salt-ds/core";
import { AddDocumentIcon } from "@salt-ds/icons";

import { SALT_CHARACTERISTICS, SALT_FOUNDATIONS } from "../../utils/saltValues";
import "../foundations/color/ColorValueEditor.css";

interface JumpToTokenButtonProps {
  disabled: boolean;
  pathname: string;
  search: string;
  sectionToJumpTo: typeof SALT_CHARACTERISTICS | typeof SALT_FOUNDATIONS;
  value: string;
}

const withBaseName = makePrefixer("saltColorValueEditor");

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
