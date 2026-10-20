# groundwork

[English](README.md) | **Русский**

Evidence-first процессные навыки для coding-агентов: изучи кодовую базу,
спроектируй минимальное решение, скомпилируй его в самый маленький исполняемый
план — и только потом строй.

Ядро пайплайна — три навыка, каждый производит один ревьюируемый Markdown-артефакт, плюс пост-реализационные ворота:

| Навык | Артефакт | Отвечает на вопрос |
|---|---|---|
| `codebase-analysis` | `CURRENT_STATE.md` | Как система работает **прямо сейчас**? Только доказательства, без предложений. |
| `grill` | `GRILL.md` | Что пользователь на самом деле решил: каждый ответ дословно, до любого дизайна. |
| `solution-design` | `SOLUTION.md` | Что менять, почему именно так, какие контракты должны сохраниться, что вне scope. |
| `planf3` | `specs/<name>-implementation-plan.md` | Самый маленький исполняемый план; также исполняет утверждённый план (режим Build Plan). |
| `ops-review` | отчёт с findings в чате | Чего в реализованном изменении **нет**? Тихие операционные отказы: отсутствующие таймауты, неограниченные ресурсы, утечки соединений, деградация при замедлившихся зависимостях. |
| `scope-review` | отчёт с findings в чате | Чего в diff **быть не должно**? Избыточный scope: добавления без вынуждающего требования, чужеродные паттерны, прослойки, дублирование, файлы вне рамки задачи. |
| `debug` | root cause + регрессионный тест, отчёт в чате | Почему оно **всё ещё** падает? Построить петлю, которая краснеет на баге, минимизировать, ранжировать фальсифицируемые гипотезы, инструментировать, починить на правильном шве, убрать за собой. |

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
claude/CLAUDE.md   глобальные правила, на которые опираются навыки (триаж S/M/L, scope-контракт, стоп-правило, пирамида доверия) — мержить в ~/.claude/CLAUDE.md руками
claude/workflows/  dynamic workflows Claude Code (verify.workflow.js, build-plan.workflow.js) — install.sh копирует в ~/.claude/workflows
codex/skills/      генерируемый вариант для Codex CLI — руками не править
codex/overlay/     codex-only файлы (agents/openai.yaml), подмешиваются при сборке
tools/build_codex.py   пересобирает codex/skills/ из skills/
dsh/               только DeepSeek Harness: AGENTS.md и навыки verify/code-review
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
./install.sh --all          # Claude Code + Codex + Pi + oh-my-pi + Grok
./install.sh --claude       # только ~/.claude/skills
./install.sh --codex        # пересобрать Codex-вариант, синк в ~/.codex/skills
./install.sh --pi           # ~/.pi/agent/skills + agents/AGENTS.md -> ~/.pi/agent/AGENTS.md + pi/prompts -> ~/.pi/agent/prompts
./install.sh --omp          # ~/.omp/agent/skills + agents/AGENTS.md -> ~/.omp/agent/AGENTS.md
./install.sh --grok         # ~/.grok/skills (правила Grok в ~/.grok/rules адаптируются вручную)
./install.sh --dsh          # ~/.dsh/skills (+ verify, code-review) + dsh/AGENTS.md -> ~/.dsh/AGENTS.md; в --all не входит
```

Cursor отдельного флага не требует: он сам читает `~/.claude/skills` и `~/.codex/skills`.

Синхронизация использует `rsync --delete`: локальные копии — зеркала и не должны
содержать уникального контента. Исключение — `~/.pi/agent/prompts`: Pi читает его без
вложенных папок, поэтому `pi/prompts` доливается без `--delete`, свои шаблоны остаются.
Обновление: `git pull && ./install.sh --all`.

### Установка через агента

Вставь это своему coding-агенту (Claude Code, Codex CLI и т.п.):

```text
Install the groundwork skills from https://github.com/tony-adamson/groundwork:
1. Clone the repo to a permanent location (e.g. ~/tools/groundwork) — it stays
   as the update source, do not delete it after install.
2. Run ./install.sh with the flags for my harnesses:
   --claude for Claude Code, --codex for Codex CLI, --pi for Pi, --omp for oh-my-pi,
   --dsh for DeepSeek Harness (dsh), --all for everything except dsh.
3. Verify: the skills codebase-analysis, grill, solution-design, planf3, ops-review, scope-review and debug
   appear in the harness skills directory (e.g. ls ~/.claude/skills; for dsh ls ~/.dsh/skills,
   which also holds verify and code-review).
To update later: git pull in the clone, then re-run ./install.sh.
```

### DeepSeek Harness (dsh)

В dsh достаточно сказать агенту: «поставь groundwork из https://github.com/tony-adamson/groundwork».
Агент выполнит блок выше с `--dsh`, который ставит:

- семь навыков плюс `verify` и `code-review` в `~/.dsh/skills` — копиями, без симлинков;
- `dsh/AGENTS.md` в `~/.dsh/AGENTS.md` (`~/.agents/AGENTS.md` dsh не читает). Если там уже лежит
  другой файл, он сохраняется как `~/.dsh/AGENTS.md.bak-<timestamp>`, установщик об этом пишет.

dsh дважды спросит разрешение, и это ожидаемо: клон в `~/tools` и установка в `~/.dsh` пишут вне
workspace, а песочница по умолчанию (`workspace-write`) сама этого не разрешает. Подтвердить оба раза.

Проверка: в новой сессии dsh набрать `/` — в композере видны `/grill`, `/verify` и `/code-review`.
`/verify` и `/code-review` запускаются только слэш-командой: рамку, допущения, оценку и scope писать
текстом после команды, подстановки аргументов в dsh нет.
`~/.dsh/skills/verify/verify.workflow.js` генерируется при установке из `claude/workflows/verify.workflow.js`
(модели dsh, без `export const meta`) — править канон, не копию.
Проверено на dsh 0.1.5-rc.1 (developer preview).

## Редактирование

1. Правь файлы только в `skills/`.
2. Запусти `python3 tools/build_codex.py` и закоммить оба дерева.
3. `./install.sh --all` для раскатки локально.
4. После правки `claude/workflows/verify.workflow.js` — `HOME=$(mktemp -d) ./install.sh --dsh`:
   установка падает, если переписывание в dsh-вариант больше не применяется.

Если нужна codex-специфичная формулировка — добавь её в `LINE_OVERRIDES` в
`tools/build_codex.py`; сборка падает, если override перестал совпадать с
каноническим текстом, так что override'ы не гниют молча.

## Использование

В Claude Code: `/codebase-analysis`, `/grill`, `/solution-design`, `/planf3`, `/ops-review`, `/scope-review`, `/debug`, `/verify`.
В Codex CLI: `$codebase-analysis`, `$grill`, `$solution-design`, `$planf3`, `$ops-review`, `$scope-review`, `$debug`.
В dsh: те же имена, что в Claude Code, плюс `/code-review`. `/verify` и `/code-review` запускаются, только
когда их набирает пользователь; рамку, допущения, оценку и scope писать текстом после команды, например
`/verify estimate: 3 files, 120 loc; assumptions: ДОПУЩЕНИЕ-1 …; scope: цель / не входит`.

Задуманный поток для задач архитектурного масштаба:

```
codebase-analysis  →  CURRENT_STATE.md   (утвердить)
grill              →  GRILL.md           (пользователь подтверждает общее понимание)
solution-design    →  SOLUTION.md        (утвердить)
planf3             →  implementation plan (утвердить, затем Build Plan)
ops-review         →  findings о тихих отказах (выходные ворота, если diff трогает I/O)
scope-review       →  findings об избыточном scope (выходные ворота перед PR)
verify (workflow)  →  diff → ops-review + scope-review + проверка допущений + саботаж тестов → один структурный отчёт
debug              →  root cause + регрессионный тест (отдельно: когда баг пережил первую правку)
```

Для маленьких задач иди сразу в `planf3` или просто реализуй — навыки намеренно
закрыты на явный вызов и отказываются от случайного использования. `ops-review`
самостоятелен: запускай его после любой реализации, чей diff трогает I/O (сеть,
БД, файлы, subprocess, очереди), независимо от того, что этот diff произвело.
`debug` тоже самостоятелен: он начинается там, где «прочитать stack trace и
починить» не сработало — та же ошибка вернулась, падение плавающее или симптом
«медленно». Его гейт: никаких гипотез, пока нет петли, которая краснеет на баге.

### Свод правил и workflow (Claude Code)

Навыки опираются на рабочие правила из `claude/CLAUDE.md`: триаж задач S/M/L,
scope-контракт перед M/L (цель, файлы, проверки, допущения, non-goals),
стоп-правило ×2 по размеру diff, minimal sufficient change, пирамида доверия и
tier-роутинг моделей. Без этого базиса навыки работают, но их воротам не к чему
привязаться — смержи файл в свой `~/.claude/CLAUDE.md` (автоматически не
устанавливается).

`agents/AGENTS.md` — харнес-агностичное подмножество тех же правил (триаж,
scope-контракт, стоп-правило, minimal sufficient change, контракты, пирамида
доверия) для агентов, которые читают `AGENTS.md` вместо `CLAUDE.md` — Codex,
Pi, omp; Claude-Code-специфичные разделы (tier-роутинг моделей, пайплайн
skills/артефактов, ссылки на слэш-команды) убраны или переформулированы
обобщённо.

`dsh/AGENTS.md` — тот же свод правил, переписанный под DeepSeek Harness: два
дополнительных раздела — как устроен dsh (инструменты, песочница, пути навыков)
и как там делегировать (`subagent`, `workflow`, какая модель DeepSeek на какой
риск); M/L-работа заканчивается просьбой к пользователю запустить `/verify`, затем
`/code-review`. `install.sh --dsh` кладёт его в `~/.dsh/AGENTS.md`; общие правила
синхронизировать с `claude/CLAUDE.md` вручную.

`claude/workflows/verify.workflow.js` — [dynamic workflow](https://code.claude.com/docs/en/workflows),
который прогоняет выходные ворота одной командой `/verify [range]`: собирает
diff, параллельно запускает `ops-review` (только если diff трогает I/O),
`scope-review`, проверку допущений и — если в diff есть тесты — саботаж, затем сводит один структурный отчёт —
вердикт, находки с evidence `file:line`, «что проверить на ревью» и статус
`CONFIRMED`/`UNVERIFIED` по каждому допущению. Допущения scope-контракта
передавай в `args.assumptions`, оценку — в `args.estimate`: стоп-правило
считается кодом, а не агентом. Саботаж ломает до пяти обещанных поведений во
временной копии (`git worktree`) и прогоняет тесты на каждой поломке: зелёный
набор показывает лишь согласие тестов с кодом, непойманная поломка — находка
WARN. Рабочее дерево не меняется, файлов-артефактов не создаёт. Нужен
Claude Code ≥ 2.1.154 с включёнными dynamic workflows в `/config`.

`claude/workflows/build-plan.workflow.js` реализует утверждённый план `planf3`
фазами вне главного контекста — implement, verify, fix, gate — и возвращает
структурную сводку; вызывается командой `/build-plan`, когда план дошёл до
`READY_FOR_BUILD`.

## Происхождение

Навык `planf3` — не оригинальная работа: это адаптированная и переработанная
версия [disler/planf3](https://github.com/disler/planf3) от IndyDevDan
(MIT License). `codebase-analysis` и `solution-design` — оригинальные, но
спроектированы как его входы.

## Лицензия

MIT — см. [LICENSE](LICENSE); файл сохраняет upstream-копирайт planf3.
