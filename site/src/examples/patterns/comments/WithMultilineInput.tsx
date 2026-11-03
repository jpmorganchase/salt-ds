import {
  Avatar,
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Label,
  MultilineInput,
  StackLayout,
  useAriaAnnouncer,
  useId,
} from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { type Comment, CommentList, initialComments } from "./Default";

export const WithMultilineInput = () => {
  const { announce } = useAriaAnnouncer({ debounce: 500 });
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [validationStatus, setValidationStatus] = useState<
    "error" | "success" | undefined
  >(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  const MAX_CHARS = 1000;
  const counterId = useId();
  const prevAtLimitRef = useRef(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setValidationStatus("error");
      setErrorMessage("Comment can't be blank");
      textAreaRef.current?.focus();
      announce("Comment can't be blank", { ariaLive: "assertive" });
      return;
    }
    if (inputValue.length > MAX_CHARS) {
      setValidationStatus("error");
      setErrorMessage("Comment is too long. Maximum is 1000 characters.");
      textAreaRef.current?.focus();
      announce("Comment is too long. Maximum is 1000 characters.", {
        ariaLive: "assertive",
      });
      return;
    }
    setValidationStatus(undefined);
    setErrorMessage("");
    setComments((prev) => [
      {
        name: "Sam Patel",
        role: "UX Designer",
        date: Date.now(),
        text: inputValue,
      },
      ...prev,
    ]);
    setInputValue("");
    textAreaRef.current?.focus();
    requestAnimationFrame(() => {
      announce("Comment posted");
    });
  };

  return (
    <StackLayout gap={0} style={{ width: "100%", maxWidth: "420px" }}>
      <form
        style={{ padding: "var(--salt-spacing-100)" }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <FormField validationStatus={validationStatus}>
          <FormFieldLabel>Write a comment</FormFieldLabel>
          <MultilineInput
            bordered
            placeholder="Add a comment..."
            textAreaRef={textAreaRef}
            textAreaProps={{
              "aria-describedby": counterId,
              "aria-invalid": validationStatus === "error",
              onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
                const value = event.target.value;
                setInputValue(value);
                if (value.length > MAX_CHARS) {
                  setValidationStatus("error");
                  setErrorMessage(
                    "Comment is too long. Maximum is 1000 characters.",
                  );
                  if (!prevAtLimitRef.current) {
                    prevAtLimitRef.current = true;
                    announce(
                      `Character limit reached. ${value.length} of ${MAX_CHARS} characters used.`,
                      { ariaLive: "assertive" },
                    );
                  }
                } else {
                  prevAtLimitRef.current = false;
                  setValidationStatus(undefined);
                  setErrorMessage("");
                  if (value.length > 0) {
                    announce(
                      `${value.length} of ${MAX_CHARS} characters used.`,
                    );
                  }
                }
              },
            }}
            endAdornment={
              <>
                <Label
                  id={counterId}
                >{`${inputValue.length}/${MAX_CHARS}`}</Label>
                {inputValue && (
                  <Button aria-label="Send comment" type="submit">
                    <SendIcon aria-hidden />
                  </Button>
                )}
              </>
            }
            value={inputValue}
          />
          {validationStatus === "error" && (
            <FormFieldHelperText>{errorMessage}</FormFieldHelperText>
          )}
        </FormField>
      </form>
      <CommentList
        comments={comments}
        renderAvatar={(comment) => (
          <Avatar
            size={1}
            color="accent"
            name={comment.name}
            aria-hidden="true"
          />
        )}
      />
    </StackLayout>
  );
};
