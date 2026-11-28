// Fixed neutral styling, so the panel stays readable whatever the lab does to the site.
export const STYLE = `
.lab { all: initial; position: fixed; top: 12px; bottom: 64px; width: 380px; z-index: 2147483000;
  display: flex; flex-direction: column; background: #181818; color: #e7e7e7; border: 1px solid #2d2d2d;
  border-radius: 10px; box-shadow: 0 12px 40px rgb(0 0 0 / .45); font: 12px/1.4 ui-sans-serif, system-ui, sans-serif;
  pointer-events: auto; overflow: hidden; }
.lab[hidden] { display: none; }
.lab.side-right { right: 12px; } .lab.side-left { left: 12px; }
.lab.collapsed { bottom: auto; }
.lab.collapsed nav, .lab.collapsed main { display: none; }
.lab * { box-sizing: border-box; font: inherit; color: inherit; }
header { display: flex; align-items: center; gap: 6px; padding: 8px 10px; border-bottom: 1px solid #2d2d2d; }
header b { font-weight: 650; white-space: nowrap; }
.count { color: #8e8e8e; margin-right: auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
header button { padding: 2px 6px; }
.lab:focus { outline: none; }
button { background: #252525; border: 1px solid #363636; border-radius: 6px; padding: 3px 8px; cursor: pointer; }
button:hover { background: #2f2f2f; } button.on { background: #e7e7e7; border-color: #e7e7e7; color: #181818; }
nav { display: flex; gap: 4px; padding: 6px 10px; border-bottom: 1px solid #2d2d2d; }
nav button { flex: 1; }
main { overflow: auto; padding: 10px; flex: 1; }
h4 { margin: 14px 0 6px; font-weight: 650; } h4 small, small { color: #8e8e8e; font-weight: 400; }
.hint { color: #9d9d9d; margin: 6px 0; }
.group { margin: 6px 0; border-top: 1px solid #272727; padding-top: 4px; }
summary { cursor: pointer; font-weight: 650; padding: 4px 0; }
.row { display: grid; grid-template-columns: 1fr 64px 64px 22px; align-items: center; gap: 6px; padding: 2px 0; }
.row.head { color: #8e8e8e; font-size: 11px; } .row.head span { text-align: center; }
.name small { display: block; font-size: 11px; }
.chip { width: 100%; height: 26px; padding: 2px; display: flex; align-items: center; gap: 2px; position: relative; }
.chip .sw { flex: 1; height: 100%; border-radius: 4px; border: 1px solid rgb(255 255 255 / .12);
  background-image: none; }
.chip .num { flex: 1; text-align: center; font-variant-numeric: tabular-nums; }
.chip i { position: absolute; right: 3px; top: 1px; font-style: normal; font-size: 11px; text-shadow: 0 0 3px #000; }
.chip.on { outline: 2px solid #e7e7e7; }
.editor { position: sticky; top: -10px; z-index: 1; background: #1e1e1e; border: 1px solid #323232; border-radius: 8px;
  padding: 8px; margin-bottom: 8px; }
.editor.empty { color: #9d9d9d; position: static; }
.ed-head { display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
.theme-tag { background: #2f2f2f; border-radius: 4px; padding: 0 5px; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #bababa; }
.modes { display: flex; gap: 4px; margin: 6px 0; }
.color-edit { display: flex; gap: 8px; align-items: center; margin: 6px 0; }
.big { width: 44px; height: 44px; border-radius: 6px; border: 1px solid rgb(255 255 255 / .15); flex: none; }
.fields { display: flex; gap: 6px; flex: 1; }
.text { flex: 1; min-width: 0; background: #121212; border: 1px solid #363636; border-radius: 6px; padding: 4px 6px; }
.text.invalid { border-color: #ffffff; border-style: dashed; }
input[type=color] { width: 36px; height: 28px; padding: 0; border: 1px solid #363636; border-radius: 6px; background: none; }
.slider { display: grid; grid-template-columns: 16px 1fr 46px; gap: 6px; align-items: center; margin: 3px 0; }
.slider output { text-align: right; font-variant-numeric: tabular-nums; }
input[type=range] { width: 100%; accent-color: #bdbdbd; }
.use { display: flex; gap: 8px; align-items: center; margin-top: 6px; }
.use .sw, .active .sw { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: middle; border: 1px solid rgb(255 255 255 / .2); }
.checks { width: 100%; border-collapse: collapse; }
.checks th, .checks td { padding: 4px 3px; border-bottom: 1px solid #272727; text-align: left; vertical-align: middle; font-weight: 400; }
.checks th small { display: block; font-size: 10.5px; }
.checks td { font-variant-numeric: tabular-nums; white-space: nowrap; }
/* Pass and fail read by weight and symbol, not hue, so the panel never tints judgement. */
.ok { color: #a0a0a0; } .bad { color: #ffffff; font-weight: 700; } .warn { color: #d6d6d6; font-style: italic; }
.checks td.bad .cell::before { content: "✗ "; } .checks td.warn .cell::before { content: "≠ "; }
.floor { color: #8e8e8e; }
.pair i { display: inline-flex; width: 26px; height: 18px; border-radius: 3px; align-items: center; justify-content: center;
  margin-right: 4px; vertical-align: middle; font-style: normal; border: 1px solid rgb(255 255 255 / .1); }
.pair b { font: 650 11px/1 Georgia, serif; }
.form { display: grid; gap: 4px; }
.form label { display: grid; grid-template-columns: 82px 1fr auto; gap: 6px; align-items: center; }
.form label:first-child { grid-template-columns: 82px 40px 1fr; }
select { background: #121212; border: 1px solid #363636; border-radius: 6px; padding: 3px; min-width: 0; }
.swrow { display: flex; gap: 3px; align-items: center; margin: 4px 0; }
.swrow .hue { width: 38px; color: #8e8e8e; font-variant-numeric: tabular-nums; }
.swatch { flex: 1; height: 28px; min-width: 0; padding: 0; border-radius: 4px; border: 1px solid rgb(255 255 255 / .12);
  color: #fff; font-weight: 700; text-shadow: 0 0 3px #000; }
.swatch.on { outline: 2px solid #e7e7e7; outline-offset: 1px; }
.result { margin: 6px 0; }
.card { background: #1e1e1e; border: 1px solid #323232; border-radius: 8px; padding: 8px; display: grid; gap: 3px; }
textarea { width: 100%; height: 140px; background: #121212; border: 1px solid #363636; border-radius: 6px; padding: 6px;
  font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; resize: vertical; margin-bottom: 6px; }
button:disabled { opacity: .4; cursor: default; }
.primary { width: 100%; margin: 8px 0; padding: 6px; background: #e7e7e7; border-color: #e7e7e7; color: #181818; font-weight: 600; }
.primary:hover { background: #d4d4d4; }
.mini-btn { padding: 1px 6px; font-size: 11px; }
.push { margin-left: auto; }
.badge { background: #e7e7e7; color: #181818; border-radius: 8px; padding: 0 5px; font-size: 10px; margin-left: 2px; }
.bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.bar label { display: flex; align-items: center; gap: 4px; color: #9d9d9d; }
.seg { display: flex; } .seg button { border-radius: 0; } .seg button:first-child { border-radius: 6px 0 0 6px; }
.seg button:last-child { border-radius: 0 6px 6px 0; margin-left: -1px; }
.nudges { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin: 6px 0; }
.mini { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 8px; padding-top: 6px; border-top: 1px solid #323232; }
.summary { margin: 0 0 8px; }
.cell { background: none; border: 0; padding: 0; display: inline-flex; align-items: center; color: inherit; }
.cell:hover { text-decoration: underline; background: none; }
.active { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 6px 8px; background: #1e1e1e; border-radius: 6px; }
.quick { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; width: 100%; }
.quick label { display: flex; align-items: center; gap: 4px; }
.slots { display: grid; gap: 6px; margin-bottom: 6px; }
.slot { display: grid; grid-template-columns: 16px auto 34px 1fr; align-items: center; gap: 6px; }
.slot .sw { width: 16px; height: 16px; border-radius: 3px; border: 1px solid rgb(255 255 255 / .2); }
.slot .roles { grid-column: 2 / -1; margin-top: -4px; }
.vars { display: grid; gap: 4px; }
.vars div { display: flex; align-items: center; gap: 6px; } .vars span { margin-right: auto; }
.form input[type=checkbox] { justify-self: start; }
.changes { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 6px 10px; border-bottom: 1px solid #2d2d2d;
  background: #202020; }
.changes span { margin-right: auto; color: #cccccc; }
.changes button { padding: 2px 8px; }
`;
