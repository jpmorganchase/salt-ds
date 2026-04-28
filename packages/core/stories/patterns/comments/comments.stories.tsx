import {
  Avatar,
  Banner,
  BannerActions,
  BannerContent,
  Button,
  Divider,
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
      <FormField style={{ padding: "var(--salt-spacing-100)", width: "auto" }}>
        <FormFieldLabel>Write a comment</FormFieldLabel>
        <Input
          style={{ height: "36px" }}
          bordered
          placeholder="Add a comment..."
          endAdornment={
            <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
              <SendIcon />
            </Button>
          }
          value={inputValue}
          onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </FormField>
      {comments.map((c, i) => (
        <StackLayout gap={0} key={`${c.name}-${c.date}`}>
          <StackLayout padding={1} gap={1}>
            <div>
              <Text styleAs="h4">{c.name}</Text>
              <Text styleAs="label" color="secondary">
                {c.role} • {c.date}
              </Text>
            </div>
            <Text>{c.text}</Text>
          </StackLayout>
          {i < comments.length - 1 && <Divider variant="tertiary" />}
        </StackLayout>
      ))}
    </StackLayout>
  );
};

export const CommentsWithAvatar = () => {
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
      <FormField style={{ padding: "var(--salt-spacing-100)", width: "auto" }}>
        <FormFieldLabel>Write a comment</FormFieldLabel>
        <Input
          style={{ height: "36px" }}
          bordered
          placeholder="Add a comment..."
          endAdornment={
            <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
              <SendIcon />
            </Button>
          }
          value={inputValue}
          onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </FormField>
      {comments.map((c, i) => (
        <StackLayout gap={0} key={`${c.name}-${c.date}`}>
          <StackLayout padding={1} gap={1}>
            <FlexLayout gap={1}>
              <Avatar size={1} color="accent" name={c.initials} />
              <StackLayout gap={1}>
                <div>
                  <Text styleAs="h4">{c.name}</Text>
                  <Text styleAs="label" color="secondary">
                    {c.role} • {c.date}
                  </Text>
                </div>
                <Text>{c.text}</Text>
              </StackLayout>
            </FlexLayout>
          </StackLayout>
          {i < comments.length - 1 && <Divider variant="tertiary" />}
        </StackLayout>
      ))}
    </StackLayout>
  );
};

export const CommentsWithMultilineInput = () => {
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
      <FormField style={{ padding: "var(--salt-spacing-100)", width: "auto" }}>
        <FormFieldLabel>Write a comment</FormFieldLabel>
        <MultilineInput
          bordered
          placeholder="Add a comment..."
          endAdornment={
            <>
              <Label>
                {`${inputValue.length}/${MAX_CHARS}`}
                <strong>{`${inputValue.length}/${MAX_CHARS}`}</strong>
              </Label>
              <Button onClick={handleSubmit} disabled={!inputValue.trim()}>
                <SendIcon />
              </Button>
            </>
          }
          value={inputValue}
          onChange={(e) => setInputValue((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </FormField>
      {comments.map((c, i) => (
        <StackLayout gap={0} key={`${c.name}-${c.date}`}>
          <StackLayout padding={1} gap={1}>
            <FlexLayout gap={1}>
              <Avatar size={1} color="accent" name={c.initials} />
              <StackLayout gap={1}>
                <div>
                  <Text styleAs="h4">{c.name}</Text>
                  <Text styleAs="label" color="secondary">
                    {c.role} • {c.date}
                  </Text>
                </div>
                <Text>{c.text}</Text>
              </StackLayout>
            </FlexLayout>
          </StackLayout>
          {i < comments.length - 1 && <Divider variant="tertiary" />}
        </StackLayout>
      ))}
    </StackLayout>
  );
};

export const CommentsWithEmptyState = () => {
  return (
    <StackLayout gap={3} style={{ width: "420px" }}>
      <FormField>
        <FormFieldLabel>Write a comment</FormFieldLabel>
        <Input
          style={{ height: "36px" }}
          bordered
          placeholder="Add a comment..."
          endAdornment={
            <Button disabled>
              <SendIcon />
            </Button>
          }
        />
      </FormField>
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

export const CommentsWithSubmissionError = () => {
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
      <FormField style={{ padding: "var(--salt-spacing-100)", width: "auto" }}>
        <FormFieldLabel>Write a comment</FormFieldLabel>
        <Input
          style={{ height: "36px" }}
          bordered
          placeholder="Add a comment..."
          endAdornment={
            <Button disabled>
              <SendIcon />
            </Button>
          }
        />
      </FormField>
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
      {comments.map((c, i) => (
        <StackLayout gap={0} key={`${c.name}-${c.date}`}>
          <StackLayout padding={1} gap={1}>
            <FlexLayout gap={1}>
              <Avatar size={1} color="accent" name={c.initials} />
              <StackLayout gap={1}>
                <div>
                  <Text styleAs="h4">{c.name}</Text>
                  <Text styleAs="label" color="secondary">
                    {c.role} • {c.date}
                  </Text>
                </div>
                <Text>{c.text}</Text>
              </StackLayout>
            </FlexLayout>
          </StackLayout>
          {i < comments.length - 1 && <Divider variant="tertiary" />}
        </StackLayout>
      ))}
    </StackLayout>
  );
};
