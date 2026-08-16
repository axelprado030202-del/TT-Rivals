import { getSession, signUpUser, signInUser, signOutUser } from './auth.js';
import { getMyProfile, getMyRatings, completeSportsProfile } from './profile.js';

const views = [...document.querySelectorAll('.view')];
const globalStatus = document.querySelector('#globalStatus');

const registerForm = document.querySelector('#registerForm');
const registerStatus = document.querySelector('#registerStatus');

const loginForm = document.querySelector('#loginForm');
const loginStatus = document.querySelector('#loginStatus');

const sportsProfileForm = document.querySelector('#sportsProfileForm');
const sportsStatus = document.querySelector('#sportsStatus');

const clubName = document.querySelector('#clubName');
const customClubWrap = document.querySelector('#customClubWrap');
const customClubName = document.querySelector('#customClubName');

function showView(id) {
  views.forEach(view => view.classList.toggle('active', view.id === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setStatus(el, message, type = '') {
  el.textContent = message;
  el.classList.remove('ok', 'error');
  if (type) el.classList.add(type);
}

function normalizeUsername(value) {
  return value.trim().toLowerCase();
}

function isValidUsername(value) {
  return /^[a-z0-9_]{3,24}$/.test(value);
}

function friendlyAuthError(message = '') {
  const text = message.toLowerCase();

  if (text.includes('already registered') || text.includes('user already registered')) {
    return 'Ese correo ya está registrado.';
  }

  if (text.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }

  if (text.includes('password')) {
    return 'Revisá la contraseña. Debe cumplir los requisitos de Supabase.';
  }

  if (text.includes('rate limit')) {
    return 'Se hicieron demasiados intentos. Esperá un momento y probá de nuevo.';
  }

  return message || 'Ocurrió un error inesperado.';
}

async function routeAuthenticatedUser() {
  const session = await getSession();

  if (!session?.user) {
    showView('welcomeView');
    setStatus(globalStatus, 'Conectado a TT Rivals.', 'ok');
    return;
  }

  const profile = await getMyProfile(session.user.id);

  if (!profile.profile_completed) {
    showView('sportsProfileView');
    return;
  }

  await renderHome(session.user.id, profile);
  showView('homeView');
}

async function renderHome(userId, existingProfile = null) {
  const profile = existingProfile || await getMyProfile(userId);
  const ratings = await getMyRatings(userId);

  const individual = ratings.find(item => item.modality === 'individual')?.rating ?? 1000;
  const doubles = ratings.find(item => item.modality === 'dobles')?.rating ?? 1000;

  document.querySelector('#homeGreeting').textContent =
    `Bienvenido, ${profile.first_name} ${profile.last_name}`;

  document.querySelector('#homeUsername').textContent = `@${profile.username}`;
  document.querySelector('#homeStyle').textContent = profile.playing_style || '—';
  document.querySelector('#homeHand').textContent = profile.dominant_hand || '—';
  document.querySelector('#homeClub').textContent = profile.club_name || '—';
  document.querySelector('#individualRating').textContent = individual;
  document.querySelector('#doublesRating').textContent = doubles;
}

document.querySelector('#goRegister').addEventListener('click', () => showView('registerView'));
document.querySelector('#goLogin').addEventListener('click', () => showView('loginView'));

document.querySelectorAll('[data-back]').forEach(button => {
  button.addEventListener('click', () => showView(button.dataset.back));
});

clubName.addEventListener('change', () => {
  const useCustom = clubName.value === 'Otro';
  customClubWrap.classList.toggle('hidden', !useCustom);
  customClubName.required = useCustom;
  if (!useCustom) customClubName.value = '';
});

registerForm.addEventListener('submit', async event => {
  event.preventDefault();
  setStatus(registerStatus, '');

  const firstName = document.querySelector('#firstName').value.trim();
  const lastName = document.querySelector('#lastName').value.trim();
  const username = normalizeUsername(document.querySelector('#username').value);
  const email = document.querySelector('#registerEmail').value.trim();
  const password = document.querySelector('#registerPassword').value;
  const confirmPassword = document.querySelector('#confirmPassword').value;

  if (!firstName || !lastName || !email || !password) {
    setStatus(registerStatus, 'Completá todos los campos obligatorios.', 'error');
    return;
  }

  if (!isValidUsername(username)) {
    setStatus(registerStatus, 'El usuario debe tener 3–24 caracteres: letras, números o _.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    setStatus(registerStatus, 'Las contraseñas no coinciden.', 'error');
    return;
  }

  const button = registerForm.querySelector('button[type="submit"]');
  button.disabled = true;
  setStatus(registerStatus, 'Creando cuenta…');

  try {
    const { data, error } = await signUpUser({
      email,
      password,
      firstName,
      lastName,
      username
    });

    if (error) throw error;

    /*
      Con confirmación de email activada, Supabase puede crear el usuario pero
      no iniciar sesión inmediatamente. En ese caso mostramos una instrucción.
    */
    if (!data.session) {
      setStatus(
        registerStatus,
        'Cuenta creada. Revisá tu correo para confirmar la cuenta y después iniciá sesión.',
        'ok'
      );
      return;
    }

    setStatus(registerStatus, 'Cuenta creada correctamente.', 'ok');
    showView('sportsProfileView');
  } catch (error) {
    console.error(error);
    setStatus(registerStatus, friendlyAuthError(error.message), 'error');
  } finally {
    button.disabled = false;
  }
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  setStatus(loginStatus, '');

  const email = document.querySelector('#loginEmail').value.trim();
  const password = document.querySelector('#loginPassword').value;

  const button = loginForm.querySelector('button[type="submit"]');
  button.disabled = true;
  setStatus(loginStatus, 'Iniciando sesión…');

  try {
    const { data, error } = await signInUser({ email, password });
    if (error) throw error;

    const profile = await getMyProfile(data.user.id);

    if (!profile.profile_completed) {
      setStatus(loginStatus, 'Sesión iniciada. Falta completar el perfil.', 'ok');
      showView('sportsProfileView');
      return;
    }

    await renderHome(data.user.id, profile);
    showView('homeView');
  } catch (error) {
    console.error(error);
    setStatus(loginStatus, friendlyAuthError(error.message), 'error');
  } finally {
    button.disabled = false;
  }
});

sportsProfileForm.addEventListener('submit', async event => {
  event.preventDefault();
  setStatus(sportsStatus, '');

  const birthDate = document.querySelector('#birthDate').value;
  const playingStyle = document.querySelector('#playingStyle').value;
  const dominantHand = document.querySelector('#dominantHand').value;
  const selectedClub = clubName.value;
  const profilePhotoUrl = document.querySelector('#profilePhotoUrl').value.trim();

  let finalClub = selectedClub;

  if (selectedClub === 'Otro') {
    finalClub = customClubName.value.trim();
  }

  if (!birthDate || !playingStyle || !dominantHand || !finalClub) {
    setStatus(sportsStatus, 'Completá todos los campos obligatorios.', 'error');
    return;
  }

  const button = sportsProfileForm.querySelector('button[type="submit"]');
  button.disabled = true;
  setStatus(sportsStatus, 'Guardando perfil…');

  try {
    await completeSportsProfile({
      birthDate,
      playingStyle,
      dominantHand,
      clubName: finalClub,
      profilePhotoUrl
    });

    const session = await getSession();
    if (!session?.user) throw new Error('No hay una sesión activa.');

    const profile = await getMyProfile(session.user.id);
    await renderHome(session.user.id, profile);

    setStatus(sportsStatus, 'Perfil completado.', 'ok');
    showView('homeView');
  } catch (error) {
    console.error(error);
    setStatus(sportsStatus, error.message || 'No se pudo completar el perfil.', 'error');
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#logoutButton').addEventListener('click', async () => {
  await signOutUser();
  registerForm.reset();
  loginForm.reset();
  sportsProfileForm.reset();
  customClubWrap.classList.add('hidden');
  showView('welcomeView');
  setStatus(globalStatus, 'Sesión cerrada.', 'ok');
});

(async function initialize() {
  try {
    await routeAuthenticatedUser();
  } catch (error) {
    console.error(error);
    showView('welcomeView');
    setStatus(globalStatus, 'Conectado, pero hubo un problema al cargar tu perfil.', 'error');
  }
})();
