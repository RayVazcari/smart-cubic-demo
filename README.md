# Cubic Smart Innovation LLC

A bilingual (English/Spanish) marketing site built for a multi-division general contractor (construction, roofing, restoration, and water mitigation) in San Antonio, TX.

**Live demo:** https://rayvazcari.github.io/smart-cubic-demo/

## About this project

This is a real client project, built and shown here for portfolio purposes. Business branding, copy, and imagery belong to the client — see [License](#license) below.

The client is early-stage: a licensed civil engineer and IICRC-certified water mitigation technician with no prior digital presence. The brief was to stand up a fast, credible, bilingual site that reflects the business's real services and service area, ahead of building out phone intake, CRM, and scheduling in later phases.

## Highlights

- **Zero dependencies, zero build step** — plain HTML/CSS/JS, deployable as static files with no bundler, framework, or `node_modules`.
- **Bilingual by design** — a small `data-i18n` attribute system drives every string from a single EN/ES dictionary (`src/js/i18n.js`), with a persistent language toggle and browser-language auto-detection.
- **Design-token theming** — the entire palette, type scale, and spacing system are CSS custom properties, making a full rebrand (which this project went through) a matter of swapping variables, not hunting through markup.
- **Motion with restraint** — `IntersectionObserver`-driven scroll reveals and staggered entrance animations, fully disabled under `prefers-reduced-motion`.
- **Accessible fundamentals** — skip link, visible focus states, semantic landmarks, and form labels/validation on the contact form.
- **Fluid responsive layout** — `clamp()` and auto-fit grids handle most breakpoints without device-specific overrides.

## Pages

`index.html` · `services.html` · `about.html` · `areas.html` · `contact.html`

## Tech stack

HTML5, CSS3 (custom properties, Grid/Flexbox), vanilla JavaScript (ES modules) — no framework, no build tooling.

## License

No license is granted. This repository is shared publicly for portfolio/demonstration purposes only. The business name, logo, and copy belong to Cubic Smart Innovation LLC and may not be reused.
