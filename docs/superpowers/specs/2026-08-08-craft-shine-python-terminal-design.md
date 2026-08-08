# Technical Craft Shine & Python Terminal Design

## Goal

Add a restrained looping shine to every Technical craft card, with a different
start delay per card, and restyle the About terminal's sample as Python syntax
matching the supplied `quicksort.py` reference.

## Scope

- Update only the Technical craft card markup/styles and About terminal content/styles/tests.
- Keep the existing static HTML fallback, terminal intersection trigger, and character-by-character typing behavior.
- Do not add a framework, runtime dependency, canvas, or animation library.

## Craft card animation

Each craft card receives a `data-craft-card` marker and a stable index. A CSS
pseudo-element uses a conic-gradient sweep clipped to the card border. The
sweep loops continuously, with an increasing delay per card so the cards do not
flash simultaneously. The pseudo-element remains behind the card content and
does not change card dimensions or pointer behavior.

The animation is enabled only when motion is allowed. Under
`prefers-reduced-motion: reduce`, the sweep is disabled and the cards retain a
static border. The existing reveal animation remains the only entrance motion.

## Python terminal

The semantic source lines become a compact `quick_sort(items)` example. The
source keeps the existing 13-line shape so the typing engine and accessibility
fallback remain unchanged. Python token spans cover:

- keywords (`def`, `if`, `return`)
- function names and builtins (`quicksort`, `len`)
- parameters and variables (`items`, `pivot`, `left`, `mid`, `right`)
- strings, numbers, operators, and comments

The visual typing output remains generated from plain text, so it remains
faithful to the semantic source. CSS token colors are extended without
changing terminal timing or observer behavior.

## Verification

- Add content assertions for craft markers, stagger values, Python filename,
  and token classes.
- Add responsive assertions for the shine pseudo-element and reduced-motion
  fallback.
- Preserve all existing terminal lifecycle/frame tests.
- Run the full test suite and Tailwind build, then inspect the local preview at
  desktop and mobile widths.
