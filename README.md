# autocomplete

> [React](https://facebook.github.io/react/) autocomplete component with an opinionated UX.

## Features

- **Allows retrieving of autocomplete results asynchronously from an API**
- **Responds to keyboard and mouse inputs the way you&rsquo;d expect**
  - <kbd>&uarr;</kbd> or <kbd>&darr;</kbd> &mdash; Highlight the previous or next autocomplete result, if any, and update the text box value with the value of the highlighted item
  - <kbd>Esc</kbd> &mdash; Unfocus the text box, and hide the autocomplete results, if any
  - <kbd>Enter</kbd> &mdash; Execute the <kbd>Enter</kbd> key down callback (namely, [`onEnterKeyDown`](#onenterkeydown))
  - *If the text box value changes* &mdash; Executes a callback (namely, [`getResultList`](#getresultlist)) to retrieve results for the text box value, and updates the autocomplete results. Execution of this callback is [appropriately debounced](#debounceduration) to avoid redundant API calls
  - *Clicking on an autocomplete result* &mdash; Sets the highlighted item to the item that was clicked, and executes the `onClick` callback (namely, [`onResultItemClick`](#onresultitemclick))
- **Flexible and extensible**
  - Exposes [class name hooks](#classnames) to allow styling of respective parts of the component
  - Exposes [assorted render callbacks](#renderbeforeresultlistrenderafterresultlistrenderbeforetextboxrenderaftertextbox) to insert elements at specific locations in the component

## Usage

The following is a barebones usage example with just the three required `props`, and assuming a `/search` endpoint.

```jsx
import AutoComplete from '@yuanqing/autocomplete';
import React from 'react';
import {render} from 'react-dom';

render((
  <AutoComplete
    getResultItemValue={function(resultItem) {
      return resultItem.value;
    }}
    getResultList={function(value) {
      return window.fetch(`/search?q=${value}`)
        .then((response) => {
          return response.json();
        });
    }}
    renderResultItem={function(resultItem) {
      const {
        link,
        value
      } = item;
      return <a href={link}>{value}</a>;
    }} />
), document.querySelector('.autoComplete'));
```

## Example

The [example](example/) in the repo is a working autocomplete search box that returns results from [Wikipedia](https://www.mediawiki.org/wiki/API:Main_page).

To run it, do:

```
$ git clone
$ npm install
$ npm install --global gulp
$ gulp example --open
```

## API

```js
import AutoComplete from '@yuanqing/autocomplete';
```

*N.B.* All the `props` that are functions are always called with their `this` context set to the `AutoComplete` instance.

### Required `props`

#### `getResultItemValue`

- Signature: `(resultItem)`

Function that yields the value from `resultItem` that is to be assigned to the text box when said `resultItem` is highlighted.

#### `getResultList`

- Signature: `(value)`

Function that returns a [Promise](https://github.com/stefanpenner/es6-promise) for an array of results that match the given `value`.

#### `renderResultItem`

- Signature: `(resultItem)`

Function that returns a [`ReactElement`](https://facebook.github.io/react/docs/top-level-api.html#react.createelement) to be rendered corresponding to the given `resultItem`.

### Optional `props`

#### `children`

The text box element.

- Default:

    ```html
    <input aria-autocomplete="both" role="combobox" type="text" />
    ```

#### `classNames`

An object literal of classes to assign to the various elements that compose the autocomplete.

- Default:

    ```js
    {
      // Class added to the currently highlighted result item
      isHighlighted: 'isHighlighted',

      // Class added to the outermost wrapper `div` when waiting for the `getResultList`
      // Promise to be fulfilled
      isLoading: 'isLoading',

      // Class of each result item
      resultItem: 'resultItem',

      // Class of the `div` that contains all the result items
      resultList: 'resultList',

      // Class of the root `div`
      root: 'root',

      // Class of the `div` that contains the text box (ie. the `children` prop)
      textBox: 'textBox'
    }
    ```

#### `debounceDuration`

`getResultList` is called if and only if the value of the text box has not changed for the specified `debounceDuration`.

- Default: `250`

#### `onEnterKeyDown`

Function that is called when we press the <kbd>Enter</kbd> key while the text box is focused.

- Default: `undefined`
- Signature: `(value, highlightedResultItem)`

#### `onResultItemClick`

Function that is called when we click on a result item.

- Default: `undefined`
- Signature: `(resultItem)`

#### `renderBeforeResultList`<br />`renderAfterResultList`<br />`renderBeforeTextBox`<br />`renderAfterTextBox`

Functions that return a `ReactElement` to be inserted at respective locations in the component.

- Default: `undefined`

## Installation

Install via [npm](https://npmjs.com):

```
$ npm i --save @yuanqing/autocomplete
```

## License

[MIT](LICENSE.md)
