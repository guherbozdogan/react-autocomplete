import fetchJsonp from 'fetch-jsonp';
import React from 'react';
import {render} from 'react-dom';
import Autocomplete from '../src/react-autocomplete';

render((
  <Autocomplete
    getItems={(value) => {
      return fetchJsonp('http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + value)
        .then(function(response) {
          return response.json();
        }).then(function(json) {
          var values = json[1];
          var descriptions = json[2];
          var links = json[3];
          return values.map(function(value, index) {
            return {
              value: value,
              keys: [
                value,
                descriptions[index]
              ],
              link: links[index]
            };
          });
        });
    }}
    onEnterKeyDown={(value, item) => {
      console.log(value, item);
    }}/>
), document.querySelector('.autocomplete'));
