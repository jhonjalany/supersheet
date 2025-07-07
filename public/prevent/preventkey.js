document.addEventListener('keydown', function(e) {
    // Ctrl + U, S, Shift + I, etc.
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 's' || e.key === 'i')) {
      e.preventDefault();
    }
    // F12 key
    if (e.keyCode === 123) {
      e.preventDefault();
    }
  });