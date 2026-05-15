import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

/**
 * Wraps the app in next-themes so the .dark class is toggled on <html>.
 *
 * The companion FOUC bootstrap in index.html toggles the .dark class before
 * paint so the first render matches the user's preference and we don't get
 * a light-mode flash on dark systems.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
