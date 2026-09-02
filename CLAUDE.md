# Обучение — запись участников

Сайт, где коллеги записываются на обучение: указывают ФИО и отдел.
Вкладки: Запись / Участники (сгруппированы по отделам) / Программа / Материалы.

## Подключения

- **Google-таблица**: ID `1LZOXlwmEaJHBQ8HE59LWpmlgkWGcvRVxvoyIti6BKrg`
  (владелец kuzkin@acons.group).
  - Лист отделов: заголовок A1 = «Подразделение», отделы в колонке A ниже.
  - Лист участников: заголовки «ФИО» и «Отдел» в первой строке.
  - Код находит листы **по заголовкам**, а не по именам — переименование листов не ломает сайт,
    но заголовки первой строки менять нельзя.
- **GAS-скрипт** (standalone, аккаунт kuzkin@acons.group):
  `1BkbaGdCn8l-Aqy7jQrEc-d-jSuWZAq8EVL3HJpx8AtEhiFgHvPS5YtaR`
- **Deployment ID** (не создавать новый, только обновлять!):
  `AKfycbx4OoQXUlWmbVgfQbYkDM_S5YTFRuUuYOKbC03dajF33mIL9QsOCFaLY_GL3cYsTl--`
- **Фронт**: GitHub Pages, репозиторий `Nick3000ept/training-signup`,
  прод-URL https://nick3000ept.github.io/training-signup/

## API

- `GET ?action=ping` → `{ok:true, pong:true}`
- `GET ?action=load` → `{ok, departments:[], participants:[{fio,dept}]}`
- `POST` (text/plain, JSON `{action:'save', fio, dept}`) → добавляет строку [ФИО, Отдел]
  на лист участников; проверяет отдел по списку, дубликаты (ФИО+отдел без учёта регистра),
  экранирует ввод (`safeCell_`).

## Правила безопасности

- Запись — **только добавление строк** на лист участников, колонки A–B. Лист отделов read-only.
- Строки и листы не удалять.
- Разрешённые файлы: `index.html`, `script.gs`, `appsscript.json`, `CLAUDE.md`,
  `.gitignore`, `.claspignore`.

## Деплой

1. Бэк: `clasp push --force` → `clasp update-deployment <deploymentId> --description "vN: ..."`
   (`.claspignore` пускает в облако только `script.gs` и `appsscript.json`).
2. Фронт: `git push` → GitHub Pages публикует сам (~1 мин, Ctrl+F5).

## Нюансы

- Скрипту нужна была разовая авторизация владельца в редакторе GAS (функция `authorize`) —
  выполнена при создании проекта.
- Программа обучения — заглушка «будет добавлена позже», ждём текст от пользователя.
- Материалы: ссылка на видео Александра Орлова у Комаровского (Яндекс.Диск).
