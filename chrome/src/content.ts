chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  if (request.type == "get-html") {
    sendResponse({
      url: document.URL,
      html: document.documentElement.outerHTML,
    });
  }
});
