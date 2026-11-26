# Specmob update

Delete: app/support/page.tsx (next.config.ts 301s /support to /fund)

Static pages (about, how we score, fund, contact, privacy, terms) now share app/components/company/CompanyShell.tsx and Prose.tsx.
Labels, JSON-LD names, breadcrumbs and h1s match: About Specmob, How we score, Fund Specmob, Contact Specmob, Privacy policy, Terms of use.
Route /methodology is unchanged.
Type-check: npx tsc --noEmit passes.
