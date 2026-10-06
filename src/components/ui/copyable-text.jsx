import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { EMPTY_PLACEHOLDER, isEmptyValue } from "@/lib/format";
import { copyToClipboard } from "@/utils/clipboard";

// Transient "copied" state around the shared copyToClipboard util. The write
// itself (with its execCommand fallback) lives in @/utils/clipboard; this only
// tracks the flag and its reset timer.
export const useCopyToClipboard = (resetMs = 1200) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = useCallback(
    async (value) => {
      const ok = await copyToClipboard(value);
      if (!ok) return;
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), resetMs);
    },
    [resetMs],
  );

  return { copied, copy };
};

// Click-to-copy value: the text itself is the button (no icon) and briefly
// swaps to `copiedLabel` before reverting. Style-agnostic — callers pass the
// value's classes via `className` (and `copiedClassName` for the copied state).
export const CopyableText = ({
  value,
  className = "",
  copiedClassName = "",
  copiedLabel = "Copied",
}) => {
  const { copied, copy } = useCopyToClipboard();
  if (isEmptyValue(value)) {
    return <span className={className}>{EMPTY_PLACEHOLDER}</span>;
  }
  return (
    <button
      type="button"
      title={copied ? copiedLabel : "Click to copy"}
      onClick={() => copy(value)}
      className={`cursor-pointer ${copied ? copiedClassName : ""} ${className}`}
    >
      {copied ? copiedLabel : value}
    </button>
  );
};
