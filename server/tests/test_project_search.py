"""
Tests for project_search.py - Pinecone vector search functionality.
"""

import pytest
from unittest.mock import patch, MagicMock


class TestGetEmbedding:
    """Tests for get_embedding function."""

    def test_get_embedding_returns_list(self, mock_openai_embeddings):
        """Test that get_embedding returns a list of floats."""
        from project_search import get_embedding
        
        result = get_embedding("test query")
        
        assert isinstance(result, list)
        assert len(result) == 3072  # text-embedding-3-large dimension
        assert all(isinstance(x, float) for x in result)

    def test_get_embedding_calls_openai(self, mock_openai_embeddings):
        """Test that get_embedding calls OpenAI API correctly."""
        from project_search import get_embedding
        
        get_embedding("test query")
        
        mock_openai_embeddings.embeddings.create.assert_called_once()
        call_args = mock_openai_embeddings.embeddings.create.call_args
        assert call_args.kwargs["input"] == "test query"
        assert call_args.kwargs["model"] == "text-embedding-3-large"


class TestSearchProjects:
    """Tests for search_projects function."""

    def test_search_projects_returns_list(self, mock_openai_embeddings, mock_pinecone):
        """Test that search_projects returns a list of projects."""
        from project_search import search_projects
        
        results = search_projects("AI projects")
        
        assert isinstance(results, list)
        assert len(results) == 1  # Based on mock setup

    def test_search_projects_result_structure(self, mock_openai_embeddings, mock_pinecone):
        """Test that search results have expected structure."""
        from project_search import search_projects
        
        results = search_projects("test")
        
        assert len(results) > 0
        project = results[0]
        assert "id" in project
        assert "name" in project
        assert "summary" in project
        assert "details" in project
        assert "score" in project

    def test_search_projects_with_top_k(self, mock_openai_embeddings, mock_pinecone):
        """Test that top_k parameter is passed to Pinecone."""
        from project_search import search_projects
        
        search_projects("test", top_k=5)
        
        mock_pinecone.query.assert_called_once()
        call_kwargs = mock_pinecone.query.call_args.kwargs
        assert call_kwargs["top_k"] == 5

    def test_search_projects_empty_results(self, mock_openai_embeddings, mock_pinecone):
        """Test handling of empty search results."""
        from project_search import search_projects
        
        # Mock empty results
        mock_pinecone.query.return_value.matches = []
        
        results = search_projects("nonexistent")
        
        assert results == []

    def test_search_projects_includes_optional_fields(self, mock_openai_embeddings, mock_pinecone):
        """Test that optional fields (github, demo) are included when present."""
        from project_search import search_projects
        
        results = search_projects("test")
        
        project = results[0]
        assert "github" in project

    def test_search_projects_handles_exception(self, mock_openai_embeddings, mock_pinecone):
        """Test that exceptions are handled gracefully."""
        from project_search import search_projects
        
        mock_pinecone.query.side_effect = Exception("API error")
        
        results = search_projects("test")
        
        assert results == []


class TestGetProjectById:
    """Tests for get_project_by_id function."""

    def test_get_project_by_id_returns_project(self, mock_pinecone):
        """Test that get_project_by_id returns a project dict."""
        from project_search import get_project_by_id
        
        result = get_project_by_id("test-project")
        
        assert result is not None
        assert result["id"] == "test-project"
        assert "name" in result
        assert "summary" in result
        assert "details" in result

    def test_get_project_by_id_not_found(self, mock_pinecone):
        """Test handling when project is not found."""
        from project_search import get_project_by_id
        
        # Mock empty fetch result
        mock_pinecone.fetch.return_value.vectors = {}
        
        result = get_project_by_id("nonexistent-project")
        
        assert result is None

    def test_get_project_by_id_handles_exception(self, mock_pinecone):
        """Test that exceptions are handled gracefully."""
        from project_search import get_project_by_id
        
        mock_pinecone.fetch.side_effect = Exception("Fetch error")
        
        result = get_project_by_id("test-project")
        
        assert result is None


class TestFindSimilarProjects:
    """Tests for find_similar_projects function."""

    def test_find_similar_projects_returns_list(self, mock_pinecone):
        """Test that find_similar_projects returns a list."""
        from project_search import find_similar_projects
        
        # Setup mock to return the project vector and similar results
        mock_vector = MagicMock()
        mock_vector.values = [0.1] * 3072
        mock_vector.metadata = {"name": "Test Project"}
        mock_pinecone.fetch.return_value.vectors = {"test-project": mock_vector}
        
        # Mock similar project
        mock_similar = MagicMock()
        mock_similar.id = "similar-project"
        mock_similar.score = 0.9
        mock_similar.metadata = {
            "name": "Similar Project",
            "summary": "A similar project",
        }
        mock_pinecone.query.return_value.matches = [mock_similar]
        
        results = find_similar_projects("test-project")
        
        assert isinstance(results, list)

    def test_find_similar_excludes_original(self, mock_pinecone):
        """Test that the original project is excluded from results."""
        from project_search import find_similar_projects
        
        mock_vector = MagicMock()
        mock_vector.values = [0.1] * 3072
        mock_pinecone.fetch.return_value.vectors = {"test-project": mock_vector}
        
        # Include original project in query results
        original_match = MagicMock()
        original_match.id = "test-project"
        original_match.score = 1.0
        original_match.metadata = {"name": "Test Project", "summary": "Original"}
        
        similar_match = MagicMock()
        similar_match.id = "other-project"
        similar_match.score = 0.9
        similar_match.metadata = {"name": "Other Project", "summary": "Similar"}
        
        mock_pinecone.query.return_value.matches = [original_match, similar_match]
        
        results = find_similar_projects("test-project")
        
        # Original should be excluded
        assert all(p["id"] != "test-project" for p in results)

    def test_find_similar_project_not_found(self, mock_pinecone):
        """Test handling when source project is not found."""
        from project_search import find_similar_projects
        
        mock_pinecone.fetch.return_value.vectors = {}
        
        results = find_similar_projects("nonexistent")
        
        assert results == []

    def test_find_similar_handles_exception(self, mock_pinecone):
        """Test that exceptions are handled gracefully."""
        from project_search import find_similar_projects
        
        mock_pinecone.fetch.side_effect = Exception("Error")
        
        results = find_similar_projects("test-project")
        
        assert results == []
