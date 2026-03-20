// theme.ts
import { vars } from "nativewind";

// ============================================================================
// RIDENOW TAXI APP - YELLOW & BLACK THEME
// ============================================================================
// Classic taxi colors: Vibrant yellow with sleek black
// Primary: Yellow (#FACC15) - Taxi yellow
// Background: Black/Dark gray for modern look
// ============================================================================

export interface ThemeFonts {
  heading: {
    family: string;
    weights: Record<string, string>;
  };
  body: {
    family: string;
    weights: Record<string, string>;
  };
  mono: {
    family: string;
    weights: Record<string, string>;
  };
}

export const themeFonts: ThemeFonts = {
  heading: {
    family: 'Inter',
    weights: {
      normal: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
  },
  body: {
    family: 'Inter',
    weights: {
      normal: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold',
    },
  },
  mono: {
    family: 'JetBrainsMono',
    weights: {
      normal: 'JetBrainsMono_400Regular',
      medium: 'JetBrainsMono_500Medium',
    },
  },
};

// Light theme - Clean white with yellow accents
export const lightTheme = vars({
  "--radius": "16",

  // Core semantic colors
  "--background": "250 250 250",        // Light gray background
  "--foreground": "23 23 23",           // Near black text

  "--card": "255 255 255",              // White cards
  "--card-foreground": "23 23 23",

  "--popover": "255 255 255",
  "--popover-foreground": "23 23 23",

  "--primary": "250 204 21",            // #FACC15 - Taxi Yellow
  "--primary-foreground": "23 23 23",   // Black text on yellow

  "--secondary": "39 39 42",            // Dark gray
  "--secondary-foreground": "250 250 250",

  "--muted": "244 244 245",
  "--muted-foreground": "113 113 122",

  "--accent": "254 240 138",            // Light yellow accent
  "--accent-foreground": "23 23 23",

  "--destructive": "239 68 68",

  "--border": "228 228 231",
  "--input": "228 228 231",
  "--ring": "250 204 21",               // Yellow ring

  // Chart colors
  "--chart-1": "250 204 21",
  "--chart-2": "34 197 94",
  "--chart-3": "59 130 246",
  "--chart-4": "168 85 247",
  "--chart-5": "239 68 68",

  // Sidebar colors
  "--sidebar": "23 23 23",
  "--sidebar-foreground": "250 250 250",
  "--sidebar-primary": "250 204 21",
  "--sidebar-primary-foreground": "23 23 23",
  "--sidebar-accent": "39 39 42",
  "--sidebar-accent-foreground": "250 250 250",
  "--sidebar-border": "63 63 70",
  "--sidebar-ring": "250 204 21",
});

// Dark theme - Sleek black with vibrant yellow
export const darkTheme = vars({
  "--radius": "16",

  // Core semantic colors - Dark & Premium
  "--background": "10 10 10",           // Near black
  "--foreground": "255 255 255",        // White text

  "--card": "23 23 23",                 // Dark card
  "--card-foreground": "255 255 255",

  "--popover": "30 30 30",
  "--popover-foreground": "255 255 255",

  "--primary": "250 204 21",            // #FACC15 - Taxi Yellow
  "--primary-foreground": "10 10 10",   // Black text on yellow

  "--secondary": "39 39 42",            // Zinc 800
  "--secondary-foreground": "255 255 255",

  "--muted": "30 30 30",
  "--muted-foreground": "163 163 163",

  "--accent": "63 63 70",               // Zinc 700
  "--accent-foreground": "255 255 255",

  "--destructive": "239 68 68",

  "--border": "39 39 42",               // Subtle borders
  "--input": "39 39 42",
  "--ring": "250 204 21",

  // Chart colors
  "--chart-1": "250 204 21",
  "--chart-2": "34 197 94",
  "--chart-3": "96 165 250",
  "--chart-4": "192 132 252",
  "--chart-5": "251 113 133",

  // Sidebar colors
  "--sidebar": "15 15 15",
  "--sidebar-foreground": "255 255 255",
  "--sidebar-primary": "250 204 21",
  "--sidebar-primary-foreground": "10 10 10",
  "--sidebar-accent": "30 30 30",
  "--sidebar-accent-foreground": "255 255 255",
  "--sidebar-border": "39 39 42",
  "--sidebar-ring": "250 204 21",
});
