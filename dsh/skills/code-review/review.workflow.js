// code-review: ревью diff на намерение и дефекты.
// Модель ревью закреплена явно: сабагенты наследуют модель сессии, а ревью на быстрой модели
// не ловит то, ради чего запускается. provider не задан — берётся провайдер сессии.
const A = args || {}
const CWD = String(A.cwd || '.')
const RANGE = String(A.range || '').trim()
const SCOPE = String(A.scope || '').trim()
const MODEL = 'deepseek-v4-pro'
const READ_ONLY = 'READ-ONLY: файлы не править, не коммитить, новых файлов не создавать. Только чтение и git без записи.'

const FINDING = {
  type: 'object', additionalProperties: false,
  required: ['file', 'line', 'severity', 'issue', 'evidence'],
  properties: {
    file: { type: 'string' },
    line: { type: 'string' },
    severity: { type: 'string', enum: ['BLOCKING', 'WARN', 'INFO'] },
    issue: { type: 'string', description: 'что не так, одной фразой' },
    evidence: { type: 'string', description: 'дословная цитата строк с file:line — без неё находка не считается' },
  },
}
const LENS = {
  type: 'object', additionalProperties: false,
  required: ['lens', 'findings', 'coverage'],
  properties: {
    lens: { type: 'string' },
    findings: { type: 'array', items: FINDING },
    coverage: { type: 'string', description: 'что проверено и чем; что проверить не удалось' },
  },
}
const INTAKE = {
  type: 'object', additionalProperties: false,
  required: ['hasChanges', 'repo', 'range', 'stat', 'files'],
  properties: {
    hasChanges: { type: 'boolean' },
    repo: { type: 'string', description: 'git rev-parse --show-toplevel дословно' },
    range: { type: 'string', description: 'фактически использованная рамка' },
    stat: { type: 'string', description: 'git diff --stat дословно' },
    files: { type: 'array', items: { type: 'string' } },
  },
}
const FALSIFY = {
  type: 'object', additionalProperties: false,
  required: ['survived', 'killed'],
  properties: {
    survived: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['n', 'file', 'line', 'severity', 'issue', 'evidence', 'path'],
      properties: { n: { type: 'integer', description: 'поле n входной находки' },
        file: { type: 'string' }, line: { type: 'string' },
        severity: { type: 'string', enum: ['BLOCKING', 'WARN', 'INFO'] },
        issue: { type: 'string' },
        evidence: { type: 'string', description: 'дословная цитата строк с file:line' },
        path: { type: 'string', description: 'путь до дефекта: вход → вызовы → строка' } } } },
    killed: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['n', 'issue', 'why'],
      properties: { n: { type: 'integer', description: 'поле n входной находки' }, issue: { type: 'string' }, why: { type: 'string', description: 'почему находка неверна, с file:line' } } } },
  },
}

phase('Intake')
const intake = await agent(
  `Репозиторий: ${CWD}. Собери рамку изменений. ${RANGE
    ? `Рамка задана: git -C ${CWD} diff --stat ${RANGE} и git -C ${CWD} diff ${RANGE}.`
    : `Рамка не задана: если git -C ${CWD} status --porcelain непуст — только незакоммиченное (git diff HEAD плюс untracked из строк '??'), коммиты ветки не включай; если дерево чистое — HEAD против merge-base с веткой из git symbolic-ref refs/remotes/origin/HEAD, а если её нет — с origin/dev или origin/main (что существует). В range запиши, с какой веткой сравнивал.`}
Нужны: repo (git rev-parse --show-toplevel дословно), range (что реально использовал), stat (git diff --stat дословно), files (пути), hasChanges. ${READ_ONLY}`,
  { label: 'intake', phase: 'Intake', schema: INTAKE, model: 'deepseek-flash' }
)
if (!intake) return { verdict: 'FAILED', note: 'сбор рамки не удался' }
if (!intake.hasChanges) return { verdict: 'EMPTY', range: intake.range, note: `изменений нет в ${intake.repo}` }

const frame = `Репозиторий: ${intake.repo}. Рамка: ${intake.range}.
git diff --stat:
${intake.stat}
Файлы: ${(intake.files || []).join(', ')}
Задача (scope-контракт; единственный источник требований):
${SCOPE || '(не передан — намерение выводи из diff, находку «нет требования» ставь не выше WARN)'}`

phase('Lenses')
const LENSES = [
  ['bugs', `Линза «баги». Ищи дефекты, которые сломают поведение: неверные условия и границы, null/undefined, гонки, утечки, проглоченные ошибки и отсутствующие таймауты, неверный порядок операций, молчаливое изменение контракта. Перевыведи каждый дефект по коду: конкретный вход → путь вызова → неверный результат. Нет входа — не находка.`],
  ['intent', `Линза «намерение». Делает ли код ровно то, что просили: каждое обещанное поведение реализовано, ничего из non-goals не добавлено, публичные контракты не изменены молча. Каждая находка ссылается на пункт задачи или на изменённый контракт.`],
  ['tests', `Линза «тесты». Доказывают ли тесты из diff обещанное поведение: проверяют требование, а не реализацию; упадут при поломке; покрывают края из задачи. Тестов нет, а diff меняет поведение кода — WARN с указанием шва, который должен быть покрыт. Diff без изменения поведения (документация, конфиг, комментарии) — не находка, отметь в coverage.`],
]
const lensRuns = await parallel(LENSES.map(([name, brief]) => () =>
  agent(`${frame}\n${brief}\nСмотри только diff и его blast radius, не весь репозиторий. ${READ_ONLY}`,
    { label: `lens:${name}`, phase: 'Lenses', schema: LENS, model: MODEL })
))
// Упавшая линза — null в слоте: молча выкинутая, она давала APPROVE без единой проверки.
const lensResults = lensRuns.filter(Boolean)
const failedLenses = LENSES.filter((_, i) => !lensRuns[i]).map(([name]) => name)

const candidates = []
for (const r of lensResults) for (const f of r.findings || []) candidates.push({ ...f, lens: r.lens })
const coverage = [
  ...lensResults.map(r => `${r.lens}: ${r.coverage}`),
  ...failedLenses.map(name => `${name}: линза не отработала, diff ею не проверен`),
].join('\n')

phase('Falsify')
// Опровергается не больше 12 находок, самые тяжёлые первыми; INFO и остаток не теряются, а идут со статусом UNVERIFIED.
const FALSIFY_CAP = 12
const rank = { BLOCKING: 0, WARN: 1, INFO: 2 }
const bySeverity = (a, b) => (rank[a.severity] ?? 3) - (rank[b.severity] ?? 3)
const strongAll = candidates.filter(f => f.severity !== 'INFO').sort(bySeverity)
const strong = strongAll.slice(0, FALSIFY_CAP).map((f, n) => ({ n, ...f }))
const unverified = [...strongAll.slice(FALSIFY_CAP), ...candidates.filter(f => f.severity === 'INFO')]
  .map(f => ({ ...f, status: 'UNVERIFIED' }))
let confirmed = []
let killed = []
let falsifyFailed = false
let lost = 0
if (strong.length) {
  const falsified = await agent(
    `Ты опровергаешь находки ревью. Для каждой перевыведи по коду в ${CWD} конкретный вход, путь вызова и наблюдаемо неверный результат. Не смог — находка убита (killed, с причиной и file:line). Смог — survived, с путём до дефекта и дословной цитатой строк в evidence. В каждом элементе ответа — поле n входной находки; каждая находка — ровно в одном из списков. Новых находок не добавлять. ${READ_ONLY}
Находки: ${JSON.stringify(strong)}`,
    { label: 'falsify', phase: 'Falsify', schema: FALSIFY, model: MODEL }
  )
  if (falsified) {
    // Сверка по n: выживший без входной находки — выдумка опровергателя, входная без ответа — не проверена.
    const answered = new Set()
    confirmed = (falsified.survived || []).filter(f => strong[f.n] && !answered.has(f.n) && answered.add(f.n))
      .map(f => ({ ...f, lens: strong[f.n].lens, status: 'CONFIRMED' }))
    killed = (falsified.killed || []).filter(k => strong[k.n] && !answered.has(k.n) && answered.add(k.n))
    const missing = strong.filter(f => !answered.has(f.n))
    lost = missing.length
    unverified.unshift(...missing.map(f => ({ ...f, status: 'UNVERIFIED' })))
  } else {
    // Упавшее опровержение не подтверждает находки: они остаются, но как непроверенные.
    falsifyFailed = true
    unverified.unshift(...strong.map(f => ({ ...f, status: 'UNVERIFIED' })))
  }
}

phase('Synthesize')
// Дубли — по файлу и первому числу строки («42» и «42-45» — одна строка); вторая находка дописывается в issue, а не пропадает.
const byKey = new Map()
for (const f of [...confirmed, ...unverified].sort(bySeverity)) {
  const key = `${f.file}:${(String(f.line).match(/\d+/) || [f.line])[0]}`
  const cur = byKey.get(key)
  if (!cur) byKey.set(key, { ...f })
  else if (!cur.issue.includes(f.issue)) cur.issue += ` | ${f.issue}`
}
const findings = [...byKey.values()].map(({ n, ...f }, i) => ({ code: `НАХОДКА-${i + 1}`, ...f }))

const blocking = findings.filter(f => f.severity === 'BLOCKING').length
const warns = findings.filter(f => f.severity === 'WARN').length
const incomplete = failedLenses.length > 0 || falsifyFailed
const verdict = blocking ? 'CHANGES_REQUESTED' : incomplete ? 'INCOMPLETE' : warns ? 'APPROVE_WITH_NOTES' : 'APPROVE'
log(`${verdict}: находок ${findings.length}, убито ${killed.length}, линз упало ${failedLenses.length}${falsifyFailed ? ', опровержение упало' : ''}`)
return {
  verdict,
  range: intake.range,
  stat: intake.stat,
  lenses: lensResults.map(r => r.lens),
  failedLenses,
  falsifyFailed,
  lost,
  findings,
  killed,
  coverage,
}
