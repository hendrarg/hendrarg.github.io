# Portfolio Redesign Design

## Objective

Redesign Hendra Rizal Gunawan's portfolio as a recruiter-friendly, technically credible, and visually distinctive single-page site. The design takes visual inspiration from Reja UI while preserving Hendra's identity, content, and QA engineering focus.

The site must help a recruiter understand Hendra's value quickly, then provide enough technical depth for an engineering reviewer to evaluate his automation, performance-testing, and AI-assisted QA experience.

## Source of Truth

- Latest CV: `D:\CV Hendra\CV_Hendra_Rizal_Gunawan.pdf`
- Existing portfolio content and project links in this repository
- Existing project images in `img/`
- Visual reference: `https://rejajamil.vercel.app/`
- 3D interaction reference: `https://rejajamil.vercel.app/hero/pokemon-card`

Facts from the latest CV override older statements in the existing portfolio and README. The redesign must not invent metrics, employers, projects, dates, certifications, or responsibilities.

## Audience and Language

- Primary audience: recruiters and hiring managers
- Secondary audience: QA leads, SDETs, and software engineers
- Language: English
- Primary message: Hendra builds reliable automation systems with Playwright and AI-assisted QA workflows

Approved hero headline:

> QA Engineer - Building Reliable Automation with Playwright & AI

Approved expressive hero statement:

> Building reliable software, intelligently.

## Visual Direction

The approved direction combines:

- The cinematic, gradient-led composition of the reference site
- A dark engineering grid background
- Purple, magenta, coral, and electric-blue accents
- Glass-like panels and restrained glow
- Poppins or a similarly rounded geometric sans-serif for display text
- Strong visual hierarchy with generous spacing
- Dark-only presentation to keep the grid, reflection, and glow coherent

The design should feel crafted and technically sophisticated, not like a direct copy of Reja UI. Hendra's name, QA achievements, automation work, and original visual assets remain the focus.

## Page Structure

### 1. Hero

The hero contains:

- Hendra RG wordmark
- Sticky navigation links: Impact, Journey, Craft, Work, Contact
- Small quality-focused eyebrow label
- Expressive statement: "Building reliable software, intelligently."
- Supporting summary based on the latest CV
- Primary CTA to the work journey
- Secondary CTA to download the latest resume
- Layered 3D Quality Signal Player as the visual centerpiece

### 2. Impact

The impact row gives recruiters fast evidence:

- 5+ years in quality engineering
- Regression success raised from 60% to 90%
- Experience across digital products, logistics, banking, and fintech
- AI-assisted automation workflow expertise

Only metrics explicitly present in the CV may be used.

### 3. Work Journey

An interactive but readable vertical timeline presents:

1. QA Engineer at Yapp - June 2026 to present
2. SDET at Lion Parcel under MSBU - October 2025 to May 2026
3. QA Automation Engineer at Bank BRI under Talent Tech - May 2024 to September 2025
4. SQA Engineer at Asset Data Solution Sdn Bhd - January 2022 to September 2024

Each entry includes role, employer, dates, project context, concise responsibilities, tools, and key achievements. The timeline must remain fully readable without JavaScript.

### 4. Technical Craft

Skills are grouped by capability rather than shown as an undifferentiated logo wall:

- Automation: Playwright, Selenium, Appium, Katalon Studio, Cypress, Robot Framework
- BDD: Cucumber integrations
- Performance: K6 and JMeter
- API: Postman, Rest-Assured, and cURL
- Languages: JavaScript, TypeScript, Java, and Python
- Database: SQL and DBeaver
- DevOps and CI/CD: Git, Jenkins, GitHub Actions, and pipelines
- AI workflows: prompt engineering, AI-driven test generation, workflow design, skill roles, and command structures

### 5. Selected Projects

Replace the current 3D carousel with a responsive project grid that is faster to scan and easier to use with keyboard and touch input.

Each card contains:

- Existing project image
- Project name
- One-sentence outcome or purpose
- Relevant tools
- GitHub or live-project link when available

Project cards may use a small tilt effect, but it must be weaker than the hero player and never reduce readability.

### 6. Education and Certifications

Present education and certifications as a compact credibility section:

- S1 Information System, Universitas BSI Bandung, 2019
- D3 Informatics Management, Universitas BSI Tasikmalaya, 2017
- The four Udemy certifications listed in the latest CV

### 7. Contact

Use direct, dependable contact actions:

- Email
- LinkedIn
- GitHub
- WhatsApp
- Resume download

Do not include a contact form that has no real delivery backend.

### 8. Footer

Use one compact footer with Hendra's name, current role, social links, and copyright. Remove repeated navigation and duplicated social icon groups.

## Layered 3D Quality Signal Player

The approved hero visual is a thin music-player-style panel inspired by the reference, adapted into an original QA visualization.

Content:

- Profile: Hendra Rizal, QA Engineer at Yapp
- Animated waveform representing a Playwright regression suite
- Track title: Release Confidence
- Track subtitle: Playwright - AI-Assisted Regression
- Progress indicator
- Previous, play/pause, and next controls

Interaction:

- A stable outer interaction zone tracks pointer movement
- The whole card tilts up to 20 degrees
- Glare, monochrome reflection, spotlight, and shine react to pointer position
- The base surface remains at `translateZ(0)`
- Profile layer uses approximately `translateZ(36px)`
- Track layer uses approximately `translateZ(48px)`
- Controls use approximately `translateZ(64px)`
- Waveform panel uses approximately `translateZ(80px)`
- Internal scale compensation prevents translated layers from overlapping
- The play/pause control pauses and resumes the waveform animation; it does not play audio

The production implementation may tune exact depth and tilt values during responsive verification while preserving visibly separated layers.

## Motion and Accessibility

- Sticky navigation highlights the active section
- Smooth scrolling is used only when motion is allowed
- Section reveals are brief and support content hierarchy
- Desktop pointer interaction drives the 3D player
- Touch devices receive a stable card with a subtle floating animation, without gyroscope or device-orientation permission
- `prefers-reduced-motion` disables tilt, floating animation, and waveform motion
- Every interactive element is keyboard reachable and has an accessible name
- Focus styles remain visible against the dark background
- Semantic headings, landmarks, links, and buttons are required
- Content must remain readable when JavaScript is unavailable

## Technical Architecture

Keep the existing deployment model:

- Static HTML for semantic content and page structure
- Tailwind CSS plus focused custom CSS for the design system and 3D effects
- Vanilla JavaScript for navigation, intersection observers, waveform controls, and pointer transforms
- GitHub Pages-compatible output
- No framework migration
- No runtime API, database, or unnecessary dependency

The latest CV replaces the older resume stored under `resource/` so the download CTA always serves the current document.

## Progressive Enhancement and Failure Handling

- Without JavaScript, the navigation, content, project links, contact links, and resume download remain functional
- The 3D player renders as a static card when scripting or motion is unavailable
- Missing project images must not hide project names or links
- External links open safely with `rel="noopener noreferrer"`
- Contact actions use direct URLs rather than simulated form submission
- Existing project links must be checked; invalid links are removed or clearly disabled rather than left broken

## Responsive Behavior

- Desktop: two-column hero with text left and 3D player right
- Tablet: narrower two-column layout when space permits, otherwise a stacked hero
- Mobile: stacked hero, centered static/floating player, compact navigation menu, one-column project grid
- All content must avoid horizontal overflow at 320px width
- Touch targets must be at least 44 by 44 CSS pixels where practical

## Verification

Before completion, verify:

1. Tailwind production build succeeds
2. The page loads without console errors
3. Navigation, CTAs, resume download, social links, and project links work
4. Hero and all sections render correctly at representative mobile, tablet, and desktop widths
5. The 3D player produces a real `matrix3d` transform on pointer movement
6. Player layers have distinct Z transforms and do not overlap or clip
7. Play/pause changes waveform animation state
8. Reduced-motion mode removes nonessential animation
9. Keyboard navigation and focus indicators work
10. JavaScript-disabled content remains readable
11. No mojibake, placeholder text, invented metrics, or stale employment details remain

## Out of Scope

- React, Vue, Next.js, or another framework migration
- A CMS or database
- A working contact-message backend
- Real audio playback
- Copying Reja UI branding, copy, images, or proprietary component code
- Adding claims or metrics not supported by the latest CV
