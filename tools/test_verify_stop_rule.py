"""pytest tools/test_verify_stop_rule.py - the x2 stop rule of verify.workflow.js on a given diff.files.

The workflow runs under node with agent() stubbed: collect-diff returns the diff below, every other agent
returns null. Scope texts are quotes from real runs 10-14.10 that gave a wrong locNet.
"""
import json
import subprocess
from pathlib import Path

WF = Path(__file__).resolve().parent.parent / "claude" / "workflows" / "verify.workflow.js"

HARNESS = r"""
import { readFileSync } from 'node:fs'
const [wf, input] = process.argv.slice(1)
const { args, diff } = JSON.parse(readFileSync(input, 'utf8'))
const src = readFileSync(wf, 'utf8').replace(/^export const meta/m, 'const meta')
const prompts = {}
const agent = async (prompt, opts) => { prompts[opts.label] = prompt; return opts.label === 'collect-diff' ? diff : null }
const run = new Function('args', 'agent', 'phase', 'log', 'parallel', `return (async () => {${src}\n})()`)
const result = await run(args, agent, () => {}, () => {}, tasks => Promise.all(tasks.map(t => t())))
console.log(JSON.stringify({ result, prompts }))
"""


def f(path, added, removed=0, untracked=False):
    return {"path": path, "added": added, "removed": removed, "untracked": untracked}


def run(tmp_path, args, files, has_changes=True):
    diff = {"hasChanges": has_changes, "repo": "/repo", "range": "r", "stat": "", "head": "h", "dirty": True,
            "touchesIO": False, "files": files}
    (tmp_path / "in.json").write_text(json.dumps({"args": args, "diff": diff}))
    r = subprocess.run(["node", "--input-type=module", "-e", HARNESS, str(WF), str(tmp_path / "in.json")],
                       capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def test_untracked_file_named_only_in_negative_sentence_is_not_counted(tmp_path):
    scope = ("Файлы: app/core/config.py, .env.example. SOLUTION.md в рабочем дереве — посторонняя незакоммиченная "
             "правка (RISK-18), SESSION_STATE.md — локальный, не часть задачи.")
    out = run(tmp_path, {"scope": scope, "estimate": "6 файлов, ~40 строк net"},
              [f("app/core/config.py", 3), f(".env.example", 2), f("SESSION_STATE.md", 175, untracked=True)])
    rule = out["result"]["stopRule"]
    assert rule["actual"] == {"files": 2, "locNet": 5}
    assert rule["triggered"] is False
    assert rule["untrackedOutOfScope"] == ["SESSION_STATE.md"]
    assert out["result"]["verdict"] == "REVIEW_REQUIRED"


def test_non_goal_and_ignore_sentences_do_not_put_files_in_scope(tmp_path):
    scope = ("Цель: чат. Не входит: index.html, android/, backend. "
             "Вне задачи и игнорировать: SESSION_STATE.md, docs/*.pdf. В задаче: frontend/src/App.tsx.")
    out = run(tmp_path, {"scope": scope, "estimate": {"files": 2, "loc": 20}},
              [f("frontend/src/App.tsx", 18, 2), f("docs/prototypes/android/index.html", 34, untracked=True),
               f("SESSION_STATE.md", 88, untracked=True)])
    rule = out["result"]["stopRule"]
    assert rule["actual"] == {"files": 1, "locNet": 16}
    assert sorted(rule["untrackedOutOfScope"]) == ["SESSION_STATE.md", "docs/prototypes/android/index.html"]


def test_files_inside_a_folder_named_in_scope_are_counted(tmp_path):
    scope = ("Изменения — новая untracked папка w7d1/ (ещё не в git), плюс specs/emi-week7.md (бриф). "
             "Учитывать untracked файлы w7d1/** (кроме Cargo.lock и target/).")
    out = run(tmp_path, {"scope": scope, "estimate": {"files": 10, "loc": 300}},
              [f("w7d1/src/rag.rs", 389, untracked=True), f("w7d1/src/main.rs", 180, untracked=True),
               f("w7d1/Cargo.lock", 3222, untracked=True), f("specs/emi-week7.md", 36),
               f("SESSION_STATE.md", 50, untracked=True)])
    rule = out["result"]["stopRule"]
    assert rule["actual"] == {"files": 3, "locNet": 605}
    assert rule["triggered"] is True
    assert rule["untrackedOutOfScope"] == ["SESSION_STATE.md"]


def test_non_goal_list_keeps_negation_across_semicolons(tmp_path):
    scope = ("Файлы: tools/new.py; тесты рядом. Не входит: исключение по имени; stop-gate hook; "
             "чужие правки DETERMINISTIC_CHECKS_PLAN.md, pyproject.toml.")
    out = run(tmp_path, {"scope": scope, "estimate": {"files": 2, "loc": 130}},
              [f("tools/new.py", 96, untracked=True), f("DETERMINISTIC_CHECKS_PLAN.md", 950, untracked=True),
               f("pyproject.toml", 60, untracked=True)])
    rule = out["result"]["stopRule"]
    assert rule["actual"] == {"files": 1, "locNet": 96}
    assert sorted(rule["untrackedOutOfScope"]) == ["DETERMINISTIC_CHECKS_PLAN.md", "pyproject.toml"]


def test_unrelated_changes_and_foreign_work_phrasings_are_negative(tmp_path):
    scope = ("Файлы: backend/app/admin.py. В рабочем дереве есть НЕ относящиеся к задаче изменения — их не оценивать: "
             "GRILL.md, docs/prototypes/android/*, SESSION_STATE.md, .claude/\n"
             "Untracked DETERMINISTIC_CHECKS_PLAN.md, checker/, pyproject.toml, tests/ — чужая работа, вне scope.")
    out = run(tmp_path, {"scope": scope, "estimate": {"files": 1, "loc": 100}},
              [f("backend/app/admin.py", 80), f("docs/prototypes/android/prototype.js", 300, untracked=True),
               f(".claude/launch.json", 12, untracked=True), f("checker/core.py", 171, untracked=True)])
    rule = out["result"]["stopRule"]
    assert rule["actual"] == {"files": 1, "locNet": 80}
    assert sorted(rule["untrackedOutOfScope"]) == [".claude/launch.json", "checker/core.py",
                                                   "docs/prototypes/android/prototype.js"]


def test_contract_heading_keeps_its_files_positive_around_a_marker(tmp_path):
    for scope in ("Файлы: tools/new.py, остальное не входит.", "Не входит: рефакторинг; Файлы: tools/new.py"):
        out = run(tmp_path, {"scope": scope, "estimate": {"files": 1, "loc": 100}},
                  [f("tools/new.py", 900, untracked=True)])
        assert out["result"]["stopRule"]["actual"] == {"files": 1, "locNet": 900}, scope
        assert out["result"]["verdict"] == "BLOCKED", scope


def test_bullets_under_a_non_goals_heading_are_negative(tmp_path):
    scope = ("- **Файлы**: tools/new.py\n- **Не входит**:\n  - SESSION_STATE.md\n  - checker/\n"
             "- **Допущения**: нет")
    out = run(tmp_path, {"scope": scope, "estimate": {"files": 1, "loc": 100}},
              [f("tools/new.py", 40, untracked=True), f("SESSION_STATE.md", 175, untracked=True),
               f("checker/core.py", 171, untracked=True)])
    rule = out["result"]["stopRule"]
    assert rule["actual"] == {"files": 1, "locNet": 40}
    assert sorted(rule["untrackedOutOfScope"]) == ["SESSION_STATE.md", "checker/core.py"]


def test_glob_with_extension_does_not_cover_the_whole_folder(tmp_path):
    out = run(tmp_path, {"scope": "Файлы: docs/*.pdf (обновить), tools/a.py.", "estimate": {"files": 1, "loc": 100}},
              [f("tools/a.py", 30), f("docs/huge-notes.md", 500, untracked=True)])
    assert out["result"]["stopRule"]["untrackedOutOfScope"] == ["docs/huge-notes.md"]


def test_foreign_work_marker_matches_other_case_forms(tmp_path):
    out = run(tmp_path, {"scope": "Файлы: tools/a.py. Не трогаю чужую работу: checker/", "estimate": {"files": 1, "loc": 100}},
              [f("tools/a.py", 30), f("checker/core.py", 171, untracked=True)])
    assert out["result"]["stopRule"]["untrackedOutOfScope"] == ["checker/core.py"]


def test_verdict_names_the_repo_it_refers_to(tmp_path):
    assert run(tmp_path, {}, [f("a.py", 1)])["result"]["verified"]["repo"] == "/repo"


def test_positive_sentence_with_a_side_remark_keeps_its_files(tmp_path):
    out = run(tmp_path, {"scope": "Файлы: tools/a.py (не проверяется линтером), tools/b.py.", "estimate": {"files": 2, "loc": 100}},
              [f("tools/a.py", 30, untracked=True), f("tools/b.py", 20, untracked=True)])
    assert out["result"]["stopRule"]["actual"] == {"files": 2, "locNet": 50}


def test_untracked_file_named_in_positive_sentence_is_still_counted(tmp_path):
    out = run(tmp_path, {"scope": "Файлы: tools/new.py (новый). Не входит: README.md.", "estimate": {"files": 1, "loc": 20}},
              [f("tools/new.py", 50, untracked=True)])
    assert out["result"]["stopRule"]["actual"] == {"files": 1, "locNet": 50}
    assert out["result"]["stopRule"]["triggered"] is True


def test_default_frame_on_dirty_tree_excludes_branch_commits(tmp_path):
    prompt = run(tmp_path, {}, [f("a.py", 1)])["prompts"]["collect-diff"]
    assert "git diff HEAD" in prompt
    assert "коммиты ветки не включай" in prompt
    assert "в другие каталоги не переходи" in prompt


def test_repo_arg_is_used_as_cwd(tmp_path):
    prompt = run(tmp_path, {"repo": "/Users/x/other-repo"}, [f("a.py", 1)])["prompts"]["collect-diff"]
    assert prompt.startswith("Репозиторий: /Users/x/other-repo.")


def test_empty_names_the_repo_that_was_checked(tmp_path):
    out = run(tmp_path, {}, [], has_changes=False)["result"]
    assert out["verdict"] == "EMPTY"
    assert "/repo" in out["note"] and "args.cwd" in out["note"]
