import {
  BorderItem,
  BorderLayout,
  Button,
  Drawer,
  H1,
  NavigationItem,
  SkipLink,
  StackLayout,
  Text,
  useCurrentBreakpoint,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import {
  CloseIcon,
  GithubIcon,
  MenuIcon,
  StackoverflowIcon,
  SymphonyIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { type FC, type ReactNode, useEffect, useState } from "react";
import { Link, MemoryRouter, useLocation } from "react-router";
import logo from "../../assets/logo.svg";
import "./app-header.stories.css";

export default {
  title: "Patterns/App Header",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    // A router lets the navigation items behave like real links: navigation is
    // client-side and the active item is derived from the current location.
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

const mainContentId = "app-header-main-content";

type NavItem = { href: string; label: string };

const navigationItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
];

type Utility = { icon: ReactNode; key: string; label: string };

const utilities: Utility[] = [
  {
    icon: <SymphonyIcon aria-hidden />,
    key: "Symphony",
    label: "Open Symphony",
  },
  {
    icon: <StackoverflowIcon aria-hidden />,
    key: "Stack Overflow",
    label: "Open Stack Overflow",
  },
  {
    icon: <GithubIcon aria-hidden />,
    key: "GitHub",
    label: "Open GitHub",
  },
];

const useScrolled = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => {
      setScrolled(window.scrollY > 0);
    };

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScrolled);
    };
  }, []);

  return scrolled;
};

const LogoLink = ({ onNavigate }: { onNavigate?: () => void }) => (
  <Link aria-label="Product home" to="/" onClick={onNavigate}>
    <img alt="" className="appHeaderPattern-logo" src={logo} />
  </Link>
);

const NavigationList: FC<{
  activePath: string;
  items: NavItem[];
}> = ({ activePath, items }) => (
  <nav aria-label="Main navigation">
    <ul className="appHeaderPattern-navList">
      {items.map((item) => (
        <li key={item.href}>
          <NavigationItem
            active={activePath === item.href}
            href={item.href}
            render={<Link to={item.href} />}
          >
            {item.label}
          </NavigationItem>
        </li>
      ))}
    </ul>
  </nav>
);

const UtilityButtons: FC<{ utilities: Utility[] }> = ({ utilities }) => (
  <StackLayout direction="row" gap={1}>
    {utilities.map((utility) => (
      <Button
        key={utility.key}
        aria-label={utility.label}
        appearance="transparent"
      >
        {utility.icon}
      </Button>
    ))}
  </StackLayout>
);

const DrawerNavigation: FC<{
  activePath: string;
  items: NavItem[];
  onNavigate: () => void;
}> = ({ activePath, items, onNavigate }) => (
  <VerticalNavigation aria-label="Main navigation" appearance="indicator">
    {items.map((item) => (
      <VerticalNavigationItem key={item.href} active={activePath === item.href}>
        <VerticalNavigationItemContent>
          <VerticalNavigationItemTrigger
            render={<Link to={item.href} />}
            onClick={onNavigate}
          >
            <VerticalNavigationItemLabel>
              {item.label}
            </VerticalNavigationItemLabel>
          </VerticalNavigationItemTrigger>
        </VerticalNavigationItemContent>
      </VerticalNavigationItem>
    ))}
  </VerticalNavigation>
);

const DrawerUtilities: FC<{
  onNavigate: () => void;
  utilities: Utility[];
}> = ({ onNavigate, utilities }) => (
  // Utility actions sit at the bottom of the drawer (pinned via CSS), below the
  // primary navigation.
  <div className="appHeaderPattern-drawerUtilities">
    <VerticalNavigation aria-label="Utilities" appearance="indicator">
      {utilities.map((utility) => (
        <VerticalNavigationItem key={utility.key}>
          <VerticalNavigationItemContent>
            {/* Utilities are actions rather than routes, so the trigger renders
                a button (no `href`/`render`). */}
            <VerticalNavigationItemTrigger onClick={onNavigate}>
              {utility.icon}
              <VerticalNavigationItemLabel>
                {utility.key}
              </VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
          </VerticalNavigationItemContent>
        </VerticalNavigationItem>
      ))}
    </VerticalNavigation>
  </div>
);

// Hosts the app header within a page (BorderLayout + main + footer) so it can be
// shown in context. The app header itself is the `<header>` region below (plus
// its drawer on small viewports); the main/footer/placeholder content is only
// scaffolding to demonstrate the sticky header and scroll shadow.
const AppHeaderPage: FC = () => {
  // The header collapses into a drawer on small viewports (xs and sm), matching
  // the Salt breakpoints. This is driven by viewport width, not density —
  // density (e.g. "mobile") is a device/input concern and is set separately.
  const breakpoint = useCurrentBreakpoint();
  const isSmallViewport = breakpoint === "xs" || breakpoint === "sm";
  const scrolled = useScrolled();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isSmallViewport) {
      setDrawerOpen(false);
    }
  }, [isSmallViewport]);

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      {/* The skip link is the first focusable element and sits outside the
          header so it isn't part of the banner landmark. */}
      <SkipLink targetId={mainContentId}>Skip to main content</SkipLink>
      <BorderLayout>
        {/* --- App header --- */}
        <BorderItem
          as="header"
          position="north"
          className="appHeaderPattern-header"
          data-scrolled={scrolled}
          data-small-viewport={isSmallViewport}
        >
          {isSmallViewport ? (
            <>
              <Button
                aria-label="Open navigation"
                appearance="transparent"
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon aria-hidden />
              </Button>
              <LogoLink />
            </>
          ) : (
            <>
              <LogoLink />
              <NavigationList activePath={pathname} items={navigationItems} />
              <UtilityButtons utilities={utilities} />
            </>
          )}
        </BorderItem>
        <BorderItem as="main" position="center">
          <H1 id={mainContentId} className="appHeaderPattern-heading">
            Explore our offering
          </H1>
          {Array.from({ length: 12 }, (_, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: In this case, using index as key is acceptable
              key={index}
              className="appHeaderPattern-block"
            />
          ))}
        </BorderItem>
        <BorderItem position="south">
          <div className="appHeaderPattern-footer">
            <Text>Footer</Text>
          </div>
        </BorderItem>
      </BorderLayout>
      {/* The drawer is a modal overlay: its scrim covers and inerts everything
          behind it (including the header), so the close control lives inside
          the drawer rather than in the now-inert header. */}
      {isSmallViewport && (
        <Drawer
          aria-label="Navigation menu"
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        >
          <div className="appHeaderPattern-drawerHeader">
            <LogoLink onNavigate={closeDrawer} />
            <Button
              aria-label="Close navigation"
              appearance="transparent"
              onClick={closeDrawer}
            >
              <CloseIcon aria-hidden />
            </Button>
          </div>
          <DrawerNavigation
            activePath={pathname}
            items={navigationItems}
            onNavigate={closeDrawer}
          />
          <DrawerUtilities onNavigate={closeDrawer} utilities={utilities} />
        </Drawer>
      )}
    </>
  );
};

/**
 * The app header is responsive to the width of the viewport. At medium
 * breakpoints and above it shows the full horizontal navigation and utilities;
 * resize the preview (or use the Storybook viewport toolbar) below the small
 * breakpoint to see it collapse into a drawer.
 */
export const AppHeader: StoryFn = () => <AppHeaderPage />;

/**
 * The small-viewport experience, previewed at the extra small viewport. The
 * collapse into a drawer is driven by the viewport breakpoint, so it applies to
 * any small viewport (e.g. a narrow desktop window), independent of density. On
 * an actual mobile device you would additionally set the density to "mobile".
 */
export const SmallViewport: StoryFn = AppHeader.bind({});

SmallViewport.globals = {
  viewport: { value: "xs" },
};
