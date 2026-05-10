"""
Reward Script: Vendor consolidation — change vendor for BasicWear & HomeGoods products to
UnifiedBrands, and append 'Now part of the UnifiedBrands family' to their descriptions.
Task ID: shopify_adv_005
Domain: shopify_admin_mock
Scoring:
  Component 1: prod-001 vendor changed to 'UnifiedBrands'            (0.25 pts)
  Component 2: prod-004 vendor changed to 'UnifiedBrands'            (0.25 pts)
  Component 3: prod-001 bodyHtml contains consolidation phrase        (0.20 pts)
  Component 4: prod-004 bodyHtml contains consolidation phrase        (0.20 pts)
  Component 5: prod-002 and prod-003 are unchanged (negative guard)  (0.10 pts)
  Total: 1.0
"""

import sys
import requests

BASE_URL = 'https://cua-gym-shopify-admin.xlang.ai'
CONSOLIDATION_PHRASE = 'Now part of the UnifiedBrands family'
TARGET_VENDOR = 'UnifiedBrands'

# --- Read SID ---
try:
    with open('/tmp/task_web_sid') as f:
        sid = f.read().strip()
    if not sid:
        raise ValueError('sid is empty')
except Exception as e:
    print(f'CRITICAL: Cannot read sid from /tmp/task_web_sid: {e}')
    print('REWARD: 0.0')
    sys.exit(0)

# --- Fetch state ---
try:
    resp = requests.get(f'{BASE_URL}/go?sid={sid}', timeout=15)
    resp.raise_for_status()
    data = resp.json()
except Exception as e:
    print(f'CRITICAL: Cannot fetch state from {BASE_URL}/go?sid={sid}: {e}')
    print('REWARD: 0.0')
    sys.exit(0)

initial_state = data.get('initial_state', {})
current_state = data.get('current_state', {})

if not current_state:
    print('CRITICAL: current_state is empty — no state injected for this sid')
    print('REWARD: 0.0')
    sys.exit(0)

if initial_state == current_state:
    print('INFO: current_state == initial_state — no changes applied (agent did nothing)')
    print('REWARD: 0.0')
    sys.exit(0)


def get_product_by_id(products, prod_id):
    for p in products:
        if p.get('id') == prod_id:
            return p
    return None


def verify_task():
    total_score = 0.0

    cur_products = current_state.get('products', [])
    init_products = initial_state.get('products', [])

    # Component 1: prod-001 vendor changed to 'UnifiedBrands' (0.25 pts)
    try:
        cur_p001 = get_product_by_id(cur_products, 'prod-001')
        init_p001 = get_product_by_id(init_products, 'prod-001')
        if cur_p001 is None:
            print('FAIL: Component 1 — prod-001 not found in current_state')
        elif init_p001 is None:
            print('FAIL: Component 1 — prod-001 not found in initial_state (data integrity issue)')
        else:
            init_vendor = init_p001.get('vendor', '')
            cur_vendor = cur_p001.get('vendor', '')
            # Verify the vendor was changed FROM initial (BasicWear) TO UnifiedBrands
            if init_vendor != TARGET_VENDOR and cur_vendor == TARGET_VENDOR:
                print(f'PASS: Component 1 — prod-001 vendor changed from "{init_vendor}" to "{cur_vendor}" (0.25 pts)')
                total_score += 0.25
            elif cur_vendor == TARGET_VENDOR and init_vendor == TARGET_VENDOR:
                print(f'FAIL: Component 1 — prod-001 vendor was already "{TARGET_VENDOR}" in initial_state (precondition, not task change)')
            else:
                print(f'FAIL: Component 1 — prod-001 vendor is "{cur_vendor}", expected "{TARGET_VENDOR}" (was "{init_vendor}")')
    except Exception as e:
        print(f'ERROR: Component 1 — {e}')

    # Component 2: prod-004 vendor changed to 'UnifiedBrands' (0.25 pts)
    try:
        cur_p004 = get_product_by_id(cur_products, 'prod-004')
        init_p004 = get_product_by_id(init_products, 'prod-004')
        if cur_p004 is None:
            print('FAIL: Component 2 — prod-004 not found in current_state')
        elif init_p004 is None:
            print('FAIL: Component 2 — prod-004 not found in initial_state (data integrity issue)')
        else:
            init_vendor = init_p004.get('vendor', '')
            cur_vendor = cur_p004.get('vendor', '')
            if init_vendor != TARGET_VENDOR and cur_vendor == TARGET_VENDOR:
                print(f'PASS: Component 2 — prod-004 vendor changed from "{init_vendor}" to "{cur_vendor}" (0.25 pts)')
                total_score += 0.25
            elif cur_vendor == TARGET_VENDOR and init_vendor == TARGET_VENDOR:
                print(f'FAIL: Component 2 — prod-004 vendor was already "{TARGET_VENDOR}" in initial_state (precondition, not task change)')
            else:
                print(f'FAIL: Component 2 — prod-004 vendor is "{cur_vendor}", expected "{TARGET_VENDOR}" (was "{init_vendor}")')
    except Exception as e:
        print(f'ERROR: Component 2 — {e}')

    # Component 3: prod-001 bodyHtml contains consolidation phrase (0.20 pts)
    try:
        cur_p001 = get_product_by_id(cur_products, 'prod-001')
        init_p001 = get_product_by_id(init_products, 'prod-001')
        if cur_p001 is None:
            print('FAIL: Component 3 — prod-001 not found in current_state')
        else:
            cur_body = cur_p001.get('bodyHtml', '')
            init_body = init_p001.get('bodyHtml', '') if init_p001 else ''
            # Phrase must be in current but NOT in initial (verifying it was added by the task)
            phrase_in_init = CONSOLIDATION_PHRASE in init_body
            phrase_in_cur = CONSOLIDATION_PHRASE in cur_body
            if not phrase_in_init and phrase_in_cur:
                print(f'PASS: Component 3 — prod-001 bodyHtml contains "{CONSOLIDATION_PHRASE}" (0.20 pts)')
                total_score += 0.20
            elif phrase_in_init:
                print(f'FAIL: Component 3 — phrase already existed in initial_state (precondition, not task change)')
            else:
                print(f'FAIL: Component 3 — prod-001 bodyHtml does not contain "{CONSOLIDATION_PHRASE}". Current: {cur_body[:120]}')
    except Exception as e:
        print(f'ERROR: Component 3 — {e}')

    # Component 4: prod-004 bodyHtml contains consolidation phrase (0.20 pts)
    try:
        cur_p004 = get_product_by_id(cur_products, 'prod-004')
        init_p004 = get_product_by_id(init_products, 'prod-004')
        if cur_p004 is None:
            print('FAIL: Component 4 — prod-004 not found in current_state')
        else:
            cur_body = cur_p004.get('bodyHtml', '')
            init_body = init_p004.get('bodyHtml', '') if init_p004 else ''
            phrase_in_init = CONSOLIDATION_PHRASE in init_body
            phrase_in_cur = CONSOLIDATION_PHRASE in cur_body
            if not phrase_in_init and phrase_in_cur:
                print(f'PASS: Component 4 — prod-004 bodyHtml contains "{CONSOLIDATION_PHRASE}" (0.20 pts)')
                total_score += 0.20
            elif phrase_in_init:
                print(f'FAIL: Component 4 — phrase already existed in initial_state (precondition, not task change)')
            else:
                print(f'FAIL: Component 4 — prod-004 bodyHtml does not contain "{CONSOLIDATION_PHRASE}". Current: {cur_body[:120]}')
    except Exception as e:
        print(f'ERROR: Component 4 — {e}')

    # Component 5: prod-002 (LeatherCo) and prod-003 (SportStep) are unchanged (0.10 pts)
    # Negative guard: ensure we did not accidentally modify non-target vendors
    try:
        cur_p002 = get_product_by_id(cur_products, 'prod-002')
        cur_p003 = get_product_by_id(cur_products, 'prod-003')
        init_p002 = get_product_by_id(init_products, 'prod-002')
        init_p003 = get_product_by_id(init_products, 'prod-003')

        if cur_p002 is None or cur_p003 is None:
            print('FAIL: Component 5 — prod-002 or prod-003 missing from current_state')
        else:
            p002_vendor_ok = cur_p002.get('vendor') == (init_p002.get('vendor') if init_p002 else 'LeatherCo')
            p003_vendor_ok = cur_p003.get('vendor') == (init_p003.get('vendor') if init_p003 else 'SportStep')
            p002_body_ok = cur_p002.get('bodyHtml') == (init_p002.get('bodyHtml') if init_p002 else '')
            p003_body_ok = cur_p003.get('bodyHtml') == (init_p003.get('bodyHtml') if init_p003 else '')
            if p002_vendor_ok and p003_vendor_ok and p002_body_ok and p003_body_ok:
                print(f'PASS: Component 5 — prod-002 (vendor={cur_p002.get("vendor")}) and prod-003 (vendor={cur_p003.get("vendor")}) are unchanged (0.10 pts)')
                total_score += 0.10
            else:
                issues = []
                if not p002_vendor_ok:
                    issues.append(f'prod-002 vendor changed: {init_p002.get("vendor")} → {cur_p002.get("vendor")}')
                if not p003_vendor_ok:
                    issues.append(f'prod-003 vendor changed: {init_p003.get("vendor")} → {cur_p003.get("vendor")}')
                if not p002_body_ok:
                    issues.append('prod-002 bodyHtml changed')
                if not p003_body_ok:
                    issues.append('prod-003 bodyHtml changed')
                print(f'FAIL: Component 5 — non-target products were modified: {"; ".join(issues)}')
    except Exception as e:
        print(f'ERROR: Component 5 — {e}')

    final_score = min(total_score, 1.0)
    print(f'\nScore: {total_score:.2f}/1.0')
    print(f'REWARD: {final_score}')
    return final_score


verify_task()
