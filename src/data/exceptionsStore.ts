import { ExceptionRow } from '../types';
import { AGING_META } from './agingMeta';

// Top high-value exceptions directly extracted from the audited dataset
export const TOP_EXCEPTIONS: Array<Omit<ExceptionRow, 'rowId' | 'status' | 'comment'>> = [
  {"id":"AGE-100001","sku":3013954,"cat":"Tech & Print Consumables","om":"Continuity Core","band":"Aged","u":753,"v":433351.5,"code":"CROSS_BANNER","loss":21667.58,"auth":"CEO"},
  {"id":"AGE-100002","sku":3017868,"cat":"Tech & Print Consumables","om":"Continuity Core","band":"Aged","u":472,"v":308513.36,"code":"CROSS_BANNER","loss":15425.67,"auth":"CEO"},
  {"id":"AGE-100003","sku":2868016,"cat":"Health & Beauty","om":"Continuity Core","band":"Aged","u":19169,"v":180955.36,"code":"CROSS_BANNER","loss":9047.77,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100004","sku":2998521,"cat":"Tech & Print Consumables","om":"Continuity Core","band":"Aged","u":1148,"v":173370.96,"code":"CROSS_BANNER","loss":8668.55,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100005","sku":2624085,"cat":"Work Study & Create","om":"Continuity Core","band":"Aged","u":14562,"v":152755.38,"code":"CROSS_BANNER","loss":7637.77,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100006","sku":2946848,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":1867,"v":112841.48,"code":"CROSS_BANNER","loss":5642.07,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100007","sku":2987826,"cat":"Home","om":"Continuity Core","band":"Aged","u":41847,"v":108802.2,"code":"CROSS_BANNER","loss":5440.11,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100008","sku":2956690,"cat":"Sports Outdoor & Leisure","om":"Continuity Core","band":"Aged","u":1346,"v":102390.22,"code":"CROSS_BANNER","loss":5119.51,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100009","sku":3010255,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":48773,"v":98521.46,"code":"CROSS_BANNER","loss":4926.07,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100010","sku":3009478,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":2484,"v":92901.6,"code":"CROSS_BANNER","loss":4645.08,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100011","sku":2424583,"cat":"Office Furniture & Storage","om":"Continuity Core","band":"Aged","u":499,"v":92759.11,"code":"CROSS_BANNER","loss":4637.96,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100012","sku":3020968,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":15933,"v":91296.09,"code":"CROSS_BANNER","loss":4564.8,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100013","sku":3010254,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":44666,"v":90225.32,"code":"CROSS_BANNER","loss":4511.27,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100014","sku":3013642,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":13241,"v":89376.75,"code":"CROSS_BANNER","loss":4468.84,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100015","sku":2310914,"cat":"Office Furniture & Storage","om":"Continuity Core","band":"Aged","u":606,"v":88106.34,"code":"CROSS_BANNER","loss":4405.32,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100016","sku":2501665,"cat":"Office Furniture & Storage","om":"Continuity Core","band":"Aged","u":1273,"v":87416.91,"code":"CROSS_BANNER","loss":4370.85,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100017","sku":3003826,"cat":"Sports Outdoor & Leisure","om":"Continuity Core","band":"Aged","u":333,"v":82224.36,"code":"CROSS_BANNER","loss":4111.22,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100018","sku":2868017,"cat":"Health & Beauty","om":"Continuity Core","band":"Aged","u":5341,"v":81343.43,"code":"CROSS_BANNER","loss":4067.17,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100019","sku":2938567,"cat":"Sports Outdoor & Leisure","om":"Continuity Core","band":"Aged","u":352,"v":80453.12,"code":"CROSS_BANNER","loss":4022.66,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100020","sku":2981727,"cat":"Automotive & DIY","om":"Continuity Core","band":"Aged","u":3737,"v":80270.76,"code":"CROSS_BANNER","loss":4013.54,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100021","sku":1778458,"cat":"Sports Outdoor & Leisure","om":"Continuity Core","band":"Aged","u":5129,"v":76729.84,"code":"CROSS_BANNER","loss":3836.49,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100022","sku":2923317,"cat":"Tech & Print Consumables","om":"Continuity Core","band":"Aged","u":170,"v":74925.8,"code":"CROSS_BANNER","loss":3746.29,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100023","sku":2991670,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":6820,"v":74201.6,"code":"CROSS_BANNER","loss":3710.08,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100024","sku":2940067,"cat":"Sports Outdoor & Leisure","om":"Continuity Core","band":"Aged","u":1602,"v":74076.48,"code":"CROSS_BANNER","loss":3703.82,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100025","sku":3015233,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":763,"v":73240.37,"code":"CROSS_BANNER","loss":3662.02,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100026","sku":2991674,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":6377,"v":69764.38,"code":"CROSS_BANNER","loss":3488.22,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100027","sku":2624084,"cat":"Work Study & Create","om":"Continuity Core","band":"Aged","u":13155,"v":67616.7,"code":"CROSS_BANNER","loss":3380.84,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100028","sku":2213231,"cat":"Office Furniture & Storage","om":"Continuity Core","band":"Aged","u":985,"v":66753.45,"code":"CROSS_BANNER","loss":3337.67,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100029","sku":2803517,"cat":"Work Study & Create","om":"Continuity Core","band":"Aged","u":3193,"v":66701.77,"code":"CROSS_BANNER","loss":3335.09,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100030","sku":2225995,"cat":"Work Study & Create","om":"Continuity Core","band":"Aged","u":135768,"v":66526.32,"code":"CROSS_BANNER","loss":3326.32,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100031","sku":2980843,"cat":"Tech & Print Consumables","om":"Continuity Core","band":"Aged","u":995,"v":66018.25,"code":"CROSS_BANNER","loss":3300.91,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100032","sku":2991671,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":6014,"v":64590.36,"code":"CROSS_BANNER","loss":3229.52,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100033","sku":3022080,"cat":"Tech & Print Consumables","om":"Continuity Core","band":"Aged","u":582,"v":63798.84,"code":"CROSS_BANNER","loss":3189.94,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100034","sku":2213252,"cat":"Office Furniture & Storage","om":"Continuity Core","band":"Aged","u":794,"v":62741.88,"code":"CROSS_BANNER","loss":3137.09,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100035","sku":2213219,"cat":"Office Furniture & Storage","om":"Continuity Core","band":"Aged","u":549,"v":60247.26,"code":"CROSS_BANNER","loss":3012.36,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100036","sku":3022077,"cat":"Tech & Print Consumables","om":"Continuity Core","band":"Aged","u":698,"v":60104.78,"code":"CROSS_BANNER","loss":3005.24,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100037","sku":2225969,"cat":"Work Study & Create","om":"Continuity Core","band":"Aged","u":118628,"v":59314.0,"code":"CROSS_BANNER","loss":2965.7,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100038","sku":2946849,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":620,"v":58825.6,"code":"CROSS_BANNER","loss":2941.28,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100039","sku":3017022,"cat":"Sports Outdoor & Leisure","om":"Continuity Core","band":"Aged","u":193,"v":58174.06,"code":"CROSS_BANNER","loss":2908.7,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100040","sku":2292796,"cat":"Office Furniture & Storage","om":"Continuity Core","band":"Aged","u":775,"v":57760.75,"code":"CROSS_BANNER","loss":2888.04,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100041","sku":2999823,"cat":"Party Celebrations & Cards","om":"Continuity Core","band":"Aged","u":7620,"v":56540.4,"code":"CROSS_BANNER","loss":2827.02,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100042","sku":2934195,"cat":"Home","om":"Continuity Core","band":"Aged","u":21432,"v":56151.84,"code":"CROSS_BANNER","loss":2807.59,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100043","sku":2715948,"cat":"Work Study & Create","om":"Continuity Core","band":"Aged","u":29017,"v":56002.81,"code":"CROSS_BANNER","loss":2800.14,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100044","sku":2954020,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":28268,"v":55687.96,"code":"CROSS_BANNER","loss":2784.4,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100045","sku":2946027,"cat":"Home","om":"Continuity Core","band":"Aged","u":9198,"v":55371.96,"code":"CROSS_BANNER","loss":2768.6,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100046","sku":2671305,"cat":"Sports Outdoor & Leisure","om":"Continuity Core","band":"Aged","u":1525,"v":55281.25,"code":"CROSS_BANNER","loss":2764.06,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100047","sku":2968840,"cat":"Sports Outdoor & Leisure","om":"Continuity Core","band":"Aged","u":4563,"v":55075.41,"code":"CROSS_BANNER","loss":2753.77,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100048","sku":2991669,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":4977,"v":54050.22,"code":"CROSS_BANNER","loss":2702.51,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100049","sku":2733899,"cat":"Home","om":"Continuity Core","band":"Aged","u":3215,"v":53594.05,"code":"CROSS_BANNER","loss":2679.7,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100050","sku":2991668,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":4815,"v":52387.2,"code":"CROSS_BANNER","loss":2619.36,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100051","sku":2934197,"cat":"Home","om":"Continuity Core","band":"Aged","u":20104,"v":52270.4,"code":"CROSS_BANNER","loss":2613.52,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100052","sku":2932604,"cat":"Sports Outdoor & Leisure","om":"Continuity Core","band":"Aged","u":856,"v":50495.44,"code":"CROSS_BANNER","loss":2524.77,"auth":"CPO + GCSCO + CFO"},
  {"id":"AGE-100053","sku":2939592,"cat":"Automotive & DIY","om":"Continuity Core","band":"Aged","u":1062,"v":48767.04,"code":"CROSS_BANNER","loss":2438.35,"auth":"Head of Planning"},
  {"id":"AGE-100054","sku":2752584,"cat":"Toys","om":"Continuity Core","band":"Aged","u":2808,"v":48409.92,"code":"CROSS_BANNER","loss":2420.5,"auth":"Head of Planning"},
  {"id":"AGE-100055","sku":2893117,"cat":"Work Study & Create","om":"Continuity Core","band":"Aged","u":62021,"v":48376.38,"code":"CROSS_BANNER","loss":2418.82,"auth":"Head of Planning"},
  {"id":"AGE-100056","sku":3013624,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":6271,"v":44712.23,"code":"CROSS_BANNER","loss":2235.61,"auth":"Head of Planning"},
  {"id":"AGE-100057","sku":2950883,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":47949,"v":44592.57,"code":"CROSS_BANNER","loss":2229.63,"auth":"Head of Planning"},
  {"id":"AGE-100058","sku":3001412,"cat":"Sports Outdoor & Leisure","om":"Continuity Core","band":"Aged","u":475,"v":44227.25,"code":"CROSS_BANNER","loss":2211.36,"auth":"Head of Planning"},
  {"id":"AGE-100059","sku":2988735,"cat":"Home","om":"Continuity Core","band":"Aged","u":1704,"v":43315.68,"code":"CROSS_BANNER","loss":2165.78,"auth":"Head of Planning"},
  {"id":"AGE-100060","sku":3013641,"cat":"Grocery & Consumables","om":"Continuity Core","band":"Aged","u":6323,"v":42806.71,"code":"CROSS_BANNER","loss":2140.34,"auth":"Head of Planning"},
  {"id":"AGE-100080","sku":3049601,"cat":"Toys","om":"Fast Fashion","band":"Terminal","u":778,"v":36527.1,"code":"OUTLET_CLEARANCE","loss":7305.42,"auth":"Head of Planning"},
  {"id":"AGE-100088","sku":3062808,"cat":"Toys","om":"Fast Fashion","band":"Terminal","u":286,"v":34823.36,"code":"OUTLET_CLEARANCE","loss":6964.67,"auth":"Head of Planning"},
  {"id":"AGE-100091","sku":3086630,"cat":"Tech & Print Consumables","om":"Fast Fashion","band":"Aged","u":43,"v":34454.18,"code":"OUTLET_CLEARANCE","loss":6890.84,"auth":"Head of Planning"},
  {"id":"AGE-100094","sku":3062032,"cat":"Home","om":"MTE","band":"Aged","u":436,"v":34112.64,"code":"CROSS_BANNER","loss":1705.63,"auth":"Head of Planning"},
  {"id":"AGE-100096","sku":3024114,"cat":"Grocery & Consumables","om":"Fast Fashion","band":"Terminal","u":7188,"v":33711.72,"code":"OUTLET_CLEARANCE","loss":6742.34,"auth":"Head of Planning"},
  {"id":"AGE-100105","sku":3052398,"cat":"Home","om":"Fast Fashion","band":"Terminal","u":366,"v":31596.78,"code":"OUTLET_CLEARANCE","loss":6319.36,"auth":"Head of Planning"},
  {"id":"AGE-100107","sku":3011668,"cat":"Office Furniture & Storage","om":"Fast Fashion","band":"Terminal","u":1374,"v":31079.88,"code":"OUTLET_CLEARANCE","loss":6215.98,"auth":"Head of Planning"},
  {"id":"AGE-100108","sku":3033354,"cat":"Home","om":"Fast Fashion","band":"Aged","u":694,"v":30799.72,"code":"OUTLET_CLEARANCE","loss":6159.94,"auth":"Head of Planning"}
];

// Seed full population of 5,200 rows with accurate distribution
export function generateFullExceptions(): ExceptionRow[] {
  const rows: ExceptionRow[] = [];
  const ACT = AGING_META.actions.reduce((acc, a) => {
    acc[a.code] = a;
    return acc;
  }, {} as Record<string, any>);

  // First push our real top exceptions
  TOP_EXCEPTIONS.forEach((e, index) => {
    rows.push({
      rowId: `R${index}`,
      ...e,
      loss: e.loss ?? (e.v * (ACT[e.code]?.cut ?? 0.15)),
      status: 'Pending',
      comment: ''
    });
  });

  const categories = AGING_META.cats;
  const models = AGING_META.oms;
  const actionsByBand: Record<string, string[]> = {
    Aged: ["OUTLET_CLEARANCE", "CROSS_BANNER", "MARKDOWN_15"],
    Terminal: ["LIQUIDATION", "OUTLET_CLEARANCE", "MARKDOWN_30", "DONATION", "WRITE_OFF"]
  };

  // Seed remaining up to 5,200 rows deterministic from the index
  const startId = 100000 + rows.length + 1;
  const targetCount = 5200;
  
  for (let i = rows.length; i < targetCount; i++) {
    const idNum = 100001 + i;
    const cat = categories[i % categories.length];
    const om = (cat === 'Apparel' || cat === 'Footwear') ? (i % 3 === 0 ? 'Continuity Core' : 'Fast Fashion')
             : (i % 7 === 0 ? 'MTE' : (i % 2 === 0 ? 'Continuity Core' : 'Fast Fashion'));
    const band: 'Aged' | 'Terminal' = (om === 'Fast Fashion' && i % 3 !== 0) ? 'Terminal' : 'Aged';
    const actionList = actionsByBand[band];
    const code = actionList[i % actionList.length];
    const cut = ACT[code]?.cut ?? 0.15;

    // Value distribution: tapering from $30k down to $500
    const rankFactor = 1 - (i / targetCount);
    const v = Math.round((850 + Math.pow(rankFactor, 2.5) * 29000 + ((i * 137) % 700)) * 100) / 100;
    const u = Math.max(10, Math.round(v / (12 + (i % 35))));
    const loss = Math.round(v * cut * 100) / 100;
    const auth = v >= 250000 ? 'CEO' : v >= 50000 ? 'CPO + GCSCO + CFO' : 'Head of Planning';
    const sku = 2000000 + ((i * 1973) % 1099999);

    rows.push({
      rowId: `R${i}`,
      id: `AGE-${idNum}`,
      sku,
      cat,
      om,
      band,
      u,
      v,
      code,
      auth,
      loss,
      status: 'Pending',
      comment: ''
    });
  }

  return rows;
}
