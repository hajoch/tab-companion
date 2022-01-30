'use strict';

import './popup.css';

(function() {
  
  const options = {};
  // TODO - Investigate how to improve performance

  // Sync settings with storage
  chrome.storage.sync.get('options', (data) => {
    Object.assign(options, data.options);
    // Update UI form
    // optionsForm.autoCollapse.checked = Boolean(options.autoCollapse);
    optionsForm.promptName.checked = Boolean(options.promptName);
  });
  // Listen for form changes
  optionsForm.promptName.addEventListener('change', (event) => {
    options.promptName = event.target.checked;
    chrome.storage.sync.set({options});
  });

  chrome.commands.getAll( (commands) => {
    // Sync users keyboard shortcut settings
    commands.forEach((command) => {
      let element = document.querySelector('#'+command.name);
      element.innerHTML = command.shortcut;
    });
  });

  /*
  optionsForm.autoCollapse.addEventListener('change', (event) => {
    options.autoCollapse = event.target.checked;
    chrome.storage.sync.set({options});
  });
  */
})();
