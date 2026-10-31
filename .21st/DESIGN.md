# Deevee Capital — Brand & UI Design System (`.21st/DESIGN.md`)

## 1. Brand Positioning & Personality
- **Brand:** DEEVEE CAPITAL
- **Positioning:** An emerging initiative exploring early-stage startup investment opportunities and inviting founders to share promising businesses.
- **Personality:** Intelligent, Discerning, Founder-friendly, Understated, Ambitious, Trustworthy, Long-term oriented.
- **Heritage Note:** Associated with the entrepreneurial business background of **Dee Vee Projects Limited** — communicated with strict accuracy (never implying a regulated investment fund, prior venture track record, or guaranteed capital).

---

## 2. Phase 4 Creative Directions Comparison

| Criterion | Direction A: Quiet Institutional (Selected) | Direction B: Modern Investment Studio | Direction C: Editorial Founder-First |
| :--- | :--- | :--- | :--- |
| **Core Concept** | Warm ivory (`#F7F5F0`) primary canvas paired with deep midnight navy (`#101A24`) anchor chambers, architectural hairline grids, serif headlines, and muted champagne gold (`#C6AD7A`) details. | Full-bleed midnight navy (`#101A24`) & charcoal (`#17191C`) dark mode, asymmetric layouts, high-contrast display typography. | Magazine-inspired single-column essay flow with oversized pull quotes and loose narrative spacing. |
| **Brand Credibility** | **9.8 / 10** — Conveys permanence, institutional discipline, and understated confidence without overstating history. | **8.2 / 10** — Reads closer to a Web3 studio or developer tool than an enduring business-backed venture initiative. | **8.5 / 10** — Literary and warm, but lacks structured institutional framing. |
| **Originality** | **9.5 / 10** — Subtle architectural drafting lines and corner crosshairs (`+`) nod to real-world building & engineering discipline. | **8.4 / 10** — Familiar dark-mode VC aesthetic. | **8.8 / 10** — Distinctive essay feel, less structured for interactive evaluation criteria. |
| **Readability** | **9.8 / 10** — AAA contrast (`#17191C` on `#F7F5F0` for reading; `#F7F5F0` on `#101A24` for high-focus CTAs). | **8.3 / 10** — Extended reading on dark surfaces can cause halation. | **9.4 / 10** — High readability, though lower scannability. |
| **Founder Appeal** | **9.7 / 10** — Combines `ajuniorvc.com`-inspired clarity and approachability with bespoke architectural craft. | **8.6 / 10** — Slightly intimidating/cold for first-time founders. | **9.2 / 10** — Warm, though conversion path to pitch form is less direct. |
| **Mobile Usability** | **9.7 / 10** — Crisp collapsible hairline borders, clear section numbers (`01`–`05`), ergonomic form controls. | **8.8 / 10** — Heavy dark cards on small viewports. | **9.0 / 10** — Long vertical scroll before reaching actionable pitch form. |

---

## 3. Centralized Design Tokens

- `--color-midnight-navy`: `#101A24`
- `--color-deep-charcoal`: `#17191C`
- `--color-warm-ivory`: `#F7F5F0`
- `--color-champagne-gold`: `#C6AD7A`
- `--color-slate-grey`: `#77818B`
- `--color-pure-white`: `#FFFFFF`
- `--font-serif`: `'Cormorant Garamond', Georgia, serif`
- `--font-sans`: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
- `--font-mono`: `'JetBrains Mono', monospace`

---

## 4. 21st.dev Components Integrated & Adapted

1. **`@kokonutd/components/background-paths`** (`src/components/ui/background-paths.tsx`)
   - Adapted into a restrained architectural contour & compass path field using `#C6AD7A` (champagne gold) and `#101A24` (midnight navy) hairlines with `useReducedMotion()` support.
2. **`@educalvolpz/components/soft-blur-in`** (`src/components/ui/soft-blur-in.tsx`)
   - Per-word/character editorial blur-in reveal with `useReducedMotion()` and `useInView()` support.
3. **`@dillionverma/components/interactive-hover-button`** (`src/components/ui/interactive-hover-button.tsx`)
   - Magnetic/sliding editorial CTA button with expanding champagne gold / midnight navy dot indicator and arrow transition.
4. **`@efferd/components/grid-feature-cards`** (`src/components/ui/grid-feature-cards.tsx`)
   - Architectural SVG `GridPattern` feature cards with blueprint coordinates and subtle square highlights, used in **What We Look For**.
5. **`@efferd/components/cta-3`** (`src/components/ui/cta-3.tsx`)
   - Architectural framed Call-to-Action chamber with corner `Plus` crosshairs and extended drafting guide lines, used in **Founder Call to Action**.
6. **`@efferd/components/contact-card`** (`src/components/ui/contact-card.tsx`)
   - Split architectural frame with corner `Plus` crosshairs, used to house the **Startup Submission Form**.
7. **`@dillionverma/components/dot-pattern`** (`src/components/ui/dot-pattern.tsx`)
   - Subtle SVG dot matrix background texture.
8. **`@meschacirung/components/hero-section-6` (Navbar Pattern)** (`src/components/ui/editorial-navbar.tsx`)
   - Sticky glass/ivory architectural navigation bar with keyboard-accessible mobile drawer.
