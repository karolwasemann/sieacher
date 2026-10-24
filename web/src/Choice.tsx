import type { ReactNode } from 'react';

export const Choice = ({
  selected,
  onClick,
  children,
}: {
  // Leave out for a button that acts at once instead of toggling a choice.
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={`rounded-lg border px-4 py-2 text-left focus-visible:outline-2 focus-visible:outline-iris ${
      selected
        ? 'border-pine bg-overlay text-pine'
        : 'border-highlight-med bg-surface hover:bg-highlight-low'
    }`}
  >
    {children}
  </button>
);
