import { newE2EPage } from '@stencil/core/testing';

describe('sp-not-midi-ble', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<sp-midi></sp-midi>');
    const element = await page.find('sp-midi');
    expect(element).toHaveClass('hydrated');
  });
});
