import {
  Avatar,
  Banner,
  BannerActions,
  BannerContent,
  Button,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  Label,
  MultilineInput,
  StackLayout,
  StatusIndicator,
  Text,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { CloseIcon, RefreshIcon, SendIcon } from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import type { ChangeEvent, ComponentProps, ReactNode } from "react";
import { useId, useRef, useState } from "react";

export default {
  title: "Patterns/Comments",
} as Meta;

// --- Shared types & data ---

interface Comment {
  name: string;
  role: string;
  date: number;
  text: string;
}

const initialComments: Comment[] = [
  {
    name: "Alex Rivera",
    role: "Data Analyst",
    date: 1775035560000,
    text: "Date range + status. Also the saved views are super helpful.",
  },
  {
    name: "Jordan Lee",
    role: "Product Manager",
    date: 1775035200000,
    text: "Has anyone tried filtering by region and date?",
  },
];

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const getAvatarColor = (
  name: string,
): ComponentProps<typeof Avatar>["color"] => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `category-${(Math.abs(hash) % 20) + 1}` as ComponentProps<
    typeof Avatar
  >["color"];
};

// --- Shared components ---

function CommentList({
  comments,
  renderAvatar,
}: {
  comments: Comment[];
  renderAvatar?: (comment: Comment) => ReactNode;
}) {
  return (
    <ul
      aria-label="Comments"
      style={{ listStyle: "none", margin: 0, padding: 0 }}
    >
      {comments.map((comment, index) => (
        <li
          key={`${comment.name}-${comment.date}`}
          style={{
            borderTop:
              index > 0
                ? "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-tertiary-borderColor)"
                : "none",
          }}
        >
          <StackLayout padding={1} gap={1}>
            {renderAvatar ? (
              <FlexLayout gap={1}>
                {renderAvatar(comment)}
                <StackLayout gap={1}>
                  <StackLayout gap={0.5}>
                    <Text styleAs="h4">{comment.name}</Text>
                    <Text styleAs="label" color="secondary">
                      {comment.role} • {formatDate(comment.date)}
                    </Text>
                  </StackLayout>
                  <Text style={{ lineBreak: "anywhere" }}>{comment.text}</Text>
                </StackLayout>
              </FlexLayout>
            ) : (
              <>
                <StackLayout gap={0.5}>
                  <Text styleAs="h4">{comment.name}</Text>
                  <Text styleAs="label" color="secondary">
                    {comment.role} • {formatDate(comment.date)}
                  </Text>
                </StackLayout>
                <Text style={{ lineBreak: "anywhere" }}>{comment.text}</Text>
              </>
            )}
          </StackLayout>
        </li>
      ))}
    </ul>
  );
}

// --- Shared hook ---

function useCommentForm(initialData: Comment[] = initialComments) {
  const { announce } = useAriaAnnouncer();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [validationStatus, setValidationStatus] = useState<
    "error" | "success" | undefined
  >(undefined);
  const [comments, setComments] = useState<Comment[]>(initialData);

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setValidationStatus("error");
      inputRef.current?.focus();
      announce("Comment can't be blank", { ariaLive: "assertive" });
      return false;
    }
    setValidationStatus(undefined);
    setComments([
      {
        name: "Sam Patel",
        role: "UX Designer",
        date: Date.now(),
        text: inputValue,
      },
      ...comments,
    ]);
    setInputValue("");
    inputRef.current?.focus();
    requestAnimationFrame(() => {
      announce("Comment posted");
    });
    return true;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    if (value.trim()) {
      setValidationStatus(undefined);
    }
  };

  return {
    announce,
    inputRef,
    inputValue,
    setInputValue,
    validationStatus,
    setValidationStatus,
    comments,
    setComments,
    handleSubmit,
    handleChange,
  };
}

// --- Stories ---

export const Default = () => {
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
      <CommentList comments={comments} />
    </StackLayout>
  );
};

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

export const WithCategoricalAvatar = () => {
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
            color={getAvatarColor(comment.name)}
            name={comment.name}
            aria-hidden="true"
          />
        )}
      />
    </StackLayout>
  );
};

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
              <Button
                aria-label="Send comment"
                type="submit"
                disabled={!inputValue}
                style={{ visibility: inputValue ? "visible" : "hidden" }}
              >
                <SendIcon aria-hidden />
              </Button>
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

export const WithMultilineInput = () => {
  const { announce } = useAriaAnnouncer();
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
    setComments([
      {
        name: "Sam Patel",
        role: "UX Designer",
        date: Date.now(),
        text: inputValue,
      },
      ...comments,
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
      setComments([
        {
          name: "Sam Patel",
          role: "UX Designer",
          date: Date.now(),
          text: inputValue,
        },
        ...comments,
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
