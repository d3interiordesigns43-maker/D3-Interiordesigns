const $=id=>document.getElementById(id);
const STORE_KEY="d3-smartcut-project-v1";
let panels=[];
function projectData(){return{name:$("projectName").value.trim(),customer:$("customer").value.trim(),projectNotes:$("projectNotes").value.trim(),boardLength:+$("boardLength").value||2440,boardWidth:+$("boardWidth").value||1220,kerf:+$("kerf").value||0,trim:+$("trim").value||0,units:"mm",panels,updatedAt:new Date().toISOString()};}
function loadProject(){try{const d=JSON.parse(localStorage.getItem(STORE_KEY)||localStorage.getItem("d3-smartcut-project-v2")||"null");if(!d)return;$("projectName").value=d.name||"";$("customer").value=d.customer||"";$("projectNotes").value=d.projectNotes||"";$("boardLength").value=d.boardLength||2440;$("boardWidth").value=d.boardWidth||1220;$("kerf").value=d.kerf??4;$("trim").value=d.trim??10;panels=Array.isArray(d.panels)?d.panels.map(p=>({...p,edges:p.edges||(Array.isArray(p.edgeSides)&&p.edgeSides.length?p.edgeSides.join(","):"None")})):[];render();}catch(e){console.warn("Could not load saved project",e);}}
function saveProject(){try{localStorage.setItem(STORE_KEY,JSON.stringify(projectData()));$("saveStatus").textContent="Saved on this device at "+new Date().toLocaleTimeString()+". This does not sync to other devices."; }catch(e){$("saveStatus").textContent="Could not save. Export a JSON backup and check device storage.";}}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){ const totalPieces=panels.reduce((n,p)=>n+(Number(p.quantity)||1),0);$("panelCount").textContent=totalPieces+" pieces · "+panels.length+" panel types";$("panelList").innerHTML=panels.length?panels.map((p,i)=>'<div class="panel-row"><div><strong>'+escapeHtml(p.id)+" · "+escapeHtml(p.name)+'</strong><small>'+p.length+' × '+p.width+' × '+p.thickness+' mm · Qty '+p.quantity+' · '+escapeHtml(p.material||"Material not set")+'</small></div><button class="delete" data-remove="'+i+'" aria-label="Delete '+escapeHtml(p.id)+'">Delete</button></div>').join(""):'<p class="empty">No panels yet. Add your first panel above.</p>'; }
$("panelForm").addEventListener("submit",e=>{e.preventDefault();const p={id:"PN-"+String(panels.length+1).padStart(3,"0"),name:$("panelName").value.trim(),cabinet:$("cabinet").value.trim(),length:+$("length").value,width:+$("width").value,thickness:+$("thickness").value,quantity:+$("quantity").value,material:$("material").value.trim(),colour:$("colour").value.trim(),grain:$("grain").value,edges:$("edges").value,edgeBandThickness:+$("edgeBandThickness").value,grooveWidth:+$("grooveWidth").value,grooveDepth:+$("grooveDepth").value,grooveReference:$("grooveReference").value,grooveOffset:+$("grooveOffset").value,hinges:+$("hinges").value,hingeDia:+$("hingeDia").value,hingeSide:$("hingeSide").value,hingeSideOffset:+$("hingeSideOffset").value,hingeTopOffset:+$("hingeTopOffset").value,hingeBottomOffset:+$("hingeBottomOffset").value,hardware:$("hardware").value.trim(),notes:$("notes").value.trim()};if(!p.length||!p.width||!p.thickness||!p.quantity)return;panels.push(p);render();saveProject();e.target.reset();$("thickness").value=18;$("quantity").value=1;$("hingeDia").value=35;$("hingeSide").value="D";$("hingeSideOffset").value=21.5;$("hingeTopOffset").value=100;$("hingeBottomOffset").value=100;$("grooveReference").value="None";$("edgeBandThickness").value="0.8";$("edges").value="None";});
$("panelList").addEventListener("click",e=>{const b=e.target.closest("[data-remove]");if(!b)return;panels.splice(+b.dataset.remove,1);panels.forEach((p,i)=>p.id="PN-"+String(i+1).padStart(3,"0"));render();saveProject();});
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
 return '<svg class="panel-svg" viewBox="0 0 640 420" xmlns="http://www.w3.org/2000/svg"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="#e4d2ac" stroke="#111" stroke-width="3"/>'+marks+'<text x="'+(W/2)+'" y="'+(y-16)+'" text-anchor="middle" font-size="15" fill="#111">'+p.length+' mm</text><text x="'+(x+w+15)+'" y="'+(H/2)+'" transform="rotate(90 '+(x+w+15)+' '+(H/2)+')" text-anchor="middle" font-size="15" fill="#111">'+p.width+' mm</text><text x="'+(W/2)+'" y="'+(y+h+25)+'" text-anchor="middle" font-size="13" fill="#111">Grain: '+escapeHtml(p.grain||"—")+'</text></svg>';
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
 const pad=34,scale=Math.min(900/plan.boardL,450/plan.boardW),w=plan.boardL*scale,h=plan.boardW*scale;
 const inset=(plan.boardL-plan.usableL)/2*scale,topInset=(plan.boardW-plan.usableW)/2*scale;
 const pieces=sheet.rows.flatMap(r=>r.items);
 const marks=pieces.map(p=>{
  const x=pad+inset+p.x*scale,y=pad+topInset+p.y*scale,pw=p.l*scale,ph=p.w*scale;
  const edges=p.rotated?rotateEdges(p.edges):p.edges;
  let detail='<rect x="'+x+'" y="'+y+'" width="'+pw+'" height="'+ph+'" fill="none" stroke="#111" stroke-width="1.8"/> ';
  const line=(x1,y1,x2,y2)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#c62828" stroke-width="3" stroke-dasharray="5 5"/> ';
  if(edges.includes("A")){detail+=line(x,y,x+pw,y);}
  if(edges.includes("B")){detail+=line(x+pw,y,x+pw,y+ph);}
  if(edges.includes("C")){detail+=line(x,y+ph,x+pw,y+ph);}
  if(edges.includes("D")){detail+=line(x,y,x,y+ph);}
  if(p.hinges>0){
   const sm={A:"B",B:"C",C:"D",D:"A"},side=p.rotated?sm[p.hingeSide||"D"]:(p.hingeSide||"D");
   for(let i=0;i<p.hinges;i++){
    const horizontal=side==="A"||side==="C",run=horizontal?p.l:p.w;
    const start=p.hingeTopOffset||100,end=p.hingeBottomOffset||100;
    const along=p.hinges===1?run/2:start+i*(run-start-end)/(p.hinges-1),offset=p.hingeSideOffset*scale;
    const hx=horizontal?x+along*scale:(side==="B"?x+pw-offset:x+offset);
    const hy=horizontal?(side==="C"?y+ph-offset:y+offset):y+along*scale;
    const radius=Math.max(2.2,p.hingeDia*scale/2);
    detail+='<circle cx="'+hx+'" cy="'+hy+'" r="'+radius+'" fill="none" stroke="#075ca8" stroke-width="2.5"/><circle cx="'+hx+'" cy="'+hy+'" r="1.8" fill="#075ca8"/>';
   }
  }
  if(p.grain==="No restriction")detail+='<text x="'+(x+pw/2)+'" y="'+(y+ph/2+4)+'" text-anchor="middle" font-size="10" fill="#444">NO GRAIN</text>';
  else{
   const horizontal=(p.grain==="Length"&&!p.rotated)||(p.grain==="Width"&&p.rotated);
   const x1=horizontal?x+pw*.28:x+pw/2,y1=horizontal?y+ph/2:y+ph*.28;
   const x2=horizontal?x+pw*.72:x+pw/2,y2=horizontal?y+ph/2:y+ph*.72;
   detail+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#16803c" stroke-width="2.5"/>';
   if(horizontal)detail+='<path d="M '+(x2-7)+' '+(y2-5)+' L '+x2+' '+y2+' L '+(x2-7)+' '+(y2+5)+'" fill="none" stroke="#16803c" stroke-width="2.5"/>';
   else detail+='<path d="M '+(x2-5)+' '+(y2-7)+' L '+x2+' '+y2+' L '+(x2+5)+' '+(y2-7)+'" fill="none" stroke="#16803c" stroke-width="2.5"/>';
  }
  detail+='<text x="'+(x+pw/2)+'" y="'+(y+ph/2-5)+'" text-anchor="middle" font-size="11" fill="#111">'+escapeHtml(p.id)+'</text><text x="'+(x+pw/2)+'" y="'+(y+ph/2+10)+'" text-anchor="middle" font-size="9" fill="#111">'+p.l+' × '+p.w+'</text>';
  return detail;
 }).join("");
 return '<svg class="sheet-svg" viewBox="0 0 '+(w+pad*2)+' '+(h+pad*2)+'" xmlns="http://www.w3.org/2000/svg"><rect x="'+pad+'" y="'+pad+'" width="'+w+'" height="'+h+'" fill="#fff" stroke="#111" stroke-width="2"/>'+marks+'</svg>';
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
