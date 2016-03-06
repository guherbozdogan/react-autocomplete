import classnames from 'classnames';
import React, {Component, PropTypes} from 'react';

function noop() {}

const SENTINEL = -1;

const initialState = {
  highlightedIndex: SENTINEL,
  initialValue: '',
  isLoading: false,
  isMenuVisible: false,
  items: [],
  value: ''
};

export default class Autocomplete extends Component {
  static propTypes = {
    classNames: PropTypes.shape({
      list: PropTypes.string,
      item: PropTypes.string,
      itemIsHighlighted: PropTypes.string,
      textBox: PropTypes.string,
      textBoxIsLoading: PropTypes.string
    }),
    debounceDuration: PropTypes.number,
    getItems: PropTypes.func.isRequired,
    getValue: PropTypes.func,
    onEnterKeyDown: PropTypes.func,
    renderItem: PropTypes.func,
    shouldCacheItems: PropTypes.bool
  };

  static defaultProps = {
    classNames: {
      list: 'list',
      item: 'item',
      itemIsHighlighted: 'isHighlighted',
      textBox: 'textBox',
      textBoxIsLoading: 'isLoading'
    },
    debounceDuration: 250,
    getValue: (item) => {
      return item.value;
    },
    onEnterKeyDown: noop,
    renderItem: (item) => {
      return item.value;
    },
    shouldCacheItems: true
  };

  state = initialState;

  decrementHighlightedIndex = () => {
    const {
      highlightedIndex,
      items
    } = this.state;
    switch (highlightedIndex) {
      case SENTINEL:
        // Wrap around to the last menu element.
        return items.length - 1;
      case 0:
        // Revert to the original user-input value.
        return SENTINEL;
      default:
        // Decrement.
        return highlightedIndex - 1;
    }
  };

  incrementHighlightedIndex = () => {
    const {
      highlightedIndex,
      items
    } = this.state;
    if (highlightedIndex < items.length - 1) {
      // Increment.
      return highlightedIndex + 1;
    }
    // Revert to the original user-input value.
    return SENTINEL;
  };

  setHighlightedIndex = (highlightedIndex) => {
    const {getValue} = this.props;
    const {
      initialValue,
      items
    } = this.state;
    const isItemHighlighted = highlightedIndex !== SENTINEL;
    this.setState({
      highlightedIndex,
      value: isItemHighlighted
        ? getValue(items[highlightedIndex])
        : initialValue
    });
    window.requestAnimationFrame(isItemHighlighted
      ? this.highlightTextBoxValue
      : this.moveTextBoxCaretToEnd);
  };

  highlightTextBoxValue = () => {
    this.refs.textBox.setSelectionRange(0, this.state.value.length);
  };

  moveTextBoxCaretToEnd = () => {
    const length = this.state.value.length;
    this.refs.textBox.setSelectionRange(length, length);
  };

  hideMenu = () => {
    this.setState({
      isMenuVisible: false
    });
  };

  showMenu = () => {
    this.setState({
      isMenuVisible: true
    });
  };

  reset = () => {
    this.setState(initialState);
  };

  handleBlur = () => {
    this.hideMenu();
  };

  setItems = (items) => {
    this.setState({
      isLoading: false,
      items
    });
    this.showMenu();
  };

  updateItems = (() => {
    let timeout = null;
    let itemsCache = {};
    return (value) => {
      const {
        debounceDuration,
        getItems,
        shouldCacheItems
      } = this.props;
      clearTimeout(timeout);
      const items = shouldCacheItems && itemsCache[value];
      if (items) {
        this.setItems(items);
        return;
      }
      timeout = setTimeout(() => {
        timeout = null;
        this.setState({
          isLoading: true
        });
        getItems(value).then((items) => {
          if (shouldCacheItems) {
            itemsCache[value] = items;
          }
          this.setItems(items);
        });
      }, debounceDuration);
    };
  })();

  keyDownHandlers = {
    ArrowDown: () => {
      this.setHighlightedIndex(this.incrementHighlightedIndex());
    },
    ArrowUp: () => {
      this.setHighlightedIndex(this.decrementHighlightedIndex());
    },
    Enter: () => {
      const {onEnterKeyDown} = this.props;
      const {
        highlightedIndex,
        items,
        value
      } = this.state;
      onEnterKeyDown(value, items[highlightedIndex]);
    },
    Escape: () => {
      this.hideMenu();
      this.refs.textBox.blur();
    }
  };

  handleKeyDown = (event) => {
    const {
      highlightedIndex,
      value
    } = this.state;
    const keyDownHandler = this.keyDownHandlers[event.key];
    if (keyDownHandler) {
      // Save the initial user input value.
      if (highlightedIndex === SENTINEL) {
        this.setState({
          initialValue: value
        });
      }
      keyDownHandler(event);
    }
  };

  // Note that `handleChange` is only called if the text box value has actually
  // changed. It is not called when we hit the up/down arrows.
  handleChange = (event) => {
    const value = event.target.value;
    if (value.trim() === '') {
      this.reset();
      return;
    }
    this.setState({
      highlightedIndex: SENTINEL,
      initialValue: value,
      value
    });
    this.updateItems(value);
  };

  handleFocus = () => {
    this.showMenu();
  };

  handleItemClick = (index) => {
    this.setHighlightedIndex(index);
  };

  // Prevent the text box from losing focus when we click on a menu item.
  handleMenuListMouseDown = (event) => {
    event.preventDefault();
  };

  render() {
    const {
      highlightedIndex,
      isLoading,
      isMenuVisible,
      items,
      value
    } = this.state;
    const {
      classNames,
      renderItem
    } = this.props;
    return (
      <div>
        <div className={classnames(classNames.textBox, isLoading && classNames.textBoxIsLoading)}>
          <input onBlur={this.handleBlur}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onKeyDown={this.handleKeyDown}
            ref="textBox"
            type="text"
            value={value} />
        </div>
        {isMenuVisible && items.length > 0 &&
          <div className={classNames.list}
            onMouseDown={this.handleMenuListMouseDown}>
            {items.map((item, index) => {
              return (
                <div className={classnames(classNames.item, index === highlightedIndex && classNames.itemIsHighlighted)}
                  key={index}
                  onClick={() => {
                    this.handleItemClick(index);
                  }}>
                  {renderItem(item)}
                </div>
              );
            })}
          </div>}
      </div>
    );
  }
}
