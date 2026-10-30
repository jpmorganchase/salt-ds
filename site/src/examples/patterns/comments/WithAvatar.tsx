import {
  Avatar,
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";
import { CommentList, useCommentForm } from "./Default";

export const WithAvatar = () => {
  const {
    inputRef,
    inputValue,
    validationStatus,
    comments,
    handleSubmit,
    handleChange,
  } = useCommentForm();

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
          <Input
            bordered
            placeholder="Add a comment..."
            inputRef={inputRef}
            inputProps={{ "aria-invalid": validationStatus === "error" }}
            endAdornment={
              inputValue && (
                <Button aria-label="Send comment" type="submit">
                  <SendIcon aria-hidden />
                </Button>
              )
            }
            value={inputValue}
            onChange={handleChange}
          />
          {validationStatus === "error" && (
            <FormFieldHelperText>Comment can't be blank</FormFieldHelperText>
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
