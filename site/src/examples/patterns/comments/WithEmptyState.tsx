import {
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  StatusIndicator,
  Text,
} from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";
import { CommentList, useCommentForm } from "./Default";

export const WithEmptyState = () => {
  const {
    inputRef,
    inputValue,
    validationStatus,
    comments,
    handleSubmit,
    handleChange,
  } = useCommentForm([]);

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
            inputProps={{
              "aria-invalid": validationStatus === "error",
              style: { minWidth: "300px" },
            }}
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
      {comments.length === 0 ? (
        <StackLayout
          gap={3}
          align="center"
          style={{ padding: "var(--salt-spacing-300) 0" }}
        >
          <StatusIndicator status="info" size={2} aria-hidden="true" />
          <StackLayout gap={1} align="center" style={{ textAlign: "center" }}>
            <Text styleAs="h4">
              <strong>Be the first to comment</strong>
            </Text>
            <Text>Start the discussion by adding a comment above.</Text>
          </StackLayout>
        </StackLayout>
      ) : (
        <CommentList comments={comments} />
      )}
    </StackLayout>
  );
};
