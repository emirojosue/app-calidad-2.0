const STORAGE_KEY = "qualityControlRecords";

const measurementGroups = [
  {
    id: "peso",
    title: "Peso tajada al ingreso del freído (32-45 g)",
    icon: "bi-speedometer2",
    label: "Peso",
    unit: "g",
    min: 32,
    max: 45,
    step: 1,
  },
  {
    id: "longitud",
    title: "Longitud (6-9 cm)",
    icon: "bi-rulers",
    label: "Longitud",
    unit: "cm",
    min: 6,
    max: 9,
    step: 0.5,
  },
  {
    id: "amplitud",
    title: "Amplitud (3.5-4 cm)",
    icon: "bi-arrows-expand",
    label: "Amplitud",
    unit: "cm",
    min: 3.5,
    max: 4,
    step: 0.1,
  },
  {
    id: "grosor",
    title: "Grosor (2-2.5 cm)",
    icon: "bi-layers",
    label: "Grosor",
    unit: "cm",
    min: 2,
    max: 2.5,
    step: 0.1,
  },
];

const brixRange = {
  min: 28,
  max: 32,
  step: 0.1,
};

const brixSuggestions = buildRangeOptions(brixRange.min, brixRange.max, brixRange.step);
const tableColumns = [
  "#",
  "Fecha",
  "Semana/Año",
  "Hora",
  "Cuarto",
  "Lote",
  "P1",
  "P2",
  "P3",
  "P4",
  "P5",
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "A1",
  "A2",
  "A3",
  "A4",
  "A5",
  "G1",
  "G2",
  "G3",
  "G4",
  "G5",
  "B1",
  "B2",
  "B3",
  "B4",
  "B5",
  "Estado",
  "Realizado",
  "Verificado",
  "Obs.",
  "Acción",
];

const prefreidoGroups = [
  {
    id: "tempFreidoraEntrada",
    title: "Temperatura de la freidora entrada (150&deg;C-160&deg;C)",
    icon: "bi-thermometer-high",
    label: "Freidora entrada",
    unit: "&deg;C",
    min: 150,
    max: 160,
    step: 1,
    count: 1,
    columnPrefix: "TFE",
    exportLabel: "Temperatura freidora entrada",
  },
  {
    id: "tempFreidoraSalida",
    title: "Temperatura de la freidora salida (150&deg;C-160&deg;C)",
    icon: "bi-thermometer-high",
    label: "Freidora salida",
    unit: "&deg;C",
    min: 150,
    max: 160,
    step: 1,
    count: 1,
    columnPrefix: "TFS",
    exportLabel: "Temperatura freidora salida",
  },
  {
    id: "tempTajadaSalidaFreidora",
    title: "Temperatura de la tajada a la salida de la freidora (65&deg;C-80&deg;C)",
    icon: "bi-thermometer-sun",
    label: "Tajada freidora",
    unit: "&deg;C",
    min: 65,
    max: 80,
    step: 1,
    columnPrefix: "TTF",
    exportLabel: "Temperatura tajada salida freidora",
  },
  {
    id: "tempTajadaSalidaDeollier",
    title: "Temperatura de la tajada a la salida del deollier (40&deg;C-60&deg;C)",
    icon: "bi-thermometer-half",
    label: "Tajada deollier",
    unit: "&deg;C",
    min: 40,
    max: 60,
    step: 1,
    columnPrefix: "TTD",
    exportLabel: "Temperatura tajada salida deollier",
  },
  {
    id: "color",
    title: "Presentacion - Picking: Color",
    icon: "bi-palette-fill",
    label: "Color",
    options: ["Optimo (amarillo a dorado)", "Aceptable (dorado intenso)", "No conforme (marron muy oscuro)"],
    columnPrefix: "COL",
    exportLabel: "Color",
  },
  {
    id: "sabor",
    title: "Presentacion - Picking: Sabor",
    icon: "bi-cup-hot-fill",
    label: "Sabor",
    options: ["Dulce", "Amargo"],
    columnPrefix: "SAB",
    exportLabel: "Sabor",
  },
  {
    id: "olor",
    title: "Presentacion - Picking: Olor",
    icon: "bi-wind",
    label: "Olor",
    options: ["Caracteristico", "No caracteristico"],
    columnPrefix: "OLO",
    exportLabel: "Olor",
  },
  {
    id: "forma",
    title: "Presentacion - Picking: Forma",
    icon: "bi-aspect-ratio-fill",
    label: "Forma",
    options: ["Alargada", "Redonda"],
    columnPrefix: "FOR",
    exportLabel: "Forma",
  },
  {
    id: "materialExtrano",
    title: "Presentacion - Picking: Material extrano",
    icon: "bi-search",
    label: "Material extrano",
    options: ["Ausencia", "Presencia"],
    columnPrefix: "ME",
    exportLabel: "Material extrano",
  },
];

const formatTitles = {
  porcionado: "Formato de control porcionado",
  prefreido: "Formato de control prefreido, deollier, picking",
};

const state = {
  records: [],
  calendarType: "gregorian",
  selectedDate: "",
  activeFormatId: "porcionado",
};

const elements = {};

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  cacheElements();
  renderMeasurementFields();
  renderTableHeader();
  bindEvents();
  registerServiceWorker();
  setInitialDateTime();
  loadRecords();
  updateClock();
  setInterval(updateClock, 1000);
}

function cacheElements() {
  elements.mainMenu = document.getElementById("mainMenu");
  elements.porcionadoView = document.getElementById("porcionadoView");
  elements.btnOpenPorcionado = document.getElementById("btnOpenPorcionado");
  elements.btnOpenPrefreido = document.getElementById("btnOpenPrefreido");
  elements.btnBackToMenu = document.getElementById("btnBackToMenu");
  elements.formatViewTitle = document.getElementById("formatViewTitle");
  elements.form = document.getElementById("qualityForm");
  elements.datePicker = document.getElementById("datePicker");
  elements.dateDisplay = document.getElementById("dateDisplay");
  elements.fechaRegistro = document.getElementById("fechaRegistro");
  elements.loteProduccion = document.getElementById("loteProduccion");
  elements.horaInicio = document.getElementById("horaInicio");
  elements.measurementsContainer = document.getElementById("measurementsContainer");
  elements.recordsHead = document.getElementById("recordsHead");
  elements.recordsBody = document.getElementById("recordsBody");
  elements.recordCount = document.getElementById("recordCount");
  elements.btnDownload = document.getElementById("btnDownload");
  elements.btnShareFile = document.getElementById("btnShareFile");
  elements.btnClearForm = document.getElementById("btnClearForm");
  elements.btnClearRecords = document.getElementById("btnClearRecords");
  elements.sharePanel = document.getElementById("sharePanel");
  elements.btnCloseSharePanel = document.getElementById("btnCloseSharePanel");
  elements.currentTime = document.getElementById("currentTime");
}

function bindEvents() {
  elements.btnOpenPorcionado.addEventListener("click", () => showFormatView("porcionado"));
  elements.btnOpenPrefreido.addEventListener("click", () => showFormatView("prefreido"));
  elements.btnBackToMenu.addEventListener("click", showMainMenu);
  elements.form.addEventListener("submit", addRecord);
  elements.datePicker.addEventListener("change", handleDateChange);
  elements.btnDownload.addEventListener("click", downloadExcel);
  elements.btnShareFile.addEventListener("click", shareRecordsFile);
  elements.btnClearForm.addEventListener("click", clearFormInputs);
  elements.btnClearRecords.addEventListener("click", clearRecords);
  elements.btnCloseSharePanel.addEventListener("click", hideSharePanel);

  document.querySelectorAll("[data-calendar-type]").forEach((button) => {
    button.addEventListener("click", () => setCalendarType(button.dataset.calendarType));
  });

  elements.recordsBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-index]");
    if (button) {
      deleteRecord(Number(button.dataset.deleteIndex));
    }
  });
}

function showFormatView(formatId) {
  state.activeFormatId = formatId;
  elements.formatViewTitle.textContent = formatTitles[formatId];
  renderMeasurementFields();
  renderTableHeader();
  loadRecords();
  clearFormInputs();
  elements.mainMenu.hidden = true;
  elements.porcionadoView.hidden = false;
  elements.porcionadoView.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showMainMenu() {
  elements.porcionadoView.hidden = true;
  elements.mainMenu.hidden = false;
  elements.mainMenu.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setInitialDateTime() {
  const today = new Date();
  elements.datePicker.valueAsDate = today;
  elements.horaInicio.value = today.toTimeString().slice(0, 5);
  handleDateChange();
}

function renderMeasurementFields() {
  if (state.activeFormatId === "prefreido") {
    elements.measurementsContainer.innerHTML = prefreidoGroups.map(renderPrefreidoMeasurementGroup).join("");
    document.querySelectorAll("[data-range-min]").forEach((input) => {
      input.addEventListener("input", () => checkRange(input));
      input.addEventListener("change", () => checkRange(input));
    });
    return;
  }

  const numericGroups = measurementGroups.map(renderNumericMeasurementGroup).join("");
  const brizGroup = renderBrizGroup();
  elements.measurementsContainer.innerHTML = numericGroups + brizGroup;

  document.querySelectorAll("[data-range-min]").forEach((input) => {
    input.addEventListener("input", () => checkRange(input));
    input.addEventListener("change", () => checkRange(input));
  });

}

function renderPrefreidoMeasurementGroup(group) {
  const options = (group.options || buildRangeOptions(group.min, group.max, group.step))
    .map((option) => `<option value="${option}">${option}</option>`)
    .join("");
  const rangeAttributes = group.options
    ? ""
    : `data-range-min="${group.min}" data-range-max="${group.max}"`;
  const unitLabel = group.unit ? ` (${group.unit})` : "";
  const fields = Array.from({ length: getGroupCount(group) }, (_, index) => {
    const number = index + 1;
    const id = `${group.id}${number}`;
    const fieldLabel = getGroupCount(group) === 1 ? group.label : `${group.label} ${number}`;

    return `
      <div class="measure-item">
        <label for="${id}">${fieldLabel}${unitLabel}</label>
        <select class="form-select measure-input" id="${id}" ${rangeAttributes} required>
          <option value="">Seleccionar</option>
          ${options}
        </select>
      </div>
    `;
  }).join("");

  return `
    <h2 class="section-title">
      <i class="bi ${group.icon}" aria-hidden="true"></i>
      ${group.title}
    </h2>
    <div class="measurement-grid">
      ${fields}
    </div>
  `;
}

function renderNumericMeasurementGroup(group) {
  const options = buildRangeOptions(group.min, group.max, group.step)
    .map((option) => `<option value="${option}">${option}</option>`)
    .join("");
  const fields = Array.from({ length: 5 }, (_, index) => {
    const number = index + 1;
    const id = `${group.id}${number}`;

    return `
      <div class="measure-item">
        <label for="${id}">${group.label} ${number} (${group.unit})</label>
        <select
          class="form-select measure-input"
          id="${id}"
          data-range-min="${group.min}"
          data-range-max="${group.max}"
          required
        >
          <option value="">Seleccionar</option>
          ${options}
        </select>
      </div>
    `;
  }).join("");

  return `
    <h2 class="section-title">
      <i class="bi ${group.icon}" aria-hidden="true"></i>
      ${group.title}
    </h2>
    <div class="measurement-grid">
      ${fields}
    </div>
  `;
}

function renderBrizGroup() {
  const options = brixSuggestions.map((option) => `<option value="${option}">${option}</option>`).join("");
  const fields = Array.from({ length: 5 }, (_, index) => {
    const number = index + 1;
    const id = `briz${number}`;

    return `
      <div class="measure-item">
        <label for="${id}">Brix ${number}</label>
        <select
          class="form-select measure-input"
          id="${id}"
          data-range-min="${brixRange.min}"
          data-range-max="${brixRange.max}"
          required
        >
          <option value="">Seleccionar</option>
          ${options}
        </select>
      </div>
    `;
  }).join("");

  return `
    <h2 class="section-title">
      <i class="bi bi-flower1" aria-hidden="true"></i>
      Brix platano (28-32)
    </h2>
    <div class="measurement-grid">
      ${fields}
    </div>
  `;
}

function renderTableHeader() {
  elements.recordsHead.innerHTML = getTableColumns().map((column) => `<th>${column}</th>`).join("");
}

function getTableColumns() {
  if (state.activeFormatId !== "prefreido") return tableColumns;

  const measureColumns = prefreidoGroups.flatMap((group) => {
    return Array.from({ length: getGroupCount(group) }, (_, index) => `${group.columnPrefix}${index + 1}`);
  });

  return [
    "#",
    "Fecha",
    "Semana/Año",
    "Hora",
    "Cuarto",
    "Lote",
    ...measureColumns,
    "Estado",
    "Realizado",
    "Verificado",
    "Obs.",
    "Acción",
  ];
}

function buildRangeOptions(min, max, step) {
  const decimals = String(step).includes(".") ? String(step).split(".")[1].length : 0;
  const total = Math.round((max - min) / step);

  return Array.from({ length: total + 1 }, (_, index) => Number((min + index * step).toFixed(decimals)));
}

function getGroupCount(group) {
  return group.count || 5;
}

function updateClock() {
  elements.currentTime.textContent = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

function setCalendarType(type) {
  state.calendarType = type;

  document.querySelectorAll("[data-calendar-type]").forEach((button) => {
    button.classList.toggle("active", button.dataset.calendarType === type);
  });

  if (type === "gregorian") {
    elements.datePicker.type = "date";
    elements.datePicker.placeholder = "";
    elements.datePicker.value = state.selectedDate || toDateInputValue(new Date());
  } else {
    elements.datePicker.type = "text";
    elements.datePicker.placeholder = "YYYY-DDD (ej: 2026-121)";
    elements.datePicker.value = gregorianToJulian(state.selectedDate || toDateInputValue(new Date()));
  }

  handleDateChange();
}

function handleDateChange() {
  const value = elements.datePicker.value;
  const gregorianDate = state.calendarType === "gregorian" ? value : julianToGregorian(value);
  const julianDate = state.calendarType === "gregorian" ? gregorianToJulian(value) : value;

  if (!gregorianDate || !julianDate) {
    elements.dateDisplay.textContent = "Fecha no válida";
    elements.fechaRegistro.value = "";
    elements.loteProduccion.value = "";
    return;
  }

  state.selectedDate = gregorianDate;

  const date = new Date(`${gregorianDate}T00:00:00`);
  const formattedDate = date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  elements.dateDisplay.textContent = formattedDate;
  elements.fechaRegistro.value = formattedDate;
  elements.loteProduccion.value = getWeekYear(gregorianDate);
}

function gregorianToJulian(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date - start) / 86400000) + 1;

  return `${year}-${String(dayOfYear).padStart(3, "0")}`;
}

function julianToGregorian(julianString) {
  const match = /^(\d{4})-(\d{1,3})$/.exec(julianString || "");
  if (!match) return "";

  const year = Number(match[1]);
  const day = Number(match[2]);
  const maxDays = isLeapYear(year) ? 366 : 365;

  if (day < 1 || day > maxDays) return "";

  const date = new Date(year, 0, day);
  return toDateInputValue(date);
}

function getWeekYear(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = normalizedDate.getUTCDay() || 7;
  normalizedDate.setUTCDate(normalizedDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(normalizedDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((normalizedDate - yearStart) / 86400000 + 1) / 7);

  return `${String(week).padStart(2, "0")}-${normalizedDate.getUTCFullYear()}`;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function toDateInputValue(date) {
  return date.toISOString().split("T")[0];
}

function checkRange(input) {
  const value = Number(input.value);
  const min = Number(input.dataset.rangeMin);
  const max = Number(input.dataset.rangeMax);

  input.classList.remove("in-range", "out-range");

  if (input.value === "" || Number.isNaN(value)) return;

  input.classList.add(value >= min && value <= max ? "in-range" : "out-range");
}

function addRecord(event) {
  event.preventDefault();
  handleDateChange();

  if (!elements.form.reportValidity()) return;

  const record = {
    fecha: getValue("fechaRegistro"),
    fechaJuliana: getWeekYear(state.selectedDate),
    hora: getValue("horaInicio"),
    cuarto: getValue("cuartoMaduracion"),
    lote: getValue("loteProduccion"),
    realizadoPor: getValue("realizadoPor"),
    verificadoPor: getValue("verificadoPor"),
    observaciones: getValue("observaciones"),
    medidas: collectMeasurements(),
    briz: state.activeFormatId === "prefreido" ? [] : collectBriz(),
  };

  record.estado = getRecordStatus(record);
  state.records.push(record);
  saveRecords();
  renderRecords();
  resetFormAfterSave();
}

function getValue(id) {
  return document.getElementById(id).value.trim();
}

function collectMeasurements() {
  if (state.activeFormatId === "prefreido") {
    return prefreidoGroups.reduce((result, group) => {
      result[group.id] = Array.from({ length: getGroupCount(group) }, (_, index) => getValue(`${group.id}${index + 1}`));
      return result;
    }, {});
  }

  return measurementGroups.reduce((result, group) => {
    result[group.id] = Array.from({ length: 5 }, (_, index) => getValue(`${group.id}${index + 1}`));
    return result;
  }, {});
}

function collectBriz() {
  return Array.from({ length: 5 }, (_, index) => getValue(`briz${index + 1}`));
}

function getRecordStatus(record) {
  if (state.activeFormatId === "prefreido") {
    const hasOutOfRange = prefreidoGroups.some((group) => {
      if (group.options) return false;

      return record.medidas[group.id].some((value) => {
        const number = Number(value);
        return Number.isNaN(number) || number < group.min || number > group.max;
      });
    });
    const hasNonConformingPicking = ["color", "sabor", "olor", "materialExtrano"].some((groupId) => {
      return record.medidas[groupId].some((value) => {
        return ["No conforme (marron muy oscuro)", "Amargo", "No caracteristico", "Presencia"].includes(value);
      });
    });

    return hasOutOfRange || hasNonConformingPicking ? "Revisar" : "OK";
  }

  const hasOutOfRange = measurementGroups.some((group) => {
    return record.medidas[group.id].some((value) => {
      const number = Number(value);
      return number < group.min || number > group.max;
    });
  });

  const hasBrixOutOfRange = record.briz.some((value) => {
    const number = Number(value);
    return Number.isNaN(number) || number < brixRange.min || number > brixRange.max;
  });

  if (hasOutOfRange || hasBrixOutOfRange) return "Revisar";
  return "OK";
}

function resetFormAfterSave() {
  clearFormInputs();
}

function clearFormInputs() {
  const selectedValues = {
    fecha: elements.fechaRegistro.value,
    lote: elements.loteProduccion.value,
    hora: elements.horaInicio.value,
  };

  elements.form.reset();
  elements.fechaRegistro.value = selectedValues.fecha;
  elements.loteProduccion.value = selectedValues.lote;
  elements.horaInicio.value = selectedValues.hora;
  document.querySelectorAll(".measure-input").forEach((input) => input.classList.remove("in-range", "out-range"));
}

function loadRecords() {
  try {
    state.records = (JSON.parse(localStorage.getItem(getStorageKey())) || []).map(normalizeRecord);
  } catch {
    state.records = [];
  }

  renderRecords();
}

function normalizeRecord(record) {
  return {
    fecha: record.fecha || "",
    fechaJuliana: record.fechaJuliana || "",
    hora: record.hora || "",
    cuarto: record.cuarto || "",
    lote: record.lote || "",
    realizadoPor: record.realizadoPor || "",
    verificadoPor: record.verificadoPor || "",
    observaciones: record.observaciones || "",
    medidas: normalizeMeasurements(record.medidas),
    briz: state.activeFormatId === "prefreido" ? [] : normalizeFixedArray(record.briz),
    estado: record.estado || "OK",
  };
}

function normalizeMeasurements(measurements = {}) {
  if (state.activeFormatId === "prefreido") {
    return prefreidoGroups.reduce((result, group) => {
      result[group.id] = normalizeFixedArray(measurements[group.id], getGroupCount(group));
      return result;
    }, {});
  }

  return measurementGroups.reduce((result, group) => {
    result[group.id] = normalizeFixedArray(measurements[group.id]);
    return result;
  }, {});
}

function normalizeFixedArray(values, length = 5) {
  return Array.from({ length }, (_, index) => values?.[index] || "");
}

function saveRecords() {
  localStorage.setItem(getStorageKey(), JSON.stringify(state.records));
}

function getStorageKey() {
  return state.activeFormatId === "prefreido" ? `${STORAGE_KEY}:prefreido` : STORAGE_KEY;
}

function deleteRecord(index) {
  state.records.splice(index, 1);
  saveRecords();
  renderRecords();
}

function clearRecords() {
  if (!state.records.length) return;
  if (!window.confirm("¿Deseas borrar todos los registros agregados?")) return;

  state.records = [];
  saveRecords();
  renderRecords();
}

function renderRecords() {
  elements.recordCount.textContent = state.records.length;
  elements.btnDownload.disabled = state.records.length === 0;
  elements.btnShareFile.disabled = state.records.length === 0;
  elements.btnClearRecords.disabled = state.records.length === 0;

  if (state.records.length === 0) {
    elements.recordsBody.innerHTML = `
      <tr>
        <td colspan="${getTableColumns().length}" class="empty-state">
          <i class="bi bi-inbox" aria-hidden="true"></i>
          <p>No hay registros capturados</p>
          <p class="mb-0">Complete el formulario y presione "Agregar registro".</p>
        </td>
      </tr>
    `;
    return;
  }

  elements.recordsBody.innerHTML = state.records.map(renderRecordRow).join("");
}

function renderRecordRow(record, index) {
  const measureValues = getRecordMeasureValues(record);
  const statusClass = {
    OK: "status-ok",
    Atención: "status-warning",
    Revisar: "status-danger",
  }[record.estado];

  return `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(record.fecha)}</td>
      <td>${escapeHtml(record.fechaJuliana)}</td>
      <td>${escapeHtml(record.hora)}</td>
      <td>${escapeHtml(record.cuarto)}</td>
      <td>${escapeHtml(record.lote)}</td>
      ${measureValues.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}
      <td><span class="status-badge ${statusClass}">${record.estado}</span></td>
      <td>${escapeHtml(record.realizadoPor)}</td>
      <td>${escapeHtml(record.verificadoPor)}</td>
      <td>${escapeHtml(record.observaciones || "-")}</td>
      <td>
        <button class="btn-delete" type="button" data-delete-index="${index}">
          <i class="bi bi-trash" aria-hidden="true"></i>
        </button>
      </td>
    </tr>
  `;
}

function getRecordMeasureValues(record) {
  if (state.activeFormatId === "prefreido") {
    return prefreidoGroups.flatMap((group) => record.medidas[group.id] || normalizeFixedArray([], getGroupCount(group)));
  }

  return [
    ...record.medidas.peso,
    ...record.medidas.longitud,
    ...record.medidas.amplitud,
    ...record.medidas.grosor,
    ...record.briz,
  ];
}

function downloadExcel() {
  if (!state.records.length) return;
  const exportFile = createRecordsFile();
  if (!exportFile) {
    showSharePanel();
    return;
  }

  downloadBlob(exportFile.blob, exportFile.name);
}

function createRecordsFile() {
  const rows = getExportRows();
  const date = toDateInputValue(new Date());

  if (typeof XLSX === "undefined") {
    return null;
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Control de Calidad");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  return {
    blob: new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    name: `control-calidad-${state.activeFormatId}-${date}.xlsx`,
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

function getExportRows() {
  if (state.activeFormatId === "prefreido") {
    return state.records.map((record, index) => ({
      "#": index + 1,
      Fecha: record.fecha,
      "Semana/Año": record.fechaJuliana,
      Hora: record.hora,
      "Cuarto de Maduración": record.cuarto,
      "Lote de Producción": record.lote,
      ...prefreidoGroups.reduce((result, group) => ({
        ...result,
        ...spreadArray(group.exportLabel, record.medidas[group.id] || normalizeFixedArray([], getGroupCount(group))),
      }), {}),
      Estado: record.estado,
      "Realizado por": record.realizadoPor,
      "Verificado por": record.verificadoPor,
      Observaciones: record.observaciones,
    }));
  }

  return state.records.map((record, index) => ({
    "#": index + 1,
    Fecha: record.fecha,
    "Semana/Año": record.fechaJuliana,
    Hora: record.hora,
    "Cuarto de Maduración": record.cuarto,
    "Lote de Producción": record.lote,
    ...spreadArray("Peso", record.medidas.peso),
    ...spreadArray("Longitud", record.medidas.longitud),
    ...spreadArray("Amplitud", record.medidas.amplitud),
    ...spreadArray("Grosor", record.medidas.grosor),
    ...spreadArray("Brix", record.briz),
    Estado: record.estado,
    "Realizado por": record.realizadoPor,
    "Verificado por": record.verificadoPor,
    Observaciones: record.observaciones,
  }));
}

async function shareRecordsFile() {
  if (!state.records.length) return;
  const exportFile = createRecordsFile();
  if (!exportFile) {
    showSharePanel();
    return;
  }

  const file = new File([exportFile.blob], exportFile.name, { type: exportFile.type });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: "Control de Calidad",
        text: "Archivo de registros de control de calidad.",
        files: [file],
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        showSharePanel();
      }
    }
    return;
  }

  showSharePanel();
}

function showSharePanel() {
  elements.sharePanel.hidden = false;
  elements.sharePanel.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideSharePanel() {
  elements.sharePanel.hidden = true;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function spreadArray(prefix, values) {
  return values.reduce((result, value, index) => {
    result[`${prefix} ${index + 1}`] = value;
    return result;
  }, {});
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
