'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Index that indicates that none of the autocomplete results is
// currently highlighted.
var SENTINEL = -1;

var AutoComplete = function (_Component) {
  _inherits(AutoComplete, _Component);

  function AutoComplete() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, AutoComplete);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = AutoComplete.__proto__ || Object.getPrototypeOf(AutoComplete)).call.apply(_ref, [this].concat(args))), _this), _this.state = AutoComplete.initialState, _this.decrementHighlightedIndex = function () {
      var _this$state = _this.state,
          highlightedIndex = _this$state.highlightedIndex,
          resultList = _this$state.resultList;

      switch (highlightedIndex) {
        case SENTINEL:
          return resultList.length - 1;
        case 0:
          return SENTINEL;
        default:
          return highlightedIndex - 1;
      }
    }, _this.incrementHighlightedIndex = function () {
      var _this$state2 = _this.state,
          highlightedIndex = _this$state2.highlightedIndex,
          resultList = _this$state2.resultList;

      if (highlightedIndex === resultList.length - 1) {
        return SENTINEL;
      }
      return highlightedIndex + 1;
    }, _this.setHighlightedItem = function (highlightedIndex) {
      var getResultItemValue = _this.props.getResultItemValue;
      var _this$state3 = _this.state,
          initialValue = _this$state3.initialValue,
          resultList = _this$state3.resultList;

      var isAnyItemHighlighted = highlightedIndex !== SENTINEL;
      _this.setState({
        highlightedIndex: highlightedIndex,
        value: isAnyItemHighlighted ? getResultItemValue.call(_this, resultList[highlightedIndex]) : initialValue
      });
      window.requestAnimationFrame(isAnyItemHighlighted ? _this.selectTextBoxValue : _this.moveTextBoxCaretToEnd);
    }, _this.selectTextBoxValue = function () {
      var value = _this.state.value;

      _this.refs.textBox.setSelectionRange(0, value.length);
    }, _this.moveTextBoxCaretToEnd = function () {
      var value = _this.state.value;

      var length = value.length;
      _this.refs.textBox.setSelectionRange(length, length);
    }, _this.hideResultMenu = function () {
      _this.setState({
        isMenuVisible: false
      });
    }, _this.showResultMenu = function () {
      _this.setState({
        isMenuVisible: true
      });
    }, _this.receiveResultList = function (resultList) {
      _this.setState({
        isLoading: false,
        resultList: resultList
      });
      _this.showResultMenu();
    }, _this.updateResultList = function () {
      var timeout = null;
      var cache = {};
      return function (value) {
        var _this$props = _this.props,
            debounceDuration = _this$props.debounceDuration,
            getResultList = _this$props.getResultList,
            shouldCacheResultList = _this$props.shouldCacheResultList;

        clearTimeout(timeout);
        var resultList = shouldCacheResultList && cache[value];
        if (resultList) {
          _this.receiveResultList(resultList);
          return;
        }
        timeout = setTimeout(function () {
          timeout = null;
          _this.setState({
            isLoading: true
          });
          getResultList.call(_this, value).then(function (resultList) {
            if (shouldCacheResultList) {
              cache[value] = resultList;
            }
            _this.receiveResultList(resultList);
          });
        }, debounceDuration);
      };
    }(), _this.reset = function () {
      _this.setState(AutoComplete.initialState);
    }, _this.keyDownHandlers = {
      ArrowDown: function ArrowDown() {
        _this.setHighlightedItem(_this.incrementHighlightedIndex());
      },
      ArrowUp: function ArrowUp() {
        _this.setHighlightedItem(_this.decrementHighlightedIndex());
      },
      Enter: function Enter() {
        _this.handleEnterKeyDown();
      },
      Escape: function Escape() {
        _this.hideResultMenu();
        _this.refs.textBox.blur();
      }
    }, _this.handleKeyDown = function (event) {
      var _this$state4 = _this.state,
          highlightedIndex = _this$state4.highlightedIndex,
          value = _this$state4.value;

      var keyDownHandler = _this.keyDownHandlers[event.key];
      if (keyDownHandler) {
        // Save the initial user input value.
        if (highlightedIndex === SENTINEL) {
          _this.setState({
            initialValue: value
          });
        }
        keyDownHandler(event);
      }
    }, _this.handleChange = function (event) {
      var value = event.target.value;
      if (value.trim() === '') {
        _this.reset();
        return;
      }
      _this.setState({
        highlightedIndex: SENTINEL,
        initialValue: value,
        value: value
      });
      _this.updateResultList(value);
    }, _this.handleBlur = function () {
      _this.hideResultMenu();
    }, _this.handleEnterKeyDown = function () {
      var onEnterKeyDown = _this.props.onEnterKeyDown;
      var _this$state5 = _this.state,
          highlightedIndex = _this$state5.highlightedIndex,
          resultList = _this$state5.resultList,
          value = _this$state5.value;

      onEnterKeyDown && onEnterKeyDown.call(_this, value, resultList[highlightedIndex]);
    }, _this.handleFocus = function () {
      _this.showResultMenu();
    }, _this.handleResultItemClick = function (index) {
      var resultList = _this.state.resultList;
      var _this$props2 = _this.props,
          getResultItemValue = _this$props2.getResultItemValue,
          onResultItemClick = _this$props2.onResultItemClick;

      var result = resultList[index];
      onResultItemClick && onResultItemClick(getResultItemValue.call(_this, result), result);
      _this.setHighlightedItem(index);
    }, _this.handleMouseDown = function (event) {
      event.preventDefault();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  // Returns the value of `state.highlightedIndex` decremented by 1.
  // If necessary, wraps around to the last item, or reverts to `SENTINEL`
  // (ie. no item highlighted).


  // Returns the value of `state.highlightedIndex` incremented by 1.
  // If necessary, reverts to `SENTINEL` (ie. no item highlighted).


  // Set the current highlighted item to the item at the given
  // `highlightedIndex`. Set the text box's value to that of the new
  // highlighted item.


  // Select all the text in the text box.


  // Move the caret in the text box to the end of the text box.


  // Hide the result menu.


  // Show the result menu.


  // Set `state.resultList` to the given `resultList`, set to not loading,
  // and show the results.


  // Update `state.resultList` based on the given `value`.
  // - Caches results for `state.resultList` in a `cache`; returns
  //   immediately if the results for `value` is already in `cache`.
  // - "Rate-limited" to prevent unnecessary calls to `getResultList`.
  //   Only calls `getResultList` if `updateResultList` has not been
  //   called for at least `debounceDuration`.


  // Reset to the initial state ie. empty text box with no results.


  // Note that `handleChange` is only called if the text box value has actually
  // changed. It is not called when we hit the up/down arrows.


  // Prevent the text box from losing focus when we click outside the text
  // box (eg. click on the result menu).


  _createClass(AutoComplete, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          children = _props.children,
          classNames = _props.classNames,
          renderBeforeTextBox = _props.renderBeforeTextBox,
          renderAfterTextBox = _props.renderAfterTextBox,
          renderBeforeResultList = _props.renderBeforeResultList,
          renderAfterResultList = _props.renderAfterResultList,
          renderResultItem = _props.renderResultItem;
      var _state = this.state,
          highlightedIndex = _state.highlightedIndex,
          isLoading = _state.isLoading,
          isMenuVisible = _state.isMenuVisible,
          resultList = _state.resultList,
          value = _state.value;

      var onMouseDownProp = {
        onMouseDown: this.handleMouseDown
      };
      return _react2.default.createElement(
        'div',
        { className: (0, _classnames2.default)(classNames.root, isLoading && classNames.isLoading) },
        renderBeforeTextBox && (0, _react.cloneElement)(renderBeforeTextBox.call(this), onMouseDownProp),
        _react2.default.createElement(
          'div',
          { className: classNames.textBox },
          (0, _react.cloneElement)(children, {
            onBlur: this.handleBlur,
            onChange: this.handleChange,
            onFocus: this.handleFocus,
            onKeyDown: this.handleKeyDown,
            ref: 'textBox',
            value: value
          }),
          isMenuVisible && resultList.length > 0 && _react2.default.createElement(
            'div',
            { className: classNames.resultList,
              onMouseDown: this.handleMouseDown },
            renderBeforeResultList && renderBeforeResultList.call(this),
            resultList.map(function (resultItem, index) {
              return _react2.default.createElement(
                'div',
                { className: (0, _classnames2.default)(classNames.resultItem, index === highlightedIndex && classNames.isHighlighted),
                  key: index,
                  onClick: _this2.handleResultItemClick.bind(_this2, index) },
                renderResultItem.call(_this2, resultItem)
              );
            }),
            renderAfterResultList && renderAfterResultList.call(this)
          )
        ),
        renderAfterTextBox && (0, _react.cloneElement)(renderAfterTextBox.call(this), onMouseDownProp)
      );
    }
  }]);

  return AutoComplete;
}(_react.Component);

AutoComplete.propTypes = {
  children: _propTypes2.default.node,
  classNames: _propTypes2.default.objectOf(_propTypes2.default.string),
  debounceDuration: _propTypes2.default.number,
  getResultItemValue: _propTypes2.default.func.isRequired,
  getResultList: _propTypes2.default.func.isRequired,
  onEnterKeyDown: _propTypes2.default.func,
  onResultItemClick: _propTypes2.default.func,
  renderBeforeTextBox: _propTypes2.default.func,
  renderAfterTextBox: _propTypes2.default.func,
  renderBeforeResultList: _propTypes2.default.func,
  renderAfterResultList: _propTypes2.default.func,
  renderResultItem: _propTypes2.default.func.isRequired,
  shouldCacheResultList: _propTypes2.default.bool
};
AutoComplete.defaultProps = {
  children: _react2.default.createElement('input', { 'aria-autocomplete': 'both',
    role: 'combobox',
    type: 'text' }),
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
AutoComplete.initialState = {
  highlightedIndex: SENTINEL,
  initialValue: '',
  isLoading: false,
  isMenuVisible: false,
  resultList: [],
  value: ''
};
exports.default = AutoComplete;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIlNFTlRJTkVMIiwiQXV0b0NvbXBsZXRlIiwic3RhdGUiLCJpbml0aWFsU3RhdGUiLCJkZWNyZW1lbnRIaWdobGlnaHRlZEluZGV4IiwiaGlnaGxpZ2h0ZWRJbmRleCIsInJlc3VsdExpc3QiLCJsZW5ndGgiLCJpbmNyZW1lbnRIaWdobGlnaHRlZEluZGV4Iiwic2V0SGlnaGxpZ2h0ZWRJdGVtIiwiZ2V0UmVzdWx0SXRlbVZhbHVlIiwicHJvcHMiLCJpbml0aWFsVmFsdWUiLCJpc0FueUl0ZW1IaWdobGlnaHRlZCIsInNldFN0YXRlIiwidmFsdWUiLCJjYWxsIiwid2luZG93IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwic2VsZWN0VGV4dEJveFZhbHVlIiwibW92ZVRleHRCb3hDYXJldFRvRW5kIiwicmVmcyIsInRleHRCb3giLCJzZXRTZWxlY3Rpb25SYW5nZSIsImhpZGVSZXN1bHRNZW51IiwiaXNNZW51VmlzaWJsZSIsInNob3dSZXN1bHRNZW51IiwicmVjZWl2ZVJlc3VsdExpc3QiLCJpc0xvYWRpbmciLCJ1cGRhdGVSZXN1bHRMaXN0IiwidGltZW91dCIsImNhY2hlIiwiZGVib3VuY2VEdXJhdGlvbiIsImdldFJlc3VsdExpc3QiLCJzaG91bGRDYWNoZVJlc3VsdExpc3QiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0IiwidGhlbiIsInJlc2V0Iiwia2V5RG93bkhhbmRsZXJzIiwiQXJyb3dEb3duIiwiQXJyb3dVcCIsIkVudGVyIiwiaGFuZGxlRW50ZXJLZXlEb3duIiwiRXNjYXBlIiwiYmx1ciIsImhhbmRsZUtleURvd24iLCJldmVudCIsImtleURvd25IYW5kbGVyIiwia2V5IiwiaGFuZGxlQ2hhbmdlIiwidGFyZ2V0IiwidHJpbSIsImhhbmRsZUJsdXIiLCJvbkVudGVyS2V5RG93biIsImhhbmRsZUZvY3VzIiwiaGFuZGxlUmVzdWx0SXRlbUNsaWNrIiwiaW5kZXgiLCJvblJlc3VsdEl0ZW1DbGljayIsInJlc3VsdCIsImhhbmRsZU1vdXNlRG93biIsInByZXZlbnREZWZhdWx0IiwiY2hpbGRyZW4iLCJjbGFzc05hbWVzIiwicmVuZGVyQmVmb3JlVGV4dEJveCIsInJlbmRlckFmdGVyVGV4dEJveCIsInJlbmRlckJlZm9yZVJlc3VsdExpc3QiLCJyZW5kZXJBZnRlclJlc3VsdExpc3QiLCJyZW5kZXJSZXN1bHRJdGVtIiwib25Nb3VzZURvd25Qcm9wIiwib25Nb3VzZURvd24iLCJyb290Iiwib25CbHVyIiwib25DaGFuZ2UiLCJvbkZvY3VzIiwib25LZXlEb3duIiwicmVmIiwibWFwIiwicmVzdWx0SXRlbSIsImlzSGlnaGxpZ2h0ZWQiLCJiaW5kIiwicHJvcFR5cGVzIiwibm9kZSIsIm9iamVjdE9mIiwic3RyaW5nIiwibnVtYmVyIiwiZnVuYyIsImlzUmVxdWlyZWQiLCJib29sIiwiZGVmYXVsdFByb3BzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0FBR0E7QUFDQTtBQUNBLElBQU1BLFdBQVcsQ0FBQyxDQUFsQjs7SUFFcUJDLFk7Ozs7Ozs7Ozs7Ozs7O2tNQTRDbkJDLEssR0FBUUQsYUFBYUUsWSxRQUtyQkMseUIsR0FBNEIsWUFBTTtBQUFBLHdCQUk1QixNQUFLRixLQUp1QjtBQUFBLFVBRTlCRyxnQkFGOEIsZUFFOUJBLGdCQUY4QjtBQUFBLFVBRzlCQyxVQUg4QixlQUc5QkEsVUFIOEI7O0FBS2hDLGNBQVFELGdCQUFSO0FBQ0UsYUFBS0wsUUFBTDtBQUNFLGlCQUFPTSxXQUFXQyxNQUFYLEdBQW9CLENBQTNCO0FBQ0YsYUFBSyxDQUFMO0FBQ0UsaUJBQU9QLFFBQVA7QUFDRjtBQUNFLGlCQUFPSyxtQkFBbUIsQ0FBMUI7QUFOSjtBQVFELEssUUFJREcseUIsR0FBNEIsWUFBTTtBQUFBLHlCQUk1QixNQUFLTixLQUp1QjtBQUFBLFVBRTlCRyxnQkFGOEIsZ0JBRTlCQSxnQkFGOEI7QUFBQSxVQUc5QkMsVUFIOEIsZ0JBRzlCQSxVQUg4Qjs7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WndGLFksR0FBZTtBQUNwQjNCLFlBQ0UseUNBQU8scUJBQWtCLE1BQXpCO0FBQ0UsVUFBSyxVQURQO0FBRUUsVUFBSyxNQUZQLEdBRmtCO0FBTXBCQyxjQUFZO0FBQ1ZnQixtQkFBZSxlQURMO0FBRVZuRCxlQUFXLFdBRkQ7QUFHVmtELGdCQUFZLFlBSEY7QUFJVnhFLGdCQUFZLFlBSkY7QUFLVmlFLFVBQU0sTUFMSTtBQU1WakQsYUFBUztBQU5DLEdBTlE7QUFjcEJVLG9CQUFrQixHQWRFO0FBZXBCRSx5QkFBdUI7QUFmSCxDO0FBakJIakMsWSxDQW1DWkUsWSxHQUFlO0FBQ3BCRSxvQkFBa0JMLFFBREU7QUFFcEJZLGdCQUFjLEVBRk07QUFHcEJnQixhQUFXLEtBSFM7QUFJcEJILGlCQUFlLEtBSks7QUFLcEJuQixjQUFZLEVBTFE7QUFNcEJTLFNBQU87QUFOYSxDO2tCQW5DSGQsWSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFJlYWN0LCB7Y2xvbmVFbGVtZW50LCBDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cblxuLy8gSW5kZXggdGhhdCBpbmRpY2F0ZXMgdGhhdCBub25lIG9mIHRoZSBhdXRvY29tcGxldGUgcmVzdWx0cyBpc1xuLy8gY3VycmVudGx5IGhpZ2hsaWdodGVkLlxuY29uc3QgU0VOVElORUwgPSAtMTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXV0b0NvbXBsZXRlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjaGlsZHJlbjogUHJvcFR5cGVzLm5vZGUsXG4gICAgY2xhc3NOYW1lczogUHJvcFR5cGVzLm9iamVjdE9mKFByb3BUeXBlcy5zdHJpbmcpLFxuICAgIGRlYm91bmNlRHVyYXRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gICAgZ2V0UmVzdWx0SXRlbVZhbHVlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGdldFJlc3VsdExpc3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25FbnRlcktleURvd246IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uUmVzdWx0SXRlbUNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICByZW5kZXJCZWZvcmVUZXh0Qm94OiBQcm9wVHlwZXMuZnVuYyxcbiAgICByZW5kZXJBZnRlclRleHRCb3g6IFByb3BUeXBlcy5mdW5jLFxuICAgIHJlbmRlckJlZm9yZVJlc3VsdExpc3Q6IFByb3BUeXBlcy5mdW5jLFxuICAgIHJlbmRlckFmdGVyUmVzdWx0TGlzdDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcmVuZGVyUmVzdWx0SXRlbTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBzaG91bGRDYWNoZVJlc3VsdExpc3Q6IFByb3BUeXBlcy5ib29sXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBjaGlsZHJlbjogKFxuICAgICAgPGlucHV0IGFyaWEtYXV0b2NvbXBsZXRlPVwiYm90aFwiXG4gICAgICAgIHJvbGU9XCJjb21ib2JveFwiXG4gICAgICAgIHR5cGU9XCJ0ZXh0XCIgLz5cbiAgICApLFxuICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgIGlzSGlnaGxpZ2h0ZWQ6ICdpc0hpZ2hsaWdodGVkJyxcbiAgICAgIGlzTG9hZGluZzogJ2lzTG9hZGluZycsXG4gICAgICByZXN1bHRJdGVtOiAncmVzdWx0SXRlbScsXG4gICAgICByZXN1bHRMaXN0OiAncmVzdWx0TGlzdCcsXG4gICAgICByb290OiAncm9vdCcsXG4gICAgICB0ZXh0Qm94OiAndGV4dEJveCdcbiAgICB9LFxuICAgIGRlYm91bmNlRHVyYXRpb246IDI1MCxcbiAgICBzaG91bGRDYWNoZVJlc3VsdExpc3Q6IHRydWVcbiAgfTtcblxuICBzdGF0aWMgaW5pdGlhbFN0YXRlID0ge1xuICAgIGhpZ2hsaWdodGVkSW5kZXg6IFNFTlRJTkVMLFxuICAgIGluaXRpYWxWYWx1ZTogJycsXG4gICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICBpc01lbnVWaXNpYmxlOiBmYWxzZSxcbiAgICByZXN1bHRMaXN0OiBbXSxcbiAgICB2YWx1ZTogJydcbiAgfTtcblxuICBzdGF0ZSA9IEF1dG9Db21wbGV0ZS5pbml0aWFsU3RhdGU7XG5cbiAgLy8gUmV0dXJucyB0aGUgdmFsdWUgb2YgYHN0YXRlLmhpZ2hsaWdodGVkSW5kZXhgIGRlY3JlbWVudGVkIGJ5IDEuXG4gIC8vIElmIG5lY2Vzc2FyeSwgd3JhcHMgYXJvdW5kIHRvIHRoZSBsYXN0IGl0ZW0sIG9yIHJldmVydHMgdG8gYFNFTlRJTkVMYFxuICAvLyAoaWUuIG5vIGl0ZW0gaGlnaGxpZ2h0ZWQpLlxuICBkZWNyZW1lbnRIaWdobGlnaHRlZEluZGV4ID0gKCkgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICByZXN1bHRMaXN0XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgc3dpdGNoIChoaWdobGlnaHRlZEluZGV4KSB7XG4gICAgICBjYXNlIFNFTlRJTkVMOlxuICAgICAgICByZXR1cm4gcmVzdWx0TGlzdC5sZW5ndGggLSAxO1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gU0VOVElORUw7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0ZWRJbmRleCAtIDE7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIHZhbHVlIG9mIGBzdGF0ZS5oaWdobGlnaHRlZEluZGV4YCBpbmNyZW1lbnRlZCBieSAxLlxuICAvLyBJZiBuZWNlc3NhcnksIHJldmVydHMgdG8gYFNFTlRJTkVMYCAoaWUuIG5vIGl0ZW0gaGlnaGxpZ2h0ZWQpLlxuICBpbmNyZW1lbnRIaWdobGlnaHRlZEluZGV4ID0gKCkgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICByZXN1bHRMaXN0XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGhpZ2hsaWdodGVkSW5kZXggPT09IHJlc3VsdExpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIFNFTlRJTkVMO1xuICAgIH1cbiAgICByZXR1cm4gaGlnaGxpZ2h0ZWRJbmRleCArIDE7XG4gIH07XG5cbiAgLy8gU2V0IHRoZSBjdXJyZW50IGhpZ2hsaWdodGVkIGl0ZW0gdG8gdGhlIGl0ZW0gYXQgdGhlIGdpdmVuXG4gIC8vIGBoaWdobGlnaHRlZEluZGV4YC4gU2V0IHRoZSB0ZXh0IGJveCdzIHZhbHVlIHRvIHRoYXQgb2YgdGhlIG5ld1xuICAvLyBoaWdobGlnaHRlZCBpdGVtLlxuICBzZXRIaWdobGlnaHRlZEl0ZW0gPSAoaGlnaGxpZ2h0ZWRJbmRleCkgPT4ge1xuICAgIGNvbnN0IHtnZXRSZXN1bHRJdGVtVmFsdWV9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBpbml0aWFsVmFsdWUsXG4gICAgICByZXN1bHRMaXN0XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgaXNBbnlJdGVtSGlnaGxpZ2h0ZWQgPSBoaWdobGlnaHRlZEluZGV4ICE9PSBTRU5USU5FTDtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICB2YWx1ZTogaXNBbnlJdGVtSGlnaGxpZ2h0ZWRcbiAgICAgICAgPyBnZXRSZXN1bHRJdGVtVmFsdWUuY2FsbCh0aGlzLCByZXN1bHRMaXN0W2hpZ2hsaWdodGVkSW5kZXhdKVxuICAgICAgICA6IGluaXRpYWxWYWx1ZVxuICAgIH0pO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaXNBbnlJdGVtSGlnaGxpZ2h0ZWRcbiAgICAgID8gdGhpcy5zZWxlY3RUZXh0Qm94VmFsdWVcbiAgICAgIDogdGhpcy5tb3ZlVGV4dEJveENhcmV0VG9FbmQpO1xuICB9O1xuXG4gIC8vIFNlbGVjdCBhbGwgdGhlIHRleHQgaW4gdGhlIHRleHQgYm94LlxuICBzZWxlY3RUZXh0Qm94VmFsdWUgPSAoKSA9PiB7XG4gICAgY29uc3Qge3ZhbHVlfSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5yZWZzLnRleHRCb3guc2V0U2VsZWN0aW9uUmFuZ2UoMCwgdmFsdWUubGVuZ3RoKTtcbiAgfTtcblxuICAvLyBNb3ZlIHRoZSBjYXJldCBpbiB0aGUgdGV4dCBib3ggdG8gdGhlIGVuZCBvZiB0aGUgdGV4dCBib3guXG4gIG1vdmVUZXh0Qm94Q2FyZXRUb0VuZCA9ICgpID0+IHtcbiAgICBjb25zdCB7dmFsdWV9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG4gICAgdGhpcy5yZWZzLnRleHRCb3guc2V0U2VsZWN0aW9uUmFuZ2UobGVuZ3RoLCBsZW5ndGgpO1xuICB9O1xuXG4gIC8vIEhpZGUgdGhlIHJlc3VsdCBtZW51LlxuICBoaWRlUmVzdWx0TWVudSA9ICgpID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzTWVudVZpc2libGU6IGZhbHNlXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gU2hvdyB0aGUgcmVzdWx0IG1lbnUuXG4gIHNob3dSZXN1bHRNZW51ID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNNZW51VmlzaWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIFNldCBgc3RhdGUucmVzdWx0TGlzdGAgdG8gdGhlIGdpdmVuIGByZXN1bHRMaXN0YCwgc2V0IHRvIG5vdCBsb2FkaW5nLFxuICAvLyBhbmQgc2hvdyB0aGUgcmVzdWx0cy5cbiAgcmVjZWl2ZVJlc3VsdExpc3QgPSAocmVzdWx0TGlzdCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgIHJlc3VsdExpc3RcbiAgICB9KTtcbiAgICB0aGlzLnNob3dSZXN1bHRNZW51KCk7XG4gIH07XG5cbiAgLy8gVXBkYXRlIGBzdGF0ZS5yZXN1bHRMaXN0YCBiYXNlZCBvbiB0aGUgZ2l2ZW4gYHZhbHVlYC5cbiAgLy8gLSBDYWNoZXMgcmVzdWx0cyBmb3IgYHN0YXRlLnJlc3VsdExpc3RgIGluIGEgYGNhY2hlYDsgcmV0dXJuc1xuICAvLyAgIGltbWVkaWF0ZWx5IGlmIHRoZSByZXN1bHRzIGZvciBgdmFsdWVgIGlzIGFscmVhZHkgaW4gYGNhY2hlYC5cbiAgLy8gLSBcIlJhdGUtbGltaXRlZFwiIHRvIHByZXZlbnQgdW5uZWNlc3NhcnkgY2FsbHMgdG8gYGdldFJlc3VsdExpc3RgLlxuICAvLyAgIE9ubHkgY2FsbHMgYGdldFJlc3VsdExpc3RgIGlmIGB1cGRhdGVSZXN1bHRMaXN0YCBoYXMgbm90IGJlZW5cbiAgLy8gICBjYWxsZWQgZm9yIGF0IGxlYXN0IGBkZWJvdW5jZUR1cmF0aW9uYC5cbiAgdXBkYXRlUmVzdWx0TGlzdCA9ICgoKSA9PiB7XG4gICAgbGV0IHRpbWVvdXQgPSBudWxsO1xuICAgIGxldCBjYWNoZSA9IHt9O1xuICAgIHJldHVybiAodmFsdWUpID0+IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgZGVib3VuY2VEdXJhdGlvbixcbiAgICAgICAgZ2V0UmVzdWx0TGlzdCxcbiAgICAgICAgc2hvdWxkQ2FjaGVSZXN1bHRMaXN0XG4gICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIGNvbnN0IHJlc3VsdExpc3QgPSBzaG91bGRDYWNoZVJlc3VsdExpc3QgJiYgY2FjaGVbdmFsdWVdO1xuICAgICAgaWYgKHJlc3VsdExpc3QpIHtcbiAgICAgICAgdGhpcy5yZWNlaXZlUmVzdWx0TGlzdChyZXN1bHRMaXN0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgaXNMb2FkaW5nOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBnZXRSZXN1bHRMaXN0LmNhbGwodGhpcywgdmFsdWUpLnRoZW4oKHJlc3VsdExpc3QpID0+IHtcbiAgICAgICAgICBpZiAoc2hvdWxkQ2FjaGVSZXN1bHRMaXN0KSB7XG4gICAgICAgICAgICBjYWNoZVt2YWx1ZV0gPSByZXN1bHRMaXN0O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnJlY2VpdmVSZXN1bHRMaXN0KHJlc3VsdExpc3QpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIGRlYm91bmNlRHVyYXRpb24pO1xuICAgIH07XG4gIH0pKCk7XG5cbiAgLy8gUmVzZXQgdG8gdGhlIGluaXRpYWwgc3RhdGUgaWUuIGVtcHR5IHRleHQgYm94IHdpdGggbm8gcmVzdWx0cy5cbiAgcmVzZXQgPSAoKSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZShBdXRvQ29tcGxldGUuaW5pdGlhbFN0YXRlKTtcbiAgfTtcblxuICBrZXlEb3duSGFuZGxlcnMgPSB7XG4gICAgQXJyb3dEb3duOiAoKSA9PiB7XG4gICAgICB0aGlzLnNldEhpZ2hsaWdodGVkSXRlbSh0aGlzLmluY3JlbWVudEhpZ2hsaWdodGVkSW5kZXgoKSk7XG4gICAgfSxcbiAgICBBcnJvd1VwOiAoKSA9PiB7XG4gICAgICB0aGlzLnNldEhpZ2hsaWdodGVkSXRlbSh0aGlzLmRlY3JlbWVudEhpZ2hsaWdodGVkSW5kZXgoKSk7XG4gICAgfSxcbiAgICBFbnRlcjogKCkgPT4ge1xuICAgICAgdGhpcy5oYW5kbGVFbnRlcktleURvd24oKTtcbiAgICB9LFxuICAgIEVzY2FwZTogKCkgPT4ge1xuICAgICAgdGhpcy5oaWRlUmVzdWx0TWVudSgpO1xuICAgICAgdGhpcy5yZWZzLnRleHRCb3guYmx1cigpO1xuICAgIH1cbiAgfTtcblxuICBoYW5kbGVLZXlEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleCxcbiAgICAgIHZhbHVlXG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qga2V5RG93bkhhbmRsZXIgPSB0aGlzLmtleURvd25IYW5kbGVyc1tldmVudC5rZXldO1xuICAgIGlmIChrZXlEb3duSGFuZGxlcikge1xuICAgICAgLy8gU2F2ZSB0aGUgaW5pdGlhbCB1c2VyIGlucHV0IHZhbHVlLlxuICAgICAgaWYgKGhpZ2hsaWdodGVkSW5kZXggPT09IFNFTlRJTkVMKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGluaXRpYWxWYWx1ZTogdmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBrZXlEb3duSGFuZGxlcihldmVudCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIE5vdGUgdGhhdCBgaGFuZGxlQ2hhbmdlYCBpcyBvbmx5IGNhbGxlZCBpZiB0aGUgdGV4dCBib3ggdmFsdWUgaGFzIGFjdHVhbGx5XG4gIC8vIGNoYW5nZWQuIEl0IGlzIG5vdCBjYWxsZWQgd2hlbiB3ZSBoaXQgdGhlIHVwL2Rvd24gYXJyb3dzLlxuICBoYW5kbGVDaGFuZ2UgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICBpZiAodmFsdWUudHJpbSgpID09PSAnJykge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXg6IFNFTlRJTkVMLFxuICAgICAgaW5pdGlhbFZhbHVlOiB2YWx1ZSxcbiAgICAgIHZhbHVlXG4gICAgfSk7XG4gICAgdGhpcy51cGRhdGVSZXN1bHRMaXN0KHZhbHVlKTtcbiAgfTtcblxuICBoYW5kbGVCbHVyID0gKCkgPT4ge1xuICAgIHRoaXMuaGlkZVJlc3VsdE1lbnUoKTtcbiAgfTtcblxuICBoYW5kbGVFbnRlcktleURvd24gPSAoKSA9PiB7XG4gICAgY29uc3Qge29uRW50ZXJLZXlEb3dufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleCxcbiAgICAgIHJlc3VsdExpc3QsXG4gICAgICB2YWx1ZVxuICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgIG9uRW50ZXJLZXlEb3duICYmIG9uRW50ZXJLZXlEb3duLmNhbGwodGhpcywgdmFsdWUsIHJlc3VsdExpc3RbaGlnaGxpZ2h0ZWRJbmRleF0pO1xuICB9O1xuXG4gIGhhbmRsZUZvY3VzID0gKCkgPT4ge1xuICAgIHRoaXMuc2hvd1Jlc3VsdE1lbnUoKTtcbiAgfTtcblxuICBoYW5kbGVSZXN1bHRJdGVtQ2xpY2sgPSAoaW5kZXgpID0+IHtcbiAgICBjb25zdCB7cmVzdWx0TGlzdH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHtcbiAgICAgIGdldFJlc3VsdEl0ZW1WYWx1ZSxcbiAgICAgIG9uUmVzdWx0SXRlbUNsaWNrXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgcmVzdWx0ID0gcmVzdWx0TGlzdFtpbmRleF07XG4gICAgb25SZXN1bHRJdGVtQ2xpY2sgJiYgb25SZXN1bHRJdGVtQ2xpY2soZ2V0UmVzdWx0SXRlbVZhbHVlLmNhbGwodGhpcywgcmVzdWx0KSwgcmVzdWx0KTtcbiAgICB0aGlzLnNldEhpZ2hsaWdodGVkSXRlbShpbmRleCk7XG4gIH07XG5cbiAgLy8gUHJldmVudCB0aGUgdGV4dCBib3ggZnJvbSBsb3NpbmcgZm9jdXMgd2hlbiB3ZSBjbGljayBvdXRzaWRlIHRoZSB0ZXh0XG4gIC8vIGJveCAoZWcuIGNsaWNrIG9uIHRoZSByZXN1bHQgbWVudSkuXG4gIGhhbmRsZU1vdXNlRG93biA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgY2xhc3NOYW1lcyxcbiAgICAgIHJlbmRlckJlZm9yZVRleHRCb3gsXG4gICAgICByZW5kZXJBZnRlclRleHRCb3gsXG4gICAgICByZW5kZXJCZWZvcmVSZXN1bHRMaXN0LFxuICAgICAgcmVuZGVyQWZ0ZXJSZXN1bHRMaXN0LFxuICAgICAgcmVuZGVyUmVzdWx0SXRlbVxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICBpc0xvYWRpbmcsXG4gICAgICBpc01lbnVWaXNpYmxlLFxuICAgICAgcmVzdWx0TGlzdCxcbiAgICAgIHZhbHVlXG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qgb25Nb3VzZURvd25Qcm9wID0ge1xuICAgICAgb25Nb3VzZURvd246IHRoaXMuaGFuZGxlTW91c2VEb3duXG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoY2xhc3NOYW1lcy5yb290LCBpc0xvYWRpbmcgJiYgY2xhc3NOYW1lcy5pc0xvYWRpbmcpfT5cbiAgICAgICAge3JlbmRlckJlZm9yZVRleHRCb3ggJiZcbiAgICAgICAgICBjbG9uZUVsZW1lbnQocmVuZGVyQmVmb3JlVGV4dEJveC5jYWxsKHRoaXMpLCBvbk1vdXNlRG93blByb3ApfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcy50ZXh0Qm94fT5cbiAgICAgICAgICB7Y2xvbmVFbGVtZW50KGNoaWxkcmVuLCB7XG4gICAgICAgICAgICBvbkJsdXI6IHRoaXMuaGFuZGxlQmx1cixcbiAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUNoYW5nZSxcbiAgICAgICAgICAgIG9uRm9jdXM6IHRoaXMuaGFuZGxlRm9jdXMsXG4gICAgICAgICAgICBvbktleURvd246IHRoaXMuaGFuZGxlS2V5RG93bixcbiAgICAgICAgICAgIHJlZjogJ3RleHRCb3gnLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgfSl9XG4gICAgICAgICAge2lzTWVudVZpc2libGUgJiYgcmVzdWx0TGlzdC5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcy5yZXN1bHRMaXN0fVxuICAgICAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259PlxuICAgICAgICAgICAgICB7cmVuZGVyQmVmb3JlUmVzdWx0TGlzdCAmJiByZW5kZXJCZWZvcmVSZXN1bHRMaXN0LmNhbGwodGhpcyl9XG4gICAgICAgICAgICAgIHtyZXN1bHRMaXN0Lm1hcCgocmVzdWx0SXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoY2xhc3NOYW1lcy5yZXN1bHRJdGVtLCBpbmRleCA9PT0gaGlnaGxpZ2h0ZWRJbmRleCAmJiBjbGFzc05hbWVzLmlzSGlnaGxpZ2h0ZWQpfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e2luZGV4fVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZVJlc3VsdEl0ZW1DbGljay5iaW5kKHRoaXMsIGluZGV4KX0+XG4gICAgICAgICAgICAgICAgICAgIHtyZW5kZXJSZXN1bHRJdGVtLmNhbGwodGhpcywgcmVzdWx0SXRlbSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAge3JlbmRlckFmdGVyUmVzdWx0TGlzdCAmJiByZW5kZXJBZnRlclJlc3VsdExpc3QuY2FsbCh0aGlzKX1cbiAgICAgICAgICAgIDwvZGl2Pn1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtyZW5kZXJBZnRlclRleHRCb3ggJiZcbiAgICAgICAgICBjbG9uZUVsZW1lbnQocmVuZGVyQWZ0ZXJUZXh0Qm94LmNhbGwodGhpcyksIG9uTW91c2VEb3duUHJvcCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXX0=
