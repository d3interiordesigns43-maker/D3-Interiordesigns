const menuButton=document.querySelector(".menu-toggle");
const siteNav=document.querySelector("#site-nav");
if(menuButton&&siteNav){
  const closeMenu=()=>{document.querySelector(".nav")?.classList.remove("menu-open");menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","Open navigation menu");};
  menuButton.addEventListener("click",()=>{const open=menuButton.getAttribute("aria-expanded")!=="true";document.querySelector(".nav").classList.toggle("menu-open",open);menuButton.setAttribute("aria-expanded",String(open));menuButton.setAttribute("aria-label",open?"Close navigation menu":"Open navigation menu");});
  siteNav.querySelectorAll("a").forEach(link=>link.addEventListener("click",closeMenu));
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeMenu();});
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{const el=document.querySelector(a.getAttribute("href"));if(el){e.preventDefault();el.scrollIntoView({behavior:"smooth"});}}));
