const STORAGE_KEY = "qualityControlRecords";
const OTHER_VALUE = "__other__";

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
    title: "Temperatura de la freidora entrada (150&deg;C-180&deg;C)",
    icon: "bi-thermometer-high",
    label: "Freidora entrada",
    unit: "&deg;C",
    min: 150,
    max: 180,
    step: 1,
    count: 1,
    columnPrefix: "TFE",
    exportLabel: "Temperatura freidora entrada",
  },
  {
    id: "tempFreidoraSalida",
    title: "Temperatura de la freidora salida (150&deg;C-180&deg;C)",
    icon: "bi-thermometer-high",
    label: "Freidora salida",
    unit: "&deg;C",
    min: 150,
    max: 180,
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

const iqfGroups = [
  {
    id: "tempIqf",
    title: "Temperatura del IQF (-10&deg;C o menor)",
    icon: "bi-snow2",
    label: "Temperatura IQF",
    unit: "&deg;C",
    max: -10,
    optionMin: -40,
    optionMax: -10,
    step: 1,
    count: 1,
    columnPrefix: "TIQF",
    exportLabel: "Temperatura IQF",
  },
  {
    id: "tempEntradaIqf",
    title: "Temperatura de entrada al IQF (40&deg;C-80&deg;C)",
    icon: "bi-thermometer-high",
    label: "Entrada tajada",
    unit: "&deg;C",
    min: 40,
    max: 80,
    step: 1,
    columnPrefix: "TEI",
    exportLabel: "Temperatura entrada IQF",
  },
  {
    id: "tempSalidaIqf",
    title: "Temperatura de salida de tajada (-2&deg;C o menor)",
    icon: "bi-thermometer-snow",
    label: "Salida tajada",
    unit: "&deg;C",
    min: -3,
    max: -2,
    options: ["-2.0", "-2.1", "-2.2", "-2.3", "-2.4", "-2.5", "-2.6", "-2.7", "-2.8", "-2.9", "-3.0"],
    step: 0.1,
    columnPrefix: "TSI",
    exportLabel: "Temperatura salida IQF",
  },
  {
    id: "brixSalidaIqf",
    title: "Brix de salida IQF (29-32)",
    icon: "bi-flower1",
    label: "Brix salida",
    min: 29,
    max: 32,
    step: 0.1,
    columnPrefix: "BSI",
    exportLabel: "Brix salida IQF",
  },
  {
    id: "productoTerminado",
    title: "Producto terminado - Peso neto",
    icon: "bi-box-seam-fill",
    label: "Peso neto",
    unit: "g",
    inputType: "number",
    step: 0.1,
    columnPrefix: "PT",
    exportLabel: "Producto terminado peso neto",
  },
  {
    id: "verificacionLoteado",
    title: "Verificacion de loteado",
    icon: "bi-upc-scan",
    label: "Loteado",
    options: ["Conforme", "No conforme"],
    count: 1,
    columnPrefix: "VL",
    exportLabel: "Verificacion loteado",
  },
  {
    id: "selladoVertical",
    title: "Sellado vertical",
    icon: "bi-grip-vertical",
    label: "Sellado vertical",
    options: ["Conforme", "No conforme"],
    count: 1,
    columnPrefix: "SV",
    exportLabel: "Sellado vertical",
  },
  {
    id: "selladoHorizontal",
    title: "Sellado horizontal",
    icon: "bi-grip-horizontal",
    label: "Sellado horizontal",
    options: ["Conforme", "No conforme"],
    count: 1,
    columnPrefix: "SH",
    exportLabel: "Sellado horizontal",
  },
  {
    id: "materialExtranoIqf",
    title: "Validacion de materiales extranos",
    icon: "bi-search",
    label: "Material extrano",
    options: ["Ausente", "Presente"],
    count: 1,
    columnPrefix: "ME",
    exportLabel: "Material extrano",
  },
];

const reciboGroups = [
  {
    id: "origen",
    title: "Datos de ingreso",
    icon: "bi-truck",
    label: "Origen",
    inputType: "text",
    columnLabel: "Origen",
  },
  {
    id: "placa",
    title: "Datos de ingreso",
    icon: "bi-truck",
    label: "Placa",
    inputType: "text",
    columnLabel: "Placa",
  },
  {
    id: "estadoLimpiezaVehiculo",
    title: "Condiciones del vehiculo y conductor",
    icon: "bi-shield-check",
    label: "Estado de limpieza vehiculo",
    options: ["Conforme", "No conforme"],
    columnLabel: "Estado limpieza vehiculo",
  },
  {
    id: "libreContaminacionCruzada",
    title: "Condiciones del vehiculo y conductor",
    icon: "bi-shield-check",
    label: "Libre contaminacion cruzada",
    options: ["Conforme", "No conforme"],
    columnLabel: "Libre contaminacion cruzada",
  },
  {
    id: "higieneConductor",
    title: "Condiciones del vehiculo y conductor",
    icon: "bi-shield-check",
    label: "Higiene del conductor",
    options: ["Conforme", "No conforme"],
    columnLabel: "Higiene del conductor",
  },
  {
    id: "documentosVehiculoConductor",
    title: "Condiciones del vehiculo y conductor",
    icon: "bi-shield-check",
    label: "Documentos vehiculo / conductor",
    options: ["Conforme", "No conforme"],
    columnLabel: "Documentos vehiculo / conductor",
  },
  {
    id: "proveedor",
    title: "Proveedor y cosecha",
    icon: "bi-person-lines-fill",
    label: "Proveedor",
    inputType: "text",
    columnLabel: "Proveedor",
  },
  {
    id: "semanaCosecha",
    title: "Proveedor y cosecha",
    icon: "bi-person-lines-fill",
    label: "Semana cosecha",
    inputType: "text",
    columnLabel: "Semana cosecha",
  },
  {
    id: "pesoVerde",
    title: "Mediciones de platano verde",
    icon: "bi-rulers",
    label: "Peso verde (g)",
    inputType: "number",
    step: 0.1,
    columnLabel: "Peso verde (g)",
  },
  {
    id: "pesoPulpa",
    title: "Mediciones de platano verde",
    icon: "bi-rulers",
    label: "Peso pulpa (g)",
    inputType: "number",
    step: 0.1,
    columnLabel: "Peso pulpa (g)",
  },
  {
    id: "longitudRecibo",
    title: "Mediciones de platano verde",
    icon: "bi-rulers",
    label: "Longitud (cm)",
    inputType: "number",
    step: 0.1,
    columnLabel: "Longitud (cm)",
  },
  {
    id: "diametro",
    title: "Mediciones de platano verde",
    icon: "bi-rulers",
    label: "Diametro (cm)",
    inputType: "number",
    step: 0.1,
    columnLabel: "Diametro (cm)",
  },
  {
    id: "plaga",
    title: "Condiciones organolepticas",
    icon: "bi-search",
    label: "Plaga (A/P)",
    options: ["Ausente", "Presente"],
    columnLabel: "Plaga (A/P)",
  },
  {
    id: "brixRecibo",
    title: "Condiciones organolepticas",
    icon: "bi-search",
    label: "Brix",
    inputType: "number",
    step: 0.1,
    columnLabel: "Brix",
  },
  {
    id: "olorRecibo",
    title: "Condiciones organolepticas",
    icon: "bi-search",
    label: "Olor",
    inputType: "text",
    columnLabel: "Olor",
  },
  {
    id: "saborRecibo",
    title: "Condiciones organolepticas",
    icon: "bi-search",
    label: "Sabor",
    inputType: "text",
    columnLabel: "Sabor",
  },
  {
    id: "colorRecibo",
    title: "Condiciones organolepticas",
    icon: "bi-search",
    label: "Color",
    inputType: "text",
    columnLabel: "Color",
  },
];

const maduracionGroups = [
  {
    id: "posicionMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Posicion",
    inputType: "text",
  },
  {
    id: "tempCuartoMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Temperatura cuarto de maduracion (&deg;C)",
    inputType: "number",
    step: 0.1,
  },
  {
    id: "humedadCuartoMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Humedad relativa cuarto de maduracion (%Hr)",
    inputType: "number",
    step: 0.1,
  },
  {
    id: "brixPlatanoMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Brix platano",
    inputType: "number",
    step: 0.1,
  },
  {
    id: "pesoPlatanoMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Peso del platano (g)",
    inputType: "number",
    step: 0.1,
  },
  {
    id: "saborMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Sabor",
    inputType: "text",
  },
  {
    id: "olorMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Olor",
    inputType: "text",
  },
  {
    id: "colorMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Color",
    inputType: "text",
  },
];

const formatTitles = {
  porcionado: "Formato de control porcionado",
  prefreido: "Formato de control prefreido, deollier, picking",
  iqf: "Formato de control IQF y empaque",
  maduracion: "Formato de seguimiento de maduracion",
  recibo: "Formato de seguimiento de recibo",
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
  elements.btnOpenIqf = document.getElementById("btnOpenIqf");
  elements.btnOpenMaduracion = document.getElementById("btnOpenMaduracion");
  elements.btnOpenRecibo = document.getElementById("btnOpenRecibo");
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
  elements.btnOpenIqf.addEventListener("click", () => showFormatView("iqf"));
  elements.btnOpenMaduracion.addEventListener("click", () => showFormatView("maduracion"));
  elements.btnOpenRecibo.addEventListener("click", () => showFormatView("recibo"));
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
  handleDateChange();
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
    bindMeasurementInputEvents();
    return;
  }

  if (state.activeFormatId === "iqf") {
    elements.measurementsContainer.innerHTML = iqfGroups.map(renderIqfMeasurementGroup).join("");
    bindMeasurementInputEvents();
    return;
  }

  if (state.activeFormatId === "recibo") {
    elements.measurementsContainer.innerHTML = renderReciboFields();
    bindMeasurementInputEvents();
    return;
  }

  if (state.activeFormatId === "maduracion") {
    elements.measurementsContainer.innerHTML = renderMaduracionFields();
    return;
  }

  const numericGroups = measurementGroups.map(renderNumericMeasurementGroup).join("");
  const brizGroup = renderBrizGroup();
  elements.measurementsContainer.innerHTML = numericGroups + brizGroup;

  bindMeasurementInputEvents();

}

function renderPrefreidoMeasurementGroup(group) {
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
        ${renderSelectWithOther(id, group.options || buildRangeOptions(group.min, group.max, group.step), rangeAttributes, group)}
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

function renderIqfMeasurementGroup(group) {
  const fields = Array.from({ length: getGroupCount(group) }, (_, index) => {
    const number = index + 1;
    const id = `${group.id}${number}`;
    const suffix = getGroupCount(group) === 1 ? "" : ` #${number}`;
    const unitLabel = group.unit ? ` (${group.unit})` : "";
    const fieldLabel = `${group.label}${suffix}${unitLabel}`;
    const rangeAttributes = getRangeAttributes(group);

    if (group.inputType === "number") {
      return `
        <div class="measure-item">
          <label for="${id}">${fieldLabel}</label>
          <input
            class="form-control measure-input"
            type="number"
            id="${id}"
            step="${group.step || 1}"
            ${rangeAttributes}
            required
          >
        </div>
      `;
    }

    return `
      <div class="measure-item">
        <label for="${id}">${fieldLabel}</label>
        ${renderSelectWithOther(id, group.options || buildRangeOptions(group.optionMin ?? group.min, group.optionMax ?? group.max, group.step), rangeAttributes, group)}
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

function renderReciboFields() {
  const groupsByTitle = reciboGroups.reduce((result, field) => {
    if (!result[field.title]) result[field.title] = [];
    result[field.title].push(field);
    return result;
  }, {});

  return Object.entries(groupsByTitle).map(([title, fields]) => {
    const icon = fields[0].icon;
    const inputs = fields.map(renderReciboField).join("");

    return `
      <h2 class="section-title">
        <i class="bi ${icon}" aria-hidden="true"></i>
        ${title}
      </h2>
      <div class="measurement-grid">
        ${inputs}
      </div>
    `;
  }).join("");
}

function renderReciboField(field) {
  if (field.options) {
    return `
      <div class="measure-item">
        <label for="${field.id}">${field.label}</label>
        ${renderSelectWithOther(field.id, field.options, "", field)}
      </div>
    `;
  }

  return `
    <div class="measure-item">
      <label for="${field.id}">${field.label}</label>
      <input
        class="form-control measure-input"
        type="${field.inputType || "text"}"
        id="${field.id}"
        ${field.step ? `step="${field.step}"` : ""}
        required
      >
    </div>
  `;
}

function renderMaduracionFields() {
  const fields = maduracionGroups.map(renderMaduracionField).join("");

  return `
    <h2 class="section-title">
      <i class="bi bi-graph-up-arrow" aria-hidden="true"></i>
      Seguimiento de maduracion
    </h2>
    <div class="measurement-grid">
      ${fields}
    </div>
  `;
}

function renderMaduracionField(field) {
  return `
    <div class="measure-item">
      <label for="${field.id}">${field.label}</label>
      <input
        class="form-control measure-input"
        type="${field.inputType || "text"}"
        id="${field.id}"
        ${field.step ? `step="${field.step}"` : ""}
        required
      >
    </div>
  `;
}

function renderSelectWithOther(id, options, attributes = "", config = {}) {
  const otherId = `${id}Otro`;
  const otherType = config.min !== undefined || config.max !== undefined || config.step ? "number" : "text";
  const otherStep = config.step ? `step="${config.step}"` : "";
  const optionItems = options
    .map((option) => `<option value="${option}">${option}</option>`)
    .join("");

  return `
    <select class="form-select measure-input" id="${id}" ${attributes} data-other-target="${otherId}" required>
      <option value="">Seleccionar</option>
      ${optionItems}
      <option value="${OTHER_VALUE}">Otro</option>
    </select>
    <input
      class="form-control measure-input other-input"
      type="${otherType}"
      id="${otherId}"
      ${attributes}
      ${otherStep}
      placeholder="Escribir otro..."
      hidden
    >
  `;
}

function renderNumericMeasurementGroup(group) {
  const fields = Array.from({ length: 5 }, (_, index) => {
    const number = index + 1;
    const id = `${group.id}${number}`;

    return `
      <div class="measure-item">
        <label for="${id}">${group.label} ${number} (${group.unit})</label>
        ${renderSelectWithOther(id, buildRangeOptions(group.min, group.max, group.step), `data-range-min="${group.min}" data-range-max="${group.max}"`, group)}
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
  const fields = Array.from({ length: 5 }, (_, index) => {
    const number = index + 1;
    const id = `briz${number}`;

    return `
      <div class="measure-item">
        <label for="${id}">Brix ${number}</label>
        ${renderSelectWithOther(id, brixSuggestions, `data-range-min="${brixRange.min}" data-range-max="${brixRange.max}"`, brixRange)}
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
  if (state.activeFormatId === "maduracion") {
    return [
      "Posicion",
      "Temperatura cuarto de maduracion (&deg;C)",
      "Humedad relativa cuarto de maduracion (%Hr)",
      "Brix platano",
      "Peso del platano (g)",
      "Sabor",
      "Olor",
      "Color",
      "Realizado por",
      "Verificado por",
      "Observaciones",
      "Accion",
    ];
  }

  if (state.activeFormatId === "recibo") {
    return [
      "#",
      "Fecha",
      "Mes",
      "Cuarto",
      "Origen",
      "Placa",
      "Limpieza",
      "Cont. cruzada",
      "Higiene",
      "Documentos",
      "Proveedor",
      "Lote",
      "Semana cosecha",
      "Peso verde",
      "Peso pulpa",
      "Longitud",
      "Diametro",
      "Plaga",
      "Brix",
      "Olor",
      "Sabor",
      "Color",
      "Estado",
      "Realizado",
      "Verificado",
      "Obs.",
      "Accion",
    ];
  }

  if (state.activeFormatId === "iqf") {
    const measureColumns = iqfGroups.flatMap((group) => {
      return Array.from({ length: getGroupCount(group) }, (_, index) => `${group.columnPrefix}${index + 1}`);
    });

    return [
      "#",
      "Fecha",
      "Semana/AÃ±o",
      "Hora",
      "Cuarto",
      "Lote",
      ...measureColumns,
      "Estado",
      "Realizado",
      "Verificado",
      "Obs.",
      "AcciÃ³n",
    ];
  }

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

function getRangeAttributes(group) {
  const attributes = [];

  if (group.min !== undefined) attributes.push(`data-range-min="${group.min}"`);
  if (group.max !== undefined) attributes.push(`data-range-max="${group.max}"`);

  return attributes.join(" ");
}

function getGroupCount(group) {
  return group.count || 5;
}

function bindMeasurementInputEvents() {
  document.querySelectorAll("[data-range-min], [data-range-max]").forEach((input) => {
    input.addEventListener("input", () => checkRange(input));
    input.addEventListener("change", () => checkRange(input));
  });

  document.querySelectorAll("[data-other-target]").forEach((select) => {
    select.addEventListener("change", () => toggleOtherInput(select));
    toggleOtherInput(select);
  });
}

function toggleOtherInput(select) {
  const input = document.getElementById(select.dataset.otherTarget);
  if (!input) return;

  const isOther = select.value === OTHER_VALUE;
  input.hidden = !isOther;
  input.required = isOther;

  if (!isOther) {
    input.value = "";
    input.classList.remove("in-range", "out-range");
  } else {
    input.focus();
  }
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
    navigator.serviceWorker.register("sw.js?v=16").then((registration) => {
      registration.update();
    }).catch(() => {});
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
  elements.loteProduccion.value = getLotCode(gregorianDate);
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

function getLotCode(dateString) {
  const weekYear = getWeekYear(dateString);
  if (!weekYear) return "";

  if (state.activeFormatId === "iqf") {
    return `W${weekYear.replace("-", "")}`;
  }

  return weekYear;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function toDateInputValue(date) {
  return date.toISOString().split("T")[0];
}

function getMonthName(dateString) {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("es-CO", { month: "long" });
}

function getMonthNameFromDisplay(displayDate) {
  const match = String(displayDate || "").match(/ de ([a-zA-ZÃ¡Ã©Ã­Ã³ÃºÃ±]+) de /i);
  return match ? match[1] : "";
}

function checkRange(input) {
  const value = Number(input.value);
  const hasMin = input.dataset.rangeMin !== undefined;
  const hasMax = input.dataset.rangeMax !== undefined;
  const min = Number(input.dataset.rangeMin);
  const max = Number(input.dataset.rangeMax);

  input.classList.remove("in-range", "out-range");

  if (input.value === "" || Number.isNaN(value)) return;

  const underMin = hasMin && value < min;
  const overMax = hasMax && value > max;

  input.classList.add(underMin || overMax ? "out-range" : "in-range");
}

function addRecord(event) {
  event.preventDefault();
  handleDateChange();

  if (!elements.form.reportValidity()) return;

  const record = {
    fecha: getValue("fechaRegistro"),
    mes: getMonthName(state.selectedDate),
    fechaJuliana: getWeekYear(state.selectedDate),
    hora: getValue("horaInicio"),
    cuarto: getValue("cuartoMaduracion"),
    lote: getValue("loteProduccion"),
    realizadoPor: getValue("realizadoPor"),
    verificadoPor: getValue("verificadoPor"),
    observaciones: getValue("observaciones"),
    medidas: collectMeasurements(),
    briz: state.activeFormatId === "porcionado" ? collectBriz() : [],
  };

  record.estado = getRecordStatus(record);
  state.records.push(record);
  saveRecords();
  renderRecords();
  resetFormAfterSave();
}

function getValue(id) {
  const element = document.getElementById(id);
  if (!element) return "";

  if (element.value === OTHER_VALUE) {
    return document.getElementById(`${id}Otro`)?.value.trim() || "";
  }

  return element.value.trim();
}

function collectMeasurements() {
  if (state.activeFormatId === "maduracion") {
    return maduracionGroups.reduce((result, field) => {
      result[field.id] = getValue(field.id);
      return result;
    }, {});
  }

  if (state.activeFormatId === "recibo") {
    return reciboGroups.reduce((result, field) => {
      result[field.id] = getValue(field.id);
      return result;
    }, {});
  }

  if (state.activeFormatId === "iqf") {
    return iqfGroups.reduce((result, group) => {
      result[group.id] = Array.from({ length: getGroupCount(group) }, (_, index) => getValue(`${group.id}${index + 1}`));
      return result;
    }, {});
  }

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
  if (state.activeFormatId === "maduracion") {
    return "OK";
  }

  if (state.activeFormatId === "recibo") {
    const noConforming = [
      record.medidas.estadoLimpiezaVehiculo,
      record.medidas.libreContaminacionCruzada,
      record.medidas.higieneConductor,
      record.medidas.documentosVehiculoConductor,
    ].includes("No conforme");
    const hasPlague = record.medidas.plaga === "Presente";

    return noConforming || hasPlague ? "Revisar" : "OK";
  }

  if (state.activeFormatId === "iqf") {
    const hasOutOfRange = iqfGroups.some((group) => {
      if (group.options || (group.min === undefined && group.max === undefined)) return false;

      return record.medidas[group.id].some((value) => {
        const number = Number(value);
        const underMin = group.min !== undefined && number < group.min;
        const overMax = group.max !== undefined && number > group.max;

        return Number.isNaN(number) || underMin || overMax;
      });
    });
    const hasNonConforming = ["verificacionLoteado", "selladoVertical", "selladoHorizontal", "materialExtranoIqf"].some((groupId) => {
      return record.medidas[groupId].some((value) => ["No conforme", "Presente"].includes(value));
    });

    return hasOutOfRange || hasNonConforming ? "Revisar" : "OK";
  }

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
  document.querySelectorAll(".other-input").forEach((input) => {
    input.hidden = true;
    input.required = false;
    input.value = "";
  });
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
    mes: record.mes || getMonthNameFromDisplay(record.fecha),
    fechaJuliana: record.fechaJuliana || "",
    hora: record.hora || "",
    cuarto: record.cuarto || "",
    lote: record.lote || "",
    realizadoPor: record.realizadoPor || "",
    verificadoPor: record.verificadoPor || "",
    observaciones: record.observaciones || "",
    medidas: normalizeMeasurements(record.medidas),
    briz: state.activeFormatId === "porcionado" ? normalizeFixedArray(record.briz) : [],
    estado: record.estado || "OK",
  };
}

function normalizeMeasurements(measurements = {}) {
  if (state.activeFormatId === "maduracion") {
    return maduracionGroups.reduce((result, field) => {
      result[field.id] = measurements[field.id] || "";
      return result;
    }, {});
  }

  if (state.activeFormatId === "recibo") {
    return reciboGroups.reduce((result, field) => {
      result[field.id] = measurements[field.id] || "";
      return result;
    }, {});
  }

  if (state.activeFormatId === "iqf") {
    return iqfGroups.reduce((result, group) => {
      result[group.id] = normalizeFixedArray(measurements[group.id], getGroupCount(group));
      return result;
    }, {});
  }

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
  if (state.activeFormatId === "prefreido") return `${STORAGE_KEY}:prefreido`;
  if (state.activeFormatId === "iqf") return `${STORAGE_KEY}:iqf`;
  if (state.activeFormatId === "maduracion") return `${STORAGE_KEY}:maduracion`;
  if (state.activeFormatId === "recibo") return `${STORAGE_KEY}:recibo`;

  return STORAGE_KEY;
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

  if (state.activeFormatId === "maduracion") {
    return `
      <tr>
        ${measureValues.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}
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

  const statusClass = {
    OK: "status-ok",
    Atención: "status-warning",
    Revisar: "status-danger",
  }[record.estado];

  if (state.activeFormatId === "recibo") {
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(record.fecha)}</td>
        <td>${escapeHtml(record.mes)}</td>
        <td>${escapeHtml(record.cuarto)}</td>
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
  if (state.activeFormatId === "maduracion") {
    return [
      record.medidas.posicionMaduracion,
      record.medidas.tempCuartoMaduracion,
      record.medidas.humedadCuartoMaduracion,
      record.medidas.brixPlatanoMaduracion,
      record.medidas.pesoPlatanoMaduracion,
      record.medidas.saborMaduracion,
      record.medidas.olorMaduracion,
      record.medidas.colorMaduracion,
    ];
  }

  if (state.activeFormatId === "recibo") {
    return [
      record.medidas.origen,
      record.medidas.placa,
      record.medidas.estadoLimpiezaVehiculo,
      record.medidas.libreContaminacionCruzada,
      record.medidas.higieneConductor,
      record.medidas.documentosVehiculoConductor,
      record.medidas.proveedor,
      record.lote,
      record.medidas.semanaCosecha,
      record.medidas.pesoVerde,
      record.medidas.pesoPulpa,
      record.medidas.longitudRecibo,
      record.medidas.diametro,
      record.medidas.plaga,
      record.medidas.brixRecibo,
      record.medidas.olorRecibo,
      record.medidas.saborRecibo,
      record.medidas.colorRecibo,
    ];
  }

  if (state.activeFormatId === "iqf") {
    return iqfGroups.flatMap((group) => record.medidas[group.id] || normalizeFixedArray([], getGroupCount(group)));
  }

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
  if (state.activeFormatId === "maduracion") {
    return state.records.map((record) => ({
      Posicion: record.medidas.posicionMaduracion,
      "Temperatura cuarto de maduracion (C)": record.medidas.tempCuartoMaduracion,
      "Humedad relativa cuarto de maduracion (%Hr)": record.medidas.humedadCuartoMaduracion,
      "Brix platano": record.medidas.brixPlatanoMaduracion,
      "Peso del platano (g)": record.medidas.pesoPlatanoMaduracion,
      Sabor: record.medidas.saborMaduracion,
      Olor: record.medidas.olorMaduracion,
      Color: record.medidas.colorMaduracion,
      "Realizado por": record.realizadoPor,
      "Verificado por": record.verificadoPor,
      Observaciones: record.observaciones,
    }));
  }

  if (state.activeFormatId === "recibo") {
    return state.records.map((record) => ({
      Fecha: record.fecha,
      Mes: record.mes,
      "Cuarto de Maduracion Ingresado": record.cuarto,
      Origen: record.medidas.origen,
      Placa: record.medidas.placa,
      "Estado de Limpieza Vehiculo": record.medidas.estadoLimpiezaVehiculo,
      "Libre Contaminacion Cruzada": record.medidas.libreContaminacionCruzada,
      "Higiene del Conductor": record.medidas.higieneConductor,
      "Documentos Vehiculo / Conductor": record.medidas.documentosVehiculoConductor,
      Proveedor: record.medidas.proveedor,
      Lote: record.lote,
      "Semana Cosecha": record.medidas.semanaCosecha,
      "Peso Verde (g)": record.medidas.pesoVerde,
      "Peso Pulpa (g)": record.medidas.pesoPulpa,
      "Longitud (cm)": record.medidas.longitudRecibo,
      "Diametro (cm)": record.medidas.diametro,
      "Plaga (A/P)": record.medidas.plaga,
      Brix: record.medidas.brixRecibo,
      Olor: record.medidas.olorRecibo,
      Sabor: record.medidas.saborRecibo,
      Color: record.medidas.colorRecibo,
      Estado: record.estado,
      "Realizado por": record.realizadoPor,
      "Verificado por": record.verificadoPor,
      Observaciones: record.observaciones,
    }));
  }

  if (state.activeFormatId === "iqf") {
    return state.records.map((record, index) => ({
      "#": index + 1,
      Fecha: record.fecha,
      "Semana/AÃ±o": record.fechaJuliana,
      Hora: record.hora,
      "Cuarto de MaduraciÃ³n": record.cuarto,
      "Lote de ProducciÃ³n": record.lote,
      ...iqfGroups.reduce((result, group) => ({
        ...result,
        ...spreadArray(group.exportLabel, record.medidas[group.id] || normalizeFixedArray([], getGroupCount(group))),
      }), {}),
      Estado: record.estado,
      "Realizado por": record.realizadoPor,
      "Verificado por": record.verificadoPor,
      Observaciones: record.observaciones,
    }));
  }

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
