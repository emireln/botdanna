// The words the desktop shell shows outside the window: the tray menu and its notice.
const TEXT = {
  en: {
    open: 'Open botdanna',
    coach: 'Chat with the coach',
    live: 'Talk live',
    write: 'Check my writing',
    quit: 'Quit botdanna',
    hint: 'botdanna is still running. Click the tray icon to open it again.',
  },
  pt: {
    open: 'Abrir o botdanna',
    coach: 'Conversar com o coach',
    live: 'Falar ao vivo',
    write: 'Revisar minha escrita',
    quit: 'Sair do botdanna',
    hint: 'O botdanna continua aberto. Clique no ícone da bandeja para abri-lo de novo.',
  },
};

// The language chosen in the app wins. Without one, the system language decides.
function shellLanguage(saved, systemLocale) {
  if (saved === 'en' || saved === 'pt') return saved;
  return String(systemLocale || '').toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

function shellText(language) {
  return TEXT[language] || TEXT.en;
}

module.exports = { shellLanguage, shellText };
