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
    var _json = _slicedToArray(json, 4),
        values = _json[1],
        links = _json[3];

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
  var link = resultItem.link,
      value = resultItem.value;

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
  _react2.default.createElement('input', { type: 'text', placeholder: 'Search Wikipedia\u2026' })
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
    if (script) {
      document.getElementsByTagName('head')[0].removeChild(script);
    }
  }

  function fetchJsonp(_url) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    // to avoid param reassign
    var url = _url;
    var timeout = options.timeout || defaultOptions.timeout;
    var jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;

    var timeoutId = undefined;

    return new Promise(function (resolve, reject) {
      var callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();
      var scriptId = jsonpCallback + '_' + callbackFunction;

      window[callbackFunction] = function (response) {
        resolve({
          ok: true,
          // keep consistent with fetch API
          json: function json() {
            return Promise.resolve(response);
          }
        });

        if (timeoutId) clearTimeout(timeoutId);

        removeScript(scriptId);

        clearFunction(callbackFunction);
      };

      // Check if the user set their own params, and if not add a ? to start a list of params
      url += url.indexOf('?') === -1 ? '?' : '&';

      var jsonpScript = document.createElement('script');
      jsonpScript.setAttribute('src', '' + url + jsonpCallback + '=' + callbackFunction);
      if (options.charset) {
        jsonpScript.setAttribute('charset', options.charset);
      }
      jsonpScript.id = scriptId;
      document.getElementsByTagName('head')[0].appendChild(jsonpScript);

      timeoutId = setTimeout(function () {
        reject(new Error('JSONP request to ' + _url + ' timed out'));

        clearFunction(callbackFunction);
        removeScript(scriptId);
        window[callbackFunction] = function () {
          clearFunction(callbackFunction);
        };
      }, timeout);

      // Caught if got 404/500
      jsonpScript.onerror = function () {
        reject(new Error('JSONP request to ' + _url + ' failed'));

        clearFunction(callbackFunction);
        removeScript(scriptId);
        if (timeoutId) clearTimeout(timeoutId);
      };
    });
  }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZmV0Y2gtanNvbnAvYnVpbGQvZmV0Y2gtanNvbnAuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFFQSxJQUFNLGFBQWE7QUFDakIsaUJBQWUsZUFERTtBQUVqQixhQUFXLFdBRk07QUFHakIsY0FBWSxZQUhLO0FBSWpCLGNBQVksWUFKSztBQUtqQixRQUFNLE1BTFc7QUFNakIsV0FBUztBQU5RLENBQW5COztBQVNBLFNBQVMsYUFBVCxDQUF1QixLQUF2QixFQUE4QjtBQUM1QixTQUFPLHVHQUFzRixLQUF0RixFQUNKLElBREksQ0FDQyxVQUFDLFFBQUQsRUFBYztBQUNsQixXQUFPLFNBQVMsSUFBVCxFQUFQO0FBQ0QsR0FISSxFQUdGLElBSEUsQ0FHRyxVQUFDLElBQUQsRUFBVTtBQUFBLCtCQUNZLElBRFo7QUFBQSxRQUNQLE1BRE87QUFBQSxRQUNHLEtBREg7O0FBRWhCLFdBQU8sT0FBTyxHQUFQLENBQVcsVUFBQyxLQUFELEVBQVEsS0FBUixFQUFrQjtBQUNsQyxhQUFPO0FBQ0wsb0JBREs7QUFFTCxjQUFNLE1BQU0sS0FBTjtBQUZELE9BQVA7QUFJRCxLQUxNLENBQVA7QUFNRCxHQVhJLENBQVA7QUFZRDs7QUFFRCxTQUFTLGtCQUFULENBQTRCLFVBQTVCLEVBQXdDO0FBQ3RDLFNBQU8sV0FBVyxLQUFsQjtBQUNEOztBQUVELFNBQVMsY0FBVCxDQUF3QixLQUF4QixFQUErQixVQUEvQixFQUEyQztBQUN6QyxNQUFJLFNBQVMsVUFBYixFQUF5QjtBQUN2QixXQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsR0FBdUIsYUFBYSxXQUFXLElBQXhCLDREQUFzRixLQUE3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LCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgZmV0Y2hKc29ucCBmcm9tICdmZXRjaC1qc29ucCc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtyZW5kZXJ9IGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgQXV0b0NvbXBsZXRlIGZyb20gJy4uL3NyYyc7XG5cbmNvbnN0IGNsYXNzTmFtZXMgPSB7XG4gIGlzSGlnaGxpZ2h0ZWQ6ICdpc0hpZ2hsaWdodGVkJyxcbiAgaXNMb2FkaW5nOiAnaXNMb2FkaW5nJyxcbiAgcmVzdWx0SXRlbTogJ3Jlc3VsdEl0ZW0nLFxuICByZXN1bHRMaXN0OiAncmVzdWx0TGlzdCcsXG4gIHJvb3Q6ICdyb290JyxcbiAgdGV4dEJveDogJ3RleHRCb3gnXG59O1xuXG5mdW5jdGlvbiBnZXRSZXN1bHRMaXN0KHZhbHVlKSB7XG4gIHJldHVybiBmZXRjaEpzb25wKGBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvdy9hcGkucGhwP2FjdGlvbj1vcGVuc2VhcmNoJmZvcm1hdD1qc29uJnNlYXJjaD0ke3ZhbHVlfWApXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgIH0pLnRoZW4oKGpzb24pID0+IHtcbiAgICAgIGNvbnN0IFssIHZhbHVlcywgLCBsaW5rc10gPSBqc29uO1xuICAgICAgcmV0dXJuIHZhbHVlcy5tYXAoKHZhbHVlLCBpbmRleCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIGxpbms6IGxpbmtzW2luZGV4XVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFJlc3VsdEl0ZW1WYWx1ZShyZXN1bHRJdGVtKSB7XG4gIHJldHVybiByZXN1bHRJdGVtLnZhbHVlO1xufVxuXG5mdW5jdGlvbiBvbkVudGVyS2V5RG93bih2YWx1ZSwgcmVzdWx0SXRlbSkge1xuICBpZiAodmFsdWUgfHwgcmVzdWx0SXRlbSkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVzdWx0SXRlbSA/IHJlc3VsdEl0ZW0ubGluayA6IGBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TcGVjaWFsOlNlYXJjaD9zZWFyY2g9JHt2YWx1ZX1gO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFmdGVyVGV4dEJveCgpIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImJ1dHRvblwiPlxuICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLmhhbmRsZUVudGVyS2V5RG93bn0+U2VhcmNoPC9idXR0b24+XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclJlc3VsdEl0ZW0ocmVzdWx0SXRlbSkge1xuICBjb25zdCB7XG4gICAgbGluayxcbiAgICB2YWx1ZVxuICB9ID0gcmVzdWx0SXRlbTtcbiAgcmV0dXJuIDxhIGhyZWY9e2xpbmt9Pnt2YWx1ZX08L2E+O1xufVxuXG5yZW5kZXIoKFxuICA8QXV0b0NvbXBsZXRlXG4gICAgY2xhc3NOYW1lcz17Y2xhc3NOYW1lc31cbiAgICBkZWJvdW5jZUR1cmF0aW9uPXsyNTB9XG4gICAgZ2V0UmVzdWx0SXRlbVZhbHVlPXtnZXRSZXN1bHRJdGVtVmFsdWV9XG4gICAgZ2V0UmVzdWx0TGlzdD17Z2V0UmVzdWx0TGlzdH1cbiAgICBvbkVudGVyS2V5RG93bj17b25FbnRlcktleURvd259XG4gICAgcmVuZGVyQWZ0ZXJUZXh0Qm94PXtyZW5kZXJBZnRlclRleHRCb3h9XG4gICAgcmVuZGVyUmVzdWx0SXRlbT17cmVuZGVyUmVzdWx0SXRlbX1cbiAgICBzaG91bGRDYWNoZVJlc3VsdExpc3Q+XG4gICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJTZWFyY2ggV2lraXBlZGlhJmhlbGxpcDtcIiAvPlxuICA8L0F1dG9Db21wbGV0ZT5cbiksIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5BdXRvQ29tcGxldGUnKSk7XG4iLCIvKiFcbiAgQ29weXJpZ2h0IChjKSAyMDE2IEplZCBXYXRzb24uXG4gIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZSAoTUlUKSwgc2VlXG4gIGh0dHA6Ly9qZWR3YXRzb24uZ2l0aHViLmlvL2NsYXNzbmFtZXNcbiovXG4vKiBnbG9iYWwgZGVmaW5lICovXG5cbihmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgaGFzT3duID0ge30uaGFzT3duUHJvcGVydHk7XG5cblx0ZnVuY3Rpb24gY2xhc3NOYW1lcyAoKSB7XG5cdFx0dmFyIGNsYXNzZXMgPSBbXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuXHRcdFx0aWYgKCFhcmcpIGNvbnRpbnVlO1xuXG5cdFx0XHR2YXIgYXJnVHlwZSA9IHR5cGVvZiBhcmc7XG5cblx0XHRcdGlmIChhcmdUeXBlID09PSAnc3RyaW5nJyB8fCBhcmdUeXBlID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRjbGFzc2VzLnB1c2goYXJnKTtcblx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhcmcpKSB7XG5cdFx0XHRcdGNsYXNzZXMucHVzaChjbGFzc05hbWVzLmFwcGx5KG51bGwsIGFyZykpO1xuXHRcdFx0fSBlbHNlIGlmIChhcmdUeXBlID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gYXJnKSB7XG5cdFx0XHRcdFx0aWYgKGhhc093bi5jYWxsKGFyZywga2V5KSAmJiBhcmdba2V5XSkge1xuXHRcdFx0XHRcdFx0Y2xhc3Nlcy5wdXNoKGtleSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNsYXNzZXMuam9pbignICcpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBjbGFzc05hbWVzO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcblx0XHQvLyByZWdpc3RlciBhcyAnY2xhc3NuYW1lcycsIGNvbnNpc3RlbnQgd2l0aCBucG0gcGFja2FnZSBuYW1lXG5cdFx0ZGVmaW5lKCdjbGFzc25hbWVzJywgW10sIGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBjbGFzc05hbWVzO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5jbGFzc05hbWVzID0gY2xhc3NOYW1lcztcblx0fVxufSgpKTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoWydleHBvcnRzJywgJ21vZHVsZSddLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBmYWN0b3J5KGV4cG9ydHMsIG1vZHVsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG1vZCA9IHtcbiAgICAgIGV4cG9ydHM6IHt9XG4gICAgfTtcbiAgICBmYWN0b3J5KG1vZC5leHBvcnRzLCBtb2QpO1xuICAgIGdsb2JhbC5mZXRjaEpzb25wID0gbW9kLmV4cG9ydHM7XG4gIH1cbn0pKHRoaXMsIGZ1bmN0aW9uIChleHBvcnRzLCBtb2R1bGUpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB0aW1lb3V0OiA1MDAwLFxuICAgIGpzb25wQ2FsbGJhY2s6ICdjYWxsYmFjaycsXG4gICAganNvbnBDYWxsYmFja0Z1bmN0aW9uOiBudWxsXG4gIH07XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVDYWxsYmFja0Z1bmN0aW9uKCkge1xuICAgIHJldHVybiAnanNvbnBfJyArIERhdGUubm93KCkgKyAnXycgKyBNYXRoLmNlaWwoTWF0aC5yYW5kb20oKSAqIDEwMDAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckZ1bmN0aW9uKGZ1bmN0aW9uTmFtZSkge1xuICAgIC8vIElFOCB0aHJvd3MgYW4gZXhjZXB0aW9uIHdoZW4geW91IHRyeSB0byBkZWxldGUgYSBwcm9wZXJ0eSBvbiB3aW5kb3dcbiAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xODI0MjI4Lzc1MTA4OVxuICAgIHRyeSB7XG4gICAgICBkZWxldGUgd2luZG93W2Z1bmN0aW9uTmFtZV07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2luZG93W2Z1bmN0aW9uTmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlU2NyaXB0KHNjcmlwdElkKSB7XG4gICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNjcmlwdElkKTtcbiAgICBpZiAoc2NyaXB0KSB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmV0Y2hKc29ucChfdXJsKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIC8vIHRvIGF2b2lkIHBhcmFtIHJlYXNzaWduXG4gICAgdmFyIHVybCA9IF91cmw7XG4gICAgdmFyIHRpbWVvdXQgPSBvcHRpb25zLnRpbWVvdXQgfHwgZGVmYXVsdE9wdGlvbnMudGltZW91dDtcbiAgICB2YXIganNvbnBDYWxsYmFjayA9IG9wdGlvbnMuanNvbnBDYWxsYmFjayB8fCBkZWZhdWx0T3B0aW9ucy5qc29ucENhbGxiYWNrO1xuXG4gICAgdmFyIHRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgY2FsbGJhY2tGdW5jdGlvbiA9IG9wdGlvbnMuanNvbnBDYWxsYmFja0Z1bmN0aW9uIHx8IGdlbmVyYXRlQ2FsbGJhY2tGdW5jdGlvbigpO1xuICAgICAgdmFyIHNjcmlwdElkID0ganNvbnBDYWxsYmFjayArICdfJyArIGNhbGxiYWNrRnVuY3Rpb247XG5cbiAgICAgIHdpbmRvd1tjYWxsYmFja0Z1bmN0aW9uXSA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICBvazogdHJ1ZSxcbiAgICAgICAgICAvLyBrZWVwIGNvbnNpc3RlbnQgd2l0aCBmZXRjaCBBUElcbiAgICAgICAgICBqc29uOiBmdW5jdGlvbiBqc29uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGltZW91dElkKSBjbGVhclRpbWVvdXQodGltZW91dElkKTtcblxuICAgICAgICByZW1vdmVTY3JpcHQoc2NyaXB0SWQpO1xuXG4gICAgICAgIGNsZWFyRnVuY3Rpb24oY2FsbGJhY2tGdW5jdGlvbik7XG4gICAgICB9O1xuXG4gICAgICAvLyBDaGVjayBpZiB0aGUgdXNlciBzZXQgdGhlaXIgb3duIHBhcmFtcywgYW5kIGlmIG5vdCBhZGQgYSA/IHRvIHN0YXJ0IGEgbGlzdCBvZiBwYXJhbXNcbiAgICAgIHVybCArPSB1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJztcblxuICAgICAgdmFyIGpzb25wU2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBqc29ucFNjcmlwdC5zZXRBdHRyaWJ1dGUoJ3NyYycsICcnICsgdXJsICsganNvbnBDYWxsYmFjayArICc9JyArIGNhbGxiYWNrRnVuY3Rpb24pO1xuICAgICAgaWYgKG9wdGlvbnMuY2hhcnNldCkge1xuICAgICAgICBqc29ucFNjcmlwdC5zZXRBdHRyaWJ1dGUoJ2NoYXJzZXQnLCBvcHRpb25zLmNoYXJzZXQpO1xuICAgICAgfVxuICAgICAganNvbnBTY3JpcHQuaWQgPSBzY3JpcHRJZDtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoanNvbnBTY3JpcHQpO1xuXG4gICAgICB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignSlNPTlAgcmVxdWVzdCB0byAnICsgX3VybCArICcgdGltZWQgb3V0JykpO1xuXG4gICAgICAgIGNsZWFyRnVuY3Rpb24oY2FsbGJhY2tGdW5jdGlvbik7XG4gICAgICAgIHJlbW92ZVNjcmlwdChzY3JpcHRJZCk7XG4gICAgICAgIHdpbmRvd1tjYWxsYmFja0Z1bmN0aW9uXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjbGVhckZ1bmN0aW9uKGNhbGxiYWNrRnVuY3Rpb24pO1xuICAgICAgICB9O1xuICAgICAgfSwgdGltZW91dCk7XG5cbiAgICAgIC8vIENhdWdodCBpZiBnb3QgNDA0LzUwMFxuICAgICAganNvbnBTY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignSlNPTlAgcmVxdWVzdCB0byAnICsgX3VybCArICcgZmFpbGVkJykpO1xuXG4gICAgICAgIGNsZWFyRnVuY3Rpb24oY2FsbGJhY2tGdW5jdGlvbik7XG4gICAgICAgIHJlbW92ZVNjcmlwdChzY3JpcHRJZCk7XG4gICAgICAgIGlmICh0aW1lb3V0SWQpIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIGV4cG9ydCBhcyBnbG9iYWwgZnVuY3Rpb25cbiAgLypcbiAgbGV0IGxvY2FsO1xuICBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsb2NhbCA9IGdsb2JhbDtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBsb2NhbCA9IHNlbGY7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BvbHlmaWxsIGZhaWxlZCBiZWNhdXNlIGdsb2JhbCBvYmplY3QgaXMgdW5hdmFpbGFibGUgaW4gdGhpcyBlbnZpcm9ubWVudCcpO1xuICAgIH1cbiAgfVxuICBsb2NhbC5mZXRjaEpzb25wID0gZmV0Y2hKc29ucDtcbiAgKi9cblxuICBtb2R1bGUuZXhwb3J0cyA9IGZldGNoSnNvbnA7XG59KTsiLCJpbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBSZWFjdCwge2Nsb25lRWxlbWVudCwgQ29tcG9uZW50LCBQcm9wVHlwZXN9IGZyb20gJ3JlYWN0JztcblxuLy8gSW5kZXggdGhhdCBpbmRpY2F0ZXMgdGhhdCBub25lIG9mIHRoZSBhdXRvY29tcGxldGUgcmVzdWx0cyBpc1xuLy8gY3VycmVudGx5IGhpZ2hsaWdodGVkLlxuY29uc3QgU0VOVElORUwgPSAtMTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXV0b0NvbXBsZXRlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjaGlsZHJlbjogUHJvcFR5cGVzLm5vZGUsXG4gICAgY2xhc3NOYW1lczogUHJvcFR5cGVzLm9iamVjdE9mKFByb3BUeXBlcy5zdHJpbmcpLFxuICAgIGRlYm91bmNlRHVyYXRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gICAgZ2V0UmVzdWx0SXRlbVZhbHVlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGdldFJlc3VsdExpc3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25FbnRlcktleURvd246IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uUmVzdWx0SXRlbUNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICByZW5kZXJCZWZvcmVUZXh0Qm94OiBQcm9wVHlwZXMuZnVuYyxcbiAgICByZW5kZXJBZnRlclRleHRCb3g6IFByb3BUeXBlcy5mdW5jLFxuICAgIHJlbmRlckJlZm9yZVJlc3VsdExpc3Q6IFByb3BUeXBlcy5mdW5jLFxuICAgIHJlbmRlckFmdGVyUmVzdWx0TGlzdDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcmVuZGVyUmVzdWx0SXRlbTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBzaG91bGRDYWNoZVJlc3VsdExpc3Q6IFByb3BUeXBlcy5ib29sXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBjaGlsZHJlbjogKFxuICAgICAgPGlucHV0IGFyaWEtYXV0b2NvbXBsZXRlPVwiYm90aFwiXG4gICAgICAgIHJvbGU9XCJjb21ib2JveFwiXG4gICAgICAgIHR5cGU9XCJ0ZXh0XCIgLz5cbiAgICApLFxuICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgIGlzSGlnaGxpZ2h0ZWQ6ICdpc0hpZ2hsaWdodGVkJyxcbiAgICAgIGlzTG9hZGluZzogJ2lzTG9hZGluZycsXG4gICAgICByZXN1bHRJdGVtOiAncmVzdWx0SXRlbScsXG4gICAgICByZXN1bHRMaXN0OiAncmVzdWx0TGlzdCcsXG4gICAgICByb290OiAncm9vdCcsXG4gICAgICB0ZXh0Qm94OiAndGV4dEJveCdcbiAgICB9LFxuICAgIGRlYm91bmNlRHVyYXRpb246IDI1MCxcbiAgICBzaG91bGRDYWNoZVJlc3VsdExpc3Q6IHRydWVcbiAgfTtcblxuICBzdGF0aWMgaW5pdGlhbFN0YXRlID0ge1xuICAgIGhpZ2hsaWdodGVkSW5kZXg6IFNFTlRJTkVMLFxuICAgIGluaXRpYWxWYWx1ZTogJycsXG4gICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICBpc01lbnVWaXNpYmxlOiBmYWxzZSxcbiAgICByZXN1bHRMaXN0OiBbXSxcbiAgICB2YWx1ZTogJydcbiAgfTtcblxuICBzdGF0ZSA9IEF1dG9Db21wbGV0ZS5pbml0aWFsU3RhdGU7XG5cbiAgLy8gUmV0dXJucyB0aGUgdmFsdWUgb2YgYHN0YXRlLmhpZ2hsaWdodGVkSW5kZXhgIGRlY3JlbWVudGVkIGJ5IDEuXG4gIC8vIElmIG5lY2Vzc2FyeSwgd3JhcHMgYXJvdW5kIHRvIHRoZSBsYXN0IGl0ZW0sIG9yIHJldmVydHMgdG8gYFNFTlRJTkVMYFxuICAvLyAoaWUuIG5vIGl0ZW0gaGlnaGxpZ2h0ZWQpLlxuICBkZWNyZW1lbnRIaWdobGlnaHRlZEluZGV4ID0gKCkgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICByZXN1bHRMaXN0XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgc3dpdGNoIChoaWdobGlnaHRlZEluZGV4KSB7XG4gICAgICBjYXNlIFNFTlRJTkVMOlxuICAgICAgICByZXR1cm4gcmVzdWx0TGlzdC5sZW5ndGggLSAxO1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gU0VOVElORUw7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0ZWRJbmRleCAtIDE7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIHZhbHVlIG9mIGBzdGF0ZS5oaWdobGlnaHRlZEluZGV4YCBpbmNyZW1lbnRlZCBieSAxLlxuICAvLyBJZiBuZWNlc3NhcnksIHJldmVydHMgdG8gYFNFTlRJTkVMYCAoaWUuIG5vIGl0ZW0gaGlnaGxpZ2h0ZWQpLlxuICBpbmNyZW1lbnRIaWdobGlnaHRlZEluZGV4ID0gKCkgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICByZXN1bHRMaXN0XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGhpZ2hsaWdodGVkSW5kZXggPT09IHJlc3VsdExpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIFNFTlRJTkVMO1xuICAgIH1cbiAgICByZXR1cm4gaGlnaGxpZ2h0ZWRJbmRleCArIDE7XG4gIH07XG5cbiAgLy8gU2V0IHRoZSBjdXJyZW50IGhpZ2hsaWdodGVkIGl0ZW0gdG8gdGhlIGl0ZW0gYXQgdGhlIGdpdmVuXG4gIC8vIGBoaWdobGlnaHRlZEluZGV4YC4gU2V0IHRoZSB0ZXh0IGJveCdzIHZhbHVlIHRvIHRoYXQgb2YgdGhlIG5ld1xuICAvLyBoaWdobGlnaHRlZCBpdGVtLlxuICBzZXRIaWdobGlnaHRlZEl0ZW0gPSAoaGlnaGxpZ2h0ZWRJbmRleCkgPT4ge1xuICAgIGNvbnN0IHtnZXRSZXN1bHRJdGVtVmFsdWV9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBpbml0aWFsVmFsdWUsXG4gICAgICByZXN1bHRMaXN0XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgaXNBbnlJdGVtSGlnaGxpZ2h0ZWQgPSBoaWdobGlnaHRlZEluZGV4ICE9PSBTRU5USU5FTDtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICB2YWx1ZTogaXNBbnlJdGVtSGlnaGxpZ2h0ZWRcbiAgICAgICAgPyBnZXRSZXN1bHRJdGVtVmFsdWUuY2FsbCh0aGlzLCByZXN1bHRMaXN0W2hpZ2hsaWdodGVkSW5kZXhdKVxuICAgICAgICA6IGluaXRpYWxWYWx1ZVxuICAgIH0pO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaXNBbnlJdGVtSGlnaGxpZ2h0ZWRcbiAgICAgID8gdGhpcy5zZWxlY3RUZXh0Qm94VmFsdWVcbiAgICAgIDogdGhpcy5tb3ZlVGV4dEJveENhcmV0VG9FbmQpO1xuICB9O1xuXG4gIC8vIFNlbGVjdCBhbGwgdGhlIHRleHQgaW4gdGhlIHRleHQgYm94LlxuICBzZWxlY3RUZXh0Qm94VmFsdWUgPSAoKSA9PiB7XG4gICAgY29uc3Qge3ZhbHVlfSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5yZWZzLnRleHRCb3guc2V0U2VsZWN0aW9uUmFuZ2UoMCwgdmFsdWUubGVuZ3RoKTtcbiAgfTtcblxuICAvLyBNb3ZlIHRoZSBjYXJldCBpbiB0aGUgdGV4dCBib3ggdG8gdGhlIGVuZCBvZiB0aGUgdGV4dCBib3guXG4gIG1vdmVUZXh0Qm94Q2FyZXRUb0VuZCA9ICgpID0+IHtcbiAgICBjb25zdCB7dmFsdWV9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG4gICAgdGhpcy5yZWZzLnRleHRCb3guc2V0U2VsZWN0aW9uUmFuZ2UobGVuZ3RoLCBsZW5ndGgpO1xuICB9O1xuXG4gIC8vIEhpZGUgdGhlIHJlc3VsdCBtZW51LlxuICBoaWRlUmVzdWx0TWVudSA9ICgpID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzTWVudVZpc2libGU6IGZhbHNlXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gU2hvdyB0aGUgcmVzdWx0IG1lbnUuXG4gIHNob3dSZXN1bHRNZW51ID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNNZW51VmlzaWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIFNldCBgc3RhdGUucmVzdWx0TGlzdGAgdG8gdGhlIGdpdmVuIGByZXN1bHRMaXN0YCwgc2V0IHRvIG5vdCBsb2FkaW5nLFxuICAvLyBhbmQgc2hvdyB0aGUgcmVzdWx0cy5cbiAgcmVjZWl2ZVJlc3VsdExpc3QgPSAocmVzdWx0TGlzdCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgIHJlc3VsdExpc3RcbiAgICB9KTtcbiAgICB0aGlzLnNob3dSZXN1bHRNZW51KCk7XG4gIH07XG5cbiAgLy8gVXBkYXRlIGBzdGF0ZS5yZXN1bHRMaXN0YCBiYXNlZCBvbiB0aGUgZ2l2ZW4gYHZhbHVlYC5cbiAgLy8gLSBDYWNoZXMgcmVzdWx0cyBmb3IgYHN0YXRlLnJlc3VsdExpc3RgIGluIGEgYGNhY2hlYDsgcmV0dXJuc1xuICAvLyAgIGltbWVkaWF0ZWx5IGlmIHRoZSByZXN1bHRzIGZvciBgdmFsdWVgIGlzIGFscmVhZHkgaW4gYGNhY2hlYC5cbiAgLy8gLSBcIlJhdGUtbGltaXRlZFwiIHRvIHByZXZlbnQgdW5uZWNlc3NhcnkgY2FsbHMgdG8gYGdldFJlc3VsdExpc3RgLlxuICAvLyAgIE9ubHkgY2FsbHMgYGdldFJlc3VsdExpc3RgIGlmIGB1cGRhdGVSZXN1bHRMaXN0YCBoYXMgbm90IGJlZW5cbiAgLy8gICBjYWxsZWQgZm9yIGF0IGxlYXN0IGBkZWJvdW5jZUR1cmF0aW9uYC5cbiAgdXBkYXRlUmVzdWx0TGlzdCA9ICgoKSA9PiB7XG4gICAgbGV0IHRpbWVvdXQgPSBudWxsO1xuICAgIGxldCBjYWNoZSA9IHt9O1xuICAgIHJldHVybiAodmFsdWUpID0+IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgZGVib3VuY2VEdXJhdGlvbixcbiAgICAgICAgZ2V0UmVzdWx0TGlzdCxcbiAgICAgICAgc2hvdWxkQ2FjaGVSZXN1bHRMaXN0XG4gICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIGNvbnN0IHJlc3VsdExpc3QgPSBzaG91bGRDYWNoZVJlc3VsdExpc3QgJiYgY2FjaGVbdmFsdWVdO1xuICAgICAgaWYgKHJlc3VsdExpc3QpIHtcbiAgICAgICAgdGhpcy5yZWNlaXZlUmVzdWx0TGlzdChyZXN1bHRMaXN0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgaXNMb2FkaW5nOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBnZXRSZXN1bHRMaXN0LmNhbGwodGhpcywgdmFsdWUpLnRoZW4oKHJlc3VsdExpc3QpID0+IHtcbiAgICAgICAgICBpZiAoc2hvdWxkQ2FjaGVSZXN1bHRMaXN0KSB7XG4gICAgICAgICAgICBjYWNoZVt2YWx1ZV0gPSByZXN1bHRMaXN0O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnJlY2VpdmVSZXN1bHRMaXN0KHJlc3VsdExpc3QpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIGRlYm91bmNlRHVyYXRpb24pO1xuICAgIH07XG4gIH0pKCk7XG5cbiAgLy8gUmVzZXQgdG8gdGhlIGluaXRpYWwgc3RhdGUgaWUuIGVtcHR5IHRleHQgYm94IHdpdGggbm8gcmVzdWx0cy5cbiAgcmVzZXQgPSAoKSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZShBdXRvQ29tcGxldGUuaW5pdGlhbFN0YXRlKTtcbiAgfTtcblxuICBrZXlEb3duSGFuZGxlcnMgPSB7XG4gICAgQXJyb3dEb3duOiAoKSA9PiB7XG4gICAgICB0aGlzLnNldEhpZ2hsaWdodGVkSXRlbSh0aGlzLmluY3JlbWVudEhpZ2hsaWdodGVkSW5kZXgoKSk7XG4gICAgfSxcbiAgICBBcnJvd1VwOiAoKSA9PiB7XG4gICAgICB0aGlzLnNldEhpZ2hsaWdodGVkSXRlbSh0aGlzLmRlY3JlbWVudEhpZ2hsaWdodGVkSW5kZXgoKSk7XG4gICAgfSxcbiAgICBFbnRlcjogKCkgPT4ge1xuICAgICAgdGhpcy5oYW5kbGVFbnRlcktleURvd24oKTtcbiAgICB9LFxuICAgIEVzY2FwZTogKCkgPT4ge1xuICAgICAgdGhpcy5oaWRlUmVzdWx0TWVudSgpO1xuICAgICAgdGhpcy5yZWZzLnRleHRCb3guYmx1cigpO1xuICAgIH1cbiAgfTtcblxuICBoYW5kbGVLZXlEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleCxcbiAgICAgIHZhbHVlXG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qga2V5RG93bkhhbmRsZXIgPSB0aGlzLmtleURvd25IYW5kbGVyc1tldmVudC5rZXldO1xuICAgIGlmIChrZXlEb3duSGFuZGxlcikge1xuICAgICAgLy8gU2F2ZSB0aGUgaW5pdGlhbCB1c2VyIGlucHV0IHZhbHVlLlxuICAgICAgaWYgKGhpZ2hsaWdodGVkSW5kZXggPT09IFNFTlRJTkVMKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGluaXRpYWxWYWx1ZTogdmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBrZXlEb3duSGFuZGxlcihldmVudCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIE5vdGUgdGhhdCBgaGFuZGxlQ2hhbmdlYCBpcyBvbmx5IGNhbGxlZCBpZiB0aGUgdGV4dCBib3ggdmFsdWUgaGFzIGFjdHVhbGx5XG4gIC8vIGNoYW5nZWQuIEl0IGlzIG5vdCBjYWxsZWQgd2hlbiB3ZSBoaXQgdGhlIHVwL2Rvd24gYXJyb3dzLlxuICBoYW5kbGVDaGFuZ2UgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICBpZiAodmFsdWUudHJpbSgpID09PSAnJykge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXg6IFNFTlRJTkVMLFxuICAgICAgaW5pdGlhbFZhbHVlOiB2YWx1ZSxcbiAgICAgIHZhbHVlXG4gICAgfSk7XG4gICAgdGhpcy51cGRhdGVSZXN1bHRMaXN0KHZhbHVlKTtcbiAgfTtcblxuICBoYW5kbGVCbHVyID0gKCkgPT4ge1xuICAgIHRoaXMuaGlkZVJlc3VsdE1lbnUoKTtcbiAgfTtcblxuICBoYW5kbGVFbnRlcktleURvd24gPSAoKSA9PiB7XG4gICAgY29uc3Qge29uRW50ZXJLZXlEb3dufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleCxcbiAgICAgIHJlc3VsdExpc3QsXG4gICAgICB2YWx1ZVxuICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgIG9uRW50ZXJLZXlEb3duICYmIG9uRW50ZXJLZXlEb3duLmNhbGwodGhpcywgdmFsdWUsIHJlc3VsdExpc3RbaGlnaGxpZ2h0ZWRJbmRleF0pO1xuICB9O1xuXG4gIGhhbmRsZUZvY3VzID0gKCkgPT4ge1xuICAgIHRoaXMuc2hvd1Jlc3VsdE1lbnUoKTtcbiAgfTtcblxuICBoYW5kbGVSZXN1bHRJdGVtQ2xpY2sgPSAoaW5kZXgpID0+IHtcbiAgICBjb25zdCB7cmVzdWx0TGlzdH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHtcbiAgICAgIGdldFJlc3VsdEl0ZW1WYWx1ZSxcbiAgICAgIG9uUmVzdWx0SXRlbUNsaWNrXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgcmVzdWx0ID0gcmVzdWx0TGlzdFtpbmRleF07XG4gICAgb25SZXN1bHRJdGVtQ2xpY2sgJiYgb25SZXN1bHRJdGVtQ2xpY2soZ2V0UmVzdWx0SXRlbVZhbHVlLmNhbGwodGhpcywgcmVzdWx0KSwgcmVzdWx0KTtcbiAgICB0aGlzLnNldEhpZ2hsaWdodGVkSXRlbShpbmRleCk7XG4gIH07XG5cbiAgLy8gUHJldmVudCB0aGUgdGV4dCBib3ggZnJvbSBsb3NpbmcgZm9jdXMgd2hlbiB3ZSBjbGljayBvdXRzaWRlIHRoZSB0ZXh0XG4gIC8vIGJveCAoZWcuIGNsaWNrIG9uIHRoZSByZXN1bHQgbWVudSkuXG4gIGhhbmRsZU1vdXNlRG93biA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgY2xhc3NOYW1lcyxcbiAgICAgIHJlbmRlckJlZm9yZVRleHRCb3gsXG4gICAgICByZW5kZXJBZnRlclRleHRCb3gsXG4gICAgICByZW5kZXJCZWZvcmVSZXN1bHRMaXN0LFxuICAgICAgcmVuZGVyQWZ0ZXJSZXN1bHRMaXN0LFxuICAgICAgcmVuZGVyUmVzdWx0SXRlbVxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICBpc0xvYWRpbmcsXG4gICAgICBpc01lbnVWaXNpYmxlLFxuICAgICAgcmVzdWx0TGlzdCxcbiAgICAgIHZhbHVlXG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qgb25Nb3VzZURvd25Qcm9wID0ge1xuICAgICAgb25Nb3VzZURvd246IHRoaXMuaGFuZGxlTW91c2VEb3duXG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoY2xhc3NOYW1lcy5yb290LCBpc0xvYWRpbmcgJiYgY2xhc3NOYW1lcy5pc0xvYWRpbmcpfT5cbiAgICAgICAge3JlbmRlckJlZm9yZVRleHRCb3ggJiZcbiAgICAgICAgICBjbG9uZUVsZW1lbnQocmVuZGVyQmVmb3JlVGV4dEJveC5jYWxsKHRoaXMpLCBvbk1vdXNlRG93blByb3ApfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcy50ZXh0Qm94fT5cbiAgICAgICAgICB7Y2xvbmVFbGVtZW50KGNoaWxkcmVuLCB7XG4gICAgICAgICAgICBvbkJsdXI6IHRoaXMuaGFuZGxlQmx1cixcbiAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUNoYW5nZSxcbiAgICAgICAgICAgIG9uRm9jdXM6IHRoaXMuaGFuZGxlRm9jdXMsXG4gICAgICAgICAgICBvbktleURvd246IHRoaXMuaGFuZGxlS2V5RG93bixcbiAgICAgICAgICAgIHJlZjogJ3RleHRCb3gnLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgfSl9XG4gICAgICAgICAge2lzTWVudVZpc2libGUgJiYgcmVzdWx0TGlzdC5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcy5yZXN1bHRMaXN0fVxuICAgICAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259PlxuICAgICAgICAgICAgICB7cmVuZGVyQmVmb3JlUmVzdWx0TGlzdCAmJiByZW5kZXJCZWZvcmVSZXN1bHRMaXN0LmNhbGwodGhpcyl9XG4gICAgICAgICAgICAgIHtyZXN1bHRMaXN0Lm1hcCgocmVzdWx0SXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoY2xhc3NOYW1lcy5yZXN1bHRJdGVtLCBpbmRleCA9PT0gaGlnaGxpZ2h0ZWRJbmRleCAmJiBjbGFzc05hbWVzLmlzSGlnaGxpZ2h0ZWQpfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e2luZGV4fVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZVJlc3VsdEl0ZW1DbGljay5iaW5kKHRoaXMsIGluZGV4KX0+XG4gICAgICAgICAgICAgICAgICAgIHtyZW5kZXJSZXN1bHRJdGVtLmNhbGwodGhpcywgcmVzdWx0SXRlbSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAge3JlbmRlckFmdGVyUmVzdWx0TGlzdCAmJiByZW5kZXJBZnRlclJlc3VsdExpc3QuY2FsbCh0aGlzKX1cbiAgICAgICAgICAgIDwvZGl2Pn1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtyZW5kZXJBZnRlclRleHRCb3ggJiZcbiAgICAgICAgICBjbG9uZUVsZW1lbnQocmVuZGVyQWZ0ZXJUZXh0Qm94LmNhbGwodGhpcyksIG9uTW91c2VEb3duUHJvcCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXX0=
