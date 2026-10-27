
'use strict';
(() => {
  const $ = (s, scope = document) => scope.querySelector(s);
  const $$ = (s, scope = document) => Array.from(scope.querySelectorAll(s));
  const plusIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m5 12 4 4L20 5"/></svg>';
  const closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';
  const selected = new Set();
  const cards = $$('.service-card');
  const byId = new Map(cards.map(card => [card.dataset.id, card]));
  let filter = 'todos';
  let expanded = false;
  let detailId = null;
  let popupShown = false;
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const announcement = $('#live-announcement');
  const nameOf = id => $('h3', byId.get(id)).textContent;
  const menu = $('#main-nav');
  const menuButton = $('.menu-toggle');
  function closeMenu() {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('open', open);
  });
  $$('a', menu).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !motion.matches) {
    document.documentElement.classList.add('js-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px 70px 0px', threshold: 0.04 });
    $$('.reveal').forEach(element => observer.observe(element));
  }
  function applyFilters() {
    const term = normalize($('#service-search').value);
    const matching = cards.filter(card => {
      const matches = (filter === 'todos' || card.dataset.category === filter) && normalize(card.innerText).includes(term);
      return matches;
    });
    const limit = !expanded && filter === 'todos' && !term ? 6 : Infinity;
    cards.forEach(card => { card.hidden = !matching.includes(card) || matching.indexOf(card) >= limit; });
    $('#load-more').hidden = matching.length <= limit;
    $('#no-results').hidden = matching.length !== 0;
    const count = matching.length;
    const visible = Math.min(count, limit);
    $('#catalog-status').textContent = visible < count ? visible + ' de ' + count + ' servicios · explora todos o elige una categoría' : count + (count === 1 ? ' servicio encontrado' : ' servicios para hacer tu evento');
    $$('.filter').forEach(button => {
      button.classList.toggle('active', button.dataset.filter === filter);
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    });
  }
  $$('.filter').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; applyFilters(); }));
  $('#service-search').addEventListener('input', applyFilters);
  $('#load-more').addEventListener('click', () => {
    expanded = true;
    applyFilters();
    // Keep keyboard users at the start of newly revealed content.
    const nextButton = cards[6]?.querySelector('.service-photo');
    nextButton?.focus({ preventScroll: true });
  });
  $$('[data-category-link]').forEach(link => link.addEventListener('click', () => {
    filter = link.dataset.categoryLink;
    $('#service-search').value = '';
    applyFilters();
  }));
  function updateMessage() {
    const value = id => $(id).value.trim();
    const rawDate = value('#event-date');
    const formattedDate = rawDate ? rawDate.split('-').reverse().join('/') : 'Por definir';
    const lines = [
      '¡Hola Ecco & Bass! Quiero cotizar mi evento.',
      '',
      'Nombre: ' + value('#client-name'),
      'Celebración: ' + (value('#event-type') || 'Por definir'),
      'Fecha estimada: ' + formattedDate,
      'Invitados aproximados: ' + (value('#guest-count') || 'Por definir'),
      'Lugar / comuna: ' + (value('#event-place') || 'Por definir'),
      '',
      'Servicios de interés: ' + (selected.size ? Array.from(selected).map(nameOf).join(', ') : 'Quiero orientación para elegir'),
      value('#event-notes') ? '\nMi idea: ' + value('#event-notes') : '',
      '',
      '¿Me ayudan con la disponibilidad, el valor final y las condiciones?'
    ].filter(line => line !== null);
    $('#whatsapp-message').value = lines.join('\n');
  }
  function updateSelection() {
    cards.forEach(card => {
      const active = selected.has(card.dataset.id);
      card.classList.toggle('selected', active);
      const button = $('[data-add]', card);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', (active ? 'Quitar ' : 'Agregar ') + nameOf(card.dataset.id) + (active ? ' de mi evento' : ' a mi evento'));
      button.innerHTML = (active ? checkIcon : plusIcon) + '<span>' + (active ? 'Agregado' : 'Agregar') + '</span>';
    });
    const box = $('#selected-services');
    box.replaceChildren();
    if (!selected.size) {
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Agrega servicios del catálogo o cuéntanos tu idea abajo.';
      box.append(paragraph);
    }
    selected.forEach(id => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'selected-chip';
      chip.dataset.remove = id;
      chip.setAttribute('aria-label', 'Quitar ' + nameOf(id) + ' de mi selección');
      const label = document.createElement('span');
      label.textContent = nameOf(id);
      chip.append(label);
      chip.insertAdjacentHTML('beforeend', closeIcon);
      box.append(chip);
    });
    $('#selection-bar').hidden = selected.size === 0;
    $('#selection-count').textContent = selected.size;
    $('#selection-label').textContent = selected.size === 1 ? 'servicio elegido' : 'servicios elegidos';
    if (detailId) {
      const button = $('[data-dialog-add]');
      if (button) {
        const active = selected.has(detailId);
        button.innerHTML = (active ? checkIcon : plusIcon) + (active ? 'Quitar de mi evento' : 'Agregar a mi evento');
        button.setAttribute('aria-pressed', String(active));
      }
    }
    updateMessage();
  }
  function toggleService(id) {
    if (!byId.has(id)) return;
    const active = selected.has(id);
    active ? selected.delete(id) : selected.add(id);
    updateSelection();
    announcement.textContent = nameOf(id) + (active ? ' eliminado de tu selección.' : ' agregado a tu selección.');
  }
  document.addEventListener('click', event => {
    const addButton = event.target.closest('[data-add]');
    const removeButton = event.target.closest('[data-remove]');
    if (addButton) toggleService(addButton.dataset.add);
    if (removeButton) {
      const chipList = $$('.selected-chip');
      const index = chipList.indexOf(removeButton);
      toggleService(removeButton.dataset.remove);
      const chips = $$('.selected-chip');
      (chips[Math.min(index, chips.length - 1)] || $('#client-name')).focus({ preventScroll: true });
    }
  });
  const detailDialog = $('#service-dialog');
  $$('[data-detail]').forEach(button => button.addEventListener('click', () => {
    detailId = button.dataset.detail;
    const card = byId.get(detailId);
    const content = $('#detail-content');
    content.replaceChildren();
    const image = $('img', card).cloneNode();
    image.loading = 'eager';
    const info = document.createElement('div');
    info.className = 'detail-info';
    const category = $('.category-label', card).cloneNode(true);
    const heading = document.createElement('h2');
    heading.id = 'detail-title';
    heading.textContent = nameOf(detailId);
    const description = $('.service-body>p', card).cloneNode(true);
    const list = $('ul', card).cloneNode(true);
    const price = document.createElement('p');
    price.className = 'detail-price';
    price.textContent = $('.price', card).firstChild.textContent;
    const unit = document.createElement('p');
    unit.className = 'detail-unit';
    unit.textContent = $('.price small', card).textContent;
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'button';
    add.dataset.dialogAdd = detailId;
    add.addEventListener('click', () => toggleService(detailId));
    const note = document.createElement('p');
    note.className = 'detail-note';
    note.textContent = 'Valor de referencia. Confirma disponibilidad, traslado y condiciones al cotizar.';
    info.append(category, heading, description, list, price, unit, add, note);
    content.append(image, info);
    updateSelection();
    detailDialog.showModal();
  }));
  detailDialog.addEventListener('close', () => { detailId = null; });
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
  });
  $$('[data-event]').forEach(link => link.addEventListener('click', () => {
    $('#event-type').value = link.dataset.event;
    updateMessage();
  }));
  $('#quote-form').addEventListener('input', updateMessage);
  $('#quote-form').addEventListener('change', updateMessage);
  $('#quote-form').addEventListener('submit', updateMessage);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(part => [part.type, part.value]));
  $('#event-date').min = dateParts.year + '-' + dateParts.month + '-' + dateParts.day;
  const popup = $('#instagram-dialog');
  function showPopup() {
    if ($('dialog[open]')) return;
    popupShown = true;
    popup.showModal();
  }
  $('.popup-trigger').addEventListener('click', showPopup);
  $('.popup-later').addEventListener('click', () => popup.close());
  popup.addEventListener('close', () => {
    try { localStorage.setItem('eccobass-instagram-dismissed', String(Date.now())); } catch {}
  });
  const pageOpenedAt = Date.now();
  let lastDismissed = 0;
  try { lastDismissed = Number(localStorage.getItem('eccobass-instagram-dismissed')) || 0; } catch {}
  const maybePopup = () => {
    if (popupShown || Date.now() - lastDismissed < 7 * 86400000) return;
    if (Date.now() - pageOpenedAt < 35000) return;
    if (window.scrollY < document.documentElement.scrollHeight * .35) return;
    if (window.scrollY > $('#cotizar').offsetTop - window.innerHeight) return;
    if (document.activeElement?.matches('input,select,textarea,button') || $('dialog[open]')) return;
    showPopup();
  };
  window.addEventListener('scroll', maybePopup, { passive: true });
  window.setTimeout(maybePopup, 36000);
  applyFilters();
  updateSelection();
})();
