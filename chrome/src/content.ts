chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  if (request.type == "get-html") {
    sendResponse({
      url: document.URL,
      html: document.documentElement.outerHTML,
    });
  }
});

chrome.runtime.sendMessage({
  type: "new-page",
});

chrome.runtime.sendMessage({
  type: "page-active",
});

setInterval(() => {
  chrome.runtime.sendMessage({
    type: "page-active",
  });
}, 1000 * 20);
