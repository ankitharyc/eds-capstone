/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 *
 * Removes non-authorable site chrome from AEM Sites (cmp-* / aem-Grid) markup so
 * the import contains only page-level authorable content. All selectors below were
 * verified against migration-work/cleaned.html (WKND homepage DOM).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Non-authorable overlays / global chrome that sit outside main content and
    // could interfere with block parsing. Verified in cleaned.html:
    //   #destination_publishing_iframe_wkndsite_0 (line 566) - Adobe ID-sync iframe
    //   #toggleNav  (line 568) - mobile nav toggle
    //   #mobileNav  (line 574) - mobile navigation overlay
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0',
      '#toggleNav',
      '#mobileNav',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Header and footer are AEM experience fragments (site shell), plus the
    // header search widget. Verified in cleaned.html:
    //   header.experiencefragment / .cmp-experiencefragment--header (line 5)
    //   footer.experiencefragment / .cmp-experiencefragment--footer (line 471)
    //   .cmp-search--header (line 134) - lives inside header, removed defensively
    //   nav.cmp-navigation - site/utility navigation
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
      '.cmp-search--header',
      'nav.cmp-navigation',
      'iframe',
      'noscript',
    ]);

    // Stray empty <meta> tags emitted inside cmp-image blocks (e.g. lines 183, 204).
    element.querySelectorAll('meta').forEach((el) => el.remove());
  }
}
