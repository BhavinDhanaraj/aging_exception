# API Documentation & Service Reference

This document provides a comprehensive reference for the frontend API service layer ([`src/services/api.ts`](../src/services/api.ts)) and its corresponding backend endpoints in the Express server ([`server.ts`](../server.ts)).

---

## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Data Types & Interfaces](#data-types--interfaces)
3. [Endpoint Reference](#endpoint-reference)
   - [1. Base Data (`fetchBaseData`)](#1-base-data-fetchbasedata)
   - [2. Exceptions Management (`fetchExceptions`)](#2-exceptions-management-fetchexceptions)
   - [3. Workflow Decisions (`submitDecisions`)](#3-workflow-decisions-submitdecisions)
   - [4. Ownership Reassignment (`reassignRows`)](#4-ownership-reassignment-reassignrows)
   - [5. Audit Log (`fetchAuditLog`)](#5-audit-log-fetchauditlog)
   - [6. Pipeline Run History (`fetchRunHistory`)](#6-pipeline-run-history-fetchrunhistory)
   - [7. Manual Run Trigger (`triggerManualRun`)](#7-manual-run-trigger-triggermanualrun)
   - [8. Configuration Retrieval (`fetchConfig`)](#8-configuration-retrieval-fetchconfig)
   - [9. Configuration Update (`updateConfig`)](#9-configuration-update-updateconfig)
   - [10. Grounded Chat Query (`sendChatMessage`)](#10-grounded-chat-query-sendchatmessage)
4. [Error Handling & Best Practices](#error-handling--best-practices)

---

## Overview & Architecture

The Aging & Exception Management Platform employs a clean separation of concerns:
- **Client Layer (`src/services/api.ts`)**: Pure TypeScript client wrapper using `fetch`. Serializes query strings cleanly, enforces strict payload and return typings, and unwraps JSON responses.
- **Backend Layer (`server.ts`)**: Express server providing RESTful endpoints. Manages in-memory state for exceptions, audit logs, run histories, and dynamic configuration rules.

```
+---------------------------+        REST / JSON        +--------------------------+
|  React UI Components      | <-----------------------> |  Express Server API      |
|  (App, Views, Drawers)    |     src/services/api.ts   |  server.ts               |
+---------------------------+                           +--------------------------+
```

---

## Data Types & Interfaces

All request and response types are declared in [`src/types/index.ts`](../src/types/index.ts).

### Core Data Models

```typescript
export interface ExceptionRow {
  id: string;             // Display ID (e.g. EXC-00104)
  rowId: string;          // Unique row GUID
  sku: string;            // Stock Keeping Unit
  cat: string;            // Category (Apparel, Footwear, Home, Beauty, etc.)
  om: string;             // Operating Model (Fast Fashion, Seasonal Core, Replen Tail, etc.)
  band: 'Active' | 'Watch' | 'Aged' | 'Terminal';
  days: number;           // Days past policy threshold
  units: number;          // On-hand inventory count
  v: number;              // Total book inventory value ($)
  cost: number;           // Total landed cost ($)
  loss: number;           // Estimated markdown / write-down loss ($)
  code: string;           // Recommended action code (MD15, MD30, OUTLET, LIQ, DONATE, WRITE_OFF)
  owner: string;          // Assigned owner (Merch, Brett, Vanesse, Reagan, Tom, Graham)
  status: 'Pending' | 'Accepted' | 'Modified' | 'Rejected';
  comment?: string;       // Latest resolution comment
}

export interface AuditEntry {
  id: string;             // Audit ID (e.g. AUD-A1B2C3)
  ts: string;             // ISO-8601 Timestamp
  sku: string;
  cat: string;
  actor: string;          // User who took the action
  action: 'Accepted' | 'Modified' | 'Rejected';
  prev: string;           // Previous status (typically 'Pending')
  comment: string;        // Justification or note
  value: number;          // Monetary value of SKU
  code: string;           // Action code applied
}

export interface RunEntry {
  id: string;             // Run Identifier (e.g. RUN-618)
  ts: string;             // Run timestamp
  trigger: 'Scheduled' | 'Manual';
  status: 'Completed' | 'Running' | 'Failed';
  recs: number;           // Total inventory records scanned
  exc: number;            // Exceptions detected
  issues: number;         // Flagged data anomalies
  dur: number;            // Duration in seconds
}

export interface AppConfig {
  days: Record<string, Record<string, number>>; // Threshold matrix [OperatingModel][Band]
  tier: Record<string, { min: number; max: number }>;
  catAction: Record<string, string>;             // Category action overrides
  assign: Record<string, string>;                // Category-Action to Owner mapping
  autoMonitor: boolean;                          // Auto-monitor healthy SKUs
  autoCap: number;                               // Auto-approval dollar limit
  teams: boolean;                                // Microsoft Teams webhook
  sharepoint: boolean;                           // SharePoint sync
  email: boolean;                                // Email digest
  slaHours: number;                              // Default SLA response window
  schedule: string;                              // Cron schedule string
  slaClocks: Record<string, number>;             // SLA days per band (Watch: 30, Aged: 14, Terminal: 7)
}
```

---

## Endpoint Reference

### 1. Base Data (`fetchBaseData`)
Retrieves foundational metadata, KPIs, and pre-computed aggregation matrixes across categories and operating models.

* **Client Method**: `fetchBaseData()`
* **Endpoint**: `GET /api/data`
* **Request Params**: None
* **Response Payload**:
  ```json
  {
    "meta": {
      "now": "2026-09-28T00:00:00.000Z",
      "kpi": { "totalV": 184500000, "atRiskV": 48200000, "loss": 12800000, "recover": 35400000 },
      "bandTot": { ... },
      "catRisk": { ... },
      "actions": [ ... ]
    },
    "omBand": { "Fast Fashion|Terminal": { "n": 1420, "u": 42100, "v": 4500000 } },
    "catBand": { "Apparel|Aged": { "n": 2840, "u": 89000, "v": 8100000 } },
    "catOmBand": { ... }
  }
  ```

---

### 2. Exceptions Management (`fetchExceptions`)
Queries exception rows with real-time dynamic filtering, multi-field search, pagination, and multi-column sorting.

* **Client Method**: `fetchExceptions(params?: ExceptionsQueryParams)`
* **Endpoint**: `GET /api/exceptions`
* **Query Parameters (`ExceptionsQueryParams`)**:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | No | Target page number (default: `1`) |
| `limit` | `number` | No | Number of items per page (default: `60`) |
| `q` | `string` | No | Search string matching SKU, Category, Operating Model, or ID |
| `cat` | `string` | No | Filter by Category (e.g. `Apparel`, `Footwear`, `Home`) |
| `om` | `string` | No | Filter by Operating Model (e.g. `Fast Fashion`, `Seasonal Core`) |
| `band` | `string` | No | Filter by Band (`Active`, `Watch`, `Aged`, `Terminal`) |
| `code` | `string` | No | Filter by Action Code (`MD15`, `MD30`, `OUTLET`, `LIQ`, etc.) |
| `owner` | `string` | No | Filter by Assigned Owner (`Brett`, `Vanesse`, `Merch`, etc.) |
| `status` | `string` | No | Filter by Status (`Pending`, `Accepted`, `Modified`, `Rejected`) |
| `sortKey` | `string` | No | Sort column (`v`, `loss`, `days`, `sku`, `owner`, `code`, etc.) |
| `sortDir` | `number` | No | Sort direction: `1` (Ascending) or `-1` (Descending) |

* **Response Payload**:
  ```json
  {
    "rows": [
      {
        "id": "EXC-00104",
        "rowId": "row-4982a",
        "sku": "SKU-992144",
        "cat": "Apparel",
        "om": "Fast Fashion",
        "band": "Terminal",
        "days": 94,
        "units": 650,
        "v": 32500,
        "cost": 16250,
        "loss": 9750,
        "code": "OUTLET",
        "owner": "Brett",
        "status": "Pending"
      }
    ],
    "total": 1420,
    "page": 1,
    "limit": 60,
    "totalPages": 24,
    "totV": 14820000,
    "totL": 4200000,
    "pendCount": 842
  }
  ```

---

### 3. Workflow Decisions (`submitDecisions`)
Applies decisions to one or more exception items and records individual audit trail entries.

* **Client Method**: `submitDecisions(payload)`
* **Endpoint**: `POST /api/decisions`
* **Request Body**:
  ```json
  {
    "rowIds": ["row-4982a", "row-8812c"],
    "status": "Accepted",
    "comment": "Approved markdown for upcoming seasonal changeover.",
    "actor": "Brett"
  }
  ```
* **Response Payload**:
  ```json
  {
    "success": true,
    "updatedCount": 2,
    "affectedValue": 65000,
    "status": "Accepted"
  }
  ```

---

### 4. Ownership Reassignment (`reassignRows`)
Reassigns individual items or global category/code pairings to a specific team member.

* **Client Method**: `reassignRows(payload)`
* **Endpoint**: `POST /api/reassign`
* **Request Body (By Row IDs)**:
  ```json
  {
    "rowIds": ["row-4982a", "row-8812c"],
    "owner": "Vanesse"
  }
  ```
* **Request Body (By Category Rule)**:
  ```json
  {
    "cat": "Apparel",
    "code": "MD15",
    "owner": "Vanesse"
  }
  ```
* **Response Payload**:
  ```json
  {
    "success": true,
    "count": 2,
    "owner": "Vanesse"
  }
  ```

---

### 5. Audit Log (`fetchAuditLog`)
Fetches all historic decision records, ordered chronologically newest first.

* **Client Method**: `fetchAuditLog()`
* **Endpoint**: `GET /api/audit`
* **Response Payload**:
  ```json
  [
    {
      "id": "AUD-892F1A",
      "ts": "2026-09-28T09:45:00.000Z",
      "sku": "SKU-992144",
      "cat": "Apparel",
      "actor": "Brett",
      "action": "Accepted",
      "prev": "Pending",
      "comment": "Approved - exit channel confirmed with the category team.",
      "value": 32500,
      "code": "OUTLET"
    }
  ]
  ```

---

### 6. Pipeline Run History (`fetchRunHistory`)
Returns the record of scheduled and manual data processing pipeline executions.

* **Client Method**: `fetchRunHistory()`
* **Endpoint**: `GET /api/runs`
* **Response Payload**:
  ```json
  [
    {
      "id": "RUN-618",
      "ts": "2026-09-28T06:00:00.000Z",
      "trigger": "Scheduled",
      "status": "Completed",
      "recs": 118489,
      "exc": 34885,
      "issues": 14,
      "dur": 395
    }
  ]
  ```

---

### 7. Manual Run Trigger (`triggerManualRun`)
Triggers an on-demand batch run of the aging policy evaluation pipeline.

* **Client Method**: `triggerManualRun()`
* **Endpoint**: `POST /api/runs/trigger`
* **Request Body**: None
* **Response Payload**:
  ```json
  {
    "id": "RUN-619",
    "ts": "2026-09-28T10:21:00.000Z",
    "trigger": "Manual",
    "status": "Completed",
    "recs": 118629,
    "exc": 35050,
    "issues": 11,
    "dur": 377
  }
  ```

---

### 8. Configuration Retrieval (`fetchConfig`)
Retrieves the active policy configuration, threshold days, SLA timings, and channel toggles.

* **Client Method**: `fetchConfig()`
* **Endpoint**: `GET /api/config`
* **Response Payload**:
  ```json
  {
    "days": {
      "Fast Fashion": { "Active": 0, "Watch": 30, "Aged": 45, "Terminal": 60 },
      "Seasonal Core": { "Active": 0, "Watch": 60, "Aged": 90, "Terminal": 180 }
    },
    "tier": {
      "Tier 1": { "min": 50000, "max": 999999999 },
      "Tier 2": { "min": 10000, "max": 49999 }
    },
    "catAction": {},
    "assign": {},
    "autoMonitor": true,
    "autoCap": 50000,
    "teams": true,
    "sharepoint": true,
    "email": false,
    "slaHours": 48,
    "schedule": "Weekly · Monday 06:00",
    "slaClocks": { "Watch": 30, "Aged": 14, "Terminal": 7 }
  }
  ```

---

### 9. Configuration Update (`updateConfig`)
Persists modifications to policy configuration parameters.

* **Client Method**: `updateConfig(config: Partial<AppConfig>)`
* **Endpoint**: `PUT /api/config`
* **Request Body**:
  ```json
  {
    "slaHours": 24,
    "teams": false,
    "autoCap": 75000
  }
  ```
* **Response Payload**: Returns full updated `AppConfig` object.

---

### 10. Grounded Chat Query (`sendChatMessage`)
Submits natural language questions to the policy knowledge engine for contextual answers and audit citations.

* **Client Method**: `sendChatMessage(query: string)`
* **Endpoint**: `POST /api/chat`
* **Request Body**:
  ```json
  {
    "query": "How much working capital is locked in aged stock?"
  }
  ```
* **Response Payload**:
  ```json
  {
    "answer": "<b>$48.20M</b> of the <b>$184.50M</b> inventory book has aged past its policy band — an Aged Stock percentage of <b>26.1%</b>...",
    "source": "Audited Aging_SKU extract & Inventory Management Policy v2.0 (s8.1 - s8.4)"
  }
  ```

---

## Error Handling & Best Practices

1. **Non-OK Status Checking**: All methods inspect `res.ok`. If false, an error is thrown with a descriptive message.
   ```typescript
   try {
     const data = await fetchExceptions({ band: 'Terminal' });
   } catch (err) {
     console.error('Failed to load exceptions:', err);
   }
   ```
2. **Dynamic Query Params**: `fetchExceptions` ignores `null`, `undefined`, and empty strings `""` to produce clean query URLs without extraneous keys.
3. **Immutability & Safety**: TypeScript return typings prevent implicit `any` casting and provide full IntelliSense across view components.
