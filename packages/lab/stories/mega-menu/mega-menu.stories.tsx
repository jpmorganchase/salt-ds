import {
  Button,
  FlexLayout,
  Link,
  NavigationItem,
  StackLayout,
} from "@salt-ds/core";
import {
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
  MegaMenuTrigger,
} from "@salt-ds/lab";
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

// Items link to `#` and swallow their default action so activating one inside a
// component test does not navigate the runner away from the mounted fixture.
const preventNav = (event: { preventDefault: () => void }) =>
  event.preventDefault();

// Canonical fixture: two triggers in a `<nav aria-label>` landmark, each grouped
// in an `<li>`. Solutions has two columns (Financial Services, Healthcare) of two
// items each; Services has a single column. A trailing focusable sits after the
// nav so tab-exit can be observed. Drives the default behaviour, keyboard
// navigation, and a11y landmark/region/group-semantics tests.
export const Default: StoryFn = () => (
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
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/risk-management" onClick={preventNav}>
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

    <button type="button">After Nav</button>
  </nav>
);

// Single menu rendered open from the start (`defaultOpen`). Verifies the panel is
// present without interaction and is accessible while open.
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
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
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
      </li>
    </StackLayout>
  </nav>
);

// `MegaMenuContent` followed by a trailing `MegaMenuAside`. Source order places
// the aside to the right of the body; its interactive children become a navigable
// column. A trailing focusable follows the nav to observe tab-exit.
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
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/risk-management" onClick={preventNav}>
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

    <button type="button">After Nav</button>
  </nav>
);

// A leading `MegaMenuAside` placed before `MegaMenuContent` renders to the left, so
// it becomes the first navigable column.
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
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
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
      </li>
    </StackLayout>
  </nav>
);

// Groups followed by a full-width `MegaMenuActions`, both inside `MegaMenuContent`.
// The action bar is always the bottom of the center area and its children move
// horizontally.
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
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/risk-management" onClick={preventNav}>
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

// Like `WithActions` but with a following trigger, so the action bar's last action
// can exit to the next trigger on ArrowRight/ArrowDown.
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
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
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

// Content regions flanking the center and an action bar inside it, rendered open.
// Verifies the panel derives position purely from component type and source order:
// a `MegaMenuAside` before `MegaMenuContent` is the left column, one after is the
// right column, and the action bar sits inside `MegaMenuContent` beneath the groups.
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
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
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

// A `MegaMenuAside` containing a self-consuming control (a text input). The engine
// must not hijack arrow keys while focus is inside it.
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
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
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

// A region (input + following link) used to verify Tab/Shift+Tab still traverse
// across a self-consuming control — only arrows/Home/End are yielded to it.
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
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
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

// Static-only content (no interactive descendants). The region and action bar must
// contribute no navigable cells and stay out of tab + arrow navigation.
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
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/risk-management" onClick={preventNav}>
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

    <button type="button">After Nav</button>
  </nav>
);

// An action item rendered as a `<button>` via the `render` prop (not navigation),
// followed by a link. Verifies the engine treats the button as a focusable cell and
// continues to the link beneath it.
export const WithActionItem: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel>
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
                      Telemedicine
                    </MegaMenuListItem>
                    <MegaMenuListItem href="/digital-banking" onClick={preventNav}>
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

// Exercises the `render` prop: a custom anchor substituted for the default `<a>`.
// Verifies `render` replaces the host element rather than wrapping it (a single
// `<a>`, not nested links).
export const WithRenderProp: StoryFn = () => (
  <nav>
    <StackLayout as="ul" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel>
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

// Group heading carrying a consumer-provided id; the list must be labelled by
// exactly that id rather than an internally generated one.
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
              <MegaMenuListItem href="/digital-banking">
                Digital Banking
              </MegaMenuListItem>
            </MegaMenuList>
          </MegaMenuGroup>
        </MegaMenuGroups>
      </MegaMenuContent>
    </MegaMenuPanel>
  </MegaMenu>
);

// Group with no heading: the list must omit `aria-labelledby` entirely rather than
// point at a non-existent id.
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
              <MegaMenuListItem href="/digital-banking">
                Digital Banking
              </MegaMenuListItem>
            </MegaMenuList>
          </MegaMenuGroup>
        </MegaMenuGroups>
      </MegaMenuContent>
    </MegaMenuPanel>
  </MegaMenu>
);

// Group heading combined with a consumer-provided `aria-labelledby`: the list's
// accessible name concatenates the heading and the consumer's element, heading
// first.
export const WithExtraGroupLabel: StoryFn = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <NavigationItem>Solutions</NavigationItem>
    </MegaMenuTrigger>
    <MegaMenuPanel aria-label="Solutions menu">
      <span id="extra-label">Recommended</span>
      <MegaMenuContent>
        <MegaMenuGroups>
          <MegaMenuGroup>
            <MegaMenuGroupHeading>Financial Services</MegaMenuGroupHeading>
            <MegaMenuList aria-labelledby="extra-label">
              <MegaMenuListItem href="/digital-banking">
                Digital Banking
              </MegaMenuListItem>
            </MegaMenuList>
          </MegaMenuGroup>
        </MegaMenuGroups>
      </MegaMenuContent>
    </MegaMenuPanel>
  </MegaMenu>
);
