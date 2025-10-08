const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        slowMo: 50,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--ignore-certificate-errors'],
        ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 800 });

    await page.goto('https://reg.exam.dtu.ac.in', { waitUntil: 'networkidle2', timeout: 0 });

    await page.waitForSelector('input[name="roll_no"]', { visible: true });
    await page.waitForSelector('input[name="password"]', {visible :true});

    await page.type('input[name="roll_no"]', `${process.env.ROLL_NUMBER}`, {delay: 100});
    await page.type('input[name="password"]', process.env.PASSWORD, {delay: 100});

    await page.click('button[type="submit"]');

    await page.waitForSelector('a h3', { visible: true, timeout: 60000 });

    const pageTitle = await page.title();
    console.log('page title:', pageTitle);

    const admitCardUrl = await page.evaluate(() => {
        const link = document.querySelector('a h3');
        return link ? link.parentElement.href : null;
    });
    
    const newPage = await browser.newPage();
    await newPage.setViewport({ width: 1400, height: 800 });
    await newPage.goto(admitCardUrl, {waitUntil : 'networkidle2', timeout: 0});

    await newPage.pdf({ path: `${process.env.ADMIT_DOWNLOAD_PATH}`, format: 'A4' , printBackground: true});
    const data = await page.evaluate(() => {
        const title = document.title;
        const links = Array.from(document.querySelectorAll("a")).map((a) => a.href);
        return { title, links };
    });

  console.log(data);

  await browser.close();
})();