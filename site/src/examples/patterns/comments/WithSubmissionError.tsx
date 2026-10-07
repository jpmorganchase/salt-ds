import {
  Avatar,
  Banner,
  BannerActions,
  BannerContent,
  Button,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { CloseIcon, RefreshIcon, SendIcon } from "@salt-ds/icons";
import { useState } from "react";
import { CommentList, useCommentForm } from "./Default";

export const WithSubmissionError = () => {
  const {
    announce,
    inputRef,
    inputValue,
    setInputValue,
    validationStatus,
    setValidationStatus,
    comments,
    setComments,
    handleChange,
  } = useCommentForm();

  const submissionErrorMessage =
    "You are offline. Check your connection and resubmit.";
  const [submissionError, setSubmissionError] = useState(false);

  const handleRetry = () => {
    if (inputValue.trim()) {
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
      setSubmissionError(false);
      inputRef.current?.focus();
      requestAnimationFrame(() => {
        announce("Comment posted");
      });
    }
  };

  const handleDismiss = () => {
    setSubmissionError(false);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setValidationStatus("error");
      inputRef.current?.focus();
      announce("Comment can't be blank", { ariaLive: "assertive" });
      return;
    }
    if (submissionError) {
      handleRetry();
      return;
    }
    setValidationStatus(undefined);
    setSubmissionError(true);
    announce(submissionErrorMessage, { ariaLive: "assertive" });
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
      {submissionError && (
        <div style={{ padding: "var(--salt-spacing-100)" }}>
          <Banner status="error" variant="secondary">
            <BannerContent>
              <StackLayout gap={1}>
                <Text>
                  <strong>Couldn't post your comment</strong>
                </Text>
                <Text>{submissionErrorMessage}</Text>
              </StackLayout>
            </BannerContent>
            <BannerActions>
              <Button
                aria-label="Retry posting your comment"
                sentiment="neutral"
                appearance="transparent"
                onClick={handleRetry}
              >
                <RefreshIcon aria-hidden />
              </Button>
              <Button
                aria-label="Dismiss submission error"
                sentiment="neutral"
                appearance="transparent"
                onClick={handleDismiss}
              >
                <CloseIcon aria-hidden />
              </Button>
            </BannerActions>
          </Banner>
        </div>
      )}
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
