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
