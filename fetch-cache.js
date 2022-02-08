/*  Copyright (c) 2022 Mitya Selivanov
 */ 

'use strict';

const abort_controller        = require('abort-controller');
const default_fetch_upstream  = require('node-fetch');

const default_fetch_timeout = 10000;
const default_cache_timeout = 5000;

function default_request_filter(url, request_options) {
  return  !request_options ||
          !('method' in request_options) ||
          request_options['method'] == 'GET';
}

function default_response_filter(response) {
  return response.status == 200;
}

function default_wrap_options(request_options) {
  return request_options;
}

const options = {
  fetch_upstream:   default_fetch_upstream,
  fetch_timeout:    default_fetch_timeout,
  cache_timeout:    default_cache_timeout,
  request_filter:   default_request_filter,
  response_filter:  default_response_filter,
  wrap_options:     default_wrap_options
};

let response_pool = {};

function clear() {
  response_pool = {};
}

async function save_response(url, response) {
  if (options.response_filter(response)) {
    response_pool[url] = {
      time:     Date.now(),
      response: response.clone()
    };
  }

  return response;
}

function load_response(url) {
  return response_pool[url].response.clone();
}

function time_elapsed(url) {
  return Date.now() - response_pool[url].time;
}

function check_timeout(url) {
  return  (url in response_pool) &&
          time_elapsed(url) < options.cache_timeout;
}

var fetch;

async function cache(custom_fetch, url, request_options) {
  if (custom_fetch === fetch) {
    throw "Infinite recursion.";
  }

  if (!options.request_filter(url, request_options)) {
    return await custom_fetch(url, request_options);
  }

  if (check_timeout(url)) {
    return load_response(url);
  }

  return await save_response(url, await custom_fetch(url, request_options));
}

fetch = function(url, request_options) {
  return new Promise((resolve, reject) => {
    let timeout_id      = 0;
    let wrapped_options = options.wrap_options(request_options);

    if (!wrapped_options) {
      wrapped_options = {};
    }

    if (!('signal' in wrapped_options)) {
      const controller = new abort_controller();

      timeout_id = setTimeout(
        () => controller.abort(),
        options.fetch_timeout);

      wrapped_options.signal = controller.signal;
    }

    cache(options.fetch_upstream, url, wrapped_options)
      .then(response => {
        if (timeout_id != 0) {
          clearTimeout(timeout_id);
        }

        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
}

module.exports = {
  fetch:    fetch,
  cache:    cache,
  clear:    clear,
  options:  options
};
