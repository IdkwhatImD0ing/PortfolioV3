# EducationPage Component

Documentation for the education page component.

## File Location

`src/components/education.tsx`

## Purpose

Displays Bill Zhang's educational background with expandable cards for each institution:
- University of Southern California (MS Computer Science)
- UC Santa Cruz (BS Computer Science)
- Lynbrook High School

## Props

None - this is a standalone component.

## Usage

```tsx
import EducationPage from "@/components/education";

// In page.tsx
{activePage === "education" && <EducationPage />}
```

## Voice Navigation

The backend navigates to this page by calling:
```python
display_education_page(message="Let me show you my education background")
```

This sends a metadata event:
```json
{
  "type": "navigation",
  "page": "education"
}
```

## Component Features

### Expandable Cards

Each school has an expandable card with:
- School logo with gradient background
- Degree and major
- Graduation date
- Detailed information (courses, achievements)

### Animations

Uses Framer Motion for:
- Card expand/collapse transitions
- Staggered entry animations
- Hover effects

### Performance

Component is wrapped with `React.memo()` for performance optimization.

## URL State

When this page is active:
```
https://example.com?page=education
```

## Modifications

### Add a New School

1. Add school data to the component:
```tsx
const schools = [
  {
    id: "new-school",
    name: "New School Name",
    logo: "/school-logo.png",
    degree: "Degree Type",
    major: "Major",
    graduation: "Month Year",
    details: "Details about the school..."
  },
  // ...existing schools
];
```

2. Ensure the logo is in `public/` directory.

### Change Card Styling

The cards use:
- `@/components/ui/card` - Base card component
- Tailwind classes for styling
- CSS variables for theming

## Related Files

- [../components/page.md](../components/page.md) - Parent component
- `src/components/ui/card.tsx` - Card UI component
