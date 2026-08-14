# Balu Kids — frontend

Client: Ольга, детский центр на Бали. React 18 (CDN) + Babel Standalone, **один файл** `index.html` (~7500+ строк), без сборки, без npm-зависимостей.

## Структура файла

- 6 блоков `<script type="text/babel">` подряд, все в общей глобальной области видимости.
- Функции/константы, объявленные в ПОЗДНЕМ блоке, спокойно вызываются из компонентов, объявленных в РАННЕМ блоке — React рендерит только после того, как отработают все 6 блоков. Порядок объявления в файле не важен для этого (обычный JS function-hoisting + отложенный рендер).
- Не дробить файл на модули/сборку без явной просьбы пользователя — текущий формат осознанный выбор (GitHub Pages / статика без build step).

## Проверка перед коммитом (нет локального тулчейна)

npm/babel не установлены локально. Проверять так:
```bash
python3 - <<'EOF'
import re
html = open('index.html', encoding='utf-8').read()
for i, b in enumerate(re.findall(r'<script type="text/babel">(.*?)</script>', html, re.S)):
    open(f'/tmp/block{i}.jsx', 'w', encoding='utf-8').write(b)
EOF
npx --yes esbuild /tmp/block0.jsx --jsx=transform --outfile=/dev/null   # повторить для каждого блока
```
Это ловит синтаксис. Для undefined-переменных — `npx eslint@8` с `--rule '{"no-undef":"error"}'`, но `DATA`/`activeKids`/`t`/`React` и т.п. (глобалы через `window.X = ...`) будут ложно помечены — это ожидаемо, не баг.

## Общие паттерны

- `Portal` (ReactDOM.createPortal) — все `position:fixed` оверлеи/шиты монтируются в `document.body`, обход бага iOS Safari.
- `activeKids()`, `normDate()`, `todayStr()`, `L(ru,en)` / `Lo(obj)` — общие хелперы, объявлены один раз, переиспользовать, не дублировать.
- Роли: `window.__isDirector` / `__isManager` / `__isTeacher` / `__isStaff`, `window.__teacherName`, `window.__staffModuleAccess` (= director || manager, доступ к модулю Персонал).
- Календарные сетки месяца — использовать `monthCalendarCells(yr, mo, daysInMonth)` (Monday-first с выравниванием по дню недели), не писать `Array.from({length: daysInMonth})` напрямую — так неделя не выравнивается и Сб/Вс не оказываются в правых колонках.

## Деплой

Coolify, автодеплой по push **сломан** — деплоить вручную:
```bash
ssh root@95.179.188.141 "docker exec coolify php artisan tinker --execute=\"
\\\$app = App\Models\Application::where('uuid', 'p7oykpw2d6pu690ov0dvxzbm')->first();
\\\$deployment_uuid = new Visus\Cuid2\Cuid2();
queue_application_deployment(application: \\\$app, deployment_uuid: \\\$deployment_uuid, force_rebuild: false, no_questions_asked: true);
echo \\\$deployment_uuid;
\""
```
Затем поллить статус через `ApplicationDeploymentQueue::where('deployment_uuid', '...')->first()->status` до `finished`, и обязательно проверять живой прод (`curl` + grep на новый код), не доверять только "success" от Coolify.

**Всегда спрашивать явное подтверждение перед commit/push/deploy** — не делать по умолчанию сразу после правки.

## Прод

- Фронтенд (запасной, через Coolify): `https://p7oykpw2d6pu690ov0dvxzbm.95.179.188.141.sslip.io/`
- Бэкенд: `https://rmxois1uv0a24xrbi2dfcfac.95.179.188.141.sslip.io`
- Сервер: `root@95.179.188.141`
