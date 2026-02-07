# ResumePage Component

Documentation for the resume page component.

## File Location

`src/components/resume.tsx`

## Purpose

Displays Bill Zhang's resume as an embedded PDF with a download button. The PDF is compiled from `public/resume.tex` using pdflatex.

## Props

None - this is a standalone component.

## Usage

```tsx
import ResumePage from "@/components/resume";

// In page.tsx
{activePage === "resume" && <ResumePage />}
```

## Voice Navigation

The backend navigates to this page by calling:
```python
display_resume_page(message="Let me show you my resume")
```

This sends a metadata event:
```json
{
  "type": "navigation",
  "page": "resume"
}
```

## Component Features

### PDF Viewer

Embeds the compiled PDF using an `<iframe>` pointing to `/resume.pdf`. The viewer takes up most of the viewport height (85vh).

### Download Button

A download button in the header allows users to download the PDF as `Bill_Zhang_Resume.pdf`.

### Animations

Uses Framer Motion for:
- Fade-in and slide-up entry animations
- Staggered appearance of header and PDF viewer

### Performance

Component is wrapped with `React.memo()` for performance optimization.

## URL State

When this page is active:
```
https://example.com?page=resume
```

## LaTeX Compilation

### Auto-Compile Scripts

- `npm run build:resume` - One-shot compile of `resume.tex` to `resume.pdf`
- `npm run watch:resume` - File watcher that recompiles on `.tex` changes

### Build Integration

The `build` script automatically compiles the resume before the Next.js build:
```json
"build": "npm run build:resume && next build"
```

### Development

Run the watcher in a separate terminal during development:
```bash
npm run watch:resume
```

Or install the **LaTeX Workshop** Cursor extension for live in-editor preview.

### Adding/Modifying Resume Content

1. Edit `public/resume.tex`
2. The watcher (or LaTeX Workshop) will auto-compile to `public/resume.pdf`
3. The browser will show the updated PDF on refresh

## Related Files

- [../components/page.md](../components/page.md) - Parent component
- `public/resume.tex` - LaTeX source file
- `public/resume.pdf` - Compiled PDF (build artifact, gitignored)
- `scripts/compile-resume.mjs` - Compilation script
- `scripts/watch-resume.mjs` - File watcher script
