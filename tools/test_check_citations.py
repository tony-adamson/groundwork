"""pytest tools/test_check_citations.py - the planf3 citation check on a throwaway git repo."""
import subprocess
import sys
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent.parent / "skills" / "planf3" / "scripts" / "check-citations.py"


def run(tmp_path: Path, doc: str):
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "agent.rs").write_text("".join(f"line {i}\n" for i in range(1, 51)))
    subprocess.run(["git", "init", "-q"], cwd=tmp_path, check=True)
    subprocess.run(["git", "add", "."], cwd=tmp_path, check=True)
    (tmp_path / "PLAN.md").write_text(doc)
    return subprocess.run([sys.executable, str(SCRIPT), "PLAN.md"], cwd=tmp_path, capture_output=True, text=True)


def test_valid_citations_pass(tmp_path):
    r = run(tmp_path, "see `src/agent.rs:12`, `agent.rs:40-50` and `agent.rs:3, 7`; `FROM python:3.12-slim` is not one\n")
    assert r.returncode == 0, r.stdout
    assert "3 checked, 0 failed" in r.stdout


def test_missing_file_and_line_past_end_fail(tmp_path):
    r = run(tmp_path, "`src/gone.rs:3`\nok `agent.rs:50`\n`agent.rs:10-51`\n")
    assert r.returncode == 1
    assert "PLAN.md:1: `src/gone.rs:3` - no such file" in r.stdout
    assert "PLAN.md:3: `agent.rs:10-51` - line 51 is past the end of src/agent.rs" in r.stdout
    assert "3 checked, 2 failed" in r.stdout
