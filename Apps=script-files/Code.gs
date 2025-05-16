//**
 * PurePlays Formatter Suite: Clean layout, toggle formatting, smart utilities.
 * Includes: Font cleanup, frozen headers, auto alignment, row striping, trimming, and deduping tools.
 */

function applySheetFormatting() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  // Font + layout
  range.setFontFamily("Roboto")
       .setFontSize(12)
       .setWrap(false)
       .setVerticalAlignment("middle")
       .setFontWeight("normal");

  // Freeze header + first column
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);

  // Set consistent row height
  for (let row = 1; row <= lastRow; row++) {
    sheet.setRowHeight(row, 26);
  }

  // Style header
  const header = sheet.getRange(1, 1, 1, lastCol);
  header.setFontWeight("bold")
        .setHorizontalAlignment("center")
        .setBorder(true, true, true, true, true, true)
        .setBackground("#f2f2f2");

  // Add filter only if missing
  if (!sheet.getFilter()) {
    header.createFilter();
  }

  // Remove old banding + apply fresh
  sheet.getBandings().forEach(b => b.remove());
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol)
         .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
  }

  // Auto-resize columns
  for (let c = 1; c <= lastCol; c++) {
    sheet.autoResizeColumn(c);
  }

  sheet.setHiddenGridlines(false);
  SpreadsheetApp.getActive().toast("✅ Sheet formatted successfully");
}

function unformatSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  // Reset layout
  range.setFontFamily("Arial")
       .setFontSize(10)
       .setFontWeight("normal")
       .setWrap(false)
       .setVerticalAlignment("top");

  // Unfreeze everything
  sheet.setFrozenRows(0);
  sheet.setFrozenColumns(0);

  // Clear header formatting
  const header = sheet.getRange(1, 1, 1, lastCol);
  header.setBackground(null)
        .setHorizontalAlignment("left")
        .setBorder(false, false, false, false, false, false);

  // Remove filters
  if (sheet.getFilter()) {
    sheet.getFilter().remove();
  }

  // Remove any banding
  sheet.getBandings().forEach(b => b.remove());

  SpreadsheetApp.getActive().toast("🚫 Formatting cleared");
}

function toggleFormatting() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const font = sheet.getDataRange().getFontFamily();
  font === "Roboto" ? unformatSheet() : applySheetFormatting();
}

function cleanUpSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Trim whitespace
  const trimmed = data.map(row => row.map(cell =>
    typeof cell === "string" ? cell.trim() : cell));
  sheet.getDataRange().setValues(trimmed);

  // Remove empty rows
  for (let r = sheet.getLastRow(); r > 1; r--) {
    const row = sheet.getRange(r, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (row.every(val => val === "")) {
      sheet.deleteRow(r);
    }
  }

  // Remove empty columns
  for (let c = sheet.getLastColumn(); c > 1; c--) {
    const col = sheet.getRange(1, c, sheet.getLastRow()).getValues();
    if (col.every(r => r[0] === "")) {
      sheet.deleteColumn(c);
    }
  }

  SpreadsheetApp.getActive().toast("🧹 Sheet cleaned");
}

function highlightDuplicates() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  const rules = sheet.getConditionalFormatRules();

  const dupRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=COUNTIF(A:A,A1)>1')
    .setBackground('#fdd')
    .setRanges([range])
    .build();

  rules.push(dupRule);
  sheet.setConditionalFormatRules(rules);
  SpreadsheetApp.getActive().toast("🔁 Duplicate highlighter applied");
}

function smartDateStyling() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  for (let c = 0; c < data[0].length; c++) {
    if (data.some((r, i) => i > 0 && r[c] instanceof Date)) {
      const colRange = sheet.getRange(2, c + 1, sheet.getLastRow() - 1);
      colRange.setNumberFormat("mmm d, yyyy");
      colRange.setHorizontalAlignment("center");
    }
  }

  SpreadsheetApp.getActive().toast("📅 Dates formatted");
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile("Sidebar")
    .setTitle("PurePlays Formatter");
  SpreadsheetApp.getUi().showSidebar(html);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🔧 Formatter")
    .addItem("📐 Apply Formatting", "applySheetFormatting")
    .addItem("🔁 Toggle Formatting", "toggleFormatting")
    .addSeparator()
    .addItem("🧹 Clean Up Sheet", "cleanUpSheet")
    .addItem("🔁 Highlight Duplicates", "highlightDuplicates")
    .addItem("📅 Format Dates", "smartDateStyling")
    .addSeparator()
    .addItem("🧭 Open Sidebar", "showSidebar")
    .addToUi();
}
