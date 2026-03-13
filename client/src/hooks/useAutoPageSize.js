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
    const updateLimitByHeight = () => {
      const containerElement = containerRef.current;
      if (!containerElement) return;

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

    updateLimitByHeight();
  }, [containerRef, rowHeight, minRows, viewportSelector, headerSelector]);

  return limit;
}
