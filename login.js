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

(async () => {
    const  {host, username: expectedUsername, password} =  verifyInput();

    const browser = await puppeteer.launch({
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
    const firstUserSelector = 'div.qx-bj-wizard-list-item-first';
    const userName = await page.waitForSelector(firstUserSelector)
        .then(x => x.getProperty('innerText').then(x => x.jsonValue()));
    console.log(`Found user entries and first user: ${userName} (expected: ${expectedUsername})`)

    if (!userName.endsWith(expectedUsername)) throw "Username is not as expected"

    await page.click(firstUserSelector);
    console.log(`Clicked user ${userName} element`)


    await page.waitForSelector(`${firstUserSelector} input`);
    console.log(`Found input field for user`)

    await page.click(`${firstUserSelector} input`);
    await page.keyboard.type(password, {delay: 10});
    console.log(`Filled in password for user`)


    await page.click('div.qx-bj-wizard-sep-button-last', {delay: 2000});


    await page.waitForTimeout(2000)
    await page.waitForSelector('.qx-bj-switching', {timeout: 3000})

    const successful = await page.$('.qx-bj-switching');

    await browser.close();
    if (successful) {
        console.log('Test successful');
    } else {
        throw 'Test not successful';
    }
})();
