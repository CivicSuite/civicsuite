"""Generate USER-MANUAL.pdf and USER-MANUAL.docx from USER-MANUAL.md.
Minimal converter: reads markdown, emits a readable PDF + DOCX with headings
and paragraphs. Not a full-fidelity renderer; meant as a baseline so the
artifacts exist."""
from pathlib import Path

from docx import Document  # type: ignore
from reportlab.lib.pagesizes import LETTER  # type: ignore
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # type: ignore
from reportlab.lib.units import inch  # type: ignore
from reportlab.platypus import (  # type: ignore
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
)

ROOT = Path(__file__).resolve().parent.parent
MD = (ROOT / "USER-MANUAL.md").read_text(encoding="utf-8")


def parse(md):
    blocks = []
    in_code = False
    buf = []
    for line in md.splitlines():
        if line.startswith("```"):
            if in_code:
                blocks.append(("code", "\n".join(buf)))
                buf = []
                in_code = False
            else:
                if buf:
                    blocks.append(("p", "\n".join(buf).strip()))
                    buf = []
                in_code = True
            continue
        if in_code:
            buf.append(line)
            continue
        if line.startswith("# "):
            if buf:
                blocks.append(("p", "\n".join(buf).strip()))
                buf = []
            blocks.append(("h1", line[2:].strip()))
        elif line.startswith("## "):
            if buf:
                blocks.append(("p", "\n".join(buf).strip()))
                buf = []
            blocks.append(("h2", line[3:].strip()))
        elif line.startswith("### "):
            if buf:
                blocks.append(("p", "\n".join(buf).strip()))
                buf = []
            blocks.append(("h3", line[4:].strip()))
        elif line.strip() == "":
            if buf:
                blocks.append(("p", "\n".join(buf).strip()))
                buf = []
        else:
            buf.append(line)
    if buf:
        blocks.append(("p", "\n".join(buf).strip()))
    return [b for b in blocks if b[1]]


blocks = parse(MD)

# DOCX
doc = Document()
for kind, text in blocks:
    if kind == "h1":
        doc.add_heading(text, level=1)
    elif kind == "h2":
        doc.add_heading(text, level=2)
    elif kind == "h3":
        doc.add_heading(text, level=3)
    elif kind == "code":
        p = doc.add_paragraph()
        run = p.add_run(text)
        run.font.name = "Consolas"
    else:
        doc.add_paragraph(text)
doc.save(ROOT / "USER-MANUAL.docx")

# PDF
styles = getSampleStyleSheet()
code_style = ParagraphStyle("code", parent=styles["Code"], fontSize=8, leading=10)
pdf = SimpleDocTemplate(
    str(ROOT / "USER-MANUAL.pdf"),
    pagesize=LETTER,
    leftMargin=0.9 * inch,
    rightMargin=0.9 * inch,
    topMargin=0.9 * inch,
    bottomMargin=0.9 * inch,
    title="CivicSuite User Manual",
)
flow = []
for kind, text in blocks:
    safe = (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    if kind == "h1":
        flow.append(Paragraph(safe, styles["Title"]))
    elif kind == "h2":
        flow.append(Paragraph(safe, styles["Heading1"]))
    elif kind == "h3":
        flow.append(Paragraph(safe, styles["Heading2"]))
    elif kind == "code":
        flow.append(Preformatted(text, code_style))
    else:
        flow.append(Paragraph(safe, styles["BodyText"]))
    flow.append(Spacer(1, 6))
pdf.build(flow)
print("OK: wrote USER-MANUAL.pdf and USER-MANUAL.docx")
