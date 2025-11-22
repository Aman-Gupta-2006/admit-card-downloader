const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
dotenv.config();

const subjectFacultyMap = JSON.parse(process.env.SUBJECT_FACULTY_MAP);
console.log("Subject-Faculty Map:", subjectFacultyMap);

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        slowMo: 5,
        executablePath:
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        args: ["--ignore-certificate-errors"],
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 800 });

    await page.goto("https://reg.exam.dtu.ac.in", {
        waitUntil: "networkidle2",
        timeout: 0,
    });

    await page.waitForSelector('input[name="roll_no"]', { visible: true });
    await page.waitForSelector('input[name="password"]', { visible: true });

    await page.type('input[name="roll_no"]', `${process.env.ROLL_NUMBER}`, {
        delay: 100,
    });
    await page.type('input[name="password"]', process.env.PASSWORD, {
        delay: 100,
    });

    await page.click('button[type="submit"]');

    await page.waitForSelector("a h3", { visible: true, timeout: 60000 });

    const pageTitle = await page.title();
    console.log("page title:", pageTitle);

    const admitCardUrl = await page.evaluate(() => {
        const link = document.querySelector("a h3");
        return link ? link.parentElement.href : null;
    });

    const newPage = await browser.newPage();
    await newPage.setViewport({ width: 1400, height: 800 });
    await newPage.goto(admitCardUrl, { waitUntil: "networkidle2", timeout: 0 });

    const formExist = await newPage.$('form[action*="feedback"]');

    let finalAdmitLink = admitCardUrl;
    // check if feedback form exists
    if (formExist) {
        // fill sections
        for (const [subject, faculty] of Object.entries(subjectFacultyMap)) {
            await newPage.waitForSelector(
                `input[name="subjects[${subject}][section]"]`,
                { visible: true, timeout: 60000 }
            );
            await newPage.type(`input[name="subjects[${subject}][section]"]`, "A", {
                delay: 100,
            });
        }

        // fill faculty name

        for (const [subject, faculty] of Object.entries(subjectFacultyMap)) {
            await newPage.waitForSelector(
                `input[name = "subjects[${subject}][faculty]"]`,
                { visible: true, timeout: 60000 }
            );
            await newPage.type(
                `input[name="subjects[${subject}][faculty]"]`,
                faculty,
                { delay: 100 }
            );
        }

        // fill for all questions

        for (let i = 1; i <= 19; i++) {
            for (const subject in subjectFacultyMap) {
                await newPage.waitForSelector(
                    `select[name = "subjects[${subject}][q${i}]"]`,
                    { visible: true, timeout: 60000 }
                );
                await newPage.select(
                    `select[name = "subjects[${subject}][q${i}]"]`,
                    "5"
                );

                console.log(`Filled question ${i} for subject ${subject}`);
            }
        }

        // submit feedback form
        await newPage.click('button[type="submit"]');

        // next page after submit
        await newPage.waitForNavigation({ waitUntil: "networkidle2", timeout: 0 });
        finalAdmitLink = await newPage.evaluate(() => {
            const link = document.querySelector('a[href*="admit"]');
            return link ? link.href : null;
        });
    }

    console.log("Admit Card Link:", finalAdmitLink);

    // open admit card link
    const admitCardPage = await browser.newPage();
    await admitCardPage.goto(finalAdmitLink, {
        waitUntil: "networkidle2",
        timeout: 0,
    });

    // download admit card as pdf
    await admitCardPage.pdf({
        path: process.env.ADMIT_DOWNLOAD_PATH,
        format: "A4",
        printBackground: true,
    });

    console.log("Admit Card Downloaded Successfully!");

    const data = await page.evaluate(() => {
        const title = document.title;
        const links = Array.from(document.querySelectorAll("a")).map((a) => a.href);
        return { title, links };
    });

    console.log(data);

    await browser.close();
})();
