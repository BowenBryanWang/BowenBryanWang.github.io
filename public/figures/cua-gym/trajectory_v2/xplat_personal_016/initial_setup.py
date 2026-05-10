"""
Initial Setup: Cross-platform personal task — Gmail + LibreOffice Calc + Notion
Task ID: xplat_personal_016
Domain: gmail_mock, libreoffice_calc, notion_mock
"""

import copy
import json
import os
import shlex
import subprocess
import time
import uuid

import openpyxl
import requests

# ── Config ────────────────────────────────────────────────────────────────────
TASK_ID   = 'xplat_personal_016'
WORKDIR   = '/home/user'
DOC_DIR   = f'{WORKDIR}/Documents'
CALC_FILE = f'{DOC_DIR}/research_expenses.xlsx'

GMAIL_URL  = 'https://cua-gym-gmail.xlang.ai'
NOTION_URL = 'https://cua-gym-notion.xlang.ai'

# ── Session ID ─────────────────────────────────────────────────────────────────
sid = str(uuid.uuid4())
with open('/tmp/task_web_sid', 'w') as f:
    f.write(sid)
print(f'Session ID: {sid}')

# ── Helper ────────────────────────────────────────────────────────────────────
def launch_gui(command: str, delay_sec: float = 1.0):
    """Launch GUI app on the VM display without blocking script exit."""
    env = os.environ.copy()
    env['DISPLAY'] = ':0'
    subprocess.Popen(
        shlex.split(command),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env=env,
    )
    time.sleep(delay_sec)


# ══════════════════════════════════════════════════════════════════════════════
# 1. LibreOffice Calc — create research_expenses.xlsx
# ══════════════════════════════════════════════════════════════════════════════
os.makedirs(DOC_DIR, exist_ok=True)

wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'Expenses'

# Headers
headers = ['Date', 'Description', 'Amount', 'Category', 'Reimbursed']
for col, h in enumerate(headers, 1):
    ws.cell(row=1, column=col, value=h)

# Existing expense rows (no conference row — agent must add that)
rows = [
    ('2025-01-15', 'Survey platform subscription',    120.00, 'Software', 'Yes'),
    ('2025-02-01', 'Interview transcription service',   85.00, 'Services', 'Yes'),
    ('2025-02-20', 'Reference books',                   67.50, 'Materials', 'No'),
]
for r, row_data in enumerate(rows, 2):
    for c, val in enumerate(row_data, 1):
        ws.cell(row=r, column=c, value=val)

wb.save(CALC_FILE)
print(f'Calc file created: {CALC_FILE}')


# ══════════════════════════════════════════════════════════════════════════════
# 2. Gmail mock — inject initial state
# ══════════════════════════════════════════════════════════════════════════════
gmail_state = {
    'user': {
        'userId':   'u1',
        'username': 'Anika Patel',
        'email':    'anika.patel@university.edu',
        'avatar':   '',
    },
    'emails': [
        {
            'id':        'e1',
            'threadId':  'thread_e1',
            'from':      {'name': 'Dr. Sarah Hoffman', 'email': 's.hoffman@university.edu', 'avatar': ''},
            'to':        [{'name': 'Anika Patel', 'email': 'anika.patel@university.edu'}],
            'cc':        [],
            'bcc':       [],
            'subject':   'Chapter 3 feedback',
            'body':      (
                'Anika, I reviewed your Chapter 3 draft. The methodology section is strong, '
                'but the literature review needs to engage more with the recent work by Zhang et al. (2024). '
                'Also, your analysis of the qualitative data could use more triangulation. '
                'Please revise and resubmit by March 20. '
                'Also, your ICML conference registration was approved — the fee is $650. '
                'Submit a reimbursement request.'
            ),
            'timestamp': '2025-03-10T09:15:00Z',
            'read':      False,
            'starred':   False,
            'important': False,
            'labels':    [],
            'category':  'primary',
            'folder':    'inbox',
            'attachments': [],
        },
        {
            'id':        'e2',
            'threadId':  'thread_e2',
            'from':      {'name': 'ICML 2025', 'email': 'registration@icml.cc', 'avatar': ''},
            'to':        [{'name': 'Anika Patel', 'email': 'anika.patel@university.edu'}],
            'cc':        [],
            'bcc':       [],
            'subject':   'Registration confirmed',
            'body':      (
                'Your registration for ICML 2025 (July 13-19, Vienna) is confirmed. '
                'Student rate: $650.'
            ),
            'timestamp': '2025-03-09T14:22:00Z',
            'read':      False,
            'starred':   False,
            'important': False,
            'labels':    [],
            'category':  'primary',
            'folder':    'inbox',
            'attachments': [],
        },
        {
            'id':        'e3',
            'threadId':  'thread_e3',
            'from':      {'name': 'Library', 'email': 'library@university.edu', 'avatar': ''},
            'to':        [{'name': 'Anika Patel', 'email': 'anika.patel@university.edu'}],
            'cc':        [],
            'bcc':       [],
            'subject':   'Books due reminder',
            'body':      'You have 3 books due March 15.',
            'timestamp': '2025-03-08T08:00:00Z',
            'read':      False,
            'starred':   False,
            'important': False,
            'labels':    [],
            'category':  'primary',
            'folder':    'inbox',
            'attachments': [],
        },
    ],
    'labels': [
        {'id': 'l1', 'name': 'Work',     'color': '#ef4444'},
        {'id': 'l2', 'name': 'Personal', 'color': '#3b82f6'},
    ],
    'drafts': [],
}

resp = requests.post(
    f'{GMAIL_URL}/post?sid={sid}',
    json={'action': 'set', 'state': gmail_state},
    timeout=30,
)
assert resp.status_code == 200, f'Gmail state injection failed: {resp.text}'
print(f'Gmail state injected: sid={sid}')

# Verify
go = requests.get(f'{GMAIL_URL}/go?sid={sid}', timeout=10).json()
assert go['initial_state'] is not None, 'Gmail initial_state is None'
print('Gmail: initial_state and current_state confirmed.')


# ══════════════════════════════════════════════════════════════════════════════
# 3. Notion mock — inject initial state
# ══════════════════════════════════════════════════════════════════════════════
notion_state = {
    'user': {
        'id':     'user-1',
        'name':   'Anika Patel',
        'email':  'anika.patel@university.edu',
        'avatar': '',
    },
    'workspace': {
        'id':      'ws-1',
        'name':    "Anika's Research Workspace",
        'icon':    '',
        'members': ['user-1'],
    },
    'pages': {
        'p1': {
            'id':            'p1',
            'title':         'Thesis Progress',
            'icon':          '',
            'cover':         None,
            'parentId':      None,
            'blockIds':      [
                'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7',
            ],
            'favorite':      False,
            'createdDate':   '2025-01-01T00:00:00.000Z',
            'lastEditedDate':'2025-03-01T10:00:00.000Z',
            'properties':    {},
        },
    },
    'blocks': {
        'b1': {
            'id':            'b1',
            'type':          'heading-2',
            'content':       'Milestones',
            'properties':    {},
            'createdDate':   '2025-01-01T00:00:00.000Z',
            'lastEditedDate':'2025-01-01T00:00:00.000Z',
        },
        'b2': {
            'id':            'b2',
            'type':          'todo',
            'content':       'Chapter 1 - Introduction',
            'properties':    {'checked': True},
            'createdDate':   '2025-01-05T00:00:00.000Z',
            'lastEditedDate':'2025-01-10T00:00:00.000Z',
        },
        'b3': {
            'id':            'b3',
            'type':          'todo',
            'content':       'Chapter 2 - Literature Review',
            'properties':    {'checked': True},
            'createdDate':   '2025-02-01T00:00:00.000Z',
            'lastEditedDate':'2025-02-10T00:00:00.000Z',
        },
        'b4': {
            'id':            'b4',
            'type':          'todo',
            'content':       'Chapter 3 - Methodology',
            'properties':    {'checked': False},
            'createdDate':   '2025-02-15T00:00:00.000Z',
            'lastEditedDate':'2025-02-15T00:00:00.000Z',
        },
        'b5': {
            'id':            'b5',
            'type':          'heading-2',
            'content':       'Advisor Feedback',
            'properties':    {},
            'createdDate':   '2025-01-01T00:00:00.000Z',
            'lastEditedDate':'2025-01-01T00:00:00.000Z',
        },
        'b6': {
            'id':            'b6',
            'type':          'paragraph',
            'content':       'Feb 10: Chapter 2 approved with minor revisions.',
            'properties':    {},
            'createdDate':   '2025-02-10T00:00:00.000Z',
            'lastEditedDate':'2025-02-10T00:00:00.000Z',
        },
        # Extra background page for realism
        'b7': {
            'id':            'b7',
            'type':          'paragraph',
            'content':       'Jan 20: Chapter 1 feedback — strengthen the problem statement.',
            'properties':    {},
            'createdDate':   '2025-01-20T00:00:00.000Z',
            'lastEditedDate':'2025-01-20T00:00:00.000Z',
        },
    },
    'trash':          [],
    'comments':       {},
    'settings':       {'appearance': 'light', 'startWeekMonday': False, 'fontSize': 'default'},
    'notifications':  [],
    'pageOrder':      ['p1'],
    'focusBlockId':   None,
}

resp = requests.post(
    f'{NOTION_URL}/post?sid={sid}',
    json={'action': 'set', 'state': notion_state},
    timeout=30,
)
assert resp.status_code == 200, f'Notion state injection failed: {resp.text}'
print(f'Notion state injected: sid={sid}')

go = requests.get(f'{NOTION_URL}/go?sid={sid}', timeout=10).json()
assert go['initial_state'] is not None, 'Notion initial_state is None'
print('Notion: initial_state and current_state confirmed.')


# ══════════════════════════════════════════════════════════════════════════════
# 4. GUI startup — open LibreOffice Calc with the expense file, then Gmail
# ══════════════════════════════════════════════════════════════════════════════
launch_gui(f'libreoffice --calc "{CALC_FILE}"', delay_sec=3.0)
launch_gui(f'google-chrome "{GMAIL_URL}/?sid={sid}"', delay_sec=2.0)
print(f'GUI_READY: LibreOffice Calc + Gmail opened with DISPLAY=:0')
print(f'Notion URL (for reference): {NOTION_URL}/?sid={sid}')
