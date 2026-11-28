/** Shape and type every CTA shares; the hero adds its own larger sizes. */
export const ACTION_BASE =
    "inline-flex items-center justify-center rounded-xs font-sans font-semibold uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

/*
 * Page-level CTA. Shared by the contact form and the confirmation page so the same
 * action never renders as two different buttons.
 */
export const ACTION_CLASS = `${ACTION_BASE} min-h-[3.25rem] px-6 text-xs tracking-[0.18em] sm:px-8 sm:text-sm`;

export const ACTION_SOLID = "bg-ink text-page hover:bg-ink/85 focus-visible:outline-ink";

export const ACTION_OUTLINE =
    "border border-control text-ink hover:border-control-hover hover:bg-tint focus-visible:outline-ink";
