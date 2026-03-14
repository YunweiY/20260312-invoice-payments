import { useEffect, useState } from 'react';

export function useAutoPageSize({
  containerRef,
  rowHeight = 48,
  initialLimit = 15,
  minRows = 1,
  viewportSelector = '[data-slot="scroll-area-viewport"]',
  headerSelector = '[data-slot="table-header"]',
}) {
  const [limit, setLimit] = useState(initialLimit);

  useEffect(() => {
    let animationFrameId = null;
    let retryTimeoutId = null;

    const updateLimitByHeight = () => {
      const containerElement = containerRef.current;
      if (!containerElement) {
        // Retry once the table container is mounted (common after loading states).
        retryTimeoutId = window.setTimeout(() => {
          animationFrameId = window.requestAnimationFrame(updateLimitByHeight);
        }, 50);
        return;
      }

      // get the viewport and header elements from the container
      const viewportElement = containerElement.querySelector(viewportSelector);
      const headerElement = containerElement.querySelector(headerSelector);

      // calculate the height of the viewport and header and calculate the body height
      const viewportHeight =
        viewportElement?.clientHeight ?? containerElement.clientHeight;
      const headerHeight = headerElement?.getBoundingClientRect().height ?? 0;
      const bodyHeight = Math.max(viewportHeight - headerHeight, rowHeight);
      const nextLimit = Math.max(minRows, Math.floor(bodyHeight / rowHeight));

      setLimit((prev) => (prev === nextLimit ? prev : nextLimit));
    };

    // use a resize observer to update the limit when the container is resized
    // or the limit will only be set once when the component is mounted
    const resizeObserver = new ResizeObserver(() => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = window.requestAnimationFrame(updateLimitByHeight);
    });

    resizeObserver.observe(document.documentElement);
    window.addEventListener('resize', updateLimitByHeight);

    updateLimitByHeight();

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateLimitByHeight);
    };
  }, [containerRef, rowHeight, minRows, viewportSelector, headerSelector]);

  return limit;
}
