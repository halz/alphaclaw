import { h } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";

const html = htm.bind(h);

export const UpdateActionButton = ({
  onClick,
  disabled = false,
  loading = false,
  warning = false,
  idleLabel = "Check updates",
  loadingLabel = "Checking...",
  className = "",
}) => {
  const isInteractive = !loading && !disabled;
  const toneClass = warning
    ? isInteractive
      ? "border-yellow-500/35 text-yellow-400 bg-yellow-500/10 hover:border-yellow-400/60 hover:text-yellow-300 hover:bg-yellow-500/15"
      : "border-yellow-500/35 text-yellow-400 bg-yellow-500/10"
    : isInteractive
      ? "border-border text-gray-500 hover:text-gray-300 hover:border-gray-500"
      : "border-border text-gray-500";
  const loadingClass = loading
    ? `cursor-not-allowed ${warning
      ? "opacity-90 animate-pulse shadow-[0_0_0_1px_rgba(234,179,8,0.22),0_0_18px_rgba(234,179,8,0.12)]"
      : "opacity-80"}`
    : "";

  return html`
    <button
      onclick=${onClick}
      disabled=${disabled || loading}
      class="inline-flex items-center justify-center h-7 text-xs leading-none px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${toneClass} ${loadingClass} ${className}"
    >
      ${loading
        ? html`
            <span class="inline-flex items-center gap-1.5 leading-none">
              <svg
                class="animate-spin"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  class="opacity-30"
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  stroke-width="3"
                />
                <path
                  class="opacity-90"
                  fill="currentColor"
                  d="M12 3a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6V3z"
                />
              </svg>
              ${loadingLabel}
            </span>
          `
        : idleLabel}
    </button>
  `;
};
