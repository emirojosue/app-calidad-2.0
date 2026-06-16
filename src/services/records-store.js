function loadRecords({ queueSync = true } = {}) {
  state.records = loadLocalRecords(state.activeFormatId).filter((record) => !record._deleted);
  renderRecords();

  if (queueSync) queueFormatSync(state.activeFormatId, { full: true, delay: 1200 });
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
  const medidas = normalizeMeasurements(record.medidas, formatId);

  if (formatId === "iqf") {
    if (!medidas.referenciaIqf?.[0] && record.referencia) medidas.referenciaIqf[0] = record.referencia;
    if (!medidas.arteIqf?.[0] && record.arte) medidas.arteIqf[0] = record.arte;
    if (!medidas.resistenciaIqf?.[0] && record.resistencia) medidas.resistenciaIqf[0] = record.resistencia;
  }

  return {
    id: record.id || crypto.randomUUID?.() || String(Date.now()),
    _cloudId: record._cloudId,
    userEmail: record.userEmail || "",
    fechaIso: record.fechaIso || "",
    fecha: record.fecha || "",
    mes: record.mes || getMonthNameFromDisplay(record.fecha),
    fechaJuliana: record.fechaJuliana || "",
    loteMateriaPrima: record.loteMateriaPrima || "",
    hora: record.hora || "",
    horaFin: record.horaFin || record.medidas?.horaFin || "",
    cuarto: record.cuarto || "",
    lote: record.lote || "",
    realizadoPor: record.realizadoPor || "",
    verificadoPor: record.verificadoPor || "",
    referencia: record.referencia || "",
    arte: record.arte || "",
    resistencia: record.resistencia || "",
    observaciones: record.observaciones || "",
    accionesCorrectivas: record.accionesCorrectivas || "",
    responsableNovedad: record.responsableNovedad || "",
    medidas,
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

  if (formatId === "novedades") {
    return {};
  }

  if (formatId === "aseo") {
    return normalizeAseoMeasurements(measurements);
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
    result[group.id] = normalizeFixedArray(measurements[group.id], getGroupCount(group));
    return result;
  }, {});
}

function normalizeAseoMeasurements(measurements = {}) {
  return {
    integrantes: Array.isArray(measurements.integrantes) ? measurements.integrantes : [],
    lider: measurements.lider || "",
    horaInicio: measurements.horaInicio || "",
    horaFin: measurements.horaFin || "",
    tiempoRealMinutos: Number(measurements.tiempoRealMinutos) || 0,
    tiempoReal: measurements.tiempoReal || formatMinutes(Number(measurements.tiempoRealMinutos) || 0),
    tiempoObjetivoMinutos: Number(measurements.tiempoObjetivoMinutos) || 0,
    ausencias: measurements.ausencias || "No",
    cantidadAusentes: Number(measurements.cantidadAusentes) || 0,
    ausentes: Array.isArray(measurements.ausentes) ? measurements.ausentes : [],
    calidad: measurements.calidad || "",
    herramientas: measurements.herramientas || "",
    puntajeTiempo: Number(measurements.puntajeTiempo) || 0,
    puntajeCalidad: Number(measurements.puntajeCalidad) || 0,
    puntajeAsistencia: Number(measurements.puntajeAsistencia) || 0,
    puntajeHerramientas: Number(measurements.puntajeHerramientas) || 0,
    notaFinal: Number(measurements.notaFinal) || 0,
    clasificacion: measurements.clasificacion || "Requiere mejora",
    motivoDemora: measurements.motivoDemora || "",
  };
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

function queueAllFormatSyncs({ full = false, renderActive = true, delay = 0 } = {}) {
  Object.keys(FORMAT_STORAGE_KEYS).forEach((formatId) => {
    queueFormatSync(formatId, { full, renderActive: renderActive && formatId === state.activeFormatId, delay });
  });
}

function queueFormatSync(formatId = state.activeFormatId, { full = false, renderActive = true, delay = 0 } = {}) {
  if (!canUseCloud()) return;

  const currentQueued = backgroundSyncState.queued.get(formatId);
  const nextOptions = {
    full: Boolean(full || currentQueued?.full),
    renderActive: Boolean(renderActive || currentQueued?.renderActive),
  };
  backgroundSyncState.queued.set(formatId, nextOptions);

  if (backgroundSyncState.active.has(formatId)) return;
  if (backgroundSyncState.timers.has(formatId)) return;

  const timer = window.setTimeout(() => {
    backgroundSyncState.timers.delete(formatId);
    runQueuedFormatSync(formatId);
  }, delay);
  backgroundSyncState.timers.set(formatId, timer);
}

async function runQueuedFormatSync(formatId) {
  if (backgroundSyncState.active.has(formatId)) return;
  if (!canSyncCloud()) return;

  const options = backgroundSyncState.queued.get(formatId);
  if (!options) return;

  backgroundSyncState.queued.delete(formatId);
  backgroundSyncState.active.add(formatId);

  try {
    if (options.full) {
      await syncFormatRecords(formatId, { renderActive: options.renderActive });
    } else {
      await syncPendingFormatRecords(formatId, { renderActive: options.renderActive });
    }
  } catch (error) {
    state.cloudSyncError = error;
    console.error("No se pudo sincronizar en segundo plano", error);
  } finally {
    backgroundSyncState.active.delete(formatId);
  }

  if (backgroundSyncState.queued.has(formatId)) {
    window.setTimeout(() => runQueuedFormatSync(formatId), 0);
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
    saveRecords(formatId, retainedLocalRecords);
    if (formatId === state.activeFormatId) {
      state.records = retainedLocalRecords.filter((record) => !record._deleted);
      if (renderActive) renderRecords();
    }
    return;
  }

  const merged = new Map();
  cloudRecords.forEach((record) => merged.set(record.id, record));
  retainedLocalRecords.forEach((record) => {
    if (record._deleted) {
      merged.delete(record.id);
    } else if (!merged.has(record.id)) {
      merged.set(record.id, record);
    }
  });

  const syncedRecords = Array.from(merged.values());
  const pendingDeleteRecords = retainedLocalRecords.filter((record) => record._deleted);
  saveRecords(formatId, syncedRecords.concat(pendingDeleteRecords));

  if (formatId === state.activeFormatId) {
    state.records = syncedRecords;
    if (renderActive) renderRecords();
  }
}

async function syncPendingFormatRecords(formatId, { renderActive = true } = {}) {
  if (!canSyncCloud()) return;

  const localRecords = loadLocalRecords(formatId);
  const syncedRecords = [];

  for (const record of localRecords) {
    if (record._deleted) {
      if (record._cloudId) {
        const { error } = await supabaseClient.from("quality_records").delete().eq("id", record._cloudId);
        if (error) {
          state.cloudSyncError = error;
          syncedRecords.push(record);
        }
      }
      continue;
    }

    if (record._syncStatus !== "synced" || !record._cloudId) {
      const syncedRecord = await uploadRecordToCloud(record, formatId);
      syncedRecords.push(syncedRecord || record);
    } else {
      syncedRecords.push(record);
    }
  }

  const visibleRecords = syncedRecords.filter((record) => !record._deleted);
  saveRecords(formatId, syncedRecords);

  if (formatId === state.activeFormatId) {
    state.records = visibleRecords;
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
  record._syncStatus = "pending";
  state.records.push(record);
  saveRecords();
  queueFormatSync(state.activeFormatId);
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

  if (!record?._cloudId) {
    state.records.splice(index, 1);
    saveRecords();
  } else {
    const deleteMarker = { ...record, _deleted: true, _syncStatus: "pending-delete" };
    state.records.splice(index, 1);
    saveRecords(state.activeFormatId, state.records.concat(deleteMarker));
    queueFormatSync(state.activeFormatId);
  }

  renderRecords();
}

async function clearRecords() {
  if (!state.records.length) return;
  if (!window.confirm("¿Deseas borrar todos los registros agregados?")) return;

  const deleteMarkers = state.records
    .filter((record) => record._cloudId)
    .map((record) => ({ ...record, _deleted: true, _syncStatus: "pending-delete" }));
  state.records = deleteMarkers;
  saveRecords();
  state.records = [];
  renderRecords();
  queueFormatSync(state.activeFormatId);
}

function canUseCloud() {
  return Boolean(state.cloudEnabled && supabaseClient && state.authUser);
}

function canSyncCloud() {
  return canUseCloud() && navigator.onLine;
}
