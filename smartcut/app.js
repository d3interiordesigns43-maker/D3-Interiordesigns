const $=id=>document.getElementById(id);
const STORE_KEY="d3-smartcut-project-v1";
let panels=[];
function projectData(){return{name:$("projectName").value.trim(),customer:$("customer").value.trim(),boardLength:+$("boardLength").value||2440,boardWidth:+$("boardWidth").value||1220,kerf:+$("kerf").value||0,trim:+$("trim").value||0,units:"mm",panels,updatedAt:new Date().toISOString()};}
function loadProject(){try{const d=JSON.parse(localStorage.getItem(STORE_KEY)||localStorage.getItem("d3-smartcut-project-v2")||"null");if(!d)return;$("projectName").value=d.name||"";$("customer").value=d.customer||"";$("boardLength").value=d.boardLength||2440;$("boardWidth").value=d.boardWidth||1220;$("kerf").value=d.kerf??4;$("trim").value=d.trim??10;panels=Array.isArray(d.panels)?d.panels.map(p=>({...p,edges:p.edges||(Array.isArray(p.edgeSides)&&p.edgeSides.length?p.edgeSides.join(","):"None")})):[];render();}catch(e){console.warn("Could not load saved project",e);}}
function saveProject(){try{localStorage.setItem(STORE_KEY,JSON.stringify(projectData()));$("saveStatus").textContent="Saved on this device at "+new Date().toLocaleTimeString()+". This does not sync to other devices."; }catch(e){$("saveStatus").textContent="Could not save. Export a JSON backup and check device storage.";}}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){ $("panelCount").textContent=panels.length+" panel"+(panels.length===1?"":"s");$("panelList").innerHTML=panels.length?panels.map((p,i)=>'<div class="panel-row"><div><strong>'+escapeHtml(p.id)+" · "+escapeHtml(p.name)+'</strong><small>'+p.length+' × '+p.width+' × '+p.thickness+' mm · Qty '+p.quantity+' · '+escapeHtml(p.material||"Material not set")+'</small></div><button class="delete" data-remove="'+i+'" aria-label="Delete '+escapeHtml(p.id)+'">Delete</button></div>').join(""):'<p class="empty">No panels yet. Add your first panel above.</p>'; }
$("panelForm").addEventListener("submit",e=>{e.preventDefault();const p={id:"PN-"+String(panels.length+1).padStart(3,"0"),name:$("panelName").value.trim(),cabinet:$("cabinet").value.trim(),length:+$("length").value,width:+$("width").value,thickness:+$("thickness").value,quantity:+$("quantity").value,material:$("material").value.trim(),colour:$("colour").value.trim(),grain:$("grain").value,edges:$("edges").value,edgeBandThickness:+$("edgeBandThickness").value,grooveWidth:+$("grooveWidth").value,grooveDepth:+$("grooveDepth").value,grooveReference:$("grooveReference").value,grooveOffset:+$("grooveOffset").value,hinges:+$("hinges").value,hingeDia:+$("hingeDia").value,hingeSideOffset:+$("hingeSideOffset").value,hingeTopOffset:+$("hingeTopOffset").value,hingeBottomOffset:+$("hingeBottomOffset").value,notes:$("notes").value.trim()};if(!p.length||!p.width||!p.thickness||!p.quantity)return;panels.push(p);render();saveProject();e.target.reset();$("thickness").value=18;$("quantity").value=1;$("hingeDia").value=35;$("hingeSideOffset").value=21.5;$("hingeTopOffset").value=100;$("hingeBottomOffset").value=100;$("grooveReference").value="None";$("edgeBandThickness").value="0.8";$("edges").value="None";});
$("panelList").addEventListener("click",e=>{const b=e.target.closest("[data-remove]");if(!b)return;panels.splice(+b.dataset.remove,1);panels.forEach((p,i)=>p.id="PN-"+String(i+1).padStart(3,"0"));render();saveProject();});
$("saveProject").addEventListener("click",saveProject);
$("newProject").addEventListener("click",()=>{if(!confirm("Clear the current project on this device? Export a backup first if needed."))return;panels=[];["projectName","customer"].forEach(id=>$(id).value="");$("boardLength").value=2440;$("boardWidth").value=1220;$("kerf").value=4;$("trim").value=10;localStorage.removeItem(STORE_KEY);render();$("saveStatus").textContent="New empty project."});
function csvCell(v){return '"'+String(v??"").replace(/"/g,'""')+'"';}
$("exportCsv").addEventListener("click",()=>{const cols=["Panel ID","Panel name","Cabinet","Length mm","Width mm","Thickness mm","Quantity","Material","Colour","Grain","Edge band sides","Groove width mm","Groove depth mm","Groove offset mm","Hinge holes","Hinge diameter mm","Notes"];const rows=panels.map(p=>[p.id,p.name,p.cabinet,p.length,p.width,p.thickness,p.quantity,p.material,p.colour,p.grain,p.edges,p.grooveWidth,p.grooveDepth,p.grooveOffset,p.hinges,p.hingeDia,p.notes]);download("\uFEFF"+[cols,...rows].map(r=>r.map(csvCell).join(",")).join("\r\n"),"d3-smartcut-cutting-list.csv","text/csv;charset=utf-8");});
$("exportJson").addEventListener("click",()=>download(JSON.stringify(projectData(),null,2),"d3-smartcut-project.json","application/json"));
$("importJson").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());panels=Array.isArray(d.panels)?d.panels:[];$("projectName").value=d.name||"";$("customer").value=d.customer||"";$("boardLength").value=d.boardLength||2440;$("boardWidth").value=d.boardWidth||1220;$("kerf").value=d.kerf??4;$("trim").value=d.trim??10;render();saveProject();}catch(err){alert("Invalid project JSON file.");}e.target.value="";});
function download(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
function panelSvg(p){
 const W=640,H=420,pad=48,scale=Math.min((W-2*pad)/p.length,(H-2*pad)/p.width),w=p.length*scale,h=p.width*scale,x=(W-w)/2,y=(H-h)/2;let marks="";
 if(p.grooveWidth>0&&p.grooveDepth>0&&p.grooveReference!=="None"){
  const off=Math.min(p.grooveOffset||0,p.width),gy=y+(p.grooveReference==="B"?p.width-off:off)*scale;
  marks+='<line x1="'+x+'" y1="'+gy+'" x2="'+(x+w)+'" y2="'+gy+'" stroke="#b3261e" stroke-width="4" stroke-dasharray="10 6"/>';
 }
 for(let i=0;i<(p.hinges||0);i++){
  const along=p.hinges===1?p.width/2:(p.hingeTopOffset||100)+i*(p.width-(p.hingeTopOffset||100)-(p.hingeBottomOffset||100))/(p.hinges-1);
  const cx=x+(p.hingeSideOffset||21.5)*scale,cy=y+along*scale;
  marks+='<circle cx="'+cx+'" cy="'+cy+'" r="'+Math.max(5,(p.hingeDia||35)*scale/2)+'" fill="none" stroke="#175b91" stroke-width="3"/><line x1="'+x+'" y1="'+cy+'" x2="'+cx+'" y2="'+cy+'" stroke="#175b91" stroke-width="1" stroke-dasharray="3 3"/>';
 }
 return '<svg class="panel-svg" viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#e4d2ac" stroke="#5f4c2e" stroke-width="3"/>'+marks+'<text x="'+(W/2)+'" y="'+(y-16)+'" text-anchor="middle" font-size="15" fill="#111">'+p.length+' mm</text><text x="'+(x+w+15)+'" y="'+(H/2)+'" transform="rotate(90 '+(x+w+15)+' '+(H/2)+')" text-anchor="middle" font-size="15" fill="#111">'+p.width+' mm</text><text x="'+(W/2)+'" y="'+(y+h+25)+'" text-anchor="middle" font-size="13" fill="#111">Grain: '+escapeHtml(p.grain)+' →</text><text x="'+(x+8)+'" y="'+(y+18)+'" font-size="12" fill="#111">A</text><text x="'+(x+w-18)+'" y="'+(y+18)+'" font-size="12" fill="#111">B</text><text x="'+(x+w-18)+'" y="'+(y+h-8)+'" font-size="12" fill="#111">C</text><text x="'+(x+8)+'" y="'+(y+h-8)+'" font-size="12" fill="#111">D</text></svg>';
}
$("printDrawings").addEventListener("click",()=>{if(!panels.length){alert("Add at least one panel first.");return;}const data=projectData();const old=document.querySelector(".drawings");if(old)old.remove();const section=document.createElement("section");section.className="drawings";section.innerHTML=panels.map(p=>'<article class="drawing-page"><p class="small-print">D3 INTERIOR DESIGNS · D3 SMARTCUT · '+escapeHtml(data.name||"UNNAMED PROJECT")+'</p><h1>'+escapeHtml(p.id)+' — '+escapeHtml(p.name)+'</h1><div class="drawing-meta"><div><b>Cabinet</b><br>'+escapeHtml(p.cabinet||"—")+'</div><div><b>Finished size</b><br>'+p.length+' × '+p.width+' × '+p.thickness+' mm</div><div><b>Quantity</b><br>'+p.quantity+'</div><div><b>Material / colour</b><br>'+escapeHtml(p.material||"—")+' / '+escapeHtml(p.colour||"—")+'</div><div><b>Grain</b><br>'+escapeHtml(p.grain)+'</div><div><b>Edge band sides</b><br>'+escapeHtml(p.edges)+'</div></div>'+panelSvg(p)+'<div class="drawing-notes"><b>Machining notes</b><br>Groove: '+p.grooveWidth+' mm wide × '+p.grooveDepth+' mm deep; offset from edge A: '+p.grooveOffset+' mm<br>Hinge cup holes: '+p.hinges+' × Ø'+p.hingeDia+' mm<br>Additional notes: '+escapeHtml(p.notes||"—")+'<br><br><b>Workshop verification:</b> Confirm all dimensions, datum edges, machining coordinates, hardware templates, tool sizes and workholding before manufacture.</div><p class="small-print">Drawing is a planning document, not a validated CNC toolpath. Revision 1 · '+new Date().toLocaleDateString()+'</p></article>').join("");document.body.appendChild(section);window.print();setTimeout(()=>section.remove(),1200);});
$("installHelp").addEventListener("click",()=>$("helpDialog").showModal());$("closeHelp").addEventListener("click",()=>$("helpDialog").close());
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(err=>console.warn("PWA worker registration failed",err)));}
loadProject();
function edgeBandTotal(){
 return panels.reduce((sum,p)=>{
  const sides=(p.edges||"None").split(",").filter(s=>s!=="None");
  const per=sides.reduce((n,s)=>n+((s==="A"||s==="C")?Number(p.length):Number(p.width)),0);
  return sum+per*(Number(p.quantity)||1);
 },0);
}
function makeSheetPlan(){
 const boardL=Number($("boardLength").value)||2440,boardW=Number($("boardWidth").value)||1220;
 const trim=Number($("trim").value)||0,kerf=Number($("kerf").value)||0;
 const usableL=boardL-2*trim,usableW=boardW-2*trim;
 const pieces=[];
 panels.forEach(p=>{for(let q=0;q<(Number(p.quantity)||1);q++)pieces.push({id:p.id,name:p.name,l:Number(p.length),w:Number(p.width),grain:p.grain});});
 pieces.sort((a,b)=>Math.max(b.l,b.w)-Math.max(a.l,a.w));
 const sheets=[];
 for(const piece of pieces){
  const opts=piece.grain==="Length"?[{l:piece.l,w:piece.w}]:piece.grain==="Width"?[{l:piece.w,w:piece.l}]:[{l:piece.l,w:piece.w},{l:piece.w,w:piece.l}];
  let placed=false;
  for(const sheet of sheets){
   for(const row of sheet.rows){
    for(const o of opts){
     const gap=row.items.length?kerf:0;
     if(o.w<=row.h&&row.x+gap+o.l<=usableL){
      row.items.push({...piece,...o,x:row.x+gap,y:row.y});row.x+=gap+o.l;placed=true;break;
     }
    }
    if(placed)break;
   }
   if(placed)break;
  }
  if(placed)continue;
  let choice=opts.find(o=>o.l<=usableL&&o.w<=usableW);
  if(!choice)return {error:"Panel "+piece.id+" ("+piece.l+" × "+piece.w+" mm) cannot fit on the sheet with its grain direction and trim."};
  let sheet=sheets.find(s=>s.usedH+(s.rows.length?kerf:0)+choice.w<=usableW);
  if(!sheet){sheet={rows:[],usedH:0};sheets.push(sheet);}
  const y=sheet.rows.length?sheet.usedH+kerf:0;
  sheet.rows.push({y,h:choice.w,x:choice.l,items:[{...piece,...choice,x:0,y}]});
  sheet.usedH=y+choice.w;
 }
 return {sheets,boardL,boardW,usableL,usableW,pieceCount:pieces.length};
}
function sheetSvg(sheet,plan){
 const pad=30,scale=Math.min(900/plan.boardL,450/plan.boardW),w=plan.boardL*scale,h=plan.boardW*scale;
 const items=sheet.rows.flatMap(r=>r.items).map(p=>{
  const x=pad+(plan.boardL-plan.usableL)/2*scale+p.x*scale,y=pad+(plan.boardW-plan.usableW)/2*scale+p.y*scale,pw=p.l*scale,ph=p.w*scale;
  return '<rect x="'+x+'" y="'+y+'" width="'+pw+'" height="'+ph+'" fill="#e7d8b8" stroke="#222" stroke-width="1.5"/><text x="'+(x+pw/2)+'" y="'+(y+ph/2-4)+'" text-anchor="middle" font-size="12" fill="#111">'+escapeHtml(p.id)+'</text><text x="'+(x+pw/2)+'" y="'+(y+ph/2+10)+'" text-anchor="middle" font-size="10" fill="#111">'+p.l+' × '+p.w+'</text>';
 }).join("");
 return '<svg class="sheet-svg" viewBox="0 0 '+(w+pad*2)+' '+(h+pad*2)+'" xmlns="http://www.w3.org/2000/svg"><rect x="'+pad+'" y="'+pad+'" width="'+w+'" height="'+h+'" fill="#fff" stroke="#111" stroke-width="2"/>'+items+'</svg>';
}
$("printSheets").addEventListener("click",()=>{
 if(!panels.length){alert("Add at least one panel first.");return;}
 const plan=makeSheetPlan();if(plan.error){alert(plan.error);return;}
 const edge=edgeBandTotal(),section=document.createElement("section");section.className="sheet-report";
 section.innerHTML='<header><h1>D3 SmartCut — Sheet layout</h1><p>'+escapeHtml($("projectName").value||"Unnamed project")+' · '+escapeHtml($("customer").value||"")+'</p></header>'+
 '<div class="sheet-summary"><div><b>'+plan.pieceCount+'</b><small>Total panels / pieces</small></div><div><b>'+plan.sheets.length+'</b><small>'+plan.boardL+' × '+plan.boardW+' mm sheets required</small></div><div><b>'+edge.toFixed(1)+' mm</b><small>Total edge band length</small></div></div>'+
 '<p class="sheet-caveat">Simple shelf layout. Selected grain direction, trim and kerf are considered. Check all dimensions and sheet layouts before cutting. This is not an industrial nesting optimiser.</p>'+
 plan.sheets.map((s,i)=>'<article class="sheet-page"><h2>Sheet '+(i+1)+' of '+plan.sheets.length+' · '+plan.boardL+' × '+plan.boardW+' mm</h2>'+sheetSvg(s,plan)+'<p>'+s.rows.reduce((n,r)=>n+r.items.length,0)+' pieces on this sheet</p></article>').join("")+
 '<section class="sheet-table"><h2>Panel summary</h2><table><thead><tr><th>Panel</th><th>Size (mm)</th><th>Qty</th><th>Edge band</th></tr></thead><tbody>'+
 panels.map(p=>'<tr><td>'+escapeHtml(p.id)+' · '+escapeHtml(p.name)+'</td><td>'+p.length+' × '+p.width+' × '+p.thickness+'</td><td>'+p.quantity+'</td><td>'+escapeHtml(p.edges||"None")+' · '+(p.edgeBandThickness||0.8)+' mm</td></tr>').join("")+
 '</tbody></table></section>';
 document.body.appendChild(section);window.print();setTimeout(()=>section.remove(),1500);
});
