/*
 * Page-level CTA. Shared by the contact form and the confirmation page so the same
 * action never renders as two different buttons. The hero keeps its own
 * larger variant in index.astro.
 */
export const ACTION_CLASS =
    "inline-flex min-h-[3.25rem] items-center justify-center rounded-xs px-6 font-sans text-xs font-semibold uppercase tracking-[0.18em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:px-8 sm:text-sm";

export const ACTION_SOLID =
    "bg-primary text-secondary hover:bg-primary/85 focus-visible:outline-primary dark:bg-primary-dark dark:hover:bg-primary-dark/85 dark:text-secondary-dark dark:focus-visible:outline-primary-dark";

export const ACTION_OUTLINE =
    "border border-primary/25 text-primary hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-primary dark:border-primary-dark/20 dark:text-primary-dark dark:hover:border-primary-dark/52 dark:hover:bg-primary-dark/4 dark:focus-visible:outline-primary-dark";
