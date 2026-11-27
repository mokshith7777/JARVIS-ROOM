export function initCheckout(config, playSoftChime = () => {}) {
  const get = id => document.getElementById(id);
  if (get('upi-id-text')) get('upi-id-text').textContent = config.upiId;
  if (get('pro-original-price')) get('pro-original-price').textContent = config.originalPriceDisplay;
  if (get('pro-price')) get('pro-price').textContent = config.priceDisplay;
  if (get('pro-download-link')) get('pro-download-link').href = config.jarvisProApkUrl;
  if (get('timej-download-link')) get('timej-download-link').href = config.timeJApkUrl;
  function openProModal() { get('pro-modal').classList.add('open'); playSoftChime(580); }
  function closeProModal() { get('pro-modal').classList.remove('open'); }
  function openTimeJModal() { get('timej-modal').classList.add('open'); playSoftChime(640); }
  function closeTimeJModal() { get('timej-modal').classList.remove('open'); }
  get('pro-close').addEventListener('click', closeProModal);
  get('timej-close').addEventListener('click', closeTimeJModal);
  get('copy-upi-btn').addEventListener('click', async () => {
    const button = get('copy-upi-btn');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(config.upiId);
      else {
        const textarea = document.createElement('textarea');
        textarea.value = config.upiId; document.body.appendChild(textarea);
        textarea.select(); document.execCommand('copy'); textarea.remove();
      }
      button.textContent = 'Copied!';
      setTimeout(() => { button.textContent = 'Copy UPI'; }, 1800);
    } catch (error) {
      button.textContent = 'Copy unavailable';
      setTimeout(() => { button.textContent = 'Copy UPI'; }, 1800);
    }
  });
  get('verify-utr-btn').addEventListener('click', () => {
    const utr = get('utr-input').value.replace(/\s+/g, '');
    const status = get('utr-status');
    if (!/^[0-9]{12}$/.test(utr)) {
      status.className = 'utr-status';
      status.textContent = 'Please enter a valid 12-digit numeric UTR transaction number.';
      return;
    }
    status.className = 'utr-status ok';
    status.textContent = 'UTR format accepted. This page does not verify bank payment.';
    get('utr-confirmed-msg').textContent = 'UTR format accepted. Payment confirmation is not automated on this website.';
    get('pro-download-stage').style.display = 'block';
    playSoftChime(740);
  });
  return { openProModal, closeProModal, openTimeJModal, closeTimeJModal };
}
