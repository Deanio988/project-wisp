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
