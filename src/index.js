import puppeteer from 'puppeteer';
import fs from 'fs';
import { setTimeout } from "node:timers/promises";

// ================== BEGIN VARIABLES ==================
const startUrl = 'https://acties.skyradio.nl/20/AD3F7B8C-6A37-4A73-B3BD-0FD7A5CE0F6D/s212/v1.cfm?id=AD3F7B8C-6A37-4A73-B3BD-0FD7A5CE0F6D';

// Act like a real person
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

const codename = 'Kerst';
const amountToRepeat = 50;
// ================== END VARIABLES ==================

const getData = async () => {
    try {
        const data = JSON.parse(await fs.promises.readFile('src/userInfo.json', 'utf8'));
        return data;
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }
};

const randomIntFromInterval = (min, max) => { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 *  Fisher-Yates shuffle: every permutation is equally likely
 * @param {*} array
 */
const shuffleArray = (arr) => {
    const newArr = [...arr];

    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]]; // Swap elements
    }

    return newArr;
}

const runPuppeteer = async () => {

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setViewport({ width: 1024, height: 1024 });
    await page.setUserAgent(userAgent);

    const userData = await getData();  // Fetch the JSON data

    if (!userData) {
        console.error('userData is empty!');
        await browser.close();
        return; // Stop execution if userData is not available
    }

    let repeatCount = 0;
    while (repeatCount < amountToRepeat) {
        repeatCount++;

        if (repeatCount > 1) {
            await setTimeout(randomIntFromInterval(900 * 1_000, 1_200 * 1_000));
        }

        const currentDateTime = new Date().toLocaleString();
        console.log(`Submitting round: ${repeatCount} - ${currentDateTime}`);

        const randomSortedUserData = shuffleArray(userData);
        for (const userInfo of randomSortedUserData) {

            console.log('Going to submit for:', userInfo.firstName);

            // Navigate the page to a URL.
            await page.goto(startUrl);

            await page.locator('#reponse').fill(codename);

            // Go to second page
            await page.locator('#next').click();

            await setTimeout(randomIntFromInterval(2_000, 3_000));

            // Fill in personal details
            await page.locator('#choix_993410').fill(userInfo.firstName);
            await page.locator('#choix_993414').fill(userInfo.lastName);

            await page.locator('#choix_993415').fill(userInfo.city);
            await page.locator('#choix_993411').fill(userInfo.email);

            const [day, month, year] = userInfo.birthDate.split('-');

            await page.locator('select[name="day"]').fill(day);
            await page.locator('select[name="month"]').fill(month);
            await page.locator('select[name="year"]').fill(year);

            // Submit!
            await page.locator('#register').click();

            await setTimeout(randomIntFromInterval(5_000, 8_000));
        }
    }

    console.log('Done submitting!')

    await browser.close();
};

runPuppeteer();
