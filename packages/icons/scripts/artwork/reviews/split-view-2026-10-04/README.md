# Split view: continuous inside corners

The supplied Curve Connections brand photograph supports calibrating radius by the angle of each exposed concave sector. Its labels show right angle 3X, obtuse 4X–8X, acute X and tiny acute 0.5X. The photograph does not establish what X means for system icons; these are evidence of a relationship, not adopted pixel values.

The previous Split view used different corner radii for the frame and divider, then joined a stroked arc to an unstroked filled panel. The arc extended half a stroke beyond the panel edge and ended in a visible shelf.

The revised recipe constructs a complete left-pane frame with four identical corner profiles and a continuous stroked divider against the right fill. The outer perimeter stays sharp. The divider intentionally narrows the left opening by half the current stroke compared with the previous fill edge. Text positions, line lengths, total frame dimensions and the view-box fit are unchanged.

## Verification

- Generated numeric SVG, React component, CSS mask and source hash refreshed through generate:icons.
- New final-paint regression locates the opening and compares mirrored corner silhouettes at weights 0.67, 1, 8/7, 4/3 and 1.5. The old source fails all five with 15.8–18.5% disagreement; the revised source passes with 0.01–0.058%, below the 1% tolerance. This specifically detects unequal corners and the old shelf; it is not a general proof of contour quality. See before-result.json and after-result.json.
- Native-review.png checks generated React at 12/14/16px in light/dark at Chrome DPR1, along with 4× enlargements of exactly those raster pixels, a contour enlargement, numeric CSS masks and actual Salt Button markup. Rendered dimensions and weights are in render-check.json.
- A second agent independently reviewed the finished image and source: all four inside corners flow into the straight edges; outside corners remain sharp; text clears the divider; no concrete recognition regression found.
- Column chooser and Panel open right, both variants, remain byte-equivalent after newline normalization (sibling-check.json).
- Icon integration check passes without errors or warnings.

Chrome DPR1 captures expose raster defects but do not establish identical appearance on every physical monitor or browser. No AI-generated artwork was used. The whole set's other radii have not been changed or declared compliant with a literal X ratio.

Full validate:icons passed across all 550 exports with no reported geometry failures or warnings; see validation.log. This automated result does not replace a visual review of every icon under the revised guidance.
