# Content

A content allows you to include locally customized content within the mega menu.

## Focus sequence summary

### Focus movement for content

- The content itself is not focusable if it only contains static content (such as images or text).
- If the content contains interactive elements (like links, buttons, or form fields), keyboard focus will include those elements in the tab and arrow key navigation.

### Focus order when content changes position (top, bottom, left, right)

- The focus order should align with the visual layout and reading order to preserve the meaning and operability of the menu.
- If the content is positioned at the top or left, its interactive elements should receive focus before the link lists.
- If the content is positioned at the right or bottom, its interactive elements should receive focus after the link lists.

### How arrow key navigation moves between regions

- When navigating with arrow keys, focus moves between items within the same region (such as mega menu item or the interactive element in content).

  > **Note:** When the focus is on "Supply Chain Optimization" and the user presses the left arrow key, the focus will move to "E-Commerce Platforms" rather than moving to the "Link" in the content.

- When the focus reaches the first or last item in a region, pressing the arrow key again will move the focus to the adjacent region, following the visual order.
