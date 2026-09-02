/**
 * Бэкенд сайта записи на обучение.
 * Таблица: https://docs.google.com/spreadsheets/d/1LZOXlwmEaJHBQ8HE59LWpmlgkWGcvRVxvoyIti6BKrg
 * Листы находятся по заголовкам (устойчиво к переименованию):
 *  - лист отделов: A1 = "Подразделение", отделы в колонке A ниже;
 *  - лист участников: первая строка содержит "ФИО" и "Отдел".
 * Запись — только добавление строк [ФИО, Отдел] на лист участников.
 */

const SHEET_ID = '1LZOXlwmEaJHBQ8HE59LWpmlgkWGcvRVxvoyIti6BKrg';

function resolveSheets_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let deptSheet = null;
  let partSheet = null;
  ss.getSheets().forEach(function (sh) {
    const lastCol = Math.max(1, Math.min(sh.getLastColumn(), 10));
    const header = sh.getRange(1, 1, 1, lastCol).getValues()[0]
      .map(function (v) { return String(v).trim().toLowerCase(); });
    if (!deptSheet && header[0] === 'подразделение') deptSheet = sh;
    if (!partSheet && header.indexOf('фио') !== -1 && header.indexOf('отдел') !== -1) partSheet = sh;
  });
  if (!deptSheet) throw new Error('Не найден лист с заголовком "Подразделение"');
  if (!partSheet) throw new Error('Не найден лист участников (заголовки "ФИО" и "Отдел")');
  return { deptSheet: deptSheet, partSheet: partSheet };
}

function getDepartments_(deptSheet) {
  const lastRow = deptSheet.getLastRow();
  if (lastRow < 2) return [];
  return deptSheet.getRange(2, 1, lastRow - 1, 1).getValues()
    .map(function (r) { return String(r[0]).trim(); })
    .filter(function (v) { return v !== ''; });
}

function getParticipants_(partSheet) {
  const lastRow = partSheet.getLastRow();
  if (lastRow < 2) return [];
  const header = partSheet.getRange(1, 1, 1, partSheet.getLastColumn()).getValues()[0]
    .map(function (v) { return String(v).trim().toLowerCase(); });
  const fioCol = header.indexOf('фио') + 1;
  const deptCol = header.indexOf('отдел') + 1;
  const rows = partSheet.getRange(2, 1, lastRow - 1, Math.max(fioCol, deptCol)).getValues();
  return rows
    .map(function (r) {
      return { fio: String(r[fioCol - 1]).trim(), dept: String(r[deptCol - 1]).trim() };
    })
    .filter(function (p) { return p.fio !== ''; });
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  try {
    if (action === 'load') {
      const sheets = resolveSheets_();
      return json_({
        ok: true,
        departments: getDepartments_(sheets.deptSheet),
        participants: getParticipants_(sheets.partSheet)
      });
    }
    return json_({ ok: true, pong: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action !== 'save') return json_({ ok: false, error: 'Неизвестное действие' });

    const fio = safeCell_(data.fio);
    const dept = safeCell_(data.dept);
    if (!fio || fio.length < 3) return json_({ ok: false, error: 'Укажите ФИО' });
    if (fio.length > 100) return json_({ ok: false, error: 'Слишком длинное ФИО' });
    if (!dept) return json_({ ok: false, error: 'Выберите отдел' });

    const sheets = resolveSheets_();
    const departments = getDepartments_(sheets.deptSheet);
    if (departments.indexOf(dept) === -1) {
      return json_({ ok: false, error: 'Такого отдела нет в списке' });
    }

    const existing = getParticipants_(sheets.partSheet);
    const dupe = existing.some(function (p) {
      return p.fio.toLowerCase() === fio.toLowerCase() && p.dept === dept;
    });
    if (dupe) return json_({ ok: false, error: 'Вы уже записаны (' + fio + ', ' + dept + ')' });

    sheets.partSheet.appendRow([fio, dept]);
    return json_({ ok: true, participants: getParticipants_(sheets.partSheet) });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

/** Экранирование пользовательского ввода перед записью в ячейку. */
function safeCell_(v) {
  let s = String(v == null ? '' : v).trim().slice(0, 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

/** Запустить один раз в редакторе для выдачи прав скрипту. */
function authorize() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Logger.log('OK, листы: ' + ss.getSheets().map(function (s) { return s.getName(); }).join(', '));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
