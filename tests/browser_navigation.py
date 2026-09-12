"""Real file:// and HTTP navigation; no page.set_content and no policy bypass.
Optional ASTRA_BASELINE_REF reconstructs v1.0.0 from git for observed comparison.
ASTRA_BROWSER selects Chromium; ASTRA_REQUIRE_WEBGL=1 rejects Canvas fallback.
"""
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import io
import json
import os
import shutil
import socket
import subprocess
import tarfile
import tempfile
import time
import urllib.request
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('ASTRA_NAV_OUT', ROOT / 'test-results/navigation'))
OUT.mkdir(parents=True, exist_ok=True)
report = {'started_at': datetime.now(timezone.utc).isoformat(), 'cases': [], 'baseline': [],
          'mode': 'real page.goto navigation, without file-access/security override flags',
          'limitations': ['Not physical GPU or phone hardware; WebGL may use SwiftShader.',
                          'Chat attachment-link lifetime and chat preview permissions are outside this test.',
                          'No public website is deployed by these tests.']}

@contextmanager
def server(directory):
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    process = subprocess.Popen(['node', str(ROOT/'scripts/serve.mjs'), str(directory)],
                               env={**os.environ, 'PORT': str(port), 'HOST': '127.0.0.1'},
                               stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    try:
        url = f'http://127.0.0.1:{port}'
        for _ in range(100):
            if process.poll() is not None:
                raise RuntimeError(process.stderr.read().decode())
            try:
                with urllib.request.urlopen(url + '/', timeout=1):
                    break
            except Exception:
                time.sleep(.05)
        else:
            raise RuntimeError('Local server did not become ready')
        yield url
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
        process.stderr.close()

def settle(page):
    page.wait_for_function('window.astra && Math.abs(window.astra.getState().amount-window.astra.getState().target)<.001', timeout=30000)
    page.wait_for_timeout(300)

def observe(browser, name, url, viewport=(1440, 960), interactive=True, javascript=True, forced_failure=False):
    case = {'name': name, 'url': url, 'viewport': list(viewport), 'checks': []}
    context = browser.new_context(viewport={'width': viewport[0], 'height': viewport[1]},
                                  reduced_motion='reduce', java_script_enabled=javascript,
                                  accept_downloads=True)
    page = context.new_page()
    errors, failed, external, console_errors = [], [], [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('requestfailed', lambda r: failed.append({'url': r.url[:250], 'reason': r.failure}))
    page.on('console', lambda m: console_errors.append(m.text[:600]) if m.type == 'error' else None)
    page.on('request', lambda r: external.append(r.url) if r.url.startswith(('https://', 'http://')) and not r.url.startswith('http://127.0.0.1:') else None)
    if forced_failure:
        page.add_init_script('HTMLCanvasElement.prototype.getContext=function(){throw new Error("AUDIT_FORCED_GRAPHICS_FAILURE")};')
    try:
        response = page.goto(url, wait_until='load', timeout=30000)
        case['http_status'] = response.status if response else None
        if not javascript:
            assert page.locator('#boot-help').is_visible()
            assert 'JavaScript 未运行' in page.locator('noscript').inner_text()
            case['checks'].append('Readable recovery text with JavaScript disabled')
        elif forced_failure:
            page.wait_for_function('document.getElementById("boot-detail").textContent.includes("AUDIT_FORCED_GRAPHICS_FAILURE")')
            assert page.locator('#boot-help').is_visible()
            case['checks'].append('Graphics failure is visible rather than a blank page')
        else:
            page.wait_for_selector('body[data-ready="true"]', timeout=10000 if not interactive else 30000)
            state = page.evaluate('window.astra.getState()')
            case['renderer'] = state['renderer']
            case['assemblies'] = len(state['visible'])
            assert case['assemblies'] == 24
            if interactive:
                if os.environ.get('ASTRA_REQUIRE_WEBGL') == '1':
                    assert state['renderer'] == 'webgl2', state['renderer']
                page.wait_for_selector('#boot-help', state='hidden')
                case['checks'].append('Actual URL opens and startup overlay clears')
                page.click('#explode'); settle(page)
                assert page.evaluate('window.astra.getState().target') == 1
                page.locator('#separation').fill('50'); settle(page)
                assert page.evaluate('window.astra.getState().target') == .5
                page.click('#explode'); settle(page)
                case['checks'].append('Explosion and continuous slider work')
                page.screenshot(path=str(OUT/f'{name}-exploded.png'))
                if viewport[0] < 850:
                    page.click('#library-open')
                page.fill('#search', '电池')
                page.click('[data-select="battery"]'); page.click('#isolate'); settle(page)
                assert page.evaluate('window.astra.getState().visible') == ['battery']
                page.click('#deselect'); settle(page)
                assert len(page.evaluate('window.astra.getState().visible')) == 24
                page.click('#show-all')
                if viewport[0] < 850:
                    page.click('#library-close')
                case['checks'].append('Search, select, isolate and restore work')
                page.click('#inventory-mode'); settle(page)
                assert page.locator('.part-label:visible').count() == 24
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
                page.screenshot(path=str(OUT/f'{name}-inventory.png'))
                case['checks'].append('24 inventory labels and no horizontal overflow')
                original_url = page.url
                page.click('.brand'); settle(page)
                assert page.url == original_url
                assert page.evaluate('window.astra.getState().target') == 0
                case['checks'].append('Brand resets without leaving the HTML file')
                with page.expect_download() as info:
                    page.click('#capture')
                download_path = OUT/f'{name}-export.png'
                info.value.save_as(str(download_path))
                assert download_path.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
                case['checks'].append('Valid PNG export')
                page.reload(wait_until='load')
                page.wait_for_selector('body[data-ready="true"]')
                case['checks'].append('Actual browser reload works')
                assert not errors, errors
                assert not failed, failed
                assert not external, external
            else:
                case['brand_destination'] = page.locator('.brand').evaluate('(a)=>a.href')
        case['status'] = 'passed'
    except Exception as exc:
        case['status'] = 'blocked_environment' if 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(exc) else 'failed'
        case['error'] = str(exc)[:1600]
        case['body_excerpt'] = page.locator('body').inner_text()[:800]
        page.screenshot(path=str(OUT/f'{name}-failure.png'))
    finally:
        case.update(page_errors=errors, console_errors=console_errors, failed_requests=failed, external_requests=external)
        context.close()
    print(json.dumps(case, ensure_ascii=False), flush=True)
    return case

with tempfile.TemporaryDirectory(prefix='astra-navigation-') as directory:
    temp = Path(directory)
    standalone = ROOT/'dist/astra-explosion-standalone.html'
    renamed = temp/'独立文件 含空格.html'
    shutil.copy2(standalone, renamed)
    nested = temp/'nested/astra-explosion'
    nested.mkdir(parents=True)
    shutil.copy2(ROOT/'dist/index.html', nested/'index.html')
    (temp/'index.html').write_text('test server root')
    report['build_sha256'] = hashlib.sha256(standalone.read_bytes()).hexdigest()
    with sync_playwright() as pw, server(ROOT/'dist') as dist_url, server(ROOT) as source_url, server(temp) as nested_url:
        options = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']}
        if os.environ.get('ASTRA_BROWSER'):
            options['executable_path'] = os.environ['ASTRA_BROWSER']
        browser = pw.chromium.launch(**options)
        report['browser_version'] = browser.version
        for name, url in [('file-index', (ROOT/'dist/index.html').as_uri()),
                          ('file-standalone', standalone.as_uri()),
                          ('file-renamed-isolated', renamed.as_uri()),
                          ('http-built', dist_url+'/'),
                          ('http-source', source_url+'/'),
                          ('http-subdirectory', nested_url+'/nested/astra-explosion/')]:
            report['cases'].append(observe(browser, name, url))
        for viewport in [(390,844), (320,568), (844,390)]:
            name = f'file-mobile-{viewport[0]}x{viewport[1]}'
            report['cases'].append(observe(browser, name, standalone.as_uri(), viewport))
        report['cases'].append(observe(browser, 'javascript-disabled', standalone.as_uri(), javascript=False))
        report['cases'].append(observe(browser, 'graphics-failure', standalone.as_uri(), forced_failure=True))
        ref = os.environ.get('ASTRA_BASELINE_REF')
        if ref:
            old = temp/'baseline'; old.mkdir()
            archive = subprocess.check_output(['git', 'archive', ref], cwd=ROOT)
            with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
                tar.extractall(old, filter='data')
            subprocess.run(['node', 'scripts/build.mjs'], cwd=old, check=True)
            for name, path in [('v100-file-modular',old/'dist/index.html'),
                               ('v100-file-standalone',old/'dist/astra-explosion-standalone.html')]:
                report['baseline'].append(observe(browser, name, path.as_uri(), interactive=False))
        browser.close()
report['completed_at'] = datetime.now(timezone.utc).isoformat()
report['passed'] = sum(case['status'] == 'passed' for case in report['cases'])
report['failed'] = len(report['cases']) - report['passed']
(OUT/'navigation-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print(f"NAVIGATION: {report['passed']}/{len(report['cases'])} passed; {report['failed']} failed", flush=True)
raise SystemExit(1 if report['failed'] else 0)
