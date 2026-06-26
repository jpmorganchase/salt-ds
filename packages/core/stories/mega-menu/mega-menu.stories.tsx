import {
  Badge,
  Button,
  FlexLayout,
  Link,
  MegaMenu,
  MegaMenuActions,
  MegaMenuAside,
  MegaMenuContent,
  MegaMenuGroup,
  MegaMenuGroupHeading,
  MegaMenuGroups,
  MegaMenuList,
  MegaMenuListItem,
  MegaMenuPanel,
  type MegaMenuProps,
  MegaMenuTrigger,
  NavigationItem,
  StackLayout,
  Tag,
  Text,
} from "@salt-ds/core";
import { DatasetManagerIcon, DevicesIcon } from "@salt-ds/icons";
import type { StoryFn } from "@storybook/react-vite";
import "./mega-menu.stories.css";

export default {
  title: "Lab/Mega Menu",
  component: MegaMenu,
  decorators: [
    (Story: StoryFn) => (
      <div className="mega-menu-story">
        <Story />
      </div>
    ),
  ],
};

// Prevent default navigation so activating an item in a test doesn't change the page.
const preventNav = (event: { preventDefault: () => void }) =>
  event.preventDefault();

// Realistic menu combining multi-column groups, an action bar, and a featured side region.
export const Showcase: StoryFn = () => (
  <nav aria-label="Main">
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      <DevicesIcon aria-hidden />
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={preventNav}
                    >
                      <DatasetManagerIcon aria-hidden />
                      Risk Management
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/wealth-advisory"
                      onClick={preventNav}
                    >
                      Wealth Advisory
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/patient-management"
                      onClick={preventNav}
                    >
                      Patient Management
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/telemedicine" onClick={preventNav}>
                      Telemedicine
                      <div className="menu-item-adornment">
                        <Tag category={1} variant="primary">
                          Premium
                        </Tag>
                      </div>
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/compliance" onClick={preventNav}>
                      Compliance Solutions
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Retail</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem href="/e-commerce" onClick={preventNav}>
                      E-commerce Platforms
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/payments" onClick={preventNav}>
                      Payments
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuActions>
                <FlexLayout gap={3} align="center">
                  <Link href="/book-a-demo" color="primary">
                    Book a demo
                  </Link>
                  <Button variant="secondary">Support center</Button>
                </FlexLayout>
              </MegaMenuActions>
            </MegaMenuContent>
            <MegaMenuAside>
              <StackLayout gap={1} align="start" className="mega-menu-aside">
                <Text styleAs="h4" as="h2">
                  Featured resource
                </Text>
                <Text color="secondary">
                  Explore our latest accessibility guidelines to keep your
                  products inclusive and compliant.
                </Text>
                <Link href="/guidelines" color="primary">
                  View guidelines
                </Link>
              </StackLayout>
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Services</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Services menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem href="/strategy" onClick={preventNav}>
                      Strategy
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/operations" onClick={preventNav}>
                      Operations
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Technology</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem href="/cloud" onClick={preventNav}>
                      Cloud Migration
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/data" onClick={preventNav}>
                      Data Platforms
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Resources</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Resources menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Learn</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem href="/guides" onClick={preventNav}>
                      Guides
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/webinars" onClick={preventNav}>
                      Webinars
                      <div className="menu-item-adornment">
                        <Badge value="3" />
                      </div>
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
            <MegaMenuAside>
              <StackLayout gap={1} align="start" className="mega-menu-aside">
                <Text styleAs="h4" as="h2">
                  Release notes
                </Text>
                <Text color="secondary">
                  See what shipped in the latest version.
                </Text>
                <Link href="/whats-new" color="primary">
                  What's new
                </Link>
              </StackLayout>
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <Button variant="primary">After Nav</Button>
  </nav>
);

// Two triggers, each in a list item inside a labelled nav. Solutions has two
// columns; Services has one.
export const Baseline: StoryFn = () => (
  <nav aria-label="Main">
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={preventNav}
                    >
                      Risk Management
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Healthcare</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/patient-management"
                      onClick={preventNav}
                    >
                      Patient Management
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/telemedicine" onClick={preventNav}>
                      Telemedicine
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Services</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Services menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem href="/strategy" onClick={preventNav}>
                      Strategy
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/operations" onClick={preventNav}>
                      Operations
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <Button variant="primary">After Nav</Button>
  </nav>
);

// A single menu open on mount via defaultOpen.
export const DefaultOpen: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu defaultOpen>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={preventNav}
                    >
                      Risk Management
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

export const Controlled: StoryFn<MegaMenuProps> = (args) => (
  <nav aria-label="Main">
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu {...args}>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// A MegaMenuAside after MegaMenuContent renders as a right-hand column.
export const WithAside: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={preventNav}
                    >
                      Risk Management
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
            <MegaMenuAside>
              <StackLayout gap={2} align="start">
                <Link href="/see-all" color="primary">
                  See all solutions
                </Link>
                <Button variant="secondary">Contact sales</Button>
              </StackLayout>
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <Button variant="primary">After Nav</Button>
  </nav>
);

// A MegaMenuAside before MegaMenuContent renders as a left-hand column.
export const WithLeadingAside: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuAside>
              <Link href="/featured" color="primary">
                Featured
              </Link>
            </MegaMenuAside>
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={preventNav}
                    >
                      Risk Management
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// A MegaMenuActions bar below the groups, inside MegaMenuContent.
export const WithActions: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={preventNav}
                    >
                      Risk Management
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuActions>
                <FlexLayout gap={3} align="center">
                  <Link href="/book-a-demo" color="primary">
                    Book a demo
                  </Link>
                  <Button variant="secondary">Support center</Button>
                </FlexLayout>
              </MegaMenuActions>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// WithActions plus a second trigger after it.
export const WithActionsAndNextTrigger: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuActions>
                <FlexLayout gap={3} align="center">
                  <Link href="/book-a-demo" color="primary">
                    Book a demo
                  </Link>
                  <Button variant="secondary">Support center</Button>
                </FlexLayout>
              </MegaMenuActions>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Services</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Services menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem href="/strategy" onClick={preventNav}>
                      Strategy
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// Asides before and after MegaMenuContent become left and right columns;
// MegaMenuActions sits below the groups.
export const WithRegionsLayout: StoryFn = () => (
  <nav aria-label="Main">
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu defaultOpen>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuAside>
              <Link href="/left" color="primary">
                Left region link
              </Link>
            </MegaMenuAside>
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuActions>
                <Link href="/bottom" color="primary">
                  Bottom band link
                </Link>
              </MegaMenuActions>
            </MegaMenuContent>
            <MegaMenuAside>
              <Link href="/right" color="primary">
                Right region link
              </Link>
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// A text input inside a MegaMenuAside.
export const WithSelfConsumingControl: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
            <MegaMenuAside>
              <input aria-label="Search" defaultValue="hello" />
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// A text input followed by a link inside a MegaMenuAside.
export const WithSelfConsumingControlAndLink: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
            <MegaMenuAside>
              <StackLayout gap={2} align="start">
                <input aria-label="Search" defaultValue="hello" />
                <Link href="/go" color="primary">
                  Go
                </Link>
              </StackLayout>
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// A region and action bar with no interactive content.
export const StaticContent: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={preventNav}
                    >
                      Risk Management
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuActions>
                <span>Footer note, nothing focusable.</span>
              </MegaMenuActions>
            </MegaMenuContent>
            <MegaMenuAside>
              <p>Static promotional text with no links.</p>
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <Button variant="primary">After Nav</Button>
  </nav>
);

// An item rendered as a <button> via render, followed by a link item.
export const WithActionItem: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={<button type="button" />}
                      onClick={preventNav}
                    >
                      Action button
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// An item with a custom anchor supplied through render.
export const WithRenderProp: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>
                    Financial Services
                  </MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      render={
                        <a href="/digital-banking" data-custom-link="">
                          Digital Banking
                        </a>
                      }
                      onClick={preventNav}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

// A group heading with a consumer-supplied id.
export const WithCustomHeadingId: StoryFn = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <NavigationItem>Solutions</NavigationItem>
    </MegaMenuTrigger>
    <MegaMenuPanel aria-label="Solutions menu">
      <MegaMenuContent>
        <MegaMenuGroups>
          <MegaMenuGroup>
            <MegaMenuGroupHeading id="custom-heading-id">
              Financial Services
            </MegaMenuGroupHeading>
            <MegaMenuList>
              <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
                Digital Banking
              </MegaMenuListItem>
            </MegaMenuList>
          </MegaMenuGroup>
        </MegaMenuGroups>
      </MegaMenuContent>
    </MegaMenuPanel>
  </MegaMenu>
);

// A group with no heading.
export const WithoutGroupHeading: StoryFn = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <NavigationItem>Solutions</NavigationItem>
    </MegaMenuTrigger>
    <MegaMenuPanel aria-label="Solutions menu">
      <MegaMenuContent>
        <MegaMenuGroups>
          <MegaMenuGroup>
            <MegaMenuList>
              <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
                Digital Banking
              </MegaMenuListItem>
            </MegaMenuList>
          </MegaMenuGroup>
        </MegaMenuGroups>
      </MegaMenuContent>
    </MegaMenuPanel>
  </MegaMenu>
);

// An item marked as the current page via the `current` prop.
export const WithCurrentItem: StoryFn = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <NavigationItem>Solutions</NavigationItem>
    </MegaMenuTrigger>
    <MegaMenuPanel aria-label="Solutions menu">
      <MegaMenuContent>
        <MegaMenuGroups>
          <MegaMenuGroup>
            <MegaMenuGroupHeading>Financial Services</MegaMenuGroupHeading>
            <MegaMenuList>
              <MegaMenuListItem
                href="/digital-banking"
                current
                onClick={preventNav}
              >
                Digital Banking
              </MegaMenuListItem>
              <MegaMenuListItem href="/risk-management" onClick={preventNav}>
                Risk Management
              </MegaMenuListItem>
            </MegaMenuList>
          </MegaMenuGroup>
        </MegaMenuGroups>
      </MegaMenuContent>
    </MegaMenuPanel>
  </MegaMenu>
);

// A list labelled by both its group heading and a consumer-supplied aria-labelledby.
export const WithExtraGroupLabel: StoryFn = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <NavigationItem>Solutions</NavigationItem>
    </MegaMenuTrigger>
    <MegaMenuPanel aria-label="Solutions menu">
      <MegaMenuContent>
        <MegaMenuGroups>
          <MegaMenuGroup>
            <Text
              id="extra-label"
              styleAs="label"
              className="mega-menu-group-badge"
            >
              Recommended
            </Text>
            <MegaMenuGroupHeading>Financial Services</MegaMenuGroupHeading>
            <MegaMenuList aria-labelledby="extra-label">
              <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
                Digital Banking
              </MegaMenuListItem>
            </MegaMenuList>
          </MegaMenuGroup>
        </MegaMenuGroups>
      </MegaMenuContent>
    </MegaMenuPanel>
  </MegaMenu>
);
