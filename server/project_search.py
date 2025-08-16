import os
from typing import List, Dict, Optional
from dotenv import load_dotenv
from pinecone import Pinecone
from openai import OpenAI

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

pc = Pinecone(api_key=PINECONE_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

INDEX_NAME = "portfolio"
EMBEDDING_MODEL = "text-embedding-3-large"

def get_embedding(text: str) -> List[float]:
    """Generate embedding for text using OpenAI's text-embedding-3-large model."""
    response = openai_client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text
    )
    return response.data[0].embedding

def search_projects(query: str, top_k: int = 3) -> List[Dict]:
    """
    Search for Bill Zhang's projects using semantic search.
    
    Args:
        query: The search query describing what kind of projects to find
        top_k: Number of top results to return (default: 3)
    
    Returns:
        List of project dictionaries with metadata and relevance scores
    """
    try:
        # Get embedding for the query
        query_embedding = get_embedding(query)
        
        # Connect to Pinecone index
        index = pc.Index(INDEX_NAME)
        
        # Query Pinecone for similar projects
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        # Format results for return
        projects = []
        for match in results.matches:
            project = {
                "id": match.id,
                "name": match.metadata.get("name", "Unknown Project"),
                "summary": match.metadata.get("summary", "No summary available"),
                "details": match.metadata.get("details", "No details available"),
                "score": round(match.score, 3)
            }
            
            # Add optional fields if they exist
            if match.metadata.get("github"):
                project["github"] = match.metadata.get("github")
            if match.metadata.get("demo"):
                project["demo"] = match.metadata.get("demo")
                
            projects.append(project)
        
        return projects
        
    except Exception as e:
        print(f"Error searching projects: {e}")
        return []

def get_project_by_id(project_id: str) -> Optional[Dict]:
    """
    Fetch a specific project by its ID.
    
    Args:
        project_id: The unique ID of the project
    
    Returns:
        Project dictionary with metadata or None if not found
    """
    try:
        index = pc.Index(INDEX_NAME)
        
        # Fetch the specific vector
        fetch_result = index.fetch(ids=[project_id])
        
        if project_id in fetch_result.vectors:
            vector_data = fetch_result.vectors[project_id]
            metadata = vector_data.metadata
            
            project = {
                "id": project_id,
                "name": metadata.get("name", "Unknown Project"),
                "summary": metadata.get("summary", "No summary available"),
                "details": metadata.get("details", "No details available")
            }
            
            # Add optional fields
            if metadata.get("github"):
                project["github"] = metadata.get("github")
            if metadata.get("demo"):
                project["demo"] = metadata.get("demo")
                
            return project
        
        return None
        
    except Exception as e:
        print(f"Error fetching project {project_id}: {e}")
        return None

def find_similar_projects(project_id: str, top_k: int = 3) -> List[Dict]:
    """
    Find projects similar to a given project.
    
    Args:
        project_id: The ID of the project to find similar ones to
        top_k: Number of similar projects to return
    
    Returns:
        List of similar project dictionaries
    """
    try:
        index = pc.Index(INDEX_NAME)
        
        # Fetch the project's vector
        fetch_result = index.fetch(ids=[project_id])
        
        if project_id not in fetch_result.vectors:
            return []
        
        vector = fetch_result.vectors[project_id]
        
        # Query for similar projects, excluding the original
        results = index.query(
            vector=vector.values,
            top_k=top_k + 1,  # Get one extra in case we need to filter out the original
            include_metadata=True
        )
        
        # Format results, excluding the original project
        similar_projects = []
        for match in results.matches:
            if match.id != project_id:
                project = {
                    "id": match.id,
                    "name": match.metadata.get("name", "Unknown Project"),
                    "summary": match.metadata.get("summary", "No summary available"),
                    "score": round(match.score, 3)
                }
                similar_projects.append(project)
        
        return similar_projects[:top_k]
        
    except Exception as e:
        print(f"Error finding similar projects: {e}")
        return []