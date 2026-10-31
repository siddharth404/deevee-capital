# Deevee Capital

Official website for **Deevee Capital** ([deeveecapital.com](https://deeveecapital.com)).

> "Big ideas deserve a chance to become big businesses."

Deevee Capital is an exploratory venture initiative exploring early-stage startup investment opportunities and inviting founders to share promising businesses. Associated with the entrepreneurial background of Dee Vee Projects Limited ([dvplindia.in](https://dvplindia.in/)).

---

## 🏛️ Architecture & Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19, Server Components)
- **Styling**: Tailwind CSS, PostCSS, custom design tokens (`--ctl-*` copperplate engraving motif)
- **Component Ecosystem**: [21st.dev](https://21st.dev/) & Lucide React
- **Hosting & Infrastructure**: Google Cloud Platform (Cloud Run 2nd Gen, Firebase Hosting webframeworks)
- **Dynamic Capabilities**:
  - Full-length Perspectives publication engine (`/perspectives`, `/perspectives/[slug]`)
  - End-to-end founder pitch submission pipeline (`/api/pitch`) with rate limiting, reference ID generation (`DVC-2026-XXXXXX`), and automated notification dispatches to `siddharth@deeveecapital.com` and `ravi@deeveecapital.com`.
  - Privacy policy and institutional clarifications (`/privacy`, `#dvpl-heritage`).

---

## 🚀 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run dev server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Production build**:
   ```bash
   npm run build
   ```

---

## ☁️ Deployment

Deployed on Google Cloud Platform:
- **GCP Project**: `deeveecapital-site`
- **Domain**: `deeveecapital.com` / `www.deeveecapital.com`
- **Deployment command**:
   ```bash
   firebase deploy --only functions,hosting --project deeveecapital-site --force
   ```

---

## ⚖️ Institutional Clarification

Deevee Capital is an exploratory initiative. Our association with the entrepreneurial background of Dee Vee Projects Limited does not imply that Dee Vee Projects Limited is a regulated investment fund, that specific venture investments have been made to date, or that submitting information guarantees capital or an investment commitment.
