(function () {
  // --- Color helpers ---
  function isLightColor(hex) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
  }
  function lightTint(hex, amount) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    var m = amount || 0.85;
    var tr = Math.round(r + (255 - r) * m);
    var tg = Math.round(g + (255 - g) * m);
    var tb = Math.round(b + (255 - b) * m);
    return '#' + tr.toString(16).padStart(2, '0') + tg.toString(16).padStart(2, '0') + tb.toString(16).padStart(2, '0');
  }

  const script = document.currentScript;
  const chatUrl =
    document.currentScript.getAttribute("data-chat-url") ||
    "https://zero.smalltech.in/embed";

  // Get the host website domain
  const hostWebsite = window.location.origin;
  
  let displayMobile = script.getAttribute("data-display-mobile");
  if (displayMobile === null || displayMobile.trim() === "") {
    displayMobile = true;
  } else if (displayMobile.toLowerCase().trim() === "true") {
    displayMobile = true;
  } else {
    displayMobile = false;
  }
  //  const enableMobile = attr === null ? true : attr === "true";

  // Get custom colour if provided
  const customColour = script.getAttribute("data-colour") || "#219EBC";

  // Get custom tagline if provided
  const customTagline = script.getAttribute("data-tagline") || "Talk to our AI Agent now";

  // Create iframe container
  const iframeWrapper = document.createElement("div");
  iframeWrapper.style.position = "fixed";
  iframeWrapper.style.bottom = "20px";
  iframeWrapper.style.right = "20px";
  iframeWrapper.style.marginLeft = "auto";
  iframeWrapper.style.width = "350px";
  iframeWrapper.style.height = "520px";
  iframeWrapper.style.borderRadius = "16px";
  iframeWrapper.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  iframeWrapper.style.zIndex = "999999";
  iframeWrapper.style.transition = "opacity 0.35s ease, transform 0.35s ease";
  iframeWrapper.style.display = "none";
  iframeWrapper.style.opacity = "0";
  iframeWrapper.style.transform = "translateY(20px) scale(0.97)";
  iframeWrapper.style.overflow = "hidden";
  iframeWrapper.style.background = "white";

  // iframe inside wrapper
  const iframe = document.createElement("iframe");
  iframe.src = `${chatUrl}?host=${encodeURIComponent(hostWebsite)}&color=${encodeURIComponent(customColour)}`;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframeWrapper.appendChild(iframe);

  // Close is handled by the widget's internal close button via postMessage

  // Chat text label
  const bubbleText = document.createElement("div");
  bubbleText.innerHTML = customTagline;
  bubbleText.style.position = "fixed";
  bubbleText.style.bottom = "32px";
  bubbleText.style.right = "88px";
  bubbleText.style.background = lightTint(customColour, 0.85);
  bubbleText.style.padding = "8px 12px";
  bubbleText.style.borderRadius = "12px";
  bubbleText.style.boxShadow = "0 4px 10px rgba(0,0,0,0.12)";
  bubbleText.style.border = "2px solid " + lightTint(customColour, 0.55);
  bubbleText.style.zIndex = "999997";
  bubbleText.style.fontSize = "16px";
  bubbleText.style.fontWeight = "600";
  // Ensure readable contrast: dark colour on light tint, or dark fallback on light colour tint
  bubbleText.style.color = isLightColor(customColour) ? '#1a1a1a' : customColour;
  bubbleText.style.display = "flex";
  bubbleText.style.alignItems = "center";
  bubbleText.style.gap = "6px";
  bubbleText.style.maxWidth = "calc(100vw - 120px)";

  // Dismissal is remembered, so the tagline does not come back on the next
  // close, the next auto-open, or the next page view.
  var DISMISS_KEY = "zer0-tagline-dismissed";
  function taglineDismissed() {
    try { return window.localStorage.getItem(DISMISS_KEY) === "1"; } catch (e) { return false; }
  }
  function dismissTagline() {
    try { window.localStorage.setItem(DISMISS_KEY, "1"); } catch (e) {}
    bubbleText.style.display = "none";
  }
  function showTagline() {
    if (taglineDismissed()) return;
    bubbleText.style.display = "flex";
  }

  // The close button carries data-tagline-close: host pages that inject their
  // own dismiss control look for exactly this attribute and skip when present,
  // so no duplicate button appears.
  var taglineClose = document.createElement("button");
  taglineClose.setAttribute("data-tagline-close", "true");
  taglineClose.setAttribute("aria-label", "Dismiss");
  taglineClose.innerHTML = "&times;";
  taglineClose.style.cssText =
    "background:none;border:none;cursor:pointer;font-size:16px;line-height:1;" +
    "padding:0 2px;opacity:0.65;color:inherit;flex:none;";
  taglineClose.addEventListener("click", function (e) {
    e.stopPropagation();
    dismissTagline();
  });
  bubbleText.appendChild(taglineClose);

  // Floating chat bubble
  const bubble = document.createElement("div");
  bubble.innerHTML = "💬";
  bubble.style.position = "fixed";
  bubble.style.bottom = "20px";
  bubble.style.right = "20px";
  bubble.style.marginLeft = "auto";
  bubble.style.width = "60px";
  bubble.style.height = "60px";
  bubble.style.borderRadius = "50%";
  bubble.style.background = customColour;
  bubble.style.color = isLightColor(customColour) ? '#1a1a1a' : 'white';
  bubble.style.display = "flex";
  bubble.style.alignItems = "center";
  bubble.style.justifyContent = "center";
  bubble.style.cursor = "pointer";
  bubble.style.fontSize = "28px";
  bubble.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  bubble.style.zIndex = "999998";

  // ------------------------------------------------------------ responsive
  // Sizes are applied imperatively because the widget is injected with inline
  // styles and has no stylesheet of its own.
  function applyResponsive() {
    var small = window.matchMedia("(max-width: 640px)").matches;

    if (small) {
      bubble.style.width = "48px";
      bubble.style.height = "48px";
      bubble.style.fontSize = "22px";
      bubble.style.bottom = "16px";
      bubble.style.right = "16px";

      bubbleText.style.fontSize = "13px";
      bubbleText.style.padding = "6px 9px";
      bubbleText.style.bottom = "26px";
      bubbleText.style.right = "72px";
      bubbleText.style.maxWidth = "calc(100vw - 96px)";
      bubbleText.style.whiteSpace = "nowrap";
      bubbleText.style.overflow = "hidden";
      bubbleText.style.textOverflow = "ellipsis";

      iframeWrapper.style.width = "calc(100vw - 24px)";
      iframeWrapper.style.height = "min(72vh, 520px)";
      iframeWrapper.style.right = "12px";
      iframeWrapper.style.bottom = "12px";
    } else {
      bubble.style.width = "60px";
      bubble.style.height = "60px";
      bubble.style.fontSize = "28px";
      bubble.style.bottom = "20px";
      bubble.style.right = "20px";

      bubbleText.style.fontSize = "16px";
      bubbleText.style.padding = "8px 12px";
      bubbleText.style.bottom = "32px";
      bubbleText.style.right = "88px";
      bubbleText.style.maxWidth = "calc(100vw - 120px)";
      bubbleText.style.whiteSpace = "normal";

      iframeWrapper.style.width = "350px";
      iframeWrapper.style.height = "520px";
      iframeWrapper.style.right = "20px";
      iframeWrapper.style.bottom = "20px";
    }
  }

  applyResponsive();
  window.addEventListener("resize", applyResponsive);

  if (displayMobile === false) {
    // Hide on mobile
    if (window.matchMedia("(max-width: 768px)").matches) {
      bubble.style.display = "none";
      bubbleText.style.display = "none";
      iframeWrapper.style.display = "none";
    }
  }
  // Helper function to track analytics events
  function trackAnalyticsEvent(eventName, eventParams) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, eventParams);
    }
  }

  // Listen for analytics events from the iframe
  window.addEventListener("message", (event) => {
    //  verify the message is from our iframe
    if (event.source === iframe.contentWindow) {
      const { type, eventName, eventParams } = event.data;
      if (type === "ANALYTICS_EVENT") {
        trackAnalyticsEvent(eventName, eventParams);
      } else if (type === "CLOSE_CHAT") {
        // Handle close chat message from iframe
        iframeWrapper.style.opacity = "0";
        iframeWrapper.style.transform = "translateY(20px) scale(0.97)";
        setTimeout(function () { iframeWrapper.style.display = "none"; }, 350);
        showTagline();
        chatIsOpen = false;
      }
    }
  });

  var chatIsOpen = false;

  function openChat(message) {
    bubbleText.style.display = "none";
    iframeWrapper.style.display = "block";
    // Trigger reflow so the transition plays
    void iframeWrapper.offsetHeight;
    iframeWrapper.style.opacity = "1";
    iframeWrapper.style.transform = "translateY(0) scale(1)";
    chatIsOpen = true;

    // If a pre-filled message was supplied, forward it to the iframe
    if (message && typeof message === "string") {
      // Small delay to let the iframe finish loading / re-rendering
      setTimeout(function () {
        iframe.contentWindow.postMessage({ type: "SEND_MESSAGE", text: message }, "*");
      }, 600);
    }

    // Track in host website's GA4
    trackAnalyticsEvent("chat_bubble_clicked", {
      event_category: "chat_widget",
      event_label: "floating_bubble",
    });
  }

  bubble.addEventListener("click", function () { openChat(); });

  // Allow the host page to open the chat programmatically (with optional message)
  window.addEventListener("open-chat-widget", function (e) {
    openChat(e.detail && e.detail.message ? e.detail.message : undefined);
  });

  // Auto-open the chat after 10 seconds on the page
  setTimeout(function () {
    if (!chatIsOpen && !taglineDismissed()) openChat();
  }, 10000);

  function addChatElements() {
    document.body.appendChild(iframeWrapper);
    document.body.appendChild(bubble);
    document.body.appendChild(bubbleText);
    // Honour a dismissal from a previous visit on first paint.
    if (taglineDismissed()) bubbleText.style.display = "none";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addChatElements);
  } else {
    addChatElements();
  }
})();
