(function () {
  'use strict';

  // Get the script's own src to derive the base URL
  var scripts = document.getElementsByTagName('script');
  var thisScript = scripts[scripts.length - 1];
  var scriptSrc = thisScript.src || '';
  var baseUrl = scriptSrc.replace('/embed.js', '');

  // Don't inject twice
  if (document.getElementById('anfloy-widget-root')) return;

  var isOpen = false;

  // ── Styles ──
  var style = document.createElement('style');
  style.textContent = [
    '#anfloy-widget-root { position: fixed; bottom: 24px; right: 24px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }',
    '#anfloy-toggle-btn { width: 56px; height: 56px; border-radius: 50%; background: #00d4a0; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,212,160,0.4); transition: transform 0.2s, box-shadow 0.2s; position: relative; }',
    '#anfloy-toggle-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,212,160,0.5); }',
    '#anfloy-toggle-btn img { width: 26px; height: 26px; filter: brightness(0); transition: opacity 0.2s; }',
    '#anfloy-toggle-btn .close-icon { display: none; position: absolute; }',
    '#anfloy-toggle-btn.open .chat-icon { display: none; }',
    '#anfloy-toggle-btn.open .close-icon { display: block; }',
    '#anfloy-frame-wrap { position: absolute; bottom: 68px; right: 0; width: 380px; height: 620px; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.5); transform: scale(0.95) translateY(10px); opacity: 0; pointer-events: none; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease; }',
    '#anfloy-frame-wrap.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }',
    '#anfloy-iframe { width: 100%; height: 100%; border: none; display: block; }',
    '@media (max-width: 440px) { #anfloy-frame-wrap { width: calc(100vw - 24px); right: -12px; height: 85vh; bottom: 72px; } }',
  ].join('\n');
  document.head.appendChild(style);

  // ── Widget container ──
  var root = document.createElement('div');
  root.id = 'anfloy-widget-root';

  // ── iFrame ──
  var frameWrap = document.createElement('div');
  frameWrap.id = 'anfloy-frame-wrap';

  var iframe = document.createElement('iframe');
  iframe.id = 'anfloy-iframe';
  iframe.src = baseUrl + '/widget';
  iframe.title = 'Anfloy Chat';
  iframe.setAttribute('allow', 'clipboard-write');
  frameWrap.appendChild(iframe);

  // ── Toggle button ──
  var btn = document.createElement('button');
  btn.id = 'anfloy-toggle-btn';
  btn.setAttribute('aria-label', 'Open Anfloy chat');

  var chatIcon = document.createElement('img');
  chatIcon.src = baseUrl + '/logo.png';
  chatIcon.className = 'chat-icon';
  chatIcon.alt = 'Anfloy';

  var closeIcon = document.createElement('span');
  closeIcon.className = 'close-icon';
  closeIcon.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d0d0d" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  btn.appendChild(chatIcon);
  btn.appendChild(closeIcon);

  btn.addEventListener('click', function () {
    isOpen = !isOpen;
    if (isOpen) {
      frameWrap.classList.add('open');
      btn.classList.add('open');
      btn.setAttribute('aria-label', 'Close Anfloy chat');
    } else {
      frameWrap.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-label', 'Open Anfloy chat');
    }
  });

  root.appendChild(frameWrap);
  root.appendChild(btn);
  document.body.appendChild(root);
})();
