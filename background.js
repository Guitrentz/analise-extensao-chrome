/* global chrome */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const WHATSAPP_URL = "https://web.whatsapp.com";
  const TAB_QUERY = {
    active: true,
    lastFocusedWindow: true,
    currentWindow: true,
  };

  if (message.openPopup) {
    handleOpenPopup(TAB_QUERY, WHATSAPP_URL);
    sendResponse();
  }
});

function handleOpenPopup(tabQuery, whatsappUrl) {
  chrome.tabs.query(tabQuery, (tabs = []) => {
    if (!tabs[0].url.includes(whatsappUrl)) {
      chrome.tabs.create({ url: whatsappUrl, selected: true });
    }
  });
}
