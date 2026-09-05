/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks.
 *
 * In WKND's AEM Sites markup, section boundaries are authored as separator
 * components (div.separator > div.cmp-separator > hr.cmp-separator__horizontal-rule).
 * EDS expresses a section break as a bare top-level <hr>, so each content
 * separator is replaced with a single <hr>.
 *
 * Selectors verified against migration-work/cleaned.html:
 *   div.separator (#separator-bd766ae5bf, line 351) - break after "All Articles"
 *   div.separator (#separator-e8e691c190, line 460) - break after "All Trips"
 * The footer separator (line 542) carries .cmp-separator--hidden and lives inside
 * the footer experience fragment; it is excluded here and removed by wknd-cleanup.
 *
 * page-templates.json defines no per-template `sections`, so this transformer is
 * driven purely by the verified separator DOM rather than payload.template.sections.
 *
 * Runs in beforeTransform so section breaks exist before block parsing. Block
 * instances are matched by class (.carousel.cmp-carousel--hero, .teaser.cmp-teaser--*,
 * .image-list.list), not :nth-of-type, so swapping separator divs for <hr> is safe.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Content separators only; skip hidden (footer) separators.
    const separators = element.querySelectorAll('.separator:not(.cmp-separator--hidden)');
    separators.forEach((sep) => {
      const hr = document.createElement('hr');
      sep.replaceWith(hr);
    });
  }
}
