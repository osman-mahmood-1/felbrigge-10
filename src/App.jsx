import { useState, useMemo, useEffect, useRef, Component } from "react";
// ─── SUPABASE SHARED STATE ───────────────────────────────────────────────────
const SB_URL = "https://ulkcbnevgyaqdwwmlpae.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa2NibmV2Z3lhcWR3d21scGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODExMTEsImV4cCI6MjA5MDI1NzExMX0.bn29ImVU4JOnKHQ91keA0WQANYJc7x-ncUEc3psG_sM";

const sbFetch = async (key) => {
  const r = await fetch(`${SB_URL}/rest/v1/shared_state?key=eq.${key}&select=value`, {
    headers:{"apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY}
  });
  const d = await r.json();
  return d[0]?.value ?? null;
};

const sbSet = async (key, value) => {
  await fetch(`${SB_URL}/rest/v1/shared_state?key=eq.${key}`, {
    method:"PATCH",
    headers:{"apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY,"Content-Type":"application/json","Prefer":"return=minimal"},
    body: JSON.stringify({value, updated_at: new Date().toISOString()})
  });
};

const sbSubscribe = (onChange) => {
  const ws = new WebSocket(
    `wss://ulkcbnevgyaqdwwmlpae.supabase.co/realtime/v1/websocket?apikey=${SB_KEY}&vsn=1.0.0`
  );
  ws.onopen = () => {
    ws.send(JSON.stringify({topic:"realtime:public:shared_state",event:"phx_join",payload:{},ref:1}));
  };
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if(msg.event==="postgres_changes"||msg.payload?.data?.type==="UPDATE") {
      onChange(msg.payload?.data?.record);
    }
  };
  return ()=>ws.close();
};


// ─── ERROR BOUNDARY ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{padding:24,fontFamily:"monospace",fontSize:13,color:"#ff453a",background:"#1a0a0a",minHeight:"100vh"}}>
        <div style={{fontWeight:700,marginBottom:8}}>Runtime Error — paste this to Osman:</div>
        <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{this.state.error.toString()}</pre>
        <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-all",opacity:0.6,marginTop:12,fontSize:11}}>{this.state.error.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}

const LIGHT = {
  // Orb background — warm ivory with a large soft indigo orb top-left, peach bottom-right
  bg:"#F0EEE9",
  orb1:"radial-gradient(ellipse 70% 55% at 15% 10%, rgba(120,100,220,0.18) 0%, transparent 70%)",
  orb2:"radial-gradient(ellipse 60% 50% at 88% 88%, rgba(255,140,80,0.04) 0%, transparent 70%)",
  // Glass surfaces
  glass:"rgba(255,255,255,0.55)",
  glassStrong:"rgba(255,255,255,0.72)",
  glassSubtle:"rgba(255,255,255,0.35)",
  glassBorder:"rgba(255,255,255,0.70)",
  glassBorderSubtle:"rgba(255,255,255,0.45)",
  // Original aliases kept for non-glass elements
  surface:"rgba(255,255,255,0.72)",
  card:"rgba(255,255,255,0.55)",
  cardAlt:"rgba(245,243,240,0.70)",
  border:"rgba(60,60,67,0.11)",
  separator:"rgba(60,60,67,0.07)",
  text:"#0A0A0A",
  textSecond:"rgba(40,38,36,0.72)",
  textTertiary:"rgba(40,38,36,0.48)",
  textQuart:"rgba(40,38,36,0.24)",
  blue:"#007AFF", blueLight:"rgba(0,122,255,0.12)",
  green:"#34C759", greenLight:"rgba(52,199,89,0.12)",
  orange:"#FF9500", orangeLight:"rgba(255,149,0,0.12)",
  red:"#FF3B30", redLight:"rgba(255,59,48,0.12)",
  teal:"#5AC8FA", tealLight:"rgba(90,200,250,0.12)",
  indigo:"#5856D6", indigoLight:"rgba(88,86,214,0.12)",
  headerBg:"rgba(240,238,233,0.72)",
  blur:"blur(28px)",
};
const DARK = {
  // Orb background — deep black with electric blue orb top-left, magenta bottom-right
  bg:"#08080A",
  orb1:"radial-gradient(ellipse 120% 100% at 10% 5%, rgba(40,80,200,0.16) 0%, transparent 70%)",
  orb2:"radial-gradient(ellipse 55% 48% at 90% 90%, rgba(160,40,180,0.22) 0%, transparent 70%)",
  // Glass surfaces
  glass:"rgba(28,28,32,0.60)",
  glassStrong:"rgba(36,36,42,0.78)",
  glassSubtle:"rgba(22,22,26,0.45)",
  glassBorder:"rgba(255,255,255,0.14)",
  glassBorderSubtle:"rgba(255,255,255,0.08)",
  // Aliases
  surface:"rgba(28,28,32,0.72)",
  card:"rgba(28,28,32,0.60)",
  cardAlt:"rgba(38,38,44,0.65)",
  border:"rgba(255,255,255,0.10)",
  separator:"rgba(255,255,255,0.06)",
  text:"#FFFFFF",
  textSecond:"rgba(235,235,245,0.62)",
  textTertiary:"rgba(235,235,245,0.34)",
  textQuart:"rgba(235,235,245,0.16)",
  blue:"#0A84FF", blueLight:"rgba(10,132,255,0.18)",
  green:"#30D158", greenLight:"rgba(48,209,88,0.16)",
  orange:"#FF9F0A", orangeLight:"rgba(255,159,10,0.16)",
  red:"#FF453A", redLight:"rgba(255,69,58,0.16)",
  teal:"#64D2FF", tealLight:"rgba(100,210,255,0.14)",
  indigo:"#5E5CE6", indigoLight:"rgba(94,92,230,0.18)",
  headerBg:"rgba(8,8,10,0.72)",
  blur:"blur(32px)",
};

const BUDGET = 750000;
const PURCHASE = 650000;
const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text','Helvetica Neue',sans-serif";

// ─── DATA ────────────────────────────────────────────────────────────────────
const INIT_MATERIALS = [
  {id:1,cat:"Loft Dormer",item:"RSJ / Universal Beams (×2)",spec:"203×133 UB S275",qty:2,unit:"no.",unitCost:450},
  {id:2,cat:"Loft Dormer",item:"Joist hangers (BAT 47mm)",spec:"BAT 47mm standard",qty:20,unit:"no.",unitCost:4},
  {id:3,cat:"Loft Dormer",item:"Structural timber (C24 roof)",spec:"C24 rafters, ridge, purlins",qty:1,unit:"lot",unitCost:3500},
  {id:4,cat:"Loft Dormer",item:"Floor joists (loft conversion)",spec:"C24 47×200mm @ 400crs",qty:20,unit:"no.",unitCost:28},
  {id:5,cat:"Loft Dormer",item:"Roofing felt + battens",spec:"Proctor Wraptite + 25×50 battens",qty:1,unit:"lot",unitCost:800},
  {id:6,cat:"Loft Dormer",item:"Roof tiles (match existing)",spec:"Concrete interlocking",qty:1,unit:"lot",unitCost:2200},
  {id:7,cat:"Loft Dormer",item:"VELUX roof windows (×2)",spec:"VELUX GGU 78×118",qty:2,unit:"unit",unitCost:650},
  {id:8,cat:"Loft Dormer",item:"Dormer windows (×2 front face)",spec:"White uPVC casement DG",qty:2,unit:"unit",unitCost:320},
  {id:9,cat:"Loft Dormer",item:"Insulation — roof PIR 150mm",spec:"Kingspan TP10 150mm",qty:45,unit:"m²",unitCost:40},
  {id:10,cat:"Loft Dormer",item:"Insulation — walls PIR 150mm",spec:"Kingspan TP10 150mm",qty:20,unit:"m²",unitCost:40},
  {id:11,cat:"Loft Dormer",item:"Insulation — floor Rockwool 100mm",spec:"Rockwool RollBatt 100mm",qty:25,unit:"m²",unitCost:6},
  {id:12,cat:"Loft Dormer",item:"Dormer cheeks (cladding)",spec:"Lead flashing + GRP cheeks",qty:1,unit:"lot",unitCost:900},
  {id:13,cat:"Loft Dormer",item:"Loft staircase",spec:"Softwood straight flight",qty:1,unit:"set",unitCost:850},
  {id:14,cat:"Rear Extension",item:"RSJ / Universal Beams (×3)",spec:"152×152 UC S275",qty:3,unit:"no.",unitCost:380},
  {id:15,cat:"Rear Extension",item:"Concrete padstones",spec:"450×450×215 precast",qty:10,unit:"no.",unitCost:18},
  {id:16,cat:"Rear Extension",item:"Concrete lintels",spec:"100×65 prestressed",qty:8,unit:"no.",unitCost:35},
  {id:17,cat:"Rear Extension",item:"Ready-mix concrete (foundations)",spec:"C25 — strip footings",qty:6,unit:"m³",unitCost:120},
  {id:18,cat:"Rear Extension",item:"Blockwork (foundation + walls)",spec:"100mm Thermalite/dense",qty:800,unit:"block",unitCost:2.2},
  {id:19,cat:"Rear Extension",item:"Bricks (outer leaf)",spec:"London stock / red facing",qty:2000,unit:"brick",unitCost:0.65},
  {id:20,cat:"Rear Extension",item:"Cavity wall insulation",spec:"Celotex CW4050 50mm PIR",qty:30,unit:"m²",unitCost:12},
  {id:21,cat:"Rear Extension",item:"Sand & cement (mortar)",spec:"Sharp sand + OPC bulk bags",qty:1,unit:"lot",unitCost:600},
  {id:22,cat:"Plumbing & Heating",item:"System boiler",spec:"Worcester Bosch Greenstar 30i",qty:1,unit:"unit",unitCost:1800},
  {id:23,cat:"Plumbing & Heating",item:"Unvented cylinder (180L)",spec:"Megaflo Eco 180SC",qty:1,unit:"unit",unitCost:1200},
  {id:24,cat:"Plumbing & Heating",item:"Radiators + TRVs (full house)",spec:"Double panel — various sizes",qty:12,unit:"unit",unitCost:125},
  {id:25,cat:"Plumbing & Heating",item:"Copper pipe + fittings",spec:"22mm + 15mm + compression",qty:1,unit:"lot",unitCost:1500},
  {id:26,cat:"Plumbing & Heating",item:"Soil pipe + fittings",spec:"110mm OSMA soil system",qty:1,unit:"lot",unitCost:315},
  {id:27,cat:"Electrical",item:"Consumer unit",spec:"Hager 18-way dual RCD",qty:1,unit:"unit",unitCost:350},
  {id:28,cat:"Electrical",item:"Cable (twin + earth)",spec:"2.5mm, 1.5mm, 6mm T&E + SWA",qty:1,unit:"lot",unitCost:800},
  {id:29,cat:"Electrical",item:"Sockets, switches, downlights",spec:"Screwfix white plate",qty:1,unit:"lot",unitCost:350},
  {id:30,cat:"Electrical",item:"Fire alarm system (L1)",spec:"Morley Zone 4 addressable",qty:1,unit:"system",unitCost:1200},
  {id:31,cat:"Electrical",item:"Emergency lighting (×8 units)",spec:"Exiway LED maintained 3hr",qty:8,unit:"unit",unitCost:68.5},
  {id:32,cat:"Bathrooms",item:"Shower tray + screen (×5)",spec:"Kudos 900×900 low profile",qty:5,unit:"set",unitCost:280},
  {id:33,cat:"Bathrooms",item:"Toilet close-coupled (×5)",spec:"Roca Victoria — care spec",qty:5,unit:"unit",unitCost:180},
  {id:34,cat:"Bathrooms",item:"Basin + pedestal (×5)",spec:"Roca Gap 550mm + pedestal",qty:5,unit:"unit",unitCost:90},
  {id:35,cat:"Bathrooms",item:"Grab rails (×10)",spec:"Stainless steel — CQC accessible",qty:10,unit:"no.",unitCost:45},
  {id:36,cat:"Bathrooms",item:"Wall & floor tiles",spec:"600×300 porcelain — care grade",qty:120,unit:"m²",unitCost:18},
  {id:37,cat:"Partition Walls",item:"CLS timber framing",spec:"CLS 75×50mm studs",qty:1,unit:"lot",unitCost:400},
  {id:38,cat:"Partition Walls",item:"Plasterboard (12.5mm)",spec:"Gyproc WallBoard 2.4m",qty:80,unit:"sheet",unitCost:12},
  {id:39,cat:"Partition Walls",item:"Rockwool acoustic insulation",spec:"RollBatt 100mm",qty:50,unit:"m²",unitCost:6},
  {id:40,cat:"Flooring",item:"Carpet + underlay",spec:"Heavy domestic loop pile",qty:200,unit:"m²",unitCost:16},
  {id:41,cat:"Flooring",item:"Vinyl (hallways + stairs)",spec:"Commercial R10 slip rated",qty:50,unit:"m²",unitCost:18},
  {id:42,cat:"Flooring",item:"Door threshold strips (×14)",spec:"Aluminium T-bar / ramp strips",qty:14,unit:"no.",unitCost:8},
  {id:43,cat:"Fit-Out",item:"Single beds + mattress (×6)",spec:"Care spec — wipe clean",qty:6,unit:"unit",unitCost:450},
  {id:44,cat:"Fit-Out",item:"Wardrobe / storage units (×6)",spec:"IKEA PAX or equivalent",qty:6,unit:"unit",unitCost:250},
  {id:45,cat:"Fit-Out",item:"Blinds — blackout roller (×16)",spec:"Various sizes",qty:16,unit:"unit",unitCost:80},
  {id:46,cat:"Fit-Out",item:"Curtain poles (×4)",spec:"Extendable metal poles",qty:4,unit:"set",unitCost:25},
  {id:47,cat:"Fit-Out",item:"Desk + chair (staff office)",spec:"Office spec desk + swivel",qty:1,unit:"set",unitCost:350},
  {id:48,cat:"Plastering & Decorating",item:"Multi-finish plaster (skim)",spec:"Thistle Multi-Finish 25kg",qty:40,unit:"bag",unitCost:9},
  {id:49,cat:"Plastering & Decorating",item:"Bonding coat (undercoat)",spec:"Thistle Bonding Coat 25kg",qty:25,unit:"bag",unitCost:8},
  {id:50,cat:"Plastering & Decorating",item:"Emulsion paint (walls + ceilings)",spec:"Dulux Trade Vinyl Matt 10L",qty:12,unit:"tub",unitCost:42},
  {id:51,cat:"Plastering & Decorating",item:"Gloss paint (woodwork)",spec:"Dulux Trade Satinwood 5L",qty:6,unit:"tub",unitCost:38},
  {id:52,cat:"Plastering & Decorating",item:"Skirting board (MDF ogee)",spec:"MDF primed ogee 100mm",qty:30,unit:"length",unitCost:6},
  {id:53,cat:"Fire Doors",item:"FD30 fire doors (×14)",spec:"44mm FD30 flush door blank",qty:14,unit:"door",unitCost:65},
  {id:54,cat:"Fire Doors",item:"Fire door frames (×14 liner sets)",spec:"Softwood FD30 certified frame",qty:14,unit:"set",unitCost:35},
  {id:55,cat:"Fire Doors",item:"Intumescent strips + smoke seals",spec:"15×4mm intumescent + brush seal",qty:14,unit:"set",unitCost:12},
  {id:56,cat:"Fire Doors",item:"Overhead door closers (×14)",spec:"Briton 121CE size 3",qty:14,unit:"unit",unitCost:28},
  {id:57,cat:"Kitchen",item:"Kitchen units + worktop + sink",spec:"Budget range — full set",qty:1,unit:"lot",unitCost:2500},
  {id:58,cat:"Kitchen",item:"Appliances (hob, oven, extractor)",spec:"Integrated mid-range",qty:1,unit:"lot",unitCost:1100},
];
const INIT_LABOUR = [
  {id:1,cat:"Preliminaries",item:"Internal strip-out (full house)",scope:"Strip fittings, kitchen, bathrooms, old wiring — clear to shell",qty:1,days:2,unitCost:1000},
  {id:2,cat:"Preliminaries",item:"Architect fees",scope:"LDC + extension + planning drawings",qty:1,days:"—",unitCost:2000},
  {id:3,cat:"Preliminaries",item:"LDC application fee",scope:"Lawful Development Certificate — Redbridge",qty:1,days:"—",unitCost:86},
  {id:4,cat:"Preliminaries",item:"Build-over agreement (Thames Water)",scope:"Sewer proximity — required for extension",qty:1,days:"—",unitCost:300},
  {id:5,cat:"Preliminaries",item:"Structural engineer fees",scope:"Calc packs — loft dormer + rear extension",qty:1,days:"—",unitCost:1000},
  {id:6,cat:"Loft Dormer",item:"Scaffolding hire",scope:"Erect + hire 12–16 weeks + dismantle",qty:1,days:"—",unitCost:1500},
  {id:7,cat:"Loft Dormer",item:"Skip hire — loft demo (×2)",scope:"12-yard skips for roof strip + old timbers",qty:2,days:"—",unitCost:400},
  {id:8,cat:"Loft Dormer",item:"Strip existing roof (hip side)",scope:"Strip tiles, battens, felt, remove hip rafters",qty:1,days:1,unitCost:1000},
  {id:9,cat:"Loft Dormer",item:"Steel beam install — loft (×2 RSJs)",scope:"Lift, position & bolt 2× UBs, prop & make good",qty:1,days:1,unitCost:1000},
  {id:10,cat:"Loft Dormer",item:"Gable end wall + dormer frame",scope:"Build gable end, construct dormer frame + cheeks",qty:1,days:3,unitCost:500},
  {id:11,cat:"Loft Dormer",item:"New roof — re-tile, felt & batten",scope:"Felt, batten & re-tile incl. lead flashing",qty:1,days:3,unitCost:500},
  {id:12,cat:"Loft Dormer",item:"Floor joists + structural floor",scope:"Install joists at 400ctrs, fix 18mm T&G chipboard",qty:1,days:2,unitCost:2000},
  {id:13,cat:"Loft Dormer",item:"Insulation (roof, walls, floor)",scope:"Fit 150mm PIR rafters + Rockwool 100mm floor",qty:1,days:2,unitCost:1000},
  {id:14,cat:"Loft Dormer",item:"VELUX install (×2 rear skylights)",scope:"Cut openings, fit VELUX with flashing kits",qty:2,days:1,unitCost:200},
  {id:15,cat:"Loft Dormer",item:"Dormer window install (×2 front face)",scope:"Fit uPVC casements, seal, trim & make good",qty:2,days:1,unitCost:200},
  {id:16,cat:"Rear Extension",item:"Demolish existing rear + foundations",scope:"Knock down, break out old foundations, clear site",qty:1,days:2,unitCost:500},
  {id:17,cat:"Rear Extension",item:"Skip hire — extension (×4)",scope:"12-yard skips for rubble + dig-out",qty:4,days:"—",unitCost:400},
  {id:18,cat:"Rear Extension",item:"Groundworks & foundations",scope:"Excavate footings, pour concrete, lay DPM + slab",qty:1,days:4,unitCost:1000},
  {id:19,cat:"Rear Extension",item:"Drain diversion (≈3m move)",scope:"Divert drain run, reconnect to main sewer",qty:1,days:2,unitCost:500},
  {id:20,cat:"Rear Extension",item:"Brickwork & blockwork (walls)",scope:"Build cavity walls — outer brick + inner block",qty:1,days:8,unitCost:1000},
  {id:21,cat:"Rear Extension",item:"Steels, padstones & lintels",scope:"Lift 3× RSJs/UCs, bed padstones, install lintels",qty:1,days:1,unitCost:500},
  {id:22,cat:"Rear Extension",item:"Flat roof (warm deck)",scope:"Fit warm deck flat roof — insulation + GRP",qty:1,days:3,unitCost:1000},
  {id:23,cat:"Rear Extension",item:"Bi-folds, glazing + windows",scope:"Fit bi-fold doors, extension windows + seals",qty:1,days:2,unitCost:500},
  {id:24,cat:"Partition Walls",item:"Stud walls (CLS + plasterboard)",scope:"Frame stud walls, single-skin plasterboard",qty:1,days:3,unitCost:800},
  {id:25,cat:"Partition Walls",item:"Rockwool acoustic insulation",scope:"Fit RollBatt 100mm between studs",qty:1,days:1,unitCost:200},
  {id:26,cat:"Partition Walls",item:"Resilient bars + second skin board",scope:"Fix resilient bars, hang second layer board",qty:1,days:2,unitCost:500},
  {id:27,cat:"Plumbing & Heating",item:"First fix pipework + soil stacks",scope:"Copper runs, soil stack drops, boxing in",qty:1,days:5,unitCost:2000},
  {id:28,cat:"Plumbing & Heating",item:"System boiler install",scope:"Commission Worcester Bosch boiler + controls",qty:1,days:1,unitCost:800},
  {id:29,cat:"Plumbing & Heating",item:"Unvented cylinder install",scope:"Commission Megaflo + pressure relief, Part G",qty:1,days:1,unitCost:600},
  {id:30,cat:"Plumbing & Heating",item:"Radiators + TRVs (full house)",scope:"Hang 12 rads, fit TRVs, balance system",qty:12,days:1,unitCost:125},
  {id:31,cat:"Plumbing & Heating",item:"Second fix plumbing + commissioning",scope:"Sanitaryware connections, leak test, commission",qty:1,days:3,unitCost:2500},
  {id:32,cat:"Electrical",item:"Full rewire (consumer unit + cable runs)",scope:"Strip + rewire full house, new Hager CU",qty:1,days:8,unitCost:2500},
  {id:33,cat:"Electrical",item:"Fire alarm system (L1)",scope:"Install addressable L1 system — CQC compliant",qty:1,days:3,unitCost:1200},
  {id:34,cat:"Electrical",item:"Emergency lighting",scope:"Install 8× maintained LED emergency units",qty:8,days:1,unitCost:100},
  {id:35,cat:"Electrical",item:"Second fix + EICR certification",scope:"Sockets, switches, downlights, EICR cert",qty:1,days:3,unitCost:800},
  {id:36,cat:"Bathrooms",item:"Wet room tiling (×5)",scope:"Wall tile to 2.1m, full floor tile, grouting",qty:5,days:1.5,unitCost:250},
  {id:37,cat:"Bathrooms",item:"Sanitaryware fit (×5 wet rooms)",scope:"Fit shower, toilet, basin, grab rails per room",qty:5,days:1,unitCost:400},
  {id:38,cat:"Bathrooms",item:"Grab rail installation (×10)",scope:"Fix stainless grab rails — CQC accessibility",qty:10,days:0.25,unitCost:50},
  {id:39,cat:"Kitchen",item:"Kitchen units + worktop + sink",scope:"Fit units, cut & fix worktop, plumb sink",qty:1,days:2,unitCost:600},
  {id:40,cat:"Kitchen",item:"Appliances (hob, oven, extractor)",scope:"Install hob, oven, extractor with ducting",qty:1,days:1,unitCost:500},
  {id:41,cat:"Fire Doors",item:"Hang FD30 fire doors (×14)",scope:"Fit door, plane, hinges, latch, handle",qty:14,days:0.5,unitCost:50},
  {id:42,cat:"Fire Doors",item:"Fire door frames + linings (×14)",scope:"Fit FD30 certified frames + architrave",qty:14,days:0.5,unitCost:20},
  {id:43,cat:"Fire Doors",item:"Intumescent strips + closers (×14)",scope:"Rout strips, fit smoke seals + closers",qty:14,days:0.25,unitCost:20},
  {id:44,cat:"Plastering & Decorating",item:"Skim coat — ground floor rooms",scope:"2-coat skim — bedrooms, reception, hallway GF",qty:1,days:3,unitCost:2500},
  {id:45,cat:"Plastering & Decorating",item:"Skim coat — first floor rooms",scope:"2-coat skim — bedrooms, landing, hallway FF",qty:1,days:3,unitCost:2500},
  {id:46,cat:"Plastering & Decorating",item:"Skim coat — hallways & stairwell",scope:"2-coat skim — GF hallway, FF landing, stairwell",qty:1,days:2,unitCost:1000},
  {id:47,cat:"Plastering & Decorating",item:"Paint — all rooms (emulsion)",scope:"Mist coat + 2 coats emulsion — full building",qty:1,days:5,unitCost:1000},
  {id:48,cat:"Plastering & Decorating",item:"Gloss woodwork (full house)",scope:"Prime + 2 coats satinwood — all frames + sills",qty:1,days:2,unitCost:500},
  {id:49,cat:"Plastering & Decorating",item:"Caulking + snagging",scope:"Final caulk, fill, touch-up, snag clearance",qty:1,days:1,unitCost:250},
  {id:50,cat:"Flooring",item:"Carpet lay — bedrooms + reception",scope:"Lay underlay + carpet, gripper rods",qty:8,days:0.5,unitCost:250},
  {id:51,cat:"Flooring",item:"Vinyl lay — hallways, stairs & landings",scope:"Prepare subfloor, glue & lay vinyl",qty:1,days:2,unitCost:500},
  {id:52,cat:"Flooring",item:"Vinyl lay — kitchen",scope:"Prepare subfloor, glue & lay vinyl in kitchen",qty:1,days:0.5,unitCost:100},
  {id:53,cat:"Fit-Out",item:"Furniture assembly — per bedroom (×6)",scope:"Assemble bed, wardrobe, position furniture",qty:6,days:0.5,unitCost:500},
  {id:54,cat:"Fit-Out",item:"Blind fitting — full house (×16)",scope:"Measure, drill & fit 16× blackout roller blinds",qty:16,days:1,unitCost:20},
  {id:55,cat:"Fit-Out",item:"Final clean (builders clean)",scope:"Full builders clean — ready for handover",qty:1,days:1,unitCost:1000},
];
const FEES_INIT = [
  {id:1,item:"Architect Fees",amount:2000},
  {id:2,item:"LDC Application Fee",amount:86},
  {id:3,item:"Planning Application Fee",amount:528},
  {id:4,item:"Build-Over Agreement (Thames Water)",amount:300},
  {id:5,item:"Structural Engineer",amount:1000},
  {id:6,item:"Party Wall Surveyor",amount:800},
];
const GRAPH_TASKS_INIT = [
  {id:"ldc",phase:"Planning & Approvals",label:"LDC Application",sub:"Lawful Development Certificate · Redbridge",who:"Planning Authority",period:"Mar–Apr 26",blockedBy:[],wkStart:0,wkEnd:5},
  {id:"pwall",phase:"Planning & Approvals",label:"Party Wall Notices",sub:"Serve notice on 12 FBR · verbal consent done",who:"Owner",period:"Mar 26",blockedBy:[],wkStart:0,wkEnd:0},
  {id:"steelcalc",phase:"Planning & Approvals",label:"Loft Steel Calc Pack",sub:"Structural engineer drawings for building control",who:"Structural Engineer",period:"Mar–Apr 26",blockedBy:[],wkStart:0,wkEnd:4},
  {id:"buildover",phase:"Planning & Approvals",label:"Build-Over Agreement",sub:"Thames Water · ~6 weeks · blocks extension start",who:"Owner",period:"Apr–Jun 26",blockedBy:[],wkStart:4,wkEnd:9},
  {id:"preplanning",phase:"Planning & Approvals",label:"Pre-Planning Enquiry (C3b)",sub:"Informal submission to Redbridge before full app",who:"Planning Authority",period:"Apr–Jun 26",blockedBy:["ldc"],wkStart:5,wkEnd:9},
  {id:"c3bplanning",phase:"Planning & Approvals",label:"C3(b) Full Planning Application",sub:"Use-change application · 8-week determination",who:"Planning Authority",period:"May–Jun 26",blockedBy:["preplanning","buildover"],wkStart:9,wkEnd:17},
  {id:"socialcare",phase:"Planning & Approvals",label:"Contact Redbridge Adult Social Care",sub:"Introduce scheme early · referral pathway",who:"Owner",period:"Apr 26",blockedBy:[],wkStart:4,wkEnd:4},
  {id:"scaffold",phase:"Loft Works",label:"Scaffolding",sub:"Rear + front + side · before any structural work",who:"Builder",period:"Apr 26",blockedBy:["ldc"],wkStart:5,wkEnd:18},
  {id:"bcapp",phase:"Loft Works",label:"Building Control Application",sub:"Full plans submission once LDC granted + calcs done",who:"Building Control",period:"Apr–May 26",blockedBy:["ldc","steelcalc"],wkStart:5,wkEnd:8},
  {id:"loftdemo",phase:"Loft Works",label:"Loft Demolition",sub:"Strip hip roof, remove rafters, clear for gable",who:"Builder",period:"Apr–May 26",blockedBy:["scaffold","bcapp"],wkStart:6,wkEnd:7},
  {id:"loftstruct",phase:"Loft Works",label:"Loft Structure",sub:"Hip to gable, steels, joists, dormer, roof, VELUX",who:"Builder",period:"May 26",blockedBy:["loftdemo"],wkStart:7,wkEnd:11},
  {id:"wallsreconfig",phase:"Internal First Fix",label:"Internal Wall Realignment",sub:"Stud reconfiguration · load-bearing check complete",who:"Builder",period:"Jun 26",blockedBy:["loftstruct"],wkStart:12,wkEnd:13},
  {id:"firstfixplumb",phase:"Internal First Fix",label:"First Fix Plumbing",sub:"Pipework, soil stacks, radiator drops throughout",who:"Plumber",period:"Jun 26",blockedBy:["wallsreconfig"],wkStart:13,wkEnd:15},
  {id:"firstfixelec",phase:"Internal First Fix",label:"First Fix Electrical",sub:"Consumer unit, cable runs, back boxes all floors",who:"Electrician",period:"Jun 26",blockedBy:["wallsreconfig"],wkStart:13,wkEnd:15},
  {id:"extdemo",phase:"Rear Extension",label:"Extension Demolition",sub:"Knock down existing rear, break out old foundations",who:"Builder",period:"Jul 26",blockedBy:["buildover","c3bplanning"],wkStart:18,wkEnd:19},
  {id:"foundations",phase:"Rear Extension",label:"Foundation Dig & Pour",sub:"Excavate footings, concrete, DPM, slab",who:"Builder",period:"Jul 26",blockedBy:["extdemo"],wkStart:19,wkEnd:21},
  {id:"draindiv",phase:"Rear Extension",label:"Drain Diversion (≈3m)",sub:"Reroute drain away from new footprint",who:"Builder",period:"Jul 26",blockedBy:["extdemo"],wkStart:19,wkEnd:20},
  {id:"extstruct",phase:"Rear Extension",label:"Extension Structure",sub:"Blockwork, bricks, flat roof, bi-folds, windows",who:"Builder",period:"Jul–Aug 26",blockedBy:["foundations","draindiv"],wkStart:21,wkEnd:26},
  {id:"studwalls",phase:"Rear Extension",label:"Stud Walls Build-Out",sub:"CLS timber, plasterboard, Rockwool, resilient bars",who:"Builder",period:"Aug 26",blockedBy:["extstruct"],wkStart:26,wkEnd:28},
  {id:"secondfixelec",phase:"Second Fix & Fit-Out",label:"Second Fix Electrical",sub:"Sockets, downlights, switches, EICR certification",who:"Electrician",period:"Aug 26",blockedBy:["firstfixelec","studwalls"],wkStart:28,wkEnd:30},
  {id:"secondfixplumb",phase:"Second Fix & Fit-Out",label:"Second Fix Plumbing",sub:"Boiler, cylinder, radiators, heating controls",who:"Plumber",period:"Aug 26",blockedBy:["firstfixplumb","studwalls"],wkStart:28,wkEnd:30},
  {id:"ensuites",phase:"Second Fix & Fit-Out",label:"Ensuite Completion (×5)",sub:"Tiling, sanitaryware, grab rails per wet room",who:"Builder + Trades",period:"Aug–Sep 26",blockedBy:["secondfixplumb"],wkStart:30,wkEnd:32},
  {id:"kitchen",phase:"Second Fix & Fit-Out",label:"Kitchen Fit-Out",sub:"Units, worktop, sink, appliances, splashback",who:"Builder",period:"Aug–Sep 26",blockedBy:["secondfixplumb"],wkStart:30,wkEnd:31},
  {id:"plasteringdec",phase:"Second Fix & Fit-Out",label:"Plastering & Decorating",sub:"Skim all floors, emulsion, gloss, snagging",who:"Builder",period:"Sep 26",blockedBy:["secondfixelec","secondfixplumb"],wkStart:30,wkEnd:34},
  {id:"flooring",phase:"Second Fix & Fit-Out",label:"Flooring",sub:"Carpet + underlay 200m², vinyl hallways",who:"Builder",period:"Sep 26",blockedBy:["plasteringdec"],wkStart:34,wkEnd:35},
  {id:"firedoors",phase:"Second Fix & Fit-Out",label:"Fire Doors (×14 FD30)",sub:"Frames, intumescent strips, closers — CQC critical",who:"Builder",period:"Sep 26",blockedBy:["plasteringdec"],wkStart:34,wkEnd:35},
  {id:"firealarm",phase:"Second Fix & Fit-Out",label:"Fire Alarm (L1) + EM Lighting",sub:"CQC requirement · after full rewire complete",who:"Electrician",period:"Sep 26",blockedBy:["secondfixelec"],wkStart:32,wkEnd:34},
  {id:"furnishing",phase:"Second Fix & Fit-Out",label:"Furnishing",sub:"Beds, wardrobes, blinds, office — care spec",who:"Owner",period:"Sep–Oct 26",blockedBy:["flooring","firedoors"],wkStart:35,wkEnd:36},
  {id:"snagging",phase:"Second Fix & Fit-Out",label:"Snagging + Builders Clean",sub:"Final snag list clearance before CQC inspection",who:"Builder",period:"Oct 26",blockedBy:["furnishing","firealarm"],wkStart:36,wkEnd:37},
  {id:"commission",phase:"Handover",label:"Commission & Let",sub:"CQC registration, yield valuation, first tenants",who:"Owner",period:"Oct 26",blockedBy:["snagging","c3bplanning"],wkStart:37,wkEnd:39},
];
const DEFAULT_TASK_DATES = {
  // Updated from screenshot — W1 = 23 Mar 2026
  ldc:           {startWk:0,  endWk:6},
  pwall:         {startWk:0,  endWk:2},
  steelcalc:     {startWk:0,  endWk:6},
  buildover:     {startWk:5,  endWk:12},
  preplanning:   {startWk:6,  endWk:13},
  c3bplanning:   {startWk:6,  endWk:16},
  socialcare:    {startWk:5,  endWk:7},
  scaffold:      {startWk:6,  endWk:16},
  bcapp:         {startWk:6,  endWk:11},
  loftdemo:      {startWk:8,  endWk:10},
  loftstruct:    {startWk:10, endWk:15},
  wallsreconfig: {startWk:11, endWk:15},
  firstfixplumb: {startWk:17, endWk:19},
  firstfixelec:  {startWk:17, endWk:19},
  extdemo:       {startWk:17, endWk:19},
  foundations:   {startWk:17, endWk:19},
  draindiv:      {startWk:17, endWk:19},
  extstruct:     {startWk:19, endWk:23},
  studwalls:     {startWk:21, endWk:25},
  secondfixelec: {startWk:23, endWk:25},
  secondfixplumb:{startWk:23, endWk:25},
  ensuites:      {startWk:23, endWk:27},
  kitchen:       {startWk:23, endWk:27},
  plasteringdec: {startWk:19, endWk:27},
  flooring:      {startWk:25, endWk:28},
  firedoors:     {startWk:25, endWk:27},
  firealarm:     {startWk:25, endWk:27},
  furnishing:    {startWk:27, endWk:29},
  snagging:      {startWk:29, endWk:33},
  commission:    {startWk:33, endWk:52},
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = n => "£"+Number(n||0).toLocaleString("en-GB",{minimumFractionDigits:0,maximumFractionDigits:0});
const nxt = arr => Math.max(0,...arr.map(r=>r.id))+1;
const groupBy = (arr,key) => arr.reduce((acc,r)=>{if(!acc[r[key]])acc[r[key]]=[];acc[r[key]].push(r);return acc;},{});
const mT = r => (r.qty||0)*(r.unitCost||0);
const lT = r => (r.qty||0)*(r.unitCost||0);
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtMY = (y,m) => `${MONTHS[m]} '${String(y).slice(2)}`;

// ─── EDITABLE CELL ───────────────────────────────────────────────────────────
function EC({value,onChange,type="text",align="left",T,currency=false,dimColor,boldWeight}){
  const [ed,setEd]=useState(false);
  const [v,setV]=useState(value);
  const commit=()=>{setEd(false);onChange(type==="number"?parseFloat(v)||0:v);};
  if(ed)return<input autoFocus value={v} onChange={e=>setV(e.target.value)} onBlur={commit} onKeyDown={e=>e.key==="Enter"&&commit()}
    style={{width:"100%",border:"none",borderBottom:"1.5px solid "+T.blue,borderRadius:0,padding:"2px 4px",background:"transparent",color:T.text,fontSize:13,outline:"none",fontFamily:FONT,textAlign:align}}/>;
  const disp=type==="number"?(currency?fmt(value):Number(value||0).toLocaleString("en-GB",{maximumFractionDigits:2})):(value||"—");
  const textColor=dimColor||T.text;
  const fw=boldWeight||400;
  return<span onClick={()=>{setEd(true);setV(value);}} title="Click to edit"
    style={{display:"block",padding:"2px 4px",cursor:"pointer",textAlign:align,color:textColor,fontFamily:FONT,fontSize:13,fontWeight:fw}}>{disp}</span>;
}

// ─── BUDGET BAR ──────────────────────────────────────────────────────────────
function BudgetBar({purchase,build,fees,budget,T}){
  const used=purchase+build+fees;
  const headroom=budget-used;
  const segs=[
    {label:"Purchase",val:purchase,color:"#007AFF",pct:(purchase/budget*100).toFixed(1)},
    {label:"Labour + Materials",val:build,color:"#FF9500",pct:(build/budget*100).toFixed(1)},
    {label:"Fees",val:fees,color:"#5AC8FA",pct:(fees/budget*100).toFixed(1)},
    {label:"Free",val:Math.max(0,headroom),color:T===DARK?"#2C2C2E":"#E5E5EA",pct:Math.max(0,(headroom/budget*100)).toFixed(1)},
  ];
  return(
    <div>
      <div style={{display:"flex",height:16,borderRadius:99,overflow:"hidden",gap:2,marginBottom:14}}>
        {segs.map(s=>s.val>0&&<div key={s.label} style={{flex:s.val/budget,background:s.color,minWidth:3,transition:"flex .5s cubic-bezier(.4,0,.2,1)"}} title={`${s.label}: ${fmt(s.val)}`}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"8px 0"}}>
        {segs.filter(s=>s.label!=="Free").map(s=>(
          <div key={s.label} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:10,height:10,borderRadius:3,background:s.color,flexShrink:0}}/>
            <div>
              <div style={{fontSize:11,color:T.textSecond,fontFamily:FONT,lineHeight:1.2}}>{s.label}</div>
              <div style={{fontSize:14,fontWeight:700,color:T.text,fontFamily:FONT,letterSpacing:"-0.3px"}}>{fmt(s.val)}</div>
              <div style={{fontSize:10,color:T.textTertiary,fontFamily:FONT}}>{s.pct}% of budget</div>
            </div>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:10,height:10,borderRadius:3,background:T===DARK?"#2C2C2E":"#E5E5EA",border:"1px solid "+T.border,flexShrink:0}}/>
          <div>
            <div style={{fontSize:11,color:T.textSecond,fontFamily:FONT,lineHeight:1.2}}>Headroom</div>
            <div style={{fontSize:14,fontWeight:700,color:headroom>=0?T.green:T.red,fontFamily:FONT,letterSpacing:"-0.3px"}}>{fmt(Math.abs(headroom))}</div>
            <div style={{fontSize:10,color:T.textTertiary,fontFamily:FONT}}>{headroom>=0?"remaining":"over budget"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({label,value,accent,T,sub}){
  // Solid card: slightly tinted background derived from accent, solid border
  const solidBgMap={
    "#007AFF":T===DARK?"rgba(0,84,180,0.35)":"rgba(0,122,255,0.08)",
    "#0A84FF":T===DARK?"rgba(0,84,180,0.35)":"rgba(10,132,255,0.08)",
    "#FF9500":T===DARK?"rgba(180,90,0,0.35)":"rgba(255,149,0,0.08)",
    "#FF9F0A":T===DARK?"rgba(180,90,0,0.35)":"rgba(255,159,10,0.08)",
    "#5AC8FA":T===DARK?"rgba(20,100,160,0.35)":"rgba(90,200,250,0.08)",
    "#64D2FF":T===DARK?"rgba(20,100,160,0.35)":"rgba(100,210,255,0.08)",
    "#5856D6":T===DARK?"rgba(60,58,180,0.35)":"rgba(88,86,214,0.08)",
    "#5E5CE6":T===DARK?"rgba(60,58,180,0.35)":"rgba(94,92,230,0.08)",
  };
  const bg=solidBgMap[accent]||(T===DARK?"rgba(40,40,46,0.80)":"rgba(255,255,255,0.80)");
  return(
    <div style={{
      background:bg,
      border:"1px solid "+(accent||T.border)+"33",
      borderRadius:14,padding:"16px 18px"
    }}>
      <div style={{fontSize:11,fontWeight:500,color:T.textSecond,marginBottom:6,fontFamily:FONT}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:accent||T.text,letterSpacing:"-0.5px",fontFamily:FONT,lineHeight:1.1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:T.textTertiary,marginTop:4,fontFamily:FONT}}>{sub}</div>}
    </div>
  );
}

// ─── DETAIL TABLE ────────────────────────────────────────────────────────────
function DetailTable({section,rows,cols,onUpdate,onAdd,onDelete,T,collapsed,onToggle}){
  const subtotals=useMemo(()=>{const t={};cols.forEach(c=>{if(c.sum)t[c.key]=rows.reduce((a,r)=>a+(Number(c.computed?c.compute(r):r[c.key])||0),0);});return t;},[rows,cols]);
  return(
    <div style={{ background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:"1px solid "+T.glassBorder,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
      <div onClick={onToggle} style={{padding:"10px 16px",background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:collapsed?"none":"1px solid "+T.glassBorderSubtle,cursor:"pointer",userSelect:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:12,color:T.textTertiary,lineHeight:1,transition:"transform .2s",display:"inline-block",transform:collapsed?"rotate(-90deg)":"rotate(0deg)"}}>▾</span>
          <span style={{fontSize:12,fontWeight:600,color:T.text,fontFamily:FONT}}>{section}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:12,fontWeight:700,color:T.blue,fontFamily:FONT}}>{fmt(subtotals[cols.find(c=>c.sum)?.key]||0)}</span>
          {!collapsed&&<button onClick={e=>{e.stopPropagation();onAdd(section);}} style={{fontSize:11,padding:"3px 10px",borderRadius:7,border:"none",background:T.blue,color:"#fff",cursor:"pointer",fontWeight:600,fontFamily:FONT}}>+ Add</button>}
        </div>
      </div>
      {!collapsed&&(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur}}>
                {cols.map(c=><th key={c.key} style={{padding:"7px 14px",textAlign:c.align||"left",fontSize:11,fontWeight:600,color:c.dim?T.textQuart:T.textSecond,borderBottom:"1px solid "+T.border,whiteSpace:c.last?"normal":"nowrap",minWidth:c.last?"180px":c.primary?"140px":"auto",fontFamily:FONT}}>{c.label}</th>)}
                <th style={{width:28,borderBottom:"1px solid "+T.border}}/>
              </tr>
            </thead>
            <tbody>
              {rows.map((row,i)=>(
                <tr key={row.id} style={{background:i%2===0?"transparent":T.glassSubtle,borderBottom:"1px solid "+T.separator}}>
                  {cols.map((c,ci)=>{
                    const isLast=ci===cols.length-1;
                    const cellColor=c.bold?T.text:c.dim?T.textTertiary:T.text;
                    const cellWeight=c.bold?700:400;
                    const wrapStyle=c.key==="item"||c.key==="scope"
                      ? {whiteSpace:"normal",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}
                      : isLast
                      ? {whiteSpace:"normal"}
                      : c.wrap?{whiteSpace:"normal"}:{whiteSpace:"nowrap"};
                    return(
                      <td key={c.key} style={{padding:"8px 14px",...wrapStyle}}>
                        {c.readOnly
                          ?<span style={{color:c.bold?T.text:T.blue,fontWeight:c.bold?700:600,fontSize:13,fontFamily:FONT}}>{c.compute?fmt(c.compute(row)):row[c.key]}</span>
                          :<EC value={c.computed?c.compute(row):row[c.key]} onChange={v=>onUpdate(row.id,c.key,v)} type={c.type||"text"} align={c.align||"left"} T={T} currency={!!c.currency} dimColor={c.dim?T.textTertiary:undefined}/>}
                      </td>
                    );
                  })}
                  <td style={{padding:"6px 8px",textAlign:"center"}}><button onClick={()=>onDelete(row.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.textTertiary,fontSize:16,lineHeight:1}}>×</button></td>
                </tr>
              ))}
              <tr style={{background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderTop:"1px solid "+T.glassBorderSubtle}}>
                {cols.map((c,ci)=>(
                  <td key={c.key} style={{padding:"9px 14px",fontWeight:700,fontSize:13,color:ci===0?T.textSecond:c.sum?T.text:"",fontFamily:FONT,textAlign:c.align||"left"}}>
                    {ci===0?"Subtotal":c.sum?fmt(subtotals[c.key]):""}
                  </td>
                ))}
                <td/>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── SEGMENTED STATUS CONTROL ────────────────────────────────────────────────
const CONTACT_ROLES = [
  "Owner",
  "Architect",
  "Structural Engineer",
  "Building Inspector",
  "Planning Officer",
  "Solicitor",
  "Main Builder",
  "Contractor",
  "Plumber",
  "Electrician",
];

// ─── CONTACT SHEET ───────────────────────────────────────────────────────────
function ContactSheet({contact,onClose,onSave,onDelete,T}){
  const [draft,setDraft]=useState({...contact});
  const upd=(f,v)=>setDraft(p=>({...p,[f]:v}));
  const fieldStyle={
    width:"100%",padding:"10px 12px",borderRadius:10,
    border:"1px solid "+T.glassBorder,
    background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,
    color:T.text,fontSize:14,fontFamily:FONT,outline:"none",
    marginTop:4,boxSizing:"border-box",
  };
  const labelStyle={fontSize:11,fontWeight:600,color:T.textTertiary,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:FONT};
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}/>
      <div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:201,
        background:T.glassStrong,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,
        border:"1px solid "+T.glassBorder,borderBottom:"none",
        borderRadius:"24px 24px 0 0",padding:"8px 20px 48px",
        maxHeight:"85vh",overflowY:"auto",
        boxShadow:"0 -8px 60px rgba(0,0,0,0.30)"}}>
        <div style={{width:40,height:4,borderRadius:99,background:T.border,margin:"8px auto 20px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:17,fontWeight:700,color:T.text,fontFamily:FONT}}>Edit Contact</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textTertiary,fontSize:22,lineHeight:1,padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Role — fixed dropdown */}
          <div>
            <div style={labelStyle}>Role</div>
            <select value={draft.role} onChange={e=>upd("role",e.target.value)} style={fieldStyle}>
              <option value="">Select role…</option>
              {CONTACT_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {/* Free-text fields */}
          {[["name","Name"],["phone","Phone"],["email","Email"],["notes","Notes"]].map(([f,lbl])=>(
            <div key={f}>
              <div style={labelStyle}>{lbl}</div>
              {f==="notes"
                ? <textarea value={draft[f]} onChange={e=>upd(f,e.target.value)} rows={3}
                    style={{...fieldStyle,resize:"vertical",lineHeight:1.5}}/>
                : <input value={draft[f]} onChange={e=>upd(f,e.target.value)}
                    style={fieldStyle} placeholder={lbl}/>
              }
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,marginTop:24}}>
          <button onClick={()=>onSave(draft)}
            style={{flex:1,padding:"13px",borderRadius:12,border:"none",
              background:T.blue,color:"#fff",fontSize:14,fontWeight:600,
              cursor:"pointer",fontFamily:FONT}}>
            Save
          </button>
          <button onClick={()=>onDelete(contact.id)}
            style={{padding:"13px 18px",borderRadius:12,border:"1px solid "+T.glassBorder,
              background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,
              color:T.red,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
}

function SegControl({ value, onChange, hardBlocked, T }) {
  const OPTIONS = [
    { val:"Pending",     label:"Upcoming",    color:T.textTertiary },
    { val:"In Progress", label:"In Progress", color:T.orange },
    { val:"Done",        label:"Complete",    color:T.green },
  ];
  const idx = Math.max(0, OPTIONS.findIndex(o => o.val === value));

  if (hardBlocked) return (
    <span style={{ display:"inline-block", padding:"7px 16px", borderRadius:10, fontSize:13,
      fontWeight:600, fontFamily:FONT, background:T.redLight, color:T.red,
      cursor:"not-allowed", opacity:0.75 }}>
      Blocked
    </span>
  );

  return (
    <div onClick={e => e.stopPropagation()}
      style={{ position:"relative", display:"inline-flex",
        borderRadius:12, background:T.glassSubtle,
        backdropFilter:T.blur, WebkitBackdropFilter:T.blur,
        padding:3 }}>
      {/* Sliding pill — no border */}
      <div style={{
        position:"absolute", top:3, bottom:3,
        left:`calc(${idx} * 33.333% + 3px)`,
        width:"calc(33.333% - 3px)",
        background:T.glassStrong,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,
        borderRadius:9,
        boxShadow:"0 1px 4px rgba(0,0,0,0.10)",
        transition:"left .2s cubic-bezier(.4,0,.2,1)",
        pointerEvents:"none",
      }} />
      {OPTIONS.map(o => (
        <button key={o.val}
          onClick={e => { e.stopPropagation(); onChange(o.val); }}
          style={{
            position:"relative", zIndex:1,
            flex:1, padding:"8px 14px",
            border:"none", background:"transparent",
            fontSize:13, fontWeight:600, fontFamily:FONT,
            color: value === o.val ? o.color : T.textTertiary,
            cursor:"pointer", borderRadius:9, whiteSpace:"nowrap",
            transition:"color .2s",
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}


function DepSheet({task,blockers,unblocks,onClose,onNavigate,statusLabel,statusColor,statusBg,setStatus,setDeps,TASKS,isBlocked,T}){
  const blocked=isBlocked(task);
  const [showAdd,setShowAdd]=useState(false);

  // Tasks that can be added as blockers: not self, not already a blocker, not a downstream dependent (would create cycle)
  const downstream=new Set();
  const collectDown=(id)=>{TASKS.filter(t=>t.blockedBy.includes(id)).forEach(t=>{if(!downstream.has(t.id)){downstream.add(t.id);collectDown(t.id);}});};
  collectDown(task.id);
  const addable=TASKS.filter(t=>t.id!==task.id&&!task.blockedBy.includes(t.id)&&!downstream.has(t.id));

  const removeBlocker=(bid)=>setDeps(task.id,task.blockedBy.filter(id=>id!==bid));
  const addBlocker=(bid)=>{setDeps(task.id,[...task.blockedBy,bid]);setShowAdd(false);};

  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}}/>
      <div style={{background:T.glassStrong,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:"1px solid "+T.glassBorder,position:"fixed",left:0,right:0,bottom:0,zIndex:201,borderRadius:"24px 24px 0 0",padding:"8px 20px 48px",maxHeight:"72vh",overflowY:"auto",boxShadow:"0 -8px 60px rgba(0,0,0,0.30)",borderBottom:"none"}}>
        <div style={{width:40,height:4,borderRadius:99,background:T.border,margin:"8px auto 20px"}}/>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{fontSize:17,fontWeight:700,color:T.text,fontFamily:FONT,lineHeight:1.3,flex:1,marginRight:14}}>{task.label}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.textTertiary,fontSize:22,lineHeight:1,padding:"0 4px",flexShrink:0}}>×</button>
        </div>
        <div style={{fontSize:13,color:T.textTertiary,marginBottom:16,fontFamily:FONT,lineHeight:1.5}}>{task.sub}</div>

        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:12,padding:"5px 12px",borderRadius:8,fontWeight:600,background:statusBg(task),color:statusColor(task),fontFamily:FONT}}>{statusLabel(task)}</span>
          <span style={{fontSize:12,padding:"5px 12px",borderRadius:8,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,color:T.textSecond,fontFamily:FONT}}>{task.period}</span>
          <span style={{fontSize:12,padding:"5px 12px",borderRadius:8,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,color:T.textSecond,fontFamily:FONT}}>{task.who}</span>
        </div>

        {/* Status — only show when not blocked */}
        {!blocked&&(
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:T.textTertiary,marginBottom:10,fontFamily:FONT}}>Update status</div>
            <SegControl value={task.status} onChange={val=>setStatus(task.id,val)} hardBlocked={false} T={T}/>
          </div>
        )}

        {/* Blocked by — editable */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:T.red,fontFamily:FONT}}>
              Blocked by {blockers.length===0&&<span style={{color:T.textTertiary,fontWeight:400,textTransform:"none",letterSpacing:0}}>(none)</span>}
            </div>
            <button onClick={e=>{e.stopPropagation();setShowAdd(s=>!s);}}
              style={{fontSize:11,padding:"3px 10px",borderRadius:7,border:"1px solid "+T.glassBorder,
                background:showAdd?T.blue:T.glassSubtle,color:showAdd?"#fff":T.blue,
                cursor:"pointer",fontWeight:600,fontFamily:FONT}}>
              {showAdd?"Cancel":"+ Add"}
            </button>
          </div>

          {/* Add blocker dropdown */}
          {showAdd&&(
            <div onClick={e=>e.stopPropagation()} style={{marginBottom:10,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:"1px solid "+T.glassBorder,borderRadius:10,overflow:"hidden"}}>
              {addable.length===0
                ? <div style={{padding:"12px 14px",fontSize:13,color:T.textTertiary,fontFamily:FONT}}>No valid tasks to add</div>
                : addable.map(t=>(
                  <div key={t.id} onClick={()=>addBlocker(t.id)}
                    style={{padding:"11px 14px",cursor:"pointer",borderBottom:"1px solid "+T.glassBorderSubtle,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:statusColor(t),flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:FONT}}>{t.label}</div>
                      <div style={{fontSize:11,color:T.textTertiary,fontFamily:FONT}}>{t.phase}</div>
                    </div>
                    <span style={{fontSize:12,color:T.blue,fontWeight:600,fontFamily:FONT}}>Add</span>
                  </div>
                ))
              }
            </div>
          )}

          {/* Existing blockers */}
          {blockers.map(b=>(
            <div key={b.id} style={{padding:"12px 14px",borderRadius:12,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:"1px solid "+T.glassBorderSubtle,marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:statusColor(b),flexShrink:0}}/>
              <div style={{flex:1,cursor:"pointer"}} onClick={()=>onNavigate(b.id)}>
                <div style={{fontSize:14,fontWeight:600,color:T.text,fontFamily:FONT}}>{b.label}</div>
                <div style={{fontSize:12,color:T.textTertiary,fontFamily:FONT,marginTop:2}}>{statusLabel(b)} · {b.period}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();removeBlocker(b.id);}}
                style={{background:"none",border:"none",cursor:"pointer",color:T.textTertiary,fontSize:18,lineHeight:1,padding:"0 4px",flexShrink:0}}
                title="Remove dependency">×</button>
            </div>
          ))}
        </div>

        {/* Unblocks */}
        {unblocks.length>0&&(
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:T.green,marginBottom:10,fontFamily:FONT}}>Unblocks</div>
            {unblocks.map(u=>(
              <div key={u.id} onClick={()=>onNavigate(u.id)} style={{padding:"14px 16px",borderRadius:12,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:"1px solid "+T.glassBorderSubtle,marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:statusColor(u),flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.text,fontFamily:FONT}}>{u.label}</div>
                  <div style={{fontSize:12,color:T.textTertiary,fontFamily:FONT,marginTop:2}}>{statusLabel(u)} · {u.period}</div>
                </div>
                <span style={{fontSize:16,color:T.textTertiary}}>›</span>
              </div>
            ))}
          </div>
        )}

        {blockers.length===0&&unblocks.length===0&&!showAdd&&(
          <div style={{fontSize:13,color:T.textTertiary,fontFamily:FONT}}>No dependencies — tap "+ Add" above to link this task to a predecessor.</div>
        )}
      </div>
    </>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App(){ return <ErrorBoundary><AppInner/></ErrorBoundary>; }
function AppInner(){
  const [dark,setDark]=useState(false);
  const T=dark?DARK:LIGHT;

  // Update Safari / PWA chrome colour to match app background
  useEffect(()=>{
    const color=dark?"#08080A":"#F0EEE9";
    let meta=document.querySelector('meta[name="theme-color"]');
    if(!meta){meta=document.createElement('meta');meta.name="theme-color";document.head.appendChild(meta);}
    meta.content=color;
  },[dark]);

  // ── Supabase shared state ─────────────────────────────────────────────────
  const LS = "fbr10_v1"; // localStorage fallback key prefix
  const lsGet = (key, fallback) => {
    try { const v=localStorage.getItem(LS+"_"+key); return v?JSON.parse(v):fallback; } catch{ return fallback; }
  };
  const lsSet = (key, val) => {
    try { localStorage.setItem(LS+"_"+key, JSON.stringify(val)); } catch{}
  };
  // Sync to Supabase (debounced 800ms to avoid hammering on drag)
  const sbSyncTimer = useRef({});
  const syncToSB = (key, val) => {
    lsSet(key, val); // always save locally too
    clearTimeout(sbSyncTimer.current[key]);
    sbSyncTimer.current[key] = setTimeout(()=>sbSet(key, val), 800);
  };

  const [tab,setTab]=useState("overview");
  const [materials,setMaterials]=useState(()=>lsGet("materials",INIT_MATERIALS));
  const [labour,setLabour]=useState(()=>lsGet("labour",INIT_LABOUR));
  const [fees,setFees]=useState(()=>lsGet("fees",FEES_INIT));
  const [matQ,setMatQ]=useState("");
  const [labQ,setLabQ]=useState("");
  const [matCollapsed,setMatCollapsed]=useState({});
  const [labCollapsed,setLabCollapsed]=useState({});
  const [selectedTaskId,setSelectedTaskId]=useState(null);
  const [calView,setCalView]=useState("graph");
  const [taskDates,setTaskDates]=useState(()=>lsGet("taskDates",DEFAULT_TASK_DATES));
  const [openPicker,setOpenPicker]=useState(null);
  const [drag,setDrag]=useState(null);
  const [hoveredHandle,setHoveredHandle]=useState(null);
  const hoverTimerRef=useRef(null);
  const [pendingSave,setPendingSave]=useState(null);
  const [taskStatuses,setTaskStatuses]=useState(()=>lsGet("taskStatuses",{
    ldc:"In Progress",pwall:"Done",steelcalc:"In Progress",
    buildover:"Pending",preplanning:"Pending",c3bplanning:"Pending",socialcare:"Pending",
    scaffold:"Pending",bcapp:"Pending",loftdemo:"Pending",loftstruct:"Pending",
    wallsreconfig:"Pending",firstfixplumb:"Pending",firstfixelec:"Pending",
    extdemo:"Pending",foundations:"Pending",draindiv:"Pending",extstruct:"Pending",studwalls:"Pending",
    secondfixelec:"Pending",secondfixplumb:"Pending",ensuites:"Pending",kitchen:"Pending",
    plasteringdec:"Pending",flooring:"Pending",firedoors:"Pending",firealarm:"Pending",
    furnishing:"Pending",snagging:"Pending",commission:"Pending",
  }));

  const INIT_CONTACTS = [
    {id:1,role:"Owner",name:"Khalil Mahmood",phone:"",email:"",notes:"Project owner · 10 Felbrigge Road, IG3"},
    {id:2,role:"Owner",name:"Khalid Mahmood",phone:"",email:"",notes:"Co-owner · Project lead"},
    {id:3,role:"Architect",name:"Tahir Bhai",phone:"+44 7723 606338",email:"",notes:"St Albans Road · LDC + planning drawings"},
    {id:4,role:"Structural Engineer",name:"TBC (Tahir's contact)",phone:"",email:"",notes:"Dormer calc packs + building control"},
    {id:5,role:"Solicitor",name:"Tatiana Fofe",phone:"0208 049 5888",email:"tfofe@paulrobinson.co.uk",notes:"Paul Robinson Solicitors LLP"},
    {id:6,role:"Solicitor",name:"Isla Neal",phone:"0208 049 5888",email:"ineal@paulrobinson.co.uk",notes:"Paul Robinson Solicitors LLP · Property Dept"},
    {id:7,role:"Plumber",name:"Akmal Plumbing (Ayman)",phone:"+44 7904 385149",email:"",notes:"Replumb + unvented cylinder (Part G)"},
    {id:8,role:"Main Builder",name:"TBC",phone:"",email:"",notes:"Full structural + internal works"},
    {id:9,role:"Electrician",name:"TBC",phone:"",email:"",notes:"Full rewire + fire detection system"},
    {id:10,role:"Planning Officer",name:"TBC",phone:"",email:"",notes:"LDC + C3(b) full planning application"},
    {id:11,role:"Building Inspector",name:"Redbridge BC / Approved Inspector",phone:"",email:"",notes:"All structural + M&E sign-offs"},
  ];
  const [contacts,setContacts]=useState(()=>lsGet("contacts",INIT_CONTACTS));
  const [editContact,setEditContact]=useState(null);

  // Persist to Supabase (shared) + localStorage (local fallback)
  useEffect(()=>syncToSB("materials",materials),[materials]);
  useEffect(()=>syncToSB("labour",labour),[labour]);
  useEffect(()=>syncToSB("fees",fees),[fees]);
  useEffect(()=>syncToSB("contacts",contacts),[contacts]);
  useEffect(()=>syncToSB("taskDates",taskDates),[taskDates]);
  useEffect(()=>syncToSB("taskStatuses",taskStatuses),[taskStatuses]);
  useEffect(()=>syncToSB("taskDeps",Object.fromEntries(GRAPH_TASKS_INIT.map(t=>[t.id,taskDeps[t.id]||[]]))),[taskDeps]);

  // Load initial state from Supabase on mount
  useEffect(()=>{
    const keys=["materials","labour","fees","contacts","taskDates","taskStatuses","taskDeps"];
    Promise.all(keys.map(k=>sbFetch(k).then(v=>[k,v]))).then(pairs=>{
      pairs.forEach(([k,v])=>{
        if(!v||!Object.keys(v).length&&!Array.isArray(v)) return;
        if(k==="materials"&&Array.isArray(v)&&v.length) setMaterials(v);
        if(k==="labour"&&Array.isArray(v)&&v.length) setLabour(v);
        if(k==="fees"&&Array.isArray(v)&&v.length) setFees(v);
        if(k==="contacts"&&Array.isArray(v)&&v.length) setContacts(v);
        if(k==="taskDates"&&v&&Object.keys(v).length) setTaskDates(v);
        if(k==="taskStatuses"&&v&&Object.keys(v).length) setTaskStatuses(p=>({...p,...v}));
        if(k==="taskDeps"&&v&&Object.keys(v).length) setTaskDeps(p=>({...p,...v}));
      });
    }).catch(()=>{});
  },[]);

  // Export all data as a JSON snapshot
  const exportData=()=>{
    const snap={materials,labour,fees,contacts,taskDates,taskStatuses,taskDeps,exportedAt:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(snap,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);
    a.download="10_felbrigge_road_"+new Date().toISOString().slice(0,10)+".json";
    a.click();URL.revokeObjectURL(a.href);
  };
  // Import from JSON snapshot
  const importData=(file)=>{
    const reader=new FileReader();
    reader.onload=(e)=>{
      try{
        const d=JSON.parse(e.target.result);
        if(d.materials)setMaterials(d.materials);
        if(d.labour)setLabour(d.labour);
        if(d.fees)setFees(d.fees);
        if(d.contacts)setContacts(d.contacts);
        if(d.taskDates)setTaskDates(d.taskDates);
        if(d.taskStatuses)setTaskStatuses(d.taskStatuses);
        if(d.taskDeps)setTaskDeps(d.taskDeps);
      }catch{ alert("Invalid backup file"); }
    };
    reader.readAsText(file);
  };

  const totalMat=useMemo(()=>materials.reduce((a,r)=>a+mT(r),0),[materials]);
  const totalLab=useMemo(()=>labour.reduce((a,r)=>a+lT(r),0),[labour]);
  const totalFees=useMemo(()=>fees.reduce((a,r)=>a+r.amount,0),[fees]);
  const buildCost=totalMat+totalLab;
  const totalDeployed=PURCHASE+buildCost+totalFees;
  const headroom=BUDGET-totalDeployed;

  const catTotals=useMemo(()=>{
    const t={};
    materials.forEach(r=>{t[r.cat]=(t[r.cat]||0)+mT(r);});
    labour.forEach(r=>{t[r.cat]=(t[r.cat]||0)+lT(r);});
    return t;
  },[materials,labour]);

  const matGroups=useMemo(()=>{const q=matQ.toLowerCase();return groupBy(materials.filter(r=>!q||r.item.toLowerCase().includes(q)||r.cat.toLowerCase().includes(q)),"cat");},[materials,matQ]);
  const labGroups=useMemo(()=>{const q=labQ.toLowerCase();return groupBy(labour.filter(r=>!q||r.item.toLowerCase().includes(q)||r.cat.toLowerCase().includes(q)),"cat");},[labour,labQ]);

  const updMat=(id,f,v)=>setMaterials(p=>p.map(r=>r.id===id?{...r,[f]:v}:r));
  const addMat=(cat)=>setMaterials(p=>[...p,{id:nxt(p),cat,item:"New Item",spec:"",qty:1,unit:"no.",unitCost:0}]);
  const delMat=(id)=>setMaterials(p=>p.filter(r=>r.id!==id));
  const updLab=(id,f,v)=>setLabour(p=>p.map(r=>r.id===id?{...r,[f]:v}:r));
  const addLab=(cat)=>setLabour(p=>[...p,{id:nxt(p),cat,item:"New Item",scope:"",qty:1,days:1,unitCost:0}]);
  const delLab=(id)=>setLabour(p=>p.filter(r=>r.id!==id));
  const updFee=(id,f,v)=>setFees(p=>p.map(r=>r.id===id?{...r,[f]:v}:r));
  const setStatus=(id,status)=>setTaskStatuses(p=>({...p,[id]:status}));

  const TABS=[{id:"overview",label:"Overview"},{id:"costs",label:"Project Costs"},{id:"materials",label:"Materials"},{id:"labour",label:"Labour"},{id:"timeline",label:"Timeline"},{id:"contacts",label:"Contacts"}];

  // ── Timeline helpers
  // Editable dependency map — initialised from GRAPH_TASKS_INIT
  const [taskDeps,setTaskDeps]=useState(()=>
    lsGet("taskDeps", Object.fromEntries(GRAPH_TASKS_INIT.map(t=>[t.id,[...t.blockedBy]])))
  );
  const setDeps=(taskId,newBlockedBy)=>setTaskDeps(p=>({...p,[taskId]:newBlockedBy}));
  useEffect(()=>lsSet("taskDeps",taskDeps),[taskDeps]);

  const TASKS=useMemo(()=>GRAPH_TASKS_INIT.map(t=>({
    ...t,
    blockedBy:taskDeps[t.id]||[],
    status:taskStatuses[t.id]??t.status,
  })),[taskStatuses,taskDeps]);
  const PHASE_ORDER=["Planning & Approvals","Loft Works","Internal First Fix","Rear Extension","Second Fix & Fit-Out","Handover"];
  const byPhase=useMemo(()=>PHASE_ORDER.reduce((acc,p)=>{acc[p]=TASKS.filter(t=>t.phase===p);return acc;},{}),[TASKS]);

  const isReady=(task)=>task.blockedBy.every(bid=>{const b=TASKS.find(t=>t.id===bid);return b&&b.status==="Done";});
  const isBlocked=(task)=>task.status==="Pending"&&task.blockedBy.some(bid=>{const b=TASKS.find(t=>t.id===bid);return b&&b.status!=="Done";});

  const statusLabel=(task)=>{if(task.status==="Done")return"Complete";if(task.status==="In Progress")return"In Progress";if(isBlocked(task))return"Blocked";if(isReady(task))return"Ready to start";return"Upcoming";};
  const statusColor=(task)=>{if(task.status==="Done")return T.green;if(task.status==="In Progress")return T.orange;if(isBlocked(task))return T.red;if(isReady(task))return T.blue;return T.textTertiary;};
  const statusBg=(task)=>{if(task.status==="Done")return T.greenLight;if(task.status==="In Progress")return T.orangeLight;if(isBlocked(task))return T.redLight;if(isReady(task))return T.blueLight;return T.cardAlt;};

  const selected=TASKS.find(t=>t.id===selectedTaskId);
  const blockers=selected?TASKS.filter(t=>selected.blockedBy.includes(t.id)):[];
  const unblocks=selected?TASKS.filter(t=>t.blockedBy.includes(selectedTaskId)):[];

  // Date cascade — week based
  const cascadeDates=(newDates,changedId,allTasks)=>{
    const result={...newDates};
    const queue=[changedId];const visited=new Set();
    while(queue.length){const cid=queue.shift();if(visited.has(cid))continue;visited.add(cid);const cDate=result[cid];if(!cDate)continue;
      allTasks.forEach(t=>{if(t.blockedBy.includes(cid)){const td=result[t.id]||{...DEFAULT_TASK_DATES[t.id]};
        if(td.startWk<cDate.endWk){const dur=td.endWk-td.startWk;
          result[t.id]={startWk:cDate.endWk,endWk:cDate.endWk+Math.max(1,dur)};queue.push(t.id);}}});
    }return result;
  };
  // Format week offset as date label e.g. "W3 · 6 Apr"
  const TOTAL_WEEKS=52;
  const PROJECT_START=new Date(2026,2,23);
  const PROJECT_START_MS=new Date(2026,2,23).getTime();
  const fmtWk=(wk)=>{
    const d=new Date(PROJECT_START_MS+wk*7*86400000);
    return `W${wk+1} · ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };

  // Calendar range picker — shows a month grid, tap start then end
  const RangePicker=({id})=>{
    const saved=taskDates[id]||DEFAULT_TASK_DATES[id];
    const isOpen=openPicker&&openPicker.id===id;

    // Local draft state lives in openPicker: {id, draft:{startWk,endWk}, picking:"start"|"end"}
    const draft=openPicker?.draft||saved;
    const picking=openPicker?.picking||"start";

    const openCal=e=>{
      e.stopPropagation();
      if(isOpen){setOpenPicker(null);return;}
      setOpenPicker({id,draft:{...saved},picking:"start"});
    };

    // Build a 40-week calendar grouped into months
    const PROJECT_START_D=new Date(2026,2,23);
    const weeks=Array.from({length:TOTAL_WEEKS},(_,w)=>{
      const d=new Date(PROJECT_START_D.getTime()+w*7*86400000);
      return{wk:w,day:d.getDate(),month:d.getMonth(),year:d.getFullYear(),label:d.getDate()+" "+MONTHS[d.getMonth()]};
    });
    const byMonth=weeks.reduce((acc,w)=>{
      const key=w.year+"-"+w.month;
      if(!acc[key])acc[key]={label:MONTHS[w.month]+" "+w.year,weeks:[]};
      acc[key].weeks.push(w);return acc;
    },{});

    const handleDayClick=(wk,e)=>{
      e.stopPropagation();
      setOpenPicker(prev=>{
        if(!prev)return prev;
        if(prev.picking==="start"){
          const endWk=Math.max(wk+1,prev.draft.endWk);
          return{...prev,draft:{startWk:wk,endWk},picking:"end"};
        }else{
          if(wk<=prev.draft.startWk)
            return{...prev,draft:{startWk:wk,endWk:prev.draft.startWk+1},picking:"start"};
          return{...prev,draft:{...prev.draft,endWk:wk},picking:"start"};
        }
      });
    };

    const confirm=e=>{
      e.stopPropagation();
      setTaskDates(prev=>cascadeDates({...prev,[id]:draft},id,TASKS));
      setOpenPicker(null);
    };

    const fmtShort=wk=>{
      const d=new Date(PROJECT_START_D.getTime()+wk*7*86400000);
      return d.getDate()+" "+MONTHS[d.getMonth()];
    };

    return(
      <div style={{position:"relative"}}>
        <button onClick={openCal}
          style={{padding:"3px 9px",borderRadius:6,border:"1px solid "+T.border,
            background:isOpen?T.blue:T.cardAlt,color:isOpen?"#fff":T.textSecond,
            fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"}}>
          {fmtShort(saved.startWk)} → {fmtShort(saved.endWk)}
        </button>
      </div>
    );
  };


  // Calendar panel rendered at root level to escape card overflow:hidden
  const CalendarPanel=(()=>{
    if(!openPicker)return null;
    const id=openPicker.id;
    const saved=taskDates[id]||DEFAULT_TASK_DATES[id];
    const draft=openPicker.draft||saved;
    const picking=openPicker.picking||"start";
    const PROJECT_START_D=new Date(2026,2,23);
    const weeks=Array.from({length:TOTAL_WEEKS},(_,w)=>{
      const d=new Date(PROJECT_START_D.getTime()+w*7*86400000);
      return{wk:w,day:d.getDate(),month:d.getMonth(),year:d.getFullYear()};
    });
    const byMonth=weeks.reduce((acc,w)=>{
      const key=w.year+"-"+w.month;
      if(!acc[key])acc[key]={label:MONTHS[w.month]+" "+w.year,weeks:[]};
      acc[key].weeks.push(w);return acc;
    },{});
    const handleDayClick=(wk,e)=>{
      e.stopPropagation();
      setOpenPicker(prev=>{
        if(!prev)return prev;
        if(prev.picking==="start"){
          const endWk=Math.max(wk+1,prev.draft.endWk);
          return{...prev,draft:{startWk:wk,endWk},picking:"end"};
        }else{
          if(wk<=prev.draft.startWk)
            return{...prev,draft:{startWk:wk,endWk:prev.draft.startWk+1},picking:"start"};
          return{...prev,draft:{...prev.draft,endWk:wk},picking:"start"};
        }
      });
    };
    const confirm=e=>{
      e.stopPropagation();
      setTaskDates(prev=>cascadeDates({...prev,[id]:draft},id,TASKS));
      setOpenPicker(null);
    };
    const fmtShort=wk=>{
      const d=new Date(PROJECT_START_D.getTime()+wk*7*86400000);
      return d.getDate()+" "+MONTHS[d.getMonth()];
    };
    return(
      <>
        {/* Full screen backdrop */}
        <div onClick={()=>setOpenPicker(null)}
          style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",WebkitBackdropFilter:"blur(4px)"}}/>
        {/* Calendar panel */}
        <div onClick={e=>e.stopPropagation()} style={{
          position:"fixed",zIndex:501,
          top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          background:T.glassStrong,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,
          border:"1px solid "+T.glassBorder,borderRadius:20,padding:"20px",
          boxShadow:"0 20px 60px rgba(0,0,0,0.35)",
          width:300,maxHeight:"80vh",overflowY:"auto"
        }}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:15,fontWeight:700,color:T.text,fontFamily:FONT}}>Select dates</div>
            <button onClick={e=>{e.stopPropagation();setOpenPicker(null);}}
              style={{background:"none",border:"none",cursor:"pointer",color:T.textTertiary,fontSize:20,lineHeight:1,padding:"0 2px"}}>×</button>
          </div>
          {/* Instruction */}
          <div style={{fontSize:12,color:T.blue,fontFamily:FONT,marginBottom:12,fontWeight:500}}>
            {picking==="start"?"① Tap a start week":"② Tap an end week"}
          </div>
          {/* Start / End display tabs */}
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {["start","end"].map(f=>(
              <div key={f} onClick={e=>{e.stopPropagation();setOpenPicker(p=>p?{...p,picking:f}:p);}}
                style={{flex:1,padding:"8px 12px",borderRadius:10,cursor:"pointer",
                  border:"1.5px solid "+(picking===f?T.blue:T.glassBorder),
                  background:picking===f?T.blueLight:T.glassSubtle,
                  backdropFilter:T.blur,WebkitBackdropFilter:T.blur}}>
                <div style={{fontSize:10,color:T.textTertiary,fontFamily:FONT,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.06em"}}>{f==="start"?"Start":"End"}</div>
                <div style={{fontSize:13,fontWeight:700,color:picking===f?T.blue:T.text,fontFamily:FONT}}>
                  {fmtShort(f==="start"?draft.startWk:draft.endWk)}
                </div>
              </div>
            ))}
          </div>
          {/* Month grids */}
          {Object.values(byMonth).map(({label,weeks:mWeeks})=>(
            <div key={label} style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:T.textSecond,fontFamily:FONT,marginBottom:8,paddingBottom:4,borderBottom:"1px solid "+T.glassBorderSubtle}}>{label}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                {mWeeks.map(w=>{
                  const isStart=w.wk===draft.startWk;
                  const isEnd=w.wk===draft.endWk;
                  const inRange=w.wk>draft.startWk&&w.wk<draft.endWk;
                  const bg=isStart||isEnd?T.blue:inRange?T.blueLight:T.glassSubtle;
                  const border=isStart||isEnd?"none":inRange?"none":"1px solid "+T.glassBorder;
                  const col=isStart||isEnd?"#fff":inRange?T.blue:T.text;
                  return(
                    <button key={w.wk} onClick={e=>handleDayClick(w.wk,e)}
                      style={{
                        padding:"8px 4px",borderRadius:8,
                        border,background:bg,
                        backdropFilter:(!isStart&&!isEnd&&!inRange)?T.blur:"none",
                        WebkitBackdropFilter:(!isStart&&!isEnd&&!inRange)?T.blur:"none",
                        color:col,fontSize:12,fontWeight:isStart||isEnd?700:500,
                        cursor:"pointer",fontFamily:FONT,textAlign:"center",
                        boxShadow:(!isStart&&!isEnd&&!inRange)?"0 1px 3px rgba(0,0,0,0.08)":"none",
                        transition:"background .12s,transform .1s",
                      }}>
                      {w.day}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Confirm */}
          <button onClick={confirm}
            style={{width:"100%",padding:"12px",borderRadius:12,border:"none",
              background:T.blue,color:"#fff",fontSize:14,fontWeight:600,
              cursor:"pointer",fontFamily:FONT,marginTop:4,
              boxShadow:"0 4px 12px rgba(0,122,255,0.35)"}}>
            Confirm
          </button>
        </div>
      </>
    );
  })();

  // ── Overview sections

  const PHASE_COLORS={"Planning & Approvals":"#007AFF","Loft Works":"#FF9500","Internal First Fix":"#5AC8FA","Rear Extension":"#FF9500","Second Fix & Fit-Out":"#5856D6","Handover":"#34C759"};
  const monthLabels=()=>{const ms=[];let last=-1;for(let w=0;w<TOTAL_WEEKS;w++){const d=new Date(PROJECT_START.getTime()+w*7*86400000);const m=d.getMonth();if(m!==last){ms.push({week:w,label:d.toLocaleDateString("en-GB",{month:"short",year:"2-digit"})});last=m;}else ms.push(null);}return ms;};
  const mLabels=monthLabels();
  const COL_W=28;const LABEL_W=130;

  const CAT_ORDER=["Preliminaries","Loft Dormer","Rear Extension","Partition Walls","Plumbing & Heating","Electrical","Bathrooms","Kitchen","Fire Doors","Plastering & Decorating","Flooring","Fit-Out"];

  return(
    <div style={{minHeight:"100vh",fontFamily:FONT,color:T.text,transition:"background .5s ease,color .3s ease",position:"relative"}}>
      {/* ── FIXED ORB BACKGROUND ── */}
      <div style={{position:"fixed",inset:0,zIndex:0,background:T.bg,transition:"background .5s ease"}}>
        <div style={{position:"absolute",inset:0,background:T.orb1}}/>
        <div style={{position:"absolute",inset:0,background:T.orb2}}/>
      </div>

      {/* ── CONTENT LAYER ── */}
      <div style={{position:"relative",zIndex:1}}>

      {/* Calendar picker rendered at root to escape card overflow:hidden */}
      {CalendarPanel}

      <style>{`
        html,body,#root{margin:0;padding:0;width:100%;}
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{height:4px;width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.25);border-radius:99px;}
        input,select,button{font-family:${FONT};}
        @keyframes borderWash{
          0%  {background-position:0% 50%;}
          50% {background-position:65% 50%;}
          100%{background-position:0% 50%;}
        }
        :root{color-scheme:${dark?"dark":"light"};}
        html{background:${dark?"#08080A":"#F0EEE9"};}
      `}</style>
      <meta name="theme-color" content={dark?"#08080A":"#F0EEE9"}/>

      {/* ── HEADER + TABS — sticky on all devices */}
      <div style={{ background:T.glassStrong,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,
        borderBottom:"1px solid "+T.glassBorder,
        position:"-webkit-sticky",
        // @ts-ignore
        position:"sticky",
        top:0, zIndex:100 }}>
        <div style={{maxWidth:1300,margin:"0 auto",padding:"0 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:52}}>
            <div>
              <span style={{fontSize:14,fontWeight:700,color:T.text,letterSpacing:"-0.3px"}}>10 Felbrigge Road</span>
              <span style={{fontSize:11,color:T.textTertiary,marginLeft:10}}>Seven Kings · IG3 · C3(b) Supported Living</span>
            </div>
            <button onClick={()=>setDark(d=>!d)} style={{ background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:"1px solid "+T.glassBorder,borderRadius:99,padding:"5px 14px",cursor:"pointer",fontSize:12,fontWeight:500,color:T.text}}>
              {dark?"☀ Light":"◑ Dark"}
            </button>
          </div>
          <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",gap:2,
            msOverflowStyle:"none"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 16px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?T.blue:T.textSecond,borderBottom:tab===t.id?"2px solid "+T.blue:"2px solid transparent",whiteSpace:"nowrap",transition:"color .15s",flexShrink:0}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BUDGET BAR — overview only */}
      {tab==="overview"&&<div style={{background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderBottom:"1px solid "+T.glassBorderSubtle,padding:"14px 20px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <span style={{fontSize:12,fontWeight:600,color:T.textSecond}}>Budget — <span style={{color:T.text}}>{fmt(BUDGET)}</span></span>
            <div style={{padding:"5px 14px",borderRadius:99,background:headroom>=0?T.greenLight:T.redLight,border:"1px solid "+(headroom>=0?T.green:T.red)+"44"}}>
              <span style={{fontSize:12,fontWeight:600,color:headroom>=0?T.green:T.red}}>{headroom>=0?"▲ ":"▼ "}{fmt(Math.abs(headroom))} {headroom>=0?"headroom":"over budget"}</span>
            </div>
          </div>
          <BudgetBar purchase={PURCHASE} build={buildCost} fees={totalFees} budget={BUDGET} T={T}/>
      </div>}

      {/* ── CONTENT */}
      <div style={{maxWidth:1300,margin:"0 auto",padding:"28px 20px 80px"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div>
            {/* Two project cost cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12,marginBottom:28}}>
              {[
                {label:"Loft Dormer",cats:["Loft Dormer"],desc:"Hip-to-gable conversion · dormer · VELUX · insulation · loft staircase",
                  bg:dark?"rgba(180,90,0,0.30)":"rgba(255,149,0,0.10)",border:"rgba(255,149,0,0.35)",text:dark?"#FF9F0A":"#B36200"},
                {label:"Rear Extension",cats:["Rear Extension"],desc:"Groundworks · blockwork · flat roof · bi-fold doors · glazing",
                  bg:dark?"rgba(20,100,160,0.30)":"rgba(90,200,250,0.10)",border:"rgba(90,200,250,0.35)",text:dark?"#64D2FF":"#0077A8"},
              ].map(card=>{
                const matCost=materials.filter(r=>card.cats.includes(r.cat)).reduce((a,r)=>a+mT(r),0);
                const labCost=labour.filter(r=>card.cats.includes(r.cat)).reduce((a,r)=>a+lT(r),0);
                return(
                  <div key={card.label} style={{
                    background:card.bg,
                    border:"1px solid "+card.border,
                    borderRadius:16,padding:"20px 22px",
                  }}>
                    <div style={{fontSize:11,fontWeight:600,color:card.text,marginBottom:6,fontFamily:FONT,textTransform:"uppercase",letterSpacing:"0.06em",opacity:0.8}}>{card.label}</div>
                    <div style={{fontSize:30,fontWeight:700,color:T.text,letterSpacing:"-1px",lineHeight:1,marginBottom:8,fontFamily:FONT}}>{fmt(matCost+labCost)}</div>
                    <div style={{fontSize:12,color:T.textTertiary,lineHeight:1.5,marginBottom:12,fontFamily:FONT}}>{card.desc}</div>
                    <div style={{borderTop:"1px solid "+card.border,paddingTop:10,display:"flex",gap:20}}>
                      <div>
                        <div style={{fontSize:10,color:T.textTertiary,fontFamily:FONT,marginBottom:2}}>Materials</div>
                        <div style={{fontSize:13,fontWeight:600,color:T.textSecond,fontFamily:FONT}}>{fmt(matCost)}</div>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:T.textTertiary,fontFamily:FONT,marginBottom:2}}>Labour</div>
                        <div style={{fontSize:13,fontWeight:600,color:T.textSecond,fontFamily:FONT}}>{fmt(labCost)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Separator */}
            <div style={{borderTop:"1px solid "+T.glassBorderSubtle,marginBottom:20}}/>

            {/* Top 5 upcoming tasks */}
            <div style={{fontSize:11,fontWeight:600,color:T.textTertiary,marginBottom:12,fontFamily:FONT,textTransform:"uppercase",letterSpacing:"0.06em"}}>Next up</div>
            {(()=>{
              const upcoming=TASKS
                .filter(t=>t.status!=="Done")
                .sort((a,b)=>{
                  const da=taskDates[a.id]||DEFAULT_TASK_DATES[a.id];
                  const db=taskDates[b.id]||DEFAULT_TASK_DATES[b.id];
                  return da.startWk-db.startWk;
                })
                .slice(0,5);
              return upcoming.map(task=>{
                const ready=task.status==="Pending"&&isReady(task);
                const blocked=isBlocked(task);
                const dot=task.status==="In Progress"?T.orange:ready?T.blue:blocked?T.red:T.textTertiary;
                const td=taskDates[task.id]||DEFAULT_TASK_DATES[task.id];
                return(
                  <div key={task.id}
                    onClick={()=>setTab("timeline")}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",
                      marginBottom:6,borderRadius:12,cursor:"pointer",
                      background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,
                      border:"1px solid "+T.glassBorder}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:dot,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:FONT,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{task.label}</div>
                      <div style={{fontSize:11,color:T.textTertiary,fontFamily:FONT,marginTop:1}}>{task.phase} · {task.who}</div>
                    </div>
                    <div style={{fontSize:11,color:T.textTertiary,fontFamily:FONT,flexShrink:0}}>{fmtWk(td.startWk)}</div>
                    <span style={{color:T.textTertiary,fontSize:13,flexShrink:0}}>›</span>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* PROJECT COSTS */}
        {tab==="costs"&&(
          <div>
            <p style={{fontSize:12,color:T.textTertiary,marginBottom:16}}>Read-only · Aggregated from Materials and Labour tabs</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:24}}>
              <StatCard label="Total Materials" value={fmt(totalMat)} accent={T.blue} T={T}/>
              <StatCard label="Total Labour" value={fmt(totalLab)} accent={T.orange} T={T}/>
              <StatCard label="Professional Fees" value={fmt(totalFees)} accent={T.teal} T={T}/>
              <StatCard label="Total Build Cost" value={fmt(buildCost)} accent={T.indigo} T={T}/>
            </div>
            <div style={{ background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:"1px solid "+T.glassBorder,borderRadius:14,overflow:"hidden",marginBottom:20}}>
              <div style={{padding:"13px 18px",borderBottom:"1px solid "+T.glassBorderSubtle,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur}}><span style={{fontSize:13,fontWeight:600,color:T.text}}>Cost by Category</span></div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur}}>{["Category","Materials","Labour","Combined","% of Build"].map(h=><th key={h} style={{padding:"8px 16px",textAlign:h==="Category"?"left":"right",fontSize:11,fontWeight:600,color:T.textSecond,borderBottom:"1px solid "+T.border}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {CAT_ORDER.filter(cat=>catTotals[cat]!==undefined).map((cat,i)=>{
                      const mC=materials.filter(r=>r.cat===cat).reduce((a,r)=>a+mT(r),0);
                      const lC=labour.filter(r=>r.cat===cat).reduce((a,r)=>a+lT(r),0);
                      const comb=mC+lC;const pct=buildCost===0?0:(comb/buildCost*100).toFixed(1);
                      return(<tr key={cat} style={{background:i%2===0?"transparent":T.glassSubtle,borderBottom:"1px solid "+T.separator}}>
                        <td style={{padding:"9px 16px",fontWeight:500,color:T.text}}>{cat}</td>
                        <td style={{padding:"9px 16px",textAlign:"right",color:T.blue,fontWeight:500}}>{fmt(mC)}</td>
                        <td style={{padding:"9px 16px",textAlign:"right",color:T.orange,fontWeight:500}}>{fmt(lC)}</td>
                        <td style={{padding:"9px 16px",textAlign:"right",fontWeight:700,color:T.text}}>{fmt(comb)}</td>
                        <td style={{padding:"9px 16px",textAlign:"right",color:T.textSecond}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}>
                            <div style={{width:60,height:4,background:T.glassBorderSubtle,borderRadius:99,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:T.blue,borderRadius:99}}/></div>
                            <span style={{fontSize:11,minWidth:32,textAlign:"right"}}>{pct}%</span>
                          </div>
                        </td>
                      </tr>);
                    })}
                    <tr style={{background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderTop:"2px solid "+T.glassBorderSubtle}}>
                      <td style={{padding:"10px 16px",fontWeight:700,color:T.text}}>Total Build Cost</td>
                      <td style={{padding:"10px 16px",textAlign:"right",fontWeight:700,color:T.blue}}>{fmt(totalMat)}</td>
                      <td style={{padding:"10px 16px",textAlign:"right",fontWeight:700,color:T.orange}}>{fmt(totalLab)}</td>
                      <td style={{padding:"10px 16px",textAlign:"right",fontWeight:700,fontSize:15,color:T.text}}>{fmt(buildCost)}</td>
                      <td/>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Fees */}
            <div style={{ background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:"1px solid "+T.glassBorder,borderRadius:14,overflow:"hidden",maxWidth:520}}>
              <div style={{padding:"13px 18px",borderBottom:"1px solid "+T.glassBorderSubtle,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:600,color:T.text}}>Professional Fees</span>
                <button onClick={()=>setFees(p=>[...p,{id:nxt(p),item:"New Fee",amount:0}])} style={{fontSize:11,padding:"4px 12px",borderRadius:7,border:"none",background:T.blue,color:"#fff",cursor:"pointer",fontWeight:600}}>+ Add</button>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur}}>{["Fee Item","Amount"].map(h=><th key={h} style={{padding:"7px 16px",textAlign:h==="Amount"?"right":"left",fontSize:11,fontWeight:600,color:T.textSecond,borderBottom:"1px solid "+T.border}}>{h}</th>)}<th style={{width:28,borderBottom:"1px solid "+T.border}}/></tr></thead>
                <tbody>
                  {fees.map((r,i)=>(
                    <tr key={r.id} style={{background:i%2===0?"transparent":T.glassSubtle,borderBottom:"1px solid "+T.separator}}>
                      <td style={{padding:"8px 16px"}}><EC value={r.item} onChange={v=>updFee(r.id,"item",v)} T={T}/></td>
                      <td style={{padding:"8px 16px"}}><EC value={r.amount} onChange={v=>updFee(r.id,"amount",v)} type="number" align="right" T={T} currency/></td>
                      <td style={{padding:"6px 8px",textAlign:"center"}}><button onClick={()=>setFees(p=>p.filter(x=>x.id!==r.id))} style={{background:"none",border:"none",cursor:"pointer",color:T.textTertiary,fontSize:15}}>×</button></td>
                    </tr>
                  ))}
                  <tr style={{background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderTop:"1px solid "+T.glassBorderSubtle}}>
                    <td style={{padding:"9px 16px",fontWeight:700,color:T.text}}>Total</td>
                    <td style={{padding:"9px 16px",fontWeight:700,color:T.teal,textAlign:"right"}}>{fmt(totalFees)}</td>
                    <td/>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MATERIALS */}
        {tab==="materials"&&(()=>{
          const allCats=Object.keys(matGroups);
          const allC=allCats.every(c=>matCollapsed[c]);
          const toggleAll=()=>{if(allC){setMatCollapsed({});}else{const n={};allCats.forEach(c=>{n[c]=true;});setMatCollapsed(n);}};
          return(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div style={{
                  background:dark?"rgba(0,84,180,0.30)":"rgba(0,122,255,0.08)",
                  border:"1px solid rgba(0,122,255,0.30)",
                  borderRadius:12,padding:"12px 18px",display:"inline-block"
                }}>
                  <div style={{fontSize:11,fontWeight:500,color:T.textSecond,marginBottom:4}}>Total Materials</div>
                  <div style={{fontSize:22,fontWeight:700,color:T.blue,letterSpacing:"-0.5px"}}>{fmt(totalMat)}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <input value={matQ} onChange={e=>setMatQ(e.target.value)} placeholder="Search materials…" style={{padding:"9px 14px",borderRadius:10,border:"1px solid "+T.glassBorder,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,color:T.text,fontSize:13,outline:"none",width:220}}/>
                  <button onClick={toggleAll} style={{padding:"9px 14px",borderRadius:10,border:"1px solid "+T.glassBorder,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,color:T.textSecond,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{allC?"Expand All":"Collapse All"}</button>
                </div>
              </div>
              {Object.entries(matGroups).map(([cat,rows])=>(
                <DetailTable key={cat} section={cat} rows={rows} collapsed={!!matCollapsed[cat]} onToggle={()=>setMatCollapsed(p=>({...p,[cat]:!p[cat]}))}
                  cols={[{key:"item",label:"Item",wrap:true,primary:true},{key:"qty",label:"Qty",type:"number",align:"right",dim:true},{key:"unit",label:"Unit",dim:true},{key:"unitCost",label:"Unit Cost",type:"number",align:"right",currency:true,dim:true},{key:"total",label:"Total",readOnly:true,align:"right",sum:true,computed:true,compute:mT,bold:true},{key:"spec",label:"Spec / Model",wrap:true,last:true}]}
                  onUpdate={updMat} onAdd={addMat} onDelete={delMat} T={T}/>
              ))}
            </div>
          );
        })()}

        {/* LABOUR */}
        {tab==="labour"&&(()=>{
          const allCats=Object.keys(labGroups);
          const allC=allCats.every(c=>labCollapsed[c]);
          const toggleAll=()=>{if(allC){setLabCollapsed({});}else{const n={};allCats.forEach(c=>{n[c]=true;});setLabCollapsed(n);}};
          return(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
                <div style={{
                  background:dark?"rgba(180,90,0,0.30)":"rgba(255,149,0,0.08)",
                  border:"1px solid rgba(255,149,0,0.30)",
                  borderRadius:12,padding:"12px 18px",display:"inline-block"
                }}>
                  <div style={{fontSize:11,fontWeight:500,color:T.textSecond,marginBottom:4}}>Total Labour</div>
                  <div style={{fontSize:22,fontWeight:700,color:T.orange,letterSpacing:"-0.5px"}}>{fmt(totalLab)}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <input value={labQ} onChange={e=>setLabQ(e.target.value)} placeholder="Search labour items…" style={{padding:"9px 14px",borderRadius:10,border:"1px solid "+T.glassBorder,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,color:T.text,fontSize:13,outline:"none",width:220}}/>
                  <button onClick={toggleAll} style={{padding:"9px 14px",borderRadius:10,border:"1px solid "+T.glassBorder,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,color:T.textSecond,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{allC?"Expand All":"Collapse All"}</button>
                </div>
              </div>
              {Object.entries(labGroups).map(([cat,rows])=>(
                <DetailTable key={cat} section={cat} rows={rows} collapsed={!!labCollapsed[cat]} onToggle={()=>setLabCollapsed(p=>({...p,[cat]:!p[cat]}))}
                  cols={[{key:"item",label:"Item",wrap:true,primary:true},{key:"qty",label:"Qty",type:"number",align:"right",dim:true},{key:"days",label:"Days",align:"right",dim:true},{key:"unitCost",label:"Unit Cost",type:"number",align:"right",currency:true,dim:true},{key:"total",label:"Total",readOnly:true,align:"right",sum:true,computed:true,compute:lT,bold:true},{key:"scope",label:"Scope",wrap:true,last:true}]}
                  onUpdate={updLab} onAdd={addLab} onDelete={delLab} T={T}/>
              ))}
            </div>
          );
        })()}

        {/* TIMELINE */}
        {tab==="timeline"&&(()=>{
          const [selId,setSelId]=[selectedTaskId,setSelectedTaskId];
          const sel=selected;const blk=blockers;const unblk=unblocks;

          const TaskCard=({task,highlighted})=>{
            const ready=task.status==="Pending"&&isReady(task);
            const blocked=isBlocked(task);
            const isSelected=selId===task.id;

            const rgb = task.status==="Done"       ? (dark?"30,209,88":"52,199,89")
              : task.status==="In Progress"         ? (dark?"255,159,10":"255,149,0")
              : ready                               ? (dark?"10,132,255":"0,122,255")
              : blocked                             ? (dark?"255,69,58":"255,59,48")
              : (dark?"100,100,110":"180,180,188");

            // Outer = 1px gradient border: vivid → transparent across width, animated
            const borderGrad = isSelected
              ? `rgba(0,122,255,0.9) 0%, rgba(0,122,255,0.18) 60%, transparent 100%`
              : `rgba(${rgb},0.75) 0%, rgba(${rgb},0.18) 55%, transparent 100%`;

            // Inner fill: very faint tint, consistent
            const innerBg = isSelected
              ? (dark?"rgba(10,132,255,0.09)":"rgba(0,122,255,0.05)")
              : highlighted
              ? (dark?"rgba(48,209,88,0.07)":"rgba(52,199,89,0.04)")
              : (dark?`rgba(${rgb},0.07)`:`rgba(${rgb},0.04)`);

            return(
              <div onClick={()=>setSelId(selId===task.id?null:task.id)}
                style={{
                  background:`linear-gradient(90deg, ${borderGrad})`,
                  backgroundSize:"200% 100%",
                  animation:"borderWash 7s ease-in-out infinite",
                  borderRadius:13, padding:1,
                  cursor:"pointer", marginBottom:8,
                }}>
                <div style={{
                  background:T.glass,
                  backdropFilter:T.blur,
                  WebkitBackdropFilter:T.blur,
                  borderRadius:12, padding:"14px 16px",
                  position:"relative", overflow:"hidden",
                }}>
                  {/* Inner tint wash */}
                  <div style={{
                    position:"absolute", inset:0, borderRadius:12, pointerEvents:"none",
                    background:`linear-gradient(90deg, ${innerBg} 0%, transparent 100%)`,
                  }}/>
                  <div style={{position:"relative",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                        <span style={{fontSize:14,fontWeight:600,color:T.text,fontFamily:FONT,lineHeight:1.3}}>{task.label}</span>
                        {blocked&&(()=>{
                          const fb=TASKS.find(t=>task.blockedBy.includes(t.id)&&t.status!=="Done");
                          const sn=fb?fb.label.split(" ").slice(0,3).join(" "):"";
                          const ex=task.blockedBy.filter(bid=>{const b=TASKS.find(t=>t.id===bid);return b&&b.status!=="Done";}).length;
                          return(<span onClick={e=>e.stopPropagation()} style={{fontSize:10,color:T.red,fontWeight:600,padding:"2px 9px",borderRadius:99,fontFamily:FONT,whiteSpace:"nowrap",background:`rgba(${rgb},0.10)`}}>
                            {sn}{ex>1?` +${ex-1}`:""}
                          </span>);
                        })()}
                      </div>
                      <div style={{fontSize:12,color:T.textTertiary,lineHeight:1.5,marginBottom:6}}>{task.sub}</div>
                      <div style={{fontSize:11,color:T.textSecond}}>{task.who}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                      <RangePicker id={task.id}/>
                      {task.blockedBy.length>0&&<div style={{fontSize:9,color:T.textTertiary}}>↳ {task.blockedBy.length} blocker{task.blockedBy.length>1?"s":""}</div>}
                    </div>
                  </div>
                </div>
              </div>
            );
          };

          return(
            <div>
              {/* Sub-tabs + reset */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:24,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:0,background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderRadius:10,padding:3}}>
                  {[["graph","Dependencies"],["calendar","Calendar"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setCalView(v)} style={{padding:"7px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:FONT,background:calView===v?T.surface:"transparent",color:calView===v?T.text:T.textSecond,boxShadow:calView===v?"0 1px 3px rgba(0,0,0,0.12)":"none",transition:"all .15s"}}>
                      {l}
                    </button>
                  ))}
                </div>
                <button onClick={()=>{setTaskDates(DEFAULT_TASK_DATES);setOpenPicker(null);}} style={{padding:"7px 14px",borderRadius:8,border:"1px solid "+T.border,background:"none",color:T.textTertiary,fontSize:11,fontWeight:500,cursor:"pointer",marginLeft:"auto"}}>↺ Reset dates</button>
              </div>

              {/* DEPENDENCY VIEW */}
              {calView==="graph"&&(
                <div>
                  <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
                    {[{label:"Complete",color:T.green},{label:"In Progress",color:T.orange},{label:"Ready to start",color:T.blue},{label:"Blocked",color:T.red},{label:"Upcoming",color:T.textTertiary}].map(l=>(
                      <div key={l.label} style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:9,height:9,borderRadius:"50%",background:l.color}}/>
                        <span style={{fontSize:11,color:T.textSecond}}>{l.label}</span>
                      </div>
                    ))}
                    <span style={{fontSize:11,color:T.textTertiary,marginLeft:"auto"}}>Tap any task for details</span>
                  </div>
                  {PHASE_ORDER.map(phase=>(
                    <div key={phase} style={{marginBottom:16}}>
                      <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:T.textTertiary,marginBottom:8,paddingLeft:2}}>{phase}</div>
                      {byPhase[phase].map(task=>(
                        <TaskCard key={task.id} task={task} highlighted={!!sel&&(sel.blockedBy.includes(task.id)||task.blockedBy.includes(selId))}/>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* CALENDAR VIEW */}
              {calView==="calendar"&&(()=>{
                // Drag state for gantt handles — declared at AppInner level to satisfy Rules of Hooks

                const handleMouseDown=(e,taskId,handle)=>{
                  e.preventDefault();e.stopPropagation();
                  const td=taskDates[taskId]||DEFAULT_TASK_DATES[taskId];
                  setDrag({taskId,handle,startX:e.clientX,origStart:td.startWk,origEnd:td.endWk});
                };
                const handleTouchStart=(e,taskId,handle)=>{
                  e.stopPropagation();
                  const td=taskDates[taskId]||DEFAULT_TASK_DATES[taskId];
                  const touch=e.touches[0];
                  setDrag({taskId,handle,startX:touch.clientX,origStart:td.startWk,origEnd:td.endWk,touch:true});
                };

                const applyDrag=(clientX)=>{
                  if(!drag)return;
                  const dx=clientX-drag.startX;
                  const wkDelta=Math.round(dx/COL_W);
                  if(wkDelta===0)return;
                  let newStart=drag.origStart,newEnd=drag.origEnd;
                  if(drag.handle==="start"){
                    newStart=Math.max(0,Math.min(drag.origEnd-1,drag.origStart+wkDelta));
                  }else{
                    newEnd=Math.max(drag.origStart+1,Math.min(TOTAL_WEEKS-1,drag.origEnd+wkDelta));
                  }
                  setTaskDates(prev=>({...prev,[drag.taskId]:{startWk:newStart,endWk:newEnd}}));
                };

                const commitDrag=(clientX)=>{
                  if(!drag)return;
                  const dx=clientX-drag.startX;
                  const wkDelta=Math.round(dx/COL_W);
                  setDrag(null);
                  if(wkDelta===0)return;
                  let newStart=drag.origStart,newEnd=drag.origEnd;
                  if(drag.handle==="start"){
                    newStart=Math.max(0,Math.min(drag.origEnd-1,drag.origStart+wkDelta));
                  }else{
                    newEnd=Math.max(drag.origStart+1,Math.min(TOTAL_WEEKS-1,drag.origEnd+wkDelta));
                  }
                  // Count how many tasks would cascade
                  const preview=cascadeDates({...taskDates,[drag.taskId]:{startWk:newStart,endWk:newEnd}},drag.taskId,TASKS);
                  const affected=Object.keys(preview).filter(id=>id!==drag.taskId&&(preview[id].startWk!==(taskDates[id]||DEFAULT_TASK_DATES[id]).startWk||preview[id].endWk!==(taskDates[id]||DEFAULT_TASK_DATES[id]).endWk));
                  if(affected.length>0){
                    setPendingSave({taskId:drag.taskId,newDates:preview,affectedCount:affected.length,affected});
                  }else{
                    setTaskDates(preview);
                  }
                };

                return(
                <div
                  onMouseMove={e=>{if(drag)applyDrag(e.clientX);}}
                  onMouseUp={e=>{if(drag)commitDrag(e.clientX);}}
                  onMouseLeave={e=>{if(drag)commitDrag(e.clientX);}}
                  onTouchMove={e=>{if(drag)applyDrag(e.touches[0].clientX);}}
                  onTouchEnd={e=>{if(drag)commitDrag(drag.lastX||drag.startX);}}>
                  {/* Legend */}
                  <div style={{display:"flex",gap:14,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                    {[{label:"Complete",color:T.green},{label:"In Progress",color:T.orange},{label:"Ready",color:T.blue},{label:"Blocked",color:T.red},{label:"Upcoming",color:T.textTertiary+"88"}].map(l=>(
                      <div key={l.label} style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:20,height:8,borderRadius:99,background:l.color}}/>
                        <span style={{fontSize:11,color:T.textSecond}}>{l.label}</span>
                      </div>
                    ))}
                    <span style={{fontSize:11,color:T.textTertiary}}>Drag handles to resize</span>
                  </div>

                  {/* Cascade confirm dialog */}
                  {pendingSave&&(
                    <>
                      <div onClick={()=>{setTaskDates(prev=>({...prev,[pendingSave.taskId]:{startWk:(taskDates[pendingSave.taskId]||DEFAULT_TASK_DATES[pendingSave.taskId]).startWk,endWk:(taskDates[pendingSave.taskId]||DEFAULT_TASK_DATES[pendingSave.taskId]).endWk}}));setPendingSave(null);}} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)"}}/>
                      <div style={{position:"fixed",zIndex:501,top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.glassStrong,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:"1px solid "+T.glassBorder,borderRadius:20,padding:"24px",width:300,boxShadow:"0 20px 60px rgba(0,0,0,0.35)"}}>
                        <div style={{fontSize:16,fontWeight:700,color:T.text,fontFamily:FONT,marginBottom:8}}>Cascade warning</div>
                        <div style={{fontSize:13,color:T.textSecond,fontFamily:FONT,lineHeight:1.5,marginBottom:16}}>
                          This change will push <strong style={{color:T.text}}>{pendingSave.affectedCount} task{pendingSave.affectedCount>1?"s":""}</strong> later:
                        </div>
                        <div style={{marginBottom:18,maxHeight:120,overflowY:"auto"}}>
                          {pendingSave.affected.map(id=>{
                            const t=TASKS.find(x=>x.id===id);
                            return t?(<div key={id} style={{fontSize:12,color:T.textTertiary,fontFamily:FONT,padding:"3px 0",borderBottom:"1px solid "+T.separator}}>{t.label}</div>):null;
                          })}
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>{setTaskDates(pendingSave.newDates);setPendingSave(null);}}
                            style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:T.blue,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>
                            Save & cascade
                          </button>
                          <button onClick={()=>{
                            // Revert to original
                            const orig=taskDates[pendingSave.taskId]||DEFAULT_TASK_DATES[pendingSave.taskId];
                            setTaskDates(prev=>({...prev,[pendingSave.taskId]:orig}));
                            setPendingSave(null);
                          }} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid "+T.glassBorder,background:T.glassSubtle,color:T.text,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",position:"relative"}}>
                    <div style={{minWidth:LABEL_W+COL_W*TOTAL_WEEKS}}>
                      {/* Sticky header wrapper */}
                      <div style={{position:"sticky",top:0,zIndex:10}}>
                        {/* Month header */}
                        <div style={{display:"flex",background:T.glassStrong,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderBottom:"1px solid "+T.glassBorderSubtle,height:22}}>
                          <div style={{width:LABEL_W,flexShrink:0,borderRight:"1px solid "+T.border,background:T.glassStrong}}/>
                          {mLabels.map((m,w)=>(
                            <div key={w} style={{width:COL_W,flexShrink:0,position:"relative",height:22,borderLeft:m?"1px solid "+T.glassBorder:"none"}}>
                              {m&&<span style={{position:"absolute",left:4,top:"50%",transform:"translateY(-50%)",fontSize:10,fontWeight:700,color:T.text,fontFamily:FONT,whiteSpace:"nowrap",pointerEvents:"none"}}>{m.label}</span>}
                            </div>
                          ))}
                        </div>
                        {/* Week row */}
                        <div style={{display:"flex",background:T.glassStrong,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderBottom:"1px solid "+T.glassBorderSubtle,height:18}}>
                          <div style={{width:LABEL_W,flexShrink:0,fontSize:9,fontWeight:600,color:T.textTertiary,padding:"0 8px",lineHeight:"18px",borderRight:"1px solid "+T.border}}>Task</div>
                          {Array.from({length:TOTAL_WEEKS}).map((_,w)=>(
                            <div key={w} style={{width:COL_W,flexShrink:0,fontSize:8,color:T.textTertiary,textAlign:"center",lineHeight:"18px",borderLeft:"1px solid "+T.border+"44"}}>
                              {w%4===0?`W${w+1}`:""}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Phase + task rows */}
                      {PHASE_ORDER.map(phase=>(
                        <div key={phase}>
                          <div style={{display:"flex",background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,borderTop:"1px solid "+T.glassBorderSubtle}}>
                            <div style={{width:LABEL_W,flexShrink:0,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:PHASE_COLORS[phase],padding:"4px 8px",borderRight:"2px solid "+PHASE_COLORS[phase]+"44"}}>{phase}</div>
                            {Array.from({length:TOTAL_WEEKS}).map((_,w)=><div key={w} style={{width:COL_W,flexShrink:0,borderLeft:"1px solid "+T.border+"22"}}/>)}
                          </div>
                          {byPhase[phase].map((task,ti)=>{
                            const blocked=isBlocked(task);
                            const barColor=statusColor(task);
                            const ready=task.status==="Pending"&&isReady(task);
                            const barOpacity=task.status==="Pending"&&!ready&&!blocked?0.5:1;
                            const td=taskDates[task.id]||DEFAULT_TASK_DATES[task.id];
                            const wkS=td.startWk;const wkE=td.endWk;
                            const isSelected=selId===task.id;
                            const showHandles=hoveredHandle&&hoveredHandle.taskId===task.id&&hoveredHandle.visible;
                            return(
                              <div key={task.id}
                                onMouseEnter={()=>{
                                  clearTimeout(hoverTimerRef.current);
                                  setHoveredHandle({taskId:task.id,visible:false});
                                  hoverTimerRef.current=setTimeout(()=>setHoveredHandle(h=>h&&h.taskId===task.id?{...h,visible:true}:h),1000);
                                }}
                                onMouseLeave={()=>{
                                  clearTimeout(hoverTimerRef.current);
                                  setHoveredHandle(null);
                                }}
                                onClick={()=>setSelId(selId===task.id?null:task.id)}
                                style={{display:"flex",alignItems:"center",background:isSelected?(dark?"#1C2A3A":"#EBF4FF"):ti%2===0?T.card:T.cardAlt+"66",cursor:"pointer",borderBottom:"1px solid "+T.separator,minHeight:32,position:"relative"}}>
                                <div style={{width:LABEL_W,flexShrink:0,fontSize:11,fontWeight:500,color:blocked?T.red:T.text,padding:"4px 8px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",borderRight:"1px solid "+T.border}}>
                                  {task.label}
                                </div>
                                {Array.from({length:TOTAL_WEEKS}).map((_,w)=>{
                                  const inR=w>=wkS&&w<=wkE;
                                  const isF=w===wkS;const isL=w===wkE;
                                  return(
                                    <div key={w} style={{width:COL_W,flexShrink:0,height:32,display:"flex",alignItems:"center",borderLeft:"1px solid "+T.border+"22",padding:inR?"2px 1px":"2px 0",background:inR&&blocked?T.redLight+"66":"transparent",position:"relative",overflow:"visible"}}>
                                      {inR&&(
                                        <div style={{width:"100%",height:12,opacity:barOpacity,background:barColor,borderRadius:isF&&isL?99:isF?"99px 0 0 99px":isL?"0 99px 99px 0":0,position:"relative",overflow:"visible"}}>
                                          {/* Left handle — always rendered, fades in after 1s hover */}
                                          {isF&&(
                                            <div
                                              onMouseDown={e=>handleMouseDown(e,task.id,"start")}
                                              onTouchStart={e=>handleTouchStart(e,task.id,"start")}
                                              onClick={e=>e.stopPropagation()}
                                              style={{
                                                position:"absolute",left:-8,top:"50%",
                                                transform:`translateY(-50%) scale(${showHandles?1:0.6})`,
                                                opacity:showHandles?1:0,
                                                transition:"opacity 0.4s ease, transform 0.4s ease",
                                                width:16,height:28,borderRadius:8,
                                                background:"rgba(255,255,255,0.92)",
                                                backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
                                                border:"1px solid rgba(0,0,0,0.10)",
                                                cursor:"ew-resize",zIndex:6,
                                                boxShadow:"0 2px 8px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.06)",
                                                display:"flex",alignItems:"center",justifyContent:"center",gap:2,
                                                pointerEvents:showHandles?"auto":"none",
                                              }}>
                                              <div style={{width:1.5,height:10,borderRadius:2,background:"rgba(0,0,0,0.28)"}}/>
                                              <div style={{width:1.5,height:10,borderRadius:2,background:"rgba(0,0,0,0.28)"}}/>
                                            </div>
                                          )}
                                          {/* Right handle */}
                                          {isL&&(
                                            <div
                                              onMouseDown={e=>handleMouseDown(e,task.id,"end")}
                                              onTouchStart={e=>handleTouchStart(e,task.id,"end")}
                                              onClick={e=>e.stopPropagation()}
                                              style={{
                                                position:"absolute",right:-8,top:"50%",
                                                transform:`translateY(-50%) scale(${showHandles?1:0.6})`,
                                                opacity:showHandles?1:0,
                                                transition:"opacity 0.4s ease, transform 0.4s ease",
                                                width:16,height:28,borderRadius:8,
                                                background:"rgba(255,255,255,0.92)",
                                                backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",
                                                border:"1px solid rgba(0,0,0,0.10)",
                                                cursor:"ew-resize",zIndex:6,
                                                boxShadow:"0 2px 8px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.06)",
                                                display:"flex",alignItems:"center",justifyContent:"center",gap:2,
                                                pointerEvents:showHandles?"auto":"none",
                                              }}>
                                              <div style={{width:1.5,height:10,borderRadius:2,background:"rgba(0,0,0,0.28)"}}/>
                                              <div style={{width:1.5,height:10,borderRadius:2,background:"rgba(0,0,0,0.28)"}}/>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                );
              })()}

              {/* BOTTOM SHEET — shared by both views */}
              {sel&&(
                <DepSheet
                  task={sel} blockers={blk} unblocks={unblk}
                  onClose={()=>setSelId(null)}
                  onNavigate={id=>setSelId(id)}
                  statusLabel={statusLabel} statusColor={statusColor} statusBg={statusBg}
                  setStatus={setStatus} setDeps={setDeps} TASKS={TASKS} isBlocked={isBlocked} T={T}
                />
              )}
            </div>
          );
        })()}

        {/* CONTACTS */}
        {tab==="contacts"&&(
          <div>
            {/* Add button */}
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <button onClick={()=>{
                const newC={id:Date.now(),role:"",name:"New Contact",phone:"",email:"",notes:""};
                setContacts(p=>[...p,newC]);
                setEditContact(newC.id);
              }} style={{padding:"8px 18px",borderRadius:10,border:"1px solid "+T.glassBorder,
                background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,
                color:T.blue,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>
                + Add Contact
              </button>
            </div>
            {/* Compact list — 2 col on desktop, 1 on mobile */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:8}}>
              {contacts.map((c)=>{
                const initials=c.name.split(" ").map(w=>w[0]||"").join("").slice(0,2).toUpperCase()||"?";
                return(
                  <div key={c.id}
                    style={{borderRadius:14,background:T.glass,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,border:"1px solid "+T.glassBorder,overflow:"hidden"}}>
                    {/* Top half — tap to edit */}
                    <div onClick={()=>setEditContact(c.id)}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer"}}>
                      <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
                        background:T.glassSubtle,backdropFilter:T.blur,WebkitBackdropFilter:T.blur,
                        border:"1px solid "+T.glassBorder,
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontSize:12,fontWeight:700,color:T.blue,fontFamily:FONT}}>{initials}</span>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        {c.role&&<div style={{fontSize:11,fontWeight:600,color:T.blue,fontFamily:FONT,marginBottom:2}}>{c.role}</div>}
                        <div style={{fontSize:14,fontWeight:700,color:T.text,fontFamily:FONT,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:"-0.2px"}}>{c.name}</div>
                      </div>
                      <span style={{color:T.textTertiary,fontSize:14,flexShrink:0}}>›</span>
                    </div>
                    {/* Bottom half — tappable contact links, not tied to edit */}
                    {(c.phone||c.email||c.notes)&&(
                      <div style={{borderTop:"1px solid "+T.separator,padding:"10px 16px 14px",display:"flex",flexDirection:"column",gap:6}}>
                        {c.phone&&(
                          <a href={"tel:"+c.phone.replace(/\s/g,"")} style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
                            <span style={{fontSize:11,color:T.textTertiary,minWidth:40,fontFamily:FONT}}>Phone</span>
                            <span style={{fontSize:13,fontWeight:500,color:T.green,fontFamily:FONT}}>{c.phone}</span>
                          </a>
                        )}
                        {c.email&&(
                          <a href={"mailto:"+c.email} style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
                            <span style={{fontSize:11,color:T.textTertiary,minWidth:40,fontFamily:FONT}}>Email</span>
                            <span style={{fontSize:12,fontWeight:500,color:T.blue,fontFamily:FONT}}>{c.email}</span>
                          </a>
                        )}
                        {c.notes&&<div style={{fontSize:12,color:T.textTertiary,lineHeight:1.5,fontFamily:FONT,marginTop:2}}>{c.notes}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Edit sheet */}
            {editContact&&(()=>{
              const c=contacts.find(x=>x.id===editContact);
              if(!c)return null;
              return(
                <ContactSheet
                  contact={c}
                  onClose={()=>setEditContact(null)}
                  onSave={draft=>{setContacts(p=>p.map(x=>x.id===draft.id?draft:x));setEditContact(null);}}
                  onDelete={id=>{setContacts(p=>p.filter(x=>x.id!==id));setEditContact(null);}}
                  T={T}
                />
              );
            })()}
          </div>
        )}

      </div>{/* end main content */}
      </div>{/* end content layer */}
    </div>
  );
}
