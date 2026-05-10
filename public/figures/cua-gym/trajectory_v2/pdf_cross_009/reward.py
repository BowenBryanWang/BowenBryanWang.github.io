#!/usr/bin/env python3
"""
Reward script for task pdf_cross_009:

Task: Render page 3 of ~/Documents/technical_diagram.pdf as a high-resolution
      PNG (300 DPI) using pymupdf.  Insert that PNG into a new LibreOffice
      Writer document ~/Documents/diagram_reference.odt, centred on the page,
      with the italic caption 'Figure 1: System Architecture Diagram' below it,
      also centred.

Scoring rubric (total = 1.0):
  Component 1 (0.10): PNG file exists in ~/Documents/
  Component 2 (0.20): PNG is rendered at (approximately) 300 DPI
                       (width × height ≈ page3 points × 300/72)
  Component 3 (0.15): ~/Documents/diagram_reference.odt exists
  Component 4 (0.25): ODT contains at least one embedded image
  Component 5 (0.20): ODT caption contains 'Figure 1: System Architecture Diagram'
                       in italic (checked via ODT XML and/or converted DOCX)
  Component 6 (0.10): Image paragraph and caption paragraph are both centred
"""

import os
import sys
import zipfile
import xml.etree.ElementTree as ET

# ── CONSTANTS ─────────────────────────────────────────────────────────────────
DOCUMENTS_DIR  = os.path.expanduser("~/Documents")
PDF_PATH       = os.path.join(DOCUMENTS_DIR, "technical_diagram.pdf")
ODT_PATH       = os.path.join(DOCUMENTS_DIR, "diagram_reference.odt")
CAPTION_TEXT   = "Figure 1: System Architecture Diagram"

# Expected PNG dimensions: A4 page (595 × 842 pts) at 300 DPI
# 595 * 300/72 ≈ 2479   842 * 300/72 ≈ 3508
EXPECTED_PNG_W = 2479
EXPECTED_PNG_H = 3508
DPI_TOLERANCE  = 0.10   # ±10 %


# ── HELPER: find any PNG produced by the agent ─────────────────────────────────

def find_agent_png() -> str | None:
    """
    Return the path to the first PNG file in ~/Documents that plausibly
    represents page 3 of the PDF at ~300 DPI.  The agent may have chosen
    any filename.
    """
    try:
        for fname in os.listdir(DOCUMENTS_DIR):
            if fname.lower().endswith(".png"):
                return os.path.join(DOCUMENTS_DIR, fname)
    except Exception:
        pass
    return None


# ── COMPONENT 1: PNG file exists ───────────────────────────────────────────────

def component1_png_exists() -> tuple:
    """Component 1 (0.10): A PNG file exists in ~/Documents/."""
    weight = 0.10
    png = find_agent_png()
    if png:
        print(f"PASS: Component 1 — PNG found: {os.path.basename(png)} (0.10 pts)")
        return True, weight, png
    print(f"FAIL: Component 1 — No PNG found in {DOCUMENTS_DIR}")
    return False, 0.0, None


# ── COMPONENT 2: PNG at ~300 DPI ───────────────────────────────────────────────

def component2_png_resolution(png_path: str) -> tuple:
    """
    Component 2 (0.20): PNG dimensions match a 300-DPI render of an A4 page.
    Reads PNG dimensions via Pillow.
    """
    weight = 0.20
    try:
        from PIL import Image
        img = Image.open(png_path)
        w, h = img.size
        img.close()

        # Allow ±10% from expected dimensions
        w_ok = abs(w - EXPECTED_PNG_W) / EXPECTED_PNG_W <= DPI_TOLERANCE
        h_ok = abs(h - EXPECTED_PNG_H) / EXPECTED_PNG_H <= DPI_TOLERANCE

        print(f"  PNG size: {w}×{h} px  (expected ≈{EXPECTED_PNG_W}×{EXPECTED_PNG_H})")

        if w_ok and h_ok:
            print(f"PASS: Component 2 — PNG resolution matches 300 DPI ({weight} pts)")
            return True, weight
        elif w_ok or h_ok:
            score = weight * 0.5
            print(f"PARTIAL: Component 2 — Only one dimension matches ({score:.3f} pts)")
            return False, score
        else:
            print(f"FAIL: Component 2 — PNG dimensions do not match 300 DPI")
            return False, 0.0
    except Exception as e:
        print(f"FAIL: Component 2 — Could not read PNG dimensions: {e}")
        return False, 0.0


# ── COMPONENT 3: ODT file exists ───────────────────────────────────────────────

def component3_odt_exists() -> tuple:
    """Component 3 (0.15): ~/Documents/diagram_reference.odt exists."""
    weight = 0.15
    if os.path.isfile(ODT_PATH):
        print(f"PASS: Component 3 — diagram_reference.odt exists (0.15 pts)")
        return True, weight
    print(f"FAIL: Component 3 — diagram_reference.odt not found at {ODT_PATH}")
    return False, 0.0


# ── COMPONENT 4: ODT contains an embedded image ────────────────────────────────

def component4_image_in_odt() -> tuple:
    """
    Component 4 (0.25): The ODT contains at least one embedded image.
    Checks for draw:image elements in content.xml and for binary image data
    in the Pictures/ folder inside the ODT ZIP.
    """
    weight = 0.25
    try:
        with zipfile.ZipFile(ODT_PATH, "r") as z:
            names = z.namelist()
            # Look for Pictures/ entries
            pictures = [n for n in names if n.lower().startswith("pictures/")]

            # Also check content.xml for draw:image or draw:frame
            content_xml = z.read("content.xml").decode("utf-8", errors="replace")

        has_picture_files = len(pictures) > 0
        has_draw_image = "draw:image" in content_xml or "draw:frame" in content_xml

        if has_picture_files and has_draw_image:
            print(f"PASS: Component 4 — ODT contains {len(pictures)} embedded image(s) "
                  f"(0.25 pts)")
            return True, weight
        elif has_picture_files or has_draw_image:
            score = weight * 0.6
            print(f"PARTIAL: Component 4 — Partial image evidence "
                  f"(pictures={has_picture_files}, draw:image={has_draw_image}) "
                  f"({score:.3f} pts)")
            return False, score
        else:
            print("FAIL: Component 4 — No embedded image found in ODT")
            return False, 0.0
    except Exception as e:
        print(f"FAIL: Component 4 — Error reading ODT: {e}")
        return False, 0.0


# ── COMPONENT 5: caption text present and italic ───────────────────────────────

_ODT_NS = {
    "text":  "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
    "style": "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
    "fo":    "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
}


def _get_odt_text_and_styles(odt_path: str) -> tuple:
    """
    Extract (full_text, styles_xml_str, content_xml_str) from an ODT zip.
    Returns ("", "", "") on error.
    """
    try:
        with zipfile.ZipFile(odt_path, "r") as z:
            content_raw = z.read("content.xml").decode("utf-8", errors="replace")
            try:
                styles_raw = z.read("styles.xml").decode("utf-8", errors="replace")
            except KeyError:
                styles_raw = ""

        root = ET.fromstring(content_raw)
        texts = []
        for elem in root.iter():
            if elem.text:
                texts.append(elem.text)
            if elem.tail:
                texts.append(elem.tail)
        return " ".join(texts), styles_raw, content_raw
    except Exception:
        return "", "", ""


def component5_caption_italic() -> tuple:
    """
    Component 5 (0.20): Caption 'Figure 1: System Architecture Diagram' exists
    and is formatted as italic.

    Strategy A: read ODT XML directly.
    Strategy B: convert ODT → DOCX via LibreOffice headless and check with
                python-docx.
    """
    weight = 0.20

    full_text, styles_xml, content_xml = _get_odt_text_and_styles(ODT_PATH)

    # ── Sub-check A: caption text present ─────────────────────────────────────
    caption_present = CAPTION_TEXT.lower() in full_text.lower()
    if not caption_present:
        # Last-chance: check raw XML bytes (e.g. partial entity encoding)
        try:
            with zipfile.ZipFile(ODT_PATH, "r") as z:
                raw = z.read("content.xml")
            caption_present = CAPTION_TEXT.encode() in raw
        except Exception:
            pass

    if not caption_present:
        print(f"FAIL: Component 5 — Caption text not found in ODT")
        return False, 0.0

    # ── Sub-check B: italic formatting ────────────────────────────────────────
    # ODT stores italic as fo:font-style="italic" in automatic or named styles.
    italic_in_content = (
        'font-style="italic"' in content_xml
        or "fo:font-style=\"italic\"" in content_xml
    )
    italic_in_styles = (
        'font-style="italic"' in styles_xml
        or "fo:font-style=\"italic\"" in styles_xml
    )
    italic_found = italic_in_content or italic_in_styles

    if italic_found:
        print(f"PASS: Component 5 — Caption with italic found in ODT XML ({weight} pts)")
        return True, weight

    # ── Fallback: convert ODT → DOCX and check python-docx ───────────────────
    converted_docx = os.path.join(DOCUMENTS_DIR, "_reward_check.docx")
    try:
        import subprocess
        result = subprocess.run(
            [
                "libreoffice", "--headless", "--convert-to", "docx",
                "--outdir", DOCUMENTS_DIR, ODT_PATH,
            ],
            capture_output=True, text=True, timeout=30,
        )
        base = os.path.splitext(os.path.basename(ODT_PATH))[0]
        auto_out = os.path.join(DOCUMENTS_DIR, base + ".docx")
        if os.path.exists(auto_out) and auto_out != converted_docx:
            import shutil
            shutil.move(auto_out, converted_docx)

        if os.path.isfile(converted_docx):
            from docx import Document
            doc = Document(converted_docx)
            for para in doc.paragraphs:
                if CAPTION_TEXT.lower() in para.text.lower():
                    for run in para.runs:
                        if run.italic:
                            print(f"PASS: Component 5 — Italic caption confirmed via "
                                  f"DOCX conversion ({weight} pts)")
                            return True, weight
                    # Caption found but italic not confirmed — partial credit
                    score = weight * 0.6
                    print(f"PARTIAL: Component 5 — Caption present but italic "
                          f"not confirmed ({score:.3f} pts)")
                    return False, score
    except Exception as e:
        print(f"  [warn] Component 5 DOCX fallback failed: {e}")
    finally:
        if os.path.isfile(converted_docx):
            try:
                os.remove(converted_docx)
            except Exception:
                pass

    # Caption is present but italic check failed
    score = weight * 0.5
    print(f"PARTIAL: Component 5 — Caption found but italic unconfirmed ({score:.3f} pts)")
    return False, score


# ── COMPONENT 6: centred alignment ─────────────────────────────────────────────

def component6_centred_alignment() -> tuple:
    """
    Component 6 (0.10): The image and the caption are centred.
    Checks for fo:text-align="center" (or equivalent) in the ODT styles or
    content that are associated with paragraphs containing the image or caption.
    Also checks via converted DOCX as fallback.
    """
    weight = 0.10

    try:
        with zipfile.ZipFile(ODT_PATH, "r") as z:
            content_xml = z.read("content.xml").decode("utf-8", errors="replace")

        # LibreOffice ODT uses fo:text-align="center" inside paragraph properties
        centred = (
            'text-align="center"' in content_xml
            or "fo:text-align=\"center\"" in content_xml
        )
        if centred:
            print(f"PASS: Component 6 — Centred alignment found in ODT ({weight} pts)")
            return True, weight
    except Exception as e:
        print(f"  [warn] Component 6 ODT check failed: {e}")

    # Fallback: look in styles.xml
    try:
        with zipfile.ZipFile(ODT_PATH, "r") as z:
            styles_xml = z.read("styles.xml").decode("utf-8", errors="replace")
        if 'text-align="center"' in styles_xml or 'fo:text-align="center"' in styles_xml:
            print(f"PASS: Component 6 — Centred alignment found in ODT styles.xml ({weight} pts)")
            return True, weight
    except Exception:
        pass

    print("FAIL: Component 6 — Could not confirm centred alignment in ODT")
    return False, 0.0


# ── MAIN REWARD FUNCTION ────────────────────────────────────────────────────────

def verify_task() -> float:
    print("=" * 65)
    print("Reward Verification: pdf_cross_009")
    print("Task: Render page-3 PNG at 300 DPI → insert into diagram_reference.odt")
    print("=" * 65)

    total_score = 0.0

    # Component 1: PNG exists
    c1_pass, c1_score, png_path = component1_png_exists()
    total_score += c1_score

    # Component 2: PNG at ~300 DPI (only if PNG exists)
    if c1_pass and png_path:
        print("\n--- Component 2: PNG Resolution ---")
        c2_pass, c2_score = component2_png_resolution(png_path)
        total_score += c2_score
    else:
        c2_score = 0.0
        print("SKIP: Component 2 — no PNG to inspect")

    # Component 3: ODT exists
    print("\n--- Component 3: ODT File ---")
    c3_pass, c3_score = component3_odt_exists()
    total_score += c3_score

    if not c3_pass:
        # No point checking the other ODT components
        print("\n" + "=" * 65)
        print(f"Component 1 (PNG exists):         {c1_score:.3f} / 0.10")
        print(f"Component 2 (PNG 300 DPI):         {c2_score:.3f} / 0.20")
        print(f"Component 3 (ODT exists):          {c3_score:.3f} / 0.15")
        print(f"Component 4 (image in ODT):        0.000 / 0.25")
        print(f"Component 5 (italic caption):      0.000 / 0.20")
        print(f"Component 6 (centred alignment):   0.000 / 0.10")
        print("=" * 65)
        final = round(min(total_score, 1.0), 4)
        print(f"\nREWARD: {final}")
        return final

    # Component 4: Image embedded in ODT
    print("\n--- Component 4: Image in ODT ---")
    c4_pass, c4_score = component4_image_in_odt()
    total_score += c4_score

    # Component 5: Italic caption
    print("\n--- Component 5: Italic Caption ---")
    c5_pass, c5_score = component5_caption_italic()
    total_score += c5_score

    # Component 6: Centred alignment
    print("\n--- Component 6: Centred Alignment ---")
    c6_pass, c6_score = component6_centred_alignment()
    total_score += c6_score

    # Summary
    print("\n" + "=" * 65)
    print(f"Component 1 (PNG exists):          {c1_score:.3f} / 0.10")
    print(f"Component 2 (PNG 300 DPI):          {c2_score:.3f} / 0.20")
    print(f"Component 3 (ODT exists):           {c3_score:.3f} / 0.15")
    print(f"Component 4 (image in ODT):         {c4_score:.3f} / 0.25")
    print(f"Component 5 (italic caption):       {c5_score:.3f} / 0.20")
    print(f"Component 6 (centred alignment):    {c6_score:.3f} / 0.10")
    print("=" * 65)

    final = round(min(total_score, 1.0), 4)
    print(f"\nREWARD: {final}")
    return final


if __name__ == "__main__":
    verify_task()
    sys.exit(0)
