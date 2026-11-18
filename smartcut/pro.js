/* D3 SmartCut Pro workshop reports: labels, edge banding, hinge schedule, offcut register. */
(function(){
"use strict";
const $=id=>document.getElementById(id), OFFCUT_KEY="d3-smartcut-offcuts-v1";
let offcuts=readOffcuts();
function readOffcuts(){try{return JSON.parse(localStorage.getItem(OFFCUT_KEY)||"[]");}catch(e){return[];}}
function persist(){localStorage.setItem(OFFCUT_KEY,JSON.stringify(offcuts));}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function expanded(){const out=[];panels.forEach(raw=>{const p=normalisePanel(raw);for(let i=0;i<Math.max(0,Number(p.quantity)||0);i++)out.push({...p,unit:i+1});});return out;}
function edgeRows(){const map=new Map();expanded().forEach(p=>{if(!p.edgeSides.length)return;const key=[p.material||"Unspecified",p.thickness,p.edgeThickness,p.edgeSides.slice().sort().join("")].join("|");if(!map.has(key))map.set(key,{material:p.material||"Unspecified",board:p.thickness,tape:p.edgeThickness,sides:p.edgeSides.slice().sort().join(""),parts:0,linear:0});const r=map.get(key);r.parts++;p.edgeSides.forEach(side=>{r.linear+=side==="A"||side==="C"?p.length:p.width;});});return [...map.values()];}
function hingeRows(){return expanded().filter(p=>Number(p.hinges)>0).flatMap(p=>hingePositions(p).map((h,i)=>({id:p.id,name:p.name,unit:p.unit,material:p.material||"Unspecified",diameter:p.hingeDia,depth:p.hingeDepth,side:p.hingeSide,x:h.x,y:h.y,index:i+1}))); }
function labelsHtml(){return expanded().map(p=>'<article class="d3-label"><b>D3 INTERIOR DESIGNS</b><h3>'+esc(p.id)+' · '+esc(p.name)+'</h3><p>'+esc(p.cabinet||"")+'</p><strong>'+p.length+' × '+p.width+' × '+p.thickness+' mm</strong><p>'+esc(p.material||"Unspecified")+' · '+esc(p.colour||"")+'</p><p>Piece '+p.unit+' / '+p.quantity+' · Grain: '+esc(p.grain)+'</p><p>Edge: '+esc(p.edgeSides.join(" ")||"None")+' · '+p.edgeThickness+' mm</p><small>Project: '+esc(projectData().name||"")+' · Customer: '+esc(projectData().customer||"")+'</small></article>').join("");}
function reportHtml(){
 const edges=edgeRows(),hinges=hingeRows();
 return '<section class="d3-report-page"><h1>D3 SmartCut · Workshop production report</h1><p>'+esc(projectData().name||"Untitled project")+' · '+esc(projectData().customer||"")+' · '+new Date().toLocaleDateString()+'</p>'+
 '<h2>Panel schedule / pick list</h2><table><thead><tr><th>ID</th><th>Panel</th><th>Cabinet</th><th>Core size mm</th><th>Board</th><th>Qty</th><th>Material</th></tr></thead><tbody>'+panels.map(p=>{const s=coreSize(normalisePanel(p));return '<tr><td>'+esc(p.id)+'</td><td>'+esc(p.name)+'</td><td>'+esc(p.cabinet)+'</td><td>'+s.length.toFixed(1)+' × '+s.width.toFixed(1)+'</td><td>'+p.thickness+'</td><td>'+p.quantity+'</td><td>'+esc(p.material||"Unspecified")+'</td></tr>';}).join("")+'</tbody></table>'+
 '<h2>Edge-banding production report</h2><table><thead><tr><th>Material</th><th>Board mm</th><th>Tape mm</th><th>Edges</th><th>Pieces</th><th>Estimated tape length mm</th></tr></thead><tbody>'+edges.map(r=>'<tr><td>'+esc(r.material)+'</td><td>'+r.board+'</td><td>'+r.tape+'</td><td>'+r.sides+'</td><td>'+r.parts+'</td><td>'+Math.ceil(r.linear)+'</td></tr>').join("")+'</tbody></table>'+
 '<h2>Hinge drilling schedule</h2><table><thead><tr><th>Panel</th><th>Piece</th><th>Hole</th><th>Ø / depth mm</th><th>Hinge edge</th><th>X mm</th><th>Y mm</th></tr></thead><tbody>'+hinges.map(h=>'<tr><td>'+esc(h.id)+' '+esc(h.name)+'</td><td>'+h.unit+'</td><td>'+h.index+'</td><td>'+h.diameter+' / '+h.depth+'</td><td>'+esc(h.side)+'</td><td>'+h.x.toFixed(1)+'</td><td>'+h.y.toFixed(1)+'</td></tr>').join("")+'</tbody></table>'+
 '<p class="d3-report-warning">Verify hinge positions and cup dimensions against the selected hardware manufacturer’s template. Confirm edge-banding allowances and board dimensions before production. This report is not a machine-control file.</p></section>';
}
function renderOffcuts(){
 $("offcutList").innerHTML=offcuts.length?offcuts.map((o,i)=>'<div class="panel-row"><div><strong>'+esc(o.material)+' · '+o.thickness+' mm</strong><small>'+o.length.toFixed(1)+' × '+o.width.toFixed(1)+' mm · '+esc(o.source)+' · '+esc(o.date)+'</small></div><button class="delete" data-offcut="'+i+'" type="button">Remove</button></div>').join(""):'<p class="empty">No offcuts recorded yet.</p>';
}
$("generateWorkshopReport").addEventListener("click",()=>{
 if(!panels.length){$("proStatus").textContent="Add panels before creating workshop reports.";return;}
 const labels=labelsHtml(),report=reportHtml();
 $("proPreview").innerHTML='<div class="d3-pro-summary"><b>'+expanded().length+'</b> individual labels · <b>'+edgeRows().length+'</b> edge-banding groups · <b>'+hingeRows().length+'</b> hinge positions</div><div class="actions wrap"><button id="printD3Labels" type="button" class="secondary">Print panel labels</button><button id="printD3Report" type="button" class="primary">Print workshop report / PDF</button><button id="exportD3ProCsv" type="button" class="secondary">Export production reports CSV</button></div><div class="d3-pro-preview">'+report+'</div>';
 $("proStatus").textContent="Workshop reports prepared. Check the dimensions and quantities before printing.";
 $("proPreview").dataset.labels=labels;
});
$("proPreview").addEventListener("click",e=>{
 if(e.target.id==="printD3Labels"||e.target.id==="printD3Report"){
  const old=document.getElementById("d3PrintArea");if(old)old.remove();
  const node=document.createElement("div");node.id="d3PrintArea";
  node.innerHTML=e.target.id==="printD3Labels"?'<div class="d3-label-grid">'+$("proPreview").dataset.labels+'</div>':reportHtml();
  document.body.appendChild(node);document.body.classList.add("d3-pro-print");window.print();setTimeout(()=>{node.remove();document.body.classList.remove("d3-pro-print");},1200);
 }
 if(e.target.id==="exportD3ProCsv"){
  const rows=[["Report","Panel ID","Panel","Material","Thickness mm","Quantity","Edge sides","Tape mm","Tape length mm","Hinge hole","Diameter mm","Depth mm","X mm","Y mm"]];
  panels.forEach(raw=>{const p=normalisePanel(raw),s=coreSize(p);rows.push(["Panel",p.id,p.name,p.material,p.thickness,p.quantity,p.edgeSides.join(" "),p.edgeThickness,"","","","","",""]);});
  edgeRows().forEach(r=>rows.push(["Edge banding","","",r.material,r.board,r.parts,r.sides,r.tape,Math.ceil(r.linear),"","","","",""]));
  hingeRows().forEach(h=>rows.push(["Hinge",h.id,h.name,h.material,"",1,"","", "",h.index,h.diameter,h.depth,h.x.toFixed(1),h.y.toFixed(1)]));
  download("\uFEFF"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n"),"d3-smartcut-production-reports.csv","text/csv;charset=utf-8");
 }
});
$("saveOffcuts").addEventListener("click",()=>{
 if(!latestOptimisation||!latestOptimisation.sheets.length){$("proStatus").textContent="Run the cutting optimizer first.";return;}
 let count=0;
 latestOptimisation.sheets.forEach(sh=>sh.free.forEach((r,i)=>{if(r.w<100||r.h<100)return;offcuts.push({id:"OC-"+Date.now()+"-"+count,material:sh.material,thickness:sh.thickness,length:r.w,width:r.h,source:"Sheet "+sh.number,date:new Date().toLocaleDateString()});count++;}));
 persist();renderOffcuts();$("proStatus").textContent=count+" reusable offcut rectangle(s) saved to this device. Check their actual size before reuse.";
});
$("offcutList").addEventListener("click",e=>{const b=e.target.closest("[data-offcut]");if(!b)return;offcuts.splice(Number(b.dataset.offcut),1);persist();renderOffcuts();});
$("exportOffcuts").addEventListener("click",()=>{
 const rows=[["Offcut ID","Material","Thickness mm","Length mm","Width mm","Source","Date"],...offcuts.map(o=>[o.id,o.material,o.thickness,o.length.toFixed(1),o.width.toFixed(1),o.source,o.date])];
 download("\uFEFF"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n"),"d3-smartcut-offcut-inventory.csv","text/csv;charset=utf-8");
});
renderOffcuts();
})();