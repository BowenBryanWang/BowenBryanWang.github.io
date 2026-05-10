"""
Initial Setup: Vendor consolidation - set up products under BasicWear and HomeGoods vendors
Task ID: shopify_adv_005
Domain: shopify_admin_mock
Mock: shopify_admin_mock
"""
import json
import os
import shlex
import subprocess
import time
import uuid

import requests

# --- Config ---
BASE_URL = 'https://cua-gym-shopify-admin.xlang.ai'
sid = str(uuid.uuid4())

# Persist sid for golden_patch.py and reward.py
with open('/tmp/task_web_sid', 'w') as f:
    f.write(sid)
print(f'SID generated: {sid}')

# --- Build initial state ---
# 4 products: prod-001 (BasicWear), prod-002 (LeatherCo), prod-003 (SportStep), prod-004 (HomeGoods)
# MUST NOT have 'UnifiedBrands' as vendor — the task is to consolidate them
state = {
    "store": {
        "id": "store_1",
        "name": "Urban Market",
        "email": "admin@urbanmarket.myshopify.com",
        "phone": "+1-503-555-0100",
        "domain": "urbanmarket.myshopify.com",
        "customDomain": "www.urbanmarket.com",
        "address": {
            "address1": "456 Commerce Ave",
            "city": "Portland",
            "province": "Oregon",
            "provinceCode": "OR",
            "country": "United States",
            "countryCode": "US",
            "zip": "97201"
        },
        "currency": "USD",
        "timezone": "(GMT-08:00) Pacific Time",
        "weightUnit": "lb",
        "plan": "Shopify",
        "owner": {
            "firstName": "Jordan",
            "lastName": "Park",
            "email": "jordan@urbanmarket.com"
        },
        "createdAt": "2023-03-10T09:00:00Z"
    },
    "products": [
        {
            "id": "prod-001",
            "title": "Classic T-Shirt",
            "bodyHtml": "<p>Comfortable cotton t-shirt</p>",
            "vendor": "BasicWear",
            "productType": "Apparel",
            "handle": "classic-t-shirt",
            "status": "active",
            "tags": ["cotton", "basics", "casual"],
            "images": [
                {
                    "id": "img_001",
                    "src": "https://placehold.co/400x400/e8f5e9/2e7d32?text=T-Shirt",
                    "alt": "Classic T-Shirt",
                    "position": 1
                }
            ],
            "variants": [
                {
                    "id": "var_001_s",
                    "productId": "prod-001",
                    "title": "Small",
                    "price": "19.99",
                    "compareAtPrice": "24.99",
                    "sku": "BW-TS-SM",
                    "inventoryQuantity": 45,
                    "option1": "Small",
                    "option2": None,
                    "position": 1
                },
                {
                    "id": "var_001_m",
                    "productId": "prod-001",
                    "title": "Medium",
                    "price": "19.99",
                    "compareAtPrice": "24.99",
                    "sku": "BW-TS-MD",
                    "inventoryQuantity": 60,
                    "option1": "Medium",
                    "option2": None,
                    "position": 2
                },
                {
                    "id": "var_001_l",
                    "productId": "prod-001",
                    "title": "Large",
                    "price": "19.99",
                    "compareAtPrice": "24.99",
                    "sku": "BW-TS-LG",
                    "inventoryQuantity": 35,
                    "option1": "Large",
                    "option2": None,
                    "position": 3
                }
            ],
            "options": [
                {"id": "opt_001", "name": "Size", "position": 1, "values": ["Small", "Medium", "Large"]}
            ],
            "collections": ["col_001"],
            "createdAt": "2023-05-12T10:00:00Z",
            "updatedAt": "2024-11-20T14:30:00Z"
        },
        {
            "id": "prod-002",
            "title": "Leather Wallet",
            "bodyHtml": "<p>Premium leather bifold wallet</p>",
            "vendor": "LeatherCo",
            "productType": "Accessories",
            "handle": "leather-wallet",
            "status": "active",
            "tags": ["leather", "wallet", "accessories"],
            "images": [
                {
                    "id": "img_002",
                    "src": "https://placehold.co/400x400/fce8d5/7b3f00?text=Wallet",
                    "alt": "Leather Wallet",
                    "position": 1
                }
            ],
            "variants": [
                {
                    "id": "var_002_bk",
                    "productId": "prod-002",
                    "title": "Black",
                    "price": "49.99",
                    "compareAtPrice": "65.00",
                    "sku": "LC-WL-BK",
                    "inventoryQuantity": 28,
                    "option1": "Black",
                    "option2": None,
                    "position": 1
                },
                {
                    "id": "var_002_br",
                    "productId": "prod-002",
                    "title": "Brown",
                    "price": "49.99",
                    "compareAtPrice": "65.00",
                    "sku": "LC-WL-BR",
                    "inventoryQuantity": 22,
                    "option1": "Brown",
                    "option2": None,
                    "position": 2
                }
            ],
            "options": [
                {"id": "opt_002", "name": "Color", "position": 1, "values": ["Black", "Brown"]}
            ],
            "collections": ["col_002"],
            "createdAt": "2023-06-05T11:00:00Z",
            "updatedAt": "2024-10-15T09:45:00Z"
        },
        {
            "id": "prod-003",
            "title": "Running Shoes",
            "bodyHtml": "<p>Lightweight running shoes for everyday use</p>",
            "vendor": "SportStep",
            "productType": "Footwear",
            "handle": "running-shoes",
            "status": "active",
            "tags": ["running", "shoes", "sport", "athletic"],
            "images": [
                {
                    "id": "img_003",
                    "src": "https://placehold.co/400x400/e3f2fd/1565c0?text=Running+Shoes",
                    "alt": "Running Shoes",
                    "position": 1
                }
            ],
            "variants": [
                {
                    "id": "var_003_8",
                    "productId": "prod-003",
                    "title": "Size 8",
                    "price": "89.99",
                    "compareAtPrice": "110.00",
                    "sku": "SS-RS-8",
                    "inventoryQuantity": 18,
                    "option1": "Size 8",
                    "option2": None,
                    "position": 1
                },
                {
                    "id": "var_003_9",
                    "productId": "prod-003",
                    "title": "Size 9",
                    "price": "89.99",
                    "compareAtPrice": "110.00",
                    "sku": "SS-RS-9",
                    "inventoryQuantity": 24,
                    "option1": "Size 9",
                    "option2": None,
                    "position": 2
                },
                {
                    "id": "var_003_10",
                    "productId": "prod-003",
                    "title": "Size 10",
                    "price": "89.99",
                    "compareAtPrice": "110.00",
                    "sku": "SS-RS-10",
                    "inventoryQuantity": 15,
                    "option1": "Size 10",
                    "option2": None,
                    "position": 3
                }
            ],
            "options": [
                {"id": "opt_003", "name": "Size", "position": 1, "values": ["Size 8", "Size 9", "Size 10"]}
            ],
            "collections": ["col_003"],
            "createdAt": "2023-07-20T08:00:00Z",
            "updatedAt": "2024-09-30T16:00:00Z"
        },
        {
            "id": "prod-004",
            "title": "Ceramic Mug",
            "bodyHtml": "<p>Hand-crafted ceramic mug</p>",
            "vendor": "HomeGoods",
            "productType": "Kitchen",
            "handle": "ceramic-mug",
            "status": "active",
            "tags": ["ceramic", "mug", "kitchen", "handmade"],
            "images": [
                {
                    "id": "img_004",
                    "src": "https://placehold.co/400x400/fff3e0/e65100?text=Ceramic+Mug",
                    "alt": "Ceramic Mug",
                    "position": 1
                }
            ],
            "variants": [
                {
                    "id": "var_004_wh",
                    "productId": "prod-004",
                    "title": "White",
                    "price": "22.00",
                    "compareAtPrice": "28.00",
                    "sku": "HG-MG-WH",
                    "inventoryQuantity": 40,
                    "option1": "White",
                    "option2": None,
                    "position": 1
                },
                {
                    "id": "var_004_bl",
                    "productId": "prod-004",
                    "title": "Blue",
                    "price": "22.00",
                    "compareAtPrice": "28.00",
                    "sku": "HG-MG-BL",
                    "inventoryQuantity": 30,
                    "option1": "Blue",
                    "option2": None,
                    "position": 2
                }
            ],
            "options": [
                {"id": "opt_004", "name": "Color", "position": 1, "values": ["White", "Blue"]}
            ],
            "collections": ["col_004"],
            "createdAt": "2023-08-01T12:00:00Z",
            "updatedAt": "2024-12-05T11:20:00Z"
        }
    ],
    "collections": [
        {
            "id": "col_001",
            "title": "Apparel",
            "bodyHtml": "<p>Everyday clothing essentials</p>",
            "handle": "apparel",
            "collectionType": "manual",
            "productIds": ["prod-001"],
            "productsCount": 1,
            "sortOrder": "best-selling",
            "publishedAt": "2023-05-12T10:00:00Z",
            "updatedAt": "2024-11-20T14:30:00Z",
            "image": None
        },
        {
            "id": "col_002",
            "title": "Accessories",
            "bodyHtml": "<p>Premium accessories for every occasion</p>",
            "handle": "accessories",
            "collectionType": "manual",
            "productIds": ["prod-002"],
            "productsCount": 1,
            "sortOrder": "best-selling",
            "publishedAt": "2023-06-05T11:00:00Z",
            "updatedAt": "2024-10-15T09:45:00Z",
            "image": None
        },
        {
            "id": "col_003",
            "title": "Footwear",
            "bodyHtml": "<p>Sport and casual footwear</p>",
            "handle": "footwear",
            "collectionType": "manual",
            "productIds": ["prod-003"],
            "productsCount": 1,
            "sortOrder": "best-selling",
            "publishedAt": "2023-07-20T08:00:00Z",
            "updatedAt": "2024-09-30T16:00:00Z",
            "image": None
        },
        {
            "id": "col_004",
            "title": "Kitchen & Home",
            "bodyHtml": "<p>Hand-crafted home essentials</p>",
            "handle": "kitchen-home",
            "collectionType": "manual",
            "productIds": ["prod-004"],
            "productsCount": 1,
            "sortOrder": "best-selling",
            "publishedAt": "2023-08-01T12:00:00Z",
            "updatedAt": "2024-12-05T11:20:00Z",
            "image": None
        }
    ],
    "orders": [
        {
            "id": "order_001",
            "name": "#1001",
            "orderNumber": 1001,
            "email": "maya.thompson@example.com",
            "financialStatus": "paid",
            "fulfillmentStatus": "fulfilled",
            "currency": "USD",
            "subtotalPrice": "19.99",
            "totalShippingPrice": "5.99",
            "totalTax": "1.60",
            "totalDiscounts": "0.00",
            "totalPrice": "27.58",
            "lineItems": [
                {
                    "id": "li_001",
                    "productId": "prod-001",
                    "variantId": "var_001_m",
                    "title": "Classic T-Shirt",
                    "variantTitle": "Medium",
                    "quantity": 1,
                    "price": "19.99",
                    "sku": "BW-TS-MD",
                    "fulfillmentStatus": "fulfilled"
                }
            ],
            "customer": {"id": "cust_001", "firstName": "Maya", "lastName": "Thompson", "email": "maya.thompson@example.com"},
            "shippingAddress": {"address1": "789 Oak Street", "city": "Seattle", "province": "Washington", "provinceCode": "WA", "country": "United States", "countryCode": "US", "zip": "98101"},
            "billingAddress": {"address1": "789 Oak Street", "city": "Seattle", "province": "Washington", "provinceCode": "WA", "country": "United States", "countryCode": "US", "zip": "98101"},
            "note": "",
            "tags": [],
            "discountCodes": [],
            "timeline": [
                {"id": "evt_001_1", "type": "created", "message": "Order placed", "createdAt": "2025-01-10T14:30:00Z", "user": None},
                {"id": "evt_001_2", "type": "fulfilled", "message": "Order fulfilled", "createdAt": "2025-01-11T10:00:00Z", "user": "jordan@urbanmarket.com"}
            ],
            "createdAt": "2025-01-10T14:30:00Z",
            "updatedAt": "2025-01-11T10:00:00Z"
        },
        {
            "id": "order_002",
            "name": "#1002",
            "orderNumber": 1002,
            "email": "carlos.rivera@example.com",
            "financialStatus": "paid",
            "fulfillmentStatus": None,
            "currency": "USD",
            "subtotalPrice": "49.99",
            "totalShippingPrice": "7.99",
            "totalTax": "4.00",
            "totalDiscounts": "0.00",
            "totalPrice": "61.98",
            "lineItems": [
                {
                    "id": "li_002",
                    "productId": "prod-002",
                    "variantId": "var_002_bk",
                    "title": "Leather Wallet",
                    "variantTitle": "Black",
                    "quantity": 1,
                    "price": "49.99",
                    "sku": "LC-WL-BK",
                    "fulfillmentStatus": None
                }
            ],
            "customer": {"id": "cust_002", "firstName": "Carlos", "lastName": "Rivera", "email": "carlos.rivera@example.com"},
            "shippingAddress": {"address1": "321 Pine Ave", "city": "San Francisco", "province": "California", "provinceCode": "CA", "country": "United States", "countryCode": "US", "zip": "94102"},
            "billingAddress": {"address1": "321 Pine Ave", "city": "San Francisco", "province": "California", "provinceCode": "CA", "country": "United States", "countryCode": "US", "zip": "94102"},
            "note": "",
            "tags": [],
            "discountCodes": [],
            "timeline": [
                {"id": "evt_002_1", "type": "created", "message": "Order placed", "createdAt": "2025-01-15T09:00:00Z", "user": None}
            ],
            "createdAt": "2025-01-15T09:00:00Z",
            "updatedAt": "2025-01-15T09:00:00Z"
        }
    ],
    "customers": [
        {
            "id": "cust_001",
            "firstName": "Maya",
            "lastName": "Thompson",
            "email": "maya.thompson@example.com",
            "phone": "+1-206-555-0123",
            "state": "enabled",
            "ordersCount": 1,
            "totalSpent": "27.58",
            "note": "",
            "tags": [],
            "taxExempt": False,
            "verifiedEmail": True,
            "acceptsMarketing": True,
            "defaultAddress": {
                "address1": "789 Oak Street",
                "city": "Seattle",
                "province": "Washington",
                "provinceCode": "WA",
                "country": "United States",
                "countryCode": "US",
                "zip": "98101"
            },
            "createdAt": "2024-12-01T10:00:00Z",
            "updatedAt": "2025-01-10T14:30:00Z"
        },
        {
            "id": "cust_002",
            "firstName": "Carlos",
            "lastName": "Rivera",
            "email": "carlos.rivera@example.com",
            "phone": "+1-415-555-0456",
            "state": "enabled",
            "ordersCount": 1,
            "totalSpent": "61.98",
            "note": "",
            "tags": [],
            "taxExempt": False,
            "verifiedEmail": True,
            "acceptsMarketing": False,
            "defaultAddress": {
                "address1": "321 Pine Ave",
                "city": "San Francisco",
                "province": "California",
                "provinceCode": "CA",
                "country": "United States",
                "countryCode": "US",
                "zip": "94102"
            },
            "createdAt": "2024-11-15T08:00:00Z",
            "updatedAt": "2025-01-15T09:00:00Z"
        }
    ],
    "discounts": [
        {
            "id": "disc_001",
            "title": "Spring Sale",
            "code": "SPRING10",
            "type": "percentage",
            "value": "10",
            "status": "active",
            "appliesTo": "all",
            "appliesToIds": [],
            "minimumRequirement": "none",
            "minimumValue": "0",
            "customerEligibility": "all",
            "usageLimit": None,
            "usageCount": 12,
            "oncePerCustomer": False,
            "startsAt": "2025-03-01T00:00:00Z",
            "endsAt": "2025-04-30T23:59:59Z",
            "createdAt": "2025-02-20T10:00:00Z"
        }
    ],
    "draftOrders": [],
    "giftCards": [],
    "analytics": {
        "dailyMetrics": [
            {
                "date": "2025-01-15",
                "totalSales": 320.50,
                "ordersCount": 5,
                "onlineStoreSessions": 142,
                "returningCustomerRate": 0.28,
                "conversionRate": 0.035,
                "averageOrderValue": 64.10,
                "topProducts": [
                    {"productId": "prod-002", "title": "Leather Wallet", "quantity": 3, "revenue": 149.97},
                    {"productId": "prod-003", "title": "Running Shoes", "quantity": 2, "revenue": 179.98}
                ],
                "topReferrers": [{"source": "google", "sessions": 67}, {"source": "instagram", "sessions": 34}],
                "sessionsByLocation": [{"country": "United States", "sessions": 118}, {"country": "Canada", "sessions": 24}]
            }
        ],
        "totalSalesThisMonth": 4250.75,
        "totalOrdersThisMonth": 68,
        "totalSessionsThisMonth": 2840
    },
    "pages": [
        {
            "id": "page_001",
            "title": "About Us",
            "handle": "about-us",
            "bodyHtml": "<h2>Our Story</h2><p>Urban Market was founded in 2023 to bring together the best in everyday essentials from trusted vendors.</p>",
            "published": True,
            "createdAt": "2023-03-15T10:00:00Z",
            "updatedAt": "2024-08-20T14:00:00Z"
        },
        {
            "id": "page_002",
            "title": "Contact",
            "handle": "contact",
            "bodyHtml": "<h2>Get In Touch</h2><p>Email us at support@urbanmarket.com or call +1-503-555-0100.</p>",
            "published": True,
            "createdAt": "2023-03-15T10:00:00Z",
            "updatedAt": "2024-06-10T09:30:00Z"
        }
    ],
    "blogPosts": [
        {
            "id": "blog_001",
            "title": "Spring Collection Now Available",
            "author": "Jordan Park",
            "bodyHtml": "<p>We're thrilled to announce our spring collection is now live on the store!</p>",
            "handle": "spring-collection",
            "tags": ["news", "collection"],
            "published": True,
            "publishedAt": "2025-03-01T09:00:00Z",
            "createdAt": "2025-02-28T16:00:00Z"
        }
    ],
    "navigationMenus": [
        {
            "id": "nav_001",
            "title": "Main Menu",
            "handle": "main-menu",
            "items": [
                {"id": "nav_item_001", "title": "Home", "url": "/", "position": 1, "children": []},
                {"id": "nav_item_002", "title": "Shop", "url": "/collections/all", "position": 2, "children": []},
                {"id": "nav_item_003", "title": "About", "url": "/pages/about-us", "position": 3, "children": []}
            ]
        }
    ],
    "settings": {
        "storeName": "Urban Market",
        "storeEmail": "admin@urbanmarket.myshopify.com",
        "senderEmail": "noreply@urbanmarket.com",
        "storePhone": "+1-503-555-0100",
        "currency": "USD",
        "timezone": "(GMT-08:00) Pacific Time",
        "weightUnit": "lb"
    }
}

# --- Inject state ---
resp = requests.post(
    f'{BASE_URL}/post?sid={sid}',
    json={'action': 'set', 'state': state},
    timeout=30
)
assert resp.status_code == 200, f'State injection failed: {resp.text}'
print(f'State injected: sid={sid}')

# --- Verify ---
go = requests.get(f'{BASE_URL}/go?sid={sid}', timeout=10).json()
assert go['initial_state'] is not None, 'initial_state is None after injection'
print('Verified: initial_state and current_state are set')

# --- Launch browser ---
def launch_gui(command, delay_sec=1.0):
    env = os.environ.copy()
    env['DISPLAY'] = ':0'
    subprocess.Popen(
        shlex.split(command),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env=env,
    )
    time.sleep(delay_sec)

launch_gui(f'google-chrome "{BASE_URL}/?sid={sid}"', delay_sec=2.0)
print(f'GUI_READY: launched browser at {BASE_URL}/?sid={sid}')
