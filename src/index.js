(() => {

  const items = ["Ada", "Java", "JavaScript", "Brainfuck", "LOLCODE", "Node.js", "Ruby on Rails"];

  const ENTER_KEYCODE = 13;
  const ESCAPE_KEYCODE = 27;
  const LEFT_ARROW_KEYCODE = 37;
  const UP_ARROW_KEYCODE = 38;
  const RIGHT_ARROW_KEYCODE = 39;
  const DOWN_ARROW_KEYCODE = 40;

  const requestAnimationFrame = window.requestAnimationFrame;

  function autoComplete(element, options) {

    const menuContainer = document.createElement('div');
    element.parentNode.insertBefore(menuContainer, element.nextSibling);

    let menuItems = [];
    let highlightedIndex = -1;
    let initialValue = '';

    function incrementHighlightedIndex() {
      if (highlightedIndex === menuItems.length - 1) {
        highlightedIndex = -1;
      } else {
        highlightedIndex++;
      }
    }

    function decrementHighlightedIndex() {
      if (highlightedIndex === -1) {
        highlightedIndex = menuItems.length - 1;
      } else {
        highlightedIndex--;
      }
    }

    function isValidIndex(index) {
      return index > -1 && index < menuItems.length;
    }

    function moveInputCursorToEnd() {
      const length = element.value.length;
      element.setSelectionRange(length, length);
    }

    function highlightItem(index) {
      if (isValidIndex(index)) {
        const menuItem = menuItems[index];
        menuItem.style.color = 'red';
        element.value = menuItem.innerHTML;
      } else {
        element.value = initialValue;
      }
      requestAnimationFrame(moveInputCursorToEnd);
    }

    function unhighlightItem(index) {
      if (isValidIndex(index)) {
        menuItems[index].style.color = 'black';
      }
    }

    function updateAutoCompleteMenu() {
      const value = element.value;
      if (value === '') {
        menuContainer.style.display = 'none';
      } else {
        menuContainer.style.display = 'block';
        menuItems = items.filter((item) => {
          return item.toLowerCase().indexOf(value.toLowerCase()) !== -1;
        }).map((item) => {
          const menuItem = document.createElement('div');
          menuItem.innerHTML = item;
          return menuItem;
        });
        menuContainer.innerHTML = '';
        menuItems.forEach((menuItem) => {
          menuContainer.appendChild(menuItem)
        });
      }
    }

    const keyUpHandlers = {
      [ENTER_KEYCODE]: (event) => {
        console.log('ENTER_KEYCODE', event);
      },
      [ESCAPE_KEYCODE]: (event) => {
        console.log('ESCAPE_KEYCODE', event);
      },
      [LEFT_ARROW_KEYCODE]: (event) => {
        console.log('LEFT_ARROW_KEYCODE', event);
      },
      [UP_ARROW_KEYCODE]: (event) => {
        unhighlightItem(highlightedIndex);
        decrementHighlightedIndex();
        highlightItem(highlightedIndex);
        console.log('UP_ARROW_KEYCODE', highlightedIndex);
      },
      [RIGHT_ARROW_KEYCODE]: (event) => {
        console.log('RIGHT_ARROW_KEYCODE', event);
      },
      [DOWN_ARROW_KEYCODE]: (event) => {
        unhighlightItem(highlightedIndex);
        incrementHighlightedIndex();
        highlightItem(highlightedIndex);
        console.log('DOWN_ARROW_KEYCODE', highlightedIndex);
      }
    };

    element.addEventListener('keydown', (event) => {
      const keyUpHandler = keyUpHandlers[event.keyCode];
      if (keyUpHandler) {
        keyUpHandler(event);
      }
    });

    element.addEventListener('keyup', (event) => {
      const keyUpHandler = keyUpHandlers[event.keyCode];
      if (!keyUpHandler) {
        if (highlightedIndex === -1) {
          initialValue = element.value;
        }
        updateAutoCompleteMenu();
      }
    });
  }

  if (typeof module === 'object') {
    module.exports = autoComplete;
  } else {
    window.autoComplete = autoComplete;
  }

})();
