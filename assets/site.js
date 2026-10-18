// Marca visible compartida. Actualiza también title y og:title en cada HTML.
const BRAND_NAME = 'Pimia Forge';
document.documentElement.classList.remove('no-js');
document.querySelectorAll('[data-brand]').forEach(node => { node.textContent = BRAND_NAME; });
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

    const header = document.getElementById('header');
    const menu = document.getElementById('menu-toggle');
    function closeMenu() { header.dataset.open = 'false'; menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menú'); }
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      header.dataset.open = String(open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    document.querySelectorAll('#navigation a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
    matchMedia('(min-width: 1101px)').addEventListener('change', closeMenu);


// El editor solo existe en /plataforma; las demás páginas comparten este archivo.
if (document.getElementById('human-panel') && document.getElementById('copy-code')) {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const filename = document.getElementById('editor-filename');
    const note = document.getElementById('editor-note');
    const copy = document.getElementById('copy-code');
    const copyLabel = document.getElementById('copy-label');
    const status = document.getElementById('copy-status');
    let activePanel = document.getElementById('human-panel');
    let copyRevision = 0;
    let resetCopy;
    function activateTab(tab) {
      copyRevision++;
      clearTimeout(resetCopy);
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
      });
      activePanel = document.getElementById(tab.getAttribute('aria-controls'));
      const human = tab.id === 'human-tab';
      filename.textContent = human ? 'app.js · @insforge/sdk' : 'terminal · @insforge/cli';
      note.textContent = human ? 'Ejemplo de conexión: sustituye la anon key y adapta la tabla jobs a tu modelo de datos.' : 'Ejemplo de sesión: sustituye el marcador de la API key. El despliegue requiere tu archivo intake.js.';
      status.textContent = '';
      copyLabel.textContent = 'Copiar';
      copy.disabled = false;
    }
    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = tabs[(tabs.indexOf(tab) + 1) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];
        if (next) { event.preventDefault(); activateTab(next); next.focus(); }
      });
    });
    copy.addEventListener('click', async () => {
      const revision = ++copyRevision;
      const panel = activePanel;
      const code = panel.querySelector('code');
      clearTimeout(resetCopy);
      copy.disabled = true;
      copyLabel.textContent = 'Copiando…';
      status.textContent = '';
      try {
        if (!navigator.clipboard || !isSecureContext) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code.textContent);
        if (revision !== copyRevision) return;
        copyLabel.textContent = 'Copiado';
        status.textContent = 'Ejemplo copiado al portapapeles.';
      } catch {
        if (revision !== copyRevision) return;
        panel.focus();
        const selection = getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
        copyLabel.textContent = 'Copiar';
        status.textContent = 'No se pudo copiar automáticamente. El código está seleccionado: usa Ctrl+C, ⌘C o la opción Copiar de tu dispositivo.';
      } finally {
        if (revision === copyRevision) {
          copy.disabled = false;
          resetCopy = setTimeout(() => { copyLabel.textContent = 'Copiar'; }, 3000);
        }
      }
    });
  
}

const accessForm = document.getElementById('access-form');
if (accessForm) {
  const fields = document.getElementById('access-fields');
  const submit = document.getElementById('access-submit');
  const status = document.getElementById('access-status');
  const storageKey = 'forge-access-request';
  let requestId;
  try { requestId = sessionStorage.getItem(storageKey); } catch { /* Storage may be unavailable. */ }
  if (!/^[a-f0-9-]{36}$/.test(requestId || '')) requestId = crypto.randomUUID();
  try { sessionStorage.setItem(storageKey, requestId); } catch { /* Retain in memory. */ }
  let busy = false;
  // Evita pedir datos cuando el servicio todavía no puede enviar correo.
  fields.disabled = true;
  fetch(accessForm.action, { headers: { Accept: 'application/json' } })
    .then(async response => {
      const readiness = await response.json();
      if (!response.ok || readiness.status !== 'ready') throw new Error('unavailable');
      fields.disabled = false;
    })
    .catch(() => {
      accessForm.before(status);
      status.dataset.state = 'error';
      status.textContent = 'El formulario aún no está disponible. Para solicitar acceso como FDE, escríbenos a fde@boksia.com y cuéntanos qué quieres construir.';
      const contact = document.createElement('a');
      contact.href = 'mailto:fde@boksia.com?subject=Solicitud%20de%20acceso%20FDE';
      contact.textContent = 'Escribir a fde@boksia.com';
      contact.className = 'access-contact';
      status.append(document.createElement('br'), contact);
      submit.textContent = 'Envío no disponible';
    });
  accessForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !accessForm.reportValidity()) return;
    const data = Object.fromEntries(new FormData(accessForm));
    data.request_id = requestId;
    busy = true;
    fields.disabled = true;
    submit.textContent = 'Enviando solicitud…';
    status.dataset.state = 'pending';
    status.textContent = 'Estamos enviando tu solicitud.';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(accessForm.action, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'sent') {
        if (result.status === 'unknown') throw new Error('No podemos confirmar el envío. Contacta con fde@boksia.com e indica la referencia ' + requestId + '.');
        if (response.status === 429) throw new Error('Se han recibido demasiadas solicitudes. Espera unos minutos antes de volver a intentarlo.');
        if (response.status === 400) throw new Error('Revisa el nombre, el correo y la descripción del proyecto (mínimo 20 caracteres).');
        if (response.status === 409) throw new Error('Hay una solicitud anterior pendiente. Contacta con fde@boksia.com e indica la referencia ' + requestId + '.');
        throw new Error('No se ha podido enviar la solicitud. Conservamos tus datos en el formulario. Inténtalo más tarde o escribe a fde@boksia.com.');
      }
      status.dataset.state = 'success';
      status.textContent = 'Solicitud enviada. El equipo podrá contactarte en ' + data.email + ' para continuar con el acceso. Referencia: ' + requestId + '.';
      accessForm.hidden = true;
      status.focus();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error instanceof TypeError || error.name === 'AbortError' || error instanceof SyntaxError
        ? 'No podemos confirmar el envío. Puedes volver a comprobarlo con el botón: mantendremos la misma referencia para evitar duplicados. Referencia: ' + requestId + '. También puedes escribir a fde@boksia.com.'
        : error.message;
      fields.disabled = false;
      submit.textContent = 'Volver a enviar o comprobar';
      status.focus();
    } finally {
      clearTimeout(timeout);
      busy = false;
    }
  });
}
