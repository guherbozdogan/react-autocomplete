import fetchJsonp from 'fetch-jsonp';
import React from 'react';
import {render} from 'react-dom';
import AutoComplete from '../src';

const classNames = {
  isHighlighted: 'isHighlighted',
  isLoading: 'isLoading',
  resultItem: 'resultItem',
  resultList: 'resultList',
  root: 'root',
  textBox: 'textBox'
};

function getResultList(value) {
  return fetchJsonp(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${value}`)
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

function getResultItemValue(resultItem) {
  return resultItem.value;
}

function onEnterKeyDown(value, resultItem) {
  if (value || resultItem) {
    window.location.href = resultItem ? resultItem.link : `https://en.wikipedia.org/wiki/Special:Search?search=${value}`;
  }
}

function renderAfterTextBox() {
  return (
    <div className="button">
      <button onClick={this.handleEnterKeyDown}>Search</button>
    </div>
  );
}

function renderResultItem(resultItem) {
  const {
    link,
    value
  } = resultItem;
  return <a href={link}>{value}</a>;
}

render((
  <AutoComplete
    classNames={classNames}
    debounceDuration={250}
    getResultItemValue={getResultItemValue}
    getResultList={getResultList}
    onEnterKeyDown={onEnterKeyDown}
    renderAfterTextBox={renderAfterTextBox}
    renderResultItem={renderResultItem}
    shouldCacheResultList>
    <input type="text" placeholder="Search Wikipedia&hellip;" />
  </AutoComplete>
), document.querySelector('.AutoComplete'));
