import json
import asyncio
from openai import AsyncOpenAI
import dotenv

dotenv.load_dotenv()


# Initialize async client (make sure your OPENAI_API_KEY is set in env)
client = AsyncOpenAI()


async def rewrite_summary(proj, idx):
    """Rewrite summary for a single project with progress logging."""
    name = proj.get("name", "Untitled Project")
    details = proj.get("details", "")
    old_summary = proj.get("summary", "")

    prompt = f"""
You are rewriting project summaries.

Project Name: {name}
Details: {details}
Old Summary: {old_summary}

Write a new "summary" field that is exactly two paragraphs:
- Paragraph 1: What the project does / its purpose (3–4 sentences).
- Paragraph 2: Tech stack used and any awards or recognition (3–4 sentences).
Keep it professional, concise, and engaging.
"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant for rewriting project summaries.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        new_summary = response.choices[0].message.content.strip()
        proj["summary"] = new_summary
        print(f"[{idx+1}] ✅ Finished rewriting: {name}")
    except Exception as e:
        print(f"[{idx+1}] ❌ Error rewriting {name}: {e}")
    return proj


async def main():
    # Load parsed JSON objects
    with open("parsed_json_list.json", "r", encoding="utf-8") as f:
        projects = json.load(f)

    print(f"🚀 Starting rewrite for {len(projects)} projects...")

    # Process all projects concurrently
    tasks = [rewrite_summary(proj, i) for i, proj in enumerate(projects)]
    updated_projects = await asyncio.gather(*tasks)

    # Save updated JSON list
    with open("parsed_json_with_summaries.json", "w", encoding="utf-8") as f:
        json.dump(updated_projects, f, ensure_ascii=False, indent=2)

    print("🎉 All summaries updated and written to parsed_json_with_summaries.json")


if __name__ == "__main__":
    asyncio.run(main())
