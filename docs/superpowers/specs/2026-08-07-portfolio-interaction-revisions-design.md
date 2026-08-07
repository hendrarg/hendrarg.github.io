# Portfolio Interaction Revisions Design

**Date:** 2026-08-07  
**Status:** Approved for planning  
**Scope:** Hero music player, About terminal, and Selected Work

## Goal

Correct three interaction gaps in the redesigned portfolio while preserving its approved English content, dark purple visual system, real audio playback, responsive behavior, and accessibility fallbacks.

The finished revision must:

1. Make the music player visibly separate into layered 3D components on hover.
2. Make the About terminal type its code character by character when it enters the viewport.
3. Replace the eight-card Selected Work grid with a compact, interactive 3D carousel based on the portfolio's previous carousel concept.

## 1. Hover-Separated 3D Music Player

### Resting state

The player remains visually composed and nearly flat when the pointer is outside its interaction area. Its profile, waveform, track metadata, timeline, and controls read as one coherent music card.

### Hover state

The outer player container is the stable interaction zone. When a fine pointer enters it:

- The card tilts toward the pointer, capped at approximately 16-18 degrees.
- The profile layer moves to roughly 35px of depth.
- Track metadata and timeline move to roughly 50-65px of depth.
- Playback controls move to roughly 75px of depth.
- The waveform panel moves furthest, at roughly 100px of depth.
- Layers receive small pointer-relative X/Y offsets in addition to `translateZ`, making the separation visible even when the card is viewed close to the center.
- Lighting and glare continue to follow the pointer without obscuring text or controls.

When the pointer leaves the outer container, rotation, offsets, and depth return smoothly to their resting values. The interaction zone must not collapse or flicker while child layers extend beyond the base card.

### Non-pointer and accessibility behavior

- Coarse-pointer devices keep the composed flat presentation.
- `prefers-reduced-motion: reduce` disables tilt, parallax, layer separation, and decorative waveform motion.
- Audio playback, progress seeking, time display, restart controls, error messages, and keyboard focus remain unchanged and operable.
- With JavaScript disabled, the player remains a readable static card and the native audio source remains available in the document.

## 2. Character-Typed About Terminal

### Trigger and sequence

The typing animation starts once when approximately 30% of the terminal enters the viewport. It does not replay when the user scrolls away and returns.

The terminal types its existing 13-line quality profile character by character:

- Normal cadence is approximately 18-25ms per character.
- Short pauses follow punctuation, brackets, and line endings so the animation feels intentional rather than mechanically uniform.
- A blinking cursor appears on the active line.
- After the sequence finishes, the cursor remains at the end of the final line.

### Content and fallback model

The complete semantic code remains in the HTML for SEO, assistive technology, and no-JavaScript access. JavaScript creates or controls a separate visual typing layer without deleting the source content.

- Assistive technology must not announce every typed character.
- The visual animation layer is hidden from assistive technology.
- Reduced-motion users see the complete code immediately.
- If `IntersectionObserver` is unavailable, the complete code appears immediately.
- Destroying the module clears pending timers so no work continues after cleanup.

## 3. Compact 3D Selected Work Carousel

### Presentation

All eight approved projects remain in the document, but the section no longer displays all cards at once.

The carousel shows:

- One dominant active project in the center.
- The previous and next projects as smaller, partially recessed side cards.
- Remaining projects scaled down and visually sunk behind the active group.
- A compact caption below the stage containing the active project's title, technologies, description, and one external action link.

The visual transition combines depth, scale, opacity, and a small Y-axis rotation. It follows the previous portfolio carousel concept while using the current dark purple design tokens and card styling.

### Navigation

Users can change the active project through:

- Previous and next buttons.
- One dot indicator per project.
- Left and right arrow keys while the carousel has focus.
- Horizontal swipe gestures on touch devices, using a deliberate movement threshold to avoid accidental changes.

Navigation wraps from the first project to the last and from the last project to the first.

### Accessibility and fallback

- Only the active project is interactive and exposed as current carousel content.
- Inactive cards are removed from the tab order and marked hidden from assistive technology.
- Controls have explicit labels, dots expose the selected state, and the active caption update is announced without excessive verbosity.
- With JavaScript disabled, projects fall back to a horizontally scrollable list with working project links.
- Reduced motion replaces spatial movement with a brief opacity transition.

## Architecture

### Player

`src/js/player-tilt.mjs` remains responsible for pointer tracking and normalized pointer calculations. It will expose or set hover-state variables used by CSS to interpolate card rotation, per-layer depth, and pointer-relative offsets. The real audio state remains isolated in `src/js/player-audio.mjs`.

### Terminal

`src/js/terminal.mjs` will own the typing sequence, cadence calculation, one-time viewport trigger, reduced-motion fallback, and timer cleanup. Semantic source markup and the animated visual layer remain separate.

### Carousel

A focused carousel module will own active-index calculations, wrapping, rendering state, keyboard controls, buttons, dots, swipe detection, resize handling, and cleanup. Project content remains authored in HTML through data attributes or equivalent semantic markup rather than duplicated in JavaScript.

`src/js/main.mjs` initializes the new behavior and registers cleanup consistently with the existing modules.

## Error Handling and Progressive Enhancement

- Missing optional player layers must not stop audio controls from initializing.
- Missing terminal markup must return a no-op cleanup function.
- Missing carousel controls or slides must leave the fallback project list readable instead of throwing.
- Audio load/play errors continue to appear in the existing live status region.
- JavaScript-disabled and reduced-motion states remain useful, complete, and visually stable.

## Testing Strategy

Implementation will follow test-driven development. Automated tests will cover:

- Player tilt bounds, hover/rest state, depth variables, and cleanup.
- Terminal character cadence, punctuation pauses, reduced-motion behavior, one-time activation, and cleanup.
- Carousel active-index wrapping, previous/next actions, dot selection, keyboard navigation, swipe thresholds, and reduced-motion state.
- Semantic content count, control labels, active/inactive accessibility attributes, external-link protection, and no-JavaScript fallback structure.
- Responsive rules for a single compact carousel stage without horizontal page overflow.

Browser verification will cover:

- Visible component separation during desktop hover and smooth restoration on pointer leave.
- Character-by-character terminal playback when scrolled into view.
- Carousel buttons, dots, keyboard arrows, wrapping, and mobile swipe.
- Desktop and mobile layout, real audio playback, reduced motion, and JavaScript-disabled fallbacks.

## Success Criteria

The revision is complete when:

1. The player layers visibly separate only during hover on fine-pointer devices.
2. The terminal visibly types characters once on viewport entry and remains readable in every fallback state.
3. Selected Work presents one primary project at a time and supports button, dot, keyboard, and swipe navigation.
4. All eight projects, all existing audio behavior, and approved portfolio content remain available.
5. Automated checks pass and browser verification confirms the expected behavior at desktop and mobile sizes.
