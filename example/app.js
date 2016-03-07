(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fetchJsonp = require('fetch-jsonp');

var _fetchJsonp2 = _interopRequireDefault(_fetchJsonp);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _src = require('../src');

var _src2 = _interopRequireDefault(_src);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var classNames = {
  isHighlighted: 'isHighlighted',
  isLoading: 'isLoading',
  resultItem: 'resultItem',
  resultList: 'resultList',
  root: 'root',
  textBox: 'textBox'
};

function getResultList(value) {
  return (0, _fetchJsonp2.default)('https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + value).then(function (response) {
    return response.json();
  }).then(function (json) {
    var _json = _slicedToArray(json, 4);

    var values = _json[1];
    var links = _json[3];

    return values.map(function (value, index) {
      return {
        value: value,
        link: links[index]
      };
    });
  });
}

function getResultItemValue(resultItem) {
  return resultItem.value;
}

function onEnterKeyDown(value, resultItem) {
  if (value || resultItem) {
    window.location.href = resultItem ? resultItem.link : 'https://en.wikipedia.org/wiki/Special:Search?search=' + value;
  }
}

function renderAfterTextBox() {
  return _react2.default.createElement(
    'div',
    { className: 'button' },
    _react2.default.createElement(
      'button',
      { onClick: this.handleEnterKeyDown },
      'Search'
    )
  );
}

function renderResultItem(resultItem) {
  var link = resultItem.link;
  var value = resultItem.value;

  return _react2.default.createElement(
    'a',
    { href: link },
    value
  );
}

(0, _reactDom.render)(_react2.default.createElement(
  _src2.default,
  {
    classNames: classNames,
    debounceDuration: 250,
    getResultItemValue: getResultItemValue,
    getResultList: getResultList,
    onEnterKeyDown: onEnterKeyDown,
    renderAfterTextBox: renderAfterTextBox,
    renderResultItem: renderResultItem,
    shouldCacheResultList: true },
  _react2.default.createElement('input', { type: 'text', placeholder: 'Search Wikipedia…' })
), document.querySelector('.AutoComplete'));

},{"../src":4,"fetch-jsonp":3,"react":"react","react-dom":"react-dom"}],2:[function(require,module,exports){
/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],3:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.fetchJsonp = mod.exports;
  }
})(this, function (exports, module) {
  'use strict';

  var defaultOptions = {
    timeout: 5000,
    jsonpCallback: 'callback',
    jsonpCallbackFunction: null
  };

  function generateCallbackFunction() {
    return 'jsonp_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
  }

  // Known issue: Will throw 'Uncaught ReferenceError: callback_*** is not defined' error if request timeout
  function clearFunction(functionName) {
    // IE8 throws an exception when you try to delete a property on window
    // http://stackoverflow.com/a/1824228/751089
    try {
      delete window[functionName];
    } catch (e) {
      window[functionName] = undefined;
    }
  }

  function removeScript(scriptId) {
    var script = document.getElementById(scriptId);
    document.getElementsByTagName('head')[0].removeChild(script);
  }

  var fetchJsonp = function fetchJsonp(url) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    var timeout = options.timeout != null ? options.timeout : defaultOptions.timeout;
    var jsonpCallback = options.jsonpCallback != null ? options.jsonpCallback : defaultOptions.jsonpCallback;

    var timeoutId = undefined;

    return new Promise(function (resolve, reject) {
      var callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();

      window[callbackFunction] = function (response) {
        resolve({
          ok: true,
          // keep consistent with fetch API
          json: function json() {
            return Promise.resolve(response);
          }
        });

        if (timeoutId) clearTimeout(timeoutId);

        removeScript(jsonpCallback + '_' + callbackFunction);

        clearFunction(callbackFunction);
      };

      // Check if the user set their own params, and if not add a ? to start a list of params
      url += url.indexOf('?') === -1 ? '?' : '&';

      var jsonpScript = document.createElement('script');
      jsonpScript.setAttribute('src', url + jsonpCallback + '=' + callbackFunction);
      jsonpScript.id = jsonpCallback + '_' + callbackFunction;
      document.getElementsByTagName('head')[0].appendChild(jsonpScript);

      timeoutId = setTimeout(function () {
        reject(new Error('JSONP request to ' + url + ' timed out'));

        clearFunction(callbackFunction);
        removeScript(jsonpCallback + '_' + callbackFunction);
      }, timeout);
    });
  };

  // export as global function
  /*
  let local;
  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }
  
  local.fetchJsonp = fetchJsonp;
  */

  module.exports = fetchJsonp;
});
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, AutoComplete);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(AutoComplete)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.state = AutoComplete.initialState, _this.decrementHighlightedIndex = function () {
      var _this$state = _this.state;
      var highlightedIndex = _this$state.highlightedIndex;
      var resultList = _this$state.resultList;

      switch (highlightedIndex) {
        case SENTINEL:
          return resultList.length - 1;
        case 0:
          return SENTINEL;
        default:
          return highlightedIndex - 1;
      }
    }, _this.incrementHighlightedIndex = function () {
      var _this$state2 = _this.state;
      var highlightedIndex = _this$state2.highlightedIndex;
      var resultList = _this$state2.resultList;

      if (highlightedIndex === resultList.length - 1) {
        return SENTINEL;
      }
      return highlightedIndex + 1;
    }, _this.setHighlightedItem = function (highlightedIndex) {
      var getResultItemValue = _this.props.getResultItemValue;
      var _this$state3 = _this.state;
      var initialValue = _this$state3.initialValue;
      var resultList = _this$state3.resultList;

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
        var _this$props = _this.props;
        var debounceDuration = _this$props.debounceDuration;
        var getResultList = _this$props.getResultList;
        var shouldCacheResultList = _this$props.shouldCacheResultList;

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
      var _this$state4 = _this.state;
      var highlightedIndex = _this$state4.highlightedIndex;
      var value = _this$state4.value;

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
      var _this$state5 = _this.state;
      var highlightedIndex = _this$state5.highlightedIndex;
      var resultList = _this$state5.resultList;
      var value = _this$state5.value;

      onEnterKeyDown && onEnterKeyDown.call(_this, value, resultList[highlightedIndex]);
    }, _this.handleFocus = function () {
      _this.showResultMenu();
    }, _this.handleResultItemClick = function (index) {
      var resultList = _this.state.resultList;
      var _this$props2 = _this.props;
      var getResultItemValue = _this$props2.getResultItemValue;
      var onResultItemClick = _this$props2.onResultItemClick;

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

      var _props = this.props;
      var children = _props.children;
      var classNames = _props.classNames;
      var renderBeforeTextBox = _props.renderBeforeTextBox;
      var renderAfterTextBox = _props.renderAfterTextBox;
      var renderBeforeResultList = _props.renderBeforeResultList;
      var renderAfterResultList = _props.renderAfterResultList;
      var renderResultItem = _props.renderResultItem;
      var _state = this.state;
      var highlightedIndex = _state.highlightedIndex;
      var isLoading = _state.isLoading;
      var isMenuVisible = _state.isMenuVisible;
      var resultList = _state.resultList;
      var value = _state.value;

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
  children: _react.PropTypes.node,
  classNames: _react.PropTypes.objectOf(_react.PropTypes.string),
  debounceDuration: _react.PropTypes.number,
  getResultItemValue: _react.PropTypes.func.isRequired,
  getResultList: _react.PropTypes.func.isRequired,
  onEnterKeyDown: _react.PropTypes.func,
  onResultItemClick: _react.PropTypes.func,
  renderBeforeTextBox: _react.PropTypes.func,
  renderAfterTextBox: _react.PropTypes.func,
  renderBeforeResultList: _react.PropTypes.func,
  renderAfterResultList: _react.PropTypes.func,
  renderResultItem: _react.PropTypes.func.isRequired,
  shouldCacheResultList: _react.PropTypes.bool
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

},{"classnames":2,"react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZmV0Y2gtanNvbnAvYnVpbGQvZmV0Y2gtanNvbnAuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0tBLElBQU0sYUFBYTtBQUNqQixpQkFBZSxlQUFmO0FBQ0EsYUFBVyxXQUFYO0FBQ0EsY0FBWSxZQUFaO0FBQ0EsY0FBWSxZQUFaO0FBQ0EsUUFBTSxNQUFOO0FBQ0EsV0FBUyxTQUFUO0NBTkk7O0FBU04sU0FBUyxhQUFULENBQXVCLEtBQXZCLEVBQThCO0FBQzVCLFNBQU8sdUdBQXNGLEtBQXRGLEVBQ0osSUFESSxDQUNDLFVBQUMsUUFBRCxFQUFjO0FBQ2xCLFdBQU8sU0FBUyxJQUFULEVBQVAsQ0FEa0I7R0FBZCxDQURELENBR0YsSUFIRSxDQUdHLFVBQUMsSUFBRCxFQUFVOytCQUNZLFNBRFo7O1FBQ1Asa0JBRE87UUFDRyxpQkFESDs7QUFFaEIsV0FBTyxPQUFPLEdBQVAsQ0FBVyxVQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWtCO0FBQ2xDLGFBQU87QUFDTCxvQkFESztBQUVMLGNBQU0sTUFBTSxLQUFOLENBQU47T0FGRixDQURrQztLQUFsQixDQUFsQixDQUZnQjtHQUFWLENBSFYsQ0FENEI7Q0FBOUI7O0FBZUEsU0FBUyxrQkFBVCxDQUE0QixVQUE1QixFQUF3QztBQUN0QyxTQUFPLFdBQVcsS0FBWCxDQUQrQjtDQUF4Qzs7QUFJQSxTQUFTLGNBQVQsQ0FBd0IsS0FBeEIsRUFBK0IsVUFBL0IsRUFBMkM7QUFDekMsTUFBSSxTQUFTLFVBQVQsRUFBcUI7QUFDdkIsV0FBTyxRQUFQLENBQWdCLElBQWhCLEdBQXVCLGFBQWEsV0FBVyxJQUFYLDREQUF5RSxLQUF0RixDQURBO0dBQXpCO0NBREY7O0FBTUEsU0FBUyxrQkFBVCxHQUE4QjtBQUM1QixTQUNFOztNQUFLLFdBQVUsUUFBVixFQUFMO0lBQ0U7O1FBQVEsU0FBUyxLQUFLLGtCQUFMLEVBQWpCOztLQURGO0dBREYsQ0FENEI7Q0FBOUI7O0FBUUEsU0FBUyxnQkFBVCxDQUEwQixVQUExQixFQUFzQztNQUVsQyxPQUVFLFdBRkYsS0FGa0M7TUFHbEMsUUFDRSxXQURGLE1BSGtDOztBQUtwQyxTQUFPOztNQUFHLE1BQU0sSUFBTixFQUFIO0lBQWdCLEtBQWhCO0dBQVAsQ0FMb0M7Q0FBdEM7O0FBUUEsc0JBQ0U7OztBQUNFLGdCQUFZLFVBQVo7QUFDQSxzQkFBa0IsR0FBbEI7QUFDQSx3QkFBb0Isa0JBQXBCO0FBQ0EsbUJBQWUsYUFBZjtBQUNBLG9CQUFnQixjQUFoQjtBQUNBLHdCQUFvQixrQkFBcEI7QUFDQSxzQkFBa0IsZ0JBQWxCO0FBQ0EsaUNBUkY7RUFTRSx5Q0FBTyxNQUFLLE1BQUwsRUFBWSxhQUFZLG1CQUFaLEVBQW5CLENBVEY7Q0FERixFQVlHLFNBQVMsYUFBVCxDQUF1QixlQUF2QixDQVpIOzs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ25HQSxJQUFNLFdBQVcsQ0FBQyxDQUFEOztJQUVJOzs7Ozs7Ozs7Ozs7OzswTUE0Q25CLFFBQVEsYUFBYSxZQUFiLFFBS1IsNEJBQTRCLFlBQU07d0JBSTVCLE1BQUssS0FBTCxDQUo0QjtVQUU5QixnREFGOEI7VUFHOUIsb0NBSDhCOztBQUtoQyxjQUFRLGdCQUFSO0FBQ0UsYUFBSyxRQUFMO0FBQ0UsaUJBQU8sV0FBVyxNQUFYLEdBQW9CLENBQXBCLENBRFQ7QUFERixhQUdPLENBQUw7QUFDRSxpQkFBTyxRQUFQLENBREY7QUFIRjtBQU1JLGlCQUFPLG1CQUFtQixDQUFuQixDQURUO0FBTEYsT0FMZ0M7S0FBTixRQWlCNUIsNEJBQTRCLFlBQU07eUJBSTVCLE1BQUssS0FBTCxDQUo0QjtVQUU5QixpREFGOEI7VUFHOUIscUNBSDhCOztBQUtoQyxVQUFJLHFCQUFxQixXQUFXLE1BQVgsR0FBb0IsQ0FBcEIsRUFBdUI7QUFDOUMsZUFBTyxRQUFQLENBRDhDO09BQWhEO0FBR0EsYUFBTyxtQkFBbUIsQ0FBbkIsQ0FSeUI7S0FBTixRQWM1QixxQkFBcUIsVUFBQyxnQkFBRCxFQUFzQjtVQUNsQyxxQkFBc0IsTUFBSyxLQUFMLENBQXRCLG1CQURrQzt5QkFLckMsTUFBSyxLQUFMLENBTHFDO1VBR3ZDLHlDQUh1QztVQUl2QyxxQ0FKdUM7O0FBTXpDLFVBQU0sdUJBQXVCLHFCQUFxQixRQUFyQixDQU5ZO0FBT3pDLFlBQUssUUFBTCxDQUFjO0FBQ1osMENBRFk7QUFFWixlQUFPLHVCQUNILG1CQUFtQixJQUFuQixRQUE4QixXQUFXLGdCQUFYLENBQTlCLENBREcsR0FFSCxZQUZHO09BRlQsRUFQeUM7QUFhekMsYUFBTyxxQkFBUCxDQUE2Qix1QkFDekIsTUFBSyxrQkFBTCxHQUNBLE1BQUsscUJBQUwsQ0FGSixDQWJ5QztLQUF0QixRQW1CckIscUJBQXFCLFlBQU07VUFDbEIsUUFBUyxNQUFLLEtBQUwsQ0FBVCxNQURrQjs7QUFFekIsWUFBSyxJQUFMLENBQVUsT0FBVixDQUFrQixpQkFBbEIsQ0FBb0MsQ0FBcEMsRUFBdUMsTUFBTSxNQUFOLENBQXZDLENBRnlCO0tBQU4sUUFNckIsd0JBQXdCLFlBQU07VUFDckIsUUFBUyxNQUFLLEtBQUwsQ0FBVCxNQURxQjs7QUFFNUIsVUFBTSxTQUFTLE1BQU0sTUFBTixDQUZhO0FBRzVCLFlBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsaUJBQWxCLENBQW9DLE1BQXBDLEVBQTRDLE1BQTVDLEVBSDRCO0tBQU4sUUFPeEIsaUJBQWlCLFlBQU07QUFDckIsWUFBSyxRQUFMLENBQWM7QUFDWix1QkFBZSxLQUFmO09BREYsRUFEcUI7S0FBTixRQU9qQixpQkFBaUIsWUFBTTtBQUNyQixZQUFLLFFBQUwsQ0FBYztBQUNaLHVCQUFlLElBQWY7T0FERixFQURxQjtLQUFOLFFBUWpCLG9CQUFvQixVQUFDLFVBQUQsRUFBZ0I7QUFDbEMsWUFBSyxRQUFMLENBQWM7QUFDWixtQkFBVyxLQUFYO0FBQ0EsOEJBRlk7T0FBZCxFQURrQztBQUtsQyxZQUFLLGNBQUwsR0FMa0M7S0FBaEIsUUFjcEIsbUJBQW1CLFlBQU87QUFDeEIsVUFBSSxVQUFVLElBQVYsQ0FEb0I7QUFFeEIsVUFBSSxRQUFRLEVBQVIsQ0FGb0I7QUFHeEIsYUFBTyxVQUFDLEtBQUQsRUFBVzswQkFLWixNQUFLLEtBQUwsQ0FMWTtZQUVkLGdEQUZjO1lBR2QsMENBSGM7WUFJZCwwREFKYzs7QUFNaEIscUJBQWEsT0FBYixFQU5nQjtBQU9oQixZQUFNLGFBQWEseUJBQXlCLE1BQU0sS0FBTixDQUF6QixDQVBIO0FBUWhCLFlBQUksVUFBSixFQUFnQjtBQUNkLGdCQUFLLGlCQUFMLENBQXVCLFVBQXZCLEVBRGM7QUFFZCxpQkFGYztTQUFoQjtBQUlBLGtCQUFVLFdBQVcsWUFBTTtBQUN6QixvQkFBVSxJQUFWLENBRHlCO0FBRXpCLGdCQUFLLFFBQUwsQ0FBYztBQUNaLHVCQUFXLElBQVg7V0FERixFQUZ5QjtBQUt6Qix3QkFBYyxJQUFkLFFBQXlCLEtBQXpCLEVBQWdDLElBQWhDLENBQXFDLFVBQUMsVUFBRCxFQUFnQjtBQUNuRCxnQkFBSSxxQkFBSixFQUEyQjtBQUN6QixvQkFBTSxLQUFOLElBQWUsVUFBZixDQUR5QjthQUEzQjtBQUdBLGtCQUFLLGlCQUFMLENBQXVCLFVBQXZCLEVBSm1EO1dBQWhCLENBQXJDLENBTHlCO1NBQU4sRUFXbEIsZ0JBWE8sQ0FBVixDQVpnQjtPQUFYLENBSGlCO0tBQU4sVUErQnBCLFFBQVEsWUFBTTtBQUNaLFlBQUssUUFBTCxDQUFjLGFBQWEsWUFBYixDQUFkLENBRFk7S0FBTixRQUlSLGtCQUFrQjtBQUNoQixpQkFBVyxxQkFBTTtBQUNmLGNBQUssa0JBQUwsQ0FBd0IsTUFBSyx5QkFBTCxFQUF4QixFQURlO09BQU47QUFHWCxlQUFTLG1CQUFNO0FBQ2IsY0FBSyxrQkFBTCxDQUF3QixNQUFLLHlCQUFMLEVBQXhCLEVBRGE7T0FBTjtBQUdULGFBQU8saUJBQU07QUFDWCxjQUFLLGtCQUFMLEdBRFc7T0FBTjtBQUdQLGNBQVEsa0JBQU07QUFDWixjQUFLLGNBQUwsR0FEWTtBQUVaLGNBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsSUFBbEIsR0FGWTtPQUFOO2FBTVYsZ0JBQWdCLFVBQUMsS0FBRCxFQUFXO3lCQUlyQixNQUFLLEtBQUwsQ0FKcUI7VUFFdkIsaURBRnVCO1VBR3ZCLDJCQUh1Qjs7QUFLekIsVUFBTSxpQkFBaUIsTUFBSyxlQUFMLENBQXFCLE1BQU0sR0FBTixDQUF0QyxDQUxtQjtBQU16QixVQUFJLGNBQUosRUFBb0I7O0FBRWxCLFlBQUkscUJBQXFCLFFBQXJCLEVBQStCO0FBQ2pDLGdCQUFLLFFBQUwsQ0FBYztBQUNaLDBCQUFjLEtBQWQ7V0FERixFQURpQztTQUFuQztBQUtBLHVCQUFlLEtBQWYsRUFQa0I7T0FBcEI7S0FOYyxRQW1CaEIsZUFBZSxVQUFDLEtBQUQsRUFBVztBQUN4QixVQUFNLFFBQVEsTUFBTSxNQUFOLENBQWEsS0FBYixDQURVO0FBRXhCLFVBQUksTUFBTSxJQUFOLE9BQWlCLEVBQWpCLEVBQXFCO0FBQ3ZCLGNBQUssS0FBTCxHQUR1QjtBQUV2QixlQUZ1QjtPQUF6QjtBQUlBLFlBQUssUUFBTCxDQUFjO0FBQ1osMEJBQWtCLFFBQWxCO0FBQ0Esc0JBQWMsS0FBZDtBQUNBLG9CQUhZO09BQWQsRUFOd0I7QUFXeEIsWUFBSyxnQkFBTCxDQUFzQixLQUF0QixFQVh3QjtLQUFYLFFBY2YsYUFBYSxZQUFNO0FBQ2pCLFlBQUssY0FBTCxHQURpQjtLQUFOLFFBSWIscUJBQXFCLFlBQU07VUFDbEIsaUJBQWtCLE1BQUssS0FBTCxDQUFsQixlQURrQjt5QkFNckIsTUFBSyxLQUFMLENBTnFCO1VBR3ZCLGlEQUh1QjtVQUl2QixxQ0FKdUI7VUFLdkIsMkJBTHVCOztBQU96Qix3QkFBa0IsZUFBZSxJQUFmLFFBQTBCLEtBQTFCLEVBQWlDLFdBQVcsZ0JBQVgsQ0FBakMsQ0FBbEIsQ0FQeUI7S0FBTixRQVVyQixjQUFjLFlBQU07QUFDbEIsWUFBSyxjQUFMLEdBRGtCO0tBQU4sUUFJZCx3QkFBd0IsVUFBQyxLQUFELEVBQVc7VUFDMUIsYUFBYyxNQUFLLEtBQUwsQ0FBZCxXQUQwQjt5QkFLN0IsTUFBSyxLQUFMLENBTDZCO1VBRy9CLHFEQUgrQjtVQUkvQixtREFKK0I7O0FBTWpDLFVBQU0sU0FBUyxXQUFXLEtBQVgsQ0FBVCxDQU4yQjtBQU9qQywyQkFBcUIsa0JBQWtCLG1CQUFtQixJQUFuQixRQUE4QixNQUE5QixDQUFsQixFQUF5RCxNQUF6RCxDQUFyQixDQVBpQztBQVFqQyxZQUFLLGtCQUFMLENBQXdCLEtBQXhCLEVBUmlDO0tBQVgsUUFheEIsa0JBQWtCLFVBQUMsS0FBRCxFQUFXO0FBQzNCLFlBQU0sY0FBTixHQUQyQjtLQUFYOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBaFFDOzs2QkFvUVY7OzttQkFTSCxLQUFLLEtBQUwsQ0FURztVQUVMLDJCQUZLO1VBR0wsK0JBSEs7VUFJTCxpREFKSztVQUtMLCtDQUxLO1VBTUwsdURBTks7VUFPTCxxREFQSztVQVFMLDJDQVJLO21CQWdCSCxLQUFLLEtBQUwsQ0FoQkc7VUFXTCwyQ0FYSztVQVlMLDZCQVpLO1VBYUwscUNBYks7VUFjTCwrQkFkSztVQWVMLHFCQWZLOztBQWlCUCxVQUFNLGtCQUFrQjtBQUN0QixxQkFBYSxLQUFLLGVBQUw7T0FEVCxDQWpCQztBQW9CUCxhQUNFOztVQUFLLFdBQVcsMEJBQVcsV0FBVyxJQUFYLEVBQWlCLGFBQWEsV0FBVyxTQUFYLENBQXBELEVBQUw7UUFDRyx1QkFDQyx5QkFBYSxvQkFBb0IsSUFBcEIsQ0FBeUIsSUFBekIsQ0FBYixFQUE2QyxlQUE3QyxDQUREO1FBRUQ7O1lBQUssV0FBVyxXQUFXLE9BQVgsRUFBaEI7VUFDRyx5QkFBYSxRQUFiLEVBQXVCO0FBQ3RCLG9CQUFRLEtBQUssVUFBTDtBQUNSLHNCQUFVLEtBQUssWUFBTDtBQUNWLHFCQUFTLEtBQUssV0FBTDtBQUNULHVCQUFXLEtBQUssYUFBTDtBQUNYLGlCQUFLLFNBQUw7QUFDQSxtQkFBTyxLQUFQO1dBTkQsQ0FESDtVQVNHLGlCQUFpQixXQUFXLE1BQVgsR0FBb0IsQ0FBcEIsSUFDaEI7O2NBQUssV0FBVyxXQUFXLFVBQVg7QUFDZCwyQkFBYSxLQUFLLGVBQUwsRUFEZjtZQUVHLDBCQUEwQix1QkFBdUIsSUFBdkIsQ0FBNEIsSUFBNUIsQ0FBMUI7WUFDQSxXQUFXLEdBQVgsQ0FBZSxVQUFDLFVBQUQsRUFBYSxLQUFiLEVBQXVCO0FBQ3JDLHFCQUNFOztrQkFBSyxXQUFXLDBCQUFXLFdBQVcsVUFBWCxFQUF1QixVQUFVLGdCQUFWLElBQThCLFdBQVcsYUFBWCxDQUEzRTtBQUNILHVCQUFLLEtBQUw7QUFDQSwyQkFBUyxPQUFLLHFCQUFMLENBQTJCLElBQTNCLFNBQXNDLEtBQXRDLENBQVQsRUFGRjtnQkFHRyxpQkFBaUIsSUFBakIsU0FBNEIsVUFBNUIsQ0FISDtlQURGLENBRHFDO2FBQXZCLENBSGxCO1lBWUcseUJBQXlCLHNCQUFzQixJQUF0QixDQUEyQixJQUEzQixDQUF6QjtXQWJKO1NBWkw7UUE0Qkcsc0JBQ0MseUJBQWEsbUJBQW1CLElBQW5CLENBQXdCLElBQXhCLENBQWIsRUFBNEMsZUFBNUMsQ0FERDtPQTdCTCxDQXBCTzs7OztTQXBRVTs7O2FBQ1osWUFBWTtBQUNqQixZQUFVLGlCQUFVLElBQVY7QUFDVixjQUFZLGlCQUFVLFFBQVYsQ0FBbUIsaUJBQVUsTUFBVixDQUEvQjtBQUNBLG9CQUFrQixpQkFBVSxNQUFWO0FBQ2xCLHNCQUFvQixpQkFBVSxJQUFWLENBQWUsVUFBZjtBQUNwQixpQkFBZSxpQkFBVSxJQUFWLENBQWUsVUFBZjtBQUNmLGtCQUFnQixpQkFBVSxJQUFWO0FBQ2hCLHFCQUFtQixpQkFBVSxJQUFWO0FBQ25CLHVCQUFxQixpQkFBVSxJQUFWO0FBQ3JCLHNCQUFvQixpQkFBVSxJQUFWO0FBQ3BCLDBCQUF3QixpQkFBVSxJQUFWO0FBQ3hCLHlCQUF1QixpQkFBVSxJQUFWO0FBQ3ZCLG9CQUFrQixpQkFBVSxJQUFWLENBQWUsVUFBZjtBQUNsQix5QkFBdUIsaUJBQVUsSUFBVjs7QUFkTixhQWlCWixlQUFlO0FBQ3BCLFlBQ0UseUNBQU8scUJBQWtCLE1BQWxCO0FBQ0wsVUFBSyxVQUFMO0FBQ0EsVUFBSyxNQUFMLEVBRkYsQ0FERjtBQUtBLGNBQVk7QUFDVixtQkFBZSxlQUFmO0FBQ0EsZUFBVyxXQUFYO0FBQ0EsZ0JBQVksWUFBWjtBQUNBLGdCQUFZLFlBQVo7QUFDQSxVQUFNLE1BQU47QUFDQSxhQUFTLFNBQVQ7R0FORjtBQVFBLG9CQUFrQixHQUFsQjtBQUNBLHlCQUF1QixJQUF2Qjs7QUFoQ2lCLGFBbUNaLGVBQWU7QUFDcEIsb0JBQWtCLFFBQWxCO0FBQ0EsZ0JBQWMsRUFBZDtBQUNBLGFBQVcsS0FBWDtBQUNBLGlCQUFlLEtBQWY7QUFDQSxjQUFZLEVBQVo7QUFDQSxTQUFPLEVBQVA7O2tCQXpDaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IGZldGNoSnNvbnAgZnJvbSAnZmV0Y2gtanNvbnAnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7cmVuZGVyfSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IEF1dG9Db21wbGV0ZSBmcm9tICcuLi9zcmMnO1xuXG5jb25zdCBjbGFzc05hbWVzID0ge1xuICBpc0hpZ2hsaWdodGVkOiAnaXNIaWdobGlnaHRlZCcsXG4gIGlzTG9hZGluZzogJ2lzTG9hZGluZycsXG4gIHJlc3VsdEl0ZW06ICdyZXN1bHRJdGVtJyxcbiAgcmVzdWx0TGlzdDogJ3Jlc3VsdExpc3QnLFxuICByb290OiAncm9vdCcsXG4gIHRleHRCb3g6ICd0ZXh0Qm94J1xufTtcblxuZnVuY3Rpb24gZ2V0UmVzdWx0TGlzdCh2YWx1ZSkge1xuICByZXR1cm4gZmV0Y2hKc29ucChgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3cvYXBpLnBocD9hY3Rpb249b3BlbnNlYXJjaCZmb3JtYXQ9anNvbiZzZWFyY2g9JHt2YWx1ZX1gKVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICB9KS50aGVuKChqc29uKSA9PiB7XG4gICAgICBjb25zdCBbLCB2YWx1ZXMsICwgbGlua3NdID0ganNvbjtcbiAgICAgIHJldHVybiB2YWx1ZXMubWFwKCh2YWx1ZSwgaW5kZXgpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBsaW5rOiBsaW5rc1tpbmRleF1cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRSZXN1bHRJdGVtVmFsdWUocmVzdWx0SXRlbSkge1xuICByZXR1cm4gcmVzdWx0SXRlbS52YWx1ZTtcbn1cblxuZnVuY3Rpb24gb25FbnRlcktleURvd24odmFsdWUsIHJlc3VsdEl0ZW0pIHtcbiAgaWYgKHZhbHVlIHx8IHJlc3VsdEl0ZW0pIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJlc3VsdEl0ZW0gPyByZXN1bHRJdGVtLmxpbmsgOiBgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3BlY2lhbDpTZWFyY2g/c2VhcmNoPSR7dmFsdWV9YDtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJBZnRlclRleHRCb3goKSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJidXR0b25cIj5cbiAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5oYW5kbGVFbnRlcktleURvd259PlNlYXJjaDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApO1xufVxuXG5mdW5jdGlvbiByZW5kZXJSZXN1bHRJdGVtKHJlc3VsdEl0ZW0pIHtcbiAgY29uc3Qge1xuICAgIGxpbmssXG4gICAgdmFsdWVcbiAgfSA9IHJlc3VsdEl0ZW07XG4gIHJldHVybiA8YSBocmVmPXtsaW5rfT57dmFsdWV9PC9hPjtcbn1cblxucmVuZGVyKChcbiAgPEF1dG9Db21wbGV0ZVxuICAgIGNsYXNzTmFtZXM9e2NsYXNzTmFtZXN9XG4gICAgZGVib3VuY2VEdXJhdGlvbj17MjUwfVxuICAgIGdldFJlc3VsdEl0ZW1WYWx1ZT17Z2V0UmVzdWx0SXRlbVZhbHVlfVxuICAgIGdldFJlc3VsdExpc3Q9e2dldFJlc3VsdExpc3R9XG4gICAgb25FbnRlcktleURvd249e29uRW50ZXJLZXlEb3dufVxuICAgIHJlbmRlckFmdGVyVGV4dEJveD17cmVuZGVyQWZ0ZXJUZXh0Qm94fVxuICAgIHJlbmRlclJlc3VsdEl0ZW09e3JlbmRlclJlc3VsdEl0ZW19XG4gICAgc2hvdWxkQ2FjaGVSZXN1bHRMaXN0PlxuICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiU2VhcmNoIFdpa2lwZWRpYSZoZWxsaXA7XCIgLz5cbiAgPC9BdXRvQ29tcGxldGU+XG4pLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuQXV0b0NvbXBsZXRlJykpO1xuIiwiLyohXG4gIENvcHlyaWdodCAoYykgMjAxNiBKZWQgV2F0c29uLlxuICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgKE1JVCksIHNlZVxuICBodHRwOi8vamVkd2F0c29uLmdpdGh1Yi5pby9jbGFzc25hbWVzXG4qL1xuLyogZ2xvYmFsIGRlZmluZSAqL1xuXG4oZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGhhc093biA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5cdGZ1bmN0aW9uIGNsYXNzTmFtZXMgKCkge1xuXHRcdHZhciBjbGFzc2VzID0gW107XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdGlmICghYXJnKSBjb250aW51ZTtcblxuXHRcdFx0dmFyIGFyZ1R5cGUgPSB0eXBlb2YgYXJnO1xuXG5cdFx0XHRpZiAoYXJnVHlwZSA9PT0gJ3N0cmluZycgfHwgYXJnVHlwZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0Y2xhc3Nlcy5wdXNoKGFyZyk7XG5cdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuXHRcdFx0XHRjbGFzc2VzLnB1c2goY2xhc3NOYW1lcy5hcHBseShudWxsLCBhcmcpKTtcblx0XHRcdH0gZWxzZSBpZiAoYXJnVHlwZSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIGFyZykge1xuXHRcdFx0XHRcdGlmIChoYXNPd24uY2FsbChhcmcsIGtleSkgJiYgYXJnW2tleV0pIHtcblx0XHRcdFx0XHRcdGNsYXNzZXMucHVzaChrZXkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjbGFzc2VzLmpvaW4oJyAnKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gY2xhc3NOYW1lcztcblx0fSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0Ly8gcmVnaXN0ZXIgYXMgJ2NsYXNzbmFtZXMnLCBjb25zaXN0ZW50IHdpdGggbnBtIHBhY2thZ2UgbmFtZVxuXHRcdGRlZmluZSgnY2xhc3NuYW1lcycsIFtdLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gY2xhc3NOYW1lcztcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuY2xhc3NOYW1lcyA9IGNsYXNzTmFtZXM7XG5cdH1cbn0oKSk7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFsnZXhwb3J0cycsICdtb2R1bGUnXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZmFjdG9yeShleHBvcnRzLCBtb2R1bGUpO1xuICB9IGVsc2Uge1xuICAgIHZhciBtb2QgPSB7XG4gICAgICBleHBvcnRzOiB7fVxuICAgIH07XG4gICAgZmFjdG9yeShtb2QuZXhwb3J0cywgbW9kKTtcbiAgICBnbG9iYWwuZmV0Y2hKc29ucCA9IG1vZC5leHBvcnRzO1xuICB9XG59KSh0aGlzLCBmdW5jdGlvbiAoZXhwb3J0cywgbW9kdWxlKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgdGltZW91dDogNTAwMCxcbiAgICBqc29ucENhbGxiYWNrOiAnY2FsbGJhY2snLFxuICAgIGpzb25wQ2FsbGJhY2tGdW5jdGlvbjogbnVsbFxuICB9O1xuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlQ2FsbGJhY2tGdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ2pzb25wXycgKyBEYXRlLm5vdygpICsgJ18nICsgTWF0aC5jZWlsKE1hdGgucmFuZG9tKCkgKiAxMDAwMDApO1xuICB9XG5cbiAgLy8gS25vd24gaXNzdWU6IFdpbGwgdGhyb3cgJ1VuY2F1Z2h0IFJlZmVyZW5jZUVycm9yOiBjYWxsYmFja18qKiogaXMgbm90IGRlZmluZWQnIGVycm9yIGlmIHJlcXVlc3QgdGltZW91dFxuICBmdW5jdGlvbiBjbGVhckZ1bmN0aW9uKGZ1bmN0aW9uTmFtZSkge1xuICAgIC8vIElFOCB0aHJvd3MgYW4gZXhjZXB0aW9uIHdoZW4geW91IHRyeSB0byBkZWxldGUgYSBwcm9wZXJ0eSBvbiB3aW5kb3dcbiAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xODI0MjI4Lzc1MTA4OVxuICAgIHRyeSB7XG4gICAgICBkZWxldGUgd2luZG93W2Z1bmN0aW9uTmFtZV07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2luZG93W2Z1bmN0aW9uTmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlU2NyaXB0KHNjcmlwdElkKSB7XG4gICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNjcmlwdElkKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gIH1cblxuICB2YXIgZmV0Y2hKc29ucCA9IGZ1bmN0aW9uIGZldGNoSnNvbnAodXJsKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIHRpbWVvdXQgPSBvcHRpb25zLnRpbWVvdXQgIT0gbnVsbCA/IG9wdGlvbnMudGltZW91dCA6IGRlZmF1bHRPcHRpb25zLnRpbWVvdXQ7XG4gICAgdmFyIGpzb25wQ2FsbGJhY2sgPSBvcHRpb25zLmpzb25wQ2FsbGJhY2sgIT0gbnVsbCA/IG9wdGlvbnMuanNvbnBDYWxsYmFjayA6IGRlZmF1bHRPcHRpb25zLmpzb25wQ2FsbGJhY2s7XG5cbiAgICB2YXIgdGltZW91dElkID0gdW5kZWZpbmVkO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBjYWxsYmFja0Z1bmN0aW9uID0gb3B0aW9ucy5qc29ucENhbGxiYWNrRnVuY3Rpb24gfHwgZ2VuZXJhdGVDYWxsYmFja0Z1bmN0aW9uKCk7XG5cbiAgICAgIHdpbmRvd1tjYWxsYmFja0Z1bmN0aW9uXSA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgICAvLyBrZWVwIGNvbnNpc3RlbnQgd2l0aCBmZXRjaCBBUElcbiAgICAgICAgICBqc29uOiBmdW5jdGlvbiBqc29uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGltZW91dElkKSBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgICByZW1vdmVTY3JpcHQoanNvbnBDYWxsYmFjayArICdfJyArIGNhbGxiYWNrRnVuY3Rpb24pO1xuXG4gICAgICAgIGNsZWFyRnVuY3Rpb24oY2FsbGJhY2tGdW5jdGlvbik7XG4gICAgICB9O1xuXG4gICAgICAvLyBDaGVjayBpZiB0aGUgdXNlciBzZXQgdGhlaXIgb3duIHBhcmFtcywgYW5kIGlmIG5vdCBhZGQgYSA/IHRvIHN0YXJ0IGEgbGlzdCBvZiBwYXJhbXNcbiAgICAgIHVybCArPSB1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJztcblxuICAgICAgdmFyIGpzb25wU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBqc29ucFNjcmlwdC5zZXRBdHRyaWJ1dGUoJ3NyYycsIHVybCArIGpzb25wQ2FsbGJhY2sgKyAnPScgKyBjYWxsYmFja0Z1bmN0aW9uKTtcbiAgICAgIGpzb25wU2NyaXB0LmlkID0ganNvbnBDYWxsYmFjayArICdfJyArIGNhbGxiYWNrRnVuY3Rpb247XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKGpzb25wU2NyaXB0KTtcblxuICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0pTT05QIHJlcXVlc3QgdG8gJyArIHVybCArICcgdGltZWQgb3V0JykpO1xuXG4gICAgICAgIGNsZWFyRnVuY3Rpb24oY2FsbGJhY2tGdW5jdGlvbik7XG4gICAgICAgIHJlbW92ZVNjcmlwdChqc29ucENhbGxiYWNrICsgJ18nICsgY2FsbGJhY2tGdW5jdGlvbik7XG4gICAgICB9LCB0aW1lb3V0KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBleHBvcnQgYXMgZ2xvYmFsIGZ1bmN0aW9uXG4gIC8qXG4gIGxldCBsb2NhbDtcbiAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9jYWwgPSBnbG9iYWw7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9jYWwgPSBzZWxmO1xuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbCA9IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnQnKTtcbiAgICB9XG4gIH1cbiAgXG4gIGxvY2FsLmZldGNoSnNvbnAgPSBmZXRjaEpzb25wO1xuICAqL1xuXG4gIG1vZHVsZS5leHBvcnRzID0gZmV0Y2hKc29ucDtcbn0pOyIsImltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFJlYWN0LCB7Y2xvbmVFbGVtZW50LCBDb21wb25lbnQsIFByb3BUeXBlc30gZnJvbSAncmVhY3QnO1xuXG4vLyBJbmRleCB0aGF0IGluZGljYXRlcyB0aGF0IG5vbmUgb2YgdGhlIGF1dG9jb21wbGV0ZSByZXN1bHRzIGlzXG4vLyBjdXJyZW50bHkgaGlnaGxpZ2h0ZWQuXG5jb25zdCBTRU5USU5FTCA9IC0xO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdXRvQ29tcGxldGUgZXh0ZW5kcyBDb21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMubm9kZSxcbiAgICBjbGFzc05hbWVzOiBQcm9wVHlwZXMub2JqZWN0T2YoUHJvcFR5cGVzLnN0cmluZyksXG4gICAgZGVib3VuY2VEdXJhdGlvbjogUHJvcFR5cGVzLm51bWJlcixcbiAgICBnZXRSZXN1bHRJdGVtVmFsdWU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgZ2V0UmVzdWx0TGlzdDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBvbkVudGVyS2V5RG93bjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25SZXN1bHRJdGVtQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIHJlbmRlckJlZm9yZVRleHRCb3g6IFByb3BUeXBlcy5mdW5jLFxuICAgIHJlbmRlckFmdGVyVGV4dEJveDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcmVuZGVyQmVmb3JlUmVzdWx0TGlzdDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcmVuZGVyQWZ0ZXJSZXN1bHRMaXN0OiBQcm9wVHlwZXMuZnVuYyxcbiAgICByZW5kZXJSZXN1bHRJdGVtOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIHNob3VsZENhY2hlUmVzdWx0TGlzdDogUHJvcFR5cGVzLmJvb2xcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGNoaWxkcmVuOiAoXG4gICAgICA8aW5wdXQgYXJpYS1hdXRvY29tcGxldGU9XCJib3RoXCJcbiAgICAgICAgcm9sZT1cImNvbWJvYm94XCJcbiAgICAgICAgdHlwZT1cInRleHRcIiAvPlxuICAgICksXG4gICAgY2xhc3NOYW1lczoge1xuICAgICAgaXNIaWdobGlnaHRlZDogJ2lzSGlnaGxpZ2h0ZWQnLFxuICAgICAgaXNMb2FkaW5nOiAnaXNMb2FkaW5nJyxcbiAgICAgIHJlc3VsdEl0ZW06ICdyZXN1bHRJdGVtJyxcbiAgICAgIHJlc3VsdExpc3Q6ICdyZXN1bHRMaXN0JyxcbiAgICAgIHJvb3Q6ICdyb290JyxcbiAgICAgIHRleHRCb3g6ICd0ZXh0Qm94J1xuICAgIH0sXG4gICAgZGVib3VuY2VEdXJhdGlvbjogMjUwLFxuICAgIHNob3VsZENhY2hlUmVzdWx0TGlzdDogdHJ1ZVxuICB9O1xuXG4gIHN0YXRpYyBpbml0aWFsU3RhdGUgPSB7XG4gICAgaGlnaGxpZ2h0ZWRJbmRleDogU0VOVElORUwsXG4gICAgaW5pdGlhbFZhbHVlOiAnJyxcbiAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgIGlzTWVudVZpc2libGU6IGZhbHNlLFxuICAgIHJlc3VsdExpc3Q6IFtdLFxuICAgIHZhbHVlOiAnJ1xuICB9O1xuXG4gIHN0YXRlID0gQXV0b0NvbXBsZXRlLmluaXRpYWxTdGF0ZTtcblxuICAvLyBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBgc3RhdGUuaGlnaGxpZ2h0ZWRJbmRleGAgZGVjcmVtZW50ZWQgYnkgMS5cbiAgLy8gSWYgbmVjZXNzYXJ5LCB3cmFwcyBhcm91bmQgdG8gdGhlIGxhc3QgaXRlbSwgb3IgcmV2ZXJ0cyB0byBgU0VOVElORUxgXG4gIC8vIChpZS4gbm8gaXRlbSBoaWdobGlnaHRlZCkuXG4gIGRlY3JlbWVudEhpZ2hsaWdodGVkSW5kZXggPSAoKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleCxcbiAgICAgIHJlc3VsdExpc3RcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICBzd2l0Y2ggKGhpZ2hsaWdodGVkSW5kZXgpIHtcbiAgICAgIGNhc2UgU0VOVElORUw6XG4gICAgICAgIHJldHVybiByZXN1bHRMaXN0Lmxlbmd0aCAtIDE7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiBTRU5USU5FTDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBoaWdobGlnaHRlZEluZGV4IC0gMTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgdmFsdWUgb2YgYHN0YXRlLmhpZ2hsaWdodGVkSW5kZXhgIGluY3JlbWVudGVkIGJ5IDEuXG4gIC8vIElmIG5lY2Vzc2FyeSwgcmV2ZXJ0cyB0byBgU0VOVElORUxgIChpZS4gbm8gaXRlbSBoaWdobGlnaHRlZCkuXG4gIGluY3JlbWVudEhpZ2hsaWdodGVkSW5kZXggPSAoKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleCxcbiAgICAgIHJlc3VsdExpc3RcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoaGlnaGxpZ2h0ZWRJbmRleCA9PT0gcmVzdWx0TGlzdC5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gU0VOVElORUw7XG4gICAgfVxuICAgIHJldHVybiBoaWdobGlnaHRlZEluZGV4ICsgMTtcbiAgfTtcblxuICAvLyBTZXQgdGhlIGN1cnJlbnQgaGlnaGxpZ2h0ZWQgaXRlbSB0byB0aGUgaXRlbSBhdCB0aGUgZ2l2ZW5cbiAgLy8gYGhpZ2hsaWdodGVkSW5kZXhgLiBTZXQgdGhlIHRleHQgYm94J3MgdmFsdWUgdG8gdGhhdCBvZiB0aGUgbmV3XG4gIC8vIGhpZ2hsaWdodGVkIGl0ZW0uXG4gIHNldEhpZ2hsaWdodGVkSXRlbSA9IChoaWdobGlnaHRlZEluZGV4KSA9PiB7XG4gICAgY29uc3Qge2dldFJlc3VsdEl0ZW1WYWx1ZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIGluaXRpYWxWYWx1ZSxcbiAgICAgIHJlc3VsdExpc3RcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBpc0FueUl0ZW1IaWdobGlnaHRlZCA9IGhpZ2hsaWdodGVkSW5kZXggIT09IFNFTlRJTkVMO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleCxcbiAgICAgIHZhbHVlOiBpc0FueUl0ZW1IaWdobGlnaHRlZFxuICAgICAgICA/IGdldFJlc3VsdEl0ZW1WYWx1ZS5jYWxsKHRoaXMsIHJlc3VsdExpc3RbaGlnaGxpZ2h0ZWRJbmRleF0pXG4gICAgICAgIDogaW5pdGlhbFZhbHVlXG4gICAgfSk7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShpc0FueUl0ZW1IaWdobGlnaHRlZFxuICAgICAgPyB0aGlzLnNlbGVjdFRleHRCb3hWYWx1ZVxuICAgICAgOiB0aGlzLm1vdmVUZXh0Qm94Q2FyZXRUb0VuZCk7XG4gIH07XG5cbiAgLy8gU2VsZWN0IGFsbCB0aGUgdGV4dCBpbiB0aGUgdGV4dCBib3guXG4gIHNlbGVjdFRleHRCb3hWYWx1ZSA9ICgpID0+IHtcbiAgICBjb25zdCB7dmFsdWV9ID0gdGhpcy5zdGF0ZTtcbiAgICB0aGlzLnJlZnMudGV4dEJveC5zZXRTZWxlY3Rpb25SYW5nZSgwLCB2YWx1ZS5sZW5ndGgpO1xuICB9O1xuXG4gIC8vIE1vdmUgdGhlIGNhcmV0IGluIHRoZSB0ZXh0IGJveCB0byB0aGUgZW5kIG9mIHRoZSB0ZXh0IGJveC5cbiAgbW92ZVRleHRCb3hDYXJldFRvRW5kID0gKCkgPT4ge1xuICAgIGNvbnN0IHt2YWx1ZX0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICB0aGlzLnJlZnMudGV4dEJveC5zZXRTZWxlY3Rpb25SYW5nZShsZW5ndGgsIGxlbmd0aCk7XG4gIH07XG5cbiAgLy8gSGlkZSB0aGUgcmVzdWx0IG1lbnUuXG4gIGhpZGVSZXN1bHRNZW51ID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNNZW51VmlzaWJsZTogZmFsc2VcbiAgICB9KTtcbiAgfTtcblxuICAvLyBTaG93IHRoZSByZXN1bHQgbWVudS5cbiAgc2hvd1Jlc3VsdE1lbnUgPSAoKSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc01lbnVWaXNpYmxlOiB0cnVlXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gU2V0IGBzdGF0ZS5yZXN1bHRMaXN0YCB0byB0aGUgZ2l2ZW4gYHJlc3VsdExpc3RgLCBzZXQgdG8gbm90IGxvYWRpbmcsXG4gIC8vIGFuZCBzaG93IHRoZSByZXN1bHRzLlxuICByZWNlaXZlUmVzdWx0TGlzdCA9IChyZXN1bHRMaXN0KSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc0xvYWRpbmc6IGZhbHNlLFxuICAgICAgcmVzdWx0TGlzdFxuICAgIH0pO1xuICAgIHRoaXMuc2hvd1Jlc3VsdE1lbnUoKTtcbiAgfTtcblxuICAvLyBVcGRhdGUgYHN0YXRlLnJlc3VsdExpc3RgIGJhc2VkIG9uIHRoZSBnaXZlbiBgdmFsdWVgLlxuICAvLyAtIENhY2hlcyByZXN1bHRzIGZvciBgc3RhdGUucmVzdWx0TGlzdGAgaW4gYSBgY2FjaGVgOyByZXR1cm5zXG4gIC8vICAgaW1tZWRpYXRlbHkgaWYgdGhlIHJlc3VsdHMgZm9yIGB2YWx1ZWAgaXMgYWxyZWFkeSBpbiBgY2FjaGVgLlxuICAvLyAtIFwiUmF0ZS1saW1pdGVkXCIgdG8gcHJldmVudCB1bm5lY2Vzc2FyeSBjYWxscyB0byBgZ2V0UmVzdWx0TGlzdGAuXG4gIC8vICAgT25seSBjYWxscyBgZ2V0UmVzdWx0TGlzdGAgaWYgYHVwZGF0ZVJlc3VsdExpc3RgIGhhcyBub3QgYmVlblxuICAvLyAgIGNhbGxlZCBmb3IgYXQgbGVhc3QgYGRlYm91bmNlRHVyYXRpb25gLlxuICB1cGRhdGVSZXN1bHRMaXN0ID0gKCgpID0+IHtcbiAgICBsZXQgdGltZW91dCA9IG51bGw7XG4gICAgbGV0IGNhY2hlID0ge307XG4gICAgcmV0dXJuICh2YWx1ZSkgPT4ge1xuICAgICAgY29uc3Qge1xuICAgICAgICBkZWJvdW5jZUR1cmF0aW9uLFxuICAgICAgICBnZXRSZXN1bHRMaXN0LFxuICAgICAgICBzaG91bGRDYWNoZVJlc3VsdExpc3RcbiAgICAgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgY29uc3QgcmVzdWx0TGlzdCA9IHNob3VsZENhY2hlUmVzdWx0TGlzdCAmJiBjYWNoZVt2YWx1ZV07XG4gICAgICBpZiAocmVzdWx0TGlzdCkge1xuICAgICAgICB0aGlzLnJlY2VpdmVSZXN1bHRMaXN0KHJlc3VsdExpc3QpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBpc0xvYWRpbmc6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIGdldFJlc3VsdExpc3QuY2FsbCh0aGlzLCB2YWx1ZSkudGhlbigocmVzdWx0TGlzdCkgPT4ge1xuICAgICAgICAgIGlmIChzaG91bGRDYWNoZVJlc3VsdExpc3QpIHtcbiAgICAgICAgICAgIGNhY2hlW3ZhbHVlXSA9IHJlc3VsdExpc3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucmVjZWl2ZVJlc3VsdExpc3QocmVzdWx0TGlzdCk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgZGVib3VuY2VEdXJhdGlvbik7XG4gICAgfTtcbiAgfSkoKTtcblxuICAvLyBSZXNldCB0byB0aGUgaW5pdGlhbCBzdGF0ZSBpZS4gZW1wdHkgdGV4dCBib3ggd2l0aCBubyByZXN1bHRzLlxuICByZXNldCA9ICgpID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKEF1dG9Db21wbGV0ZS5pbml0aWFsU3RhdGUpO1xuICB9O1xuXG4gIGtleURvd25IYW5kbGVycyA9IHtcbiAgICBBcnJvd0Rvd246ICgpID0+IHtcbiAgICAgIHRoaXMuc2V0SGlnaGxpZ2h0ZWRJdGVtKHRoaXMuaW5jcmVtZW50SGlnaGxpZ2h0ZWRJbmRleCgpKTtcbiAgICB9LFxuICAgIEFycm93VXA6ICgpID0+IHtcbiAgICAgIHRoaXMuc2V0SGlnaGxpZ2h0ZWRJdGVtKHRoaXMuZGVjcmVtZW50SGlnaGxpZ2h0ZWRJbmRleCgpKTtcbiAgICB9LFxuICAgIEVudGVyOiAoKSA9PiB7XG4gICAgICB0aGlzLmhhbmRsZUVudGVyS2V5RG93bigpO1xuICAgIH0sXG4gICAgRXNjYXBlOiAoKSA9PiB7XG4gICAgICB0aGlzLmhpZGVSZXN1bHRNZW51KCk7XG4gICAgICB0aGlzLnJlZnMudGV4dEJveC5ibHVyKCk7XG4gICAgfVxuICB9O1xuXG4gIGhhbmRsZUtleURvd24gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICBoaWdobGlnaHRlZEluZGV4LFxuICAgICAgdmFsdWVcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBrZXlEb3duSGFuZGxlciA9IHRoaXMua2V5RG93bkhhbmRsZXJzW2V2ZW50LmtleV07XG4gICAgaWYgKGtleURvd25IYW5kbGVyKSB7XG4gICAgICAvLyBTYXZlIHRoZSBpbml0aWFsIHVzZXIgaW5wdXQgdmFsdWUuXG4gICAgICBpZiAoaGlnaGxpZ2h0ZWRJbmRleCA9PT0gU0VOVElORUwpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgaW5pdGlhbFZhbHVlOiB2YWx1ZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGtleURvd25IYW5kbGVyKGV2ZW50KTtcbiAgICB9XG4gIH07XG5cbiAgLy8gTm90ZSB0aGF0IGBoYW5kbGVDaGFuZ2VgIGlzIG9ubHkgY2FsbGVkIGlmIHRoZSB0ZXh0IGJveCB2YWx1ZSBoYXMgYWN0dWFsbHlcbiAgLy8gY2hhbmdlZC4gSXQgaXMgbm90IGNhbGxlZCB3aGVuIHdlIGhpdCB0aGUgdXAvZG93biBhcnJvd3MuXG4gIGhhbmRsZUNoYW5nZSA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIGlmICh2YWx1ZS50cmltKCkgPT09ICcnKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleDogU0VOVElORUwsXG4gICAgICBpbml0aWFsVmFsdWU6IHZhbHVlLFxuICAgICAgdmFsdWVcbiAgICB9KTtcbiAgICB0aGlzLnVwZGF0ZVJlc3VsdExpc3QodmFsdWUpO1xuICB9O1xuXG4gIGhhbmRsZUJsdXIgPSAoKSA9PiB7XG4gICAgdGhpcy5oaWRlUmVzdWx0TWVudSgpO1xuICB9O1xuXG4gIGhhbmRsZUVudGVyS2V5RG93biA9ICgpID0+IHtcbiAgICBjb25zdCB7b25FbnRlcktleURvd259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBoaWdobGlnaHRlZEluZGV4LFxuICAgICAgcmVzdWx0TGlzdCxcbiAgICAgIHZhbHVlXG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgb25FbnRlcktleURvd24gJiYgb25FbnRlcktleURvd24uY2FsbCh0aGlzLCB2YWx1ZSwgcmVzdWx0TGlzdFtoaWdobGlnaHRlZEluZGV4XSk7XG4gIH07XG5cbiAgaGFuZGxlRm9jdXMgPSAoKSA9PiB7XG4gICAgdGhpcy5zaG93UmVzdWx0TWVudSgpO1xuICB9O1xuXG4gIGhhbmRsZVJlc3VsdEl0ZW1DbGljayA9IChpbmRleCkgPT4ge1xuICAgIGNvbnN0IHtyZXN1bHRMaXN0fSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge1xuICAgICAgZ2V0UmVzdWx0SXRlbVZhbHVlLFxuICAgICAgb25SZXN1bHRJdGVtQ2xpY2tcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCByZXN1bHQgPSByZXN1bHRMaXN0W2luZGV4XTtcbiAgICBvblJlc3VsdEl0ZW1DbGljayAmJiBvblJlc3VsdEl0ZW1DbGljayhnZXRSZXN1bHRJdGVtVmFsdWUuY2FsbCh0aGlzLCByZXN1bHQpLCByZXN1bHQpO1xuICAgIHRoaXMuc2V0SGlnaGxpZ2h0ZWRJdGVtKGluZGV4KTtcbiAgfTtcblxuICAvLyBQcmV2ZW50IHRoZSB0ZXh0IGJveCBmcm9tIGxvc2luZyBmb2N1cyB3aGVuIHdlIGNsaWNrIG91dHNpZGUgdGhlIHRleHRcbiAgLy8gYm94IChlZy4gY2xpY2sgb24gdGhlIHJlc3VsdCBtZW51KS5cbiAgaGFuZGxlTW91c2VEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge1xuICAgICAgY2hpbGRyZW4sXG4gICAgICBjbGFzc05hbWVzLFxuICAgICAgcmVuZGVyQmVmb3JlVGV4dEJveCxcbiAgICAgIHJlbmRlckFmdGVyVGV4dEJveCxcbiAgICAgIHJlbmRlckJlZm9yZVJlc3VsdExpc3QsXG4gICAgICByZW5kZXJBZnRlclJlc3VsdExpc3QsXG4gICAgICByZW5kZXJSZXN1bHRJdGVtXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleCxcbiAgICAgIGlzTG9hZGluZyxcbiAgICAgIGlzTWVudVZpc2libGUsXG4gICAgICByZXN1bHRMaXN0LFxuICAgICAgdmFsdWVcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBvbk1vdXNlRG93blByb3AgPSB7XG4gICAgICBvbk1vdXNlRG93bjogdGhpcy5oYW5kbGVNb3VzZURvd25cbiAgICB9O1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhjbGFzc05hbWVzLnJvb3QsIGlzTG9hZGluZyAmJiBjbGFzc05hbWVzLmlzTG9hZGluZyl9PlxuICAgICAgICB7cmVuZGVyQmVmb3JlVGV4dEJveCAmJlxuICAgICAgICAgIGNsb25lRWxlbWVudChyZW5kZXJCZWZvcmVUZXh0Qm94LmNhbGwodGhpcyksIG9uTW91c2VEb3duUHJvcCl9XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWVzLnRleHRCb3h9PlxuICAgICAgICAgIHtjbG9uZUVsZW1lbnQoY2hpbGRyZW4sIHtcbiAgICAgICAgICAgIG9uQmx1cjogdGhpcy5oYW5kbGVCbHVyLFxuICAgICAgICAgICAgb25DaGFuZ2U6IHRoaXMuaGFuZGxlQ2hhbmdlLFxuICAgICAgICAgICAgb25Gb2N1czogdGhpcy5oYW5kbGVGb2N1cyxcbiAgICAgICAgICAgIG9uS2V5RG93bjogdGhpcy5oYW5kbGVLZXlEb3duLFxuICAgICAgICAgICAgcmVmOiAndGV4dEJveCcsXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICB9KX1cbiAgICAgICAgICB7aXNNZW51VmlzaWJsZSAmJiByZXN1bHRMaXN0Lmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWVzLnJlc3VsdExpc3R9XG4gICAgICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLmhhbmRsZU1vdXNlRG93bn0+XG4gICAgICAgICAgICAgIHtyZW5kZXJCZWZvcmVSZXN1bHRMaXN0ICYmIHJlbmRlckJlZm9yZVJlc3VsdExpc3QuY2FsbCh0aGlzKX1cbiAgICAgICAgICAgICAge3Jlc3VsdExpc3QubWFwKChyZXN1bHRJdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhjbGFzc05hbWVzLnJlc3VsdEl0ZW0sIGluZGV4ID09PSBoaWdobGlnaHRlZEluZGV4ICYmIGNsYXNzTmFtZXMuaXNIaWdobGlnaHRlZCl9XG4gICAgICAgICAgICAgICAgICAgIGtleT17aW5kZXh9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlUmVzdWx0SXRlbUNsaWNrLmJpbmQodGhpcywgaW5kZXgpfT5cbiAgICAgICAgICAgICAgICAgICAge3JlbmRlclJlc3VsdEl0ZW0uY2FsbCh0aGlzLCByZXN1bHRJdGVtKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICB7cmVuZGVyQWZ0ZXJSZXN1bHRMaXN0ICYmIHJlbmRlckFmdGVyUmVzdWx0TGlzdC5jYWxsKHRoaXMpfVxuICAgICAgICAgICAgPC9kaXY+fVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge3JlbmRlckFmdGVyVGV4dEJveCAmJlxuICAgICAgICAgIGNsb25lRWxlbWVudChyZW5kZXJBZnRlclRleHRCb3guY2FsbCh0aGlzKSwgb25Nb3VzZURvd25Qcm9wKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==
