import {
  Button,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
  Text,
  useAriaAnnouncer,
} from "@salt-ds/core";
import { SendIcon } from "@salt-ds/icons";
import type { ChangeEvent, ReactNode } from "react";
import { useRef, useState } from "react";

export interface Comment {
  name: string;
  role: string;
  date: number;
  text: string;
}

export const initialComments: Comment[] = [
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
  new Date(timestamp).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

export function CommentList({
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

export function useCommentForm(initialData: Comment[] = initialComments) {
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
      return;
    }
    setValidationStatus(undefined);
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
    inputRef.current?.focus();
    requestAnimationFrame(() => {
      announce("Comment posted");
    });
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
