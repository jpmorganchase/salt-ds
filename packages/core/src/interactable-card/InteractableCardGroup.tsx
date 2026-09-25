import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  makePrefixer,
  ownerDocument,
  useControlled,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "../utils";
import interactableCardGroupCss from "./InteractableCardGroup.css";
import {
  InteractableCardGroupContext,
  type InteractableCardValue,
} from "./InteractableCardGroupContext";

export interface InteractableCardGroupProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /**
   * The default value. Use when the component is not controlled. Should be an array when `multiSelect` is true.
   */
  defaultValue?: InteractableCardValue;
  /**
   * If `true`, the Interactable Card Group will be disabled.
   */
  disabled?: boolean;
  /**
   * The value. Use when the component is controlled. Should be an array when `multiSelect` is true.
   */
  value?: InteractableCardValue;
  /**
   * If `true` the Interactable Card Group will allow multiple selection functionality, with keyboard interactions matching those of a checkbox.
   * By default the group allows mutually exclusive selection with keyboard interactions matching radio buttons.
   */
  multiSelect?: boolean;
  /**
   * Callback fired when the selection changes.
   * @param event
   */
  onChange?: (
    event: SyntheticEvent<HTMLDivElement>,
    value: InteractableCardValue,
  ) => void;
}

const withBaseName = makePrefixer("saltInteractableCardGroup");

interface RegisteredCard {
  element: HTMLElement;
  value: InteractableCardValue;
}

const sortCards = (cards: RegisteredCard[]) =>
  [...cards].sort((cardA, cardB) => {
    const position = cardA.element.compareDocumentPosition(cardB.element);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });

const cardsAreEqual = (cardsA: RegisteredCard[], cardsB: RegisteredCard[]) =>
  cardsA.length === cardsB.length &&
  cardsA.every(
    (card, index) =>
      card.element === cardsB[index].element &&
      card.value === cardsB[index].value,
  );

export const InteractableCardGroup = forwardRef<
  HTMLDivElement,
  InteractableCardGroupProps
>(function InteractableCardGroup(props, ref) {
  const {
    children,
    className,
    value: valueProp,
    defaultValue,
    disabled,
    onChange,
    onKeyDown,
    multiSelect,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-interactable-card-group",
    css: interactableCardGroupCss,
    window: targetWindow,
  });

  const groupRef = useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(ref, groupRef);

  const [value, setValue] = useControlled({
    default: defaultValue,
    controlled: valueProp,
    name: "InteractableCardGroup",
    state: "value",
  });

  const [enabledCards, setEnabledCards] = useState<RegisteredCard[]>([]);

  const registerCard = useCallback(
    (cardValue: InteractableCardValue, element: HTMLElement) => {
      const card = { element, value: cardValue };
      setEnabledCards((currentCards) =>
        sortCards([
          ...currentCards.filter(
            (currentCard) => currentCard.element !== element,
          ),
          card,
        ]),
      );

      return () => {
        setEnabledCards((currentCards) => {
          const currentCard = currentCards.find(
            (registeredCard) => registeredCard.element === element,
          );
          return currentCard === card
            ? currentCards.filter((registeredCard) => registeredCard !== card)
            : currentCards;
        });
      };
    },
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-sorts registered cards after children move.
  useIsomorphicLayoutEffect(() => {
    setEnabledCards((currentCards) => {
      const sortedCards = sortCards(currentCards);
      return cardsAreEqual(currentCards, sortedCards)
        ? currentCards
        : sortedCards;
    });
  }, [children]);

  const select = useCallback(
    (
      event: SyntheticEvent<HTMLDivElement>,
      newValue: InteractableCardValue,
    ) => {
      if (multiSelect) {
        const currentValues = Array.isArray(value) ? value : [];
        const isSelected = currentValues.includes(newValue);

        const nextValues = isSelected
          ? currentValues.filter((val) => val !== newValue)
          : [...currentValues, newValue];
        setValue(nextValues);
        onChange?.(event, nextValues);
      } else {
        setValue(newValue);
        if (value !== newValue) {
          onChange?.(event, newValue);
        }
      }
    },
    [onChange, value, multiSelect],
  );

  const isSelected = useCallback(
    (cardValue: InteractableCardValue) =>
      multiSelect
        ? Array.isArray(value) && value.includes(cardValue)
        : cardValue !== undefined && value === cardValue,
    [value, multiSelect],
  );

  const isFirstChild = useCallback(
    (cardValue: InteractableCardValue) => {
      return enabledCards.findIndex((card) => card.value === cardValue) === 0;
    },
    [enabledCards],
  );

  const contextValue = useMemo(
    () => ({
      select,
      registerCard,
      hasEnabledSelection:
        !multiSelect &&
        typeof value === "string" &&
        enabledCards.some((card) => card.value === value),
      isSelected,
      isFirstChild,
      disabled,
      multiSelect,
      value,
    }),
    [
      select,
      registerCard,
      enabledCards,
      isSelected,
      disabled,
      multiSelect,
      isFirstChild,
      value,
    ],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const doc = ownerDocument(groupRef.current);

    const currentCard = (doc.activeElement as HTMLElement | null)?.closest(
      ".saltInteractableCard",
    );
    // Only enabled cards are registered; other key events just call onKeyDown.
    const currentIndex = currentCard
      ? enabledCards.findIndex((card) => card.element === currentCard)
      : -1;

    if (currentIndex === -1) {
      onKeyDown?.(event);
      return;
    }

    const nextIndex = (currentIndex + 1) % enabledCards.length;
    const prevIndex =
      (currentIndex - 1 + enabledCards.length) % enabledCards.length;

    if (event.key === " ") {
      event.preventDefault();
      select(event, enabledCards[currentIndex].value);
    }

    if (!multiSelect) {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          select(event, enabledCards[nextIndex].value);
          enabledCards[nextIndex]?.element.focus();
          break;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          select(event, enabledCards[prevIndex].value);
          enabledCards[prevIndex]?.element.focus();
          break;
      }
    }
    onKeyDown?.(event);
  };

  return (
    <InteractableCardGroupContext.Provider value={contextValue}>
      <div
        className={clsx(withBaseName(), className)}
        role={multiSelect ? "group" : "radiogroup"}
        onKeyDown={handleKeyDown}
        ref={handleRef}
        {...rest}
      >
        {children}
      </div>
    </InteractableCardGroupContext.Provider>
  );
});
