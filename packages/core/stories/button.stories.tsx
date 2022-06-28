import { ReactNode } from "react";
import {
  Button,
  ButtonProps,
  Density,
  ToolkitProvider,
} from "@jpmorganchase/uitk-core";
import { NotificationIcon, SearchIcon } from "@jpmorganchase/uitk-icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import "./Theme.stories.newapp-theme.css";
import "./Button.stories.newapp-button.css";

export default {
  title: "Core/Button",
  component: Button,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as ComponentMeta<typeof Button>;

const SingleButtonTemplate: ComponentStory<typeof Button> = (props) => {
  return <Button {...props} />;
};

const ButtonGrid = ({
  className = "",
  label,
  variant,
}: {
  className?: string;
  label: string;
  variant: ButtonProps["variant"];
}) => {
  const handleClick = () => {
    console.log("clicked");
  };

  const buttonLabel = `${label} Button`;
  return (
    <>
      <div
        className={className}
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto",
          gridTemplateRows: "auto",
          gridGap: 10,
        }}
      >
        <Button variant={variant} onClick={handleClick}>
          {buttonLabel}
        </Button>
        <Button variant={variant} onClick={handleClick}>
          <SearchIcon size={12} />
        </Button>
        <Button variant={variant} onClick={handleClick}>
          <SearchIcon size={12} />
          {` ${buttonLabel}`}
        </Button>
      </div>
      <br />
      <div>
        <Button
          elementType="a"
          onClick={handleClick}
          href={window.location.href}
          target="_blank"
          variant={variant}
          aria-label={`${label} Button with HREF, opens in new window`}
        >
          {`${label} Button with HREF`}
        </Button>
      </div>
      <br />
      <div>
        <Button variant={variant} onClick={handleClick} disabled>
          {`${buttonLabel} (disabled)`}
        </Button>
      </div>
    </>
  );
};

const Link = ({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
  blah?: number;
}) => {
  return <a href={to}>{children}</a>;
};

export const CTA: ComponentStory<typeof Button> = () => {
  return <ButtonGrid variant="cta" label="CTA" />;
};

export const Primary: ComponentStory<typeof Button> = () => {
  return <ButtonGrid variant="primary" label="Primary" />;
};

export const Secondary: ComponentStory<typeof Button> = () => {
  return <ButtonGrid variant="secondary" label="Secondary" />;
};

export const PolymorphicButtons: ComponentStory<typeof Button> = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Button elementType="span">Span Button</Button>
      <Button elementType="a" href="test">
        Anchor Button
      </Button>
      <Button elementType="div">Div Button</Button>
      <Button elementType={Link} to="/">
        Custom Link
      </Button>
    </div>
  );
};

const ButtonVariant = ({
  className = "",
  onClick,
  variant,
  ...props
}: ButtonProps) => (
  <div
    style={{
      flex: "1 1 0",
      display: "flex",
      gap: 10,
    }}
  >
    <Button
      {...props}
      className={className}
      variant={variant}
      onClick={onClick}
    >
      <NotificationIcon size={12} /> LORM
    </Button>
    <Button
      {...props}
      className={className}
      variant={variant}
      onClick={onClick}
    >
      <NotificationIcon size={12} />
    </Button>
    <Button
      {...props}
      className={className}
      variant={variant}
      onClick={onClick}
    >
      LORM
    </Button>
    <Button
      {...props}
      className={className}
      variant={variant}
      onClick={onClick}
    >
      LORM <NotificationIcon size={12} />
    </Button>
  </div>
);

const ButtonSet = (props: ButtonProps) => (
  <div
    style={{
      display: "flex",
      flex: "1 1 0",
      flexDirection: "column",
      gap: 10,
    }}
  >
    <ButtonVariant {...props} variant="cta" />
    <ButtonVariant {...props} variant="primary" />
    <ButtonVariant {...props} variant="secondary" />
    <ButtonVariant {...props} className="uitkButton-final-execution" />
    <ButtonVariant {...props} className="uitkButton-bid" />
    <ButtonVariant {...props} className="uitkButton-ask" />
  </div>
);

export const CustomStylingExample = (props: {
  density: Density;
}): JSX.Element => {
  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <ToolkitProvider density={props.density} theme={["light", "newapp"]}>
      <div style={{ width: 900, lineHeight: 3 }}>
        <div style={{ display: "flex" }}>
          <div
            style={{
              flex: "0 0 120px",
              padding: "44px 12px 12px 0",
              textAlign: "right",
            }}
          >
            <div>CTA</div>
            <div>Primary</div>
            <div>Secondary</div>
            <div>Final Execution</div>
            <div>Bid / Buy</div>
            <div>Ask / Sell</div>
          </div>
          <div
            style={{
              display: "flex",
              flex: "1 1 0",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", flex: "0 0 32px", gap: 50 }}>
              <div style={{ flex: "1 1 0" }}>Regular</div>
              <div style={{ flex: "1 1 0" }}>Disabled</div>
              <div style={{ flex: "1 1 0" }}>Read-Only</div>
            </div>
            <div
              style={{
                background: "#eaedef",
                display: "flex",
                gap: 50,
                flex: "1 1 auto",
                padding: 12,
              }}
            >
              <ButtonSet onClick={handleClick} />
              <ButtonSet disabled />
              <ButtonSet data-readonly />
            </div>
          </div>
        </div>
      </div>
    </ToolkitProvider>
  );
};

export const CustomStyling: ComponentStory<typeof Button> = () => (
  <>
    <CustomStylingExample density="medium" />
    <CustomStylingExample density="high" />
  </>
);

export const FeatureButton = SingleButtonTemplate.bind({});
FeatureButton.args = {
  children: "Feature Button",
};

export const FocusableWhenDisabled = SingleButtonTemplate.bind({});
FocusableWhenDisabled.args = {
  focusableWhenDisabled: true,
  disabled: true,
  children: "Focusable When Disabled",
};
