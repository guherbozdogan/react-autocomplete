import classnames from 'classnames';
import React, {cloneElement, Component, PropTypes} from 'react';

// Index that indicates that none of the autocomplete results is
// currently highlighted.
const SENTINEL = -1;

export default class AutoComplete extends Component {
  static propTypes = {
    children: PropTypes.node,
    classNames: PropTypes.objectOf(PropTypes.string),
    debounceDuration: PropTypes.number,
    getResultItemValue: PropTypes.func.isRequired,
    getResultList: PropTypes.func.isRequired,
    onEnterKeyDown: PropTypes.func,
    onResultItemClick: PropTypes.func,
    renderBeforeTextBox: PropTypes.func,
    renderAfterTextBox: PropTypes.func,
    renderBeforeResultList: PropTypes.func,
    renderAfterResultList: PropTypes.func,
    renderResultItem: PropTypes.func.isRequired,
    shouldCacheResultList: PropTypes.bool
  };

  static defaultProps = {
    children: (
      <input aria-autocomplete="both"
        role="combobox"
        type="text" />
    ),
    classNames: {
      isHighlighted: 'isHighlighted',
      isLoading: 'isLoading',
      resultItem: 'resultItem',
      resultList: 'resultList',
      root: 'root',
      textBox: 'textBox'
    },
    debounceDuration: 250,
    shouldCacheResultList: true
  };

  static initialState = {
    highlightedIndex: SENTINEL,
    initialValue: '',
    isLoading: false,
    isMenuVisible: false,
    resultList: [],
    value: ''
  };

  state = AutoComplete.initialState;

  // Returns the value of `state.highlightedIndex` decremented by 1.
  // If necessary, wraps around to the last item, or reverts to `SENTINEL`
  // (ie. no item highlighted).
  decrementHighlightedIndex = () => {
    const {
      highlightedIndex,
      resultList
    } = this.state;
    switch (highlightedIndex) {
      case SENTINEL:
        return resultList.length - 1;
      case 0:
        return SENTINEL;
      default:
        return highlightedIndex - 1;
    }
  };

  // Returns the value of `state.highlightedIndex` incremented by 1.
  // If necessary, reverts to `SENTINEL` (ie. no item highlighted).
  incrementHighlightedIndex = () => {
    const {
      highlightedIndex,
      resultList
    } = this.state;
    if (highlightedIndex === resultList.length - 1) {
      return SENTINEL;
    }
    return highlightedIndex + 1;
  };

  // Set the current highlighted item to the item at the given
  // `highlightedIndex`. Set the text box's value to that of the new
  // highlighted item.
  setHighlightedItem = (highlightedIndex) => {
    const {getResultItemValue} = this.props;
    const {
      initialValue,
      resultList
    } = this.state;
    const isAnyItemHighlighted = highlightedIndex !== SENTINEL;
    this.setState({
      highlightedIndex,
      value: isAnyItemHighlighted
        ? getResultItemValue.call(this, resultList[highlightedIndex])
        : initialValue
    });
    window.requestAnimationFrame(isAnyItemHighlighted
      ? this.selectTextBoxValue
      : this.moveTextBoxCaretToEnd);
  };

  // Select all the text in the text box.
  selectTextBoxValue = () => {
    const {value} = this.state;
    this.refs.textBox.setSelectionRange(0, value.length);
  };

  // Move the caret in the text box to the end of the text box.
  moveTextBoxCaretToEnd = () => {
    const {value} = this.state;
    const length = value.length;
    this.refs.textBox.setSelectionRange(length, length);
  };

  // Hide the result menu.
  hideResultMenu = () => {
    this.setState({
      isMenuVisible: false
    });
  };

  // Show the result menu.
  showResultMenu = () => {
    this.setState({
      isMenuVisible: true
    });
  };

  // Set `state.resultList` to the given `resultList`, set to not loading,
  // and show the results.
  receiveResultList = (resultList) => {
    this.setState({
      isLoading: false,
      resultList
    });
    this.showResultMenu();
  };

  // Update `state.resultList` based on the given `value`.
  // - Caches results for `state.resultList` in a `cache`; returns
  //   immediately if the results for `value` is already in `cache`.
  // - "Rate-limited" to prevent unnecessary calls to `getResultList`.
  //   Only calls `getResultList` if `updateResultList` has not been
  //   called for at least `debounceDuration`.
  updateResultList = (() => {
    let timeout = null;
    let cache = {};
    return (value) => {
      const {
        debounceDuration,
        getResultList,
        shouldCacheResultList
      } = this.props;
      clearTimeout(timeout);
      const resultList = shouldCacheResultList && cache[value];
      if (resultList) {
        this.receiveResultList(resultList);
        return;
      }
      timeout = setTimeout(() => {
        timeout = null;
        this.setState({
          isLoading: true
        });
        getResultList.call(this, value).then((resultList) => {
          if (shouldCacheResultList) {
            cache[value] = resultList;
          }
          this.receiveResultList(resultList);
        });
      }, debounceDuration);
    };
  })();

  // Reset to the initial state ie. empty text box with no results.
  reset = () => {
    this.setState(AutoComplete.initialState);
  };

  keyDownHandlers = {
    ArrowDown: () => {
      this.setHighlightedItem(this.incrementHighlightedIndex());
    },
    ArrowUp: () => {
      this.setHighlightedItem(this.decrementHighlightedIndex());
    },
    Enter: () => {
      this.handleEnterKeyDown();
    },
    Escape: () => {
      this.hideResultMenu();
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
    this.updateResultList(value);
  };

  handleBlur = () => {
    this.hideResultMenu();
  };

  handleEnterKeyDown = () => {
    const {onEnterKeyDown} = this.props;
    const {
      highlightedIndex,
      resultList,
      value
    } = this.state;
    onEnterKeyDown && onEnterKeyDown.call(this, value, resultList[highlightedIndex]);
  };

  handleFocus = () => {
    this.showResultMenu();
  };

  handleResultItemClick = (index) => {
    const {resultList} = this.state;
    const {
      getResultItemValue,
      onResultItemClick
    } = this.props;
    const result = resultList[index];
    onResultItemClick && onResultItemClick(getResultItemValue.call(this, result), result);
    this.setHighlightedItem(index);
  };

  // Prevent the text box from losing focus when we click outside the text
  // box (eg. click on the result menu).
  handleMouseDown = (event) => {
    event.preventDefault();
  };

  render() {
    const {
      children,
      classNames,
      renderBeforeTextBox,
      renderAfterTextBox,
      renderBeforeResultList,
      renderAfterResultList,
      renderResultItem
    } = this.props;
    const {
      highlightedIndex,
      isLoading,
      isMenuVisible,
      resultList,
      value
    } = this.state;
    const onMouseDownProp = {
      onMouseDown: this.handleMouseDown
    };
    return (
      <div className={classnames(classNames.root, isLoading && classNames.isLoading)}>
        {renderBeforeTextBox &&
          cloneElement(renderBeforeTextBox.call(this), onMouseDownProp)}
        <div className={classNames.textBox}>
          {cloneElement(children, {
            onBlur: this.handleBlur,
            onChange: this.handleChange,
            onFocus: this.handleFocus,
            onKeyDown: this.handleKeyDown,
            ref: 'textBox',
            value: value
          })}
          {isMenuVisible && resultList.length > 0 &&
            <div className={classNames.resultList}
              onMouseDown={this.handleMouseDown}>
              {renderBeforeResultList && renderBeforeResultList.call(this)}
              {resultList.map((resultItem, index) => {
                return (
                  <div className={classnames(classNames.resultItem, index === highlightedIndex && classNames.isHighlighted)}
                    key={index}
                    onClick={this.handleResultItemClick.bind(this, index)}>
                    {renderResultItem.call(this, resultItem)}
                  </div>
                );
              })}
              {renderAfterResultList && renderAfterResultList.call(this)}
            </div>}
        </div>
        {renderAfterTextBox &&
          cloneElement(renderAfterTextBox.call(this), onMouseDownProp)}
      </div>
    );
  }
}
