(function() {

  const UP_ARROW_KEYCODE = 38;
  const DOWN_ARROW_KEYCODE = 40;
  const ENTER_KEYCODE = 13;

  const HIGHLIGHTED_ITEM_CLASS = 'autocomplete__menu-item--highlighted';

  const SENTINEL = -1;

  function noop() {}

  function autoComplete(inputElement, menuContainerElement, options = {}) {

    // Callbacks.
    options.filterItems = options.filterItems || function(items) {
      return items.filter(function(item) {
        const searchTerm = inputElement.value.toLowerCase();
        return item.keys.filter(function(key) {
          return key.toLowerCase().indexOf(searchTerm) !== -1;
        }).length > 0;
      });
    };
    options.getItems = options.getItems || function() {
      return new Promise(function(callback) {
        callback([]);
      });
    };
    options.renderMenuElement = options.renderMenuElement || function(matchedItem) {
      const menuElement = document.createElement('div');
      menuElement.innerHTML = matchedItem.value;
      return menuElement;
    };
    options.renderMenuElements = options.renderMenuElements || function(menuElements, menuContainerElement) {
      menuElements.forEach(function(menuElement) {
        menuContainerElement.appendChild(menuElement);
      });
    };
    options.highlightMenuElement = options.highlightMenuElement || function(menuElement) {
      menuElement.classList.add(HIGHLIGHTED_ITEM_CLASS);
    };
    options.unhighlightMenuElement = options.unhighlightMenuElement || function(menuElement) {
      menuElement.classList.remove(HIGHLIGHTED_ITEM_CLASS);
    };
    options.showMenu = options.showMenu || function(menuContainerElement) {
      menuContainerElement.style.display = 'block';
    };
    options.hideMenu = options.hideMenu || function(menuContainerElement) {
      menuContainerElement.style.display = 'none';
    };
    options.selectMenuElement = options.selectMenuElement || noop;
    options.enterKeyDown = options.enterKeyDown || noop;

    // Cache for matched items; maps each `value` to the array of matched items.
    const matchedItemsCache = {};

    // Store the initial, user-input value of the text box.
    let initialValue = '';

    // Store the value of the text box on every `keydown` event.
    let valueOnKeyDown = '';

    // Stores items that match `initialValue`.
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
          // Revert to the original user-input value.
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
        // Revert to the original user-input value.
        highlightedIndex = SENTINEL;
      }
    }

    function highlightMenuElement(index) {
      if (index !== SENTINEL && menuElements[index]) {
        // Set the text box value to that of the highlight item.
        const matchedItem = matchedItems[index];
        inputElement.value = matchedItem.value;
        // Highlight the menu element at `index`.
        options.highlightMenuElement(matchedItem, menuElements[index]);
        // Move the input caret to the end of the text box in the next frame.
        window.requestAnimationFrame(highlightTextBoxValue);
      } else {
        // Revert to the original user-input value.
        inputElement.value = initialValue;
        // Move the input caret to the end of the text box in the next frame.
        window.requestAnimationFrame(moveCaretToEnd);
      }
    }

    function unhighlightMenuElement(index) {
      if (index !== SENTINEL && menuElements[index]) {
        // Unhighlight the menu element at `index`.
        options.unhighlightMenuElement(matchedItems[index], menuElements[index]);
      }
    }

    function highlightTextBoxValue() {
      const length = inputElement.value.length;
      inputElement.setSelectionRange(0, length);
    }

    function moveCaretToEnd() {
      const length = inputElement.value.length;
      inputElement.setSelectionRange(length, length);
    }

    function selectHighlightedMenuElement() {
      options.selectMenuElement(matchedItems[highlightedIndex], menuElements[highlightedIndex]);
    }

    function renderMenuElements() {
      menuElements = matchedItems.map(function(matchedItem, index) {
        const menuElement = options.renderMenuElement(matchedItem);
        // Hook up `click` events to each item in `menuElements`.
        menuElement.addEventListener('click', function() {
          unhighlightMenuElement(highlightedIndex);
          highlightedIndex = index;
          highlightMenuElement(highlightedIndex);
          selectHighlightedMenuElement();
        });
        return menuElement;
      });
      // Append all the `menuElements` to `menuContainerElement`.
      menuContainerElement.innerHTML = '';
      options.renderMenuElements(menuElements, menuContainerElement);
      showMenu();
      // Unhighlight the highlighted menu element.
      unhighlightMenuElement(highlightedIndex);
      highlightedIndex = SENTINEL;
    }

    function updateMenu(value, currentUuid) {
      if (matchedItemsCache[value]) {
        matchedItems = matchedItemsCache[value];
        renderMenuElements();
        return;
      }
      options.getItems(value).then(function(items) {
        // Filter the returned `items`.
        matchedItems = options.filterItems(items);
        // Add the current set of `matchedItems` to the cache.
        matchedItemsCache[value] = matchedItems;
        // Exit if this particular call to `getItems` is "stale" (ie.
        // superseded by a later call).
        if (currentUuid && currentUuid !== uuid) {
          return;
        }
        renderMenuElements();
      });
    }

    function hideMenu() {
      if (isVisible) {
        options.hideMenu(menuContainerElement);
        isVisible = false;
      }
    }

    function showMenu() {
      if (!isVisible && matchedItems.length > 0) {
        options.showMenu(menuContainerElement);
        isVisible = true;
      }
    }

    function reset() {
      matchedItems = [];
      menuElements = [];
      menuContainerElement.innerHTML = '';
      highlightedIndex = SENTINEL;
      hideMenu();
      uuid = 0;
    }

    const keydownHandlers = {
      [ENTER_KEYCODE]: function() {
        if (highlightedIndex !== SENTINEL) {
          selectHighlightedMenuElement();
        } else {
          options.enterKeyDown(inputElement.value);
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
      if (valueOnKeyDown === '') {
        reset();
        return;
      }
      // Run the handler corresponding to the key that was pressed.
      const handler = keydownHandlers[event.keyCode];
      if (handler) {
        handler();
      }
    });

    inputElement.addEventListener('keyup', function(event) {
      const value = inputElement.value;
      // Reset if the textbox is currently empty
      if (value === '') {
        reset();
        return;
      }
      // Exit if:
      // 1. We had pressed the up, down, or enter keys.
      // 2. The text box value did not change between the `keydown` and
      //    `keyup` events.
      if (keydownHandlers[event.keyCode] || valueOnKeyDown === value) {
        return;
      }
      // Save the initial, user-input value of the text box, before updating
      // the menu.
      if (highlightedIndex === SENTINEL) {
        initialValue = value;
      }
      updateMenu(value, ++uuid);
    });

    // Show and hide the menu respectively on `focus` and on `blur`.
    inputElement.addEventListener('focus', function() {
      showMenu();
    });
    inputElement.addEventListener('blur', function() {
      hideMenu();
    });

    // Stop the text box from losing focus when we click on a menu item.
    menuContainerElement.addEventListener('mousedown', function(event) {
      event.preventDefault();
    });

  }

  if (typeof module === 'object') {
    module.exports = autoComplete;
  } else {
    window.autoComplete = autoComplete;
  }

})();
