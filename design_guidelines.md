# Spirit Love Play App - Design Guidelines

## Design Approach
**Romantic, mystical celestial theme** with offline-first functionality for Daniel & Pacharee's relationship journey.

## Typography
- **Titles/Headers**: Dancing Script (romantic, flowing)
- **Body Text**: Poppins (clean, readable)
- Font weights: Regular for body, Semi-bold for emphasis

## Color Palette
**Primary Gradient**: Rose to amber warmth
- `bg-gradient-to-br from-rose-400 via-pink-200 to-amber-300`
- Accent colors for confetti: `#EFC1A9`, `#FFD7C2`, `#FADADD` (rose-gold theme)
- Star/moon elements: Soft whites and amber glows

## Layout System
**Spacing**: Tailwind units - use p-4, p-6, p-8, gap-4, gap-6 for consistent rhythm

### Page-Specific Layouts

**Landing Page (`/`)**
- Centered hero layout
- Logo "Spirit Love Play App" (Dancing Script, large)
- Tagline centered below logo
- Primary CTA button with glow effect
- Soft fade-in entrance animation

**Dashboard (`/dashboard`)**
- **Split horizontal layout** (NOT vertical)
  - Top half: Daniel's Journal
  - Bottom half: Pacharee's Journal
- Each section contains:
  - Moment cards list
  - Add button (floating or prominent)
  - Progress bar with heart-pulse animation
- Floating toggle button (top-right): Switch between Daniel only / Pacharee only / Both views

**Entry Page (`/entry`)**
- Full-width text area with romantic placeholder: "Write what made your heart smile today…"
- Auto-timestamp display
- Save button with rose-gold glow
- Success message: "Saved with love 💖" with confetti burst

**Plan Page (`/plan`)**
- Task board with 4 category columns:
  - Romance 💃
  - Wellness 🌅
  - Growth 🌱
  - Fun 🎠
- Card-based tasks with checkboxes
- Add task button per category
- Slide-in animations for new tasks

**Settings Page (`/settings`)**
- Toggle switches with soft glow
- Danger zone for "Reset All Data" (differentiated styling)
- Clean, minimal layout

## Component Library

**Buttons**
- Primary: Rose-gold gradient with soft glow on hover
- Secondary: Outline style with gradient border
- Disabled: Reduced opacity, no interaction

**Cards/Moments**
- Soft rounded corners (rounded-lg to rounded-xl)
- Subtle shadows
- Gradient backgrounds or white with gradient accents
- Gentle hover lift effect

**Progress Bars**
- Heart-pulse animation (Framer Motion)
- Gradient fill matching theme
- Smooth transitions on value changes

**Input Fields**
- Soft borders with rose tint
- Focus state: gradient glow
- Clean, spacious padding

## Animations (Framer Motion)

**Core Animations**
- **Heart Pulse**: Continuous subtle scale animation on progress elements
- **Confetti**: Rose-gold particles on moment/task completion (burst from center)
- **Fade-in**: Page transitions and new content (duration: 0.3-0.5s)
- **Button Glow**: Soft expand on hover
- **Slide-in**: Task cards from right (stagger by 0.1s)
- **Checkmark**: Scale + rotation on task completion

**Animation Principles**
- Soft, elegant (no harsh movements)
- Subtle (enhance, don't distract)
- Romantic feel (flowing, gentle)

## Icons
Use Heroicons or similar for:
- Heart icons (filled/outline)
- Plus/add buttons
- Toggle/menu icons
- Category icons (supplement with emojis: 💃🌅🌱🎠)

## Images
**Landing Page**: Optional celestial background (stars, moons, soft gradients) - can be CSS gradient instead of image
**Dashboard**: No hero images - focus on content cards
**Other Pages**: Icon-based, no large images needed

## Accessibility
- Maintain readable contrast despite romantic colors
- Clear focus states
- Semantic HTML structure
- Keyboard navigation support

## Offline-First Considerations
- Visual indicator when offline (subtle)
- Immediate feedback for all actions (no loading states)
- LocalStorage autosave on every change
- Restore previous state seamlessly on load