function isCloudConfigured() {
  return Boolean(CLOUD_CONFIG.supabaseUrl && CLOUD_CONFIG.supabaseAnonKey && window.supabase);
}

async function initCloudAuth() {
  state.cloudEnabled = true;
  supabaseClient = window.supabase.createClient(CLOUD_CONFIG.supabaseUrl, CLOUD_CONFIG.supabaseAnonKey);
  showAuthMessage("");

  try {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
      await handleSignedIn(data.session.user);
    } else if (!restoreOfflineAuth({ allowOnline: true })) {
      showAuth();
    }
  } catch (error) {
    console.error("No se pudo leer la sesion", error);
    if (!restoreOfflineAuth({ allowOnline: true })) showAuth();
  }

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      await handleSignedIn(session.user);
      return;
    }

    if (event === "SIGNED_OUT" || !state.authUser) {
      clearSignedInState();
    }
  });
}

async function handleSignedIn(user) {
  state.authUser = user;
  state.authOfflineMode = false;
  state.authProfile = await ensureProfile(user);

  if (state.authProfile?.disabled) {
    await supabaseClient.auth.signOut();
    showAuthMessage("Este usuario esta desactivado.");
    return;
  }

  showApp();
  renderAuthHeader();
  saveOfflineAuth();
  await initializeAppView();
  queueAllFormatSyncs({ full: true, renderActive: false, delay: 2500 });
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
  saveCurrentFormDraft();
  if (state.activeFormatId === "aseo") saveAseoDraft(getCurrentAseoArea());
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
  if (!navigator.onLine) {
    if (restoreOfflineAuth()) {
      showAuthMessage("Sin internet. Entraste con los datos guardados en este dispositivo.");
    } else {
      showAuthMessage("Sin internet no se puede validar el usuario por primera vez.");
    }
    return;
  }

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
  clearOfflineAuth();
  await supabaseClient.auth.signOut();
  clearSignedInState();
}

function renderAuthHeader() {
  const hasUser = Boolean(state.authUser);
  elements.userControls.hidden = !hasUser;
  elements.adminPanel.hidden = !isSuperUser();
  if (hasUser) {
    const offlineLabel = state.authOfflineMode ? " - Sin conexion" : "";
    elements.currentUserLabel.textContent = `${getUserDisplayName()}${isSuperUser() ? " - Super usuario" : ""}${offlineLabel}`;
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

function saveOfflineAuth() {
  if (!state.authUser) return;

  const authData = {
    user: {
      id: state.authUser.id,
      email: state.authUser.email,
    },
    profile: state.authProfile || null,
  };
  localStorage.setItem(OFFLINE_AUTH_STORAGE_KEY, JSON.stringify(authData));
}

function restoreOfflineAuth({ allowOnline = false } = {}) {
  if (navigator.onLine && !allowOnline) return false;

  try {
    const authData = JSON.parse(localStorage.getItem(OFFLINE_AUTH_STORAGE_KEY));
    if (!authData?.user?.id) return false;

    state.authUser = authData.user;
    state.authProfile = authData.profile || { id: authData.user.id, email: authData.user.email, role: "user" };
    state.authOfflineMode = true;
    showApp();
    renderAuthHeader();
    initializeAppView();
    return true;
  } catch {
    return false;
  }
}

function clearOfflineAuth() {
  localStorage.removeItem(OFFLINE_AUTH_STORAGE_KEY);
}

function clearSignedInState() {
  saveCurrentFormDraft();
  if (state.activeFormatId === "aseo") saveAseoDraft(getCurrentAseoArea());
  state.authUser = null;
  state.authProfile = null;
  state.authOfflineMode = false;
  state.records = [];
  renderAuthHeader();
  showAuth();
}

async function recoverCloudSession() {
  if (!supabaseClient || !state.authOfflineMode) return;

  try {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session?.user) {
      await handleSignedIn(data.session.user);
      return;
    }
  } catch (error) {
    console.error("No se pudo recuperar la sesion en linea", error);
  }

  renderAuthHeader();
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
  queueFormatSync(state.activeFormatId, { delay: 1000 });
}
