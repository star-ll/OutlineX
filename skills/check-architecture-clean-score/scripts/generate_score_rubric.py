#!/usr/bin/env python3
"""Generate architecture score rubric from AGENTS.md."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import re
from pathlib import Path


SECTION_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")


def extract_section_lines(markdown: str, section_name: str) -> list[str]:
    lines = markdown.splitlines()
    in_section = False
    section_level: int | None = None
    out: list[str] = []
    for line in lines:
        m = SECTION_RE.match(line.strip())
        if m:
            level = len(m.group(1))
            title = m.group(2).strip()
            if in_section and section_level is not None and level <= section_level:
                break
            if not in_section and title.lower() == section_name.strip().lower():
                in_section = True
                section_level = level
            continue
        if in_section:
            out.append(line.rstrip())
    return out


def extract_bullets(lines: list[str]) -> list[str]:
    bullets: list[str] = []
    for line in lines:
        s = line.strip()
        if s.startswith("- "):
            bullets.append(s[2:].strip())
    return bullets


def penalty_for_rule(rule: str, section: str) -> int:
    text = rule.lower()
    section_key = section.lower()

    if "must not" in text:
        return 20
    if "must" in text:
        return 15
    if section_key == "dependency rules":
        return 12
    if section_key == "code constraint":
        return 10
    return 8


def severity_for_penalty(penalty: int) -> str:
    if penalty >= 15:
        return "High"
    if penalty >= 8:
        return "Medium"
    return "Low"


def build_rubric(agents_path: Path, source: str) -> str:
    content = agents_path.read_text(encoding="utf-8")
    sha = hashlib.sha256(content.encode("utf-8")).hexdigest()[:12]
    generated_at = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    dependency_rules = extract_bullets(extract_section_lines(content, "Dependency Rules"))
    code_constraints = extract_bullets(extract_section_lines(content, "Code Constraint"))

    rule_rows: list[tuple[str, int, str, str]] = []
    for section, rules in (
        ("Dependency Rules", dependency_rules),
        ("Code Constraint", code_constraints),
    ):
        for rule in rules:
            penalty = penalty_for_rule(rule, section)
            severity = severity_for_penalty(penalty)
            rule_rows.append((rule, penalty, severity, section))

    total_max_penalty = sum(row[1] for row in rule_rows)

    lines: list[str] = []
    lines.append("# Architecture Clean Score Rubric")
    lines.append("")
    lines.append("> Auto-generated from `AGENTS.md`.")
    lines.append(f"> Source: `{source}`")
    lines.append(f"> Generated: `{generated_at}`")
    lines.append(f"> Source SHA-256 (12): `{sha}`")
    lines.append("")
    lines.append("Use this rubric to produce a 100-point architecture cleanliness score.")
    lines.append("")
    lines.append("## Base Score")
    lines.append("")
    lines.append("Start from `100`.")
    lines.append("")
    lines.append("## Rule Penalties (Derived From AGENTS.md)")
    lines.append("")
    if not rule_rows:
        lines.append("- No explicit bullet rules found in `Dependency Rules` or `Code Constraint`.")
    else:
        for idx, (rule, penalty, severity, section) in enumerate(rule_rows, start=1):
            lines.append(
                f"{idx}. `-{penalty}` ({severity}, {section}): {rule}"
            )
    lines.append("")
    lines.append("## Severity Mapping")
    lines.append("")
    lines.append("- `High`: penalty `>= 15`")
    lines.append("- `Medium`: penalty `8-14`")
    lines.append("- `Low`: penalty `<= 7`")
    lines.append("")
    lines.append("## Score Bands")
    lines.append("")
    lines.append("- `90-100`: clean, constraints mostly enforced")
    lines.append("- `75-89`: generally healthy, some important issues to fix")
    lines.append("- `60-74`: noticeable architecture debt")
    lines.append("- `<60`: architecture boundaries are weak or frequently violated")
    lines.append("")
    lines.append("## Reporting Requirements")
    lines.append("")
    lines.append("- Show each deduction with:")
    lines.append("  - broken rule")
    lines.append("  - file evidence")
    lines.append("  - penalty points")
    lines.append("- Show subtotal by severity.")
    lines.append("- Show final formula:")
    lines.append("  - `Final = max(0, 100 - total_penalty)`")
    lines.append("  - `Current rubric max theoretical penalty = {}`".format(total_max_penalty))
    lines.append("")
    lines.append("## Notes")
    lines.append("")
    lines.append("- Re-run generator whenever `AGENTS.md` changes.")
    lines.append("- Keep only verified violations; do not deduct for assumptions.")
    lines.append("")
    return "\n".join(lines)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--agents", required=True, help="Path to AGENTS.md")
    parser.add_argument("--out", required=True, help="Output markdown path")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    agents_path = Path(args.agents).resolve()
    out_path = Path(args.out).resolve()

    if not agents_path.exists():
        raise FileNotFoundError(f"AGENTS file not found: {agents_path}")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    rubric = build_rubric(agents_path=agents_path, source=str(agents_path))
    out_path.write_text(rubric + "\n", encoding="utf-8")
    print(f"[OK] Wrote rubric: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
