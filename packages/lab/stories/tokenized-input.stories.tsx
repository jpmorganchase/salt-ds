import { Button, FormField } from "@jpmorganchase/uitk-core";
import { ChangeHandler, Input, TokenizedInput } from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import {
  ChangeEventHandler,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export default {
  title: "Lab/Tokenized Input",
  component: TokenizedInput,
} as ComponentMeta<typeof TokenizedInput>;

const NUMBER_REGEX = /^(|[1-9][0-9]*)$/;

const getRandomNumber = () => Math.floor(Math.random() * 99 + 1);

export const Controlled: ComponentStory<typeof TokenizedInput> = () => {
  const buttonsRef = useRef<HTMLDivElement>(null);

  const [option, setOption] = useState(42);
  const [inputValue, setInputValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<Array<string>>([]);

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

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.value.trim();

    if (NUMBER_REGEX.exec(newValue)) {
      setInputValue(newValue);
    }
  };

  const handleChange: ChangeHandler<unknown> = (newItems) => {
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
          <FormField label="Natural numbers only">
            <TokenizedInput
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

export const Default: ComponentStory<typeof TokenizedInput> = () => {
  const handleChange = (selectedItems: unknown) => {
    console.log("selection changed", selectedItems);
  };
  return (
    // Background color for debug purposes only
    <div
      style={{
        background: "aliceblue",
        width: "calc(100vw - 40px)",
        height: "50vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <TokenizedInput
        onChange={handleChange}
        style={{ maxWidth: 292 }}
        initialSelectedItems={[
          "abc",
          "defghi",
          "jklm",
          "nopqrstu",
          "vwexyz",
          "very looooooooooong looooooooooong long pill",
        ]}
      />
    </div>
  );
};

export const Disabled: ComponentStory<typeof TokenizedInput> = () => {
  return (
    <div
      style={{
        width: "calc(100vw - 40px)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <FormField disabled label="Enter a value" style={{ maxWidth: 292 }}>
        <TokenizedInput
          initialSelectedItems={["Value 1", "Value 2", "Value 3"]}
        />
      </FormField>
    </div>
  );
};

type Validator = (values: Array<string>) => string | null;

export const WithValidation: ComponentStory<typeof TokenizedInput> = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectedItems, setSelectedItems] = useState<Array<string>>([]);
  const [exceptions, setExceptions] = useState<Array<string>>([]);

  const validations: Array<Validator> = [
    (newItems) => {
      const upperCased = newItems.map((value) => value.toUpperCase());
      const validated: Array<string> = [];

      for (let i = 0; i < upperCased.length; i++) {
        if (validated.indexOf(upperCased[i]) !== -1) {
          return `'${newItems[i]}' is already selected.`;
        }
        validated.push(upperCased[i]);
      }

      return null;
    },
  ];

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setExceptions([]);
    setInputValue(event.target.value);
  };

  const handleChange: ChangeHandler<unknown> = (newItems) => {
    const newExceptions = validations.reduce<Array<string>>(
      (results, validate) => {
        const result = validate(newItems as string[]);
        return result != null ? results.concat(result) : results;
      },
      []
    );

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
        helperText={exceptions.join(", ")}
        label="No duplication"
        style={{ maxWidth: 292 }}
        validationState={exceptions.length > 0 ? "error" : undefined}
      >
        <TokenizedInput
          onChange={handleChange}
          onClear={handleClear}
          onInputChange={handleInputChange}
          selectedItems={selectedItems}
          value={inputValue}
        />
      </FormField>
    </div>
  );
};

export const WithCustomizedDelimiter: ComponentStory<
  typeof TokenizedInput
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
            <div style={{ color: "grey" }}>
              Using delimiter &quot;<strong>{delimiter}</strong>&quot;
            </div>
          ) : (
            <Input
              inputProps={{ maxLength: 1 }}
              onChange={handleInputChange}
              placeholder="Enter a delimiter"
              style={{ maxWidth: 180 }}
            />
          )}
          <Button
            onClick={() => updateLock((locked) => !locked)}
            style={{ marginLeft: 10 }}
          >
            {isLocked ? "Modify" : "Save"}
          </Button>
        </div>
        <FormField
          label="Enter a value"
          style={{ height: `calc(100% - ${offsetHeight}px)` }}
        >
          <TokenizedInput
            delimiter={savedDelimiter.current}
            disabled={!isLocked}
            initialSelectedItems={["Value 1", "Value 2"]}
            key={`input-delimiter-${savedDelimiter.current}`}
            onChange={handleChange}
          />
        </FormField>
      </div>
    </div>
  );
};
