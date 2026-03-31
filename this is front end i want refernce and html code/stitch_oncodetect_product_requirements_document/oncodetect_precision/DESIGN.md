# High-End Clinical Telemetry Design System

## 1. Overview & Creative North Star: "The Clinical Observatory"
The Creative North Star for this system is **The Clinical Observatory**. It rejects the cluttered, chaotic dashboards of legacy medical software in favor of a high-precision, data-first environment. This is not just a tool; it is a high-fidelity lens for oncology detection.

The aesthetic signature is defined by **Mathematical Precision and Ethereal Depth**. We break the "template" look by utilizing a strict underlying grid for data telemetry while allowing UI elements to float with glassmorphic transparency. We use intentional asymmetry—heavy data modules on one side balanced by expansive breathing room on the other—to direct the clinician’s focus. The UI should feel like a customized laboratory instrument: cold, sharp, and unfailingly accurate.

---

## 2. Colors & Surface Architecture
The palette is a deep, monolithic dark mode punctuated by high-chroma "Logic Lights" (Blue for action, Green for safety, Amber for caution).

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define high-end digital architecture, you must use background shifts. 
- Use `surface_container_lowest` (#0e0e10) for the main canvas.
- Use `surface_container_low` (#1c1b1d) for secondary sidebars.
- Use `surface_container_high` (#2a2a2c) for active workspaces.
The eye should perceive boundaries through the shift in tonal depth, not a 1px stroke.

### Surface Hierarchy & Nesting
Treat the interface as a series of physical layers. An oncology report (Surface) should feel like it is sitting *within* a diagnostic bay (Surface Container). 
- **Base Level:** `background` (#131315)
- **Deep Inset:** `surface_container_lowest` (For recessed data wells)
- **Elevated Interactive:** `surface_container_highest` (For modal-like focus)

### The "Glass & Gradient" Rule
Standard flat containers feel generic. To achieve a premium feel:
- **Glassmorphism:** For floating HUDs or overlays, use `surface_variant` at 60% opacity with a `20px` backdrop-blur. 
- **Signature Gradients:** For high-value CTAs, use a linear gradient from `primary_container` (#0070f3) to `primary` (#aec6ff) at a 135° angle. This adds a "lithographic" glow that feels industrial yet modern.

---

## 3. Typography: Mathematical Authority
We utilize a dual-typeface system to balance technical precision with clinical legibility.

*   **Display & Headlines (Space Grotesk):** This is our "Engineered" voice. Its geometric apertures and sharp terminals convey mathematical certainty. Use `display-lg` for critical metric readouts (e.g., 98.4% Confidence).
*   **Body & Titles (Inter):** Inter provides the "Humanistic" counterpoint. It is designed for maximum legibility in high-stress clinical environments. Use `body-md` for patient history and technical notes.

**Hierarchy as Identity:**
- **Primary Data:** `display-md` / `primary` color.
- **Section Headers:** `headline-sm` / `on_surface` / All Caps with 0.05em letter spacing.
- **Secondary Labels:** `label-sm` / `on_surface_variant` for metadata.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders create visual noise. We achieve clinical "lift" through optical physics.

*   **The Layering Principle:** Stack `surface_container` tiers. A `surface_container_highest` card on a `surface_dim` background creates a natural, sophisticated lift.
*   **Ambient Shadows:** If an element must float (like a tool palette), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow color must be a dark tint of the surface, never pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in data grids, use `outline_variant` at **15% opacity**. It should be felt, not seen.
*   **Precision Accents:** Use 2px vertical "Logic Strips" on the left edge of containers using `secondary` (#4edea3) for "System Clear" or `tertiary` (#ffb95f) for "Action Required."

---

## 5. Components

### Buttons: The "Instrument" Style
- **Primary:** `primary_container` background with `on_primary_container` text. Subtle `0.5rem` (lg) corner radius. No border.
- **Secondary (The Glass Action):** Transparent background, `outline` ghost-border (20% opacity), `primary` text.
- **States:** On hover, use a `surface_bright` inner glow to simulate a physical back-lit button.

### Data Telemetry Chips
- Use `surface_container_highest` as a base. 
- Prefix with a 4px "status dot" using the `secondary` or `tertiary` tokens.
- Typography: `label-md` for technical density.

### Input Fields: The "Recessed" Look
- Inputs should look "carved" into the interface. Use `surface_container_lowest` with a 1px bottom-only border of `primary` at 30% opacity. 
- Focus state: The bottom border glows to 100% opacity `primary`.

### Cards & Lists: The "No-Divider" Mandate
- **Forbid dividers.** Use `spacing-6` (1.3rem) of vertical white space to separate list items. 
- In high-density telemetry lists, use alternating backgrounds (`surface` and `surface_container_low`) to create "zebra" stripes that are subtle (3% contrast difference).

### Diagnostic Tooltips
- Base: `surface_bright`. 
- Text: `on_surface` (Inter, `body-sm`).
- Effect: 10px backdrop-blur to ensure the tooltip doesn't "break" the underlying data visualization.

---

## 6. Do's and Don'ts

### Do:
- **DO** use `spacing-px` and `spacing-0.5` for micro-adjustments in data grids to emphasize "mathematical precision."
- **DO** use `secondary` (#4edea3) sparingly. It is a "Success/Safe" signal, not a decorative color.
- **DO** lean into asymmetry. A large diagnostic image can take up 70% of the screen, with telemetry data compressed into the remaining 30%.

### Don't:
- **DON'T** use `rounded-full` for anything other than status indicators. We want "Sharp Modernism," so stick to `rounded-sm` or `rounded-md`.
- **DON'T** use 100% white for text. Use `on_surface` (#e5e1e4) to reduce eye fatigue in dark clinical settings.
- **DON'T** use standard AI "sparkle" icons. Use technical, thin-stroke (1.5px) SVG icons that resemble engineering schematics.