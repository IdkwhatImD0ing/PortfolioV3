# PersonalPage Component

Documentation for the personal/about page component.

## File Location

`src/components/personal.tsx`

## Purpose

Displays Bill Zhang's personal information, overview, and highlights. This is the "About Me" section of the portfolio.

## Props

None - this is a standalone component.

## Usage

```tsx
import PersonalPage from "@/components/personal";

// In page.tsx
{activePage === "personal" && <PersonalPage />}
```

## Voice Navigation

The backend navigates to this page by calling:
```python
display_homepage(message="Let me show you my homepage")
```

This sends a metadata event:
```json
{
  "type": "navigation",
  "page": "personal"
}
```

## Content Sections

Typical content includes:
- Profile overview
- Current role and company
- Key achievements
- Interests and hobbies
- Contact information

## URL State

When this page is active:
```
https://example.com?page=personal
```

## Modifications

### Update Personal Info

Edit the component directly in `src/components/personal.tsx`.

### Add Social Links

```tsx
<div className="flex gap-4">
  <a href="https://github.com/username">
    <Github />
  </a>
  <a href="https://linkedin.com/in/username">
    <Linkedin />
  </a>
</div>
```

### Add New Section

```tsx
<section className="mt-8">
  <h2 className="text-2xl font-bold">New Section</h2>
  <p>Content here...</p>
</section>
```

## Related Files

- [../components/page.md](../components/page.md) - Parent component
- `src/components/ui/` - UI components used
