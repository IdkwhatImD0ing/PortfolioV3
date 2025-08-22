import json
import os
from typing import List, Dict
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

pc = Pinecone(api_key=PINECONE_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

INDEX_NAME = "portfolio"
EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_DIMENSIONS = 3072


def get_embedding(text: str) -> List[float]:
    """Generate embedding for text using OpenAI's text-embedding-3-large model."""
    response = openai_client.embeddings.create(model=EMBEDDING_MODEL, input=text)
    return response.data[0].embedding


def prepare_vectors(data: List[Dict]) -> List[tuple]:
    """Prepare vectors for Pinecone upsert."""
    vectors = []

    for item in data:
        project_id = item["id"]

        text_content = f"""
        Project: {item['name']}
        
        Summary:
        {item['summary']}
        
        Details:
        {item['details']}
        """

        embedding = get_embedding(text_content)

        metadata = {
            "id": project_id,
            "name": item["name"],
            "summary": item["summary"],
            "details": item["details"],
        }

        if item.get("github"):
            metadata["github"] = item["github"]
        if item.get("demo"):
            metadata["demo"] = item["demo"]

        vectors.append((project_id, embedding, metadata))

    return vectors


def main():
    print("Loading data...")
    with open("data.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Found {len(data)} projects to load")

    print("Connecting to Pinecone index...")
    index = pc.Index(INDEX_NAME)

    index_stats = index.describe_index_stats()
    print(f"Index stats before upload: {index_stats}")

    print("Generating embeddings...")
    vectors = prepare_vectors(data)

    print(f"Uploading {len(vectors)} vectors to Pinecone...")
    index.upsert(vectors=vectors)

    index_stats = index.describe_index_stats()
    print(f"Index stats after upload: {index_stats}")

    print("\nTesting retrieval with a sample query...")
    test_query = "interview preparation AI coaching"
    query_embedding = get_embedding(test_query)

    results = index.query(vector=query_embedding, top_k=3, include_metadata=True)

    print(f"\nTop 3 results for query '{test_query}':")
    for i, match in enumerate(results.matches, 1):
        print(f"\n{i}. {match.metadata['name']} (Score: {match.score:.3f})")
        print(f"   ID: {match.id}")
        print(f"   Summary preview: {match.metadata['summary'][:200]}...")


if __name__ == "__main__":
    main()
