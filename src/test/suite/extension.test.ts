import assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import vscode from 'vscode';
import { namespaceJoin } from '../../util/namespaces';
import { capitalize, lowercase } from '../../util/misc';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('namespaceJoin', () => {
    assert.strictEqual(namespaceJoin('App\\', '\\Support\\', '/MyClass'), 'App\\Support\\MyClass');
    assert.strictEqual(namespaceJoin('App\\', '\\Support\\', '/MyClass.php'), 'App\\Support');
  });

  test('lowercase', () => {
    assert.strictEqual(lowercase('HELLO WORLD'), 'hello world');
    assert.strictEqual(capitalize('hello world'), 'hello world');
  });

  test('capitalize', () => {
    assert.strictEqual(capitalize('my test'), 'My test');
    assert.strictEqual(capitalize('My test'), 'My test');
  });
});
