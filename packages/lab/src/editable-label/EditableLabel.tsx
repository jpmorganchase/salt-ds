import {
  useControlled,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import React, { ChangeEvent, KeyboardEvent, useCallback, useRef } from "react";
import { Input } from "../input";

import "./EditableLabel.css";

const classBase = "uitkEditableLabel";

export interface EditableLabelProps {
  className?: string;
  defaultEditing?: boolean;
  defaultValue?: string;
  editing?: boolean;
  onEnterEditMode: () => void;
  onChange?: (value: string) => void;
  onExitEditMode: (
    originalLabel: string | undefined,
    editedLabel: string | undefined,
    allowDeactivation?: boolean
  ) => void;
  defaultIsEditing?: boolean;
  value?: string;
}

//TODO do we need forwardRef ?
export const EditableLabel: React.FC<EditableLabelProps> = ({
  className: classNameProp,
  defaultEditing,
  defaultValue,
  editing: editingProp,
  onChange,
  onEnterEditMode,
  onExitEditMode,
  value: valueProp,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue ?? "",
    name: "EditableLabel",
    state: "value",
  });

  const [editing, setEditing] = useControlled({
    controlled: editingProp,
    default: defaultEditing ?? false,
    name: "EditableLabel",
    state: "editing",
  });

  const initialValue = useRef(value);

  useIsomorphicLayoutEffect(() => {
    if (editing) {
      if (inputRef.current !== null) {
        inputRef.current.select();
        inputRef.current.focus();
      }
    }
  }, [editing, inputRef]);

  const enterEditMode = useCallback(() => {
    setEditing(true);
    // ignoreBlur.current = false;
    onEnterEditMode && onEnterEditMode();
  }, [onEnterEditMode, setEditing]);

  const exitEditMode = ({
    cancelEdit = false,
    allowDeactivation = false,
  } = {}) => {
    setEditing(false);
    const originalValue = initialValue.current;
    if (originalValue !== value) {
      if (cancelEdit) {
        setValue(originalValue);
      } else {
        initialValue.current = value;
      }
    }
    onExitEditMode && onExitEditMode(originalValue, value, allowDeactivation);
  };

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { value } = evt.target;
    setValue(value);
    onChange && onChange(value);
  };

  const handleDoubleClick = () => {
    enterEditMode();
  };

  const handleBlur = () => {
    exitEditMode({ allowDeactivation: true });
  };

  const handleKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (editing && evt.key === "Enter") {
      evt.stopPropagation();
      // we are likely to lose focus as a consequence of user response
      // to exitEdit transition, don't want it to trigger another
      //shouldn't we call setEditing here in case we are in uncontrolled mode ?
      exitEditMode();
    } else if (evt.key === "ArrowRight" || evt.key === "ArrowLeft") {
      evt.stopPropagation();
    } else if (evt.key === "Escape") {
      exitEditMode({ cancelEdit: true });
    }
  };

  const className = classnames(classBase, classNameProp, {
    [`${classBase}-editing`]: editing,
  });
  return (
    <div
      className={className}
      onDoubleClick={handleDoubleClick}
      data-text={value}
    >
      {editing ? (
        <Input
          inputProps={{ className: `${classBase}-input` }}
          value={value}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          style={{ padding: 0 }}
          textAlign="left"
        />
      ) : (
        value
      )}
    </div>
  );
};
