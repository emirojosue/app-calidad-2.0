const STORAGE_KEY = "qualityControlRecords";
const OTHER_VALUE = "__other__";
const CLOUD_CONFIG = window.CONTROL_CALIDAD_CONFIG || {};
const SUPER_USER_NAME = CLOUD_CONFIG.superUserName || "calidad";
const SUPER_USER_EMAIL = CLOUD_CONFIG.superUserEmail || "calidad@controlcalidad.com";
const USERNAME_DOMAIN = CLOUD_CONFIG.usernameDomain || "controlcalidad.com";
const FORMAT_STORAGE_KEYS = {
  porcionado: STORAGE_KEY,
  prefreido: `${STORAGE_KEY}:prefreido`,
  iqf: `${STORAGE_KEY}:iqf`,
  maduracion: `${STORAGE_KEY}:maduracion`,
  recibo: `${STORAGE_KEY}:recibo`,
};

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
    step: 0.1,
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

const binaryOptions = ["1", "0"];
const rememberedGeneralFormats = ["maduracion", "recibo"];
const generalFieldIds = ["horaInicio", "cuartoMaduracion", "realizadoPor", "verificadoPor", "observaciones"];
const reciboFirstRecordAutofillTitles = [
  "Datos de ingreso",
  "Condiciones del vehiculo y conductor",
  "Proveedor y cosecha",
];
const maduracionFirstRecordAutofillIds = [
  "tempCuartoMaduracion",
  "humedadCuartoMaduracion",
];
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
    inputType: "text",
    valueFrom: "loteProduccion",
    prefix: "W",
    readonly: true,
    count: 1,
    columnPrefix: "VL",
    exportLabel: "Loteado",
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
    options: binaryOptions,
    allowOther: false,
    columnLabel: "Estado limpieza vehiculo",
  },
  {
    id: "libreContaminacionCruzada",
    title: "Condiciones del vehiculo y conductor",
    icon: "bi-shield-check",
    label: "Libre contaminacion cruzada",
    options: binaryOptions,
    allowOther: false,
    columnLabel: "Libre contaminacion cruzada",
  },
  {
    id: "higieneConductor",
    title: "Condiciones del vehiculo y conductor",
    icon: "bi-shield-check",
    label: "Higiene del conductor",
    options: binaryOptions,
    allowOther: false,
    columnLabel: "Higiene del conductor",
  },
  {
    id: "documentosVehiculoConductor",
    title: "Condiciones del vehiculo y conductor",
    icon: "bi-shield-check",
    label: "Documentos vehiculo / conductor",
    options: binaryOptions,
    allowOther: false,
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
    defaultValue: "10",
    readonly: true,
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
    options: ["Ausencia", "Presencia"],
    allowOther: false,
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
    options: ["Caracteristico", "No caracteristico"],
    allowOther: false,
    columnLabel: "Olor",
  },
  {
    id: "saborRecibo",
    title: "Condiciones organolepticas",
    icon: "bi-search",
    label: "Sabor",
    options: ["Dulce", "Amargo"],
    allowOther: false,
    columnLabel: "Sabor",
  },
  {
    id: "colorRecibo",
    title: "Condiciones organolepticas",
    icon: "bi-search",
    label: "Color",
    options: ["Verde", "Amarillo", "Negro"],
    allowOther: false,
    columnLabel: "Color",
  },
];

const maduracionGroups = [
  {
    id: "seccionMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Seccion",
    options: ["A", "B", "C", "D"],
    allowOther: false,
  },
  {
    id: "posicionMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Posicion",
    options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    allowOther: false,
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
    options: ["Dulce", "Amargo"],
    allowOther: false,
  },
  {
    id: "olorMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Olor",
    options: ["Caracteristico", "No caracteristico"],
    allowOther: false,
  },
  {
    id: "colorMaduracion",
    title: "Seguimiento de maduracion",
    icon: "bi-graph-up-arrow",
    label: "Color",
    options: ["Verde", "Amarillo", "Negro"],
    allowOther: false,
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
  authMode: "login",
  cloudEnabled: false,
  authUser: null,
  authProfile: null,
  cloudSyncError: null,
};

const elements = {};
let supabaseClient = null;

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  cacheElements();
  bindEvents();
  registerServiceWorker();
  updateClock();
  setInterval(updateClock, 1000);

  if (isCloudConfigured()) {
    await initCloudAuth();
    return;
  }

  showAuth();
  showAuthMessage("Configura Supabase en config.js para iniciar sesion o crear usuarios.");
}

function cacheElements() {
  elements.authShell = document.getElementById("authShell");
  elements.authLanding = document.getElementById("authLanding");
  elements.authPanel = document.getElementById("authPanel");
  elements.authPanelTitle = document.getElementById("authPanelTitle");
  elements.authPanelSubtitle = document.getElementById("authPanelSubtitle");
  elements.appShell = document.getElementById("appShell");
  elements.authForm = document.getElementById("authForm");
  elements.authEmail = document.getElementById("authEmail");
  elements.authPassword = document.getElementById("authPassword");
  elements.btnAuthSubmit = document.getElementById("btnAuthSubmit");
  elements.btnAuthShowLogin = document.getElementById("btnAuthShowLogin");
  elements.btnAuthShowRegister = document.getElementById("btnAuthShowRegister");
  elements.btnAuthBack = document.getElementById("btnAuthBack");
  elements.authMessage = document.getElementById("authMessage");
  elements.userControls = document.getElementById("userControls");
  elements.currentUserLabel = document.getElementById("currentUserLabel");
  elements.btnLogout = document.getElementById("btnLogout");
  elements.adminPanel = document.getElementById("adminPanel");
  elements.adminUsersBody = document.getElementById("adminUsersBody");
  elements.btnRefreshUsers = document.getElementById("btnRefreshUsers");
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
  elements.cuartoMaduracion = document.getElementById("cuartoMaduracion");
  elements.observaciones = document.getElementById("observaciones");
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
  elements.authForm?.addEventListener("submit", handleAuthSubmit);
  elements.btnAuthShowLogin?.addEventListener("click", () => showAuthForm("login"));
  elements.btnAuthShowRegister?.addEventListener("click", () => showAuthForm("register"));
  elements.btnAuthBack?.addEventListener("click", showAuthLanding);
  elements.btnLogout?.addEventListener("click", signOutUser);
  elements.btnRefreshUsers?.addEventListener("click", loadAdminUsers);
  elements.adminUsersBody?.addEventListener("click", (event) => {
    const disableButton = event.target.closest("[data-disable-user]");
    if (disableButton) disableUser(disableButton.dataset.disableUser);

    const deleteButton = event.target.closest("[data-delete-user]");
    if (deleteButton) deleteUser(deleteButton.dataset.deleteUser);
  });
  elements.btnOpenPorcionado.addEventListener("click", () => showFormatView("porcionado"));
  elements.btnOpenPrefreido.addEventListener("click", () => showFormatView("prefreido"));
  elements.btnOpenIqf.addEventListener("click", () => showFormatView("iqf"));
  elements.btnOpenMaduracion.addEventListener("click", () => showFormatView("maduracion"));
  elements.btnOpenRecibo.addEventListener("click", () => showFormatView("recibo"));
  elements.btnBackToMenu.addEventListener("click", showMainMenu);
  elements.form.addEventListener("submit", addRecord);
  elements.datePicker.addEventListener("change", () => {
    handleDateChange();
    applyRememberedGeneralInfo();
    applyReciboFirstRecordInfo();
    applyMaduracionFirstRecordInfo();
  });
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

  window.addEventListener("online", () => {
    syncAllFormatRecords();
  });
}

function isCloudConfigured() {
  return Boolean(CLOUD_CONFIG.supabaseUrl && CLOUD_CONFIG.supabaseAnonKey && window.supabase);
}

async function initCloudAuth() {
  state.cloudEnabled = true;
  supabaseClient = window.supabase.createClient(CLOUD_CONFIG.supabaseUrl, CLOUD_CONFIG.supabaseAnonKey);
  showAuthMessage("");

  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    await handleSignedIn(data.session.user);
  } else {
    showAuth();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      await handleSignedIn(session.user);
    } else {
      state.authUser = null;
      state.authProfile = null;
      state.records = [];
      renderAuthHeader();
      showAuth();
    }
  });
}

async function handleSignedIn(user) {
  state.authUser = user;
  state.authProfile = await ensureProfile(user);

  if (state.authProfile?.disabled) {
    await supabaseClient.auth.signOut();
    showAuthMessage("Este usuario esta desactivado.");
    return;
  }

  showApp();
  renderAuthHeader();
  await syncAllFormatRecords({ renderActive: false });
  await initializeAppView();
  if (isSuperUser()) await loadAdminUsers();
}

async function ensureProfile(user) {
  const { data: existing } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const profile = {
    id: user.id,
    email: user.email,
    role: "user",
  };
  const { data, error } = await supabaseClient.from("profiles").insert(profile).select("*").single();
  if (error) {
    showAuthMessage("No se pudo crear el perfil del usuario.");
    return profile;
  }

  return data;
}

function showAuth() {
  elements.authShell.hidden = false;
  elements.appShell.hidden = true;
  showAuthLanding();
}

function showApp() {
  elements.authShell.hidden = true;
  elements.appShell.hidden = false;
}

function showAuthLanding() {
  state.authMode = "login";
  elements.authLanding.hidden = false;
  elements.authPanel.hidden = true;
  showAuthMessage("");
  elements.authForm?.reset();
}

function showAuthForm(mode) {
  state.authMode = mode;
  elements.authLanding.hidden = true;
  elements.authPanel.hidden = false;
  elements.authPanelTitle.textContent = mode === "register" ? "Crear cuenta" : "Iniciar sesion";
  elements.authPanelSubtitle.textContent = mode === "register"
    ? "Registra un operador con usuario o correo y contrasena."
    : `Ingresa con tu usuario. El super usuario puede entrar como ${SUPER_USER_NAME}.`;
  elements.btnAuthSubmit.textContent = mode === "register" ? "Crear cuenta" : "Ingresar";
  elements.authPassword.autocomplete = mode === "register" ? "new-password" : "current-password";
  showAuthMessage("");
  elements.authForm.reset();
  elements.authEmail.focus();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!supabaseClient) {
    showAuthMessage("Configura Supabase en config.js antes de usar autenticacion.");
    return;
  }

  if (state.authMode === "register") {
    await registerUser();
    return;
  }

  await signInUser();
}

async function signInUser(event) {
  showAuthMessage("Validando acceso...");
  const email = resolveAuthEmail(elements.authEmail.value);
  if (!email) {
    showAuthMessage("Escribe un usuario valido.");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password: elements.authPassword.value,
  });

  showAuthMessage(error ? `Usuario o contrasena incorrectos: ${error.message}` : "");
}

async function registerUser() {
  showAuthMessage("Creando usuario...");
  const username = normalizeUsername(elements.authEmail.value);
  const email = resolveAuthEmail(elements.authEmail.value);
  if (!email) {
    showAuthMessage("Escribe un usuario valido.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password: elements.authPassword.value,
    options: {
      data: { username },
    },
  });

  if (error) {
    showAuthMessage(`No se pudo crear el usuario: ${error.message}`);
    return;
  }

  showAuthMessage(data.session
    ? "Usuario creado. Entrando..."
    : "Usuario creado. Si no puedes entrar, desactiva Confirm email en Supabase.");
}

function resolveAuthEmail(identifier) {
  const value = identifier.trim().toLowerCase();
  if (value === SUPER_USER_NAME.toLowerCase()) return SUPER_USER_EMAIL;
  if (value.includes("@")) return value;

  const username = normalizeUsername(value);
  return username ? `${username}@${USERNAME_DOMAIN}` : "";
}

function normalizeUsername(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

async function signOutUser() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
}

function renderAuthHeader() {
  const hasUser = Boolean(state.authUser);
  elements.userControls.hidden = !hasUser;
  elements.adminPanel.hidden = !isSuperUser();
  if (hasUser) {
    elements.currentUserLabel.textContent = `${getUserDisplayName()}${isSuperUser() ? " - Super usuario" : ""}`;
  }
}

function showAuthMessage(message) {
  if (elements.authMessage) elements.authMessage.textContent = message;
}

function isSuperUser() {
  return Boolean(state.authUser && state.authProfile?.role === "super");
}

function getUserDisplayName(user = state.authUser) {
  if (!user?.email) return "Usuario";
  if (user.email.toLowerCase() === SUPER_USER_EMAIL.toLowerCase()) return SUPER_USER_NAME;

  const localUsername = `@${USERNAME_DOMAIN}`.toLowerCase();
  if (user.email.toLowerCase().endsWith(localUsername)) return user.email.split("@")[0];

  return user.email;
}

async function loadAdminUsers() {
  if (!isSuperUser()) return;

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id,email,role,disabled,created_at")
    .order("email");

  if (error) {
    elements.adminUsersBody.innerHTML = `<tr><td colspan="4">No se pudieron cargar los usuarios.</td></tr>`;
    return;
  }

  elements.adminUsersBody.innerHTML = data.map((profile) => {
    const isCurrent = profile.id === state.authUser.id;
    const action = isCurrent ? "-" : renderAdminUserActions(profile);

    return `
      <tr>
        <td>${escapeHtml(getUserDisplayName(profile))}</td>
        <td>${escapeHtml(profile.role)}</td>
        <td>${profile.disabled ? "Bloqueado" : "Activo"}</td>
        <td>${action}</td>
      </tr>
    `;
  }).join("");
}

function renderAdminUserActions(profile) {
  const blockButton = profile.disabled
    ? ""
    : `<button class="btn-outline-danger" type="button" data-disable-user="${profile.id}">Bloquear</button>`;

  return `
    <div class="admin-actions">
      ${blockButton}
      <button class="btn-delete" type="button" data-delete-user="${profile.id}">Eliminar</button>
    </div>
  `;
}

async function disableUser(userId) {
  if (!isSuperUser()) return;
  if (!window.confirm("Deseas bloquear el acceso de este usuario?")) return;

  const { error } = await supabaseClient.from("profiles").update({ disabled: true }).eq("id", userId);
  if (error) {
    window.alert("No se pudo bloquear el usuario.");
    return;
  }

  await loadAdminUsers();
}

async function deleteUser(userId) {
  if (!isSuperUser()) return;
  if (!window.confirm("Deseas eliminar definitivamente este usuario y sus registros?")) return;

  const { error } = await supabaseClient.rpc("delete_app_user", { target_user_id: userId });
  if (error) {
    const needsSqlUpdate = error.message?.includes("delete_app_user") || error.message?.includes("schema cache");
    const helpText = needsSqlUpdate
      ? "\n\nDebes ejecutar el supabase-schema.sql actualizado en Supabase SQL Editor y esperar unos segundos."
      : "";
    window.alert(`No se pudo eliminar el usuario.${helpText}\n\nDetalle: ${error.message}`);
    return;
  }

  await loadAdminUsers();
  if (canSyncCloud()) await syncActiveFormatRecords();
}

async function initializeAppView() {
  renderMeasurementFields();
  renderTableHeader();
  setInitialDateTime();
  await loadRecords();
}

async function showFormatView(formatId) {
  state.activeFormatId = formatId;
  elements.formatViewTitle.textContent = formatTitles[formatId];
  renderMeasurementFields();
  renderTableHeader();
  await loadRecords();
  handleDateChange();
  clearFormInputs();
  applyRememberedGeneralInfo();
  applyReciboFirstRecordInfo();
  applyMaduracionFirstRecordInfo();
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

    if (group.inputType) {
      const inputValue = group.valueFrom ? getLinkedFieldValue(group) : "";
      return `
        <div class="measure-item">
          <label for="${id}">${fieldLabel}</label>
          <input
            class="form-control measure-input"
            type="${group.inputType}"
            id="${id}"
            step="${group.step || 1}"
            value="${inputValue}"
            ${rangeAttributes}
            ${group.readonly ? "readonly" : ""}
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
        value="${field.defaultValue || ""}"
        ${field.step ? `step="${field.step}"` : ""}
        ${field.readonly ? "readonly" : ""}
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

function renderSelectWithOther(id, options, attributes = "", config = {}) {
  const otherId = `${id}Otro`;
  const isNumericOther = config.min !== undefined || config.max !== undefined || config.step;
  const allowOther = config.allowOther !== false;
  const optionItems = options
    .map((option) => `<option value="${option}">${option}</option>`)
    .join("");

  return `
    <select class="form-select measure-input" id="${id}" ${attributes} data-other-target="${otherId}" required>
      <option value="">Seleccionar</option>
      ${optionItems}
      ${allowOther ? `<option value="${OTHER_VALUE}">Otro</option>` : ""}
    </select>
    ${allowOther ? `
      <input
        class="form-control measure-input other-input"
        type="text"
        id="${otherId}"
        ${attributes}
        ${isNumericOther ? 'inputmode="decimal"' : ""}
        placeholder="Escribir otro..."
        hidden
      >
    ` : ""}
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
      "Fecha",
      "Lote",
      "Cuarto de maduracion",
      "Seccion",
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
    navigator.serviceWorker.register("sw.js?v=32").then((registration) => {
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
  syncValueFromFields();
}

function syncValueFromFields() {
  if (state.activeFormatId !== "iqf") return;

  iqfGroups.forEach((group) => {
    if (!group.valueFrom) return;

    Array.from({ length: getGroupCount(group) }, (_, index) => {
      const input = document.getElementById(`${group.id}${index + 1}`);
      if (input) input.value = getLinkedFieldValue(group);
    });
  });
}

function getLinkedFieldValue(group) {
  const value = getValue(group.valueFrom);
  if (group.prefix && value && !value.startsWith(group.prefix)) return `${group.prefix}${value}`;

  return value;
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
  if (state.activeFormatId === "iqf") {
    const weekYear = getWeekYear(dateString);
    if (!weekYear) return "";

    return `W${weekYear.replace("-", "")}`;
  }

  return getDayOfYearCode(dateString);
}

function getDayOfYearCode(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date - start) / 86400000) + 1;

  return `${String(dayOfYear).padStart(3, "0")}-${year}`;
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
  const value = parseMeasurementNumber(input.value);
  const hasMin = input.dataset.rangeMin !== undefined;
  const hasMax = input.dataset.rangeMax !== undefined;
  const min = Number(input.dataset.rangeMin);
  const max = Number(input.dataset.rangeMax);

  input.classList.remove("in-range", "out-range");

  if (input.value === "" || input.value === OTHER_VALUE) return;

  const underMin = hasMin && value < min;
  const overMax = hasMax && value > max;

  input.classList.add(Number.isNaN(value) || underMin || overMax ? "out-range" : "in-range");
}

function parseMeasurementNumber(value) {
  if (value === null || value === undefined) return Number.NaN;
  return Number(String(value).trim().replace(",", "."));
}

async function addRecord(event) {
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

  record.id = crypto.randomUUID?.() || String(Date.now());
  record.estado = getRecordStatus(record);
  const saved = await saveRecord(record);
  if (!saved) return;
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
    ].includes("0");
    const hasPlague = record.medidas.plaga === "Presencia";

    return noConforming || hasPlague ? "Revisar" : "OK";
  }

  if (state.activeFormatId === "iqf") {
    const hasOutOfRange = iqfGroups.some((group) => {
      if (group.options || (group.min === undefined && group.max === undefined)) return false;

      return record.medidas[group.id].some((value) => {
        const number = parseMeasurementNumber(value);
        const underMin = group.min !== undefined && number < group.min;
        const overMax = group.max !== undefined && number > group.max;

        return Number.isNaN(number) || underMin || overMax;
      });
    });
    const hasNonConforming = ["selladoVertical", "selladoHorizontal", "materialExtranoIqf"].some((groupId) => {
      return record.medidas[groupId].some((value) => ["No conforme", "Presente"].includes(value));
    });

    return hasOutOfRange || hasNonConforming ? "Revisar" : "OK";
  }

  if (state.activeFormatId === "prefreido") {
    const hasOutOfRange = prefreidoGroups.some((group) => {
      if (group.options) return false;

      return record.medidas[group.id].some((value) => {
        const number = parseMeasurementNumber(value);
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
      const number = parseMeasurementNumber(value);
      return Number.isNaN(number) || number < group.min || number > group.max;
    });
  });

  const hasBrixOutOfRange = record.briz.some((value) => {
    const number = parseMeasurementNumber(value);
    return Number.isNaN(number) || number < brixRange.min || number > brixRange.max;
  });

  if (hasOutOfRange || hasBrixOutOfRange) return "Revisar";
  return "OK";
}

function resetFormAfterSave() {
  clearFormInputs();
  applyReciboFirstRecordInfo();
  applyMaduracionFirstRecordInfo();
}

function clearFormInputs() {
  const selectedValues = {
    fecha: elements.fechaRegistro.value,
    lote: elements.loteProduccion.value,
    hora: elements.horaInicio.value,
  };
  const generalValues = shouldRememberGeneralInfo() ? getGeneralFormValues() : {};

  elements.form.reset();
  elements.fechaRegistro.value = selectedValues.fecha;
  elements.loteProduccion.value = selectedValues.lote;
  elements.horaInicio.value = selectedValues.hora;
  if (shouldRememberGeneralInfo()) setGeneralFormValues(generalValues);
  applyReciboFirstRecordInfo();
  applyMaduracionFirstRecordInfo();
  document.querySelectorAll(".measure-input").forEach((input) => input.classList.remove("in-range", "out-range"));
  document.querySelectorAll(".other-input").forEach((input) => {
    input.hidden = true;
    input.required = false;
    input.value = "";
  });
}

function shouldRememberGeneralInfo() {
  return rememberedGeneralFormats.includes(state.activeFormatId);
}

function getGeneralFormValues() {
  return generalFieldIds.reduce((values, id) => {
    values[id] = getValue(id);
    return values;
  }, {});
}

function setGeneralFormValues(values = {}) {
  generalFieldIds.forEach((id) => {
    const element = document.getElementById(id);
    if (!element || values[id] === undefined) return;
    element.value = values[id];
  });
}

function applyRememberedGeneralInfo() {
  if (!shouldRememberGeneralInfo() || !elements.fechaRegistro.value) return;

  const record = [...state.records].reverse().find((item) => item.fecha === elements.fechaRegistro.value);
  if (!record) {
    elements.horaInicio.value = new Date().toTimeString().slice(0, 5);
    elements.cuartoMaduracion.value = "";
    elements.observaciones.value = "";
    return;
  }

  setGeneralFormValues({
    horaInicio: record.hora,
    cuartoMaduracion: record.cuarto,
    realizadoPor: record.realizadoPor,
    verificadoPor: record.verificadoPor,
    observaciones: record.observaciones,
  });
}

function applyReciboFirstRecordInfo() {
  if (state.activeFormatId !== "recibo" || !elements.fechaRegistro.value) return;

  const firstRecord = state.records.find((record) => record.fecha === elements.fechaRegistro.value);
  const values = firstRecord?.medidas || {};

  getReciboFirstRecordAutofillFields().forEach((field) => {
    const element = document.getElementById(field.id);
    if (!element) return;

    element.value = values[field.id] ?? field.defaultValue ?? "";
  });
}

function getReciboFirstRecordAutofillFields() {
  return reciboGroups.filter((field) => reciboFirstRecordAutofillTitles.includes(field.title));
}

function applyMaduracionFirstRecordInfo() {
  if (state.activeFormatId !== "maduracion" || !elements.fechaRegistro.value) return;

  const firstRecord = state.records.find((record) => record.fecha === elements.fechaRegistro.value);
  const values = firstRecord?.medidas || {};

  maduracionFirstRecordAutofillIds.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    element.value = values[id] || "";
  });
}

async function loadRecords() {
  state.records = loadLocalRecords(state.activeFormatId).filter((record) => !record._deleted);
  renderRecords();

  if (canSyncCloud()) await syncActiveFormatRecords();
}

async function loadCloudRecords(formatId = state.activeFormatId) {
  let query = supabaseClient
    .from("quality_records")
    .select("id,user_id,user_email,local_id,record_data,created_at")
    .eq("format_id", formatId)
    .order("created_at", { ascending: true });

  if (!isSuperUser()) query = query.eq("user_id", state.authUser.id);

  const { data, error } = await query;
  if (error) {
    window.alert("No se pudieron cargar los registros en la nube.");
    state.records = loadLocalRecords(formatId).filter((record) => !record._deleted);
  } else {
    state.records = data.map((row) => recordFromCloudRow(row, formatId));
    saveRecords(formatId, state.records);
  }

  renderRecords();
}

function loadLocalRecords(formatId = state.activeFormatId) {
  try {
    return (JSON.parse(localStorage.getItem(getStorageKey(formatId))) || []).map((record) => normalizeRecord(record, formatId));
  } catch {
    return [];
  }
}

function recordFromCloudRow(row, formatId = state.activeFormatId) {
  return normalizeRecord({
    ...row.record_data,
    id: row.local_id || row.record_data?.id,
    _cloudId: row.id,
    userEmail: row.user_email,
    _syncStatus: "synced",
  }, formatId);
}

function normalizeRecord(record, formatId = state.activeFormatId) {
  return {
    id: record.id || crypto.randomUUID?.() || String(Date.now()),
    _cloudId: record._cloudId,
    userEmail: record.userEmail || "",
    fecha: record.fecha || "",
    mes: record.mes || getMonthNameFromDisplay(record.fecha),
    fechaJuliana: record.fechaJuliana || "",
    hora: record.hora || "",
    cuarto: record.cuarto || "",
    lote: record.lote || "",
    realizadoPor: record.realizadoPor || "",
    verificadoPor: record.verificadoPor || "",
    observaciones: record.observaciones || "",
    medidas: normalizeMeasurements(record.medidas, formatId),
    briz: formatId === "porcionado" ? normalizeFixedArray(record.briz) : [],
    estado: record.estado || "OK",
    _syncStatus: record._syncStatus || "",
    _deleted: Boolean(record._deleted),
  };
}

function normalizeMeasurements(measurements = {}, formatId = state.activeFormatId) {
  if (formatId === "maduracion") {
    return maduracionGroups.reduce((result, field) => {
      result[field.id] = measurements[field.id] || "";
      return result;
    }, {});
  }

  if (formatId === "recibo") {
    return reciboGroups.reduce((result, field) => {
      result[field.id] = measurements[field.id] || "";
      return result;
    }, {});
  }

  if (formatId === "iqf") {
    return iqfGroups.reduce((result, group) => {
      result[group.id] = normalizeFixedArray(measurements[group.id], getGroupCount(group));
      return result;
    }, {});
  }

  if (formatId === "prefreido") {
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

async function syncActiveFormatRecords() {
  await syncFormatRecords(state.activeFormatId, { renderActive: true });
}

async function syncAllFormatRecords({ renderActive = true } = {}) {
  if (!canSyncCloud()) return;

  for (const formatId of Object.keys(FORMAT_STORAGE_KEYS)) {
    await syncFormatRecords(formatId, { renderActive: renderActive && formatId === state.activeFormatId });
  }
}

async function syncFormatRecords(formatId, { renderActive = true } = {}) {
  if (!canSyncCloud()) return;

  const localRecords = loadLocalRecords(formatId);
  const retainedLocalRecords = [];

  for (const record of localRecords) {
    if (record._deleted) {
      if (record._cloudId) {
        const { error } = await supabaseClient.from("quality_records").delete().eq("id", record._cloudId);
        if (error) retainedLocalRecords.push(record);
      }
      continue;
    }

    if (record._syncStatus !== "synced" || !record._cloudId) {
      const syncedRecord = await uploadRecordToCloud(record, formatId);
      retainedLocalRecords.push(syncedRecord || record);
    } else {
      retainedLocalRecords.push(record);
    }
  }

  const cloudRecords = await fetchCloudRecords(formatId);
  if (!cloudRecords) {
    if (formatId === state.activeFormatId) {
      state.records = retainedLocalRecords.filter((record) => !record._deleted);
      saveRecords(formatId, state.records);
      if (renderActive) renderRecords();
    } else {
      saveRecords(formatId, retainedLocalRecords.filter((record) => !record._deleted));
    }
    return;
  }

  const merged = new Map();
  cloudRecords.forEach((record) => merged.set(record.id, record));
  retainedLocalRecords.forEach((record) => {
    if (!record._deleted && !merged.has(record.id)) merged.set(record.id, record);
  });

  const syncedRecords = Array.from(merged.values());
  saveRecords(formatId, syncedRecords);

  if (formatId === state.activeFormatId) {
    state.records = syncedRecords;
    if (renderActive) renderRecords();
  }
}

async function fetchCloudRecords(formatId = state.activeFormatId) {
  state.cloudSyncError = null;
  let query = supabaseClient
    .from("quality_records")
    .select("id,user_id,user_email,local_id,record_data,created_at")
    .eq("format_id", formatId)
    .order("created_at", { ascending: true });

  if (!isSuperUser()) query = query.eq("user_id", state.authUser.id);

  const { data, error } = await query;
  if (error) {
    state.cloudSyncError = error;
    console.error("No se pudieron cargar los registros en la nube", error);
    return null;
  }

  return data.map((row) => recordFromCloudRow(row, formatId));
}

async function uploadRecordToCloud(record, formatId = state.activeFormatId) {
  state.cloudSyncError = null;
  const cloudRecord = {
    ...record,
    _syncStatus: "synced",
    _deleted: false,
  };

  const payload = {
    user_id: state.authUser.id,
    user_email: state.authUser.email,
    format_id: formatId,
    local_id: record.id,
    record_data: cloudRecord,
  };

  let existingId = record._cloudId;
  if (!existingId) {
    const { data: existingRecord, error: findError } = await supabaseClient
      .from("quality_records")
      .select("id")
      .eq("user_id", state.authUser.id)
      .eq("format_id", formatId)
      .eq("local_id", record.id)
      .maybeSingle();

    if (findError) {
      state.cloudSyncError = findError;
      console.error("No se pudo buscar el registro en la nube", findError);
      return null;
    }

    existingId = existingRecord?.id;
  }

  const request = existingId
    ? supabaseClient.from("quality_records").update(payload).eq("id", existingId)
    : supabaseClient.from("quality_records").insert(payload);

  const { data, error } = await request
    .select("id")
    .single();

  if (error) {
    state.cloudSyncError = error;
    console.error("No se pudo sincronizar el registro", error);
    return null;
  }

  return {
    ...cloudRecord,
    _cloudId: data.id || existingId,
    userEmail: state.authUser.email,
  };
}

async function saveRecord(record) {
  record._syncStatus = canSyncCloud() ? "pending" : "pending";
  state.records.push(record);
  saveRecords();
  if (canSyncCloud()) {
    await syncActiveFormatRecords();
    const syncedRecord = state.records.find((item) => item.id === record.id);
    if (!syncedRecord?._cloudId) {
      window.alert(`El registro quedo guardado en este equipo, pero no se pudo sincronizar con la nube.\n\nDetalle: ${getCloudErrorMessage()}`);
    }
  }
  return true;
}

function getCloudErrorMessage() {
  const error = state.cloudSyncError;
  if (!error) return "No se recibio detalle de Supabase. Verifica internet y que la tabla quality_records exista.";

  return [
    error.message,
    error.details,
    error.hint,
    error.code ? `Codigo: ${error.code}` : "",
  ].filter(Boolean).join(" | ");
}

function saveRecords(formatId = state.activeFormatId, records = state.records) {
  localStorage.setItem(getStorageKey(formatId), JSON.stringify(records));
}

function getStorageKey(formatId = state.activeFormatId) {
  return FORMAT_STORAGE_KEYS[formatId] || STORAGE_KEY;
}

async function deleteRecord(index) {
  const record = state.records[index];
  if (canSyncCloud() && record?._cloudId) {
    const { error } = await supabaseClient.from("quality_records").delete().eq("id", record._cloudId);
    if (error) {
      window.alert("No se pudo eliminar el registro en la nube.");
      return;
    }
  }

  if (!canSyncCloud() && record?._cloudId) {
    record._deleted = true;
    record._syncStatus = "pending-delete";
    saveRecords();
    state.records = state.records.filter((item) => !item._deleted);
  } else {
    state.records.splice(index, 1);
    saveRecords();
  }

  renderRecords();
}

async function clearRecords() {
  if (!state.records.length) return;
  if (!window.confirm("¿Deseas borrar todos los registros agregados?")) return;

  if (canSyncCloud()) {
    let query = supabaseClient.from("quality_records").delete().eq("format_id", state.activeFormatId);
    if (!isSuperUser()) query = query.eq("user_id", state.authUser.id);

    const { error } = await query;
    if (error) {
      window.alert("No se pudieron borrar los registros en la nube.");
      return;
    }
    state.records = [];
    saveRecords();
    renderRecords();
    return;
  }

  const deleteMarkers = state.records
    .filter((record) => record._cloudId)
    .map((record) => ({ ...record, _deleted: true, _syncStatus: "pending-delete" }));
  state.records = deleteMarkers;
  saveRecords();
  state.records = [];
  renderRecords();
}

function canUseCloud() {
  return Boolean(state.cloudEnabled && supabaseClient && state.authUser);
}

function canSyncCloud() {
  return canUseCloud() && navigator.onLine;
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
        <td>${escapeHtml(record.fecha)}</td>
        <td>${escapeHtml(record.lote)}</td>
        <td>${escapeHtml(record.cuarto)}</td>
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
      record.medidas.seccionMaduracion,
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
      Fecha: record.fecha,
      Lote: record.lote,
      "Cuarto de maduracion": record.cuarto,
      Seccion: record.medidas.seccionMaduracion,
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
