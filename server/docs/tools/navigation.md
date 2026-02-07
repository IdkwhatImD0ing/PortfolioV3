# Navigation Tools

Documentation for the page navigation tools used by the LLM.

## File Location

`llm.py` (lines 188-230)

## Purpose

Allow the LLM to navigate the frontend to different pages during conversation. Each tool triggers a `MetadataResponse` that the frontend handles.

## Available Tools

### display_landing_page

Navigate to the initial landing page.

```python
@tool
def display_landing_page(message: str) -> str:
    """Displays the landing page on the frontend.
    
    Args:
        message: The message to speak before navigating
    """
    return "Successfully displayed the landing page"
```

**Metadata sent:**
```json
{"type": "navigation", "page": "landing"}
```

### display_homepage

Navigate to the personal/about page.

```python
@tool
def display_homepage(message: str) -> str:
    """Displays Bill's personal homepage on the frontend.
    
    Args:
        message: The message to speak before navigating
    """
    return "Successfully displayed the personal homepage"
```

**Metadata sent:**
```json
{"type": "navigation", "page": "personal"}
```

### display_resume_page

Navigate to the resume page.

```python
@tool
def display_resume_page(message: str) -> str:
    """Displays Bill's resume page on the frontend.
    
    Args:
        message: The message to speak before navigating
    """
    return "Successfully displayed the resume page"
```

**Metadata sent:**
```json
{"type": "navigation", "page": "resume"}
```

### display_education_page

Navigate to the education page.

```python
@tool
def display_education_page(message: str) -> str:
    """Displays the education page on the frontend.
    
    Args:
        message: The message to speak before navigating
    """
    return "Successfully displayed the education page"
```

**Metadata sent:**
```json
{"type": "navigation", "page": "education"}
```

### display_project

Navigate to a specific project page.

```python
@tool
def display_project(id: str, message: str) -> str:
    """Displays a specific project on the frontend.
    
    Args:
        id: The unique project ID (e.g., "dispatch-ai")
        message: The message to speak before navigating
    """
    return f"Successfully displayed project: {id}"
```

**Metadata sent:**
```json
{"type": "navigation", "page": "project", "project_id": "dispatch-ai"}
```

## Message Parameter

All navigation tools have a `message` parameter. This is spoken aloud BEFORE the page changes:

```python
# In draft_response()
if message_to_speak:
    yield ResponseResponse(
        response_id=response_id,
        content=message_to_speak + " ",
        content_complete=False,
        end_call=False,
    )
```

**Example usage by LLM:**
```
display_education_page(message="Let me show you my education background")
```

The message is spoken first, then the page changes.

## Metadata Event Flow

```
1. LLM calls tool (e.g., display_education_page)
2. Server yields ToolCallInvocationResponse
3. Server yields ResponseResponse with message
4. Server yields MetadataResponse
5. Server yields ToolCallResultResponse
6. Frontend receives metadata event
7. Frontend calls setActivePage("education")
```

## Adding a New Navigation Tool

### 1. Define the Tool

```python
@tool
def display_skills_page(message: str) -> str:
    """Displays the skills page on the frontend.
    
    Args:
        message: The message to speak before navigating
    """
    return "Successfully displayed the skills page"
```

### 2. Add to prepare_functions()

```python
def prepare_functions(self) -> List[Any]:
    return [
        display_education_page,
        display_homepage,
        display_landing_page,
        display_resume_page,
        display_project,
        search_projects,
        get_project_details,
        display_skills_page,  # Add here
    ]
```

### 3. Handle Metadata in draft_response()

```python
elif name == "display_skills_page":
    yield MetadataResponse(
        metadata={"type": "navigation", "page": "skills"}
    )
```

### 4. Update Frontend

In `client/src/app/page.tsx`:

```typescript
case "skills":
    setActivePage("skills");
    break;
```

### 5. Update System Prompt

In `prompts.py`, add to navigation section:

```
- **display_skills_page(message)**: Shows the skills page
```

## Related Files

- [../modules/llm.md](../modules/llm.md) - LLM client handling tool calls
- [search.md](search.md) - Project search tools
- `../../client/docs/components/page.md` - Frontend handling metadata
