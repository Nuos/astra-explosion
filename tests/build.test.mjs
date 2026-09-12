import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
let html;
before(() => {
  execFileSync(process.execPath, ['scripts/build.mjs']);
  html = readFileSync('dist/index.html', 'utf8');
});
test('both distributable entries are identical, self-contained classic HTML', () => {
  assert.equal(html, readFileSync('dist/astra-explosion-standalone.html', 'utf8'));
  assert.doesNotMatch(html, /<script[^>]*(?:src=|type=["'](?:module|importmap))/i);
  assert.doesNotMatch(html, /data:text\/javascript|<link[^>]+rel=["']stylesheet/i);
});
test('every inline script parses and no external module syntax remains', () => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 2);
  for (const [, source] of scripts) new Script(source);
  assert.doesNotMatch(scripts[1][1], /^\s*(?:export|import)\b/m);
});
test('entry contains visible no-script and startup-failure recovery text', () => {
  assert.match(html, /id="boot-help"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /JavaScript 未运行/);
  assert.match(html, /unhandledrejection/);
});
test('build is deterministic', () => {
  execFileSync(process.execPath, ['scripts/build.mjs']);
  assert.equal(readFileSync('dist/index.html', 'utf8'), html);
});
