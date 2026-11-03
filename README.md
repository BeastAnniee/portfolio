# Portfolio — Jostin Aldair Nava López

A personal portfolio built with Next.js, TypeScript, and Tailwind CSS. Three pages per language (Home, Work and About) tell a short story: who I am, what I have built and how I got here.

![Portfolio Screenshot](public/portfolio.png)

---

## ✨ Features

- **Modern stack:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Three pages, two languages:** `/[lang]` (Home), `/[lang]/work` and `/[lang]/about` for `en` and `es`; the language switch keeps the current page and old `#anchors` of the former single page redirect to the right page
- **Motion with GSAP + ScrollTrigger** (hero entrance, section reveals, scrubbed hero photo, page curtain), lazy-loaded from `src/animation/`; everything is visible by default, so it degrades to a static page without JavaScript, if GSAP fails to load or with `prefers-reduced-motion`
- **Responsive** and mobile-first design
- **Accessible**: keyboard navigation, aria labels
- **Contact form** with EmailJS integration and toast feedback
- **Project cards** with scroll reveals; two featured projects on Home, full cards on Work
- **Dark color palette** for a focused UI

---

## 🚀 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/BeastAnniee/portfolio.git
   cd portfolio
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` and fill in your EmailJS keys:
     ```env
     NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
     NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
     NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
     ```
4. **Run the development server:**
   ```bash
   npm run dev
   # or yarn dev
   ```
5. **Open** [aldairdev.vercel.app](https://portfolio-2woc3j0d4-beastanniees-projects.vercel.app/)

---

## 🛠️ Customization

- Edit your info and links in `src/components/Hero.tsx` and `Footer.tsx`; text lives in `src/content/` (English and Spanish) and data in `src/content/facts.ts`.
- Add or update projects in `facts.projects` (`spotlight` shows on Home as a summary and on Work as full cards; `lab` shows in the Lab on Work). Which section lives on which page is set in `src/content/pages.ts`.
- Update contact methods and social links in `Footer.tsx`.
- Change the 404 message in `src/app/global-not-found.tsx`.
- Styles are easily customizable via Tailwind classes.

---

## 🌐 Deployment

Deploy easily on [Vercel](https://vercel.com/) (recommended for Next.js):
- Push your repo to GitHub
- Import into Vercel and set your environment variables
- Deploy!

---

## 📦 Tech Stack
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GSAP](https://gsap.com/) + ScrollTrigger (animation, ADR-0002; loaded lazily from `src/animation/`)
- [EmailJS](https://www.emailjs.com/) (for contact form)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙋‍♂️ Contact

Feel free to reach out via the contact form on the site or email: jostinaval@gmail.com

---

## Credits
- Inspired by many amazing portfolios in the dev community
- Designed & coded by [Jostin Aldair Nava López](https://github.com/BeastAnniee)
