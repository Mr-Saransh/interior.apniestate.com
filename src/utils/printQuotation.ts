// ==============================================================================
// APNI ESTATE INTERIORS - ISOLATED QUOTATION PRINT & PDF EXPORT UTILITY
// Clones only the target quotation document into a top-level body print host
// so app bars, sidebars, modals, and scroll clipping never leak into PDFs.
// ==============================================================================

const PRINT_HOST_ID = 'apni-print-host';
const PRINTING_BODY_CLASS = 'apni-printing-only';

export function printQuotationById(elementId: string, documentTitle?: string): void {
  const source = document.getElementById(elementId);
  if (!source) {
    window.print();
    return;
  }

  // Clean up any stale print host
  const existingHost = document.getElementById(PRINT_HOST_ID);
  if (existingHost) {
    existingHost.remove();
  }

  const host = document.createElement('div');
  host.id = PRINT_HOST_ID;

  const clone = source.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');

  // Remove interactive/non-printable elements inside cloned tree
  clone.querySelectorAll('.no-print').forEach((node) => node.remove());

  host.appendChild(clone);
  document.body.appendChild(host);
  document.body.classList.add(PRINTING_BODY_CLASS);

  const previousTitle = document.title;
  if (documentTitle) {
    document.title = documentTitle;
  }

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.body.classList.remove(PRINTING_BODY_CLASS);
    const activeHost = document.getElementById(PRINT_HOST_ID);
    if (activeHost) {
      activeHost.remove();
    }
    if (documentTitle) {
      document.title = previousTitle;
    }
    window.removeEventListener('afterprint', cleanup);
    window.removeEventListener('focus', handleFocusCleanup);
  };

  const handleFocusCleanup = () => {
    setTimeout(cleanup, 350);
  };

  window.addEventListener('afterprint', cleanup, { once: true });
  window.addEventListener('focus', handleFocusCleanup, { once: true });

  // Wait two animation frames so browser commits #apni-print-host layout before printing
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const startedAt = performance.now();
      window.print();
      // If window.print() blocked synchronously until user closed the dialog, clean up safely
      if (performance.now() - startedAt > 400) {
        setTimeout(cleanup, 150);
      }
    });
  });
}
