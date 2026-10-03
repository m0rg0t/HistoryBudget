const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const sourcePath = process.env.HISTORY_DATA_SOURCE || path.join(__dirname,
  '../HubPivotSharedApp1/HubPivotSharedApp1.Shared/js/data.js');
const source = fs.readFileSync(sourcePath, 'utf8');

function harness() {
  const fileCallbacks = [];
  const readCallbacks = [];
  const uris = [];
  class List {
    constructor() { this.items = []; }
    get length() { return this.items.length; }
    push(item) { return this.items.push(item); }
    splice(...args) { return this.items.splice(...args); }
    createGrouped() { return { groups: {}, length: 0 }; }
  }
  const context = {
    WinJS: { Binding: { List }, Namespace: { define(name, value) { context[name] = value; } } },
    Windows: {
      Foundation: { Uri: function (uri) { uris.push(uri); } },
      Storage: {
        StorageFile: {
          getFileFromApplicationUriAsync() {
            return { then(callback) { fileCallbacks.push(callback); } };
          }
        },
        FileIO: {
          readTextAsync() {
            return { done(callback) { readCallbacks.push(callback); } };
          }
        }
      }
    }
  };
  vm.runInNewContext(source, context, { timeout: 1000, filename: sourcePath });
  return {
    data: context.Data,
    uris,
    locateFile() { assert.ok(fileCallbacks.length); fileCallbacks.shift()({}); },
    readText(text) { assert.ok(readCallbacks.length); readCallbacks.shift()(text); },
    complete(rows) { this.locateFile(); this.readText(JSON.stringify(rows)); }
  };
}

function assertRows(data, rows) {
  assert.deepEqual(JSON.parse(JSON.stringify(data.jsonData)), rows);
  assert.deepEqual(JSON.parse(JSON.stringify(data.csvData.items)), rows);
  for (let i = 0; i < rows.length; i++) {
    assert.equal(data.csvData.items[i], data.jsonData[i], 'both exports share each parsed row');
  }
}

const firstRows = [{ nn: 1, summ: 500, name: 'First' }, { nn: 2, summ: 125, name: 'Second' }];

test('initial asynchronous load fills both exports and preserves the observable list', () => {
  const h = harness();
  const list = h.data.csvData;
  assert.equal(list.length, 0);
  h.locateFile();
  assert.equal(list.length, 0, 'file lookup alone does not populate rows');
  h.readText(JSON.stringify(firstRows));
  assertRows(h.data, firstRows);
  assert.equal(h.data.csvData, list);
  assert.deepEqual(h.uris, ['ms-appx:///data/1.json']);
});

test('reload replaces rows before invoking its callback and does not duplicate data', () => {
  const h = harness();
  h.complete(firstRows);
  const list = h.data.csvData;
  const replacement = [{ nn: 3, summ: 900, name: 'Replacement' }];
  let calls = 0;
  function callback() {
    calls++;
    assert.equal(h.data.csvData, list);
    assertRows(h.data, replacement);
  }
  h.data.loadData(callback);
  assert.equal(calls, 0);
  assertRows(h.data, firstRows);
  h.complete(replacement);
  assert.equal(calls, 1);
  h.data.loadData(callback);
  h.complete(replacement);
  assert.equal(calls, 2);
  assert.equal(list.length, 1);
});

test('empty initial load and empty reload leave the same list empty', () => {
  const h = harness();
  const list = h.data.csvData;
  h.complete([]);
  assertRows(h.data, []);
  h.data.loadData(() => {});
  h.complete(firstRows);
  let calls = 0;
  h.data.loadData(() => { calls++; assertRows(h.data, []); });
  h.complete([]);
  assert.equal(calls, 1);
  assert.equal(h.data.csvData, list);
});

test('malformed JSON keeps the previous state and does not signal successful reload', () => {
  const h = harness();
  h.complete(firstRows);
  const json = h.data.jsonData;
  let calls = 0;
  h.data.loadData(() => { calls++; });
  h.locateFile();
  assert.throws(() => h.readText('{invalid'), { name: 'SyntaxError' });
  assert.equal(calls, 0);
  assert.equal(h.data.jsonData, json);
  assertRows(h.data, firstRows);
});
