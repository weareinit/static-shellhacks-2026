import { isEmptyValue } from "@/lib/format";

// Write text to the clipboard. Prefers the async Clipboard API and falls back
// to a hidden textarea + execCommand for non-secure contexts (where the async
// API is unavailable or denied). Returns whether the copy succeeded.
//
// Single source of truth for clipboard writes — the admin drawer rows and the
// drawer header subtitle both go through useCopyToClipboard in drawerParts,
// which calls this.
export const copyToClipboard = async (value) => {
  if (isEmptyValue(value)) return false;
  const text = String(value);

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Denied or unavailable; fall through to the legacy path.
  }

  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(el);
  return ok;
};
