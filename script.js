const translations = [...document.querySelectorAll('[data-en]')].map(element => ({
  element,
  es: element.textContent,
  en: element.dataset.en,
}));
const translatedAttributes = [
  ...[...document.querySelectorAll('[data-en-aria]')].map(element => ({ element, attribute: 'aria-label', es: element.getAttribute('aria-label'), en: element.dataset.enAria })),
  ...[...document.querySelectorAll('[data-en-alt]')].map(element => ({ element, attribute: 'alt', es: element.alt, en: element.dataset.enAlt })),
];
const languageButtons = document.querySelectorAll('[data-language]');
function setLanguage(language) {
  if (language !== 'es' && language !== 'en') return;
  document.documentElement.lang = language;
  translations.forEach(({ element, ...text }) => { element.textContent = text[language]; });
  translatedAttributes.forEach(({ element, attribute, ...text }) => { element.setAttribute(attribute, text[language]); });
  languageButtons.forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.language === language)); });
  document.querySelector('meta[name="description"]').content = language === 'es'
    ? 'Tomás Boquite · Sysadmin & SRE. Consultoría IT, infraestructura on-premise y cloud, automatización y observabilidad.'
    : 'Tomás Boquite · Sysadmin & SRE. IT consulting, on-premise and cloud infrastructure, automation and observability.';
}
languageButtons.forEach(button => { button.addEventListener('click', () => setLanguage(button.dataset.language)); });
document.querySelector('.language-switch').hidden = false;
document.getElementById('year').textContent = new Date().getFullYear();

const filesystemMenu = document.getElementById('filesystem-menu');
const filesystemToggle = filesystemMenu.querySelector('summary');
const fileLinks = filesystemMenu.querySelectorAll('nav a');
const main = document.getElementById('main');
const footer = main.querySelector('footer');
const views = new Map([...main.querySelectorAll(':scope > section')].map(section => [section.id, section]));
const home = views.get('portada');

function focusViewHeading(view) {
  const heading = view.querySelector('h1, h2');
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

function showView(moveFocus = false) {
  const view = views.get(location.hash.slice(1)) || home;
  views.forEach(section => { section.hidden = section !== view; });
  footer.hidden = view === home;
  filesystemMenu.open = false;

  const currentFile = view === home ? '#inicio' : `#${view.id}`;
  fileLinks.forEach(link => {
    if (link.hash === currentFile) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });

  main.scrollTop = 0;
  if (moveFocus) focusViewHeading(view);
}

window.addEventListener('hashchange', () => showView(true));
showView();

document.addEventListener('click', event => {
  if (!filesystemMenu.contains(event.target)) filesystemMenu.open = false;

  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  if (link.classList.contains('skip-link') || link.hash === location.hash) {
    event.preventDefault();
    showView(true);
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && filesystemMenu.open) {
    filesystemMenu.open = false;
    filesystemToggle.focus();
  }
});

const crtToggle = document.querySelector('.crt-toggle');
crtToggle.hidden = false;
crtToggle.addEventListener('click', () => {
  const disabled = document.documentElement.classList.toggle('crt-off');
  crtToggle.setAttribute('aria-pressed', String(!disabled));
});

document.querySelectorAll('[data-tabs]').forEach(editor => {
  const tabList = editor.querySelector('[role="tablist"]');
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const pages = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

  pages.forEach((page, index) => {
    page.setAttribute('role', 'tabpanel');
    page.setAttribute('aria-labelledby', tabs[index].id);
    page.tabIndex = 0;
  });

  function selectTab(selectedIndex) {
    tabs.forEach((tab, index) => {
      const selected = index === selectedIndex;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      pages[index].hidden = !selected;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', event => {
      let nextIndex;
      switch (event.key) {
        case 'ArrowRight': nextIndex = (index + 1) % tabs.length; break;
        case 'ArrowLeft': nextIndex = (index - 1 + tabs.length) % tabs.length; break;
        case 'Home': nextIndex = 0; break;
        case 'End': nextIndex = tabs.length - 1; break;
        default: return;
      }
      event.preventDefault();
      selectTab(nextIndex);
      tabs[nextIndex].focus();
    });
  });

  selectTab(0);
  tabList.hidden = false;
});
