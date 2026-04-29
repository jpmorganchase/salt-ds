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
  Text,
} from "@salt-ds/core";
import { CloseIcon, InfoIcon, RefreshIcon, SendIcon } from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Patterns/Comments",
} as Meta;

export const Default = () => {
  const [inputValue, setInputValue] = useState("");
  const [comments, setComments] = useState([
    {
      name: "Alex Rivera",
      role: "Data Analyst",
      date: "01 Apr 2026, 09:26 AM",
      text: "Date range + status. Also the saved views are super helpful.",
    },
    {
      name: "Jordan Lee",
      role: "Product Manager",
      date: "01 Apr 2026, 09:20 AM",
      text: "Has anyone tried filtering by region and date?",
    },
  ]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setComments([
      {
        name: "Sam Patel",
        role: "UX Designer",
        date: new Date()
          .toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace(",", " •"),
        text: inputValue,
      },
      ...comments,
    ]);
    setInputValue("");
  };

  return (
    <StackLayout gap={0} style={{ width: "420px" }}>
      <div style={{ padding: "var(--salt-spacing-100)" }}>
        <FormField>
          <FormFieldLabel>Write a comment</FormFieldLabel>
          <Input
            bordered
            placeholder="Add a comment..."
            endAdornment={
              <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
                <SendIcon />
              </Button>
            }
            value={inputValue}
            onChange={(e) =>
              setInputValue((e.target as HTMLInputElement).value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </FormField>
      </div>
      <StackLayout gap={0} separators>
        {comments.map((c) => (
          <StackLayout padding={1} gap={1} key={`${c.name}-${c.date}`}>
            <StackLayout gap={0.5}>
              <Text styleAs="h4">{c.name}</Text>
              <Text styleAs="label" color="secondary">
                {c.role} • {c.date}
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
      initials: "AR",
      role: "Data Analyst",
      date: "01 Apr 2026, 09:26 AM",
      text: "Date range + status. Also the saved views are super helpful.",
    },
    {
      name: "Jordan Lee",
      initials: "JL",
      role: "Product Manager",
      date: "01 Apr 2026, 09:20 AM",
      text: "Has anyone tried filtering by region and date?",
    },
  ]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setComments([
      {
        name: "Sam Patel",
        initials: "SP",
        role: "UX Designer",
        date: new Date()
          .toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace(",", " •"),
        text: inputValue,
      },
      ...comments,
    ]);
    setInputValue("");
  };

  return (
    <StackLayout gap={0} style={{ width: "420px" }}>
      <div style={{ padding: "var(--salt-spacing-100)" }}>
        <FormField>
          <FormFieldLabel>Write a comment</FormFieldLabel>
          <Input
            bordered
            placeholder="Add a comment..."
            endAdornment={
              <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
                <SendIcon />
              </Button>
            }
            value={inputValue}
            onChange={(e) =>
              setInputValue((e.target as HTMLInputElement).value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </FormField>
      </div>
      <StackLayout gap={0} separators>
        {comments.map((c) => (
          <StackLayout padding={1} gap={1} key={`${c.name}-${c.date}`}>
            <FlexLayout gap={1}>
              <Avatar size={1} color="accent" name={c.initials} />
              <StackLayout gap={1}>
                <StackLayout gap={0.5}>
                  <Text styleAs="h4">{c.name}</Text>
                  <Text styleAs="label" color="secondary">
                    {c.role} • {c.date}
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
      initials: "AR",
      role: "Data Analyst",
      date: "01 Apr 2026, 09:26 AM",
      text: "Date range + status. Also the saved views are super helpful.",
    },
    {
      name: "Jordan Lee",
      initials: "JL",
      role: "Product Manager",
      date: "01 Apr 2026, 09:20 AM",
      text: "Has anyone tried filtering by region and date?",
    },
  ]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setComments([
      {
        name: "Sam Patel",
        initials: "SP",
        role: "UX Designer",
        date: new Date()
          .toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace(",", " •"),
        text: inputValue,
      },
      ...comments,
    ]);
    setInputValue("");
  };

  return (
    <StackLayout gap={0} style={{ width: "420px" }}>
      <div style={{ padding: "var(--salt-spacing-100)" }}>
        <FormField>
          <FormFieldLabel>Write a comment</FormFieldLabel>
          <MultilineInput
            bordered
            placeholder="Add a comment..."
            endAdornment={
              <>
                <Label>{`${inputValue.length}/${MAX_CHARS}`}</Label>
                <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
                  <SendIcon />
                </Button>
              </>
            }
            value={inputValue}
            onChange={(e) =>
              setInputValue((e.target as HTMLInputElement).value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </FormField>
      </div>
      <StackLayout gap={0} separators>
        {comments.map((c) => (
          <StackLayout padding={1} gap={1} key={`${c.name}-${c.date}`}>
            <FlexLayout gap={1}>
              <Avatar size={1} color="accent" name={c.initials} />
              <StackLayout gap={1}>
                <StackLayout gap={0.5}>
                  <Text styleAs="h4">{c.name}</Text>
                  <Text styleAs="label" color="secondary">
                    {c.role} • {c.date}
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
              <Button disabled>
                <SendIcon />
              </Button>
            }
          />
        </FormField>
      </div>
      <StackLayout gap={3} align="center">
        <InfoIcon
          style={{
            color: "white",
            backgroundColor: "var(--salt-status-info-foreground-decorative)",
          }}
          size={2}
        />
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
      initials: "AR",
      role: "Data Analyst",
      date: "01 Apr 2026, 09:26 AM",
      text: "Date range + status. Also the saved views are super helpful.",
    },
    {
      name: "Jordan Lee",
      initials: "JL",
      role: "Product Manager",
      date: "01 Apr 2026, 09:20 AM",
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
              <Button disabled>
                <SendIcon />
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
          <Button sentiment="neutral" appearance="transparent">
            <RefreshIcon />
          </Button>
          <Button aria-label="close" appearance="transparent">
            <CloseIcon />
          </Button>
        </BannerActions>
      </Banner>
      <StackLayout gap={0} separators>
        {comments.map((c) => (
          <StackLayout padding={1} gap={1} key={`${c.name}-${c.date}`}>
            <FlexLayout gap={1}>
              <Avatar size={1} color="accent" name={c.initials} />
              <StackLayout gap={1}>
                <StackLayout gap={0.5}>
                  <Text styleAs="h4">{c.name}</Text>
                  <Text styleAs="label" color="secondary">
                    {c.role} • {c.date}
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
