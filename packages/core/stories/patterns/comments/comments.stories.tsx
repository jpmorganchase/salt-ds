import {
  AriaAnnouncerProvider,
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
import { useEffect, useRef, useState } from "react";

export default {
  title: "Patterns/Comments",
} as Meta;

const formatDate = (timestamp: number) =>
  new Date(timestamp)
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", " •");

export const Default = () => (
  <AriaAnnouncerProvider>
    <DefaultContent />
  </AriaAnnouncerProvider>
);

const DefaultContent = () => {
  const { announce } = useAriaAnnouncer();
  const [inputValue, setInputValue] = useState("");
  const [validationStatus, setValidationStatus] = useState<
    "error" | "success" | undefined
  >(undefined);
  const [comments, setComments] = useState([
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
  ]);

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setValidationStatus("error");
      return;
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
    announce("Comment posted");
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
        <FormField>
          <FormFieldLabel>Write a comment</FormFieldLabel>
          <Input
            bordered
            placeholder="Add a comment..."
            validationStatus={validationStatus}
            endAdornment={
              inputValue && (
                <Button aria-label="Send comment" type="submit">
                  <SendIcon aria-hidden />
                </Button>
              )
            }
            value={inputValue}
            onChange={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setInputValue(value);
              if (value.trim()) {
                setValidationStatus(undefined);
              }
            }}
          />
          {validationStatus === "error" && (
            <FormFieldHelperText color="error">
              <FlexLayout gap={0.75} align="center">
                <StatusIndicator status="error" aria-hidden="true" />
                Comment can't be blank
              </FlexLayout>
            </FormFieldHelperText>
          )}
        </FormField>
      </form>
      <ul
        aria-label="Comments"
        style={{ listStyle: "none", margin: 0, padding: 0 }}
      >
        {comments.map((c, index) => (
          <li
            key={`${c.name}-${c.date}`}
            style={{
              borderTop:
                index > 0
                  ? "1px solid var(--salt-separable-secondary-borderColor)"
                  : "none",
            }}
          >
            <StackLayout padding={1} gap={1}>
              <StackLayout gap={0.5}>
                <Text styleAs="h4">{c.name}</Text>
                <Text styleAs="label" color="secondary">
                  {c.role} • {formatDate(c.date)}
                </Text>
              </StackLayout>
              <Text>{c.text}</Text>
            </StackLayout>
          </li>
        ))}
      </ul>
    </StackLayout>
  );
};

export const WithAvatar = () => (
  <AriaAnnouncerProvider>
    <WithAvatarContent />
  </AriaAnnouncerProvider>
);

const WithAvatarContent = () => {
  const { announce } = useAriaAnnouncer();
  const [inputValue, setInputValue] = useState("");
  const [validationStatus, setValidationStatus] = useState<
    "error" | "success" | undefined
  >(undefined);
  const [comments, setComments] = useState([
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
  ]);

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setValidationStatus("error");
      return;
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
    announce("Comment posted");
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
        <FormField>
          <FormFieldLabel>Write a comment</FormFieldLabel>
          <Input
            bordered
            placeholder="Add a comment..."
            validationStatus={validationStatus}
            endAdornment={
              inputValue && (
                <Button aria-label="Send comment" type="submit">
                  <SendIcon aria-hidden />
                </Button>
              )
            }
            value={inputValue}
            onChange={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setInputValue(value);
              if (value.trim()) {
                setValidationStatus(undefined);
              }
            }}
          />
          {validationStatus === "error" && (
            <FormFieldHelperText color="error">
              <FlexLayout gap={0.75} align="center">
                <StatusIndicator status="error" aria-hidden="true" />
                Comment can't be blank
              </FlexLayout>
            </FormFieldHelperText>
          )}
        </FormField>
      </form>
      <ul
        aria-label="Comments"
        style={{ listStyle: "none", margin: 0, padding: 0 }}
      >
        {comments.map((c, index) => (
          <li
            key={`${c.name}-${c.date}`}
            style={{
              borderTop:
                index > 0
                  ? "1px solid var(--salt-separable-secondary-borderColor)"
                  : "none",
            }}
          >
            <StackLayout padding={1} gap={1}>
              <FlexLayout gap={1}>
                <Avatar
                  size={1}
                  color="accent"
                  name={c.name}
                  aria-hidden="true"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0.5}>
                    <Text styleAs="h4">{c.name}</Text>
                    <Text styleAs="label" color="secondary">
                      {c.role} • {formatDate(c.date)}
                    </Text>
                  </StackLayout>
                  <Text>{c.text}</Text>
                </StackLayout>
              </FlexLayout>
            </StackLayout>
          </li>
        ))}
      </ul>
    </StackLayout>
  );
};

export const WithMultilineInput = () => (
  <AriaAnnouncerProvider>
    <WithMultilineInputContent />
  </AriaAnnouncerProvider>
);

const WithMultilineInputContent = () => {
  const { announce } = useAriaAnnouncer();
  const [inputValue, setInputValue] = useState("");
  const [validationStatus, setValidationStatus] = useState<
    "error" | "success" | undefined
  >(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  const MAX_CHARS = 1000;
  const counterId = "comment-char-counter";
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAtLimitRef = useRef(false);

  useEffect(() => {
    return () => {
      if (announceTimerRef.current) {
        clearTimeout(announceTimerRef.current);
      }
    };
  }, []);
  const [comments, setComments] = useState([
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
  ]);

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setValidationStatus("error");
      setErrorMessage("Comment can't be blank");
      return;
    }
    if (inputValue.length > MAX_CHARS) {
      setValidationStatus("error");
      setErrorMessage("Comment is too long. Maximum is 1000 characters.");
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
    announce("Comment posted");
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
        <FormField>
          <FormFieldLabel>Write a comment</FormFieldLabel>
          <MultilineInput
            bordered
            placeholder="Add a comment..."
            validationStatus={validationStatus}
            textAreaProps={{ "aria-describedby": counterId }}
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
            onChange={(e) => {
              const value = (e.target as HTMLInputElement).value;
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
                  );
                }
              } else {
                prevAtLimitRef.current = false;
                if (value.trim()) {
                  setValidationStatus(undefined);
                  setErrorMessage("");
                }
                if (announceTimerRef.current) {
                  clearTimeout(announceTimerRef.current);
                }
                announceTimerRef.current = setTimeout(() => {
                  if (value.length > 0) {
                    announce(
                      `${value.length} of ${MAX_CHARS} characters used.`,
                    );
                  }
                }, 1000);
              }
            }}
          />
          {validationStatus === "error" && (
            <FormFieldHelperText color="error">
              <FlexLayout gap={0.75} align="center">
                <StatusIndicator status="error" aria-hidden="true" />
                {errorMessage}
              </FlexLayout>
            </FormFieldHelperText>
          )}
        </FormField>
      </form>
      <ul
        aria-label="Comments"
        style={{ listStyle: "none", margin: 0, padding: 0 }}
      >
        {comments.map((c, index) => (
          <li
            key={`${c.name}-${c.date}`}
            style={{
              borderTop:
                index > 0
                  ? "1px solid var(--salt-separable-secondary-borderColor)"
                  : "none",
            }}
          >
            <StackLayout padding={1} gap={1}>
              <FlexLayout gap={1}>
                <Avatar
                  size={1}
                  color="accent"
                  name={c.name}
                  aria-hidden="true"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0.5}>
                    <Text styleAs="h4">{c.name}</Text>
                    <Text styleAs="label" color="secondary">
                      {c.role} • {formatDate(c.date)}
                    </Text>
                  </StackLayout>
                  <Text>{c.text}</Text>
                </StackLayout>
              </FlexLayout>
            </StackLayout>
          </li>
        ))}
      </ul>
    </StackLayout>
  );
};

export const WithEmptyState = () => {
  return (
    <StackLayout gap={3} style={{ maxWidth: "420px" }}>
      <div style={{ padding: "var(--salt-spacing-100)" }}>
        <FormField>
          <FormFieldLabel>Write a comment</FormFieldLabel>
          <Input
            bordered
            placeholder="Add a comment..."
            endAdornment={
              <Button aria-label="Send comment" disabled>
                <SendIcon aria-hidden />
              </Button>
            }
          />
        </FormField>
      </div>
      <StackLayout gap={3} align="center">
        <StatusIndicator status="info" size={2} />
        <FlexLayout direction="column" align="center" gap={0}>
          <Text>No comments yet.</Text>
          <Text>Be the first to comment.</Text>
        </FlexLayout>
      </StackLayout>
    </StackLayout>
  );
};

export const WithSubmissionError = () => {
  const [comments, _setComments] = useState([
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
  ]);

  return (
    <StackLayout gap={0} style={{ width: "100%", maxWidth: "420px" }}>
      <div style={{ padding: "var(--salt-spacing-100)" }}>
        <FormField>
          <FormFieldLabel>Write a comment</FormFieldLabel>
          <Input
            bordered
            placeholder="Add a comment..."
            endAdornment={
              <Button aria-label="Send comment" disabled>
                <SendIcon aria-hidden />
              </Button>
            }
          />
        </FormField>
      </div>
      <div style={{ padding: "var(--salt-spacing-100)" }}>
        <Banner status="error" variant="secondary">
          <BannerContent>
            <StackLayout gap={1}>
              <Text>
                <strong>Couldn’t post your comment</strong>
              </Text>
              <Text>
                You are offline. Check your connection and resubmit “I'll check
                if saved views are discoverable enough.”
              </Text>
            </StackLayout>
          </BannerContent>
          <BannerActions>
            <Button
              aria-label="Retry posting your comment"
              sentiment="neutral"
              appearance="transparent"
            >
              <RefreshIcon aria-hidden />
            </Button>
            <Button
              aria-label="Dismiss submission error"
              appearance="transparent"
            >
              <CloseIcon aria-hidden />
            </Button>
          </BannerActions>
        </Banner>
      </div>
      <ul
        aria-label="Comments"
        style={{ listStyle: "none", margin: 0, padding: 0 }}
      >
        {comments.map((c, index) => (
          <li
            key={`${c.name}-${c.date}`}
            style={{
              borderTop:
                index > 0
                  ? "1px solid var(--salt-separable-secondary-borderColor)"
                  : "none",
            }}
          >
            <StackLayout padding={1} gap={1}>
              <FlexLayout gap={1}>
                <Avatar
                  size={1}
                  color="accent"
                  name={c.name}
                  aria-hidden="true"
                />
                <StackLayout gap={1}>
                  <StackLayout gap={0.5}>
                    <Text styleAs="h4">{c.name}</Text>
                    <Text styleAs="label" color="secondary">
                      {c.role} • {formatDate(c.date)}
                    </Text>
                  </StackLayout>
                  <Text>{c.text}</Text>
                </StackLayout>
              </FlexLayout>
            </StackLayout>
          </li>
        ))}
      </ul>
    </StackLayout>
  );
};
