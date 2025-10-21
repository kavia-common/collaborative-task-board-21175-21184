export const theme = {
  colors: {
    primary: "#374151",
    secondary: "#9CA3AF",
    success: "#10B981",
    error: "#EF4444",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    text: "#111827",
  },
};

// PUBLIC_INTERFACE
export function applyCssVariables(): void {
  /** Applies theme colors as CSS variables on :root for consistent styling. */
  const r = document.documentElement;
  r.style.setProperty("--color-primary", theme.colors.primary);
  r.style.setProperty("--color-secondary", theme.colors.secondary);
  r.style.setProperty("--color-success", theme.colors.success);
  r.style.setProperty("--color-error", theme.colors.error);
  r.style.setProperty("--color-background", theme.colors.background);
  r.style.setProperty("--color-surface", theme.colors.surface);
  r.style.setProperty("--color-text", theme.colors.text);
}
