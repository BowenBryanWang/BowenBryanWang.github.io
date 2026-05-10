"""
Reward Script: Research expense tracker update with ICML 2025 conference registration fee
Task ID: xplat_personal_016
Domain: gmail_mock, libreoffice_calc, notion_mock
Scoring:
  This task involves three components across three apps:
  1. Check Gmail (Dr. Hoffman email read)
  2. Update research_expenses.xlsx with ICML 2025 $650 conference fee
  3. Update Notion Thesis Progress page with advisor feedback and ICML milestone

  NOTE: Since gmail_mock and notion_mock share the same SID across both initial and
  golden VMs, their /go endpoint returns the same current_state on both VMs. The mock
  web states (gmail, notion) are therefore EQUAL on initial_env and golden_env and
  cannot serve as scoring discriminators. Only the local spreadsheet file truly differs
  between initial_env and golden_env.

  The gmail and notion components are verified as INFORMATIONAL PRECONDITIONS only —
  they confirm the golden state was set up correctly, but do not contribute to score.

  Scoring components (all from spreadsheet file):
  - Component 1 (0.40 pts): New row with $650 amount exists in spreadsheet
  - Component 2 (0.30 pts): Description of new row mentions ICML 2025 / conference registration
  - Component 3 (0.30 pts): Category of new row is 'Conference' (or similar)
  Total: 1.0

  Litmus: All components FAIL on initial_env (no new row), PASS on golden_env.
"""

import sys
import os

# --- Spreadsheet path ---
SPREADSHEET_PATH = '/home/user/Documents/research_expenses.xlsx'

# --- Precondition gate: ensure spreadsheet exists ---
if not os.path.exists(SPREADSHEET_PATH):
    print(f'CRITICAL: Spreadsheet not found at {SPREADSHEET_PATH}')
    print('REWARD: 0.0')
    sys.exit(0)

try:
    import openpyxl
except ImportError:
    print('CRITICAL: openpyxl not available')
    print('REWARD: 0.0')
    sys.exit(0)

try:
    wb = openpyxl.load_workbook(SPREADSHEET_PATH)
except Exception as e:
    print(f'CRITICAL: Cannot load spreadsheet: {e}')
    print('REWARD: 0.0')
    sys.exit(0)

ws = wb.active

# Collect all data rows (skip header row 1)
data_rows = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if any(cell is not None for cell in row):
        data_rows.append(row)

print(f'INFO: Spreadsheet has {len(data_rows)} data rows (initial: 3, golden: 4 expected)')


def verify_task():
    total_score = 0.0

    # Track the $650 row across components
    found_650_row = None

    # ==================================================================
    # Component 1: New row with $650 conference fee added (0.40 pts)
    # Task requires adding the ICML conference registration fee of $650.
    # Initial env has 3 data rows; golden env has 4 data rows with $650.
    # This FAILS on initial_env (no $650 row) and PASSES on golden_env.
    # ==================================================================
    try:
        for row in data_rows:
            # row = (Date, Description, Amount, Category, Reimbursed)
            amount = row[2] if len(row) > 2 else None
            try:
                amount_val = float(amount) if amount is not None else None
            except (ValueError, TypeError):
                amount_val = None
            if amount_val is not None and abs(amount_val - 650.0) < 0.01:
                found_650_row = row
                break

        if found_650_row is not None:
            print(f'PASS: Component 1 — Found row with $650 amount: '
                  f'row={found_650_row} (0.40 pts)')
            total_score += 0.40
        else:
            print(f'FAIL: Component 1 — No row with $650 conference fee found '
                  f'(spreadsheet has {len(data_rows)} data rows)')
    except Exception as e:
        print(f'ERROR: Component 1 — {e}')

    # ==================================================================
    # Component 2: Description of $650 row mentions ICML/conference (0.30 pts)
    # Task specifies the fee is for "ICML conference registration".
    # This FAILS on initial_env (no $650 row) and PASSES on golden_env.
    # ==================================================================
    try:
        if found_650_row is not None:
            description = str(found_650_row[1]).lower() if len(found_650_row) > 1 and found_650_row[1] else ''
            keywords_desc = ['icml', 'conference', 'registration']
            desc_ok = any(kw in description for kw in keywords_desc)

            if desc_ok:
                print(f'PASS: Component 2 — Description mentions ICML/conference: '
                      f'"{found_650_row[1]}" (0.30 pts)')
                total_score += 0.30
            else:
                print(f'FAIL: Component 2 — $650 row description does not mention '
                      f'ICML/conference/registration: "{found_650_row[1]}"')
        else:
            print(f'FAIL: Component 2 — Cannot check description (no $650 row found)')
    except Exception as e:
        print(f'ERROR: Component 2 — {e}')

    # ==================================================================
    # Component 3: Category of $650 row is 'Conference' (0.30 pts)
    # Task context specifies Category should be 'Conference'.
    # This FAILS on initial_env (no $650 row) and PASSES on golden_env.
    # ==================================================================
    try:
        if found_650_row is not None:
            category = str(found_650_row[3]).lower() if len(found_650_row) > 3 and found_650_row[3] else ''
            category_ok = 'conference' in category

            if category_ok:
                print(f'PASS: Component 3 — Category contains "conference": '
                      f'"{found_650_row[3]}" (0.30 pts)')
                total_score += 0.30
            else:
                print(f'FAIL: Component 3 — Category does not contain "conference": '
                      f'"{found_650_row[3]}" (expected "Conference" or similar)')
        else:
            print(f'FAIL: Component 3 — Cannot check category (no $650 row found)')
    except Exception as e:
        print(f'ERROR: Component 3 — {e}')

    # ==================================================================
    # INFORMATIONAL: Gmail and Notion state (not scored)
    # These pass on BOTH initial_env and golden_env since they share the same
    # SID and the mock server state was already patched for both VMs.
    # ==================================================================
    import requests
    try:
        sid = open('/tmp/task_web_sid').read().strip()
        gmail_data = requests.get(f'https://cua-gym-gmail.xlang.ai/go?sid={sid}', timeout=15).json()
        gmail_initial = gmail_data.get('initial_state', {})
        gmail_current = gmail_data.get('current_state', {})
        initial_emails = {e['id']: e for e in gmail_initial.get('emails', [])}
        current_emails = {e['id']: e for e in gmail_current.get('emails', [])}
        e1_read = current_emails.get('e1', {}).get('read', False)
        e2_read = current_emails.get('e2', {}).get('read', False)
        print(f'INFO (not scored): Gmail e1 read={e1_read}, e2 read={e2_read}')
    except Exception as e:
        print(f'INFO (not scored): Gmail state unavailable: {e}')

    try:
        sid = open('/tmp/task_web_sid').read().strip()
        notion_data = requests.get(f'https://cua-gym-notion.xlang.ai/go?sid={sid}', timeout=15).json()
        notion_initial = notion_data.get('initial_state', {})
        notion_current = notion_data.get('current_state', {})
        initial_block_ids = set(notion_initial.get('blocks', {}).keys())
        current_block_ids = set(notion_current.get('blocks', {}).keys())
        new_blocks = current_block_ids - initial_block_ids
        print(f'INFO (not scored): Notion new blocks in current_state: {sorted(new_blocks)}')
    except Exception as e:
        print(f'INFO (not scored): Notion state unavailable: {e}')

    # ==================================================================
    # Final score
    # ==================================================================
    final_score = min(total_score, 1.0)
    print(f'\nScore breakdown: {total_score}/1.0')
    print(f'REWARD: {final_score}')
    return final_score


verify_task()
