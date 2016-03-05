(function() {

  const ENTER_KEYCODE = 13;
  const ESCAPE_KEYCODE = 27;
  const UP_ARROW_KEYCODE = 38;
  const DOWN_ARROW_KEYCODE = 40;

  const HIGHLIGHTED_ITEM_CLASS = 'autocomplete__menu-item--highlighted';

  const SENTINEL = -1;

  function noop() {}

  function autoComplete(inputElement, menuContainerElement, options = {}) {

    // Callbacks.
    options.filterItems = options.filterItems || function(items) {
      return items;
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

    // Stores items that match `initialValue`.
    let matchedItems = [];

    // Stores the rendered DOM menu elements. Same size as the `matchedItems`
    // array; one-to-one correspondence with `matchedItems`.
    let menuElements = [];

    // The index of the highlighted DOM element in `menuElements`.
    let highlightedIndex = SENTINEL;

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

    function unhighlightMenuElement(index) {
      if (index !== SENTINEL && menuElements[index]) {
        // Unhighlight the menu element at `index`.
        options.unhighlightMenuElement(matchedItems[index], menuElements[index]);
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
      menuElements = matchedItems.map(function(matchedItem) {
        return options.renderMenuElement(matchedItem);
      });
      // Append all the `menuElements` to `menuContainerElement`.
      menuContainerElement.innerHTML = '';
      options.renderMenuElements(menuElements, menuContainerElement);
      showMenu();
      // Unhighlight the highlighted menu element.
      unhighlightMenuElement(highlightedIndex);
      highlightedIndex = SENTINEL;
    }

    let timeout;
    function updateMenu(value) {
      // Debounce.
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
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
          renderMenuElements();
        });
      }, 200);
    }

    let isVisible = false;
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
      // Explicitly `null` out references to each `menuElement`.
      menuElements.forEach(function(menuElement, index) {
        menuElements[index] = null;
      });
      menuElements = [];
      menuContainerElement.innerHTML = '';
      highlightedIndex = SENTINEL;
      hideMenu();
    }

    const keydownHandlers = {
      [ENTER_KEYCODE]: function() {
        if (highlightedIndex === SENTINEL) {
          options.enterKeyDown(inputElement.value);
        } else {
          selectHighlightedMenuElement();
        }
      },
      [ESCAPE_KEYCODE]: function() {
        inputElement.blur();
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

    let valueOnKeyDown = '';

    function inputElementOnKeyDown(event) {
      // Record the value of the text box on `keydown`.
      valueOnKeyDown = inputElement.value.trim();
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
    }
    inputElement.addEventListener('keydown', inputElementOnKeyDown);

    function inputElementOnKeyUp(event) {
      const value = inputElement.value.trim();
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
      updateMenu(value);
    }
    inputElement.addEventListener('keyup', inputElementOnKeyUp);

    // Show and hide the menu respectively on `focus` and on `blur`.
    inputElement.addEventListener('focus', showMenu);
    inputElement.addEventListener('blur', hideMenu);

    // Helper to find the index of the element in `menuElements` that
    // was clicked. Recursive; walks up the DOM tree towards
    // `menuContainerElement`.
    function findClickedMenuElementIndex(element) {
      if (!element || element === menuContainerElement) {
        return -1;
      }
      const index = menuElements.indexOf(element);
      if (index !== -1) {
        return index;
      }
      return findClickedMenuElementIndex(element.parentNode);
    }
    function menuContainerElementOnClick(event) {
      const clickedMenuElementIndex = findClickedMenuElementIndex(event.target);
      if (clickedMenuElementIndex !== -1) {
        // Highlight the clicked menu element.
        unhighlightMenuElement(highlightedIndex);
        highlightedIndex = clickedMenuElementIndex;
        highlightMenuElement(highlightedIndex);
        // Select the clicked menu element.
        selectHighlightedMenuElement();
      }
    }
    menuContainerElement.addEventListener('click', menuContainerElementOnClick);

    // Prevent the text box from losing focus when we click on a menu item.
    function menuContainerElementOnMouseDown(event) {
      event.preventDefault();
    }
    menuContainerElement.addEventListener('mousedown', menuContainerElementOnMouseDown);

    // Return a function for removing all the event listeners we had bound.
    return function() {
      reset();
      inputElement.removeEventListener('keydown', inputElementOnKeyDown);
      inputElement.removeEventListener('keyup', inputElementOnKeyUp);
      inputElement.removeEventListener('focus', showMenu);
      inputElement.removeEventListener('blur', hideMenu);
      menuContainerElement.removeEventListener('click', menuContainerElementOnClick);
      menuContainerElement.removeEventListener('mousedown', menuContainerElementOnMouseDown);
    };

  }

  if (typeof module === 'object') {
    module.exports = autoComplete;
  } else {
    window.autoComplete = autoComplete;
  }

})();
