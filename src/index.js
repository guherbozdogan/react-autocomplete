(function() {

  const UP_ARROW_KEYCODE = 38;
  const DOWN_ARROW_KEYCODE = 40;
  const ENTER_KEYCODE = 13;

  const ITEM_HIGHLIGHTED_CLASS = 'autocomplete__item--highlighted';

  const SENTINEL = -1;

  function autoComplete(inputElement, options = {}) {

    // Create a container that will contain the menu elements.
    const menuContainerElement = document.createElement('div');
    inputElement.parentNode.insertBefore(menuContainerElement, inputElement.nextSibling);

    // Default options.
    options.filterItems = options.filterItems || function(item) {
      const searchTerm = inputElement.value.toLowerCase();
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
      menuItemElement.classList.add(ITEM_HIGHLIGHTED_CLASS);
    };
    options.unhighlightMenuElement = options.unhighlightMenuElement || function(menuItemElement) {
      menuItemElement.classList.remove(ITEM_HIGHLIGHTED_CLASS);
    };
    options.showMenu = options.showMenu || function() {
      menuContainerElement.style.display = 'block';
    };
    options.hideMenu = options.hideMenu || function() {
      menuContainerElement.style.display = 'none';
    };
    options.getItems = options.getItems || function() {
      return new Promise(function(callback) {
        callback([]);
      });
    };

    // Cache for matched items; maps each `value` to the array of matched items.
    const matchedItemsCache = {};

    // Store the current value of the text box.
    let currentValue = '';

    // Store the value of the text box on every `keydown` event.
    let valueOnKeyDown = '';

    // Stores items that match the `currentValue`.
    let matchedItems = [];

    // Stores the rendered DOM menu elements. Same size as the `matchedItems`
    // array; one-to-one correspondence with `matchedItems`.
    let menuElements = [];

    // The index of the highlighted DOM element in `menuElements`.
    let highlightedIndex = SENTINEL;

    // Whether the menu is visible.
    let isVisible = false;

    // Sentinel for indicating whether we should cancel "stale" calls to `getItems`.
    let uuid = 0;

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

    function incrementHighlightedIndex() {
      if (highlightedIndex < menuElements.length - 1) {
        // Increment.
        highlightedIndex++;
      } else {
        // Revert to the current value of the text box.
        highlightedIndex = SENTINEL;
      }
    }

    function highlightMenuElement(index) {
      if (index !== SENTINEL && menuElements[index]) {
        // Set the text box value to that of the highlight item.
        inputElement.value = matchedItems[index].value;
        // Highlight the menu element at `index`.
        options.highlightMenuElement(menuElements[index]);
      } else {
        // Revert the value of text box.
        inputElement.value = currentValue;
      }
      // Move the input cursor to the end of the text box in the next frame.
      window.requestAnimationFrame(moveTextCursorToEnd);
    }

    function unhighlightMenuElement(index) {
      if (index !== SENTINEL && menuElements[index]) {
        // Unhighlight the menu element at `index`.
        options.unhighlightMenuElement(menuElements[index]);
      }
    }

    function moveTextCursorToEnd() {
      const length = inputElement.value.length;
      inputElement.setSelectionRange(length, length);
    }

    function renderMenuElements() {
      menuElements = matchedItems.map(function(filteredItem) {
        return options.renderMenuItem(filteredItem);
      });
      // Append all the `menuElements` to `menuContainerElement`.
      menuContainerElement.innerHTML = '';
      menuElements.forEach(function(menuElement) {
        menuContainerElement.appendChild(menuElement);
      });
      showMenu();
      highlightedIndex = SENTINEL;
    }

    function updateMenu(value, currentUuid) {
      if (matchedItemsCache[value]) {
        matchedItems = matchedItemsCache[value];
        renderMenuElements();
        return;
      }
      options.getItems(value, inputElement).then(function(items) {
        // Filter the returned `items`.
        matchedItems = items.filter(options.filterItems);
        // Add the current set of `matchedItems` to the cache.
        matchedItemsCache[value] = matchedItems;
        // Exit if:
        // 1. This particular call to `getItems` is "stale" (ie. superseded by
        //    a later call).
        // 2. The text box is currently empty.
        if (uuid !== currentUuid || inputElement.value === '') {
          return;
        }
        renderMenuElements();
      });
    }

    function hideMenu() {
      if (isVisible) {
        options.hideMenu();
        isVisible = false;
      }
    }

    function showMenu() {
      if (!isVisible && matchedItems.length > 0) {
        options.showMenu();
        isVisible = true;
      }
    }

    function reset() {
      matchedItems = [];
      menuElements = [];
      menuContainerElement.innerHTML = '';
      hideMenu();
      uuid = 0;
    }

    const changeHighlightedMenuElementHandlers = {
      [ENTER_KEYCODE]: function() {
        if (matchedItems[highlightedIndex]) {
          currentValue = matchedItems[highlightedIndex].value;
          inputElement.value = currentValue;
          updateMenu(currentValue);
        }
      },
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

    inputElement.addEventListener('keydown', function(event) {
      // Record the value of the text box on `keydown`.
      valueOnKeyDown = inputElement.value;
      // Reset if the text box is empty.
      if (currentValue === '') {
        reset();
        return;
      }
      // Change the highlighted menu item when we press the up and down keys.
      const handler = changeHighlightedMenuElementHandlers[event.keyCode];
      if (handler) {
        handler(event);
      }
    });

    inputElement.addEventListener('keyup', function(event) {
      // Update the autocomplete menu if:
      // 1. We had pressed a key other than the up and down keys
      // 2. The text box value had changed between the `keydown` and
      //    `keyup` events.
      if (!changeHighlightedMenuElementHandlers[event.keyCode] && valueOnKeyDown !== inputElement.value) {
        currentValue = inputElement.value;
        if (currentValue === '') {
          reset();
        } else {
          updateMenu(currentValue, ++uuid);
        }
      }
    });

    inputElement.addEventListener('blur', function() {
      hideMenu();
    });

    inputElement.addEventListener('focus', function() {
      showMenu();
    });

  }

  if (typeof module === 'object') {
    module.exports = autoComplete;
  } else {
    window.autoComplete = autoComplete;
  }

})();
