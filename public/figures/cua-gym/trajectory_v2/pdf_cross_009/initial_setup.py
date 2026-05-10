#!/usr/bin/env python3
"""
Setup script for task pdf_cross_009:

Task: Render page 3 of ~/Documents/technical_diagram.pdf as a high-resolution
      PNG image (300 DPI) using pymupdf. Insert this PNG into a new LibreOffice
      Writer document ~/Documents/diagram_reference.odt, centered on the page,
      with the caption 'Figure 1: System Architecture Diagram' below it in italic.

Initial state:
  ~/Documents/technical_diagram.pdf — a 5-page PDF where page 3 contains a
  detailed system architecture diagram with labelled components, arrows, and
  section titles. The agent must render page 3 to PNG at 300 DPI and then
  build the ODT document.

Golden state:
  ~/Documents/page3_diagram.png (or similar name chosen by agent) — PNG of
  page 3 at 300 DPI.
  ~/Documents/diagram_reference.odt — ODT document with the PNG centred
  horizontally, followed by the italic caption 'Figure 1: System Architecture
  Diagram', also centred.
"""

import os
import shlex
import subprocess
import time

try:
    import pymupdf
except ImportError:
    import fitz as pymupdf

# ── CONSTANTS ─────────────────────────────────────────────────────────────────
DOCUMENTS_DIR = os.path.expanduser("~/Documents")
os.makedirs(DOCUMENTS_DIR, exist_ok=True)

PDF_PATH = os.path.join(DOCUMENTS_DIR, "technical_diagram.pdf")

# ── DIAGRAM PAGE CONTENT ──────────────────────────────────────────────────────
# Five-page technical PDF.  Pages 1, 2, 4, 5 contain plain text sections.
# Page 3 (index 2) contains the system architecture diagram drawn with shapes
# and labelled components so it is visually distinct and easy to identify.

PAGE_TEXTS = [
    # Page 1 – Cover / Introduction
    {
        "title": "Technical System Overview",
        "body": (
            "This document describes the architecture of a distributed data "
            "processing platform. It covers the major subsystems, communication "
            "protocols, data flows, and deployment topology.\n\n"
            "Intended audience: software architects and senior engineers.\n\n"
            "Revision: 3.1   |   Classification: Internal"
        ),
    },
    # Page 2 – Requirements
    {
        "title": "1. System Requirements",
        "body": (
            "1.1 Functional Requirements\n"
            "  • Process up to 500,000 events per second in steady state.\n"
            "  • Guarantee at-least-once delivery with deduplication at sink.\n"
            "  • Support horizontal scaling without downtime.\n\n"
            "1.2 Non-Functional Requirements\n"
            "  • 99.95% availability SLA.\n"
            "  • End-to-end latency < 200 ms at p99.\n"
            "  • Full audit log retained for 90 days."
        ),
    },
    # Page 4 – Component Details
    {
        "title": "3. Component Descriptions",
        "body": (
            "3.1 API Gateway\n"
            "Handles authentication, rate limiting, and request routing to "
            "downstream microservices.  Deployed as a Kubernetes Deployment "
            "with 3 replicas minimum.\n\n"
            "3.2 Message Broker\n"
            "Apache Kafka cluster (3 brokers, replication factor 3).  Topic "
            "partitioning based on tenant ID to preserve ordering per tenant.\n\n"
            "3.3 Stream Processor\n"
            "Apache Flink job consuming from Kafka, performing stateful "
            "aggregations, enrichment lookups, and writing results to the "
            "Data Warehouse."
        ),
    },
    # Page 5 – Deployment & Conclusion
    {
        "title": "4. Deployment & Conclusion",
        "body": (
            "Deployment is fully automated via Helm charts stored in the "
            "infrastructure repository.  Blue/green deployments ensure zero "
            "downtime upgrades.\n\n"
            "Monitoring is provided by Prometheus + Grafana dashboards.  "
            "Alerts are routed through PagerDuty.\n\n"
            "This document will be reviewed quarterly or after any major "
            "architectural change.  Feedback and corrections should be "
            "submitted as pull requests against the docs/ directory."
        ),
    },
]


def draw_text_page(doc: "pymupdf.Document", title: str, body: str,
                   page_num: int) -> None:
    """Add a plain-text page to the PDF."""
    page = doc.new_page(width=595, height=842)  # A4

    # Title
    page.insert_text(
        pymupdf.Point(72, 72),
        title,
        fontsize=16,
        fontname="hebo",
        color=(0, 0, 0),
    )

    # Body
    page.insert_textbox(
        pymupdf.Rect(72, 110, 523, 780),
        body,
        fontsize=11,
        fontname="helv",
        color=(0, 0, 0),
        align=pymupdf.TEXT_ALIGN_LEFT,
    )

    # Page footer
    page.insert_text(
        pymupdf.Point(270, 820),
        f"— {page_num} —",
        fontsize=9,
        fontname="helv",
        color=(0.5, 0.5, 0.5),
    )


def draw_architecture_diagram_page(doc: "pymupdf.Document") -> None:
    """
    Add page 3 — the system architecture diagram page.
    Uses rectangles, lines, and labels to simulate a real diagram.
    """
    page = doc.new_page(width=595, height=842)

    # ── Page title ────────────────────────────────────────────────────────────
    page.insert_text(
        pymupdf.Point(72, 55),
        "2. System Architecture Diagram",
        fontsize=16,
        fontname="hebo",
        color=(0, 0, 0),
    )
    page.insert_text(
        pymupdf.Point(72, 78),
        "Figure 1 — High-level view of the distributed processing platform",
        fontsize=10,
        fontname="heit",
        color=(0.3, 0.3, 0.3),
    )

    shape = page.new_shape()

    # ── Helper: draw labelled box ─────────────────────────────────────────────
    def labelled_box(x0, y0, x1, y1, label, sublabel="",
                     fill=(0.85, 0.92, 1.0), stroke=(0.1, 0.3, 0.6)):
        rect = pymupdf.Rect(x0, y0, x1, y1)
        shape.draw_rect(rect)
        shape.finish(color=stroke, fill=fill, width=1.5)
        cx = (x0 + x1) / 2
        cy = (y0 + y1) / 2 - (6 if sublabel else 0)
        page.insert_text(pymupdf.Point(cx - len(label) * 3.2, cy),
                         label, fontsize=9, fontname="hebo", color=(0, 0, 0))
        if sublabel:
            page.insert_text(pymupdf.Point(cx - len(sublabel) * 2.6, cy + 12),
                             sublabel, fontsize=8, fontname="helv",
                             color=(0.3, 0.3, 0.3))

    # ── Helper: draw connector arrow ──────────────────────────────────────────
    def arrow(x0, y0, x1, y1):
        shape.draw_line(pymupdf.Point(x0, y0), pymupdf.Point(x1, y1))
        shape.finish(color=(0.2, 0.2, 0.2), width=1.2)

    # ── Tier 1: Clients ───────────────────────────────────────────────────────
    labelled_box(50,  110, 160, 155, "Web Browser",  "React SPA",
                 fill=(0.95, 0.95, 0.8), stroke=(0.5, 0.5, 0.1))
    labelled_box(205, 110, 315, 155, "Mobile App",   "iOS / Android",
                 fill=(0.95, 0.95, 0.8), stroke=(0.5, 0.5, 0.1))
    labelled_box(360, 110, 470, 155, "CLI / SDK",    "Python / Go",
                 fill=(0.95, 0.95, 0.8), stroke=(0.5, 0.5, 0.1))

    page.insert_text(pymupdf.Point(40, 105), "Clients", fontsize=8,
                     fontname="cobo", color=(0.4, 0.4, 0.4))

    # ── Tier 2: API Gateway ───────────────────────────────────────────────────
    arrow(105, 155, 230, 210)
    arrow(260, 155, 260, 210)
    arrow(415, 155, 290, 210)

    labelled_box(150, 210, 370, 265, "API Gateway",
                 "Auth  •  Rate-limit  •  Routing",
                 fill=(0.8, 0.9, 0.8), stroke=(0.1, 0.5, 0.1))

    page.insert_text(pymupdf.Point(40, 235), "Ingress", fontsize=8,
                     fontname="cobo", color=(0.4, 0.4, 0.4))

    # ── Tier 3: Message Broker ────────────────────────────────────────────────
    arrow(260, 265, 260, 320)

    labelled_box(150, 320, 370, 375, "Apache Kafka",
                 "3 brokers  •  RF=3  •  Tenant partitions",
                 fill=(1.0, 0.88, 0.78), stroke=(0.6, 0.2, 0.0))

    page.insert_text(pymupdf.Point(40, 345), "Messaging", fontsize=8,
                     fontname="cobo", color=(0.4, 0.4, 0.4))

    # ── Tier 4: Processing ────────────────────────────────────────────────────
    arrow(200, 375, 145, 430)
    arrow(320, 375, 375, 430)

    labelled_box(50,  430, 240, 485, "Stream Processor",
                 "Apache Flink  •  Stateful",
                 fill=(0.88, 0.82, 1.0), stroke=(0.3, 0.0, 0.6))
    labelled_box(280, 430, 470, 485, "Batch Processor",
                 "Spark  •  Nightly ETL",
                 fill=(0.88, 0.82, 1.0), stroke=(0.3, 0.0, 0.6))

    page.insert_text(pymupdf.Point(40, 455), "Processing", fontsize=8,
                     fontname="cobo", color=(0.4, 0.4, 0.4))

    # ── Tier 5: Storage ───────────────────────────────────────────────────────
    arrow(145, 485, 130, 540)
    arrow(375, 485, 390, 540)

    labelled_box(50,  540, 220, 595, "Data Warehouse",
                 "Snowflake  •  columnar",
                 fill=(0.78, 0.92, 1.0), stroke=(0.0, 0.3, 0.6))
    labelled_box(300, 540, 470, 595, "Object Store",
                 "S3-compatible  •  Parquet",
                 fill=(0.78, 0.92, 1.0), stroke=(0.0, 0.3, 0.6))

    # Also a cache layer
    arrow(260, 375, 490, 540)
    labelled_box(490, 540, 560, 580, "Cache",
                 "Redis",
                 fill=(1.0, 0.8, 0.8), stroke=(0.6, 0.1, 0.1))

    page.insert_text(pymupdf.Point(40, 565), "Storage", fontsize=8,
                     fontname="cobo", color=(0.4, 0.4, 0.4))

    # ── Tier 6: Observability sidebar ────────────────────────────────────────
    labelled_box(490, 200, 565, 310, "Monitoring",
                 "Prometheus\n+ Grafana",
                 fill=(1.0, 0.96, 0.78), stroke=(0.5, 0.4, 0.0))

    # Dashed border around all tiers (diagram box)
    shape.draw_rect(pymupdf.Rect(38, 95, 580, 615))
    shape.finish(color=(0.6, 0.6, 0.6), width=0.5, dashes="[4 4]")

    # ── Legend ────────────────────────────────────────────────────────────────
    legend_y = 635
    page.insert_text(pymupdf.Point(50, legend_y), "Legend:", fontsize=9,
                     fontname="hebo", color=(0, 0, 0))
    legend_items = [
        ((0.85, 0.92, 1.0), (0.1, 0.3, 0.6), "Core services"),
        ((0.95, 0.95, 0.8), (0.5, 0.5, 0.1), "Client tier"),
        ((0.8,  0.9,  0.8), (0.1, 0.5, 0.1), "Ingress tier"),
        ((1.0,  0.88, 0.78), (0.6, 0.2, 0.0), "Messaging tier"),
        ((0.88, 0.82, 1.0), (0.3, 0.0, 0.6), "Processing tier"),
        ((0.78, 0.92, 1.0), (0.0, 0.3, 0.6), "Storage tier"),
    ]
    lx = 50
    for fill_col, stroke_col, label in legend_items:
        shape.draw_rect(pymupdf.Rect(lx, legend_y + 12, lx + 14, legend_y + 26))
        shape.finish(color=stroke_col, fill=fill_col, width=1.0)
        page.insert_text(pymupdf.Point(lx + 18, legend_y + 25), label,
                         fontsize=8, fontname="helv", color=(0, 0, 0))
        lx += 90

    shape.commit()

    # Page footer
    page.insert_text(
        pymupdf.Point(270, 820),
        "— 3 —",
        fontsize=9,
        fontname="helv",
        color=(0.5, 0.5, 0.5),
    )


def create_technical_pdf(path: str) -> None:
    """Create the 5-page technical_diagram.pdf with page 3 as the diagram."""
    doc = pymupdf.open()

    # Page 1 – Cover
    draw_text_page(doc, PAGE_TEXTS[0]["title"], PAGE_TEXTS[0]["body"], 1)
    # Page 2 – Requirements
    draw_text_page(doc, PAGE_TEXTS[1]["title"], PAGE_TEXTS[1]["body"], 2)
    # Page 3 – Architecture Diagram  (index 2)
    draw_architecture_diagram_page(doc)
    # Page 4 – Component Details
    draw_text_page(doc, PAGE_TEXTS[2]["title"], PAGE_TEXTS[2]["body"], 4)
    # Page 5 – Deployment & Conclusion
    draw_text_page(doc, PAGE_TEXTS[3]["title"], PAGE_TEXTS[3]["body"], 5)

    doc.save(path)
    doc.close()
    print(f"[setup] Created {path} (5 pages, diagram on page 3)")


# ── LAUNCH GUI ────────────────────────────────────────────────────────────────

def launch_gui(command: str, delay_sec: float = 1.0) -> None:
    env = os.environ.copy()
    env["DISPLAY"] = ":0"
    subprocess.Popen(
        shlex.split(command),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env=env,
    )
    time.sleep(delay_sec)


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main() -> None:
    # 1. Create the 5-page source PDF
    create_technical_pdf(PDF_PATH)

    # 2. Open the PDF in Evince so the agent can inspect it
    launch_gui(f'evince --page-index=2 "{PDF_PATH}"', delay_sec=2.0)

    # 3. Open a terminal so the agent can run Python scripts
    launch_gui('bash -c "DISPLAY=:0 xterm &"', delay_sec=1.0)

    print("[setup] Done.")
    print(f"[setup] Source PDF : {PDF_PATH}  (5 pages)")
    print("[setup] Agent task : render page 3 at 300 DPI → PNG, "
          "then build diagram_reference.odt")


if __name__ == "__main__":
    main()
