import os
from typing import Dict, List, Optional

from dotenv import load_dotenv
from openai import AsyncOpenAI
from pinecone import PineconeAsyncio

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

pc = PineconeAsyncio(api_key=PINECONE_API_KEY)
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

INDEX_NAME = "portfolio"
EMBEDDING_MODEL = "text-embedding-3-large"


async def get_embedding(text: str) -> List[float]:
    """Generate embedding for text using OpenAI's text-embedding-3-large model."""
    response = await openai_client.embeddings.create(model=EMBEDDING_MODEL, input=text)
    return response.data[0].embedding


async def search_projects(query: str, top_k: int = 3) -> List[Dict]:
    """
    Search for Bill Zhang's projects using semantic search.

    Args:
        query: The search query describing what kind of projects to find
        top_k: Number of top results to return (default: 3)

    Returns:
        List of project dictionaries with metadata and relevance scores
    """
    try:
        query_embedding = await get_embedding(query)

        async with pc.IndexAsyncio(INDEX_NAME) as index:
            results = await index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
            )

        projects = []
        for match in results.matches:
            project = {
                "id": match.id,
                "name": match.metadata.get("name", "Unknown Project"),
                "summary": match.metadata.get("summary", "No summary available"),
                "details": match.metadata.get("details", "No details available"),
                "score": round(match.score, 3),
            }

            if match.metadata.get("github"):
                project["github"] = match.metadata.get("github")
            if match.metadata.get("demo"):
                project["demo"] = match.metadata.get("demo")

            projects.append(project)

        return projects

    except Exception as e:
        print(f"Error searching projects: {e}")
        return []


async def get_project_by_id(project_id: str) -> Optional[Dict]:
    """
    Fetch a specific project by its ID.

    Args:
        project_id: The unique ID of the project

    Returns:
        Project dictionary with metadata or None if not found
    """
    try:
        async with pc.IndexAsyncio(INDEX_NAME) as index:
            fetch_result = await index.fetch(ids=[project_id])

        if project_id in fetch_result.vectors:
            vector_data = fetch_result.vectors[project_id]
            metadata = vector_data.metadata

            project = {
                "id": project_id,
                "name": metadata.get("name", "Unknown Project"),
                "summary": metadata.get("summary", "No summary available"),
                "details": metadata.get("details", "No details available"),
            }

            if metadata.get("github"):
                project["github"] = metadata.get("github")
            if metadata.get("demo"):
                project["demo"] = metadata.get("demo")

            return project

        return None

    except Exception as e:
        print(f"Error fetching project {project_id}: {e}")
        return None


async def find_similar_projects(project_id: str, top_k: int = 3) -> List[Dict]:
    """
    Find projects similar to a given project.

    Args:
        project_id: The ID of the project to find similar ones to
        top_k: Number of similar projects to return

    Returns:
        List of similar project dictionaries
    """
    try:
        async with pc.IndexAsyncio(INDEX_NAME) as index:
            fetch_result = await index.fetch(ids=[project_id])

            if project_id not in fetch_result.vectors:
                return []

            vector = fetch_result.vectors[project_id]

            results = await index.query(
                vector=vector.values,
                top_k=top_k + 1,
                include_metadata=True,
            )

        similar_projects = []
        for match in results.matches:
            if match.id != project_id:
                project = {
                    "id": match.id,
                    "name": match.metadata.get("name", "Unknown Project"),
                    "summary": match.metadata.get("summary", "No summary available"),
                    "score": round(match.score, 3),
                }
                similar_projects.append(project)

        return similar_projects[:top_k]

    except Exception as e:
        print(f"Error finding similar projects: {e}")
        return []
