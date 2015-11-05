// client.js
// wrapper for api calls to PatentlyClear
var request = require('request');
var _ = require('underscore');
var url = require('url');
var pck = require('./package.json');

var apiHost = 'api.patentlyclear.com';

// **api([api_token = process.env.PC_API_TOKEN])**
// Require-ing this module will return a function that takes your PatentlyClear api token.
// If no token is passed then the library will attempt to use process.env.PC_API_TOKEN (on the server only).
// Simply call this function with your token to access the api functions.
//
//  `var api = new require('patentlyclear')('my api token')`
//  `var api = new require('patentlyclear')() // uses process.env.PC_API_TOKEN`
function contructor(api_token) {

  if (!api_token && process && process.env && process.env.PC_API_TOKEN) {
    api_token = process.env.PC_API_TOKEN;
  }

  if (!api_token) {
    throw new Error('No api_token provided');
  }

  // **getById(id, callback)**
  // Looks up a document by its id
  // Supplying an id that points to multiple resources (such as an application number)
  // will return all forms of that document.

  // Application ID
  // * `api.getById('US20140000001') => {application: {...}}`

  // Grant ID
  // * `api.getById('US8877876') => {grant: {...}}`

  // Application Number (both string and number formats are accepted)
  // * `api.getById('13/538,394') => {application: {...}, grant: {...}}`
  // * `api.getById(13538394) => {application: {...}, grant: {...}}`
  function getById(id, callback) {
    var formattedUrl = url.format({
      protocol: 'https',
      host: apiHost,
      pathname: id,
      query: {
        token: api_token
      }
    });
    request({url: formattedUrl, json: true}, apiResponse(callback));
  }
  this.getById = getById;

  // **search(payload, callback)**
  // Search for a set of documents with a query payload.

  // There are several fields that can be searched on. They are:
  // * terms [string]: Perform a full text search with a set of keywords.
  // * inventor [string]: Search on inventor name.
  // * assignee [string]: Who owns the document.
  // * filing_date {before: Date, after: Date}: When the document was filed.
  // * publication_date {before: Date, after: Date}: When the document was published.
  // * type: [application || grant]: What sort of document it is.
  // * size int: Total number of documents to return. (Max = 100)
  function search(payload, callback) {
    var formattedUrl = url.format({
      protocol: 'https',
      host: apiHost,
      pathname: 'search',
      query: {
        token: api_token
      }
    });
    request.post({url: formattedUrl, body: payload, json: true}, apiResponse(callback));
  }
  this.search = search;

  // **analyze(field, payload, callback)**
  // Fetches the top trends in a field for a search payload.
  function analyze(field, payload, callback) {
    var formattedUrl = url.format({
      protocol: 'https',
      host: apiHost,
      pathname: 'analyze/' + field,
      query: {
        token: api_token
      }
    });
    request.post({url: formattedUrl, body: payload, json: true}, apiResponse(callback));
  }
  this.analyze = analyze;

  // **backwardCitation(id, payload, callback)**
  // Fetches the backward citations of `id` (eg. the documents that `id` cites.) that match a given search query.
  // Optionally provide a search payload to filter documents that are retrieved.
  function backwardCitation(id, payload, callback) {
    if (!callback && typeof payload === 'function') {
      callback = payload;
      payload = {};
    }
    var formattedUrl = url.format({
      protocol: 'https',
      host: apiHost,
      pathname: 'backward_citation/' + id,
      query: {
        token: api_token
      }
    });
    request.post({url: formattedUrl, body: payload, json: true}, apiResponse(callback));
  }
  this.backwardCitation = backwardCitation;

  // **forwardCitation(id, payload, callback)**
  // Fetches the forward citations of `id`. (eg. the documents that cite `id`.)  that match a given search query.
  function forwardCitation(id, payload, callback) {
    if (!callback && typeof payload === 'function') {
      callback = payload;
      payload = {};
    }
    var formattedUrl = url.format({
      protocol: 'https',
      host: apiHost,
      pathname: 'forward_citation/' + id,
      query: {
        token: api_token
      }
    });
    request.post({url: formattedUrl, body: payload, json: true}, apiResponse(callback));
  }
  this.forwardCitation = forwardCitation;

  // **getVersion()**
  // Returns the version of this client
  function getVersion() {
    return pck.version;
  }
  this.getVersion = getVersion;

  return this;
}

function apiResponse(callback) {
  return function(err, response, body) {
    if (err) {
      return callback(err);
    }

    if (response.statusCode !== 200) {
      return callback(body);
    } else {
      if (!_.isArray(body)) {
        body = dateFormat(body);
      } else {
        body = body.map(function(o) {
          return dateFormat(o);
        });
      }
      return callback(null, body);
    }

  };
}
module.exports = contructor;

function dateFormat(obj) {
  if (obj.application) {
    obj.application.filing_date = new Date(obj.application.filing_date);
    obj.application.publication_date = new Date(obj.application.publication_date);
  }
  if (obj.grant) {
    obj.grant.filing_date = new Date(obj.grant.filing_date);
    obj.grant.publication_date = new Date(obj.grant.publication_date);
  }
  return obj;
}