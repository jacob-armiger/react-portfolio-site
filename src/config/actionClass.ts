/*
 * Page-level CTA. Shared by the footer, the contact form and the confirmation page so
 * the same action never renders as three different buttons. The hero keeps its own
 * larger variant in index.astro.
 */
export const ACTION_CLASS =
    "inline-flex min-h-[3.25rem] items-center justify-center rounded-full px-6 font-sans text-xs font-semibold uppercase tracking-[0.18em] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:rounded-xs sm:px-8 sm:text-sm";

export const ACTION_SOLID =
    "bg-primary text-secondary focus-visible:outline-primary dark:bg-primary-dark dark:text-secondary-dark dark:focus-visible:outline-primary-dark";

export const ACTION_OUTLINE =
    "border border-primary/25 text-primary hover:border-primary/60 focus-visible:outline-primary dark:border-primary-dark/25 dark:text-primary-dark dark:hover:border-primary-dark/60 dark:focus-visible:outline-primary-dark";
