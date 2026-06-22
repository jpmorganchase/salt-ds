import { NavigationItem, StackLayout } from "@salt-ds/core";
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
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

// Fixtures shared with the MegaMenu Cypress specs.
export default {
  title: "Lab/Mega Menu/Cypress Test Fixtures",
  component: MegaMenu,
} as Meta<typeof MegaMenu>;

export const Interactive: StoryFn = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
  };

  return (
    <nav>
      <StackLayout as="ol" direction="row" gap={1}>
        <li>
          <MegaMenu
            open={openMenu === "solutions"}
            onOpenChange={handleOpenChange("solutions")}
          >
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
                        href="/digital-banking"
                        onClick={(e) => e.preventDefault()}
                      >
                        Digital Banking
                      </MegaMenuListItem>
                      <MegaMenuListItem
                        href="/risk-management"
                        onClick={(e) => e.preventDefault()}
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

        <li>
          <MegaMenu
            open={openMenu === "services"}
            onOpenChange={handleOpenChange("services")}
          >
            <MegaMenuTrigger>
              <NavigationItem>Services</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel>
              <MegaMenuContent>
                <MegaMenuGroups>
                  <MegaMenuGroup>
                    <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                    <MegaMenuList>
                      <MegaMenuListItem
                        href="/strategy"
                        onClick={(e) => e.preventDefault()}
                      >
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

      <button type="button">Outside</button>
    </nav>
  );
};

// A single menu rendered open from the start (`defaultOpen`).
export const DefaultOpen: StoryFn = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <NavigationItem>Solutions</NavigationItem>
    </MegaMenuTrigger>
    <MegaMenuPanel>
      <MegaMenuContent>
        <MegaMenuGroups>
          <MegaMenuGroup>
            <MegaMenuGroupHeading>Financial Services</MegaMenuGroupHeading>
            <MegaMenuList>
              <MegaMenuListItem
                href="/digital-banking"
                onClick={(e) => e.preventDefault()}
              >
                Digital Banking
              </MegaMenuListItem>
            </MegaMenuList>
          </MegaMenuGroup>
        </MegaMenuGroups>
      </MegaMenuContent>
    </MegaMenuPanel>
  </MegaMenu>
);

export const Accessible: StoryFn = () => (
  <nav aria-label="Main">
    <StackLayout as="ol" direction="row" gap={1}>
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
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={(e) => e.preventDefault()}
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
                      onClick={(e) => e.preventDefault()}
                    >
                      Patient Management
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
                    <MegaMenuListItem
                      href="/strategy"
                      onClick={(e) => e.preventDefault()}
                    >
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

export const CustomHeadingId: StoryFn = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <NavigationItem>Solutions</NavigationItem>
    </MegaMenuTrigger>
    <MegaMenuPanel aria-label="Solutions menu">
      <MegaMenuContent>
        <MegaMenuGroups>
          <MegaMenuGroup>
            {/* biome-ignore lint/correctness/useUniqueElementIds: fixed id is the value under test — the spec asserts the list is labelled by exactly this id */}
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

export const GroupWithoutHeading: StoryFn = () => (
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

export const CombinedListLabel: StoryFn = () => (
  <MegaMenu defaultOpen>
    <MegaMenuTrigger>
      <NavigationItem>Solutions</NavigationItem>
    </MegaMenuTrigger>
    <MegaMenuPanel aria-label="Solutions menu">
      {/* biome-ignore lint/correctness/useUniqueElementIds: fixed id is the value under test — the spec asserts the list name concatenates the heading and this element */}
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

export const Layout: StoryFn = () => (
  <nav aria-label="Main">
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu defaultOpen>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuAside>
              <a href="/left">Left region link</a>
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
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuActions>
                <a href="/bottom">Bottom band link</a>
              </MegaMenuActions>
            </MegaMenuContent>
            <MegaMenuAside>
              <a href="/right">Right region link</a>
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

export const Keyboard: StoryFn = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
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
                      href="/digital-banking"
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={(e) => e.preventDefault()}
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
                      onClick={(e) => e.preventDefault()}
                    >
                      Patient Management
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/telemedicine"
                      onClick={(e) => e.preventDefault()}
                    >
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
          <MegaMenuPanel>
            <MegaMenuContent>
              <MegaMenuGroups>
                <MegaMenuGroup>
                  <MegaMenuGroupHeading>Consulting</MegaMenuGroupHeading>
                  <MegaMenuList>
                    <MegaMenuListItem
                      href="/strategy"
                      onClick={(e) => e.preventDefault()}
                    >
                      Strategy
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/operations"
                      onClick={(e) => e.preventDefault()}
                    >
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

export const SideRegion: StoryFn = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
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
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={(e) => e.preventDefault()}
                    >
                      Risk Management
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
            <MegaMenuAside>
              <a href="/see-all">See all solutions</a>
              <button type="button">Contact sales</button>
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>

    <button type="button">After Nav</button>
  </nav>
);

export const LeadingRegion: StoryFn = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel aria-label="Solutions menu">
            <MegaMenuAside>
              <a href="/featured">Featured</a>
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
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={(e) => e.preventDefault()}
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

export const BottomBand: StoryFn = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
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
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={(e) => e.preventDefault()}
                    >
                      Risk Management
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuActions>
                <a href="/book-a-demo">Book a demo</a>
                <button type="button">Support center</button>
              </MegaMenuActions>
            </MegaMenuContent>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

export const BottomBandWithNext: StoryFn = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
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
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
              <MegaMenuActions>
                <a href="/book-a-demo">Book a demo</a>
                <button type="button">Support center</button>
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
                    <MegaMenuListItem
                      href="/strategy"
                      onClick={(e) => e.preventDefault()}
                    >
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

export const RoleAware: StoryFn = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
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
                      onClick={(e) => e.preventDefault()}
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

export const RoleAwareTab: StoryFn = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
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
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                  </MegaMenuList>
                </MegaMenuGroup>
              </MegaMenuGroups>
            </MegaMenuContent>
            <MegaMenuAside>
              <input aria-label="Search" defaultValue="hello" />
              <a href="/go">Go</a>
            </MegaMenuAside>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

export const StaticContent: StoryFn = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
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
                      onClick={(e) => e.preventDefault()}
                    >
                      Digital Banking
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/risk-management"
                      onClick={(e) => e.preventDefault()}
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

    <button type="button">After Nav</button>
  </nav>
);

export const ActionItem: StoryFn = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
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
                    {/* An action item (not navigation): render as a <button> via the render prop. */}
                    <MegaMenuListItem
                      render={<button type="button" />}
                      onClick={(e) => e.preventDefault()}
                    >
                      Telemedicine
                    </MegaMenuListItem>
                    <MegaMenuListItem
                      href="/digital-banking"
                      onClick={(e) => e.preventDefault()}
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

export const RenderProp: StoryFn = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
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
                      onClick={(e) => e.preventDefault()}
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
