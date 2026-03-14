# NeuroHolistic Design System - Quick Reference Card

Print or bookmark this page for quick access while coding.

## 🎨 Colors

```
Primary (Purple)      #8B7CF7  bg-primary-500
Secondary (Green)     #22c55e  bg-secondary-500
Neutral (Gray)        #6b7280  text-neutral-700
White                 #ffffff  bg-white
Light Gray            #f9fafb  bg-neutral-50

Error (Red)           #ef4444  text-error
Warning (Amber)       #f59e0b  text-warning
Success (Green)       #10b981  text-success
Info (Blue)           #3b82f6  text-info
```

## 📏 Spacing

```
Tight:     p-2 (8px)
Small:     p-3 (12px)
Standard:  p-4 (16px) ⭐
Generous:  p-6 (24px)
Large:     p-8 (32px)
Extra:     p-12 (48px)
```

## 🔤 Typography

```
<Display>      48px, bold      Hero headlines
<H1>           36px, semibold  Page titles
<H2>           28px, semibold  Sections ⭐ Most common
<H3>           24px, semibold  Sub-sections
<H4>           20px, semibold  Card titles
<Body>         16px, regular   Main text ⭐ Default
<BodySmall>    14px, regular   Secondary text
<Label>        14px, medium    Form labels
<Caption>      12px, regular   Small hints
```

## 🧩 Components

```tsx
// Button
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button size="lg" fullWidth>Large Full-width</Button>
<Button loading>Processing...</Button>

// Section
<Section padding="lg" background="primary">Content</Section>

// Card
<Card hoverable shadow="lg">
  <CardBody>Content</CardBody>
</Card>

// Badge
<Badge variant="primary">New</Badge>
<Badge variant="success">Success</Badge>
```

## 📱 Responsive Classes

```
Mobile-first (no breakpoint) = default
md: = 768px (tablet screens)
lg: = 1024px (desktop screens)

Examples:
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
text-2xl md:text-3xl lg:text-4xl
px-4 sm:px-6 lg:px-8
```

## 🎨 Common Patterns

### Hero Section
```tsx
<section className="min-h-screen flex items-center justify-center bg-gradient-hero-dark">
  <div className="relative z-10 text-center text-white">
    <Display>Headline</Display>
    <Body className="text-white/80 mt-6">Subheading</Body>
    <Button size="lg" className="mt-8">CTA</Button>
  </div>
</section>
```

### 3-Column Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <Card><CardBody>Item 1</CardBody></Card>
  <Card><CardBody>Item 2</CardBody></Card>
  <Card><CardBody>Item 3</CardBody></Card>
</div>
```

### Two-Column Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  <div><H2>Content</H2></div>
  <div className="aspect-video rounded-lg bg-neutral-100" />
</div>
```

## ✨ Animations

```
animate-fade-in           Fade in
animate-fade-in-up        Slide up
animate-fade-in-left      Slide left
animate-scale-in          Grow from center
animate-glow-pulse        Pulse glow

transition-all duration-300 hover:shadow-lg
```

## 🚀 Import Statements

```tsx
// All components
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Section from "@/components/ui/Section";
import { Display, H1, H2, H3, H4, Body, BodySmall, Label, Caption } 
  from "@/components/ui/Typography";

// Tokens
import { colors, spacing, typography } from "@/design-system/tokens";
```

## 🔄 Button Variants & Sizes

```
Variants:   primary | secondary | outline | ghost | danger
Sizes:      sm | md | lg
States:     loading disabled
Options:    fullWidth icon iconPosition="right"
```

## 📋 Component Props Cheat Sheet

```tsx
Button
  - variant: "primary" | "secondary" | "outline" | "ghost" | "danger"
  - size: "sm" | "md" | "lg"
  - fullWidth: boolean
  - loading: boolean
  - disabled: boolean

Card
  - hoverable: boolean
  - shadow: "none" | "sm" | "md" | "lg" | "elevated"
  - border: boolean

Section
  - padding: "sm" | "md" | "lg" | "xl"
  - background: "white" | "light" | "dark" | "primary" | "secondary" | "none"

Badge
  - variant: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  - size: "sm" | "md"
```

## 🎨 Tailwind Utility Classes

```
Flexbox:        flex, items-center, justify-center, gap-4
Grid:           grid, grid-cols-3, md:grid-cols-2, gap-6
Text:           text-lg, text-center, text-primary-700
Colors:         bg-primary-500, text-neutral-700, border-primary-200
Sizing:         w-full, h-12, aspect-video
Borders:        rounded-lg, border, border-2
Shadows:        shadow, shadow-lg, shadow-elevated
Spacing:        p-4, m-6, mb-8, mt-12
Responsive:     md:grid-cols-2, lg:text-3xl, sm:px-6
Animation:      transition-all, duration-300, hover:scale-105
```

## ⚡ Most Used Classes

```
p-4              Standard padding
gap-4            Standard flex/grid gap
mb-8             Common bottom margin
mt-12            Common top margin
bg-primary-500   Primary button
text-neutral-700 Body text
rounded-lg       Card corners
shadow           Card shadow
grid-cols-1 md:grid-cols-2 lg:grid-cols-3    Common responsive grid
flex items-center justify-center             Centering
text-center      Center text
max-w-7xl mx-auto px-4 sm:px-6         Container
```

## 🚫 DON'Ts

```
❌ Don't:
- Use random spacing values (use 8px scale)
- Skip heading levels (H1 → H3)
- Use inline styles (use Tailwind)
- Create new colors (use palette)
- Make headings with divs (use <H1>, <H2>, etc.)

✅ Do:
- Use design system components
- Follow responsive patterns
- Test keyboard navigation
- Include alt text on images
- Use semantic HTML
```

## 📚 Documentation Files

```
GETTING_STARTED.md         ← Start here
COMPONENT_REFERENCE.md     ← Component examples
DESIGN_SYSTEM.md          ← Complete guide
DESIGN_SYSTEM_INDEX.md    ← System overview
src/design-system/        ← Token definitions
```

## 🎓 Design Principles

1. **Clarity** - Clear, intuitive interfaces
2. **Harmony** - Balanced, cohesive design
3. **Accessibility** - Inclusive for all users
4. **Performance** - Fast, responsive
5. **Wellness** - Calming, therapeutic

---

**Pro Tip:** Copy this file and keep it in your editor's sidebar or bookmark it for quick reference while coding!

Last Updated: March 14, 2026
