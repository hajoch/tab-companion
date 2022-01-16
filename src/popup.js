'use strict';

import './popup.css';

(function() {
  
  const options = {};
  // TODO - Investigate how to improve performance

  // Sync settings with storage
  chrome.storage.sync.get('options', (data) => {
    Object.assign(options, data.options);
    // Update UI form
    optionsForm.autoCollapse.checked = Boolean(options.autoCollapse);
    optionsForm.autoName.checked = Boolean(options.autoName);
  });

  // Listen for form changes
  optionsForm.autoCollapse.addEventListener('change', (event) => {
    options.autoCollapse = event.target.checked;
    chrome.storage.sync.set({options});
  });
  optionsForm.autoName.addEventListener('change', (event) => {
    options.autoName = event.target.checked;
    chrome.storage.sync.set({options});
  });

  chrome.commands.getAll( (commands) => {
      // Create an unordered list
      commands.forEach((command) => {
        let element = document.querySelector('#'+command.name);
        element.innerHTML = command.shortcut;
      });
    });
})();
