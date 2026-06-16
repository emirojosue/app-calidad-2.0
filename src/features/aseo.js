const ASEO_PEOPLE_STORAGE_KEY = `${STORAGE_KEY}:aseo:people`;

function renderAseoFields() {
  const today = toDateInputValue(new Date());

  return `
    <h2 class="section-title">
      <i class="bi bi-people-fill" aria-hidden="true"></i>
      Integrantes del grupo
    </h2>
    <div class="aseo-group-panel">
      <div class="aseo-member-list" id="aseoMembersList"></div>
      <div class="aseo-member-form">
        <input class="form-control" type="text" id="aseoMemberName" list="aseoSavedPeopleOptions" placeholder="Nombre del integrante">
        <datalist id="aseoSavedPeopleOptions"></datalist>
        <button class="btn-clear-form" type="button" id="btnAseoAddMember">
          <i class="bi bi-person-plus-fill" aria-hidden="true"></i>
          Agregar integrante
        </button>
      </div>
      <div class="aseo-saved-people" id="aseoSavedPeople"></div>
    </div>

    <h2 class="section-title">
      <i class="bi bi-clock-history" aria-hidden="true"></i>
      Tiempos y asistencia
    </h2>
    <div class="measurement-grid">
      <div class="measure-item">
        <label for="aseoFecha">Fecha</label>
        <input class="form-control measure-input" type="date" id="aseoFecha" value="${today}" required>
      </div>
      <div class="measure-item">
        <label for="aseoHoraInicio">Hora de inicio</label>
        <input class="form-control measure-input" type="time" id="aseoHoraInicio" required>
        <button class="btn-clear-form aseo-inline-button" type="button" id="btnAseoStart">Registrar inicio</button>
      </div>
      <div class="measure-item">
        <label for="aseoHoraFin">Hora de finalizacion</label>
        <input class="form-control measure-input" type="time" id="aseoHoraFin" required>
        <button class="btn-clear-form aseo-inline-button" type="button" id="btnAseoEnd">Registrar fin</button>
      </div>
      <div class="measure-item">
        <label>Tiempo real</label>
        <output class="aseo-output" id="aseoTiempoReal">-</output>
      </div>
      <div class="measure-item">
        <label for="aseoAusencias">Hubo ausencias?</label>
        <select class="form-select measure-input" id="aseoAusencias" required>
          <option value="No">No</option>
          <option value="Si">Si</option>
        </select>
      </div>
      <div class="measure-item" id="aseoAbsentCountWrap" hidden>
        <label for="aseoCantidadAusentes">Cantidad de ausentes</label>
        <select class="form-select measure-input" id="aseoCantidadAusentes">
          <option value="">Seleccionar</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>
    </div>
    <div class="aseo-absent-panel" id="aseoAbsentPanel" hidden>
      <label class="form-label">Personas ausentes</label>
      <div class="aseo-check-list" id="aseoAbsentList"></div>
    </div>

    <h2 class="section-title">
      <i class="bi bi-ui-checks" aria-hidden="true"></i>
      Criterios de evaluacion
    </h2>
    <div class="measurement-grid">
      <div class="measure-item">
        <label for="aseoCalidad">Calidad del aseo</label>
        ${renderAseoSelect("aseoCalidad")}
      </div>
      <div class="measure-item">
        <label for="aseoHerramientas">Uso adecuado de herramientas e insumos</label>
        ${renderAseoSelect("aseoHerramientas")}
      </div>
      <div class="measure-item" id="aseoDelayReasonWrap" hidden>
        <label for="aseoMotivoDemora">Motivo de demora</label>
        <select class="form-select measure-input" id="aseoMotivoDemora">
          <option value="">Seleccionar</option>
          ${aseoDelayReasons.map((reason) => `<option value="${reason}">${reason}</option>`).join("")}
        </select>
      </div>
      <div class="measure-item" id="aseoDelayOtherWrap" hidden>
        <label for="aseoMotivoDemoraOtro">Otro motivo</label>
        <input class="form-control measure-input" type="text" id="aseoMotivoDemoraOtro">
      </div>
    </div>

    <div class="aseo-score-panel" id="aseoScorePanel">
      <div><span>Puntaje tiempo</span><strong id="aseoPuntajeTiempo">0</strong></div>
      <div><span>Puntaje calidad</span><strong id="aseoPuntajeCalidad">0</strong></div>
      <div><span>Puntaje asistencia</span><strong id="aseoPuntajeAsistencia">100</strong></div>
      <div><span>Puntaje herramientas</span><strong id="aseoPuntajeHerramientas">0</strong></div>
      <div><span>Nota final</span><strong id="aseoNotaFinal">0.00</strong></div>
      <div><span>Clasificacion</span><strong><span class="status-badge status-danger" id="aseoClasificacion">Requiere mejora</span></strong></div>
    </div>

    <h2 class="section-title">
      <i class="bi bi-funnel-fill" aria-hidden="true"></i>
      Historico e indicadores
    </h2>
    <div class="aseo-filter-grid">
      <input class="form-control" type="date" id="aseoFilterFecha" aria-label="Filtrar por fecha">
      <select class="form-select" id="aseoFilterArea" aria-label="Filtrar por area">
        <option value="">Todas las areas</option>
        ${aseoAreaOptions.map((area) => `<option value="${area}">${area}</option>`).join("")}
      </select>
      <input class="form-control" type="text" id="aseoFilterLider" placeholder="Lider">
      <input class="form-control" type="text" id="aseoFilterIntegrante" placeholder="Integrante">
      <select class="form-select" id="aseoFilterClasificacion" aria-label="Filtrar por clasificacion">
        <option value="">Todas las clasificaciones</option>
        <option value="Excelente">Excelente</option>
        <option value="Bueno">Bueno</option>
        <option value="Aceptable">Aceptable</option>
        <option value="Requiere mejora">Requiere mejora</option>
      </select>
    </div>
    <div class="aseo-indicators" id="aseoIndicators"></div>
  `;
}

function renderAseoSelect(id) {
  return `
    <select class="form-select measure-input" id="${id}" required>
      <option value="">Seleccionar</option>
      ${aseoComplianceOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
    </select>
  `;
}

function handleAseoDynamicClick(event) {
  if (state.activeFormatId !== "aseo") return;

  const addButton = event.target.closest("#btnAseoAddMember");
  if (addButton) {
    addAseoMember();
    return;
  }

  const savedPersonButton = event.target.closest("[data-aseo-add-saved-person]");
  if (savedPersonButton) {
    addAseoMember(savedPersonButton.dataset.aseoAddSavedPerson);
    return;
  }

  const startButton = event.target.closest("#btnAseoStart");
  if (startButton) {
    setAseoTimestamp("aseoHoraInicio");
    return;
  }

  const endButton = event.target.closest("#btnAseoEnd");
  if (endButton) {
    setAseoTimestamp("aseoHoraFin");
    return;
  }

  const deleteButton = event.target.closest("[data-aseo-delete-member]");
  if (deleteButton) {
    deleteAseoMember(deleteButton.dataset.aseoDeleteMember);
    return;
  }

  const editButton = event.target.closest("[data-aseo-edit-member]");
  if (editButton) editAseoMember(editButton.dataset.aseoEditMember);
}

function handleAseoDynamicChange(event) {
  if (state.activeFormatId !== "aseo") return;

  if (event.target.id === "cuartoMaduracion") {
    renderAseoMembers();
  }

  if (event.target.matches("[data-aseo-leader]")) {
    setAseoLeader(event.target.value);
  }

  updateAseoCalculations();

  if (event.target.id?.startsWith("aseoFilter")) {
    renderRecords();
  }
}

function handleAseoDynamicInput(event) {
  if (state.activeFormatId !== "aseo") return;

  updateAseoCalculations();

  if (event.target.id?.startsWith("aseoFilter")) {
    renderRecords();
  }
}

function setAseoTimestamp(targetId) {
  const now = new Date();
  const dateInput = document.getElementById("aseoFecha");
  const target = document.getElementById(targetId);
  if (dateInput) dateInput.value = toDateInputValue(now);
  if (target) target.value = now.toTimeString().slice(0, 5);
  saveAseoDraft(getCurrentAseoArea());
  updateAseoCalculations();
}

function getAseoGroups() {
  try {
    const saved = JSON.parse(localStorage.getItem(ASEO_GROUPS_STORAGE_KEY)) || {};
    return aseoAreaOptions.reduce((groups, area) => {
      groups[area] = {
        members: Array.isArray(saved[area]?.members) ? saved[area].members : [],
        leader: saved[area]?.leader || "",
      };
      return groups;
    }, {});
  } catch {
    return aseoAreaOptions.reduce((groups, area) => {
      groups[area] = { members: [], leader: "" };
      return groups;
    }, {});
  }
}

function saveAseoGroups(groups) {
  localStorage.setItem(ASEO_GROUPS_STORAGE_KEY, JSON.stringify(groups));
}

function getAseoSavedPeople() {
  try {
    const people = JSON.parse(localStorage.getItem(ASEO_PEOPLE_STORAGE_KEY)) || [];
    return Array.isArray(people) ? people.filter(Boolean).sort((a, b) => a.localeCompare(b)) : [];
  } catch {
    return [];
  }
}

function saveAseoPerson(name) {
  const normalizedName = normalizeAseoPersonName(name);
  if (!normalizedName) return;

  const people = getAseoSavedPeople();
  if (!people.some((person) => person.toLowerCase() === normalizedName.toLowerCase())) {
    people.push(normalizedName);
    localStorage.setItem(ASEO_PEOPLE_STORAGE_KEY, JSON.stringify(people.sort((a, b) => a.localeCompare(b))));
  }
}

function renameAseoSavedPerson(currentName, nextName) {
  const normalizedNextName = normalizeAseoPersonName(nextName);
  if (!normalizedNextName) return;

  const people = getAseoSavedPeople()
    .filter((person) => person.toLowerCase() !== currentName.toLowerCase());
  if (!people.some((person) => person.toLowerCase() === normalizedNextName.toLowerCase())) {
    people.push(normalizedNextName);
  }
  localStorage.setItem(ASEO_PEOPLE_STORAGE_KEY, JSON.stringify(people.sort((a, b) => a.localeCompare(b))));
}

function normalizeAseoPersonName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

function getCurrentAseoArea() {
  return getValue("cuartoMaduracion");
}

function restoreLastAseoArea() {
  const savedArea = localStorage.getItem(ASEO_ACTIVE_AREA_STORAGE_KEY);
  if (savedArea && aseoAreaOptions.includes(savedArea)) {
    elements.cuartoMaduracion.value = savedArea;
  }
}

function getCurrentAseoGroup() {
  const groups = getAseoGroups();
  return groups[getCurrentAseoArea()] || { members: [], leader: "" };
}

function handleAseoAreaChange() {
  const previousArea = state.aseoDraftArea;
  const pendingDraft = previousArea ? null : collectAseoDraftValues();
  if (previousArea) saveAseoDraft(previousArea);

  state.aseoDraftArea = getCurrentAseoArea();
  if (state.aseoDraftArea) localStorage.setItem(ASEO_ACTIVE_AREA_STORAGE_KEY, state.aseoDraftArea);
  if (state.aseoDraftArea && hasAseoDraftValues(pendingDraft)) {
    saveAseoDraftValues(state.aseoDraftArea, pendingDraft);
  }
  clearAseoEvaluationFields();
  renderAseoMembers();
  loadAseoDraftForArea(state.aseoDraftArea);
  updateAseoCalculations();
}

function handleAseoFormDraftEvent(event) {
  if (event.target.id === "cuartoMaduracion") return;
  if (event.target.id?.startsWith("aseoFilter")) return;
  saveAseoDraft(getCurrentAseoArea());
}

function getAseoDrafts() {
  try {
    return JSON.parse(localStorage.getItem(ASEO_DRAFTS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAseoDraft(area = getCurrentAseoArea()) {
  if (!area) return;

  saveAseoDraftValues(area, collectAseoDraftValues());
}

function saveAseoDraftValues(area, values) {
  if (!area) return;

  const drafts = getAseoDrafts();
  drafts[area] = values;
  localStorage.setItem(ASEO_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
}

function loadAseoDraftForArea(area = getCurrentAseoArea()) {
  if (!area) {
    clearAseoEvaluationFields();
    return;
  }

  const draft = getAseoDrafts()[area];
  if (!draft) {
    clearAseoEvaluationFields();
    return;
  }

  setAseoFieldValue("aseoFecha", draft.fecha || toDateInputValue(new Date()));
  setAseoFieldValue("aseoHoraInicio", draft.horaInicio || "");
  setAseoFieldValue("aseoHoraFin", draft.horaFin || "");
  setAseoFieldValue("aseoAusencias", draft.ausencias || "No");
  setAseoFieldValue("aseoCantidadAusentes", draft.cantidadAusentes || "");
  setAseoFieldValue("aseoCalidad", draft.calidad || "");
  setAseoFieldValue("aseoHerramientas", draft.herramientas || "");
  setAseoFieldValue("aseoMotivoDemora", draft.motivoDemora || "");
  setAseoFieldValue("aseoMotivoDemoraOtro", draft.motivoDemoraOtro || "");
  setAseoFieldValue("observaciones", draft.observaciones || "");
  setAseoFieldValue("realizadoPor", draft.realizadoPor || "");
  setAseoFieldValue("verificadoPor", draft.verificadoPor || "");

  document.querySelectorAll("[data-aseo-absent]").forEach((input) => {
    input.checked = (draft.ausentes || []).includes(input.value);
  });
}

function clearAseoDraft(area = getCurrentAseoArea()) {
  if (!area) return;

  const drafts = getAseoDrafts();
  delete drafts[area];
  localStorage.setItem(ASEO_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
}

function collectAseoDraftValues() {
  return {
    fecha: getValue("aseoFecha"),
    horaInicio: getValue("aseoHoraInicio"),
    horaFin: getValue("aseoHoraFin"),
    ausencias: getValue("aseoAusencias") || "No",
    cantidadAusentes: getValue("aseoCantidadAusentes"),
    ausentes: getSelectedAseoAbsentees(),
    calidad: getValue("aseoCalidad"),
    herramientas: getValue("aseoHerramientas"),
    motivoDemora: getValue("aseoMotivoDemora"),
    motivoDemoraOtro: getValue("aseoMotivoDemoraOtro"),
    observaciones: getValue("observaciones"),
    realizadoPor: getValue("realizadoPor"),
    verificadoPor: getValue("verificadoPor"),
  };
}

function hasAseoDraftValues(draft) {
  if (!draft) return false;

  return [
    draft.horaInicio,
    draft.horaFin,
    draft.cantidadAusentes,
    draft.calidad,
    draft.herramientas,
    draft.motivoDemora,
    draft.motivoDemoraOtro,
    draft.observaciones,
  ].some(Boolean) || (draft.ausentes || []).length > 0;
}

function clearAseoEvaluationFields() {
  const today = toDateInputValue(new Date());
  [
    "aseoHoraInicio",
    "aseoHoraFin",
    "aseoCantidadAusentes",
    "aseoCalidad",
    "aseoHerramientas",
    "aseoMotivoDemora",
    "aseoMotivoDemoraOtro",
    "observaciones",
  ].forEach((id) => setAseoFieldValue(id, ""));

  setAseoFieldValue("aseoFecha", today);
  setAseoFieldValue("aseoAusencias", "No");
  document.querySelectorAll("[data-aseo-absent]").forEach((input) => {
    input.checked = false;
  });
}

function setAseoFieldValue(id, value) {
  const input = document.getElementById(id);
  if (input) input.value = value;
}

function renderAseoMembers() {
  const list = document.getElementById("aseoMembersList");
  const absentList = document.getElementById("aseoAbsentList");
  const savedPeopleList = document.getElementById("aseoSavedPeople");
  if (!list || !absentList) return;

  const area = getCurrentAseoArea();
  const group = getCurrentAseoGroup();
  const selectedAbsentees = getSelectedAseoAbsentees();
  renderAseoSavedPeople(savedPeopleList, group.members);
  if (!area) {
    list.innerHTML = `<p class="empty-state mb-0">Seleccione un area para gestionar integrantes.</p>`;
    absentList.innerHTML = "";
    return;
  }

  if (!group.members.length) {
    list.innerHTML = `<p class="empty-state mb-0">No hay integrantes asignados a esta area.</p>`;
  } else {
    list.innerHTML = group.members.map((member) => `
      <div class="aseo-member-row">
        <label>
          <input type="radio" name="aseoLeader" value="${escapeHtml(member)}" data-aseo-leader ${group.leader === member ? "checked" : ""}>
          <span>${escapeHtml(member)}</span>
          ${group.leader === member ? '<em>Lider</em>' : ""}
        </label>
        <div>
          <button class="btn-delete" type="button" data-aseo-edit-member="${escapeHtml(member)}">
            <i class="bi bi-pencil" aria-hidden="true"></i>
          </button>
          <button class="btn-delete" type="button" data-aseo-delete-member="${escapeHtml(member)}">
            <i class="bi bi-trash" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `).join("");
  }

  absentList.innerHTML = group.members.map((member) => `
    <label class="aseo-check-item">
      <input type="checkbox" value="${escapeHtml(member)}" data-aseo-absent ${selectedAbsentees.includes(member) ? "checked" : ""}>
      <span>${escapeHtml(member)}</span>
    </label>
  `).join("");
  updateAseoCalculations();
}

function renderAseoSavedPeople(container, currentMembers = []) {
  const datalist = document.getElementById("aseoSavedPeopleOptions");
  if (!container) return;

  const currentMemberKeys = new Set(currentMembers.map((member) => member.toLowerCase()));
  const savedPeople = getAseoSavedPeople();
  const availablePeople = savedPeople
    .filter((person) => !currentMemberKeys.has(person.toLowerCase()));
  if (datalist) {
    datalist.innerHTML = savedPeople.map((person) => `<option value="${escapeHtml(person)}"></option>`).join("");
  }

  if (!availablePeople.length) {
    container.innerHTML = `<p class="empty-state mb-0">Los nombres guardados apareceran aqui para agregarlos rapidamente.</p>`;
    return;
  }

  container.innerHTML = `
    <span class="aseo-saved-people-title">Nombres guardados</span>
    <div class="aseo-saved-people-list">
      ${availablePeople.map((person) => `
        <button class="aseo-saved-person" type="button" data-aseo-add-saved-person="${escapeHtml(person)}">
          <i class="bi bi-plus-circle" aria-hidden="true"></i>
          ${escapeHtml(person)}
        </button>
      `).join("")}
    </div>
  `;
}

function addAseoMember(nameToAdd = "") {
  const input = document.getElementById("aseoMemberName");
  const area = getCurrentAseoArea();
  const name = normalizeAseoPersonName(nameToAdd || input?.value);
  if (!area) {
    window.alert("Seleccione un area antes de agregar integrantes.");
    return;
  }
  if (!name) return;

  const groups = getAseoGroups();
  const group = groups[area];
  if (!group.members.some((member) => member.toLowerCase() === name.toLowerCase())) group.members.push(name);
  if (!group.leader) group.leader = name;
  saveAseoPerson(name);
  saveAseoGroups(groups);
  if (input) input.value = "";
  renderAseoMembers();
}

function editAseoMember(currentName) {
  const area = getCurrentAseoArea();
  const nextName = window.prompt("Editar integrante", currentName)?.trim();
  if (!area || !nextName) return;

  const groups = getAseoGroups();
  const group = groups[area];
  group.members = group.members.map((member) => member === currentName ? nextName : member);
  if (group.leader === currentName) group.leader = nextName;
  renameAseoSavedPerson(currentName, nextName);
  saveAseoGroups(groups);
  renderAseoMembers();
}

function deleteAseoMember(memberName) {
  const area = getCurrentAseoArea();
  if (!area) return;

  const groups = getAseoGroups();
  const group = groups[area];
  group.members = group.members.filter((member) => member !== memberName);
  if (group.leader === memberName) group.leader = group.members[0] || "";
  saveAseoGroups(groups);
  renderAseoMembers();
}

function setAseoLeader(memberName) {
  const area = getCurrentAseoArea();
  if (!area) return;

  const groups = getAseoGroups();
  groups[area].leader = memberName;
  saveAseoGroups(groups);
  renderAseoMembers();
}

function updateAseoCalculations() {
  const data = calculateAseoEvaluation();
  const hasAbsences = getValue("aseoAusencias") === "Si";
  const absentCountWrap = document.getElementById("aseoAbsentCountWrap");
  const absentPanel = document.getElementById("aseoAbsentPanel");
  const delayReasonWrap = document.getElementById("aseoDelayReasonWrap");
  const delayOtherWrap = document.getElementById("aseoDelayOtherWrap");
  const delaySelect = document.getElementById("aseoMotivoDemora");
  const delayOther = document.getElementById("aseoMotivoDemoraOtro");
  const absentCount = document.getElementById("aseoCantidadAusentes");

  if (absentCountWrap) absentCountWrap.hidden = !hasAbsences;
  if (absentPanel) absentPanel.hidden = !hasAbsences;
  if (absentCount) absentCount.required = hasAbsences;

  const hasDelay = data.realMinutes > data.targetMinutes;
  if (delayReasonWrap) delayReasonWrap.hidden = !hasDelay;
  if (delaySelect) delaySelect.required = hasDelay;
  if (delayOtherWrap) delayOtherWrap.hidden = !(hasDelay && delaySelect?.value === "Otro");
  if (delayOther) delayOther.required = hasDelay && delaySelect?.value === "Otro";

  setText("aseoTiempoReal", data.realTimeLabel);
  setText("aseoPuntajeTiempo", data.timeScore);
  setText("aseoPuntajeCalidad", data.qualityScore);
  setText("aseoPuntajeAsistencia", data.attendanceScore);
  setText("aseoPuntajeHerramientas", data.toolsScore);
  setText("aseoNotaFinal", data.finalScore.toFixed(2));
  const badge = document.getElementById("aseoClasificacion");
  if (badge) {
    badge.textContent = data.classification;
    badge.className = `status-badge ${getAseoClassificationClass(data.classification)}`;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function calculateAseoEvaluation() {
  const area = getCurrentAseoArea();
  const targetMinutes = aseoTargetMinutes[area] || 0;
  const realMinutes = getAseoRealMinutes();
  const qualityScore = getAseoComplianceScore(getValue("aseoCalidad"));
  const toolsScore = getAseoComplianceScore(getValue("aseoHerramientas"));
  const absentCount = getAseoAbsentCount();
  const attendanceScore = Math.max(0, 100 - absentCount * 25);
  const timeScore = getAseoTimeScore(realMinutes, targetMinutes);
  let finalScore = (timeScore * 0.4) + (qualityScore * 0.35) + (attendanceScore * 0.15) + (toolsScore * 0.1);
  if (getValue("aseoCalidad") === "No cumple") finalScore = Math.min(finalScore, 60);

  return {
    targetMinutes,
    realMinutes,
    realTimeLabel: formatMinutes(realMinutes),
    timeScore,
    qualityScore,
    attendanceScore,
    toolsScore,
    finalScore,
    classification: getAseoClassification(finalScore),
  };
}

function getAseoRealMinutes() {
  const date = getValue("aseoFecha") || state.selectedDate || toDateInputValue(new Date());
  const start = getValue("aseoHoraInicio");
  const end = getValue("aseoHoraFin");
  if (!start || !end) return 0;

  const startDate = new Date(`${date}T${start}`);
  let endDate = new Date(`${date}T${end}`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
  if (endDate < startDate) endDate = new Date(endDate.getTime() + 86400000);

  return Math.round((endDate - startDate) / 60000);
}

function getAseoComplianceScore(value) {
  return {
    Cumple: 100,
    "Cumple parcialmente": 50,
    "No cumple": 0,
  }[value] ?? 0;
}

function getAseoAbsentCount() {
  if (getValue("aseoAusencias") !== "Si") return 0;
  return Number(getValue("aseoCantidadAusentes")) || getSelectedAseoAbsentees().length || 0;
}

function getSelectedAseoAbsentees() {
  return Array.from(document.querySelectorAll("[data-aseo-absent]:checked")).map((input) => input.value);
}

function getAseoTimeScore(realMinutes, targetMinutes) {
  if (!realMinutes || !targetMinutes) return 0;
  if (realMinutes <= targetMinutes) return 100;
  const ratio = realMinutes / targetMinutes;
  if (ratio <= 1.1) return 90;
  if (ratio <= 1.2) return 75;
  if (ratio <= 1.3) return 50;
  return 0;
}

function formatMinutes(minutes) {
  if (!minutes) return "-";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  if (!rest) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

function getAseoClassification(score) {
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Bueno";
  if (score >= 70) return "Aceptable";
  return "Requiere mejora";
}

function getAseoClassificationClass(classification) {
  return {
    Excelente: "status-ok",
    Bueno: "status-ok",
    Aceptable: "status-warning",
    "Requiere mejora": "status-danger",
  }[classification] || "status-danger";
}
