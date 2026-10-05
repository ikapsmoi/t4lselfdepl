(() => {
  const config = document.querySelector('meta[name="t4l-contact-analytics"]');
  const supabaseUrl = config?.dataset.supabaseUrl;
  const anonKey = config?.dataset.supabaseAnonKey;
  if (!supabaseUrl || !anonKey) return;

  const getSessionId = () => {
    const storageKey = 'traveltag_session_id';
    let sessionId = sessionStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = `session_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
      sessionStorage.setItem(storageKey, sessionId);
    }
    return sessionId;
  };

  const getSource = () => {
    if (!document.referrer) return 'direct';
    try {
      const hostname = new URL(document.referrer).hostname.toLowerCase();
      return /(^|\.)google\./.test(hostname)
        || /(^|\.)bing\.com$/.test(hostname)
        || /(^|\.)search\.yahoo\.com$/.test(hostname)
        || /(^|\.)duckduckgo\.com$/.test(hostname)
        ? 'organic'
        : 'referral';
    } catch (error) {
      console.error('Unable to determine contact-event source.', error);
      return 'direct';
    }
  };

  const sendEvent = (eventName, link) => {
    const pageUrl = `${window.location.origin}${window.location.pathname}`;
    const metadata = {
      page_url: pageUrl,
      page_type: link.dataset.contactPageType || 'travel',
      destination: link.dataset.contactDestination || '',
      city: link.dataset.contactCity || '',
      country: link.dataset.contactCountry || '',
      entity: link.dataset.contactEntity || '',
      resort: link.dataset.contactResort || '',
      package: link.dataset.contactPackage || '',
      event_type: link.dataset.contactEventType || '',
      trip_type: link.dataset.contactTripType || '',
      origin: link.dataset.contactOrigin || '',
      source: getSource(),
    };
    const payload = {
      event_name: eventName,
      user_id: null,
      session_id: getSessionId(),
      metadata,
    };

    void fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).then((response) => {
      if (!response.ok) {
        console.error(`Contact analytics request failed with HTTP ${response.status}.`);
      }
    }).catch((error) => {
      console.error('Contact analytics request failed.', error);
    });
  };

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[data-contact-event]');
    if (!link) return;
    sendEvent(link.dataset.contactEvent, link);
    if (link.dataset.contactSecondaryEvent) {
      sendEvent(link.dataset.contactSecondaryEvent, link);
    }
    if (link.dataset.contactExtraEvent) {
      link.dataset.contactExtraEvent.split(',').forEach((eventName) => sendEvent(eventName, link));
    }
  }, true);
})();
