chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  if (request.type === "get-html") {
    let clone = document.documentElement.cloneNode(true) as Element;
    clone.querySelectorAll("script, style, svg").forEach((n) => n.remove());
    clone
      .querySelectorAll("*[style]")
      .forEach((n) => n.removeAttribute("style"));
    clone
      .querySelectorAll("*[class]")
      .forEach((n) => n.removeAttribute("class"));
    sendResponse({
      url: document.URL,
      html: clone.outerHTML,
    });
  } else if (request.type === "get-selection") {
    var fragm = window?.getSelection()?.getRangeAt(0).cloneContents();
    if (fragm) {
      var div = document.createElement("div");
      div.appendChild(fragm);
      sendResponse({
        url: document.URL,
        html: div.innerHTML,
      });
    } else {
      sendResponse({
        url: document.URL,
        html: undefined,
      });
    }
  }
});

chrome.runtime.sendMessage({
  type: "new-page",
});

chrome.runtime.sendMessage({
  type: "page-active",
});

document.addEventListener("selectionchange", () => {
  chrome.runtime.sendMessage({
    type: "new-selection",
  });
});

setInterval(() => {
  chrome.runtime.sendMessage({
    type: "page-active",
  });
}, 1000 * 20);
