"""
Tests for guestbook endpoints.
"""

import os
import json
import pytest
from unittest.mock import patch, mock_open, MagicMock

class TestGuestbookEndpoints:
    """Tests for guestbook endpoints."""

    def test_get_guestbook_empty(self, app_client):
        """Test getting guestbook when file missing."""
        with patch("os.path.exists", return_value=False):
            response = app_client.get("/guestbook")
            assert response.status_code == 200
            assert response.json() == []

    def test_get_guestbook_with_entries(self, app_client):
        """Test getting guestbook with entries."""
        mock_data = [
            {"name": "Alice", "message": "Hello!", "timestamp": 1234567890.0}
        ]

        with patch("os.path.exists", return_value=True), \
             patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):

            response = app_client.get("/guestbook")
            assert response.status_code == 200
            assert response.json() == mock_data

    def test_add_guestbook_entry(self, app_client):
        """Test adding a new guestbook entry."""
        payload = {
            "name": "Bob",
            "message": "Hi there!"
        }

        # We need to mock os.path.exists to return False initially (so we start with empty list)
        # and mock open for writing.
        with patch("os.path.exists", return_value=False), \
             patch("builtins.open", mock_open()) as mocked_file, \
             patch("time.time", return_value=1000.0):

            response = app_client.post("/guestbook", json=payload)

            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            entry = data["entry"]
            assert entry["name"] == "Bob"
            assert entry["message"] == "Hi there!"
            assert entry["timestamp"] == 1000.0

            # Verify write was called
            mocked_file.assert_called_with("guestbook.json", "w")
            handle = mocked_file()
            # The write call argument should contain the JSON string with our entry
            # We can check if write was called at all
            assert handle.write.called
