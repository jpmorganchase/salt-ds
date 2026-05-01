import {
  Avatar,
  Banner,
  BannerActions,
  BannerContent,
  Button,
  FlexLayout,
  FormField,
  FormFieldLabel,
  Input,
  Label,
  MultilineInput,
  StackLayout,
  StatusIndicator,
  Text,
} from "@salt-ds/core";
import { CloseIcon, RefreshIcon, SendIcon } from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import { useState } from "react";

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

export const Default = () => {
  const [inputValue, setInputValue] = useState("");
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
    if (!inputValue.trim()) return;
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
  };

  return (
    <StackLayout gap={0} style={{ width: "420px" }}>
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
            endAdornment={
              <Button
                aria-label="Send comment"
                type="submit"
                disabled={!inputValue.trim()}
              >
                <SendIcon aria-hidden />
              </Button>
            }
            value={inputValue}
            onChange={(e) =>
              setInputValue((e.target as HTMLInputElement).value)
            }
          />
        </FormField>
      </form>
      <StackLayout gap={0} separators>
        {comments.map((c) => (
          <StackLayout padding={1} gap={1} key={`${c.name}-${c.date}`}>
            <StackLayout gap={0.5}>
              <Text styleAs="h4">{c.name}</Text>
              <Text styleAs="label" color="secondary">
                {c.role} • {formatDate(c.date)}
              </Text>
            </StackLayout>
            <Text>{c.text}</Text>
          </StackLayout>
        ))}
      </StackLayout>
    </StackLayout>
  );
};

export const WithAvatar = () => {
  const [inputValue, setInputValue] = useState("");
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
    if (!inputValue.trim()) return;
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
  };

  return (
    <StackLayout gap={0} style={{ width: "420px" }}>
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
            endAdornment={
              <Button
                aria-label="Send comment"
                type="submit"
                disabled={!inputValue.trim()}
              >
                <SendIcon aria-hidden />
              </Button>
            }
            value={inputValue}
            onChange={(e) =>
              setInputValue((e.target as HTMLInputElement).value)
            }
          />
        </FormField>
      </form>
      <StackLayout gap={0} separators>
        {comments.map((c) => (
          <StackLayout padding={1} gap={1} key={`${c.name}-${c.date}`}>
            <FlexLayout gap={1}>
              <Avatar size={1} color="accent" name={c.name} />
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
        ))}
      </StackLayout>
    </StackLayout>
  );
};

export const WithMultilineInput = () => {
  const [inputValue, setInputValue] = useState("");
  const MAX_CHARS = 1000;
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
    if (!inputValue.trim()) return;
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
  };

  return (
    <StackLayout gap={0} style={{ width: "420px" }}>
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
            endAdornment={
              <>
                <Label>{`${inputValue.length}/${MAX_CHARS}`}</Label>
                <Button
                  aria-label="Send comment"
                  type="submit"
                  disabled={!inputValue.trim()}
                >
                  <SendIcon aria-hidden />
                </Button>
              </>
            }
            value={inputValue}
            onChange={(e) =>
              setInputValue((e.target as HTMLInputElement).value)
            }
          />
        </FormField>
      </form>
      <StackLayout gap={0} separators>
        {comments.map((c) => (
          <StackLayout padding={1} gap={1} key={`${c.name}-${c.date}`}>
            <FlexLayout gap={1}>
              <Avatar size={1} color="accent" name={c.name} />
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
        ))}
      </StackLayout>
    </StackLayout>
  );
};

export const WithEmptyState = () => {
  return (
    <StackLayout gap={3} style={{ width: "420px" }}>
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
    <StackLayout gap={0} style={{ width: "420px" }}>
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
      <Banner
        status="error"
        variant="secondary"
        style={{ width: "404px", margin: "var(--salt-spacing-100)" }}
      >
        <BannerContent>
          <StackLayout gap={1}>
            <Text>
              <strong>Couldn’t post your comment</strong>
            </Text>
            <Text>
              You are offline. Check your connection and resubmit “I'll check if
              saved views are discoverable enough.”
            </Text>
          </StackLayout>
        </BannerContent>
        <BannerActions>
          <Button
            aria-label="Retry"
            sentiment="neutral"
            appearance="transparent"
          >
            <RefreshIcon aria-hidden />
          </Button>
          <Button aria-label="Close" appearance="transparent">
            <CloseIcon aria-hidden />
          </Button>
        </BannerActions>
      </Banner>
      <StackLayout gap={0} separators>
        {comments.map((c) => (
          <StackLayout padding={1} gap={1} key={`${c.name}-${c.date}`}>
            <FlexLayout gap={1}>
              <Avatar size={1} color="accent" name={c.name} />
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
        ))}
      </StackLayout>
    </StackLayout>
  );
};
