(() => {
  const money = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);

  const getResortCard = (property, whatsappNumber) => {
    const values = new URLSearchParams({
      text: `Hi Travel4Life, I found ${property.name} in your Jim Corbett resort guide and would like to check current availability and a written quote for my dates.`,
    });
    const whatsappUrl = `https://wa.me/${whatsappNumber}?${values.toString()}`;
    return `<article class="resort-card" data-resort-card data-resort-name="${escapeHtml(property.name)}" data-resort-category="${escapeHtml(property.category)}" data-season-rate="${property.rates.season}">
      <div class="resort-card-top"><div><h3>${escapeHtml(property.name)}</h3><span class="resort-category">${escapeHtml(property.category)}</span></div><span class="verification-tag">Needs verification</span></div>
      <div class="rate-grid" aria-label="Workbook rate references">
        <div><small>Season reference / night</small><strong>INR ${money.format(property.rates.season)}</strong></div>
        <div><small>Listed 15% season figure</small><strong>INR ${money.format(property.rates.discountedSeason)}</strong></div>
        <div><small>Off-season reference / night</small><strong>INR ${money.format(property.rates.offSeason)}</strong></div>
      </div>
      <p class="rate-footnote">Workbook reference only; validity, occupancy, meals, taxes and availability are not stated.</p>
      <a class="text-link" href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer" data-contact-event="contact_whatsapp_click" data-contact-secondary-event="availability_request" data-contact-extra-event="resort_enquiry" data-contact-page-type="resort" data-contact-destination="Jim Corbett" data-contact-resort="${escapeHtml(property.name)}">Ask about this property <b>↗</b></a>
    </article>`;
  };

  const renderDirectory = async () => {
    const results = document.querySelector('#resort-results');
    if (!results) return;

    try {
      const response = await fetch('/jim-corbett/resorts.json');
      if (!response.ok) throw new Error(`Resort data request failed with HTTP ${response.status}.`);
      const dataset = await response.json();
      const properties = dataset.properties;
      if (!Array.isArray(properties) || properties.length === 0) {
        throw new Error('The Corbett resort dataset contains no properties.');
      }

      const whatsappNumber = document.body.dataset.whatsappNumber;
      if (!whatsappNumber) throw new Error('The WhatsApp contact number is missing from the page configuration.');

      if (!results.querySelector('[data-resort-card]')) {
        results.innerHTML = properties.map((property) => getResortCard(property, whatsappNumber)).join('');
      }

      const category = document.querySelector('#resort-category');
      const categories = [...new Set(properties.map(({ category: name }) => name))].sort((a, b) => a.localeCompare(b));
      categories.forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        category.append(option);
      });

      const search = document.querySelector('#resort-search');
      const maxRate = document.querySelector('#resort-max-rate');
      const rateOutput = document.querySelector('#rate-output');
      const sort = document.querySelector('#resort-sort');
      const count = document.querySelector('#resort-results-count');
      const emptyState = document.querySelector('#resort-no-results');
      const intentNote = document.querySelector('#resort-intent-note');
      const searchTerms = new Set([
        'jim', 'corbett', 'resort', 'resorts', 'hotel', 'hotels', 'in', 'near', 'the', 'for', 'with', 'from', 'show', 'find',
        'family', 'families', 'couple', 'couples', 'wedding', 'weddings', 'mice', 'corporate', 'conference', 'offsite', 'offsites',
        'pool', 'spa', 'safari', 'gate', 'breakfast', 'kids', 'children',
      ]);
      const unsupportedIntent = /\b(family|families|couple|couples|wedding|weddings|mice|corporate|conference|offsite|offsites|pool|spa|safari|gate|breakfast|kids|children)\b/i;

      const filter = () => {
        const terms = search.value.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term && !searchTerms.has(term));
        const selectedCategory = category.value;
        const limit = Number(maxRate.value);
        const order = sort.value;
        const matching = properties.filter((property) => {
          const searchable = `${property.name} ${property.category}`.toLowerCase();
          return terms.every((term) => searchable.includes(term))
            && (!selectedCategory || property.category === selectedCategory)
            && property.rates.season <= limit;
        });

        if (order === 'name') matching.sort((a, b) => a.name.localeCompare(b.name));
        if (order === 'season-asc') matching.sort((a, b) => a.rates.season - b.rates.season);
        if (order === 'season-desc') matching.sort((a, b) => b.rates.season - a.rates.season);

        results.innerHTML = matching.map((property) => getResortCard(property, whatsappNumber)).join('');
        count.textContent = `${matching.length} of ${properties.length} workbook entries`;
        emptyState.hidden = matching.length > 0;
        rateOutput.textContent = limit >= 30000 ? 'Any' : `INR ${money.format(limit)}`;

        const asksForUnverifiedFeatures = unsupportedIntent.test(search.value);
        if (intentNote) {
          intentNote.hidden = !asksForUnverifiedFeatures;
          if (asksForUnverifiedFeatures) {
            intentNote.innerHTML = 'This workbook does not verify guest suitability, facilities, safari access or event capacity. <a href="/jim-corbett/weddings/">Wedding planning</a> · <a href="/jim-corbett/mice/">MICE &amp; offsites</a>.';
          }
        }
      };

      [search, category, maxRate, sort].forEach((control) => control.addEventListener('input', filter));
      document.querySelector('#resort-reset').addEventListener('click', () => {
        search.value = '';
        category.value = '';
        maxRate.value = '30000';
        sort.value = 'source';
        filter();
        search.focus();
      });
      filter();
    } catch (error) {
      console.error('Unable to load the Corbett resort guide.', error);
      const count = document.querySelector('#resort-results-count');
      if (count) count.textContent = 'The resort list could not be loaded. Please refresh or contact Travel4life.';
      results.innerHTML = '';
    }
  };

  const wireEnquiryForms = () => {
    document.querySelectorAll('[data-corbett-enquiry]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const number = document.body.dataset.whatsappNumber;
        const pageType = form.dataset.corbettEnquiry;
        if (!number || !pageType) {
          console.error('Unable to prepare the Corbett enquiry because contact configuration is missing.');
          return;
        }
        const details = [...new FormData(form).entries()]
          .filter(([, value]) => String(value).trim())
          .map(([label, value]) => `${label}: ${String(value).trim()}`);
        const purpose = pageType === 'wedding' ? 'destination wedding' : 'corporate offsite / MICE event';
        const message = [
          `Hi Travel4Life, I am planning a ${purpose} in Jim Corbett.`,
          '',
          ...details,
          '',
          'Please help me check suitable options and current availability. I understand details need confirmation.',
        ].join('\n');
        const link = form.querySelector('[data-enquiry-send-link]');
        if (!(link instanceof HTMLAnchorElement)) {
          console.error('Unable to prepare the Corbett enquiry because its WhatsApp link is missing.');
          return;
        }
        link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
        link.dataset.contactEvent = 'contact_whatsapp_click';
        link.dataset.contactSecondaryEvent = pageType === 'wedding' ? 'wedding_quote_request' : 'mice_quote_request';
        link.dataset.contactDestination = 'Jim Corbett';
        link.dataset.contactEventType = purpose;
        link.click();
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    void renderDirectory();
    wireEnquiryForms();

    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
    document.querySelectorAll('input[type="date"]').forEach((input) => input.setAttribute('min', localToday));
  });
})();
