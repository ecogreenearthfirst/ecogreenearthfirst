import{test, expect}from '@playwright/test';
//syntax 
/*test("title", ()=>{
step1
step2
step3


});*/
//fixure: global variable  : page, browser. 
test("verify page title", async({page})=>{
    await page.goto('https://automationpractice.techwithjatin.com/')
   
    let title:string=await page.title();
    console.log("title:",title)
    
    await expect(page).toHaveTitle("Automation Practice")

} );