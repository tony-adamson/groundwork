export const meta = {
  name: 'build-plan',
  description: 'Реализация утверждённого плана (/planf3) фазами вне главного контекста: implement → verify → fix → gate. Возвращает структурную сводку.',
  whenToUse: 'После READY_FOR_BUILD у плана из /planf3 с 2+ фазами и явными allowlist файлов. Главная сессия оставляет себе только коммиты и финальный отчёт.',
  phases: [
    { title: 'Load', detail: 'sonnet: разобрать план на фазы (id, файлы, зависимости, mechanical, текст раздела), оценку LOC и runtime-предусловия' },
    { title: 'Precheck', detail: 'sonnet: прогнать check-команды предусловий (docker/БД/API/whitelist); неудача = стоп до Build' },
    { title: 'Build', detail: 'implementer per phase: sonnet для mechanical, opus иначе; параллель только при непересекающихся файлах' },
    { title: 'Verify', detail: 'opus read-only верификатор на фазу, md5-пин файлов; до 2 раундов verify→fix' },
    { title: 'Gate', detail: 'sonnet: полный прогон проверок проекта (args.gate)' },
  ],
}

// ── args ─────────────────────────────────────────────────────────────────
// { cwd, plan: 'specs/<plan>.md', gate?: 'cmd && cmd', phases?: [...override...], maxFixRounds?: 2,
//   estimatedLoc?: N, preconditions?: [{ name, check }], locStop?: true }
// phases override (если Load ошибается): [{ id, title, files: [...], dependsOn: [...], mechanical: bool, verify: bool }]
// locStop: false — продолжить после остановки по стоп-правилу ×2 (решение пользователя, не по умолчанию).
let A = args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch (e) { A = { plan: A } } }
A = A || {}
const CWD = A.cwd || '.'
const PLAN = A.plan
if (!PLAN) throw new Error('build-plan: args.plan (путь к плану) обязателен')
const GATE = A.gate || ''
const MAX_FIX_ROUNDS = A.maxFixRounds || 2
const LOC_STOP = A.locStop !== false

const RULES = `Правила (CLAUDE.md): Minimal Sufficient Change, локальные паттерны, никаких новых слоёв/зависимостей.
Не рефакторить несвязанный код. Файлы вне allowlist НЕ ТРОГАТЬ: если без них не обойтись — остановись и верни needsFiles.
Никаких git commit/push/checkout/stash: коммитит главная сессия. Рабочее дерево общее с другими фазами — читай файлы непосредственно перед правкой.`

// ── Schemas ──────────────────────────────────────────────────────────────
const PHASES_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['phases', 'estimatedLoc', 'preconditions'],
  properties: {
    estimatedLoc: { type: ['number', 'null'], description: 'число из строки «Estimated LOC net: ~N» плана; null, если строки нет' },
    preconditions: { type: 'array', description: 'блок «Runtime preconditions» плана; [] если «none» или блока нет',
      items: { type: 'object', additionalProperties: false, required: ['name', 'check'],
        properties: { name: { type: 'string' }, check: { type: 'string', description: 'shell-команда, exit 0 = доступно' } } } },
    phases: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['id', 'title', 'files', 'dependsOn', 'mechanical', 'sectionText'],
      properties: {
        id: { type: 'string' }, title: { type: 'string' },
        files: { type: 'array', items: { type: 'string' }, description: 'allowlist файлов фазы (как в плане)' },
        dependsOn: { type: 'array', items: { type: 'string' }, description: 'id фаз, которые должны быть готовы раньше' },
        mechanical: { type: 'boolean', description: 'true = реализация задана планом дословно (типы, фикстуры, тексты, копирование сигнатур); false = есть решения/гонки/деньги/контракты' },
        verify: { type: 'boolean', description: 'нужен ли отдельный верификатор (по умолчанию true; false для чисто документных фаз)' },
        sectionText: { type: 'string', description: 'дословный текст раздела плана этой фазы, ≤ 6000 символов' },
      } } },
  },
}
const IMPL_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['status', 'changedFiles', 'diffStat', 'summary', 'checksRun', 'needsFiles'],
  properties: {
    status: { type: 'string', enum: ['done', 'blocked', 'partial'] },
    changedFiles: { type: 'array', items: { type: 'string' } },
    diffStat: { type: 'string', description: 'git diff --stat -- <changedFiles>' },
    summary: { type: 'string' },
    checksRun: { type: 'string', description: 'какие targeted-проверки прогнал и результат' },
    needsFiles: { type: 'array', items: { type: 'string' }, description: 'файлы вне allowlist, без которых фаза не закрывается' },
    outOfScopeNotes: { type: 'string', description: 'странное вне задачи — упомянуть, не править' },
  },
}
const FINDING = { type: 'object', additionalProperties: false, required: ['id', 'file', 'line', 'issue', 'evidence'],
  properties: { id: { type: 'string' }, file: { type: 'string' }, line: { type: 'string' }, issue: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' } } }
const VERIFY_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['blocking', 'minor', 'md5Pinned', 'method'],
  properties: {
    blocking: { type: 'array', items: FINDING }, minor: { type: 'array', items: FINDING },
    md5Pinned: { type: 'string', description: 'md5 проверяемых файлов на момент проверки' },
    method: { type: 'string', description: 'как проверял: чтение, probe-тесты на копии, мутации' },
  },
}
const FIX_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['fixed', 'unfixed', 'changedFiles', 'diffStat', 'checksRun'],
  properties: {
    fixed: { type: 'array', items: { type: 'string' } }, unfixed: { type: 'array', items: { type: 'string' } },
    changedFiles: { type: 'array', items: { type: 'string' } }, diffStat: { type: 'string' }, checksRun: { type: 'string' },
  },
}
const GATE_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['passed', 'output'],
  properties: { passed: { type: 'boolean' }, output: { type: 'string', description: 'хвост вывода каждой команды' } },
}
const PRECHECK_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['results'],
  properties: { results: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['name', 'passed', 'output'],
    properties: { name: { type: 'string' }, passed: { type: 'boolean' }, output: { type: 'string', description: 'хвост вывода, ≤ 10 строк' } } } } },
}
const LOC_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['netLoc', 'files', 'diffStat'],
  properties: { netLoc: { type: 'number', description: 'insertions − deletions по tracked + строки untracked файлов' },
    files: { type: 'number', description: 'число изменённых tracked + untracked файлов (без исключённых)' },
    diffStat: { type: 'string', description: 'git diff --stat плюс список untracked с wc -l' } },
}

// ── Load ─────────────────────────────────────────────────────────────────
phase('Load')
let phases = A.phases
if (!phases) {
  const loaded = await agent(
    `Проект: ${CWD}. Прочитай план ${CWD}/${PLAN} целиком.
Разбей его на фазы реализации РОВНО так, как они описаны в плане (id/номер, название, allowlist файлов, зависимости между фазами).
Для каждой фазы верни дословный текст её раздела (sectionText, ≤ 6000 символов, без пересказа) и признак mechanical:
true — реализация задана планом дословно (типы, фикстуры, тексты, копирование сигнатур, правки md);
false — есть выбор решения, состояние/гонки, деньги, публичные контракты, миграции.
verify=false только для документных фаз. Ничего не выдумывай: если allowlist в плане не указан — files=[] и это будет остановкой.
Отдельно верни estimatedLoc — число из строки «Estimated LOC net: ~N» (null, если её нет) — и preconditions — записи блока
«Runtime preconditions» (name + check-команда; [] если блока нет или там «none»). Команды не выполняй.`,
    { label: 'load-plan', phase: 'Load', schema: PHASES_SCHEMA, model: 'sonnet' })
  phases = (loaded && loaded.phases) || []
  if (A.estimatedLoc == null && loaded && loaded.estimatedLoc != null) A.estimatedLoc = loaded.estimatedLoc
  if (!A.preconditions && loaded && loaded.preconditions) A.preconditions = loaded.preconditions
}
const ESTIMATED_LOC = Number(A.estimatedLoc) > 0 ? Number(A.estimatedLoc) : null
const PRECONDITIONS = Array.isArray(A.preconditions) ? A.preconditions : []
if (!phases.length) throw new Error('build-plan: в плане не найдено фаз')
const noFiles = phases.filter(p => !p.files || !p.files.length)
if (noFiles.length) {
  // Финальная фаза «полный gate» в планах /planf3 не имеет allowlist: её выполняет шаг Gate из args.gate.
  const last = phases[phases.length - 1]
  const gateOnly = noFiles.length === 1 && noFiles[0].id === last.id && !!GATE
  if (!gateOnly) throw new Error(`build-plan: у фаз ${noFiles.map(p => p.id).join(', ')} нет allowlist файлов — доработай план`)
  log(`Фаза ${last.id} без allowlist — это полный gate, выполняется шагом Gate (args.gate)`)
  phases = phases.filter(p => p.files && p.files.length)
}
log(`Фаз: ${phases.length} (${phases.map(p => `${p.id}${p.mechanical ? '·s' : '·o'}`).join(' ')}); оценка LOC: ${ESTIMATED_LOC == null ? 'нет — стоп-правило ×2 не действует' : '~' + ESTIMATED_LOC}`)

// ── Precheck: runtime-предусловия плана до первой правки ──────────────────
// 2026-09-10: гейт фазы требовал живой docker daemon, его никто не запускал,
// workflow дошёл до конца и спрятал факт в findings. Теперь стоп до Build.
phase('Precheck')
let precheck = null
if (PRECONDITIONS.length) {
  precheck = await agent(
    `Проект: ${CWD}. Прогони через Bash каждую check-команду с лимитом 60 с: \`perl -e 'alarm 60; exec @ARGV' sh -c '<check>'\` (perl есть и на macOS, timeout — нет) и верни результат. Ничего не чинить и не устанавливать.
Предусловия: ${JSON.stringify(PRECONDITIONS)}
passed = команда завершилась с exit 0 (таймаут = не прошла).`,
    { label: 'precheck', phase: 'Precheck', schema: PRECHECK_SCHEMA, model: 'sonnet', effort: 'low' })
  const failed = ((precheck && precheck.results) || []).filter(r => !r.passed)
  if (!precheck || failed.length) {
    const names = failed.map(r => r.name).join(', ') || 'precheck не вернул результат'
    log(`Остановка до Build: не выполнены предусловия — ${names}`)
    return { status: 'blocked-precondition', plan: PLAN, estimatedLoc: ESTIMATED_LOC, precheck, locStop: null, phases: [], unbuilt: phases.map(p => p.id), gate: null,
      next: `главная сессия: показать пользователю, что недоступно (${names}), дождаться решения, перезапустить build-plan` }
  }
} else {
  log('Предусловий в плане нет — Precheck пропущен')
}

// Стоп-правило ×2 (CLAUDE.md) между волнами: дерево общее, поэтому считает
// cheap-агент по git, а не сумма diffStat фаз (они пересекаются по файлам).
async function netLocSoFar(afterWave) {
  return agent(
    `Проект: ${CWD}. Через Bash посчитай размер незакоммиченных правок рабочего дерева и верни netLoc + diffStat:
git diff --numstat (tracked: insertions − deletions) плюс wc -l каждого файла из git ls-files --others --exclude-standard
(untracked считаются целиком); files = число таких файлов. Не считать lock-файлы (*.lock, package-lock.json, uv.lock, Cargo.lock), бинарные файлы и артефакты сборки (__pycache__, node_modules, .venv, dist, build, *.pyc). Ничего не менять.`,
    { label: `loc-check:${afterWave}`, phase: 'Build', schema: LOC_SCHEMA, model: 'sonnet', effort: 'low' })
}
let locStop = null
const PLANNED_FILES = new Set(phases.flatMap(p => p.files || [])).size
// Дерево может быть грязным до старта (агентам коммитить запрещено): снимаем baseline и считаем прирост.
let baseline = null
if (ESTIMATED_LOC != null && LOC_STOP) {
  baseline = await netLocSoFar('baseline')
  if (!baseline) log('loc-check baseline не получен — стоп-правило ×2 считает всё дерево')
  else if (baseline.netLoc || baseline.files) log(`Дерево грязное до старта: ${baseline.netLoc} строк / ${baseline.files} файлов не считаются в бюджет`)
}

// ── Build/Verify: волны по зависимостям, параллель только при непересекающихся файлах ──
const done = new Map()   // id -> { impl, verify, fixes }
const results = []
const overlap = (a, b) => a.files.some(f => b.files.includes(f))

async function runPhase(p) {
  const impl = await agent(
    `Проект: ${CWD}. План: ${CWD}/${PLAN}. Реализуй фазу ${p.id} «${p.title}».
Раздел плана (дословно):
---
${p.sectionText}
---
Allowlist файлов: ${JSON.stringify(p.files)}.
${RULES}
После правок прогони targeted-проверки проекта для затронутых файлов (тесты/линт/typecheck по типу проекта) и верни результат.`,
    { label: `impl:${p.id}`, phase: 'Build', schema: IMPL_SCHEMA, model: p.mechanical ? 'sonnet' : 'opus' })
  const rec = { id: p.id, title: p.title, impl, verify: null, fixes: [] }
  if (!impl || impl.status === 'blocked' || (impl.needsFiles && impl.needsFiles.length)) {
    log(`${p.id}: blocked${impl && impl.needsFiles && impl.needsFiles.length ? ' — нужны файлы ' + impl.needsFiles.join(', ') : ''}`)
    return rec
  }
  if (p.verify === false) return rec

  for (let round = 0; round <= MAX_FIX_ROUNDS; round++) {
    const v = await agent(
      `READ-ONLY верификация (ничего не править, файлов в рабочем дереве не создавать; probe-тесты — только на копии в scratchpad).
Проект: ${CWD}. План: ${CWD}/${PLAN}, фаза ${p.id} «${p.title}». Раздел плана:
---
${p.sectionText}
---
Реализатор отчитался: ${JSON.stringify(impl.summary)}; изменённые файлы: ${JSON.stringify(impl.changedFiles)}.
Сначала зафиксируй md5 изменённых файлов (дерево общее, могут меняться параллельно) и проверяй именно этот срез.
Опровергни утверждение «фаза реализована по плану без дефектов»: гонки, граничные случаи, деньги/валюты, контракты, тесты, которые зелёные по неверной причине.
BLOCKING — нарушено требование плана или ломает поведение; MINOR — остальное. Каждая находка с file:line и доказательством.`,
      { label: `verify:${p.id}${round ? '#' + (round + 1) : ''}`, phase: 'Verify', schema: VERIFY_SCHEMA, model: 'opus' })
    rec.verify = v
    if (!v || !v.blocking.length || round === MAX_FIX_ROUNDS) break
    const fix = await agent(
      `Проект: ${CWD}. План: ${CWD}/${PLAN}, фаза ${p.id}. Закрой BLOCKING-находки верификатора:
${JSON.stringify(v.blocking, null, 1)}
Allowlist файлов: ${JSON.stringify(p.files)} (плюс тестовые файлы из changedFiles: ${JSON.stringify(impl.changedFiles)}).
${RULES}
Порядок: сначала тест, воспроизводящий дефект (падает), затем фикс (проходит). Прогони targeted-проверки.`,
      { label: `fix:${p.id}#${round + 1}`, phase: 'Verify', schema: FIX_SCHEMA, model: 'opus' })
    rec.fixes.push(fix)
    if (!fix || fix.unfixed.length) break
  }
  return rec
}

phase('Build')
let pending = phases.slice()
while (pending.length) {
  const ready = pending.filter(p => (p.dependsOn || []).every(d => done.has(d)))
  if (!ready.length) throw new Error(`build-plan: цикл/неизвестная зависимость у фаз ${pending.map(p => p.id).join(', ')}`)
  // Внутри волны — параллель только для фаз без общих файлов; остальные — последовательно.
  const wave = []
  for (const p of ready) { if (!wave.some(w => overlap(w, p))) wave.push(p) }
  log(`Волна: ${wave.map(p => p.id).join(' + ')}`)
  const recs = wave.length === 1
    ? [await runPhase(wave[0])]
    : (await parallel(wave.map(p => () => runPhase(p)))).filter(Boolean)
  recs.forEach(r => { done.set(r.id, r); results.push(r) })
  pending = pending.filter(p => !done.has(p.id))
  const blocked = recs.filter(r => !r.impl || r.impl.status !== 'done')
  if (blocked.length) { log(`Остановка: фазы ${blocked.map(r => r.id).join(', ')} не закрыты`); break }
  if (ESTIMATED_LOC != null && LOC_STOP) {
    const loc = await netLocSoFar(wave.map(p => p.id).join('+'))
    if (!loc) { log(`loc-check после ${wave.map(p => p.id).join('+')} не получен — стоп-правило ×2 на этой волне не проверено`); continue }
    const netLoc = loc.netLoc - (baseline ? baseline.netLoc : 0)
    const files = loc.files - (baseline ? baseline.files : 0)
    const overLoc = netLoc > 2 * ESTIMATED_LOC
    const overFiles = PLANNED_FILES > 0 && files > 2 * PLANNED_FILES
    if (overLoc || overFiles) {
      locStop = { netLoc, estimatedLoc: ESTIMATED_LOC, files, plannedFiles: PLANNED_FILES, diffStat: loc.diffStat, afterPhases: results.map(r => r.id) }
      log(`Стоп-правило ×2: ${netLoc} строк net при оценке ~${ESTIMATED_LOC}, ${files} файлов при плане ${PLANNED_FILES} после фаз ${locStop.afterPhases.join(', ')}; ${pending.length ? 'остаток ' + pending.map(p => p.id).join(', ') + ' не строится' : 'Gate не запускается'}`)
      break
    }
    log(`После ${wave.map(p => p.id).join('+')}: ${netLoc} строк net (оценка ~${ESTIMATED_LOC}), ${files} файлов (план ${PLANNED_FILES})`)
  }
}

// ── Gate ─────────────────────────────────────────────────────────────────
phase('Gate')
let gate = null
if (GATE && results.length && results.every(r => r.impl && r.impl.status === 'done')) {
  gate = await agent(
    `Проект: ${CWD}. Прогони через Bash полный набор проверок: ${GATE}
Ничего не править. Верни passed и хвост вывода каждой команды (≤ 40 строк на команду).`,
    { label: 'gate', phase: 'Gate', schema: GATE_SCHEMA, model: 'sonnet' })
}

const unbuilt = phases.filter(p => !done.has(p.id)).map(p => p.id)
return {
  status: locStop ? 'stopped-loc-x2' : (unbuilt.length ? 'partial' : (gate && !gate.passed ? 'gate-failed' : 'built')),
  plan: PLAN,
  estimatedLoc: ESTIMATED_LOC,
  precheck,
  locStop,
  phases: results.map(r => ({
    id: r.id, title: r.title,
    status: r.impl ? r.impl.status : 'failed',
    changedFiles: r.impl ? r.impl.changedFiles : [],
    diffStat: r.impl ? r.impl.diffStat : '',
    needsFiles: r.impl ? r.impl.needsFiles : [],
    blockingLeft: r.verify ? r.verify.blocking.length : null,
    minor: r.verify ? r.verify.minor : [],
    fixRounds: r.fixes.length,
    outOfScopeNotes: r.impl ? (r.impl.outOfScopeNotes || '') : '',
  })),
  unbuilt,
  gate,
  next: locStop
    ? 'главная сессия: показать пользователю diffStat и причину превышения ×2, ждать решения; продолжить — build-plan с args.locStop=false'
    : 'главная сессия: git diff --stat, коммиты по фазам, финальный отчёт, /verify, /code-review',
}
