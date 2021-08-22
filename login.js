const puppeteer = require('puppeteer');

const verifyInput = () => {
    const host = process.env.HOST;
    console.log("Using host:", host);
    if (!host) throw "No environment variable HOST has been set"

    const username = process.env.USERNAME;
    console.log("Using username", username);
    if (!username) throw "No environment variable USERNAME has been set"

    const password = process.env.PASSWORD;
    console.log("Using password", "*".repeat(password.length));
    if (!password) throw "No environment variable PASSWORD has been set"

    return {host, username, password}
};

const takeScreenshot = async (page, name) => {
    await page.screenshot({
        path: "./screenshots/" + name + ".jpg",
        type: "jpeg",
        fullPage: true
    });
};

(async () => {
    const {host, username: expectedUsername, password} = verifyInput();

    const browser = await puppeteer.launch({
        // executablePath: '/usr/bin/chromium',
        defaultViewport: {width: 680, height: 420},
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(10000)

    console.log(`Browsing to ${host}`)
    await page.goto(host, {waitUntil: "networkidle2"});

    await page.waitForTimeout(2000)
    await takeScreenshot(page, "01.loaded");
    const firstUserSelector = 'div.qx-bj-wizard-list-item-first';
    const userName = await page.waitForSelector(firstUserSelector)
        .then(x => x.getProperty('innerText').then(x => x.jsonValue()));
    console.log(`Found user entries and first user: ${userName} (expected: ${expectedUsername})`)

    if (!userName.endsWith(expectedUsername)) throw "Username is not as expected"

    //Check if pop-up
    try {

        await page.waitForSelector('div.qx-android-dialog', {timeout: 500})
        await takeScreenshot(page, "01x.compatibility-issues");
        await page.click('div.qx-android-dialog > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div')
        console.log("Clicked OK to close popup")
    } catch (e) {
        console.log("No popup saying element doesn't exist, yay")
    }

    const mfg = await page.$x(`//div[text()="${expectedUsername}"]`);
    const prop = await mfg[0].getProperty('innerText');
    const text = await prop.jsonValue();
    console.log(text);
    console.log(text);
    console.log(text);

    const textCoords = await mfg[0].boundingBox()

    console.log(`Coordinates: ${textCoords}`, textCoords);
    let mySelector=firstUserSelector;
    const myObject = await page.$(mySelector)
    // const coOrdinates = await myObject.boundingBox()
    const coOrdinates = textCoords
    console.log(`Coordinates: ${coOrdinates}`, coOrdinates);
    await page.mouse.click( coOrdinates.x+coOrdinates.width/2 , coOrdinates.y+coOrdinates.height/2 )
    // await page.click(firstUserSelector);
    console.log(`Clicked user "${userName}" element`)


    try {
        await page.waitForSelector(`${firstUserSelector} input`);
        await takeScreenshot(page, "02.user-selection");
        console.log(`Found input field for user`)
        // console.log(await page.content());
    } catch (e) {
        console.log("couldn't find input")
        await takeScreenshot(page, "02x.user-selection-failed");
        console.log(await page.content());
        throw e
    }

    await page.waitForTimeout(3000)
    await page.click(`${firstUserSelector} input`);
    await page.keyboard.type(password, {delay: 10});
    console.log(`Filled in password for user`)

    await takeScreenshot(page, "03.passwod-filled");

    await page.click('div.qx-bj-wizard-sep-button-last', {delay: 2000});


    await page.waitForTimeout(2000)
    await page.waitForSelector('.qx-bj-switching', {timeout: 3000})

    await takeScreenshot(page, "04.logged-in");

    const successful = await page.$('.qx-bj-switching');

    await takeScreenshot(page, "05.really-logged-in");

    await browser.close();
    if (successful) {
        console.log('Test successful');
    } else {
        throw 'Test not successful';
    }
})();
