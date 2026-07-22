/* Shared Tailwind class strings for the site's recurring type and layout roles.
   Static strings in a scanned source file, so Tailwind picks them all up. When
   a component library lands later, these are the shapes it has to match. */

export const page = "mx-auto w-full max-w-2xl px-6";

/* type roles */
export const eyebrow =
  "mt-12 mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground";
export const title =
  "mb-3.5 text-[25px] sm:text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground text-balance";
export const lede = "m-0 max-w-[54ch] text-base text-muted-foreground text-pretty";
export const section =
  "mb-1 text-[13px] font-semibold uppercase tracking-[0.04em] text-foreground";
export const mono = "font-mono text-sm tracking-normal";
export const note =
  "mt-10 border-t border-border pt-[18px] text-[13px] leading-relaxed text-muted-foreground";

/* vertical rhythm between major sections */
export const block = "mt-14";

/* label / leader / value row */
export const row = "flex items-center gap-2 py-2.5";
export const rowName = "whitespace-nowrap font-medium text-foreground";
export const rowMeta = "whitespace-nowrap text-sm text-muted-foreground";

/* the definition-list variant, with uppercase labels and a right-aligned value */
export const metaList = "group mt-9 border-t border-border";
export const metaRow = `${row} border-b border-border`;
export const metaName =
  "whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground";
export const metaVal = "text-right font-medium text-foreground";

/* big number + caption */
export const stats = "mt-10 flex flex-wrap gap-x-12 gap-y-9 max-sm:gap-x-[34px] max-sm:gap-y-[26px]";
export const statN =
  "text-[30px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground";
export const statL = "mt-[7px] text-[13px] font-medium text-muted-foreground";

/* prose block where key terms are emphasised */
export const tldr =
  "mt-6 leading-[1.7] text-muted-foreground text-pretty [&_strong]:font-semibold [&_strong]:text-foreground";

/* a numeral occupying the same slot width as a rail icon */
export const idx =
  "w-4 flex-none text-xs font-semibold tabular-nums text-muted-foreground";

/* inline breadcrumb-ish control strip under a page title */
export const controls =
  "my-8 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-sm text-muted-foreground";
export const controlLink = "transition-colors duration-150 hover:text-foreground";

/* a link whose trailing arrow slides on hover */
export const ctaLink = "group text-[15px] font-semibold text-foreground";
export const ctaArrow =
  "inline-block transition-transform duration-200 ease-out-quint group-hover:translate-x-[3px] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0";
