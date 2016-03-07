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
  return (0, _fetchJsonp2.default)('http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + value).then(function (response) {
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
    window.location.href = resultItem ? resultItem.link : 'http://en.wikipedia.org/wiki/Special:Search?search=' + value;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJleGFtcGxlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NsYXNzbmFtZXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZmV0Y2gtanNvbnAvYnVpbGQvZmV0Y2gtanNvbnAuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0tBLElBQU0sYUFBYTtBQUNqQixpQkFBZSxlQUFmO0FBQ0EsYUFBVyxXQUFYO0FBQ0EsY0FBWSxZQUFaO0FBQ0EsY0FBWSxZQUFaO0FBQ0EsUUFBTSxNQUFOO0FBQ0EsV0FBUyxTQUFUO0NBTkk7O0FBU04sU0FBUyxhQUFULENBQXVCLEtBQXZCLEVBQThCO0FBQzVCLFNBQU8sc0dBQXFGLEtBQXJGLEVBQ0osSUFESSxDQUNDLFVBQUMsUUFBRCxFQUFjO0FBQ2xCLFdBQU8sU0FBUyxJQUFULEVBQVAsQ0FEa0I7R0FBZCxDQURELENBR0YsSUFIRSxDQUdHLFVBQUMsSUFBRCxFQUFVOytCQUNZLFNBRFo7O1FBQ1Asa0JBRE87UUFDRyxpQkFESDs7QUFFaEIsV0FBTyxPQUFPLEdBQVAsQ0FBVyxVQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWtCO0FBQ2xDLGFBQU87QUFDTCxvQkFESztBQUVMLGNBQU0sTUFBTSxLQUFOLENBQU47T0FGRixDQURrQztLQUFsQixDQUFsQixDQUZnQjtHQUFWLENBSFYsQ0FENEI7Q0FBOUI7O0FBZUEsU0FBUyxrQkFBVCxDQUE0QixVQUE1QixFQUF3QztBQUN0QyxTQUFPLFdBQVcsS0FBWCxDQUQrQjtDQUF4Qzs7QUFJQSxTQUFTLGNBQVQsQ0FBd0IsS0FBeEIsRUFBK0IsVUFBL0IsRUFBMkM7QUFDekMsTUFBSSxTQUFTLFVBQVQsRUFBcUI7QUFDdkIsV0FBTyxRQUFQLENBQWdCLElBQWhCLEdBQXVCLGFBQWEsV0FBVyxJQUFY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SyxVQUFMO0FBQ0EsVUFBSyxNQUFMLEVBRkYsQ0FERjtBQUtBLGNBQVk7QUFDVixtQkFBZSxlQUFmO0FBQ0EsZUFBVyxXQUFYO0FBQ0EsZ0JBQVksWUFBWjtBQUNBLGdCQUFZLFlBQVo7QUFDQSxVQUFNLE1BQU47QUFDQSxhQUFTLFNBQVQ7R0FORjtBQVFBLG9CQUFrQixHQUFsQjtBQUNBLHlCQUF1QixJQUF2Qjs7QUFoQ2lCLGFBbUNaLGVBQWU7QUFDcEIsb0JBQWtCLFFBQWxCO0FBQ0EsZ0JBQWMsRUFBZDtBQUNBLGFBQVcsS0FBWDtBQUNBLGlCQUFlLEtBQWY7QUFDQSxjQUFZLEVBQVo7QUFDQSxTQUFPLEVBQVA7O2tCQXpDaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IGZldGNoSnNvbnAgZnJvbSAnZmV0Y2gtanNvbnAnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7cmVuZGVyfSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IEF1dG9Db21wbGV0ZSBmcm9tICcuLi9zcmMnO1xuXG5jb25zdCBjbGFzc05hbWVzID0ge1xuICBpc0hpZ2hsaWdodGVkOiAnaXNIaWdobGlnaHRlZCcsXG4gIGlzTG9hZGluZzogJ2lzTG9hZGluZycsXG4gIHJlc3VsdEl0ZW06ICdyZXN1bHRJdGVtJyxcbiAgcmVzdWx0TGlzdDogJ3Jlc3VsdExpc3QnLFxuICByb290OiAncm9vdCcsXG4gIHRleHRCb3g6ICd0ZXh0Qm94J1xufTtcblxuZnVuY3Rpb24gZ2V0UmVzdWx0TGlzdCh2YWx1ZSkge1xuICByZXR1cm4gZmV0Y2hKc29ucChgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvdy9hcGkucGhwP2FjdGlvbj1vcGVuc2VhcmNoJmZvcm1hdD1qc29uJnNlYXJjaD0ke3ZhbHVlfWApXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgIH0pLnRoZW4oKGpzb24pID0+IHtcbiAgICAgIGNvbnN0IFssIHZhbHVlcywgLCBsaW5rc10gPSBqc29uO1xuICAgICAgcmV0dXJuIHZhbHVlcy5tYXAoKHZhbHVlLCBpbmRleCkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgIGxpbms6IGxpbmtzW2luZGV4XVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFJlc3VsdEl0ZW1WYWx1ZShyZXN1bHRJdGVtKSB7XG4gIHJldHVybiByZXN1bHRJdGVtLnZhbHVlO1xufVxuXG5mdW5jdGlvbiBvbkVudGVyS2V5RG93bih2YWx1ZSwgcmVzdWx0SXRlbSkge1xuICBpZiAodmFsdWUgfHwgcmVzdWx0SXRlbSkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVzdWx0SXRlbSA/IHJlc3VsdEl0ZW0ubGluayA6IGBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NwZWNpYWw6U2VhcmNoP3NlYXJjaD0ke3ZhbHVlfWA7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyQWZ0ZXJUZXh0Qm94KCkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiYnV0dG9uXCI+XG4gICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuaGFuZGxlRW50ZXJLZXlEb3dufT5TZWFyY2g8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUmVzdWx0SXRlbShyZXN1bHRJdGVtKSB7XG4gIGNvbnN0IHtcbiAgICBsaW5rLFxuICAgIHZhbHVlXG4gIH0gPSByZXN1bHRJdGVtO1xuICByZXR1cm4gPGEgaHJlZj17bGlua30+e3ZhbHVlfTwvYT47XG59XG5cbnJlbmRlcigoXG4gIDxBdXRvQ29tcGxldGVcbiAgICBjbGFzc05hbWVzPXtjbGFzc05hbWVzfVxuICAgIGRlYm91bmNlRHVyYXRpb249ezI1MH1cbiAgICBnZXRSZXN1bHRJdGVtVmFsdWU9e2dldFJlc3VsdEl0ZW1WYWx1ZX1cbiAgICBnZXRSZXN1bHRMaXN0PXtnZXRSZXN1bHRMaXN0fVxuICAgIG9uRW50ZXJLZXlEb3duPXtvbkVudGVyS2V5RG93bn1cbiAgICByZW5kZXJBZnRlclRleHRCb3g9e3JlbmRlckFmdGVyVGV4dEJveH1cbiAgICByZW5kZXJSZXN1bHRJdGVtPXtyZW5kZXJSZXN1bHRJdGVtfVxuICAgIHNob3VsZENhY2hlUmVzdWx0TGlzdD5cbiAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIlNlYXJjaCBXaWtpcGVkaWEmaGVsbGlwO1wiIC8+XG4gIDwvQXV0b0NvbXBsZXRlPlxuKSwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLkF1dG9Db21wbGV0ZScpKTtcbiIsIi8qIVxuICBDb3B5cmlnaHQgKGMpIDIwMTYgSmVkIFdhdHNvbi5cbiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpLCBzZWVcbiAgaHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuKi9cbi8qIGdsb2JhbCBkZWZpbmUgKi9cblxuKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBoYXNPd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuXHRmdW5jdGlvbiBjbGFzc05hbWVzICgpIHtcblx0XHR2YXIgY2xhc3NlcyA9IFtdO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG5cdFx0XHRpZiAoIWFyZykgY29udGludWU7XG5cblx0XHRcdHZhciBhcmdUeXBlID0gdHlwZW9mIGFyZztcblxuXHRcdFx0aWYgKGFyZ1R5cGUgPT09ICdzdHJpbmcnIHx8IGFyZ1R5cGUgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdGNsYXNzZXMucHVzaChhcmcpO1xuXHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcblx0XHRcdFx0Y2xhc3Nlcy5wdXNoKGNsYXNzTmFtZXMuYXBwbHkobnVsbCwgYXJnKSk7XG5cdFx0XHR9IGVsc2UgaWYgKGFyZ1R5cGUgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdGZvciAodmFyIGtleSBpbiBhcmcpIHtcblx0XHRcdFx0XHRpZiAoaGFzT3duLmNhbGwoYXJnLCBrZXkpICYmIGFyZ1trZXldKSB7XG5cdFx0XHRcdFx0XHRjbGFzc2VzLnB1c2goa2V5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gY2xhc3Nlcy5qb2luKCcgJyk7XG5cdH1cblxuXHRpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGNsYXNzTmFtZXM7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIHJlZ2lzdGVyIGFzICdjbGFzc25hbWVzJywgY29uc2lzdGVudCB3aXRoIG5wbSBwYWNrYWdlIG5hbWVcblx0XHRkZWZpbmUoJ2NsYXNzbmFtZXMnLCBbXSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGNsYXNzTmFtZXM7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LmNsYXNzTmFtZXMgPSBjbGFzc05hbWVzO1xuXHR9XG59KCkpO1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbJ2V4cG9ydHMnLCAnbW9kdWxlJ10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIGZhY3RvcnkoZXhwb3J0cywgbW9kdWxlKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbW9kID0ge1xuICAgICAgZXhwb3J0czoge31cbiAgICB9O1xuICAgIGZhY3RvcnkobW9kLmV4cG9ydHMsIG1vZCk7XG4gICAgZ2xvYmFsLmZldGNoSnNvbnAgPSBtb2QuZXhwb3J0cztcbiAgfVxufSkodGhpcywgZnVuY3Rpb24gKGV4cG9ydHMsIG1vZHVsZSkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAganNvbnBDYWxsYmFjazogJ2NhbGxiYWNrJyxcbiAgICBqc29ucENhbGxiYWNrRnVuY3Rpb246IG51bGxcbiAgfTtcblxuICBmdW5jdGlvbiBnZW5lcmF0ZUNhbGxiYWNrRnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdqc29ucF8nICsgRGF0ZS5ub3coKSArICdfJyArIE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogMTAwMDAwKTtcbiAgfVxuXG4gIC8vIEtub3duIGlzc3VlOiBXaWxsIHRocm93ICdVbmNhdWdodCBSZWZlcmVuY2VFcnJvcjogY2FsbGJhY2tfKioqIGlzIG5vdCBkZWZpbmVkJyBlcnJvciBpZiByZXF1ZXN0IHRpbWVvdXRcbiAgZnVuY3Rpb24gY2xlYXJGdW5jdGlvbihmdW5jdGlvbk5hbWUpIHtcbiAgICAvLyBJRTggdGhyb3dzIGFuIGV4Y2VwdGlvbiB3aGVuIHlvdSB0cnkgdG8gZGVsZXRlIGEgcHJvcGVydHkgb24gd2luZG93XG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTgyNDIyOC83NTEwODlcbiAgICB0cnkge1xuICAgICAgZGVsZXRlIHdpbmRvd1tmdW5jdGlvbk5hbWVdO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHdpbmRvd1tmdW5jdGlvbk5hbWVdID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVNjcmlwdChzY3JpcHRJZCkge1xuICAgIHZhciBzY3JpcHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzY3JpcHRJZCk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICB9XG5cbiAgdmFyIGZldGNoSnNvbnAgPSBmdW5jdGlvbiBmZXRjaEpzb25wKHVybCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHZhciB0aW1lb3V0ID0gb3B0aW9ucy50aW1lb3V0ICE9IG51bGwgPyBvcHRpb25zLnRpbWVvdXQgOiBkZWZhdWx0T3B0aW9ucy50aW1lb3V0O1xuICAgIHZhciBqc29ucENhbGxiYWNrID0gb3B0aW9ucy5qc29ucENhbGxiYWNrICE9IG51bGwgPyBvcHRpb25zLmpzb25wQ2FsbGJhY2sgOiBkZWZhdWx0T3B0aW9ucy5qc29ucENhbGxiYWNrO1xuXG4gICAgdmFyIHRpbWVvdXRJZCA9IHVuZGVmaW5lZDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgY2FsbGJhY2tGdW5jdGlvbiA9IG9wdGlvbnMuanNvbnBDYWxsYmFja0Z1bmN0aW9uIHx8IGdlbmVyYXRlQ2FsbGJhY2tGdW5jdGlvbigpO1xuXG4gICAgICB3aW5kb3dbY2FsbGJhY2tGdW5jdGlvbl0gPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgb2s6IHRydWUsXG4gICAgICAgICAgLy8ga2VlcCBjb25zaXN0ZW50IHdpdGggZmV0Y2ggQVBJXG4gICAgICAgICAganNvbjogZnVuY3Rpb24ganNvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRpbWVvdXRJZCkgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgICAgcmVtb3ZlU2NyaXB0KGpzb25wQ2FsbGJhY2sgKyAnXycgKyBjYWxsYmFja0Z1bmN0aW9uKTtcblxuICAgICAgICBjbGVhckZ1bmN0aW9uKGNhbGxiYWNrRnVuY3Rpb24pO1xuICAgICAgfTtcblxuICAgICAgLy8gQ2hlY2sgaWYgdGhlIHVzZXIgc2V0IHRoZWlyIG93biBwYXJhbXMsIGFuZCBpZiBub3QgYWRkIGEgPyB0byBzdGFydCBhIGxpc3Qgb2YgcGFyYW1zXG4gICAgICB1cmwgKz0gdXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJic7XG5cbiAgICAgIHZhciBqc29ucFNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAganNvbnBTY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCB1cmwgKyBqc29ucENhbGxiYWNrICsgJz0nICsgY2FsbGJhY2tGdW5jdGlvbik7XG4gICAgICBqc29ucFNjcmlwdC5pZCA9IGpzb25wQ2FsbGJhY2sgKyAnXycgKyBjYWxsYmFja0Z1bmN0aW9uO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChqc29ucFNjcmlwdCk7XG5cbiAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdKU09OUCByZXF1ZXN0IHRvICcgKyB1cmwgKyAnIHRpbWVkIG91dCcpKTtcblxuICAgICAgICBjbGVhckZ1bmN0aW9uKGNhbGxiYWNrRnVuY3Rpb24pO1xuICAgICAgICByZW1vdmVTY3JpcHQoanNvbnBDYWxsYmFjayArICdfJyArIGNhbGxiYWNrRnVuY3Rpb24pO1xuICAgICAgfSwgdGltZW91dCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gZXhwb3J0IGFzIGdsb2JhbCBmdW5jdGlvblxuICAvKlxuICBsZXQgbG9jYWw7XG4gIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgIGxvY2FsID0gZ2xvYmFsO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICAgIGxvY2FsID0gc2VsZjtcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWwgPSBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgfVxuICB9XG4gIFxuICBsb2NhbC5mZXRjaEpzb25wID0gZmV0Y2hKc29ucDtcbiAgKi9cblxuICBtb2R1bGUuZXhwb3J0cyA9IGZldGNoSnNvbnA7XG59KTsiLCJpbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBSZWFjdCwge2Nsb25lRWxlbWVudCwgQ29tcG9uZW50LCBQcm9wVHlwZXN9IGZyb20gJ3JlYWN0JztcblxuLy8gSW5kZXggdGhhdCBpbmRpY2F0ZXMgdGhhdCBub25lIG9mIHRoZSBhdXRvY29tcGxldGUgcmVzdWx0cyBpc1xuLy8gY3VycmVudGx5IGhpZ2hsaWdodGVkLlxuY29uc3QgU0VOVElORUwgPSAtMTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXV0b0NvbXBsZXRlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBjaGlsZHJlbjogUHJvcFR5cGVzLm5vZGUsXG4gICAgY2xhc3NOYW1lczogUHJvcFR5cGVzLm9iamVjdE9mKFByb3BUeXBlcy5zdHJpbmcpLFxuICAgIGRlYm91bmNlRHVyYXRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gICAgZ2V0UmVzdWx0SXRlbVZhbHVlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIGdldFJlc3VsdExpc3Q6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgb25FbnRlcktleURvd246IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uUmVzdWx0SXRlbUNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICByZW5kZXJCZWZvcmVUZXh0Qm94OiBQcm9wVHlwZXMuZnVuYyxcbiAgICByZW5kZXJBZnRlclRleHRCb3g6IFByb3BUeXBlcy5mdW5jLFxuICAgIHJlbmRlckJlZm9yZVJlc3VsdExpc3Q6IFByb3BUeXBlcy5mdW5jLFxuICAgIHJlbmRlckFmdGVyUmVzdWx0TGlzdDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgcmVuZGVyUmVzdWx0SXRlbTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICBzaG91bGRDYWNoZVJlc3VsdExpc3Q6IFByb3BUeXBlcy5ib29sXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBjaGlsZHJlbjogKFxuICAgICAgPGlucHV0IGFyaWEtYXV0b2NvbXBsZXRlPVwiYm90aFwiXG4gICAgICAgIHJvbGU9XCJjb21ib2JveFwiXG4gICAgICAgIHR5cGU9XCJ0ZXh0XCIgLz5cbiAgICApLFxuICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgIGlzSGlnaGxpZ2h0ZWQ6ICdpc0hpZ2hsaWdodGVkJyxcbiAgICAgIGlzTG9hZGluZzogJ2lzTG9hZGluZycsXG4gICAgICByZXN1bHRJdGVtOiAncmVzdWx0SXRlbScsXG4gICAgICByZXN1bHRMaXN0OiAncmVzdWx0TGlzdCcsXG4gICAgICByb290OiAncm9vdCcsXG4gICAgICB0ZXh0Qm94OiAndGV4dEJveCdcbiAgICB9LFxuICAgIGRlYm91bmNlRHVyYXRpb246IDI1MCxcbiAgICBzaG91bGRDYWNoZVJlc3VsdExpc3Q6IHRydWVcbiAgfTtcblxuICBzdGF0aWMgaW5pdGlhbFN0YXRlID0ge1xuICAgIGhpZ2hsaWdodGVkSW5kZXg6IFNFTlRJTkVMLFxuICAgIGluaXRpYWxWYWx1ZTogJycsXG4gICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICBpc01lbnVWaXNpYmxlOiBmYWxzZSxcbiAgICByZXN1bHRMaXN0OiBbXSxcbiAgICB2YWx1ZTogJydcbiAgfTtcblxuICBzdGF0ZSA9IEF1dG9Db21wbGV0ZS5pbml0aWFsU3RhdGU7XG5cbiAgLy8gUmV0dXJucyB0aGUgdmFsdWUgb2YgYHN0YXRlLmhpZ2hsaWdodGVkSW5kZXhgIGRlY3JlbWVudGVkIGJ5IDEuXG4gIC8vIElmIG5lY2Vzc2FyeSwgd3JhcHMgYXJvdW5kIHRvIHRoZSBsYXN0IGl0ZW0sIG9yIHJldmVydHMgdG8gYFNFTlRJTkVMYFxuICAvLyAoaWUuIG5vIGl0ZW0gaGlnaGxpZ2h0ZWQpLlxuICBkZWNyZW1lbnRIaWdobGlnaHRlZEluZGV4ID0gKCkgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICByZXN1bHRMaXN0XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgc3dpdGNoIChoaWdobGlnaHRlZEluZGV4KSB7XG4gICAgICBjYXNlIFNFTlRJTkVMOlxuICAgICAgICByZXR1cm4gcmVzdWx0TGlzdC5sZW5ndGggLSAxO1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gU0VOVElORUw7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gaGlnaGxpZ2h0ZWRJbmRleCAtIDE7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIHZhbHVlIG9mIGBzdGF0ZS5oaWdobGlnaHRlZEluZGV4YCBpbmNyZW1lbnRlZCBieSAxLlxuICAvLyBJZiBuZWNlc3NhcnksIHJldmVydHMgdG8gYFNFTlRJTkVMYCAoaWUuIG5vIGl0ZW0gaGlnaGxpZ2h0ZWQpLlxuICBpbmNyZW1lbnRIaWdobGlnaHRlZEluZGV4ID0gKCkgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICByZXN1bHRMaXN0XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGhpZ2hsaWdodGVkSW5kZXggPT09IHJlc3VsdExpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIFNFTlRJTkVMO1xuICAgIH1cbiAgICByZXR1cm4gaGlnaGxpZ2h0ZWRJbmRleCArIDE7XG4gIH07XG5cbiAgLy8gU2V0IHRoZSBjdXJyZW50IGhpZ2hsaWdodGVkIGl0ZW0gdG8gdGhlIGl0ZW0gYXQgdGhlIGdpdmVuXG4gIC8vIGBoaWdobGlnaHRlZEluZGV4YC4gU2V0IHRoZSB0ZXh0IGJveCdzIHZhbHVlIHRvIHRoYXQgb2YgdGhlIG5ld1xuICAvLyBoaWdobGlnaHRlZCBpdGVtLlxuICBzZXRIaWdobGlnaHRlZEl0ZW0gPSAoaGlnaGxpZ2h0ZWRJbmRleCkgPT4ge1xuICAgIGNvbnN0IHtnZXRSZXN1bHRJdGVtVmFsdWV9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBpbml0aWFsVmFsdWUsXG4gICAgICByZXN1bHRMaXN0XG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgaXNBbnlJdGVtSGlnaGxpZ2h0ZWQgPSBoaWdobGlnaHRlZEluZGV4ICE9PSBTRU5USU5FTDtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICB2YWx1ZTogaXNBbnlJdGVtSGlnaGxpZ2h0ZWRcbiAgICAgICAgPyBnZXRSZXN1bHRJdGVtVmFsdWUuY2FsbCh0aGlzLCByZXN1bHRMaXN0W2hpZ2hsaWdodGVkSW5kZXhdKVxuICAgICAgICA6IGluaXRpYWxWYWx1ZVxuICAgIH0pO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaXNBbnlJdGVtSGlnaGxpZ2h0ZWRcbiAgICAgID8gdGhpcy5zZWxlY3RUZXh0Qm94VmFsdWVcbiAgICAgIDogdGhpcy5tb3ZlVGV4dEJveENhcmV0VG9FbmQpO1xuICB9O1xuXG4gIC8vIFNlbGVjdCBhbGwgdGhlIHRleHQgaW4gdGhlIHRleHQgYm94LlxuICBzZWxlY3RUZXh0Qm94VmFsdWUgPSAoKSA9PiB7XG4gICAgY29uc3Qge3ZhbHVlfSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5yZWZzLnRleHRCb3guc2V0U2VsZWN0aW9uUmFuZ2UoMCwgdmFsdWUubGVuZ3RoKTtcbiAgfTtcblxuICAvLyBNb3ZlIHRoZSBjYXJldCBpbiB0aGUgdGV4dCBib3ggdG8gdGhlIGVuZCBvZiB0aGUgdGV4dCBib3guXG4gIG1vdmVUZXh0Qm94Q2FyZXRUb0VuZCA9ICgpID0+IHtcbiAgICBjb25zdCB7dmFsdWV9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG4gICAgdGhpcy5yZWZzLnRleHRCb3guc2V0U2VsZWN0aW9uUmFuZ2UobGVuZ3RoLCBsZW5ndGgpO1xuICB9O1xuXG4gIC8vIEhpZGUgdGhlIHJlc3VsdCBtZW51LlxuICBoaWRlUmVzdWx0TWVudSA9ICgpID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGlzTWVudVZpc2libGU6IGZhbHNlXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gU2hvdyB0aGUgcmVzdWx0IG1lbnUuXG4gIHNob3dSZXN1bHRNZW51ID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNNZW51VmlzaWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIFNldCBgc3RhdGUucmVzdWx0TGlzdGAgdG8gdGhlIGdpdmVuIGByZXN1bHRMaXN0YCwgc2V0IHRvIG5vdCBsb2FkaW5nLFxuICAvLyBhbmQgc2hvdyB0aGUgcmVzdWx0cy5cbiAgcmVjZWl2ZVJlc3VsdExpc3QgPSAocmVzdWx0TGlzdCkgPT4ge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgIHJlc3VsdExpc3RcbiAgICB9KTtcbiAgICB0aGlzLnNob3dSZXN1bHRNZW51KCk7XG4gIH07XG5cbiAgLy8gVXBkYXRlIGBzdGF0ZS5yZXN1bHRMaXN0YCBiYXNlZCBvbiB0aGUgZ2l2ZW4gYHZhbHVlYC5cbiAgLy8gLSBDYWNoZXMgcmVzdWx0cyBmb3IgYHN0YXRlLnJlc3VsdExpc3RgIGluIGEgYGNhY2hlYDsgcmV0dXJuc1xuICAvLyAgIGltbWVkaWF0ZWx5IGlmIHRoZSByZXN1bHRzIGZvciBgdmFsdWVgIGlzIGFscmVhZHkgaW4gYGNhY2hlYC5cbiAgLy8gLSBcIlJhdGUtbGltaXRlZFwiIHRvIHByZXZlbnQgdW5uZWNlc3NhcnkgY2FsbHMgdG8gYGdldFJlc3VsdExpc3RgLlxuICAvLyAgIE9ubHkgY2FsbHMgYGdldFJlc3VsdExpc3RgIGlmIGB1cGRhdGVSZXN1bHRMaXN0YCBoYXMgbm90IGJlZW5cbiAgLy8gICBjYWxsZWQgZm9yIGF0IGxlYXN0IGBkZWJvdW5jZUR1cmF0aW9uYC5cbiAgdXBkYXRlUmVzdWx0TGlzdCA9ICgoKSA9PiB7XG4gICAgbGV0IHRpbWVvdXQgPSBudWxsO1xuICAgIGxldCBjYWNoZSA9IHt9O1xuICAgIHJldHVybiAodmFsdWUpID0+IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgZGVib3VuY2VEdXJhdGlvbixcbiAgICAgICAgZ2V0UmVzdWx0TGlzdCxcbiAgICAgICAgc2hvdWxkQ2FjaGVSZXN1bHRMaXN0XG4gICAgICB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIGNvbnN0IHJlc3VsdExpc3QgPSBzaG91bGRDYWNoZVJlc3VsdExpc3QgJiYgY2FjaGVbdmFsdWVdO1xuICAgICAgaWYgKHJlc3VsdExpc3QpIHtcbiAgICAgICAgdGhpcy5yZWNlaXZlUmVzdWx0TGlzdChyZXN1bHRMaXN0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgaXNMb2FkaW5nOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBnZXRSZXN1bHRMaXN0LmNhbGwodGhpcywgdmFsdWUpLnRoZW4oKHJlc3VsdExpc3QpID0+IHtcbiAgICAgICAgICBpZiAoc2hvdWxkQ2FjaGVSZXN1bHRMaXN0KSB7XG4gICAgICAgICAgICBjYWNoZVt2YWx1ZV0gPSByZXN1bHRMaXN0O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnJlY2VpdmVSZXN1bHRMaXN0KHJlc3VsdExpc3QpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIGRlYm91bmNlRHVyYXRpb24pO1xuICAgIH07XG4gIH0pKCk7XG5cbiAgLy8gUmVzZXQgdG8gdGhlIGluaXRpYWwgc3RhdGUgaWUuIGVtcHR5IHRleHQgYm94IHdpdGggbm8gcmVzdWx0cy5cbiAgcmVzZXQgPSAoKSA9PiB7XG4gICAgdGhpcy5zZXRTdGF0ZShBdXRvQ29tcGxldGUuaW5pdGlhbFN0YXRlKTtcbiAgfTtcblxuICBrZXlEb3duSGFuZGxlcnMgPSB7XG4gICAgQXJyb3dEb3duOiAoKSA9PiB7XG4gICAgICB0aGlzLnNldEhpZ2hsaWdodGVkSXRlbSh0aGlzLmluY3JlbWVudEhpZ2hsaWdodGVkSW5kZXgoKSk7XG4gICAgfSxcbiAgICBBcnJvd1VwOiAoKSA9PiB7XG4gICAgICB0aGlzLnNldEhpZ2hsaWdodGVkSXRlbSh0aGlzLmRlY3JlbWVudEhpZ2hsaWdodGVkSW5kZXgoKSk7XG4gICAgfSxcbiAgICBFbnRlcjogKCkgPT4ge1xuICAgICAgdGhpcy5oYW5kbGVFbnRlcktleURvd24oKTtcbiAgICB9LFxuICAgIEVzY2FwZTogKCkgPT4ge1xuICAgICAgdGhpcy5oaWRlUmVzdWx0TWVudSgpO1xuICAgICAgdGhpcy5yZWZzLnRleHRCb3guYmx1cigpO1xuICAgIH1cbiAgfTtcblxuICBoYW5kbGVLZXlEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleCxcbiAgICAgIHZhbHVlXG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qga2V5RG93bkhhbmRsZXIgPSB0aGlzLmtleURvd25IYW5kbGVyc1tldmVudC5rZXldO1xuICAgIGlmIChrZXlEb3duSGFuZGxlcikge1xuICAgICAgLy8gU2F2ZSB0aGUgaW5pdGlhbCB1c2VyIGlucHV0IHZhbHVlLlxuICAgICAgaWYgKGhpZ2hsaWdodGVkSW5kZXggPT09IFNFTlRJTkVMKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGluaXRpYWxWYWx1ZTogdmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBrZXlEb3duSGFuZGxlcihldmVudCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIE5vdGUgdGhhdCBgaGFuZGxlQ2hhbmdlYCBpcyBvbmx5IGNhbGxlZCBpZiB0aGUgdGV4dCBib3ggdmFsdWUgaGFzIGFjdHVhbGx5XG4gIC8vIGNoYW5nZWQuIEl0IGlzIG5vdCBjYWxsZWQgd2hlbiB3ZSBoaXQgdGhlIHVwL2Rvd24gYXJyb3dzLlxuICBoYW5kbGVDaGFuZ2UgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICBpZiAodmFsdWUudHJpbSgpID09PSAnJykge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXg6IFNFTlRJTkVMLFxuICAgICAgaW5pdGlhbFZhbHVlOiB2YWx1ZSxcbiAgICAgIHZhbHVlXG4gICAgfSk7XG4gICAgdGhpcy51cGRhdGVSZXN1bHRMaXN0KHZhbHVlKTtcbiAgfTtcblxuICBoYW5kbGVCbHVyID0gKCkgPT4ge1xuICAgIHRoaXMuaGlkZVJlc3VsdE1lbnUoKTtcbiAgfTtcblxuICBoYW5kbGVFbnRlcktleURvd24gPSAoKSA9PiB7XG4gICAgY29uc3Qge29uRW50ZXJLZXlEb3dufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgaGlnaGxpZ2h0ZWRJbmRleCxcbiAgICAgIHJlc3VsdExpc3QsXG4gICAgICB2YWx1ZVxuICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgIG9uRW50ZXJLZXlEb3duICYmIG9uRW50ZXJLZXlEb3duLmNhbGwodGhpcywgdmFsdWUsIHJlc3VsdExpc3RbaGlnaGxpZ2h0ZWRJbmRleF0pO1xuICB9O1xuXG4gIGhhbmRsZUZvY3VzID0gKCkgPT4ge1xuICAgIHRoaXMuc2hvd1Jlc3VsdE1lbnUoKTtcbiAgfTtcblxuICBoYW5kbGVSZXN1bHRJdGVtQ2xpY2sgPSAoaW5kZXgpID0+IHtcbiAgICBjb25zdCB7cmVzdWx0TGlzdH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHtcbiAgICAgIGdldFJlc3VsdEl0ZW1WYWx1ZSxcbiAgICAgIG9uUmVzdWx0SXRlbUNsaWNrXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgcmVzdWx0ID0gcmVzdWx0TGlzdFtpbmRleF07XG4gICAgb25SZXN1bHRJdGVtQ2xpY2sgJiYgb25SZXN1bHRJdGVtQ2xpY2soZ2V0UmVzdWx0SXRlbVZhbHVlLmNhbGwodGhpcywgcmVzdWx0KSwgcmVzdWx0KTtcbiAgICB0aGlzLnNldEhpZ2hsaWdodGVkSXRlbShpbmRleCk7XG4gIH07XG5cbiAgLy8gUHJldmVudCB0aGUgdGV4dCBib3ggZnJvbSBsb3NpbmcgZm9jdXMgd2hlbiB3ZSBjbGljayBvdXRzaWRlIHRoZSB0ZXh0XG4gIC8vIGJveCAoZWcuIGNsaWNrIG9uIHRoZSByZXN1bHQgbWVudSkuXG4gIGhhbmRsZU1vdXNlRG93biA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgY2xhc3NOYW1lcyxcbiAgICAgIHJlbmRlckJlZm9yZVRleHRCb3gsXG4gICAgICByZW5kZXJBZnRlclRleHRCb3gsXG4gICAgICByZW5kZXJCZWZvcmVSZXN1bHRMaXN0LFxuICAgICAgcmVuZGVyQWZ0ZXJSZXN1bHRMaXN0LFxuICAgICAgcmVuZGVyUmVzdWx0SXRlbVxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIGhpZ2hsaWdodGVkSW5kZXgsXG4gICAgICBpc0xvYWRpbmcsXG4gICAgICBpc01lbnVWaXNpYmxlLFxuICAgICAgcmVzdWx0TGlzdCxcbiAgICAgIHZhbHVlXG4gICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qgb25Nb3VzZURvd25Qcm9wID0ge1xuICAgICAgb25Nb3VzZURvd246IHRoaXMuaGFuZGxlTW91c2VEb3duXG4gICAgfTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoY2xhc3NOYW1lcy5yb290LCBpc0xvYWRpbmcgJiYgY2xhc3NOYW1lcy5pc0xvYWRpbmcpfT5cbiAgICAgICAge3JlbmRlckJlZm9yZVRleHRCb3ggJiZcbiAgICAgICAgICBjbG9uZUVsZW1lbnQocmVuZGVyQmVmb3JlVGV4dEJveC5jYWxsKHRoaXMpLCBvbk1vdXNlRG93blByb3ApfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcy50ZXh0Qm94fT5cbiAgICAgICAgICB7Y2xvbmVFbGVtZW50KGNoaWxkcmVuLCB7XG4gICAgICAgICAgICBvbkJsdXI6IHRoaXMuaGFuZGxlQmx1cixcbiAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUNoYW5nZSxcbiAgICAgICAgICAgIG9uRm9jdXM6IHRoaXMuaGFuZGxlRm9jdXMsXG4gICAgICAgICAgICBvbktleURvd246IHRoaXMuaGFuZGxlS2V5RG93bixcbiAgICAgICAgICAgIHJlZjogJ3RleHRCb3gnLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgfSl9XG4gICAgICAgICAge2lzTWVudVZpc2libGUgJiYgcmVzdWx0TGlzdC5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcy5yZXN1bHRMaXN0fVxuICAgICAgICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVNb3VzZURvd259PlxuICAgICAgICAgICAgICB7cmVuZGVyQmVmb3JlUmVzdWx0TGlzdCAmJiByZW5kZXJCZWZvcmVSZXN1bHRMaXN0LmNhbGwodGhpcyl9XG4gICAgICAgICAgICAgIHtyZXN1bHRMaXN0Lm1hcCgocmVzdWx0SXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoY2xhc3NOYW1lcy5yZXN1bHRJdGVtLCBpbmRleCA9PT0gaGlnaGxpZ2h0ZWRJbmRleCAmJiBjbGFzc05hbWVzLmlzSGlnaGxpZ2h0ZWQpfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e2luZGV4fVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZVJlc3VsdEl0ZW1DbGljay5iaW5kKHRoaXMsIGluZGV4KX0+XG4gICAgICAgICAgICAgICAgICAgIHtyZW5kZXJSZXN1bHRJdGVtLmNhbGwodGhpcywgcmVzdWx0SXRlbSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAge3JlbmRlckFmdGVyUmVzdWx0TGlzdCAmJiByZW5kZXJBZnRlclJlc3VsdExpc3QuY2FsbCh0aGlzKX1cbiAgICAgICAgICAgIDwvZGl2Pn1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtyZW5kZXJBZnRlclRleHRCb3ggJiZcbiAgICAgICAgICBjbG9uZUVsZW1lbnQocmVuZGVyQWZ0ZXJUZXh0Qm94LmNhbGwodGhpcyksIG9uTW91c2VEb3duUHJvcCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXX0=
