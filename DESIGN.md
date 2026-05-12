# Design Brief: P2P Library Lending Platform

## Direction

LibraryHub — Warm, bookish P2P community lending platform with editorial clarity and inviting aesthetics.

## Tone

Organic and inviting. Inspired by cozy bookshops and community gatherings rather than cold corporate interfaces. Every interaction whispers "community" not commands.

## Differentiation

Warm earth-tone palette (cream, terracotta, sage) creates emotional trust; subtle shadows and card-based composition evoke physical bookshelf browsing.

## Color Palette

| Token | Light OKLCH | Dark OKLCH | Role |
|-------|-------------|-----------|------|
| Background | `0.96 0.015 75` | `0.15 0.01 50` | Warm cream paper feel |
| Foreground | `0.2 0.03 50` | `0.92 0.01 50` | Dark brown text |
| Card | `0.98 0.01 75` | `0.18 0.01 50` | Warm white for book listings |
| Primary | `0.55 0.14 30` | `0.65 0.12 30` | Warm amber/terracotta CTAs |
| Secondary | `0.55 0.08 160` | `0.55 0.08 160` | Muted sage accents |
| Accent | `0.5 0.1 140` | `0.6 0.1 140` | Earthy green highlights |
| Muted | `0.88 0.02 75` | `0.22 0.01 50` | Tan/beige neutral |
| Border | `0.88 0.025 75` | `0.28 0.01 50` | Subtle separators |

## Typography

- Display: Lora — Literary serif for headings, book titles, section labels
- Body: DM Sans — Clean sans-serif for body text, UI labels, chat messages
- Mono: Geist Mono — Code/timestamps

## Elevation & Depth

Warm subtle shadows (no pure blacks) create gentle depth; card-based layout with alternating muted backgrounds distinguish zones without harsh contrast.

## Structural Zones

| Zone | Background | Border | Notes |
|------|------------|--------|-------|
| Header | `bg-card` with `border-b border-border` | Subtle line | Navigation, logo, user menu. Fixed top. |
| Sidebar | `bg-sidebar` (warm off-white) | `border-r border-border` | Book list, conversation history, New Chat button. Scrollable. |
| Main Content | `bg-background` (warm cream) | — | Books grid or chat interface. Dynamic based on route. |
| Book Card | `bg-card` with `shadow-subtle` | None | Individual book listings with warm hover state. |
| Chat Panel | `bg-card` with `border-l` | Soft line | AI chat sidebar or modal. On Dashboard. |
| Footer | `bg-muted/30` with `border-t` | Subtle line | Settings, copyright, help links. |

## Spacing & Rhythm

Tight 8px grid: 8, 16, 24, 32, 48px. Book cards use 16px padding, 12px gaps. Message bubbles 12px padding. Conversation/book lists stack with 4px vertical gap for visual continuity.

## Component Patterns

- **Book Card**: `bg-card rounded-lg p-4 shadow-subtle hover:shadow-elevated` with warm accent border on active
- **Primary Button**: `bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:bg-opacity-90`
- **Secondary Button**: `bg-secondary text-secondary-foreground rounded-lg px-4 py-2`
- **Request Badge**: `bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs`
- **Message Bubble (User)**: `bg-primary text-primary-foreground rounded-lg p-3 max-w-sm`
- **Message Bubble (AI)**: `bg-card text-card-foreground border border-border rounded-lg p-3 max-w-sm`

## Motion

- **Entrance**: Messages and book cards fade + slide-up (0.3s ease-out, translateY -8px → 0)
- **Hover**: Button and card backgrounds transition 0.2s ease-out; shadows elevate smoothly
- **Loading**: Gentle pulse on "Lending" or "Borrowing" action buttons
- **Typing**: 3-dot animation (1.4s infinite, stagger 0.2s/dot)

## Constraints

- No gradients on UI elements—warmth via OKLCH hue, not overlays
- No neon or glow effects; shadows use warm undertones
- Minimum text size: 14px body, 12px muted
- Maximum line length in chat: 600px
- Radius: consistent 10px (0.625rem) for cards, buttons; no sharp corners

## Signature Detail

Warm earth-tone palette paired with editorial typography creates a library aesthetic; subtle card shadows and alternating zone backgrounds evoke physical bookshelf browsing in a cozy community space.
