import puppeteer from 'puppeteer';
import fs from 'fs';
import { setTimeout } from "node:timers/promises";

// ================== BEGIN VARIABLES ==================
const startUrl = 'https://acties.skyradio.nl/20/AD3F7B8C-6A37-4A73-B3BD-0FD7A5CE0F6D/s212/v1.cfm?id=AD3F7B8C-6A37-4A73-B3BD-0FD7A5CE0F6D';

const codename = 'disney';
const amountToRepeat = 100;
// ================== END VARIABLES ==================

const getData = async () => {
    try {
        const data = JSON.parse(await fs.promises.readFile('src/userInfo.json', 'utf8'));
        return data;
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }
};

const runPuppeteer = async () => {

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 1024 });

    const userData = await getData();  // Fetch the JSON data

    if (!userData) {
        console.error('userData is empty!');
        await browser.close();
        return; // Stop execution if userData is not available
    }

    let repeatCount = 0;
    while (repeatCount < amountToRepeat) {
        repeatCount++;
        console.log('Submitting round:', repeatCount);

        for (const userInfo of userData) {

            console.log('Going to submit for:', userData.firstName);

            // Navigate the page to a URL.
            await page.goto(startUrl);
    
            await page.locator('#reponse').fill(codename);
    
            // Go to second page
            await page.locator('#next').click();
    
            await setTimeout(1_000);
    
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
    
            await setTimeout(3_000);
        }
    }

    console.log('Done submitting!')

    await browser.close();
};

runPuppeteer();