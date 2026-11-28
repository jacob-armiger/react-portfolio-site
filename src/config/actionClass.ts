/*
 * Page-level CTA. Shared by the contact form and the confirmation page so the same
 * action never renders as two different buttons. The hero keeps its own
 * larger variant in index.astro.
 */
export const ACTION_CLASS =
    "inline-flex min-h-[3.25rem] items-center justify-center rounded-xs px-6 font-sans text-xs font-semibold uppercase tracking-[0.18em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:px-8 sm:text-sm";

export const ACTION_SOLID =
    "bg-ink text-page hover:bg-ink/85 focus-visible:outline-ink";

export const ACTION_OUTLINE =
    "border border-control text-ink hover:border-control-hover hover:bg-tint focus-visible:outline-ink";
