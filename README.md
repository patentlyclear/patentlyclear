patentlyclear
===

Patently Clear is an API for the US patent office. Patently Clear provides easy access to the data through full text search and citation graphs. Check out our [examples on tonic](https://tonicdev.com/patentlyclear/) to see the library in action.

[Register for an early access token here.](http://patentlyclear.com/)

`npm install patentlyclear`

Usage
---

```js
var PatentlyClear = require('patentlyclear');
// You can either pass in your API token into the constructor or have it set as an environment variable
// The library will look for process.env.PC_API_TOKEN if no api token is provided.
var pc = new PatentlyClear(/* your api token */);
```

### Looking up by ID

**getById(id, callback)**
Looks up a document by its id
Supplying an id that points to multiple resources (such as an application number)
will return all forms of that document.

Application ID
* `api.getById('US20140000001') => {application: {...}}`

Grant ID
* `api.getById('US8877876') => {grant: {...}}`

Application Number (both string and number formats are accepted)
* `api.getById('13/538,394') => {application: {...}, grant: {...}}`
* `api.getById(13538394) => {application: {...}, grant: {...}}`

```js
pc.getById('US8046721', function(err, data) {
  // data => {grant: {id:..., title:..., abstract:...}}
});
```

### Full text search

**search(payload, callback)**
Search for a set of documents with a query payload.

There are several fields that can be searched on. They are:
* terms [string]: Perform a full text search with a set of keywords.
* inventor [string]: Search on inventor name.
* assignee [string]: Who owns the document.
* filing_date {before: Date, after: Date}: When the document was filed.
* publication_date {before: Date, after: Date}: When the document was published.
* type: [application || grant]: What sort of document it is.
* size int: Total number of documents to return. (Max = 100)

Fields are 'AND'-ed together for search queries, but the term field can support 'OR'-ing.

```js
pc.search({terms: 'dna'}, function(err, data) {
  // data => {hits: [{grant: {}}, {application: {}}]}
});

// 'dna' AND 'Genentech'

{terms: 'dna', assignee: 'genentech'}

// 'dna' AND (filed during 2013)
{
  terms: 'dna',
  filing_date: {
    after: '2013-01-01',
    before: '2014-01-01'
  }
}

// 'dna' AND ('cat' OR 'dog' OR 'mouse')
{
  terms: [
    'dna',
    ['cat', 'dog', 'mouse']
  ]
}

```

#### Scrolling

Some result sets can be very large, so pagination is provided by simply re-running the previous search query with the scroll id provided by the returned data.

```js
var query = {terms: 'dna'};
pc.search(query, function(err, data) {
  query.scroll_id = data.scroll_id;
  pc.search(query, function(err, nextData) {
    // another set of data
  });
});
```

### Analysis

**analyze(field, payload, callback)**
Fetches the top trends in a field for a search payload.
The possible fields are:
* trends
* assingee
* filing_date

```js
pc.analyze('trends', {terms: 'dna'}, function(err, data) {
  // data => {hits: [{grant: {}}, {application: {}}]}
});
```

### Citation search

**backwardCitation(id, payload, callback)**
Fetches the backward citations of `id` (eg. the documents that `id` cites.) that match a given search query.
Optionally provide a search payload to filter documents that are retrieved.

```js
pc.backwardCitation('US8046721', function(err, data) {
  // data => {hits: [{grant: {}}, {application: {}}]}
});

pc.backwardCitation('US8046721', {terms: 'password'}, function(err, data) {
  // data => {hits: [{grant: {}}, {application: {}}]}
});
```

**forwardCitation(id, payload, callback)**
Fetches the forward citations of `id` (eg. the documents that cite `id`.) that match a given search query.

```js
pc.forwardCitation('US8046721', function(err, data) {
  // data => {hits: [{grant: {}}, {application: {}}]}
});

pc.forwardCitation('US8046721', {terms: 'password'}, function(err, data) {
  // data => {hits: [{grant: {}}, {application: {}}]}
});
```

License
---

MIT

