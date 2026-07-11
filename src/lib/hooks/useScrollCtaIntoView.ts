import { useEffect, useRef, type RefObject } from "react";

/**
 * Long "learn" sections can push the footer CTA below the fold. Once the
 * gating interaction is satisfied and the CTA flips from disabled to
 * enabled, smooth-scroll it into view so the learner isn't left hunting for
 * "Continue". Only fires on that disabled->enabled edge — never on mount,
 * and never when a new step simply starts pre-enabled.
 */
export function useScrollCtaIntoView(ctaRef: RefObject<HTMLElement>, disabled: boolean) {
  const wasDisabled = useRef(disabled);

  useEffect(() => {
    if (wasDisabled.current && !disabled) {
      ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    wasDisabled.current = disabled;
  }, [ctaRef, disabled]);
}
