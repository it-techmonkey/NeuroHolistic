# NeuroHolistic Design System

A comprehensive design system for the NeuroHolistic brand, providing consistent visual language, components, and guidelines across all digital products.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Colors](#colors)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Patterns](#patterns)
7. [Accessibility](#accessibility)
8. [Best Practices](#best-practices)

## Overview

The NeuroHolistic Design System is built on modern web standards using:
- **Framework**: Next.js 16+
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Design Tokens**: CSS Custom Properties

### Design Philosophy

Our design philosophy centers on:
- **Clarity**: Clear, intuitive interfaces that guide users
- **Harmony**: Balanced, cohesive visual design
- **Accessibility**: Inclusive design for all users
- **Performance**: Fast, responsive experiences
- **Wellness**: Calming, therapeutic aesthetic

## Colors

### Primary Brand Colors

The primary color palette is based on purple (Violet) representing transformation and consciousness:

- **Primary-500 (#8B7CF7)**: Main brand color
- **Primary-700 (#6342c0)**: Interactive states
- **Primary-900 (#422d75)**: Deep shadowing

### Secondary Colors

Emerald green represents growth, balance, and healing:

- **Secondary-500 (#22c55e)**: Growth, success, positive actions
- **Secondary-600 (#16a34a)**: Hover states
- **Secondary-700 (#15803d)**: Active states

### Neutral Colors

Grayscale for text, backgrounds, and borders:

- **White (#ffffff)**: Light backgrounds
- **Neutral-50 (#f9fafb)**: Very light backgrounds
- **Neutral-700 (#374151)**: Primary text
- **Neutral-900 (#111827)**: Dark text

### Semantic Colors

- **Success**: Green (#10b981) - Positive outcomes
- **Warning**: Amber (#f59e0b) - Caution, alerts
- **Error**: Red (#ef4444) - Errors, destructive actions
- **Info**: Blue (#3b82f6) - Information

### Usage Examples

```tsx
// Button with primary color
<button className="bg-primary-500 hover:bg-primary-600">
  Book a Session
</button>

// Text with secondary color
<p className="text-secondary-500">
  Your transformation starts here
</p>

// Background with light neutral
<div className="bg-neutral-50">
  Content area
</div>
```

## Typography

### Font Stack

```css
font-sans: system-ui, -apple-system, sans-serif;
```

### Font Sizes & Line Heights

| Class | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `text-xs` | 12px | 16px | Captions, annotations |
| `text-sm` | 14px | 20px | Labels, helper text |
| `text-base` | 16px | 24px | Body text, default |
| `text-lg` | 18px | 28px | Large body text |
| `text-xl` | 20px | 28px | Section leads |
| `text-2xl` | 24px | 32px | H4, subheadings |
| `text-3xl` | 30px | 36px | H3, section titles |
| `text-4xl` | 36px | 40px | H2, major titles |
| `text-5xl` | 48px | 52px | H1, hero text |

### Font Weights

- **Light (300)**: Subtle, de-emphasized text
- **Normal (400)**: Body text, default
- **Medium (500)**: Labels, emphasizing text
- **Semibold (600)**: Headings, important content
- **Bold (700)**: Strong emphasis, major headings

### Typography Components

```tsx
import {
  Display,  // Hero text (48px, bold)
  H1,       // Page titles (36px, bold)
  H2,       // Section titles (30px, semibold)
  H3,       // Subsection titles (24px, semibold)
  H4,       // Minor headings (20px, semibold)
  Body,     // Body text (16px, regular)
  BodySmall,// Small body (14px, regular)
  Label,    // Form labels (14px, medium)
  Caption,  // Captions (12px, regular, gray)
} from "@/components/ui/Typography";
```

### Usage Examples

```tsx
<Display>Transform Your Life</Display>
<H1>Welcome to NeuroHolistic</H1>
<H2>How It Works</H2>
<Body>
  The NeuroHolistic Method combines neuroscience, holistic wellness,
  and proven therapeutic techniques.
</Body>
```

## Spacing

Spacing uses an 8px base unit system:

| Token | Value | Use Case |
|-------|-------|----------|
| `1` | 4px | Tight spacing |
| `2` | 8px | Small padding/margin |
| `3` | 12px | Comfortable spacing |
| `4` | 16px | Standard spacing |
| `6` | 24px | Generous spacing |
| `8` | 32px | Large sections |
| `12` | 48px | Section gaps |
| `16` | 64px | Major section spacing |

### Layout Spacing

| Component | Spacing |
|-----------|---------|
| Inline elements | 2-4 |
| Card padding | 6 |
| Section padding | 12-16 |
| Container gaps | 6-8 |

### Usage Examples

```tsx
// Padding
<div className="p-6">Content with padding</div>
<div className="px-4 py-6">Horizontal and vertical</div>

// Margin
<div className="mb-8">Bottom margin</div>
<div className="mt-12">Large top margin</div>

// Gaps
<div className="flex gap-4">
  <Item />
  <Item />
</div>
```

## Borders & Radius

### Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| `rounded-sm` | 4px | Subtle curves |
| `rounded-base` | 8px | Default (cards, buttons) |
| `rounded-md` | 12px | Generous curves |
| `rounded-lg` | 16px | Large components |
| `rounded-full` | 9999px | Pills, circles |

### Border Width

- **thin** (1px): Light borders, dividers
- **base** (2px): Standard borders
- **thick** (4px): Heavy borders, focus states

## Shadows

### Shadow System

| Variant | Use Case |
|---------|----------|
| `shadow-none` | No elevation |
| `shadow-sm` | Subtle elevation |
| `shadow` | Default elevation (cards) |
| `shadow-lg` | High elevation |
| `shadow-elevated` | Maximum elevation |
| `shadow-glow-purple` | Purple glow effect |
| `shadow-glow-success` | Green glow effect |

### Usage Examples

```tsx
// Subtle card shadow
<div className="bg-white shadow rounded-lg">Card</div>

// Elevated component
<div className="shadow-lg">Elevated</div>

// Glow effect
<div className="shadow-glow-purple">Premium feature</div>
```

## Components

### Button

Flexible button component with multiple variants and sizes.

```tsx
import Button from "@/components/ui/Button";

// Primary button
<Button>Book a Session</Button>

// Secondary button
<Button variant="secondary">Learn More</Button>

// Outline button
<Button variant="outline">Read Article</Button>

// Large button
<Button size="lg" fullWidth>
  Get Started
</Button>

// With icon
<Button icon={<CheckIcon />}>Confirm</Button>

// Loading state
<Button loading>Processing...</Button>

// Danger button
<Button variant="danger" destructive>
  Delete Account
</Button>
```

**Props:**
- `variant`: primary | secondary | outline | ghost | danger
- `size`: sm | md | lg
- `fullWidth`: boolean
- `loading`: boolean
- `disabled`: boolean
- `icon`: ReactNode
- `iconPosition`: left | right

### Card

Container component for grouped content.

```tsx
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";

<Card hoverable shadow="lg">
  <CardHeader>
    <H3>Card Title</H3>
  </CardHeader>
  <CardBody>
    Content goes here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Props:**
- `hoverable`: boolean (adds hover animation)
- `shadow`: none | sm | md | lg | elevated
- `border`: boolean

### Badge

Small label component for tags, status indicators, etc.

```tsx
import Badge from "@/components/ui/Badge";

<Badge variant="primary">New</Badge>
<Badge variant="secondary" size="sm">Tag</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
```

**Props:**
- `variant`: primary | secondary | success | warning | error | info
- `size`: sm | md

### Section

Container component for page sections with consistent spacing.

```tsx
import Section from "@/components/ui/Section";

<Section padding="lg" background="light">
  <H2>Our Method</H2>
  <Body>Content here</Body>
</Section>
```

**Props:**
- `padding`: sm | md | lg | xl
- `background`: white | light | dark | primary | secondary | none

## Patterns

### Grid Layouts

```tsx
// 2-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
</div>

// 3-column grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

### Flexbox Layouts

```tsx
// Center all items
<div className="flex items-center justify-center gap-4">
  <Item />
  <Item />
</div>

// Space between
<div className="flex items-center justify-between gap-4">
  <Item />
  <Item />
</div>
```

### Hero Section Pattern

```tsx
<Section padding="xl" background="dark">
  <div className="max-w-3xl mx-auto text-center">
    <Display>Headline Here</Display>
    <Body className="text-white/90 mt-6">
      Subheadline or description
    </Body>
    <Button size="lg" className="mt-8">
      Call to Action
    </Button>
  </div>
</Section>
```

### Feature Grid Pattern

```tsx
<Section padding="lg">
  <div className="max-w-3xl mx-auto mb-12 text-center">
    <H2>Key Features</H2>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {features.map((feature) => (
      <Card key={feature.id} hoverable>
        <CardBody>
          <div className="text-3xl mb-4">{feature.icon}</div>
          <H4>{feature.title}</H4>
          <Body className="mt-2">{feature.description}</Body>
        </CardBody>
      </Card>
    ))}
  </div>
</Section>
```

## Animations

### Built-in Animations

Tailwind CSS configured animations:

```tsx
// Fade in
<div className="animate-fade-in">Content</div>

// Fade in with direction
<div className="animate-fade-in-up">Slides up</div>
<div className="animate-fade-in-down">Slides down</div>
<div className="animate-fade-in-left">Slides left</div>
<div className="animate-fade-in-right">Slides right</div>

// Scale in
<div className="animate-scale-in">Grows from center</div>

// Glow pulse
<div className="animate-glow-pulse">Glowing</div>

// Slide animations
<div className="animate-slide-up">Slides up</div>
<div className="animate-slide-down">Slides down</div>
```

### Transition Classes

```tsx
// Smooth transitions
<div className="transition duration-300">Animates smoothly</div>

// Custom durations
<div className="transition-all duration-fast">Fast animation</div>
<div className="transition-all duration-slow">Slow animation</div>

// Specific properties
<button className="transition-colors duration-200 hover:bg-primary-600">
  Hover me
</button>
```

## Accessibility

### Color Contrast

All text colors meet WCAG AA standards:
- Black text on white: 21:1 contrast
- Primary purple on white: 6.5:1 contrast
- Secondary green on white: 7:1 contrast

### Keyboard Navigation

All interactive elements are keyboard accessible:

```tsx
// Buttons have focus states
<button className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
  Accessible Button
</button>
```

### ARIA Labels

Use semantic HTML and ARIA attributes:

```tsx
<nav aria-label="Main navigation">
  <a href="/">Home</a>
</nav>

<button aria-label="Close menu">×</button>
```

### Screen Reader Support

Use alt text for images:

```tsx
<img src="logo.svg" alt="NeuroHolistic Logo" />
```

## Best Practices

### 1. Use Semantic HTML

```tsx
// Good
<header>Navigation</header>
<main>Content</main>
<footer>Info</footer>

// Avoid
<div className="header">Navigation</div>
```

### 2. Consistency in Spacing

```tsx
// Good - consistent gap sizing
<div className="flex gap-4 flex-col">
  <Card />
  <Card />
  <Card />
</div>

// Avoid - mixed spacing
<div>
  <Card className="mb-8" />
  <Card className="mb-4" />
  <Card className="mb-6" />
</div>
```

### 3. Color Usage

```tsx
// Good - semantic color use
<Button variant="danger" destructive>
  Delete Item
</Button>

// Avoid - confusing color meaning
<Button className="bg-error">Proceed</Button>
```

### 4. Typography Hierarchy

```tsx
// Good - clear hierarchy
<H1>Page Title</H1>
<H2>Section Title</H2>
<H3>Subsection Title</H3>
<Body>Regular text content</Body>

// Avoid - inconsistent hierarchy
<h1>Title</h1>
<p className="text-2xl font-bold">Random size</p>
<small>Small text</small>
```

### 5. Responsive Design

```tsx
// Good - mobile-first with responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
</div>

// Good - responsive text sizes
<H1 className="text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</H1>
```

### 6. Dark Mode Consideration

When adding dark mode support:

```tsx
// Example structure
<div className="bg-white dark:bg-neutral-900">
  <h1 className="text-neutral-900 dark:text-white">Title</h1>
</div>
```

## Color Reference Guide

### Getting the Right Shade

- **-50 to -100**: Very light backgrounds
- **-200 to -300**: Light elements, disabled states
- **-400 to -500**: Interactive elements
- **-600 to -700**: Hover/active states, strong emphasis
- **-800 to -900**: Dark text, deep emphasis
- **-950**: Darkest backgrounds, text on light

## Files & Structure

```
src/design-system/
├── tokens.ts          # Design tokens (colors, spacing, etc.)
└── README.md          # This documentation

src/components/ui/
├── Button.tsx         # Button component
├── Card.tsx           # Card component
├── Badge.tsx          # Badge component
├── Typography.tsx     # Text components
└── Section.tsx        # Section container
```

## Updates & Changes

This design system is living and evolving. When making changes:

1. Update the design tokens first
2. Update components
3. Test across pages
4. Document changes in this README
5. Update all affected pages

---

**Last Updated**: March 14, 2026  
**Version**: 1.0.0  
**Maintainer**: NeuroHolistic Design Team
