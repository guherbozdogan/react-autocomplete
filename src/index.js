(function() {

  const UP_ARROW_KEYCODE = 38;
  const DOWN_ARROW_KEYCODE = 40;

  const HIGHLIGHTED_MENU_ELEMENT_CLASS = 'autocomplete__item--highlighted';

  const SENTINEL = -1;

  const requestAnimationFrame = window.requestAnimationFrame;

  function autoComplete(element, options = {}) {

    // Create a container that will contain the menu elements.
    const menuContainer = document.createElement('div');
    element.parentNode.insertBefore(menuContainer, element.nextSibling);

    // Default options.
    options.filterItems = options.filterItems || function(item) {
      const searchTerm = element.value.toLowerCase();
      return item.keys.filter(function(key) {
        return key.toLowerCase().indexOf(searchTerm) !== -1;
      }).length > 0;
    };
    options.renderMenuItem = options.renderMenuItem || function(item) {
      const menuItemElement = document.createElement('div');
      menuItemElement.innerHTML = item.value;
      return menuItemElement;
    };
    options.highlightMenuElement = options.highlightMenuElement || function(menuItemElement) {
      menuItemElement.classList.add(HIGHLIGHTED_MENU_ELEMENT_CLASS);
    };
    options.unhighlightMenuElement = options.unhighlightMenuElement || function(menuItemElement) {
      menuItemElement.classList.remove(HIGHLIGHTED_MENU_ELEMENT_CLASS);
    };
    options.getItems = options.getItems || function() {
      return [];
    };

    // Store the current value of the text box.
    let currentValue = '';

    // Store the value of the text box on every `keydown` event.
    let valueOnKeyDown = '';

    // Stores items that match the `currentValue`.
    let filteredItems = [];

    // Stores the rendered DOM menu elements. Same size as the `filteredItems`
    // array; one-to-one correspondence with `filteredItems`.
    let menuElements = [];

    // The index of the highlighted DOM element in `menuElements`.
    let highlightedIndex = SENTINEL;

    function incrementHighlightedIndex() {
      if (highlightedIndex < menuElements.length - 1) {
        // Increment.
        highlightedIndex++;
      } else {
        // Revert to the current value of the text box.
        highlightedIndex = SENTINEL;
      }
    }

    function decrementHighlightedIndex() {
      switch (highlightedIndex) {
        case SENTINEL:
          // Wrap around to the last menu element.
          highlightedIndex = menuElements.length - 1;
          break;
        case 0:
          // Revert to the current value of the text box.
          highlightedIndex = SENTINEL;
          break;
        default:
          // Decrement.
          highlightedIndex--;
      }
    }

    function highlightMenuElement(index) {
      if (index !== SENTINEL) {
        // Set the text box value to that of the highlight item.
        element.value = filteredItems[index].value;
        // Highlight the DOM menu element at `index`.
        options.highlightMenuElement(menuElements[index]);
      } else {
        // Revert the value of text box.
        element.value = currentValue;
      }
      // Move the input cursor to the end of the text box.
      requestAnimationFrame(moveInputCursorToEnd);
    }

    function unhighlightMenuElement(index) {
      if (index !== SENTINEL) {
        // Unhighlight the DOM menu element at `index`.
        options.unhighlightMenuElement(menuElements[index]);
      }
    }

    function moveInputCursorToEnd() {
      const length = element.value.length;
      element.setSelectionRange(length, length);
    }

    function updateAutoCompleteMenu(value) {
      options.getItems(value, element).then(function(items) {
        // Filter the returned `items` using the `filterItemCallback`.
        filteredItems = items.filter(options.filterItems);
        menuElements = filteredItems.map(function(filteredItem) {
          return options.renderMenuItem(filteredItem);
        });
        // Append all the `menuElements` to `menuContainer`.
        menuContainer.innerHTML = '';
        menuElements.forEach(function(menuElement) {
          menuContainer.appendChild(menuElement);
        });
        menuContainer.style.display = 'block';
      });
   }

    const changeHighlightedMenuElementHandlers = {
      [UP_ARROW_KEYCODE]: function() {
        unhighlightMenuElement(highlightedIndex);
        decrementHighlightedIndex();
        highlightMenuElement(highlightedIndex);
      },
      [DOWN_ARROW_KEYCODE]: function() {
        unhighlightMenuElement(highlightedIndex);
        incrementHighlightedIndex();
        highlightMenuElement(highlightedIndex);
      }
    };

    element.addEventListener('keydown', function(event) {
      // Record the value of the text box.
      valueOnKeyDown = element.value;
      // Change the highlighted menu item when we hit the up and down keys.
      const handler = changeHighlightedMenuElementHandlers[event.keyCode];
      if (handler) {
        handler(event);
      }
    });

    element.addEventListener('keyup', function(event) {
      // Update the autocomplete menu if we had not hit up and down keys and
      // if the value of the text box has changed between the `keydown` and
      // `keyup` events.
      if (!changeHighlightedMenuElementHandlers[event.keyCode] && valueOnKeyDown !== element.value) {
        currentValue = element.value;
        if (currentValue !== '') {
          updateAutoCompleteMenu(currentValue);
        }
      }
    });

  }

  if (typeof module === 'object') {
    module.exports = autoComplete;
  } else {
    window.autoComplete = autoComplete;
  }

})();
