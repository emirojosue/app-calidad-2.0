var {
  STORAGE_KEY,
  OTHER_VALUE,
  CLOUD_CONFIG,
  SUPER_USER_NAME,
  SUPER_USER_EMAIL,
  USERNAME_DOMAIN,
  FORMAT_STORAGE_KEYS,
  ASEO_GROUPS_STORAGE_KEY,
  ASEO_DRAFTS_STORAGE_KEY,
  ASEO_ACTIVE_AREA_STORAGE_KEY,
  FORM_DRAFTS_STORAGE_KEY,
  OFFLINE_AUTH_STORAGE_KEY,
  measurementGroups,
  brixRange,
  binaryOptions,
  rememberedGeneralFormats,
  generalFieldIds,
  reciboFirstRecordAutofillTitles,
  reciboFirstRecordAutofillIds,
  maduracionFirstRecordAutofillIds,
  cuartoMaduracionOptions,
  novedadesAreaOptions,
  aseoAreaOptions,
  aseoTargetMinutes,
  aseoComplianceOptions,
  aseoDelayReasons,
  brixSuggestions,
  tableColumns,
  prefreidoGroups,
  iqfGroups,
  reciboGroups,
  maduracionGroups,
  formatTitles,
} = window.ControlCalidadData;

var state = {
  records: [],
  calendarType: "gregorian",
  selectedDate: "",
  activeFormatId: "porcionado",
  authMode: "login",
  cloudEnabled: false,
  authUser: null,
  authProfile: null,
  authOfflineMode: false,
  authSignOutRequested: false,
  cloudSyncError: null,
  aseoDraftArea: "",
  lastAutoGeneralInfo: {
    fechaRegistro: "",
    loteProduccion: "",
    horaInicio: "",
  },
};

var DRAFT_DB_NAME = "control-calidad-drafts";
var DRAFT_DB_VERSION = 1;
var DRAFT_STORE_NAME = "draftDocuments";
var FORM_DRAFT_DOCUMENT_ID = "quality-form-drafts";
var ASEO_DRAFT_DOCUMENT_ID = "aseo-form-drafts";
var DRAFT_SCHEMA_VERSION = 1;
var ACTIVE_DRAFT_FORMAT_STORAGE_KEY = `${STORAGE_KEY}:activeDraftFormat`;
var APP_TIME_ZONE = "America/Bogota";
var draftCache = {
  form: {},
  aseo: {},
};
var draftRevisionCounter = 0;
var draftWriteQueues = {};
var draftStatusTimer = null;
var elements = {};
var supabaseClient = null;
var backgroundSyncState = {
  active: new Set(),
  queued: new Map(),
  timers: new Map(),
};
var horaInicioClockTimer = null;
var horaInicioUserEdited = false;

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  cacheElements();
  bindEvents();
  registerServiceWorker();
  updateClock();
  setInterval(updateClock, 1000);
  requestPersistentStorage();
  await hydrateDraftCaches();

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
  elements.btnOpenNovedades = document.getElementById("btnOpenNovedades");
  elements.btnOpenAseo = document.getElementById("btnOpenAseo");
  elements.btnBackToMenu = document.getElementById("btnBackToMenu");
  elements.formatViewTitle = document.getElementById("formatViewTitle");
  elements.form = document.getElementById("qualityForm");
  elements.datePicker = document.getElementById("datePicker");
  elements.dateDisplay = document.getElementById("dateDisplay");
  elements.fechaRegistro = document.getElementById("fechaRegistro");
  elements.loteProduccion = document.getElementById("loteProduccion");
  elements.horaInicio = document.getElementById("horaInicio");
  elements.cuartoMaduracionLabel = document.getElementById("cuartoMaduracionLabel");
  elements.cuartoMaduracion = document.getElementById("cuartoMaduracion");
  elements.observaciones = document.getElementById("observaciones");
  elements.novedadesExtraFields = document.getElementById("novedadesExtraFields");
  elements.accionesCorrectivas = document.getElementById("accionesCorrectivas");
  elements.responsableNovedad = document.getElementById("responsableNovedad");
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
  elements.draftSaveStatus = document.getElementById("draftSaveStatus");
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
  elements.btnOpenNovedades.addEventListener("click", () => showFormatView("novedades"));
  elements.btnOpenAseo.addEventListener("click", () => showFormatView("aseo"));
  elements.btnBackToMenu.addEventListener("click", showMainMenu);
  elements.form.addEventListener("submit", addRecord);
  elements.datePicker.addEventListener("change", () => {
    handleDateChange();
    applyRememberedGeneralInfo();
    applyReciboFirstRecordInfo();
    applyMaduracionFirstRecordInfo();
    saveCurrentFormDraft();
  });
  elements.cuartoMaduracion.addEventListener("change", () => {
    if (state.activeFormatId === "aseo") {
      handleAseoAreaChange();
      return;
    }
  });
  elements.form.addEventListener("input", (event) => {
    saveCurrentFormDraft();
    if (state.activeFormatId === "aseo") {
      handleAseoFormDraftEvent(event);
    }
  });

  if (elements.horaInicio) {
    elements.horaInicio.addEventListener('input', () => {
      horaInicioUserEdited = true;
      if (horaInicioClockTimer) clearInterval(horaInicioClockTimer);
    });
    elements.horaInicio.addEventListener('focus', () => {
      horaInicioUserEdited = true;
      if (horaInicioClockTimer) clearInterval(horaInicioClockTimer);
    });
  }
  elements.form.addEventListener("change", (event) => {
    saveCurrentFormDraft();
    if (state.activeFormatId === "aseo") {
      handleAseoFormDraftEvent(event);
      if (event.target.id !== "cuartoMaduracion") updateAseoCalculations();
    }
  });
  elements.btnDownload.addEventListener("click", downloadExcel);
  elements.btnShareFile.addEventListener("click", shareRecordsFile);
  elements.btnClearForm.addEventListener("click", () => {
    if (!window.confirm("Eliminar el borrador actual y limpiar el formulario?")) return;
    if (state.activeFormatId === "aseo") clearAseoDraft(getCurrentAseoArea());
    clearCurrentFormDraft();
    clearFormInputs();
    updateDraftSaveStatus("Borrador eliminado");
  });
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

  elements.measurementsContainer.addEventListener("click", handleAseoDynamicClick);
  elements.measurementsContainer.addEventListener("change", handleAseoDynamicChange);
  elements.measurementsContainer.addEventListener("input", handleAseoDynamicInput);

  window.addEventListener("offline", () => {
    flushCurrentDrafts();
    if (state.authUser) {
      state.authOfflineMode = true;
      renderAuthHeader();
    }
    updateDraftSaveStatus("Borrador guardado");
  });

  window.addEventListener("online", () => {
    flushCurrentDrafts();
    recoverCloudSession().then(() => {
      queueAllFormatSyncs({ delay: 1000 });
    });
  });

  window.addEventListener("beforeunload", () => {
    flushCurrentDrafts();
  });

  window.addEventListener("pagehide", () => {
    flushCurrentDrafts();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushCurrentDrafts();
    }
  });
}

function startHoraInicioClock() {
  if (!elements.horaInicio) return;
  // Do not override if a value already exists (e.g., restored draft)
  if (elements.horaInicio.value) return;

  // initial set
  elements.horaInicio.value = getCurrentBogotaTimeInputValue();

  if (horaInicioClockTimer) clearInterval(horaInicioClockTimer);
  horaInicioClockTimer = setInterval(() => {
    if (horaInicioUserEdited) {
      clearInterval(horaInicioClockTimer);
      horaInicioClockTimer = null;
      return;
    }
    try {
      elements.horaInicio.value = getCurrentBogotaTimeInputValue();
    } catch (err) {}
  }, 1000);
}

function stopHoraInicioClock() {
  if (horaInicioClockTimer) {
    clearInterval(horaInicioClockTimer);
    horaInicioClockTimer = null;
  }
}

function flushCurrentDrafts() {
  saveCurrentFormDraft({ immediate: true });
  if (state.activeFormatId === "aseo") saveAseoDraft(getCurrentAseoArea(), { immediate: true });
}

function persistDraftsSync() {
  try {
    // Persist current form draft synchronously to localStorage to survive reloads
    if (elements.form) {
      rememberActiveDraftFormat(state.activeFormatId);
      const values = collectFormDraftValues();
      const draftKey = getCurrentDraftKey();
      const drafts = getFormDrafts();
      drafts[draftKey] = {
        schemaVersion: DRAFT_SCHEMA_VERSION,
        revision: nextDraftRevision(),
        updatedAt: new Date().toISOString(),
        calendarType: state.calendarType,
        selectedDate: state.selectedDate,
        datePickerValue: elements.datePicker.value,
        values,
      };
      try {
        localStorage.setItem(FORM_DRAFTS_STORAGE_KEY, JSON.stringify(cloneDraftData(drafts)));
      } catch (err) {
        console.warn('No se pudo escribir mirror de borradores en localStorage', err);
      }
    }

    // Persist aseo draft if active
    if (state.activeFormatId === 'aseo') {
      const area = getCurrentAseoArea();
      if (area) {
        const aseoDrafts = getAseoDrafts();
        aseoDrafts[area] = {
          ...collectAseoDraftValues(),
          schemaVersion: DRAFT_SCHEMA_VERSION,
          revision: nextDraftRevision(),
          updatedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem(ASEO_DRAFTS_STORAGE_KEY, JSON.stringify(cloneDraftData(aseoDrafts)));
        } catch (err) {
          console.warn('No se pudo escribir mirror de aseo en localStorage', err);
        }
      }
    }
  } catch (error) {
    console.warn('persistDraftsSync falló', error);
  }
}

async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return;

  try {
    await navigator.storage.persist();
  } catch (error) {
    console.warn("No se pudo solicitar almacenamiento persistente", error);
  }
}

async function hydrateDraftCaches() {
  draftCache.form = readLocalDraftDocument(FORM_DRAFTS_STORAGE_KEY);
  draftCache.aseo = readLocalDraftDocument(ASEO_DRAFTS_STORAGE_KEY);

  try {
    const [formDocument, aseoDocument] = await Promise.all([
      readDraftDocument(FORM_DRAFT_DOCUMENT_ID),
      readDraftDocument(ASEO_DRAFT_DOCUMENT_ID),
    ]);

    draftCache.form = mergeDraftCollections(draftCache.form, formDocument?.drafts || {});
    draftCache.aseo = mergeDraftCollections(draftCache.aseo, aseoDocument?.drafts || {});

    queueDraftDocumentSave(FORM_DRAFT_DOCUMENT_ID, draftCache.form, { showStatus: false });
    queueDraftDocumentSave(ASEO_DRAFT_DOCUMENT_ID, draftCache.aseo, { showStatus: false });
  } catch (error) {
    console.error("No se pudieron hidratar los borradores desde IndexedDB", error);
    updateDraftSaveStatus("Error al guardar", true);
  }
}

function readLocalDraftDocument(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function mergeDraftCollections(primary = {}, secondary = {}) {
  return Object.keys(secondary).reduce((drafts, key) => {
    const current = drafts[key];
    const candidate = secondary[key];
    drafts[key] = isNewerDraft(candidate, current) ? candidate : current;
    return drafts;
  }, { ...primary });
}

function isNewerDraft(candidate, current) {
  if (!current) return true;
  if (!candidate) return false;
  const candidateRevision = Number(candidate.revision || 0);
  const currentRevision = Number(current.revision || 0);
  if (candidateRevision !== currentRevision) return candidateRevision > currentRevision;
  return String(candidate.updatedAt || "") > String(current.updatedAt || "");
}

function openDraftDatabase() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB no esta disponible"));

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DRAFT_DB_NAME, DRAFT_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DRAFT_STORE_NAME)) {
        database.createObjectStore(DRAFT_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("No se pudo abrir IndexedDB"));
    request.onblocked = () => reject(new Error("IndexedDB esta bloqueada por otra pestana"));
  });
}

async function withDraftStore(mode, callback) {
  const database = await openDraftDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DRAFT_STORE_NAME, mode);
    const store = transaction.objectStore(DRAFT_STORE_NAME);
    let callbackResult;

    transaction.oncomplete = () => {
      database.close();
      resolve(callbackResult);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error("Error de transaccion IndexedDB"));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error("Transaccion IndexedDB cancelada"));
    };

    callbackResult = callback(store);
  });
}

async function readDraftDocument(id) {
  const database = await openDraftDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DRAFT_STORE_NAME, "readonly");
    const request = transaction.objectStore(DRAFT_STORE_NAME).get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("No se pudo leer el borrador"));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error("Error leyendo IndexedDB"));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error("Lectura IndexedDB cancelada"));
    };
  });
}

function queueDraftDocumentSave(id, drafts, { showStatus = true } = {}) {
  const storageKey = id === ASEO_DRAFT_DOCUMENT_ID ? ASEO_DRAFTS_STORAGE_KEY : FORM_DRAFTS_STORAGE_KEY;
  const safeDrafts = cloneDraftData(drafts);
  const document = {
    id,
    schemaVersion: DRAFT_SCHEMA_VERSION,
    revision: nextDraftRevision(),
    updatedAt: new Date().toISOString(),
    drafts: safeDrafts,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(safeDrafts));
  } catch (error) {
    console.error("No se pudo actualizar el espejo local del borrador", error);
  }

  if (showStatus) updateDraftSaveStatus("Guardando...");

  const previousWrite = draftWriteQueues[id] || Promise.resolve();
  draftWriteQueues[id] = previousWrite
    .catch(() => {})
    .then(() => writeDraftDocument(document))
    .then(() => {
      if (showStatus) updateDraftSaveStatus("Borrador guardado");
    })
    .catch((error) => {
      console.error("No se pudo guardar el borrador en IndexedDB", error);
      if (showStatus) updateDraftSaveStatus("Error al guardar", true);
    });

  return draftWriteQueues[id];
}

async function writeDraftDocument(document) {
  await withDraftStore("readwrite", (store) => store.put(document));
}

function cloneDraftData(value) {
  try {
    return JSON.parse(JSON.stringify(value || {}));
  } catch {
    return {};
  }
}

function nextDraftRevision() {
  draftRevisionCounter += 1;
  return Date.now() * 1000 + draftRevisionCounter;
}

function updateDraftSaveStatus(message, isError = false) {
  if (!elements.draftSaveStatus) return;

  window.clearTimeout(draftStatusTimer);
  elements.draftSaveStatus.textContent = message;
  elements.draftSaveStatus.dataset.status = isError ? "error" : "";

  if (message === "Borrador guardado" || message === "Borrador eliminado") {
    draftStatusTimer = window.setTimeout(() => {
      if (elements.draftSaveStatus) elements.draftSaveStatus.textContent = message;
    }, 1500);
  }
}

async function initializeAppView() {
  const startupDraftFormatId = getStartupDraftFormatId();
  if (startupDraftFormatId) {
    state.activeFormatId = startupDraftFormatId;
    elements.formatViewTitle.textContent = formatTitles[startupDraftFormatId];
  }

  const hasVisibleDraft = !startupDraftFormatId && hasCurrentVisibleFormData();
  if (hasVisibleDraft) flushCurrentDrafts();

  updateFormatSpecificFields();
  if (state.activeFormatId === "aseo") restoreLastAseoArea();
  renderMeasurementFields();
  renderTableHeader();
  if (!hasVisibleDraft) setInitialDateTime();
  loadRecords();
  if (state.activeFormatId === "aseo") {
    state.aseoDraftArea = getCurrentAseoArea();
    renderAseoMembers();
    loadAseoDraftForArea(state.aseoDraftArea);
    updateAseoCalculations();
  }
  await loadCurrentFormDraft();

  // Start live clock for horaInicio (if field not populated by draft)
  startHoraInicioClock();

  if (startupDraftFormatId) {
    elements.mainMenu.hidden = true;
    elements.porcionadoView.hidden = false;
  }
}

async function showFormatView(formatId) {
  saveCurrentFormDraft({ immediate: true });
  if (state.activeFormatId === "aseo") saveAseoDraft(getCurrentAseoArea(), { immediate: true });
  state.activeFormatId = formatId;
  rememberActiveDraftFormat(formatId);
  elements.formatViewTitle.textContent = formatTitles[formatId];
  updateFormatSpecificFields();
  if (state.activeFormatId === "aseo") restoreLastAseoArea();
  renderMeasurementFields();
  renderTableHeader();
  handleDateChange();
  clearFormInputs();
  if (state.activeFormatId === "aseo") {
    state.aseoDraftArea = getCurrentAseoArea();
    renderAseoMembers();
    loadAseoDraftForArea(state.aseoDraftArea);
    updateAseoCalculations();
  }
  loadRecords({ queueSync: false });
  applyRememberedGeneralInfo();
  applyReciboFirstRecordInfo();
  applyMaduracionFirstRecordInfo();
  await loadCurrentFormDraft();
  // Ensure horaInicio live clock runs when switching views
  startHoraInicioClock();
  elements.mainMenu.hidden = true;
  elements.porcionadoView.hidden = false;
  elements.porcionadoView.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateFormatSpecificFields() {
  const isNovedades = state.activeFormatId === "novedades";
  const isAseo = state.activeFormatId === "aseo";
  const options = isAseo ? aseoAreaOptions : (isNovedades ? novedadesAreaOptions : cuartoMaduracionOptions);

  elements.cuartoMaduracionLabel.textContent = isAseo || isNovedades ? "Area" : "Cuarto de maduracion";
  elements.cuartoMaduracion.innerHTML = [
    '<option value="">Seleccionar</option>',
    ...options.map((option) => `<option value="${option}">${option}</option>`),
  ].join("");

  elements.novedadesExtraFields.hidden = !isNovedades;
  [elements.accionesCorrectivas, elements.responsableNovedad].forEach((input) => {
    input.required = isNovedades;
    if (!isNovedades) input.value = "";
  });
}

function showMainMenu() {
  saveCurrentFormDraft();
  if (state.activeFormatId === "aseo") saveAseoDraft(getCurrentAseoArea());
  elements.porcionadoView.hidden = true;
  elements.mainMenu.hidden = false;
  elements.mainMenu.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setInitialDateTime() {
  const today = new Date();
  elements.datePicker.value = getCurrentBogotaDateInputValue(today);
  autofillGeneralField(elements.horaInicio, getCurrentBogotaTimeInputValue(today), "horaInicio");
  handleDateChange();
}

function renderMeasurementFields() {
  if (state.activeFormatId === "aseo") {
    elements.measurementsContainer.innerHTML = renderAseoFields();
    return;
  }

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
    bindMeasurementInputEvents();
    return;
  }

  if (state.activeFormatId === "novedades") {
    elements.measurementsContainer.innerHTML = "";
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
  const rangeAttributes = getRangeAttributes(field);

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
        ${rangeAttributes}
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
  const groupCount = getGroupCount(group);
  const fields = Array.from({ length: groupCount }, (_, index) => {
    const number = index + 1;
    const id = `${group.id}${number}`;
    const suffix = groupCount === 1 ? "" : ` ${number}`;
    const fieldLabel = `${group.label}${suffix} (${group.unit})`;

    if (group.inputType) {
      return `
        <div class="measure-item">
          <label for="${id}">${fieldLabel}</label>
          <input
            class="form-control measure-input"
            type="${group.inputType}"
            id="${id}"
            step="${group.step || 1}"
            required
          >
        </div>
      `;
    }

    return `
      <div class="measure-item">
        <label for="${id}">${fieldLabel}</label>
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
      "Temperatura cuarto de maduracion (24&deg;C-27&deg;C)",
      "Humedad relativa cuarto de maduracion (80%Hr-90%Hr)",
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
      "Longitud",
      "Diametro",
      "Plaga",
      "Brix",
      "Olor",
      "Color",
      "Estado",
      "Realizado",
      "Verificado",
      "Obs.",
      "Accion",
    ];
  }

  if (state.activeFormatId === "novedades") {
    return [
      "#",
      "Fecha",
      "Semana/Año",
      "Hora",
      "Lote",
      "Area",
      "Estado",
      "Realizado",
      "Verificado",
      "Observaciones",
      "Acciones correctivas",
      "Responsable",
      "Accion",
    ];
  }

  if (state.activeFormatId === "aseo") {
    return [
      "#",
      "Fecha",
      "Area",
      "Integrantes",
      "Lider",
      "Hora inicio",
      "Hora fin",
      "Tiempo real",
      "Tiempo",
      "Calidad",
      "Asistencia",
      "Herramientas",
      "Nota final",
      "Clasificacion",
      "Ausentes",
      "Motivo demora",
      "Observaciones",
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
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js?v=56").then((registration) => {
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
    elements.datePicker.value = state.selectedDate || getCurrentBogotaDateInputValue();
  } else {
    elements.datePicker.type = "text";
    elements.datePicker.placeholder = "YYYY-DDD (ej: 2026-121)";
    elements.datePicker.value = gregorianToJulian(state.selectedDate || getCurrentBogotaDateInputValue());
  }

  handleDateChange();
  saveCurrentFormDraft();
}

function handleDateChange() {
  const value = elements.datePicker.value;
  const gregorianDate = state.calendarType === "gregorian" ? value : julianToGregorian(value);
  const julianDate = state.calendarType === "gregorian" ? gregorianToJulian(value) : value;

  if (!gregorianDate || !julianDate) {
    elements.dateDisplay.textContent = "Fecha no válida";
    autofillGeneralField(elements.fechaRegistro, "", "fechaRegistro");
    autofillGeneralField(elements.loteProduccion, "", "loteProduccion");
    return;
  }

  state.selectedDate = gregorianDate;

  const date = parseDateInputValue(gregorianDate);
  if (!date) {
    elements.dateDisplay.textContent = "Fecha no valida";
    autofillGeneralField(elements.fechaRegistro, "", "fechaRegistro");
    autofillGeneralField(elements.loteProduccion, "", "loteProduccion");
    return;
  }

  const formattedDate = date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  elements.dateDisplay.textContent = formattedDate;
  autofillGeneralField(elements.fechaRegistro, formattedDate, "fechaRegistro");
  autofillGeneralField(elements.loteProduccion, getLotCode(gregorianDate), "loteProduccion");
  syncValueFromFields();
}

function autofillGeneralField(field, value, stateKey) {
  if (!field) return;

  const previousAutoValue = state.lastAutoGeneralInfo[stateKey] || "";
  const canAutofill = !field.value || field.value === previousAutoValue;
  if (canAutofill) field.value = value;
  state.lastAutoGeneralInfo[stateKey] = value;
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

  const date = parseDateInputValue(dateString);
  if (!date) return "";

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
  const date = parseDateInputValue(dateString);
  if (!date) return "";

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
  const date = parseDateInputValue(dateString);
  if (!date) return "";

  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date - start) / 86400000) + 1;

  return `${String(dayOfYear).padStart(3, "0")}-${year}`;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentBogotaDateInputValue(date = new Date()) {
  const parts = getBogotaDateTimeParts(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getCurrentBogotaTimeInputValue(date = new Date()) {
  const parts = getBogotaDateTimeParts(date, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${parts.hour}:${parts.minute}`;
}

function getBogotaDateTimeParts(date, options) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    ...options,
  }).formatToParts(date).reduce((parts, item) => {
    if (item.type !== "literal") parts[item.type] = item.value;
    return parts;
  }, {});
}

function parseDateInputValue(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString || "");
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function getMonthName(dateString) {
  if (!dateString) return "";

  const date = parseDateInputValue(dateString);
  if (!date) return "";

  return date.toLocaleDateString("es-CO", { month: "long" });
}

function getMonthNameFromDisplay(displayDate) {
  const match = String(displayDate || "").match(/ de ([a-zA-ZÃ¡Ã©Ã­Ã³ÃºÃ±]+) de /i);
  return match ? match[1] : "";
}

function getDateInputFromRecord(record) {
  if (record.fechaIso) return record.fechaIso;

  const match = String(record.fecha || "").match(/^(\d{1,2}) de ([a-zA-ZáéíóúñÁÉÍÓÚÑ]+) de (\d{4})$/i);
  if (!match) return "";

  const monthNames = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    setiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
  };
  const monthKey = match[2].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const monthIndex = monthNames[monthKey];
  if (monthIndex === undefined) return "";

  return toDateInputValue(new Date(Number(match[3]), monthIndex, Number(match[1])));
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
  saveCurrentFormDraft();
  handleDateChange();
  if (state.activeFormatId === "aseo") updateAseoCalculations();

  if (!elements.form.reportValidity()) return;

  if (state.activeFormatId === "aseo") {
    const record = buildAseoRecord();
    if (!record) return;
    const saved = await saveRecord(record);
    if (!saved) return;
    clearAseoDraft(record.cuarto);
    clearCurrentFormDraft();
    renderRecords();
    renderAseoSavedSummary(record);
    resetFormAfterSave();
    return;
  }

  const record = {
    fechaIso: state.selectedDate,
    fecha: getValue("fechaRegistro"),
    mes: getMonthName(state.selectedDate),
    fechaJuliana: getWeekYear(state.selectedDate),
    loteMateriaPrima: state.activeFormatId === "iqf" ? getDayOfYearCode(state.selectedDate) : "",
    hora: getValue("horaInicio"),
    cuarto: getValue("cuartoMaduracion"),
    lote: getValue("loteProduccion"),
    realizadoPor: getValue("realizadoPor"),
    verificadoPor: getValue("verificadoPor"),
    referencia: state.activeFormatId === "iqf" ? getValue("referenciaIqf") : "",
    arte: state.activeFormatId === "iqf" ? getValue("arteIqf") : "",
    resistencia: state.activeFormatId === "iqf" ? getValue("resistenciaIqf") : "",
    observaciones: getValue("observaciones"),
    accionesCorrectivas: state.activeFormatId === "novedades" ? getValue("accionesCorrectivas") : "",
    responsableNovedad: state.activeFormatId === "novedades" ? getValue("responsableNovedad") : "",
    medidas: collectMeasurements(),
    briz: state.activeFormatId === "porcionado" ? collectBriz() : [],
  };

  record.id = crypto.randomUUID?.() || String(Date.now());
  record.estado = getRecordStatus(record);
  const saved = await saveRecord(record);
  if (!saved) return;
  clearCurrentFormDraft();
  renderRecords();
  resetFormAfterSave();
}

function buildAseoRecord() {
  const area = getCurrentAseoArea();
  const group = getCurrentAseoGroup();
  const evaluation = calculateAseoEvaluation();
  const absentees = getSelectedAseoAbsentees();
  const absentCount = getAseoAbsentCount();
  const delayReason = getValue("aseoMotivoDemora");
  const delayOther = getValue("aseoMotivoDemoraOtro");
  const dateIso = getValue("aseoFecha") || state.selectedDate || getCurrentBogotaDateInputValue();

  if (!area) {
    window.alert("Seleccione el area de aseo.");
    return null;
  }
  if (!group.members.length) {
    window.alert("Agregue al menos un integrante del grupo.");
    return null;
  }
  if (!group.leader) {
    window.alert("Seleccione un integrante como lider.");
    return null;
  }
  if (getValue("aseoAusencias") === "Si" && absentCount !== absentees.length) {
    window.alert("La cantidad de ausentes debe coincidir con las personas seleccionadas.");
    return null;
  }
  if (evaluation.realMinutes > evaluation.targetMinutes && (!delayReason || (delayReason === "Otro" && !delayOther))) {
    window.alert("Registre el motivo de demora.");
    return null;
  }

  const date = parseDateInputValue(dateIso);
  const fecha = date ? date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : dateIso;

  return {
    id: crypto.randomUUID?.() || String(Date.now()),
    fechaIso: dateIso,
    fecha,
    mes: getMonthName(dateIso),
    fechaJuliana: getWeekYear(dateIso),
    hora: getValue("aseoHoraInicio"),
    horaFin: getValue("aseoHoraFin"),
    cuarto: area,
    lote: "",
    realizadoPor: getValue("realizadoPor"),
    verificadoPor: getValue("verificadoPor"),
    observaciones: getValue("observaciones"),
    estado: evaluation.classification,
    medidas: {
      integrantes: group.members,
      lider: group.leader,
      horaInicio: getValue("aseoHoraInicio"),
      horaFin: getValue("aseoHoraFin"),
      tiempoRealMinutos: evaluation.realMinutes,
      tiempoReal: evaluation.realTimeLabel,
      tiempoObjetivoMinutos: evaluation.targetMinutes,
      ausencias: getValue("aseoAusencias"),
      cantidadAusentes: absentCount,
      ausentes: absentees,
      calidad: getValue("aseoCalidad"),
      herramientas: getValue("aseoHerramientas"),
      puntajeTiempo: evaluation.timeScore,
      puntajeCalidad: evaluation.qualityScore,
      puntajeAsistencia: evaluation.attendanceScore,
      puntajeHerramientas: evaluation.toolsScore,
      notaFinal: Number(evaluation.finalScore.toFixed(2)),
      clasificacion: evaluation.classification,
      motivoDemora: delayReason === "Otro" ? delayOther : delayReason,
    },
    briz: [],
  };
}

function renderAseoSavedSummary(record) {
  window.alert([
    "Evaluacion de aseo guardada",
    `Fecha: ${record.fecha}`,
    `Area: ${record.cuarto}`,
    `Integrantes: ${record.medidas.integrantes.join(", ")}`,
    `Lider: ${record.medidas.lider}`,
    `Hora inicio: ${record.medidas.horaInicio}`,
    `Hora fin: ${record.medidas.horaFin}`,
    `Tiempo real: ${record.medidas.tiempoReal}`,
    `Puntaje tiempo: ${record.medidas.puntajeTiempo}`,
    `Puntaje calidad: ${record.medidas.puntajeCalidad}`,
    `Puntaje asistencia: ${record.medidas.puntajeAsistencia}`,
    `Puntaje uso de herramientas: ${record.medidas.puntajeHerramientas}`,
    `Nota final: ${record.medidas.notaFinal}`,
    `Clasificacion: ${record.medidas.clasificacion}`,
    `Ausentes: ${record.medidas.ausentes.join(", ") || "Ninguno"}`,
    `Motivo de demora: ${record.medidas.motivoDemora || "-"}`,
    `Observaciones: ${record.observaciones || "-"}`,
  ].join("\n"));
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

  if (state.activeFormatId === "novedades") {
    return {};
  }

  if (state.activeFormatId === "aseo") {
    return {};
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
    result[group.id] = Array.from({ length: getGroupCount(group) }, (_, index) => getValue(`${group.id}${index + 1}`));
    return result;
  }, {});
}

function collectBriz() {
  return Array.from({ length: 5 }, (_, index) => getValue(`briz${index + 1}`));
}

function getRecordStatus(record) {
  if (state.activeFormatId === "maduracion") {
    const hasOutOfRange = maduracionGroups.some((field) => {
      if (field.min === undefined && field.max === undefined) return false;

      const number = parseMeasurementNumber(record.medidas[field.id]);
      const underMin = field.min !== undefined && number < field.min;
      const overMax = field.max !== undefined && number > field.max;

      return Number.isNaN(number) || underMin || overMax;
    });

    return hasOutOfRange ? "Revisar" : "OK";
  }

  if (state.activeFormatId === "novedades") {
    return "OK";
  }

  if (state.activeFormatId === "aseo") {
    return record.medidas.clasificacion || "Requiere mejora";
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
    const hasNonConforming = [
      "verificacionLoteado",
      "selladoVertical",
      "selladoHorizontal",
      "detectorMetalesIqf",
      "materialExtranoIqf",
      "arteIqf",
      "resistenciaIqf",
    ].some((groupId) => {
      return record.medidas[groupId].some((value) => ["No conforme", "Presente", "Presencia"].includes(value));
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
    if (group.min === undefined && group.max === undefined) return false;

    return record.medidas[group.id].some((value) => {
      const number = parseMeasurementNumber(value);
      const underMin = group.min !== undefined && number < group.min;
      const overMax = group.max !== undefined && number > group.max;

      return Number.isNaN(number) || underMin || overMax;
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
  if (state.activeFormatId === "aseo") {
    renderAseoMembers();
    updateAseoCalculations();
  }
  applyReciboFirstRecordInfo();
  applyMaduracionFirstRecordInfo();
}

function getFormDrafts() {
  return draftCache.form;
}

function getCurrentDraftKey() {
  return state.activeFormatId;
}

function saveCurrentFormDraft({ immediate = false } = {}) {
  if (!elements.form) return;
  rememberActiveDraftFormat(state.activeFormatId);

  const values = collectFormDraftValues();
  const draftKey = getCurrentDraftKey();
  const existingDraft = draftCache.form[draftKey];
  const hasSelectedDate = Boolean(state.selectedDate || elements.datePicker.value);
  if (!hasFormDraftValues(values) && !hasSelectedDate && !existingDraft) return;

  const drafts = getFormDrafts();
  drafts[draftKey] = {
    schemaVersion: DRAFT_SCHEMA_VERSION,
    revision: nextDraftRevision(),
    updatedAt: new Date().toISOString(),
    calendarType: state.calendarType,
    selectedDate: state.selectedDate,
    datePickerValue: elements.datePicker.value,
    values,
  };
  queueDraftDocumentSave(FORM_DRAFT_DOCUMENT_ID, drafts, { showStatus: !immediate });
}

function rememberActiveDraftFormat(formatId = state.activeFormatId) {
  if (!formatId) return;

  try {
    localStorage.setItem(ACTIVE_DRAFT_FORMAT_STORAGE_KEY, formatId);
  } catch (error) {
    console.error("No se pudo recordar el formato activo", error);
  }
}

function getStartupDraftFormatId() {
  const drafts = getFormDrafts();
  const savedFormatId = readActiveDraftFormat();
  if (hasStoredFormDraft(savedFormatId, drafts)) return savedFormatId;

  return Object.keys(drafts).find((formatId) => hasStoredFormDraft(formatId, drafts)) || "";
}

function readActiveDraftFormat() {
  try {
    return localStorage.getItem(ACTIVE_DRAFT_FORMAT_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function hasStoredFormDraft(formatId, drafts = getFormDrafts()) {
  if (!formatId || !formatTitles[formatId]) return false;

  const draft = drafts[formatId];
  if (!draft?.values) return false;
  return Boolean(draft.selectedDate || draft.datePickerValue || hasFormDraftValues(draft.values));
}

function collectFormDraftValues() {
  const fields = Array.from(elements.form.elements || []);
  return fields.reduce((values, field) => {
    const key = getFormDraftFieldKey(field);
    if (!key || field.type === "button" || field.type === "submit" || field.disabled) return values;

    if (field.type === "checkbox") {
      values[key] = field.checked;
      return values;
    }

    if (field.type === "radio") {
      if (field.checked) values[key] = field.value;
      return values;
    }

    values[key] = field.value;
    return values;
  }, {});
}

function getFormDraftFieldKey(field) {
  if (!field) return "";
  if (field.id) return field.id;
  if (field.name) return `name:${field.name}`;
  if (field.dataset.aseoLeader !== undefined) return `aseoLeader:${field.value}`;
  if (field.dataset.aseoAbsent !== undefined) return `aseoAbsent:${field.value}`;
  return "";
}

function hasFormDraftValues(values = {}) {
  return Object.entries(values).some(([id, value]) => {
    if (typeof value === "boolean") return value;
    return String(value || "").trim() !== "";
  });
}

function hasCurrentVisibleFormData() {
  if (!elements.form || elements.appShell?.hidden) return false;

  if (state.selectedDate || elements.datePicker?.value) return true;
  return hasFormDraftValues(collectFormDraftValues());
}

async function loadCurrentFormDraft() {
  const draft = getFormDrafts()[getCurrentDraftKey()];
  if (!draft?.values) return;

  if (draft.calendarType && draft.calendarType !== state.calendarType) {
    state.calendarType = draft.calendarType;
    document.querySelectorAll("[data-calendar-type]").forEach((button) => {
      button.classList.toggle("active", button.dataset.calendarType === state.calendarType);
    });
    elements.datePicker.type = state.calendarType === "gregorian" ? "date" : "text";
    elements.datePicker.placeholder = state.calendarType === "gregorian" ? "" : "YYYY-DDD (ej: 2026-121)";
  }

  if (draft.selectedDate) state.selectedDate = draft.selectedDate;
  if (draft.datePickerValue || draft.selectedDate) {
    elements.datePicker.value = draft.datePickerValue || draft.selectedDate;
    handleDateChange();
  }

  Object.entries(draft.values).forEach(([id, value]) => {
    restoreFormDraftField(id, value);
  });

  if (state.activeFormatId === "aseo") {
    state.aseoDraftArea = getCurrentAseoArea();
    renderAseoMembers();
    updateAseoCalculations();
  }

  updateDraftSaveStatus("Borrador guardado");
}

function restoreFormDraftField(key, value) {
  const field = getFormDraftField(key, value);
  if (!field) return;
  if (isGeneralAutofillField(field) && !value && field.value) return;

  if (field.type === "checkbox") {
    field.checked = Boolean(value);
  } else if (field.type === "radio") {
    field.checked = field.value === value;
  } else {
    field.value = value;
  }

  if (field.dataset.otherTarget) toggleOtherInput(field);
  if (field.dataset.rangeMin !== undefined || field.dataset.rangeMax !== undefined) checkRange(field);
}

function isGeneralAutofillField(field) {
  return ["fechaRegistro", "loteProduccion", "horaInicio"].includes(field.id);
}

function getFormDraftField(key, value) {
  const directField = document.getElementById(key);
  if (directField) return directField;

  if (key.startsWith("name:")) {
    const name = key.slice(5);
    return Array.from(elements.form.elements || []).find((field) => field.name === name && field.value === value)
      || Array.from(elements.form.elements || []).find((field) => field.name === name);
  }

  if (key.startsWith("aseoLeader:")) {
    const leader = key.slice(11);
    return Array.from(document.querySelectorAll("[data-aseo-leader]")).find((field) => field.value === leader);
  }

  if (key.startsWith("aseoAbsent:")) {
    const absent = key.slice(11);
    return Array.from(document.querySelectorAll("[data-aseo-absent]")).find((field) => field.value === absent);
  }

  return null;
}

function clearCurrentFormDraft() {
  const drafts = getFormDrafts();
  delete drafts[getCurrentDraftKey()];
  queueDraftDocumentSave(FORM_DRAFT_DOCUMENT_ID, drafts);
  clearRememberedActiveDraftFormatIfEmpty();
}

function clearRememberedActiveDraftFormatIfEmpty() {
  if (Object.keys(getFormDrafts()).some((formatId) => hasStoredFormDraft(formatId))) return;

  try {
    localStorage.removeItem(ACTIVE_DRAFT_FORMAT_STORAGE_KEY);
  } catch (error) {
    console.error("No se pudo limpiar el formato activo del borrador", error);
  }
}

function clearFormInputs() {
  const selectedValues = {
    datePicker: elements.datePicker.value,
    fecha: elements.fechaRegistro.value,
    lote: elements.loteProduccion.value,
    hora: elements.horaInicio.value,
    area: elements.cuartoMaduracion.value,
  };
  const generalValues = shouldRememberGeneralInfo() ? getGeneralFormValues() : {};

  elements.form.reset();
  elements.datePicker.value = selectedValues.datePicker;
  elements.fechaRegistro.value = selectedValues.fecha;
  elements.loteProduccion.value = selectedValues.lote;
  elements.horaInicio.value = selectedValues.hora;
  if (state.activeFormatId === "aseo") elements.cuartoMaduracion.value = selectedValues.area;
  if (state.activeFormatId === "aseo") {
    const today = getCurrentBogotaDateInputValue();
    const aseoFecha = document.getElementById("aseoFecha");
    if (aseoFecha) aseoFecha.value = today;
  }
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
    if (!elements.horaInicio.value) elements.horaInicio.value = getCurrentBogotaTimeInputValue();
    return;
  }

  setGeneralFormValues({
    horaInicio: elements.horaInicio.value || record.hora,
    cuartoMaduracion: elements.cuartoMaduracion.value || record.cuarto,
    realizadoPor: getValue("realizadoPor") || record.realizadoPor,
    verificadoPor: getValue("verificadoPor") || record.verificadoPor,
    observaciones: elements.observaciones.value || record.observaciones,
  });
}

function applyReciboFirstRecordInfo() {
  if (state.activeFormatId !== "recibo" || !elements.fechaRegistro.value) return;

  const firstRecord = state.records.find((record) => record.fecha === elements.fechaRegistro.value);
  const values = firstRecord?.medidas || {};

  getReciboFirstRecordAutofillFields().forEach((field) => {
    const element = document.getElementById(field.id);
    if (!element) return;

    if (!element.value) element.value = values[field.id] ?? field.defaultValue ?? "";
  });
}

function getReciboFirstRecordAutofillFields() {
  return reciboGroups.filter((field) => {
    return reciboFirstRecordAutofillTitles.includes(field.title) || reciboFirstRecordAutofillIds.includes(field.id);
  });
}

function applyMaduracionFirstRecordInfo() {
  if (state.activeFormatId !== "maduracion" || !elements.fechaRegistro.value) return;

  const firstRecord = state.records.find((record) => record.fecha === elements.fechaRegistro.value);
  const values = firstRecord?.medidas || {};

  maduracionFirstRecordAutofillIds.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    if (!element.value) element.value = values[id] || "";
  });
}

function renderRecords() {
  const visibleRecords = state.activeFormatId === "aseo" ? getFilteredAseoRecords() : state.records;
  const recordIndexes = state.activeFormatId === "aseo"
    ? new Map(state.records.map((record, index) => [record.id, index]))
    : null;

  elements.recordCount.textContent = visibleRecords.length;
  elements.btnDownload.disabled = state.records.length === 0;
  elements.btnShareFile.disabled = state.records.length === 0;
  elements.btnClearRecords.disabled = state.records.length === 0;
  if (state.activeFormatId === "aseo") updateAseoHistoryIndicators(visibleRecords);

  if (visibleRecords.length === 0) {
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

  elements.recordsBody.innerHTML = visibleRecords
    .map((record, index) => renderRecordRow(record, recordIndexes?.get(record.id) ?? index))
    .join("");
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

  if (state.activeFormatId === "novedades") {
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(record.fecha)}</td>
        <td>${escapeHtml(record.fechaJuliana)}</td>
        <td>${escapeHtml(record.hora)}</td>
        <td>${escapeHtml(record.lote)}</td>
        <td>${escapeHtml(record.cuarto)}</td>
        <td><span class="status-badge ${statusClass}">${record.estado}</span></td>
        <td>${escapeHtml(record.realizadoPor)}</td>
        <td>${escapeHtml(record.verificadoPor)}</td>
        <td>${escapeHtml(record.observaciones || "-")}</td>
        <td>${escapeHtml(record.accionesCorrectivas || "-")}</td>
        <td>${escapeHtml(record.responsableNovedad || "-")}</td>
        <td>
          <button class="btn-delete" type="button" data-delete-index="${index}">
            <i class="bi bi-trash" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    `;
  }

  if (state.activeFormatId === "aseo") {
    const classificationClass = getAseoClassificationClass(record.medidas.clasificacion);
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(record.fecha)}</td>
        <td>${escapeHtml(record.cuarto)}</td>
        <td>${escapeHtml(record.medidas.integrantes.join(", "))}</td>
        <td>${escapeHtml(record.medidas.lider)}</td>
        <td>${escapeHtml(record.medidas.horaInicio)}</td>
        <td>${escapeHtml(record.medidas.horaFin)}</td>
        <td>${escapeHtml(record.medidas.tiempoReal)}</td>
        <td>${escapeHtml(record.medidas.puntajeTiempo)}</td>
        <td>${escapeHtml(record.medidas.puntajeCalidad)}</td>
        <td>${escapeHtml(record.medidas.puntajeAsistencia)}</td>
        <td>${escapeHtml(record.medidas.puntajeHerramientas)}</td>
        <td>${escapeHtml(record.medidas.notaFinal)}</td>
        <td><span class="status-badge ${classificationClass}">${escapeHtml(record.medidas.clasificacion)}</span></td>
        <td>${escapeHtml(record.medidas.ausentes.join(", ") || "-")}</td>
        <td>${escapeHtml(record.medidas.motivoDemora || "-")}</td>
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
      record.medidas.longitudRecibo,
      record.medidas.diametro,
      record.medidas.plaga,
      record.medidas.brixRecibo,
      record.medidas.olorRecibo,
      record.medidas.colorRecibo,
    ];
  }

  if (state.activeFormatId === "novedades") {
    return [];
  }

  if (state.activeFormatId === "aseo") {
    return [];
  }

  if (state.activeFormatId === "iqf") {
    return iqfGroups.flatMap((group) => record.medidas[group.id] || normalizeFixedArray([], getGroupCount(group)));
  }

  if (state.activeFormatId === "prefreido") {
    return prefreidoGroups.flatMap((group) => record.medidas[group.id] || normalizeFixedArray([], getGroupCount(group)));
  }

  return [
    ...measurementGroups.flatMap((group) => record.medidas[group.id] || normalizeFixedArray([], getGroupCount(group))),
    ...record.briz,
  ];
}

function getFilteredAseoRecords(records = state.records) {
  if (state.activeFormatId !== "aseo") return records;

  const fecha = getValue("aseoFilterFecha");
  const area = getValue("aseoFilterArea");
  const lider = getValue("aseoFilterLider").toLowerCase();
  const integrante = getValue("aseoFilterIntegrante").toLowerCase();
  const clasificacion = getValue("aseoFilterClasificacion");

  return records.filter((record) => {
    const members = record.medidas.integrantes.join(" ").toLowerCase();
    return (!fecha || record.fechaIso === fecha)
      && (!area || record.cuarto === area)
      && (!lider || record.medidas.lider.toLowerCase().includes(lider))
      && (!integrante || members.includes(integrante))
      && (!clasificacion || record.medidas.clasificacion === clasificacion);
  });
}

function updateAseoHistoryIndicators(visibleRecords = getFilteredAseoRecords()) {
  const container = document.getElementById("aseoIndicators");
  if (!container) return;

  const monthlyRecords = visibleRecords.filter((record) => isCurrentMonth(record.fechaIso));
  const timeCompliance = visibleRecords.length
    ? (visibleRecords.filter((record) => record.medidas.tiempoRealMinutos <= record.medidas.tiempoObjetivoMinutos).length / visibleRecords.length) * 100
    : 0;
  const byArea = buildAseoAverageList(monthlyRecords, (record) => record.cuarto);
  const byLeader = buildAseoAverageList(monthlyRecords, (record) => record.medidas.lider);
  const byGroup = buildAseoAverageList(monthlyRecords, (record) => record.medidas.integrantes.join(", "));

  container.innerHTML = `
    <div class="aseo-indicator-card">
      <span>Evaluaciones</span>
      <strong>${visibleRecords.length}</strong>
    </div>
    <div class="aseo-indicator-card">
      <span>Cumplimiento de tiempo</span>
      <strong>${timeCompliance.toFixed(1)}%</strong>
    </div>
    <div class="aseo-indicator-card">
      <span>Promedio mensual por area</span>
      <p>${formatAseoAverageList(byArea)}</p>
    </div>
    <div class="aseo-indicator-card">
      <span>Promedio mensual por lider</span>
      <p>${formatAseoAverageList(byLeader)}</p>
    </div>
    <div class="aseo-indicator-card">
      <span>Promedio mensual por grupo</span>
      <p>${formatAseoAverageList(byGroup)}</p>
    </div>
    <div class="aseo-indicator-card">
      <span>Ranking de grupos</span>
      <p>${formatAseoAverageList(byGroup.slice(0, 5))}</p>
    </div>
  `;
}

function isCurrentMonth(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function buildAseoAverageList(records, getKey) {
  const groups = new Map();
  records.forEach((record) => {
    const key = getKey(record) || "Sin dato";
    const current = groups.get(key) || { total: 0, count: 0 };
    current.total += Number(record.medidas.notaFinal) || 0;
    current.count += 1;
    groups.set(key, current);
  });

  return Array.from(groups.entries())
    .map(([key, value]) => ({ key, average: value.total / value.count, count: value.count }))
    .sort((a, b) => b.average - a.average);
}

function formatAseoAverageList(items) {
  if (!items.length) return "Sin registros";
  return items.map((item) => `${escapeHtml(item.key)}: ${item.average.toFixed(2)} (${item.count})`).join("<br>");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
