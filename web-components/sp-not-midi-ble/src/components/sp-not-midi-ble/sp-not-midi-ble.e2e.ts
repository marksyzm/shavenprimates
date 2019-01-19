import { newE2EPage } from '@stencil/core/testing';

describe('sp-not-midi-ble', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<sp-not-midi-ble></sp-not-midi-ble>');
    const element = await page.find('sp-not-midi-ble');
    expect(element).toHaveClass('hydrated');
  });
});
