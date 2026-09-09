# Solution for #3: Bug-bounty Layer 1 adapter + Q-SCOPE / Q-DUP / Q-IMPACT

===FILE:.github/workflows/layer1_adapter.yml===
name: Layer 1 Adapter CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install pytest requests

    - name: Run tests
      run: pytest tests/test_layer1_adapter.py

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Build adapter
      run: |
        python setup.py sdist bdist_wheel

    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: layer1-adapter
        path: dist/
===END_FILE===

===FILE:src/layer1_adapter.py===
import requests
from typing import Dict, List, Optional

class Layer1Adapter:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def pull_scope(self, program_id: str) -> Dict:
        """Fetch program scope data from Layer 1"""
        endpoint = f"{self.base_url}/api/v1/programs/{program_id}/scope"
        response = requests.get(endpoint, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def query_scope(self, program_id: str, query: str) -> List[Dict]:
        """Execute Q-SCOPE query against program data"""
        endpoint = f"{self.base_url}/api/v1/programs/{program_id}/query"
        payload = {"query": query, "type": "Q-SCOPE"}
        response = requests.post(endpoint, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def query_duplicates(self, program_id: str, report_data: Dict) -> List[Dict]:
        """Execute Q-DUP query to check for duplicate reports"""
        endpoint = f"{self.base_url}/api/v1/programs/{program_id}/query"
        payload = {
            "query": "duplicate-check",
            "type": "Q-DUP",
            "data": report_data
        }
        response = requests.post(endpoint, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def query_impact(self, program_id: str, finding_data: Dict) -> Dict:
        """Execute Q-IMPACT query to assess finding impact"""
        endpoint = f"{self.base_url}/api/v1/programs/{program_id}/query"
        payload = {
            "query": "impact-assessment",
            "type": "Q-IMPACT",
            "data": finding_data
        }
        response = requests.post(endpoint, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def validate_report(self, report_data: Dict) -> bool:
        """Validate report structure and content"""
        required_fields = ['title', 'description', 'severity', 'reproduction_steps']
        return all(field in report_data for field in required_fields)
===END_FILE===

===FILE:tests/test_layer1_adapter.py===
import pytest
from unittest.mock import patch, MagicMock
from src.layer1_adapter import Layer1Adapter

@pytest.fixture
def adapter():
    return Layer1Adapter("https://api.example.com")

def test_pull_scope(adapter):
    mock_response = MagicMock()
    mock_response.json.return_value = {"assets": ["web", "api"]}
    mock_response.raise_for_status.return_value = None

    with patch('requests.get', return_value=mock_response) as mock_get:
        result = adapter.pull_scope("test-program")
        mock_get.assert_called_once_with(
            "https://api.example.com/api/v1/programs/test-program/scope",
            headers=adapter.headers
        )
        assert result == {"assets": ["web", "api"]}

def test_query_scope(adapter):
    mock_response = MagicMock()
    mock_response.json.return_value = [{"asset": "web", "scope": "in-scope"}]
    mock_response.raise_for_status.return_value = None

    with patch('requests.post', return_value=mock_response) as mock_post:
        result = adapter.query_scope("test-program", "web assets")
        mock_post.assert_called_once()
        assert result == [{"asset": "web", "scope": "in-scope"}]

def test_query_duplicates(adapter):
    mock_response = MagicMock()
    mock_response.json.return_value = [{"similarity": 0.9, "report_id": "123"}]
    mock_response.raise_for_status.return_value = None

    with patch('requests.post', return_value=mock_response) as mock_post:
        result = adapter.query_duplicates("test-program", {"title": "XSS"})
        mock_post.assert_called_once()
        assert result == [{"similarity": 0.9, "report_id": "123"}]

def test_query_impact(adapter):
    mock_response = MagicMock()
    mock_response.json.return_value = {"impact": "high", "confidence": 0.85}
    mock_response.raise_for_status.return_value = None

    with patch('requests.post', return_value=mock_response) as mock_post:
        result = adapter.query_impact("test-program", {"finding": "SQLi"})
        mock_post.assert_called_once()
        assert result == {"impact": "high", "confidence": 0.85}

def test_validate_report(adapter):
    valid_report = {
        "title": "Test",
        "description": "Test desc",
        "severity": "high",
        "reproduction_steps": "Steps"
    }
    invalid_report = {"title": "Test"}

    assert adapter.validate_report(valid_report) is True
    assert adapter.validate_report(invalid_report) is False
===END_FILE===

===FILE:PROTOCOL.md===
# Layer 1 Adapter Protocol

## Overview
This document specifies the implementation of the Layer 1 adapter for the bug bounty program, focusing on scope validation, duplicate detection, and impact assessment.

## Implementation Details

### Adapter Requirements
1. **Scope Pull**: Retrieve program scope data including assets and disclosed reports
2. **Query System**:
   - Q-SCOPE: Validate if assets are in scope
   - Q-DUP: Check for duplicate reports
   - Q-IMPACT: Assess finding impact
3. **Validation**: Enforce report structure and content requirements

### Technical Specifications
- Python implementation using requests library
- REST API integration with Layer 1 system
- Type hints for better code maintainability
- Comprehensive test coverage

## Acceptance Criteria
1. Successfully pull program scope data
2. Execute all three query types (Q-SCOPE, Q-DUP, Q-IMPACT)
3. Validate report structure before processing
4. Pass all unit tests
5. Integrate with existing CI/CD pipeline

## Testing Strategy
- Unit tests for each adapter method
- Mock API responses for isolated testing
- Test validation of both valid and invalid reports
- Verify error handling for API failures

## Deployment
- Package as Python wheel for distribution
- Include in CI/CD pipeline artifacts
- Document API endpoint requirements
===END_FILE===

---
_Generated by DevilX BountyHub solver_
