function setupBaluKids() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── 1. Children ──────────────────────────────────────────────
  let sh = getOrCreate(ss, 'Children');
  sh.clearContents();

  const childHeaders = [
    'First name', 'Last name', 'Birthday', 'Age',
    'Group', 'Contract type', 'Start date',
    'Meals included', 'Nap time', 'After school',
    'Deposit', 'Clubs', 'Club payment type',
    'Allergies / notes',
    'Paracetamol', 'Using Photos for Media',
    'Parent name (1)', 'Parent contact (1)',
    'Parent name (2)', 'Parent contact (2)',
    'Address', 'Adaptation'
  ];
  setHeaders(sh, childHeaders);

  // Dropdowns
  setDropdown(sh, 'E', 2, 100, ['Toddler', 'Middle', 'Big', 'Primary School']);
  setDropdown(sh, 'F', 2, 100, ['Long term', 'Tourist']);
  setDropdown(sh, 'H', 2, 100, ['Yes', 'No', 'Halal']);
  setDropdown(sh, 'I', 2, 100, ['Yes', 'No']);
  setDropdown(sh, 'J', 2, 100, ['Yes', 'No']);
  setDropdown(sh, 'M', 2, 100, ['Single', 'Subscription']);
  setDropdown(sh, 'O', 2, 100, ['Yes', 'No']);
  setDropdown(sh, 'P', 2, 100, ['Yes', 'No']);
  setDropdown(sh, 'V', 2, 100, ['Yes', 'No']);

  // NB: эта функция делает sh.clearContents() — НЕ запускать на живой таблице
  // Ольги повторно, иначе сотрутся её данные. Актуальна только как референс схемы.

  // Age formula
  for (let r = 2; r <= 100; r++) {
    sh.getRange(r, 4).setFormula(
      `=IF(C${r}<>"", DATEDIF(C${r}, TODAY(), "Y"), "")`
    );
  }

  // ── 2. Attendance ─────────────────────────────────────────────
  sh = getOrCreate(ss, 'Attendance');
  sh.clearContents();
  setHeaders(sh, ['Date', 'Child', 'Group', 'Status', 'Notes']);
  setDropdown(sh, 'D', 2, 500, ['Present', 'Absent', 'Sick', 'Late']);

  // ── 3. Payments ───────────────────────────────────────────────
  sh = getOrCreate(ss, 'Payments');
  sh.clearContents();
  setHeaders(sh, [
    'Month', 'Child', 'Group',
    'Amount', 'Paid', 'Payment date',
    'Club amount', 'Club paid', 'Club payment date',
    'Notes'
  ]);
  setDropdown(sh, 'E', 2, 200, ['Yes', 'No']);
  setDropdown(sh, 'H', 2, 200, ['Yes', 'No']);

  // ── 4. Meetings ───────────────────────────────────────────────
  sh = getOrCreate(ss, 'Meetings');
  sh.clearContents();
  setHeaders(sh, ['Date', 'Time', 'Child', 'Format', 'Attended', 'Notes']);
  setDropdown(sh, 'D', 2, 200, ['Online', 'Offline']);
  setDropdown(sh, 'E', 2, 200, ['Yes', 'No']);

  // Удаляем стандартный Sheet1 если есть
  const def = ss.getSheetByName('Sheet1') || ss.getSheetByName('Лист1');
  if (def) ss.deleteSheet(def);

  SpreadsheetApp.getUi().alert('✅ Balu Kids table ready!');
}

// ── helpers ───────────────────────────────────────────────────

function getOrCreate(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function setHeaders(sh, headers) {
  const range = sh.getRange(1, 1, 1, headers.length);
  range.setValues([headers]);
  range.setFontWeight('bold');
  range.setBackground('#3E2510');
  range.setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}

function setDropdown(sh, col, rowStart, rowEnd, values) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .build();
  sh.getRange(`${col}${rowStart}:${col}${rowEnd}`).setDataValidation(rule);
}
