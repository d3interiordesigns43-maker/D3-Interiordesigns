const $=id=>document.getElementById(id);
const STORE_KEY="d3-smartcut-project-v1";
let panels=[];
function projectData(){return{name:$("projectName").value.trim(),customer:$("customer").value.trim(),projectNotes:$("projectNotes").value.trim(),boardLength:+$("boardLength").value||2440,boardWidth:+$("boardWidth").value||1220,kerf:+$("kerf").value||0,trim:+$("trim").value||0,units:"mm",panels,updatedAt:new Date().toISOString()};}
function loadProject(){try{const d=JSON.parse(localStorage.getItem(STORE_KEY)||localStorage.getItem("d3-smartcut-project-v2")||"null");if(!d)return;$("projectName").value=d.name||"";$("customer").value=d.customer||"";$("projectNotes").value=d.projectNotes||"";$("boardLength").value=d.boardLength||2440;$("boardWidth").value=d.boardWidth||1220;$("kerf").value=d.kerf??4;$("trim").value=d.trim??10;panels=Array.isArray(d.panels)?d.panels.map(p=>({...p,edges:p.edges||(Array.isArray(p.edgeSides)&&p.edgeSides.length?p.edgeSides.join(","):"None")})):[];render();}catch(e){console.warn("Could not load saved project",e);}}
function saveProject(){try{localStorage.setItem(STORE_KEY,JSON.stringify(projectData()));$("saveStatus").textContent="Saved on this device at "+new Date().toLocaleTimeString()+". This does not sync to other devices."; }catch(e){$("saveStatus").textContent="Could not save. Export a JSON backup and check device storage.";}}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){ const totalPieces=panels.reduce((n,p)=>n+(Number(p.quantity)||1),0);$("panelCount").textContent=totalPieces+" pieces · "+panels.length+" panel types";$("panelList").innerHTML=panels.length?panels.map((p,i)=>'<div class="panel-row"><div><strong>'+escapeHtml(p.id)+" · "+escapeHtml(p.name)+'</strong><small>'+p.length+' × '+p.width+' × '+p.thickness+' mm · Qty '+p.quantity+' · '+escapeHtml(p.material||"Material not set")+'</small></div><button class="secondary" data-edit="'+i+'">Edit</button><button class="delete" data-remove="'+i+'" aria-label="Delete '+escapeHtml(p.id)+'">Delete</button></div>').join(""):'<p class="empty">No panels yet. Add your first panel above.</p>'; }
$("panelForm").addEventListener("submit",e=>{e.preventDefault();const p={id:"PN-"+String(panels.length+1).padStart(3,"0"),name:$("panelName").value.trim(),cabinet:$("cabinet").value.trim(),length:+$("length").value,width:+$("width").value,thickness:+$("thickness").value,quantity:+$("quantity").value,material:$("material").value.trim(),colour:$("colour").value.trim(),grain:$("grain").value,edges:$("edges").value,edgeBandThickness:+$("edgeBandThickness").value,grooveWidth:+$("grooveWidth").value,grooveDepth:+$("grooveDepth").value,grooveReference:$("grooveReference").value,grooveOffset:+$("grooveOffset").value,hinges:+$("hinges").value,hingeDia:+$("hingeDia").value,hingeSide:$("hingeSide").value,hingeSideOffset:+$("hingeSideOffset").value,hingeTopOffset:+$("hingeTopOffset").value,hingeBottomOffset:+$("hingeBottomOffset").value,hardware:$("hardware").value.trim(),notes:$("notes").value.trim()};if(!p.length||!p.width||!p.thickness||!p.quantity)return;panels.push(p);render();saveProject();e.target.reset();$("thickness").value=18;$("quantity").value=1;$("hingeDia").value=35;$("hingeSide").value="D";$("hingeSideOffset").value=21.5;$("hingeTopOffset").value=100;$("hingeBottomOffset").value=100;$("grooveReference").value="None";$("edgeBandThickness").value="0.8";$("edges").value="None";});
$("panelList").addEventListener("click",e=>{
 const edit=e.target.closest("[data-edit]");
 if(edit){
  const i=+edit.dataset.edit,p=panels[i];
  const name=prompt("Panel name:",p.name);if(name===null)return;
  const length=prompt("Length (mm):",p.length);if(length===null)return;
  const width=prompt("Width (mm):",p.width);if(width===null)return;
  const thickness=prompt("Thickness (mm):",p.thickness);if(thickness===null)return;
  const quantity=prompt("Quantity:",p.quantity);if(quantity===null)return;
  if(![length,width,thickness,quantity].every(v=>Number(v)>0)){alert("All dimensions and quantity must be greater than zero.");return;}
  panels[i]={...p,name:name.trim(),length:+length,width:+width,thickness:+thickness,quantity:+quantity};render();saveProject();return;
 }
 const b=e.target.closest("[data-remove]");if(!b)return;
 panels.splice(+b.dataset.remove,1);panels.forEach((p,i)=>p.id="PN-"+String(i+1).padStart(3,"0"));render();saveProject();
});
$("saveProject").addEventListener("click",saveProject);
$("newProject").addEventListener("click",()=>{if(!confirm("Clear the current project on this device? Export a backup first if needed."))return;panels=[];["projectName","customer","projectNotes"].forEach(id=>$(id).value="");$("boardLength").value=2440;$("boardWidth").value=1220;$("kerf").value=4;$("trim").value=10;localStorage.removeItem(STORE_KEY);render();$("saveStatus").textContent="New empty project."});
function csvCell(v){return '"'+String(v??"").replace(/"/g,'""')+'"';}
$("exportCsv").addEventListener("click",()=>{const cols=["Panel ID","Panel name","Cabinet","Length mm","Width mm","Thickness mm","Quantity","Material","Colour","Grain","Edge band sides","Groove width mm","Groove depth mm","Groove offset mm","Hinge holes","Hinge diameter mm","Notes"];const rows=panels.map(p=>[p.id,p.name,p.cabinet,p.length,p.width,p.thickness,p.quantity,p.material,p.colour,p.grain,p.edges,p.grooveWidth,p.grooveDepth,p.grooveOffset,p.hinges,p.hingeDia,p.notes]);download("\uFEFF"+[cols,...rows].map(r=>r.map(csvCell).join(",")).join("\r\n"),"d3-smartcut-cutting-list.csv","text/csv;charset=utf-8");});
$("exportJson").addEventListener("click",()=>download(JSON.stringify(projectData(),null,2),"d3-smartcut-project.json","application/json"));
$("importJson").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());panels=Array.isArray(d.panels)?d.panels:[];$("projectName").value=d.name||"";$("customer").value=d.customer||"";$("projectNotes").value=d.projectNotes||"";$("boardLength").value=d.boardLength||2440;$("boardWidth").value=d.boardWidth||1220;$("kerf").value=d.kerf??4;$("trim").value=d.trim??10;render();saveProject();}catch(err){alert("Invalid project JSON file.");}e.target.value="";});
function download(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
$("installHelp").addEventListener("click",()=>$("helpDialog").showModal());$("closeHelp").addEventListener("click",()=>$("helpDialog").close());
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(err=>console.warn("PWA worker registration failed",err)));}
loadProject();

function individualPanelSvg(p){
 const W=640,H=420,pad=48,scale=Math.min((W-2*pad)/p.length,(H-2*pad)/p.width),w=p.length*scale,h=p.width*scale,x=(W-w)/2,y=(H-h)/2;
 let marks="";
 const grooveOffset=Math.max(0,Number(p.grooveOffset)||0);
 if(Number(p.grooveWidth)>0&&Number(p.grooveDepth)>0){
  const ref=p.grooveReference||"A";
  const gy=ref==="B"?y+h-grooveOffset*scale:y+grooveOffset*scale;
  marks+='<line x1="'+x+'" y1="'+gy+'" x2="'+(x+w)+'" y2="'+gy+'" stroke="#b3261e" stroke-width="4" stroke-dasharray="10 6"/>';
 }
 const hinges=Number(p.hinges)||0, dia=Number(p.hingeDia)||35, side=p.hingeSide||"D";
 for(let i=0;i<hinges;i++){
  const horizontal=side==="A"||side==="C",run=horizontal?p.length:p.width;
  const start=Number(p.hingeTopOffset)||100,end=Number(p.hingeBottomOffset)||100;
  const along=hinges===1?run/2:start+i*(run-start-end)/(hinges-1);
  const offset=(Number(p.hingeSideOffset)||21.5)*scale;
  const hx=horizontal?x+along*scale:(side==="B"?x+w-offset:x+offset);
  const hy=horizontal?(side==="C"?y+h-offset:y+offset):y+along*scale;
  marks+='<circle cx="'+hx+'" cy="'+hy+'" r="'+Math.max(5,dia*scale/2)+'" fill="none" stroke="#175b91" stroke-width="3"/>';
 }
 const edges=(p.edges||"None").split(",").filter(v=>v!=="None");
 const edgeLines={A:[x,y,x+w,y],B:[x+w,y,x+w,y+h],C:[x,y+h,x+w,y+h],D:[x,y,x,y+h]};
 edges.forEach(e=>{const v=edgeLines[e];if(v)marks+='<line x1="'+v[0]+'" y1="'+v[1]+'" x2="'+v[2]+'" y2="'+v[3]+'" stroke="#c62828" stroke-width="3" stroke-dasharray="5 5"/>';});
 return '<svg class="panel-svg" viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#e4d2ac" stroke="#111" stroke-width="3"/>'+marks+'<text x="'+(x+w/2)+'" y="'+(y-24)+'" text-anchor="middle" font-size="15" fill="#111">'+p.length+' mm</text><text x="'+(x+w+30)+'" y="'+(y+h/2)+'" transform="rotate(90 '+(x+w+30)+' '+(y+h/2)+')" text-anchor="middle" font-size="15" fill="#111">'+p.width+' mm</text><text x="'+(W/2)+'" y="'+(y+h+25)+'" text-anchor="middle" font-size="13" fill="#111">Grain: '+escapeHtml(p.grain||"—")+'</text></svg>';
}

$("printSchedule").addEventListener("click",()=>{
 if(!panels.length){alert("Add at least one panel first.");return;}
 const previous=document.querySelector(".schedule-report");if(previous)previous.remove();
 const project=projectData(),section=document.createElement("section");section.className="schedule-report";
 const rows=panels.map((p,i)=>{
  const hingeSide=p.hingeSide||"D";
  const hingeCount=Number(p.hinges)||0;
  const groove=(Number(p.grooveWidth)||0)>0?(p.grooveWidth+" × "+(p.grooveDepth||0)+" mm · "+(p.grooveReference||"—")+" "+(p.grooveOffset||0)+" mm"):"—";
  return '<tr><td>'+(i+1)+'</td><td><b>'+escapeHtml(p.id||"")+'</b><br>'+escapeHtml(p.name||"—")+'</td><td>'+escapeHtml(p.cabinet||"—")+'</td><td>'+p.length+' × '+p.width+' × '+p.thickness+' mm</td><td>'+p.quantity+'</td><td>'+escapeHtml(p.material||"—")+'<br>'+escapeHtml(p.colour||"—")+'</td><td>'+escapeHtml(p.grain||"—")+'</td><td>'+escapeHtml(p.edges||"None")+'<br>'+(p.edgeBandThickness||0.8)+' mm</td><td>'+hingeCount+' × Ø'+(p.hingeDia||35)+' mm<br>Side '+escapeHtml(hingeSide)+'</td><td>'+groove+'</td><td>'+escapeHtml(p.hardware||"—")+'</td><td>'+escapeHtml(p.notes||"—")+'</td></tr>';
 }).join("");
 const total=panels.reduce((n,p)=>n+(Number(p.quantity)||0),0);
 section.innerHTML='<header><h1>D3 Interior Designs — Panel Schedule</h1><p><b>Project:</b> '+escapeHtml(project.name||"Unnamed project")+' &nbsp; <b>Customer:</b> '+escapeHtml(project.customer||"—")+'<br><b>Date:</b> '+new Date().toLocaleDateString()+' &nbsp; <b>Panel types:</b> '+panels.length+' &nbsp; <b>Total pieces:</b> '+total+'</p></header><table class="schedule-table"><thead><tr><th>No.</th><th>Panel ID / Name</th><th>Cabinet</th><th>Size L × W × T</th><th>Qty</th><th>Material / Colour</th><th>Grain</th><th>Edge band</th><th>Hinge holes</th><th>Groove</th><th>Hardware</th><th>Notes</th></tr></thead><tbody>'+rows+'</tbody></table><footer>Generated by D3 SmartCut · All dimensions in mm · Verify measurements before production</footer>';
 document.body.appendChild(section);document.body.classList.add("printing-schedule");
 const cleanup=()=>{document.body.classList.remove("printing-schedule");section.remove();window.removeEventListener("afterprint",cleanup);};
 window.addEventListener("afterprint",cleanup,{once:true});window.print();setTimeout(cleanup,60000);
});

$("printDrawings").addEventListener("click",()=>{
 if(!panels.length){alert("Add at least one panel first.");return;}
 const data=projectData();
 const previous=document.querySelector(".drawings");if(previous)previous.remove();
 const section=document.createElement("section");section.className="drawings";
 section.innerHTML=panels.map(p=>'<article class="drawing-page"><p class="small-print">D3 INTERIOR DESIGNS · D3 SMARTCUT · '+escapeHtml(data.name||"UNNAMED PROJECT")+'</p><h1>'+escapeHtml(p.id)+' — '+escapeHtml(p.name)+'</h1><div class="drawing-meta"><div><b>Customer reference</b><br>'+escapeHtml(data.customer||"—")+'</div><div><b>Cabinet</b><br>'+escapeHtml(p.cabinet||"—")+'</div><div><b>Finished size</b><br>'+p.length+' × '+p.width+' × '+p.thickness+' mm</div><div><b>Quantity</b><br>'+p.quantity+'</div><div><b>Material / colour</b><br>'+escapeHtml(p.material||"—")+' / '+escapeHtml(p.colour||"—")+'</div><div><b>Grain</b><br>'+escapeHtml(p.grain||"—")+'</div><div><b>Edge band</b><br>'+escapeHtml(p.edges||"None")+' · '+(p.edgeBandThickness||0.8)+' mm</div></div>'+individualPanelSvg(p)+'<div class="drawing-notes"><b>Machining notes</b><br>Groove: '+(p.grooveWidth||0)+' mm wide × '+(p.grooveDepth||0)+' mm deep; offset: '+(p.grooveOffset||0)+' mm from '+escapeHtml(p.grooveReference||"Edge A")+'<br>Hinge cup holes: '+(p.hinges||0)+' × Ø'+(p.hingeDia||35)+' mm; side offset '+(p.hingeSideOffset||21.5)+' mm; top '+(p.hingeTopOffset||100)+' mm; bottom '+(p.hingeBottomOffset||100)+' mm<br>Hardware / accessories: '+escapeHtml(p.hardware||"—")+'<br>Additional notes: '+escapeHtml(p.notes||"—")+'<br><br><b>Workshop verification:</b> Confirm dimensions, datum edges, machining coordinates, hardware templates, tool sizes and workholding before manufacture.</div><p class="small-print">Planning drawing only — not a validated CNC toolpath. '+new Date().toLocaleDateString()+'</p></article>').join("");
 document.body.appendChild(section);document.body.classList.add("printing-drawings");
 const cleanup=()=>{document.body.classList.remove("printing-drawings");section.remove();window.removeEventListener("afterprint",cleanup);};
 window.addEventListener("afterprint",cleanup,{once:true});window.print();setTimeout(cleanup,60000);
});

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
 panels.forEach(p=>{for(let q=0;q<(Number(p.quantity)||1);q++)pieces.push({
  id:p.id,name:p.name,l:Number(p.length),w:Number(p.width),grain:p.grain,
  material:p.material||"Unspecified",colour:p.colour||"",thickness:p.thickness||18,
  edges:(p.edges||"None").split(",").filter(x=>x!=="None"),edgeBandThickness:p.edgeBandThickness||0.8,
  hinges:Number(p.hinges)||0,hingeDia:Number(p.hingeDia)||35,hingeSide:p.hingeSide||"D",hingeSideOffset:Number(p.hingeSideOffset)||21.5,
  hingeTopOffset:Number(p.hingeTopOffset)||100,hingeBottomOffset:Number(p.hingeBottomOffset)||100,hardware:p.hardware||"",
  grooveWidth:Number(p.grooveWidth)||0,grooveDepth:Number(p.grooveDepth)||0,
  grooveReference:p.grooveReference||"None",grooveOffset:Number(p.grooveOffset)||0,hardware:p.hardware||"",notes:p.notes||""
 });});
 pieces.sort((a,b)=>(a.material+"|"+a.colour+"|"+a.thickness).localeCompare(b.material+"|"+b.colour+"|"+b.thickness)||Math.max(b.l,b.w)-Math.max(a.l,a.w));
 const sheets=[];let groupKey="",groupSheets=[];
 for(const piece of pieces){
  const nextGroup=piece.material+"|"+piece.colour+"|"+piece.thickness;
  if(nextGroup!==groupKey){groupKey=nextGroup;groupSheets=[];}
  const opts=piece.grain==="Length"?[{l:piece.l,w:piece.w,rotated:false}]:piece.grain==="Width"?[{l:piece.w,w:piece.l,rotated:true}]:[{l:piece.l,w:piece.w,rotated:false},{l:piece.w,w:piece.l,rotated:true}];
  let placed=false;
  for(const sheet of groupSheets){
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
  const choice=opts.find(o=>o.l<=usableL&&o.w<=usableW);
  if(!choice)return {error:"Panel "+piece.id+" ("+piece.l+" × "+piece.w+" mm) cannot fit on the sheet with its grain direction and trim."};
  let sheet=groupSheets.find(s=>s.usedH+(s.rows.length?kerf:0)+choice.w<=usableW);
  if(!sheet){sheet={rows:[],usedH:0,material:piece.material,colour:piece.colour,thickness:piece.thickness};sheets.push(sheet);groupSheets.push(sheet);}
  const y=sheet.rows.length?sheet.usedH+kerf:0;
  sheet.rows.push({y,h:choice.w,x:choice.l,items:[{...piece,...choice,x:0,y}]});
  sheet.usedH=y+choice.w;
 }
 return {sheets,boardL,boardW,usableL,usableW,pieceCount:pieces.length,kerf,trim};
}
function rotateEdges(edges){
 const map={A:"B",B:"C",C:"D",D:"A"};
 return edges.map(e=>map[e]||e);
}
function sheetSvg(sheet,plan){
 const pad=48,scale=Math.min(900/plan.boardL,450/plan.boardW),w=plan.boardL*scale,h=plan.boardW*scale;
 const inset=(plan.boardL-plan.usableL)/2*scale,topInset=(plan.boardW-plan.usableW)/2*scale;
 const pieces=sheet.rows.flatMap(r=>r.items);
 const palette=["#d9f8a8","#c5f5e8","#d8edff","#f4e0ff","#ffe9bd","#d7f5d0"];
 const defs='<defs><pattern id="offcutHatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="12" stroke="#aaa" stroke-width="1.2"/></pattern></defs>';
 const marks=pieces.map((p,i)=>{
  const x=pad+inset+p.x*scale,y=pad+topInset+p.y*scale,pw=p.l*scale,ph=p.w*scale;
  const edges=p.rotated?rotateEdges(p.edges):p.edges;
  let detail='<rect x="'+x+'" y="'+y+'" width="'+pw+'" height="'+ph+'" fill="'+palette[i%palette.length]+'" stroke="#111" stroke-width="2"/> ';
  const line=(x1,y1,x2,y2)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#c62828" stroke-width="3" stroke-dasharray="5 5"/> ';
  if(edges.includes("A"))detail+=line(x,y,x+pw,y);
  if(edges.includes("B"))detail+=line(x+pw,y,x+pw,y+ph);
  if(edges.includes("C"))detail+=line(x,y+ph,x+pw,y+ph);
  if(edges.includes("D"))detail+=line(x,y,x,y+ph);
  if(p.hinges>0){
   const sm={A:"B",B:"C",C:"D",D:"A"},side=p.rotated?sm[p.hingeSide||"D"]:(p.hingeSide||"D");
   for(let j=0;j<p.hinges;j++){
    const horizontal=side==="A"||side==="C",run=horizontal?p.l:p.w;
    const start=p.hingeTopOffset||100,end=p.hingeBottomOffset||100;
    const along=p.hinges===1?run/2:start+j*(run-start-end)/(p.hinges-1),offset=p.hingeSideOffset*scale;
    const hx=horizontal?x+along*scale:(side==="B"?x+pw-offset:x+offset);
    const hy=horizontal?(side==="C"?y+ph-offset:y+offset):y+along*scale;
    detail+='<circle cx="'+hx+'" cy="'+hy+'" r="'+Math.max(2.2,p.hingeDia*scale/2)+'" fill="none" stroke="#075ca8" stroke-width="2.5"/>';
   }
  }
  detail+='<text x="'+(x+pw/2)+'" y="'+(y+ph/2-5)+'" text-anchor="middle" font-size="12" fill="#111">#'+escapeHtml(p.id)+'</text><text x="'+(x+pw/2)+'" y="'+(y+ph/2+11)+'" text-anchor="middle" font-size="10" fill="#111">'+p.l+' × '+p.w+'</text>';
  return detail;
 }).join("");
 const board='<rect x="'+pad+'" y="'+pad+'" width="'+w+'" height="'+h+'" fill="url(#offcutHatch)" stroke="#111" stroke-width="3"/>';
 const trimRect='<rect x="'+(pad+inset)+'" y="'+(pad+topInset)+'" width="'+plan.usableL*scale+'" height="'+plan.usableW*scale+'" fill="none" stroke="#777" stroke-width="1" stroke-dasharray="5 4"/>';
 const dims='<text x="'+(pad+w/2)+'" y="25" text-anchor="middle" font-size="16" font-weight="bold">'+plan.boardL+' mm</text><text x="17" y="'+(pad+h/2)+'" transform="rotate(-90 17 '+(pad+h/2)+')" text-anchor="middle" font-size="16" font-weight="bold">'+plan.boardW+' mm</text>';
 return '<svg class="sheet-svg" viewBox="0 0 '+(w+pad*2)+' '+(h+pad*2)+'" xmlns="http://www.w3.org/2000/svg">'+defs+board+trimRect+marks+dims+'</svg>';
}
function sheetSignature(sheet){
 return sheet.rows.flatMap(r=>r.items).map(p=>[
  Math.round(p.x),Math.round(p.y),Math.round(p.l),Math.round(p.w),p.grain,p.rotated,
  p.edges.join(","),p.edgeBandThickness,p.hinges,p.hingeDia,p.hingeSideOffset,p.hingeTopOffset,p.hingeBottomOffset
 ].join(":")).sort().join("|")+"#"+sheet.material+"#"+sheet.colour+"#"+sheet.thickness;
}
function edgeBandTotals(){
 const totals={"0.8":0,"2":0};
 panels.forEach(p=>{
  const sides=(p.edges||"None").split(",").filter(s=>s!=="None");
  const length=sides.reduce((n,s)=>n+((s==="A"||s==="C")?Number(p.length):Number(p.width)),0)*(Number(p.quantity)||1);
  const key=String(Number(p.edgeBandThickness)||0.8);totals[key]=(totals[key]||0)+length;
 });
 return totals;
}

$("printSheets").addEventListener("click",()=>{
 if(!panels.length){alert("Add at least one panel first.");return;}
 const plan=makeSheetPlan();if(plan.error){alert(plan.error);return;}
 const grouped=new Map();
 plan.sheets.forEach(sheet=>{const key=sheetSignature(sheet);if(!grouped.has(key))grouped.set(key,{sheet,count:0});grouped.get(key).count++;});
 const unique=[...grouped.values()],project=projectData();
 const totalArea=panels.reduce((n,p)=>n+Number(p.length)*Number(p.width)*(Number(p.quantity)||1),0);
 const sheetArea=plan.sheets.length*plan.boardL*plan.boardW;
 const edge=edgeBandTotals(),edgeTotal=(edge["0.8"]||0)+(edge["2"]||0);
 const rows=panels.map(p=>'<tr><td>'+escapeHtml(p.id)+' · '+escapeHtml(p.name)+'</td><td>'+p.length+' × '+p.width+' × '+p.thickness+'</td><td>'+p.quantity+'</td><td>'+escapeHtml(p.edges||"None")+'</td><td>'+escapeHtml(p.material||"—")+'</td></tr>').join("");
 const pages=unique.map((entry,i)=>{
  const count=entry.sheet.rows.reduce((n,r)=>n+r.items.length,0);
  return '<article class="sheet-page"><h2>Sheet '+(i+1)+' of '+unique.length+' · '+plan.boardL+' × '+plan.boardW+' mm</h2><p class="sheet-meta">Material: '+escapeHtml(entry.sheet.material)+' · Colour: '+escapeHtml(entry.sheet.colour||"—")+' · Thickness: '+entry.sheet.thickness+' mm · Print quantity: '+entry.count+'</p>'+sheetSvg(entry.sheet,plan)+'<p>'+count+' panels on this layout. Red dotted line: edge band · Blue circle: hinge hole · Hatched area: unused sheet area.</p></article>';
 }).join("");
 const section=document.createElement("section");section.className="sheet-report";
 section.innerHTML='<section class="summary-page"><h1>D3 Interior Designs — Final Sheet Layout</h1><p><b>Project:</b> '+escapeHtml(project.name||"Unnamed project")+' &nbsp; <b>Customer:</b> '+escapeHtml(project.customer||"—")+'<br><b>Date:</b> '+new Date().toLocaleDateString()+'</p><div class="sheet-summary"><div><b>'+plan.pieceCount+'</b><small>Total panel pieces</small></div><div><b>'+plan.sheets.length+'</b><small>Full sheets required</small></div><div><b>'+unique.length+'</b><small>Different layouts</small></div><div><b>'+(edgeTotal/1000).toFixed(2)+' m</b><small>Edge band total</small></div><div><b>'+(totalArea/1000000).toFixed(2)+' m²</b><small>Panel area</small></div><div><b>'+Math.max(0,100*(sheetArea-totalArea)/Math.max(1,sheetArea)).toFixed(1)+'%</b><small>Estimated waste area</small></div></div><h3>Panel list</h3><table><thead><tr><th>Panel</th><th>Length × Width × Thickness (mm)</th><th>Qty</th><th>Edge band</th><th>Material</th></tr></thead><tbody>'+rows+'</tbody></table><p>Check all dimensions, grain direction, trim and kerf before cutting. Layout is a planning aid and should be verified at the machine.</p></section>'+pages;
 document.body.appendChild(section);document.body.classList.add("printing-sheets");
 const cleanup=()=>{document.body.classList.remove("printing-sheets");section.remove();window.removeEventListener("afterprint",cleanup);};
 window.addEventListener("afterprint",cleanup,{once:true});window.print();setTimeout(cleanup,60000);
});
