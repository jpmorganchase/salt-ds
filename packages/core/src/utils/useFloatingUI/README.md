# Floating Components

## Introduction

Certain components within the design system use 'floating elements'. These are absolutely positioned, typically anchored to another UI element, and usually when they appear it should be on top of the other UI rather than causing layout shift. For example, in `Tooltip`, the `List` within `Combobox` and `Dropdown` etc.

There are various complexities around this such as when the floating element could be obscured by the edge of the viewport and so we use the [Floating UI](https://floating-ui.com/) library to achieve the desired behaviour for each component.

For the most part when creating a floating component, we encapsulate this behaviour in the `useFloatingUI` hook which you can import and use in a component.

## The Problem: Desktop Support

Within the Salt design system, we support many types of applications. The majority may be web-based, and in these cases the default behaviour of our floating components works fine.

However, we also support more complex setups such as multi-window desktop applications. In these scenarios the desired behaviour of our floating components changes.

It may be that instead of a `Tooltip` being displayed within the same window as the anchor element, it should instead be rendered into an entirely separate window, this way it can be displayed outside the bounds of the parent window. Instead of the `Tooltip` 'flipping' when close to the viewport edge, this windowed `Tooltip` should flip when close to the edge of the monitor.

## The Solution: Custom Floating UI Platforms

Floating UI provides a route where we can solve this problem via a custom [Platform](https://floating-ui.com/docs/platform). Using this Floating UI's internal behaviour can be adapted to work in this scenario.

There are a few goals of our implementation:

- Allow the customisation of Floating UI for these complex desktop applications
- Avoid polluting the core API of our Floating Components, as these features will not be used by the vast majority of consumers
- Minimise the work for consumers customising Floating UI so a single solution can work for all floating components

To achieve this we use [React's Context API](https://react.dev/reference/react/useContext) within our `useFloatingUI` hook, this allows consumers to use a `Provider` to customise the behaviour of floating components, potentially in one place for all the relevant components.

### FloatingPlatformProvider

`FloatingPlatformProvider` can be used by consumers to provide a custom Floating UI platform. our useFloatingUI hook with consumer this platform if provided and pass it to Floating UI.

In addition, consumers can pass [middleware](https://floating-ui.com/docs/middleware) to adjust the behaviour of Floating UI, or request updates on animation frame, which will sometimes be necessary for desktop applications.

### FloatingComponentProvider

`FloatingComponentProvider` can be used by consumers to pass a custom component which can be used as the root of each of our floating components, which by default will simply be a div.

This custom Floating component will be passed the relevant positioning information such as `width`, `height`, `top`, `left` and `position` (absolute/fixed), to place the floating component in the appropriate place, it is also passed a ref, and whether the component is `open`.

In a multi-window application this custom Floating Component can be used by consumers as a trigger to spawn/activate another window and render the children of the floating component inside via a portal. Our default floating component uses [Floating Portal](https://floating-ui.com/docs/floatingportal#floatingportal) to do this within the same document.

### Considerations for components

When building a floating component, they key things to think about are as follows:

- Make sure to use the `useFloatingUI` hook to implement the floating behaviour.
- Use the `useFloatingComponent` hook to get the provided component as follows. This should be used as the root of the floating part of the component:

```jsx
const { Component } = useFloatingComponent();
```

- Pass the required props to the floating `Component` (top, left, width, height etc).
- See existing implementation of `Tooltip`, `Dropdown` and `Combobox` for further guidance.

## Style Injection

It should be noted that this guidance is purely about the positioning of the Floating Component. There is another aspect of style injection (making sure the required css is injected into the spawned window), which is address separately.
