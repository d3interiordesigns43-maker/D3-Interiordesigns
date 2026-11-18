/* D3 SmartCut panel-saw optimiser.
   Guillotine-style heuristic: practical planning aid, not a machine-specific cut program. */
(function(global){
  "use strict";
  function optimise(input){
    const kerf=Math.max(0,Number(input.kerf)||0);
    const trim=Math.max(0,Number(input.trim)||0);
    const stockL=Number(input.boardLength), stockW=Number(input.boardWidth);
    const maxSheets=Math.max(0,Math.floor(Number(input.stockQty)||0));
    if(!(stockL>0&&stockW>0)) throw new Error("Enter valid stock sheet dimensions.");
    if(stockL<=2*trim||stockW<=2*trim) throw new Error("Trim allowance is too large for this stock sheet.");
    const usableL=stockL-2*trim, usableW=stockW-2*trim;
    const groups=new Map();
    (input.panels||[]).forEach((p,pi)=>{
      const qty=Math.max(0,Math.floor(Number(p.quantity)||0));
      const e=Array.isArray(p.edgeSides)?p.edgeSides:[];
      const tape=Math.max(0,Number(p.edgeThickness)||0);
      const L=Number(p.length)-((e.includes("B")?tape:0)+(e.includes("D")?tape:0));
      const W=Number(p.width)-((e.includes("A")?tape:0)+(e.includes("C")?tape:0));
      if(!(L>0&&W>0&&Number(p.thickness)>0)) throw new Error("Invalid core size or thickness for "+(p.name||p.id||"panel")+".");
      const material=String(p.material||"Unspecified").trim()||"Unspecified";
      const key=material+"|"+Number(p.thickness);
      if(!groups.has(key))groups.set(key,{key,material,thickness:Number(p.thickness),parts:[]});
      for(let q=0;q<qty;q++) groups.get(key).parts.push({id:p.id||"PN-"+(pi+1),name:p.name||"Panel",material,thickness:Number(p.thickness),length:L,width:W,grain:p.grain||"No restriction",edgeSides:e.join(""),sourceIndex:pi,copy:q+1});
    });
    const sheets=[]; const unplaced=[];
    for(const group of groups.values()){
      group.parts.sort((a,b)=>Math.max(b.length,b.width)-Math.max(a.length,a.width)||b.length*b.width-a.length*a.width);
      for(const part of group.parts){
        let best=null;
        for(let si=0;si<sheets.length;si++){
          const sh=sheets[si]; if(sh.groupKey!==group.key)continue;
          for(let fi=0;fi<sh.free.length;fi++){
            const f=sh.free[fi];
            const orientations=[{w:part.length,h:part.width,rotated:false}];
            if(part.grain==="No restriction"&&Math.abs(part.length-part.width)>0.001)orientations.push({w:part.width,h:part.length,rotated:true});
            for(const o of orientations){
              const needW=o.w+(kerf>0?kerf:0), needH=o.h+(kerf>0?kerf:0);
              if(needW<=f.w+0.001&&needH<=f.h+0.001){
                const dw=f.w-needW,dh=f.h-needH,score=Math.min(dw,dh)*100000+Math.max(dw,dh);
                if(!best||score<best.score)best={sheetIndex:si,freeIndex:fi,orientation:o,score,needW,needH};
              }
            }
          }
        }
        if(!best){
          if(maxSheets>0&&sheets.length>=maxSheets){unplaced.push(part);continue;}
          const sh={number:sheets.length+1,groupKey:group.key,material:group.material,thickness:group.thickness,stockLength:stockL,stockWidth:stockW,usableLength:usableL,usableWidth:usableW,free:[{x:0,y:0,w:usableL,h:usableW}],placements:[]};
          sheets.push(sh);
          const f=sh.free[0],orientations=[{w:part.length,h:part.width,rotated:false}];
          if(part.grain==="No restriction"&&Math.abs(part.length-part.width)>0.001)orientations.push({w:part.width,h:part.length,rotated:true});
          const fits=orientations.filter(o=>o.w+(kerf>0?kerf:0)<=f.w+0.001&&o.h+(kerf>0?kerf:0)<=f.h+0.001).sort((a,b)=>(f.w-a.w)*(f.h-a.h)-(f.w-b.w)*(f.h-b.h));
          if(!fits.length){sheets.pop();unplaced.push(part);continue;}
          best={sheetIndex:sheets.length-1,freeIndex:0,orientation:fits[0],needW:fits[0].w+(kerf>0?kerf:0),needH:fits[0].h+(kerf>0?kerf:0)};
        }
        const sh=sheets[best.sheetIndex], f=sh.free.splice(best.freeIndex,1)[0],o=best.orientation;
        sh.placements.push({...part,x:f.x,y:f.y,cutLength:o.w,cutWidth:o.h,rotated:o.rotated});
        const rightW=f.w-best.needW,bottomH=f.h-best.needH;
        // Guillotine split into two non-overlapping residual rectangles.
        if(rightW>0.5)sh.free.push({x:f.x+best.needW,y:f.y,w:rightW,h:f.h});
        if(bottomH>0.5)sh.free.push({x:f.x,y:f.y+best.needH,w:best.needW,h:bottomH});
      }
    }
    const partArea=sheets.reduce((n,s)=>n+s.placements.reduce((a,p)=>a+p.length*p.width,0),0);
    const stockArea=sheets.length*usableL*usableW;
    const freeArea=sheets.reduce((n,s)=>n+s.free.reduce((a,r)=>a+r.w*r.h,0),0);
    const cutLength=sheets.reduce((n,s)=>n+s.placements.reduce((a,p)=>a+2*(p.cutLength+p.cutWidth),0),0);
    const cutCount=sheets.reduce((n,s)=>n+s.placements.length*2,0);
    return {sheets,unplaced,stats:{sheetsUsed:sheets.length,partsPlaced:sheets.reduce((n,s)=>n+s.placements.length,0),partsUnplaced:unplaced.length,partArea,usableStockArea:stockArea,offcutArea:freeArea,utilisation:stockArea?partArea/stockArea*100:0,cutLength,cutCount},settings:{kerf,trim,stockLength:stockL,stockWidth:stockW,usableLength:usableL,usableWidth:usableW}};
  }
  global.D3SmartCutOptimizer={optimise};
})(window);
