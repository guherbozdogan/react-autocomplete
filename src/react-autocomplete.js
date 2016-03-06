import classnames from 'classnames';
import React, {Component, PropTypes} from 'react';

function noop() {}

const SENTINEL = -1;

const initialState = {
  highlightedIndex: SENTINEL,
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
      itemHighlighted: PropTypes.string,
      textBox: PropTypes.string
    }),
    debounceDuration: PropTypes.number,
    getItems: PropTypes.func.isRequired,
    getValue: PropTypes.func,
    onEnterKeyDown: PropTypes.func,
    renderItem: PropTypes.func
  };

  static defaultProps = {
    classNames: {
      list: 'list',
      item: 'item',
      itemHighlighted: 'highlighted',
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
    }
  };

  state = initialState;

  constructor(props) {
    super(props);
    const {
      classNames,
      debounceDuration,
      getItems,
      getValue,
      onEnterKeyDown,
      renderItem
    } = this.props;
    this.classNames = classNames;
    this.debounceDuration = debounceDuration;
    this.getItems = getItems;
    this.getValue = getValue;
    this.initialValue = '';
    this.itemsCache = {};
    this.onEnterKeyDown = onEnterKeyDown;
    this.renderItem = renderItem;
    this.timeout = null;
  }

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
    const {items} = this.state;
    const isItemHighlighted = highlightedIndex !== SENTINEL;
    this.setState({
      highlightedIndex,
      value: isItemHighlighted
        ? this.getValue(items[highlightedIndex])
        : this.initialValue
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

  updateItems = (value) => {
    clearTimeout(this.timeout);
    const items = this.itemsCache[value];
    if (items) {
      this.setItems(items);
      return;
    }
    this.timeout = setTimeout(() => {
      this.timeout = null;
      this.setState({
        isLoading: true
      });
      this.getItems(value).then((items) => {
        this.itemsCache[value] = items;
        this.setItems(items);
      });
    }, this.debounceDuration);
  };

  keyDownHandlers = {
    ArrowDown: () => {
      this.setHighlightedIndex(this.incrementHighlightedIndex());
    },
    ArrowUp: () => {
      this.setHighlightedIndex(this.decrementHighlightedIndex());
    },
    Enter: () => {
      const {
        highlightedIndex,
        items,
        value
      } = this.state;
      this.onEnterKeyDown(value, items[highlightedIndex]);
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
        this.initialValue = value;
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
    this.initialValue = value;
    this.setState({
      highlightedIndex: SENTINEL,
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
    return (
      <div>
        <div className={classnames(this.classNames.textBox, isLoading && this.classNames.textBoxIsLoading)}>
          <input onBlur={this.handleBlur}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onKeyDown={this.handleKeyDown}
            ref="textBox"
            type="text"
            value={value} />
        </div>
        {isMenuVisible && items.length > 0 &&
          <div className={this.classNames.list}
            onMouseDown={this.handleMenuListMouseDown}>
            {items.map((item, index) => {
              return (
                <div className={classnames(this.classNames.item, index === highlightedIndex && this.classNames.itemHighlighted)}
                  key={index}
                  onClick={() => {
                    this.handleItemClick(index);
                  }}>
                  {this.renderItem(item)}
                </div>
              );
            })}
          </div>}
      </div>
    );
  }
}
