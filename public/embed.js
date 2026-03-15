(function () {
  'use strict';

  var scripts = document.getElementsByTagName('script');
  var thisScript = scripts[scripts.length - 1];
  var baseUrl = (thisScript.src || '').replace('/embed.js', '');

  if (document.getElementById('anfloy-widget-root')) return;

  var isOpen = false;
  var bubbleDismissed = sessionStorage.getItem('anfloy_bubble_dismissed') === '1';

  // ── Styles ──
  var style = document.createElement('style');
  style.textContent = `
    #anfloy-widget-root {
      position: fixed; bottom: 24px; right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    /* ── Toggle button ── */
    #anfloy-toggle-btn {
      width: 56px; height: 56px; border-radius: 50%;
      background: #FF6820; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(255,104,32,0.45);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative; outline: none;
    }
    #anfloy-toggle-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(255,104,32,0.55); }
    #anfloy-toggle-btn img { width: 26px; height: 26px; filter: invert(1) brightness(2); transition: opacity 0.15s; }
    #anfloy-toggle-btn .close-icon { display: none; position: absolute; }
    #anfloy-toggle-btn.open .chat-icon { opacity: 0; }
    #anfloy-toggle-btn.open .close-icon { display: flex; align-items: center; justify-content: center; }

    /* ── Welcome bubble ── */
    #anfloy-welcome-bubble {
      position: absolute; bottom: 68px; right: 0;
      width: 248px;
      background: #160B04;
      border: 1px solid rgba(255,104,32,0.22);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04);
      padding: 14px 16px;
      cursor: pointer;
      transform: scale(0.92) translateY(8px);
      opacity: 0;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
      pointer-events: none;
    }
    #anfloy-welcome-bubble.visible {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    #anfloy-welcome-bubble::after {
      content: '';
      position: absolute; bottom: -7px; right: 20px;
      width: 12px; height: 12px;
      background: #160B04;
      border-right: 1px solid rgba(255,104,32,0.22);
      border-bottom: 1px solid rgba(255,104,32,0.22);
      transform: rotate(45deg);
    }
    .anfloy-bubble-top {
      display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;
    }
    .anfloy-bubble-avatar {
      width: 32px; height: 32px; border-radius: 8px;
      background: rgba(255,104,32,0.15);
      border: 1px solid rgba(255,104,32,0.22);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .anfloy-bubble-avatar img { width: 16px; height: 16px; filter: invert(1) brightness(2); }
    .anfloy-bubble-text { flex: 1; }
    .anfloy-bubble-name {
      font-size: 12px; font-weight: 700; color: #fff;
      margin-bottom: 3px; letter-spacing: -0.1px;
    }
    .anfloy-bubble-msg {
      font-size: 12.5px; color: rgba(255,255,255,0.65);
      line-height: 1.5;
    }
    .anfloy-bubble-close {
      position: absolute; top: 10px; right: 10px;
      width: 20px; height: 20px; border-radius: 50%;
      background: rgba(255,255,255,0.08); border: none;
      color: rgba(255,255,255,0.4); font-size: 13px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      line-height: 1; transition: background 0.15s;
    }
    .anfloy-bubble-close:hover { background: rgba(255,255,255,0.15); }
    .anfloy-bubble-cta {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.07);
      font-size: 12px; font-weight: 600;
      color: #FF8A4A;
    }
    .anfloy-bubble-cta-arrow { font-size: 14px; }

    /* ── Frame wrapper ── */
    #anfloy-frame-wrap {
      position: absolute; bottom: 68px; right: 0;
      width: 380px;
      height: min(620px, calc(100dvh - 110px));
      border-radius: 18px; overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
      display: none;
      transform: scale(0.95) translateY(10px);
      opacity: 0;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
    }
    #anfloy-frame-wrap.open { transform: scale(1) translateY(0); opacity: 1; }
    #anfloy-iframe { width: 100%; height: 100%; border: none; display: block; }

    /* ── Mobile ── */
    @media (max-width: 480px) {
      #anfloy-widget-root { bottom: 16px; right: 16px; }
      #anfloy-frame-wrap {
        width: calc(100vw - 32px); right: -4px;
        height: min(560px, calc(100dvh - 100px));
        bottom: 64px;
      }
      #anfloy-welcome-bubble { width: calc(100vw - 80px); }
    }
  `;
  document.head.appendChild(style);

  // ── DOM ──
  var root = document.createElement('div');
  root.id = 'anfloy-widget-root';

  // Welcome bubble
  var bubble = document.createElement('div');
  bubble.id = 'anfloy-welcome-bubble';
  bubble.innerHTML = `
    <button class="anfloy-bubble-close" aria-label="Dismiss">×</button>
    <div class="anfloy-bubble-top">
      <div class="anfloy-bubble-avatar">
        <img src="${baseUrl}/logo.png" alt="anfloy" />
      </div>
      <div class="anfloy-bubble-text">
        <div class="anfloy-bubble-name">anfloy.</div>
        <div class="anfloy-bubble-msg">We're here to answer your questions about AI automation 👋</div>
      </div>
    </div>
    <div class="anfloy-bubble-cta">
      <span>Chat with us</span>
      <span class="anfloy-bubble-cta-arrow">→</span>
    </div>
  `;

  // Frame
  var frameWrap = document.createElement('div');
  frameWrap.id = 'anfloy-frame-wrap';
  var iframe = document.createElement('iframe');
  iframe.id = 'anfloy-iframe';
  iframe.src = baseUrl + '/widget';
  iframe.title = 'Anfloy Chat';
  iframe.setAttribute('allow', 'clipboard-write');
  frameWrap.appendChild(iframe);

  // Button
  var btn = document.createElement('button');
  btn.id = 'anfloy-toggle-btn';
  btn.setAttribute('aria-label', 'Open Anfloy chat');
  var chatIcon = document.createElement('img');
  chatIcon.src = baseUrl + '/logo.png';
  chatIcon.className = 'chat-icon';
  chatIcon.alt = 'Anfloy';
  var closeIcon = document.createElement('span');
  closeIcon.className = 'close-icon';
  closeIcon.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  btn.appendChild(chatIcon);
  btn.appendChild(closeIcon);

  root.appendChild(bubble);
  root.appendChild(frameWrap);
  root.appendChild(btn);
  document.body.appendChild(root);

  // ── Welcome bubble logic ──
  var bubbleTimer = null;

  function dismissBubble() {
    bubble.classList.remove('visible');
    sessionStorage.setItem('anfloy_bubble_dismissed', '1');
    bubbleDismissed = true;
  }

  if (!bubbleDismissed) {
    bubbleTimer = setTimeout(function () {
      bubble.classList.add('visible');
    }, 2500);
  }

  // Click bubble body → open chat
  bubble.addEventListener('click', function (e) {
    if (e.target.closest('.anfloy-bubble-close')) {
      dismissBubble();
      return;
    }
    dismissBubble();
    openChat();
  });

  // Dismiss × button
  var closeBtn = bubble.querySelector('.anfloy-bubble-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      dismissBubble();
    });
  }

  // ── Chat toggle logic ──
  var closeTimer = null;

  function openChat() {
    isOpen = true;
    dismissBubble();
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    frameWrap.style.display = 'block';
    frameWrap.getBoundingClientRect(); // force reflow
    frameWrap.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-label', 'Close Anfloy chat');
  }

  function closeChat() {
    isOpen = false;
    frameWrap.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-label', 'Open Anfloy chat');
    closeTimer = setTimeout(function () {
      frameWrap.style.display = 'none';
      closeTimer = null;
    }, 260);
  }

  btn.addEventListener('click', function () {
    if (isOpen) { closeChat(); } else { openChat(); }
  });
})();
