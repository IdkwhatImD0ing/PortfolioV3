# LLMs.txt

Documentation for the public `llms.txt` file.

## File Location

`public/llms.txt`

## Purpose

Provides an LLM-friendly overview of Bill Zhang's portfolio, public profiles, verified achievement sources, and project links. The file follows the proposed `/llms.txt` convention so agents can understand the site without relying only on rendered UI text.

## Public URL

When deployed, the file is available at:

```text
https://art3m1s.me/llms.txt
```

## Content Sources

The file is based on:

- The live voice-driven portfolio at `https://www.art3m1s.me/`
- The Hackathon Playbook at `https://www.thehackathonplaybook.dev/`
- Local portfolio source content in `src/components/`
- Project data from `public/data.json`
- Public Devpost and news links used to verify major hackathon achievements

## Maintenance

Update `public/llms.txt` when changing:

- Portfolio positioning, bio, employment, education, or public profile links
- Project IDs, project names, demo links, or source links in `public/data.json`
- Hackathon achievement wording or trophy-case claims
- Canonical domain or route behavior

Keep aggregate claims such as win counts, prize totals, valuations, and community size clearly attributed unless they are backed by an independent public source.
