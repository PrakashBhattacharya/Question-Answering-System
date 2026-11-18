"""
URL context fetcher router — scrapes a public webpage and returns clean text.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
import httpx
from bs4 import BeautifulSoup
import re

router = APIRouter()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; ContextIQ-Fetcher/2.0)",
}


class FetchRequest(BaseModel):
    url: str
    max_chars: int = 10000

class FetchResponse(BaseModel):
    url: str
    title: str
    text: str
    character_count: int
    word_count: int


@router.post("/fetch", response_model=FetchResponse)
async def fetch_url_context(req: FetchRequest):
    """Fetch a URL and extract clean readable text for use as QA context."""
    if not req.url.strip():
        raise HTTPException(status_code=422, detail="URL cannot be empty.")

    url = req.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url, headers=HEADERS)
            if response.status_code >= 400:
                raise HTTPException(
                    status_code=422,
                    detail=f"Could not fetch URL (HTTP {response.status_code}). The page may be private or unavailable.",
                )
            html = response.text
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timed out. The URL took too long to respond.")
    except httpx.ConnectError:
        raise HTTPException(status_code=422, detail="Could not connect to the URL. Check that it's a valid public webpage.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch URL: {str(e)}")

    try:
        soup = BeautifulSoup(html, "html.parser")

        # Extract title
        title_tag = soup.find("title")
        title = title_tag.get_text(strip=True) if title_tag else url

        # Remove script, style, nav, footer, header elements
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "iframe", "form"]):
            tag.decompose()

        # Try to find main content areas
        main_content = (
            soup.find("article")
            or soup.find("main")
            or soup.find(attrs={"role": "main"})
            or soup.find(id=re.compile(r"(content|main|article|body)", re.I))
            or soup.body
        )

        if main_content:
            text = main_content.get_text(separator=" ", strip=True)
        else:
            text = soup.get_text(separator=" ", strip=True)

        # Clean up whitespace
        text = re.sub(r"\s{2,}", " ", text).strip()
        text = text[: req.max_chars]

        if len(text) < 50:
            raise HTTPException(
                status_code=422,
                detail="Could not extract meaningful text from this URL. The page may require JavaScript or login.",
            )

        return FetchResponse(
            url=url,
            title=title[:200],
            text=text,
            character_count=len(text),
            word_count=len(text.split()),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")
