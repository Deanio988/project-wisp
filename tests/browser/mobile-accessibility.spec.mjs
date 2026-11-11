import {test,expect} from "@playwright/test";
const base="http://127.0.0.1:8765/preview/";
test.use({hasTouch:true});
test("mobile sanctuary works with touch and screen reader labels",async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto(base);
 await expect(page.getByRole("main")).toBeVisible();
 await expect(page.getByRole("region",{name:"Egg sanctuary"})).toBeVisible();
 await expect(page.locator("[data-care]")).toHaveCount(8);
 await page.locator('[data-care="warm"]').tap();
 await expect(page.locator("#journal details")).toHaveCount(5);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});
test("artwork fallback is available before hatch",async({page})=>{
 await page.goto(base);
 await expect(page.locator("#art")).toBeVisible();
 await expect(page.locator("#creature-sprite")).toBeHidden();
 const response=await page.request.get("http://127.0.0.1:8765/assets/living-egg.svg");
 expect(response.ok()).toBeTruthy();
});

test("mobile entry redirects into the real sanctuary without an iframe",async({page})=>{
 await page.goto("http://127.0.0.1:8765/preview/mobile.html");
 await expect(page).toHaveURL(/\/preview\/$/);
 await expect(page.locator("[data-care]")).toHaveCount(8);
 await expect(page.locator("iframe")).toHaveCount(0);
});

test("preview clearly identifies pending artwork and keeps header in viewport",async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto("http://127.0.0.1:8765/preview/");
 await expect(page.getByText(/Pixel artwork installed/)).toBeVisible();
 const header=await page.locator("header").boundingBox();
 expect(header).not.toBeNull();
 expect(header.x).toBeGreaterThanOrEqual(0);
 expect(header.x+header.width).toBeLessThanOrEqual(321);
});

test("four neutral egg-stage assets load at their intended dimensions",async({page})=>{
 await page.goto("http://127.0.0.1:8765/preview/");
 for(const stage of ["dormant","awakening","forming","emergence"]){
  const result=await page.evaluate(async stage=>{
   const {eggArtPath}=await import("/preview/egg-art.mjs");
   const img=new Image();img.src=eggArtPath(stage);
   await img.decode();
   return {width:img.naturalWidth,height:img.naturalHeight,src:img.src};
  },stage);
  expect(result.width).toBe(96);
  expect(result.height).toBe(96);
  expect(result.src).toContain("neutral_egg_"+stage+".png");
  expect(result.src).not.toMatch(/mossling|glimlet|mistril|pebblin/);
 }
});

test("care does not reset egg image and hatching visibly animates",async({page})=>{
 await page.goto("http://127.0.0.1:8765/preview/");
 await expect.poll(()=>page.locator("#art").evaluate(i=>i.complete&&i.naturalWidth===96)).toBe(true);
 const before=await page.locator("#art").getAttribute("src");
 await page.locator('[data-care="warm"]').click();
 const after=await page.locator("#art").getAttribute("src");
 if(await page.locator("#stage").innerText()==="Dormant")expect(after).toBe(before);
 await page.evaluate(async()=>{
  const {createEgg,applyCare}=await import("/simulation/egg-engine.mjs");
  let egg=createEgg(8);const actions=["warm","sing","rest","explore","play","story","observe","comfort"];
  for(let i=0;i<500&&egg.hatch.status==="incubating";i++)egg=applyCare(egg,actions[i%actions.length]);
  localStorage.setItem("project-wisp-egg-preview-v2",JSON.stringify(egg));
 });
 await page.reload();
 await expect(page.locator(".scene")).toHaveAttribute("data-stage","hatching",{timeout:1500});
 const anim=await page.locator("#art").evaluate(el=>getComputedStyle(el).animationName);
 expect(anim).toContain("hatch-reveal");
 await expect(page.locator(".scene")).toHaveAttribute("data-stage","hatched",{timeout:6000});
 await expect(page.locator("#art")).toBeHidden();
 await expect(page.locator("#creature-sprite")).toBeVisible();
});

test("sanctuary theme renders pixel-crisp artwork and accessible controls",async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto("http://127.0.0.1:8765/preview/");
 const style=await page.locator("#art").evaluate(el=>({pixel:getComputedStyle(el).imageRendering,width:el.getBoundingClientRect().width}));
 expect(["pixelated","crisp-edges"]).toContain(style.pixel);
 expect(style.width).toBeLessThanOrEqual(306);
 const controls=await page.locator("[data-care]").evaluateAll(els=>els.map(e=>e.getBoundingClientRect().height));
 expect(controls.every(h=>h>=48)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test("egg stage transitions never flash old SVG",async({page})=>{
 await page.goto(base);
 await expect.poll(()=>page.locator("#art").evaluate(i=>i.naturalWidth)).toBe(96);
 await page.evaluate(()=>{
  window.__eggSources=[];
  new MutationObserver(()=>window.__eggSources.push(document.querySelector("#art").getAttribute("src"))).observe(document.querySelector("#art"),{attributes:true,attributeFilter:["src"]});
 });
 for(let i=0;i<40;i++)await page.locator('[data-care="warm"]').click().catch(()=>{});
 const sources=await page.evaluate(()=>window.__eggSources);
 expect(sources).not.toContain("../assets/living-egg.svg");
});
test("PixelFX exported metadata and transparent sheet are available",async({page})=>{
 await page.goto(base);
 const data=await page.request.get("/preview/art/effects/spawn/egg-hatch/egg-hatch.json");
 expect(data.ok()).toBe(true);
 const json=await data.json();
 expect(json.frames.length).toBeGreaterThan(60);
 const sheet=await page.request.get("/preview/art/effects/spawn/egg-hatch/egg-hatch.png");
 expect(sheet.ok()).toBe(true);
});
