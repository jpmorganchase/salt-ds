import { ReactNode } from "react";
import { Button, ButtonProps } from "@jpmorganchase/uitk-core";
import { NotificationIcon, SearchIcon } from "@jpmorganchase/uitk-icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";

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
