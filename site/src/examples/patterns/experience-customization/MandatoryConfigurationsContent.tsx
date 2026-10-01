import {
  Banner,
  BannerContent,
  Button,
  FlexItem,
  FlexLayout,
  GridLayout,
  InteractableCard,
  InteractableCardGroup,
  type InteractableCardValue,
  RadioButtonIcon,
  StackLayout,
  type StackLayoutProps,
  Text,
  useAriaAnnouncer,
  useId,
  useResponsiveProp,
} from "@salt-ds/core";
import { BuildingIcon, GlobeIcon, LockedIcon } from "@salt-ds/icons";
import { type ElementType, useState } from "react";
import { ContentOverflow } from "../wizard/ContentOverflow";

export const MandatoryConfigurationsContent = () => {
  const [selected, setSelected] = useState<InteractableCardValue>();
  const [hasError, setHasError] = useState(false);

  const { announce } = useAriaAnnouncer();

  const ERROR_MESSAGE = "Choose an option.";

  const handleSubmit = () => {
    if (!selected) {
      setHasError(true);
      announce(ERROR_MESSAGE, { ariaLive: "assertive" });
    }
  };

  const governanceOptions = [
    {
      value: "standard",
      title: "Standard",
      description: "Business-recommended. Standard access logging is enabled.",
      Icon: BuildingIcon,
    },
    {
      value: "restricted",
      title: "Restricted",
      description: "High compliance. Full data logging and MFA are required.",
      Icon: LockedIcon,
    },
    {
      value: "external",
      title: "External",
      description: "Allow controlled access for partners.",
      Icon: GlobeIcon,
    },
  ];

  const headingId = useId();

  const direction: StackLayoutProps<ElementType>["direction"] =
    useResponsiveProp(
      {
        xs: "column",
        sm: "row",
      },
      "row",
    );

  const cancel = (
    <Button
      sentiment="accented"
      appearance="bordered"
      onClick={() => {
        setSelected(undefined);
        setHasError(false);
      }}
    >
      Cancel
    </Button>
  );

  const finish = (
    <Button sentiment="accented" onClick={handleSubmit}>
      Finish
    </Button>
  );

  return (
    <StackLayout gap={0} style={{ maxWidth: 730 }}>
      <StackLayout padding={3}>
        <div>
          <Text as="h1" styleAs="h2" style={{ margin: 0 }} id={headingId}>
            <Text color="primary">Customize your experience</Text>
            Choose data access level
          </Text>
          <Text
            color="secondary"
            style={{
              marginTop: "var(--salt-spacing-50)",
            }}
          >
            A selection is required to proceed
          </Text>
        </div>
      </StackLayout>

      <StackLayout>
        <FlexItem grow={1}>
          <ContentOverflow style={{ minHeight: 300 }}>
            <StackLayout>
              {hasError && (
                <Banner status="error">
                  <BannerContent>Choose an option.</BannerContent>
                </Banner>
              )}

              <InteractableCardGroup
                aria-labelledby={headingId}
                value={selected}
                onChange={(_event, value) => {
                  setHasError(false);
                  setSelected(value);
                }}
              >
                <GridLayout
                  style={{ width: "100%" }}
                  columns={{ xs: 1, sm: 3 }}
                >
                  {governanceOptions.map(
                    ({ value, title, description, Icon }) => (
                      <InteractableCard key={value} value={value}>
                        <StackLayout gap={1}>
                          <StackLayout gap={1} direction="row" align="center">
                            <Icon aria-hidden size={2} />
                            <Text styleAs="h3" style={{ margin: 0 }}>
                              {title}
                            </Text>
                          </StackLayout>
                          <StackLayout direction="row" gap={1}>
                            <RadioButtonIcon
                              aria-hidden
                              checked={selected === value}
                            />
                            <Text>{description}</Text>
                          </StackLayout>
                        </StackLayout>
                      </InteractableCard>
                    ),
                  )}
                </GridLayout>
              </InteractableCardGroup>
            </StackLayout>
          </ContentOverflow>
        </FlexItem>

        <FlexItem>
          {direction === "column" ? (
            <StackLayout gap={1}>
              {finish}
              {cancel}
            </StackLayout>
          ) : (
            <FlexLayout gap={1} justify="end" padding={3}>
              {cancel}
              {finish}
            </FlexLayout>
          )}
        </FlexItem>
      </StackLayout>
    </StackLayout>
  );
};
