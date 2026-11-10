import { test, expect, chromium, devices } from "playwright/test";
const base="http://127.0.0.1:8765/preview/";
const cases=[{name:"desktop",viewport:{width:1280,height:800}},{name:"mobile",viewport:{width:390,height:844}}];
for(const device of cases){
 test.describe(device.name,()=>{
  test.use({viewport:device.viewport});
  test("loads eight interactions and journal",async({page})=>{
   await page.goto(base);
   await expect(page.locator("[data-care]")).toHaveCount(8);
   await expect(page.locator("#journal details")).toHaveCount(5);
   await expect(page.locator("#stage")).toHaveText("Dormant");
   await expect(page.locator("#art")).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBeTruthy();
  });
  test("care progresses and survives reload",async({page})=>{
   await page.goto(base);
   for(const action of ["warm","sing","rest","explore","play","story","observe","comfort"])await page.locator('[data-care="'+action+'"]').click();
   await expect(page.locator("#stage")).not.toHaveText("Dormant");
   const stage=await page.locator("#stage").innerText();
   await page.reload();
   await expect(page.locator("#stage")).toHaveText(stage);
   await expect(page.locator("#journal details")).toHaveCount(5);
  });
  test("all four families automatically hatch after reloading a ready egg",async({page})=>{
   for(const family of ["mossling","glimlet","mistril","pebblin"]){
    await page.goto(base);
    const seed=0;
    await page.evaluate(async ({seed,family})=>{
     const {createEgg,applyCare}=await import("/simulation/egg-engine.mjs");
     const actions=["warm","sing","rest","explore","play","story","observe","comfort"];
     let egg=null;
     for(let candidate=seed;candidate<3000;candidate++){
      let next=createEgg(candidate);
      for(let i=0;i<500&&next.hatch.status==="incubating";i++)next=applyCare(next,actions[i%actions.length]);
      if(next.hatch.status==="ready"&&next.hatch.family===family){egg=next;break}
     }
     if(!egg)throw Error("No viable egg found for "+family);
     // The UI reveal must reflect the actual family determined by genetics and care.
     localStorage.setItem("project-wisp-egg-preview-v2",JSON.stringify(egg));
    },{seed,family});
    await page.reload();
    await expect(page.locator(".scene")).toHaveAttribute("data-stage","hatched",{timeout:6000});
    const displayed=await page.locator(".scene").getAttribute("data-family");
    expect(displayed).toBe(family);
    await page.reload();
    await expect(page.locator(".scene")).toHaveAttribute("data-stage","hatched");
   }
  });
  test("recovery from interrupted hatching",async({page})=>{
   await page.goto(base);
   await page.evaluate(async()=>{
    const {createEgg,applyCare,beginHatch}=await import("/simulation/egg-engine.mjs");
    let egg=createEgg(8);const actions=["warm","sing","rest","explore","play","story","observe","comfort"];
    for(let i=0;i<500&&egg.hatch.status==="incubating";i++)egg=applyCare(egg,actions[i%actions.length]);
    localStorage.setItem("project-wisp-egg-preview-v2",JSON.stringify(beginHatch(egg)));
   });
   await page.reload();
   await expect(page.locator(".scene")).toHaveAttribute("data-stage","hatched",{timeout:6000});
  });
  test("reset produces new dormant egg",async({page})=>{
   await page.goto(base);
   page.once("dialog",dialog=>dialog.accept());
   await page.locator("#reset").click();
   await expect(page.locator("#stage")).toHaveText("Dormant");
  });
 });
}
test("reduced motion skips cinematic",async({browser})=>{
 const context=await browser.newContext({reducedMotion:"reduce"});
 const page=await context.newPage();await page.goto(base);
 await page.evaluate(async()=>{
  const {createEgg,applyCare}=await import("/simulation/egg-engine.mjs");
  let egg=createEgg(9);const actions=["warm","sing","rest","explore","play","story","observe","comfort"];
  for(let i=0;i<500&&egg.hatch.status==="incubating";i++)egg=applyCare(egg,actions[i%actions.length]);
  localStorage.setItem("project-wisp-egg-preview-v2",JSON.stringify(egg));
 });
 await page.reload();
 await expect(page.locator(".scene")).toHaveAttribute("data-stage","hatched",{timeout:2000});
 await context.close();
});

test("legacy save import copies progress without changing original",async({page})=>{
 await page.goto(base);
 const legacy={warmth:72,trust:66,hatched:true,traits:{curiosity:12,affection:9},name:"Mossling"};
 await page.evaluate(value=>localStorage.setItem("project-wisp-v1",JSON.stringify(value)),legacy);
 page.once("dialog",dialog=>dialog.accept());
 await page.locator("#import-legacy").click();
 await expect(page.locator(".scene")).toHaveAttribute("data-stage","hatched");
 const saves=await page.evaluate(()=>({
  original:JSON.parse(localStorage.getItem("project-wisp-v1")),
  imported:JSON.parse(localStorage.getItem("project-wisp-egg-preview-v2"))
 }));
 expect(saves.original).toEqual(legacy);
 expect(saves.imported.hatch.birthRecord.legacy).toBe(true);
 expect(saves.imported.needs.comfort).toBe(72);
 expect(saves.imported.needs.security).toBe(66);
 await page.reload();
 await expect(page.locator(".scene")).toHaveAttribute("data-stage","hatched");
});
test("legacy import cancellation leaves both saves unchanged",async({page})=>{
 await page.goto(base);
 const before=await page.evaluate(()=>localStorage.getItem("project-wisp-egg-preview-v2"));
 await page.evaluate(()=>localStorage.setItem("project-wisp-v1",JSON.stringify({hatched:true})));
 page.once("dialog",dialog=>dialog.dismiss());
 await page.locator("#import-legacy").click();
 expect(await page.evaluate(()=>localStorage.getItem("project-wisp-egg-preview-v2"))).toBe(before);
});
