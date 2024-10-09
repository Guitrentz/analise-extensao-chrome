/* global chrome */
const EXTENSION_WIDTH_PX = "380px";
const WHATSAPP_PAGE_SELECTOR = ".app-wrapper-web";
const WHATSAPP_CHAT_SELECTOR = ".app-wrapper-web .two";
const IFRAME_TIMEOUT = 100;
const LOCAL_STORAGE_KEY = "copilot-opened";
const CHROME_WEB_STORE_PARAM_KEY = `chrome-extension://${chrome.runtime.id}`;

const extensionIframe = createExtensionIframe();
const toggleDiv = createToggleDiv();
const closedImg = createImg("/images/open-copiloto.png");
const openedImg = createImg("/images/close-copiloto.png");

toggleDiv.append(closedImg, openedImg);

setup();

function setup() {
  if (!isWhatsAppWebReady()) {
    setTimeout(setup, IFRAME_TIMEOUT);
    return;
  }

  setupWhatsAppElements();

  const extensionOpened = getExtensionOpened();

  if (extensionOpened) {
    showExtension();
    openToggleDiv();
    toggleImgDisplay(openedImg, closedImg);
  } else {
    hideExtension();
    closeToggleDiv();
    toggleImgDisplay(closedImg, openedImg);
  }

  document.body.append(extensionIframe, toggleDiv);
}

function isWhatsAppWebReady() {
  return document.querySelector(WHATSAPP_CHAT_SELECTOR) !== null;
}

function setupWhatsAppElements() {
  const whatsAppPageDiv = document.querySelector(WHATSAPP_PAGE_SELECTOR);
  const whatsAppChatDiv = document.querySelector(WHATSAPP_CHAT_SELECTOR);

  whatsAppPageDiv.style.position = "static";
  Object.assign(whatsAppChatDiv.style, {
    transition: "width 0.2s ease-out",
    margin: 0,
    top: 0,
    height: "100%",
    maxWidth: "100%",
    width: "100%"
  });
}

function createExtensionIframe() {
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, {
    position: "fixed",
    display: "block",
    top: 0,
    right: 0,
    width: 0,
    height: "100%"
  });
  iframe.src = chrome.runtime.getURL("/index.html");
  iframe.id = "copilotIframe";
  return iframe;
}

function createToggleDiv() {
  const div = document.createElement("div");
  Object.assign(div.style, {
    position: "fixed",
    top: "120px",
    zIndex: 100,
    cursor: "pointer",
    transition: "right 0.2s ease-out",
    lineHeight: 0
  });
  div.onclick = toggleExtension;
  return div;
}

function createImg(src) {
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL(src);
  return img;
}

function toggleExtension() {
  const isOpening = toggleDiv.style.right === "0px";

  if (isOpening) {
    showExtension();
    openToggleDiv();
    toggleImgDisplay(openedImg, closedImg);
  } else {
    hideExtension();
    closeToggleDiv();
    toggleImgDisplay(closedImg, openedImg);
  }

  setExtensionOpened(isOpening);
}

function showExtension() {
  document.querySelector(WHATSAPP_CHAT_SELECTOR).style.width =
    `calc(100% - ${EXTENSION_WIDTH_PX})`;
  extensionIframe.style.width = `${EXTENSION_WIDTH_PX}`;
}

function hideExtension() {
  document.querySelector(WHATSAPP_CHAT_SELECTOR).style.width = "100%";
  extensionIframe.style.width = 0;
}

function openToggleDiv() {
  Object.assign(toggleDiv.style, {
    right: `calc(${EXTENSION_WIDTH_PX})`
  });
}

function closeToggleDiv() {
  Object.assign(toggleDiv.style, {
    right: 0
  });
}

function toggleImgDisplay(showImg, hideImg) {
  showImg.style.display = "block";
  hideImg.style.display = "none";
}

function getExtensionOpened() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) ?? true;
  } catch {
    return true;
  }
}

function setExtensionOpened(value) {
  localStorage.setItem(LOCAL_STORAGE_KEY, value);
}

function extractPhoneNumber(contactId) {
  const regex = /(?:true|false)_(\d+)@c\.us/;
  const match = contactId.match(regex);

  if (match) {
    const phoneNumber = match[1];
    return phoneNumber;
  } else {
    return null;
  }
}

function handleGetUserInfo() {
  const contactElement = document.querySelector("[data-id]");
  let celular = "";
  let nome = "";
  if (contactElement) {
    const contactId = contactElement.getAttribute("data-id");

    celular =
      contactId !== null && contactId.length
        ? extractPhoneNumber(contactId)
        : "";
  }

  const nameElement = document.querySelector('header span[dir="auto"]');

  nome = nameElement ? nameElement.innerText : "";

  sendMessageToIframe(nome, celular);
}

function sendMessageToIframe(nome, celular) {
  const iframe = document.getElementById("copilotIframe");

  if (iframe && iframe.contentWindow) {
    const message = {
      paciente: { nome, celular }
    };

    iframe.contentWindow.postMessage(message, CHROME_WEB_STORE_PARAM_KEY);
  }
}

document.addEventListener("click", handleGetUserInfo);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.sendModeloMensagem && message.text) {
    const paragraphElement = document.querySelectorAll('p.selectable-text.copyable-text')[1];
    const allowContent = document.querySelector('.x10l6tqk.x13vifvy.x1ey2m1c.x1r1tlb4.xhtitgo.x1grh1yo.x47corl.x87ps6o.xh9ts4v.x1k6rcq7.x6prxxf')

    if (paragraphElement) {

      paragraphElement.textContent = '';

      const event = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: message.text
      });

      paragraphElement.textContent = message.text;

      if (!allowContent) {
        sendResponse({ status: 'hasContent', message: 'Por favor, limpe a caixa de texto do WhatsApp antes de copiar a mensagem.' });
      } else {
        paragraphElement.dispatchEvent(event);
        sendResponse({ status: 'success' });
      }
    } else {
      sendResponse({ status: 'failed', message: 'Campo de entrada não encontrado' });
    }
  }

  return true;
});
