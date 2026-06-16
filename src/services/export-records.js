function downloadExcel() {
  if (!state.records.length) return;
  if (state.activeFormatId === "aseo" && !getAseoExportRecords().length) {
    window.alert("No hay registros guardados para el area seleccionada.");
    return;
  }

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
  const sheetName = state.activeFormatId === "aseo" ? getAseoExportSheetName() : "Control de Calidad";

  if (typeof XLSX === "undefined") {
    return null;
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  return {
    blob: new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    name: getExportFileName(date),
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

function getExportFileName(date) {
  if (state.activeFormatId !== "aseo") return `control-calidad-${state.activeFormatId}-${date}.xlsx`;

  const area = getAseoExportArea();
  const areaPart = area ? slugifyFilePart(area) : "todas-las-areas";
  return `evaluacion-aseo-${areaPart}-${date}.xlsx`;
}

function getAseoExportArea() {
  return getValue("cuartoMaduracion") || getValue("aseoFilterArea");
}

function getAseoExportSheetName() {
  const area = getAseoExportArea();
  return (area || "Aseo").slice(0, 31);
}

function getAseoExportRecords() {
  const area = getAseoExportArea();
  return area ? state.records.filter((record) => record.cuarto === area) : state.records;
}

function slugifyFilePart(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getExportRows() {
  if (state.activeFormatId === "maduracion") {
    return state.records.map((record) => ({
      Fecha: record.fecha,
      Lote: record.lote,
      "Cuarto de maduracion": record.cuarto,
      Seccion: record.medidas.seccionMaduracion,
      Posicion: record.medidas.posicionMaduracion,
      "Temperatura cuarto de maduracion (24C-27C)": record.medidas.tempCuartoMaduracion,
      "Humedad relativa cuarto de maduracion (80%Hr-90%Hr)": record.medidas.humedadCuartoMaduracion,
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
      "Longitud (cm)": record.medidas.longitudRecibo,
      "Diametro (cm)": record.medidas.diametro,
      "Plaga (A/P)": record.medidas.plaga,
      Brix: record.medidas.brixRecibo,
      Olor: record.medidas.olorRecibo,
      Color: record.medidas.colorRecibo,
      Estado: record.estado,
      "Realizado por": record.realizadoPor,
      "Verificado por": record.verificadoPor,
      Observaciones: record.observaciones,
    }));
  }

  if (state.activeFormatId === "novedades") {
    return state.records.map((record, index) => ({
      "#": index + 1,
      Fecha: record.fecha,
      "Semana/Año": record.fechaJuliana,
      Hora: record.hora,
      Lote: record.lote,
      Area: record.cuarto,
      Estado: record.estado,
      "Realizado por": record.realizadoPor,
      "Verificado por": record.verificadoPor,
      Observaciones: record.observaciones,
      "Acciones correctivas": record.accionesCorrectivas,
      Responsable: record.responsableNovedad,
    }));
  }

  if (state.activeFormatId === "aseo") {
    return getAseoExportRecords().map((record, index) => ({
      "#": index + 1,
      Fecha: record.fecha,
      Area: record.cuarto,
      Integrantes: record.medidas.integrantes.join(", "),
      Lider: record.medidas.lider,
      "Hora inicio": record.medidas.horaInicio,
      "Hora fin": record.medidas.horaFin,
      "Tiempo real": record.medidas.tiempoReal,
      "Tiempo objetivo (min)": record.medidas.tiempoObjetivoMinutos,
      "Puntaje tiempo": record.medidas.puntajeTiempo,
      "Calidad del aseo": record.medidas.calidad,
      "Puntaje calidad": record.medidas.puntajeCalidad,
      "Cantidad ausentes": record.medidas.cantidadAusentes,
      Ausentes: record.medidas.ausentes.join(", "),
      "Puntaje asistencia": record.medidas.puntajeAsistencia,
      "Uso de herramientas": record.medidas.herramientas,
      "Puntaje uso de herramientas": record.medidas.puntajeHerramientas,
      "Nota final": record.medidas.notaFinal,
      Clasificacion: record.medidas.clasificacion,
      "Motivo de demora": record.medidas.motivoDemora,
      Observaciones: record.observaciones,
      "Realizado por": record.realizadoPor,
      "Verificado por": record.verificadoPor,
    }));
  }

  if (state.activeFormatId === "iqf") {
    return getIqfExportRows();
  }

  if (false) {
    return state.records.map((record, index) => ({
      "#": index + 1,
      Fecha: record.fecha,
      "Semana/Año": record.fechaJuliana,
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
    ...measurementGroups.reduce((result, group) => ({
      ...result,
      ...spreadArray(group.label, record.medidas[group.id] || normalizeFixedArray([], getGroupCount(group))),
    }), {}),
    ...spreadArray("Brix", record.briz),
    Estado: record.estado,
    "Realizado por": record.realizadoPor,
    "Verificado por": record.verificadoPor,
    Observaciones: record.observaciones,
  }));
}

async function shareRecordsFile() {
  if (!state.records.length) return;
  if (state.activeFormatId === "aseo" && !getAseoExportRecords().length) {
    window.alert("No hay registros guardados para el area seleccionada.");
    return;
  }

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

function getIqfExportRows() {
  return state.records.map((record, index) => {
    const recordDate = getDateInputFromRecord(record);

    return {
      "#": index + 1,
      Fecha: record.fecha,
      "Semana año": record.fechaJuliana,
      Hora: record.hora,
      "Cuarto de maduración": record.cuarto,
      "Lote de materia prima": record.loteMateriaPrima || getDayOfYearCode(recordDate),
      "Lote de producción": record.lote || (record.fechaJuliana ? `W${record.fechaJuliana.replace("-", "")}` : ""),
      "Referencia de empaque": getIqfMeasureValue(record, "referenciaIqf"),
      Presentación: getIqfMeasureValue(record, "presentacionIqf"),
      "Temperatura de IQF": getIqfMeasureValue(record, "tempIqf"),
      "Temperatura entrada IQF tajada 1": getIqfMeasureValue(record, "tempEntradaIqf", 0),
      "Temperatura entrada IQF tajada 2": getIqfMeasureValue(record, "tempEntradaIqf", 1),
      "Temperatura entrada IQF tajada 3": getIqfMeasureValue(record, "tempEntradaIqf", 2),
      "Temperatura entrada IQF tajada 4": getIqfMeasureValue(record, "tempEntradaIqf", 3),
      "Temperatura entrada IQF tajada 5": getIqfMeasureValue(record, "tempEntradaIqf", 4),
      "Temperatura salida de IQF de la tajada 1": getIqfMeasureValue(record, "tempSalidaIqf", 0),
      "Temperatura salida de IQF de la tajada 2": getIqfMeasureValue(record, "tempSalidaIqf", 1),
      "Temperatura salida de IQF de la tajada 3": getIqfMeasureValue(record, "tempSalidaIqf", 2),
      "Temperatura salida de IQF de la tajada 4": getIqfMeasureValue(record, "tempSalidaIqf", 3),
      "Temperatura salida de IQF de la tajada 5": getIqfMeasureValue(record, "tempSalidaIqf", 4),
      "Materiales extraños": getIqfMeasureValue(record, "materialExtranoIqf"),
      "Brix salida IQF 1": getIqfMeasureValue(record, "brixSalidaIqf", 0),
      "Brix salida IQF 2": getIqfMeasureValue(record, "brixSalidaIqf", 1),
      "Brix salida IQF 3": getIqfMeasureValue(record, "brixSalidaIqf", 2),
      "Brix salida IQF 4": getIqfMeasureValue(record, "brixSalidaIqf", 3),
      "Brix salida IQF 5": getIqfMeasureValue(record, "brixSalidaIqf", 4),
      "Peso neto 1": getIqfMeasureValue(record, "productoTerminado", 0),
      "Peso neto 2": getIqfMeasureValue(record, "productoTerminado", 1),
      "Peso neto 3": getIqfMeasureValue(record, "productoTerminado", 2),
      "Peso neto 4": getIqfMeasureValue(record, "productoTerminado", 3),
      "Peso neto 5": getIqfMeasureValue(record, "productoTerminado", 4),
      Loteado: getIqfMeasureValue(record, "verificacionLoteado"),
      "Sello vertical": getIqfMeasureValue(record, "selladoVertical"),
      "Sello horizontal": getIqfMeasureValue(record, "selladoHorizontal"),
      "Detector de metales": getIqfMeasureValue(record, "detectorMetalesIqf"),
      "Arte y/o etiqueta": getIqfMeasureValue(record, "arteIqf"),
      Resistencia: getIqfMeasureValue(record, "resistenciaIqf"),
      "Realizado por": record.realizadoPor,
      "Verificado por": record.verificadoPor,
      Observaciones: record.observaciones,
    };
  });
}

function getIqfMeasureValue(record, groupId, index = 0) {
  if (groupId === "referenciaIqf" && index === 0 && record.referencia) return record.referencia;
  if (groupId === "arteIqf" && index === 0 && record.arte) return record.arte;
  if (groupId === "resistenciaIqf" && index === 0 && record.resistencia) return record.resistencia;

  return record.medidas?.[groupId]?.[index] || "";
}

function spreadArray(prefix, values) {
  return values.reduce((result, value, index) => {
    result[`${prefix} ${index + 1}`] = value;
    return result;
  }, {});
}
