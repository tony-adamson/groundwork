export const meta = {
  name: 'verify',
  description: 'Верификация M/L-изменения: diff → parallel[ops-review, scope-review, assumption-check] → сводка. READ-ONLY, без артефактов.',
  whenToUse: 'Финальный отчёт по M/L-задаче: статус допущений, что проверить на ревью, стоп-правило ×2. Запускать по явной просьбе (/verify) после реализации, перед /code-review.',
  phases: [
    { title: 'Diff', detail: 'git diff --stat + содержательные хунки диапазона; признак I/O' },
    { title: 'Lenses', detail: 'parallel: ops-review (если I/O), scope-review, assumption-check — по SKILL.md из ~/.claude/skills' },
    { title: 'Falsify', detail: 'opus: попытка убить каждую находку линз; выживает только перевыведенная по коду' },
    { title: 'Synthesize', detail: 'дедуп, severity, «что проверить на ревью», статусы допущений' },
  ],
}

// ── args ─────────────────────────────────────────────────────────────────
// Строка: трактуется как git range/ref (пусто = рабочее дерево против merge-base).
// Объект: { cwd?, range?, assumptions?: [{id, text}] | string[], estimate?: { files, loc }, scope?: string }
//   assumptions — допущения из scope-контракта, передаёт главная сессия (workflow их не выводит).
//   estimate    — оценка из scope-контракта для стоп-правила ×2 (считается в JS, не агентом).
//                 Объект {files, loc} или строка вида "2 files, 120 loc" / "~5 файлов / 300 строк".
//   scope       — текст scope-контракта (цель, не входит): без него scope-review сверяется с чем попало в репо.
let A = args
if (typeof A === 'string') {
  const s = A.trim()
  if (s.startsWith('{')) { try { A = JSON.parse(s) } catch (e) { A = { range: s } } }
  else A = { range: s }
}
A = A || {}
const CWD = A.cwd || '.'
const RANGE = A.range || ''
const ASSUMPTIONS = (A.assumptions || []).map((a, i) =>
  (typeof a === 'string') ? { id: `A${i + 1}`, text: a } : { id: a.id || `A${i + 1}`, text: a.text || String(a) })
// Оценка приводится к первому числу в значении: строка вида "~5 файлов" давала NaN, и стоп-правило молча не срабатывало.
const toCount = v => { const m = String(v ?? '').match(/\d+(\.\d+)?/); const n = m ? Number(m[0]) : NaN; return Number.isFinite(n) && n > 0 ? n : null }
// estimate приходит и объектом {files, loc}, и строкой ("2 files, 120 loc" из заголовка карточки
// Linear через run-phase.sh; агенты в чате тоже пишут текстом) — строка роняла весь прогон на throw.
// \w в JS — только ASCII, поэтому кириллические окончания перечислены явно.
const estimateKind = w => /^(files?|файл[а-яё]*)$/i.test(w) ? 'files' : /^(loc|строк[а-яё]*)$/i.test(w) ? 'loc' : null
const parseEstimate = v => {
  if (v === undefined || v === null || v === '') return null
  if (typeof v === 'object') return { files: toCount(v.files), loc: toCount(v.loc) }
  const tokens = String(v).match(/\d+(?:\.\d+)?|[A-Za-zА-Яа-яЁё]+/g) || []
  const out = { files: null, loc: null }
  // Формат определяется первым токеном: «3 файла, 150 LOC» — слово после числа,
  // «файлов 3, строк 200» — слово перед числом. Двусторонний поиск путал поля.
  const wordFirst = tokens.length > 0 && !!estimateKind(tokens[0])
  tokens.forEach((t, i) => {
    if (!/^\d/.test(t)) return
    const kind = wordFirst ? estimateKind(tokens[i - 1] || '') : estimateKind(tokens[i + 1] || '')
    if (kind && !out[kind]) out[kind] = toCount(t)
  })
  const numbers = tokens.filter(t => /^\d/.test(t))
  // Одно число без ключевых слов — это LOC: так оценку сокращают чаще всего.
  if (!out.files && !out.loc && numbers.length === 1) out.loc = toCount(numbers[0])
  return out
}
const ESTIMATE = parseEstimate(A.estimate)
const ESTIMATE_RAW = typeof A.estimate === 'string' ? A.estimate : JSON.stringify(A.estimate ?? null)
// Тихий NaN уже был багом (см. комментарий к toCount): нераспознанный estimate не бросает исключение
// и не молчит — стоп-правило не применяется, а raw уезжает в stopRule и в лог.
const ESTIMATE_UNPARSED = !!(ESTIMATE && !ESTIMATE.files && !ESTIMATE.loc)
const SCOPE = typeof A.scope === 'string' ? A.scope.trim() : ''

// Роутинг моделей: sonnet — сбор/синтез, opus — линзы-верификаторы. Без явного model агент берёт модель сессии.
const SKILLS = '~/.claude/skills'
const READ_ONLY = `READ-ONLY: ничего не править (никаких Edit/Write/sed -i/git commit), файлов не создавать. Только находки с доказательством file:line.`

// ── Schemas ──────────────────────────────────────────────────────────────
const DIFF_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['hasChanges', 'range', 'stat', 'files', 'touchesIO', 'head', 'dirty'],
  properties: {
    hasChanges: { type: 'boolean' },
    head: { type: 'string', description: 'git rev-parse HEAD на момент сбора рамки — объект, к которому относится вердикт' },
    dirty: { type: 'boolean', description: 'были ли незакоммиченные изменения (git status --porcelain непуст)' },
    range: { type: 'string', description: 'фактически использованный git range/описание рамки' },
    stat: { type: 'string', description: 'дословный вывод git diff --stat' },
    files: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['path', 'added', 'removed'],
      properties: { path: { type: 'string' }, added: { type: 'number' }, removed: { type: 'number' } } } },
    touchesIO: { type: 'boolean', description: 'diff трогает сеть/БД/файлы/subprocess/очереди/HTTP-клиенты/миграции' },
    ioEvidence: { type: 'string', description: 'file:line, по которым решён touchesIO' },
    diffExcerpt: { type: 'string', description: 'unified diff; при большом объёме — только содержательные хунки, без сгенерированных/lock/минифицированных файлов' },
  },
}

const FINDING = {
  type: 'object', additionalProperties: false,
  required: ['file', 'line', 'severity', 'issue', 'evidence'],
  properties: {
    file: { type: 'string' }, line: { type: 'string' },
    severity: { type: 'string', enum: ['BLOCKING', 'WARN', 'INFO'] },
    rule: { type: 'string', description: 'нарушенное правило из SKILL.md' },
    issue: { type: 'string' }, evidence: { type: 'string', description: 'дословная цитата строки (строк), которые делают находку правдой, с file:line' },
  },
}
const LENS_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['lens', 'findings', 'coverage'],
  properties: { lens: { type: 'string' }, findings: { type: 'array', items: FINDING },
    coverage: { type: 'string', description: 'что реально проверено и чем; что не удалось проверить' } },
}
const ASSUMPTION_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['results'],
  properties: { results: { type: 'array', items: { type: 'object', additionalProperties: false,
    required: ['id', 'status', 'evidence', 'wouldConfirm'],
    properties: { id: { type: 'string' }, status: { type: 'string', enum: ['CONFIRMED', 'UNVERIFIED'] },
      evidence: { type: 'string', description: 'file:line, тест или вывод команды; для UNVERIFIED — что искали' },
      wouldConfirm: { type: 'string', description: 'что подтвердило бы (для CONFIRMED — пусто)' } } } } },
}
const FALSIFY_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['survived', 'killed'],
  properties: {
    survived: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['file', 'line', 'severity', 'issue', 'input', 'callPath', 'outcome'],
      properties: { file: { type: 'string' }, line: { type: 'string' },
        severity: { type: 'string', enum: ['BLOCKING', 'WARN', 'INFO'] },
        rule: { type: 'string' }, issue: { type: 'string' }, lens: { type: 'string' },
        input: { type: 'string', description: 'конкретный вход, перевыведенный в этом проходе' },
        callPath: { type: 'string', description: 'путь вызова до дефекта, file:line' },
        outcome: { type: 'string', description: 'наблюдаемый результат: что именно сломается' } } } },
    killed: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['file', 'issue', 'whyNotADefect'],
      properties: { file: { type: 'string' }, line: { type: 'string' }, issue: { type: 'string' },
        whyNotADefect: { type: 'string', description: 'код, который делает это не-дефектом: file:line гварда, недостижимость, тип, покрывающая конвенция — либо нарушенное правило отбраковки' } } } },
  },
}
const SYNTH_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['verdict', 'findings', 'reviewChecks', 'summary'],
  properties: {
    verdict: { type: 'string', enum: ['OK', 'REVIEW_REQUIRED', 'BLOCKED'] },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['file', 'line', 'severity', 'issue', 'lenses'],
      properties: { file: { type: 'string' }, line: { type: 'string' }, severity: { type: 'string', enum: ['BLOCKING', 'WARN', 'INFO'] },
        issue: { type: 'string' }, evidence: { type: 'string' }, lenses: { type: 'array', items: { type: 'string' } } } } },
    reviewChecks: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'object', additionalProperties: false,
      required: ['risk', 'howToCheck'], properties: { risk: { type: 'string' }, howToCheck: { type: 'string' } } },
      description: '«Что проверить на ревью»: 3–5 конкретных рисков и как проверить руками' },
    summary: { type: 'string' },
  },
}

// ── Phase 1: Diff ────────────────────────────────────────────────────────
phase('Diff')
const rangeHint = RANGE
  ? `Рамка задана явно: "${RANGE}" — используй git diff ${RANGE} (и git diff --stat ${RANGE}).`
  : `Рамка не задана: возьми рабочее дерево + staged против merge-base с интеграционной веткой (git merge-base HEAD origin/dev или origin/main — что существует); если рабочее дерево чистое — HEAD против merge-base.`
const diff = await agent(
  `Репозиторий: ${CWD}. Собери рамку изменений для верификации. ${rangeHint}
Через Bash: git diff --stat, список файлов с added/removed (git diff --numstat), сам diff.
ВАЖНО: git diff не видит untracked-файлы. Возьми их из git status --porcelain (строки '??'), посчитай каждый через git diff --no-index -- /dev/null <файл> и включи в files и stat наравне с остальными — иначе новый файл целиком выпадет из locNet и стоп-правило ×2 промахнётся на diff, который его превышает.
Верни head — дословный вывод git rev-parse HEAD, и dirty — непуст ли git status --porcelain. Вердикт относится к этому объекту, поэтому он должен быть назван.
Определи touchesIO: трогает ли diff сеть, БД, файлы, subprocess, очереди, HTTP-клиенты, миграции — приведи ioEvidence (file:line).
В diffExcerpt исключи сгенерированное (lock-файлы, минифицированное, graphify-out, снапшоты). ${READ_ONLY}`,
  { label: 'collect-diff', phase: 'Diff', schema: DIFF_SCHEMA, model: 'sonnet' }
)

if (!diff || !diff.hasChanges || !(diff.files && diff.files.length)) {
  return { verdict: 'EMPTY', range: RANGE || 'auto', note: 'Изменений в рамке нет — проверь range/ветку/staged.', diff }
}

// Стоп-правило ×2 — плоский JS, без агента.
// Lock/generated-файлы не считаются: Cargo.lock на 1285 строк — не превышение scope.
const GENERATED = /(^|\/)(Cargo\.lock|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|poetry\.lock|uv\.lock|Podfile\.lock|go\.sum|composer\.lock|Gemfile\.lock)$/
const counted = diff.files.filter(f => !GENERATED.test(f.path || ''))
const filesChanged = counted.length
const locNet = counted.reduce((s, f) => s + (f.added || 0) - (f.removed || 0), 0)
let stopRule = null
if (ESTIMATE && (ESTIMATE.files || ESTIMATE.loc)) {
  const overFiles = ESTIMATE.files ? filesChanged > 2 * ESTIMATE.files : false
  const overLoc = ESTIMATE.loc ? Math.abs(locNet) > 2 * ESTIMATE.loc : false
  stopRule = { estimate: ESTIMATE, actual: { files: filesChanged, locNet }, triggered: overFiles || overLoc,
    detail: overFiles || overLoc ? 'Diff превысил оценку scope-контракта в 2 раза — остановиться и показать git diff --stat'
      : `в пределах оценки${!ESTIMATE.files ? ' (files не задан, не проверялся)' : ''}${!ESTIMATE.loc ? ' (loc не задан, не проверялся)' : ''}` }
} else if (ESTIMATE_UNPARSED) {
  stopRule = { estimateRaw: ESTIMATE_RAW, actual: { files: filesChanged, locNet }, triggered: false,
    detail: `estimate не распознан: ${ESTIMATE_RAW} — стоп-правило ×2 не применялось` }
}
log(`diff: ${filesChanged} files, ${locNet} LOC net, touchesIO=${diff.touchesIO}${stopRule && stopRule.triggered ? ' — STOP-RULE TRIGGERED' : ''}${ESTIMATE_UNPARSED ? ` — estimate не распознан: ${ESTIMATE_RAW}` : ''}`)

// ── Phase 2: Lenses (parallel) ───────────────────────────────────────────
phase('Lenses')
const ctx = `Репозиторий: ${CWD}. Рамка: ${diff.range}.
git diff --stat:
${diff.stat}
Diff (выдержка):
${diff.diffExcerpt || '(не передан — собери сам через git diff ' + (RANGE || '') + ')'}`

const lensTasks = []
if (diff.touchesIO) {
  lensTasks.push(() => agent(
    `${ctx}
Ты выполняешь навык ops-review. Прочитай через Bash (cat) ${SKILLS}/ops-review/SKILL.md целиком и файлы в ${SKILLS}/ops-review/references/ — это твой чек-лист и правила severity, следуй им дословно.
Ищи класс «чего в коде нет»: таймауты, ограничение ресурсов, утечки соединений, неидемпотентные ретраи, деградация при медленной зависимости. Рамка — только этот diff и его blast radius. ${READ_ONLY}
Верни lens="ops-review", findings (severity/file/line/rule/issue/evidence), coverage.`,
    { label: 'lens:ops-review', phase: 'Lenses', schema: LENS_SCHEMA, model: 'opus' }))
} else {
  log('ops-review пропущен: diff не трогает I/O (по данным фазы Diff)')
}
lensTasks.push(() => agent(
  `${ctx}
Ты выполняешь навык scope-review. Прочитай через Bash (cat) ${SKILLS}/scope-review/SKILL.md целиком и файлы в ${SKILLS}/scope-review/references/ (если есть) — это твой чек-лист и правила severity, следуй им дословно.
${SCOPE ? 'Scope-контракт задачи — единственный источник требований; документы в репозитории (issues, specs, старые планы) ему уступают:\n' + SCOPE : 'Scope-контракт не передан (args.scope): требование могло быть озвучено в чате — находку «нет вынуждающего требования» ставить не выше WARN.'}
Ищи класс «чего в diff быть не должно»: добавления без вынуждающего требования, чужеродные паттерны, прослойки, дублирование существующих helpers, негигиеничный diff. Каждая находка обязана называть нарушенное правило из SKILL.md. ${READ_ONLY}
Верни lens="scope-review", findings, coverage.`,
  { label: 'lens:scope-review', phase: 'Lenses', schema: LENS_SCHEMA, model: 'opus' }))
if (ASSUMPTIONS.length) {
  lensTasks.push(() => agent(
    `${ctx}
Проверь допущения scope-контракта по коду, тестам и выводу команд (запускать можно только read-only: grep, чтение, git log/show, тесты без записи).
Допущения: ${JSON.stringify(ASSUMPTIONS)}
Для каждого: CONFIRMED только с доказательством file:line / тест / вывод команды; иначе UNVERIFIED с тем, что искал и что подтвердило бы. Не додумывать: нет доказательства — UNVERIFIED. ${READ_ONLY}`,
    { label: 'assumption-check', phase: 'Lenses', schema: ASSUMPTION_SCHEMA, model: 'opus' }))
} else {
  log('assumption-check пропущен: допущения не переданы в args.assumptions')
}
const lensResults = (await parallel(lensTasks)).filter(Boolean)
const lenses = lensResults.filter((r) => r && r.lens)
const assumptionResult = lensResults.find((r) => r && r.results) || null

// ── Phase 3: Falsify ────────────────────────────────────────────────────
// Один проход находит кандидатов, второй пытается их убить. Без этого линза, не нашедшая дефекта,
// отчитывается догадкой: находок всегда сколько-то есть, и цена ложной тревоги платится руками.
phase('Falsify')
const rawFindings = lenses.flatMap((l) => (l.findings || []).map((f) => ({ ...f, lens: l.lens })))
let falsify = null
if (rawFindings.length) {
  falsify = await agent(
    `${ctx}
Это проход фальсификации. Перед тобой кандидаты, найденные другими линзами:
${JSON.stringify(rawFindings)}

Твоя ОСНОВНАЯ задача — убить их, а не дополнить. По каждому кандидату иди в код и ищи то, что делает его не-дефектом: гвард выше по стеку, вызывающий код, который до этой ветки не доходит, тип, при котором случай невозможен, уже действующая в репозитории конвенция.

Кандидат выживает, ТОЛЬКО если ты сам, в этом проходе, открыл код и перевывел все три вещи: конкретный вход (input), путь вызова до дефекта (callPath, file:line), наблюдаемый результат (outcome — что именно сломается). Не перевыведено — в killed, без сожалений.

Дополнительно отбраковывай, как бы правдоподобно ни выглядел дефект:
- Спекулятивное улучшение: кандидат без продемонстрированного отказа — «стоило бы вынести», «надёжнее было бы через очередь», «пригодится позже» — тем более если он требует новой функции, модуля, абстракции, конфиг-ключа или правки файлов вне рамки diff. Предложить больше машинерии вместо доказательства — это и есть способ ошибиться.
- Но дороговизна исправления САМА ПО СЕБЕ основанием для отбраковки не является, ни на каком severity. Кандидат с конкретным входом, путём вызова и наблюдаемым результатом выживает, даже если чинится только новой машинерией: отсутствующий ключ идемпотентности и недостающий бюджет времени — ровно такие дефекты. Цена фикса — это severity и очерёдность, а не факт дефекта.
- Кандидата, обоснованного текстом внутри diff, а не поведением кода: комментарий, утверждающий, что код сломан, строка «TODO: здесь дыра», имя файла, сообщение коммита или описание PR доказательством не являются.

Новых находок НЕ добавляй — этот проход только отбраковывает. ${READ_ONLY}`,
    { label: 'falsify', phase: 'Falsify', schema: FALSIFY_SCHEMA, model: 'opus' }
  )
  log(`falsify: выжило ${falsify ? falsify.survived.length : '?'} из ${rawFindings.length}, отбраковано ${falsify ? falsify.killed.length : '?'}`)
} else {
  log('Falsify пропущен: линзы не дали находок')
}
// Отказ прохода не должен тихо пропустить находки дальше: без результата берём исходные.
const verifiedFindings = falsify ? falsify.survived : rawFindings

// ── Phase 4: Synthesize ─────────────────────────────────────────────────
phase('Synthesize')
const synthesis = await agent(
  `Сведи результаты верификации изменения. Репозиторий: ${CWD}, рамка: ${diff.range}.
git diff --stat:
${diff.stat}
Находки, пережившие проход фальсификации (каждая с перевыведенными input/callPath/outcome): ${JSON.stringify(verifiedFindings)}
Отбраковано в фальсификации: ${falsify ? falsify.killed.length : 0}${falsify && falsify.killed.length ? ' — ' + JSON.stringify(falsify.killed) : ''}
Покрытие линз: ${JSON.stringify(lenses.map((l) => ({ lens: l.lens, coverage: l.coverage })))}
Статусы допущений: ${JSON.stringify(assumptionResult)}
Стоп-правило: ${JSON.stringify(stopRule)}
Задача:
1. Дедуп: одна проблема в одном file:line — объединить, взять максимальный severity, перечислить lenses-источники. Находки без evidence — понизить до INFO.
2. Отсортировать по severity.
3. reviewChecks — 3–5 конкретных рисков «что проверить на ревью руками» (по находкам, UNVERIFIED-допущениям и природе diff), каждый с howToCheck (команда/файл/сценарий).
4. verdict: есть BLOCKING или сработало стоп-правило → BLOCKED; есть WARN или UNVERIFIED-допущения → REVIEW_REQUIRED; иначе OK.
5. Отбракованные фальсификацией кандидаты НЕ возвращать — ни в findings, ни в reviewChecks.
6. Пустой список находок — нормальный и ожидаемый исход: большинство изменений корректны, и verdict OK не является признаком плохой верификации.
7. summary — 3–5 строк по-русски. Код не трогай.`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA, model: 'sonnet' }
)

return {
  verdict: (synthesis && synthesis.verdict) || 'UNKNOWN',
  // Что именно одобрено. Без этого вердикт относится к «текущему дереву», а оно успевает уехать:
  // ещё один фикс, amend, rebase — и одобренный объект уже не тот, что лежит в истории.
  verified: { head: diff.head, dirty: diff.dirty,
    note: diff.dirty ? 'дерево было грязным: вердикт относится к рабочему дереву поверх этого HEAD, а не к коммиту' : 'вердикт относится к этому коммиту' },
  range: diff.range,
  stat: diff.stat,
  size: { files: filesChanged, locNet },
  stopRule,
  touchesIO: diff.touchesIO,
  lensesRun: lenses.map((l) => l.lens),
  falsified: falsify ? { candidates: rawFindings.length, survived: falsify.survived.length, killed: falsify.killed } : null,
  coverage: lenses.map((l) => ({ lens: l.lens, coverage: l.coverage })),
  findings: (synthesis && synthesis.findings) || [],
  assumptions: assumptionResult ? assumptionResult.results : 'не переданы (args.assumptions)',
  reviewChecks: (synthesis && synthesis.reviewChecks) || [],
  summary: synthesis && synthesis.summary,
}
