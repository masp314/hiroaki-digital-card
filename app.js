(() => {
  'use strict';
  const sourceConfig = window.DIGITAL_CARD_CONFIG;
  const config = sourceConfig ? { ...sourceConfig, links: (sourceConfig.links || []).filter(link => link.enabled !== false && link.url) } : null;
  if (!config || !Array.isArray(config.links) || config.links.length === 0) {
    document.body.innerHTML = '<p style="padding:2rem;color:white">Configuration error.</p>';
    return;
  }

  const els = {
    photo: document.getElementById('profilePhoto'),
    name: document.getElementById('profileName'),
    nameJa: document.getElementById('profileNameJa'),
    company: document.getElementById('profileCompany'),
    title: document.getElementById('profileTitle'),
    tagline: document.getElementById('profileTagline'),
    activeLabel: document.getElementById('activeLabel'),
    activeIcon: document.getElementById('activeIcon'),
    activeUrl: document.getElementById('activeUrl'),
    qrImage: document.getElementById('qrImage'),
    openLink: document.getElementById('openLink'),
    linkMenu: document.getElementById('linkMenu'),
    shareButton: document.getElementById('shareButton'),
    copyButton: document.getElementById('copyButton'),
    saveContactButton: document.getElementById('saveContactButton'),
    status: document.getElementById('statusMessage')
  };

  Object.assign(els.photo, { src: config.profile.photo, alt: `${config.profile.name} profile photo` });
  els.name.textContent = config.profile.name;
  els.nameJa.textContent = config.profile.nameJa || '';
  els.nameJa.hidden = !config.profile.nameJa;
  els.company.textContent = config.profile.company;
  els.title.textContent = config.profile.title;
  els.tagline.textContent = config.profile.tagline;

  let activeId = config.links.some(link => link.id === config.defaultLink) ? config.defaultLink : config.links[0].id;

  function setStatus(message) {
    els.status.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => { els.status.textContent = ''; }, 2200);
  }

  function renderMenu() {
    els.linkMenu.innerHTML = '';
    config.links.forEach(link => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `link-choice${link.id === activeId ? ' active' : ''}`;
      button.setAttribute('aria-pressed', String(link.id === activeId));
      button.innerHTML = `<span class="choice-icon">${link.icon}</span><span class="choice-label">${link.shortLabel || link.label}</span>`;
      button.addEventListener('click', () => selectLink(link.id));
      els.linkMenu.appendChild(button);
    });
  }

  function selectLink(id) {
    const link = config.links.find(item => item.id === id) || config.links[0];
    activeId = link.id;
    els.activeLabel.textContent = link.label;
    els.activeIcon.textContent = link.icon;
    els.activeUrl.textContent = link.url;
    els.openLink.href = link.url;
    els.openLink.textContent = `Open ${link.label}`;
    els.qrImage.src = `qr/${link.id}.png`;
    els.qrImage.alt = `${link.label} QR code`;
    renderMenu();
  }

  els.shareButton.addEventListener('click', async () => {
    const link = config.links.find(item => item.id === activeId);
    const data = { title: `${config.profile.name} | ${config.profile.company}`, text: config.profile.tagline, url: link.url };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(link.url); setStatus('Link copied'); }
    } catch (error) {
      if (error.name !== 'AbortError') setStatus('Could not share');
    }
  });

  els.copyButton.addEventListener('click', async () => {
    const link = config.links.find(item => item.id === activeId);
    try { await navigator.clipboard.writeText(link.url); setStatus('Link copied'); }
    catch { setStatus('Copy failed'); }
  });

  els.saveContactButton.addEventListener('click', () => {
    const vcard = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${config.profile.name}`,
      `ORG:${config.profile.company}`,
      `TITLE:${config.profile.title}`,
      ...(config.contact?.email ? [`EMAIL:${config.contact.email}`] : []),
      ...(config.contact?.phone ? [`TEL:${config.contact.phone}`] : []),
      `URL:${config.links.find(item => item.id === 'linkedin')?.url || location.href}`,
      'END:VCARD'
    ].join('\r\n');
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${config.profile.name.replace(/\s+/g, '-')}.vcf`; a.click();
    URL.revokeObjectURL(url);
    setStatus('Contact file created');
  });

  selectLink(activeId);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
