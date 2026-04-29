# Missing Form Input Labels and Associations

Form inputs without proper programmatically associated labels or an accessible name make it difficult for screen reader users to understand what content should be entered. 

**Invalid labeling techniques:** `title`, `placeholder`, or `aria-describedby` attributes are NOT valid labeling techniques. Tooltips are also not a valid primary label method.

## Checkpoint Covered

- **1.3.1-37** — Form Control Labels

## Common Issues

- Input has no properly associated visible label and no accessible name using `aria-label`
- Input only has a placeholder (placeholders are not accessible labels)
- Input has visible text nearby but not properly associated with a label element
- Salt Input with visible text not wrapped in `<FormField>` with `<FormFieldLabel>`

## Remediation Rules

1. **Salt Input with visible label text not using `<FormFieldLabel>`**: Wrap in `<FormField>` and convert the visible label to `<FormFieldLabel>`. Salt's `<FormFieldLabel>` automatically creates the programmatic association.
2. **HTML input element**: Use `<label>` with `for` attribute matching input `id` (preferred), `<label>` wrapping the input element, OR use `aria-labelledby` on the input pointing to visible label's id
3. **Mixed Salt + native HTML**: Changing <label> to Salt's `<FormFieldLabel>` is an approved change. However Salt's `<FormFieldLabel>` does NOT create programmatic association with native HTML form controls (`<input>`, `<textarea>`, `<select>`). If found, mark as INCORRECT and flag in Manual Review — inform the developer that they are mixing Salt design system components with native HTML form controls, and recommend converting the native control to the matching Salt component (e.g., `<Input>`, `<MultilineInput>`) so the programmatic label association is handled automatically. For non-Salt or unknown design systems, do not assume the label is wired; flag for manual review and recommend using the matching design-system control.
4. **Input type attribute**: For Salt Input, if you need to pass the type attribute, apply it via `inputProps={{ type: "email" }}`, not as direct prop.

### When to Flag for Manual Review

- Input has no visible label, `aria-label`, or `aria-labelledby` and purpose cannot be determined

### Important Notes

- **Placeholder is NOT a valid labeling technique**: Placeholders disappear when typing and are not announced by all screen readers as labels.
- **Salt Input `type` attribute**: Pass via `inputProps={{ type: "email" }}`, not as a direct prop.
- **Salt Input how to add `aria-label`**: Pass via `inputProps={{ "aria-label": "..." }}`, not as a direct prop.
- **Salt MultilineInput how to add `aria-label`**: Pass via `textAreaProps={{ "aria-label": "..." }}`, not as a direct prop.
- **Component changes require verification**: When an HTML form element (e.g., `<input>`, `<textarea>`) is changed to a Salt component (e.g., `<Input>`, `<MultilineInput>`), include a manual review item notifying the developer to verify that all attributes (especially `type`, event handlers, and validation) are correctly applied using the Salt component API. Refer to the [Salt Input documentation](https://www.saltdesignsystem.com/salt/components/input) for supported props and usage patterns.

## Examples

### Using Salt Design System

```jsx
import {
  Checkbox,
  CheckboxGroup,
  ComboBox,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  MultilineInput,
  Option,
  RadioButton,
  RadioButtonGroup,
} from "@salt-ds/core";

// CORRECT: FormField with FormFieldLabel
<FormField>
  <FormFieldLabel>Email Address</FormFieldLabel>
  <Input inputProps={{ type: "email" }} />
</FormField>

// CORRECT: FormField with FormFieldLabel and helper text
<FormField>
  <FormFieldLabel>Email Address</FormFieldLabel>
  <Input inputProps={{ type: "email" }} />
  <FormFieldHelperText>Enter your work email address</FormFieldHelperText>
</FormField>

// CORRECT: FormField with password input
<FormField>
  <FormFieldLabel>Password</FormFieldLabel>
  <Input inputProps={{ type: "password" }} placeholder="Please enter your password" />
</FormField>

// CORRECT: FormField with username input
<FormField>
  <FormFieldLabel>Username</FormFieldLabel>
  <Input inputProps={{ type: "text" }} placeholder="Enter username" />
</FormField>

// CORRECT: FormField with MultilineInput instead of HTML input/textarea
<FormField>
  <FormFieldLabel>Message</FormFieldLabel>
  <MultilineInput />
</FormField>

//CORRECT: MultilineInput with aria-label
<MultilineInput 
textAreaProps={{
    "aria-label": "Type a message"
  }}
/>

//CORRECT: Input with aria-label
<Input 
inputProps={{
    "aria-label": "Search"
  }}
/>

// CORRECT: FormField with combo box
<FormField>
  <FormFieldLabel>Tags</FormFieldLabel>
  <ComboBox placeholder="Select tag">
    <Option value="alpha">Alpha</Option>
    <Option value="beta">Beta</Option>
  </ComboBox>
</FormField>

// CORRECT: FormField with radio button group
<FormField>
  <FormFieldLabel>Contact Preference</FormFieldLabel>
  <RadioButtonGroup name="contact">
    <RadioButton value="email" label="Email" />
    <RadioButton value="phone" label="Phone" />
  </RadioButtonGroup>
</FormField>

// CORRECT: FormField with checkbox group
<FormField>
  <FormFieldLabel>Interests</FormFieldLabel>
  <CheckboxGroup name="interests">
    <Checkbox value="news" label="News" />
    <Checkbox value="offers" label="Offers" />
  </CheckboxGroup>
</FormField>

// INCORRECT: Salt Input without FormField or FormFieldLabel
<Input inputProps={{ type: "email" }} placeholder="Enter email" />

// INCORRECT: Salt Input with only placeholder (not a label)
<Input placeholder="Company Name" />

// INCORRECT: Salt Input with visible text but not in FormFieldLabel
<div>Email Address</div>
<Input inputProps={{ type: "email" }} />

// INCORRECT: Salt Input using HTML label
<FormField>
  <label>Phone Number</label>
  <Input inputProps={{ type: "tel" }} />
</FormField>

// INCORRECT: Multiline input is already associated with a visible label contained in a FormFieldLabel, aria-label is not needed on the input
<FormField>
  <FormFieldLabel>Message</FormFieldLabel>
  <MultilineInput aria-label="Message" />
</FormField>
```

### HTML Implementation

```html
<!-- CORRECT: Input with label using for/id (preferred method) -->
<label for="email">Email Address</label>
<input type="email" id="email" placeholder="Enter email">

<!-- CORRECT: Input with aria-labelledby on input pointing to label id -->
<label id="email-label">Email Address</label>
<input type="email" aria-labelledby="email-label">

<!-- CORRECT: Input with required attribute -->
<label for="password">Password *</label>
<input type="password" id="password" required>

<!-- CORRECT: Input wrapped in label element (HTML native only) -->
<label>
  Phone Number
  <input type="tel">
</label>

<!-- INCORRECT: Input with only placeholder (not a label) -->
<input type="email" placeholder="Enter email">

<!-- INCORRECT: Input with no label -->
<input type="password">

<!-- INCORRECT: Input with visible text but not in label element -->
<div>Email Address</div>
<input type="email">

<!-- INCORRECT: Input with label but no for/id association or aria-labelledby -->
<label>Email Address</label>
<input type="email">
```


### Mixing Design system and native HTML

```jsx
// INCORRECT: FormFieldLabel with native input (no programmatic association)
<FormField>
  <FormFieldLabel>First Name</FormFieldLabel>
  <input name="firstName" required />
</FormField>

// INCORRECT: FormFieldLabel with native textarea (no programmatic association)
<FormField>
  <FormFieldLabel>Message</FormFieldLabel>
  <textarea name="message" required />
</FormField>
```