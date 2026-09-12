"""Browser interaction checks; build first. Requires only optional Python Playwright.
Uses embedded standalone HTML, so tests also work where localhost navigation is restricted.
ASTRA_BROWSER selects an existing Chromium executable. ASTRA_REQUIRE_WEBGL=1 rejects
software fallback. ASTRA_TEST_OUT changes the screenshot/report output directory.
"""
from pathlib import Path
import json
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('ASTRA_TEST_OUT', ROOT / 'test-results'))
OUT.mkdir(parents=True, exist_ok=True)
HTML = (ROOT / 'dist/astra-explosion-standalone.html').read_text()
checks = []
renderers = set()

def record(name):
    checks.append(name)
    print('PASS', name, flush=True)

def state(page):
    return page.evaluate('window.astra.getState()')

def settle(page):
    page.wait_for_function('Math.abs(window.astra.getState().amount-window.astra.getState().target)<.001', timeout=30000)
    page.wait_for_timeout(600)

def load(browser, width, height, reduce=True):
    context = browser.new_context(viewport={'width': width, 'height': height}, device_scale_factor=1,
                                  reduced_motion='reduce' if reduce else 'no-preference', accept_downloads=True)
    page = context.new_page()
    errors, requests = [], []
    page.on('pageerror', lambda e: errors.append(str(e)[:250]))
    page.on('request', lambda r: requests.append(r.url) if r.url.startswith(('http:', 'https:')) else None)
    page.set_content(HTML, wait_until='load')
    page.wait_for_selector('body[data-ready="true"]', timeout=30000)
    settle(page)
    renderer = state(page)['renderer']
    renderers.add(renderer)
    if os.environ.get('ASTRA_REQUIRE_WEBGL') == '1':
        assert renderer == 'webgl2', f'WebGL 2 required, got {renderer}'
    return context, page, errors, requests

with sync_playwright() as p:
    options = dict(headless=True, args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader',
                                      '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'])
    if os.environ.get('ASTRA_BROWSER'):
        options['executable_path'] = os.environ['ASTRA_BROWSER']
    browser = p.chromium.launch(**options)
    context, page, errors, requests = load(browser, 1440, 960, False)
    initial = state(page)
    assert len(initial['visible']) == 24 and initial['target'] == 0
    assert initial['meshCount'] == 80 and initial['triangles'] > 45000
    record('Desktop startup: 24 assemblies, 80 mesh batches')
    page.screenshot(path=str(OUT / 'desktop-assembled.png'))
    page.click('#explode'); settle(page)
    assert state(page)['target'] == 1 and state(page)['amount'] > .999
    record('Animated one-click explosion')
    page.screenshot(path=str(OUT / 'desktop-exploded.png'))
    page.emulate_media(reduced_motion='reduce')
    page.locator('#separation').fill('50'); settle(page)
    assert state(page)['target'] == .5
    record('Continuous separation slider')
    page.click('#explode'); settle(page)
    page.fill('#search', 'A19')
    assert page.locator('.part-row').count() == 1
    page.click('[data-select="logic-board"]')
    assert state(page)['selected'] == 'logic-board'
    page.click('#isolate'); settle(page)
    assert state(page)['visible'] == ['logic-board']
    record('Source-linked search and isolated inspection')
    page.screenshot(path=str(OUT / 'desktop-inspection.png'))
    page.click('#deselect'); settle(page)
    assert len(state(page)['visible']) == 24 and state(page)['isolated'] is None
    record('Deselect exits isolation and restores whole-model framing')
    page.fill('#search', '电池')
    assert page.locator('.part-row').count() == 2
    page.fill('#search', 'does-not-exist-xyz')
    assert page.locator('.empty-results').count() == 1
    record('Chinese search and empty results')
    page.click('#show-all'); page.click('[data-hide="battery"]')
    assert len(state(page)['visible']) == 23
    page.click('[data-hide="battery"]')
    assert len(state(page)['visible']) == 24
    record('Per-assembly visibility toggles')
    page.click('[data-category="optics"]')
    assert set(state(page)['visible']) == {'camera', 'front-camera'}
    page.click('#show-all'); page.click('#inventory-mode'); settle(page)
    assert state(page)['layout'] == 'inventory' and page.locator('#separation').is_disabled()
    assert page.locator('.part-label:visible').count() == 24
    record('Category filter and nonoverlapping inventory with 24 labels')
    page.screenshot(path=str(OUT / 'desktop-inventory.png'))
    pos = page.evaluate('window.astra.projectPart("battery")')
    box = page.locator('#canvas').bounding_box()
    page.mouse.click(box['x'] + pos['x'], box['y'] + pos['y'])
    assert state(page)['selected'] == 'battery'
    record('Actual canvas ray/triangle picking selects the battery')
    page.click('#deselect')
    x,y = box['x']+box['width']*.5, box['y']+box['height']*.5
    before = state(page)['camera']['yaw']
    page.mouse.move(x,y); page.mouse.down(); page.mouse.move(x+80,y+20,steps=7); page.mouse.up()
    page.wait_for_timeout(800)
    assert state(page)['selected'] is None and abs(state(page)['camera']['yaw'] - before) > .1
    record('Orbit gesture changes camera without accidental selection')
    page.click('#layers-mode'); settle(page)
    page.click('[data-finish="orange"]')
    assert state(page)['finish'] == 'orange'
    page.click('#rotate-toggle')
    assert state(page)['autoRotate']
    page.click('#rotate-toggle')
    record('Finish selection and turntable toggle')
    with page.expect_download(timeout=30000) as info:
        page.click('#capture')
    download = info.value
    download.save_as(str(OUT / 'scene-export.png'))
    assert (OUT / 'scene-export.png').read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
    record('Scene PNG export contains a valid PNG')
    page.click('#sources-open')
    assert page.locator('#about').is_visible()
    assert page.locator('#about .source-links a').count() == 7
    page.keyboard.press('Escape')
    assert not page.locator('#about').is_visible()
    record('Source dialog and native Escape close')
    page.click('#reset'); settle(page)
    assert state(page)['target'] == 0 and state(page)['finish'] == 'silver'
    page.focus('#canvas'); page.keyboard.press('Space'); settle(page)
    assert state(page)['target'] == 1
    page.fill('#search','r'); page.keyboard.press('r')
    assert state(page)['target'] == 1
    page.focus('#canvas'); page.keyboard.press('r'); settle(page)
    assert state(page)['target'] == 0
    record('Reset and shortcuts; typing does not trigger shortcuts')
    assert errors == [], errors
    assert requests == [], requests
    record('No page errors or external runtime network requests')
    context.close()
    for width,height in [(390,844),(320,568),(844,390)]:
        context,page,errors,requests=load(browser,width,height)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        page.click('#explode');settle(page)
        assert state(page)['target'] == 1
        page.click('#inventory-mode');settle(page)
        assert len(state(page)['visible']) == 24
        assert page.locator('.part-label:visible').count() == 24
        page.screenshot(path=str(OUT / f'mobile-{width}x{height}-inventory.png'))
        page.click('#library-open'); page.fill('#search','电池');page.click('[data-select="battery"]');page.click('#isolate');settle(page)
        assert state(page)['visible'] == ['battery']
        page.click('#library-close');page.wait_for_timeout(250)
        assert not page.locator('#library').evaluate('(el)=>el.classList.contains("open")')
        page.screenshot(path=str(OUT / f'mobile-{width}x{height}-inspection.png'))
        page.keyboard.press('Escape');settle(page)
        assert len(state(page)['visible']) == 24
        assert errors == [], errors
        assert requests == [], requests
        record(f'{width}x{height}: no horizontal overflow; inventory, drawer, search, isolate, close')
        context.close()
    browser.close()
report={'date':'2026-09-12','passed':len(checks),'checks':checks,'renderers':sorted(renderers),
        'mode':'standalone HTML embedded with page.set_content',
        'limitations':['Physical devices and real multitouch hardware not tested.',
                       'Browser URL navigation / actual file:// launch is not exercised by this harness.']}
if 'webgl2' not in renderers:
    report['limitations'].append('WebGL 2 was unavailable in this environment; browser tests exercised the depth-buffered Canvas 2D fallback, not the GPU path.')
(OUT / 'browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
