import { ActionDef, AuthorityRule, CategoryRisk, BandTotal } from '../types';

export const AGING_META = {
  cats: [
    "Apparel",
    "Automotive & DIY",
    "Footwear",
    "Grocery & Consumables",
    "Health & Beauty",
    "Home",
    "Office Furniture & Storage",
    "Party Celebrations & Cards",
    "Pet Care",
    "Sports Outdoor & Leisure",
    "Tech & Print Consumables",
    "Toys",
    "Work Study & Create"
  ],
  oms: [
    "Continuity Core",
    "Fast Fashion",
    "MTE",
    "Replen Tail"
  ],
  bands: ["Healthy", "Watch", "Aged", "Terminal"] as const,
  bandsPolicy: {
    "Continuity Core": {
      "Healthy": "< 90 days",
      "Watch": "90-180 days",
      "Aged": "180-365 days",
      "Terminal": "> 365 days"
    },
    "Replen Tail": {
      "Healthy": "< 180 days",
      "Watch": "180-365 days",
      "Aged": "365-540 days",
      "Terminal": "> 540 days"
    },
    "MTE": {
      "Healthy": "Within event window",
      "Watch": "Event close - 30 days post",
      "Aged": "30-90 days post event",
      "Terminal": "> 90 days post event"
    },
    "Fast Fashion": {
      "Healthy": "Within phase",
      "Watch": "Phase close - 4 weeks",
      "Aged": "28-60 days post phase",
      "Terminal": "> 60 days post phase"
    }
  },
  bandsDays: {
    "Continuity Core": [90, 180, 365],
    "Replen Tail": [180, 365, 540],
    "MTE": [0, 30, 90],
    "Fast Fashion": [0, 28, 60]
  } as Record<string, number[]>,
  actions: [
    {
      code: "SELL_THROUGH_PLAN",
      label: "Sell-through acceleration plan",
      owner: "Brett",
      band: "Watch",
      cut: 0.0,
      lane: "REC",
      auth: "Category Planning Manager",
      esc: "Head of Planning at 30 days",
      policy: "s8.2",
      desc: "Stock has entered the Watch band. Build a sell-through acceleration plan and review on-order before any price action."
    },
    {
      code: "MARKDOWN_15",
      label: "In-banner markdown 15%",
      owner: "Merch",
      band: "Aged",
      cut: 0.15,
      lane: "REC",
      auth: "Head of Planning",
      esc: "CPO within 14 days",
      policy: "s8.2 / s8.3(1)",
      desc: "Aged band mandates markdown of at least 15% or a documented exit-channel plan. In-banner markdown is the highest-recovery channel."
    },
    {
      code: "CROSS_BANNER",
      label: "Cross-banner transfer",
      owner: "Brett",
      band: "Aged",
      cut: 0.05,
      lane: "REC",
      auth: "Head of Planning",
      esc: "CPO within 14 days",
      policy: "s8.3(2)",
      desc: "SKU fits the other banner assortment. Second-highest recovery channel; GCSCO executes the physical movement."
    },
    {
      code: "OUTLET_CLEARANCE",
      label: "Outlet / clearance allocation",
      owner: "Tom",
      band: "Aged",
      cut: 0.2,
      lane: "REC",
      auth: "Head of Planning",
      esc: "CPO within 14 days",
      policy: "s8.3(3)",
      desc: "Allocate to outlet and clearance stores where in-banner markdown will not clear the holding inside the season."
    },
    {
      code: "MARKDOWN_30",
      label: "Terminal markdown 30%",
      owner: "Merch",
      band: "Terminal",
      cut: 0.3,
      lane: "SME",
      auth: "CPO",
      esc: "ELT within 7 days",
      policy: "s8.2 / s8.3(1)",
      desc: "Terminal band mandates markdown of at least 30%, clearance channel, or write-down. Decision authority sits with the CPO."
    },
    {
      code: "LIQUIDATION",
      label: "Bulk liquidation",
      owner: "Graham",
      band: "Terminal",
      cut: 0.55,
      lane: "SME",
      auth: "CPO",
      esc: "ELT within 7 days",
      policy: "s8.3(4)",
      desc: "Bulk sale to approved secondary-market partners once in-banner and outlet channels are exhausted."
    },
    {
      code: "DONATION",
      label: "Charitable donation",
      owner: "Graham",
      band: "Terminal",
      cut: 0.85,
      lane: "SME",
      auth: "CPO",
      esc: "ELT within 7 days",
      policy: "s8.3(5)",
      desc: "Charitable donation with tax recovery where applicable. Used where liquidation returns less than the cost to handle."
    },
    {
      code: "WRITE_OFF",
      label: "Destruction / write-off",
      owner: "Vanesse",
      band: "Terminal",
      cut: 1.0,
      lane: "SME",
      auth: "CPO + GCSCO + CFO",
      esc: "Board Audit & Risk above $1M",
      policy: "s8.3(6) / s8.4",
      desc: "Last resort. Requires CPO, GCSCO and CFO sign-off; authority escalates by value under policy s8.4."
    },
    {
      code: "MONITOR",
      label: "Monitor - no action",
      owner: "Reagan",
      band: "Healthy",
      cut: 0.0,
      lane: "AUTO",
      auth: "Automated",
      esc: "None",
      policy: "s8.1",
      desc: "Stock is inside the Healthy ageing band for its operating model. Continue standard replenishment."
    }
  ] as ActionDef[],
  authority: [
    { lo: 0, hi: 50000, approver: "Head of Planning", report: "Monthly summary to CPO + GCSCO" },
    { lo: 50000, hi: 250000, approver: "CPO + GCSCO + CFO", report: "Monthly ELT report" },
    { lo: 250000, hi: 1000000, approver: "CEO", report: "ELT and Audit & Risk Committee" },
    { lo: 1000000, hi: null, approver: "Board Audit & Risk Committee", report: "Full board visibility" }
  ] as AuthorityRule[],
  tier: {
    outlet: 2000.0,
    liquidation: 300.0,
    writeoff: 50.0,
    crossbanner: 8000.0
  },
  catRisk: {
    "Apparel": { skus: 41479, records: 55567, healthyV: 23141403.8, healthyU: 3764190, healthyN: 15417, watchV: 6468733.55, watchU: 987143, watchN: 12149, agedV: 3442207.8, agedU: 461918, agedN: 6941, termV: 4634848.77, termU: 630478, termN: 21060, totalV: 37687193.92, atRiskV: 8077056.57, loss: 1906785.8, recover: 6170270.77, agedPct: 21.43 },
    "Automotive & DIY": { skus: 1227, records: 1576, healthyV: 5995824.12, healthyU: 1123908, healthyN: 1116, watchV: 1192026.95, watchU: 138285, watchN: 381, agedV: 357560.12, agedU: 17605, agedN: 38, termV: 64340.2, termU: 5783, termN: 41, totalV: 7609751.39, atRiskV: 421900.32, loss: 72936.08, recover: 348964.24, agedPct: 5.54 },
    "Footwear": { skus: 4676, records: 6488, healthyV: 5476866.41, healthyU: 587155, healthyN: 2844, watchV: 1219396.91, watchU: 143474, watchN: 1299, agedV: 545281.47, agedU: 54307, agedN: 823, termV: 436470.31, termU: 46342, termN: 1522, totalV: 7678015.1, atRiskV: 981751.78, loss: 212733.31, recover: 769018.47, agedPct: 12.79 },
    "Grocery & Consumables": { skus: 2318, records: 2859, healthyV: 21378385.75, healthyU: 6344234, healthyN: 2047, watchV: 4096003.95, watchU: 1267786, watchN: 546, agedV: 1822270.29, agedU: 466444, agedN: 128, termV: 185688.32, termU: 58489, termN: 138, totalV: 27482348.31, atRiskV: 2007958.61, loss: 329047.04, recover: 1678911.57, agedPct: 7.31 },
    "Health & Beauty": { skus: 5124, records: 6641, healthyV: 15001842.83, healthyU: 2544207, healthyN: 4202, watchV: 4805271.16, watchU: 996357, watchN: 1932, agedV: 506005.6, agedU: 90813, agedN: 180, termV: 423204.91, termU: 77824, termN: 327, totalV: 20736324.5, atRiskV: 929210.51, loss: 202862.31, recover: 726348.2, agedPct: 4.48 },
    "Home": { skus: 5804, records: 8680, healthyV: 26941534.4, healthyU: 3829491, healthyN: 4739, watchV: 10280835.6, watchU: 1232918, watchN: 2825, agedV: 2973988.67, agedU: 412243, agedN: 593, termV: 994616.92, termU: 84144, termN: 523, totalV: 41190975.59, atRiskV: 3968605.59, loss: 744483.38, recover: 3224122.21, agedPct: 9.63 },
    "Office Furniture & Storage": { skus: 936, records: 1409, healthyV: 5088307.52, healthyU: 624341, healthyN: 726, watchV: 2996081.52, watchU: 295840, watchN: 488, agedV: 1897781.23, agedU: 104651, agedN: 134, termV: 70631.3, termU: 5318, termN: 61, totalV: 10052801.57, atRiskV: 1968412.53, loss: 305856.57, recover: 1662555.96, agedPct: 19.58 },
    "Party Celebrations & Cards": { skus: 1202, records: 1732, healthyV: 2268297.22, healthyU: 770824, healthyN: 640, watchV: 686968.71, watchU: 396508, watchN: 532, agedV: 120965.63, agedU: 46296, agedN: 179, termV: 130343.81, termU: 34624, termN: 381, totalV: 3206575.37, atRiskV: 251309.44, loss: 57247.99, recover: 194061.45, agedPct: 7.84 },
    "Pet Care": { skus: 708, records: 913, healthyV: 5128928.55, healthyU: 611924, healthyN: 623, watchV: 582162.05, watchU: 113086, watchN: 189, agedV: 57320.5, agedU: 11471, agedN: 33, termV: 102575.75, termU: 12672, termN: 68, totalV: 5870986.85, atRiskV: 159896.25, loss: 39370.8, recover: 120525.45, agedPct: 2.72 },
    "Sports Outdoor & Leisure": { skus: 4213, records: 6222, healthyV: 11416891.95, healthyU: 1759046, healthyN: 3668, watchV: 6386522.6, watchU: 757552, watchN: 2000, agedV: 3178046.24, agedU: 203425, agedN: 410, termV: 281485.07, termU: 24407, termN: 144, totalV: 21262945.86, atRiskV: 3459531.31, loss: 561152.46, recover: 2898378.85, agedPct: 16.27 },
    "Tech & Print Consumables": { skus: 4680, records: 6038, healthyV: 26836926.02, healthyU: 772695, healthyN: 3051, watchV: 9748399.56, watchU: 234927, watchN: 2707, agedV: 1605812.02, agedU: 26411, agedN: 78, termV: 130933.39, termU: 3075, termN: 202, totalV: 38322070.99, atRiskV: 1736745.41, loss: 280151.82, recover: 1456593.59, agedPct: 4.53 },
    "Toys": { skus: 4498, records: 6251, healthyV: 16704863.77, healthyU: 1620641, healthyN: 3332, watchV: 5665146.42, watchU: 768570, watchN: 2083, agedV: 1049049.58, agedU: 247059, agedN: 310, termV: 714923.79, termU: 64199, termN: 526, totalV: 24133983.56, atRiskV: 1763973.37, loss: 371834.57, recover: 1392138.8, agedPct: 7.31 },
    "Work Study & Create": { skus: 9966, records: 14293, healthyV: 13615000.22, healthyU: 4637626, healthyN: 8292, watchV: 7118075.08, watchU: 2762875, watchN: 5470, agedV: 1191243.04, agedU: 768697, agedN: 161, termV: 280024.16, termU: 81007, termN: 370, totalV: 22204342.5, atRiskV: 1471267.2, loss: 262693.7, recover: 1208573.5, agedPct: 6.63 }
  } as Record<string, CategoryRisk>,
  bandTot: {
    Healthy: { n: 50697, u: 28990282, v: 178995072.56 },
    Watch: { n: 32601, u: 10095321, v: 61245624.06 },
    Aged: { n: 10008, u: 2911340, v: 18747532.19 },
    Terminal: { n: 25363, u: 1128362, v: 8450086.7 }
  } as Record<string, BandTotal>,
  actionMix: {
    CROSS_BANNER: { n: 446, u: 1809603, v: 11742043.48, loss: 587102.17 },
    OUTLET_CLEARANCE: { n: 3847, u: 1011420, v: 8351380.14, loss: 1670276.03 },
    MARKDOWN_15: { n: 803, u: 450547, v: 2063840.08, loss: 309576.01 },
    LIQUIDATION: { n: 10417, u: 552657, v: 3753648.21, loss: 2064506.52 },
    DONATION: { n: 7986, u: 170715, v: 1058815.95, loss: 899993.56 },
    WRITE_OFF: { n: 11872, u: 44760, v: 227891.03, loss: 227891.03 }
  } as Record<string, { n: number; u: number; v: number; loss: number }>,
  authMix: {
    "CEO": { n: 2, v: 741864.86 },
    "CPO + GCSCO + CFO": { n: 50, v: 3861032.28 },
    "Head of Planning": { n: 35319, v: 22594721.75 }
  } as Record<string, { n: number; v: number }>,
  kpi: {
    records: 118669,
    skus: 86831,
    totalV: 267438315.51,
    totalU: 43125305,
    atRiskV: 27197618.89,
    atRiskN: 35371,
    loss: 5347155.84,
    recover: 21850463.05,
    agedPct: 10.17,
    embedded: 5200
  },
  now: "2026-09-17T09:00:00"
};
