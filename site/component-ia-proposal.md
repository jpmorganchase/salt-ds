# Component IA proposal

This proposal groups the 71 current component overview pages into 12 browse
categories without changing any existing component routes.

Source of truth for the current inventory:

- `site/public/search-data.json`
- `site/docs/components`
- `site/src/mosaic-plugins/SidebarPlugin.mjs`

## Proposed categories

1. Actions
2. Data entry
3. Selection controls
4. Date and time
5. Navigation
6. Layout
7. Containers and disclosure
8. Overlays
9. Feedback and status
10. Data display and visualization
11. Content and identity
12. Providers

## Proposed sidebar structure

The sidebar should keep the existing component overview pages and their child
pages (`Overview`, `Usage`, `Examples`, `Accessibility`) exactly where they are,
but insert a virtual category layer above each component group.

```text
Components
|- Overview
|- Actions
|  |- Button
|  |- Segmented button group
|- Data entry
|  |- Form field
|  |- Input
|  |- Multiline input
|  |- Number input
|  |- Tokenized input
|  |- File drop zone
|- Selection controls
|  |- Checkbox
|  |- Radio button
|  |- Switch
|  |- Dropdown
|  |- Combo box
|  |- List box
|  |- Pill
|  |- Rating
|  |- Slider
|  |  |- Range slider
|  |- Tabs
|  |- Tree
|  |- Toggle button
|- Date and time
|  |- Calendar
|  |- Date input
|  |- Date picker
|  |  |- Range date picker
|- Navigation
|  |- Link
|  |- Navigation item
|  |- Pagination
|  |- Skip link
|  |- Vertical navigation
|- Layout
|  |- Layouts overview
|  |- Border layout
|  |- Flex layout
|  |- Flow layout
|  |- Grid layout
|  |- Parent-child layout
|  |- Split layout
|  |- Stack layout
|  |- Divider
|  |- Panel
|  |- Splitter
|- Containers and disclosure
|  |- Accordion
|  |- Card
|  |- Carousel
|  |- Collapsible
|- Overlays
|  |- Dialog
|  |- Drawer
|  |- Menu
|  |- Overlay
|  |- Scrim
|  |- Tooltip
|- Feedback and status
|  |- Banner
|  |- Badge
|  |- Progress
|  |- Spinner
|  |- Status indicator
|  |- Stepper
|  |- System status
|  |- Toast
|- Data display and visualization
|  |- Chart
|  |- Data grid
|  |- Static list
|  |- Table
|- Content and identity
|  |- Avatar
|  |- Country symbol
|  |- Icon
|  |- Kbd
|  |- Tag
|  |- Text
|- Providers
   |- Localization provider
   |- Salt provider
   |- Semantic icon provider
```

Category rationale for the recent moves:

- `Menu` sits in `Overlays` because Salt defines it as a triggered container of
  actions or choices opened from a button, shortcut, or right-click interaction.
- `Tabs` sits in `Selection controls` because it switches related content views
  within the current page rather than routing to a different destination.
- `Tree` sits in `Selection controls` because Salt describes it as hierarchical
  data where users optionally select one or more nodes.
- `Toggle button` sits in `Selection controls` because Salt frames it as a
  control for switching states or making a mutually exclusive choice, and other
  systems generally classify toggle buttons with inputs or selection controls.
- `Pill` primarily sits in `Selection controls`, but it also has `Actions` as a
  secondary category because Salt defines it as supporting both immediate
  actions and selectable states.
- `Static list` sits in `Data display and visualization` because Salt describes
  it as a non-interactive way to display structured content, which aligns more
  closely with list/data-display patterns than with containers.

## Recommended implementation strategy

### 1. Preserve routes

Do not move `site/docs/components/**` files to new folders unless route changes
are acceptable. In this repo, routes are derived from file paths and the sidebar
tree is derived from directories by `site/src/mosaic-plugins/SidebarPlugin.mjs`.
Physical moves would therefore create route churn.

### 2. Add category metadata to component overview pages

Add category metadata only to component overview `index.mdx` files, not to
every child page. A small frontmatter extension is enough.

Example:

```yaml
sidebar:
  category: Actions
  categoryPriority: 130
```

For nested component variants, keep parent/child relationships explicit.

Examples:

```yaml
sidebar:
  category: Selection controls
  categoryPriority: 100
  parentComponent: slider
```

```yaml
sidebar:
  category: Date and time
  categoryPriority: 100
  parentComponent: date-picker
```

### 3. Teach `SidebarPlugin` about virtual categories

Recommended approach:

1. Keep the current folder-based grouping logic.
2. After the current group tree is created for `/salt/components`, insert one
   extra group level using `page.sidebar.category`.
3. Place each component group under its category group instead of directly under
   `/salt/components`.
4. Keep the current `Overview` page at `/salt/components/index`.

This is lower risk than relocating docs files because it preserves:

- existing routes
- current breadcrumbs and page links
- current search entries
- current deep links from docs, patterns, and external references

### 4. Handle the layout section as a special case

`/salt/components/layouts/index` is a real landing page today, not just a
component. Keep it, but place it inside the `Layout` category as `Layouts
overview`.

That preserves existing links and lets the new IA absorb the old layout
subsection cleanly.

### 5. Keep nested variants nested

Keep these as child nodes of their parent components in the sidebar:

- `Range slider` under `Slider`
- `Range date picker` under `Date picker`

They can still remain standalone routes and search results.

## Suggested rollout

### Phase 1

Add the category map and align on names and order.

### Phase 2

Add category metadata to the 71 component overview pages.

### Phase 3

Update `SidebarPlugin.mjs` to create category groups only for
`/salt/components`.

### Phase 4

Update `site/docs/components/index.mdx` to introduce the new browsing model and
link to each category.

### Phase 5

Review labels, ordering, and search behavior after a preview build.

## Files to touch for implementation

- `site/src/mosaic-plugins/SidebarPlugin.mjs`
- `site/docs/components/index.mdx`
- `site/docs/components/**/index.mdx`
- `site/docs/components/layouts/index.mdx`

## Deliverables in this repo

- `site/component-category-map.json`
- `site/component-ia-proposal.md`
