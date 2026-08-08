# About Checkpoint Loop Design

## Goal

Replace the long About copy beside the terminal with three concise checkpoints
that appear one at a time, hold as a complete set, fade out, and repeat while
the section is visible.

## Content

The three checkpoints are:

1. **Build with intent** — connect product needs to a clear quality strategy.
2. **Automate the critical path** — cover Playwright, API, performance, and mobile flows.
3. **Ship with confidence** — turn test evidence into clear release decisions.

## Animation

The left About column becomes a compact vertical timeline. A thin connector line
runs behind three nodes. Each node and its text uses the same CSS animation with
staggered delays: checkpoint one enters first, then two, then three. After all
three are visible, the group holds briefly, fades out together, and loops back
to the first checkpoint.

The loop is CSS-driven and starts in the normal page state; the existing
`data-reveal`/IntersectionObserver behavior controls when the section becomes
visible. Under `prefers-reduced-motion: reduce`, the animation is disabled and
all checkpoints remain visible without cycling.

## Accessibility and fallback

- Checkpoints remain semantic list content and readable when JavaScript is disabled.
- Decorative connector and node glow use `aria-hidden="true"`.
- No content depends on animation to be discovered.
- The terminal keeps its existing semantic source and separate `aria-hidden` typing output.

## Verification

- Add content assertions for three checkpoint labels and the timeline marker.
- Add CSS assertions for staggered delays, infinite loop, connector, and reduced-motion fallback.
- Add responsive assertions to ensure the compact timeline does not overflow beside the terminal.
- Run the full Node test suite, Tailwind build, and local preview checks at desktop and mobile widths.
