# App Header (Copilot Context)

Builds a persistent top application header with branding, primary navigation, and utility actions that adapt between desktop and mobile.

- API: ./app-header.json
- Guidance: ./app-header.md

## Key rules
- Keep branding first and anchor logo to the home route.
- Use JPM logo as the default app-header brand unless the user prompt explicitly requests another approved brand.
- Desktop uses `FlexLayout` with brand, horizontal nav, and utilities separated by `justify="space-between"`.
- Mobile uses a menu button plus `Drawer` with `VerticalNavigation` component where navigation items appear above utility actions.
- Mobile drawer must render using the `VerticalNavigation` component with `appearance="bordered"` as the default.
- Mobile drawer padding must be `var(--salt-spacing-300)` on all sides.
- If vertical navigation is used with app header, default its appearance variant to `bordered` unless explicitly overridden in the user prompt.
- When rendering vertical navigation, set the wrapping container left padding to `0`.
- Keep header sticky/fixed in the north region and offset main content below it.
- Preserve logo aspect ratio; derive logo and header sizing from `--salt-size-base` rules.
- Add a skip link for complex headers so keyboard users can jump to main content.

## Example
```tsx
import {
  BorderItem,
  BorderLayout,
  Button,
  Drawer,
  FlexItem,
  FlexLayout,
  NavigationItem,
  SkipLink,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { MenuIcon } from "@salt-ds/icons";
import { useState } from "react";
  import { useState } from "react";
export function AppHeaderExample() {
  const [open, setOpen] = useState(false);
  const items = ["Home", "Transactions", "FX"];
  const brand = "JPM";
  - Download logo files from logo docs and copy them into `public/assets/logos`; reference them using `/assets/logos/...`.
  - If logo image is unavailable, fall back to simple Amplitude brand text (`JPM`, `Chase`, or `JPMC`).

  return (
    <BorderLayout>
      <SkipLink targetId="main-content">Skip to main content</SkipLink>
      <BorderItem position="north">
    const [logoError, setLogoError] = useState(false);
    const logoPath = "/assets/logos/jpm_light_low.svg";
    const fallbackBrandText = "JPM";
          <StackLayout
            direction="row"
            style={{
              height: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
              backgroundColor: "var(--salt-container-primary-background)",
              borderBottom:
                "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
            }}
          >
            <Button appearance="transparent" onClick={() => setOpen(!open)}>
              <MenuIcon />
            </Button>
            <Text>
              <strong>{brand}</strong>
            </Text>
          </StackLayout>
          <Drawer open={open} onOpenChange={() => setOpen(false)}>
            <nav>
              {logoError ? (
                <Text style={{ fontFamily: "Amplitude" }}>
                  <strong>{fallbackBrandText}</strong>
                </Text>
              ) : (
                <img
                  alt="J.P. Morgan logo"
                  src={logoPath}
                  onError={() => setLogoError(true)}
                />
              )}
                    <NavigationItem orientation="vertical" href="#">
                      {item}
                    </NavigationItem>
                  </li>
                ))}
              </ul>
            </nav>
          </Drawer>
        </header>
      </BorderItem>
      <BorderItem
        position="center"
        id="main-content"
        style={{ marginTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))" }}
      >
        <FlexLayout>
          <FlexItem>
            <Text>Main content</Text>
          </FlexItem>
        </FlexLayout>
      </BorderItem>
    </BorderLayout>
  );
}
```