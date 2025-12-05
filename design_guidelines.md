# Design Guidelines: Futuristic Productivity Dashboard

## Design Approach
**Reference-Based:** Drawing inspiration from modern productivity tools like Notion (clean cards), Linear (focused typography), and Asana (task organization), combined with the futuristic aesthetic of Apple's design language. This is a utility-focused application where clarity and efficiency meet visual sophistication.

## Core Design Principles
1. **Calm Focus:** Create breathing room with generous spacing and soft visual treatments
2. **Subtle Futurism:** Modern without being overwhelming - soft gradients, smooth animations, rounded forms
3. **Contextual Intelligence:** Personalized content that adapts to user behavior and time of day

## Typography
- **Primary Font:** Poppins (rounded, friendly, modern)
- **Hierarchy:**
  - Page Titles: 2xl-3xl, semibold
  - Section Headers: xl-2xl, medium
  - Card Titles: lg, medium
  - Body Text: base, regular
  - Microcopy: sm, regular with subtle opacity

## Layout System
**Spacing Primitives:** Use Tailwind units of 3, 4, 6, 8, 12, and 16 for consistent rhythm
- Card padding: p-6
- Section spacing: py-12 to py-16
- Element gaps: gap-4 to gap-6
- Container max-width: max-w-7xl with px-6

## Component Library

### Authentication Pages (Login/Register)
- **Background:** Soft gradient overlays with abstract geometric shapes (circles, rounded rectangles) floating in corners
- **Form Container:** Centered card (max-w-md) with soft shadow and rounded-2xl corners
- **Form Layout:** Single column with generous spacing (space-y-6)
- **Social Login Buttons:** Full-width, rounded-lg with provider logos, arranged in grid-cols-2
- **Transition:** Smooth fade and slide animation when toggling between login/register
- **Microcopy:** Welcoming headers ("Welcome back!" / "Let's plan your day") in 2xl semibold

### Home Dashboard
- **Header:** Personalized greeting with current time/date context, aligned left with quick actions aligned right
- **Layout:** 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) with gap-6
- **Overview Cards:**
  - Today's Tasks card with task count and progress ring
  - Upcoming Meetings card with next 3 meetings as compact list
  - Goals Progress card with horizontal progress bars
  - Each card: rounded-xl, p-6, soft shadow with hover lift effect
- **Calendar Widget:** 2-column span card featuring monthly view with highlighted dates, drag-drop zones indicated with dashed borders
- **Quick Actions:** Fixed bottom-right floating action button group (Add Task, Focus Mode, Chatbot) with rounded-full buttons and tooltips

### Tasks Page
- **Filter Bar:** Horizontal tabs (Today, Upcoming, Completed, All) with pill-style active state
- **View Toggle:** Icons for List/Kanban switching in top-right
- **List View:**
  - Card-based with each task as rounded-lg card
  - Left border accent indicating priority (4px colored stripe)
  - Checkbox, title, due date badge, category tag layout
  - Hover state reveals actions (edit, delete, move)
- **Kanban View:**
  - 3-4 column layout (To Do, In Progress, Review, Done)
  - Draggable cards with subtle shadow
  - Column headers with task counts
- **Smart Suggestions:** Bottom sheet panel that slides up with AI-powered task grouping recommendations

### Chatbot Page
- **Layout:** Full-height flex layout with header, message area, and input footer
- **Chat Bubbles:**
  - User messages: Right-aligned, rounded-2xl with rounded-br-sm
  - AI messages: Left-aligned, rounded-2xl with rounded-bl-sm, include small AI avatar
  - Typing indicator: Three animated dots
- **Message Area:** Scrollable with max-w-3xl centered content, pb-24 to clear input
- **Input Footer:** Sticky bottom with rounded-full input field, send button, and command shortcuts hint
- **Theme Toggle:** Icon button in header to switch chat background treatment

### Notifications Page
- **Feed Layout:** Single column (max-w-2xl centered) with space-y-3
- **Notification Cards:**
  - Icon on left (task/event/system with different colors)
  - Title and timestamp
  - Swipe gesture zones or hover reveal actions
  - Unread state: subtle left border accent
- **Preferences:** Top-right settings icon opens slide-over panel with notification toggles

### Navigation
- **Top Bar:** Full-width with logo left, page nav center, profile/settings right
- **Mobile:** Hamburger menu revealing slide-in navigation drawer

## Animations
- **Page Transitions:** Subtle fade (200ms)
- **Task Completion:** Confetti micro-interaction or check mark animation
- **Progress Bars:** Smooth fill animation on load
- **Hover Effects:** Lift shadow (translateY -2px, shadow increase)
- **Loading States:** Skeleton screens with pulse animation

## Visual Treatments
- **Corners:** rounded-xl (12px) for cards, rounded-2xl (16px) for modals, rounded-full for buttons
- **Shadows:** Soft, multi-layer shadows for depth without harshness
- **Gradients:** Subtle linear gradients (10-15% opacity change) for backgrounds and accents
- **Borders:** Minimal use, prefer shadows for separation

## Images
**Hero Section:** Not applicable - this is a dashboard application without marketing hero needs

**Avatar/Profile Images:**
- User profile in header: rounded-full, w-10 h-10
- Chat assistant avatar: rounded-full, w-8 h-8
- Placeholder: Abstract gradient circles with user initials

**Illustrations:**
- Empty states: Simple line illustrations for "No tasks yet" or "No notifications"
- Onboarding: Optional walkthrough screens with friendly illustrations

## Responsive Behavior
- **Desktop (lg):** Multi-column grids, side-by-side layouts
- **Tablet (md):** 2-column max, stack complex components
- **Mobile (base):** Single column, bottom navigation bar, full-width cards, floating action buttons

## Accessibility
- Minimum tap targets: 44px × 44px
- Color contrast ratios meeting WCAG AA
- Focus states: visible outline with accent color
- Screen reader labels for icon-only buttons
- Keyboard navigation support throughout