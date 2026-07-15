# groundwork

[English](README.md) | **Русский**

Evidence-first процессные навыки для coding-агентов: изучи кодовую базу,
спроектируй минимальное решение, скомпилируй его в самый маленький исполняемый
план — и только потом строй.

Ядро пайплайна — три навыка, каждый производит один ревьюируемый Markdown-артефакт, плюс пост-реализационные ворота:

| Навык | Артефакт | Отвечает на вопрос |
|---|---|---|
| `codebase-analysis` | `CURRENT_STATE.md` | Как система работает **прямо сейчас**? Только доказательства, без предложений. |
| `solution-design` | `SOLUTION.md` | Что менять, почему именно так, какие контракты должны сохраниться, что вне scope. |
| `planf3` | `specs/<name>-implementation-plan.md` | Самый маленький исполняемый план; также исполняет утверждённый план (режим Build Plan). |
| `ops-review` | отчёт с findings в чате | Чего в реализованном изменении **нет**? Тихие операционные отказы: отсутствующие таймауты, неограниченные ресурсы, утечки соединений, деградация при замедлившихся зависимостях. |

Каждая стадия закрыта воротами: навык отказывается бежать вперёд своих входов
(`BLOCKED`), отказывается раздувать scope (`SCOPE_OVERDESIGN`) и никогда молча
не запускает следующую стадию. Каждый артефакт состоит из двух блоков — короткое
резюме для человека и подробный контракт для агента — и каждое существенное
утверждение должно быть подкреплено доказательством из живого кода, а не памятью
модели.

Навыки кодируют философию минимального достаточного изменения: без
future-proofing, без новых абстракций без второго реального call site, с
бюджетами на размер diff и явными стоп-правилами, когда фактическое изменение
перерастает оценку.

> Навыки пишут артефакты **на языке пользователя** — агент определяет его из
> диалога, поэтому русскоязычный пользователь получит `SOLUTION.md` на русском.
> Имена файлов, статусы, symbols и команды не переводятся. Сами инструкции
> навыков — на английском.

## Структура

```
skills/            канонические версии (формат Claude Code / Pi) — редактировать здесь
codex/skills/      генерируемый вариант для Codex CLI — руками не править
codex/overlay/     codex-only файлы (agents/openai.yaml), подмешиваются при сборке
tools/build_codex.py   пересобирает codex/skills/ из skills/
install.sh         зеркалит навыки в локальные харнесы
```

Канонический источник истины — `skills/`. Codex-вариант отличается только
механически: английский триггер `description`, `$`-префиксы у ссылок на навыки,
удалённые Claude-only ключи frontmatter и пара специфичных для харнеса строк
(см. `LINE_OVERRIDES` в `tools/build_codex.py`).

## Установка

```bash
git clone https://github.com/tony-adamson/groundwork
cd groundwork
./install.sh --all          # Claude Code + Codex + Pi
./install.sh --claude       # только ~/.claude/skills
./install.sh --codex        # пересобрать Codex-вариант, синк в ~/.codex/skills
./install.sh --pi           # только ~/.pi/agent/skills
```

Синхронизация использует `rsync --delete`: локальные копии — зеркала и не должны
содержать уникального контента. Обновление: `git pull && ./install.sh --all`.

### Установка через агента

Вставь это своему coding-агенту (Claude Code, Codex CLI и т.п.):

```text
Install the groundwork skills from https://github.com/tony-adamson/groundwork:
1. Clone the repo to a permanent location (e.g. ~/tools/groundwork) — it stays
   as the update source, do not delete it after install.
2. Run ./install.sh with the flags for my harnesses:
   --claude for Claude Code, --codex for Codex CLI, --pi for Pi, --all for everything.
3. Verify: the skills codebase-analysis, solution-design, planf3 and ops-review
   appear in the harness skills directory (e.g. ls ~/.claude/skills).
To update later: git pull in the clone, then re-run ./install.sh.
```

## Редактирование

1. Правь файлы только в `skills/`.
2. Запусти `python3 tools/build_codex.py` и закоммить оба дерева.
3. `./install.sh --all` для раскатки локально.

Если нужна codex-специфичная формулировка — добавь её в `LINE_OVERRIDES` в
`tools/build_codex.py`; сборка падает, если override перестал совпадать с
каноническим текстом, так что override'ы не гниют молча.

## Использование

В Claude Code: `/codebase-analysis`, `/solution-design`, `/planf3`, `/ops-review`.
В Codex CLI: `$codebase-analysis`, `$solution-design`, `$planf3`, `$ops-review`.

Задуманный поток для задач архитектурного масштаба:

```
codebase-analysis  →  CURRENT_STATE.md   (утвердить)
solution-design    →  SOLUTION.md        (утвердить)
planf3             →  implementation plan (утвердить, затем Build Plan)
ops-review         →  findings о тихих отказах (выходные ворота, если diff трогает I/O)
```

Для маленьких задач иди сразу в `planf3` или просто реализуй — навыки намеренно
закрыты на явный вызов и отказываются от случайного использования. `ops-review`
самостоятелен: запускай его после любой реализации, чей diff трогает I/O (сеть,
БД, файлы, subprocess, очереди), независимо от того, что этот diff произвело.

## Происхождение

Навык `planf3` — не оригинальная работа: это адаптированная и переработанная
версия [disler/planf3](https://github.com/disler/planf3) от IndyDevDan
(MIT License). `codebase-analysis` и `solution-design` — оригинальные, но
спроектированы как его входы.

## Лицензия

MIT — см. [LICENSE](LICENSE); файл сохраняет upstream-копирайт planf3.
