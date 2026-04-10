import {Page, test} from '@playwright/test';
import {join} from "node:path";

test('has title', async ({page}) => {
    test.setTimeout(0);
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    const neededWidths = [800, 500, 250];

    await page.goto('https://edit.photo/', {timeout: 60000});

    for (let i = 1; i < 38; i++) {
        const currentImageFileName = `${i < 10 ? '0' : ''}${i}`;

        await page.locator('input[type="file"]').setInputFiles(join(__dirname, '..', '..', 'page', 'assets', 'bts', `${currentImageFileName}.webp`));
        await page.waitForTimeout(3000);

        await page.getByRole('tab', {name: 'Resize'}).click();
        await page.locator('label > svg').first().click();

        for (const width of neededWidths) {
            await enterDimension(page, width);
            await page.waitForTimeout(1000);
            await exportImage(page, `${currentImageFileName}-${width}`);
            await page.waitForTimeout(1000);
        }
    }
});

async function enterDimension(page: Page, dimension: number): Promise<void> {
    await page.locator('.PinturaFormInner .PinturaInputDimension input').first().click();
    await page.locator('.PinturaFormInner .PinturaInputDimension input').first().fill(`${dimension}`);
    await page.keyboard.press('Enter');
}

async function exportImage(page: Page, filename: string): Promise<void> {
    await page.getByRole('button', {name: 'Export'}).click();
    await page.waitForTimeout(1000);
    await page.getByText('WEBP', {exact: true}).click();
    const downloadPromise = page.waitForEvent('download', {timeout: 60000});
    await page.getByRole('button', {name: 'Download'}).click();
    const download = await downloadPromise;
    await download.saveAs(join(__dirname, '..', '..', 'page', 'assets', 'bts', `${filename}.webp`));
}
