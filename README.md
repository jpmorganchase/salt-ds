React UI components built with a focus on accessibility, customisation and ease-of-use.

## Installation

```sh
npm install @jpmorganchase/uitk-core @jpmorganchase/uitk-theme @jpmorganchase/uitk-lab @jpmorganchase/uitk-icons
```

or

```sh
yarn add @jpmorganchase/uitk-core @jpmorganchase/uitk-theme @jpmorganchase/uitk-lab @jpmorganchase/uitk-icons
```

## Usage

Here's a quick example to get you started:

```javascript
import ReactDOM from "react-dom";
import "@brandname/theme/index.css";
import "@brandname/theme/global.css";
import { Button } from "@jpmorganchase/uitk-core";

function App() {
  return <Button variant="cta">CTA Button</Button>;
}

ReactDOM.render(<App />, document.getElementById("root"));
```

## Documentation

Check out our [Storybook](https://ui-toolkit-staging.pages.dev).
