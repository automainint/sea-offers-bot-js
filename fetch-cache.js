/*  Copyright (c) 2022 Mitya Selivanov
 */ 

'use strict';

const abort_controller        = require('abort-controller');
const default_fetch_upstream  = require('node-fetch');

const default_fetch_timeout   = 10000;
const default_cache_timeout   = 5000;
const default_autoclean_count = 20;

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
  wrap_options:     default_wrap_options,
  autoclean_count:  default_autoclean_count
};

let response_pool   = {};
let autoclean_index = 0;

function clear() {
  response_pool = {};
}

function save_response(url, response) {
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

function autoclean() {
  const entries = Object.entries(response_pool);

  if (entries.length == 0) {
    return;
  }

  if (autoclean_index >= entries.length) {
    autoclean_index = 0;
  }

  for ( let i = 0;
        autoclean_index + i < entries.length &&
        i < options.autoclean_count;
        i++) {
    const [ key, value ] = entries[autoclean_index + i];

    if (Date.now() - value.time >= options.cache_timeout) {
      delete response_pool[key];
    }
  }

  autoclean_index += options.autoclean_count;
}

var fetch;

async function cache(custom_fetch, url, request_options) {
  if (custom_fetch === fetch) {
    throw new Error('Infinite recursion.');
  }

  autoclean();

  if (!options.request_filter(url, request_options)) {
    return await custom_fetch(url, request_options);
  }

  if (check_timeout(url)) {
    return load_response(url);
  }

  return save_response(url, await custom_fetch(url, request_options));
}

fetch = function(url, request_options) {
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

  const clear_if_have_timeout = () => {
    if (timeout_id != 0) {
      clearTimeout(timeout_id);
    }
  };

  return cache(options.fetch_upstream, url, wrapped_options)
    .then(response => {
      clear_if_have_timeout();
      return response;
    })
    .catch(error => {
      clear_if_have_timeout();
      throw error;
    });
}

module.exports = {
  fetch:    fetch,
  cache:    cache,
  clear:    clear,
  options:  options
};
