import {
  Button,
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel,
  FormFieldLabel as FormLabel,
  Input,
} from "@salt-ds/core";
import { TokenizedInputNext } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import {
  ChangeEventHandler,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { statesData } from "../assets/exampleData";

export default {
  title: "Lab/Tokenized Input Next",
  component: TokenizedInputNext,
} as Meta<typeof TokenizedInputNext>;

const NUMBER_REGEX = /^(|[1-9][0-9]*)$/;

const getRandomNumber = () => Math.floor(Math.random() * 99 + 1);

const TokenizedInputNextTemplate: StoryFn<typeof TokenizedInputNext> = (
  props
) => {
  const handleChange = (selectedItems: unknown) => {
    console.log("selection changed", selectedItems);
  };
  return (
      <TokenizedInputNext
        style={{ width: "266px" }}
        onChange={handleChange}
        {...props}
      />
  );
};

export const Default = TokenizedInputNextTemplate.bind({});
Default.args = {};

export const WithCollapsedButton = TokenizedInputNextTemplate.bind({});
WithCollapsedButton.args = {
  defaultSelected: statesData
};

export const Controlled: StoryFn<typeof TokenizedInputNext> = () => {
  const buttonsRef = useRef<HTMLDivElement>(null);

  const [option, setOption] = useState(42);
  const [inputValue, setInputValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [offsetHeight, setOffsetHeight] = useState(0);

  useLayoutEffect(() => {
    if (buttonsRef.current) {
      setOffsetHeight(buttonsRef.current.getBoundingClientRect().height);
    }
  }, [buttonsRef]);

  const handleAddRandomOption = () => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.concat(String(option))
    );
    setOption(getRandomNumber());
  };

  const handleInputChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    const newValue = event.target.value.trim();

    if (NUMBER_REGEX.exec(newValue)) {
      setInputValue(newValue);
    }
  };

  const handleChange: ChangeEventHandler<HTMLElement> = (event) => {
    console.log(event)
    //TODO: get newtems from event
    setInputValue("");
    setSelectedItems(newItems as string[]);
  };

  const handleClear = () => {
    setInputValue("");
    setSelectedItems([]);
  };

  return (
    <div
      style={{
        width: "calc(100vw - 40px)",
        height: "50vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          maxWidth: 292,
        }}
      >
        <div
          ref={buttonsRef}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 5,
          }}
        >
          <Button onClick={handleAddRandomOption}>Add {option}</Button>
        </div>
        <div style={{ height: `calc(100% - ${offsetHeight}px)` }}>
          <FormField>
            <FormLabel>Natural numbers only</FormLabel>
            <TokenizedInputNext
              onChange={handleChange}
              onClear={handleClear}
              onInputChange={handleInputChange}
              selectedItems={selectedItems}
              value={inputValue}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export const Disabled: StoryFn<typeof TokenizedInputNext> = () => {
  return (
    <div
      style={{
        width: "calc(100vw - 40px)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <FormField disabled style={{ maxWidth: 292 }}>
        <FormFieldLabel>Enter a value</FormFieldLabel>
        <TokenizedInputNext
          disabled
          defaultSelected={["Value 1", "Value 2", "Value 3"]}
        />
      </FormField>
    </div>
  );
};

type Validator = (values: string[]) => string | null;

export const WithValidation: StoryFn<typeof TokenizedInputNext> = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [exceptions, setExceptions] = useState<string[]>([]);

  const validations: Validator[] = [
    (newItems) => {
      const upperCased = newItems.map((value) => value.toUpperCase());
      const validated: string[] = [];

      for (let i = 0; i < upperCased.length; i++) {
        if (validated.indexOf(upperCased[i]) !== -1) {
          return `'${newItems[i]}' is already selected.`;
        }
        validated.push(upperCased[i]);
      }

      return null;
    },
  ];

  const handleInputChange: ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    setExceptions([]);
    setInputValue(event.target.value);
  };

  const handleChange: ChangeHandler<unknown> = (newItems) => {
    const newExceptions = validations.reduce<string[]>((results, validate) => {
      const result = validate(newItems as string[]);
      return result != null ? results.concat(result) : results;
    }, []);

    if (newExceptions.length === 0) {
      setInputValue("");
      setSelectedItems(newItems as string[]);
    } else {
      setExceptions(newExceptions);
    }
  };

  const handleClear = () => {
    setExceptions([]);
    setInputValue("");
    setSelectedItems([]);
  };

  return (
    <div
      style={{
        width: "calc(100vw - 40px)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <FormField
        style={{ maxWidth: 292 }}
        validationStatus={exceptions.length > 0 ? "error" : undefined}
      >
        <FormLabel>No duplication</FormLabel>
        <TokenizedInputNext
          onChange={handleChange}
          onClear={handleClear}
          onInputChange={handleInputChange}
          selectedItems={selectedItems}
          value={inputValue}
        />
        <FormHelperText>{exceptions.join(", ")}</FormHelperText>
      </FormField>
    </div>
  );
};

export const WithCustomizedDelimiter: StoryFn<
  typeof TokenizedInputNext
> = () => {
  const buttonsRef = useRef<HTMLDivElement>(null);

  const savedDelimiter = useRef(",");
  const [delimiter, setDelimiter] = useState(",");
  const [isLocked, updateLock] = useState(true);
  const [offsetHeight, setOffsetHeight] = useState(0);

  useEffect(() => {
    if (!isLocked) {
      savedDelimiter.current = delimiter;
    }
  }, [isLocked, delimiter]);

  useLayoutEffect(() => {
    if (buttonsRef.current) {
      setOffsetHeight(buttonsRef.current.getBoundingClientRect().height);
    }
  }, []);

  const handleChange: ChangeHandler<unknown> = (selectedItems) => {
    console.log("selection changed", selectedItems);
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setDelimiter(event.target.value);
  };

  return (
    <div
      style={{
        width: "calc(100vw - 40px)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          maxWidth: 292,
        }}
      >
        <div
          ref={buttonsRef}
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: 10,
          }}
        >
          {isLocked ? (
            <div>
              Using delimiter &quot;<strong>{delimiter}</strong>&quot;
            </div>
          ) : (
            <FormField style={{ height: `calc(100% - ${offsetHeight}px)` }}>
              <FormFieldLabel>Enter a delimiter</FormFieldLabel>
              <Input
                inputProps={{ maxLength: 1 }}
                onChange={handleInputChange}
                style={{ maxWidth: 180 }}
              />{" "}
            </FormField>
          )}
          <Button
            onClick={() => updateLock((locked) => !locked)}
            style={{ marginLeft: 10 }}
          >
            {isLocked ? "Modify" : "Save"}
          </Button>
        </div>
        <FormField style={{ height: `calc(100% - ${offsetHeight}px)` }}>
          <FormFieldLabel>Enter a value</FormFieldLabel>
          <TokenizedInputNext
            delimiters={[savedDelimiter.current]}
            disabled={!isLocked}
            defaultSelected={["Value 1", "Value 2"]}
            key={`input-delimiter-${savedDelimiter.current}`}
            onChange={handleChange}
          />
        </FormField>
      </div>
    </div>
  );
};
