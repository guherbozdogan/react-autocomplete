import fetchJsonp from 'fetch-jsonp';
import React from 'react';
import {render} from 'react-dom';
import Autocomplete from '../src';

const classNames = {
  isHighlighted: 'isHighlighted',
  isLoading: 'isLoading',
  resultItem: 'resultItem',
  resultList: 'resultList',
  root: 'root',
  textBox: 'textBox'
};

function getResultList(value) {
  return fetchJsonp('http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + value)
    .then((response) => {
      return response.json();
    }).then((json) => {
      const [, values, , links] = json;
      return values.map((value, index) => {
        return {
          value,
          link: links[index]
        };
      });
    });
}

function getResultItemValue(item) {
  return item.value;
}

function onEnterKeyDown(value, item) {
  if (value || item) {
    window.location.href = item ? item.link : `http://en.wikipedia.org/wiki/Special:Search?search=${value}`;
  }
}

function renderAfterTextBox() {
  return (
    <div className="button">
      <button onClick={this.handleEnterKeyDown}>Search</button>
    </div>
  );
}

function renderResultItem(item) {
  const {
    link,
    value
  } = item;
  return <a href={link}>{value}</a>;
}

function noop() {}

render((
  <Autocomplete
    classNames={classNames}
    debounceDuration={250}
    getResultItemValue={getResultItemValue}
    getResultList={getResultList}
    onEnterKeyDown={onEnterKeyDown}
    onResultItemClick={noop}
    // renderAfterResultList={}
    renderAfterTextBox={renderAfterTextBox}
    // renderBeforeResultList={}
    // renderBeforeTextBox={}
    renderResultItem={renderResultItem}
    shouldCacheResultList>
    <input type="text" placeholder="Search Wikipedia&hellip;" />
  </Autocomplete>
), document.querySelector('.app'));
