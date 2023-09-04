var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@mozilla/readability/Readability.js
var require_Readability = __commonJS({
  "node_modules/@mozilla/readability/Readability.js"(exports, module2) {
    function Readability(doc, options) {
      if (options && options.documentElement) {
        doc = options;
        options = arguments[2];
      } else if (!doc || !doc.documentElement) {
        throw new Error("First argument to Readability constructor should be a document object.");
      }
      options = options || {};
      this._doc = doc;
      this._docJSDOMParser = this._doc.firstChild.__JSDOMParser__;
      this._articleTitle = null;
      this._articleByline = null;
      this._articleDir = null;
      this._articleSiteName = null;
      this._attempts = [];
      this._debug = !!options.debug;
      this._maxElemsToParse = options.maxElemsToParse || this.DEFAULT_MAX_ELEMS_TO_PARSE;
      this._nbTopCandidates = options.nbTopCandidates || this.DEFAULT_N_TOP_CANDIDATES;
      this._charThreshold = options.charThreshold || this.DEFAULT_CHAR_THRESHOLD;
      this._classesToPreserve = this.CLASSES_TO_PRESERVE.concat(options.classesToPreserve || []);
      this._keepClasses = !!options.keepClasses;
      this._serializer = options.serializer || function(el) {
        return el.innerHTML;
      };
      this._disableJSONLD = !!options.disableJSONLD;
      this._allowedVideoRegex = options.allowedVideoRegex || this.REGEXPS.videos;
      this._flags = this.FLAG_STRIP_UNLIKELYS | this.FLAG_WEIGHT_CLASSES | this.FLAG_CLEAN_CONDITIONALLY;
      if (this._debug) {
        let logNode = function(node) {
          if (node.nodeType == node.TEXT_NODE) {
            return `${node.nodeName} ("${node.textContent}")`;
          }
          let attrPairs = Array.from(node.attributes || [], function(attr) {
            return `${attr.name}="${attr.value}"`;
          }).join(" ");
          return `<${node.localName} ${attrPairs}>`;
        };
        this.log = function() {
          if (typeof console !== "undefined") {
            let args = Array.from(arguments, (arg) => {
              if (arg && arg.nodeType == this.ELEMENT_NODE) {
                return logNode(arg);
              }
              return arg;
            });
            args.unshift("Reader: (Readability)");
            console.log.apply(console, args);
          } else if (typeof dump !== "undefined") {
            var msg = Array.prototype.map.call(arguments, function(x) {
              return x && x.nodeName ? logNode(x) : x;
            }).join(" ");
            dump("Reader: (Readability) " + msg + "\n");
          }
        };
      } else {
        this.log = function() {
        };
      }
    }
    Readability.prototype = {
      FLAG_STRIP_UNLIKELYS: 1,
      FLAG_WEIGHT_CLASSES: 2,
      FLAG_CLEAN_CONDITIONALLY: 4,
      // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
      ELEMENT_NODE: 1,
      TEXT_NODE: 3,
      // Max number of nodes supported by this parser. Default: 0 (no limit)
      DEFAULT_MAX_ELEMS_TO_PARSE: 0,
      // The number of top candidates to consider when analysing how
      // tight the competition is among candidates.
      DEFAULT_N_TOP_CANDIDATES: 5,
      // Element tags to score by default.
      DEFAULT_TAGS_TO_SCORE: "section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),
      // The default number of chars an article must have in order to return a result
      DEFAULT_CHAR_THRESHOLD: 500,
      // All of the regular expressions in use within readability.
      // Defined up here so we don't instantiate them repeatedly in loops.
      REGEXPS: {
        // NOTE: These two regular expressions are duplicated in
        // Readability-readerable.js. Please keep both copies in sync.
        unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
        okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i,
        positive: /article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,
        negative: /-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,
        extraneous: /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,
        byline: /byline|author|dateline|writtenby|p-author/i,
        replaceFonts: /<(\/?)font[^>]*>/gi,
        normalize: /\s{2,}/g,
        videos: /\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,
        shareElements: /(\b|_)(share|sharedaddy)(\b|_)/i,
        nextLink: /(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,
        prevLink: /(prev|earl|old|new|<|«)/i,
        tokenize: /\W+/g,
        whitespace: /^\s*$/,
        hasContent: /\S$/,
        hashUrl: /^#.+/,
        srcsetUrl: /(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,
        b64DataUrl: /^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,
        // See: https://schema.org/Article
        jsonLdArticleTypes: /^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/
      },
      UNLIKELY_ROLES: ["menu", "menubar", "complementary", "navigation", "alert", "alertdialog", "dialog"],
      DIV_TO_P_ELEMS: /* @__PURE__ */ new Set(["BLOCKQUOTE", "DL", "DIV", "IMG", "OL", "P", "PRE", "TABLE", "UL"]),
      ALTER_TO_DIV_EXCEPTIONS: ["DIV", "ARTICLE", "SECTION", "P"],
      PRESENTATIONAL_ATTRIBUTES: ["align", "background", "bgcolor", "border", "cellpadding", "cellspacing", "frame", "hspace", "rules", "style", "valign", "vspace"],
      DEPRECATED_SIZE_ATTRIBUTE_ELEMS: ["TABLE", "TH", "TD", "HR", "PRE"],
      // The commented out elements qualify as phrasing content but tend to be
      // removed by readability when put into paragraphs, so we ignore them here.
      PHRASING_ELEMS: [
        // "CANVAS", "IFRAME", "SVG", "VIDEO",
        "ABBR",
        "AUDIO",
        "B",
        "BDO",
        "BR",
        "BUTTON",
        "CITE",
        "CODE",
        "DATA",
        "DATALIST",
        "DFN",
        "EM",
        "EMBED",
        "I",
        "IMG",
        "INPUT",
        "KBD",
        "LABEL",
        "MARK",
        "MATH",
        "METER",
        "NOSCRIPT",
        "OBJECT",
        "OUTPUT",
        "PROGRESS",
        "Q",
        "RUBY",
        "SAMP",
        "SCRIPT",
        "SELECT",
        "SMALL",
        "SPAN",
        "STRONG",
        "SUB",
        "SUP",
        "TEXTAREA",
        "TIME",
        "VAR",
        "WBR"
      ],
      // These are the classes that readability sets itself.
      CLASSES_TO_PRESERVE: ["page"],
      // These are the list of HTML entities that need to be escaped.
      HTML_ESCAPE_MAP: {
        "lt": "<",
        "gt": ">",
        "amp": "&",
        "quot": '"',
        "apos": "'"
      },
      /**
       * Run any post-process modifications to article content as necessary.
       *
       * @param Element
       * @return void
      **/
      _postProcessContent: function(articleContent) {
        this._fixRelativeUris(articleContent);
        this._simplifyNestedElements(articleContent);
        if (!this._keepClasses) {
          this._cleanClasses(articleContent);
        }
      },
      /**
       * Iterates over a NodeList, calls `filterFn` for each node and removes node
       * if function returned `true`.
       *
       * If function is not passed, removes all the nodes in node list.
       *
       * @param NodeList nodeList The nodes to operate on
       * @param Function filterFn the function to use as a filter
       * @return void
       */
      _removeNodes: function(nodeList, filterFn) {
        if (this._docJSDOMParser && nodeList._isLiveNodeList) {
          throw new Error("Do not pass live node lists to _removeNodes");
        }
        for (var i = nodeList.length - 1; i >= 0; i--) {
          var node = nodeList[i];
          var parentNode = node.parentNode;
          if (parentNode) {
            if (!filterFn || filterFn.call(this, node, i, nodeList)) {
              parentNode.removeChild(node);
            }
          }
        }
      },
      /**
       * Iterates over a NodeList, and calls _setNodeTag for each node.
       *
       * @param NodeList nodeList The nodes to operate on
       * @param String newTagName the new tag name to use
       * @return void
       */
      _replaceNodeTags: function(nodeList, newTagName) {
        if (this._docJSDOMParser && nodeList._isLiveNodeList) {
          throw new Error("Do not pass live node lists to _replaceNodeTags");
        }
        for (const node of nodeList) {
          this._setNodeTag(node, newTagName);
        }
      },
      /**
       * Iterate over a NodeList, which doesn't natively fully implement the Array
       * interface.
       *
       * For convenience, the current object context is applied to the provided
       * iterate function.
       *
       * @param  NodeList nodeList The NodeList.
       * @param  Function fn       The iterate function.
       * @return void
       */
      _forEachNode: function(nodeList, fn) {
        Array.prototype.forEach.call(nodeList, fn, this);
      },
      /**
       * Iterate over a NodeList, and return the first node that passes
       * the supplied test function
       *
       * For convenience, the current object context is applied to the provided
       * test function.
       *
       * @param  NodeList nodeList The NodeList.
       * @param  Function fn       The test function.
       * @return void
       */
      _findNode: function(nodeList, fn) {
        return Array.prototype.find.call(nodeList, fn, this);
      },
      /**
       * Iterate over a NodeList, return true if any of the provided iterate
       * function calls returns true, false otherwise.
       *
       * For convenience, the current object context is applied to the
       * provided iterate function.
       *
       * @param  NodeList nodeList The NodeList.
       * @param  Function fn       The iterate function.
       * @return Boolean
       */
      _someNode: function(nodeList, fn) {
        return Array.prototype.some.call(nodeList, fn, this);
      },
      /**
       * Iterate over a NodeList, return true if all of the provided iterate
       * function calls return true, false otherwise.
       *
       * For convenience, the current object context is applied to the
       * provided iterate function.
       *
       * @param  NodeList nodeList The NodeList.
       * @param  Function fn       The iterate function.
       * @return Boolean
       */
      _everyNode: function(nodeList, fn) {
        return Array.prototype.every.call(nodeList, fn, this);
      },
      /**
       * Concat all nodelists passed as arguments.
       *
       * @return ...NodeList
       * @return Array
       */
      _concatNodeLists: function() {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments);
        var nodeLists = args.map(function(list) {
          return slice.call(list);
        });
        return Array.prototype.concat.apply([], nodeLists);
      },
      _getAllNodesWithTag: function(node, tagNames) {
        if (node.querySelectorAll) {
          return node.querySelectorAll(tagNames.join(","));
        }
        return [].concat.apply([], tagNames.map(function(tag) {
          var collection = node.getElementsByTagName(tag);
          return Array.isArray(collection) ? collection : Array.from(collection);
        }));
      },
      /**
       * Removes the class="" attribute from every element in the given
       * subtree, except those that match CLASSES_TO_PRESERVE and
       * the classesToPreserve array from the options object.
       *
       * @param Element
       * @return void
       */
      _cleanClasses: function(node) {
        var classesToPreserve = this._classesToPreserve;
        var className = (node.getAttribute("class") || "").split(/\s+/).filter(function(cls) {
          return classesToPreserve.indexOf(cls) != -1;
        }).join(" ");
        if (className) {
          node.setAttribute("class", className);
        } else {
          node.removeAttribute("class");
        }
        for (node = node.firstElementChild; node; node = node.nextElementSibling) {
          this._cleanClasses(node);
        }
      },
      /**
       * Converts each <a> and <img> uri in the given element to an absolute URI,
       * ignoring #ref URIs.
       *
       * @param Element
       * @return void
       */
      _fixRelativeUris: function(articleContent) {
        var baseURI = this._doc.baseURI;
        var documentURI = this._doc.documentURI;
        function toAbsoluteURI(uri) {
          if (baseURI == documentURI && uri.charAt(0) == "#") {
            return uri;
          }
          try {
            return new URL(uri, baseURI).href;
          } catch (ex) {
          }
          return uri;
        }
        var links = this._getAllNodesWithTag(articleContent, ["a"]);
        this._forEachNode(links, function(link) {
          var href = link.getAttribute("href");
          if (href) {
            if (href.indexOf("javascript:") === 0) {
              if (link.childNodes.length === 1 && link.childNodes[0].nodeType === this.TEXT_NODE) {
                var text = this._doc.createTextNode(link.textContent);
                link.parentNode.replaceChild(text, link);
              } else {
                var container = this._doc.createElement("span");
                while (link.firstChild) {
                  container.appendChild(link.firstChild);
                }
                link.parentNode.replaceChild(container, link);
              }
            } else {
              link.setAttribute("href", toAbsoluteURI(href));
            }
          }
        });
        var medias = this._getAllNodesWithTag(articleContent, [
          "img",
          "picture",
          "figure",
          "video",
          "audio",
          "source"
        ]);
        this._forEachNode(medias, function(media) {
          var src = media.getAttribute("src");
          var poster = media.getAttribute("poster");
          var srcset = media.getAttribute("srcset");
          if (src) {
            media.setAttribute("src", toAbsoluteURI(src));
          }
          if (poster) {
            media.setAttribute("poster", toAbsoluteURI(poster));
          }
          if (srcset) {
            var newSrcset = srcset.replace(this.REGEXPS.srcsetUrl, function(_, p1, p2, p3) {
              return toAbsoluteURI(p1) + (p2 || "") + p3;
            });
            media.setAttribute("srcset", newSrcset);
          }
        });
      },
      _simplifyNestedElements: function(articleContent) {
        var node = articleContent;
        while (node) {
          if (node.parentNode && ["DIV", "SECTION"].includes(node.tagName) && !(node.id && node.id.startsWith("readability"))) {
            if (this._isElementWithoutContent(node)) {
              node = this._removeAndGetNext(node);
              continue;
            } else if (this._hasSingleTagInsideElement(node, "DIV") || this._hasSingleTagInsideElement(node, "SECTION")) {
              var child = node.children[0];
              for (var i = 0; i < node.attributes.length; i++) {
                child.setAttribute(node.attributes[i].name, node.attributes[i].value);
              }
              node.parentNode.replaceChild(child, node);
              node = child;
              continue;
            }
          }
          node = this._getNextNode(node);
        }
      },
      /**
       * Get the article title as an H1.
       *
       * @return string
       **/
      _getArticleTitle: function() {
        var doc = this._doc;
        var curTitle = "";
        var origTitle = "";
        try {
          curTitle = origTitle = doc.title.trim();
          if (typeof curTitle !== "string")
            curTitle = origTitle = this._getInnerText(doc.getElementsByTagName("title")[0]);
        } catch (e) {
        }
        var titleHadHierarchicalSeparators = false;
        function wordCount(str) {
          return str.split(/\s+/).length;
        }
        if (/ [\|\-\\\/>»] /.test(curTitle)) {
          titleHadHierarchicalSeparators = / [\\\/>»] /.test(curTitle);
          curTitle = origTitle.replace(/(.*)[\|\-\\\/>»] .*/gi, "$1");
          if (wordCount(curTitle) < 3)
            curTitle = origTitle.replace(/[^\|\-\\\/>»]*[\|\-\\\/>»](.*)/gi, "$1");
        } else if (curTitle.indexOf(": ") !== -1) {
          var headings = this._concatNodeLists(
            doc.getElementsByTagName("h1"),
            doc.getElementsByTagName("h2")
          );
          var trimmedTitle = curTitle.trim();
          var match = this._someNode(headings, function(heading) {
            return heading.textContent.trim() === trimmedTitle;
          });
          if (!match) {
            curTitle = origTitle.substring(origTitle.lastIndexOf(":") + 1);
            if (wordCount(curTitle) < 3) {
              curTitle = origTitle.substring(origTitle.indexOf(":") + 1);
            } else if (wordCount(origTitle.substr(0, origTitle.indexOf(":"))) > 5) {
              curTitle = origTitle;
            }
          }
        } else if (curTitle.length > 150 || curTitle.length < 15) {
          var hOnes = doc.getElementsByTagName("h1");
          if (hOnes.length === 1)
            curTitle = this._getInnerText(hOnes[0]);
        }
        curTitle = curTitle.trim().replace(this.REGEXPS.normalize, " ");
        var curTitleWordCount = wordCount(curTitle);
        if (curTitleWordCount <= 4 && (!titleHadHierarchicalSeparators || curTitleWordCount != wordCount(origTitle.replace(/[\|\-\\\/>»]+/g, "")) - 1)) {
          curTitle = origTitle;
        }
        return curTitle;
      },
      /**
       * Prepare the HTML document for readability to scrape it.
       * This includes things like stripping javascript, CSS, and handling terrible markup.
       *
       * @return void
       **/
      _prepDocument: function() {
        var doc = this._doc;
        this._removeNodes(this._getAllNodesWithTag(doc, ["style"]));
        if (doc.body) {
          this._replaceBrs(doc.body);
        }
        this._replaceNodeTags(this._getAllNodesWithTag(doc, ["font"]), "SPAN");
      },
      /**
       * Finds the next node, starting from the given node, and ignoring
       * whitespace in between. If the given node is an element, the same node is
       * returned.
       */
      _nextNode: function(node) {
        var next = node;
        while (next && next.nodeType != this.ELEMENT_NODE && this.REGEXPS.whitespace.test(next.textContent)) {
          next = next.nextSibling;
        }
        return next;
      },
      /**
       * Replaces 2 or more successive <br> elements with a single <p>.
       * Whitespace between <br> elements are ignored. For example:
       *   <div>foo<br>bar<br> <br><br>abc</div>
       * will become:
       *   <div>foo<br>bar<p>abc</p></div>
       */
      _replaceBrs: function(elem) {
        this._forEachNode(this._getAllNodesWithTag(elem, ["br"]), function(br) {
          var next = br.nextSibling;
          var replaced = false;
          while ((next = this._nextNode(next)) && next.tagName == "BR") {
            replaced = true;
            var brSibling = next.nextSibling;
            next.parentNode.removeChild(next);
            next = brSibling;
          }
          if (replaced) {
            var p = this._doc.createElement("p");
            br.parentNode.replaceChild(p, br);
            next = p.nextSibling;
            while (next) {
              if (next.tagName == "BR") {
                var nextElem = this._nextNode(next.nextSibling);
                if (nextElem && nextElem.tagName == "BR")
                  break;
              }
              if (!this._isPhrasingContent(next))
                break;
              var sibling = next.nextSibling;
              p.appendChild(next);
              next = sibling;
            }
            while (p.lastChild && this._isWhitespace(p.lastChild)) {
              p.removeChild(p.lastChild);
            }
            if (p.parentNode.tagName === "P")
              this._setNodeTag(p.parentNode, "DIV");
          }
        });
      },
      _setNodeTag: function(node, tag) {
        this.log("_setNodeTag", node, tag);
        if (this._docJSDOMParser) {
          node.localName = tag.toLowerCase();
          node.tagName = tag.toUpperCase();
          return node;
        }
        var replacement = node.ownerDocument.createElement(tag);
        while (node.firstChild) {
          replacement.appendChild(node.firstChild);
        }
        node.parentNode.replaceChild(replacement, node);
        if (node.readability)
          replacement.readability = node.readability;
        for (var i = 0; i < node.attributes.length; i++) {
          try {
            replacement.setAttribute(node.attributes[i].name, node.attributes[i].value);
          } catch (ex) {
          }
        }
        return replacement;
      },
      /**
       * Prepare the article node for display. Clean out any inline styles,
       * iframes, forms, strip extraneous <p> tags, etc.
       *
       * @param Element
       * @return void
       **/
      _prepArticle: function(articleContent) {
        this._cleanStyles(articleContent);
        this._markDataTables(articleContent);
        this._fixLazyImages(articleContent);
        this._cleanConditionally(articleContent, "form");
        this._cleanConditionally(articleContent, "fieldset");
        this._clean(articleContent, "object");
        this._clean(articleContent, "embed");
        this._clean(articleContent, "footer");
        this._clean(articleContent, "link");
        this._clean(articleContent, "aside");
        var shareElementThreshold = this.DEFAULT_CHAR_THRESHOLD;
        this._forEachNode(articleContent.children, function(topCandidate) {
          this._cleanMatchedNodes(topCandidate, function(node, matchString) {
            return this.REGEXPS.shareElements.test(matchString) && node.textContent.length < shareElementThreshold;
          });
        });
        this._clean(articleContent, "iframe");
        this._clean(articleContent, "input");
        this._clean(articleContent, "textarea");
        this._clean(articleContent, "select");
        this._clean(articleContent, "button");
        this._cleanHeaders(articleContent);
        this._cleanConditionally(articleContent, "table");
        this._cleanConditionally(articleContent, "ul");
        this._cleanConditionally(articleContent, "div");
        this._replaceNodeTags(this._getAllNodesWithTag(articleContent, ["h1"]), "h2");
        this._removeNodes(this._getAllNodesWithTag(articleContent, ["p"]), function(paragraph) {
          var imgCount = paragraph.getElementsByTagName("img").length;
          var embedCount = paragraph.getElementsByTagName("embed").length;
          var objectCount = paragraph.getElementsByTagName("object").length;
          var iframeCount = paragraph.getElementsByTagName("iframe").length;
          var totalCount = imgCount + embedCount + objectCount + iframeCount;
          return totalCount === 0 && !this._getInnerText(paragraph, false);
        });
        this._forEachNode(this._getAllNodesWithTag(articleContent, ["br"]), function(br) {
          var next = this._nextNode(br.nextSibling);
          if (next && next.tagName == "P")
            br.parentNode.removeChild(br);
        });
        this._forEachNode(this._getAllNodesWithTag(articleContent, ["table"]), function(table) {
          var tbody = this._hasSingleTagInsideElement(table, "TBODY") ? table.firstElementChild : table;
          if (this._hasSingleTagInsideElement(tbody, "TR")) {
            var row = tbody.firstElementChild;
            if (this._hasSingleTagInsideElement(row, "TD")) {
              var cell = row.firstElementChild;
              cell = this._setNodeTag(cell, this._everyNode(cell.childNodes, this._isPhrasingContent) ? "P" : "DIV");
              table.parentNode.replaceChild(cell, table);
            }
          }
        });
      },
      /**
       * Initialize a node with the readability object. Also checks the
       * className/id for special names to add to its score.
       *
       * @param Element
       * @return void
      **/
      _initializeNode: function(node) {
        node.readability = { "contentScore": 0 };
        switch (node.tagName) {
          case "DIV":
            node.readability.contentScore += 5;
            break;
          case "PRE":
          case "TD":
          case "BLOCKQUOTE":
            node.readability.contentScore += 3;
            break;
          case "ADDRESS":
          case "OL":
          case "UL":
          case "DL":
          case "DD":
          case "DT":
          case "LI":
          case "FORM":
            node.readability.contentScore -= 3;
            break;
          case "H1":
          case "H2":
          case "H3":
          case "H4":
          case "H5":
          case "H6":
          case "TH":
            node.readability.contentScore -= 5;
            break;
        }
        node.readability.contentScore += this._getClassWeight(node);
      },
      _removeAndGetNext: function(node) {
        var nextNode = this._getNextNode(node, true);
        node.parentNode.removeChild(node);
        return nextNode;
      },
      /**
       * Traverse the DOM from node to node, starting at the node passed in.
       * Pass true for the second parameter to indicate this node itself
       * (and its kids) are going away, and we want the next node over.
       *
       * Calling this in a loop will traverse the DOM depth-first.
       */
      _getNextNode: function(node, ignoreSelfAndKids) {
        if (!ignoreSelfAndKids && node.firstElementChild) {
          return node.firstElementChild;
        }
        if (node.nextElementSibling) {
          return node.nextElementSibling;
        }
        do {
          node = node.parentNode;
        } while (node && !node.nextElementSibling);
        return node && node.nextElementSibling;
      },
      // compares second text to first one
      // 1 = same text, 0 = completely different text
      // works the way that it splits both texts into words and then finds words that are unique in second text
      // the result is given by the lower length of unique parts
      _textSimilarity: function(textA, textB) {
        var tokensA = textA.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);
        var tokensB = textB.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);
        if (!tokensA.length || !tokensB.length) {
          return 0;
        }
        var uniqTokensB = tokensB.filter((token) => !tokensA.includes(token));
        var distanceB = uniqTokensB.join(" ").length / tokensB.join(" ").length;
        return 1 - distanceB;
      },
      _checkByline: function(node, matchString) {
        if (this._articleByline) {
          return false;
        }
        if (node.getAttribute !== void 0) {
          var rel = node.getAttribute("rel");
          var itemprop = node.getAttribute("itemprop");
        }
        if ((rel === "author" || itemprop && itemprop.indexOf("author") !== -1 || this.REGEXPS.byline.test(matchString)) && this._isValidByline(node.textContent)) {
          this._articleByline = node.textContent.trim();
          return true;
        }
        return false;
      },
      _getNodeAncestors: function(node, maxDepth) {
        maxDepth = maxDepth || 0;
        var i = 0, ancestors = [];
        while (node.parentNode) {
          ancestors.push(node.parentNode);
          if (maxDepth && ++i === maxDepth)
            break;
          node = node.parentNode;
        }
        return ancestors;
      },
      /***
       * grabArticle - Using a variety of metrics (content score, classname, element types), find the content that is
       *         most likely to be the stuff a user wants to read. Then return it wrapped up in a div.
       *
       * @param page a document to run upon. Needs to be a full document, complete with body.
       * @return Element
      **/
      _grabArticle: function(page) {
        this.log("**** grabArticle ****");
        var doc = this._doc;
        var isPaging = page !== null;
        page = page ? page : this._doc.body;
        if (!page) {
          this.log("No body found in document. Abort.");
          return null;
        }
        var pageCacheHtml = page.innerHTML;
        while (true) {
          this.log("Starting grabArticle loop");
          var stripUnlikelyCandidates = this._flagIsActive(this.FLAG_STRIP_UNLIKELYS);
          var elementsToScore = [];
          var node = this._doc.documentElement;
          let shouldRemoveTitleHeader = true;
          while (node) {
            if (node.tagName === "HTML") {
              this._articleLang = node.getAttribute("lang");
            }
            var matchString = node.className + " " + node.id;
            if (!this._isProbablyVisible(node)) {
              this.log("Removing hidden node - " + matchString);
              node = this._removeAndGetNext(node);
              continue;
            }
            if (node.getAttribute("aria-modal") == "true" && node.getAttribute("role") == "dialog") {
              node = this._removeAndGetNext(node);
              continue;
            }
            if (this._checkByline(node, matchString)) {
              node = this._removeAndGetNext(node);
              continue;
            }
            if (shouldRemoveTitleHeader && this._headerDuplicatesTitle(node)) {
              this.log("Removing header: ", node.textContent.trim(), this._articleTitle.trim());
              shouldRemoveTitleHeader = false;
              node = this._removeAndGetNext(node);
              continue;
            }
            if (stripUnlikelyCandidates) {
              if (this.REGEXPS.unlikelyCandidates.test(matchString) && !this.REGEXPS.okMaybeItsACandidate.test(matchString) && !this._hasAncestorTag(node, "table") && !this._hasAncestorTag(node, "code") && node.tagName !== "BODY" && node.tagName !== "A") {
                this.log("Removing unlikely candidate - " + matchString);
                node = this._removeAndGetNext(node);
                continue;
              }
              if (this.UNLIKELY_ROLES.includes(node.getAttribute("role"))) {
                this.log("Removing content with role " + node.getAttribute("role") + " - " + matchString);
                node = this._removeAndGetNext(node);
                continue;
              }
            }
            if ((node.tagName === "DIV" || node.tagName === "SECTION" || node.tagName === "HEADER" || node.tagName === "H1" || node.tagName === "H2" || node.tagName === "H3" || node.tagName === "H4" || node.tagName === "H5" || node.tagName === "H6") && this._isElementWithoutContent(node)) {
              node = this._removeAndGetNext(node);
              continue;
            }
            if (this.DEFAULT_TAGS_TO_SCORE.indexOf(node.tagName) !== -1) {
              elementsToScore.push(node);
            }
            if (node.tagName === "DIV") {
              var p = null;
              var childNode = node.firstChild;
              while (childNode) {
                var nextSibling2 = childNode.nextSibling;
                if (this._isPhrasingContent(childNode)) {
                  if (p !== null) {
                    p.appendChild(childNode);
                  } else if (!this._isWhitespace(childNode)) {
                    p = doc.createElement("p");
                    node.replaceChild(p, childNode);
                    p.appendChild(childNode);
                  }
                } else if (p !== null) {
                  while (p.lastChild && this._isWhitespace(p.lastChild)) {
                    p.removeChild(p.lastChild);
                  }
                  p = null;
                }
                childNode = nextSibling2;
              }
              if (this._hasSingleTagInsideElement(node, "P") && this._getLinkDensity(node) < 0.25) {
                var newNode = node.children[0];
                node.parentNode.replaceChild(newNode, node);
                node = newNode;
                elementsToScore.push(node);
              } else if (!this._hasChildBlockElement(node)) {
                node = this._setNodeTag(node, "P");
                elementsToScore.push(node);
              }
            }
            node = this._getNextNode(node);
          }
          var candidates = [];
          this._forEachNode(elementsToScore, function(elementToScore) {
            if (!elementToScore.parentNode || typeof elementToScore.parentNode.tagName === "undefined")
              return;
            var innerText2 = this._getInnerText(elementToScore);
            if (innerText2.length < 25)
              return;
            var ancestors2 = this._getNodeAncestors(elementToScore, 5);
            if (ancestors2.length === 0)
              return;
            var contentScore = 0;
            contentScore += 1;
            contentScore += innerText2.split(",").length;
            contentScore += Math.min(Math.floor(innerText2.length / 100), 3);
            this._forEachNode(ancestors2, function(ancestor, level) {
              if (!ancestor.tagName || !ancestor.parentNode || typeof ancestor.parentNode.tagName === "undefined")
                return;
              if (typeof ancestor.readability === "undefined") {
                this._initializeNode(ancestor);
                candidates.push(ancestor);
              }
              if (level === 0)
                var scoreDivider = 1;
              else if (level === 1)
                scoreDivider = 2;
              else
                scoreDivider = level * 3;
              ancestor.readability.contentScore += contentScore / scoreDivider;
            });
          });
          var topCandidates = [];
          for (var c = 0, cl = candidates.length; c < cl; c += 1) {
            var candidate = candidates[c];
            var candidateScore = candidate.readability.contentScore * (1 - this._getLinkDensity(candidate));
            candidate.readability.contentScore = candidateScore;
            this.log("Candidate:", candidate, "with score " + candidateScore);
            for (var t = 0; t < this._nbTopCandidates; t++) {
              var aTopCandidate = topCandidates[t];
              if (!aTopCandidate || candidateScore > aTopCandidate.readability.contentScore) {
                topCandidates.splice(t, 0, candidate);
                if (topCandidates.length > this._nbTopCandidates)
                  topCandidates.pop();
                break;
              }
            }
          }
          var topCandidate = topCandidates[0] || null;
          var neededToCreateTopCandidate = false;
          var parentOfTopCandidate;
          if (topCandidate === null || topCandidate.tagName === "BODY") {
            topCandidate = doc.createElement("DIV");
            neededToCreateTopCandidate = true;
            while (page.firstChild) {
              this.log("Moving child out:", page.firstChild);
              topCandidate.appendChild(page.firstChild);
            }
            page.appendChild(topCandidate);
            this._initializeNode(topCandidate);
          } else if (topCandidate) {
            var alternativeCandidateAncestors = [];
            for (var i = 1; i < topCandidates.length; i++) {
              if (topCandidates[i].readability.contentScore / topCandidate.readability.contentScore >= 0.75) {
                alternativeCandidateAncestors.push(this._getNodeAncestors(topCandidates[i]));
              }
            }
            var MINIMUM_TOPCANDIDATES = 3;
            if (alternativeCandidateAncestors.length >= MINIMUM_TOPCANDIDATES) {
              parentOfTopCandidate = topCandidate.parentNode;
              while (parentOfTopCandidate.tagName !== "BODY") {
                var listsContainingThisAncestor = 0;
                for (var ancestorIndex = 0; ancestorIndex < alternativeCandidateAncestors.length && listsContainingThisAncestor < MINIMUM_TOPCANDIDATES; ancestorIndex++) {
                  listsContainingThisAncestor += Number(alternativeCandidateAncestors[ancestorIndex].includes(parentOfTopCandidate));
                }
                if (listsContainingThisAncestor >= MINIMUM_TOPCANDIDATES) {
                  topCandidate = parentOfTopCandidate;
                  break;
                }
                parentOfTopCandidate = parentOfTopCandidate.parentNode;
              }
            }
            if (!topCandidate.readability) {
              this._initializeNode(topCandidate);
            }
            parentOfTopCandidate = topCandidate.parentNode;
            var lastScore = topCandidate.readability.contentScore;
            var scoreThreshold = lastScore / 3;
            while (parentOfTopCandidate.tagName !== "BODY") {
              if (!parentOfTopCandidate.readability) {
                parentOfTopCandidate = parentOfTopCandidate.parentNode;
                continue;
              }
              var parentScore = parentOfTopCandidate.readability.contentScore;
              if (parentScore < scoreThreshold)
                break;
              if (parentScore > lastScore) {
                topCandidate = parentOfTopCandidate;
                break;
              }
              lastScore = parentOfTopCandidate.readability.contentScore;
              parentOfTopCandidate = parentOfTopCandidate.parentNode;
            }
            parentOfTopCandidate = topCandidate.parentNode;
            while (parentOfTopCandidate.tagName != "BODY" && parentOfTopCandidate.children.length == 1) {
              topCandidate = parentOfTopCandidate;
              parentOfTopCandidate = topCandidate.parentNode;
            }
            if (!topCandidate.readability) {
              this._initializeNode(topCandidate);
            }
          }
          var articleContent = doc.createElement("DIV");
          if (isPaging)
            articleContent.id = "readability-content";
          var siblingScoreThreshold = Math.max(10, topCandidate.readability.contentScore * 0.2);
          parentOfTopCandidate = topCandidate.parentNode;
          var siblings = parentOfTopCandidate.children;
          for (var s = 0, sl = siblings.length; s < sl; s++) {
            var sibling = siblings[s];
            var append4 = false;
            this.log("Looking at sibling node:", sibling, sibling.readability ? "with score " + sibling.readability.contentScore : "");
            this.log("Sibling has score", sibling.readability ? sibling.readability.contentScore : "Unknown");
            if (sibling === topCandidate) {
              append4 = true;
            } else {
              var contentBonus = 0;
              if (sibling.className === topCandidate.className && topCandidate.className !== "")
                contentBonus += topCandidate.readability.contentScore * 0.2;
              if (sibling.readability && sibling.readability.contentScore + contentBonus >= siblingScoreThreshold) {
                append4 = true;
              } else if (sibling.nodeName === "P") {
                var linkDensity = this._getLinkDensity(sibling);
                var nodeContent = this._getInnerText(sibling);
                var nodeLength = nodeContent.length;
                if (nodeLength > 80 && linkDensity < 0.25) {
                  append4 = true;
                } else if (nodeLength < 80 && nodeLength > 0 && linkDensity === 0 && nodeContent.search(/\.( |$)/) !== -1) {
                  append4 = true;
                }
              }
            }
            if (append4) {
              this.log("Appending node:", sibling);
              if (this.ALTER_TO_DIV_EXCEPTIONS.indexOf(sibling.nodeName) === -1) {
                this.log("Altering sibling:", sibling, "to div.");
                sibling = this._setNodeTag(sibling, "DIV");
              }
              articleContent.appendChild(sibling);
              siblings = parentOfTopCandidate.children;
              s -= 1;
              sl -= 1;
            }
          }
          if (this._debug)
            this.log("Article content pre-prep: " + articleContent.innerHTML);
          this._prepArticle(articleContent);
          if (this._debug)
            this.log("Article content post-prep: " + articleContent.innerHTML);
          if (neededToCreateTopCandidate) {
            topCandidate.id = "readability-page-1";
            topCandidate.className = "page";
          } else {
            var div = doc.createElement("DIV");
            div.id = "readability-page-1";
            div.className = "page";
            while (articleContent.firstChild) {
              div.appendChild(articleContent.firstChild);
            }
            articleContent.appendChild(div);
          }
          if (this._debug)
            this.log("Article content after paging: " + articleContent.innerHTML);
          var parseSuccessful = true;
          var textLength = this._getInnerText(articleContent, true).length;
          if (textLength < this._charThreshold) {
            parseSuccessful = false;
            page.innerHTML = pageCacheHtml;
            if (this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)) {
              this._removeFlag(this.FLAG_STRIP_UNLIKELYS);
              this._attempts.push({ articleContent, textLength });
            } else if (this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) {
              this._removeFlag(this.FLAG_WEIGHT_CLASSES);
              this._attempts.push({ articleContent, textLength });
            } else if (this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) {
              this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY);
              this._attempts.push({ articleContent, textLength });
            } else {
              this._attempts.push({ articleContent, textLength });
              this._attempts.sort(function(a, b) {
                return b.textLength - a.textLength;
              });
              if (!this._attempts[0].textLength) {
                return null;
              }
              articleContent = this._attempts[0].articleContent;
              parseSuccessful = true;
            }
          }
          if (parseSuccessful) {
            var ancestors = [parentOfTopCandidate, topCandidate].concat(this._getNodeAncestors(parentOfTopCandidate));
            this._someNode(ancestors, function(ancestor) {
              if (!ancestor.tagName)
                return false;
              var articleDir = ancestor.getAttribute("dir");
              if (articleDir) {
                this._articleDir = articleDir;
                return true;
              }
              return false;
            });
            return articleContent;
          }
        }
      },
      /**
       * Check whether the input string could be a byline.
       * This verifies that the input is a string, and that the length
       * is less than 100 chars.
       *
       * @param possibleByline {string} - a string to check whether its a byline.
       * @return Boolean - whether the input string is a byline.
       */
      _isValidByline: function(byline) {
        if (typeof byline == "string" || byline instanceof String) {
          byline = byline.trim();
          return byline.length > 0 && byline.length < 100;
        }
        return false;
      },
      /**
       * Converts some of the common HTML entities in string to their corresponding characters.
       *
       * @param str {string} - a string to unescape.
       * @return string without HTML entity.
       */
      _unescapeHtmlEntities: function(str) {
        if (!str) {
          return str;
        }
        var htmlEscapeMap = this.HTML_ESCAPE_MAP;
        return str.replace(/&(quot|amp|apos|lt|gt);/g, function(_, tag) {
          return htmlEscapeMap[tag];
        }).replace(/&#(?:x([0-9a-z]{1,4})|([0-9]{1,4}));/gi, function(_, hex, numStr) {
          var num = parseInt(hex || numStr, hex ? 16 : 10);
          return String.fromCharCode(num);
        });
      },
      /**
       * Try to extract metadata from JSON-LD object.
       * For now, only Schema.org objects of type Article or its subtypes are supported.
       * @return Object with any metadata that could be extracted (possibly none)
       */
      _getJSONLD: function(doc) {
        var scripts = this._getAllNodesWithTag(doc, ["script"]);
        var metadata;
        this._forEachNode(scripts, function(jsonLdElement) {
          if (!metadata && jsonLdElement.getAttribute("type") === "application/ld+json") {
            try {
              var content = jsonLdElement.textContent.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, "");
              var parsed = JSON.parse(content);
              if (!parsed["@context"] || !parsed["@context"].match(/^https?\:\/\/schema\.org$/)) {
                return;
              }
              if (!parsed["@type"] && Array.isArray(parsed["@graph"])) {
                parsed = parsed["@graph"].find(function(it) {
                  return (it["@type"] || "").match(
                    this.REGEXPS.jsonLdArticleTypes
                  );
                });
              }
              if (!parsed || !parsed["@type"] || !parsed["@type"].match(this.REGEXPS.jsonLdArticleTypes)) {
                return;
              }
              metadata = {};
              if (typeof parsed.name === "string" && typeof parsed.headline === "string" && parsed.name !== parsed.headline) {
                var title = this._getArticleTitle();
                var nameMatches = this._textSimilarity(parsed.name, title) > 0.75;
                var headlineMatches = this._textSimilarity(parsed.headline, title) > 0.75;
                if (headlineMatches && !nameMatches) {
                  metadata.title = parsed.headline;
                } else {
                  metadata.title = parsed.name;
                }
              } else if (typeof parsed.name === "string") {
                metadata.title = parsed.name.trim();
              } else if (typeof parsed.headline === "string") {
                metadata.title = parsed.headline.trim();
              }
              if (parsed.author) {
                if (typeof parsed.author.name === "string") {
                  metadata.byline = parsed.author.name.trim();
                } else if (Array.isArray(parsed.author) && parsed.author[0] && typeof parsed.author[0].name === "string") {
                  metadata.byline = parsed.author.filter(function(author) {
                    return author && typeof author.name === "string";
                  }).map(function(author) {
                    return author.name.trim();
                  }).join(", ");
                }
              }
              if (typeof parsed.description === "string") {
                metadata.excerpt = parsed.description.trim();
              }
              if (parsed.publisher && typeof parsed.publisher.name === "string") {
                metadata.siteName = parsed.publisher.name.trim();
              }
              return;
            } catch (err) {
              this.log(err.message);
            }
          }
        });
        return metadata ? metadata : {};
      },
      /**
       * Attempts to get excerpt and byline metadata for the article.
       *
       * @param {Object} jsonld — object containing any metadata that
       * could be extracted from JSON-LD object.
       *
       * @return Object with optional "excerpt" and "byline" properties
       */
      _getArticleMetadata: function(jsonld) {
        var metadata = {};
        var values = {};
        var metaElements = this._doc.getElementsByTagName("meta");
        var propertyPattern = /\s*(dc|dcterm|og|twitter)\s*:\s*(author|creator|description|title|site_name)\s*/gi;
        var namePattern = /^\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\s*[\.:]\s*)?(author|creator|description|title|site_name)\s*$/i;
        this._forEachNode(metaElements, function(element) {
          var elementName = element.getAttribute("name");
          var elementProperty = element.getAttribute("property");
          var content = element.getAttribute("content");
          if (!content) {
            return;
          }
          var matches2 = null;
          var name = null;
          if (elementProperty) {
            matches2 = elementProperty.match(propertyPattern);
            if (matches2) {
              name = matches2[0].toLowerCase().replace(/\s/g, "");
              values[name] = content.trim();
            }
          }
          if (!matches2 && elementName && namePattern.test(elementName)) {
            name = elementName;
            if (content) {
              name = name.toLowerCase().replace(/\s/g, "").replace(/\./g, ":");
              values[name] = content.trim();
            }
          }
        });
        metadata.title = jsonld.title || values["dc:title"] || values["dcterm:title"] || values["og:title"] || values["weibo:article:title"] || values["weibo:webpage:title"] || values["title"] || values["twitter:title"];
        if (!metadata.title) {
          metadata.title = this._getArticleTitle();
        }
        metadata.byline = jsonld.byline || values["dc:creator"] || values["dcterm:creator"] || values["author"];
        metadata.excerpt = jsonld.excerpt || values["dc:description"] || values["dcterm:description"] || values["og:description"] || values["weibo:article:description"] || values["weibo:webpage:description"] || values["description"] || values["twitter:description"];
        metadata.siteName = jsonld.siteName || values["og:site_name"];
        metadata.title = this._unescapeHtmlEntities(metadata.title);
        metadata.byline = this._unescapeHtmlEntities(metadata.byline);
        metadata.excerpt = this._unescapeHtmlEntities(metadata.excerpt);
        metadata.siteName = this._unescapeHtmlEntities(metadata.siteName);
        return metadata;
      },
      /**
       * Check if node is image, or if node contains exactly only one image
       * whether as a direct child or as its descendants.
       *
       * @param Element
      **/
      _isSingleImage: function(node) {
        if (node.tagName === "IMG") {
          return true;
        }
        if (node.children.length !== 1 || node.textContent.trim() !== "") {
          return false;
        }
        return this._isSingleImage(node.children[0]);
      },
      /**
       * Find all <noscript> that are located after <img> nodes, and which contain only one
       * <img> element. Replace the first image with the image from inside the <noscript> tag,
       * and remove the <noscript> tag. This improves the quality of the images we use on
       * some sites (e.g. Medium).
       *
       * @param Element
      **/
      _unwrapNoscriptImages: function(doc) {
        var imgs = Array.from(doc.getElementsByTagName("img"));
        this._forEachNode(imgs, function(img) {
          for (var i = 0; i < img.attributes.length; i++) {
            var attr = img.attributes[i];
            switch (attr.name) {
              case "src":
              case "srcset":
              case "data-src":
              case "data-srcset":
                return;
            }
            if (/\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
              return;
            }
          }
          img.parentNode.removeChild(img);
        });
        var noscripts = Array.from(doc.getElementsByTagName("noscript"));
        this._forEachNode(noscripts, function(noscript) {
          var tmp = doc.createElement("div");
          tmp.innerHTML = noscript.innerHTML;
          if (!this._isSingleImage(tmp)) {
            return;
          }
          var prevElement = noscript.previousElementSibling;
          if (prevElement && this._isSingleImage(prevElement)) {
            var prevImg = prevElement;
            if (prevImg.tagName !== "IMG") {
              prevImg = prevElement.getElementsByTagName("img")[0];
            }
            var newImg = tmp.getElementsByTagName("img")[0];
            for (var i = 0; i < prevImg.attributes.length; i++) {
              var attr = prevImg.attributes[i];
              if (attr.value === "") {
                continue;
              }
              if (attr.name === "src" || attr.name === "srcset" || /\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
                if (newImg.getAttribute(attr.name) === attr.value) {
                  continue;
                }
                var attrName = attr.name;
                if (newImg.hasAttribute(attrName)) {
                  attrName = "data-old-" + attrName;
                }
                newImg.setAttribute(attrName, attr.value);
              }
            }
            noscript.parentNode.replaceChild(tmp.firstElementChild, prevElement);
          }
        });
      },
      /**
       * Removes script tags from the document.
       *
       * @param Element
      **/
      _removeScripts: function(doc) {
        this._removeNodes(this._getAllNodesWithTag(doc, ["script", "noscript"]));
      },
      /**
       * Check if this node has only whitespace and a single element with given tag
       * Returns false if the DIV node contains non-empty text nodes
       * or if it contains no element with given tag or more than 1 element.
       *
       * @param Element
       * @param string tag of child element
      **/
      _hasSingleTagInsideElement: function(element, tag) {
        if (element.children.length != 1 || element.children[0].tagName !== tag) {
          return false;
        }
        return !this._someNode(element.childNodes, function(node) {
          return node.nodeType === this.TEXT_NODE && this.REGEXPS.hasContent.test(node.textContent);
        });
      },
      _isElementWithoutContent: function(node) {
        return node.nodeType === this.ELEMENT_NODE && node.textContent.trim().length == 0 && (node.children.length == 0 || node.children.length == node.getElementsByTagName("br").length + node.getElementsByTagName("hr").length);
      },
      /**
       * Determine whether element has any children block level elements.
       *
       * @param Element
       */
      _hasChildBlockElement: function(element) {
        return this._someNode(element.childNodes, function(node) {
          return this.DIV_TO_P_ELEMS.has(node.tagName) || this._hasChildBlockElement(node);
        });
      },
      /***
       * Determine if a node qualifies as phrasing content.
       * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
      **/
      _isPhrasingContent: function(node) {
        return node.nodeType === this.TEXT_NODE || this.PHRASING_ELEMS.indexOf(node.tagName) !== -1 || (node.tagName === "A" || node.tagName === "DEL" || node.tagName === "INS") && this._everyNode(node.childNodes, this._isPhrasingContent);
      },
      _isWhitespace: function(node) {
        return node.nodeType === this.TEXT_NODE && node.textContent.trim().length === 0 || node.nodeType === this.ELEMENT_NODE && node.tagName === "BR";
      },
      /**
       * Get the inner text of a node - cross browser compatibly.
       * This also strips out any excess whitespace to be found.
       *
       * @param Element
       * @param Boolean normalizeSpaces (default: true)
       * @return string
      **/
      _getInnerText: function(e, normalizeSpaces) {
        normalizeSpaces = typeof normalizeSpaces === "undefined" ? true : normalizeSpaces;
        var textContent2 = e.textContent.trim();
        if (normalizeSpaces) {
          return textContent2.replace(this.REGEXPS.normalize, " ");
        }
        return textContent2;
      },
      /**
       * Get the number of times a string s appears in the node e.
       *
       * @param Element
       * @param string - what to split on. Default is ","
       * @return number (integer)
      **/
      _getCharCount: function(e, s) {
        s = s || ",";
        return this._getInnerText(e).split(s).length - 1;
      },
      /**
       * Remove the style attribute on every e and under.
       * TODO: Test if getElementsByTagName(*) is faster.
       *
       * @param Element
       * @return void
      **/
      _cleanStyles: function(e) {
        if (!e || e.tagName.toLowerCase() === "svg")
          return;
        for (var i = 0; i < this.PRESENTATIONAL_ATTRIBUTES.length; i++) {
          e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[i]);
        }
        if (this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(e.tagName) !== -1) {
          e.removeAttribute("width");
          e.removeAttribute("height");
        }
        var cur = e.firstElementChild;
        while (cur !== null) {
          this._cleanStyles(cur);
          cur = cur.nextElementSibling;
        }
      },
      /**
       * Get the density of links as a percentage of the content
       * This is the amount of text that is inside a link divided by the total text in the node.
       *
       * @param Element
       * @return number (float)
      **/
      _getLinkDensity: function(element) {
        var textLength = this._getInnerText(element).length;
        if (textLength === 0)
          return 0;
        var linkLength = 0;
        this._forEachNode(element.getElementsByTagName("a"), function(linkNode) {
          var href = linkNode.getAttribute("href");
          var coefficient = href && this.REGEXPS.hashUrl.test(href) ? 0.3 : 1;
          linkLength += this._getInnerText(linkNode).length * coefficient;
        });
        return linkLength / textLength;
      },
      /**
       * Get an elements class/id weight. Uses regular expressions to tell if this
       * element looks good or bad.
       *
       * @param Element
       * @return number (Integer)
      **/
      _getClassWeight: function(e) {
        if (!this._flagIsActive(this.FLAG_WEIGHT_CLASSES))
          return 0;
        var weight = 0;
        if (typeof e.className === "string" && e.className !== "") {
          if (this.REGEXPS.negative.test(e.className))
            weight -= 25;
          if (this.REGEXPS.positive.test(e.className))
            weight += 25;
        }
        if (typeof e.id === "string" && e.id !== "") {
          if (this.REGEXPS.negative.test(e.id))
            weight -= 25;
          if (this.REGEXPS.positive.test(e.id))
            weight += 25;
        }
        return weight;
      },
      /**
       * Clean a node of all elements of type "tag".
       * (Unless it's a youtube/vimeo video. People love movies.)
       *
       * @param Element
       * @param string tag to clean
       * @return void
       **/
      _clean: function(e, tag) {
        var isEmbed = ["object", "embed", "iframe"].indexOf(tag) !== -1;
        this._removeNodes(this._getAllNodesWithTag(e, [tag]), function(element) {
          if (isEmbed) {
            for (var i = 0; i < element.attributes.length; i++) {
              if (this._allowedVideoRegex.test(element.attributes[i].value)) {
                return false;
              }
            }
            if (element.tagName === "object" && this._allowedVideoRegex.test(element.innerHTML)) {
              return false;
            }
          }
          return true;
        });
      },
      /**
       * Check if a given node has one of its ancestor tag name matching the
       * provided one.
       * @param  HTMLElement node
       * @param  String      tagName
       * @param  Number      maxDepth
       * @param  Function    filterFn a filter to invoke to determine whether this node 'counts'
       * @return Boolean
       */
      _hasAncestorTag: function(node, tagName18, maxDepth, filterFn) {
        maxDepth = maxDepth || 3;
        tagName18 = tagName18.toUpperCase();
        var depth = 0;
        while (node.parentNode) {
          if (maxDepth > 0 && depth > maxDepth)
            return false;
          if (node.parentNode.tagName === tagName18 && (!filterFn || filterFn(node.parentNode)))
            return true;
          node = node.parentNode;
          depth++;
        }
        return false;
      },
      /**
       * Return an object indicating how many rows and columns this table has.
       */
      _getRowAndColumnCount: function(table) {
        var rows = 0;
        var columns = 0;
        var trs = table.getElementsByTagName("tr");
        for (var i = 0; i < trs.length; i++) {
          var rowspan = trs[i].getAttribute("rowspan") || 0;
          if (rowspan) {
            rowspan = parseInt(rowspan, 10);
          }
          rows += rowspan || 1;
          var columnsInThisRow = 0;
          var cells = trs[i].getElementsByTagName("td");
          for (var j = 0; j < cells.length; j++) {
            var colspan = cells[j].getAttribute("colspan") || 0;
            if (colspan) {
              colspan = parseInt(colspan, 10);
            }
            columnsInThisRow += colspan || 1;
          }
          columns = Math.max(columns, columnsInThisRow);
        }
        return { rows, columns };
      },
      /**
       * Look for 'data' (as opposed to 'layout') tables, for which we use
       * similar checks as
       * https://searchfox.org/mozilla-central/rev/f82d5c549f046cb64ce5602bfd894b7ae807c8f8/accessible/generic/TableAccessible.cpp#19
       */
      _markDataTables: function(root) {
        var tables = root.getElementsByTagName("table");
        for (var i = 0; i < tables.length; i++) {
          var table = tables[i];
          var role = table.getAttribute("role");
          if (role == "presentation") {
            table._readabilityDataTable = false;
            continue;
          }
          var datatable = table.getAttribute("datatable");
          if (datatable == "0") {
            table._readabilityDataTable = false;
            continue;
          }
          var summary = table.getAttribute("summary");
          if (summary) {
            table._readabilityDataTable = true;
            continue;
          }
          var caption = table.getElementsByTagName("caption")[0];
          if (caption && caption.childNodes.length > 0) {
            table._readabilityDataTable = true;
            continue;
          }
          var dataTableDescendants = ["col", "colgroup", "tfoot", "thead", "th"];
          var descendantExists = function(tag) {
            return !!table.getElementsByTagName(tag)[0];
          };
          if (dataTableDescendants.some(descendantExists)) {
            this.log("Data table because found data-y descendant");
            table._readabilityDataTable = true;
            continue;
          }
          if (table.getElementsByTagName("table")[0]) {
            table._readabilityDataTable = false;
            continue;
          }
          var sizeInfo = this._getRowAndColumnCount(table);
          if (sizeInfo.rows >= 10 || sizeInfo.columns > 4) {
            table._readabilityDataTable = true;
            continue;
          }
          table._readabilityDataTable = sizeInfo.rows * sizeInfo.columns > 10;
        }
      },
      /* convert images and figures that have properties like data-src into images that can be loaded without JS */
      _fixLazyImages: function(root) {
        this._forEachNode(this._getAllNodesWithTag(root, ["img", "picture", "figure"]), function(elem) {
          if (elem.src && this.REGEXPS.b64DataUrl.test(elem.src)) {
            var parts = this.REGEXPS.b64DataUrl.exec(elem.src);
            if (parts[1] === "image/svg+xml") {
              return;
            }
            var srcCouldBeRemoved = false;
            for (var i = 0; i < elem.attributes.length; i++) {
              var attr = elem.attributes[i];
              if (attr.name === "src") {
                continue;
              }
              if (/\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
                srcCouldBeRemoved = true;
                break;
              }
            }
            if (srcCouldBeRemoved) {
              var b64starts = elem.src.search(/base64\s*/i) + 7;
              var b64length = elem.src.length - b64starts;
              if (b64length < 133) {
                elem.removeAttribute("src");
              }
            }
          }
          if ((elem.src || elem.srcset && elem.srcset != "null") && elem.className.toLowerCase().indexOf("lazy") === -1) {
            return;
          }
          for (var j = 0; j < elem.attributes.length; j++) {
            attr = elem.attributes[j];
            if (attr.name === "src" || attr.name === "srcset" || attr.name === "alt") {
              continue;
            }
            var copyTo = null;
            if (/\.(jpg|jpeg|png|webp)\s+\d/.test(attr.value)) {
              copyTo = "srcset";
            } else if (/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(attr.value)) {
              copyTo = "src";
            }
            if (copyTo) {
              if (elem.tagName === "IMG" || elem.tagName === "PICTURE") {
                elem.setAttribute(copyTo, attr.value);
              } else if (elem.tagName === "FIGURE" && !this._getAllNodesWithTag(elem, ["img", "picture"]).length) {
                var img = this._doc.createElement("img");
                img.setAttribute(copyTo, attr.value);
                elem.appendChild(img);
              }
            }
          }
        });
      },
      _getTextDensity: function(e, tags) {
        var textLength = this._getInnerText(e, true).length;
        if (textLength === 0) {
          return 0;
        }
        var childrenLength = 0;
        var children = this._getAllNodesWithTag(e, tags);
        this._forEachNode(children, (child) => childrenLength += this._getInnerText(child, true).length);
        return childrenLength / textLength;
      },
      /**
       * Clean an element of all tags of type "tag" if they look fishy.
       * "Fishy" is an algorithm based on content length, classnames, link density, number of images & embeds, etc.
       *
       * @return void
       **/
      _cleanConditionally: function(e, tag) {
        if (!this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY))
          return;
        this._removeNodes(this._getAllNodesWithTag(e, [tag]), function(node) {
          var isDataTable = function(t) {
            return t._readabilityDataTable;
          };
          var isList = tag === "ul" || tag === "ol";
          if (!isList) {
            var listLength = 0;
            var listNodes = this._getAllNodesWithTag(node, ["ul", "ol"]);
            this._forEachNode(listNodes, (list) => listLength += this._getInnerText(list).length);
            isList = listLength / this._getInnerText(node).length > 0.9;
          }
          if (tag === "table" && isDataTable(node)) {
            return false;
          }
          if (this._hasAncestorTag(node, "table", -1, isDataTable)) {
            return false;
          }
          if (this._hasAncestorTag(node, "code")) {
            return false;
          }
          var weight = this._getClassWeight(node);
          this.log("Cleaning Conditionally", node);
          var contentScore = 0;
          if (weight + contentScore < 0) {
            return true;
          }
          if (this._getCharCount(node, ",") < 10) {
            var p = node.getElementsByTagName("p").length;
            var img = node.getElementsByTagName("img").length;
            var li = node.getElementsByTagName("li").length - 100;
            var input = node.getElementsByTagName("input").length;
            var headingDensity = this._getTextDensity(node, ["h1", "h2", "h3", "h4", "h5", "h6"]);
            var embedCount = 0;
            var embeds = this._getAllNodesWithTag(node, ["object", "embed", "iframe"]);
            for (var i = 0; i < embeds.length; i++) {
              for (var j = 0; j < embeds[i].attributes.length; j++) {
                if (this._allowedVideoRegex.test(embeds[i].attributes[j].value)) {
                  return false;
                }
              }
              if (embeds[i].tagName === "object" && this._allowedVideoRegex.test(embeds[i].innerHTML)) {
                return false;
              }
              embedCount++;
            }
            var linkDensity = this._getLinkDensity(node);
            var contentLength = this._getInnerText(node).length;
            var haveToRemove = img > 1 && p / img < 0.5 && !this._hasAncestorTag(node, "figure") || !isList && li > p || input > Math.floor(p / 3) || !isList && headingDensity < 0.9 && contentLength < 25 && (img === 0 || img > 2) && !this._hasAncestorTag(node, "figure") || !isList && weight < 25 && linkDensity > 0.2 || weight >= 25 && linkDensity > 0.5 || (embedCount === 1 && contentLength < 75 || embedCount > 1);
            if (isList && haveToRemove) {
              for (var x = 0; x < node.children.length; x++) {
                let child = node.children[x];
                if (child.children.length > 1) {
                  return haveToRemove;
                }
              }
              let li_count = node.getElementsByTagName("li").length;
              if (img == li_count) {
                return false;
              }
            }
            return haveToRemove;
          }
          return false;
        });
      },
      /**
       * Clean out elements that match the specified conditions
       *
       * @param Element
       * @param Function determines whether a node should be removed
       * @return void
       **/
      _cleanMatchedNodes: function(e, filter2) {
        var endOfSearchMarkerNode = this._getNextNode(e, true);
        var next = this._getNextNode(e);
        while (next && next != endOfSearchMarkerNode) {
          if (filter2.call(this, next, next.className + " " + next.id)) {
            next = this._removeAndGetNext(next);
          } else {
            next = this._getNextNode(next);
          }
        }
      },
      /**
       * Clean out spurious headers from an Element.
       *
       * @param Element
       * @return void
      **/
      _cleanHeaders: function(e) {
        let headingNodes = this._getAllNodesWithTag(e, ["h1", "h2"]);
        this._removeNodes(headingNodes, function(node) {
          let shouldRemove = this._getClassWeight(node) < 0;
          if (shouldRemove) {
            this.log("Removing header with low class weight:", node);
          }
          return shouldRemove;
        });
      },
      /**
       * Check if this node is an H1 or H2 element whose content is mostly
       * the same as the article title.
       *
       * @param Element  the node to check.
       * @return boolean indicating whether this is a title-like header.
       */
      _headerDuplicatesTitle: function(node) {
        if (node.tagName != "H1" && node.tagName != "H2") {
          return false;
        }
        var heading = this._getInnerText(node, false);
        this.log("Evaluating similarity of header:", heading, this._articleTitle);
        return this._textSimilarity(this._articleTitle, heading) > 0.75;
      },
      _flagIsActive: function(flag) {
        return (this._flags & flag) > 0;
      },
      _removeFlag: function(flag) {
        this._flags = this._flags & ~flag;
      },
      _isProbablyVisible: function(node) {
        return (!node.style || node.style.display != "none") && !node.hasAttribute("hidden") && (!node.hasAttribute("aria-hidden") || node.getAttribute("aria-hidden") != "true" || node.className && node.className.indexOf && node.className.indexOf("fallback-image") !== -1);
      },
      /**
       * Runs readability.
       *
       * Workflow:
       *  1. Prep the document by removing script tags, css, etc.
       *  2. Build readability's DOM tree.
       *  3. Grab the article content from the current dom tree.
       *  4. Replace the current DOM tree with the new one.
       *  5. Read peacefully.
       *
       * @return void
       **/
      parse: function() {
        if (this._maxElemsToParse > 0) {
          var numTags = this._doc.getElementsByTagName("*").length;
          if (numTags > this._maxElemsToParse) {
            throw new Error("Aborting parsing document; " + numTags + " elements found");
          }
        }
        this._unwrapNoscriptImages(this._doc);
        var jsonLd = this._disableJSONLD ? {} : this._getJSONLD(this._doc);
        this._removeScripts(this._doc);
        this._prepDocument();
        var metadata = this._getArticleMetadata(jsonLd);
        this._articleTitle = metadata.title;
        var articleContent = this._grabArticle();
        if (!articleContent)
          return null;
        this.log("Grabbed: " + articleContent.innerHTML);
        this._postProcessContent(articleContent);
        if (!metadata.excerpt) {
          var paragraphs = articleContent.getElementsByTagName("p");
          if (paragraphs.length > 0) {
            metadata.excerpt = paragraphs[0].textContent.trim();
          }
        }
        var textContent2 = articleContent.textContent;
        return {
          title: this._articleTitle,
          byline: metadata.byline || this._articleByline,
          dir: this._articleDir,
          lang: this._articleLang,
          content: this._serializer(articleContent),
          textContent: textContent2,
          length: textContent2.length,
          excerpt: metadata.excerpt,
          siteName: metadata.siteName || this._articleSiteName
        };
      }
    };
    if (typeof module2 === "object") {
      module2.exports = Readability;
    }
  }
});

// node_modules/@mozilla/readability/Readability-readerable.js
var require_Readability_readerable = __commonJS({
  "node_modules/@mozilla/readability/Readability-readerable.js"(exports, module2) {
    var REGEXPS = {
      // NOTE: These two regular expressions are duplicated in
      // Readability.js. Please keep both copies in sync.
      unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
      okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i
    };
    function isNodeVisible(node) {
      return (!node.style || node.style.display != "none") && !node.hasAttribute("hidden") && (!node.hasAttribute("aria-hidden") || node.getAttribute("aria-hidden") != "true" || node.className && node.className.indexOf && node.className.indexOf("fallback-image") !== -1);
    }
    function isProbablyReaderable(doc, options = {}) {
      if (typeof options == "function") {
        options = { visibilityChecker: options };
      }
      var defaultOptions2 = { minScore: 20, minContentLength: 140, visibilityChecker: isNodeVisible };
      options = Object.assign(defaultOptions2, options);
      var nodes = doc.querySelectorAll("p, pre, article");
      var brNodes = doc.querySelectorAll("div > br");
      if (brNodes.length) {
        var set = new Set(nodes);
        [].forEach.call(brNodes, function(node) {
          set.add(node.parentNode);
        });
        nodes = Array.from(set);
      }
      var score = 0;
      return [].some.call(nodes, function(node) {
        if (!options.visibilityChecker(node)) {
          return false;
        }
        var matchString = node.className + " " + node.id;
        if (REGEXPS.unlikelyCandidates.test(matchString) && !REGEXPS.okMaybeItsACandidate.test(matchString)) {
          return false;
        }
        if (node.matches("li p")) {
          return false;
        }
        var textContentLength = node.textContent.trim().length;
        if (textContentLength < options.minContentLength) {
          return false;
        }
        score += Math.sqrt(textContentLength - options.minContentLength);
        if (score > options.minScore) {
          return true;
        }
        return false;
      });
    }
    if (typeof module2 === "object") {
      module2.exports = isProbablyReaderable;
    }
  }
});

// node_modules/@mozilla/readability/index.js
var require_readability = __commonJS({
  "node_modules/@mozilla/readability/index.js"(exports, module2) {
    var Readability = require_Readability();
    var isProbablyReaderable = require_Readability_readerable();
    module2.exports = {
      Readability,
      isProbablyReaderable
    };
  }
});

// node_modules/linkedom/esm/shared/symbols.js
var CHANGED, CLASS_LIST, CUSTOM_ELEMENTS, CONTENT, DATASET, DOCTYPE, DOM_PARSER, END, EVENT_TARGET, GLOBALS, IMAGE, MIME, MUTATION_OBSERVER, NEXT, OWNER_ELEMENT, PREV, PRIVATE, SHEET, START, STYLE, UPGRADE, VALUE;
var init_symbols = __esm({
  "node_modules/linkedom/esm/shared/symbols.js"() {
    CHANGED = Symbol("changed");
    CLASS_LIST = Symbol("classList");
    CUSTOM_ELEMENTS = Symbol("CustomElements");
    CONTENT = Symbol("content");
    DATASET = Symbol("dataset");
    DOCTYPE = Symbol("doctype");
    DOM_PARSER = Symbol("DOMParser");
    END = Symbol("end");
    EVENT_TARGET = Symbol("EventTarget");
    GLOBALS = Symbol("globals");
    IMAGE = Symbol("image");
    MIME = Symbol("mime");
    MUTATION_OBSERVER = Symbol("MutationObserver");
    NEXT = Symbol("next");
    OWNER_ELEMENT = Symbol("ownerElement");
    PREV = Symbol("prev");
    PRIVATE = Symbol("private");
    SHEET = Symbol("sheet");
    START = Symbol("start");
    STYLE = Symbol("style");
    UPGRADE = Symbol("upgrade");
    VALUE = Symbol("value");
  }
});

// node_modules/entities/lib/esm/generated/decode-data-html.js
var decode_data_html_default;
var init_decode_data_html = __esm({
  "node_modules/entities/lib/esm/generated/decode-data-html.js"() {
    decode_data_html_default = new Uint16Array(
      // prettier-ignore
      '\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map((c) => c.charCodeAt(0))
    );
  }
});

// node_modules/entities/lib/esm/generated/decode-data-xml.js
var decode_data_xml_default;
var init_decode_data_xml = __esm({
  "node_modules/entities/lib/esm/generated/decode-data-xml.js"() {
    decode_data_xml_default = new Uint16Array(
      // prettier-ignore
      "\u0200aglq	\x1B\u026D\0\0p;\u4026os;\u4027t;\u403Et;\u403Cuot;\u4022".split("").map((c) => c.charCodeAt(0))
    );
  }
});

// node_modules/entities/lib/esm/decode_codepoint.js
function replaceCodePoint(codePoint) {
  var _a2;
  if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
    return 65533;
  }
  return (_a2 = decodeMap.get(codePoint)) !== null && _a2 !== void 0 ? _a2 : codePoint;
}
var _a, decodeMap, fromCodePoint;
var init_decode_codepoint = __esm({
  "node_modules/entities/lib/esm/decode_codepoint.js"() {
    decodeMap = /* @__PURE__ */ new Map([
      [0, 65533],
      // C1 Unicode control character reference replacements
      [128, 8364],
      [130, 8218],
      [131, 402],
      [132, 8222],
      [133, 8230],
      [134, 8224],
      [135, 8225],
      [136, 710],
      [137, 8240],
      [138, 352],
      [139, 8249],
      [140, 338],
      [142, 381],
      [145, 8216],
      [146, 8217],
      [147, 8220],
      [148, 8221],
      [149, 8226],
      [150, 8211],
      [151, 8212],
      [152, 732],
      [153, 8482],
      [154, 353],
      [155, 8250],
      [156, 339],
      [158, 382],
      [159, 376]
    ]);
    fromCodePoint = // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
    (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function(codePoint) {
      let output = "";
      if (codePoint > 65535) {
        codePoint -= 65536;
        output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      output += String.fromCharCode(codePoint);
      return output;
    };
  }
});

// node_modules/entities/lib/esm/decode.js
function isNumber(code) {
  return code >= CharCodes.ZERO && code <= CharCodes.NINE;
}
function isHexadecimalCharacter(code) {
  return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_F || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_F;
}
function isAsciiAlphaNumeric(code) {
  return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z || isNumber(code);
}
function isEntityInAttributeInvalidEnd(code) {
  return code === CharCodes.EQUALS || isAsciiAlphaNumeric(code);
}
function getDecoder(decodeTree) {
  let ret = "";
  const decoder = new EntityDecoder(decodeTree, (str) => ret += fromCodePoint(str));
  return function decodeWithTrie(str, decodeMode) {
    let lastIndex = 0;
    let offset = 0;
    while ((offset = str.indexOf("&", offset)) >= 0) {
      ret += str.slice(lastIndex, offset);
      decoder.startEntity(decodeMode);
      const len = decoder.write(
        str,
        // Skip the "&"
        offset + 1
      );
      if (len < 0) {
        lastIndex = offset + decoder.end();
        break;
      }
      lastIndex = offset + len;
      offset = len === 0 ? lastIndex + 1 : lastIndex;
    }
    const result = ret + str.slice(lastIndex);
    ret = "";
    return result;
  };
}
function determineBranch(decodeTree, current, nodeIdx, char) {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
  if (branchCount === 0) {
    return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
  }
  if (jumpOffset) {
    const value = char - jumpOffset;
    return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIdx + value] - 1;
  }
  let lo = nodeIdx;
  let hi = lo + branchCount - 1;
  while (lo <= hi) {
    const mid = lo + hi >>> 1;
    const midVal = decodeTree[mid];
    if (midVal < char) {
      lo = mid + 1;
    } else if (midVal > char) {
      hi = mid - 1;
    } else {
      return decodeTree[mid + branchCount];
    }
  }
  return -1;
}
var CharCodes, TO_LOWER_BIT, BinTrieFlags, EntityDecoderState, DecodingMode, EntityDecoder, htmlDecoder, xmlDecoder;
var init_decode = __esm({
  "node_modules/entities/lib/esm/decode.js"() {
    init_decode_data_html();
    init_decode_data_xml();
    init_decode_codepoint();
    init_decode_codepoint();
    (function(CharCodes3) {
      CharCodes3[CharCodes3["NUM"] = 35] = "NUM";
      CharCodes3[CharCodes3["SEMI"] = 59] = "SEMI";
      CharCodes3[CharCodes3["EQUALS"] = 61] = "EQUALS";
      CharCodes3[CharCodes3["ZERO"] = 48] = "ZERO";
      CharCodes3[CharCodes3["NINE"] = 57] = "NINE";
      CharCodes3[CharCodes3["LOWER_A"] = 97] = "LOWER_A";
      CharCodes3[CharCodes3["LOWER_F"] = 102] = "LOWER_F";
      CharCodes3[CharCodes3["LOWER_X"] = 120] = "LOWER_X";
      CharCodes3[CharCodes3["LOWER_Z"] = 122] = "LOWER_Z";
      CharCodes3[CharCodes3["UPPER_A"] = 65] = "UPPER_A";
      CharCodes3[CharCodes3["UPPER_F"] = 70] = "UPPER_F";
      CharCodes3[CharCodes3["UPPER_Z"] = 90] = "UPPER_Z";
    })(CharCodes || (CharCodes = {}));
    TO_LOWER_BIT = 32;
    (function(BinTrieFlags2) {
      BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
      BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
      BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
    })(BinTrieFlags || (BinTrieFlags = {}));
    (function(EntityDecoderState2) {
      EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
      EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
      EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
      EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
      EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
    })(EntityDecoderState || (EntityDecoderState = {}));
    (function(DecodingMode2) {
      DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
      DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
      DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
    })(DecodingMode || (DecodingMode = {}));
    EntityDecoder = class {
      constructor(decodeTree, emitCodePoint, errors) {
        this.decodeTree = decodeTree;
        this.emitCodePoint = emitCodePoint;
        this.errors = errors;
        this.state = EntityDecoderState.EntityStart;
        this.consumed = 1;
        this.result = 0;
        this.treeIndex = 0;
        this.excess = 1;
        this.decodeMode = DecodingMode.Strict;
      }
      /** Resets the instance to make it reusable. */
      startEntity(decodeMode) {
        this.decodeMode = decodeMode;
        this.state = EntityDecoderState.EntityStart;
        this.result = 0;
        this.treeIndex = 0;
        this.excess = 1;
        this.consumed = 1;
      }
      /**
       * Write an entity to the decoder. This can be called multiple times with partial entities.
       * If the entity is incomplete, the decoder will return -1.
       *
       * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
       * entity is incomplete, and resume when the next string is written.
       *
       * @param string The string containing the entity (or a continuation of the entity).
       * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      write(str, offset) {
        switch (this.state) {
          case EntityDecoderState.EntityStart: {
            if (str.charCodeAt(offset) === CharCodes.NUM) {
              this.state = EntityDecoderState.NumericStart;
              this.consumed += 1;
              return this.stateNumericStart(str, offset + 1);
            }
            this.state = EntityDecoderState.NamedEntity;
            return this.stateNamedEntity(str, offset);
          }
          case EntityDecoderState.NumericStart: {
            return this.stateNumericStart(str, offset);
          }
          case EntityDecoderState.NumericDecimal: {
            return this.stateNumericDecimal(str, offset);
          }
          case EntityDecoderState.NumericHex: {
            return this.stateNumericHex(str, offset);
          }
          case EntityDecoderState.NamedEntity: {
            return this.stateNamedEntity(str, offset);
          }
        }
      }
      /**
       * Switches between the numeric decimal and hexadecimal states.
       *
       * Equivalent to the `Numeric character reference state` in the HTML spec.
       *
       * @param str The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNumericStart(str, offset) {
        if (offset >= str.length) {
          return -1;
        }
        if ((str.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
          this.state = EntityDecoderState.NumericHex;
          this.consumed += 1;
          return this.stateNumericHex(str, offset + 1);
        }
        this.state = EntityDecoderState.NumericDecimal;
        return this.stateNumericDecimal(str, offset);
      }
      addToNumericResult(str, start, end, base) {
        if (start !== end) {
          const digitCount = end - start;
          this.result = this.result * Math.pow(base, digitCount) + parseInt(str.substr(start, digitCount), base);
          this.consumed += digitCount;
        }
      }
      /**
       * Parses a hexadecimal numeric entity.
       *
       * Equivalent to the `Hexademical character reference state` in the HTML spec.
       *
       * @param str The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNumericHex(str, offset) {
        const startIdx = offset;
        while (offset < str.length) {
          const char = str.charCodeAt(offset);
          if (isNumber(char) || isHexadecimalCharacter(char)) {
            offset += 1;
          } else {
            this.addToNumericResult(str, startIdx, offset, 16);
            return this.emitNumericEntity(char, 3);
          }
        }
        this.addToNumericResult(str, startIdx, offset, 16);
        return -1;
      }
      /**
       * Parses a decimal numeric entity.
       *
       * Equivalent to the `Decimal character reference state` in the HTML spec.
       *
       * @param str The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNumericDecimal(str, offset) {
        const startIdx = offset;
        while (offset < str.length) {
          const char = str.charCodeAt(offset);
          if (isNumber(char)) {
            offset += 1;
          } else {
            this.addToNumericResult(str, startIdx, offset, 10);
            return this.emitNumericEntity(char, 2);
          }
        }
        this.addToNumericResult(str, startIdx, offset, 10);
        return -1;
      }
      /**
       * Validate and emit a numeric entity.
       *
       * Implements the logic from the `Hexademical character reference start
       * state` and `Numeric character reference end state` in the HTML spec.
       *
       * @param lastCp The last code point of the entity. Used to see if the
       *               entity was terminated with a semicolon.
       * @param expectedLength The minimum number of characters that should be
       *                       consumed. Used to validate that at least one digit
       *                       was consumed.
       * @returns The number of characters that were consumed.
       */
      emitNumericEntity(lastCp, expectedLength) {
        var _a2;
        if (this.consumed <= expectedLength) {
          (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
          return 0;
        }
        if (lastCp === CharCodes.SEMI) {
          this.consumed += 1;
        } else if (this.decodeMode === DecodingMode.Strict) {
          return 0;
        }
        this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
        if (this.errors) {
          if (lastCp !== CharCodes.SEMI) {
            this.errors.missingSemicolonAfterCharacterReference();
          }
          this.errors.validateNumericCharacterReference(this.result);
        }
        return this.consumed;
      }
      /**
       * Parses a named entity.
       *
       * Equivalent to the `Named character reference state` in the HTML spec.
       *
       * @param str The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNamedEntity(str, offset) {
        const { decodeTree } = this;
        let current = decodeTree[this.treeIndex];
        let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
        for (; offset < str.length; offset++, this.excess++) {
          const char = str.charCodeAt(offset);
          this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
          if (this.treeIndex < 0) {
            return this.result === 0 || // If we are parsing an attribute
            this.decodeMode === DecodingMode.Attribute && // We shouldn't have consumed any characters after the entity,
            (valueLength === 0 || // And there should be no invalid characters.
            isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
          }
          current = decodeTree[this.treeIndex];
          valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
          if (valueLength !== 0) {
            if (char === CharCodes.SEMI) {
              return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
            }
            if (this.decodeMode !== DecodingMode.Strict) {
              this.result = this.treeIndex;
              this.consumed += this.excess;
              this.excess = 0;
            }
          }
        }
        return -1;
      }
      /**
       * Emit a named entity that was not terminated with a semicolon.
       *
       * @returns The number of characters consumed.
       */
      emitNotTerminatedNamedEntity() {
        var _a2;
        const { result, decodeTree } = this;
        const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
        this.emitNamedEntityData(result, valueLength, this.consumed);
        (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.missingSemicolonAfterCharacterReference();
        return this.consumed;
      }
      /**
       * Emit a named entity.
       *
       * @param result The index of the entity in the decode tree.
       * @param valueLength The number of bytes in the entity.
       * @param consumed The number of characters consumed.
       *
       * @returns The number of characters consumed.
       */
      emitNamedEntityData(result, valueLength, consumed) {
        const { decodeTree } = this;
        this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result + 1], consumed);
        if (valueLength === 3) {
          this.emitCodePoint(decodeTree[result + 2], consumed);
        }
        return consumed;
      }
      /**
       * Signal to the parser that the end of the input was reached.
       *
       * Remaining data will be emitted and relevant errors will be produced.
       *
       * @returns The number of characters consumed.
       */
      end() {
        var _a2;
        switch (this.state) {
          case EntityDecoderState.NamedEntity: {
            return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
          }
          case EntityDecoderState.NumericDecimal: {
            return this.emitNumericEntity(0, 2);
          }
          case EntityDecoderState.NumericHex: {
            return this.emitNumericEntity(0, 3);
          }
          case EntityDecoderState.NumericStart: {
            (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
            return 0;
          }
          case EntityDecoderState.EntityStart: {
            return 0;
          }
        }
      }
    };
    htmlDecoder = getDecoder(decode_data_html_default);
    xmlDecoder = getDecoder(decode_data_xml_default);
  }
});

// node_modules/htmlparser2/lib/esm/Tokenizer.js
function isWhitespace(c) {
  return c === CharCodes2.Space || c === CharCodes2.NewLine || c === CharCodes2.Tab || c === CharCodes2.FormFeed || c === CharCodes2.CarriageReturn;
}
function isEndOfTagSection(c) {
  return c === CharCodes2.Slash || c === CharCodes2.Gt || isWhitespace(c);
}
function isNumber2(c) {
  return c >= CharCodes2.Zero && c <= CharCodes2.Nine;
}
function isASCIIAlpha(c) {
  return c >= CharCodes2.LowerA && c <= CharCodes2.LowerZ || c >= CharCodes2.UpperA && c <= CharCodes2.UpperZ;
}
function isHexDigit(c) {
  return c >= CharCodes2.UpperA && c <= CharCodes2.UpperF || c >= CharCodes2.LowerA && c <= CharCodes2.LowerF;
}
var CharCodes2, State, QuoteType, Sequences, Tokenizer;
var init_Tokenizer = __esm({
  "node_modules/htmlparser2/lib/esm/Tokenizer.js"() {
    init_decode();
    (function(CharCodes3) {
      CharCodes3[CharCodes3["Tab"] = 9] = "Tab";
      CharCodes3[CharCodes3["NewLine"] = 10] = "NewLine";
      CharCodes3[CharCodes3["FormFeed"] = 12] = "FormFeed";
      CharCodes3[CharCodes3["CarriageReturn"] = 13] = "CarriageReturn";
      CharCodes3[CharCodes3["Space"] = 32] = "Space";
      CharCodes3[CharCodes3["ExclamationMark"] = 33] = "ExclamationMark";
      CharCodes3[CharCodes3["Number"] = 35] = "Number";
      CharCodes3[CharCodes3["Amp"] = 38] = "Amp";
      CharCodes3[CharCodes3["SingleQuote"] = 39] = "SingleQuote";
      CharCodes3[CharCodes3["DoubleQuote"] = 34] = "DoubleQuote";
      CharCodes3[CharCodes3["Dash"] = 45] = "Dash";
      CharCodes3[CharCodes3["Slash"] = 47] = "Slash";
      CharCodes3[CharCodes3["Zero"] = 48] = "Zero";
      CharCodes3[CharCodes3["Nine"] = 57] = "Nine";
      CharCodes3[CharCodes3["Semi"] = 59] = "Semi";
      CharCodes3[CharCodes3["Lt"] = 60] = "Lt";
      CharCodes3[CharCodes3["Eq"] = 61] = "Eq";
      CharCodes3[CharCodes3["Gt"] = 62] = "Gt";
      CharCodes3[CharCodes3["Questionmark"] = 63] = "Questionmark";
      CharCodes3[CharCodes3["UpperA"] = 65] = "UpperA";
      CharCodes3[CharCodes3["LowerA"] = 97] = "LowerA";
      CharCodes3[CharCodes3["UpperF"] = 70] = "UpperF";
      CharCodes3[CharCodes3["LowerF"] = 102] = "LowerF";
      CharCodes3[CharCodes3["UpperZ"] = 90] = "UpperZ";
      CharCodes3[CharCodes3["LowerZ"] = 122] = "LowerZ";
      CharCodes3[CharCodes3["LowerX"] = 120] = "LowerX";
      CharCodes3[CharCodes3["OpeningSquareBracket"] = 91] = "OpeningSquareBracket";
    })(CharCodes2 || (CharCodes2 = {}));
    (function(State2) {
      State2[State2["Text"] = 1] = "Text";
      State2[State2["BeforeTagName"] = 2] = "BeforeTagName";
      State2[State2["InTagName"] = 3] = "InTagName";
      State2[State2["InSelfClosingTag"] = 4] = "InSelfClosingTag";
      State2[State2["BeforeClosingTagName"] = 5] = "BeforeClosingTagName";
      State2[State2["InClosingTagName"] = 6] = "InClosingTagName";
      State2[State2["AfterClosingTagName"] = 7] = "AfterClosingTagName";
      State2[State2["BeforeAttributeName"] = 8] = "BeforeAttributeName";
      State2[State2["InAttributeName"] = 9] = "InAttributeName";
      State2[State2["AfterAttributeName"] = 10] = "AfterAttributeName";
      State2[State2["BeforeAttributeValue"] = 11] = "BeforeAttributeValue";
      State2[State2["InAttributeValueDq"] = 12] = "InAttributeValueDq";
      State2[State2["InAttributeValueSq"] = 13] = "InAttributeValueSq";
      State2[State2["InAttributeValueNq"] = 14] = "InAttributeValueNq";
      State2[State2["BeforeDeclaration"] = 15] = "BeforeDeclaration";
      State2[State2["InDeclaration"] = 16] = "InDeclaration";
      State2[State2["InProcessingInstruction"] = 17] = "InProcessingInstruction";
      State2[State2["BeforeComment"] = 18] = "BeforeComment";
      State2[State2["CDATASequence"] = 19] = "CDATASequence";
      State2[State2["InSpecialComment"] = 20] = "InSpecialComment";
      State2[State2["InCommentLike"] = 21] = "InCommentLike";
      State2[State2["BeforeSpecialS"] = 22] = "BeforeSpecialS";
      State2[State2["SpecialStartSequence"] = 23] = "SpecialStartSequence";
      State2[State2["InSpecialTag"] = 24] = "InSpecialTag";
      State2[State2["BeforeEntity"] = 25] = "BeforeEntity";
      State2[State2["BeforeNumericEntity"] = 26] = "BeforeNumericEntity";
      State2[State2["InNamedEntity"] = 27] = "InNamedEntity";
      State2[State2["InNumericEntity"] = 28] = "InNumericEntity";
      State2[State2["InHexEntity"] = 29] = "InHexEntity";
    })(State || (State = {}));
    (function(QuoteType2) {
      QuoteType2[QuoteType2["NoValue"] = 0] = "NoValue";
      QuoteType2[QuoteType2["Unquoted"] = 1] = "Unquoted";
      QuoteType2[QuoteType2["Single"] = 2] = "Single";
      QuoteType2[QuoteType2["Double"] = 3] = "Double";
    })(QuoteType || (QuoteType = {}));
    Sequences = {
      Cdata: new Uint8Array([67, 68, 65, 84, 65, 91]),
      CdataEnd: new Uint8Array([93, 93, 62]),
      CommentEnd: new Uint8Array([45, 45, 62]),
      ScriptEnd: new Uint8Array([60, 47, 115, 99, 114, 105, 112, 116]),
      StyleEnd: new Uint8Array([60, 47, 115, 116, 121, 108, 101]),
      TitleEnd: new Uint8Array([60, 47, 116, 105, 116, 108, 101])
      // `</title`
    };
    Tokenizer = class {
      constructor({ xmlMode = false, decodeEntities = true }, cbs) {
        this.cbs = cbs;
        this.state = State.Text;
        this.buffer = "";
        this.sectionStart = 0;
        this.index = 0;
        this.baseState = State.Text;
        this.isSpecial = false;
        this.running = true;
        this.offset = 0;
        this.currentSequence = void 0;
        this.sequenceIndex = 0;
        this.trieIndex = 0;
        this.trieCurrent = 0;
        this.entityResult = 0;
        this.entityExcess = 0;
        this.xmlMode = xmlMode;
        this.decodeEntities = decodeEntities;
        this.entityTrie = xmlMode ? decode_data_xml_default : decode_data_html_default;
      }
      reset() {
        this.state = State.Text;
        this.buffer = "";
        this.sectionStart = 0;
        this.index = 0;
        this.baseState = State.Text;
        this.currentSequence = void 0;
        this.running = true;
        this.offset = 0;
      }
      write(chunk) {
        this.offset += this.buffer.length;
        this.buffer = chunk;
        this.parse();
      }
      end() {
        if (this.running)
          this.finish();
      }
      pause() {
        this.running = false;
      }
      resume() {
        this.running = true;
        if (this.index < this.buffer.length + this.offset) {
          this.parse();
        }
      }
      /**
       * The current index within all of the written data.
       */
      getIndex() {
        return this.index;
      }
      /**
       * The start of the current section.
       */
      getSectionStart() {
        return this.sectionStart;
      }
      stateText(c) {
        if (c === CharCodes2.Lt || !this.decodeEntities && this.fastForwardTo(CharCodes2.Lt)) {
          if (this.index > this.sectionStart) {
            this.cbs.ontext(this.sectionStart, this.index);
          }
          this.state = State.BeforeTagName;
          this.sectionStart = this.index;
        } else if (this.decodeEntities && c === CharCodes2.Amp) {
          this.state = State.BeforeEntity;
        }
      }
      stateSpecialStartSequence(c) {
        const isEnd = this.sequenceIndex === this.currentSequence.length;
        const isMatch = isEnd ? (
          // If we are at the end of the sequence, make sure the tag name has ended
          isEndOfTagSection(c)
        ) : (
          // Otherwise, do a case-insensitive comparison
          (c | 32) === this.currentSequence[this.sequenceIndex]
        );
        if (!isMatch) {
          this.isSpecial = false;
        } else if (!isEnd) {
          this.sequenceIndex++;
          return;
        }
        this.sequenceIndex = 0;
        this.state = State.InTagName;
        this.stateInTagName(c);
      }
      /** Look for an end tag. For <title> tags, also decode entities. */
      stateInSpecialTag(c) {
        if (this.sequenceIndex === this.currentSequence.length) {
          if (c === CharCodes2.Gt || isWhitespace(c)) {
            const endOfText = this.index - this.currentSequence.length;
            if (this.sectionStart < endOfText) {
              const actualIndex = this.index;
              this.index = endOfText;
              this.cbs.ontext(this.sectionStart, endOfText);
              this.index = actualIndex;
            }
            this.isSpecial = false;
            this.sectionStart = endOfText + 2;
            this.stateInClosingTagName(c);
            return;
          }
          this.sequenceIndex = 0;
        }
        if ((c | 32) === this.currentSequence[this.sequenceIndex]) {
          this.sequenceIndex += 1;
        } else if (this.sequenceIndex === 0) {
          if (this.currentSequence === Sequences.TitleEnd) {
            if (this.decodeEntities && c === CharCodes2.Amp) {
              this.state = State.BeforeEntity;
            }
          } else if (this.fastForwardTo(CharCodes2.Lt)) {
            this.sequenceIndex = 1;
          }
        } else {
          this.sequenceIndex = Number(c === CharCodes2.Lt);
        }
      }
      stateCDATASequence(c) {
        if (c === Sequences.Cdata[this.sequenceIndex]) {
          if (++this.sequenceIndex === Sequences.Cdata.length) {
            this.state = State.InCommentLike;
            this.currentSequence = Sequences.CdataEnd;
            this.sequenceIndex = 0;
            this.sectionStart = this.index + 1;
          }
        } else {
          this.sequenceIndex = 0;
          this.state = State.InDeclaration;
          this.stateInDeclaration(c);
        }
      }
      /**
       * When we wait for one specific character, we can speed things up
       * by skipping through the buffer until we find it.
       *
       * @returns Whether the character was found.
       */
      fastForwardTo(c) {
        while (++this.index < this.buffer.length + this.offset) {
          if (this.buffer.charCodeAt(this.index - this.offset) === c) {
            return true;
          }
        }
        this.index = this.buffer.length + this.offset - 1;
        return false;
      }
      /**
       * Comments and CDATA end with `-->` and `]]>`.
       *
       * Their common qualities are:
       * - Their end sequences have a distinct character they start with.
       * - That character is then repeated, so we have to check multiple repeats.
       * - All characters but the start character of the sequence can be skipped.
       */
      stateInCommentLike(c) {
        if (c === this.currentSequence[this.sequenceIndex]) {
          if (++this.sequenceIndex === this.currentSequence.length) {
            if (this.currentSequence === Sequences.CdataEnd) {
              this.cbs.oncdata(this.sectionStart, this.index, 2);
            } else {
              this.cbs.oncomment(this.sectionStart, this.index, 2);
            }
            this.sequenceIndex = 0;
            this.sectionStart = this.index + 1;
            this.state = State.Text;
          }
        } else if (this.sequenceIndex === 0) {
          if (this.fastForwardTo(this.currentSequence[0])) {
            this.sequenceIndex = 1;
          }
        } else if (c !== this.currentSequence[this.sequenceIndex - 1]) {
          this.sequenceIndex = 0;
        }
      }
      /**
       * HTML only allows ASCII alpha characters (a-z and A-Z) at the beginning of a tag name.
       *
       * XML allows a lot more characters here (@see https://www.w3.org/TR/REC-xml/#NT-NameStartChar).
       * We allow anything that wouldn't end the tag.
       */
      isTagStartChar(c) {
        return this.xmlMode ? !isEndOfTagSection(c) : isASCIIAlpha(c);
      }
      startSpecial(sequence, offset) {
        this.isSpecial = true;
        this.currentSequence = sequence;
        this.sequenceIndex = offset;
        this.state = State.SpecialStartSequence;
      }
      stateBeforeTagName(c) {
        if (c === CharCodes2.ExclamationMark) {
          this.state = State.BeforeDeclaration;
          this.sectionStart = this.index + 1;
        } else if (c === CharCodes2.Questionmark) {
          this.state = State.InProcessingInstruction;
          this.sectionStart = this.index + 1;
        } else if (this.isTagStartChar(c)) {
          const lower = c | 32;
          this.sectionStart = this.index;
          if (!this.xmlMode && lower === Sequences.TitleEnd[2]) {
            this.startSpecial(Sequences.TitleEnd, 3);
          } else {
            this.state = !this.xmlMode && lower === Sequences.ScriptEnd[2] ? State.BeforeSpecialS : State.InTagName;
          }
        } else if (c === CharCodes2.Slash) {
          this.state = State.BeforeClosingTagName;
        } else {
          this.state = State.Text;
          this.stateText(c);
        }
      }
      stateInTagName(c) {
        if (isEndOfTagSection(c)) {
          this.cbs.onopentagname(this.sectionStart, this.index);
          this.sectionStart = -1;
          this.state = State.BeforeAttributeName;
          this.stateBeforeAttributeName(c);
        }
      }
      stateBeforeClosingTagName(c) {
        if (isWhitespace(c)) {
        } else if (c === CharCodes2.Gt) {
          this.state = State.Text;
        } else {
          this.state = this.isTagStartChar(c) ? State.InClosingTagName : State.InSpecialComment;
          this.sectionStart = this.index;
        }
      }
      stateInClosingTagName(c) {
        if (c === CharCodes2.Gt || isWhitespace(c)) {
          this.cbs.onclosetag(this.sectionStart, this.index);
          this.sectionStart = -1;
          this.state = State.AfterClosingTagName;
          this.stateAfterClosingTagName(c);
        }
      }
      stateAfterClosingTagName(c) {
        if (c === CharCodes2.Gt || this.fastForwardTo(CharCodes2.Gt)) {
          this.state = State.Text;
          this.baseState = State.Text;
          this.sectionStart = this.index + 1;
        }
      }
      stateBeforeAttributeName(c) {
        if (c === CharCodes2.Gt) {
          this.cbs.onopentagend(this.index);
          if (this.isSpecial) {
            this.state = State.InSpecialTag;
            this.sequenceIndex = 0;
          } else {
            this.state = State.Text;
          }
          this.baseState = this.state;
          this.sectionStart = this.index + 1;
        } else if (c === CharCodes2.Slash) {
          this.state = State.InSelfClosingTag;
        } else if (!isWhitespace(c)) {
          this.state = State.InAttributeName;
          this.sectionStart = this.index;
        }
      }
      stateInSelfClosingTag(c) {
        if (c === CharCodes2.Gt) {
          this.cbs.onselfclosingtag(this.index);
          this.state = State.Text;
          this.baseState = State.Text;
          this.sectionStart = this.index + 1;
          this.isSpecial = false;
        } else if (!isWhitespace(c)) {
          this.state = State.BeforeAttributeName;
          this.stateBeforeAttributeName(c);
        }
      }
      stateInAttributeName(c) {
        if (c === CharCodes2.Eq || isEndOfTagSection(c)) {
          this.cbs.onattribname(this.sectionStart, this.index);
          this.sectionStart = -1;
          this.state = State.AfterAttributeName;
          this.stateAfterAttributeName(c);
        }
      }
      stateAfterAttributeName(c) {
        if (c === CharCodes2.Eq) {
          this.state = State.BeforeAttributeValue;
        } else if (c === CharCodes2.Slash || c === CharCodes2.Gt) {
          this.cbs.onattribend(QuoteType.NoValue, this.index);
          this.state = State.BeforeAttributeName;
          this.stateBeforeAttributeName(c);
        } else if (!isWhitespace(c)) {
          this.cbs.onattribend(QuoteType.NoValue, this.index);
          this.state = State.InAttributeName;
          this.sectionStart = this.index;
        }
      }
      stateBeforeAttributeValue(c) {
        if (c === CharCodes2.DoubleQuote) {
          this.state = State.InAttributeValueDq;
          this.sectionStart = this.index + 1;
        } else if (c === CharCodes2.SingleQuote) {
          this.state = State.InAttributeValueSq;
          this.sectionStart = this.index + 1;
        } else if (!isWhitespace(c)) {
          this.sectionStart = this.index;
          this.state = State.InAttributeValueNq;
          this.stateInAttributeValueNoQuotes(c);
        }
      }
      handleInAttributeValue(c, quote) {
        if (c === quote || !this.decodeEntities && this.fastForwardTo(quote)) {
          this.cbs.onattribdata(this.sectionStart, this.index);
          this.sectionStart = -1;
          this.cbs.onattribend(quote === CharCodes2.DoubleQuote ? QuoteType.Double : QuoteType.Single, this.index);
          this.state = State.BeforeAttributeName;
        } else if (this.decodeEntities && c === CharCodes2.Amp) {
          this.baseState = this.state;
          this.state = State.BeforeEntity;
        }
      }
      stateInAttributeValueDoubleQuotes(c) {
        this.handleInAttributeValue(c, CharCodes2.DoubleQuote);
      }
      stateInAttributeValueSingleQuotes(c) {
        this.handleInAttributeValue(c, CharCodes2.SingleQuote);
      }
      stateInAttributeValueNoQuotes(c) {
        if (isWhitespace(c) || c === CharCodes2.Gt) {
          this.cbs.onattribdata(this.sectionStart, this.index);
          this.sectionStart = -1;
          this.cbs.onattribend(QuoteType.Unquoted, this.index);
          this.state = State.BeforeAttributeName;
          this.stateBeforeAttributeName(c);
        } else if (this.decodeEntities && c === CharCodes2.Amp) {
          this.baseState = this.state;
          this.state = State.BeforeEntity;
        }
      }
      stateBeforeDeclaration(c) {
        if (c === CharCodes2.OpeningSquareBracket) {
          this.state = State.CDATASequence;
          this.sequenceIndex = 0;
        } else {
          this.state = c === CharCodes2.Dash ? State.BeforeComment : State.InDeclaration;
        }
      }
      stateInDeclaration(c) {
        if (c === CharCodes2.Gt || this.fastForwardTo(CharCodes2.Gt)) {
          this.cbs.ondeclaration(this.sectionStart, this.index);
          this.state = State.Text;
          this.sectionStart = this.index + 1;
        }
      }
      stateInProcessingInstruction(c) {
        if (c === CharCodes2.Gt || this.fastForwardTo(CharCodes2.Gt)) {
          this.cbs.onprocessinginstruction(this.sectionStart, this.index);
          this.state = State.Text;
          this.sectionStart = this.index + 1;
        }
      }
      stateBeforeComment(c) {
        if (c === CharCodes2.Dash) {
          this.state = State.InCommentLike;
          this.currentSequence = Sequences.CommentEnd;
          this.sequenceIndex = 2;
          this.sectionStart = this.index + 1;
        } else {
          this.state = State.InDeclaration;
        }
      }
      stateInSpecialComment(c) {
        if (c === CharCodes2.Gt || this.fastForwardTo(CharCodes2.Gt)) {
          this.cbs.oncomment(this.sectionStart, this.index, 0);
          this.state = State.Text;
          this.sectionStart = this.index + 1;
        }
      }
      stateBeforeSpecialS(c) {
        const lower = c | 32;
        if (lower === Sequences.ScriptEnd[3]) {
          this.startSpecial(Sequences.ScriptEnd, 4);
        } else if (lower === Sequences.StyleEnd[3]) {
          this.startSpecial(Sequences.StyleEnd, 4);
        } else {
          this.state = State.InTagName;
          this.stateInTagName(c);
        }
      }
      stateBeforeEntity(c) {
        this.entityExcess = 1;
        this.entityResult = 0;
        if (c === CharCodes2.Number) {
          this.state = State.BeforeNumericEntity;
        } else if (c === CharCodes2.Amp) {
        } else {
          this.trieIndex = 0;
          this.trieCurrent = this.entityTrie[0];
          this.state = State.InNamedEntity;
          this.stateInNamedEntity(c);
        }
      }
      stateInNamedEntity(c) {
        this.entityExcess += 1;
        this.trieIndex = determineBranch(this.entityTrie, this.trieCurrent, this.trieIndex + 1, c);
        if (this.trieIndex < 0) {
          this.emitNamedEntity();
          this.index--;
          return;
        }
        this.trieCurrent = this.entityTrie[this.trieIndex];
        const masked = this.trieCurrent & BinTrieFlags.VALUE_LENGTH;
        if (masked) {
          const valueLength = (masked >> 14) - 1;
          if (!this.allowLegacyEntity() && c !== CharCodes2.Semi) {
            this.trieIndex += valueLength;
          } else {
            const entityStart = this.index - this.entityExcess + 1;
            if (entityStart > this.sectionStart) {
              this.emitPartial(this.sectionStart, entityStart);
            }
            this.entityResult = this.trieIndex;
            this.trieIndex += valueLength;
            this.entityExcess = 0;
            this.sectionStart = this.index + 1;
            if (valueLength === 0) {
              this.emitNamedEntity();
            }
          }
        }
      }
      emitNamedEntity() {
        this.state = this.baseState;
        if (this.entityResult === 0) {
          return;
        }
        const valueLength = (this.entityTrie[this.entityResult] & BinTrieFlags.VALUE_LENGTH) >> 14;
        switch (valueLength) {
          case 1: {
            this.emitCodePoint(this.entityTrie[this.entityResult] & ~BinTrieFlags.VALUE_LENGTH);
            break;
          }
          case 2: {
            this.emitCodePoint(this.entityTrie[this.entityResult + 1]);
            break;
          }
          case 3: {
            this.emitCodePoint(this.entityTrie[this.entityResult + 1]);
            this.emitCodePoint(this.entityTrie[this.entityResult + 2]);
          }
        }
      }
      stateBeforeNumericEntity(c) {
        if ((c | 32) === CharCodes2.LowerX) {
          this.entityExcess++;
          this.state = State.InHexEntity;
        } else {
          this.state = State.InNumericEntity;
          this.stateInNumericEntity(c);
        }
      }
      emitNumericEntity(strict) {
        const entityStart = this.index - this.entityExcess - 1;
        const numberStart = entityStart + 2 + Number(this.state === State.InHexEntity);
        if (numberStart !== this.index) {
          if (entityStart > this.sectionStart) {
            this.emitPartial(this.sectionStart, entityStart);
          }
          this.sectionStart = this.index + Number(strict);
          this.emitCodePoint(replaceCodePoint(this.entityResult));
        }
        this.state = this.baseState;
      }
      stateInNumericEntity(c) {
        if (c === CharCodes2.Semi) {
          this.emitNumericEntity(true);
        } else if (isNumber2(c)) {
          this.entityResult = this.entityResult * 10 + (c - CharCodes2.Zero);
          this.entityExcess++;
        } else {
          if (this.allowLegacyEntity()) {
            this.emitNumericEntity(false);
          } else {
            this.state = this.baseState;
          }
          this.index--;
        }
      }
      stateInHexEntity(c) {
        if (c === CharCodes2.Semi) {
          this.emitNumericEntity(true);
        } else if (isNumber2(c)) {
          this.entityResult = this.entityResult * 16 + (c - CharCodes2.Zero);
          this.entityExcess++;
        } else if (isHexDigit(c)) {
          this.entityResult = this.entityResult * 16 + ((c | 32) - CharCodes2.LowerA + 10);
          this.entityExcess++;
        } else {
          if (this.allowLegacyEntity()) {
            this.emitNumericEntity(false);
          } else {
            this.state = this.baseState;
          }
          this.index--;
        }
      }
      allowLegacyEntity() {
        return !this.xmlMode && (this.baseState === State.Text || this.baseState === State.InSpecialTag);
      }
      /**
       * Remove data that has already been consumed from the buffer.
       */
      cleanup() {
        if (this.running && this.sectionStart !== this.index) {
          if (this.state === State.Text || this.state === State.InSpecialTag && this.sequenceIndex === 0) {
            this.cbs.ontext(this.sectionStart, this.index);
            this.sectionStart = this.index;
          } else if (this.state === State.InAttributeValueDq || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueNq) {
            this.cbs.onattribdata(this.sectionStart, this.index);
            this.sectionStart = this.index;
          }
        }
      }
      shouldContinue() {
        return this.index < this.buffer.length + this.offset && this.running;
      }
      /**
       * Iterates through the buffer, calling the function corresponding to the current state.
       *
       * States that are more likely to be hit are higher up, as a performance improvement.
       */
      parse() {
        while (this.shouldContinue()) {
          const c = this.buffer.charCodeAt(this.index - this.offset);
          switch (this.state) {
            case State.Text: {
              this.stateText(c);
              break;
            }
            case State.SpecialStartSequence: {
              this.stateSpecialStartSequence(c);
              break;
            }
            case State.InSpecialTag: {
              this.stateInSpecialTag(c);
              break;
            }
            case State.CDATASequence: {
              this.stateCDATASequence(c);
              break;
            }
            case State.InAttributeValueDq: {
              this.stateInAttributeValueDoubleQuotes(c);
              break;
            }
            case State.InAttributeName: {
              this.stateInAttributeName(c);
              break;
            }
            case State.InCommentLike: {
              this.stateInCommentLike(c);
              break;
            }
            case State.InSpecialComment: {
              this.stateInSpecialComment(c);
              break;
            }
            case State.BeforeAttributeName: {
              this.stateBeforeAttributeName(c);
              break;
            }
            case State.InTagName: {
              this.stateInTagName(c);
              break;
            }
            case State.InClosingTagName: {
              this.stateInClosingTagName(c);
              break;
            }
            case State.BeforeTagName: {
              this.stateBeforeTagName(c);
              break;
            }
            case State.AfterAttributeName: {
              this.stateAfterAttributeName(c);
              break;
            }
            case State.InAttributeValueSq: {
              this.stateInAttributeValueSingleQuotes(c);
              break;
            }
            case State.BeforeAttributeValue: {
              this.stateBeforeAttributeValue(c);
              break;
            }
            case State.BeforeClosingTagName: {
              this.stateBeforeClosingTagName(c);
              break;
            }
            case State.AfterClosingTagName: {
              this.stateAfterClosingTagName(c);
              break;
            }
            case State.BeforeSpecialS: {
              this.stateBeforeSpecialS(c);
              break;
            }
            case State.InAttributeValueNq: {
              this.stateInAttributeValueNoQuotes(c);
              break;
            }
            case State.InSelfClosingTag: {
              this.stateInSelfClosingTag(c);
              break;
            }
            case State.InDeclaration: {
              this.stateInDeclaration(c);
              break;
            }
            case State.BeforeDeclaration: {
              this.stateBeforeDeclaration(c);
              break;
            }
            case State.BeforeComment: {
              this.stateBeforeComment(c);
              break;
            }
            case State.InProcessingInstruction: {
              this.stateInProcessingInstruction(c);
              break;
            }
            case State.InNamedEntity: {
              this.stateInNamedEntity(c);
              break;
            }
            case State.BeforeEntity: {
              this.stateBeforeEntity(c);
              break;
            }
            case State.InHexEntity: {
              this.stateInHexEntity(c);
              break;
            }
            case State.InNumericEntity: {
              this.stateInNumericEntity(c);
              break;
            }
            default: {
              this.stateBeforeNumericEntity(c);
            }
          }
          this.index++;
        }
        this.cleanup();
      }
      finish() {
        if (this.state === State.InNamedEntity) {
          this.emitNamedEntity();
        }
        if (this.sectionStart < this.index) {
          this.handleTrailingData();
        }
        this.cbs.onend();
      }
      /** Handle any trailing data. */
      handleTrailingData() {
        const endIndex = this.buffer.length + this.offset;
        if (this.state === State.InCommentLike) {
          if (this.currentSequence === Sequences.CdataEnd) {
            this.cbs.oncdata(this.sectionStart, endIndex, 0);
          } else {
            this.cbs.oncomment(this.sectionStart, endIndex, 0);
          }
        } else if (this.state === State.InNumericEntity && this.allowLegacyEntity()) {
          this.emitNumericEntity(false);
        } else if (this.state === State.InHexEntity && this.allowLegacyEntity()) {
          this.emitNumericEntity(false);
        } else if (this.state === State.InTagName || this.state === State.BeforeAttributeName || this.state === State.BeforeAttributeValue || this.state === State.AfterAttributeName || this.state === State.InAttributeName || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueDq || this.state === State.InAttributeValueNq || this.state === State.InClosingTagName) {
        } else {
          this.cbs.ontext(this.sectionStart, endIndex);
        }
      }
      emitPartial(start, endIndex) {
        if (this.baseState !== State.Text && this.baseState !== State.InSpecialTag) {
          this.cbs.onattribdata(start, endIndex);
        } else {
          this.cbs.ontext(start, endIndex);
        }
      }
      emitCodePoint(cp) {
        if (this.baseState !== State.Text && this.baseState !== State.InSpecialTag) {
          this.cbs.onattribentity(cp);
        } else {
          this.cbs.ontextentity(cp);
        }
      }
    };
  }
});

// node_modules/htmlparser2/lib/esm/Parser.js
var formTags, pTag, tableSectionTags, ddtTags, rtpTags, openImpliesClose, voidElements, foreignContextElements, htmlIntegrationElements, reNameEnd, Parser;
var init_Parser = __esm({
  "node_modules/htmlparser2/lib/esm/Parser.js"() {
    init_Tokenizer();
    init_decode();
    formTags = /* @__PURE__ */ new Set([
      "input",
      "option",
      "optgroup",
      "select",
      "button",
      "datalist",
      "textarea"
    ]);
    pTag = /* @__PURE__ */ new Set(["p"]);
    tableSectionTags = /* @__PURE__ */ new Set(["thead", "tbody"]);
    ddtTags = /* @__PURE__ */ new Set(["dd", "dt"]);
    rtpTags = /* @__PURE__ */ new Set(["rt", "rp"]);
    openImpliesClose = /* @__PURE__ */ new Map([
      ["tr", /* @__PURE__ */ new Set(["tr", "th", "td"])],
      ["th", /* @__PURE__ */ new Set(["th"])],
      ["td", /* @__PURE__ */ new Set(["thead", "th", "td"])],
      ["body", /* @__PURE__ */ new Set(["head", "link", "script"])],
      ["li", /* @__PURE__ */ new Set(["li"])],
      ["p", pTag],
      ["h1", pTag],
      ["h2", pTag],
      ["h3", pTag],
      ["h4", pTag],
      ["h5", pTag],
      ["h6", pTag],
      ["select", formTags],
      ["input", formTags],
      ["output", formTags],
      ["button", formTags],
      ["datalist", formTags],
      ["textarea", formTags],
      ["option", /* @__PURE__ */ new Set(["option"])],
      ["optgroup", /* @__PURE__ */ new Set(["optgroup", "option"])],
      ["dd", ddtTags],
      ["dt", ddtTags],
      ["address", pTag],
      ["article", pTag],
      ["aside", pTag],
      ["blockquote", pTag],
      ["details", pTag],
      ["div", pTag],
      ["dl", pTag],
      ["fieldset", pTag],
      ["figcaption", pTag],
      ["figure", pTag],
      ["footer", pTag],
      ["form", pTag],
      ["header", pTag],
      ["hr", pTag],
      ["main", pTag],
      ["nav", pTag],
      ["ol", pTag],
      ["pre", pTag],
      ["section", pTag],
      ["table", pTag],
      ["ul", pTag],
      ["rt", rtpTags],
      ["rp", rtpTags],
      ["tbody", tableSectionTags],
      ["tfoot", tableSectionTags]
    ]);
    voidElements = /* @__PURE__ */ new Set([
      "area",
      "base",
      "basefont",
      "br",
      "col",
      "command",
      "embed",
      "frame",
      "hr",
      "img",
      "input",
      "isindex",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
    ]);
    foreignContextElements = /* @__PURE__ */ new Set(["math", "svg"]);
    htmlIntegrationElements = /* @__PURE__ */ new Set([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext",
      "annotation-xml",
      "foreignobject",
      "desc",
      "title"
    ]);
    reNameEnd = /\s|\//;
    Parser = class {
      constructor(cbs, options = {}) {
        var _a2, _b, _c, _d, _e;
        this.options = options;
        this.startIndex = 0;
        this.endIndex = 0;
        this.openTagStart = 0;
        this.tagname = "";
        this.attribname = "";
        this.attribvalue = "";
        this.attribs = null;
        this.stack = [];
        this.foreignContext = [];
        this.buffers = [];
        this.bufferOffset = 0;
        this.writeIndex = 0;
        this.ended = false;
        this.cbs = cbs !== null && cbs !== void 0 ? cbs : {};
        this.lowerCaseTagNames = (_a2 = options.lowerCaseTags) !== null && _a2 !== void 0 ? _a2 : !options.xmlMode;
        this.lowerCaseAttributeNames = (_b = options.lowerCaseAttributeNames) !== null && _b !== void 0 ? _b : !options.xmlMode;
        this.tokenizer = new ((_c = options.Tokenizer) !== null && _c !== void 0 ? _c : Tokenizer)(this.options, this);
        (_e = (_d = this.cbs).onparserinit) === null || _e === void 0 ? void 0 : _e.call(_d, this);
      }
      // Tokenizer event handlers
      /** @internal */
      ontext(start, endIndex) {
        var _a2, _b;
        const data = this.getSlice(start, endIndex);
        this.endIndex = endIndex - 1;
        (_b = (_a2 = this.cbs).ontext) === null || _b === void 0 ? void 0 : _b.call(_a2, data);
        this.startIndex = endIndex;
      }
      /** @internal */
      ontextentity(cp) {
        var _a2, _b;
        const index = this.tokenizer.getSectionStart();
        this.endIndex = index - 1;
        (_b = (_a2 = this.cbs).ontext) === null || _b === void 0 ? void 0 : _b.call(_a2, fromCodePoint(cp));
        this.startIndex = index;
      }
      isVoidElement(name) {
        return !this.options.xmlMode && voidElements.has(name);
      }
      /** @internal */
      onopentagname(start, endIndex) {
        this.endIndex = endIndex;
        let name = this.getSlice(start, endIndex);
        if (this.lowerCaseTagNames) {
          name = name.toLowerCase();
        }
        this.emitOpenTag(name);
      }
      emitOpenTag(name) {
        var _a2, _b, _c, _d;
        this.openTagStart = this.startIndex;
        this.tagname = name;
        const impliesClose = !this.options.xmlMode && openImpliesClose.get(name);
        if (impliesClose) {
          while (this.stack.length > 0 && impliesClose.has(this.stack[this.stack.length - 1])) {
            const element = this.stack.pop();
            (_b = (_a2 = this.cbs).onclosetag) === null || _b === void 0 ? void 0 : _b.call(_a2, element, true);
          }
        }
        if (!this.isVoidElement(name)) {
          this.stack.push(name);
          if (foreignContextElements.has(name)) {
            this.foreignContext.push(true);
          } else if (htmlIntegrationElements.has(name)) {
            this.foreignContext.push(false);
          }
        }
        (_d = (_c = this.cbs).onopentagname) === null || _d === void 0 ? void 0 : _d.call(_c, name);
        if (this.cbs.onopentag)
          this.attribs = {};
      }
      endOpenTag(isImplied) {
        var _a2, _b;
        this.startIndex = this.openTagStart;
        if (this.attribs) {
          (_b = (_a2 = this.cbs).onopentag) === null || _b === void 0 ? void 0 : _b.call(_a2, this.tagname, this.attribs, isImplied);
          this.attribs = null;
        }
        if (this.cbs.onclosetag && this.isVoidElement(this.tagname)) {
          this.cbs.onclosetag(this.tagname, true);
        }
        this.tagname = "";
      }
      /** @internal */
      onopentagend(endIndex) {
        this.endIndex = endIndex;
        this.endOpenTag(false);
        this.startIndex = endIndex + 1;
      }
      /** @internal */
      onclosetag(start, endIndex) {
        var _a2, _b, _c, _d, _e, _f;
        this.endIndex = endIndex;
        let name = this.getSlice(start, endIndex);
        if (this.lowerCaseTagNames) {
          name = name.toLowerCase();
        }
        if (foreignContextElements.has(name) || htmlIntegrationElements.has(name)) {
          this.foreignContext.pop();
        }
        if (!this.isVoidElement(name)) {
          const pos = this.stack.lastIndexOf(name);
          if (pos !== -1) {
            if (this.cbs.onclosetag) {
              let count = this.stack.length - pos;
              while (count--) {
                this.cbs.onclosetag(this.stack.pop(), count !== 0);
              }
            } else
              this.stack.length = pos;
          } else if (!this.options.xmlMode && name === "p") {
            this.emitOpenTag("p");
            this.closeCurrentTag(true);
          }
        } else if (!this.options.xmlMode && name === "br") {
          (_b = (_a2 = this.cbs).onopentagname) === null || _b === void 0 ? void 0 : _b.call(_a2, "br");
          (_d = (_c = this.cbs).onopentag) === null || _d === void 0 ? void 0 : _d.call(_c, "br", {}, true);
          (_f = (_e = this.cbs).onclosetag) === null || _f === void 0 ? void 0 : _f.call(_e, "br", false);
        }
        this.startIndex = endIndex + 1;
      }
      /** @internal */
      onselfclosingtag(endIndex) {
        this.endIndex = endIndex;
        if (this.options.xmlMode || this.options.recognizeSelfClosing || this.foreignContext[this.foreignContext.length - 1]) {
          this.closeCurrentTag(false);
          this.startIndex = endIndex + 1;
        } else {
          this.onopentagend(endIndex);
        }
      }
      closeCurrentTag(isOpenImplied) {
        var _a2, _b;
        const name = this.tagname;
        this.endOpenTag(isOpenImplied);
        if (this.stack[this.stack.length - 1] === name) {
          (_b = (_a2 = this.cbs).onclosetag) === null || _b === void 0 ? void 0 : _b.call(_a2, name, !isOpenImplied);
          this.stack.pop();
        }
      }
      /** @internal */
      onattribname(start, endIndex) {
        this.startIndex = start;
        const name = this.getSlice(start, endIndex);
        this.attribname = this.lowerCaseAttributeNames ? name.toLowerCase() : name;
      }
      /** @internal */
      onattribdata(start, endIndex) {
        this.attribvalue += this.getSlice(start, endIndex);
      }
      /** @internal */
      onattribentity(cp) {
        this.attribvalue += fromCodePoint(cp);
      }
      /** @internal */
      onattribend(quote, endIndex) {
        var _a2, _b;
        this.endIndex = endIndex;
        (_b = (_a2 = this.cbs).onattribute) === null || _b === void 0 ? void 0 : _b.call(_a2, this.attribname, this.attribvalue, quote === QuoteType.Double ? '"' : quote === QuoteType.Single ? "'" : quote === QuoteType.NoValue ? void 0 : null);
        if (this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname)) {
          this.attribs[this.attribname] = this.attribvalue;
        }
        this.attribvalue = "";
      }
      getInstructionName(value) {
        const index = value.search(reNameEnd);
        let name = index < 0 ? value : value.substr(0, index);
        if (this.lowerCaseTagNames) {
          name = name.toLowerCase();
        }
        return name;
      }
      /** @internal */
      ondeclaration(start, endIndex) {
        this.endIndex = endIndex;
        const value = this.getSlice(start, endIndex);
        if (this.cbs.onprocessinginstruction) {
          const name = this.getInstructionName(value);
          this.cbs.onprocessinginstruction(`!${name}`, `!${value}`);
        }
        this.startIndex = endIndex + 1;
      }
      /** @internal */
      onprocessinginstruction(start, endIndex) {
        this.endIndex = endIndex;
        const value = this.getSlice(start, endIndex);
        if (this.cbs.onprocessinginstruction) {
          const name = this.getInstructionName(value);
          this.cbs.onprocessinginstruction(`?${name}`, `?${value}`);
        }
        this.startIndex = endIndex + 1;
      }
      /** @internal */
      oncomment(start, endIndex, offset) {
        var _a2, _b, _c, _d;
        this.endIndex = endIndex;
        (_b = (_a2 = this.cbs).oncomment) === null || _b === void 0 ? void 0 : _b.call(_a2, this.getSlice(start, endIndex - offset));
        (_d = (_c = this.cbs).oncommentend) === null || _d === void 0 ? void 0 : _d.call(_c);
        this.startIndex = endIndex + 1;
      }
      /** @internal */
      oncdata(start, endIndex, offset) {
        var _a2, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        this.endIndex = endIndex;
        const value = this.getSlice(start, endIndex - offset);
        if (this.options.xmlMode || this.options.recognizeCDATA) {
          (_b = (_a2 = this.cbs).oncdatastart) === null || _b === void 0 ? void 0 : _b.call(_a2);
          (_d = (_c = this.cbs).ontext) === null || _d === void 0 ? void 0 : _d.call(_c, value);
          (_f = (_e = this.cbs).oncdataend) === null || _f === void 0 ? void 0 : _f.call(_e);
        } else {
          (_h = (_g = this.cbs).oncomment) === null || _h === void 0 ? void 0 : _h.call(_g, `[CDATA[${value}]]`);
          (_k = (_j = this.cbs).oncommentend) === null || _k === void 0 ? void 0 : _k.call(_j);
        }
        this.startIndex = endIndex + 1;
      }
      /** @internal */
      onend() {
        var _a2, _b;
        if (this.cbs.onclosetag) {
          this.endIndex = this.startIndex;
          for (let index = this.stack.length; index > 0; this.cbs.onclosetag(this.stack[--index], true))
            ;
        }
        (_b = (_a2 = this.cbs).onend) === null || _b === void 0 ? void 0 : _b.call(_a2);
      }
      /**
       * Resets the parser to a blank state, ready to parse a new HTML document
       */
      reset() {
        var _a2, _b, _c, _d;
        (_b = (_a2 = this.cbs).onreset) === null || _b === void 0 ? void 0 : _b.call(_a2);
        this.tokenizer.reset();
        this.tagname = "";
        this.attribname = "";
        this.attribs = null;
        this.stack.length = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        (_d = (_c = this.cbs).onparserinit) === null || _d === void 0 ? void 0 : _d.call(_c, this);
        this.buffers.length = 0;
        this.bufferOffset = 0;
        this.writeIndex = 0;
        this.ended = false;
      }
      /**
       * Resets the parser, then parses a complete document and
       * pushes it to the handler.
       *
       * @param data Document to parse.
       */
      parseComplete(data) {
        this.reset();
        this.end(data);
      }
      getSlice(start, end) {
        while (start - this.bufferOffset >= this.buffers[0].length) {
          this.shiftBuffer();
        }
        let slice = this.buffers[0].slice(start - this.bufferOffset, end - this.bufferOffset);
        while (end - this.bufferOffset > this.buffers[0].length) {
          this.shiftBuffer();
          slice += this.buffers[0].slice(0, end - this.bufferOffset);
        }
        return slice;
      }
      shiftBuffer() {
        this.bufferOffset += this.buffers[0].length;
        this.writeIndex--;
        this.buffers.shift();
      }
      /**
       * Parses a chunk of data and calls the corresponding callbacks.
       *
       * @param chunk Chunk to parse.
       */
      write(chunk) {
        var _a2, _b;
        if (this.ended) {
          (_b = (_a2 = this.cbs).onerror) === null || _b === void 0 ? void 0 : _b.call(_a2, new Error(".write() after done!"));
          return;
        }
        this.buffers.push(chunk);
        if (this.tokenizer.running) {
          this.tokenizer.write(chunk);
          this.writeIndex++;
        }
      }
      /**
       * Parses the end of the buffer and clears the stack, calls onend.
       *
       * @param chunk Optional final chunk to parse.
       */
      end(chunk) {
        var _a2, _b;
        if (this.ended) {
          (_b = (_a2 = this.cbs).onerror) === null || _b === void 0 ? void 0 : _b.call(_a2, new Error(".end() after done!"));
          return;
        }
        if (chunk)
          this.write(chunk);
        this.ended = true;
        this.tokenizer.end();
      }
      /**
       * Pauses parsing. The parser won't emit events until `resume` is called.
       */
      pause() {
        this.tokenizer.pause();
      }
      /**
       * Resumes parsing after `pause` was called.
       */
      resume() {
        this.tokenizer.resume();
        while (this.tokenizer.running && this.writeIndex < this.buffers.length) {
          this.tokenizer.write(this.buffers[this.writeIndex++]);
        }
        if (this.ended)
          this.tokenizer.end();
      }
      /**
       * Alias of `write`, for backwards compatibility.
       *
       * @param chunk Chunk to parse.
       * @deprecated
       */
      parseChunk(chunk) {
        this.write(chunk);
      }
      /**
       * Alias of `end`, for backwards compatibility.
       *
       * @param chunk Optional final chunk to parse.
       * @deprecated
       */
      done(chunk) {
        this.end(chunk);
      }
    };
  }
});

// node_modules/domelementtype/lib/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  CDATA: () => CDATA,
  Comment: () => Comment,
  Directive: () => Directive,
  Doctype: () => Doctype,
  ElementType: () => ElementType,
  Root: () => Root,
  Script: () => Script,
  Style: () => Style,
  Tag: () => Tag,
  Text: () => Text,
  isTag: () => isTag
});
function isTag(elem) {
  return elem.type === ElementType.Tag || elem.type === ElementType.Script || elem.type === ElementType.Style;
}
var ElementType, Root, Text, Directive, Comment, Script, Style, Tag, CDATA, Doctype;
var init_esm = __esm({
  "node_modules/domelementtype/lib/esm/index.js"() {
    (function(ElementType2) {
      ElementType2["Root"] = "root";
      ElementType2["Text"] = "text";
      ElementType2["Directive"] = "directive";
      ElementType2["Comment"] = "comment";
      ElementType2["Script"] = "script";
      ElementType2["Style"] = "style";
      ElementType2["Tag"] = "tag";
      ElementType2["CDATA"] = "cdata";
      ElementType2["Doctype"] = "doctype";
    })(ElementType || (ElementType = {}));
    Root = ElementType.Root;
    Text = ElementType.Text;
    Directive = ElementType.Directive;
    Comment = ElementType.Comment;
    Script = ElementType.Script;
    Style = ElementType.Style;
    Tag = ElementType.Tag;
    CDATA = ElementType.CDATA;
    Doctype = ElementType.Doctype;
  }
});

// node_modules/domhandler/lib/esm/node.js
function isTag2(node) {
  return isTag(node);
}
function isCDATA(node) {
  return node.type === ElementType.CDATA;
}
function isText(node) {
  return node.type === ElementType.Text;
}
function isComment(node) {
  return node.type === ElementType.Comment;
}
function isDirective(node) {
  return node.type === ElementType.Directive;
}
function isDocument(node) {
  return node.type === ElementType.Root;
}
function hasChildren(node) {
  return Object.prototype.hasOwnProperty.call(node, "children");
}
function cloneNode(node, recursive = false) {
  let result;
  if (isText(node)) {
    result = new Text2(node.data);
  } else if (isComment(node)) {
    result = new Comment2(node.data);
  } else if (isTag2(node)) {
    const children = recursive ? cloneChildren(node.children) : [];
    const clone = new Element(node.name, { ...node.attribs }, children);
    children.forEach((child) => child.parent = clone);
    if (node.namespace != null) {
      clone.namespace = node.namespace;
    }
    if (node["x-attribsNamespace"]) {
      clone["x-attribsNamespace"] = { ...node["x-attribsNamespace"] };
    }
    if (node["x-attribsPrefix"]) {
      clone["x-attribsPrefix"] = { ...node["x-attribsPrefix"] };
    }
    result = clone;
  } else if (isCDATA(node)) {
    const children = recursive ? cloneChildren(node.children) : [];
    const clone = new CDATA2(children);
    children.forEach((child) => child.parent = clone);
    result = clone;
  } else if (isDocument(node)) {
    const children = recursive ? cloneChildren(node.children) : [];
    const clone = new Document(children);
    children.forEach((child) => child.parent = clone);
    if (node["x-mode"]) {
      clone["x-mode"] = node["x-mode"];
    }
    result = clone;
  } else if (isDirective(node)) {
    const instruction = new ProcessingInstruction(node.name, node.data);
    if (node["x-name"] != null) {
      instruction["x-name"] = node["x-name"];
      instruction["x-publicId"] = node["x-publicId"];
      instruction["x-systemId"] = node["x-systemId"];
    }
    result = instruction;
  } else {
    throw new Error(`Not implemented yet: ${node.type}`);
  }
  result.startIndex = node.startIndex;
  result.endIndex = node.endIndex;
  if (node.sourceCodeLocation != null) {
    result.sourceCodeLocation = node.sourceCodeLocation;
  }
  return result;
}
function cloneChildren(childs) {
  const children = childs.map((child) => cloneNode(child, true));
  for (let i = 1; i < children.length; i++) {
    children[i].prev = children[i - 1];
    children[i - 1].next = children[i];
  }
  return children;
}
var Node, DataNode, Text2, Comment2, ProcessingInstruction, NodeWithChildren, CDATA2, Document, Element;
var init_node = __esm({
  "node_modules/domhandler/lib/esm/node.js"() {
    init_esm();
    Node = class {
      constructor() {
        this.parent = null;
        this.prev = null;
        this.next = null;
        this.startIndex = null;
        this.endIndex = null;
      }
      // Read-write aliases for properties
      /**
       * Same as {@link parent}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get parentNode() {
        return this.parent;
      }
      set parentNode(parent) {
        this.parent = parent;
      }
      /**
       * Same as {@link prev}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get previousSibling() {
        return this.prev;
      }
      set previousSibling(prev) {
        this.prev = prev;
      }
      /**
       * Same as {@link next}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get nextSibling() {
        return this.next;
      }
      set nextSibling(next) {
        this.next = next;
      }
      /**
       * Clone this node, and optionally its children.
       *
       * @param recursive Clone child nodes as well.
       * @returns A clone of the node.
       */
      cloneNode(recursive = false) {
        return cloneNode(this, recursive);
      }
    };
    DataNode = class extends Node {
      /**
       * @param data The content of the data node
       */
      constructor(data) {
        super();
        this.data = data;
      }
      /**
       * Same as {@link data}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get nodeValue() {
        return this.data;
      }
      set nodeValue(data) {
        this.data = data;
      }
    };
    Text2 = class extends DataNode {
      constructor() {
        super(...arguments);
        this.type = ElementType.Text;
      }
      get nodeType() {
        return 3;
      }
    };
    Comment2 = class extends DataNode {
      constructor() {
        super(...arguments);
        this.type = ElementType.Comment;
      }
      get nodeType() {
        return 8;
      }
    };
    ProcessingInstruction = class extends DataNode {
      constructor(name, data) {
        super(data);
        this.name = name;
        this.type = ElementType.Directive;
      }
      get nodeType() {
        return 1;
      }
    };
    NodeWithChildren = class extends Node {
      /**
       * @param children Children of the node. Only certain node types can have children.
       */
      constructor(children) {
        super();
        this.children = children;
      }
      // Aliases
      /** First child of the node. */
      get firstChild() {
        var _a2;
        return (_a2 = this.children[0]) !== null && _a2 !== void 0 ? _a2 : null;
      }
      /** Last child of the node. */
      get lastChild() {
        return this.children.length > 0 ? this.children[this.children.length - 1] : null;
      }
      /**
       * Same as {@link children}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get childNodes() {
        return this.children;
      }
      set childNodes(children) {
        this.children = children;
      }
    };
    CDATA2 = class extends NodeWithChildren {
      constructor() {
        super(...arguments);
        this.type = ElementType.CDATA;
      }
      get nodeType() {
        return 4;
      }
    };
    Document = class extends NodeWithChildren {
      constructor() {
        super(...arguments);
        this.type = ElementType.Root;
      }
      get nodeType() {
        return 9;
      }
    };
    Element = class extends NodeWithChildren {
      /**
       * @param name Name of the tag, eg. `div`, `span`.
       * @param attribs Object mapping attribute names to attribute values.
       * @param children Children of the node.
       */
      constructor(name, attribs, children = [], type = name === "script" ? ElementType.Script : name === "style" ? ElementType.Style : ElementType.Tag) {
        super(children);
        this.name = name;
        this.attribs = attribs;
        this.type = type;
      }
      get nodeType() {
        return 1;
      }
      // DOM Level 1 aliases
      /**
       * Same as {@link name}.
       * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
       */
      get tagName() {
        return this.name;
      }
      set tagName(name) {
        this.name = name;
      }
      get attributes() {
        return Object.keys(this.attribs).map((name) => {
          var _a2, _b;
          return {
            name,
            value: this.attribs[name],
            namespace: (_a2 = this["x-attribsNamespace"]) === null || _a2 === void 0 ? void 0 : _a2[name],
            prefix: (_b = this["x-attribsPrefix"]) === null || _b === void 0 ? void 0 : _b[name]
          };
        });
      }
    };
  }
});

// node_modules/domhandler/lib/esm/index.js
var defaultOpts, DomHandler;
var init_esm2 = __esm({
  "node_modules/domhandler/lib/esm/index.js"() {
    init_esm();
    init_node();
    init_node();
    defaultOpts = {
      withStartIndices: false,
      withEndIndices: false,
      xmlMode: false
    };
    DomHandler = class {
      /**
       * @param callback Called once parsing has completed.
       * @param options Settings for the handler.
       * @param elementCB Callback whenever a tag is closed.
       */
      constructor(callback, options, elementCB) {
        this.dom = [];
        this.root = new Document(this.dom);
        this.done = false;
        this.tagStack = [this.root];
        this.lastNode = null;
        this.parser = null;
        if (typeof options === "function") {
          elementCB = options;
          options = defaultOpts;
        }
        if (typeof callback === "object") {
          options = callback;
          callback = void 0;
        }
        this.callback = callback !== null && callback !== void 0 ? callback : null;
        this.options = options !== null && options !== void 0 ? options : defaultOpts;
        this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
      }
      onparserinit(parser) {
        this.parser = parser;
      }
      // Resets the handler back to starting state
      onreset() {
        this.dom = [];
        this.root = new Document(this.dom);
        this.done = false;
        this.tagStack = [this.root];
        this.lastNode = null;
        this.parser = null;
      }
      // Signals the handler that parsing is done
      onend() {
        if (this.done)
          return;
        this.done = true;
        this.parser = null;
        this.handleCallback(null);
      }
      onerror(error) {
        this.handleCallback(error);
      }
      onclosetag() {
        this.lastNode = null;
        const elem = this.tagStack.pop();
        if (this.options.withEndIndices) {
          elem.endIndex = this.parser.endIndex;
        }
        if (this.elementCB)
          this.elementCB(elem);
      }
      onopentag(name, attribs) {
        const type = this.options.xmlMode ? ElementType.Tag : void 0;
        const element = new Element(name, attribs, void 0, type);
        this.addNode(element);
        this.tagStack.push(element);
      }
      ontext(data) {
        const { lastNode } = this;
        if (lastNode && lastNode.type === ElementType.Text) {
          lastNode.data += data;
          if (this.options.withEndIndices) {
            lastNode.endIndex = this.parser.endIndex;
          }
        } else {
          const node = new Text2(data);
          this.addNode(node);
          this.lastNode = node;
        }
      }
      oncomment(data) {
        if (this.lastNode && this.lastNode.type === ElementType.Comment) {
          this.lastNode.data += data;
          return;
        }
        const node = new Comment2(data);
        this.addNode(node);
        this.lastNode = node;
      }
      oncommentend() {
        this.lastNode = null;
      }
      oncdatastart() {
        const text = new Text2("");
        const node = new CDATA2([text]);
        this.addNode(node);
        text.parent = node;
        this.lastNode = text;
      }
      oncdataend() {
        this.lastNode = null;
      }
      onprocessinginstruction(name, data) {
        const node = new ProcessingInstruction(name, data);
        this.addNode(node);
      }
      handleCallback(error) {
        if (typeof this.callback === "function") {
          this.callback(error, this.dom);
        } else if (error) {
          throw error;
        }
      }
      addNode(node) {
        const parent = this.tagStack[this.tagStack.length - 1];
        const previousSibling2 = parent.children[parent.children.length - 1];
        if (this.options.withStartIndices) {
          node.startIndex = this.parser.startIndex;
        }
        if (this.options.withEndIndices) {
          node.endIndex = this.parser.endIndex;
        }
        parent.children.push(node);
        if (previousSibling2) {
          node.prev = previousSibling2;
          previousSibling2.next = node;
        }
        node.parent = parent;
        this.lastNode = null;
      }
    };
  }
});

// node_modules/entities/lib/esm/generated/encode-html.js
function restoreDiff(arr) {
  for (let i = 1; i < arr.length; i++) {
    arr[i][0] += arr[i - 1][0] + 1;
  }
  return arr;
}
var encode_html_default;
var init_encode_html = __esm({
  "node_modules/entities/lib/esm/generated/encode-html.js"() {
    encode_html_default = new Map(/* @__PURE__ */ restoreDiff([[9, "&Tab;"], [0, "&NewLine;"], [22, "&excl;"], [0, "&quot;"], [0, "&num;"], [0, "&dollar;"], [0, "&percnt;"], [0, "&amp;"], [0, "&apos;"], [0, "&lpar;"], [0, "&rpar;"], [0, "&ast;"], [0, "&plus;"], [0, "&comma;"], [1, "&period;"], [0, "&sol;"], [10, "&colon;"], [0, "&semi;"], [0, { v: "&lt;", n: 8402, o: "&nvlt;" }], [0, { v: "&equals;", n: 8421, o: "&bne;" }], [0, { v: "&gt;", n: 8402, o: "&nvgt;" }], [0, "&quest;"], [0, "&commat;"], [26, "&lbrack;"], [0, "&bsol;"], [0, "&rbrack;"], [0, "&Hat;"], [0, "&lowbar;"], [0, "&DiacriticalGrave;"], [5, { n: 106, o: "&fjlig;" }], [20, "&lbrace;"], [0, "&verbar;"], [0, "&rbrace;"], [34, "&nbsp;"], [0, "&iexcl;"], [0, "&cent;"], [0, "&pound;"], [0, "&curren;"], [0, "&yen;"], [0, "&brvbar;"], [0, "&sect;"], [0, "&die;"], [0, "&copy;"], [0, "&ordf;"], [0, "&laquo;"], [0, "&not;"], [0, "&shy;"], [0, "&circledR;"], [0, "&macr;"], [0, "&deg;"], [0, "&PlusMinus;"], [0, "&sup2;"], [0, "&sup3;"], [0, "&acute;"], [0, "&micro;"], [0, "&para;"], [0, "&centerdot;"], [0, "&cedil;"], [0, "&sup1;"], [0, "&ordm;"], [0, "&raquo;"], [0, "&frac14;"], [0, "&frac12;"], [0, "&frac34;"], [0, "&iquest;"], [0, "&Agrave;"], [0, "&Aacute;"], [0, "&Acirc;"], [0, "&Atilde;"], [0, "&Auml;"], [0, "&angst;"], [0, "&AElig;"], [0, "&Ccedil;"], [0, "&Egrave;"], [0, "&Eacute;"], [0, "&Ecirc;"], [0, "&Euml;"], [0, "&Igrave;"], [0, "&Iacute;"], [0, "&Icirc;"], [0, "&Iuml;"], [0, "&ETH;"], [0, "&Ntilde;"], [0, "&Ograve;"], [0, "&Oacute;"], [0, "&Ocirc;"], [0, "&Otilde;"], [0, "&Ouml;"], [0, "&times;"], [0, "&Oslash;"], [0, "&Ugrave;"], [0, "&Uacute;"], [0, "&Ucirc;"], [0, "&Uuml;"], [0, "&Yacute;"], [0, "&THORN;"], [0, "&szlig;"], [0, "&agrave;"], [0, "&aacute;"], [0, "&acirc;"], [0, "&atilde;"], [0, "&auml;"], [0, "&aring;"], [0, "&aelig;"], [0, "&ccedil;"], [0, "&egrave;"], [0, "&eacute;"], [0, "&ecirc;"], [0, "&euml;"], [0, "&igrave;"], [0, "&iacute;"], [0, "&icirc;"], [0, "&iuml;"], [0, "&eth;"], [0, "&ntilde;"], [0, "&ograve;"], [0, "&oacute;"], [0, "&ocirc;"], [0, "&otilde;"], [0, "&ouml;"], [0, "&div;"], [0, "&oslash;"], [0, "&ugrave;"], [0, "&uacute;"], [0, "&ucirc;"], [0, "&uuml;"], [0, "&yacute;"], [0, "&thorn;"], [0, "&yuml;"], [0, "&Amacr;"], [0, "&amacr;"], [0, "&Abreve;"], [0, "&abreve;"], [0, "&Aogon;"], [0, "&aogon;"], [0, "&Cacute;"], [0, "&cacute;"], [0, "&Ccirc;"], [0, "&ccirc;"], [0, "&Cdot;"], [0, "&cdot;"], [0, "&Ccaron;"], [0, "&ccaron;"], [0, "&Dcaron;"], [0, "&dcaron;"], [0, "&Dstrok;"], [0, "&dstrok;"], [0, "&Emacr;"], [0, "&emacr;"], [2, "&Edot;"], [0, "&edot;"], [0, "&Eogon;"], [0, "&eogon;"], [0, "&Ecaron;"], [0, "&ecaron;"], [0, "&Gcirc;"], [0, "&gcirc;"], [0, "&Gbreve;"], [0, "&gbreve;"], [0, "&Gdot;"], [0, "&gdot;"], [0, "&Gcedil;"], [1, "&Hcirc;"], [0, "&hcirc;"], [0, "&Hstrok;"], [0, "&hstrok;"], [0, "&Itilde;"], [0, "&itilde;"], [0, "&Imacr;"], [0, "&imacr;"], [2, "&Iogon;"], [0, "&iogon;"], [0, "&Idot;"], [0, "&imath;"], [0, "&IJlig;"], [0, "&ijlig;"], [0, "&Jcirc;"], [0, "&jcirc;"], [0, "&Kcedil;"], [0, "&kcedil;"], [0, "&kgreen;"], [0, "&Lacute;"], [0, "&lacute;"], [0, "&Lcedil;"], [0, "&lcedil;"], [0, "&Lcaron;"], [0, "&lcaron;"], [0, "&Lmidot;"], [0, "&lmidot;"], [0, "&Lstrok;"], [0, "&lstrok;"], [0, "&Nacute;"], [0, "&nacute;"], [0, "&Ncedil;"], [0, "&ncedil;"], [0, "&Ncaron;"], [0, "&ncaron;"], [0, "&napos;"], [0, "&ENG;"], [0, "&eng;"], [0, "&Omacr;"], [0, "&omacr;"], [2, "&Odblac;"], [0, "&odblac;"], [0, "&OElig;"], [0, "&oelig;"], [0, "&Racute;"], [0, "&racute;"], [0, "&Rcedil;"], [0, "&rcedil;"], [0, "&Rcaron;"], [0, "&rcaron;"], [0, "&Sacute;"], [0, "&sacute;"], [0, "&Scirc;"], [0, "&scirc;"], [0, "&Scedil;"], [0, "&scedil;"], [0, "&Scaron;"], [0, "&scaron;"], [0, "&Tcedil;"], [0, "&tcedil;"], [0, "&Tcaron;"], [0, "&tcaron;"], [0, "&Tstrok;"], [0, "&tstrok;"], [0, "&Utilde;"], [0, "&utilde;"], [0, "&Umacr;"], [0, "&umacr;"], [0, "&Ubreve;"], [0, "&ubreve;"], [0, "&Uring;"], [0, "&uring;"], [0, "&Udblac;"], [0, "&udblac;"], [0, "&Uogon;"], [0, "&uogon;"], [0, "&Wcirc;"], [0, "&wcirc;"], [0, "&Ycirc;"], [0, "&ycirc;"], [0, "&Yuml;"], [0, "&Zacute;"], [0, "&zacute;"], [0, "&Zdot;"], [0, "&zdot;"], [0, "&Zcaron;"], [0, "&zcaron;"], [19, "&fnof;"], [34, "&imped;"], [63, "&gacute;"], [65, "&jmath;"], [142, "&circ;"], [0, "&caron;"], [16, "&breve;"], [0, "&DiacriticalDot;"], [0, "&ring;"], [0, "&ogon;"], [0, "&DiacriticalTilde;"], [0, "&dblac;"], [51, "&DownBreve;"], [127, "&Alpha;"], [0, "&Beta;"], [0, "&Gamma;"], [0, "&Delta;"], [0, "&Epsilon;"], [0, "&Zeta;"], [0, "&Eta;"], [0, "&Theta;"], [0, "&Iota;"], [0, "&Kappa;"], [0, "&Lambda;"], [0, "&Mu;"], [0, "&Nu;"], [0, "&Xi;"], [0, "&Omicron;"], [0, "&Pi;"], [0, "&Rho;"], [1, "&Sigma;"], [0, "&Tau;"], [0, "&Upsilon;"], [0, "&Phi;"], [0, "&Chi;"], [0, "&Psi;"], [0, "&ohm;"], [7, "&alpha;"], [0, "&beta;"], [0, "&gamma;"], [0, "&delta;"], [0, "&epsi;"], [0, "&zeta;"], [0, "&eta;"], [0, "&theta;"], [0, "&iota;"], [0, "&kappa;"], [0, "&lambda;"], [0, "&mu;"], [0, "&nu;"], [0, "&xi;"], [0, "&omicron;"], [0, "&pi;"], [0, "&rho;"], [0, "&sigmaf;"], [0, "&sigma;"], [0, "&tau;"], [0, "&upsi;"], [0, "&phi;"], [0, "&chi;"], [0, "&psi;"], [0, "&omega;"], [7, "&thetasym;"], [0, "&Upsi;"], [2, "&phiv;"], [0, "&piv;"], [5, "&Gammad;"], [0, "&digamma;"], [18, "&kappav;"], [0, "&rhov;"], [3, "&epsiv;"], [0, "&backepsilon;"], [10, "&IOcy;"], [0, "&DJcy;"], [0, "&GJcy;"], [0, "&Jukcy;"], [0, "&DScy;"], [0, "&Iukcy;"], [0, "&YIcy;"], [0, "&Jsercy;"], [0, "&LJcy;"], [0, "&NJcy;"], [0, "&TSHcy;"], [0, "&KJcy;"], [1, "&Ubrcy;"], [0, "&DZcy;"], [0, "&Acy;"], [0, "&Bcy;"], [0, "&Vcy;"], [0, "&Gcy;"], [0, "&Dcy;"], [0, "&IEcy;"], [0, "&ZHcy;"], [0, "&Zcy;"], [0, "&Icy;"], [0, "&Jcy;"], [0, "&Kcy;"], [0, "&Lcy;"], [0, "&Mcy;"], [0, "&Ncy;"], [0, "&Ocy;"], [0, "&Pcy;"], [0, "&Rcy;"], [0, "&Scy;"], [0, "&Tcy;"], [0, "&Ucy;"], [0, "&Fcy;"], [0, "&KHcy;"], [0, "&TScy;"], [0, "&CHcy;"], [0, "&SHcy;"], [0, "&SHCHcy;"], [0, "&HARDcy;"], [0, "&Ycy;"], [0, "&SOFTcy;"], [0, "&Ecy;"], [0, "&YUcy;"], [0, "&YAcy;"], [0, "&acy;"], [0, "&bcy;"], [0, "&vcy;"], [0, "&gcy;"], [0, "&dcy;"], [0, "&iecy;"], [0, "&zhcy;"], [0, "&zcy;"], [0, "&icy;"], [0, "&jcy;"], [0, "&kcy;"], [0, "&lcy;"], [0, "&mcy;"], [0, "&ncy;"], [0, "&ocy;"], [0, "&pcy;"], [0, "&rcy;"], [0, "&scy;"], [0, "&tcy;"], [0, "&ucy;"], [0, "&fcy;"], [0, "&khcy;"], [0, "&tscy;"], [0, "&chcy;"], [0, "&shcy;"], [0, "&shchcy;"], [0, "&hardcy;"], [0, "&ycy;"], [0, "&softcy;"], [0, "&ecy;"], [0, "&yucy;"], [0, "&yacy;"], [1, "&iocy;"], [0, "&djcy;"], [0, "&gjcy;"], [0, "&jukcy;"], [0, "&dscy;"], [0, "&iukcy;"], [0, "&yicy;"], [0, "&jsercy;"], [0, "&ljcy;"], [0, "&njcy;"], [0, "&tshcy;"], [0, "&kjcy;"], [1, "&ubrcy;"], [0, "&dzcy;"], [7074, "&ensp;"], [0, "&emsp;"], [0, "&emsp13;"], [0, "&emsp14;"], [1, "&numsp;"], [0, "&puncsp;"], [0, "&ThinSpace;"], [0, "&hairsp;"], [0, "&NegativeMediumSpace;"], [0, "&zwnj;"], [0, "&zwj;"], [0, "&lrm;"], [0, "&rlm;"], [0, "&dash;"], [2, "&ndash;"], [0, "&mdash;"], [0, "&horbar;"], [0, "&Verbar;"], [1, "&lsquo;"], [0, "&CloseCurlyQuote;"], [0, "&lsquor;"], [1, "&ldquo;"], [0, "&CloseCurlyDoubleQuote;"], [0, "&bdquo;"], [1, "&dagger;"], [0, "&Dagger;"], [0, "&bull;"], [2, "&nldr;"], [0, "&hellip;"], [9, "&permil;"], [0, "&pertenk;"], [0, "&prime;"], [0, "&Prime;"], [0, "&tprime;"], [0, "&backprime;"], [3, "&lsaquo;"], [0, "&rsaquo;"], [3, "&oline;"], [2, "&caret;"], [1, "&hybull;"], [0, "&frasl;"], [10, "&bsemi;"], [7, "&qprime;"], [7, { v: "&MediumSpace;", n: 8202, o: "&ThickSpace;" }], [0, "&NoBreak;"], [0, "&af;"], [0, "&InvisibleTimes;"], [0, "&ic;"], [72, "&euro;"], [46, "&tdot;"], [0, "&DotDot;"], [37, "&complexes;"], [2, "&incare;"], [4, "&gscr;"], [0, "&hamilt;"], [0, "&Hfr;"], [0, "&Hopf;"], [0, "&planckh;"], [0, "&hbar;"], [0, "&imagline;"], [0, "&Ifr;"], [0, "&lagran;"], [0, "&ell;"], [1, "&naturals;"], [0, "&numero;"], [0, "&copysr;"], [0, "&weierp;"], [0, "&Popf;"], [0, "&Qopf;"], [0, "&realine;"], [0, "&real;"], [0, "&reals;"], [0, "&rx;"], [3, "&trade;"], [1, "&integers;"], [2, "&mho;"], [0, "&zeetrf;"], [0, "&iiota;"], [2, "&bernou;"], [0, "&Cayleys;"], [1, "&escr;"], [0, "&Escr;"], [0, "&Fouriertrf;"], [1, "&Mellintrf;"], [0, "&order;"], [0, "&alefsym;"], [0, "&beth;"], [0, "&gimel;"], [0, "&daleth;"], [12, "&CapitalDifferentialD;"], [0, "&dd;"], [0, "&ee;"], [0, "&ii;"], [10, "&frac13;"], [0, "&frac23;"], [0, "&frac15;"], [0, "&frac25;"], [0, "&frac35;"], [0, "&frac45;"], [0, "&frac16;"], [0, "&frac56;"], [0, "&frac18;"], [0, "&frac38;"], [0, "&frac58;"], [0, "&frac78;"], [49, "&larr;"], [0, "&ShortUpArrow;"], [0, "&rarr;"], [0, "&darr;"], [0, "&harr;"], [0, "&updownarrow;"], [0, "&nwarr;"], [0, "&nearr;"], [0, "&LowerRightArrow;"], [0, "&LowerLeftArrow;"], [0, "&nlarr;"], [0, "&nrarr;"], [1, { v: "&rarrw;", n: 824, o: "&nrarrw;" }], [0, "&Larr;"], [0, "&Uarr;"], [0, "&Rarr;"], [0, "&Darr;"], [0, "&larrtl;"], [0, "&rarrtl;"], [0, "&LeftTeeArrow;"], [0, "&mapstoup;"], [0, "&map;"], [0, "&DownTeeArrow;"], [1, "&hookleftarrow;"], [0, "&hookrightarrow;"], [0, "&larrlp;"], [0, "&looparrowright;"], [0, "&harrw;"], [0, "&nharr;"], [1, "&lsh;"], [0, "&rsh;"], [0, "&ldsh;"], [0, "&rdsh;"], [1, "&crarr;"], [0, "&cularr;"], [0, "&curarr;"], [2, "&circlearrowleft;"], [0, "&circlearrowright;"], [0, "&leftharpoonup;"], [0, "&DownLeftVector;"], [0, "&RightUpVector;"], [0, "&LeftUpVector;"], [0, "&rharu;"], [0, "&DownRightVector;"], [0, "&dharr;"], [0, "&dharl;"], [0, "&RightArrowLeftArrow;"], [0, "&udarr;"], [0, "&LeftArrowRightArrow;"], [0, "&leftleftarrows;"], [0, "&upuparrows;"], [0, "&rightrightarrows;"], [0, "&ddarr;"], [0, "&leftrightharpoons;"], [0, "&Equilibrium;"], [0, "&nlArr;"], [0, "&nhArr;"], [0, "&nrArr;"], [0, "&DoubleLeftArrow;"], [0, "&DoubleUpArrow;"], [0, "&DoubleRightArrow;"], [0, "&dArr;"], [0, "&DoubleLeftRightArrow;"], [0, "&DoubleUpDownArrow;"], [0, "&nwArr;"], [0, "&neArr;"], [0, "&seArr;"], [0, "&swArr;"], [0, "&lAarr;"], [0, "&rAarr;"], [1, "&zigrarr;"], [6, "&larrb;"], [0, "&rarrb;"], [15, "&DownArrowUpArrow;"], [7, "&loarr;"], [0, "&roarr;"], [0, "&hoarr;"], [0, "&forall;"], [0, "&comp;"], [0, { v: "&part;", n: 824, o: "&npart;" }], [0, "&exist;"], [0, "&nexist;"], [0, "&empty;"], [1, "&Del;"], [0, "&Element;"], [0, "&NotElement;"], [1, "&ni;"], [0, "&notni;"], [2, "&prod;"], [0, "&coprod;"], [0, "&sum;"], [0, "&minus;"], [0, "&MinusPlus;"], [0, "&dotplus;"], [1, "&Backslash;"], [0, "&lowast;"], [0, "&compfn;"], [1, "&radic;"], [2, "&prop;"], [0, "&infin;"], [0, "&angrt;"], [0, { v: "&ang;", n: 8402, o: "&nang;" }], [0, "&angmsd;"], [0, "&angsph;"], [0, "&mid;"], [0, "&nmid;"], [0, "&DoubleVerticalBar;"], [0, "&NotDoubleVerticalBar;"], [0, "&and;"], [0, "&or;"], [0, { v: "&cap;", n: 65024, o: "&caps;" }], [0, { v: "&cup;", n: 65024, o: "&cups;" }], [0, "&int;"], [0, "&Int;"], [0, "&iiint;"], [0, "&conint;"], [0, "&Conint;"], [0, "&Cconint;"], [0, "&cwint;"], [0, "&ClockwiseContourIntegral;"], [0, "&awconint;"], [0, "&there4;"], [0, "&becaus;"], [0, "&ratio;"], [0, "&Colon;"], [0, "&dotminus;"], [1, "&mDDot;"], [0, "&homtht;"], [0, { v: "&sim;", n: 8402, o: "&nvsim;" }], [0, { v: "&backsim;", n: 817, o: "&race;" }], [0, { v: "&ac;", n: 819, o: "&acE;" }], [0, "&acd;"], [0, "&VerticalTilde;"], [0, "&NotTilde;"], [0, { v: "&eqsim;", n: 824, o: "&nesim;" }], [0, "&sime;"], [0, "&NotTildeEqual;"], [0, "&cong;"], [0, "&simne;"], [0, "&ncong;"], [0, "&ap;"], [0, "&nap;"], [0, "&ape;"], [0, { v: "&apid;", n: 824, o: "&napid;" }], [0, "&backcong;"], [0, { v: "&asympeq;", n: 8402, o: "&nvap;" }], [0, { v: "&bump;", n: 824, o: "&nbump;" }], [0, { v: "&bumpe;", n: 824, o: "&nbumpe;" }], [0, { v: "&doteq;", n: 824, o: "&nedot;" }], [0, "&doteqdot;"], [0, "&efDot;"], [0, "&erDot;"], [0, "&Assign;"], [0, "&ecolon;"], [0, "&ecir;"], [0, "&circeq;"], [1, "&wedgeq;"], [0, "&veeeq;"], [1, "&triangleq;"], [2, "&equest;"], [0, "&ne;"], [0, { v: "&Congruent;", n: 8421, o: "&bnequiv;" }], [0, "&nequiv;"], [1, { v: "&le;", n: 8402, o: "&nvle;" }], [0, { v: "&ge;", n: 8402, o: "&nvge;" }], [0, { v: "&lE;", n: 824, o: "&nlE;" }], [0, { v: "&gE;", n: 824, o: "&ngE;" }], [0, { v: "&lnE;", n: 65024, o: "&lvertneqq;" }], [0, { v: "&gnE;", n: 65024, o: "&gvertneqq;" }], [0, { v: "&ll;", n: new Map(/* @__PURE__ */ restoreDiff([[824, "&nLtv;"], [7577, "&nLt;"]])) }], [0, { v: "&gg;", n: new Map(/* @__PURE__ */ restoreDiff([[824, "&nGtv;"], [7577, "&nGt;"]])) }], [0, "&between;"], [0, "&NotCupCap;"], [0, "&nless;"], [0, "&ngt;"], [0, "&nle;"], [0, "&nge;"], [0, "&lesssim;"], [0, "&GreaterTilde;"], [0, "&nlsim;"], [0, "&ngsim;"], [0, "&LessGreater;"], [0, "&gl;"], [0, "&NotLessGreater;"], [0, "&NotGreaterLess;"], [0, "&pr;"], [0, "&sc;"], [0, "&prcue;"], [0, "&sccue;"], [0, "&PrecedesTilde;"], [0, { v: "&scsim;", n: 824, o: "&NotSucceedsTilde;" }], [0, "&NotPrecedes;"], [0, "&NotSucceeds;"], [0, { v: "&sub;", n: 8402, o: "&NotSubset;" }], [0, { v: "&sup;", n: 8402, o: "&NotSuperset;" }], [0, "&nsub;"], [0, "&nsup;"], [0, "&sube;"], [0, "&supe;"], [0, "&NotSubsetEqual;"], [0, "&NotSupersetEqual;"], [0, { v: "&subne;", n: 65024, o: "&varsubsetneq;" }], [0, { v: "&supne;", n: 65024, o: "&varsupsetneq;" }], [1, "&cupdot;"], [0, "&UnionPlus;"], [0, { v: "&sqsub;", n: 824, o: "&NotSquareSubset;" }], [0, { v: "&sqsup;", n: 824, o: "&NotSquareSuperset;" }], [0, "&sqsube;"], [0, "&sqsupe;"], [0, { v: "&sqcap;", n: 65024, o: "&sqcaps;" }], [0, { v: "&sqcup;", n: 65024, o: "&sqcups;" }], [0, "&CirclePlus;"], [0, "&CircleMinus;"], [0, "&CircleTimes;"], [0, "&osol;"], [0, "&CircleDot;"], [0, "&circledcirc;"], [0, "&circledast;"], [1, "&circleddash;"], [0, "&boxplus;"], [0, "&boxminus;"], [0, "&boxtimes;"], [0, "&dotsquare;"], [0, "&RightTee;"], [0, "&dashv;"], [0, "&DownTee;"], [0, "&bot;"], [1, "&models;"], [0, "&DoubleRightTee;"], [0, "&Vdash;"], [0, "&Vvdash;"], [0, "&VDash;"], [0, "&nvdash;"], [0, "&nvDash;"], [0, "&nVdash;"], [0, "&nVDash;"], [0, "&prurel;"], [1, "&LeftTriangle;"], [0, "&RightTriangle;"], [0, { v: "&LeftTriangleEqual;", n: 8402, o: "&nvltrie;" }], [0, { v: "&RightTriangleEqual;", n: 8402, o: "&nvrtrie;" }], [0, "&origof;"], [0, "&imof;"], [0, "&multimap;"], [0, "&hercon;"], [0, "&intcal;"], [0, "&veebar;"], [1, "&barvee;"], [0, "&angrtvb;"], [0, "&lrtri;"], [0, "&bigwedge;"], [0, "&bigvee;"], [0, "&bigcap;"], [0, "&bigcup;"], [0, "&diam;"], [0, "&sdot;"], [0, "&sstarf;"], [0, "&divideontimes;"], [0, "&bowtie;"], [0, "&ltimes;"], [0, "&rtimes;"], [0, "&leftthreetimes;"], [0, "&rightthreetimes;"], [0, "&backsimeq;"], [0, "&curlyvee;"], [0, "&curlywedge;"], [0, "&Sub;"], [0, "&Sup;"], [0, "&Cap;"], [0, "&Cup;"], [0, "&fork;"], [0, "&epar;"], [0, "&lessdot;"], [0, "&gtdot;"], [0, { v: "&Ll;", n: 824, o: "&nLl;" }], [0, { v: "&Gg;", n: 824, o: "&nGg;" }], [0, { v: "&leg;", n: 65024, o: "&lesg;" }], [0, { v: "&gel;", n: 65024, o: "&gesl;" }], [2, "&cuepr;"], [0, "&cuesc;"], [0, "&NotPrecedesSlantEqual;"], [0, "&NotSucceedsSlantEqual;"], [0, "&NotSquareSubsetEqual;"], [0, "&NotSquareSupersetEqual;"], [2, "&lnsim;"], [0, "&gnsim;"], [0, "&precnsim;"], [0, "&scnsim;"], [0, "&nltri;"], [0, "&NotRightTriangle;"], [0, "&nltrie;"], [0, "&NotRightTriangleEqual;"], [0, "&vellip;"], [0, "&ctdot;"], [0, "&utdot;"], [0, "&dtdot;"], [0, "&disin;"], [0, "&isinsv;"], [0, "&isins;"], [0, { v: "&isindot;", n: 824, o: "&notindot;" }], [0, "&notinvc;"], [0, "&notinvb;"], [1, { v: "&isinE;", n: 824, o: "&notinE;" }], [0, "&nisd;"], [0, "&xnis;"], [0, "&nis;"], [0, "&notnivc;"], [0, "&notnivb;"], [6, "&barwed;"], [0, "&Barwed;"], [1, "&lceil;"], [0, "&rceil;"], [0, "&LeftFloor;"], [0, "&rfloor;"], [0, "&drcrop;"], [0, "&dlcrop;"], [0, "&urcrop;"], [0, "&ulcrop;"], [0, "&bnot;"], [1, "&profline;"], [0, "&profsurf;"], [1, "&telrec;"], [0, "&target;"], [5, "&ulcorn;"], [0, "&urcorn;"], [0, "&dlcorn;"], [0, "&drcorn;"], [2, "&frown;"], [0, "&smile;"], [9, "&cylcty;"], [0, "&profalar;"], [7, "&topbot;"], [6, "&ovbar;"], [1, "&solbar;"], [60, "&angzarr;"], [51, "&lmoustache;"], [0, "&rmoustache;"], [2, "&OverBracket;"], [0, "&bbrk;"], [0, "&bbrktbrk;"], [37, "&OverParenthesis;"], [0, "&UnderParenthesis;"], [0, "&OverBrace;"], [0, "&UnderBrace;"], [2, "&trpezium;"], [4, "&elinters;"], [59, "&blank;"], [164, "&circledS;"], [55, "&boxh;"], [1, "&boxv;"], [9, "&boxdr;"], [3, "&boxdl;"], [3, "&boxur;"], [3, "&boxul;"], [3, "&boxvr;"], [7, "&boxvl;"], [7, "&boxhd;"], [7, "&boxhu;"], [7, "&boxvh;"], [19, "&boxH;"], [0, "&boxV;"], [0, "&boxdR;"], [0, "&boxDr;"], [0, "&boxDR;"], [0, "&boxdL;"], [0, "&boxDl;"], [0, "&boxDL;"], [0, "&boxuR;"], [0, "&boxUr;"], [0, "&boxUR;"], [0, "&boxuL;"], [0, "&boxUl;"], [0, "&boxUL;"], [0, "&boxvR;"], [0, "&boxVr;"], [0, "&boxVR;"], [0, "&boxvL;"], [0, "&boxVl;"], [0, "&boxVL;"], [0, "&boxHd;"], [0, "&boxhD;"], [0, "&boxHD;"], [0, "&boxHu;"], [0, "&boxhU;"], [0, "&boxHU;"], [0, "&boxvH;"], [0, "&boxVh;"], [0, "&boxVH;"], [19, "&uhblk;"], [3, "&lhblk;"], [3, "&block;"], [8, "&blk14;"], [0, "&blk12;"], [0, "&blk34;"], [13, "&square;"], [8, "&blacksquare;"], [0, "&EmptyVerySmallSquare;"], [1, "&rect;"], [0, "&marker;"], [2, "&fltns;"], [1, "&bigtriangleup;"], [0, "&blacktriangle;"], [0, "&triangle;"], [2, "&blacktriangleright;"], [0, "&rtri;"], [3, "&bigtriangledown;"], [0, "&blacktriangledown;"], [0, "&dtri;"], [2, "&blacktriangleleft;"], [0, "&ltri;"], [6, "&loz;"], [0, "&cir;"], [32, "&tridot;"], [2, "&bigcirc;"], [8, "&ultri;"], [0, "&urtri;"], [0, "&lltri;"], [0, "&EmptySmallSquare;"], [0, "&FilledSmallSquare;"], [8, "&bigstar;"], [0, "&star;"], [7, "&phone;"], [49, "&female;"], [1, "&male;"], [29, "&spades;"], [2, "&clubs;"], [1, "&hearts;"], [0, "&diamondsuit;"], [3, "&sung;"], [2, "&flat;"], [0, "&natural;"], [0, "&sharp;"], [163, "&check;"], [3, "&cross;"], [8, "&malt;"], [21, "&sext;"], [33, "&VerticalSeparator;"], [25, "&lbbrk;"], [0, "&rbbrk;"], [84, "&bsolhsub;"], [0, "&suphsol;"], [28, "&LeftDoubleBracket;"], [0, "&RightDoubleBracket;"], [0, "&lang;"], [0, "&rang;"], [0, "&Lang;"], [0, "&Rang;"], [0, "&loang;"], [0, "&roang;"], [7, "&longleftarrow;"], [0, "&longrightarrow;"], [0, "&longleftrightarrow;"], [0, "&DoubleLongLeftArrow;"], [0, "&DoubleLongRightArrow;"], [0, "&DoubleLongLeftRightArrow;"], [1, "&longmapsto;"], [2, "&dzigrarr;"], [258, "&nvlArr;"], [0, "&nvrArr;"], [0, "&nvHarr;"], [0, "&Map;"], [6, "&lbarr;"], [0, "&bkarow;"], [0, "&lBarr;"], [0, "&dbkarow;"], [0, "&drbkarow;"], [0, "&DDotrahd;"], [0, "&UpArrowBar;"], [0, "&DownArrowBar;"], [2, "&Rarrtl;"], [2, "&latail;"], [0, "&ratail;"], [0, "&lAtail;"], [0, "&rAtail;"], [0, "&larrfs;"], [0, "&rarrfs;"], [0, "&larrbfs;"], [0, "&rarrbfs;"], [2, "&nwarhk;"], [0, "&nearhk;"], [0, "&hksearow;"], [0, "&hkswarow;"], [0, "&nwnear;"], [0, "&nesear;"], [0, "&seswar;"], [0, "&swnwar;"], [8, { v: "&rarrc;", n: 824, o: "&nrarrc;" }], [1, "&cudarrr;"], [0, "&ldca;"], [0, "&rdca;"], [0, "&cudarrl;"], [0, "&larrpl;"], [2, "&curarrm;"], [0, "&cularrp;"], [7, "&rarrpl;"], [2, "&harrcir;"], [0, "&Uarrocir;"], [0, "&lurdshar;"], [0, "&ldrushar;"], [2, "&LeftRightVector;"], [0, "&RightUpDownVector;"], [0, "&DownLeftRightVector;"], [0, "&LeftUpDownVector;"], [0, "&LeftVectorBar;"], [0, "&RightVectorBar;"], [0, "&RightUpVectorBar;"], [0, "&RightDownVectorBar;"], [0, "&DownLeftVectorBar;"], [0, "&DownRightVectorBar;"], [0, "&LeftUpVectorBar;"], [0, "&LeftDownVectorBar;"], [0, "&LeftTeeVector;"], [0, "&RightTeeVector;"], [0, "&RightUpTeeVector;"], [0, "&RightDownTeeVector;"], [0, "&DownLeftTeeVector;"], [0, "&DownRightTeeVector;"], [0, "&LeftUpTeeVector;"], [0, "&LeftDownTeeVector;"], [0, "&lHar;"], [0, "&uHar;"], [0, "&rHar;"], [0, "&dHar;"], [0, "&luruhar;"], [0, "&ldrdhar;"], [0, "&ruluhar;"], [0, "&rdldhar;"], [0, "&lharul;"], [0, "&llhard;"], [0, "&rharul;"], [0, "&lrhard;"], [0, "&udhar;"], [0, "&duhar;"], [0, "&RoundImplies;"], [0, "&erarr;"], [0, "&simrarr;"], [0, "&larrsim;"], [0, "&rarrsim;"], [0, "&rarrap;"], [0, "&ltlarr;"], [1, "&gtrarr;"], [0, "&subrarr;"], [1, "&suplarr;"], [0, "&lfisht;"], [0, "&rfisht;"], [0, "&ufisht;"], [0, "&dfisht;"], [5, "&lopar;"], [0, "&ropar;"], [4, "&lbrke;"], [0, "&rbrke;"], [0, "&lbrkslu;"], [0, "&rbrksld;"], [0, "&lbrksld;"], [0, "&rbrkslu;"], [0, "&langd;"], [0, "&rangd;"], [0, "&lparlt;"], [0, "&rpargt;"], [0, "&gtlPar;"], [0, "&ltrPar;"], [3, "&vzigzag;"], [1, "&vangrt;"], [0, "&angrtvbd;"], [6, "&ange;"], [0, "&range;"], [0, "&dwangle;"], [0, "&uwangle;"], [0, "&angmsdaa;"], [0, "&angmsdab;"], [0, "&angmsdac;"], [0, "&angmsdad;"], [0, "&angmsdae;"], [0, "&angmsdaf;"], [0, "&angmsdag;"], [0, "&angmsdah;"], [0, "&bemptyv;"], [0, "&demptyv;"], [0, "&cemptyv;"], [0, "&raemptyv;"], [0, "&laemptyv;"], [0, "&ohbar;"], [0, "&omid;"], [0, "&opar;"], [1, "&operp;"], [1, "&olcross;"], [0, "&odsold;"], [1, "&olcir;"], [0, "&ofcir;"], [0, "&olt;"], [0, "&ogt;"], [0, "&cirscir;"], [0, "&cirE;"], [0, "&solb;"], [0, "&bsolb;"], [3, "&boxbox;"], [3, "&trisb;"], [0, "&rtriltri;"], [0, { v: "&LeftTriangleBar;", n: 824, o: "&NotLeftTriangleBar;" }], [0, { v: "&RightTriangleBar;", n: 824, o: "&NotRightTriangleBar;" }], [11, "&iinfin;"], [0, "&infintie;"], [0, "&nvinfin;"], [4, "&eparsl;"], [0, "&smeparsl;"], [0, "&eqvparsl;"], [5, "&blacklozenge;"], [8, "&RuleDelayed;"], [1, "&dsol;"], [9, "&bigodot;"], [0, "&bigoplus;"], [0, "&bigotimes;"], [1, "&biguplus;"], [1, "&bigsqcup;"], [5, "&iiiint;"], [0, "&fpartint;"], [2, "&cirfnint;"], [0, "&awint;"], [0, "&rppolint;"], [0, "&scpolint;"], [0, "&npolint;"], [0, "&pointint;"], [0, "&quatint;"], [0, "&intlarhk;"], [10, "&pluscir;"], [0, "&plusacir;"], [0, "&simplus;"], [0, "&plusdu;"], [0, "&plussim;"], [0, "&plustwo;"], [1, "&mcomma;"], [0, "&minusdu;"], [2, "&loplus;"], [0, "&roplus;"], [0, "&Cross;"], [0, "&timesd;"], [0, "&timesbar;"], [1, "&smashp;"], [0, "&lotimes;"], [0, "&rotimes;"], [0, "&otimesas;"], [0, "&Otimes;"], [0, "&odiv;"], [0, "&triplus;"], [0, "&triminus;"], [0, "&tritime;"], [0, "&intprod;"], [2, "&amalg;"], [0, "&capdot;"], [1, "&ncup;"], [0, "&ncap;"], [0, "&capand;"], [0, "&cupor;"], [0, "&cupcap;"], [0, "&capcup;"], [0, "&cupbrcap;"], [0, "&capbrcup;"], [0, "&cupcup;"], [0, "&capcap;"], [0, "&ccups;"], [0, "&ccaps;"], [2, "&ccupssm;"], [2, "&And;"], [0, "&Or;"], [0, "&andand;"], [0, "&oror;"], [0, "&orslope;"], [0, "&andslope;"], [1, "&andv;"], [0, "&orv;"], [0, "&andd;"], [0, "&ord;"], [1, "&wedbar;"], [6, "&sdote;"], [3, "&simdot;"], [2, { v: "&congdot;", n: 824, o: "&ncongdot;" }], [0, "&easter;"], [0, "&apacir;"], [0, { v: "&apE;", n: 824, o: "&napE;" }], [0, "&eplus;"], [0, "&pluse;"], [0, "&Esim;"], [0, "&Colone;"], [0, "&Equal;"], [1, "&ddotseq;"], [0, "&equivDD;"], [0, "&ltcir;"], [0, "&gtcir;"], [0, "&ltquest;"], [0, "&gtquest;"], [0, { v: "&leqslant;", n: 824, o: "&nleqslant;" }], [0, { v: "&geqslant;", n: 824, o: "&ngeqslant;" }], [0, "&lesdot;"], [0, "&gesdot;"], [0, "&lesdoto;"], [0, "&gesdoto;"], [0, "&lesdotor;"], [0, "&gesdotol;"], [0, "&lap;"], [0, "&gap;"], [0, "&lne;"], [0, "&gne;"], [0, "&lnap;"], [0, "&gnap;"], [0, "&lEg;"], [0, "&gEl;"], [0, "&lsime;"], [0, "&gsime;"], [0, "&lsimg;"], [0, "&gsiml;"], [0, "&lgE;"], [0, "&glE;"], [0, "&lesges;"], [0, "&gesles;"], [0, "&els;"], [0, "&egs;"], [0, "&elsdot;"], [0, "&egsdot;"], [0, "&el;"], [0, "&eg;"], [2, "&siml;"], [0, "&simg;"], [0, "&simlE;"], [0, "&simgE;"], [0, { v: "&LessLess;", n: 824, o: "&NotNestedLessLess;" }], [0, { v: "&GreaterGreater;", n: 824, o: "&NotNestedGreaterGreater;" }], [1, "&glj;"], [0, "&gla;"], [0, "&ltcc;"], [0, "&gtcc;"], [0, "&lescc;"], [0, "&gescc;"], [0, "&smt;"], [0, "&lat;"], [0, { v: "&smte;", n: 65024, o: "&smtes;" }], [0, { v: "&late;", n: 65024, o: "&lates;" }], [0, "&bumpE;"], [0, { v: "&PrecedesEqual;", n: 824, o: "&NotPrecedesEqual;" }], [0, { v: "&sce;", n: 824, o: "&NotSucceedsEqual;" }], [2, "&prE;"], [0, "&scE;"], [0, "&precneqq;"], [0, "&scnE;"], [0, "&prap;"], [0, "&scap;"], [0, "&precnapprox;"], [0, "&scnap;"], [0, "&Pr;"], [0, "&Sc;"], [0, "&subdot;"], [0, "&supdot;"], [0, "&subplus;"], [0, "&supplus;"], [0, "&submult;"], [0, "&supmult;"], [0, "&subedot;"], [0, "&supedot;"], [0, { v: "&subE;", n: 824, o: "&nsubE;" }], [0, { v: "&supE;", n: 824, o: "&nsupE;" }], [0, "&subsim;"], [0, "&supsim;"], [2, { v: "&subnE;", n: 65024, o: "&varsubsetneqq;" }], [0, { v: "&supnE;", n: 65024, o: "&varsupsetneqq;" }], [2, "&csub;"], [0, "&csup;"], [0, "&csube;"], [0, "&csupe;"], [0, "&subsup;"], [0, "&supsub;"], [0, "&subsub;"], [0, "&supsup;"], [0, "&suphsub;"], [0, "&supdsub;"], [0, "&forkv;"], [0, "&topfork;"], [0, "&mlcp;"], [8, "&Dashv;"], [1, "&Vdashl;"], [0, "&Barv;"], [0, "&vBar;"], [0, "&vBarv;"], [1, "&Vbar;"], [0, "&Not;"], [0, "&bNot;"], [0, "&rnmid;"], [0, "&cirmid;"], [0, "&midcir;"], [0, "&topcir;"], [0, "&nhpar;"], [0, "&parsim;"], [9, { v: "&parsl;", n: 8421, o: "&nparsl;" }], [44343, { n: new Map(/* @__PURE__ */ restoreDiff([[56476, "&Ascr;"], [1, "&Cscr;"], [0, "&Dscr;"], [2, "&Gscr;"], [2, "&Jscr;"], [0, "&Kscr;"], [2, "&Nscr;"], [0, "&Oscr;"], [0, "&Pscr;"], [0, "&Qscr;"], [1, "&Sscr;"], [0, "&Tscr;"], [0, "&Uscr;"], [0, "&Vscr;"], [0, "&Wscr;"], [0, "&Xscr;"], [0, "&Yscr;"], [0, "&Zscr;"], [0, "&ascr;"], [0, "&bscr;"], [0, "&cscr;"], [0, "&dscr;"], [1, "&fscr;"], [1, "&hscr;"], [0, "&iscr;"], [0, "&jscr;"], [0, "&kscr;"], [0, "&lscr;"], [0, "&mscr;"], [0, "&nscr;"], [1, "&pscr;"], [0, "&qscr;"], [0, "&rscr;"], [0, "&sscr;"], [0, "&tscr;"], [0, "&uscr;"], [0, "&vscr;"], [0, "&wscr;"], [0, "&xscr;"], [0, "&yscr;"], [0, "&zscr;"], [52, "&Afr;"], [0, "&Bfr;"], [1, "&Dfr;"], [0, "&Efr;"], [0, "&Ffr;"], [0, "&Gfr;"], [2, "&Jfr;"], [0, "&Kfr;"], [0, "&Lfr;"], [0, "&Mfr;"], [0, "&Nfr;"], [0, "&Ofr;"], [0, "&Pfr;"], [0, "&Qfr;"], [1, "&Sfr;"], [0, "&Tfr;"], [0, "&Ufr;"], [0, "&Vfr;"], [0, "&Wfr;"], [0, "&Xfr;"], [0, "&Yfr;"], [1, "&afr;"], [0, "&bfr;"], [0, "&cfr;"], [0, "&dfr;"], [0, "&efr;"], [0, "&ffr;"], [0, "&gfr;"], [0, "&hfr;"], [0, "&ifr;"], [0, "&jfr;"], [0, "&kfr;"], [0, "&lfr;"], [0, "&mfr;"], [0, "&nfr;"], [0, "&ofr;"], [0, "&pfr;"], [0, "&qfr;"], [0, "&rfr;"], [0, "&sfr;"], [0, "&tfr;"], [0, "&ufr;"], [0, "&vfr;"], [0, "&wfr;"], [0, "&xfr;"], [0, "&yfr;"], [0, "&zfr;"], [0, "&Aopf;"], [0, "&Bopf;"], [1, "&Dopf;"], [0, "&Eopf;"], [0, "&Fopf;"], [0, "&Gopf;"], [1, "&Iopf;"], [0, "&Jopf;"], [0, "&Kopf;"], [0, "&Lopf;"], [0, "&Mopf;"], [1, "&Oopf;"], [3, "&Sopf;"], [0, "&Topf;"], [0, "&Uopf;"], [0, "&Vopf;"], [0, "&Wopf;"], [0, "&Xopf;"], [0, "&Yopf;"], [1, "&aopf;"], [0, "&bopf;"], [0, "&copf;"], [0, "&dopf;"], [0, "&eopf;"], [0, "&fopf;"], [0, "&gopf;"], [0, "&hopf;"], [0, "&iopf;"], [0, "&jopf;"], [0, "&kopf;"], [0, "&lopf;"], [0, "&mopf;"], [0, "&nopf;"], [0, "&oopf;"], [0, "&popf;"], [0, "&qopf;"], [0, "&ropf;"], [0, "&sopf;"], [0, "&topf;"], [0, "&uopf;"], [0, "&vopf;"], [0, "&wopf;"], [0, "&xopf;"], [0, "&yopf;"], [0, "&zopf;"]])) }], [8906, "&fflig;"], [0, "&filig;"], [0, "&fllig;"], [0, "&ffilig;"], [0, "&ffllig;"]]));
  }
});

// node_modules/entities/lib/esm/escape.js
function encodeXML(str) {
  let ret = "";
  let lastIdx = 0;
  let match;
  while ((match = xmlReplacer.exec(str)) !== null) {
    const i = match.index;
    const char = str.charCodeAt(i);
    const next = xmlCodeMap.get(char);
    if (next !== void 0) {
      ret += str.substring(lastIdx, i) + next;
      lastIdx = i + 1;
    } else {
      ret += `${str.substring(lastIdx, i)}&#x${getCodePoint(str, i).toString(16)};`;
      lastIdx = xmlReplacer.lastIndex += Number((char & 64512) === 55296);
    }
  }
  return ret + str.substr(lastIdx);
}
function getEscaper(regex, map) {
  return function escape3(data) {
    let match;
    let lastIdx = 0;
    let result = "";
    while (match = regex.exec(data)) {
      if (lastIdx !== match.index) {
        result += data.substring(lastIdx, match.index);
      }
      result += map.get(match[0].charCodeAt(0));
      lastIdx = match.index + 1;
    }
    return result + data.substring(lastIdx);
  };
}
var xmlReplacer, xmlCodeMap, getCodePoint, escapeUTF8, escapeAttribute, escapeText;
var init_escape = __esm({
  "node_modules/entities/lib/esm/escape.js"() {
    xmlReplacer = /["&'<>$\x80-\uFFFF]/g;
    xmlCodeMap = /* @__PURE__ */ new Map([
      [34, "&quot;"],
      [38, "&amp;"],
      [39, "&apos;"],
      [60, "&lt;"],
      [62, "&gt;"]
    ]);
    getCodePoint = // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    String.prototype.codePointAt != null ? (str, index) => str.codePointAt(index) : (
      // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      (c, index) => (c.charCodeAt(index) & 64512) === 55296 ? (c.charCodeAt(index) - 55296) * 1024 + c.charCodeAt(index + 1) - 56320 + 65536 : c.charCodeAt(index)
    );
    escapeUTF8 = getEscaper(/[&<>'"]/g, xmlCodeMap);
    escapeAttribute = getEscaper(/["&\u00A0]/g, /* @__PURE__ */ new Map([
      [34, "&quot;"],
      [38, "&amp;"],
      [160, "&nbsp;"]
    ]));
    escapeText = getEscaper(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([
      [38, "&amp;"],
      [60, "&lt;"],
      [62, "&gt;"],
      [160, "&nbsp;"]
    ]));
  }
});

// node_modules/entities/lib/esm/encode.js
var init_encode = __esm({
  "node_modules/entities/lib/esm/encode.js"() {
    init_encode_html();
    init_escape();
  }
});

// node_modules/entities/lib/esm/index.js
var EntityLevel, EncodingMode;
var init_esm3 = __esm({
  "node_modules/entities/lib/esm/index.js"() {
    init_decode();
    init_encode();
    init_escape();
    init_escape();
    init_encode();
    init_decode();
    (function(EntityLevel2) {
      EntityLevel2[EntityLevel2["XML"] = 0] = "XML";
      EntityLevel2[EntityLevel2["HTML"] = 1] = "HTML";
    })(EntityLevel || (EntityLevel = {}));
    (function(EncodingMode2) {
      EncodingMode2[EncodingMode2["UTF8"] = 0] = "UTF8";
      EncodingMode2[EncodingMode2["ASCII"] = 1] = "ASCII";
      EncodingMode2[EncodingMode2["Extensive"] = 2] = "Extensive";
      EncodingMode2[EncodingMode2["Attribute"] = 3] = "Attribute";
      EncodingMode2[EncodingMode2["Text"] = 4] = "Text";
    })(EncodingMode || (EncodingMode = {}));
  }
});

// node_modules/dom-serializer/lib/esm/foreignNames.js
var elementNames, attributeNames;
var init_foreignNames = __esm({
  "node_modules/dom-serializer/lib/esm/foreignNames.js"() {
    elementNames = new Map([
      "altGlyph",
      "altGlyphDef",
      "altGlyphItem",
      "animateColor",
      "animateMotion",
      "animateTransform",
      "clipPath",
      "feBlend",
      "feColorMatrix",
      "feComponentTransfer",
      "feComposite",
      "feConvolveMatrix",
      "feDiffuseLighting",
      "feDisplacementMap",
      "feDistantLight",
      "feDropShadow",
      "feFlood",
      "feFuncA",
      "feFuncB",
      "feFuncG",
      "feFuncR",
      "feGaussianBlur",
      "feImage",
      "feMerge",
      "feMergeNode",
      "feMorphology",
      "feOffset",
      "fePointLight",
      "feSpecularLighting",
      "feSpotLight",
      "feTile",
      "feTurbulence",
      "foreignObject",
      "glyphRef",
      "linearGradient",
      "radialGradient",
      "textPath"
    ].map((val) => [val.toLowerCase(), val]));
    attributeNames = new Map([
      "definitionURL",
      "attributeName",
      "attributeType",
      "baseFrequency",
      "baseProfile",
      "calcMode",
      "clipPathUnits",
      "diffuseConstant",
      "edgeMode",
      "filterUnits",
      "glyphRef",
      "gradientTransform",
      "gradientUnits",
      "kernelMatrix",
      "kernelUnitLength",
      "keyPoints",
      "keySplines",
      "keyTimes",
      "lengthAdjust",
      "limitingConeAngle",
      "markerHeight",
      "markerUnits",
      "markerWidth",
      "maskContentUnits",
      "maskUnits",
      "numOctaves",
      "pathLength",
      "patternContentUnits",
      "patternTransform",
      "patternUnits",
      "pointsAtX",
      "pointsAtY",
      "pointsAtZ",
      "preserveAlpha",
      "preserveAspectRatio",
      "primitiveUnits",
      "refX",
      "refY",
      "repeatCount",
      "repeatDur",
      "requiredExtensions",
      "requiredFeatures",
      "specularConstant",
      "specularExponent",
      "spreadMethod",
      "startOffset",
      "stdDeviation",
      "stitchTiles",
      "surfaceScale",
      "systemLanguage",
      "tableValues",
      "targetX",
      "targetY",
      "textLength",
      "viewBox",
      "viewTarget",
      "xChannelSelector",
      "yChannelSelector",
      "zoomAndPan"
    ].map((val) => [val.toLowerCase(), val]));
  }
});

// node_modules/dom-serializer/lib/esm/index.js
function replaceQuotes(value) {
  return value.replace(/"/g, "&quot;");
}
function formatAttributes(attributes2, opts) {
  var _a2;
  if (!attributes2)
    return;
  const encode = ((_a2 = opts.encodeEntities) !== null && _a2 !== void 0 ? _a2 : opts.decodeEntities) === false ? replaceQuotes : opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML : escapeAttribute;
  return Object.keys(attributes2).map((key2) => {
    var _a3, _b;
    const value = (_a3 = attributes2[key2]) !== null && _a3 !== void 0 ? _a3 : "";
    if (opts.xmlMode === "foreign") {
      key2 = (_b = attributeNames.get(key2)) !== null && _b !== void 0 ? _b : key2;
    }
    if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
      return key2;
    }
    return `${key2}="${encode(value)}"`;
  }).join(" ");
}
function render(node, options = {}) {
  const nodes = "length" in node ? node : [node];
  let output = "";
  for (let i = 0; i < nodes.length; i++) {
    output += renderNode(nodes[i], options);
  }
  return output;
}
function renderNode(node, options) {
  switch (node.type) {
    case Root:
      return render(node.children, options);
    case Doctype:
    case Directive:
      return renderDirective(node);
    case Comment:
      return renderComment(node);
    case CDATA:
      return renderCdata(node);
    case Script:
    case Style:
    case Tag:
      return renderTag(node, options);
    case Text:
      return renderText(node, options);
  }
}
function renderTag(elem, opts) {
  var _a2;
  if (opts.xmlMode === "foreign") {
    elem.name = (_a2 = elementNames.get(elem.name)) !== null && _a2 !== void 0 ? _a2 : elem.name;
    if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) {
      opts = { ...opts, xmlMode: false };
    }
  }
  if (!opts.xmlMode && foreignElements.has(elem.name)) {
    opts = { ...opts, xmlMode: "foreign" };
  }
  let tag = `<${elem.name}`;
  const attribs = formatAttributes(elem.attribs, opts);
  if (attribs) {
    tag += ` ${attribs}`;
  }
  if (elem.children.length === 0 && (opts.xmlMode ? (
    // In XML mode or foreign mode, and user hasn't explicitly turned off self-closing tags
    opts.selfClosingTags !== false
  ) : (
    // User explicitly asked for self-closing tags, even in HTML mode
    opts.selfClosingTags && singleTag.has(elem.name)
  ))) {
    if (!opts.xmlMode)
      tag += " ";
    tag += "/>";
  } else {
    tag += ">";
    if (elem.children.length > 0) {
      tag += render(elem.children, opts);
    }
    if (opts.xmlMode || !singleTag.has(elem.name)) {
      tag += `</${elem.name}>`;
    }
  }
  return tag;
}
function renderDirective(elem) {
  return `<${elem.data}>`;
}
function renderText(elem, opts) {
  var _a2;
  let data = elem.data || "";
  if (((_a2 = opts.encodeEntities) !== null && _a2 !== void 0 ? _a2 : opts.decodeEntities) !== false && !(!opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name))) {
    data = opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML(data) : escapeText(data);
  }
  return data;
}
function renderCdata(elem) {
  return `<![CDATA[${elem.children[0].data}]]>`;
}
function renderComment(elem) {
  return `<!--${elem.data}-->`;
}
var unencodedElements, singleTag, esm_default, foreignModeIntegrationPoints, foreignElements;
var init_esm4 = __esm({
  "node_modules/dom-serializer/lib/esm/index.js"() {
    init_esm();
    init_esm3();
    init_foreignNames();
    unencodedElements = /* @__PURE__ */ new Set([
      "style",
      "script",
      "xmp",
      "iframe",
      "noembed",
      "noframes",
      "plaintext",
      "noscript"
    ]);
    singleTag = /* @__PURE__ */ new Set([
      "area",
      "base",
      "basefont",
      "br",
      "col",
      "command",
      "embed",
      "frame",
      "hr",
      "img",
      "input",
      "isindex",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
    ]);
    esm_default = render;
    foreignModeIntegrationPoints = /* @__PURE__ */ new Set([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext",
      "annotation-xml",
      "foreignObject",
      "desc",
      "title"
    ]);
    foreignElements = /* @__PURE__ */ new Set(["svg", "math"]);
  }
});

// node_modules/domutils/lib/esm/stringify.js
function getOuterHTML(node, options) {
  return esm_default(node, options);
}
function getInnerHTML(node, options) {
  return hasChildren(node) ? node.children.map((node2) => getOuterHTML(node2, options)).join("") : "";
}
function getText(node) {
  if (Array.isArray(node))
    return node.map(getText).join("");
  if (isTag2(node))
    return node.name === "br" ? "\n" : getText(node.children);
  if (isCDATA(node))
    return getText(node.children);
  if (isText(node))
    return node.data;
  return "";
}
function textContent(node) {
  if (Array.isArray(node))
    return node.map(textContent).join("");
  if (hasChildren(node) && !isComment(node)) {
    return textContent(node.children);
  }
  if (isText(node))
    return node.data;
  return "";
}
function innerText(node) {
  if (Array.isArray(node))
    return node.map(innerText).join("");
  if (hasChildren(node) && (node.type === ElementType.Tag || isCDATA(node))) {
    return innerText(node.children);
  }
  if (isText(node))
    return node.data;
  return "";
}
var init_stringify = __esm({
  "node_modules/domutils/lib/esm/stringify.js"() {
    init_esm2();
    init_esm4();
    init_esm();
  }
});

// node_modules/domutils/lib/esm/traversal.js
function getChildren(elem) {
  return hasChildren(elem) ? elem.children : [];
}
function getParent(elem) {
  return elem.parent || null;
}
function getSiblings(elem) {
  const parent = getParent(elem);
  if (parent != null)
    return getChildren(parent);
  const siblings = [elem];
  let { prev, next } = elem;
  while (prev != null) {
    siblings.unshift(prev);
    ({ prev } = prev);
  }
  while (next != null) {
    siblings.push(next);
    ({ next } = next);
  }
  return siblings;
}
function getAttributeValue(elem, name) {
  var _a2;
  return (_a2 = elem.attribs) === null || _a2 === void 0 ? void 0 : _a2[name];
}
function hasAttrib(elem, name) {
  return elem.attribs != null && Object.prototype.hasOwnProperty.call(elem.attribs, name) && elem.attribs[name] != null;
}
function getName(elem) {
  return elem.name;
}
function nextElementSibling(elem) {
  let { next } = elem;
  while (next !== null && !isTag2(next))
    ({ next } = next);
  return next;
}
function prevElementSibling(elem) {
  let { prev } = elem;
  while (prev !== null && !isTag2(prev))
    ({ prev } = prev);
  return prev;
}
var init_traversal = __esm({
  "node_modules/domutils/lib/esm/traversal.js"() {
    init_esm2();
  }
});

// node_modules/domutils/lib/esm/manipulation.js
function removeElement(elem) {
  if (elem.prev)
    elem.prev.next = elem.next;
  if (elem.next)
    elem.next.prev = elem.prev;
  if (elem.parent) {
    const childs = elem.parent.children;
    const childsIndex = childs.lastIndexOf(elem);
    if (childsIndex >= 0) {
      childs.splice(childsIndex, 1);
    }
  }
  elem.next = null;
  elem.prev = null;
  elem.parent = null;
}
function replaceElement(elem, replacement) {
  const prev = replacement.prev = elem.prev;
  if (prev) {
    prev.next = replacement;
  }
  const next = replacement.next = elem.next;
  if (next) {
    next.prev = replacement;
  }
  const parent = replacement.parent = elem.parent;
  if (parent) {
    const childs = parent.children;
    childs[childs.lastIndexOf(elem)] = replacement;
    elem.parent = null;
  }
}
function appendChild(parent, child) {
  removeElement(child);
  child.next = null;
  child.parent = parent;
  if (parent.children.push(child) > 1) {
    const sibling = parent.children[parent.children.length - 2];
    sibling.next = child;
    child.prev = sibling;
  } else {
    child.prev = null;
  }
}
function append(elem, next) {
  removeElement(next);
  const { parent } = elem;
  const currNext = elem.next;
  next.next = currNext;
  next.prev = elem;
  elem.next = next;
  next.parent = parent;
  if (currNext) {
    currNext.prev = next;
    if (parent) {
      const childs = parent.children;
      childs.splice(childs.lastIndexOf(currNext), 0, next);
    }
  } else if (parent) {
    parent.children.push(next);
  }
}
function prependChild(parent, child) {
  removeElement(child);
  child.parent = parent;
  child.prev = null;
  if (parent.children.unshift(child) !== 1) {
    const sibling = parent.children[1];
    sibling.prev = child;
    child.next = sibling;
  } else {
    child.next = null;
  }
}
function prepend(elem, prev) {
  removeElement(prev);
  const { parent } = elem;
  if (parent) {
    const childs = parent.children;
    childs.splice(childs.indexOf(elem), 0, prev);
  }
  if (elem.prev) {
    elem.prev.next = prev;
  }
  prev.parent = parent;
  prev.prev = elem.prev;
  prev.next = elem;
  elem.prev = prev;
}
var init_manipulation = __esm({
  "node_modules/domutils/lib/esm/manipulation.js"() {
  }
});

// node_modules/domutils/lib/esm/querying.js
function filter(test, node, recurse = true, limit = Infinity) {
  return find(test, Array.isArray(node) ? node : [node], recurse, limit);
}
function find(test, nodes, recurse, limit) {
  const result = [];
  const nodeStack = [nodes];
  const indexStack = [0];
  for (; ; ) {
    if (indexStack[0] >= nodeStack[0].length) {
      if (indexStack.length === 1) {
        return result;
      }
      nodeStack.shift();
      indexStack.shift();
      continue;
    }
    const elem = nodeStack[0][indexStack[0]++];
    if (test(elem)) {
      result.push(elem);
      if (--limit <= 0)
        return result;
    }
    if (recurse && hasChildren(elem) && elem.children.length > 0) {
      indexStack.unshift(0);
      nodeStack.unshift(elem.children);
    }
  }
}
function findOneChild(test, nodes) {
  return nodes.find(test);
}
function findOne(test, nodes, recurse = true) {
  let elem = null;
  for (let i = 0; i < nodes.length && !elem; i++) {
    const node = nodes[i];
    if (!isTag2(node)) {
      continue;
    } else if (test(node)) {
      elem = node;
    } else if (recurse && node.children.length > 0) {
      elem = findOne(test, node.children, true);
    }
  }
  return elem;
}
function existsOne(test, nodes) {
  return nodes.some((checked) => isTag2(checked) && (test(checked) || existsOne(test, checked.children)));
}
function findAll(test, nodes) {
  const result = [];
  const nodeStack = [nodes];
  const indexStack = [0];
  for (; ; ) {
    if (indexStack[0] >= nodeStack[0].length) {
      if (nodeStack.length === 1) {
        return result;
      }
      nodeStack.shift();
      indexStack.shift();
      continue;
    }
    const elem = nodeStack[0][indexStack[0]++];
    if (!isTag2(elem))
      continue;
    if (test(elem))
      result.push(elem);
    if (elem.children.length > 0) {
      indexStack.unshift(0);
      nodeStack.unshift(elem.children);
    }
  }
}
var init_querying = __esm({
  "node_modules/domutils/lib/esm/querying.js"() {
    init_esm2();
  }
});

// node_modules/domutils/lib/esm/legacy.js
function getAttribCheck(attrib, value) {
  if (typeof value === "function") {
    return (elem) => isTag2(elem) && value(elem.attribs[attrib]);
  }
  return (elem) => isTag2(elem) && elem.attribs[attrib] === value;
}
function combineFuncs(a, b) {
  return (elem) => a(elem) || b(elem);
}
function compileTest(options) {
  const funcs = Object.keys(options).map((key2) => {
    const value = options[key2];
    return Object.prototype.hasOwnProperty.call(Checks, key2) ? Checks[key2](value) : getAttribCheck(key2, value);
  });
  return funcs.length === 0 ? null : funcs.reduce(combineFuncs);
}
function testElement(options, node) {
  const test = compileTest(options);
  return test ? test(node) : true;
}
function getElements(options, nodes, recurse, limit = Infinity) {
  const test = compileTest(options);
  return test ? filter(test, nodes, recurse, limit) : [];
}
function getElementById(id, nodes, recurse = true) {
  if (!Array.isArray(nodes))
    nodes = [nodes];
  return findOne(getAttribCheck("id", id), nodes, recurse);
}
function getElementsByTagName(tagName18, nodes, recurse = true, limit = Infinity) {
  return filter(Checks["tag_name"](tagName18), nodes, recurse, limit);
}
function getElementsByTagType(type, nodes, recurse = true, limit = Infinity) {
  return filter(Checks["tag_type"](type), nodes, recurse, limit);
}
var Checks;
var init_legacy = __esm({
  "node_modules/domutils/lib/esm/legacy.js"() {
    init_esm2();
    init_querying();
    Checks = {
      tag_name(name) {
        if (typeof name === "function") {
          return (elem) => isTag2(elem) && name(elem.name);
        } else if (name === "*") {
          return isTag2;
        }
        return (elem) => isTag2(elem) && elem.name === name;
      },
      tag_type(type) {
        if (typeof type === "function") {
          return (elem) => type(elem.type);
        }
        return (elem) => elem.type === type;
      },
      tag_contains(data) {
        if (typeof data === "function") {
          return (elem) => isText(elem) && data(elem.data);
        }
        return (elem) => isText(elem) && elem.data === data;
      }
    };
  }
});

// node_modules/domutils/lib/esm/helpers.js
function removeSubsets(nodes) {
  let idx = nodes.length;
  while (--idx >= 0) {
    const node = nodes[idx];
    if (idx > 0 && nodes.lastIndexOf(node, idx - 1) >= 0) {
      nodes.splice(idx, 1);
      continue;
    }
    for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
      if (nodes.includes(ancestor)) {
        nodes.splice(idx, 1);
        break;
      }
    }
  }
  return nodes;
}
function compareDocumentPosition(nodeA, nodeB) {
  const aParents = [];
  const bParents = [];
  if (nodeA === nodeB) {
    return 0;
  }
  let current = hasChildren(nodeA) ? nodeA : nodeA.parent;
  while (current) {
    aParents.unshift(current);
    current = current.parent;
  }
  current = hasChildren(nodeB) ? nodeB : nodeB.parent;
  while (current) {
    bParents.unshift(current);
    current = current.parent;
  }
  const maxIdx = Math.min(aParents.length, bParents.length);
  let idx = 0;
  while (idx < maxIdx && aParents[idx] === bParents[idx]) {
    idx++;
  }
  if (idx === 0) {
    return DocumentPosition.DISCONNECTED;
  }
  const sharedParent = aParents[idx - 1];
  const siblings = sharedParent.children;
  const aSibling = aParents[idx];
  const bSibling = bParents[idx];
  if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
    if (sharedParent === nodeB) {
      return DocumentPosition.FOLLOWING | DocumentPosition.CONTAINED_BY;
    }
    return DocumentPosition.FOLLOWING;
  }
  if (sharedParent === nodeA) {
    return DocumentPosition.PRECEDING | DocumentPosition.CONTAINS;
  }
  return DocumentPosition.PRECEDING;
}
function uniqueSort(nodes) {
  nodes = nodes.filter((node, i, arr) => !arr.includes(node, i + 1));
  nodes.sort((a, b) => {
    const relative = compareDocumentPosition(a, b);
    if (relative & DocumentPosition.PRECEDING) {
      return -1;
    } else if (relative & DocumentPosition.FOLLOWING) {
      return 1;
    }
    return 0;
  });
  return nodes;
}
var DocumentPosition;
var init_helpers = __esm({
  "node_modules/domutils/lib/esm/helpers.js"() {
    init_esm2();
    (function(DocumentPosition2) {
      DocumentPosition2[DocumentPosition2["DISCONNECTED"] = 1] = "DISCONNECTED";
      DocumentPosition2[DocumentPosition2["PRECEDING"] = 2] = "PRECEDING";
      DocumentPosition2[DocumentPosition2["FOLLOWING"] = 4] = "FOLLOWING";
      DocumentPosition2[DocumentPosition2["CONTAINS"] = 8] = "CONTAINS";
      DocumentPosition2[DocumentPosition2["CONTAINED_BY"] = 16] = "CONTAINED_BY";
    })(DocumentPosition || (DocumentPosition = {}));
  }
});

// node_modules/domutils/lib/esm/feeds.js
function getFeed(doc) {
  const feedRoot = getOneElement(isValidFeed, doc);
  return !feedRoot ? null : feedRoot.name === "feed" ? getAtomFeed(feedRoot) : getRssFeed(feedRoot);
}
function getAtomFeed(feedRoot) {
  var _a2;
  const childs = feedRoot.children;
  const feed = {
    type: "atom",
    items: getElementsByTagName("entry", childs).map((item) => {
      var _a3;
      const { children } = item;
      const entry = { media: getMediaElements(children) };
      addConditionally(entry, "id", "id", children);
      addConditionally(entry, "title", "title", children);
      const href2 = (_a3 = getOneElement("link", children)) === null || _a3 === void 0 ? void 0 : _a3.attribs["href"];
      if (href2) {
        entry.link = href2;
      }
      const description = fetch("summary", children) || fetch("content", children);
      if (description) {
        entry.description = description;
      }
      const pubDate = fetch("updated", children);
      if (pubDate) {
        entry.pubDate = new Date(pubDate);
      }
      return entry;
    })
  };
  addConditionally(feed, "id", "id", childs);
  addConditionally(feed, "title", "title", childs);
  const href = (_a2 = getOneElement("link", childs)) === null || _a2 === void 0 ? void 0 : _a2.attribs["href"];
  if (href) {
    feed.link = href;
  }
  addConditionally(feed, "description", "subtitle", childs);
  const updated = fetch("updated", childs);
  if (updated) {
    feed.updated = new Date(updated);
  }
  addConditionally(feed, "author", "email", childs, true);
  return feed;
}
function getRssFeed(feedRoot) {
  var _a2, _b;
  const childs = (_b = (_a2 = getOneElement("channel", feedRoot.children)) === null || _a2 === void 0 ? void 0 : _a2.children) !== null && _b !== void 0 ? _b : [];
  const feed = {
    type: feedRoot.name.substr(0, 3),
    id: "",
    items: getElementsByTagName("item", feedRoot.children).map((item) => {
      const { children } = item;
      const entry = { media: getMediaElements(children) };
      addConditionally(entry, "id", "guid", children);
      addConditionally(entry, "title", "title", children);
      addConditionally(entry, "link", "link", children);
      addConditionally(entry, "description", "description", children);
      const pubDate = fetch("pubDate", children) || fetch("dc:date", children);
      if (pubDate)
        entry.pubDate = new Date(pubDate);
      return entry;
    })
  };
  addConditionally(feed, "title", "title", childs);
  addConditionally(feed, "link", "link", childs);
  addConditionally(feed, "description", "description", childs);
  const updated = fetch("lastBuildDate", childs);
  if (updated) {
    feed.updated = new Date(updated);
  }
  addConditionally(feed, "author", "managingEditor", childs, true);
  return feed;
}
function getMediaElements(where) {
  return getElementsByTagName("media:content", where).map((elem) => {
    const { attribs } = elem;
    const media = {
      medium: attribs["medium"],
      isDefault: !!attribs["isDefault"]
    };
    for (const attrib of MEDIA_KEYS_STRING) {
      if (attribs[attrib]) {
        media[attrib] = attribs[attrib];
      }
    }
    for (const attrib of MEDIA_KEYS_INT) {
      if (attribs[attrib]) {
        media[attrib] = parseInt(attribs[attrib], 10);
      }
    }
    if (attribs["expression"]) {
      media.expression = attribs["expression"];
    }
    return media;
  });
}
function getOneElement(tagName18, node) {
  return getElementsByTagName(tagName18, node, true, 1)[0];
}
function fetch(tagName18, where, recurse = false) {
  return textContent(getElementsByTagName(tagName18, where, recurse, 1)).trim();
}
function addConditionally(obj, prop2, tagName18, where, recurse = false) {
  const val = fetch(tagName18, where, recurse);
  if (val)
    obj[prop2] = val;
}
function isValidFeed(value) {
  return value === "rss" || value === "feed" || value === "rdf:RDF";
}
var MEDIA_KEYS_STRING, MEDIA_KEYS_INT;
var init_feeds = __esm({
  "node_modules/domutils/lib/esm/feeds.js"() {
    init_stringify();
    init_legacy();
    MEDIA_KEYS_STRING = ["url", "type", "lang"];
    MEDIA_KEYS_INT = [
      "fileSize",
      "bitrate",
      "framerate",
      "samplingrate",
      "channels",
      "duration",
      "height",
      "width"
    ];
  }
});

// node_modules/domutils/lib/esm/index.js
var esm_exports2 = {};
__export(esm_exports2, {
  DocumentPosition: () => DocumentPosition,
  append: () => append,
  appendChild: () => appendChild,
  compareDocumentPosition: () => compareDocumentPosition,
  existsOne: () => existsOne,
  filter: () => filter,
  find: () => find,
  findAll: () => findAll,
  findOne: () => findOne,
  findOneChild: () => findOneChild,
  getAttributeValue: () => getAttributeValue,
  getChildren: () => getChildren,
  getElementById: () => getElementById,
  getElements: () => getElements,
  getElementsByTagName: () => getElementsByTagName,
  getElementsByTagType: () => getElementsByTagType,
  getFeed: () => getFeed,
  getInnerHTML: () => getInnerHTML,
  getName: () => getName,
  getOuterHTML: () => getOuterHTML,
  getParent: () => getParent,
  getSiblings: () => getSiblings,
  getText: () => getText,
  hasAttrib: () => hasAttrib,
  hasChildren: () => hasChildren,
  innerText: () => innerText,
  isCDATA: () => isCDATA,
  isComment: () => isComment,
  isDocument: () => isDocument,
  isTag: () => isTag2,
  isText: () => isText,
  nextElementSibling: () => nextElementSibling,
  prepend: () => prepend,
  prependChild: () => prependChild,
  prevElementSibling: () => prevElementSibling,
  removeElement: () => removeElement,
  removeSubsets: () => removeSubsets,
  replaceElement: () => replaceElement,
  testElement: () => testElement,
  textContent: () => textContent,
  uniqueSort: () => uniqueSort
});
var init_esm5 = __esm({
  "node_modules/domutils/lib/esm/index.js"() {
    init_stringify();
    init_traversal();
    init_manipulation();
    init_querying();
    init_legacy();
    init_helpers();
    init_feeds();
    init_esm2();
  }
});

// node_modules/htmlparser2/lib/esm/index.js
var esm_exports3 = {};
__export(esm_exports3, {
  DefaultHandler: () => DomHandler,
  DomHandler: () => DomHandler,
  DomUtils: () => esm_exports2,
  ElementType: () => esm_exports,
  Parser: () => Parser,
  Tokenizer: () => Tokenizer,
  createDomStream: () => createDomStream,
  getFeed: () => getFeed,
  parseDOM: () => parseDOM,
  parseDocument: () => parseDocument,
  parseFeed: () => parseFeed
});
function parseDocument(data, options) {
  const handler4 = new DomHandler(void 0, options);
  new Parser(handler4, options).end(data);
  return handler4.root;
}
function parseDOM(data, options) {
  return parseDocument(data, options).children;
}
function createDomStream(callback, options, elementCallback) {
  const handler4 = new DomHandler(callback, options, elementCallback);
  return new Parser(handler4, options);
}
function parseFeed(feed, options = parseFeedDefaultOptions) {
  return getFeed(parseDOM(feed, options));
}
var parseFeedDefaultOptions;
var init_esm6 = __esm({
  "node_modules/htmlparser2/lib/esm/index.js"() {
    init_Parser();
    init_Parser();
    init_esm2();
    init_esm2();
    init_Tokenizer();
    init_esm();
    init_esm5();
    init_esm5();
    init_esm5();
    parseFeedDefaultOptions = { xmlMode: true };
  }
});

// node_modules/linkedom/esm/shared/constants.js
var NODE_END, ELEMENT_NODE, ATTRIBUTE_NODE, TEXT_NODE, COMMENT_NODE, DOCUMENT_NODE, DOCUMENT_TYPE_NODE, DOCUMENT_FRAGMENT_NODE, BLOCK_ELEMENTS, SHOW_ALL, SHOW_ELEMENT, SHOW_TEXT, SHOW_COMMENT, DOCUMENT_POSITION_DISCONNECTED, DOCUMENT_POSITION_PRECEDING, DOCUMENT_POSITION_FOLLOWING, DOCUMENT_POSITION_CONTAINS, DOCUMENT_POSITION_CONTAINED_BY, DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC, SVG_NAMESPACE;
var init_constants = __esm({
  "node_modules/linkedom/esm/shared/constants.js"() {
    NODE_END = -1;
    ELEMENT_NODE = 1;
    ATTRIBUTE_NODE = 2;
    TEXT_NODE = 3;
    COMMENT_NODE = 8;
    DOCUMENT_NODE = 9;
    DOCUMENT_TYPE_NODE = 10;
    DOCUMENT_FRAGMENT_NODE = 11;
    BLOCK_ELEMENTS = /* @__PURE__ */ new Set(["ARTICLE", "ASIDE", "BLOCKQUOTE", "BODY", "BR", "BUTTON", "CANVAS", "CAPTION", "COL", "COLGROUP", "DD", "DIV", "DL", "DT", "EMBED", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "UL", "OL", "P"]);
    SHOW_ALL = -1;
    SHOW_ELEMENT = 1;
    SHOW_TEXT = 4;
    SHOW_COMMENT = 128;
    DOCUMENT_POSITION_DISCONNECTED = 1;
    DOCUMENT_POSITION_PRECEDING = 2;
    DOCUMENT_POSITION_FOLLOWING = 4;
    DOCUMENT_POSITION_CONTAINS = 8;
    DOCUMENT_POSITION_CONTAINED_BY = 16;
    DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;
    SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  }
});

// node_modules/linkedom/esm/shared/object.js
var assign, create, defineProperties, entries, getOwnPropertyDescriptors, keys, setPrototypeOf;
var init_object = __esm({
  "node_modules/linkedom/esm/shared/object.js"() {
    ({
      assign,
      create,
      defineProperties,
      entries,
      getOwnPropertyDescriptors,
      keys,
      setPrototypeOf
    } = Object);
  }
});

// node_modules/linkedom/esm/shared/utils.js
var $String, getEnd, ignoreCase, knownAdjacent, knownBoundaries, knownSegment, knownSiblings, localCase, setAdjacent;
var init_utils = __esm({
  "node_modules/linkedom/esm/shared/utils.js"() {
    init_constants();
    init_symbols();
    $String = String;
    getEnd = (node) => node.nodeType === ELEMENT_NODE ? node[END] : node;
    ignoreCase = ({ ownerDocument }) => ownerDocument[MIME].ignoreCase;
    knownAdjacent = (prev, next) => {
      prev[NEXT] = next;
      next[PREV] = prev;
    };
    knownBoundaries = (prev, current, next) => {
      knownAdjacent(prev, current);
      knownAdjacent(getEnd(current), next);
    };
    knownSegment = (prev, start, end, next) => {
      knownAdjacent(prev, start);
      knownAdjacent(getEnd(end), next);
    };
    knownSiblings = (prev, current, next) => {
      knownAdjacent(prev, current);
      knownAdjacent(current, next);
    };
    localCase = ({ localName, ownerDocument }) => {
      return ownerDocument[MIME].ignoreCase ? localName.toUpperCase() : localName;
    };
    setAdjacent = (prev, next) => {
      if (prev)
        prev[NEXT] = next;
      if (next)
        next[PREV] = prev;
    };
  }
});

// node_modules/linkedom/esm/shared/shadow-roots.js
var shadowRoots;
var init_shadow_roots = __esm({
  "node_modules/linkedom/esm/shared/shadow-roots.js"() {
    shadowRoots = /* @__PURE__ */ new WeakMap();
  }
});

// node_modules/linkedom/esm/interface/custom-element-registry.js
var reactive, Classes, customElements, attributeChangedCallback, createTrigger, triggerConnected, connectedCallback, triggerDisconnected, disconnectedCallback, CustomElementRegistry;
var init_custom_element_registry = __esm({
  "node_modules/linkedom/esm/interface/custom-element-registry.js"() {
    init_constants();
    init_symbols();
    init_object();
    init_shadow_roots();
    reactive = false;
    Classes = /* @__PURE__ */ new WeakMap();
    customElements = /* @__PURE__ */ new WeakMap();
    attributeChangedCallback = (element, attributeName, oldValue, newValue) => {
      if (reactive && customElements.has(element) && element.attributeChangedCallback && element.constructor.observedAttributes.includes(attributeName)) {
        element.attributeChangedCallback(attributeName, oldValue, newValue);
      }
    };
    createTrigger = (method, isConnected2) => (element) => {
      if (customElements.has(element)) {
        const info = customElements.get(element);
        if (info.connected !== isConnected2 && element.isConnected === isConnected2) {
          info.connected = isConnected2;
          if (method in element)
            element[method]();
        }
      }
    };
    triggerConnected = createTrigger("connectedCallback", true);
    connectedCallback = (element) => {
      if (reactive) {
        triggerConnected(element);
        if (shadowRoots.has(element))
          element = shadowRoots.get(element).shadowRoot;
        let { [NEXT]: next, [END]: end } = element;
        while (next !== end) {
          if (next.nodeType === ELEMENT_NODE)
            triggerConnected(next);
          next = next[NEXT];
        }
      }
    };
    triggerDisconnected = createTrigger("disconnectedCallback", false);
    disconnectedCallback = (element) => {
      if (reactive) {
        triggerDisconnected(element);
        if (shadowRoots.has(element))
          element = shadowRoots.get(element).shadowRoot;
        let { [NEXT]: next, [END]: end } = element;
        while (next !== end) {
          if (next.nodeType === ELEMENT_NODE)
            triggerDisconnected(next);
          next = next[NEXT];
        }
      }
    };
    CustomElementRegistry = class {
      /**
       * @param {Document} ownerDocument
       */
      constructor(ownerDocument) {
        this.ownerDocument = ownerDocument;
        this.registry = /* @__PURE__ */ new Map();
        this.waiting = /* @__PURE__ */ new Map();
        this.active = false;
      }
      /**
       * @param {string} localName the custom element definition name
       * @param {Function} Class the custom element **Class** definition
       * @param {object?} options the optional object with an `extends` property
       */
      define(localName, Class, options = {}) {
        const { ownerDocument, registry, waiting } = this;
        if (registry.has(localName))
          throw new Error("unable to redefine " + localName);
        if (Classes.has(Class))
          throw new Error("unable to redefine the same class: " + Class);
        this.active = reactive = true;
        const { extends: extend } = options;
        Classes.set(Class, {
          ownerDocument,
          options: { is: extend ? localName : "" },
          localName: extend || localName
        });
        const check = extend ? (element) => {
          return element.localName === extend && element.getAttribute("is") === localName;
        } : (element) => element.localName === localName;
        registry.set(localName, { Class, check });
        if (waiting.has(localName)) {
          for (const resolve of waiting.get(localName))
            resolve(Class);
          waiting.delete(localName);
        }
        ownerDocument.querySelectorAll(
          extend ? `${extend}[is="${localName}"]` : localName
        ).forEach(this.upgrade, this);
      }
      /**
       * @param {Element} element
       */
      upgrade(element) {
        if (customElements.has(element))
          return;
        const { ownerDocument, registry } = this;
        const ce = element.getAttribute("is") || element.localName;
        if (registry.has(ce)) {
          const { Class, check } = registry.get(ce);
          if (check(element)) {
            const { attributes: attributes2, isConnected: isConnected2 } = element;
            for (const attr of attributes2)
              element.removeAttributeNode(attr);
            const values = entries(element);
            for (const [key2] of values)
              delete element[key2];
            setPrototypeOf(element, Class.prototype);
            ownerDocument[UPGRADE] = { element, values };
            new Class(ownerDocument, ce);
            customElements.set(element, { connected: isConnected2 });
            for (const attr of attributes2)
              element.setAttributeNode(attr);
            if (isConnected2 && element.connectedCallback)
              element.connectedCallback();
          }
        }
      }
      /**
       * @param {string} localName the custom element definition name
       */
      whenDefined(localName) {
        const { registry, waiting } = this;
        return new Promise((resolve) => {
          if (registry.has(localName))
            resolve(registry.get(localName).Class);
          else {
            if (!waiting.has(localName))
              waiting.set(localName, []);
            waiting.get(localName).push(resolve);
          }
        });
      }
      /**
       * @param {string} localName the custom element definition name
       * @returns {Function?} the custom element **Class**, if any
       */
      get(localName) {
        const info = this.registry.get(localName);
        return info && info.Class;
      }
    };
  }
});

// node_modules/linkedom/esm/shared/parse-from-string.js
var Parser2, notParsing, append2, attribute, parseFromString;
var init_parse_from_string = __esm({
  "node_modules/linkedom/esm/shared/parse-from-string.js"() {
    init_esm6();
    init_constants();
    init_symbols();
    init_object();
    init_utils();
    init_custom_element_registry();
    ({ Parser: Parser2 } = esm_exports3);
    notParsing = true;
    append2 = (self, node, active) => {
      const end = self[END];
      node.parentNode = self;
      knownBoundaries(end[PREV], node, end);
      if (active && node.nodeType === ELEMENT_NODE)
        connectedCallback(node);
      return node;
    };
    attribute = (element, end, attribute2, value, active) => {
      attribute2[VALUE] = value;
      attribute2.ownerElement = element;
      knownSiblings(end[PREV], attribute2, end);
      if (attribute2.name === "class")
        element.className = value;
      if (active)
        attributeChangedCallback(element, attribute2.name, null, value);
    };
    parseFromString = (document2, isHTML, markupLanguage) => {
      const { active, registry } = document2[CUSTOM_ELEMENTS];
      let node = document2;
      let ownerSVGElement = null;
      notParsing = false;
      const content = new Parser2({
        // <!DOCTYPE ...>
        onprocessinginstruction(name, data) {
          if (name.toLowerCase() === "!doctype")
            document2.doctype = data.slice(name.length).trim();
        },
        // <tagName>
        onopentag(name, attributes2) {
          let create3 = true;
          if (isHTML) {
            if (ownerSVGElement) {
              node = append2(node, document2.createElementNS(SVG_NAMESPACE, name), active);
              node.ownerSVGElement = ownerSVGElement;
              create3 = false;
            } else if (name === "svg" || name === "SVG") {
              ownerSVGElement = document2.createElementNS(SVG_NAMESPACE, name);
              node = append2(node, ownerSVGElement, active);
              create3 = false;
            } else if (active) {
              const ce = name.includes("-") ? name : attributes2.is || "";
              if (ce && registry.has(ce)) {
                const { Class } = registry.get(ce);
                node = append2(node, new Class(), active);
                delete attributes2.is;
                create3 = false;
              }
            }
          }
          if (create3)
            node = append2(node, document2.createElement(name), false);
          let end = node[END];
          for (const name2 of keys(attributes2))
            attribute(node, end, document2.createAttribute(name2), attributes2[name2], active);
        },
        // #text, #comment
        oncomment(data) {
          append2(node, document2.createComment(data), active);
        },
        ontext(text) {
          append2(node, document2.createTextNode(text), active);
        },
        // </tagName>
        onclosetag() {
          if (isHTML && node === ownerSVGElement)
            ownerSVGElement = null;
          node = node.parentNode;
        }
      }, {
        lowerCaseAttributeNames: false,
        decodeEntities: true,
        xmlMode: !isHTML
      });
      content.write(markupLanguage);
      content.end();
      notParsing = true;
      return document2;
    };
  }
});

// node_modules/linkedom/esm/shared/register-html-class.js
var htmlClasses, registerHTMLClass;
var init_register_html_class = __esm({
  "node_modules/linkedom/esm/shared/register-html-class.js"() {
    htmlClasses = /* @__PURE__ */ new Map();
    registerHTMLClass = (names, Class) => {
      for (const name of [].concat(names)) {
        htmlClasses.set(name, Class);
        htmlClasses.set(name.toUpperCase(), Class);
      }
    };
  }
});

// node_modules/linkedom/commonjs/perf_hooks.cjs
var require_perf_hooks = __commonJS({
  "node_modules/linkedom/commonjs/perf_hooks.cjs"(exports) {
    try {
      const { performance: performance2 } = require("perf_hooks");
      exports.performance = performance2;
    } catch (fallback) {
      exports.performance = { now() {
        return +/* @__PURE__ */ new Date();
      } };
    }
  }
});

// node_modules/linkedom/esm/shared/jsdon.js
var loopSegment, attrAsJSON, characterDataAsJSON, nonElementAsJSON, documentTypeAsJSON, elementAsJSON;
var init_jsdon = __esm({
  "node_modules/linkedom/esm/shared/jsdon.js"() {
    init_constants();
    init_symbols();
    init_utils();
    loopSegment = ({ [NEXT]: next, [END]: end }, json) => {
      while (next !== end) {
        switch (next.nodeType) {
          case ATTRIBUTE_NODE:
            attrAsJSON(next, json);
            break;
          case TEXT_NODE:
          case COMMENT_NODE:
            characterDataAsJSON(next, json);
            break;
          case ELEMENT_NODE:
            elementAsJSON(next, json);
            next = getEnd(next);
            break;
          case DOCUMENT_TYPE_NODE:
            documentTypeAsJSON(next, json);
            break;
        }
        next = next[NEXT];
      }
      const last = json.length - 1;
      const value = json[last];
      if (typeof value === "number" && value < 0)
        json[last] += NODE_END;
      else
        json.push(NODE_END);
    };
    attrAsJSON = (attr, json) => {
      json.push(ATTRIBUTE_NODE, attr.name);
      const value = attr[VALUE].trim();
      if (value)
        json.push(value);
    };
    characterDataAsJSON = (node, json) => {
      const value = node[VALUE];
      if (value.trim())
        json.push(node.nodeType, value);
    };
    nonElementAsJSON = (node, json) => {
      json.push(node.nodeType);
      loopSegment(node, json);
    };
    documentTypeAsJSON = ({ name, publicId, systemId }, json) => {
      json.push(DOCUMENT_TYPE_NODE, name);
      if (publicId)
        json.push(publicId);
      if (systemId)
        json.push(systemId);
    };
    elementAsJSON = (element, json) => {
      json.push(ELEMENT_NODE, element.localName);
      loopSegment(element, json);
    };
  }
});

// node_modules/linkedom/esm/interface/mutation-observer.js
var createRecord, queueAttribute, attributeChangedCallback2, moCallback, MutationObserverClass;
var init_mutation_observer = __esm({
  "node_modules/linkedom/esm/interface/mutation-observer.js"() {
    init_symbols();
    createRecord = (type, target, addedNodes, removedNodes, attributeName, oldValue) => ({ type, target, addedNodes, removedNodes, attributeName, oldValue });
    queueAttribute = (observer, target, attributeName, attributeFilter, attributeOldValue, oldValue) => {
      if (!attributeFilter || attributeFilter.includes(attributeName)) {
        const { callback, records, scheduled } = observer;
        records.push(createRecord(
          "attributes",
          target,
          [],
          [],
          attributeName,
          attributeOldValue ? oldValue : void 0
        ));
        if (!scheduled) {
          observer.scheduled = true;
          Promise.resolve().then(() => {
            observer.scheduled = false;
            callback(records.splice(0), observer);
          });
        }
      }
    };
    attributeChangedCallback2 = (element, attributeName, oldValue) => {
      const { ownerDocument } = element;
      const { active, observers } = ownerDocument[MUTATION_OBSERVER];
      if (active) {
        for (const observer of observers) {
          for (const [
            target,
            {
              childList,
              subtree,
              attributes: attributes2,
              attributeFilter,
              attributeOldValue
            }
          ] of observer.nodes) {
            if (childList) {
              if (subtree && (target === ownerDocument || target.contains(element)) || !subtree && target.children.includes(element)) {
                queueAttribute(
                  observer,
                  element,
                  attributeName,
                  attributeFilter,
                  attributeOldValue,
                  oldValue
                );
                break;
              }
            } else if (attributes2 && target === element) {
              queueAttribute(
                observer,
                element,
                attributeName,
                attributeFilter,
                attributeOldValue,
                oldValue
              );
              break;
            }
          }
        }
      }
    };
    moCallback = (element, parentNode) => {
      const { ownerDocument } = element;
      const { active, observers } = ownerDocument[MUTATION_OBSERVER];
      if (active) {
        for (const observer of observers) {
          for (const [target, { subtree, childList, characterData }] of observer.nodes) {
            if (childList) {
              if (parentNode && (target === parentNode || /* c8 ignore next */
              subtree && target.contains(parentNode)) || !parentNode && (subtree && (target === ownerDocument || /* c8 ignore next */
              target.contains(element)) || !subtree && target[characterData ? "childNodes" : "children"].includes(element))) {
                const { callback, records, scheduled } = observer;
                records.push(createRecord(
                  "childList",
                  target,
                  parentNode ? [] : [element],
                  parentNode ? [element] : []
                ));
                if (!scheduled) {
                  observer.scheduled = true;
                  Promise.resolve().then(() => {
                    observer.scheduled = false;
                    callback(records.splice(0), observer);
                  });
                }
                break;
              }
            }
          }
        }
      }
    };
    MutationObserverClass = class {
      constructor(ownerDocument) {
        const observers = /* @__PURE__ */ new Set();
        this.observers = observers;
        this.active = false;
        this.class = class MutationObserver {
          constructor(callback) {
            this.callback = callback;
            this.nodes = /* @__PURE__ */ new Map();
            this.records = [];
            this.scheduled = false;
          }
          disconnect() {
            this.records.splice(0);
            this.nodes.clear();
            observers.delete(this);
            ownerDocument[MUTATION_OBSERVER].active = !!observers.size;
          }
          /**
           * @param {Element} target
           * @param {MutationObserverInit} options
           */
          observe(target, options = {
            subtree: false,
            childList: false,
            attributes: false,
            attributeFilter: null,
            attributeOldValue: false,
            characterData: false
            // TODO: not implemented yet
            // characterDataOldValue: false
          }) {
            if ("attributeOldValue" in options || "attributeFilter" in options)
              options.attributes = true;
            options.childList = !!options.childList;
            options.subtree = !!options.subtree;
            this.nodes.set(target, options);
            observers.add(this);
            ownerDocument[MUTATION_OBSERVER].active = true;
          }
          /**
           * @returns {MutationRecord[]}
           */
          takeRecords() {
            return this.records.splice(0);
          }
        };
      }
    };
  }
});

// node_modules/linkedom/esm/shared/attributes.js
var emptyAttributes, setAttribute, removeAttribute, booleanAttribute, numericAttribute, stringAttribute;
var init_attributes = __esm({
  "node_modules/linkedom/esm/shared/attributes.js"() {
    init_symbols();
    init_utils();
    init_custom_element_registry();
    init_mutation_observer();
    emptyAttributes = /* @__PURE__ */ new Set([
      "allowfullscreen",
      "allowpaymentrequest",
      "async",
      "autofocus",
      "autoplay",
      "checked",
      "class",
      "contenteditable",
      "controls",
      "default",
      "defer",
      "disabled",
      "draggable",
      "formnovalidate",
      "hidden",
      "id",
      "ismap",
      "itemscope",
      "loop",
      "multiple",
      "muted",
      "nomodule",
      "novalidate",
      "open",
      "playsinline",
      "readonly",
      "required",
      "reversed",
      "selected",
      "style",
      "truespeed"
    ]);
    setAttribute = (element, attribute2) => {
      const { [VALUE]: value, name } = attribute2;
      attribute2.ownerElement = element;
      knownSiblings(element, attribute2, element[NEXT]);
      if (name === "class")
        element.className = value;
      attributeChangedCallback2(element, name, null);
      attributeChangedCallback(element, name, null, value);
    };
    removeAttribute = (element, attribute2) => {
      const { [VALUE]: value, name } = attribute2;
      knownAdjacent(attribute2[PREV], attribute2[NEXT]);
      attribute2.ownerElement = attribute2[PREV] = attribute2[NEXT] = null;
      if (name === "class")
        element[CLASS_LIST] = null;
      attributeChangedCallback2(element, name, value);
      attributeChangedCallback(element, name, value, null);
    };
    booleanAttribute = {
      get(element, name) {
        return element.hasAttribute(name);
      },
      set(element, name, value) {
        if (value)
          element.setAttribute(name, "");
        else
          element.removeAttribute(name);
      }
    };
    numericAttribute = {
      get(element, name) {
        return parseFloat(element.getAttribute(name) || 0);
      },
      set(element, name, value) {
        element.setAttribute(name, value);
      }
    };
    stringAttribute = {
      get(element, name) {
        return element.getAttribute(name) || "";
      },
      set(element, name, value) {
        element.setAttribute(name, value);
      }
    };
  }
});

// node_modules/linkedom/esm/interface/event-target.js
function dispatch(event, listener) {
  if (typeof listener === "function")
    listener.call(event.target, event);
  else
    listener.handleEvent(event);
  return event._stopImmediatePropagationFlag;
}
function invokeListeners({ currentTarget, target }) {
  const map = wm.get(currentTarget);
  if (map && map.has(this.type)) {
    const listeners = map.get(this.type);
    if (currentTarget === target) {
      this.eventPhase = this.AT_TARGET;
    } else {
      this.eventPhase = this.BUBBLING_PHASE;
    }
    this.currentTarget = currentTarget;
    this.target = target;
    for (const [listener, options] of listeners) {
      if (options && options.once)
        listeners.delete(listener);
      if (dispatch(this, listener))
        break;
    }
    delete this.currentTarget;
    delete this.target;
    return this.cancelBubble;
  }
}
var wm, DOMEventTarget;
var init_event_target = __esm({
  "node_modules/linkedom/esm/interface/event-target.js"() {
    wm = /* @__PURE__ */ new WeakMap();
    DOMEventTarget = class {
      constructor() {
        wm.set(this, /* @__PURE__ */ new Map());
      }
      /**
       * @protected
       */
      _getParent() {
        return null;
      }
      addEventListener(type, listener, options) {
        const map = wm.get(this);
        if (!map.has(type))
          map.set(type, /* @__PURE__ */ new Map());
        map.get(type).set(listener, options);
      }
      removeEventListener(type, listener) {
        const map = wm.get(this);
        if (map.has(type)) {
          const listeners = map.get(type);
          if (listeners.delete(listener) && !listeners.size)
            map.delete(type);
        }
      }
      dispatchEvent(event) {
        let node = this;
        event.eventPhase = event.CAPTURING_PHASE;
        while (node) {
          if (node.dispatchEvent)
            event._path.push({ currentTarget: node, target: this });
          node = event.bubbles && node._getParent && node._getParent();
        }
        event._path.some(invokeListeners, event);
        event._path = [];
        event.eventPhase = event.NONE;
        return !event.defaultPrevented;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/node-list.js
var NodeList;
var init_node_list = __esm({
  "node_modules/linkedom/esm/interface/node-list.js"() {
    NodeList = class extends Array {
      item(i) {
        return i < this.length ? this[i] : null;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/node.js
var getParentNodeCount, Node2;
var init_node2 = __esm({
  "node_modules/linkedom/esm/interface/node.js"() {
    init_constants();
    init_symbols();
    init_event_target();
    init_node_list();
    getParentNodeCount = ({ parentNode }) => {
      let count = 0;
      while (parentNode) {
        count++;
        parentNode = parentNode.parentNode;
      }
      return count;
    };
    Node2 = class extends DOMEventTarget {
      static get ELEMENT_NODE() {
        return ELEMENT_NODE;
      }
      static get ATTRIBUTE_NODE() {
        return ATTRIBUTE_NODE;
      }
      static get TEXT_NODE() {
        return TEXT_NODE;
      }
      static get COMMENT_NODE() {
        return COMMENT_NODE;
      }
      static get DOCUMENT_NODE() {
        return DOCUMENT_NODE;
      }
      static get DOCUMENT_FRAGMENT_NODE() {
        return DOCUMENT_FRAGMENT_NODE;
      }
      static get DOCUMENT_TYPE_NODE() {
        return DOCUMENT_TYPE_NODE;
      }
      constructor(ownerDocument, localName, nodeType) {
        super();
        this.ownerDocument = ownerDocument;
        this.localName = localName;
        this.nodeType = nodeType;
        this.parentNode = null;
        this[NEXT] = null;
        this[PREV] = null;
      }
      get ELEMENT_NODE() {
        return ELEMENT_NODE;
      }
      get ATTRIBUTE_NODE() {
        return ATTRIBUTE_NODE;
      }
      get TEXT_NODE() {
        return TEXT_NODE;
      }
      get COMMENT_NODE() {
        return COMMENT_NODE;
      }
      get DOCUMENT_NODE() {
        return DOCUMENT_NODE;
      }
      get DOCUMENT_FRAGMENT_NODE() {
        return DOCUMENT_FRAGMENT_NODE;
      }
      get DOCUMENT_TYPE_NODE() {
        return DOCUMENT_TYPE_NODE;
      }
      get baseURI() {
        const ownerDocument = this.nodeType === DOCUMENT_NODE ? this : this.ownerDocument;
        if (ownerDocument) {
          const base = ownerDocument.querySelector("base");
          if (base)
            return base.getAttribute("href");
          const { location } = ownerDocument.defaultView;
          if (location)
            return location.href;
        }
        return null;
      }
      /* c8 ignore start */
      // mixin: node
      get isConnected() {
        return false;
      }
      get nodeName() {
        return this.localName;
      }
      get parentElement() {
        return null;
      }
      get previousSibling() {
        return null;
      }
      get previousElementSibling() {
        return null;
      }
      get nextSibling() {
        return null;
      }
      get nextElementSibling() {
        return null;
      }
      get childNodes() {
        return new NodeList();
      }
      get firstChild() {
        return null;
      }
      get lastChild() {
        return null;
      }
      // default values
      get nodeValue() {
        return null;
      }
      set nodeValue(value) {
      }
      get textContent() {
        return null;
      }
      set textContent(value) {
      }
      normalize() {
      }
      cloneNode() {
        return null;
      }
      contains() {
        return false;
      }
      /**
       * Inserts a node before a reference node as a child of this parent node.
       * @param {Node} newNode The node to be inserted.
       * @param {Node} referenceNode The node before which newNode is inserted. If this is null, then newNode is inserted at the end of node's child nodes.
       * @returns The added child
       */
      // eslint-disable-next-line no-unused-vars
      insertBefore(newNode, referenceNode) {
        return newNode;
      }
      /**
       * Adds a node to the end of the list of children of this node.
       * @param {Node} child The node to append to the given parent node.
       * @returns The appended child.
       */
      appendChild(child) {
        return child;
      }
      /**
       * Replaces a child node within this node
       * @param {Node} newChild The new node to replace oldChild.
       * @param {Node} oldChild The child to be replaced.
       * @returns The replaced Node. This is the same node as oldChild.
       */
      replaceChild(newChild, oldChild) {
        return oldChild;
      }
      /**
       * Removes a child node from the DOM.
       * @param {Node} child A Node that is the child node to be removed from the DOM.
       * @returns The removed node.
       */
      removeChild(child) {
        return child;
      }
      toString() {
        return "";
      }
      /* c8 ignore stop */
      hasChildNodes() {
        return !!this.lastChild;
      }
      isSameNode(node) {
        return this === node;
      }
      // TODO: attributes?
      compareDocumentPosition(target) {
        let result = 0;
        if (this !== target) {
          let self = getParentNodeCount(this);
          let other = getParentNodeCount(target);
          if (self < other) {
            result += DOCUMENT_POSITION_FOLLOWING;
            if (this.contains(target))
              result += DOCUMENT_POSITION_CONTAINED_BY;
          } else if (other < self) {
            result += DOCUMENT_POSITION_PRECEDING;
            if (target.contains(this))
              result += DOCUMENT_POSITION_CONTAINS;
          } else if (self && other) {
            const { childNodes } = this.parentNode;
            if (childNodes.indexOf(this) < childNodes.indexOf(target))
              result += DOCUMENT_POSITION_FOLLOWING;
            else
              result += DOCUMENT_POSITION_PRECEDING;
          }
          if (!self || !other) {
            result += DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
            result += DOCUMENT_POSITION_DISCONNECTED;
          }
        }
        return result;
      }
      isEqualNode(node) {
        if (this === node)
          return true;
        if (this.nodeType === node.nodeType) {
          switch (this.nodeType) {
            case DOCUMENT_NODE:
            case DOCUMENT_FRAGMENT_NODE: {
              const aNodes = this.childNodes;
              const bNodes = node.childNodes;
              return aNodes.length === bNodes.length && aNodes.every((node2, i) => node2.isEqualNode(bNodes[i]));
            }
          }
          return this.toString() === node.toString();
        }
        return false;
      }
      /**
       * @protected
       */
      _getParent() {
        return this.parentNode;
      }
      /**
       * Calling it on an element inside a standard web page will return an HTMLDocument object representing the entire page (or <iframe>).
       * Calling it on an element inside a shadow DOM will return the associated ShadowRoot.
       * @return {ShadowRoot | HTMLDocument}
       */
      getRootNode() {
        let root = this;
        while (root.parentNode)
          root = root.parentNode;
        return root;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/attr.js
var QUOTE, Attr;
var init_attr = __esm({
  "node_modules/linkedom/esm/interface/attr.js"() {
    init_constants();
    init_symbols();
    init_utils();
    init_jsdon();
    init_attributes();
    init_mutation_observer();
    init_custom_element_registry();
    init_node2();
    QUOTE = /"/g;
    Attr = class _Attr extends Node2 {
      constructor(ownerDocument, name, value = "") {
        super(ownerDocument, "#attribute", ATTRIBUTE_NODE);
        this.ownerElement = null;
        this.name = $String(name);
        this[VALUE] = $String(value);
        this[CHANGED] = false;
      }
      get value() {
        return this[VALUE];
      }
      set value(newValue) {
        const { [VALUE]: oldValue, name, ownerElement } = this;
        this[VALUE] = $String(newValue);
        this[CHANGED] = true;
        if (ownerElement) {
          attributeChangedCallback2(ownerElement, name, oldValue);
          attributeChangedCallback(ownerElement, name, oldValue, this[VALUE]);
        }
      }
      cloneNode() {
        const { ownerDocument, name, [VALUE]: value } = this;
        return new _Attr(ownerDocument, name, value);
      }
      toString() {
        const { name, [VALUE]: value } = this;
        return emptyAttributes.has(name) && !value ? name : `${name}="${value.replace(QUOTE, "&quot;")}"`;
      }
      toJSON() {
        const json = [];
        attrAsJSON(this, json);
        return json;
      }
    };
  }
});

// node_modules/linkedom/esm/shared/node.js
var isConnected, parentElement, previousSibling, nextSibling;
var init_node3 = __esm({
  "node_modules/linkedom/esm/shared/node.js"() {
    init_constants();
    init_symbols();
    init_utils();
    isConnected = ({ ownerDocument, parentNode }) => {
      while (parentNode) {
        if (parentNode === ownerDocument)
          return true;
        parentNode = parentNode.parentNode || parentNode.host;
      }
      return false;
    };
    parentElement = ({ parentNode }) => {
      if (parentNode) {
        switch (parentNode.nodeType) {
          case DOCUMENT_NODE:
          case DOCUMENT_FRAGMENT_NODE:
            return null;
        }
      }
      return parentNode;
    };
    previousSibling = ({ [PREV]: prev }) => {
      switch (prev ? prev.nodeType : 0) {
        case NODE_END:
          return prev[START];
        case TEXT_NODE:
        case COMMENT_NODE:
          return prev;
      }
      return null;
    };
    nextSibling = (node) => {
      const next = getEnd(node)[NEXT];
      return next && (next.nodeType === NODE_END ? null : next);
    };
  }
});

// node_modules/linkedom/esm/mixin/non-document-type-child-node.js
var nextElementSibling2, previousElementSibling;
var init_non_document_type_child_node = __esm({
  "node_modules/linkedom/esm/mixin/non-document-type-child-node.js"() {
    init_constants();
    init_node3();
    nextElementSibling2 = (node) => {
      let next = nextSibling(node);
      while (next && next.nodeType !== ELEMENT_NODE)
        next = nextSibling(next);
      return next;
    };
    previousElementSibling = (node) => {
      let prev = previousSibling(node);
      while (prev && prev.nodeType !== ELEMENT_NODE)
        prev = previousSibling(prev);
      return prev;
    };
  }
});

// node_modules/linkedom/esm/mixin/child-node.js
var asFragment, before, after, replaceWith, remove;
var init_child_node = __esm({
  "node_modules/linkedom/esm/mixin/child-node.js"() {
    init_constants();
    init_symbols();
    init_utils();
    init_mutation_observer();
    init_custom_element_registry();
    asFragment = (ownerDocument, nodes) => {
      const fragment = ownerDocument.createDocumentFragment();
      fragment.append(...nodes);
      return fragment;
    };
    before = (node, nodes) => {
      const { ownerDocument, parentNode } = node;
      if (parentNode)
        parentNode.insertBefore(
          asFragment(ownerDocument, nodes),
          node
        );
    };
    after = (node, nodes) => {
      const { ownerDocument, parentNode } = node;
      if (parentNode)
        parentNode.insertBefore(
          asFragment(ownerDocument, nodes),
          getEnd(node)[NEXT]
        );
    };
    replaceWith = (node, nodes) => {
      const { ownerDocument, parentNode } = node;
      if (parentNode) {
        parentNode.insertBefore(
          asFragment(ownerDocument, nodes),
          node
        );
        node.remove();
      }
    };
    remove = (prev, current, next) => {
      const { parentNode, nodeType } = current;
      if (prev || next) {
        setAdjacent(prev, next);
        current[PREV] = null;
        getEnd(current)[NEXT] = null;
      }
      if (parentNode) {
        current.parentNode = null;
        moCallback(current, parentNode);
        if (nodeType === ELEMENT_NODE)
          disconnectedCallback(current);
      }
    };
  }
});

// node_modules/linkedom/esm/interface/character-data.js
var CharacterData;
var init_character_data = __esm({
  "node_modules/linkedom/esm/interface/character-data.js"() {
    init_symbols();
    init_utils();
    init_node3();
    init_jsdon();
    init_non_document_type_child_node();
    init_child_node();
    init_node2();
    init_mutation_observer();
    CharacterData = class extends Node2 {
      constructor(ownerDocument, localName, nodeType, data) {
        super(ownerDocument, localName, nodeType);
        this[VALUE] = $String(data);
      }
      // <Mixins>
      get isConnected() {
        return isConnected(this);
      }
      get parentElement() {
        return parentElement(this);
      }
      get previousSibling() {
        return previousSibling(this);
      }
      get nextSibling() {
        return nextSibling(this);
      }
      get previousElementSibling() {
        return previousElementSibling(this);
      }
      get nextElementSibling() {
        return nextElementSibling2(this);
      }
      before(...nodes) {
        before(this, nodes);
      }
      after(...nodes) {
        after(this, nodes);
      }
      replaceWith(...nodes) {
        replaceWith(this, nodes);
      }
      remove() {
        remove(this[PREV], this, this[NEXT]);
      }
      // </Mixins>
      // CharacterData only
      /* c8 ignore start */
      get data() {
        return this[VALUE];
      }
      set data(value) {
        this[VALUE] = $String(value);
        moCallback(this, this.parentNode);
      }
      get nodeValue() {
        return this.data;
      }
      set nodeValue(value) {
        this.data = value;
      }
      get textContent() {
        return this.data;
      }
      set textContent(value) {
        this.data = value;
      }
      get length() {
        return this.data.length;
      }
      substringData(offset, count) {
        return this.data.substr(offset, count);
      }
      appendData(data) {
        this.data += data;
      }
      insertData(offset, data) {
        const { data: t } = this;
        this.data = t.slice(0, offset) + data + t.slice(offset);
      }
      deleteData(offset, count) {
        const { data: t } = this;
        this.data = t.slice(0, offset) + t.slice(offset + count);
      }
      replaceData(offset, count, data) {
        const { data: t } = this;
        this.data = t.slice(0, offset) + data + t.slice(offset + count);
      }
      /* c8 ignore stop */
      toJSON() {
        const json = [];
        characterDataAsJSON(this, json);
        return json;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/comment.js
var Comment3;
var init_comment = __esm({
  "node_modules/linkedom/esm/interface/comment.js"() {
    init_constants();
    init_symbols();
    init_character_data();
    Comment3 = class _Comment extends CharacterData {
      constructor(ownerDocument, data = "") {
        super(ownerDocument, "#comment", COMMENT_NODE, data);
      }
      cloneNode() {
        const { ownerDocument, [VALUE]: data } = this;
        return new _Comment(ownerDocument, data);
      }
      toString() {
        return `<!--${this[VALUE]}-->`;
      }
    };
  }
});

// node_modules/boolbase/index.js
var require_boolbase = __commonJS({
  "node_modules/boolbase/index.js"(exports, module2) {
    module2.exports = {
      trueFunc: function trueFunc() {
        return true;
      },
      falseFunc: function falseFunc() {
        return false;
      }
    };
  }
});

// node_modules/css-what/lib/commonjs/types.js
var require_types = __commonJS({
  "node_modules/css-what/lib/commonjs/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttributeAction = exports.IgnoreCaseMode = exports.SelectorType = void 0;
    var SelectorType4;
    (function(SelectorType5) {
      SelectorType5["Attribute"] = "attribute";
      SelectorType5["Pseudo"] = "pseudo";
      SelectorType5["PseudoElement"] = "pseudo-element";
      SelectorType5["Tag"] = "tag";
      SelectorType5["Universal"] = "universal";
      SelectorType5["Adjacent"] = "adjacent";
      SelectorType5["Child"] = "child";
      SelectorType5["Descendant"] = "descendant";
      SelectorType5["Parent"] = "parent";
      SelectorType5["Sibling"] = "sibling";
      SelectorType5["ColumnCombinator"] = "column-combinator";
    })(SelectorType4 = exports.SelectorType || (exports.SelectorType = {}));
    exports.IgnoreCaseMode = {
      Unknown: null,
      QuirksMode: "quirks",
      IgnoreCase: true,
      CaseSensitive: false
    };
    var AttributeAction2;
    (function(AttributeAction3) {
      AttributeAction3["Any"] = "any";
      AttributeAction3["Element"] = "element";
      AttributeAction3["End"] = "end";
      AttributeAction3["Equals"] = "equals";
      AttributeAction3["Exists"] = "exists";
      AttributeAction3["Hyphen"] = "hyphen";
      AttributeAction3["Not"] = "not";
      AttributeAction3["Start"] = "start";
    })(AttributeAction2 = exports.AttributeAction || (exports.AttributeAction = {}));
  }
});

// node_modules/css-what/lib/commonjs/parse.js
var require_parse = __commonJS({
  "node_modules/css-what/lib/commonjs/parse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = exports.isTraversal = void 0;
    var types_1 = require_types();
    var reName = /^[^\\#]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\-\u00b0-\uFFFF])+/;
    var reEscape = /\\([\da-f]{1,6}\s?|(\s)|.)/gi;
    var actionTypes = /* @__PURE__ */ new Map([
      [126, types_1.AttributeAction.Element],
      [94, types_1.AttributeAction.Start],
      [36, types_1.AttributeAction.End],
      [42, types_1.AttributeAction.Any],
      [33, types_1.AttributeAction.Not],
      [124, types_1.AttributeAction.Hyphen]
    ]);
    var unpackPseudos = /* @__PURE__ */ new Set([
      "has",
      "not",
      "matches",
      "is",
      "where",
      "host",
      "host-context"
    ]);
    function isTraversal2(selector) {
      switch (selector.type) {
        case types_1.SelectorType.Adjacent:
        case types_1.SelectorType.Child:
        case types_1.SelectorType.Descendant:
        case types_1.SelectorType.Parent:
        case types_1.SelectorType.Sibling:
        case types_1.SelectorType.ColumnCombinator:
          return true;
        default:
          return false;
      }
    }
    exports.isTraversal = isTraversal2;
    var stripQuotesFromPseudos = /* @__PURE__ */ new Set(["contains", "icontains"]);
    function funescape(_, escaped, escapedWhitespace) {
      var high = parseInt(escaped, 16) - 65536;
      return high !== high || escapedWhitespace ? escaped : high < 0 ? (
        // BMP codepoint
        String.fromCharCode(high + 65536)
      ) : (
        // Supplemental Plane codepoint (surrogate pair)
        String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320)
      );
    }
    function unescapeCSS(str) {
      return str.replace(reEscape, funescape);
    }
    function isQuote(c) {
      return c === 39 || c === 34;
    }
    function isWhitespace2(c) {
      return c === 32 || c === 9 || c === 10 || c === 12 || c === 13;
    }
    function parse6(selector) {
      var subselects2 = [];
      var endIndex = parseSelector(subselects2, "".concat(selector), 0);
      if (endIndex < selector.length) {
        throw new Error("Unmatched selector: ".concat(selector.slice(endIndex)));
      }
      return subselects2;
    }
    exports.parse = parse6;
    function parseSelector(subselects2, selector, selectorIndex) {
      var tokens = [];
      function getName3(offset) {
        var match = selector.slice(selectorIndex + offset).match(reName);
        if (!match) {
          throw new Error("Expected name, found ".concat(selector.slice(selectorIndex)));
        }
        var name = match[0];
        selectorIndex += offset + name.length;
        return unescapeCSS(name);
      }
      function stripWhitespace(offset) {
        selectorIndex += offset;
        while (selectorIndex < selector.length && isWhitespace2(selector.charCodeAt(selectorIndex))) {
          selectorIndex++;
        }
      }
      function readValueWithParenthesis() {
        selectorIndex += 1;
        var start = selectorIndex;
        var counter = 1;
        for (; counter > 0 && selectorIndex < selector.length; selectorIndex++) {
          if (selector.charCodeAt(selectorIndex) === 40 && !isEscaped(selectorIndex)) {
            counter++;
          } else if (selector.charCodeAt(selectorIndex) === 41 && !isEscaped(selectorIndex)) {
            counter--;
          }
        }
        if (counter) {
          throw new Error("Parenthesis not matched");
        }
        return unescapeCSS(selector.slice(start, selectorIndex - 1));
      }
      function isEscaped(pos) {
        var slashCount = 0;
        while (selector.charCodeAt(--pos) === 92)
          slashCount++;
        return (slashCount & 1) === 1;
      }
      function ensureNotTraversal() {
        if (tokens.length > 0 && isTraversal2(tokens[tokens.length - 1])) {
          throw new Error("Did not expect successive traversals.");
        }
      }
      function addTraversal(type) {
        if (tokens.length > 0 && tokens[tokens.length - 1].type === types_1.SelectorType.Descendant) {
          tokens[tokens.length - 1].type = type;
          return;
        }
        ensureNotTraversal();
        tokens.push({ type });
      }
      function addSpecialAttribute(name, action2) {
        tokens.push({
          type: types_1.SelectorType.Attribute,
          name,
          action: action2,
          value: getName3(1),
          namespace: null,
          ignoreCase: "quirks"
        });
      }
      function finalizeSubselector() {
        if (tokens.length && tokens[tokens.length - 1].type === types_1.SelectorType.Descendant) {
          tokens.pop();
        }
        if (tokens.length === 0) {
          throw new Error("Empty sub-selector");
        }
        subselects2.push(tokens);
      }
      stripWhitespace(0);
      if (selector.length === selectorIndex) {
        return selectorIndex;
      }
      loop:
        while (selectorIndex < selector.length) {
          var firstChar = selector.charCodeAt(selectorIndex);
          switch (firstChar) {
            case 32:
            case 9:
            case 10:
            case 12:
            case 13: {
              if (tokens.length === 0 || tokens[0].type !== types_1.SelectorType.Descendant) {
                ensureNotTraversal();
                tokens.push({ type: types_1.SelectorType.Descendant });
              }
              stripWhitespace(1);
              break;
            }
            case 62: {
              addTraversal(types_1.SelectorType.Child);
              stripWhitespace(1);
              break;
            }
            case 60: {
              addTraversal(types_1.SelectorType.Parent);
              stripWhitespace(1);
              break;
            }
            case 126: {
              addTraversal(types_1.SelectorType.Sibling);
              stripWhitespace(1);
              break;
            }
            case 43: {
              addTraversal(types_1.SelectorType.Adjacent);
              stripWhitespace(1);
              break;
            }
            case 46: {
              addSpecialAttribute("class", types_1.AttributeAction.Element);
              break;
            }
            case 35: {
              addSpecialAttribute("id", types_1.AttributeAction.Equals);
              break;
            }
            case 91: {
              stripWhitespace(1);
              var name_1 = void 0;
              var namespace = null;
              if (selector.charCodeAt(selectorIndex) === 124) {
                name_1 = getName3(1);
              } else if (selector.startsWith("*|", selectorIndex)) {
                namespace = "*";
                name_1 = getName3(2);
              } else {
                name_1 = getName3(0);
                if (selector.charCodeAt(selectorIndex) === 124 && selector.charCodeAt(selectorIndex + 1) !== 61) {
                  namespace = name_1;
                  name_1 = getName3(1);
                }
              }
              stripWhitespace(0);
              var action = types_1.AttributeAction.Exists;
              var possibleAction = actionTypes.get(selector.charCodeAt(selectorIndex));
              if (possibleAction) {
                action = possibleAction;
                if (selector.charCodeAt(selectorIndex + 1) !== 61) {
                  throw new Error("Expected `=`");
                }
                stripWhitespace(2);
              } else if (selector.charCodeAt(selectorIndex) === 61) {
                action = types_1.AttributeAction.Equals;
                stripWhitespace(1);
              }
              var value = "";
              var ignoreCase2 = null;
              if (action !== "exists") {
                if (isQuote(selector.charCodeAt(selectorIndex))) {
                  var quote = selector.charCodeAt(selectorIndex);
                  var sectionEnd = selectorIndex + 1;
                  while (sectionEnd < selector.length && (selector.charCodeAt(sectionEnd) !== quote || isEscaped(sectionEnd))) {
                    sectionEnd += 1;
                  }
                  if (selector.charCodeAt(sectionEnd) !== quote) {
                    throw new Error("Attribute value didn't end");
                  }
                  value = unescapeCSS(selector.slice(selectorIndex + 1, sectionEnd));
                  selectorIndex = sectionEnd + 1;
                } else {
                  var valueStart = selectorIndex;
                  while (selectorIndex < selector.length && (!isWhitespace2(selector.charCodeAt(selectorIndex)) && selector.charCodeAt(selectorIndex) !== 93 || isEscaped(selectorIndex))) {
                    selectorIndex += 1;
                  }
                  value = unescapeCSS(selector.slice(valueStart, selectorIndex));
                }
                stripWhitespace(0);
                var forceIgnore = selector.charCodeAt(selectorIndex) | 32;
                if (forceIgnore === 115) {
                  ignoreCase2 = false;
                  stripWhitespace(1);
                } else if (forceIgnore === 105) {
                  ignoreCase2 = true;
                  stripWhitespace(1);
                }
              }
              if (selector.charCodeAt(selectorIndex) !== 93) {
                throw new Error("Attribute selector didn't terminate");
              }
              selectorIndex += 1;
              var attributeSelector = {
                type: types_1.SelectorType.Attribute,
                name: name_1,
                action,
                value,
                namespace,
                ignoreCase: ignoreCase2
              };
              tokens.push(attributeSelector);
              break;
            }
            case 58: {
              if (selector.charCodeAt(selectorIndex + 1) === 58) {
                tokens.push({
                  type: types_1.SelectorType.PseudoElement,
                  name: getName3(2).toLowerCase(),
                  data: selector.charCodeAt(selectorIndex) === 40 ? readValueWithParenthesis() : null
                });
                continue;
              }
              var name_2 = getName3(1).toLowerCase();
              var data = null;
              if (selector.charCodeAt(selectorIndex) === 40) {
                if (unpackPseudos.has(name_2)) {
                  if (isQuote(selector.charCodeAt(selectorIndex + 1))) {
                    throw new Error("Pseudo-selector ".concat(name_2, " cannot be quoted"));
                  }
                  data = [];
                  selectorIndex = parseSelector(data, selector, selectorIndex + 1);
                  if (selector.charCodeAt(selectorIndex) !== 41) {
                    throw new Error("Missing closing parenthesis in :".concat(name_2, " (").concat(selector, ")"));
                  }
                  selectorIndex += 1;
                } else {
                  data = readValueWithParenthesis();
                  if (stripQuotesFromPseudos.has(name_2)) {
                    var quot = data.charCodeAt(0);
                    if (quot === data.charCodeAt(data.length - 1) && isQuote(quot)) {
                      data = data.slice(1, -1);
                    }
                  }
                  data = unescapeCSS(data);
                }
              }
              tokens.push({ type: types_1.SelectorType.Pseudo, name: name_2, data });
              break;
            }
            case 44: {
              finalizeSubselector();
              tokens = [];
              stripWhitespace(1);
              break;
            }
            default: {
              if (selector.startsWith("/*", selectorIndex)) {
                var endIndex = selector.indexOf("*/", selectorIndex + 2);
                if (endIndex < 0) {
                  throw new Error("Comment was not terminated");
                }
                selectorIndex = endIndex + 2;
                if (tokens.length === 0) {
                  stripWhitespace(0);
                }
                break;
              }
              var namespace = null;
              var name_3 = void 0;
              if (firstChar === 42) {
                selectorIndex += 1;
                name_3 = "*";
              } else if (firstChar === 124) {
                name_3 = "";
                if (selector.charCodeAt(selectorIndex + 1) === 124) {
                  addTraversal(types_1.SelectorType.ColumnCombinator);
                  stripWhitespace(2);
                  break;
                }
              } else if (reName.test(selector.slice(selectorIndex))) {
                name_3 = getName3(0);
              } else {
                break loop;
              }
              if (selector.charCodeAt(selectorIndex) === 124 && selector.charCodeAt(selectorIndex + 1) !== 124) {
                namespace = name_3;
                if (selector.charCodeAt(selectorIndex + 1) === 42) {
                  name_3 = "*";
                  selectorIndex += 2;
                } else {
                  name_3 = getName3(1);
                }
              }
              tokens.push(name_3 === "*" ? { type: types_1.SelectorType.Universal, namespace } : { type: types_1.SelectorType.Tag, name: name_3, namespace });
            }
          }
        }
      finalizeSubselector();
      return selectorIndex;
    }
  }
});

// node_modules/css-what/lib/commonjs/stringify.js
var require_stringify = __commonJS({
  "node_modules/css-what/lib/commonjs/stringify.js"(exports) {
    "use strict";
    var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stringify = void 0;
    var types_1 = require_types();
    var attribValChars = ["\\", '"'];
    var pseudoValChars = __spreadArray(__spreadArray([], attribValChars, true), ["(", ")"], false);
    var charsToEscapeInAttributeValue = new Set(attribValChars.map(function(c) {
      return c.charCodeAt(0);
    }));
    var charsToEscapeInPseudoValue = new Set(pseudoValChars.map(function(c) {
      return c.charCodeAt(0);
    }));
    var charsToEscapeInName = new Set(__spreadArray(__spreadArray([], pseudoValChars, true), [
      "~",
      "^",
      "$",
      "*",
      "+",
      "!",
      "|",
      ":",
      "[",
      "]",
      " ",
      "."
    ], false).map(function(c) {
      return c.charCodeAt(0);
    }));
    function stringify(selector) {
      return selector.map(function(token) {
        return token.map(stringifyToken).join("");
      }).join(", ");
    }
    exports.stringify = stringify;
    function stringifyToken(token, index, arr) {
      switch (token.type) {
        case types_1.SelectorType.Child:
          return index === 0 ? "> " : " > ";
        case types_1.SelectorType.Parent:
          return index === 0 ? "< " : " < ";
        case types_1.SelectorType.Sibling:
          return index === 0 ? "~ " : " ~ ";
        case types_1.SelectorType.Adjacent:
          return index === 0 ? "+ " : " + ";
        case types_1.SelectorType.Descendant:
          return " ";
        case types_1.SelectorType.ColumnCombinator:
          return index === 0 ? "|| " : " || ";
        case types_1.SelectorType.Universal:
          return token.namespace === "*" && index + 1 < arr.length && "name" in arr[index + 1] ? "" : "".concat(getNamespace(token.namespace), "*");
        case types_1.SelectorType.Tag:
          return getNamespacedName(token);
        case types_1.SelectorType.PseudoElement:
          return "::".concat(escapeName(token.name, charsToEscapeInName)).concat(token.data === null ? "" : "(".concat(escapeName(token.data, charsToEscapeInPseudoValue), ")"));
        case types_1.SelectorType.Pseudo:
          return ":".concat(escapeName(token.name, charsToEscapeInName)).concat(token.data === null ? "" : "(".concat(typeof token.data === "string" ? escapeName(token.data, charsToEscapeInPseudoValue) : stringify(token.data), ")"));
        case types_1.SelectorType.Attribute: {
          if (token.name === "id" && token.action === types_1.AttributeAction.Equals && token.ignoreCase === "quirks" && !token.namespace) {
            return "#".concat(escapeName(token.value, charsToEscapeInName));
          }
          if (token.name === "class" && token.action === types_1.AttributeAction.Element && token.ignoreCase === "quirks" && !token.namespace) {
            return ".".concat(escapeName(token.value, charsToEscapeInName));
          }
          var name_1 = getNamespacedName(token);
          if (token.action === types_1.AttributeAction.Exists) {
            return "[".concat(name_1, "]");
          }
          return "[".concat(name_1).concat(getActionValue(token.action), '="').concat(escapeName(token.value, charsToEscapeInAttributeValue), '"').concat(token.ignoreCase === null ? "" : token.ignoreCase ? " i" : " s", "]");
        }
      }
    }
    function getActionValue(action) {
      switch (action) {
        case types_1.AttributeAction.Equals:
          return "";
        case types_1.AttributeAction.Element:
          return "~";
        case types_1.AttributeAction.Start:
          return "^";
        case types_1.AttributeAction.End:
          return "$";
        case types_1.AttributeAction.Any:
          return "*";
        case types_1.AttributeAction.Not:
          return "!";
        case types_1.AttributeAction.Hyphen:
          return "|";
        case types_1.AttributeAction.Exists:
          throw new Error("Shouldn't be here");
      }
    }
    function getNamespacedName(token) {
      return "".concat(getNamespace(token.namespace)).concat(escapeName(token.name, charsToEscapeInName));
    }
    function getNamespace(namespace) {
      return namespace !== null ? "".concat(namespace === "*" ? "*" : escapeName(namespace, charsToEscapeInName), "|") : "";
    }
    function escapeName(str, charsToEscape) {
      var lastIdx = 0;
      var ret = "";
      for (var i = 0; i < str.length; i++) {
        if (charsToEscape.has(str.charCodeAt(i))) {
          ret += "".concat(str.slice(lastIdx, i), "\\").concat(str.charAt(i));
          lastIdx = i + 1;
        }
      }
      return ret.length > 0 ? ret + str.slice(lastIdx) : str;
    }
  }
});

// node_modules/css-what/lib/commonjs/index.js
var require_commonjs = __commonJS({
  "node_modules/css-what/lib/commonjs/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stringify = exports.parse = exports.isTraversal = void 0;
    __exportStar(require_types(), exports);
    var parse_1 = require_parse();
    Object.defineProperty(exports, "isTraversal", { enumerable: true, get: function() {
      return parse_1.isTraversal;
    } });
    Object.defineProperty(exports, "parse", { enumerable: true, get: function() {
      return parse_1.parse;
    } });
    var stringify_1 = require_stringify();
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return stringify_1.stringify;
    } });
  }
});

// node_modules/css-select/lib/esm/sort.js
function isTraversal(token) {
  return !procedure.has(token.type);
}
function sortByProcedure(arr) {
  const procs = arr.map(getProcedure);
  for (let i = 1; i < arr.length; i++) {
    const procNew = procs[i];
    if (procNew < 0)
      continue;
    for (let j = i - 1; j >= 0 && procNew < procs[j]; j--) {
      const token = arr[j + 1];
      arr[j + 1] = arr[j];
      arr[j] = token;
      procs[j + 1] = procs[j];
      procs[j] = procNew;
    }
  }
}
function getProcedure(token) {
  var _a2, _b;
  let proc = (_a2 = procedure.get(token.type)) !== null && _a2 !== void 0 ? _a2 : -1;
  if (token.type === import_css_what.SelectorType.Attribute) {
    proc = (_b = attributes.get(token.action)) !== null && _b !== void 0 ? _b : 4;
    if (token.action === import_css_what.AttributeAction.Equals && token.name === "id") {
      proc = 9;
    }
    if (token.ignoreCase) {
      proc >>= 1;
    }
  } else if (token.type === import_css_what.SelectorType.Pseudo) {
    if (!token.data) {
      proc = 3;
    } else if (token.name === "has" || token.name === "contains") {
      proc = 0;
    } else if (Array.isArray(token.data)) {
      proc = Math.min(...token.data.map((d) => Math.min(...d.map(getProcedure))));
      if (proc < 0) {
        proc = 0;
      }
    } else {
      proc = 2;
    }
  }
  return proc;
}
var import_css_what, procedure, attributes;
var init_sort = __esm({
  "node_modules/css-select/lib/esm/sort.js"() {
    import_css_what = __toESM(require_commonjs(), 1);
    procedure = /* @__PURE__ */ new Map([
      [import_css_what.SelectorType.Universal, 50],
      [import_css_what.SelectorType.Tag, 30],
      [import_css_what.SelectorType.Attribute, 1],
      [import_css_what.SelectorType.Pseudo, 0]
    ]);
    attributes = /* @__PURE__ */ new Map([
      [import_css_what.AttributeAction.Exists, 10],
      [import_css_what.AttributeAction.Equals, 8],
      [import_css_what.AttributeAction.Not, 7],
      [import_css_what.AttributeAction.Start, 6],
      [import_css_what.AttributeAction.End, 6],
      [import_css_what.AttributeAction.Any, 5]
    ]);
  }
});

// node_modules/css-select/lib/esm/attributes.js
function escapeRegex(value) {
  return value.replace(reChars, "\\$&");
}
function shouldIgnoreCase(selector, options) {
  return typeof selector.ignoreCase === "boolean" ? selector.ignoreCase : selector.ignoreCase === "quirks" ? !!options.quirksMode : !options.xmlMode && caseInsensitiveAttributes.has(selector.name);
}
var import_boolbase, reChars, caseInsensitiveAttributes, attributeRules;
var init_attributes2 = __esm({
  "node_modules/css-select/lib/esm/attributes.js"() {
    import_boolbase = __toESM(require_boolbase(), 1);
    reChars = /[-[\]{}()*+?.,\\^$|#\s]/g;
    caseInsensitiveAttributes = /* @__PURE__ */ new Set([
      "accept",
      "accept-charset",
      "align",
      "alink",
      "axis",
      "bgcolor",
      "charset",
      "checked",
      "clear",
      "codetype",
      "color",
      "compact",
      "declare",
      "defer",
      "dir",
      "direction",
      "disabled",
      "enctype",
      "face",
      "frame",
      "hreflang",
      "http-equiv",
      "lang",
      "language",
      "link",
      "media",
      "method",
      "multiple",
      "nohref",
      "noresize",
      "noshade",
      "nowrap",
      "readonly",
      "rel",
      "rev",
      "rules",
      "scope",
      "scrolling",
      "selected",
      "shape",
      "target",
      "text",
      "type",
      "valign",
      "valuetype",
      "vlink"
    ]);
    attributeRules = {
      equals(next, data, options) {
        const { adapter: adapter2 } = options;
        const { name } = data;
        let { value } = data;
        if (shouldIgnoreCase(data, options)) {
          value = value.toLowerCase();
          return (elem) => {
            const attr = adapter2.getAttributeValue(elem, name);
            return attr != null && attr.length === value.length && attr.toLowerCase() === value && next(elem);
          };
        }
        return (elem) => adapter2.getAttributeValue(elem, name) === value && next(elem);
      },
      hyphen(next, data, options) {
        const { adapter: adapter2 } = options;
        const { name } = data;
        let { value } = data;
        const len = value.length;
        if (shouldIgnoreCase(data, options)) {
          value = value.toLowerCase();
          return function hyphenIC(elem) {
            const attr = adapter2.getAttributeValue(elem, name);
            return attr != null && (attr.length === len || attr.charAt(len) === "-") && attr.substr(0, len).toLowerCase() === value && next(elem);
          };
        }
        return function hyphen(elem) {
          const attr = adapter2.getAttributeValue(elem, name);
          return attr != null && (attr.length === len || attr.charAt(len) === "-") && attr.substr(0, len) === value && next(elem);
        };
      },
      element(next, data, options) {
        const { adapter: adapter2 } = options;
        const { name, value } = data;
        if (/\s/.test(value)) {
          return import_boolbase.default.falseFunc;
        }
        const regex = new RegExp(`(?:^|\\s)${escapeRegex(value)}(?:$|\\s)`, shouldIgnoreCase(data, options) ? "i" : "");
        return function element(elem) {
          const attr = adapter2.getAttributeValue(elem, name);
          return attr != null && attr.length >= value.length && regex.test(attr) && next(elem);
        };
      },
      exists(next, { name }, { adapter: adapter2 }) {
        return (elem) => adapter2.hasAttrib(elem, name) && next(elem);
      },
      start(next, data, options) {
        const { adapter: adapter2 } = options;
        const { name } = data;
        let { value } = data;
        const len = value.length;
        if (len === 0) {
          return import_boolbase.default.falseFunc;
        }
        if (shouldIgnoreCase(data, options)) {
          value = value.toLowerCase();
          return (elem) => {
            const attr = adapter2.getAttributeValue(elem, name);
            return attr != null && attr.length >= len && attr.substr(0, len).toLowerCase() === value && next(elem);
          };
        }
        return (elem) => {
          var _a2;
          return !!((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.startsWith(value)) && next(elem);
        };
      },
      end(next, data, options) {
        const { adapter: adapter2 } = options;
        const { name } = data;
        let { value } = data;
        const len = -value.length;
        if (len === 0) {
          return import_boolbase.default.falseFunc;
        }
        if (shouldIgnoreCase(data, options)) {
          value = value.toLowerCase();
          return (elem) => {
            var _a2;
            return ((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.substr(len).toLowerCase()) === value && next(elem);
          };
        }
        return (elem) => {
          var _a2;
          return !!((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.endsWith(value)) && next(elem);
        };
      },
      any(next, data, options) {
        const { adapter: adapter2 } = options;
        const { name, value } = data;
        if (value === "") {
          return import_boolbase.default.falseFunc;
        }
        if (shouldIgnoreCase(data, options)) {
          const regex = new RegExp(escapeRegex(value), "i");
          return function anyIC(elem) {
            const attr = adapter2.getAttributeValue(elem, name);
            return attr != null && attr.length >= value.length && regex.test(attr) && next(elem);
          };
        }
        return (elem) => {
          var _a2;
          return !!((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.includes(value)) && next(elem);
        };
      },
      not(next, data, options) {
        const { adapter: adapter2 } = options;
        const { name } = data;
        let { value } = data;
        if (value === "") {
          return (elem) => !!adapter2.getAttributeValue(elem, name) && next(elem);
        } else if (shouldIgnoreCase(data, options)) {
          value = value.toLowerCase();
          return (elem) => {
            const attr = adapter2.getAttributeValue(elem, name);
            return (attr == null || attr.length !== value.length || attr.toLowerCase() !== value) && next(elem);
          };
        }
        return (elem) => adapter2.getAttributeValue(elem, name) !== value && next(elem);
      }
    };
  }
});

// node_modules/nth-check/lib/esm/parse.js
function parse(formula) {
  formula = formula.trim().toLowerCase();
  if (formula === "even") {
    return [2, 0];
  } else if (formula === "odd") {
    return [2, 1];
  }
  let idx = 0;
  let a = 0;
  let sign = readSign();
  let number = readNumber();
  if (idx < formula.length && formula.charAt(idx) === "n") {
    idx++;
    a = sign * (number !== null && number !== void 0 ? number : 1);
    skipWhitespace();
    if (idx < formula.length) {
      sign = readSign();
      skipWhitespace();
      number = readNumber();
    } else {
      sign = number = 0;
    }
  }
  if (number === null || idx < formula.length) {
    throw new Error(`n-th rule couldn't be parsed ('${formula}')`);
  }
  return [a, sign * number];
  function readSign() {
    if (formula.charAt(idx) === "-") {
      idx++;
      return -1;
    }
    if (formula.charAt(idx) === "+") {
      idx++;
    }
    return 1;
  }
  function readNumber() {
    const start = idx;
    let value = 0;
    while (idx < formula.length && formula.charCodeAt(idx) >= ZERO && formula.charCodeAt(idx) <= NINE) {
      value = value * 10 + (formula.charCodeAt(idx) - ZERO);
      idx++;
    }
    return idx === start ? null : value;
  }
  function skipWhitespace() {
    while (idx < formula.length && whitespace.has(formula.charCodeAt(idx))) {
      idx++;
    }
  }
}
var whitespace, ZERO, NINE;
var init_parse = __esm({
  "node_modules/nth-check/lib/esm/parse.js"() {
    whitespace = /* @__PURE__ */ new Set([9, 10, 12, 13, 32]);
    ZERO = "0".charCodeAt(0);
    NINE = "9".charCodeAt(0);
  }
});

// node_modules/nth-check/lib/esm/compile.js
function compile(parsed) {
  const a = parsed[0];
  const b = parsed[1] - 1;
  if (b < 0 && a <= 0)
    return import_boolbase2.default.falseFunc;
  if (a === -1)
    return (index) => index <= b;
  if (a === 0)
    return (index) => index === b;
  if (a === 1)
    return b < 0 ? import_boolbase2.default.trueFunc : (index) => index >= b;
  const absA = Math.abs(a);
  const bMod = (b % absA + absA) % absA;
  return a > 1 ? (index) => index >= b && index % absA === bMod : (index) => index <= b && index % absA === bMod;
}
var import_boolbase2;
var init_compile = __esm({
  "node_modules/nth-check/lib/esm/compile.js"() {
    import_boolbase2 = __toESM(require_boolbase(), 1);
  }
});

// node_modules/nth-check/lib/esm/index.js
function nthCheck(formula) {
  return compile(parse(formula));
}
var init_esm7 = __esm({
  "node_modules/nth-check/lib/esm/index.js"() {
    init_parse();
    init_compile();
  }
});

// node_modules/css-select/lib/esm/pseudo-selectors/filters.js
function getChildFunc(next, adapter2) {
  return (elem) => {
    const parent = adapter2.getParent(elem);
    return parent != null && adapter2.isTag(parent) && next(elem);
  };
}
function dynamicStatePseudo(name) {
  return function dynamicPseudo(next, _rule, { adapter: adapter2 }) {
    const func = adapter2[name];
    if (typeof func !== "function") {
      return import_boolbase3.default.falseFunc;
    }
    return function active(elem) {
      return func(elem) && next(elem);
    };
  };
}
var import_boolbase3, filters;
var init_filters = __esm({
  "node_modules/css-select/lib/esm/pseudo-selectors/filters.js"() {
    init_esm7();
    import_boolbase3 = __toESM(require_boolbase(), 1);
    filters = {
      contains(next, text, { adapter: adapter2 }) {
        return function contains(elem) {
          return next(elem) && adapter2.getText(elem).includes(text);
        };
      },
      icontains(next, text, { adapter: adapter2 }) {
        const itext = text.toLowerCase();
        return function icontains(elem) {
          return next(elem) && adapter2.getText(elem).toLowerCase().includes(itext);
        };
      },
      // Location specific methods
      "nth-child"(next, rule, { adapter: adapter2, equals }) {
        const func = nthCheck(rule);
        if (func === import_boolbase3.default.falseFunc)
          return import_boolbase3.default.falseFunc;
        if (func === import_boolbase3.default.trueFunc)
          return getChildFunc(next, adapter2);
        return function nthChild(elem) {
          const siblings = adapter2.getSiblings(elem);
          let pos = 0;
          for (let i = 0; i < siblings.length; i++) {
            if (equals(elem, siblings[i]))
              break;
            if (adapter2.isTag(siblings[i])) {
              pos++;
            }
          }
          return func(pos) && next(elem);
        };
      },
      "nth-last-child"(next, rule, { adapter: adapter2, equals }) {
        const func = nthCheck(rule);
        if (func === import_boolbase3.default.falseFunc)
          return import_boolbase3.default.falseFunc;
        if (func === import_boolbase3.default.trueFunc)
          return getChildFunc(next, adapter2);
        return function nthLastChild(elem) {
          const siblings = adapter2.getSiblings(elem);
          let pos = 0;
          for (let i = siblings.length - 1; i >= 0; i--) {
            if (equals(elem, siblings[i]))
              break;
            if (adapter2.isTag(siblings[i])) {
              pos++;
            }
          }
          return func(pos) && next(elem);
        };
      },
      "nth-of-type"(next, rule, { adapter: adapter2, equals }) {
        const func = nthCheck(rule);
        if (func === import_boolbase3.default.falseFunc)
          return import_boolbase3.default.falseFunc;
        if (func === import_boolbase3.default.trueFunc)
          return getChildFunc(next, adapter2);
        return function nthOfType(elem) {
          const siblings = adapter2.getSiblings(elem);
          let pos = 0;
          for (let i = 0; i < siblings.length; i++) {
            const currentSibling = siblings[i];
            if (equals(elem, currentSibling))
              break;
            if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === adapter2.getName(elem)) {
              pos++;
            }
          }
          return func(pos) && next(elem);
        };
      },
      "nth-last-of-type"(next, rule, { adapter: adapter2, equals }) {
        const func = nthCheck(rule);
        if (func === import_boolbase3.default.falseFunc)
          return import_boolbase3.default.falseFunc;
        if (func === import_boolbase3.default.trueFunc)
          return getChildFunc(next, adapter2);
        return function nthLastOfType(elem) {
          const siblings = adapter2.getSiblings(elem);
          let pos = 0;
          for (let i = siblings.length - 1; i >= 0; i--) {
            const currentSibling = siblings[i];
            if (equals(elem, currentSibling))
              break;
            if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === adapter2.getName(elem)) {
              pos++;
            }
          }
          return func(pos) && next(elem);
        };
      },
      // TODO determine the actual root element
      root(next, _rule, { adapter: adapter2 }) {
        return (elem) => {
          const parent = adapter2.getParent(elem);
          return (parent == null || !adapter2.isTag(parent)) && next(elem);
        };
      },
      scope(next, rule, options, context) {
        const { equals } = options;
        if (!context || context.length === 0) {
          return filters["root"](next, rule, options);
        }
        if (context.length === 1) {
          return (elem) => equals(context[0], elem) && next(elem);
        }
        return (elem) => context.includes(elem) && next(elem);
      },
      hover: dynamicStatePseudo("isHovered"),
      visited: dynamicStatePseudo("isVisited"),
      active: dynamicStatePseudo("isActive")
    };
  }
});

// node_modules/css-select/lib/esm/pseudo-selectors/pseudos.js
function verifyPseudoArgs(func, name, subselect, argIndex) {
  if (subselect === null) {
    if (func.length > argIndex) {
      throw new Error(`Pseudo-class :${name} requires an argument`);
    }
  } else if (func.length === argIndex) {
    throw new Error(`Pseudo-class :${name} doesn't have any arguments`);
  }
}
var pseudos;
var init_pseudos = __esm({
  "node_modules/css-select/lib/esm/pseudo-selectors/pseudos.js"() {
    pseudos = {
      empty(elem, { adapter: adapter2 }) {
        return !adapter2.getChildren(elem).some((elem2) => (
          // FIXME: `getText` call is potentially expensive.
          adapter2.isTag(elem2) || adapter2.getText(elem2) !== ""
        ));
      },
      "first-child"(elem, { adapter: adapter2, equals }) {
        if (adapter2.prevElementSibling) {
          return adapter2.prevElementSibling(elem) == null;
        }
        const firstChild = adapter2.getSiblings(elem).find((elem2) => adapter2.isTag(elem2));
        return firstChild != null && equals(elem, firstChild);
      },
      "last-child"(elem, { adapter: adapter2, equals }) {
        const siblings = adapter2.getSiblings(elem);
        for (let i = siblings.length - 1; i >= 0; i--) {
          if (equals(elem, siblings[i]))
            return true;
          if (adapter2.isTag(siblings[i]))
            break;
        }
        return false;
      },
      "first-of-type"(elem, { adapter: adapter2, equals }) {
        const siblings = adapter2.getSiblings(elem);
        const elemName = adapter2.getName(elem);
        for (let i = 0; i < siblings.length; i++) {
          const currentSibling = siblings[i];
          if (equals(elem, currentSibling))
            return true;
          if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === elemName) {
            break;
          }
        }
        return false;
      },
      "last-of-type"(elem, { adapter: adapter2, equals }) {
        const siblings = adapter2.getSiblings(elem);
        const elemName = adapter2.getName(elem);
        for (let i = siblings.length - 1; i >= 0; i--) {
          const currentSibling = siblings[i];
          if (equals(elem, currentSibling))
            return true;
          if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === elemName) {
            break;
          }
        }
        return false;
      },
      "only-of-type"(elem, { adapter: adapter2, equals }) {
        const elemName = adapter2.getName(elem);
        return adapter2.getSiblings(elem).every((sibling) => equals(elem, sibling) || !adapter2.isTag(sibling) || adapter2.getName(sibling) !== elemName);
      },
      "only-child"(elem, { adapter: adapter2, equals }) {
        return adapter2.getSiblings(elem).every((sibling) => equals(elem, sibling) || !adapter2.isTag(sibling));
      }
    };
  }
});

// node_modules/css-select/lib/esm/pseudo-selectors/aliases.js
var aliases;
var init_aliases = __esm({
  "node_modules/css-select/lib/esm/pseudo-selectors/aliases.js"() {
    aliases = {
      // Links
      "any-link": ":is(a, area, link)[href]",
      link: ":any-link:not(:visited)",
      // Forms
      // https://html.spec.whatwg.org/multipage/scripting.html#disabled-elements
      disabled: `:is(
        :is(button, input, select, textarea, optgroup, option)[disabled],
        optgroup[disabled] > option,
        fieldset[disabled]:not(fieldset[disabled] legend:first-of-type *)
    )`,
      enabled: ":not(:disabled)",
      checked: ":is(:is(input[type=radio], input[type=checkbox])[checked], option:selected)",
      required: ":is(input, select, textarea)[required]",
      optional: ":is(input, select, textarea):not([required])",
      // JQuery extensions
      // https://html.spec.whatwg.org/multipage/form-elements.html#concept-option-selectedness
      selected: "option:is([selected], select:not([multiple]):not(:has(> option[selected])) > :first-of-type)",
      checkbox: "[type=checkbox]",
      file: "[type=file]",
      password: "[type=password]",
      radio: "[type=radio]",
      reset: "[type=reset]",
      image: "[type=image]",
      submit: "[type=submit]",
      parent: ":not(:empty)",
      header: ":is(h1, h2, h3, h4, h5, h6)",
      button: ":is(button, input[type=button])",
      input: ":is(input, textarea, select, button)",
      text: "input:is(:not([type!='']), [type=text])"
    };
  }
});

// node_modules/css-select/lib/esm/pseudo-selectors/subselects.js
function ensureIsTag(next, adapter2) {
  if (next === import_boolbase4.default.falseFunc)
    return import_boolbase4.default.falseFunc;
  return (elem) => adapter2.isTag(elem) && next(elem);
}
function getNextSiblings(elem, adapter2) {
  const siblings = adapter2.getSiblings(elem);
  if (siblings.length <= 1)
    return [];
  const elemIndex = siblings.indexOf(elem);
  if (elemIndex < 0 || elemIndex === siblings.length - 1)
    return [];
  return siblings.slice(elemIndex + 1).filter(adapter2.isTag);
}
function copyOptions(options) {
  return {
    xmlMode: !!options.xmlMode,
    lowerCaseAttributeNames: !!options.lowerCaseAttributeNames,
    lowerCaseTags: !!options.lowerCaseTags,
    quirksMode: !!options.quirksMode,
    cacheResults: !!options.cacheResults,
    pseudos: options.pseudos,
    adapter: options.adapter,
    equals: options.equals
  };
}
var import_boolbase4, PLACEHOLDER_ELEMENT, is, subselects;
var init_subselects = __esm({
  "node_modules/css-select/lib/esm/pseudo-selectors/subselects.js"() {
    import_boolbase4 = __toESM(require_boolbase(), 1);
    init_sort();
    PLACEHOLDER_ELEMENT = {};
    is = (next, token, options, context, compileToken2) => {
      const func = compileToken2(token, copyOptions(options), context);
      return func === import_boolbase4.default.trueFunc ? next : func === import_boolbase4.default.falseFunc ? import_boolbase4.default.falseFunc : (elem) => func(elem) && next(elem);
    };
    subselects = {
      is,
      /**
       * `:matches` and `:where` are aliases for `:is`.
       */
      matches: is,
      where: is,
      not(next, token, options, context, compileToken2) {
        const func = compileToken2(token, copyOptions(options), context);
        return func === import_boolbase4.default.falseFunc ? next : func === import_boolbase4.default.trueFunc ? import_boolbase4.default.falseFunc : (elem) => !func(elem) && next(elem);
      },
      has(next, subselect, options, _context, compileToken2) {
        const { adapter: adapter2 } = options;
        const opts = copyOptions(options);
        opts.relativeSelector = true;
        const context = subselect.some((s) => s.some(isTraversal)) ? (
          // Used as a placeholder. Will be replaced with the actual element.
          [PLACEHOLDER_ELEMENT]
        ) : void 0;
        const compiled = compileToken2(subselect, opts, context);
        if (compiled === import_boolbase4.default.falseFunc)
          return import_boolbase4.default.falseFunc;
        const hasElement = ensureIsTag(compiled, adapter2);
        if (context && compiled !== import_boolbase4.default.trueFunc) {
          const { shouldTestNextSiblings = false } = compiled;
          return (elem) => {
            if (!next(elem))
              return false;
            context[0] = elem;
            const childs = adapter2.getChildren(elem);
            const nextElements = shouldTestNextSiblings ? [...childs, ...getNextSiblings(elem, adapter2)] : childs;
            return adapter2.existsOne(hasElement, nextElements);
          };
        }
        return (elem) => next(elem) && adapter2.existsOne(hasElement, adapter2.getChildren(elem));
      }
    };
  }
});

// node_modules/css-select/lib/esm/pseudo-selectors/index.js
function compilePseudoSelector(next, selector, options, context, compileToken2) {
  var _a2;
  const { name, data } = selector;
  if (Array.isArray(data)) {
    if (!(name in subselects)) {
      throw new Error(`Unknown pseudo-class :${name}(${data})`);
    }
    return subselects[name](next, data, options, context, compileToken2);
  }
  const userPseudo = (_a2 = options.pseudos) === null || _a2 === void 0 ? void 0 : _a2[name];
  const stringPseudo = typeof userPseudo === "string" ? userPseudo : aliases[name];
  if (typeof stringPseudo === "string") {
    if (data != null) {
      throw new Error(`Pseudo ${name} doesn't have any arguments`);
    }
    const alias = (0, import_css_what2.parse)(stringPseudo);
    return subselects["is"](next, alias, options, context, compileToken2);
  }
  if (typeof userPseudo === "function") {
    verifyPseudoArgs(userPseudo, name, data, 1);
    return (elem) => userPseudo(elem, data) && next(elem);
  }
  if (name in filters) {
    return filters[name](next, data, options, context);
  }
  if (name in pseudos) {
    const pseudo = pseudos[name];
    verifyPseudoArgs(pseudo, name, data, 2);
    return (elem) => pseudo(elem, options, data) && next(elem);
  }
  throw new Error(`Unknown pseudo-class :${name}`);
}
var import_css_what2;
var init_pseudo_selectors = __esm({
  "node_modules/css-select/lib/esm/pseudo-selectors/index.js"() {
    import_css_what2 = __toESM(require_commonjs(), 1);
    init_filters();
    init_pseudos();
    init_aliases();
    init_subselects();
  }
});

// node_modules/css-select/lib/esm/general.js
function getElementParent(node, adapter2) {
  const parent = adapter2.getParent(node);
  if (parent && adapter2.isTag(parent)) {
    return parent;
  }
  return null;
}
function compileGeneralSelector(next, selector, options, context, compileToken2) {
  const { adapter: adapter2, equals } = options;
  switch (selector.type) {
    case import_css_what3.SelectorType.PseudoElement: {
      throw new Error("Pseudo-elements are not supported by css-select");
    }
    case import_css_what3.SelectorType.ColumnCombinator: {
      throw new Error("Column combinators are not yet supported by css-select");
    }
    case import_css_what3.SelectorType.Attribute: {
      if (selector.namespace != null) {
        throw new Error("Namespaced attributes are not yet supported by css-select");
      }
      if (!options.xmlMode || options.lowerCaseAttributeNames) {
        selector.name = selector.name.toLowerCase();
      }
      return attributeRules[selector.action](next, selector, options);
    }
    case import_css_what3.SelectorType.Pseudo: {
      return compilePseudoSelector(next, selector, options, context, compileToken2);
    }
    case import_css_what3.SelectorType.Tag: {
      if (selector.namespace != null) {
        throw new Error("Namespaced tag names are not yet supported by css-select");
      }
      let { name } = selector;
      if (!options.xmlMode || options.lowerCaseTags) {
        name = name.toLowerCase();
      }
      return function tag(elem) {
        return adapter2.getName(elem) === name && next(elem);
      };
    }
    case import_css_what3.SelectorType.Descendant: {
      if (options.cacheResults === false || typeof WeakSet === "undefined") {
        return function descendant(elem) {
          let current = elem;
          while (current = getElementParent(current, adapter2)) {
            if (next(current)) {
              return true;
            }
          }
          return false;
        };
      }
      const isFalseCache = /* @__PURE__ */ new WeakSet();
      return function cachedDescendant(elem) {
        let current = elem;
        while (current = getElementParent(current, adapter2)) {
          if (!isFalseCache.has(current)) {
            if (adapter2.isTag(current) && next(current)) {
              return true;
            }
            isFalseCache.add(current);
          }
        }
        return false;
      };
    }
    case "_flexibleDescendant": {
      return function flexibleDescendant(elem) {
        let current = elem;
        do {
          if (next(current))
            return true;
        } while (current = getElementParent(current, adapter2));
        return false;
      };
    }
    case import_css_what3.SelectorType.Parent: {
      return function parent(elem) {
        return adapter2.getChildren(elem).some((elem2) => adapter2.isTag(elem2) && next(elem2));
      };
    }
    case import_css_what3.SelectorType.Child: {
      return function child(elem) {
        const parent = adapter2.getParent(elem);
        return parent != null && adapter2.isTag(parent) && next(parent);
      };
    }
    case import_css_what3.SelectorType.Sibling: {
      return function sibling(elem) {
        const siblings = adapter2.getSiblings(elem);
        for (let i = 0; i < siblings.length; i++) {
          const currentSibling = siblings[i];
          if (equals(elem, currentSibling))
            break;
          if (adapter2.isTag(currentSibling) && next(currentSibling)) {
            return true;
          }
        }
        return false;
      };
    }
    case import_css_what3.SelectorType.Adjacent: {
      if (adapter2.prevElementSibling) {
        return function adjacent(elem) {
          const previous = adapter2.prevElementSibling(elem);
          return previous != null && next(previous);
        };
      }
      return function adjacent(elem) {
        const siblings = adapter2.getSiblings(elem);
        let lastElement;
        for (let i = 0; i < siblings.length; i++) {
          const currentSibling = siblings[i];
          if (equals(elem, currentSibling))
            break;
          if (adapter2.isTag(currentSibling)) {
            lastElement = currentSibling;
          }
        }
        return !!lastElement && next(lastElement);
      };
    }
    case import_css_what3.SelectorType.Universal: {
      if (selector.namespace != null && selector.namespace !== "*") {
        throw new Error("Namespaced universal selectors are not yet supported by css-select");
      }
      return next;
    }
  }
}
var import_css_what3;
var init_general = __esm({
  "node_modules/css-select/lib/esm/general.js"() {
    init_attributes2();
    init_pseudo_selectors();
    import_css_what3 = __toESM(require_commonjs(), 1);
  }
});

// node_modules/css-select/lib/esm/compile.js
function compile2(selector, options, context) {
  const next = compileUnsafe(selector, options, context);
  return ensureIsTag(next, options.adapter);
}
function compileUnsafe(selector, options, context) {
  const token = typeof selector === "string" ? (0, import_css_what4.parse)(selector) : selector;
  return compileToken(token, options, context);
}
function includesScopePseudo(t) {
  return t.type === import_css_what4.SelectorType.Pseudo && (t.name === "scope" || Array.isArray(t.data) && t.data.some((data) => data.some(includesScopePseudo)));
}
function absolutize(token, { adapter: adapter2 }, context) {
  const hasContext = !!(context === null || context === void 0 ? void 0 : context.every((e) => {
    const parent = adapter2.isTag(e) && adapter2.getParent(e);
    return e === PLACEHOLDER_ELEMENT || parent && adapter2.isTag(parent);
  }));
  for (const t of token) {
    if (t.length > 0 && isTraversal(t[0]) && t[0].type !== import_css_what4.SelectorType.Descendant) {
    } else if (hasContext && !t.some(includesScopePseudo)) {
      t.unshift(DESCENDANT_TOKEN);
    } else {
      continue;
    }
    t.unshift(SCOPE_TOKEN);
  }
}
function compileToken(token, options, context) {
  var _a2;
  token.forEach(sortByProcedure);
  context = (_a2 = options.context) !== null && _a2 !== void 0 ? _a2 : context;
  const isArrayContext = Array.isArray(context);
  const finalContext = context && (Array.isArray(context) ? context : [context]);
  if (options.relativeSelector !== false) {
    absolutize(token, options, finalContext);
  } else if (token.some((t) => t.length > 0 && isTraversal(t[0]))) {
    throw new Error("Relative selectors are not allowed when the `relativeSelector` option is disabled");
  }
  let shouldTestNextSiblings = false;
  const query2 = token.map((rules) => {
    if (rules.length >= 2) {
      const [first, second] = rules;
      if (first.type !== import_css_what4.SelectorType.Pseudo || first.name !== "scope") {
      } else if (isArrayContext && second.type === import_css_what4.SelectorType.Descendant) {
        rules[1] = FLEXIBLE_DESCENDANT_TOKEN;
      } else if (second.type === import_css_what4.SelectorType.Adjacent || second.type === import_css_what4.SelectorType.Sibling) {
        shouldTestNextSiblings = true;
      }
    }
    return compileRules(rules, options, finalContext);
  }).reduce(reduceRules, import_boolbase5.default.falseFunc);
  query2.shouldTestNextSiblings = shouldTestNextSiblings;
  return query2;
}
function compileRules(rules, options, context) {
  var _a2;
  return rules.reduce((previous, rule) => previous === import_boolbase5.default.falseFunc ? import_boolbase5.default.falseFunc : compileGeneralSelector(previous, rule, options, context, compileToken), (_a2 = options.rootFunc) !== null && _a2 !== void 0 ? _a2 : import_boolbase5.default.trueFunc);
}
function reduceRules(a, b) {
  if (b === import_boolbase5.default.falseFunc || a === import_boolbase5.default.trueFunc) {
    return a;
  }
  if (a === import_boolbase5.default.falseFunc || b === import_boolbase5.default.trueFunc) {
    return b;
  }
  return function combine(elem) {
    return a(elem) || b(elem);
  };
}
var import_css_what4, import_boolbase5, DESCENDANT_TOKEN, FLEXIBLE_DESCENDANT_TOKEN, SCOPE_TOKEN;
var init_compile2 = __esm({
  "node_modules/css-select/lib/esm/compile.js"() {
    import_css_what4 = __toESM(require_commonjs(), 1);
    import_boolbase5 = __toESM(require_boolbase(), 1);
    init_sort();
    init_general();
    init_subselects();
    DESCENDANT_TOKEN = { type: import_css_what4.SelectorType.Descendant };
    FLEXIBLE_DESCENDANT_TOKEN = {
      type: "_flexibleDescendant"
    };
    SCOPE_TOKEN = {
      type: import_css_what4.SelectorType.Pseudo,
      name: "scope",
      data: null
    };
  }
});

// node_modules/css-select/lib/esm/index.js
function convertOptionFormats(options) {
  var _a2, _b, _c, _d;
  const opts = options !== null && options !== void 0 ? options : defaultOptions;
  (_a2 = opts.adapter) !== null && _a2 !== void 0 ? _a2 : opts.adapter = esm_exports2;
  (_b = opts.equals) !== null && _b !== void 0 ? _b : opts.equals = (_d = (_c = opts.adapter) === null || _c === void 0 ? void 0 : _c.equals) !== null && _d !== void 0 ? _d : defaultEquals;
  return opts;
}
function wrapCompile(func) {
  return function addAdapter(selector, options, context) {
    const opts = convertOptionFormats(options);
    return func(selector, opts, context);
  };
}
function getSelectorFunc(searchFunc) {
  return function select(query2, elements, options) {
    const opts = convertOptionFormats(options);
    if (typeof query2 !== "function") {
      query2 = compileUnsafe(query2, opts, elements);
    }
    const filteredElements = prepareContext(elements, opts.adapter, query2.shouldTestNextSiblings);
    return searchFunc(query2, filteredElements, opts);
  };
}
function prepareContext(elems, adapter2, shouldTestNextSiblings = false) {
  if (shouldTestNextSiblings) {
    elems = appendNextSiblings(elems, adapter2);
  }
  return Array.isArray(elems) ? adapter2.removeSubsets(elems) : adapter2.getChildren(elems);
}
function appendNextSiblings(elem, adapter2) {
  const elems = Array.isArray(elem) ? elem.slice(0) : [elem];
  const elemsLength = elems.length;
  for (let i = 0; i < elemsLength; i++) {
    const nextSiblings = getNextSiblings(elems[i], adapter2);
    elems.push(...nextSiblings);
  }
  return elems;
}
function is2(elem, query2, options) {
  const opts = convertOptionFormats(options);
  return (typeof query2 === "function" ? query2 : compile2(query2, opts))(elem);
}
var import_boolbase6, defaultEquals, defaultOptions, compile3, _compileUnsafe, _compileToken, selectAll, selectOne;
var init_esm8 = __esm({
  "node_modules/css-select/lib/esm/index.js"() {
    init_esm5();
    import_boolbase6 = __toESM(require_boolbase(), 1);
    init_compile2();
    init_subselects();
    init_pseudo_selectors();
    defaultEquals = (a, b) => a === b;
    defaultOptions = {
      adapter: esm_exports2,
      equals: defaultEquals
    };
    compile3 = wrapCompile(compile2);
    _compileUnsafe = wrapCompile(compileUnsafe);
    _compileToken = wrapCompile(compileToken);
    selectAll = getSelectorFunc((query2, elems, options) => query2 === import_boolbase6.default.falseFunc || !elems || elems.length === 0 ? [] : options.adapter.findAll(query2, elems));
    selectOne = getSelectorFunc((query2, elems, options) => query2 === import_boolbase6.default.falseFunc || !elems || elems.length === 0 ? null : options.adapter.findOne(query2, elems));
  }
});

// node_modules/linkedom/esm/shared/matches.js
var isArray, isTag3, existsOne2, getAttributeValue2, getChildren2, getName2, getParent2, getSiblings2, getText2, hasAttrib2, removeSubsets2, findAll2, findOne2, adapter, prepareMatch, matches;
var init_matches = __esm({
  "node_modules/linkedom/esm/shared/matches.js"() {
    init_esm8();
    init_constants();
    init_utils();
    ({ isArray } = Array);
    isTag3 = ({ nodeType }) => nodeType === ELEMENT_NODE;
    existsOne2 = (test, elements) => elements.some(
      (element) => isTag3(element) && (test(element) || existsOne2(test, getChildren2(element)))
    );
    getAttributeValue2 = (element, name) => name === "class" ? element.classList.value : element.getAttribute(name);
    getChildren2 = ({ childNodes }) => childNodes;
    getName2 = (element) => {
      const { localName } = element;
      return ignoreCase(element) ? localName.toLowerCase() : localName;
    };
    getParent2 = ({ parentNode }) => parentNode;
    getSiblings2 = (element) => {
      const { parentNode } = element;
      return parentNode ? getChildren2(parentNode) : element;
    };
    getText2 = (node) => {
      if (isArray(node))
        return node.map(getText2).join("");
      if (isTag3(node))
        return getText2(getChildren2(node));
      if (node.nodeType === TEXT_NODE)
        return node.data;
      return "";
    };
    hasAttrib2 = (element, name) => element.hasAttribute(name);
    removeSubsets2 = (nodes) => {
      let { length } = nodes;
      while (length--) {
        const node = nodes[length];
        if (length && -1 < nodes.lastIndexOf(node, length - 1)) {
          nodes.splice(length, 1);
          continue;
        }
        for (let { parentNode } = node; parentNode; parentNode = parentNode.parentNode) {
          if (nodes.includes(parentNode)) {
            nodes.splice(length, 1);
            break;
          }
        }
      }
      return nodes;
    };
    findAll2 = (test, nodes) => {
      const matches2 = [];
      for (const node of nodes) {
        if (isTag3(node)) {
          if (test(node))
            matches2.push(node);
          matches2.push(...findAll2(test, getChildren2(node)));
        }
      }
      return matches2;
    };
    findOne2 = (test, nodes) => {
      for (let node of nodes)
        if (test(node) || (node = findOne2(test, getChildren2(node))))
          return node;
      return null;
    };
    adapter = {
      isTag: isTag3,
      existsOne: existsOne2,
      getAttributeValue: getAttributeValue2,
      getChildren: getChildren2,
      getName: getName2,
      getParent: getParent2,
      getSiblings: getSiblings2,
      getText: getText2,
      hasAttrib: hasAttrib2,
      removeSubsets: removeSubsets2,
      findAll: findAll2,
      findOne: findOne2
    };
    prepareMatch = (element, selectors) => compile3(
      selectors,
      {
        context: selectors.includes(":scope") ? element : void 0,
        xmlMode: !ignoreCase(element),
        adapter
      }
    );
    matches = (element, selectors) => is2(
      element,
      selectors,
      {
        strict: true,
        context: selectors.includes(":scope") ? element : void 0,
        xmlMode: !ignoreCase(element),
        adapter
      }
    );
  }
});

// node_modules/linkedom/esm/shared/text-escaper.js
var replace, ca, esca, pe, escape2;
var init_text_escaper = __esm({
  "node_modules/linkedom/esm/shared/text-escaper.js"() {
    ({ replace } = "");
    ca = /[<>&\xA0]/g;
    esca = {
      "\xA0": "&#160;",
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;"
    };
    pe = (m) => esca[m];
    escape2 = (es) => replace.call(es, ca, pe);
  }
});

// node_modules/linkedom/esm/interface/text.js
var Text3;
var init_text = __esm({
  "node_modules/linkedom/esm/interface/text.js"() {
    init_constants();
    init_symbols();
    init_text_escaper();
    init_character_data();
    Text3 = class _Text extends CharacterData {
      constructor(ownerDocument, data = "") {
        super(ownerDocument, "#text", TEXT_NODE, data);
      }
      get wholeText() {
        const text = [];
        let { previousSibling: previousSibling2, nextSibling: nextSibling2 } = this;
        while (previousSibling2) {
          if (previousSibling2.nodeType === TEXT_NODE)
            text.unshift(previousSibling2[VALUE]);
          else
            break;
          previousSibling2 = previousSibling2.previousSibling;
        }
        text.push(this[VALUE]);
        while (nextSibling2) {
          if (nextSibling2.nodeType === TEXT_NODE)
            text.push(nextSibling2[VALUE]);
          else
            break;
          nextSibling2 = nextSibling2.nextSibling;
        }
        return text.join("");
      }
      cloneNode() {
        const { ownerDocument, [VALUE]: data } = this;
        return new _Text(ownerDocument, data);
      }
      toString() {
        return escape2(this[VALUE]);
      }
    };
  }
});

// node_modules/linkedom/esm/mixin/parent-node.js
var isNode, insert, ParentNode;
var init_parent_node = __esm({
  "node_modules/linkedom/esm/mixin/parent-node.js"() {
    init_constants();
    init_symbols();
    init_matches();
    init_node3();
    init_utils();
    init_node2();
    init_text();
    init_node_list();
    init_mutation_observer();
    init_custom_element_registry();
    init_non_document_type_child_node();
    isNode = (node) => node instanceof Node2;
    insert = (parentNode, child, nodes) => {
      const { ownerDocument } = parentNode;
      for (const node of nodes)
        parentNode.insertBefore(
          isNode(node) ? node : new Text3(ownerDocument, node),
          child
        );
    };
    ParentNode = class extends Node2 {
      constructor(ownerDocument, localName, nodeType) {
        super(ownerDocument, localName, nodeType);
        this[PRIVATE] = null;
        this[NEXT] = this[END] = {
          [NEXT]: null,
          [PREV]: this,
          [START]: this,
          nodeType: NODE_END,
          ownerDocument: this.ownerDocument,
          parentNode: null
        };
      }
      get childNodes() {
        const childNodes = new NodeList();
        let { firstChild } = this;
        while (firstChild) {
          childNodes.push(firstChild);
          firstChild = nextSibling(firstChild);
        }
        return childNodes;
      }
      get children() {
        const children = new NodeList();
        let { firstElementChild } = this;
        while (firstElementChild) {
          children.push(firstElementChild);
          firstElementChild = nextElementSibling2(firstElementChild);
        }
        return children;
      }
      /**
       * @returns {NodeStruct | null}
       */
      get firstChild() {
        let { [NEXT]: next, [END]: end } = this;
        while (next.nodeType === ATTRIBUTE_NODE)
          next = next[NEXT];
        return next === end ? null : next;
      }
      /**
       * @returns {NodeStruct | null}
       */
      get firstElementChild() {
        let { firstChild } = this;
        while (firstChild) {
          if (firstChild.nodeType === ELEMENT_NODE)
            return firstChild;
          firstChild = nextSibling(firstChild);
        }
        return null;
      }
      get lastChild() {
        const prev = this[END][PREV];
        switch (prev.nodeType) {
          case NODE_END:
            return prev[START];
          case ATTRIBUTE_NODE:
            return null;
        }
        return prev === this ? null : prev;
      }
      get lastElementChild() {
        let { lastChild } = this;
        while (lastChild) {
          if (lastChild.nodeType === ELEMENT_NODE)
            return lastChild;
          lastChild = previousSibling(lastChild);
        }
        return null;
      }
      get childElementCount() {
        return this.children.length;
      }
      prepend(...nodes) {
        insert(this, this.firstChild, nodes);
      }
      append(...nodes) {
        insert(this, this[END], nodes);
      }
      replaceChildren(...nodes) {
        let { [NEXT]: next, [END]: end } = this;
        while (next !== end && next.nodeType === ATTRIBUTE_NODE)
          next = next[NEXT];
        while (next !== end) {
          const after2 = getEnd(next)[NEXT];
          next.remove();
          next = after2;
        }
        if (nodes.length)
          insert(this, end, nodes);
      }
      getElementsByClassName(className) {
        const elements = new NodeList();
        let { [NEXT]: next, [END]: end } = this;
        while (next !== end) {
          if (next.nodeType === ELEMENT_NODE && next.hasAttribute("class") && next.classList.has(className))
            elements.push(next);
          next = next[NEXT];
        }
        return elements;
      }
      getElementsByTagName(tagName18) {
        const elements = new NodeList();
        let { [NEXT]: next, [END]: end } = this;
        while (next !== end) {
          if (next.nodeType === ELEMENT_NODE && (next.localName === tagName18 || localCase(next) === tagName18))
            elements.push(next);
          next = next[NEXT];
        }
        return elements;
      }
      querySelector(selectors) {
        const matches2 = prepareMatch(this, selectors);
        let { [NEXT]: next, [END]: end } = this;
        while (next !== end) {
          if (next.nodeType === ELEMENT_NODE && matches2(next))
            return next;
          next = next.localName === "template" ? next[END] : next[NEXT];
        }
        return null;
      }
      querySelectorAll(selectors) {
        const matches2 = prepareMatch(this, selectors);
        const elements = new NodeList();
        let { [NEXT]: next, [END]: end } = this;
        while (next !== end) {
          if (next.nodeType === ELEMENT_NODE && matches2(next))
            elements.push(next);
          next = next.localName === "template" ? next[END] : next[NEXT];
        }
        return elements;
      }
      appendChild(node) {
        return this.insertBefore(node, this[END]);
      }
      contains(node) {
        let parentNode = node;
        while (parentNode && parentNode !== this)
          parentNode = parentNode.parentNode;
        return parentNode === this;
      }
      insertBefore(node, before2 = null) {
        if (node === before2)
          return node;
        if (node === this)
          throw new Error("unable to append a node to itself");
        const next = before2 || this[END];
        switch (node.nodeType) {
          case ELEMENT_NODE:
            node.remove();
            node.parentNode = this;
            knownBoundaries(next[PREV], node, next);
            moCallback(node, null);
            connectedCallback(node);
            break;
          case DOCUMENT_FRAGMENT_NODE: {
            let { [PRIVATE]: parentNode, firstChild, lastChild } = node;
            if (firstChild) {
              knownSegment(next[PREV], firstChild, lastChild, next);
              knownAdjacent(node, node[END]);
              if (parentNode)
                parentNode.replaceChildren();
              do {
                firstChild.parentNode = this;
                moCallback(firstChild, null);
                if (firstChild.nodeType === ELEMENT_NODE)
                  connectedCallback(firstChild);
              } while (firstChild !== lastChild && (firstChild = nextSibling(firstChild)));
            }
            break;
          }
          case TEXT_NODE:
          case COMMENT_NODE:
            node.remove();
          default:
            node.parentNode = this;
            knownSiblings(next[PREV], node, next);
            moCallback(node, null);
            break;
        }
        return node;
      }
      normalize() {
        let { [NEXT]: next, [END]: end } = this;
        while (next !== end) {
          const { [NEXT]: $next, [PREV]: $prev, nodeType } = next;
          if (nodeType === TEXT_NODE) {
            if (!next[VALUE])
              next.remove();
            else if ($prev && $prev.nodeType === TEXT_NODE) {
              $prev.textContent += next.textContent;
              next.remove();
            }
          }
          next = $next;
        }
      }
      removeChild(node) {
        if (node.parentNode !== this)
          throw new Error("node is not a child");
        node.remove();
        return node;
      }
      replaceChild(node, replaced) {
        const next = getEnd(replaced)[NEXT];
        replaced.remove();
        this.insertBefore(node, next);
        return replaced;
      }
    };
  }
});

// node_modules/linkedom/esm/mixin/non-element-parent-node.js
var NonElementParentNode;
var init_non_element_parent_node = __esm({
  "node_modules/linkedom/esm/mixin/non-element-parent-node.js"() {
    init_constants();
    init_symbols();
    init_jsdon();
    init_parent_node();
    NonElementParentNode = class extends ParentNode {
      getElementById(id) {
        let { [NEXT]: next, [END]: end } = this;
        while (next !== end) {
          if (next.nodeType === ELEMENT_NODE && next.id === id)
            return next;
          next = next[NEXT];
        }
        return null;
      }
      cloneNode(deep) {
        const { ownerDocument, constructor } = this;
        const nonEPN = new constructor(ownerDocument);
        if (deep) {
          const { [END]: end } = nonEPN;
          for (const node of this.childNodes)
            nonEPN.insertBefore(node.cloneNode(deep), end);
        }
        return nonEPN;
      }
      toString() {
        const { childNodes, localName } = this;
        return `<${localName}>${childNodes.join("")}</${localName}>`;
      }
      toJSON() {
        const json = [];
        nonElementAsJSON(this, json);
        return json;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/document-fragment.js
var DocumentFragment;
var init_document_fragment = __esm({
  "node_modules/linkedom/esm/interface/document-fragment.js"() {
    init_constants();
    init_non_element_parent_node();
    DocumentFragment = class extends NonElementParentNode {
      constructor(ownerDocument) {
        super(ownerDocument, "#document-fragment", DOCUMENT_FRAGMENT_NODE);
      }
    };
  }
});

// node_modules/linkedom/esm/interface/document-type.js
var DocumentType;
var init_document_type = __esm({
  "node_modules/linkedom/esm/interface/document-type.js"() {
    init_constants();
    init_jsdon();
    init_node2();
    DocumentType = class _DocumentType extends Node2 {
      constructor(ownerDocument, name, publicId = "", systemId = "") {
        super(ownerDocument, "#document-type", DOCUMENT_TYPE_NODE);
        this.name = name;
        this.publicId = publicId;
        this.systemId = systemId;
      }
      cloneNode() {
        const { ownerDocument, name, publicId, systemId } = this;
        return new _DocumentType(ownerDocument, name, publicId, systemId);
      }
      toString() {
        const { name, publicId, systemId } = this;
        const hasPublic = 0 < publicId.length;
        const str = [name];
        if (hasPublic)
          str.push("PUBLIC", `"${publicId}"`);
        if (systemId.length) {
          if (!hasPublic)
            str.push("SYSTEM");
          str.push(`"${systemId}"`);
        }
        return `<!DOCTYPE ${str.join(" ")}>`;
      }
      toJSON() {
        const json = [];
        documentTypeAsJSON(this, json);
        return json;
      }
    };
  }
});

// node_modules/linkedom/esm/mixin/inner-html.js
function setOwnerDocument(node) {
  node.ownerDocument = this;
  switch (node.nodeType) {
    case ELEMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE:
      node.childNodes.forEach(setOwnerDocument, this);
      break;
  }
  return node;
}
var getInnerHtml, setInnerHtml;
var init_inner_html = __esm({
  "node_modules/linkedom/esm/mixin/inner-html.js"() {
    init_constants();
    init_symbols();
    init_parse_from_string();
    init_utils();
    getInnerHtml = (node) => node.childNodes.join("");
    setInnerHtml = (node, html) => {
      const { ownerDocument } = node;
      const { constructor } = ownerDocument;
      const document2 = new constructor();
      document2[CUSTOM_ELEMENTS] = ownerDocument[CUSTOM_ELEMENTS];
      const { childNodes } = parseFromString(document2, ignoreCase(node), html);
      node.replaceChildren(...childNodes.map(setOwnerDocument, ownerDocument));
    };
  }
});

// node_modules/uhyphen/esm/index.js
var esm_default2;
var init_esm9 = __esm({
  "node_modules/uhyphen/esm/index.js"() {
    esm_default2 = (camel) => camel.replace(/(([A-Z0-9])([A-Z0-9][a-z]))|(([a-z0-9]+)([A-Z]))/g, "$2$5-$3$6").toLowerCase();
  }
});

// node_modules/linkedom/esm/dom/string-map.js
var refs, key, prop, handler, DOMStringMap;
var init_string_map = __esm({
  "node_modules/linkedom/esm/dom/string-map.js"() {
    init_esm9();
    init_object();
    refs = /* @__PURE__ */ new WeakMap();
    key = (name) => `data-${esm_default2(name)}`;
    prop = (name) => name.slice(5).replace(/-([a-z])/g, (_, $1) => $1.toUpperCase());
    handler = {
      get(dataset, name) {
        if (name in dataset)
          return refs.get(dataset).getAttribute(key(name));
      },
      set(dataset, name, value) {
        dataset[name] = value;
        refs.get(dataset).setAttribute(key(name), value);
        return true;
      },
      deleteProperty(dataset, name) {
        if (name in dataset)
          refs.get(dataset).removeAttribute(key(name));
        return delete dataset[name];
      }
    };
    DOMStringMap = class {
      /**
       * @param {Element} ref
       */
      constructor(ref) {
        for (const { name, value } of ref.attributes) {
          if (/^data-/.test(name))
            this[prop(name)] = value;
        }
        refs.set(this, ref);
        return new Proxy(this, handler);
      }
    };
    setPrototypeOf(DOMStringMap.prototype, null);
  }
});

// node_modules/linkedom/esm/dom/token-list.js
var add, addTokens, update, DOMTokenList;
var init_token_list = __esm({
  "node_modules/linkedom/esm/dom/token-list.js"() {
    init_symbols();
    init_attributes();
    init_attr();
    ({ add } = Set.prototype);
    addTokens = (self, tokens) => {
      for (const token of tokens) {
        if (token)
          add.call(self, token);
      }
    };
    update = ({ [OWNER_ELEMENT]: ownerElement, value }) => {
      const attribute2 = ownerElement.getAttributeNode("class");
      if (attribute2)
        attribute2.value = value;
      else
        setAttribute(
          ownerElement,
          new Attr(ownerElement.ownerDocument, "class", value)
        );
    };
    DOMTokenList = class extends Set {
      constructor(ownerElement) {
        super();
        this[OWNER_ELEMENT] = ownerElement;
        const attribute2 = ownerElement.getAttributeNode("class");
        if (attribute2)
          addTokens(this, attribute2.value.split(/\s+/));
      }
      get length() {
        return this.size;
      }
      get value() {
        return [...this].join(" ");
      }
      /**
       * @param  {...string} tokens
       */
      add(...tokens) {
        addTokens(this, tokens);
        update(this);
      }
      /**
       * @param {string} token
       */
      contains(token) {
        return this.has(token);
      }
      /**
       * @param  {...string} tokens
       */
      remove(...tokens) {
        for (const token of tokens)
          this.delete(token);
        update(this);
      }
      /**
       * @param {string} token
       * @param {boolean?} force
       */
      toggle(token, force) {
        if (this.has(token)) {
          if (force)
            return true;
          this.delete(token);
          update(this);
        } else if (force || arguments.length === 1) {
          super.add(token);
          update(this);
          return true;
        }
        return false;
      }
      /**
       * @param {string} token
       * @param {string} newToken
       */
      replace(token, newToken) {
        if (this.has(token)) {
          this.delete(token);
          super.add(newToken);
          update(this);
          return true;
        }
        return false;
      }
      /**
       * @param {string} token
       */
      supports() {
        return true;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/css-style-declaration.js
function push(value, key2) {
  if (key2 !== PRIVATE)
    this.push(`${key2}:${value}`);
}
var refs2, getKeys, updateKeys, handler2, CSSStyleDeclaration, prototype;
var init_css_style_declaration = __esm({
  "node_modules/linkedom/esm/interface/css-style-declaration.js"() {
    init_esm9();
    init_symbols();
    refs2 = /* @__PURE__ */ new WeakMap();
    getKeys = (style) => [...style.keys()].filter((key2) => key2 !== PRIVATE);
    updateKeys = (style) => {
      const attr = refs2.get(style).getAttributeNode("style");
      if (!attr || attr[CHANGED] || style.get(PRIVATE) !== attr) {
        style.clear();
        if (attr) {
          style.set(PRIVATE, attr);
          for (const rule of attr[VALUE].split(/\s*;\s*/)) {
            let [key2, ...rest] = rule.split(":");
            if (rest.length > 0) {
              key2 = key2.trim();
              const value = rest.join(":").trim();
              if (key2 && value)
                style.set(key2, value);
            }
          }
        }
      }
      return attr;
    };
    handler2 = {
      get(style, name) {
        if (name in prototype)
          return style[name];
        updateKeys(style);
        if (name === "length")
          return getKeys(style).length;
        if (/^\d+$/.test(name))
          return getKeys(style)[name];
        return style.get(esm_default2(name));
      },
      set(style, name, value) {
        if (name === "cssText")
          style[name] = value;
        else {
          let attr = updateKeys(style);
          if (value == null)
            style.delete(esm_default2(name));
          else
            style.set(esm_default2(name), value);
          if (!attr) {
            const element = refs2.get(style);
            attr = element.ownerDocument.createAttribute("style");
            element.setAttributeNode(attr);
            style.set(PRIVATE, attr);
          }
          attr[CHANGED] = false;
          attr[VALUE] = style.toString();
        }
        return true;
      }
    };
    CSSStyleDeclaration = class extends Map {
      constructor(element) {
        super();
        refs2.set(this, element);
        return new Proxy(this, handler2);
      }
      get cssText() {
        return this.toString();
      }
      set cssText(value) {
        refs2.get(this).setAttribute("style", value);
      }
      getPropertyValue(name) {
        const self = this[PRIVATE];
        return handler2.get(self, name);
      }
      setProperty(name, value) {
        const self = this[PRIVATE];
        handler2.set(self, name, value);
      }
      removeProperty(name) {
        const self = this[PRIVATE];
        handler2.set(self, name, null);
      }
      [Symbol.iterator]() {
        const keys2 = getKeys(this[PRIVATE]);
        const { length } = keys2;
        let i = 0;
        return {
          next() {
            const done = i === length;
            return { done, value: done ? null : keys2[i++] };
          }
        };
      }
      get [PRIVATE]() {
        return this;
      }
      toString() {
        const self = this[PRIVATE];
        updateKeys(self);
        const cssText = [];
        self.forEach(push, cssText);
        return cssText.join(";");
      }
    };
    ({ prototype } = CSSStyleDeclaration);
  }
});

// node_modules/linkedom/esm/interface/event.js
var BUBBLING_PHASE, AT_TARGET, CAPTURING_PHASE, NONE, GlobalEvent;
var init_event = __esm({
  "node_modules/linkedom/esm/interface/event.js"() {
    BUBBLING_PHASE = 3;
    AT_TARGET = 2;
    CAPTURING_PHASE = 1;
    NONE = 0;
    GlobalEvent = class {
      static get BUBBLING_PHASE() {
        return BUBBLING_PHASE;
      }
      static get AT_TARGET() {
        return AT_TARGET;
      }
      static get CAPTURING_PHASE() {
        return CAPTURING_PHASE;
      }
      static get NONE() {
        return NONE;
      }
      constructor(type, eventInitDict = {}) {
        this.type = type;
        this.bubbles = !!eventInitDict.bubbles;
        this.cancelBubble = false;
        this._stopImmediatePropagationFlag = false;
        this.cancelable = !!eventInitDict.cancelable;
        this.eventPhase = this.NONE;
        this.timeStamp = Date.now();
        this.defaultPrevented = false;
        this.originalTarget = null;
        this.returnValue = null;
        this.srcElement = null;
        this.target = null;
        this._path = [];
      }
      get BUBBLING_PHASE() {
        return BUBBLING_PHASE;
      }
      get AT_TARGET() {
        return AT_TARGET;
      }
      get CAPTURING_PHASE() {
        return CAPTURING_PHASE;
      }
      get NONE() {
        return NONE;
      }
      preventDefault() {
        this.defaultPrevented = true;
      }
      // simplified implementation, should be https://dom.spec.whatwg.org/#dom-event-composedpath
      composedPath() {
        return this._path;
      }
      stopPropagation() {
        this.cancelBubble = true;
      }
      stopImmediatePropagation() {
        this.stopPropagation();
        this._stopImmediatePropagationFlag = true;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/named-node-map.js
var NamedNodeMap;
var init_named_node_map = __esm({
  "node_modules/linkedom/esm/interface/named-node-map.js"() {
    NamedNodeMap = class extends Array {
      constructor(ownerElement) {
        super();
        this.ownerElement = ownerElement;
      }
      getNamedItem(name) {
        return this.ownerElement.getAttributeNode(name);
      }
      setNamedItem(attr) {
        this.ownerElement.setAttributeNode(attr);
        this.unshift(attr);
      }
      removeNamedItem(name) {
        const item = this.getNamedItem(name);
        this.ownerElement.removeAttribute(name);
        this.splice(this.indexOf(item), 1);
      }
      item(index) {
        return index < this.length ? this[index] : null;
      }
      /* c8 ignore start */
      getNamedItemNS(_, name) {
        return this.getNamedItem(name);
      }
      setNamedItemNS(_, attr) {
        return this.setNamedItem(attr);
      }
      removeNamedItemNS(_, name) {
        return this.removeNamedItem(name);
      }
      /* c8 ignore stop */
    };
  }
});

// node_modules/linkedom/esm/interface/shadow-root.js
var ShadowRoot;
var init_shadow_root = __esm({
  "node_modules/linkedom/esm/interface/shadow-root.js"() {
    init_constants();
    init_inner_html();
    init_non_element_parent_node();
    ShadowRoot = class extends NonElementParentNode {
      constructor(host) {
        super(host.ownerDocument, "#shadow-root", DOCUMENT_FRAGMENT_NODE);
        this.host = host;
      }
      get innerHTML() {
        return getInnerHtml(this);
      }
      set innerHTML(html) {
        setInnerHtml(this, html);
      }
    };
  }
});

// node_modules/linkedom/esm/interface/element.js
var attributesHandler, create2, isVoid, Element2;
var init_element = __esm({
  "node_modules/linkedom/esm/interface/element.js"() {
    init_constants();
    init_attributes();
    init_symbols();
    init_utils();
    init_jsdon();
    init_matches();
    init_shadow_roots();
    init_node3();
    init_non_document_type_child_node();
    init_child_node();
    init_inner_html();
    init_parent_node();
    init_string_map();
    init_token_list();
    init_css_style_declaration();
    init_event();
    init_named_node_map();
    init_shadow_root();
    init_node_list();
    init_attr();
    init_text();
    attributesHandler = {
      get(target, key2) {
        return key2 in target ? target[key2] : target.find(({ name }) => name === key2);
      }
    };
    create2 = (ownerDocument, element, localName) => {
      if ("ownerSVGElement" in element) {
        const svg = ownerDocument.createElementNS(SVG_NAMESPACE, localName);
        svg.ownerSVGElement = element.ownerSVGElement;
        return svg;
      }
      return ownerDocument.createElement(localName);
    };
    isVoid = ({ localName, ownerDocument }) => {
      return ownerDocument[MIME].voidElements.test(localName);
    };
    Element2 = class extends ParentNode {
      constructor(ownerDocument, localName) {
        super(ownerDocument, localName, ELEMENT_NODE);
        this[CLASS_LIST] = null;
        this[DATASET] = null;
        this[STYLE] = null;
      }
      // <Mixins>
      get isConnected() {
        return isConnected(this);
      }
      get parentElement() {
        return parentElement(this);
      }
      get previousSibling() {
        return previousSibling(this);
      }
      get nextSibling() {
        return nextSibling(this);
      }
      get namespaceURI() {
        return "http://www.w3.org/1999/xhtml";
      }
      get previousElementSibling() {
        return previousElementSibling(this);
      }
      get nextElementSibling() {
        return nextElementSibling2(this);
      }
      before(...nodes) {
        before(this, nodes);
      }
      after(...nodes) {
        after(this, nodes);
      }
      replaceWith(...nodes) {
        replaceWith(this, nodes);
      }
      remove() {
        remove(this[PREV], this, this[END][NEXT]);
      }
      // </Mixins>
      // <specialGetters>
      get id() {
        return stringAttribute.get(this, "id");
      }
      set id(value) {
        stringAttribute.set(this, "id", value);
      }
      get className() {
        return this.classList.value;
      }
      set className(value) {
        const { classList } = this;
        classList.clear();
        classList.add(...value.split(/\s+/));
      }
      get nodeName() {
        return localCase(this);
      }
      get tagName() {
        return localCase(this);
      }
      get classList() {
        return this[CLASS_LIST] || (this[CLASS_LIST] = new DOMTokenList(this));
      }
      get dataset() {
        return this[DATASET] || (this[DATASET] = new DOMStringMap(this));
      }
      get nonce() {
        return stringAttribute.get(this, "nonce");
      }
      set nonce(value) {
        stringAttribute.set(this, "nonce", value);
      }
      get style() {
        return this[STYLE] || (this[STYLE] = new CSSStyleDeclaration(this));
      }
      get tabIndex() {
        return numericAttribute.get(this, "tabindex") || -1;
      }
      set tabIndex(value) {
        numericAttribute.set(this, "tabindex", value);
      }
      // </specialGetters>
      // <contentRelated>
      get innerText() {
        const text = [];
        let { [NEXT]: next, [END]: end } = this;
        while (next !== end) {
          if (next.nodeType === TEXT_NODE) {
            text.push(next.textContent.replace(/\s+/g, " "));
          } else if (text.length && next[NEXT] != end && BLOCK_ELEMENTS.has(next.tagName)) {
            text.push("\n");
          }
          next = next[NEXT];
        }
        return text.join("");
      }
      /**
       * @returns {String}
       */
      get textContent() {
        const text = [];
        let { [NEXT]: next, [END]: end } = this;
        while (next !== end) {
          if (next.nodeType === TEXT_NODE)
            text.push(next.textContent);
          next = next[NEXT];
        }
        return text.join("");
      }
      set textContent(text) {
        this.replaceChildren();
        if (text)
          this.appendChild(new Text3(this.ownerDocument, text));
      }
      get innerHTML() {
        return getInnerHtml(this);
      }
      set innerHTML(html) {
        setInnerHtml(this, html);
      }
      get outerHTML() {
        return this.toString();
      }
      set outerHTML(html) {
        const template = this.ownerDocument.createElement("");
        template.innerHTML = html;
        this.replaceWith(...template.childNodes);
      }
      // </contentRelated>
      // <attributes>
      get attributes() {
        const attributes2 = new NamedNodeMap(this);
        let next = this[NEXT];
        while (next.nodeType === ATTRIBUTE_NODE) {
          attributes2.push(next);
          next = next[NEXT];
        }
        return new Proxy(attributes2, attributesHandler);
      }
      focus() {
        this.dispatchEvent(new GlobalEvent("focus"));
      }
      getAttribute(name) {
        if (name === "class")
          return this.className;
        const attribute2 = this.getAttributeNode(name);
        return attribute2 && attribute2.value;
      }
      getAttributeNode(name) {
        let next = this[NEXT];
        while (next.nodeType === ATTRIBUTE_NODE) {
          if (next.name === name)
            return next;
          next = next[NEXT];
        }
        return null;
      }
      getAttributeNames() {
        const attributes2 = new NodeList();
        let next = this[NEXT];
        while (next.nodeType === ATTRIBUTE_NODE) {
          attributes2.push(next.name);
          next = next[NEXT];
        }
        return attributes2;
      }
      hasAttribute(name) {
        return !!this.getAttributeNode(name);
      }
      hasAttributes() {
        return this[NEXT].nodeType === ATTRIBUTE_NODE;
      }
      removeAttribute(name) {
        if (name === "class" && this[CLASS_LIST])
          this[CLASS_LIST].clear();
        let next = this[NEXT];
        while (next.nodeType === ATTRIBUTE_NODE) {
          if (next.name === name) {
            removeAttribute(this, next);
            return;
          }
          next = next[NEXT];
        }
      }
      removeAttributeNode(attribute2) {
        let next = this[NEXT];
        while (next.nodeType === ATTRIBUTE_NODE) {
          if (next === attribute2) {
            removeAttribute(this, next);
            return;
          }
          next = next[NEXT];
        }
      }
      setAttribute(name, value) {
        if (name === "class")
          this.className = value;
        else {
          const attribute2 = this.getAttributeNode(name);
          if (attribute2)
            attribute2.value = value;
          else
            setAttribute(this, new Attr(this.ownerDocument, name, value));
        }
      }
      setAttributeNode(attribute2) {
        const { name } = attribute2;
        const previously = this.getAttributeNode(name);
        if (previously !== attribute2) {
          if (previously)
            this.removeAttributeNode(previously);
          const { ownerElement } = attribute2;
          if (ownerElement)
            ownerElement.removeAttributeNode(attribute2);
          setAttribute(this, attribute2);
        }
        return previously;
      }
      toggleAttribute(name, force) {
        if (this.hasAttribute(name)) {
          if (!force) {
            this.removeAttribute(name);
            return false;
          }
          return true;
        } else if (force || arguments.length === 1) {
          this.setAttribute(name, "");
          return true;
        }
        return false;
      }
      // </attributes>
      // <ShadowDOM>
      get shadowRoot() {
        if (shadowRoots.has(this)) {
          const { mode, shadowRoot } = shadowRoots.get(this);
          if (mode === "open")
            return shadowRoot;
        }
        return null;
      }
      attachShadow(init) {
        if (shadowRoots.has(this))
          throw new Error("operation not supported");
        const shadowRoot = new ShadowRoot(this);
        shadowRoots.set(this, {
          mode: init.mode,
          shadowRoot
        });
        return shadowRoot;
      }
      // </ShadowDOM>
      // <selectors>
      matches(selectors) {
        return matches(this, selectors);
      }
      closest(selectors) {
        let parentElement2 = this;
        const matches2 = prepareMatch(parentElement2, selectors);
        while (parentElement2 && !matches2(parentElement2))
          parentElement2 = parentElement2.parentElement;
        return parentElement2;
      }
      // </selectors>
      // <insertAdjacent>
      insertAdjacentElement(position, element) {
        const { parentElement: parentElement2 } = this;
        switch (position) {
          case "beforebegin":
            if (parentElement2) {
              parentElement2.insertBefore(element, this);
              break;
            }
            return null;
          case "afterbegin":
            this.insertBefore(element, this.firstChild);
            break;
          case "beforeend":
            this.insertBefore(element, null);
            break;
          case "afterend":
            if (parentElement2) {
              parentElement2.insertBefore(element, this.nextSibling);
              break;
            }
            return null;
        }
        return element;
      }
      insertAdjacentHTML(position, html) {
        const template = this.ownerDocument.createElement("template");
        template.innerHTML = html;
        this.insertAdjacentElement(position, template.content);
      }
      insertAdjacentText(position, text) {
        const node = this.ownerDocument.createTextNode(text);
        this.insertAdjacentElement(position, node);
      }
      // </insertAdjacent>
      cloneNode(deep = false) {
        const { ownerDocument, localName } = this;
        const addNext = (next2) => {
          next2.parentNode = parentNode;
          knownAdjacent($next, next2);
          $next = next2;
        };
        const clone = create2(ownerDocument, this, localName);
        let parentNode = clone, $next = clone;
        let { [NEXT]: next, [END]: prev } = this;
        while (next !== prev && (deep || next.nodeType === ATTRIBUTE_NODE)) {
          switch (next.nodeType) {
            case NODE_END:
              knownAdjacent($next, parentNode[END]);
              $next = parentNode[END];
              parentNode = parentNode.parentNode;
              break;
            case ELEMENT_NODE: {
              const node = create2(ownerDocument, next, next.localName);
              addNext(node);
              parentNode = node;
              break;
            }
            case ATTRIBUTE_NODE: {
              const attr = next.cloneNode(deep);
              attr.ownerElement = parentNode;
              addNext(attr);
              break;
            }
            case TEXT_NODE:
            case COMMENT_NODE:
              addNext(next.cloneNode(deep));
              break;
          }
          next = next[NEXT];
        }
        knownAdjacent($next, clone[END]);
        return clone;
      }
      // <custom>
      toString() {
        const out = [];
        const { [END]: end } = this;
        let next = { [NEXT]: this };
        let isOpened = false;
        do {
          next = next[NEXT];
          switch (next.nodeType) {
            case ATTRIBUTE_NODE: {
              const attr = " " + next;
              switch (attr) {
                case " id":
                case " class":
                case " style":
                  break;
                default:
                  out.push(attr);
              }
              break;
            }
            case NODE_END: {
              const start = next[START];
              if (isOpened) {
                if ("ownerSVGElement" in start)
                  out.push(" />");
                else if (isVoid(start))
                  out.push(ignoreCase(start) ? ">" : " />");
                else
                  out.push(`></${start.localName}>`);
                isOpened = false;
              } else
                out.push(`</${start.localName}>`);
              break;
            }
            case ELEMENT_NODE:
              if (isOpened)
                out.push(">");
              if (next.toString !== this.toString) {
                out.push(next.toString());
                next = next[END];
                isOpened = false;
              } else {
                out.push(`<${next.localName}`);
                isOpened = true;
              }
              break;
            case TEXT_NODE:
            case COMMENT_NODE:
              out.push((isOpened ? ">" : "") + next);
              isOpened = false;
              break;
          }
        } while (next !== end);
        return out.join("");
      }
      toJSON() {
        const json = [];
        elementAsJSON(this, json);
        return json;
      }
      // </custom>
      /* c8 ignore start */
      getAttributeNS(_, name) {
        return this.getAttribute(name);
      }
      getElementsByTagNameNS(_, name) {
        return this.getElementsByTagName(name);
      }
      hasAttributeNS(_, name) {
        return this.hasAttribute(name);
      }
      removeAttributeNS(_, name) {
        this.removeAttribute(name);
      }
      setAttributeNS(_, name, value) {
        this.setAttribute(name, value);
      }
      setAttributeNodeNS(attr) {
        return this.setAttributeNode(attr);
      }
      /* c8 ignore stop */
    };
  }
});

// node_modules/linkedom/esm/svg/element.js
var classNames, handler3, SVGElement;
var init_element2 = __esm({
  "node_modules/linkedom/esm/svg/element.js"() {
    init_element();
    classNames = /* @__PURE__ */ new WeakMap();
    handler3 = {
      get(target, name) {
        return target[name];
      },
      set(target, name, value) {
        target[name] = value;
        return true;
      }
    };
    SVGElement = class extends Element2 {
      constructor(ownerDocument, localName, ownerSVGElement = null) {
        super(ownerDocument, localName);
        this.ownerSVGElement = ownerSVGElement;
      }
      get className() {
        if (!classNames.has(this))
          classNames.set(this, new Proxy({ baseVal: "", animVal: "" }, handler3));
        return classNames.get(this);
      }
      /* c8 ignore start */
      set className(value) {
        const { classList } = this;
        classList.clear();
        classList.add(...value.split(/\s+/));
      }
      /* c8 ignore stop */
      get namespaceURI() {
        return "http://www.w3.org/2000/svg";
      }
      getAttribute(name) {
        return name === "class" ? [...this.classList].join(" ") : super.getAttribute(name);
      }
      setAttribute(name, value) {
        if (name === "class")
          this.className = value;
        else if (name === "style") {
          const { className } = this;
          className.baseVal = className.animVal = value;
        }
        super.setAttribute(name, value);
      }
    };
  }
});

// node_modules/linkedom/esm/shared/facades.js
function Attr2() {
  illegalConstructor();
}
function CharacterData2() {
  illegalConstructor();
}
function Comment4() {
  illegalConstructor();
}
function DocumentFragment2() {
  illegalConstructor();
}
function DocumentType2() {
  illegalConstructor();
}
function Element3() {
  illegalConstructor();
}
function Node3() {
  illegalConstructor();
}
function ShadowRoot2() {
  illegalConstructor();
}
function Text4() {
  illegalConstructor();
}
function SVGElement2() {
  illegalConstructor();
}
var illegalConstructor, Facades;
var init_facades = __esm({
  "node_modules/linkedom/esm/shared/facades.js"() {
    init_attr();
    init_character_data();
    init_comment();
    init_document_fragment();
    init_document_type();
    init_element();
    init_node2();
    init_shadow_root();
    init_text();
    init_element2();
    init_object();
    illegalConstructor = () => {
      throw new TypeError("Illegal constructor");
    };
    setPrototypeOf(Attr2, Attr);
    Attr2.prototype = Attr.prototype;
    setPrototypeOf(CharacterData2, CharacterData);
    CharacterData2.prototype = CharacterData.prototype;
    setPrototypeOf(Comment4, Comment3);
    Comment4.prototype = Comment3.prototype;
    setPrototypeOf(DocumentFragment2, DocumentFragment);
    DocumentFragment2.prototype = DocumentFragment.prototype;
    setPrototypeOf(DocumentType2, DocumentType);
    DocumentType2.prototype = DocumentType.prototype;
    setPrototypeOf(Element3, Element2);
    Element3.prototype = Element2.prototype;
    setPrototypeOf(Node3, Node2);
    Node3.prototype = Node2.prototype;
    setPrototypeOf(ShadowRoot2, ShadowRoot);
    ShadowRoot2.prototype = ShadowRoot.prototype;
    setPrototypeOf(Text4, Text3);
    Text4.prototype = Text3.prototype;
    setPrototypeOf(SVGElement2, SVGElement);
    SVGElement2.prototype = SVGElement.prototype;
    Facades = {
      Attr: Attr2,
      CharacterData: CharacterData2,
      Comment: Comment4,
      DocumentFragment: DocumentFragment2,
      DocumentType: DocumentType2,
      Element: Element3,
      Node: Node3,
      ShadowRoot: ShadowRoot2,
      Text: Text4,
      SVGElement: SVGElement2
    };
  }
});

// node_modules/linkedom/esm/html/element.js
var Level0, level0, HTMLElement;
var init_element3 = __esm({
  "node_modules/linkedom/esm/html/element.js"() {
    init_symbols();
    init_attributes();
    init_event();
    init_element();
    init_custom_element_registry();
    Level0 = /* @__PURE__ */ new WeakMap();
    level0 = {
      get(element, name) {
        return Level0.has(element) && Level0.get(element)[name] || null;
      },
      set(element, name, value) {
        if (!Level0.has(element))
          Level0.set(element, {});
        const handlers = Level0.get(element);
        const type = name.slice(2);
        if (handlers[name])
          element.removeEventListener(type, handlers[name], false);
        if (handlers[name] = value)
          element.addEventListener(type, value, false);
      }
    };
    HTMLElement = class extends Element2 {
      static get observedAttributes() {
        return [];
      }
      constructor(ownerDocument = null, localName = "") {
        super(ownerDocument, localName);
        const ownerLess = !ownerDocument;
        let options;
        if (ownerLess) {
          const { constructor: Class } = this;
          if (!Classes.has(Class))
            throw new Error("unable to initialize this Custom Element");
          ({ ownerDocument, localName, options } = Classes.get(Class));
        }
        if (ownerDocument[UPGRADE]) {
          const { element, values } = ownerDocument[UPGRADE];
          ownerDocument[UPGRADE] = null;
          for (const [key2, value] of values)
            element[key2] = value;
          return element;
        }
        if (ownerLess) {
          this.ownerDocument = this[END].ownerDocument = ownerDocument;
          this.localName = localName;
          customElements.set(this, { connected: false });
          if (options.is)
            this.setAttribute("is", options.is);
        }
      }
      /* c8 ignore start */
      /* TODO: what about these?
      offsetHeight
      offsetLeft
      offsetParent
      offsetTop
      offsetWidth
      */
      blur() {
        this.dispatchEvent(new GlobalEvent("blur"));
      }
      click() {
        this.dispatchEvent(new GlobalEvent("click"));
      }
      // Boolean getters
      get accessKeyLabel() {
        const { accessKey } = this;
        return accessKey && `Alt+Shift+${accessKey}`;
      }
      get isContentEditable() {
        return this.hasAttribute("contenteditable");
      }
      // Boolean Accessors
      get contentEditable() {
        return booleanAttribute.get(this, "contenteditable");
      }
      set contentEditable(value) {
        booleanAttribute.set(this, "contenteditable", value);
      }
      get draggable() {
        return booleanAttribute.get(this, "draggable");
      }
      set draggable(value) {
        booleanAttribute.set(this, "draggable", value);
      }
      get hidden() {
        return booleanAttribute.get(this, "hidden");
      }
      set hidden(value) {
        booleanAttribute.set(this, "hidden", value);
      }
      get spellcheck() {
        return booleanAttribute.get(this, "spellcheck");
      }
      set spellcheck(value) {
        booleanAttribute.set(this, "spellcheck", value);
      }
      // String Accessors
      get accessKey() {
        return stringAttribute.get(this, "accesskey");
      }
      set accessKey(value) {
        stringAttribute.set(this, "accesskey", value);
      }
      get dir() {
        return stringAttribute.get(this, "dir");
      }
      set dir(value) {
        stringAttribute.set(this, "dir", value);
      }
      get lang() {
        return stringAttribute.get(this, "lang");
      }
      set lang(value) {
        stringAttribute.set(this, "lang", value);
      }
      get title() {
        return stringAttribute.get(this, "title");
      }
      set title(value) {
        stringAttribute.set(this, "title", value);
      }
      // DOM Level 0
      get onabort() {
        return level0.get(this, "onabort");
      }
      set onabort(value) {
        level0.set(this, "onabort", value);
      }
      get onblur() {
        return level0.get(this, "onblur");
      }
      set onblur(value) {
        level0.set(this, "onblur", value);
      }
      get oncancel() {
        return level0.get(this, "oncancel");
      }
      set oncancel(value) {
        level0.set(this, "oncancel", value);
      }
      get oncanplay() {
        return level0.get(this, "oncanplay");
      }
      set oncanplay(value) {
        level0.set(this, "oncanplay", value);
      }
      get oncanplaythrough() {
        return level0.get(this, "oncanplaythrough");
      }
      set oncanplaythrough(value) {
        level0.set(this, "oncanplaythrough", value);
      }
      get onchange() {
        return level0.get(this, "onchange");
      }
      set onchange(value) {
        level0.set(this, "onchange", value);
      }
      get onclick() {
        return level0.get(this, "onclick");
      }
      set onclick(value) {
        level0.set(this, "onclick", value);
      }
      get onclose() {
        return level0.get(this, "onclose");
      }
      set onclose(value) {
        level0.set(this, "onclose", value);
      }
      get oncontextmenu() {
        return level0.get(this, "oncontextmenu");
      }
      set oncontextmenu(value) {
        level0.set(this, "oncontextmenu", value);
      }
      get oncuechange() {
        return level0.get(this, "oncuechange");
      }
      set oncuechange(value) {
        level0.set(this, "oncuechange", value);
      }
      get ondblclick() {
        return level0.get(this, "ondblclick");
      }
      set ondblclick(value) {
        level0.set(this, "ondblclick", value);
      }
      get ondrag() {
        return level0.get(this, "ondrag");
      }
      set ondrag(value) {
        level0.set(this, "ondrag", value);
      }
      get ondragend() {
        return level0.get(this, "ondragend");
      }
      set ondragend(value) {
        level0.set(this, "ondragend", value);
      }
      get ondragenter() {
        return level0.get(this, "ondragenter");
      }
      set ondragenter(value) {
        level0.set(this, "ondragenter", value);
      }
      get ondragleave() {
        return level0.get(this, "ondragleave");
      }
      set ondragleave(value) {
        level0.set(this, "ondragleave", value);
      }
      get ondragover() {
        return level0.get(this, "ondragover");
      }
      set ondragover(value) {
        level0.set(this, "ondragover", value);
      }
      get ondragstart() {
        return level0.get(this, "ondragstart");
      }
      set ondragstart(value) {
        level0.set(this, "ondragstart", value);
      }
      get ondrop() {
        return level0.get(this, "ondrop");
      }
      set ondrop(value) {
        level0.set(this, "ondrop", value);
      }
      get ondurationchange() {
        return level0.get(this, "ondurationchange");
      }
      set ondurationchange(value) {
        level0.set(this, "ondurationchange", value);
      }
      get onemptied() {
        return level0.get(this, "onemptied");
      }
      set onemptied(value) {
        level0.set(this, "onemptied", value);
      }
      get onended() {
        return level0.get(this, "onended");
      }
      set onended(value) {
        level0.set(this, "onended", value);
      }
      get onerror() {
        return level0.get(this, "onerror");
      }
      set onerror(value) {
        level0.set(this, "onerror", value);
      }
      get onfocus() {
        return level0.get(this, "onfocus");
      }
      set onfocus(value) {
        level0.set(this, "onfocus", value);
      }
      get oninput() {
        return level0.get(this, "oninput");
      }
      set oninput(value) {
        level0.set(this, "oninput", value);
      }
      get oninvalid() {
        return level0.get(this, "oninvalid");
      }
      set oninvalid(value) {
        level0.set(this, "oninvalid", value);
      }
      get onkeydown() {
        return level0.get(this, "onkeydown");
      }
      set onkeydown(value) {
        level0.set(this, "onkeydown", value);
      }
      get onkeypress() {
        return level0.get(this, "onkeypress");
      }
      set onkeypress(value) {
        level0.set(this, "onkeypress", value);
      }
      get onkeyup() {
        return level0.get(this, "onkeyup");
      }
      set onkeyup(value) {
        level0.set(this, "onkeyup", value);
      }
      get onload() {
        return level0.get(this, "onload");
      }
      set onload(value) {
        level0.set(this, "onload", value);
      }
      get onloadeddata() {
        return level0.get(this, "onloadeddata");
      }
      set onloadeddata(value) {
        level0.set(this, "onloadeddata", value);
      }
      get onloadedmetadata() {
        return level0.get(this, "onloadedmetadata");
      }
      set onloadedmetadata(value) {
        level0.set(this, "onloadedmetadata", value);
      }
      get onloadstart() {
        return level0.get(this, "onloadstart");
      }
      set onloadstart(value) {
        level0.set(this, "onloadstart", value);
      }
      get onmousedown() {
        return level0.get(this, "onmousedown");
      }
      set onmousedown(value) {
        level0.set(this, "onmousedown", value);
      }
      get onmouseenter() {
        return level0.get(this, "onmouseenter");
      }
      set onmouseenter(value) {
        level0.set(this, "onmouseenter", value);
      }
      get onmouseleave() {
        return level0.get(this, "onmouseleave");
      }
      set onmouseleave(value) {
        level0.set(this, "onmouseleave", value);
      }
      get onmousemove() {
        return level0.get(this, "onmousemove");
      }
      set onmousemove(value) {
        level0.set(this, "onmousemove", value);
      }
      get onmouseout() {
        return level0.get(this, "onmouseout");
      }
      set onmouseout(value) {
        level0.set(this, "onmouseout", value);
      }
      get onmouseover() {
        return level0.get(this, "onmouseover");
      }
      set onmouseover(value) {
        level0.set(this, "onmouseover", value);
      }
      get onmouseup() {
        return level0.get(this, "onmouseup");
      }
      set onmouseup(value) {
        level0.set(this, "onmouseup", value);
      }
      get onmousewheel() {
        return level0.get(this, "onmousewheel");
      }
      set onmousewheel(value) {
        level0.set(this, "onmousewheel", value);
      }
      get onpause() {
        return level0.get(this, "onpause");
      }
      set onpause(value) {
        level0.set(this, "onpause", value);
      }
      get onplay() {
        return level0.get(this, "onplay");
      }
      set onplay(value) {
        level0.set(this, "onplay", value);
      }
      get onplaying() {
        return level0.get(this, "onplaying");
      }
      set onplaying(value) {
        level0.set(this, "onplaying", value);
      }
      get onprogress() {
        return level0.get(this, "onprogress");
      }
      set onprogress(value) {
        level0.set(this, "onprogress", value);
      }
      get onratechange() {
        return level0.get(this, "onratechange");
      }
      set onratechange(value) {
        level0.set(this, "onratechange", value);
      }
      get onreset() {
        return level0.get(this, "onreset");
      }
      set onreset(value) {
        level0.set(this, "onreset", value);
      }
      get onresize() {
        return level0.get(this, "onresize");
      }
      set onresize(value) {
        level0.set(this, "onresize", value);
      }
      get onscroll() {
        return level0.get(this, "onscroll");
      }
      set onscroll(value) {
        level0.set(this, "onscroll", value);
      }
      get onseeked() {
        return level0.get(this, "onseeked");
      }
      set onseeked(value) {
        level0.set(this, "onseeked", value);
      }
      get onseeking() {
        return level0.get(this, "onseeking");
      }
      set onseeking(value) {
        level0.set(this, "onseeking", value);
      }
      get onselect() {
        return level0.get(this, "onselect");
      }
      set onselect(value) {
        level0.set(this, "onselect", value);
      }
      get onshow() {
        return level0.get(this, "onshow");
      }
      set onshow(value) {
        level0.set(this, "onshow", value);
      }
      get onstalled() {
        return level0.get(this, "onstalled");
      }
      set onstalled(value) {
        level0.set(this, "onstalled", value);
      }
      get onsubmit() {
        return level0.get(this, "onsubmit");
      }
      set onsubmit(value) {
        level0.set(this, "onsubmit", value);
      }
      get onsuspend() {
        return level0.get(this, "onsuspend");
      }
      set onsuspend(value) {
        level0.set(this, "onsuspend", value);
      }
      get ontimeupdate() {
        return level0.get(this, "ontimeupdate");
      }
      set ontimeupdate(value) {
        level0.set(this, "ontimeupdate", value);
      }
      get ontoggle() {
        return level0.get(this, "ontoggle");
      }
      set ontoggle(value) {
        level0.set(this, "ontoggle", value);
      }
      get onvolumechange() {
        return level0.get(this, "onvolumechange");
      }
      set onvolumechange(value) {
        level0.set(this, "onvolumechange", value);
      }
      get onwaiting() {
        return level0.get(this, "onwaiting");
      }
      set onwaiting(value) {
        level0.set(this, "onwaiting", value);
      }
      get onauxclick() {
        return level0.get(this, "onauxclick");
      }
      set onauxclick(value) {
        level0.set(this, "onauxclick", value);
      }
      get ongotpointercapture() {
        return level0.get(this, "ongotpointercapture");
      }
      set ongotpointercapture(value) {
        level0.set(this, "ongotpointercapture", value);
      }
      get onlostpointercapture() {
        return level0.get(this, "onlostpointercapture");
      }
      set onlostpointercapture(value) {
        level0.set(this, "onlostpointercapture", value);
      }
      get onpointercancel() {
        return level0.get(this, "onpointercancel");
      }
      set onpointercancel(value) {
        level0.set(this, "onpointercancel", value);
      }
      get onpointerdown() {
        return level0.get(this, "onpointerdown");
      }
      set onpointerdown(value) {
        level0.set(this, "onpointerdown", value);
      }
      get onpointerenter() {
        return level0.get(this, "onpointerenter");
      }
      set onpointerenter(value) {
        level0.set(this, "onpointerenter", value);
      }
      get onpointerleave() {
        return level0.get(this, "onpointerleave");
      }
      set onpointerleave(value) {
        level0.set(this, "onpointerleave", value);
      }
      get onpointermove() {
        return level0.get(this, "onpointermove");
      }
      set onpointermove(value) {
        level0.set(this, "onpointermove", value);
      }
      get onpointerout() {
        return level0.get(this, "onpointerout");
      }
      set onpointerout(value) {
        level0.set(this, "onpointerout", value);
      }
      get onpointerover() {
        return level0.get(this, "onpointerover");
      }
      set onpointerover(value) {
        level0.set(this, "onpointerover", value);
      }
      get onpointerup() {
        return level0.get(this, "onpointerup");
      }
      set onpointerup(value) {
        level0.set(this, "onpointerup", value);
      }
      /* c8 ignore stop */
    };
  }
});

// node_modules/linkedom/esm/html/template-element.js
var tagName, HTMLTemplateElement;
var init_template_element = __esm({
  "node_modules/linkedom/esm/html/template-element.js"() {
    init_symbols();
    init_register_html_class();
    init_element3();
    tagName = "template";
    HTMLTemplateElement = class extends HTMLElement {
      constructor(ownerDocument) {
        super(ownerDocument, tagName);
        const content = this.ownerDocument.createDocumentFragment();
        (this[CONTENT] = content)[PRIVATE] = this;
      }
      get content() {
        if (this.hasChildNodes() && !this[CONTENT].hasChildNodes()) {
          for (const node of this.childNodes)
            this[CONTENT].appendChild(node.cloneNode(true));
        }
        return this[CONTENT];
      }
    };
    registerHTMLClass(tagName, HTMLTemplateElement);
  }
});

// node_modules/linkedom/esm/html/html-element.js
var HTMLHtmlElement;
var init_html_element = __esm({
  "node_modules/linkedom/esm/html/html-element.js"() {
    init_element3();
    HTMLHtmlElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "html") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/text-element.js
var toString, TextElement;
var init_text_element = __esm({
  "node_modules/linkedom/esm/html/text-element.js"() {
    init_element3();
    ({ toString } = HTMLElement.prototype);
    TextElement = class extends HTMLElement {
      get innerHTML() {
        return this.textContent;
      }
      set innerHTML(html) {
        this.textContent = html;
      }
      toString() {
        const outerHTML = toString.call(this.cloneNode());
        return outerHTML.replace(/></, `>${this.textContent}<`);
      }
    };
  }
});

// node_modules/linkedom/esm/html/script-element.js
var tagName2, HTMLScriptElement;
var init_script_element = __esm({
  "node_modules/linkedom/esm/html/script-element.js"() {
    init_attributes();
    init_register_html_class();
    init_text_element();
    tagName2 = "script";
    HTMLScriptElement = class extends TextElement {
      constructor(ownerDocument, localName = tagName2) {
        super(ownerDocument, localName);
      }
      get type() {
        return stringAttribute.get(this, "type");
      }
      set type(value) {
        stringAttribute.set(this, "type", value);
      }
      get src() {
        return stringAttribute.get(this, "src");
      }
      set src(value) {
        stringAttribute.set(this, "src", value);
      }
      get defer() {
        return booleanAttribute.get(this, "defer");
      }
      set defer(value) {
        booleanAttribute.set(this, "defer", value);
      }
      get crossOrigin() {
        return stringAttribute.get(this, "crossorigin");
      }
      set crossOrigin(value) {
        stringAttribute.set(this, "crossorigin", value);
      }
      get nomodule() {
        return booleanAttribute.get(this, "nomodule");
      }
      set nomodule(value) {
        booleanAttribute.set(this, "nomodule", value);
      }
      get referrerPolicy() {
        return stringAttribute.get(this, "referrerpolicy");
      }
      set referrerPolicy(value) {
        stringAttribute.set(this, "referrerpolicy", value);
      }
      get nonce() {
        return stringAttribute.get(this, "nonce");
      }
      set nonce(value) {
        stringAttribute.set(this, "nonce", value);
      }
      get async() {
        return booleanAttribute.get(this, "async");
      }
      set async(value) {
        booleanAttribute.set(this, "async", value);
      }
      get text() {
        return this.textContent;
      }
      set text(content) {
        this.textContent = content;
      }
    };
    registerHTMLClass(tagName2, HTMLScriptElement);
  }
});

// node_modules/linkedom/esm/html/frame-element.js
var HTMLFrameElement;
var init_frame_element = __esm({
  "node_modules/linkedom/esm/html/frame-element.js"() {
    init_element3();
    HTMLFrameElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "frame") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/i-frame-element.js
var tagName3, HTMLIFrameElement;
var init_i_frame_element = __esm({
  "node_modules/linkedom/esm/html/i-frame-element.js"() {
    init_register_html_class();
    init_attributes();
    init_element3();
    tagName3 = "iframe";
    HTMLIFrameElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName3) {
        super(ownerDocument, localName);
      }
      /* c8 ignore start */
      get src() {
        return stringAttribute.get(this, "src");
      }
      set src(value) {
        stringAttribute.set(this, "src", value);
      }
      get srcdoc() {
        return stringAttribute.get(this, "srcdoc");
      }
      set srcdoc(value) {
        stringAttribute.set(this, "srcdoc", value);
      }
      get name() {
        return stringAttribute.get(this, "name");
      }
      set name(value) {
        stringAttribute.set(this, "name", value);
      }
      get allow() {
        return stringAttribute.get(this, "allow");
      }
      set allow(value) {
        stringAttribute.set(this, "allow", value);
      }
      get allowFullscreen() {
        return booleanAttribute.get(this, "allowfullscreen");
      }
      set allowFullscreen(value) {
        booleanAttribute.set(this, "allowfullscreen", value);
      }
      get referrerPolicy() {
        return stringAttribute.get(this, "referrerpolicy");
      }
      set referrerPolicy(value) {
        stringAttribute.set(this, "referrerpolicy", value);
      }
      get loading() {
        return stringAttribute.get(this, "loading");
      }
      set loading(value) {
        stringAttribute.set(this, "loading", value);
      }
      /* c8 ignore stop */
    };
    registerHTMLClass(tagName3, HTMLIFrameElement);
  }
});

// node_modules/linkedom/esm/html/object-element.js
var HTMLObjectElement;
var init_object_element = __esm({
  "node_modules/linkedom/esm/html/object-element.js"() {
    init_element3();
    HTMLObjectElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "object") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/head-element.js
var HTMLHeadElement;
var init_head_element = __esm({
  "node_modules/linkedom/esm/html/head-element.js"() {
    init_element3();
    HTMLHeadElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "head") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/body-element.js
var HTMLBodyElement;
var init_body_element = __esm({
  "node_modules/linkedom/esm/html/body-element.js"() {
    init_element3();
    HTMLBodyElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "body") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/cssom/lib/StyleSheet.js
var require_StyleSheet = __commonJS({
  "node_modules/cssom/lib/StyleSheet.js"(exports) {
    var CSSOM = {};
    CSSOM.StyleSheet = function StyleSheet() {
      this.parentStyleSheet = null;
    };
    exports.StyleSheet = CSSOM.StyleSheet;
  }
});

// node_modules/cssom/lib/CSSRule.js
var require_CSSRule = __commonJS({
  "node_modules/cssom/lib/CSSRule.js"(exports) {
    var CSSOM = {};
    CSSOM.CSSRule = function CSSRule() {
      this.parentRule = null;
      this.parentStyleSheet = null;
    };
    CSSOM.CSSRule.UNKNOWN_RULE = 0;
    CSSOM.CSSRule.STYLE_RULE = 1;
    CSSOM.CSSRule.CHARSET_RULE = 2;
    CSSOM.CSSRule.IMPORT_RULE = 3;
    CSSOM.CSSRule.MEDIA_RULE = 4;
    CSSOM.CSSRule.FONT_FACE_RULE = 5;
    CSSOM.CSSRule.PAGE_RULE = 6;
    CSSOM.CSSRule.KEYFRAMES_RULE = 7;
    CSSOM.CSSRule.KEYFRAME_RULE = 8;
    CSSOM.CSSRule.MARGIN_RULE = 9;
    CSSOM.CSSRule.NAMESPACE_RULE = 10;
    CSSOM.CSSRule.COUNTER_STYLE_RULE = 11;
    CSSOM.CSSRule.SUPPORTS_RULE = 12;
    CSSOM.CSSRule.DOCUMENT_RULE = 13;
    CSSOM.CSSRule.FONT_FEATURE_VALUES_RULE = 14;
    CSSOM.CSSRule.VIEWPORT_RULE = 15;
    CSSOM.CSSRule.REGION_STYLE_RULE = 16;
    CSSOM.CSSRule.prototype = {
      constructor: CSSOM.CSSRule
      //FIXME
    };
    exports.CSSRule = CSSOM.CSSRule;
  }
});

// node_modules/cssom/lib/CSSStyleRule.js
var require_CSSStyleRule = __commonJS({
  "node_modules/cssom/lib/CSSStyleRule.js"(exports) {
    var CSSOM = {
      CSSStyleDeclaration: require_CSSStyleDeclaration().CSSStyleDeclaration,
      CSSRule: require_CSSRule().CSSRule
    };
    CSSOM.CSSStyleRule = function CSSStyleRule() {
      CSSOM.CSSRule.call(this);
      this.selectorText = "";
      this.style = new CSSOM.CSSStyleDeclaration();
      this.style.parentRule = this;
    };
    CSSOM.CSSStyleRule.prototype = new CSSOM.CSSRule();
    CSSOM.CSSStyleRule.prototype.constructor = CSSOM.CSSStyleRule;
    CSSOM.CSSStyleRule.prototype.type = 1;
    Object.defineProperty(CSSOM.CSSStyleRule.prototype, "cssText", {
      get: function() {
        var text;
        if (this.selectorText) {
          text = this.selectorText + " {" + this.style.cssText + "}";
        } else {
          text = "";
        }
        return text;
      },
      set: function(cssText) {
        var rule = CSSOM.CSSStyleRule.parse(cssText);
        this.style = rule.style;
        this.selectorText = rule.selectorText;
      }
    });
    CSSOM.CSSStyleRule.parse = function(ruleText) {
      var i = 0;
      var state = "selector";
      var index;
      var j = i;
      var buffer = "";
      var SIGNIFICANT_WHITESPACE = {
        "selector": true,
        "value": true
      };
      var styleRule = new CSSOM.CSSStyleRule();
      var name, priority = "";
      for (var character; character = ruleText.charAt(i); i++) {
        switch (character) {
          case " ":
          case "	":
          case "\r":
          case "\n":
          case "\f":
            if (SIGNIFICANT_WHITESPACE[state]) {
              switch (ruleText.charAt(i - 1)) {
                case " ":
                case "	":
                case "\r":
                case "\n":
                case "\f":
                  break;
                default:
                  buffer += " ";
                  break;
              }
            }
            break;
          case '"':
            j = i + 1;
            index = ruleText.indexOf('"', j) + 1;
            if (!index) {
              throw '" is missing';
            }
            buffer += ruleText.slice(i, index);
            i = index - 1;
            break;
          case "'":
            j = i + 1;
            index = ruleText.indexOf("'", j) + 1;
            if (!index) {
              throw "' is missing";
            }
            buffer += ruleText.slice(i, index);
            i = index - 1;
            break;
          case "/":
            if (ruleText.charAt(i + 1) === "*") {
              i += 2;
              index = ruleText.indexOf("*/", i);
              if (index === -1) {
                throw new SyntaxError("Missing */");
              } else {
                i = index + 1;
              }
            } else {
              buffer += character;
            }
            break;
          case "{":
            if (state === "selector") {
              styleRule.selectorText = buffer.trim();
              buffer = "";
              state = "name";
            }
            break;
          case ":":
            if (state === "name") {
              name = buffer.trim();
              buffer = "";
              state = "value";
            } else {
              buffer += character;
            }
            break;
          case "!":
            if (state === "value" && ruleText.indexOf("!important", i) === i) {
              priority = "important";
              i += "important".length;
            } else {
              buffer += character;
            }
            break;
          case ";":
            if (state === "value") {
              styleRule.style.setProperty(name, buffer.trim(), priority);
              priority = "";
              buffer = "";
              state = "name";
            } else {
              buffer += character;
            }
            break;
          case "}":
            if (state === "value") {
              styleRule.style.setProperty(name, buffer.trim(), priority);
              priority = "";
              buffer = "";
            } else if (state === "name") {
              break;
            } else {
              buffer += character;
            }
            state = "selector";
            break;
          default:
            buffer += character;
            break;
        }
      }
      return styleRule;
    };
    exports.CSSStyleRule = CSSOM.CSSStyleRule;
  }
});

// node_modules/cssom/lib/CSSStyleSheet.js
var require_CSSStyleSheet = __commonJS({
  "node_modules/cssom/lib/CSSStyleSheet.js"(exports) {
    var CSSOM = {
      StyleSheet: require_StyleSheet().StyleSheet,
      CSSStyleRule: require_CSSStyleRule().CSSStyleRule
    };
    CSSOM.CSSStyleSheet = function CSSStyleSheet() {
      CSSOM.StyleSheet.call(this);
      this.cssRules = [];
    };
    CSSOM.CSSStyleSheet.prototype = new CSSOM.StyleSheet();
    CSSOM.CSSStyleSheet.prototype.constructor = CSSOM.CSSStyleSheet;
    CSSOM.CSSStyleSheet.prototype.insertRule = function(rule, index) {
      if (index < 0 || index > this.cssRules.length) {
        throw new RangeError("INDEX_SIZE_ERR");
      }
      var cssRule = CSSOM.parse(rule).cssRules[0];
      cssRule.parentStyleSheet = this;
      this.cssRules.splice(index, 0, cssRule);
      return index;
    };
    CSSOM.CSSStyleSheet.prototype.deleteRule = function(index) {
      if (index < 0 || index >= this.cssRules.length) {
        throw new RangeError("INDEX_SIZE_ERR");
      }
      this.cssRules.splice(index, 1);
    };
    CSSOM.CSSStyleSheet.prototype.toString = function() {
      var result = "";
      var rules = this.cssRules;
      for (var i = 0; i < rules.length; i++) {
        result += rules[i].cssText + "\n";
      }
      return result;
    };
    exports.CSSStyleSheet = CSSOM.CSSStyleSheet;
    CSSOM.parse = require_parse2().parse;
  }
});

// node_modules/cssom/lib/MediaList.js
var require_MediaList = __commonJS({
  "node_modules/cssom/lib/MediaList.js"(exports) {
    var CSSOM = {};
    CSSOM.MediaList = function MediaList() {
      this.length = 0;
    };
    CSSOM.MediaList.prototype = {
      constructor: CSSOM.MediaList,
      /**
       * @return {string}
       */
      get mediaText() {
        return Array.prototype.join.call(this, ", ");
      },
      /**
       * @param {string} value
       */
      set mediaText(value) {
        var values = value.split(",");
        var length = this.length = values.length;
        for (var i = 0; i < length; i++) {
          this[i] = values[i].trim();
        }
      },
      /**
       * @param {string} medium
       */
      appendMedium: function(medium) {
        if (Array.prototype.indexOf.call(this, medium) === -1) {
          this[this.length] = medium;
          this.length++;
        }
      },
      /**
       * @param {string} medium
       */
      deleteMedium: function(medium) {
        var index = Array.prototype.indexOf.call(this, medium);
        if (index !== -1) {
          Array.prototype.splice.call(this, index, 1);
        }
      }
    };
    exports.MediaList = CSSOM.MediaList;
  }
});

// node_modules/cssom/lib/CSSImportRule.js
var require_CSSImportRule = __commonJS({
  "node_modules/cssom/lib/CSSImportRule.js"(exports) {
    var CSSOM = {
      CSSRule: require_CSSRule().CSSRule,
      CSSStyleSheet: require_CSSStyleSheet().CSSStyleSheet,
      MediaList: require_MediaList().MediaList
    };
    CSSOM.CSSImportRule = function CSSImportRule() {
      CSSOM.CSSRule.call(this);
      this.href = "";
      this.media = new CSSOM.MediaList();
      this.styleSheet = new CSSOM.CSSStyleSheet();
    };
    CSSOM.CSSImportRule.prototype = new CSSOM.CSSRule();
    CSSOM.CSSImportRule.prototype.constructor = CSSOM.CSSImportRule;
    CSSOM.CSSImportRule.prototype.type = 3;
    Object.defineProperty(CSSOM.CSSImportRule.prototype, "cssText", {
      get: function() {
        var mediaText = this.media.mediaText;
        return "@import url(" + this.href + ")" + (mediaText ? " " + mediaText : "") + ";";
      },
      set: function(cssText) {
        var i = 0;
        var state = "";
        var buffer = "";
        var index;
        for (var character; character = cssText.charAt(i); i++) {
          switch (character) {
            case " ":
            case "	":
            case "\r":
            case "\n":
            case "\f":
              if (state === "after-import") {
                state = "url";
              } else {
                buffer += character;
              }
              break;
            case "@":
              if (!state && cssText.indexOf("@import", i) === i) {
                state = "after-import";
                i += "import".length;
                buffer = "";
              }
              break;
            case "u":
              if (state === "url" && cssText.indexOf("url(", i) === i) {
                index = cssText.indexOf(")", i + 1);
                if (index === -1) {
                  throw i + ': ")" not found';
                }
                i += "url(".length;
                var url = cssText.slice(i, index);
                if (url[0] === url[url.length - 1]) {
                  if (url[0] === '"' || url[0] === "'") {
                    url = url.slice(1, -1);
                  }
                }
                this.href = url;
                i = index;
                state = "media";
              }
              break;
            case '"':
              if (state === "url") {
                index = cssText.indexOf('"', i + 1);
                if (!index) {
                  throw i + `: '"' not found`;
                }
                this.href = cssText.slice(i + 1, index);
                i = index;
                state = "media";
              }
              break;
            case "'":
              if (state === "url") {
                index = cssText.indexOf("'", i + 1);
                if (!index) {
                  throw i + `: "'" not found`;
                }
                this.href = cssText.slice(i + 1, index);
                i = index;
                state = "media";
              }
              break;
            case ";":
              if (state === "media") {
                if (buffer) {
                  this.media.mediaText = buffer.trim();
                }
              }
              break;
            default:
              if (state === "media") {
                buffer += character;
              }
              break;
          }
        }
      }
    });
    exports.CSSImportRule = CSSOM.CSSImportRule;
  }
});

// node_modules/cssom/lib/CSSGroupingRule.js
var require_CSSGroupingRule = __commonJS({
  "node_modules/cssom/lib/CSSGroupingRule.js"(exports) {
    var CSSOM = {
      CSSRule: require_CSSRule().CSSRule
    };
    CSSOM.CSSGroupingRule = function CSSGroupingRule() {
      CSSOM.CSSRule.call(this);
      this.cssRules = [];
    };
    CSSOM.CSSGroupingRule.prototype = new CSSOM.CSSRule();
    CSSOM.CSSGroupingRule.prototype.constructor = CSSOM.CSSGroupingRule;
    CSSOM.CSSGroupingRule.prototype.insertRule = function insertRule(rule, index) {
      if (index < 0 || index > this.cssRules.length) {
        throw new RangeError("INDEX_SIZE_ERR");
      }
      var cssRule = CSSOM.parse(rule).cssRules[0];
      cssRule.parentRule = this;
      this.cssRules.splice(index, 0, cssRule);
      return index;
    };
    CSSOM.CSSGroupingRule.prototype.deleteRule = function deleteRule(index) {
      if (index < 0 || index >= this.cssRules.length) {
        throw new RangeError("INDEX_SIZE_ERR");
      }
      this.cssRules.splice(index, 1)[0].parentRule = null;
    };
    exports.CSSGroupingRule = CSSOM.CSSGroupingRule;
  }
});

// node_modules/cssom/lib/CSSConditionRule.js
var require_CSSConditionRule = __commonJS({
  "node_modules/cssom/lib/CSSConditionRule.js"(exports) {
    var CSSOM = {
      CSSRule: require_CSSRule().CSSRule,
      CSSGroupingRule: require_CSSGroupingRule().CSSGroupingRule
    };
    CSSOM.CSSConditionRule = function CSSConditionRule() {
      CSSOM.CSSGroupingRule.call(this);
      this.cssRules = [];
    };
    CSSOM.CSSConditionRule.prototype = new CSSOM.CSSGroupingRule();
    CSSOM.CSSConditionRule.prototype.constructor = CSSOM.CSSConditionRule;
    CSSOM.CSSConditionRule.prototype.conditionText = "";
    CSSOM.CSSConditionRule.prototype.cssText = "";
    exports.CSSConditionRule = CSSOM.CSSConditionRule;
  }
});

// node_modules/cssom/lib/CSSMediaRule.js
var require_CSSMediaRule = __commonJS({
  "node_modules/cssom/lib/CSSMediaRule.js"(exports) {
    var CSSOM = {
      CSSRule: require_CSSRule().CSSRule,
      CSSGroupingRule: require_CSSGroupingRule().CSSGroupingRule,
      CSSConditionRule: require_CSSConditionRule().CSSConditionRule,
      MediaList: require_MediaList().MediaList
    };
    CSSOM.CSSMediaRule = function CSSMediaRule() {
      CSSOM.CSSConditionRule.call(this);
      this.media = new CSSOM.MediaList();
    };
    CSSOM.CSSMediaRule.prototype = new CSSOM.CSSConditionRule();
    CSSOM.CSSMediaRule.prototype.constructor = CSSOM.CSSMediaRule;
    CSSOM.CSSMediaRule.prototype.type = 4;
    Object.defineProperties(CSSOM.CSSMediaRule.prototype, {
      "conditionText": {
        get: function() {
          return this.media.mediaText;
        },
        set: function(value) {
          this.media.mediaText = value;
        },
        configurable: true,
        enumerable: true
      },
      "cssText": {
        get: function() {
          var cssTexts = [];
          for (var i = 0, length = this.cssRules.length; i < length; i++) {
            cssTexts.push(this.cssRules[i].cssText);
          }
          return "@media " + this.media.mediaText + " {" + cssTexts.join("") + "}";
        },
        configurable: true,
        enumerable: true
      }
    });
    exports.CSSMediaRule = CSSOM.CSSMediaRule;
  }
});

// node_modules/cssom/lib/CSSSupportsRule.js
var require_CSSSupportsRule = __commonJS({
  "node_modules/cssom/lib/CSSSupportsRule.js"(exports) {
    var CSSOM = {
      CSSRule: require_CSSRule().CSSRule,
      CSSGroupingRule: require_CSSGroupingRule().CSSGroupingRule,
      CSSConditionRule: require_CSSConditionRule().CSSConditionRule
    };
    CSSOM.CSSSupportsRule = function CSSSupportsRule() {
      CSSOM.CSSConditionRule.call(this);
    };
    CSSOM.CSSSupportsRule.prototype = new CSSOM.CSSConditionRule();
    CSSOM.CSSSupportsRule.prototype.constructor = CSSOM.CSSSupportsRule;
    CSSOM.CSSSupportsRule.prototype.type = 12;
    Object.defineProperty(CSSOM.CSSSupportsRule.prototype, "cssText", {
      get: function() {
        var cssTexts = [];
        for (var i = 0, length = this.cssRules.length; i < length; i++) {
          cssTexts.push(this.cssRules[i].cssText);
        }
        return "@supports " + this.conditionText + " {" + cssTexts.join("") + "}";
      }
    });
    exports.CSSSupportsRule = CSSOM.CSSSupportsRule;
  }
});

// node_modules/cssom/lib/CSSFontFaceRule.js
var require_CSSFontFaceRule = __commonJS({
  "node_modules/cssom/lib/CSSFontFaceRule.js"(exports) {
    var CSSOM = {
      CSSStyleDeclaration: require_CSSStyleDeclaration().CSSStyleDeclaration,
      CSSRule: require_CSSRule().CSSRule
    };
    CSSOM.CSSFontFaceRule = function CSSFontFaceRule() {
      CSSOM.CSSRule.call(this);
      this.style = new CSSOM.CSSStyleDeclaration();
      this.style.parentRule = this;
    };
    CSSOM.CSSFontFaceRule.prototype = new CSSOM.CSSRule();
    CSSOM.CSSFontFaceRule.prototype.constructor = CSSOM.CSSFontFaceRule;
    CSSOM.CSSFontFaceRule.prototype.type = 5;
    Object.defineProperty(CSSOM.CSSFontFaceRule.prototype, "cssText", {
      get: function() {
        return "@font-face {" + this.style.cssText + "}";
      }
    });
    exports.CSSFontFaceRule = CSSOM.CSSFontFaceRule;
  }
});

// node_modules/cssom/lib/CSSHostRule.js
var require_CSSHostRule = __commonJS({
  "node_modules/cssom/lib/CSSHostRule.js"(exports) {
    var CSSOM = {
      CSSRule: require_CSSRule().CSSRule
    };
    CSSOM.CSSHostRule = function CSSHostRule() {
      CSSOM.CSSRule.call(this);
      this.cssRules = [];
    };
    CSSOM.CSSHostRule.prototype = new CSSOM.CSSRule();
    CSSOM.CSSHostRule.prototype.constructor = CSSOM.CSSHostRule;
    CSSOM.CSSHostRule.prototype.type = 1001;
    Object.defineProperty(CSSOM.CSSHostRule.prototype, "cssText", {
      get: function() {
        var cssTexts = [];
        for (var i = 0, length = this.cssRules.length; i < length; i++) {
          cssTexts.push(this.cssRules[i].cssText);
        }
        return "@host {" + cssTexts.join("") + "}";
      }
    });
    exports.CSSHostRule = CSSOM.CSSHostRule;
  }
});

// node_modules/cssom/lib/CSSKeyframeRule.js
var require_CSSKeyframeRule = __commonJS({
  "node_modules/cssom/lib/CSSKeyframeRule.js"(exports) {
    var CSSOM = {
      CSSRule: require_CSSRule().CSSRule,
      CSSStyleDeclaration: require_CSSStyleDeclaration().CSSStyleDeclaration
    };
    CSSOM.CSSKeyframeRule = function CSSKeyframeRule() {
      CSSOM.CSSRule.call(this);
      this.keyText = "";
      this.style = new CSSOM.CSSStyleDeclaration();
      this.style.parentRule = this;
    };
    CSSOM.CSSKeyframeRule.prototype = new CSSOM.CSSRule();
    CSSOM.CSSKeyframeRule.prototype.constructor = CSSOM.CSSKeyframeRule;
    CSSOM.CSSKeyframeRule.prototype.type = 8;
    Object.defineProperty(CSSOM.CSSKeyframeRule.prototype, "cssText", {
      get: function() {
        return this.keyText + " {" + this.style.cssText + "} ";
      }
    });
    exports.CSSKeyframeRule = CSSOM.CSSKeyframeRule;
  }
});

// node_modules/cssom/lib/CSSKeyframesRule.js
var require_CSSKeyframesRule = __commonJS({
  "node_modules/cssom/lib/CSSKeyframesRule.js"(exports) {
    var CSSOM = {
      CSSRule: require_CSSRule().CSSRule
    };
    CSSOM.CSSKeyframesRule = function CSSKeyframesRule() {
      CSSOM.CSSRule.call(this);
      this.name = "";
      this.cssRules = [];
    };
    CSSOM.CSSKeyframesRule.prototype = new CSSOM.CSSRule();
    CSSOM.CSSKeyframesRule.prototype.constructor = CSSOM.CSSKeyframesRule;
    CSSOM.CSSKeyframesRule.prototype.type = 7;
    Object.defineProperty(CSSOM.CSSKeyframesRule.prototype, "cssText", {
      get: function() {
        var cssTexts = [];
        for (var i = 0, length = this.cssRules.length; i < length; i++) {
          cssTexts.push("  " + this.cssRules[i].cssText);
        }
        return "@" + (this._vendorPrefix || "") + "keyframes " + this.name + " { \n" + cssTexts.join("\n") + "\n}";
      }
    });
    exports.CSSKeyframesRule = CSSOM.CSSKeyframesRule;
  }
});

// node_modules/cssom/lib/CSSValue.js
var require_CSSValue = __commonJS({
  "node_modules/cssom/lib/CSSValue.js"(exports) {
    var CSSOM = {};
    CSSOM.CSSValue = function CSSValue() {
    };
    CSSOM.CSSValue.prototype = {
      constructor: CSSOM.CSSValue,
      // @see: http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSValue
      set cssText(text) {
        var name = this._getConstructorName();
        throw new Error('DOMException: property "cssText" of "' + name + '" is readonly and can not be replaced with "' + text + '"!');
      },
      get cssText() {
        var name = this._getConstructorName();
        throw new Error('getter "cssText" of "' + name + '" is not implemented!');
      },
      _getConstructorName: function() {
        var s = this.constructor.toString(), c = s.match(/function\s([^\(]+)/), name = c[1];
        return name;
      }
    };
    exports.CSSValue = CSSOM.CSSValue;
  }
});

// node_modules/cssom/lib/CSSValueExpression.js
var require_CSSValueExpression = __commonJS({
  "node_modules/cssom/lib/CSSValueExpression.js"(exports) {
    var CSSOM = {
      CSSValue: require_CSSValue().CSSValue
    };
    CSSOM.CSSValueExpression = function CSSValueExpression(token, idx) {
      this._token = token;
      this._idx = idx;
    };
    CSSOM.CSSValueExpression.prototype = new CSSOM.CSSValue();
    CSSOM.CSSValueExpression.prototype.constructor = CSSOM.CSSValueExpression;
    CSSOM.CSSValueExpression.prototype.parse = function() {
      var token = this._token, idx = this._idx;
      var character = "", expression = "", error = "", info, paren = [];
      for (; ; ++idx) {
        character = token.charAt(idx);
        if (character === "") {
          error = "css expression error: unfinished expression!";
          break;
        }
        switch (character) {
          case "(":
            paren.push(character);
            expression += character;
            break;
          case ")":
            paren.pop(character);
            expression += character;
            break;
          case "/":
            if (info = this._parseJSComment(token, idx)) {
              if (info.error) {
                error = "css expression error: unfinished comment in expression!";
              } else {
                idx = info.idx;
              }
            } else if (info = this._parseJSRexExp(token, idx)) {
              idx = info.idx;
              expression += info.text;
            } else {
              expression += character;
            }
            break;
          case "'":
          case '"':
            info = this._parseJSString(token, idx, character);
            if (info) {
              idx = info.idx;
              expression += info.text;
            } else {
              expression += character;
            }
            break;
          default:
            expression += character;
            break;
        }
        if (error) {
          break;
        }
        if (paren.length === 0) {
          break;
        }
      }
      var ret;
      if (error) {
        ret = {
          error
        };
      } else {
        ret = {
          idx,
          expression
        };
      }
      return ret;
    };
    CSSOM.CSSValueExpression.prototype._parseJSComment = function(token, idx) {
      var nextChar = token.charAt(idx + 1), text;
      if (nextChar === "/" || nextChar === "*") {
        var startIdx = idx, endIdx, commentEndChar;
        if (nextChar === "/") {
          commentEndChar = "\n";
        } else if (nextChar === "*") {
          commentEndChar = "*/";
        }
        endIdx = token.indexOf(commentEndChar, startIdx + 1 + 1);
        if (endIdx !== -1) {
          endIdx = endIdx + commentEndChar.length - 1;
          text = token.substring(idx, endIdx + 1);
          return {
            idx: endIdx,
            text
          };
        } else {
          var error = "css expression error: unfinished comment in expression!";
          return {
            error
          };
        }
      } else {
        return false;
      }
    };
    CSSOM.CSSValueExpression.prototype._parseJSString = function(token, idx, sep) {
      var endIdx = this._findMatchedIdx(token, idx, sep), text;
      if (endIdx === -1) {
        return false;
      } else {
        text = token.substring(idx, endIdx + sep.length);
        return {
          idx: endIdx,
          text
        };
      }
    };
    CSSOM.CSSValueExpression.prototype._parseJSRexExp = function(token, idx) {
      var before2 = token.substring(0, idx).replace(/\s+$/, ""), legalRegx = [
        /^$/,
        /\($/,
        /\[$/,
        /\!$/,
        /\+$/,
        /\-$/,
        /\*$/,
        /\/\s+/,
        /\%$/,
        /\=$/,
        /\>$/,
        /<$/,
        /\&$/,
        /\|$/,
        /\^$/,
        /\~$/,
        /\?$/,
        /\,$/,
        /delete$/,
        /in$/,
        /instanceof$/,
        /new$/,
        /typeof$/,
        /void$/
      ];
      var isLegal = legalRegx.some(function(reg) {
        return reg.test(before2);
      });
      if (!isLegal) {
        return false;
      } else {
        var sep = "/";
        return this._parseJSString(token, idx, sep);
      }
    };
    CSSOM.CSSValueExpression.prototype._findMatchedIdx = function(token, idx, sep) {
      var startIdx = idx, endIdx;
      var NOT_FOUND = -1;
      while (true) {
        endIdx = token.indexOf(sep, startIdx + 1);
        if (endIdx === -1) {
          endIdx = NOT_FOUND;
          break;
        } else {
          var text = token.substring(idx + 1, endIdx), matched = text.match(/\\+$/);
          if (!matched || matched[0] % 2 === 0) {
            break;
          } else {
            startIdx = endIdx;
          }
        }
      }
      var nextNewLineIdx = token.indexOf("\n", idx + 1);
      if (nextNewLineIdx < endIdx) {
        endIdx = NOT_FOUND;
      }
      return endIdx;
    };
    exports.CSSValueExpression = CSSOM.CSSValueExpression;
  }
});

// node_modules/cssom/lib/MatcherList.js
var require_MatcherList = __commonJS({
  "node_modules/cssom/lib/MatcherList.js"(exports) {
    var CSSOM = {};
    CSSOM.MatcherList = function MatcherList() {
      this.length = 0;
    };
    CSSOM.MatcherList.prototype = {
      constructor: CSSOM.MatcherList,
      /**
       * @return {string}
       */
      get matcherText() {
        return Array.prototype.join.call(this, ", ");
      },
      /**
       * @param {string} value
       */
      set matcherText(value) {
        var values = value.split(",");
        var length = this.length = values.length;
        for (var i = 0; i < length; i++) {
          this[i] = values[i].trim();
        }
      },
      /**
       * @param {string} matcher
       */
      appendMatcher: function(matcher) {
        if (Array.prototype.indexOf.call(this, matcher) === -1) {
          this[this.length] = matcher;
          this.length++;
        }
      },
      /**
       * @param {string} matcher
       */
      deleteMatcher: function(matcher) {
        var index = Array.prototype.indexOf.call(this, matcher);
        if (index !== -1) {
          Array.prototype.splice.call(this, index, 1);
        }
      }
    };
    exports.MatcherList = CSSOM.MatcherList;
  }
});

// node_modules/cssom/lib/CSSDocumentRule.js
var require_CSSDocumentRule = __commonJS({
  "node_modules/cssom/lib/CSSDocumentRule.js"(exports) {
    var CSSOM = {
      CSSRule: require_CSSRule().CSSRule,
      MatcherList: require_MatcherList().MatcherList
    };
    CSSOM.CSSDocumentRule = function CSSDocumentRule() {
      CSSOM.CSSRule.call(this);
      this.matcher = new CSSOM.MatcherList();
      this.cssRules = [];
    };
    CSSOM.CSSDocumentRule.prototype = new CSSOM.CSSRule();
    CSSOM.CSSDocumentRule.prototype.constructor = CSSOM.CSSDocumentRule;
    CSSOM.CSSDocumentRule.prototype.type = 10;
    Object.defineProperty(CSSOM.CSSDocumentRule.prototype, "cssText", {
      get: function() {
        var cssTexts = [];
        for (var i = 0, length = this.cssRules.length; i < length; i++) {
          cssTexts.push(this.cssRules[i].cssText);
        }
        return "@-moz-document " + this.matcher.matcherText + " {" + cssTexts.join("") + "}";
      }
    });
    exports.CSSDocumentRule = CSSOM.CSSDocumentRule;
  }
});

// node_modules/cssom/lib/parse.js
var require_parse2 = __commonJS({
  "node_modules/cssom/lib/parse.js"(exports) {
    var CSSOM = {};
    CSSOM.parse = function parse6(token) {
      var i = 0;
      var state = "before-selector";
      var index;
      var buffer = "";
      var valueParenthesisDepth = 0;
      var SIGNIFICANT_WHITESPACE = {
        "selector": true,
        "value": true,
        "value-parenthesis": true,
        "atRule": true,
        "importRule-begin": true,
        "importRule": true,
        "atBlock": true,
        "conditionBlock": true,
        "documentRule-begin": true
      };
      var styleSheet = new CSSOM.CSSStyleSheet();
      var currentScope = styleSheet;
      var parentRule;
      var ancestorRules = [];
      var hasAncestors = false;
      var prevScope;
      var name, priority = "", styleRule, mediaRule, supportsRule, importRule, fontFaceRule, keyframesRule, documentRule, hostRule;
      var atKeyframesRegExp = /@(-(?:\w+-)+)?keyframes/g;
      var parseError = function(message) {
        var lines = token.substring(0, i).split("\n");
        var lineCount = lines.length;
        var charCount = lines.pop().length + 1;
        var error = new Error(message + " (line " + lineCount + ", char " + charCount + ")");
        error.line = lineCount;
        error["char"] = charCount;
        error.styleSheet = styleSheet;
        throw error;
      };
      for (var character; character = token.charAt(i); i++) {
        switch (character) {
          case " ":
          case "	":
          case "\r":
          case "\n":
          case "\f":
            if (SIGNIFICANT_WHITESPACE[state]) {
              buffer += character;
            }
            break;
          case '"':
            index = i + 1;
            do {
              index = token.indexOf('"', index) + 1;
              if (!index) {
                parseError('Unmatched "');
              }
            } while (token[index - 2] === "\\");
            buffer += token.slice(i, index);
            i = index - 1;
            switch (state) {
              case "before-value":
                state = "value";
                break;
              case "importRule-begin":
                state = "importRule";
                break;
            }
            break;
          case "'":
            index = i + 1;
            do {
              index = token.indexOf("'", index) + 1;
              if (!index) {
                parseError("Unmatched '");
              }
            } while (token[index - 2] === "\\");
            buffer += token.slice(i, index);
            i = index - 1;
            switch (state) {
              case "before-value":
                state = "value";
                break;
              case "importRule-begin":
                state = "importRule";
                break;
            }
            break;
          case "/":
            if (token.charAt(i + 1) === "*") {
              i += 2;
              index = token.indexOf("*/", i);
              if (index === -1) {
                parseError("Missing */");
              } else {
                i = index + 1;
              }
            } else {
              buffer += character;
            }
            if (state === "importRule-begin") {
              buffer += " ";
              state = "importRule";
            }
            break;
          case "@":
            if (token.indexOf("@-moz-document", i) === i) {
              state = "documentRule-begin";
              documentRule = new CSSOM.CSSDocumentRule();
              documentRule.__starts = i;
              i += "-moz-document".length;
              buffer = "";
              break;
            } else if (token.indexOf("@media", i) === i) {
              state = "atBlock";
              mediaRule = new CSSOM.CSSMediaRule();
              mediaRule.__starts = i;
              i += "media".length;
              buffer = "";
              break;
            } else if (token.indexOf("@supports", i) === i) {
              state = "conditionBlock";
              supportsRule = new CSSOM.CSSSupportsRule();
              supportsRule.__starts = i;
              i += "supports".length;
              buffer = "";
              break;
            } else if (token.indexOf("@host", i) === i) {
              state = "hostRule-begin";
              i += "host".length;
              hostRule = new CSSOM.CSSHostRule();
              hostRule.__starts = i;
              buffer = "";
              break;
            } else if (token.indexOf("@import", i) === i) {
              state = "importRule-begin";
              i += "import".length;
              buffer += "@import";
              break;
            } else if (token.indexOf("@font-face", i) === i) {
              state = "fontFaceRule-begin";
              i += "font-face".length;
              fontFaceRule = new CSSOM.CSSFontFaceRule();
              fontFaceRule.__starts = i;
              buffer = "";
              break;
            } else {
              atKeyframesRegExp.lastIndex = i;
              var matchKeyframes = atKeyframesRegExp.exec(token);
              if (matchKeyframes && matchKeyframes.index === i) {
                state = "keyframesRule-begin";
                keyframesRule = new CSSOM.CSSKeyframesRule();
                keyframesRule.__starts = i;
                keyframesRule._vendorPrefix = matchKeyframes[1];
                i += matchKeyframes[0].length - 1;
                buffer = "";
                break;
              } else if (state === "selector") {
                state = "atRule";
              }
            }
            buffer += character;
            break;
          case "{":
            if (state === "selector" || state === "atRule") {
              styleRule.selectorText = buffer.trim();
              styleRule.style.__starts = i;
              buffer = "";
              state = "before-name";
            } else if (state === "atBlock") {
              mediaRule.media.mediaText = buffer.trim();
              if (parentRule) {
                ancestorRules.push(parentRule);
              }
              currentScope = parentRule = mediaRule;
              mediaRule.parentStyleSheet = styleSheet;
              buffer = "";
              state = "before-selector";
            } else if (state === "conditionBlock") {
              supportsRule.conditionText = buffer.trim();
              if (parentRule) {
                ancestorRules.push(parentRule);
              }
              currentScope = parentRule = supportsRule;
              supportsRule.parentStyleSheet = styleSheet;
              buffer = "";
              state = "before-selector";
            } else if (state === "hostRule-begin") {
              if (parentRule) {
                ancestorRules.push(parentRule);
              }
              currentScope = parentRule = hostRule;
              hostRule.parentStyleSheet = styleSheet;
              buffer = "";
              state = "before-selector";
            } else if (state === "fontFaceRule-begin") {
              if (parentRule) {
                fontFaceRule.parentRule = parentRule;
              }
              fontFaceRule.parentStyleSheet = styleSheet;
              styleRule = fontFaceRule;
              buffer = "";
              state = "before-name";
            } else if (state === "keyframesRule-begin") {
              keyframesRule.name = buffer.trim();
              if (parentRule) {
                ancestorRules.push(parentRule);
                keyframesRule.parentRule = parentRule;
              }
              keyframesRule.parentStyleSheet = styleSheet;
              currentScope = parentRule = keyframesRule;
              buffer = "";
              state = "keyframeRule-begin";
            } else if (state === "keyframeRule-begin") {
              styleRule = new CSSOM.CSSKeyframeRule();
              styleRule.keyText = buffer.trim();
              styleRule.__starts = i;
              buffer = "";
              state = "before-name";
            } else if (state === "documentRule-begin") {
              documentRule.matcher.matcherText = buffer.trim();
              if (parentRule) {
                ancestorRules.push(parentRule);
                documentRule.parentRule = parentRule;
              }
              currentScope = parentRule = documentRule;
              documentRule.parentStyleSheet = styleSheet;
              buffer = "";
              state = "before-selector";
            }
            break;
          case ":":
            if (state === "name") {
              name = buffer.trim();
              buffer = "";
              state = "before-value";
            } else {
              buffer += character;
            }
            break;
          case "(":
            if (state === "value") {
              if (buffer.trim() === "expression") {
                var info = new CSSOM.CSSValueExpression(token, i).parse();
                if (info.error) {
                  parseError(info.error);
                } else {
                  buffer += info.expression;
                  i = info.idx;
                }
              } else {
                state = "value-parenthesis";
                valueParenthesisDepth = 1;
                buffer += character;
              }
            } else if (state === "value-parenthesis") {
              valueParenthesisDepth++;
              buffer += character;
            } else {
              buffer += character;
            }
            break;
          case ")":
            if (state === "value-parenthesis") {
              valueParenthesisDepth--;
              if (valueParenthesisDepth === 0)
                state = "value";
            }
            buffer += character;
            break;
          case "!":
            if (state === "value" && token.indexOf("!important", i) === i) {
              priority = "important";
              i += "important".length;
            } else {
              buffer += character;
            }
            break;
          case ";":
            switch (state) {
              case "value":
                styleRule.style.setProperty(name, buffer.trim(), priority);
                priority = "";
                buffer = "";
                state = "before-name";
                break;
              case "atRule":
                buffer = "";
                state = "before-selector";
                break;
              case "importRule":
                importRule = new CSSOM.CSSImportRule();
                importRule.parentStyleSheet = importRule.styleSheet.parentStyleSheet = styleSheet;
                importRule.cssText = buffer + character;
                styleSheet.cssRules.push(importRule);
                buffer = "";
                state = "before-selector";
                break;
              default:
                buffer += character;
                break;
            }
            break;
          case "}":
            switch (state) {
              case "value":
                styleRule.style.setProperty(name, buffer.trim(), priority);
                priority = "";
              case "before-name":
              case "name":
                styleRule.__ends = i + 1;
                if (parentRule) {
                  styleRule.parentRule = parentRule;
                }
                styleRule.parentStyleSheet = styleSheet;
                currentScope.cssRules.push(styleRule);
                buffer = "";
                if (currentScope.constructor === CSSOM.CSSKeyframesRule) {
                  state = "keyframeRule-begin";
                } else {
                  state = "before-selector";
                }
                break;
              case "keyframeRule-begin":
              case "before-selector":
              case "selector":
                if (!parentRule) {
                  parseError("Unexpected }");
                }
                hasAncestors = ancestorRules.length > 0;
                while (ancestorRules.length > 0) {
                  parentRule = ancestorRules.pop();
                  if (parentRule.constructor.name === "CSSMediaRule" || parentRule.constructor.name === "CSSSupportsRule") {
                    prevScope = currentScope;
                    currentScope = parentRule;
                    currentScope.cssRules.push(prevScope);
                    break;
                  }
                  if (ancestorRules.length === 0) {
                    hasAncestors = false;
                  }
                }
                if (!hasAncestors) {
                  currentScope.__ends = i + 1;
                  styleSheet.cssRules.push(currentScope);
                  currentScope = styleSheet;
                  parentRule = null;
                }
                buffer = "";
                state = "before-selector";
                break;
            }
            break;
          default:
            switch (state) {
              case "before-selector":
                state = "selector";
                styleRule = new CSSOM.CSSStyleRule();
                styleRule.__starts = i;
                break;
              case "before-name":
                state = "name";
                break;
              case "before-value":
                state = "value";
                break;
              case "importRule-begin":
                state = "importRule";
                break;
            }
            buffer += character;
            break;
        }
      }
      return styleSheet;
    };
    exports.parse = CSSOM.parse;
    CSSOM.CSSStyleSheet = require_CSSStyleSheet().CSSStyleSheet;
    CSSOM.CSSStyleRule = require_CSSStyleRule().CSSStyleRule;
    CSSOM.CSSImportRule = require_CSSImportRule().CSSImportRule;
    CSSOM.CSSGroupingRule = require_CSSGroupingRule().CSSGroupingRule;
    CSSOM.CSSMediaRule = require_CSSMediaRule().CSSMediaRule;
    CSSOM.CSSConditionRule = require_CSSConditionRule().CSSConditionRule;
    CSSOM.CSSSupportsRule = require_CSSSupportsRule().CSSSupportsRule;
    CSSOM.CSSFontFaceRule = require_CSSFontFaceRule().CSSFontFaceRule;
    CSSOM.CSSHostRule = require_CSSHostRule().CSSHostRule;
    CSSOM.CSSStyleDeclaration = require_CSSStyleDeclaration().CSSStyleDeclaration;
    CSSOM.CSSKeyframeRule = require_CSSKeyframeRule().CSSKeyframeRule;
    CSSOM.CSSKeyframesRule = require_CSSKeyframesRule().CSSKeyframesRule;
    CSSOM.CSSValueExpression = require_CSSValueExpression().CSSValueExpression;
    CSSOM.CSSDocumentRule = require_CSSDocumentRule().CSSDocumentRule;
  }
});

// node_modules/cssom/lib/CSSStyleDeclaration.js
var require_CSSStyleDeclaration = __commonJS({
  "node_modules/cssom/lib/CSSStyleDeclaration.js"(exports) {
    var CSSOM = {};
    CSSOM.CSSStyleDeclaration = function CSSStyleDeclaration2() {
      this.length = 0;
      this.parentRule = null;
      this._importants = {};
    };
    CSSOM.CSSStyleDeclaration.prototype = {
      constructor: CSSOM.CSSStyleDeclaration,
      /**
       *
       * @param {string} name
       * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-getPropertyValue
       * @return {string} the value of the property if it has been explicitly set for this declaration block.
       * Returns the empty string if the property has not been set.
       */
      getPropertyValue: function(name) {
        return this[name] || "";
      },
      /**
       *
       * @param {string} name
       * @param {string} value
       * @param {string} [priority=null] "important" or null
       * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-setProperty
       */
      setProperty: function(name, value, priority) {
        if (this[name]) {
          var index = Array.prototype.indexOf.call(this, name);
          if (index < 0) {
            this[this.length] = name;
            this.length++;
          }
        } else {
          this[this.length] = name;
          this.length++;
        }
        this[name] = value + "";
        this._importants[name] = priority;
      },
      /**
       *
       * @param {string} name
       * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-removeProperty
       * @return {string} the value of the property if it has been explicitly set for this declaration block.
       * Returns the empty string if the property has not been set or the property name does not correspond to a known CSS property.
       */
      removeProperty: function(name) {
        if (!(name in this)) {
          return "";
        }
        var index = Array.prototype.indexOf.call(this, name);
        if (index < 0) {
          return "";
        }
        var prevValue = this[name];
        this[name] = "";
        Array.prototype.splice.call(this, index, 1);
        return prevValue;
      },
      getPropertyCSSValue: function() {
      },
      /**
       *
       * @param {String} name
       */
      getPropertyPriority: function(name) {
        return this._importants[name] || "";
      },
      /**
       *   element.style.overflow = "auto"
       *   element.style.getPropertyShorthand("overflow-x")
       *   -> "overflow"
       */
      getPropertyShorthand: function() {
      },
      isPropertyImplicit: function() {
      },
      // Doesn't work in IE < 9
      get cssText() {
        var properties = [];
        for (var i = 0, length = this.length; i < length; ++i) {
          var name = this[i];
          var value = this.getPropertyValue(name);
          var priority = this.getPropertyPriority(name);
          if (priority) {
            priority = " !" + priority;
          }
          properties[i] = name + ": " + value + priority + ";";
        }
        return properties.join(" ");
      },
      set cssText(text) {
        var i, name;
        for (i = this.length; i--; ) {
          name = this[i];
          this[name] = "";
        }
        Array.prototype.splice.call(this, 0, this.length);
        this._importants = {};
        var dummyRule = CSSOM.parse("#bogus{" + text + "}").cssRules[0].style;
        var length = dummyRule.length;
        for (i = 0; i < length; ++i) {
          name = dummyRule[i];
          this.setProperty(dummyRule[i], dummyRule.getPropertyValue(name), dummyRule.getPropertyPriority(name));
        }
      }
    };
    exports.CSSStyleDeclaration = CSSOM.CSSStyleDeclaration;
    CSSOM.parse = require_parse2().parse;
  }
});

// node_modules/cssom/lib/clone.js
var require_clone = __commonJS({
  "node_modules/cssom/lib/clone.js"(exports) {
    var CSSOM = {
      CSSStyleSheet: require_CSSStyleSheet().CSSStyleSheet,
      CSSRule: require_CSSRule().CSSRule,
      CSSStyleRule: require_CSSStyleRule().CSSStyleRule,
      CSSGroupingRule: require_CSSGroupingRule().CSSGroupingRule,
      CSSConditionRule: require_CSSConditionRule().CSSConditionRule,
      CSSMediaRule: require_CSSMediaRule().CSSMediaRule,
      CSSSupportsRule: require_CSSSupportsRule().CSSSupportsRule,
      CSSStyleDeclaration: require_CSSStyleDeclaration().CSSStyleDeclaration,
      CSSKeyframeRule: require_CSSKeyframeRule().CSSKeyframeRule,
      CSSKeyframesRule: require_CSSKeyframesRule().CSSKeyframesRule
    };
    CSSOM.clone = function clone(stylesheet) {
      var cloned = new CSSOM.CSSStyleSheet();
      var rules = stylesheet.cssRules;
      if (!rules) {
        return cloned;
      }
      for (var i = 0, rulesLength = rules.length; i < rulesLength; i++) {
        var rule = rules[i];
        var ruleClone = cloned.cssRules[i] = new rule.constructor();
        var style = rule.style;
        if (style) {
          var styleClone = ruleClone.style = new CSSOM.CSSStyleDeclaration();
          for (var j = 0, styleLength = style.length; j < styleLength; j++) {
            var name = styleClone[j] = style[j];
            styleClone[name] = style[name];
            styleClone._importants[name] = style.getPropertyPriority(name);
          }
          styleClone.length = style.length;
        }
        if (rule.hasOwnProperty("keyText")) {
          ruleClone.keyText = rule.keyText;
        }
        if (rule.hasOwnProperty("selectorText")) {
          ruleClone.selectorText = rule.selectorText;
        }
        if (rule.hasOwnProperty("mediaText")) {
          ruleClone.mediaText = rule.mediaText;
        }
        if (rule.hasOwnProperty("conditionText")) {
          ruleClone.conditionText = rule.conditionText;
        }
        if (rule.hasOwnProperty("cssRules")) {
          ruleClone.cssRules = clone(rule).cssRules;
        }
      }
      return cloned;
    };
    exports.clone = CSSOM.clone;
  }
});

// node_modules/cssom/lib/index.js
var require_lib = __commonJS({
  "node_modules/cssom/lib/index.js"(exports) {
    "use strict";
    exports.CSSStyleDeclaration = require_CSSStyleDeclaration().CSSStyleDeclaration;
    exports.CSSRule = require_CSSRule().CSSRule;
    exports.CSSGroupingRule = require_CSSGroupingRule().CSSGroupingRule;
    exports.CSSConditionRule = require_CSSConditionRule().CSSConditionRule;
    exports.CSSStyleRule = require_CSSStyleRule().CSSStyleRule;
    exports.MediaList = require_MediaList().MediaList;
    exports.CSSMediaRule = require_CSSMediaRule().CSSMediaRule;
    exports.CSSSupportsRule = require_CSSSupportsRule().CSSSupportsRule;
    exports.CSSImportRule = require_CSSImportRule().CSSImportRule;
    exports.CSSFontFaceRule = require_CSSFontFaceRule().CSSFontFaceRule;
    exports.CSSHostRule = require_CSSHostRule().CSSHostRule;
    exports.StyleSheet = require_StyleSheet().StyleSheet;
    exports.CSSStyleSheet = require_CSSStyleSheet().CSSStyleSheet;
    exports.CSSKeyframesRule = require_CSSKeyframesRule().CSSKeyframesRule;
    exports.CSSKeyframeRule = require_CSSKeyframeRule().CSSKeyframeRule;
    exports.MatcherList = require_MatcherList().MatcherList;
    exports.CSSDocumentRule = require_CSSDocumentRule().CSSDocumentRule;
    exports.CSSValue = require_CSSValue().CSSValue;
    exports.CSSValueExpression = require_CSSValueExpression().CSSValueExpression;
    exports.parse = require_parse2().parse;
    exports.clone = require_clone().clone;
  }
});

// node_modules/linkedom/esm/html/style-element.js
var import_cssom, tagName4, HTMLStyleElement;
var init_style_element = __esm({
  "node_modules/linkedom/esm/html/style-element.js"() {
    import_cssom = __toESM(require_lib(), 1);
    init_register_html_class();
    init_symbols();
    init_text_element();
    tagName4 = "style";
    HTMLStyleElement = class extends TextElement {
      constructor(ownerDocument, localName = tagName4) {
        super(ownerDocument, localName);
        this[SHEET] = null;
      }
      get sheet() {
        const sheet = this[SHEET];
        if (sheet !== null) {
          return sheet;
        }
        return this[SHEET] = (0, import_cssom.parse)(this.textContent);
      }
      get innerHTML() {
        return super.innerHTML || "";
      }
      set innerHTML(value) {
        super.textContent = value;
        this[SHEET] = null;
      }
      get innerText() {
        return super.innerText || "";
      }
      set innerText(value) {
        super.textContent = value;
        this[SHEET] = null;
      }
      get textContent() {
        return super.textContent || "";
      }
      set textContent(value) {
        super.textContent = value;
        this[SHEET] = null;
      }
    };
    registerHTMLClass(tagName4, HTMLStyleElement);
  }
});

// node_modules/linkedom/esm/html/time-element.js
var HTMLTimeElement;
var init_time_element = __esm({
  "node_modules/linkedom/esm/html/time-element.js"() {
    init_element3();
    HTMLTimeElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "time") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/field-set-element.js
var HTMLFieldSetElement;
var init_field_set_element = __esm({
  "node_modules/linkedom/esm/html/field-set-element.js"() {
    init_element3();
    HTMLFieldSetElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "fieldset") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/embed-element.js
var HTMLEmbedElement;
var init_embed_element = __esm({
  "node_modules/linkedom/esm/html/embed-element.js"() {
    init_element3();
    HTMLEmbedElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "embed") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/hr-element.js
var HTMLHRElement;
var init_hr_element = __esm({
  "node_modules/linkedom/esm/html/hr-element.js"() {
    init_element3();
    HTMLHRElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "hr") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/progress-element.js
var HTMLProgressElement;
var init_progress_element = __esm({
  "node_modules/linkedom/esm/html/progress-element.js"() {
    init_element3();
    HTMLProgressElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "progress") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/paragraph-element.js
var HTMLParagraphElement;
var init_paragraph_element = __esm({
  "node_modules/linkedom/esm/html/paragraph-element.js"() {
    init_element3();
    HTMLParagraphElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "p") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/table-element.js
var HTMLTableElement;
var init_table_element = __esm({
  "node_modules/linkedom/esm/html/table-element.js"() {
    init_element3();
    HTMLTableElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "table") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/frame-set-element.js
var HTMLFrameSetElement;
var init_frame_set_element = __esm({
  "node_modules/linkedom/esm/html/frame-set-element.js"() {
    init_element3();
    HTMLFrameSetElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "frameset") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/li-element.js
var HTMLLIElement;
var init_li_element = __esm({
  "node_modules/linkedom/esm/html/li-element.js"() {
    init_element3();
    HTMLLIElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "li") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/base-element.js
var HTMLBaseElement;
var init_base_element = __esm({
  "node_modules/linkedom/esm/html/base-element.js"() {
    init_element3();
    HTMLBaseElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "base") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/data-list-element.js
var HTMLDataListElement;
var init_data_list_element = __esm({
  "node_modules/linkedom/esm/html/data-list-element.js"() {
    init_element3();
    HTMLDataListElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "datalist") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/input-element.js
var tagName5, HTMLInputElement;
var init_input_element = __esm({
  "node_modules/linkedom/esm/html/input-element.js"() {
    init_register_html_class();
    init_attributes();
    init_element3();
    tagName5 = "input";
    HTMLInputElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName5) {
        super(ownerDocument, localName);
      }
      /* c8 ignore start */
      get autofocus() {
        return booleanAttribute.get(this, "autofocus") || -1;
      }
      set autofocus(value) {
        booleanAttribute.set(this, "autofocus", value);
      }
      get disabled() {
        return booleanAttribute.get(this, "disabled");
      }
      set disabled(value) {
        booleanAttribute.set(this, "disabled", value);
      }
      get name() {
        return this.getAttribute("name");
      }
      set name(value) {
        this.setAttribute("name", value);
      }
      get placeholder() {
        return this.getAttribute("placeholder");
      }
      set placeholder(value) {
        this.setAttribute("placeholder", value);
      }
      get type() {
        return this.getAttribute("type");
      }
      set type(value) {
        this.setAttribute("type", value);
      }
      get value() {
        return stringAttribute.get(this, "value");
      }
      set value(value) {
        stringAttribute.set(this, "value", value);
      }
      /* c8 ignore stop */
    };
    registerHTMLClass(tagName5, HTMLInputElement);
  }
});

// node_modules/linkedom/esm/html/param-element.js
var HTMLParamElement;
var init_param_element = __esm({
  "node_modules/linkedom/esm/html/param-element.js"() {
    init_element3();
    HTMLParamElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "param") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/media-element.js
var HTMLMediaElement;
var init_media_element = __esm({
  "node_modules/linkedom/esm/html/media-element.js"() {
    init_element3();
    HTMLMediaElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "media") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/audio-element.js
var HTMLAudioElement;
var init_audio_element = __esm({
  "node_modules/linkedom/esm/html/audio-element.js"() {
    init_element3();
    HTMLAudioElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "audio") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/heading-element.js
var tagName6, HTMLHeadingElement;
var init_heading_element = __esm({
  "node_modules/linkedom/esm/html/heading-element.js"() {
    init_register_html_class();
    init_element3();
    tagName6 = "h1";
    HTMLHeadingElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName6) {
        super(ownerDocument, localName);
      }
    };
    registerHTMLClass([tagName6, "h2", "h3", "h4", "h5", "h6"], HTMLHeadingElement);
  }
});

// node_modules/linkedom/esm/html/directory-element.js
var HTMLDirectoryElement;
var init_directory_element = __esm({
  "node_modules/linkedom/esm/html/directory-element.js"() {
    init_element3();
    HTMLDirectoryElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "dir") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/quote-element.js
var HTMLQuoteElement;
var init_quote_element = __esm({
  "node_modules/linkedom/esm/html/quote-element.js"() {
    init_element3();
    HTMLQuoteElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "quote") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/commonjs/canvas-shim.cjs
var require_canvas_shim = __commonJS({
  "node_modules/linkedom/commonjs/canvas-shim.cjs"(exports, module2) {
    var Canvas2 = class {
      constructor(width, height) {
        this.width = width;
        this.height = height;
      }
      getContext() {
        return null;
      }
      toDataURL() {
        return "";
      }
    };
    module2.exports = {
      createCanvas: (width, height) => new Canvas2(width, height)
    };
  }
});

// node_modules/linkedom/commonjs/canvas.cjs
var require_canvas = __commonJS({
  "node_modules/linkedom/commonjs/canvas.cjs"(exports, module2) {
    try {
      module2.exports = require("canvas");
    } catch (fallback) {
      module2.exports = require_canvas_shim();
    }
  }
});

// node_modules/linkedom/esm/html/canvas-element.js
var import_canvas, createCanvas, tagName7, HTMLCanvasElement;
var init_canvas_element = __esm({
  "node_modules/linkedom/esm/html/canvas-element.js"() {
    init_symbols();
    init_register_html_class();
    init_attributes();
    import_canvas = __toESM(require_canvas(), 1);
    init_element3();
    ({ createCanvas } = import_canvas.default);
    tagName7 = "canvas";
    HTMLCanvasElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName7) {
        super(ownerDocument, localName);
        this[IMAGE] = createCanvas(300, 150);
      }
      get width() {
        return this[IMAGE].width;
      }
      set width(value) {
        numericAttribute.set(this, "width", value);
        this[IMAGE].width = value;
      }
      get height() {
        return this[IMAGE].height;
      }
      set height(value) {
        numericAttribute.set(this, "height", value);
        this[IMAGE].height = value;
      }
      getContext(type) {
        return this[IMAGE].getContext(type);
      }
      toDataURL(...args) {
        return this[IMAGE].toDataURL(...args);
      }
    };
    registerHTMLClass(tagName7, HTMLCanvasElement);
  }
});

// node_modules/linkedom/esm/html/legend-element.js
var HTMLLegendElement;
var init_legend_element = __esm({
  "node_modules/linkedom/esm/html/legend-element.js"() {
    init_element3();
    HTMLLegendElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "legend") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/option-element.js
var tagName8, HTMLOptionElement;
var init_option_element = __esm({
  "node_modules/linkedom/esm/html/option-element.js"() {
    init_element3();
    init_attributes();
    init_register_html_class();
    tagName8 = "option";
    HTMLOptionElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName8) {
        super(ownerDocument, localName);
      }
      /* c8 ignore start */
      get value() {
        return stringAttribute.get(this, "value");
      }
      set value(value) {
        stringAttribute.set(this, "value", value);
      }
      /* c8 ignore stop */
      get selected() {
        return booleanAttribute.get(this, "selected");
      }
      set selected(value) {
        const option = this.parentElement?.querySelector("option[selected]");
        if (option && option !== this)
          option.selected = false;
        booleanAttribute.set(this, "selected", value);
      }
    };
    registerHTMLClass(tagName8, HTMLOptionElement);
  }
});

// node_modules/linkedom/esm/html/span-element.js
var HTMLSpanElement;
var init_span_element = __esm({
  "node_modules/linkedom/esm/html/span-element.js"() {
    init_element3();
    HTMLSpanElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "span") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/meter-element.js
var HTMLMeterElement;
var init_meter_element = __esm({
  "node_modules/linkedom/esm/html/meter-element.js"() {
    init_element3();
    HTMLMeterElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "meter") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/video-element.js
var HTMLVideoElement;
var init_video_element = __esm({
  "node_modules/linkedom/esm/html/video-element.js"() {
    init_element3();
    HTMLVideoElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "video") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/table-cell-element.js
var HTMLTableCellElement;
var init_table_cell_element = __esm({
  "node_modules/linkedom/esm/html/table-cell-element.js"() {
    init_element3();
    HTMLTableCellElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "td") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/title-element.js
var tagName9, HTMLTitleElement;
var init_title_element = __esm({
  "node_modules/linkedom/esm/html/title-element.js"() {
    init_register_html_class();
    init_text_element();
    tagName9 = "title";
    HTMLTitleElement = class extends TextElement {
      constructor(ownerDocument, localName = tagName9) {
        super(ownerDocument, localName);
      }
    };
    registerHTMLClass(tagName9, HTMLTitleElement);
  }
});

// node_modules/linkedom/esm/html/output-element.js
var HTMLOutputElement;
var init_output_element = __esm({
  "node_modules/linkedom/esm/html/output-element.js"() {
    init_element3();
    HTMLOutputElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "output") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/table-row-element.js
var HTMLTableRowElement;
var init_table_row_element = __esm({
  "node_modules/linkedom/esm/html/table-row-element.js"() {
    init_element3();
    HTMLTableRowElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "tr") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/data-element.js
var HTMLDataElement;
var init_data_element = __esm({
  "node_modules/linkedom/esm/html/data-element.js"() {
    init_element3();
    HTMLDataElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "data") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/menu-element.js
var HTMLMenuElement;
var init_menu_element = __esm({
  "node_modules/linkedom/esm/html/menu-element.js"() {
    init_element3();
    HTMLMenuElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "menu") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/select-element.js
var tagName10, HTMLSelectElement;
var init_select_element = __esm({
  "node_modules/linkedom/esm/html/select-element.js"() {
    init_register_html_class();
    init_attributes();
    init_element3();
    init_node_list();
    tagName10 = "select";
    HTMLSelectElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName10) {
        super(ownerDocument, localName);
      }
      get options() {
        let children = new NodeList();
        let { firstElementChild } = this;
        while (firstElementChild) {
          if (firstElementChild.tagName === "OPTGROUP")
            children.push(...firstElementChild.children);
          else
            children.push(firstElementChild);
          firstElementChild = firstElementChild.nextElementSibling;
        }
        return children;
      }
      /* c8 ignore start */
      get disabled() {
        return booleanAttribute.get(this, "disabled");
      }
      set disabled(value) {
        booleanAttribute.set(this, "disabled", value);
      }
      get name() {
        return this.getAttribute("name");
      }
      set name(value) {
        this.setAttribute("name", value);
      }
      /* c8 ignore stop */
      get value() {
        return this.querySelector("option[selected]")?.value;
      }
    };
    registerHTMLClass(tagName10, HTMLSelectElement);
  }
});

// node_modules/linkedom/esm/html/br-element.js
var HTMLBRElement;
var init_br_element = __esm({
  "node_modules/linkedom/esm/html/br-element.js"() {
    init_element3();
    HTMLBRElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "br") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/button-element.js
var tagName11, HTMLButtonElement;
var init_button_element = __esm({
  "node_modules/linkedom/esm/html/button-element.js"() {
    init_register_html_class();
    init_attributes();
    init_element3();
    tagName11 = "button";
    HTMLButtonElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName11) {
        super(ownerDocument, localName);
      }
      /* c8 ignore start */
      get disabled() {
        return booleanAttribute.get(this, "disabled");
      }
      set disabled(value) {
        booleanAttribute.set(this, "disabled", value);
      }
      get name() {
        return this.getAttribute("name");
      }
      set name(value) {
        this.setAttribute("name", value);
      }
      get type() {
        return this.getAttribute("type");
      }
      set type(value) {
        this.setAttribute("type", value);
      }
      /* c8 ignore stop */
    };
    registerHTMLClass(tagName11, HTMLButtonElement);
  }
});

// node_modules/linkedom/esm/html/map-element.js
var HTMLMapElement;
var init_map_element = __esm({
  "node_modules/linkedom/esm/html/map-element.js"() {
    init_element3();
    HTMLMapElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "map") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/opt-group-element.js
var HTMLOptGroupElement;
var init_opt_group_element = __esm({
  "node_modules/linkedom/esm/html/opt-group-element.js"() {
    init_element3();
    HTMLOptGroupElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "optgroup") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/d-list-element.js
var HTMLDListElement;
var init_d_list_element = __esm({
  "node_modules/linkedom/esm/html/d-list-element.js"() {
    init_element3();
    HTMLDListElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "dl") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/text-area-element.js
var tagName12, HTMLTextAreaElement;
var init_text_area_element = __esm({
  "node_modules/linkedom/esm/html/text-area-element.js"() {
    init_register_html_class();
    init_attributes();
    init_text_element();
    tagName12 = "textarea";
    HTMLTextAreaElement = class extends TextElement {
      constructor(ownerDocument, localName = tagName12) {
        super(ownerDocument, localName);
      }
      /* c8 ignore start */
      get disabled() {
        return booleanAttribute.get(this, "disabled");
      }
      set disabled(value) {
        booleanAttribute.set(this, "disabled", value);
      }
      get name() {
        return this.getAttribute("name");
      }
      set name(value) {
        this.setAttribute("name", value);
      }
      get placeholder() {
        return this.getAttribute("placeholder");
      }
      set placeholder(value) {
        this.setAttribute("placeholder", value);
      }
      get type() {
        return this.getAttribute("type");
      }
      set type(value) {
        this.setAttribute("type", value);
      }
      get value() {
        return this.textContent;
      }
      set value(content) {
        this.textContent = content;
      }
      /* c8 ignore stop */
    };
    registerHTMLClass(tagName12, HTMLTextAreaElement);
  }
});

// node_modules/linkedom/esm/html/font-element.js
var HTMLFontElement;
var init_font_element = __esm({
  "node_modules/linkedom/esm/html/font-element.js"() {
    init_element3();
    HTMLFontElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "font") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/div-element.js
var HTMLDivElement;
var init_div_element = __esm({
  "node_modules/linkedom/esm/html/div-element.js"() {
    init_element3();
    HTMLDivElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "div") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/link-element.js
var tagName13, HTMLLinkElement;
var init_link_element = __esm({
  "node_modules/linkedom/esm/html/link-element.js"() {
    init_register_html_class();
    init_attributes();
    init_element3();
    tagName13 = "link";
    HTMLLinkElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName13) {
        super(ownerDocument, localName);
      }
      /* c8 ignore start */
      // copy paste from img.src, already covered
      get disabled() {
        return booleanAttribute.get(this, "disabled");
      }
      set disabled(value) {
        booleanAttribute.set(this, "disabled", value);
      }
      get href() {
        return stringAttribute.get(this, "href");
      }
      set href(value) {
        stringAttribute.set(this, "href", value);
      }
      get hreflang() {
        return stringAttribute.get(this, "hreflang");
      }
      set hreflang(value) {
        stringAttribute.set(this, "hreflang", value);
      }
      get media() {
        return stringAttribute.get(this, "media");
      }
      set media(value) {
        stringAttribute.set(this, "media", value);
      }
      get rel() {
        return stringAttribute.get(this, "rel");
      }
      set rel(value) {
        stringAttribute.set(this, "rel", value);
      }
      get type() {
        return stringAttribute.get(this, "type");
      }
      set type(value) {
        stringAttribute.set(this, "type", value);
      }
      /* c8 ignore stop */
    };
    registerHTMLClass(tagName13, HTMLLinkElement);
  }
});

// node_modules/linkedom/esm/html/slot-element.js
var HTMLSlotElement;
var init_slot_element = __esm({
  "node_modules/linkedom/esm/html/slot-element.js"() {
    init_element3();
    HTMLSlotElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "slot") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/form-element.js
var HTMLFormElement;
var init_form_element = __esm({
  "node_modules/linkedom/esm/html/form-element.js"() {
    init_element3();
    HTMLFormElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "form") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/image-element.js
var tagName14, HTMLImageElement;
var init_image_element = __esm({
  "node_modules/linkedom/esm/html/image-element.js"() {
    init_register_html_class();
    init_attributes();
    init_element3();
    tagName14 = "img";
    HTMLImageElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName14) {
        super(ownerDocument, localName);
      }
      /* c8 ignore start */
      get alt() {
        return stringAttribute.get(this, "alt");
      }
      set alt(value) {
        stringAttribute.set(this, "alt", value);
      }
      get sizes() {
        return stringAttribute.get(this, "sizes");
      }
      set sizes(value) {
        stringAttribute.set(this, "sizes", value);
      }
      get src() {
        return stringAttribute.get(this, "src");
      }
      set src(value) {
        stringAttribute.set(this, "src", value);
      }
      get srcset() {
        return stringAttribute.get(this, "srcset");
      }
      set srcset(value) {
        stringAttribute.set(this, "srcset", value);
      }
      get title() {
        return stringAttribute.get(this, "title");
      }
      set title(value) {
        stringAttribute.set(this, "title", value);
      }
      get width() {
        return numericAttribute.get(this, "width");
      }
      set width(value) {
        numericAttribute.set(this, "width", value);
      }
      get height() {
        return numericAttribute.get(this, "height");
      }
      set height(value) {
        numericAttribute.set(this, "height", value);
      }
      /* c8 ignore stop */
    };
    registerHTMLClass(tagName14, HTMLImageElement);
  }
});

// node_modules/linkedom/esm/html/pre-element.js
var HTMLPreElement;
var init_pre_element = __esm({
  "node_modules/linkedom/esm/html/pre-element.js"() {
    init_element3();
    HTMLPreElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "pre") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/u-list-element.js
var HTMLUListElement;
var init_u_list_element = __esm({
  "node_modules/linkedom/esm/html/u-list-element.js"() {
    init_element3();
    HTMLUListElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "ul") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/meta-element.js
var tagName15, HTMLMetaElement;
var init_meta_element = __esm({
  "node_modules/linkedom/esm/html/meta-element.js"() {
    init_element3();
    init_register_html_class();
    init_attributes();
    tagName15 = "meta";
    HTMLMetaElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName15) {
        super(ownerDocument, localName);
      }
      /* c8 ignore start */
      get name() {
        return stringAttribute.get(this, "name");
      }
      set name(value) {
        stringAttribute.set(this, "name", value);
      }
      get httpEquiv() {
        return stringAttribute.get(this, "http-equiv");
      }
      set httpEquiv(value) {
        stringAttribute.set(this, "http-equiv", value);
      }
      get content() {
        return stringAttribute.get(this, "content");
      }
      set content(value) {
        stringAttribute.set(this, "content", value);
      }
      get charset() {
        return stringAttribute.get(this, "charset");
      }
      set charset(value) {
        stringAttribute.set(this, "charset", value);
      }
      get media() {
        return stringAttribute.get(this, "media");
      }
      set media(value) {
        stringAttribute.set(this, "media", value);
      }
      /* c8 ignore stop */
    };
    registerHTMLClass(tagName15, HTMLMetaElement);
  }
});

// node_modules/linkedom/esm/html/picture-element.js
var HTMLPictureElement;
var init_picture_element = __esm({
  "node_modules/linkedom/esm/html/picture-element.js"() {
    init_element3();
    HTMLPictureElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "picture") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/area-element.js
var HTMLAreaElement;
var init_area_element = __esm({
  "node_modules/linkedom/esm/html/area-element.js"() {
    init_element3();
    HTMLAreaElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "area") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/o-list-element.js
var HTMLOListElement;
var init_o_list_element = __esm({
  "node_modules/linkedom/esm/html/o-list-element.js"() {
    init_element3();
    HTMLOListElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "ol") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/table-caption-element.js
var HTMLTableCaptionElement;
var init_table_caption_element = __esm({
  "node_modules/linkedom/esm/html/table-caption-element.js"() {
    init_element3();
    HTMLTableCaptionElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "caption") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/anchor-element.js
var tagName16, HTMLAnchorElement;
var init_anchor_element = __esm({
  "node_modules/linkedom/esm/html/anchor-element.js"() {
    init_register_html_class();
    init_attributes();
    init_element3();
    tagName16 = "a";
    HTMLAnchorElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName16) {
        super(ownerDocument, localName);
      }
      /* c8 ignore start */
      // copy paste from img.src, already covered
      get href() {
        return encodeURI(stringAttribute.get(this, "href"));
      }
      set href(value) {
        stringAttribute.set(this, "href", decodeURI(value));
      }
      get download() {
        return encodeURI(stringAttribute.get(this, "download"));
      }
      set download(value) {
        stringAttribute.set(this, "download", decodeURI(value));
      }
      get target() {
        return stringAttribute.get(this, "target");
      }
      set target(value) {
        stringAttribute.set(this, "target", value);
      }
      get type() {
        return stringAttribute.get(this, "type");
      }
      set type(value) {
        stringAttribute.set(this, "type", value);
      }
      /* c8 ignore stop */
    };
    registerHTMLClass(tagName16, HTMLAnchorElement);
  }
});

// node_modules/linkedom/esm/html/label-element.js
var HTMLLabelElement;
var init_label_element = __esm({
  "node_modules/linkedom/esm/html/label-element.js"() {
    init_element3();
    HTMLLabelElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "label") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/unknown-element.js
var HTMLUnknownElement;
var init_unknown_element = __esm({
  "node_modules/linkedom/esm/html/unknown-element.js"() {
    init_element3();
    HTMLUnknownElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "unknown") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/mod-element.js
var HTMLModElement;
var init_mod_element = __esm({
  "node_modules/linkedom/esm/html/mod-element.js"() {
    init_element3();
    HTMLModElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "mod") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/details-element.js
var HTMLDetailsElement;
var init_details_element = __esm({
  "node_modules/linkedom/esm/html/details-element.js"() {
    init_element3();
    HTMLDetailsElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "details") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/source-element.js
var tagName17, HTMLSourceElement;
var init_source_element = __esm({
  "node_modules/linkedom/esm/html/source-element.js"() {
    init_register_html_class();
    init_attributes();
    init_element3();
    tagName17 = "source";
    HTMLSourceElement = class extends HTMLElement {
      constructor(ownerDocument, localName = tagName17) {
        super(ownerDocument, localName);
      }
      /* c8 ignore start */
      get src() {
        return stringAttribute.get(this, "src");
      }
      set src(value) {
        stringAttribute.set(this, "src", value);
      }
      get srcset() {
        return stringAttribute.get(this, "srcset");
      }
      set srcset(value) {
        stringAttribute.set(this, "srcset", value);
      }
      get sizes() {
        return stringAttribute.get(this, "sizes");
      }
      set sizes(value) {
        stringAttribute.set(this, "sizes", value);
      }
      get type() {
        return stringAttribute.get(this, "type");
      }
      set type(value) {
        stringAttribute.set(this, "type", value);
      }
      /* c8 ignore stop */
    };
    registerHTMLClass(tagName17, HTMLSourceElement);
  }
});

// node_modules/linkedom/esm/html/track-element.js
var HTMLTrackElement;
var init_track_element = __esm({
  "node_modules/linkedom/esm/html/track-element.js"() {
    init_element3();
    HTMLTrackElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "track") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/html/marquee-element.js
var HTMLMarqueeElement;
var init_marquee_element = __esm({
  "node_modules/linkedom/esm/html/marquee-element.js"() {
    init_element3();
    HTMLMarqueeElement = class extends HTMLElement {
      constructor(ownerDocument, localName = "marquee") {
        super(ownerDocument, localName);
      }
    };
  }
});

// node_modules/linkedom/esm/shared/html-classes.js
var HTMLClasses;
var init_html_classes = __esm({
  "node_modules/linkedom/esm/shared/html-classes.js"() {
    init_element3();
    init_template_element();
    init_html_element();
    init_script_element();
    init_frame_element();
    init_i_frame_element();
    init_object_element();
    init_head_element();
    init_body_element();
    init_style_element();
    init_time_element();
    init_field_set_element();
    init_embed_element();
    init_hr_element();
    init_progress_element();
    init_paragraph_element();
    init_table_element();
    init_frame_set_element();
    init_li_element();
    init_base_element();
    init_data_list_element();
    init_input_element();
    init_param_element();
    init_media_element();
    init_audio_element();
    init_heading_element();
    init_directory_element();
    init_quote_element();
    init_canvas_element();
    init_legend_element();
    init_option_element();
    init_span_element();
    init_meter_element();
    init_video_element();
    init_table_cell_element();
    init_title_element();
    init_output_element();
    init_table_row_element();
    init_data_element();
    init_menu_element();
    init_select_element();
    init_br_element();
    init_button_element();
    init_map_element();
    init_opt_group_element();
    init_d_list_element();
    init_text_area_element();
    init_font_element();
    init_div_element();
    init_link_element();
    init_slot_element();
    init_form_element();
    init_image_element();
    init_pre_element();
    init_u_list_element();
    init_meta_element();
    init_picture_element();
    init_area_element();
    init_o_list_element();
    init_table_caption_element();
    init_anchor_element();
    init_label_element();
    init_unknown_element();
    init_mod_element();
    init_details_element();
    init_source_element();
    init_track_element();
    init_marquee_element();
    HTMLClasses = {
      HTMLElement,
      HTMLTemplateElement,
      HTMLHtmlElement,
      HTMLScriptElement,
      HTMLFrameElement,
      HTMLIFrameElement,
      HTMLObjectElement,
      HTMLHeadElement,
      HTMLBodyElement,
      HTMLStyleElement,
      HTMLTimeElement,
      HTMLFieldSetElement,
      HTMLEmbedElement,
      HTMLHRElement,
      HTMLProgressElement,
      HTMLParagraphElement,
      HTMLTableElement,
      HTMLFrameSetElement,
      HTMLLIElement,
      HTMLBaseElement,
      HTMLDataListElement,
      HTMLInputElement,
      HTMLParamElement,
      HTMLMediaElement,
      HTMLAudioElement,
      HTMLHeadingElement,
      HTMLDirectoryElement,
      HTMLQuoteElement,
      HTMLCanvasElement,
      HTMLLegendElement,
      HTMLOptionElement,
      HTMLSpanElement,
      HTMLMeterElement,
      HTMLVideoElement,
      HTMLTableCellElement,
      HTMLTitleElement,
      HTMLOutputElement,
      HTMLTableRowElement,
      HTMLDataElement,
      HTMLMenuElement,
      HTMLSelectElement,
      HTMLBRElement,
      HTMLButtonElement,
      HTMLMapElement,
      HTMLOptGroupElement,
      HTMLDListElement,
      HTMLTextAreaElement,
      HTMLFontElement,
      HTMLDivElement,
      HTMLLinkElement,
      HTMLSlotElement,
      HTMLFormElement,
      HTMLImageElement,
      HTMLPreElement,
      HTMLUListElement,
      HTMLMetaElement,
      HTMLPictureElement,
      HTMLAreaElement,
      HTMLOListElement,
      HTMLTableCaptionElement,
      HTMLAnchorElement,
      HTMLLabelElement,
      HTMLUnknownElement,
      HTMLModElement,
      HTMLDetailsElement,
      HTMLSourceElement,
      HTMLTrackElement,
      HTMLMarqueeElement
    };
  }
});

// node_modules/linkedom/esm/shared/mime.js
var voidElements2, Mime;
var init_mime = __esm({
  "node_modules/linkedom/esm/shared/mime.js"() {
    voidElements2 = { test: () => true };
    Mime = {
      "text/html": {
        docType: "<!DOCTYPE html>",
        ignoreCase: true,
        voidElements: /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i
      },
      "image/svg+xml": {
        docType: '<?xml version="1.0" encoding="utf-8"?>',
        ignoreCase: false,
        voidElements: voidElements2
      },
      "text/xml": {
        docType: '<?xml version="1.0" encoding="utf-8"?>',
        ignoreCase: false,
        voidElements: voidElements2
      },
      "application/xml": {
        docType: '<?xml version="1.0" encoding="utf-8"?>',
        ignoreCase: false,
        voidElements: voidElements2
      },
      "application/xhtml+xml": {
        docType: '<?xml version="1.0" encoding="utf-8"?>',
        ignoreCase: false,
        voidElements: voidElements2
      }
    };
  }
});

// node_modules/linkedom/esm/interface/custom-event.js
var CustomEvent;
var init_custom_event = __esm({
  "node_modules/linkedom/esm/interface/custom-event.js"() {
    init_event();
    CustomEvent = class extends GlobalEvent {
      constructor(type, eventInitDict = {}) {
        super(type, eventInitDict);
        this.detail = eventInitDict.detail;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/input-event.js
var InputEvent;
var init_input_event = __esm({
  "node_modules/linkedom/esm/interface/input-event.js"() {
    init_event();
    InputEvent = class extends GlobalEvent {
      constructor(type, inputEventInit = {}) {
        super(type, inputEventInit);
        this.inputType = inputEventInit.inputType;
        this.data = inputEventInit.data;
        this.dataTransfer = inputEventInit.dataTransfer;
        this.isComposing = inputEventInit.isComposing || false;
        this.ranges = inputEventInit.ranges;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/image.js
var ImageClass;
var init_image = __esm({
  "node_modules/linkedom/esm/interface/image.js"() {
    init_image_element();
    ImageClass = (ownerDocument) => (
      /**
       * @implements globalThis.Image
       */
      class Image extends HTMLImageElement {
        constructor(width, height) {
          super(ownerDocument);
          switch (arguments.length) {
            case 1:
              this.height = width;
              this.width = width;
              break;
            case 2:
              this.height = height;
              this.width = width;
              break;
          }
        }
      }
    );
  }
});

// node_modules/linkedom/esm/interface/range.js
var deleteContents, Range;
var init_range = __esm({
  "node_modules/linkedom/esm/interface/range.js"() {
    init_symbols();
    init_utils();
    deleteContents = ({ [START]: start, [END]: end }, fragment = null) => {
      setAdjacent(start[PREV], end[NEXT]);
      do {
        const after2 = getEnd(start);
        const next = after2 === end ? after2 : after2[NEXT];
        if (fragment)
          fragment.insertBefore(start, fragment[END]);
        else
          start.remove();
        start = next;
      } while (start !== end);
    };
    Range = class _Range {
      constructor() {
        this[START] = null;
        this[END] = null;
        this.commonAncestorContainer = null;
      }
      /* TODO: this is more complicated than it looks
        setStart(node, offset) {
          this[START] = node.childNodes[offset];
        }
      
        setEnd(node, offset) {
          this[END] = getEnd(node.childNodes[offset]);
        }
        //*/
      insertNode(newNode) {
        this[END].parentNode.insertBefore(newNode, this[START]);
      }
      selectNode(node) {
        this[START] = node;
        this[END] = getEnd(node);
      }
      surroundContents(parentNode) {
        parentNode.replaceChildren(this.extractContents());
      }
      setStartBefore(node) {
        this[START] = node;
      }
      setStartAfter(node) {
        this[START] = node.nextSibling;
      }
      setEndBefore(node) {
        this[END] = getEnd(node.previousSibling);
      }
      setEndAfter(node) {
        this[END] = getEnd(node);
      }
      cloneContents() {
        let { [START]: start, [END]: end } = this;
        const fragment = start.ownerDocument.createDocumentFragment();
        while (start !== end) {
          fragment.insertBefore(start.cloneNode(true), fragment[END]);
          start = getEnd(start);
          if (start !== end)
            start = start[NEXT];
        }
        return fragment;
      }
      deleteContents() {
        deleteContents(this);
      }
      extractContents() {
        const fragment = this[START].ownerDocument.createDocumentFragment();
        deleteContents(this, fragment);
        return fragment;
      }
      createContextualFragment(html) {
        const template = this.commonAncestorContainer.createElement("template");
        template.innerHTML = html;
        this.selectNode(template.content);
        return template.content;
      }
      cloneRange() {
        const range = new _Range();
        range[START] = this[START];
        range[END] = this[END];
        return range;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/tree-walker.js
var isOK, TreeWalker;
var init_tree_walker = __esm({
  "node_modules/linkedom/esm/interface/tree-walker.js"() {
    init_constants();
    init_symbols();
    isOK = ({ nodeType }, mask) => {
      switch (nodeType) {
        case ELEMENT_NODE:
          return mask & SHOW_ELEMENT;
        case TEXT_NODE:
          return mask & SHOW_TEXT;
        case COMMENT_NODE:
          return mask & SHOW_COMMENT;
      }
      return 0;
    };
    TreeWalker = class {
      constructor(root, whatToShow = SHOW_ALL) {
        this.root = root;
        this.currentNode = root;
        this.whatToShow = whatToShow;
        let { [NEXT]: next, [END]: end } = root;
        if (root.nodeType === DOCUMENT_NODE) {
          const { documentElement } = root;
          next = documentElement;
          end = documentElement[END];
        }
        const nodes = [];
        while (next !== end) {
          if (isOK(next, whatToShow))
            nodes.push(next);
          next = next[NEXT];
        }
        this[PRIVATE] = { i: 0, nodes };
      }
      nextNode() {
        const $ = this[PRIVATE];
        this.currentNode = $.i < $.nodes.length ? $.nodes[$.i++] : null;
        return this.currentNode;
      }
    };
  }
});

// node_modules/linkedom/esm/interface/document.js
var import_perf_hooks, query, globalExports, window2, Document2;
var init_document = __esm({
  "node_modules/linkedom/esm/interface/document.js"() {
    import_perf_hooks = __toESM(require_perf_hooks(), 1);
    init_constants();
    init_symbols();
    init_facades();
    init_html_classes();
    init_mime();
    init_utils();
    init_object();
    init_non_element_parent_node();
    init_element2();
    init_attr();
    init_comment();
    init_custom_element_registry();
    init_custom_event();
    init_document_fragment();
    init_document_type();
    init_element();
    init_event();
    init_event_target();
    init_input_event();
    init_image();
    init_mutation_observer();
    init_named_node_map();
    init_node_list();
    init_range();
    init_text();
    init_tree_walker();
    query = (method, ownerDocument, selectors) => {
      let { [NEXT]: next, [END]: end } = ownerDocument;
      return method.call({ ownerDocument, [NEXT]: next, [END]: end }, selectors);
    };
    globalExports = assign(
      {},
      Facades,
      HTMLClasses,
      {
        CustomEvent,
        Event: GlobalEvent,
        EventTarget: DOMEventTarget,
        InputEvent,
        NamedNodeMap,
        NodeList
      }
    );
    window2 = /* @__PURE__ */ new WeakMap();
    Document2 = class extends NonElementParentNode {
      constructor(type) {
        super(null, "#document", DOCUMENT_NODE);
        this[CUSTOM_ELEMENTS] = { active: false, registry: null };
        this[MUTATION_OBSERVER] = { active: false, class: null };
        this[MIME] = Mime[type];
        this[DOCTYPE] = null;
        this[DOM_PARSER] = null;
        this[GLOBALS] = null;
        this[IMAGE] = null;
        this[UPGRADE] = null;
      }
      /**
       * @type {globalThis.Document['defaultView']}
       */
      get defaultView() {
        if (!window2.has(this))
          window2.set(this, new Proxy(globalThis, {
            set: (target, name, value) => {
              switch (name) {
                case "addEventListener":
                case "removeEventListener":
                case "dispatchEvent":
                  this[EVENT_TARGET][name] = value;
                  break;
                default:
                  target[name] = value;
                  break;
              }
              return true;
            },
            get: (globalThis2, name) => {
              switch (name) {
                case "addEventListener":
                case "removeEventListener":
                case "dispatchEvent":
                  if (!this[EVENT_TARGET]) {
                    const et = this[EVENT_TARGET] = new DOMEventTarget();
                    et.dispatchEvent = et.dispatchEvent.bind(et);
                    et.addEventListener = et.addEventListener.bind(et);
                    et.removeEventListener = et.removeEventListener.bind(et);
                  }
                  return this[EVENT_TARGET][name];
                case "document":
                  return this;
                case "navigator":
                  return {
                    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
                  };
                case "window":
                  return window2.get(this);
                case "customElements":
                  if (!this[CUSTOM_ELEMENTS].registry)
                    this[CUSTOM_ELEMENTS] = new CustomElementRegistry(this);
                  return this[CUSTOM_ELEMENTS];
                case "performance":
                  return import_perf_hooks.performance;
                case "DOMParser":
                  return this[DOM_PARSER];
                case "Image":
                  if (!this[IMAGE])
                    this[IMAGE] = ImageClass(this);
                  return this[IMAGE];
                case "MutationObserver":
                  if (!this[MUTATION_OBSERVER].class)
                    this[MUTATION_OBSERVER] = new MutationObserverClass(this);
                  return this[MUTATION_OBSERVER].class;
              }
              return this[GLOBALS] && this[GLOBALS][name] || globalExports[name] || globalThis2[name];
            }
          }));
        return window2.get(this);
      }
      get doctype() {
        const docType = this[DOCTYPE];
        if (docType)
          return docType;
        const { firstChild } = this;
        if (firstChild && firstChild.nodeType === DOCUMENT_TYPE_NODE)
          return this[DOCTYPE] = firstChild;
        return null;
      }
      set doctype(value) {
        if (/^([a-z:]+)(\s+system|\s+public(\s+"([^"]+)")?)?(\s+"([^"]+)")?/i.test(value)) {
          const { $1: name, $4: publicId, $6: systemId } = RegExp;
          this[DOCTYPE] = new DocumentType(this, name, publicId, systemId);
          knownSiblings(this, this[DOCTYPE], this[NEXT]);
        }
      }
      get documentElement() {
        return this.firstElementChild;
      }
      get isConnected() {
        return true;
      }
      /**
       * @protected
       */
      _getParent() {
        return this[EVENT_TARGET];
      }
      createAttribute(name) {
        return new Attr(this, name);
      }
      createComment(textContent2) {
        return new Comment3(this, textContent2);
      }
      createDocumentFragment() {
        return new DocumentFragment(this);
      }
      createDocumentType(name, publicId, systemId) {
        return new DocumentType(this, name, publicId, systemId);
      }
      createElement(localName) {
        return new Element2(this, localName);
      }
      createRange() {
        const range = new Range();
        range.commonAncestorContainer = this;
        return range;
      }
      createTextNode(textContent2) {
        return new Text3(this, textContent2);
      }
      createTreeWalker(root, whatToShow = -1) {
        return new TreeWalker(root, whatToShow);
      }
      createNodeIterator(root, whatToShow = -1) {
        return this.createTreeWalker(root, whatToShow);
      }
      createEvent(name) {
        const event = create(name === "Event" ? new GlobalEvent("") : new CustomEvent(""));
        event.initEvent = event.initCustomEvent = (type, canBubble = false, cancelable = false, detail) => {
          defineProperties(event, {
            type: { value: type },
            canBubble: { value: canBubble },
            cancelable: { value: cancelable },
            detail: { value: detail }
          });
        };
        return event;
      }
      cloneNode(deep = false) {
        const {
          constructor,
          [CUSTOM_ELEMENTS]: customElements2,
          [DOCTYPE]: doctype
        } = this;
        const document2 = new constructor();
        document2[CUSTOM_ELEMENTS] = customElements2;
        if (deep) {
          const end = document2[END];
          const { childNodes } = this;
          for (let { length } = childNodes, i = 0; i < length; i++)
            document2.insertBefore(childNodes[i].cloneNode(true), end);
          if (doctype)
            document2[DOCTYPE] = childNodes[0];
        }
        return document2;
      }
      importNode(externalNode) {
        const deep = 1 < arguments.length && !!arguments[1];
        const node = externalNode.cloneNode(deep);
        const { [CUSTOM_ELEMENTS]: customElements2 } = this;
        const { active } = customElements2;
        const upgrade = (element) => {
          const { ownerDocument, nodeType } = element;
          element.ownerDocument = this;
          if (active && ownerDocument !== this && nodeType === ELEMENT_NODE)
            customElements2.upgrade(element);
        };
        upgrade(node);
        if (deep) {
          switch (node.nodeType) {
            case ELEMENT_NODE:
            case DOCUMENT_FRAGMENT_NODE: {
              let { [NEXT]: next, [END]: end } = node;
              while (next !== end) {
                if (next.nodeType === ELEMENT_NODE)
                  upgrade(next);
                next = next[NEXT];
              }
              break;
            }
          }
        }
        return node;
      }
      toString() {
        return this.childNodes.join("");
      }
      querySelector(selectors) {
        return query(super.querySelector, this, selectors);
      }
      querySelectorAll(selectors) {
        return query(super.querySelectorAll, this, selectors);
      }
      /* c8 ignore start */
      getElementsByTagNameNS(_, name) {
        return this.getElementsByTagName(name);
      }
      createAttributeNS(_, name) {
        return this.createAttribute(name);
      }
      createElementNS(nsp, localName, options) {
        return nsp === SVG_NAMESPACE ? new SVGElement(this, localName, null) : this.createElement(localName, options);
      }
      /* c8 ignore stop */
    };
    setPrototypeOf(
      globalExports.Document = function Document3() {
        illegalConstructor();
      },
      Document2
    ).prototype = Document2.prototype;
  }
});

// node_modules/linkedom/esm/html/document.js
var createHTMLElement, HTMLDocument;
var init_document2 = __esm({
  "node_modules/linkedom/esm/html/document.js"() {
    init_constants();
    init_symbols();
    init_register_html_class();
    init_document();
    init_node_list();
    init_custom_element_registry();
    init_element3();
    createHTMLElement = (ownerDocument, builtin, localName, options) => {
      if (!builtin && htmlClasses.has(localName)) {
        const Class = htmlClasses.get(localName);
        return new Class(ownerDocument, localName);
      }
      const { [CUSTOM_ELEMENTS]: { active, registry } } = ownerDocument;
      if (active) {
        const ce = builtin ? options.is : localName;
        if (registry.has(ce)) {
          const { Class } = registry.get(ce);
          const element = new Class(ownerDocument, localName);
          customElements.set(element, { connected: false });
          return element;
        }
      }
      return new HTMLElement(ownerDocument, localName);
    };
    HTMLDocument = class extends Document2 {
      constructor() {
        super("text/html");
      }
      get all() {
        const nodeList = new NodeList();
        let { [NEXT]: next, [END]: end } = this;
        while (next !== end) {
          switch (next.nodeType) {
            case ELEMENT_NODE:
              nodeList.push(next);
              break;
          }
          next = next[NEXT];
        }
        return nodeList;
      }
      /**
       * @type HTMLHeadElement
       */
      get head() {
        const { documentElement } = this;
        let { firstElementChild } = documentElement;
        if (!firstElementChild || firstElementChild.tagName !== "HEAD") {
          firstElementChild = this.createElement("head");
          documentElement.prepend(firstElementChild);
        }
        return firstElementChild;
      }
      /**
       * @type HTMLBodyElement
       */
      get body() {
        const { head } = this;
        let { nextElementSibling: nextElementSibling3 } = head;
        if (!nextElementSibling3 || nextElementSibling3.tagName !== "BODY") {
          nextElementSibling3 = this.createElement("body");
          head.after(nextElementSibling3);
        }
        return nextElementSibling3;
      }
      /**
       * @type HTMLTitleElement
       */
      get title() {
        const { head } = this;
        let title = head.getElementsByTagName("title").shift();
        return title ? title.textContent : "";
      }
      set title(textContent2) {
        const { head } = this;
        let title = head.getElementsByTagName("title").shift();
        if (title)
          title.textContent = textContent2;
        else {
          head.insertBefore(
            this.createElement("title"),
            head.firstChild
          ).textContent = textContent2;
        }
      }
      createElement(localName, options) {
        const builtin = !!(options && options.is);
        const element = createHTMLElement(this, builtin, localName, options);
        if (builtin)
          element.setAttribute("is", options.is);
        return element;
      }
    };
  }
});

// node_modules/linkedom/esm/svg/document.js
var SVGDocument;
var init_document3 = __esm({
  "node_modules/linkedom/esm/svg/document.js"() {
    init_symbols();
    init_document();
    SVGDocument = class extends Document2 {
      constructor() {
        super("image/svg+xml");
      }
      toString() {
        return this[MIME].docType + super.toString();
      }
    };
  }
});

// node_modules/linkedom/esm/xml/document.js
var XMLDocument;
var init_document4 = __esm({
  "node_modules/linkedom/esm/xml/document.js"() {
    init_symbols();
    init_document();
    XMLDocument = class extends Document2 {
      constructor() {
        super("text/xml");
      }
      toString() {
        return this[MIME].docType + super.toString();
      }
    };
  }
});

// node_modules/linkedom/esm/dom/parser.js
var DOMParser;
var init_parser = __esm({
  "node_modules/linkedom/esm/dom/parser.js"() {
    init_symbols();
    init_parse_from_string();
    init_document2();
    init_document3();
    init_document4();
    DOMParser = class _DOMParser {
      /** @typedef {{ "text/html": HTMLDocument, "image/svg+xml": SVGDocument, "text/xml": XMLDocument }} MimeToDoc */
      /**
       * @template {keyof MimeToDoc} MIME
       * @param {string} markupLanguage
       * @param {MIME} mimeType
       * @returns {MimeToDoc[MIME]}
       */
      parseFromString(markupLanguage, mimeType, globals = null) {
        let isHTML = false, document2;
        if (mimeType === "text/html") {
          isHTML = true;
          document2 = new HTMLDocument();
        } else if (mimeType === "image/svg+xml")
          document2 = new SVGDocument();
        else
          document2 = new XMLDocument();
        document2[DOM_PARSER] = _DOMParser;
        if (globals)
          document2[GLOBALS] = globals;
        if (isHTML && markupLanguage === "...")
          markupLanguage = "<!doctype html><html><head></head><body></body></html>";
        return markupLanguage ? parseFromString(document2, isHTML, markupLanguage) : document2;
      }
    };
  }
});

// node_modules/linkedom/esm/shared/parse-json.js
var parse5, append3, createHTMLElement2, parseJSON, toJSON;
var init_parse_json = __esm({
  "node_modules/linkedom/esm/shared/parse-json.js"() {
    init_constants();
    init_symbols();
    init_register_html_class();
    init_utils();
    init_attr();
    init_comment();
    init_document_type();
    init_text();
    init_document2();
    init_element3();
    init_element2();
    ({ parse: parse5 } = JSON);
    append3 = (parentNode, node, end) => {
      node.parentNode = parentNode;
      knownSiblings(end[PREV], node, end);
    };
    createHTMLElement2 = (ownerDocument, localName) => {
      if (htmlClasses.has(localName)) {
        const Class = htmlClasses.get(localName);
        return new Class(ownerDocument, localName);
      }
      return new HTMLElement(ownerDocument, localName);
    };
    parseJSON = (value) => {
      const array = typeof value === "string" ? parse5(value) : value;
      const { length } = array;
      const document2 = new HTMLDocument();
      let parentNode = document2, end = parentNode[END], svg = false, i = 0;
      while (i < length) {
        let nodeType = array[i++];
        switch (nodeType) {
          case ELEMENT_NODE: {
            const localName = array[i++];
            const isSVG = svg || localName === "svg" || localName === "SVG";
            const element = isSVG ? new SVGElement(document2, localName, parentNode.ownerSVGElement || null) : createHTMLElement2(document2, localName);
            knownBoundaries(end[PREV], element, end);
            element.parentNode = parentNode;
            parentNode = element;
            end = parentNode[END];
            svg = isSVG;
            break;
          }
          case ATTRIBUTE_NODE: {
            const name = array[i++];
            const value2 = typeof array[i] === "string" ? array[i++] : "";
            const attr = new Attr(document2, name, value2);
            attr.ownerElement = parentNode;
            knownSiblings(end[PREV], attr, end);
            break;
          }
          case TEXT_NODE:
            append3(parentNode, new Text3(document2, array[i++]), end);
            break;
          case COMMENT_NODE:
            append3(parentNode, new Comment3(document2, array[i++]), end);
            break;
          case DOCUMENT_TYPE_NODE: {
            const args = [document2];
            while (typeof array[i] === "string")
              args.push(array[i++]);
            if (args.length === 3 && /\.dtd$/i.test(args[2]))
              args.splice(2, 0, "");
            append3(parentNode, new DocumentType(...args), end);
            break;
          }
          case DOCUMENT_FRAGMENT_NODE:
            parentNode = document2.createDocumentFragment();
            end = parentNode[END];
          case DOCUMENT_NODE:
            break;
          default:
            do {
              nodeType -= NODE_END;
              if (svg && !parentNode.ownerSVGElement)
                svg = false;
              parentNode = parentNode.parentNode || parentNode;
            } while (nodeType < 0);
            end = parentNode[END];
            break;
        }
      }
      switch (i && array[0]) {
        case ELEMENT_NODE:
          return document2.firstElementChild;
        case DOCUMENT_FRAGMENT_NODE:
          return parentNode;
      }
      return document2;
    };
    toJSON = (node) => node.toJSON();
  }
});

// node_modules/linkedom/esm/interface/node-filter.js
var NodeFilter;
var init_node_filter = __esm({
  "node_modules/linkedom/esm/interface/node-filter.js"() {
    init_constants();
    NodeFilter = class {
      static get SHOW_ALL() {
        return SHOW_ALL;
      }
      static get SHOW_ELEMENT() {
        return SHOW_ELEMENT;
      }
      static get SHOW_COMMENT() {
        return SHOW_COMMENT;
      }
      static get SHOW_TEXT() {
        return SHOW_TEXT;
      }
    };
  }
});

// node_modules/linkedom/esm/index.js
var esm_exports5 = {};
__export(esm_exports5, {
  Attr: () => Attr2,
  CharacterData: () => CharacterData2,
  Comment: () => Comment4,
  CustomEvent: () => CustomEvent,
  DOMParser: () => DOMParser,
  Document: () => Document4,
  DocumentFragment: () => DocumentFragment2,
  DocumentType: () => DocumentType2,
  Element: () => Element3,
  Event: () => GlobalEvent,
  EventTarget: () => DOMEventTarget,
  Facades: () => Facades,
  HTMLAnchorElement: () => HTMLAnchorElement,
  HTMLAreaElement: () => HTMLAreaElement,
  HTMLAudioElement: () => HTMLAudioElement,
  HTMLBRElement: () => HTMLBRElement,
  HTMLBaseElement: () => HTMLBaseElement,
  HTMLBodyElement: () => HTMLBodyElement,
  HTMLButtonElement: () => HTMLButtonElement,
  HTMLCanvasElement: () => HTMLCanvasElement,
  HTMLClasses: () => HTMLClasses,
  HTMLDListElement: () => HTMLDListElement,
  HTMLDataElement: () => HTMLDataElement,
  HTMLDataListElement: () => HTMLDataListElement,
  HTMLDetailsElement: () => HTMLDetailsElement,
  HTMLDirectoryElement: () => HTMLDirectoryElement,
  HTMLDivElement: () => HTMLDivElement,
  HTMLElement: () => HTMLElement,
  HTMLEmbedElement: () => HTMLEmbedElement,
  HTMLFieldSetElement: () => HTMLFieldSetElement,
  HTMLFontElement: () => HTMLFontElement,
  HTMLFormElement: () => HTMLFormElement,
  HTMLFrameElement: () => HTMLFrameElement,
  HTMLFrameSetElement: () => HTMLFrameSetElement,
  HTMLHRElement: () => HTMLHRElement,
  HTMLHeadElement: () => HTMLHeadElement,
  HTMLHeadingElement: () => HTMLHeadingElement,
  HTMLHtmlElement: () => HTMLHtmlElement,
  HTMLIFrameElement: () => HTMLIFrameElement,
  HTMLImageElement: () => HTMLImageElement,
  HTMLInputElement: () => HTMLInputElement,
  HTMLLIElement: () => HTMLLIElement,
  HTMLLabelElement: () => HTMLLabelElement,
  HTMLLegendElement: () => HTMLLegendElement,
  HTMLLinkElement: () => HTMLLinkElement,
  HTMLMapElement: () => HTMLMapElement,
  HTMLMarqueeElement: () => HTMLMarqueeElement,
  HTMLMediaElement: () => HTMLMediaElement,
  HTMLMenuElement: () => HTMLMenuElement,
  HTMLMetaElement: () => HTMLMetaElement,
  HTMLMeterElement: () => HTMLMeterElement,
  HTMLModElement: () => HTMLModElement,
  HTMLOListElement: () => HTMLOListElement,
  HTMLObjectElement: () => HTMLObjectElement,
  HTMLOptGroupElement: () => HTMLOptGroupElement,
  HTMLOptionElement: () => HTMLOptionElement,
  HTMLOutputElement: () => HTMLOutputElement,
  HTMLParagraphElement: () => HTMLParagraphElement,
  HTMLParamElement: () => HTMLParamElement,
  HTMLPictureElement: () => HTMLPictureElement,
  HTMLPreElement: () => HTMLPreElement,
  HTMLProgressElement: () => HTMLProgressElement,
  HTMLQuoteElement: () => HTMLQuoteElement,
  HTMLScriptElement: () => HTMLScriptElement,
  HTMLSelectElement: () => HTMLSelectElement,
  HTMLSlotElement: () => HTMLSlotElement,
  HTMLSourceElement: () => HTMLSourceElement,
  HTMLSpanElement: () => HTMLSpanElement,
  HTMLStyleElement: () => HTMLStyleElement,
  HTMLTableCaptionElement: () => HTMLTableCaptionElement,
  HTMLTableCellElement: () => HTMLTableCellElement,
  HTMLTableElement: () => HTMLTableElement,
  HTMLTableRowElement: () => HTMLTableRowElement,
  HTMLTemplateElement: () => HTMLTemplateElement,
  HTMLTextAreaElement: () => HTMLTextAreaElement,
  HTMLTimeElement: () => HTMLTimeElement,
  HTMLTitleElement: () => HTMLTitleElement,
  HTMLTrackElement: () => HTMLTrackElement,
  HTMLUListElement: () => HTMLUListElement,
  HTMLUnknownElement: () => HTMLUnknownElement,
  HTMLVideoElement: () => HTMLVideoElement,
  InputEvent: () => InputEvent,
  Node: () => Node3,
  NodeFilter: () => NodeFilter,
  NodeList: () => NodeList,
  SVGElement: () => SVGElement2,
  ShadowRoot: () => ShadowRoot2,
  Text: () => Text4,
  illegalConstructor: () => illegalConstructor,
  parseHTML: () => parseHTML,
  parseJSON: () => parseJSON,
  toJSON: () => toJSON
});
function Document4() {
  illegalConstructor();
}
var parseHTML;
var init_esm10 = __esm({
  "node_modules/linkedom/esm/index.js"() {
    init_parser();
    init_document();
    init_facades();
    init_object();
    init_parse_json();
    init_facades();
    init_html_classes();
    init_custom_event();
    init_event();
    init_event_target();
    init_input_event();
    init_node_list();
    init_node_filter();
    parseHTML = (html, globals = null) => new DOMParser().parseFromString(
      html,
      "text/html",
      globals
    ).defaultView;
    setPrototypeOf(Document4, Document2).prototype = Document2.prototype;
  }
});

// node_modules/node-html-markdown/dist/translator.js
var require_translator = __commonJS({
  "node_modules/node-html-markdown/dist/translator.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTranslatorContext = exports.isTranslatorConfig = exports.TranslatorCollection = exports.PostProcessResult = void 0;
    var PostProcessResult;
    (function(PostProcessResult2) {
      PostProcessResult2[PostProcessResult2["NoChange"] = 0] = "NoChange";
      PostProcessResult2[PostProcessResult2["RemoveNode"] = 1] = "RemoveNode";
    })(PostProcessResult = exports.PostProcessResult || (exports.PostProcessResult = {}));
    var TranslatorCollection = class {
      get size() {
        return Object.keys(this).length;
      }
      /**
       * Add / update translator config for one or more element tags
       */
      set(keys2, config, preserveBase) {
        keys2.split(",").forEach((el) => {
          el = el.toUpperCase();
          let res = config;
          if (preserveBase) {
            const base = this[el];
            if ((0, exports.isTranslatorConfig)(base))
              res = !(0, exports.isTranslatorConfig)(config) ? Object.assign((...args) => config.apply(void 0, args), { base }) : Object.assign(Object.assign({}, base), config);
          }
          this[el] = res;
        });
      }
      /**
       * Get translator config for element tag
       */
      get(key2) {
        return this[key2.toUpperCase()];
      }
      /**
       * Returns array of entries
       */
      entries() {
        return Object.entries(this);
      }
      /**
       * Remove translator config for one or more element tags
       */
      remove(keys2) {
        keys2.split(",").forEach((el) => delete this[el.toUpperCase()]);
      }
    };
    exports.TranslatorCollection = TranslatorCollection;
    var isTranslatorConfig = (v) => typeof v === "object";
    exports.isTranslatorConfig = isTranslatorConfig;
    function createTranslatorContext(visitor, node, metadata, base) {
      const { instance, nodeMetadata } = visitor;
      return Object.assign({
        node,
        options: instance.options,
        parent: node.parentNode,
        nodeMetadata,
        visitor,
        base
      }, metadata);
    }
    exports.createTranslatorContext = createTranslatorContext;
  }
});

// node_modules/he/he.js
var require_he = __commonJS({
  "node_modules/he/he.js"(exports, module2) {
    (function(root) {
      var freeExports = typeof exports == "object" && exports;
      var freeModule = typeof module2 == "object" && module2 && module2.exports == freeExports && module2;
      var freeGlobal = typeof global == "object" && global;
      if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
        root = freeGlobal;
      }
      var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
      var regexAsciiWhitelist = /[\x01-\x7F]/g;
      var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
      var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
      var encodeMap = { "\xAD": "shy", "\u200C": "zwnj", "\u200D": "zwj", "\u200E": "lrm", "\u2063": "ic", "\u2062": "it", "\u2061": "af", "\u200F": "rlm", "\u200B": "ZeroWidthSpace", "\u2060": "NoBreak", "\u0311": "DownBreve", "\u20DB": "tdot", "\u20DC": "DotDot", "	": "Tab", "\n": "NewLine", "\u2008": "puncsp", "\u205F": "MediumSpace", "\u2009": "thinsp", "\u200A": "hairsp", "\u2004": "emsp13", "\u2002": "ensp", "\u2005": "emsp14", "\u2003": "emsp", "\u2007": "numsp", "\xA0": "nbsp", "\u205F\u200A": "ThickSpace", "\u203E": "oline", "_": "lowbar", "\u2010": "dash", "\u2013": "ndash", "\u2014": "mdash", "\u2015": "horbar", ",": "comma", ";": "semi", "\u204F": "bsemi", ":": "colon", "\u2A74": "Colone", "!": "excl", "\xA1": "iexcl", "?": "quest", "\xBF": "iquest", ".": "period", "\u2025": "nldr", "\u2026": "mldr", "\xB7": "middot", "'": "apos", "\u2018": "lsquo", "\u2019": "rsquo", "\u201A": "sbquo", "\u2039": "lsaquo", "\u203A": "rsaquo", '"': "quot", "\u201C": "ldquo", "\u201D": "rdquo", "\u201E": "bdquo", "\xAB": "laquo", "\xBB": "raquo", "(": "lpar", ")": "rpar", "[": "lsqb", "]": "rsqb", "{": "lcub", "}": "rcub", "\u2308": "lceil", "\u2309": "rceil", "\u230A": "lfloor", "\u230B": "rfloor", "\u2985": "lopar", "\u2986": "ropar", "\u298B": "lbrke", "\u298C": "rbrke", "\u298D": "lbrkslu", "\u298E": "rbrksld", "\u298F": "lbrksld", "\u2990": "rbrkslu", "\u2991": "langd", "\u2992": "rangd", "\u2993": "lparlt", "\u2994": "rpargt", "\u2995": "gtlPar", "\u2996": "ltrPar", "\u27E6": "lobrk", "\u27E7": "robrk", "\u27E8": "lang", "\u27E9": "rang", "\u27EA": "Lang", "\u27EB": "Rang", "\u27EC": "loang", "\u27ED": "roang", "\u2772": "lbbrk", "\u2773": "rbbrk", "\u2016": "Vert", "\xA7": "sect", "\xB6": "para", "@": "commat", "*": "ast", "/": "sol", "undefined": null, "&": "amp", "#": "num", "%": "percnt", "\u2030": "permil", "\u2031": "pertenk", "\u2020": "dagger", "\u2021": "Dagger", "\u2022": "bull", "\u2043": "hybull", "\u2032": "prime", "\u2033": "Prime", "\u2034": "tprime", "\u2057": "qprime", "\u2035": "bprime", "\u2041": "caret", "`": "grave", "\xB4": "acute", "\u02DC": "tilde", "^": "Hat", "\xAF": "macr", "\u02D8": "breve", "\u02D9": "dot", "\xA8": "die", "\u02DA": "ring", "\u02DD": "dblac", "\xB8": "cedil", "\u02DB": "ogon", "\u02C6": "circ", "\u02C7": "caron", "\xB0": "deg", "\xA9": "copy", "\xAE": "reg", "\u2117": "copysr", "\u2118": "wp", "\u211E": "rx", "\u2127": "mho", "\u2129": "iiota", "\u2190": "larr", "\u219A": "nlarr", "\u2192": "rarr", "\u219B": "nrarr", "\u2191": "uarr", "\u2193": "darr", "\u2194": "harr", "\u21AE": "nharr", "\u2195": "varr", "\u2196": "nwarr", "\u2197": "nearr", "\u2198": "searr", "\u2199": "swarr", "\u219D": "rarrw", "\u219D\u0338": "nrarrw", "\u219E": "Larr", "\u219F": "Uarr", "\u21A0": "Rarr", "\u21A1": "Darr", "\u21A2": "larrtl", "\u21A3": "rarrtl", "\u21A4": "mapstoleft", "\u21A5": "mapstoup", "\u21A6": "map", "\u21A7": "mapstodown", "\u21A9": "larrhk", "\u21AA": "rarrhk", "\u21AB": "larrlp", "\u21AC": "rarrlp", "\u21AD": "harrw", "\u21B0": "lsh", "\u21B1": "rsh", "\u21B2": "ldsh", "\u21B3": "rdsh", "\u21B5": "crarr", "\u21B6": "cularr", "\u21B7": "curarr", "\u21BA": "olarr", "\u21BB": "orarr", "\u21BC": "lharu", "\u21BD": "lhard", "\u21BE": "uharr", "\u21BF": "uharl", "\u21C0": "rharu", "\u21C1": "rhard", "\u21C2": "dharr", "\u21C3": "dharl", "\u21C4": "rlarr", "\u21C5": "udarr", "\u21C6": "lrarr", "\u21C7": "llarr", "\u21C8": "uuarr", "\u21C9": "rrarr", "\u21CA": "ddarr", "\u21CB": "lrhar", "\u21CC": "rlhar", "\u21D0": "lArr", "\u21CD": "nlArr", "\u21D1": "uArr", "\u21D2": "rArr", "\u21CF": "nrArr", "\u21D3": "dArr", "\u21D4": "iff", "\u21CE": "nhArr", "\u21D5": "vArr", "\u21D6": "nwArr", "\u21D7": "neArr", "\u21D8": "seArr", "\u21D9": "swArr", "\u21DA": "lAarr", "\u21DB": "rAarr", "\u21DD": "zigrarr", "\u21E4": "larrb", "\u21E5": "rarrb", "\u21F5": "duarr", "\u21FD": "loarr", "\u21FE": "roarr", "\u21FF": "hoarr", "\u2200": "forall", "\u2201": "comp", "\u2202": "part", "\u2202\u0338": "npart", "\u2203": "exist", "\u2204": "nexist", "\u2205": "empty", "\u2207": "Del", "\u2208": "in", "\u2209": "notin", "\u220B": "ni", "\u220C": "notni", "\u03F6": "bepsi", "\u220F": "prod", "\u2210": "coprod", "\u2211": "sum", "+": "plus", "\xB1": "pm", "\xF7": "div", "\xD7": "times", "<": "lt", "\u226E": "nlt", "<\u20D2": "nvlt", "=": "equals", "\u2260": "ne", "=\u20E5": "bne", "\u2A75": "Equal", ">": "gt", "\u226F": "ngt", ">\u20D2": "nvgt", "\xAC": "not", "|": "vert", "\xA6": "brvbar", "\u2212": "minus", "\u2213": "mp", "\u2214": "plusdo", "\u2044": "frasl", "\u2216": "setmn", "\u2217": "lowast", "\u2218": "compfn", "\u221A": "Sqrt", "\u221D": "prop", "\u221E": "infin", "\u221F": "angrt", "\u2220": "ang", "\u2220\u20D2": "nang", "\u2221": "angmsd", "\u2222": "angsph", "\u2223": "mid", "\u2224": "nmid", "\u2225": "par", "\u2226": "npar", "\u2227": "and", "\u2228": "or", "\u2229": "cap", "\u2229\uFE00": "caps", "\u222A": "cup", "\u222A\uFE00": "cups", "\u222B": "int", "\u222C": "Int", "\u222D": "tint", "\u2A0C": "qint", "\u222E": "oint", "\u222F": "Conint", "\u2230": "Cconint", "\u2231": "cwint", "\u2232": "cwconint", "\u2233": "awconint", "\u2234": "there4", "\u2235": "becaus", "\u2236": "ratio", "\u2237": "Colon", "\u2238": "minusd", "\u223A": "mDDot", "\u223B": "homtht", "\u223C": "sim", "\u2241": "nsim", "\u223C\u20D2": "nvsim", "\u223D": "bsim", "\u223D\u0331": "race", "\u223E": "ac", "\u223E\u0333": "acE", "\u223F": "acd", "\u2240": "wr", "\u2242": "esim", "\u2242\u0338": "nesim", "\u2243": "sime", "\u2244": "nsime", "\u2245": "cong", "\u2247": "ncong", "\u2246": "simne", "\u2248": "ap", "\u2249": "nap", "\u224A": "ape", "\u224B": "apid", "\u224B\u0338": "napid", "\u224C": "bcong", "\u224D": "CupCap", "\u226D": "NotCupCap", "\u224D\u20D2": "nvap", "\u224E": "bump", "\u224E\u0338": "nbump", "\u224F": "bumpe", "\u224F\u0338": "nbumpe", "\u2250": "doteq", "\u2250\u0338": "nedot", "\u2251": "eDot", "\u2252": "efDot", "\u2253": "erDot", "\u2254": "colone", "\u2255": "ecolon", "\u2256": "ecir", "\u2257": "cire", "\u2259": "wedgeq", "\u225A": "veeeq", "\u225C": "trie", "\u225F": "equest", "\u2261": "equiv", "\u2262": "nequiv", "\u2261\u20E5": "bnequiv", "\u2264": "le", "\u2270": "nle", "\u2264\u20D2": "nvle", "\u2265": "ge", "\u2271": "nge", "\u2265\u20D2": "nvge", "\u2266": "lE", "\u2266\u0338": "nlE", "\u2267": "gE", "\u2267\u0338": "ngE", "\u2268\uFE00": "lvnE", "\u2268": "lnE", "\u2269": "gnE", "\u2269\uFE00": "gvnE", "\u226A": "ll", "\u226A\u0338": "nLtv", "\u226A\u20D2": "nLt", "\u226B": "gg", "\u226B\u0338": "nGtv", "\u226B\u20D2": "nGt", "\u226C": "twixt", "\u2272": "lsim", "\u2274": "nlsim", "\u2273": "gsim", "\u2275": "ngsim", "\u2276": "lg", "\u2278": "ntlg", "\u2277": "gl", "\u2279": "ntgl", "\u227A": "pr", "\u2280": "npr", "\u227B": "sc", "\u2281": "nsc", "\u227C": "prcue", "\u22E0": "nprcue", "\u227D": "sccue", "\u22E1": "nsccue", "\u227E": "prsim", "\u227F": "scsim", "\u227F\u0338": "NotSucceedsTilde", "\u2282": "sub", "\u2284": "nsub", "\u2282\u20D2": "vnsub", "\u2283": "sup", "\u2285": "nsup", "\u2283\u20D2": "vnsup", "\u2286": "sube", "\u2288": "nsube", "\u2287": "supe", "\u2289": "nsupe", "\u228A\uFE00": "vsubne", "\u228A": "subne", "\u228B\uFE00": "vsupne", "\u228B": "supne", "\u228D": "cupdot", "\u228E": "uplus", "\u228F": "sqsub", "\u228F\u0338": "NotSquareSubset", "\u2290": "sqsup", "\u2290\u0338": "NotSquareSuperset", "\u2291": "sqsube", "\u22E2": "nsqsube", "\u2292": "sqsupe", "\u22E3": "nsqsupe", "\u2293": "sqcap", "\u2293\uFE00": "sqcaps", "\u2294": "sqcup", "\u2294\uFE00": "sqcups", "\u2295": "oplus", "\u2296": "ominus", "\u2297": "otimes", "\u2298": "osol", "\u2299": "odot", "\u229A": "ocir", "\u229B": "oast", "\u229D": "odash", "\u229E": "plusb", "\u229F": "minusb", "\u22A0": "timesb", "\u22A1": "sdotb", "\u22A2": "vdash", "\u22AC": "nvdash", "\u22A3": "dashv", "\u22A4": "top", "\u22A5": "bot", "\u22A7": "models", "\u22A8": "vDash", "\u22AD": "nvDash", "\u22A9": "Vdash", "\u22AE": "nVdash", "\u22AA": "Vvdash", "\u22AB": "VDash", "\u22AF": "nVDash", "\u22B0": "prurel", "\u22B2": "vltri", "\u22EA": "nltri", "\u22B3": "vrtri", "\u22EB": "nrtri", "\u22B4": "ltrie", "\u22EC": "nltrie", "\u22B4\u20D2": "nvltrie", "\u22B5": "rtrie", "\u22ED": "nrtrie", "\u22B5\u20D2": "nvrtrie", "\u22B6": "origof", "\u22B7": "imof", "\u22B8": "mumap", "\u22B9": "hercon", "\u22BA": "intcal", "\u22BB": "veebar", "\u22BD": "barvee", "\u22BE": "angrtvb", "\u22BF": "lrtri", "\u22C0": "Wedge", "\u22C1": "Vee", "\u22C2": "xcap", "\u22C3": "xcup", "\u22C4": "diam", "\u22C5": "sdot", "\u22C6": "Star", "\u22C7": "divonx", "\u22C8": "bowtie", "\u22C9": "ltimes", "\u22CA": "rtimes", "\u22CB": "lthree", "\u22CC": "rthree", "\u22CD": "bsime", "\u22CE": "cuvee", "\u22CF": "cuwed", "\u22D0": "Sub", "\u22D1": "Sup", "\u22D2": "Cap", "\u22D3": "Cup", "\u22D4": "fork", "\u22D5": "epar", "\u22D6": "ltdot", "\u22D7": "gtdot", "\u22D8": "Ll", "\u22D8\u0338": "nLl", "\u22D9": "Gg", "\u22D9\u0338": "nGg", "\u22DA\uFE00": "lesg", "\u22DA": "leg", "\u22DB": "gel", "\u22DB\uFE00": "gesl", "\u22DE": "cuepr", "\u22DF": "cuesc", "\u22E6": "lnsim", "\u22E7": "gnsim", "\u22E8": "prnsim", "\u22E9": "scnsim", "\u22EE": "vellip", "\u22EF": "ctdot", "\u22F0": "utdot", "\u22F1": "dtdot", "\u22F2": "disin", "\u22F3": "isinsv", "\u22F4": "isins", "\u22F5": "isindot", "\u22F5\u0338": "notindot", "\u22F6": "notinvc", "\u22F7": "notinvb", "\u22F9": "isinE", "\u22F9\u0338": "notinE", "\u22FA": "nisd", "\u22FB": "xnis", "\u22FC": "nis", "\u22FD": "notnivc", "\u22FE": "notnivb", "\u2305": "barwed", "\u2306": "Barwed", "\u230C": "drcrop", "\u230D": "dlcrop", "\u230E": "urcrop", "\u230F": "ulcrop", "\u2310": "bnot", "\u2312": "profline", "\u2313": "profsurf", "\u2315": "telrec", "\u2316": "target", "\u231C": "ulcorn", "\u231D": "urcorn", "\u231E": "dlcorn", "\u231F": "drcorn", "\u2322": "frown", "\u2323": "smile", "\u232D": "cylcty", "\u232E": "profalar", "\u2336": "topbot", "\u233D": "ovbar", "\u233F": "solbar", "\u237C": "angzarr", "\u23B0": "lmoust", "\u23B1": "rmoust", "\u23B4": "tbrk", "\u23B5": "bbrk", "\u23B6": "bbrktbrk", "\u23DC": "OverParenthesis", "\u23DD": "UnderParenthesis", "\u23DE": "OverBrace", "\u23DF": "UnderBrace", "\u23E2": "trpezium", "\u23E7": "elinters", "\u2423": "blank", "\u2500": "boxh", "\u2502": "boxv", "\u250C": "boxdr", "\u2510": "boxdl", "\u2514": "boxur", "\u2518": "boxul", "\u251C": "boxvr", "\u2524": "boxvl", "\u252C": "boxhd", "\u2534": "boxhu", "\u253C": "boxvh", "\u2550": "boxH", "\u2551": "boxV", "\u2552": "boxdR", "\u2553": "boxDr", "\u2554": "boxDR", "\u2555": "boxdL", "\u2556": "boxDl", "\u2557": "boxDL", "\u2558": "boxuR", "\u2559": "boxUr", "\u255A": "boxUR", "\u255B": "boxuL", "\u255C": "boxUl", "\u255D": "boxUL", "\u255E": "boxvR", "\u255F": "boxVr", "\u2560": "boxVR", "\u2561": "boxvL", "\u2562": "boxVl", "\u2563": "boxVL", "\u2564": "boxHd", "\u2565": "boxhD", "\u2566": "boxHD", "\u2567": "boxHu", "\u2568": "boxhU", "\u2569": "boxHU", "\u256A": "boxvH", "\u256B": "boxVh", "\u256C": "boxVH", "\u2580": "uhblk", "\u2584": "lhblk", "\u2588": "block", "\u2591": "blk14", "\u2592": "blk12", "\u2593": "blk34", "\u25A1": "squ", "\u25AA": "squf", "\u25AB": "EmptyVerySmallSquare", "\u25AD": "rect", "\u25AE": "marker", "\u25B1": "fltns", "\u25B3": "xutri", "\u25B4": "utrif", "\u25B5": "utri", "\u25B8": "rtrif", "\u25B9": "rtri", "\u25BD": "xdtri", "\u25BE": "dtrif", "\u25BF": "dtri", "\u25C2": "ltrif", "\u25C3": "ltri", "\u25CA": "loz", "\u25CB": "cir", "\u25EC": "tridot", "\u25EF": "xcirc", "\u25F8": "ultri", "\u25F9": "urtri", "\u25FA": "lltri", "\u25FB": "EmptySmallSquare", "\u25FC": "FilledSmallSquare", "\u2605": "starf", "\u2606": "star", "\u260E": "phone", "\u2640": "female", "\u2642": "male", "\u2660": "spades", "\u2663": "clubs", "\u2665": "hearts", "\u2666": "diams", "\u266A": "sung", "\u2713": "check", "\u2717": "cross", "\u2720": "malt", "\u2736": "sext", "\u2758": "VerticalSeparator", "\u27C8": "bsolhsub", "\u27C9": "suphsol", "\u27F5": "xlarr", "\u27F6": "xrarr", "\u27F7": "xharr", "\u27F8": "xlArr", "\u27F9": "xrArr", "\u27FA": "xhArr", "\u27FC": "xmap", "\u27FF": "dzigrarr", "\u2902": "nvlArr", "\u2903": "nvrArr", "\u2904": "nvHarr", "\u2905": "Map", "\u290C": "lbarr", "\u290D": "rbarr", "\u290E": "lBarr", "\u290F": "rBarr", "\u2910": "RBarr", "\u2911": "DDotrahd", "\u2912": "UpArrowBar", "\u2913": "DownArrowBar", "\u2916": "Rarrtl", "\u2919": "latail", "\u291A": "ratail", "\u291B": "lAtail", "\u291C": "rAtail", "\u291D": "larrfs", "\u291E": "rarrfs", "\u291F": "larrbfs", "\u2920": "rarrbfs", "\u2923": "nwarhk", "\u2924": "nearhk", "\u2925": "searhk", "\u2926": "swarhk", "\u2927": "nwnear", "\u2928": "toea", "\u2929": "tosa", "\u292A": "swnwar", "\u2933": "rarrc", "\u2933\u0338": "nrarrc", "\u2935": "cudarrr", "\u2936": "ldca", "\u2937": "rdca", "\u2938": "cudarrl", "\u2939": "larrpl", "\u293C": "curarrm", "\u293D": "cularrp", "\u2945": "rarrpl", "\u2948": "harrcir", "\u2949": "Uarrocir", "\u294A": "lurdshar", "\u294B": "ldrushar", "\u294E": "LeftRightVector", "\u294F": "RightUpDownVector", "\u2950": "DownLeftRightVector", "\u2951": "LeftUpDownVector", "\u2952": "LeftVectorBar", "\u2953": "RightVectorBar", "\u2954": "RightUpVectorBar", "\u2955": "RightDownVectorBar", "\u2956": "DownLeftVectorBar", "\u2957": "DownRightVectorBar", "\u2958": "LeftUpVectorBar", "\u2959": "LeftDownVectorBar", "\u295A": "LeftTeeVector", "\u295B": "RightTeeVector", "\u295C": "RightUpTeeVector", "\u295D": "RightDownTeeVector", "\u295E": "DownLeftTeeVector", "\u295F": "DownRightTeeVector", "\u2960": "LeftUpTeeVector", "\u2961": "LeftDownTeeVector", "\u2962": "lHar", "\u2963": "uHar", "\u2964": "rHar", "\u2965": "dHar", "\u2966": "luruhar", "\u2967": "ldrdhar", "\u2968": "ruluhar", "\u2969": "rdldhar", "\u296A": "lharul", "\u296B": "llhard", "\u296C": "rharul", "\u296D": "lrhard", "\u296E": "udhar", "\u296F": "duhar", "\u2970": "RoundImplies", "\u2971": "erarr", "\u2972": "simrarr", "\u2973": "larrsim", "\u2974": "rarrsim", "\u2975": "rarrap", "\u2976": "ltlarr", "\u2978": "gtrarr", "\u2979": "subrarr", "\u297B": "suplarr", "\u297C": "lfisht", "\u297D": "rfisht", "\u297E": "ufisht", "\u297F": "dfisht", "\u299A": "vzigzag", "\u299C": "vangrt", "\u299D": "angrtvbd", "\u29A4": "ange", "\u29A5": "range", "\u29A6": "dwangle", "\u29A7": "uwangle", "\u29A8": "angmsdaa", "\u29A9": "angmsdab", "\u29AA": "angmsdac", "\u29AB": "angmsdad", "\u29AC": "angmsdae", "\u29AD": "angmsdaf", "\u29AE": "angmsdag", "\u29AF": "angmsdah", "\u29B0": "bemptyv", "\u29B1": "demptyv", "\u29B2": "cemptyv", "\u29B3": "raemptyv", "\u29B4": "laemptyv", "\u29B5": "ohbar", "\u29B6": "omid", "\u29B7": "opar", "\u29B9": "operp", "\u29BB": "olcross", "\u29BC": "odsold", "\u29BE": "olcir", "\u29BF": "ofcir", "\u29C0": "olt", "\u29C1": "ogt", "\u29C2": "cirscir", "\u29C3": "cirE", "\u29C4": "solb", "\u29C5": "bsolb", "\u29C9": "boxbox", "\u29CD": "trisb", "\u29CE": "rtriltri", "\u29CF": "LeftTriangleBar", "\u29CF\u0338": "NotLeftTriangleBar", "\u29D0": "RightTriangleBar", "\u29D0\u0338": "NotRightTriangleBar", "\u29DC": "iinfin", "\u29DD": "infintie", "\u29DE": "nvinfin", "\u29E3": "eparsl", "\u29E4": "smeparsl", "\u29E5": "eqvparsl", "\u29EB": "lozf", "\u29F4": "RuleDelayed", "\u29F6": "dsol", "\u2A00": "xodot", "\u2A01": "xoplus", "\u2A02": "xotime", "\u2A04": "xuplus", "\u2A06": "xsqcup", "\u2A0D": "fpartint", "\u2A10": "cirfnint", "\u2A11": "awint", "\u2A12": "rppolint", "\u2A13": "scpolint", "\u2A14": "npolint", "\u2A15": "pointint", "\u2A16": "quatint", "\u2A17": "intlarhk", "\u2A22": "pluscir", "\u2A23": "plusacir", "\u2A24": "simplus", "\u2A25": "plusdu", "\u2A26": "plussim", "\u2A27": "plustwo", "\u2A29": "mcomma", "\u2A2A": "minusdu", "\u2A2D": "loplus", "\u2A2E": "roplus", "\u2A2F": "Cross", "\u2A30": "timesd", "\u2A31": "timesbar", "\u2A33": "smashp", "\u2A34": "lotimes", "\u2A35": "rotimes", "\u2A36": "otimesas", "\u2A37": "Otimes", "\u2A38": "odiv", "\u2A39": "triplus", "\u2A3A": "triminus", "\u2A3B": "tritime", "\u2A3C": "iprod", "\u2A3F": "amalg", "\u2A40": "capdot", "\u2A42": "ncup", "\u2A43": "ncap", "\u2A44": "capand", "\u2A45": "cupor", "\u2A46": "cupcap", "\u2A47": "capcup", "\u2A48": "cupbrcap", "\u2A49": "capbrcup", "\u2A4A": "cupcup", "\u2A4B": "capcap", "\u2A4C": "ccups", "\u2A4D": "ccaps", "\u2A50": "ccupssm", "\u2A53": "And", "\u2A54": "Or", "\u2A55": "andand", "\u2A56": "oror", "\u2A57": "orslope", "\u2A58": "andslope", "\u2A5A": "andv", "\u2A5B": "orv", "\u2A5C": "andd", "\u2A5D": "ord", "\u2A5F": "wedbar", "\u2A66": "sdote", "\u2A6A": "simdot", "\u2A6D": "congdot", "\u2A6D\u0338": "ncongdot", "\u2A6E": "easter", "\u2A6F": "apacir", "\u2A70": "apE", "\u2A70\u0338": "napE", "\u2A71": "eplus", "\u2A72": "pluse", "\u2A73": "Esim", "\u2A77": "eDDot", "\u2A78": "equivDD", "\u2A79": "ltcir", "\u2A7A": "gtcir", "\u2A7B": "ltquest", "\u2A7C": "gtquest", "\u2A7D": "les", "\u2A7D\u0338": "nles", "\u2A7E": "ges", "\u2A7E\u0338": "nges", "\u2A7F": "lesdot", "\u2A80": "gesdot", "\u2A81": "lesdoto", "\u2A82": "gesdoto", "\u2A83": "lesdotor", "\u2A84": "gesdotol", "\u2A85": "lap", "\u2A86": "gap", "\u2A87": "lne", "\u2A88": "gne", "\u2A89": "lnap", "\u2A8A": "gnap", "\u2A8B": "lEg", "\u2A8C": "gEl", "\u2A8D": "lsime", "\u2A8E": "gsime", "\u2A8F": "lsimg", "\u2A90": "gsiml", "\u2A91": "lgE", "\u2A92": "glE", "\u2A93": "lesges", "\u2A94": "gesles", "\u2A95": "els", "\u2A96": "egs", "\u2A97": "elsdot", "\u2A98": "egsdot", "\u2A99": "el", "\u2A9A": "eg", "\u2A9D": "siml", "\u2A9E": "simg", "\u2A9F": "simlE", "\u2AA0": "simgE", "\u2AA1": "LessLess", "\u2AA1\u0338": "NotNestedLessLess", "\u2AA2": "GreaterGreater", "\u2AA2\u0338": "NotNestedGreaterGreater", "\u2AA4": "glj", "\u2AA5": "gla", "\u2AA6": "ltcc", "\u2AA7": "gtcc", "\u2AA8": "lescc", "\u2AA9": "gescc", "\u2AAA": "smt", "\u2AAB": "lat", "\u2AAC": "smte", "\u2AAC\uFE00": "smtes", "\u2AAD": "late", "\u2AAD\uFE00": "lates", "\u2AAE": "bumpE", "\u2AAF": "pre", "\u2AAF\u0338": "npre", "\u2AB0": "sce", "\u2AB0\u0338": "nsce", "\u2AB3": "prE", "\u2AB4": "scE", "\u2AB5": "prnE", "\u2AB6": "scnE", "\u2AB7": "prap", "\u2AB8": "scap", "\u2AB9": "prnap", "\u2ABA": "scnap", "\u2ABB": "Pr", "\u2ABC": "Sc", "\u2ABD": "subdot", "\u2ABE": "supdot", "\u2ABF": "subplus", "\u2AC0": "supplus", "\u2AC1": "submult", "\u2AC2": "supmult", "\u2AC3": "subedot", "\u2AC4": "supedot", "\u2AC5": "subE", "\u2AC5\u0338": "nsubE", "\u2AC6": "supE", "\u2AC6\u0338": "nsupE", "\u2AC7": "subsim", "\u2AC8": "supsim", "\u2ACB\uFE00": "vsubnE", "\u2ACB": "subnE", "\u2ACC\uFE00": "vsupnE", "\u2ACC": "supnE", "\u2ACF": "csub", "\u2AD0": "csup", "\u2AD1": "csube", "\u2AD2": "csupe", "\u2AD3": "subsup", "\u2AD4": "supsub", "\u2AD5": "subsub", "\u2AD6": "supsup", "\u2AD7": "suphsub", "\u2AD8": "supdsub", "\u2AD9": "forkv", "\u2ADA": "topfork", "\u2ADB": "mlcp", "\u2AE4": "Dashv", "\u2AE6": "Vdashl", "\u2AE7": "Barv", "\u2AE8": "vBar", "\u2AE9": "vBarv", "\u2AEB": "Vbar", "\u2AEC": "Not", "\u2AED": "bNot", "\u2AEE": "rnmid", "\u2AEF": "cirmid", "\u2AF0": "midcir", "\u2AF1": "topcir", "\u2AF2": "nhpar", "\u2AF3": "parsim", "\u2AFD": "parsl", "\u2AFD\u20E5": "nparsl", "\u266D": "flat", "\u266E": "natur", "\u266F": "sharp", "\xA4": "curren", "\xA2": "cent", "$": "dollar", "\xA3": "pound", "\xA5": "yen", "\u20AC": "euro", "\xB9": "sup1", "\xBD": "half", "\u2153": "frac13", "\xBC": "frac14", "\u2155": "frac15", "\u2159": "frac16", "\u215B": "frac18", "\xB2": "sup2", "\u2154": "frac23", "\u2156": "frac25", "\xB3": "sup3", "\xBE": "frac34", "\u2157": "frac35", "\u215C": "frac38", "\u2158": "frac45", "\u215A": "frac56", "\u215D": "frac58", "\u215E": "frac78", "\u{1D4B6}": "ascr", "\u{1D552}": "aopf", "\u{1D51E}": "afr", "\u{1D538}": "Aopf", "\u{1D504}": "Afr", "\u{1D49C}": "Ascr", "\xAA": "ordf", "\xE1": "aacute", "\xC1": "Aacute", "\xE0": "agrave", "\xC0": "Agrave", "\u0103": "abreve", "\u0102": "Abreve", "\xE2": "acirc", "\xC2": "Acirc", "\xE5": "aring", "\xC5": "angst", "\xE4": "auml", "\xC4": "Auml", "\xE3": "atilde", "\xC3": "Atilde", "\u0105": "aogon", "\u0104": "Aogon", "\u0101": "amacr", "\u0100": "Amacr", "\xE6": "aelig", "\xC6": "AElig", "\u{1D4B7}": "bscr", "\u{1D553}": "bopf", "\u{1D51F}": "bfr", "\u{1D539}": "Bopf", "\u212C": "Bscr", "\u{1D505}": "Bfr", "\u{1D520}": "cfr", "\u{1D4B8}": "cscr", "\u{1D554}": "copf", "\u212D": "Cfr", "\u{1D49E}": "Cscr", "\u2102": "Copf", "\u0107": "cacute", "\u0106": "Cacute", "\u0109": "ccirc", "\u0108": "Ccirc", "\u010D": "ccaron", "\u010C": "Ccaron", "\u010B": "cdot", "\u010A": "Cdot", "\xE7": "ccedil", "\xC7": "Ccedil", "\u2105": "incare", "\u{1D521}": "dfr", "\u2146": "dd", "\u{1D555}": "dopf", "\u{1D4B9}": "dscr", "\u{1D49F}": "Dscr", "\u{1D507}": "Dfr", "\u2145": "DD", "\u{1D53B}": "Dopf", "\u010F": "dcaron", "\u010E": "Dcaron", "\u0111": "dstrok", "\u0110": "Dstrok", "\xF0": "eth", "\xD0": "ETH", "\u2147": "ee", "\u212F": "escr", "\u{1D522}": "efr", "\u{1D556}": "eopf", "\u2130": "Escr", "\u{1D508}": "Efr", "\u{1D53C}": "Eopf", "\xE9": "eacute", "\xC9": "Eacute", "\xE8": "egrave", "\xC8": "Egrave", "\xEA": "ecirc", "\xCA": "Ecirc", "\u011B": "ecaron", "\u011A": "Ecaron", "\xEB": "euml", "\xCB": "Euml", "\u0117": "edot", "\u0116": "Edot", "\u0119": "eogon", "\u0118": "Eogon", "\u0113": "emacr", "\u0112": "Emacr", "\u{1D523}": "ffr", "\u{1D557}": "fopf", "\u{1D4BB}": "fscr", "\u{1D509}": "Ffr", "\u{1D53D}": "Fopf", "\u2131": "Fscr", "\uFB00": "fflig", "\uFB03": "ffilig", "\uFB04": "ffllig", "\uFB01": "filig", "fj": "fjlig", "\uFB02": "fllig", "\u0192": "fnof", "\u210A": "gscr", "\u{1D558}": "gopf", "\u{1D524}": "gfr", "\u{1D4A2}": "Gscr", "\u{1D53E}": "Gopf", "\u{1D50A}": "Gfr", "\u01F5": "gacute", "\u011F": "gbreve", "\u011E": "Gbreve", "\u011D": "gcirc", "\u011C": "Gcirc", "\u0121": "gdot", "\u0120": "Gdot", "\u0122": "Gcedil", "\u{1D525}": "hfr", "\u210E": "planckh", "\u{1D4BD}": "hscr", "\u{1D559}": "hopf", "\u210B": "Hscr", "\u210C": "Hfr", "\u210D": "Hopf", "\u0125": "hcirc", "\u0124": "Hcirc", "\u210F": "hbar", "\u0127": "hstrok", "\u0126": "Hstrok", "\u{1D55A}": "iopf", "\u{1D526}": "ifr", "\u{1D4BE}": "iscr", "\u2148": "ii", "\u{1D540}": "Iopf", "\u2110": "Iscr", "\u2111": "Im", "\xED": "iacute", "\xCD": "Iacute", "\xEC": "igrave", "\xCC": "Igrave", "\xEE": "icirc", "\xCE": "Icirc", "\xEF": "iuml", "\xCF": "Iuml", "\u0129": "itilde", "\u0128": "Itilde", "\u0130": "Idot", "\u012F": "iogon", "\u012E": "Iogon", "\u012B": "imacr", "\u012A": "Imacr", "\u0133": "ijlig", "\u0132": "IJlig", "\u0131": "imath", "\u{1D4BF}": "jscr", "\u{1D55B}": "jopf", "\u{1D527}": "jfr", "\u{1D4A5}": "Jscr", "\u{1D50D}": "Jfr", "\u{1D541}": "Jopf", "\u0135": "jcirc", "\u0134": "Jcirc", "\u0237": "jmath", "\u{1D55C}": "kopf", "\u{1D4C0}": "kscr", "\u{1D528}": "kfr", "\u{1D4A6}": "Kscr", "\u{1D542}": "Kopf", "\u{1D50E}": "Kfr", "\u0137": "kcedil", "\u0136": "Kcedil", "\u{1D529}": "lfr", "\u{1D4C1}": "lscr", "\u2113": "ell", "\u{1D55D}": "lopf", "\u2112": "Lscr", "\u{1D50F}": "Lfr", "\u{1D543}": "Lopf", "\u013A": "lacute", "\u0139": "Lacute", "\u013E": "lcaron", "\u013D": "Lcaron", "\u013C": "lcedil", "\u013B": "Lcedil", "\u0142": "lstrok", "\u0141": "Lstrok", "\u0140": "lmidot", "\u013F": "Lmidot", "\u{1D52A}": "mfr", "\u{1D55E}": "mopf", "\u{1D4C2}": "mscr", "\u{1D510}": "Mfr", "\u{1D544}": "Mopf", "\u2133": "Mscr", "\u{1D52B}": "nfr", "\u{1D55F}": "nopf", "\u{1D4C3}": "nscr", "\u2115": "Nopf", "\u{1D4A9}": "Nscr", "\u{1D511}": "Nfr", "\u0144": "nacute", "\u0143": "Nacute", "\u0148": "ncaron", "\u0147": "Ncaron", "\xF1": "ntilde", "\xD1": "Ntilde", "\u0146": "ncedil", "\u0145": "Ncedil", "\u2116": "numero", "\u014B": "eng", "\u014A": "ENG", "\u{1D560}": "oopf", "\u{1D52C}": "ofr", "\u2134": "oscr", "\u{1D4AA}": "Oscr", "\u{1D512}": "Ofr", "\u{1D546}": "Oopf", "\xBA": "ordm", "\xF3": "oacute", "\xD3": "Oacute", "\xF2": "ograve", "\xD2": "Ograve", "\xF4": "ocirc", "\xD4": "Ocirc", "\xF6": "ouml", "\xD6": "Ouml", "\u0151": "odblac", "\u0150": "Odblac", "\xF5": "otilde", "\xD5": "Otilde", "\xF8": "oslash", "\xD8": "Oslash", "\u014D": "omacr", "\u014C": "Omacr", "\u0153": "oelig", "\u0152": "OElig", "\u{1D52D}": "pfr", "\u{1D4C5}": "pscr", "\u{1D561}": "popf", "\u2119": "Popf", "\u{1D513}": "Pfr", "\u{1D4AB}": "Pscr", "\u{1D562}": "qopf", "\u{1D52E}": "qfr", "\u{1D4C6}": "qscr", "\u{1D4AC}": "Qscr", "\u{1D514}": "Qfr", "\u211A": "Qopf", "\u0138": "kgreen", "\u{1D52F}": "rfr", "\u{1D563}": "ropf", "\u{1D4C7}": "rscr", "\u211B": "Rscr", "\u211C": "Re", "\u211D": "Ropf", "\u0155": "racute", "\u0154": "Racute", "\u0159": "rcaron", "\u0158": "Rcaron", "\u0157": "rcedil", "\u0156": "Rcedil", "\u{1D564}": "sopf", "\u{1D4C8}": "sscr", "\u{1D530}": "sfr", "\u{1D54A}": "Sopf", "\u{1D516}": "Sfr", "\u{1D4AE}": "Sscr", "\u24C8": "oS", "\u015B": "sacute", "\u015A": "Sacute", "\u015D": "scirc", "\u015C": "Scirc", "\u0161": "scaron", "\u0160": "Scaron", "\u015F": "scedil", "\u015E": "Scedil", "\xDF": "szlig", "\u{1D531}": "tfr", "\u{1D4C9}": "tscr", "\u{1D565}": "topf", "\u{1D4AF}": "Tscr", "\u{1D517}": "Tfr", "\u{1D54B}": "Topf", "\u0165": "tcaron", "\u0164": "Tcaron", "\u0163": "tcedil", "\u0162": "Tcedil", "\u2122": "trade", "\u0167": "tstrok", "\u0166": "Tstrok", "\u{1D4CA}": "uscr", "\u{1D566}": "uopf", "\u{1D532}": "ufr", "\u{1D54C}": "Uopf", "\u{1D518}": "Ufr", "\u{1D4B0}": "Uscr", "\xFA": "uacute", "\xDA": "Uacute", "\xF9": "ugrave", "\xD9": "Ugrave", "\u016D": "ubreve", "\u016C": "Ubreve", "\xFB": "ucirc", "\xDB": "Ucirc", "\u016F": "uring", "\u016E": "Uring", "\xFC": "uuml", "\xDC": "Uuml", "\u0171": "udblac", "\u0170": "Udblac", "\u0169": "utilde", "\u0168": "Utilde", "\u0173": "uogon", "\u0172": "Uogon", "\u016B": "umacr", "\u016A": "Umacr", "\u{1D533}": "vfr", "\u{1D567}": "vopf", "\u{1D4CB}": "vscr", "\u{1D519}": "Vfr", "\u{1D54D}": "Vopf", "\u{1D4B1}": "Vscr", "\u{1D568}": "wopf", "\u{1D4CC}": "wscr", "\u{1D534}": "wfr", "\u{1D4B2}": "Wscr", "\u{1D54E}": "Wopf", "\u{1D51A}": "Wfr", "\u0175": "wcirc", "\u0174": "Wcirc", "\u{1D535}": "xfr", "\u{1D4CD}": "xscr", "\u{1D569}": "xopf", "\u{1D54F}": "Xopf", "\u{1D51B}": "Xfr", "\u{1D4B3}": "Xscr", "\u{1D536}": "yfr", "\u{1D4CE}": "yscr", "\u{1D56A}": "yopf", "\u{1D4B4}": "Yscr", "\u{1D51C}": "Yfr", "\u{1D550}": "Yopf", "\xFD": "yacute", "\xDD": "Yacute", "\u0177": "ycirc", "\u0176": "Ycirc", "\xFF": "yuml", "\u0178": "Yuml", "\u{1D4CF}": "zscr", "\u{1D537}": "zfr", "\u{1D56B}": "zopf", "\u2128": "Zfr", "\u2124": "Zopf", "\u{1D4B5}": "Zscr", "\u017A": "zacute", "\u0179": "Zacute", "\u017E": "zcaron", "\u017D": "Zcaron", "\u017C": "zdot", "\u017B": "Zdot", "\u01B5": "imped", "\xFE": "thorn", "\xDE": "THORN", "\u0149": "napos", "\u03B1": "alpha", "\u0391": "Alpha", "\u03B2": "beta", "\u0392": "Beta", "\u03B3": "gamma", "\u0393": "Gamma", "\u03B4": "delta", "\u0394": "Delta", "\u03B5": "epsi", "\u03F5": "epsiv", "\u0395": "Epsilon", "\u03DD": "gammad", "\u03DC": "Gammad", "\u03B6": "zeta", "\u0396": "Zeta", "\u03B7": "eta", "\u0397": "Eta", "\u03B8": "theta", "\u03D1": "thetav", "\u0398": "Theta", "\u03B9": "iota", "\u0399": "Iota", "\u03BA": "kappa", "\u03F0": "kappav", "\u039A": "Kappa", "\u03BB": "lambda", "\u039B": "Lambda", "\u03BC": "mu", "\xB5": "micro", "\u039C": "Mu", "\u03BD": "nu", "\u039D": "Nu", "\u03BE": "xi", "\u039E": "Xi", "\u03BF": "omicron", "\u039F": "Omicron", "\u03C0": "pi", "\u03D6": "piv", "\u03A0": "Pi", "\u03C1": "rho", "\u03F1": "rhov", "\u03A1": "Rho", "\u03C3": "sigma", "\u03A3": "Sigma", "\u03C2": "sigmaf", "\u03C4": "tau", "\u03A4": "Tau", "\u03C5": "upsi", "\u03A5": "Upsilon", "\u03D2": "Upsi", "\u03C6": "phi", "\u03D5": "phiv", "\u03A6": "Phi", "\u03C7": "chi", "\u03A7": "Chi", "\u03C8": "psi", "\u03A8": "Psi", "\u03C9": "omega", "\u03A9": "ohm", "\u0430": "acy", "\u0410": "Acy", "\u0431": "bcy", "\u0411": "Bcy", "\u0432": "vcy", "\u0412": "Vcy", "\u0433": "gcy", "\u0413": "Gcy", "\u0453": "gjcy", "\u0403": "GJcy", "\u0434": "dcy", "\u0414": "Dcy", "\u0452": "djcy", "\u0402": "DJcy", "\u0435": "iecy", "\u0415": "IEcy", "\u0451": "iocy", "\u0401": "IOcy", "\u0454": "jukcy", "\u0404": "Jukcy", "\u0436": "zhcy", "\u0416": "ZHcy", "\u0437": "zcy", "\u0417": "Zcy", "\u0455": "dscy", "\u0405": "DScy", "\u0438": "icy", "\u0418": "Icy", "\u0456": "iukcy", "\u0406": "Iukcy", "\u0457": "yicy", "\u0407": "YIcy", "\u0439": "jcy", "\u0419": "Jcy", "\u0458": "jsercy", "\u0408": "Jsercy", "\u043A": "kcy", "\u041A": "Kcy", "\u045C": "kjcy", "\u040C": "KJcy", "\u043B": "lcy", "\u041B": "Lcy", "\u0459": "ljcy", "\u0409": "LJcy", "\u043C": "mcy", "\u041C": "Mcy", "\u043D": "ncy", "\u041D": "Ncy", "\u045A": "njcy", "\u040A": "NJcy", "\u043E": "ocy", "\u041E": "Ocy", "\u043F": "pcy", "\u041F": "Pcy", "\u0440": "rcy", "\u0420": "Rcy", "\u0441": "scy", "\u0421": "Scy", "\u0442": "tcy", "\u0422": "Tcy", "\u045B": "tshcy", "\u040B": "TSHcy", "\u0443": "ucy", "\u0423": "Ucy", "\u045E": "ubrcy", "\u040E": "Ubrcy", "\u0444": "fcy", "\u0424": "Fcy", "\u0445": "khcy", "\u0425": "KHcy", "\u0446": "tscy", "\u0426": "TScy", "\u0447": "chcy", "\u0427": "CHcy", "\u045F": "dzcy", "\u040F": "DZcy", "\u0448": "shcy", "\u0428": "SHcy", "\u0449": "shchcy", "\u0429": "SHCHcy", "\u044A": "hardcy", "\u042A": "HARDcy", "\u044B": "ycy", "\u042B": "Ycy", "\u044C": "softcy", "\u042C": "SOFTcy", "\u044D": "ecy", "\u042D": "Ecy", "\u044E": "yucy", "\u042E": "YUcy", "\u044F": "yacy", "\u042F": "YAcy", "\u2135": "aleph", "\u2136": "beth", "\u2137": "gimel", "\u2138": "daleth" };
      var regexEscape = /["&'<>`]/g;
      var escapeMap = {
        '"': "&quot;",
        "&": "&amp;",
        "'": "&#x27;",
        "<": "&lt;",
        // See https://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
        // following is not strictly necessary unless it’s part of a tag or an
        // unquoted attribute value. We’re only escaping it to support those
        // situations, and for XML support.
        ">": "&gt;",
        // In Internet Explorer ≤ 8, the backtick character can be used
        // to break out of (un)quoted attribute values or HTML comments.
        // See http://html5sec.org/#102, http://html5sec.org/#108, and
        // http://html5sec.org/#133.
        "`": "&#x60;"
      };
      var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
      var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
      var regexDecode = /&(CounterClockwiseContourIntegral|DoubleLongLeftRightArrow|ClockwiseContourIntegral|NotNestedGreaterGreater|NotSquareSupersetEqual|DiacriticalDoubleAcute|NotRightTriangleEqual|NotSucceedsSlantEqual|NotPrecedesSlantEqual|CloseCurlyDoubleQuote|NegativeVeryThinSpace|DoubleContourIntegral|FilledVerySmallSquare|CapitalDifferentialD|OpenCurlyDoubleQuote|EmptyVerySmallSquare|NestedGreaterGreater|DoubleLongRightArrow|NotLeftTriangleEqual|NotGreaterSlantEqual|ReverseUpEquilibrium|DoubleLeftRightArrow|NotSquareSubsetEqual|NotDoubleVerticalBar|RightArrowLeftArrow|NotGreaterFullEqual|NotRightTriangleBar|SquareSupersetEqual|DownLeftRightVector|DoubleLongLeftArrow|leftrightsquigarrow|LeftArrowRightArrow|NegativeMediumSpace|blacktriangleright|RightDownVectorBar|PrecedesSlantEqual|RightDoubleBracket|SucceedsSlantEqual|NotLeftTriangleBar|RightTriangleEqual|SquareIntersection|RightDownTeeVector|ReverseEquilibrium|NegativeThickSpace|longleftrightarrow|Longleftrightarrow|LongLeftRightArrow|DownRightTeeVector|DownRightVectorBar|GreaterSlantEqual|SquareSubsetEqual|LeftDownVectorBar|LeftDoubleBracket|VerticalSeparator|rightleftharpoons|NotGreaterGreater|NotSquareSuperset|blacktriangleleft|blacktriangledown|NegativeThinSpace|LeftDownTeeVector|NotLessSlantEqual|leftrightharpoons|DoubleUpDownArrow|DoubleVerticalBar|LeftTriangleEqual|FilledSmallSquare|twoheadrightarrow|NotNestedLessLess|DownLeftTeeVector|DownLeftVectorBar|RightAngleBracket|NotTildeFullEqual|NotReverseElement|RightUpDownVector|DiacriticalTilde|NotSucceedsTilde|circlearrowright|NotPrecedesEqual|rightharpoondown|DoubleRightArrow|NotSucceedsEqual|NonBreakingSpace|NotRightTriangle|LessEqualGreater|RightUpTeeVector|LeftAngleBracket|GreaterFullEqual|DownArrowUpArrow|RightUpVectorBar|twoheadleftarrow|GreaterEqualLess|downharpoonright|RightTriangleBar|ntrianglerighteq|NotSupersetEqual|LeftUpDownVector|DiacriticalAcute|rightrightarrows|vartriangleright|UpArrowDownArrow|DiacriticalGrave|UnderParenthesis|EmptySmallSquare|LeftUpVectorBar|leftrightarrows|DownRightVector|downharpoonleft|trianglerighteq|ShortRightArrow|OverParenthesis|DoubleLeftArrow|DoubleDownArrow|NotSquareSubset|bigtriangledown|ntrianglelefteq|UpperRightArrow|curvearrowright|vartriangleleft|NotLeftTriangle|nleftrightarrow|LowerRightArrow|NotHumpDownHump|NotGreaterTilde|rightthreetimes|LeftUpTeeVector|NotGreaterEqual|straightepsilon|LeftTriangleBar|rightsquigarrow|ContourIntegral|rightleftarrows|CloseCurlyQuote|RightDownVector|LeftRightVector|nLeftrightarrow|leftharpoondown|circlearrowleft|SquareSuperset|OpenCurlyQuote|hookrightarrow|HorizontalLine|DiacriticalDot|NotLessGreater|ntriangleright|DoubleRightTee|InvisibleComma|InvisibleTimes|LowerLeftArrow|DownLeftVector|NotSubsetEqual|curvearrowleft|trianglelefteq|NotVerticalBar|TildeFullEqual|downdownarrows|NotGreaterLess|RightTeeVector|ZeroWidthSpace|looparrowright|LongRightArrow|doublebarwedge|ShortLeftArrow|ShortDownArrow|RightVectorBar|GreaterGreater|ReverseElement|rightharpoonup|LessSlantEqual|leftthreetimes|upharpoonright|rightarrowtail|LeftDownVector|Longrightarrow|NestedLessLess|UpperLeftArrow|nshortparallel|leftleftarrows|leftrightarrow|Leftrightarrow|LeftRightArrow|longrightarrow|upharpoonleft|RightArrowBar|ApplyFunction|LeftTeeVector|leftarrowtail|NotEqualTilde|varsubsetneqq|varsupsetneqq|RightTeeArrow|SucceedsEqual|SucceedsTilde|LeftVectorBar|SupersetEqual|hookleftarrow|DifferentialD|VerticalTilde|VeryThinSpace|blacktriangle|bigtriangleup|LessFullEqual|divideontimes|leftharpoonup|UpEquilibrium|ntriangleleft|RightTriangle|measuredangle|shortparallel|longleftarrow|Longleftarrow|LongLeftArrow|DoubleLeftTee|Poincareplane|PrecedesEqual|triangleright|DoubleUpArrow|RightUpVector|fallingdotseq|looparrowleft|PrecedesTilde|NotTildeEqual|NotTildeTilde|smallsetminus|Proportional|triangleleft|triangledown|UnderBracket|NotHumpEqual|exponentiale|ExponentialE|NotLessTilde|HilbertSpace|RightCeiling|blacklozenge|varsupsetneq|HumpDownHump|GreaterEqual|VerticalLine|LeftTeeArrow|NotLessEqual|DownTeeArrow|LeftTriangle|varsubsetneq|Intersection|NotCongruent|DownArrowBar|LeftUpVector|LeftArrowBar|risingdotseq|GreaterTilde|RoundImplies|SquareSubset|ShortUpArrow|NotSuperset|quaternions|precnapprox|backepsilon|preccurlyeq|OverBracket|blacksquare|MediumSpace|VerticalBar|circledcirc|circleddash|CircleMinus|CircleTimes|LessGreater|curlyeqprec|curlyeqsucc|diamondsuit|UpDownArrow|Updownarrow|RuleDelayed|Rrightarrow|updownarrow|RightVector|nRightarrow|nrightarrow|eqslantless|LeftCeiling|Equilibrium|SmallCircle|expectation|NotSucceeds|thickapprox|GreaterLess|SquareUnion|NotPrecedes|NotLessLess|straightphi|succnapprox|succcurlyeq|SubsetEqual|sqsupseteq|Proportion|Laplacetrf|ImaginaryI|supsetneqq|NotGreater|gtreqqless|NotElement|ThickSpace|TildeEqual|TildeTilde|Fouriertrf|rmoustache|EqualTilde|eqslantgtr|UnderBrace|LeftVector|UpArrowBar|nLeftarrow|nsubseteqq|subsetneqq|nsupseteqq|nleftarrow|succapprox|lessapprox|UpTeeArrow|upuparrows|curlywedge|lesseqqgtr|varepsilon|varnothing|RightFloor|complement|CirclePlus|sqsubseteq|Lleftarrow|circledast|RightArrow|Rightarrow|rightarrow|lmoustache|Bernoullis|precapprox|mapstoleft|mapstodown|longmapsto|dotsquare|downarrow|DoubleDot|nsubseteq|supsetneq|leftarrow|nsupseteq|subsetneq|ThinSpace|ngeqslant|subseteqq|HumpEqual|NotSubset|triangleq|NotCupCap|lesseqgtr|heartsuit|TripleDot|Leftarrow|Coproduct|Congruent|varpropto|complexes|gvertneqq|LeftArrow|LessTilde|supseteqq|MinusPlus|CircleDot|nleqslant|NotExists|gtreqless|nparallel|UnionPlus|LeftFloor|checkmark|CenterDot|centerdot|Mellintrf|gtrapprox|bigotimes|OverBrace|spadesuit|therefore|pitchfork|rationals|PlusMinus|Backslash|Therefore|DownBreve|backsimeq|backprime|DownArrow|nshortmid|Downarrow|lvertneqq|eqvparsl|imagline|imagpart|infintie|integers|Integral|intercal|LessLess|Uarrocir|intlarhk|sqsupset|angmsdaf|sqsubset|llcorner|vartheta|cupbrcap|lnapprox|Superset|SuchThat|succnsim|succneqq|angmsdag|biguplus|curlyvee|trpezium|Succeeds|NotTilde|bigwedge|angmsdah|angrtvbd|triminus|cwconint|fpartint|lrcorner|smeparsl|subseteq|urcorner|lurdshar|laemptyv|DDotrahd|approxeq|ldrushar|awconint|mapstoup|backcong|shortmid|triangle|geqslant|gesdotol|timesbar|circledR|circledS|setminus|multimap|naturals|scpolint|ncongdot|RightTee|boxminus|gnapprox|boxtimes|andslope|thicksim|angmsdaa|varsigma|cirfnint|rtriltri|angmsdab|rppolint|angmsdac|barwedge|drbkarow|clubsuit|thetasym|bsolhsub|capbrcup|dzigrarr|doteqdot|DotEqual|dotminus|UnderBar|NotEqual|realpart|otimesas|ulcorner|hksearow|hkswarow|parallel|PartialD|elinters|emptyset|plusacir|bbrktbrk|angmsdad|pointint|bigoplus|angmsdae|Precedes|bigsqcup|varkappa|notindot|supseteq|precneqq|precnsim|profalar|profline|profsurf|leqslant|lesdotor|raemptyv|subplus|notnivb|notnivc|subrarr|zigrarr|vzigzag|submult|subedot|Element|between|cirscir|larrbfs|larrsim|lotimes|lbrksld|lbrkslu|lozenge|ldrdhar|dbkarow|bigcirc|epsilon|simrarr|simplus|ltquest|Epsilon|luruhar|gtquest|maltese|npolint|eqcolon|npreceq|bigodot|ddagger|gtrless|bnequiv|harrcir|ddotseq|equivDD|backsim|demptyv|nsqsube|nsqsupe|Upsilon|nsubset|upsilon|minusdu|nsucceq|swarrow|nsupset|coloneq|searrow|boxplus|napprox|natural|asympeq|alefsym|congdot|nearrow|bigstar|diamond|supplus|tritime|LeftTee|nvinfin|triplus|NewLine|nvltrie|nvrtrie|nwarrow|nexists|Diamond|ruluhar|Implies|supmult|angzarr|suplarr|suphsub|questeq|because|digamma|Because|olcross|bemptyv|omicron|Omicron|rotimes|NoBreak|intprod|angrtvb|orderof|uwangle|suphsol|lesdoto|orslope|DownTee|realine|cudarrl|rdldhar|OverBar|supedot|lessdot|supdsub|topfork|succsim|rbrkslu|rbrksld|pertenk|cudarrr|isindot|planckh|lessgtr|pluscir|gesdoto|plussim|plustwo|lesssim|cularrp|rarrsim|Cayleys|notinva|notinvb|notinvc|UpArrow|Uparrow|uparrow|NotLess|dwangle|precsim|Product|curarrm|Cconint|dotplus|rarrbfs|ccupssm|Cedilla|cemptyv|notniva|quatint|frac35|frac38|frac45|frac56|frac58|frac78|tridot|xoplus|gacute|gammad|Gammad|lfisht|lfloor|bigcup|sqsupe|gbreve|Gbreve|lharul|sqsube|sqcups|Gcedil|apacir|llhard|lmidot|Lmidot|lmoust|andand|sqcaps|approx|Abreve|spades|circeq|tprime|divide|topcir|Assign|topbot|gesdot|divonx|xuplus|timesd|gesles|atilde|solbar|SOFTcy|loplus|timesb|lowast|lowbar|dlcorn|dlcrop|softcy|dollar|lparlt|thksim|lrhard|Atilde|lsaquo|smashp|bigvee|thinsp|wreath|bkarow|lsquor|lstrok|Lstrok|lthree|ltimes|ltlarr|DotDot|simdot|ltrPar|weierp|xsqcup|angmsd|sigmav|sigmaf|zeetrf|Zcaron|zcaron|mapsto|vsupne|thetav|cirmid|marker|mcomma|Zacute|vsubnE|there4|gtlPar|vsubne|bottom|gtrarr|SHCHcy|shchcy|midast|midcir|middot|minusb|minusd|gtrdot|bowtie|sfrown|mnplus|models|colone|seswar|Colone|mstpos|searhk|gtrsim|nacute|Nacute|boxbox|telrec|hairsp|Tcedil|nbumpe|scnsim|ncaron|Ncaron|ncedil|Ncedil|hamilt|Scedil|nearhk|hardcy|HARDcy|tcedil|Tcaron|commat|nequiv|nesear|tcaron|target|hearts|nexist|varrho|scedil|Scaron|scaron|hellip|Sacute|sacute|hercon|swnwar|compfn|rtimes|rthree|rsquor|rsaquo|zacute|wedgeq|homtht|barvee|barwed|Barwed|rpargt|horbar|conint|swarhk|roplus|nltrie|hslash|hstrok|Hstrok|rmoust|Conint|bprime|hybull|hyphen|iacute|Iacute|supsup|supsub|supsim|varphi|coprod|brvbar|agrave|Supset|supset|igrave|Igrave|notinE|Agrave|iiiint|iinfin|copysr|wedbar|Verbar|vangrt|becaus|incare|verbar|inodot|bullet|drcorn|intcal|drcrop|cularr|vellip|Utilde|bumpeq|cupcap|dstrok|Dstrok|CupCap|cupcup|cupdot|eacute|Eacute|supdot|iquest|easter|ecaron|Ecaron|ecolon|isinsv|utilde|itilde|Itilde|curarr|succeq|Bumpeq|cacute|ulcrop|nparsl|Cacute|nprcue|egrave|Egrave|nrarrc|nrarrw|subsup|subsub|nrtrie|jsercy|nsccue|Jsercy|kappav|kcedil|Kcedil|subsim|ulcorn|nsimeq|egsdot|veebar|kgreen|capand|elsdot|Subset|subset|curren|aacute|lacute|Lacute|emptyv|ntilde|Ntilde|lagran|lambda|Lambda|capcap|Ugrave|langle|subdot|emsp13|numero|emsp14|nvdash|nvDash|nVdash|nVDash|ugrave|ufisht|nvHarr|larrfs|nvlArr|larrhk|larrlp|larrpl|nvrArr|Udblac|nwarhk|larrtl|nwnear|oacute|Oacute|latail|lAtail|sstarf|lbrace|odblac|Odblac|lbrack|udblac|odsold|eparsl|lcaron|Lcaron|ograve|Ograve|lcedil|Lcedil|Aacute|ssmile|ssetmn|squarf|ldquor|capcup|ominus|cylcty|rharul|eqcirc|dagger|rfloor|rfisht|Dagger|daleth|equals|origof|capdot|equest|dcaron|Dcaron|rdquor|oslash|Oslash|otilde|Otilde|otimes|Otimes|urcrop|Ubreve|ubreve|Yacute|Uacute|uacute|Rcedil|rcedil|urcorn|parsim|Rcaron|Vdashl|rcaron|Tstrok|percnt|period|permil|Exists|yacute|rbrack|rbrace|phmmat|ccaron|Ccaron|planck|ccedil|plankv|tstrok|female|plusdo|plusdu|ffilig|plusmn|ffllig|Ccedil|rAtail|dfisht|bernou|ratail|Rarrtl|rarrtl|angsph|rarrpl|rarrlp|rarrhk|xwedge|xotime|forall|ForAll|Vvdash|vsupnE|preceq|bigcap|frac12|frac13|frac14|primes|rarrfs|prnsim|frac15|Square|frac16|square|lesdot|frac18|frac23|propto|prurel|rarrap|rangle|puncsp|frac25|Racute|qprime|racute|lesges|frac34|abreve|AElig|eqsim|utdot|setmn|urtri|Equal|Uring|seArr|uring|searr|dashv|Dashv|mumap|nabla|iogon|Iogon|sdote|sdotb|scsim|napid|napos|equiv|natur|Acirc|dblac|erarr|nbump|iprod|erDot|ucirc|awint|esdot|angrt|ncong|isinE|scnap|Scirc|scirc|ndash|isins|Ubrcy|nearr|neArr|isinv|nedot|ubrcy|acute|Ycirc|iukcy|Iukcy|xutri|nesim|caret|jcirc|Jcirc|caron|twixt|ddarr|sccue|exist|jmath|sbquo|ngeqq|angst|ccaps|lceil|ngsim|UpTee|delta|Delta|rtrif|nharr|nhArr|nhpar|rtrie|jukcy|Jukcy|kappa|rsquo|Kappa|nlarr|nlArr|TSHcy|rrarr|aogon|Aogon|fflig|xrarr|tshcy|ccirc|nleqq|filig|upsih|nless|dharl|nlsim|fjlig|ropar|nltri|dharr|robrk|roarr|fllig|fltns|roang|rnmid|subnE|subne|lAarr|trisb|Ccirc|acirc|ccups|blank|VDash|forkv|Vdash|langd|cedil|blk12|blk14|laquo|strns|diams|notin|vDash|larrb|blk34|block|disin|uplus|vdash|vBarv|aelig|starf|Wedge|check|xrArr|lates|lbarr|lBarr|notni|lbbrk|bcong|frasl|lbrke|frown|vrtri|vprop|vnsup|gamma|Gamma|wedge|xodot|bdquo|srarr|doteq|ldquo|boxdl|boxdL|gcirc|Gcirc|boxDl|boxDL|boxdr|boxdR|boxDr|TRADE|trade|rlhar|boxDR|vnsub|npart|vltri|rlarr|boxhd|boxhD|nprec|gescc|nrarr|nrArr|boxHd|boxHD|boxhu|boxhU|nrtri|boxHu|clubs|boxHU|times|colon|Colon|gimel|xlArr|Tilde|nsime|tilde|nsmid|nspar|THORN|thorn|xlarr|nsube|nsubE|thkap|xhArr|comma|nsucc|boxul|boxuL|nsupe|nsupE|gneqq|gnsim|boxUl|boxUL|grave|boxur|boxuR|boxUr|boxUR|lescc|angle|bepsi|boxvh|varpi|boxvH|numsp|Theta|gsime|gsiml|theta|boxVh|boxVH|boxvl|gtcir|gtdot|boxvL|boxVl|boxVL|crarr|cross|Cross|nvsim|boxvr|nwarr|nwArr|sqsup|dtdot|Uogon|lhard|lharu|dtrif|ocirc|Ocirc|lhblk|duarr|odash|sqsub|Hacek|sqcup|llarr|duhar|oelig|OElig|ofcir|boxvR|uogon|lltri|boxVr|csube|uuarr|ohbar|csupe|ctdot|olarr|olcir|harrw|oline|sqcap|omacr|Omacr|omega|Omega|boxVR|aleph|lneqq|lnsim|loang|loarr|rharu|lobrk|hcirc|operp|oplus|rhard|Hcirc|orarr|Union|order|ecirc|Ecirc|cuepr|szlig|cuesc|breve|reals|eDDot|Breve|hoarr|lopar|utrif|rdquo|Umacr|umacr|efDot|swArr|ultri|alpha|rceil|ovbar|swarr|Wcirc|wcirc|smtes|smile|bsemi|lrarr|aring|parsl|lrhar|bsime|uhblk|lrtri|cupor|Aring|uharr|uharl|slarr|rbrke|bsolb|lsime|rbbrk|RBarr|lsimg|phone|rBarr|rbarr|icirc|lsquo|Icirc|emacr|Emacr|ratio|simne|plusb|simlE|simgE|simeq|pluse|ltcir|ltdot|empty|xharr|xdtri|iexcl|Alpha|ltrie|rarrw|pound|ltrif|xcirc|bumpe|prcue|bumpE|asymp|amacr|cuvee|Sigma|sigma|iiint|udhar|iiota|ijlig|IJlig|supnE|imacr|Imacr|prime|Prime|image|prnap|eogon|Eogon|rarrc|mdash|mDDot|cuwed|imath|supne|imped|Amacr|udarr|prsim|micro|rarrb|cwint|raquo|infin|eplus|range|rangd|Ucirc|radic|minus|amalg|veeeq|rAarr|epsiv|ycirc|quest|sharp|quot|zwnj|Qscr|race|qscr|Qopf|qopf|qint|rang|Rang|Zscr|zscr|Zopf|zopf|rarr|rArr|Rarr|Pscr|pscr|prop|prod|prnE|prec|ZHcy|zhcy|prap|Zeta|zeta|Popf|popf|Zdot|plus|zdot|Yuml|yuml|phiv|YUcy|yucy|Yscr|yscr|perp|Yopf|yopf|part|para|YIcy|Ouml|rcub|yicy|YAcy|rdca|ouml|osol|Oscr|rdsh|yacy|real|oscr|xvee|andd|rect|andv|Xscr|oror|ordm|ordf|xscr|ange|aopf|Aopf|rHar|Xopf|opar|Oopf|xopf|xnis|rhov|oopf|omid|xmap|oint|apid|apos|ogon|ascr|Ascr|odot|odiv|xcup|xcap|ocir|oast|nvlt|nvle|nvgt|nvge|nvap|Wscr|wscr|auml|ntlg|ntgl|nsup|nsub|nsim|Nscr|nscr|nsce|Wopf|ring|npre|wopf|npar|Auml|Barv|bbrk|Nopf|nopf|nmid|nLtv|beta|ropf|Ropf|Beta|beth|nles|rpar|nleq|bnot|bNot|nldr|NJcy|rscr|Rscr|Vscr|vscr|rsqb|njcy|bopf|nisd|Bopf|rtri|Vopf|nGtv|ngtr|vopf|boxh|boxH|boxv|nges|ngeq|boxV|bscr|scap|Bscr|bsim|Vert|vert|bsol|bull|bump|caps|cdot|ncup|scnE|ncap|nbsp|napE|Cdot|cent|sdot|Vbar|nang|vBar|chcy|Mscr|mscr|sect|semi|CHcy|Mopf|mopf|sext|circ|cire|mldr|mlcp|cirE|comp|shcy|SHcy|vArr|varr|cong|copf|Copf|copy|COPY|malt|male|macr|lvnE|cscr|ltri|sime|ltcc|simg|Cscr|siml|csub|Uuml|lsqb|lsim|uuml|csup|Lscr|lscr|utri|smid|lpar|cups|smte|lozf|darr|Lopf|Uscr|solb|lopf|sopf|Sopf|lneq|uscr|spar|dArr|lnap|Darr|dash|Sqrt|LJcy|ljcy|lHar|dHar|Upsi|upsi|diam|lesg|djcy|DJcy|leqq|dopf|Dopf|dscr|Dscr|dscy|ldsh|ldca|squf|DScy|sscr|Sscr|dsol|lcub|late|star|Star|Uopf|Larr|lArr|larr|uopf|dtri|dzcy|sube|subE|Lang|lang|Kscr|kscr|Kopf|kopf|KJcy|kjcy|KHcy|khcy|DZcy|ecir|edot|eDot|Jscr|jscr|succ|Jopf|jopf|Edot|uHar|emsp|ensp|Iuml|iuml|eopf|isin|Iscr|iscr|Eopf|epar|sung|epsi|escr|sup1|sup2|sup3|Iota|iota|supe|supE|Iopf|iopf|IOcy|iocy|Escr|esim|Esim|imof|Uarr|QUOT|uArr|uarr|euml|IEcy|iecy|Idot|Euml|euro|excl|Hscr|hscr|Hopf|hopf|TScy|tscy|Tscr|hbar|tscr|flat|tbrk|fnof|hArr|harr|half|fopf|Fopf|tdot|gvnE|fork|trie|gtcc|fscr|Fscr|gdot|gsim|Gscr|gscr|Gopf|gopf|gneq|Gdot|tosa|gnap|Topf|topf|geqq|toea|GJcy|gjcy|tint|gesl|mid|Sfr|ggg|top|ges|gla|glE|glj|geq|gne|gEl|gel|gnE|Gcy|gcy|gap|Tfr|tfr|Tcy|tcy|Hat|Tau|Ffr|tau|Tab|hfr|Hfr|ffr|Fcy|fcy|icy|Icy|iff|ETH|eth|ifr|Ifr|Eta|eta|int|Int|Sup|sup|ucy|Ucy|Sum|sum|jcy|ENG|ufr|Ufr|eng|Jcy|jfr|els|ell|egs|Efr|efr|Jfr|uml|kcy|Kcy|Ecy|ecy|kfr|Kfr|lap|Sub|sub|lat|lcy|Lcy|leg|Dot|dot|lEg|leq|les|squ|div|die|lfr|Lfr|lgE|Dfr|dfr|Del|deg|Dcy|dcy|lne|lnE|sol|loz|smt|Cup|lrm|cup|lsh|Lsh|sim|shy|map|Map|mcy|Mcy|mfr|Mfr|mho|gfr|Gfr|sfr|cir|Chi|chi|nap|Cfr|vcy|Vcy|cfr|Scy|scy|ncy|Ncy|vee|Vee|Cap|cap|nfr|scE|sce|Nfr|nge|ngE|nGg|vfr|Vfr|ngt|bot|nGt|nis|niv|Rsh|rsh|nle|nlE|bne|Bfr|bfr|nLl|nlt|nLt|Bcy|bcy|not|Not|rlm|wfr|Wfr|npr|nsc|num|ocy|ast|Ocy|ofr|xfr|Xfr|Ofr|ogt|ohm|apE|olt|Rho|ape|rho|Rfr|rfr|ord|REG|ang|reg|orv|And|and|AMP|Rcy|amp|Afr|ycy|Ycy|yen|yfr|Yfr|rcy|par|pcy|Pcy|pfr|Pfr|phi|Phi|afr|Acy|acy|zcy|Zcy|piv|acE|acd|zfr|Zfr|pre|prE|psi|Psi|qfr|Qfr|zwj|Or|ge|Gg|gt|gg|el|oS|lt|Lt|LT|Re|lg|gl|eg|ne|Im|it|le|DD|wp|wr|nu|Nu|dd|lE|Sc|sc|pi|Pi|ee|af|ll|Ll|rx|gE|xi|pm|Xi|ic|pr|Pr|in|ni|mp|mu|ac|Mu|or|ap|Gt|GT|ii);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)(?!;)([=a-zA-Z0-9]?)|&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+)/g;
      var decodeMap2 = { "aacute": "\xE1", "Aacute": "\xC1", "abreve": "\u0103", "Abreve": "\u0102", "ac": "\u223E", "acd": "\u223F", "acE": "\u223E\u0333", "acirc": "\xE2", "Acirc": "\xC2", "acute": "\xB4", "acy": "\u0430", "Acy": "\u0410", "aelig": "\xE6", "AElig": "\xC6", "af": "\u2061", "afr": "\u{1D51E}", "Afr": "\u{1D504}", "agrave": "\xE0", "Agrave": "\xC0", "alefsym": "\u2135", "aleph": "\u2135", "alpha": "\u03B1", "Alpha": "\u0391", "amacr": "\u0101", "Amacr": "\u0100", "amalg": "\u2A3F", "amp": "&", "AMP": "&", "and": "\u2227", "And": "\u2A53", "andand": "\u2A55", "andd": "\u2A5C", "andslope": "\u2A58", "andv": "\u2A5A", "ang": "\u2220", "ange": "\u29A4", "angle": "\u2220", "angmsd": "\u2221", "angmsdaa": "\u29A8", "angmsdab": "\u29A9", "angmsdac": "\u29AA", "angmsdad": "\u29AB", "angmsdae": "\u29AC", "angmsdaf": "\u29AD", "angmsdag": "\u29AE", "angmsdah": "\u29AF", "angrt": "\u221F", "angrtvb": "\u22BE", "angrtvbd": "\u299D", "angsph": "\u2222", "angst": "\xC5", "angzarr": "\u237C", "aogon": "\u0105", "Aogon": "\u0104", "aopf": "\u{1D552}", "Aopf": "\u{1D538}", "ap": "\u2248", "apacir": "\u2A6F", "ape": "\u224A", "apE": "\u2A70", "apid": "\u224B", "apos": "'", "ApplyFunction": "\u2061", "approx": "\u2248", "approxeq": "\u224A", "aring": "\xE5", "Aring": "\xC5", "ascr": "\u{1D4B6}", "Ascr": "\u{1D49C}", "Assign": "\u2254", "ast": "*", "asymp": "\u2248", "asympeq": "\u224D", "atilde": "\xE3", "Atilde": "\xC3", "auml": "\xE4", "Auml": "\xC4", "awconint": "\u2233", "awint": "\u2A11", "backcong": "\u224C", "backepsilon": "\u03F6", "backprime": "\u2035", "backsim": "\u223D", "backsimeq": "\u22CD", "Backslash": "\u2216", "Barv": "\u2AE7", "barvee": "\u22BD", "barwed": "\u2305", "Barwed": "\u2306", "barwedge": "\u2305", "bbrk": "\u23B5", "bbrktbrk": "\u23B6", "bcong": "\u224C", "bcy": "\u0431", "Bcy": "\u0411", "bdquo": "\u201E", "becaus": "\u2235", "because": "\u2235", "Because": "\u2235", "bemptyv": "\u29B0", "bepsi": "\u03F6", "bernou": "\u212C", "Bernoullis": "\u212C", "beta": "\u03B2", "Beta": "\u0392", "beth": "\u2136", "between": "\u226C", "bfr": "\u{1D51F}", "Bfr": "\u{1D505}", "bigcap": "\u22C2", "bigcirc": "\u25EF", "bigcup": "\u22C3", "bigodot": "\u2A00", "bigoplus": "\u2A01", "bigotimes": "\u2A02", "bigsqcup": "\u2A06", "bigstar": "\u2605", "bigtriangledown": "\u25BD", "bigtriangleup": "\u25B3", "biguplus": "\u2A04", "bigvee": "\u22C1", "bigwedge": "\u22C0", "bkarow": "\u290D", "blacklozenge": "\u29EB", "blacksquare": "\u25AA", "blacktriangle": "\u25B4", "blacktriangledown": "\u25BE", "blacktriangleleft": "\u25C2", "blacktriangleright": "\u25B8", "blank": "\u2423", "blk12": "\u2592", "blk14": "\u2591", "blk34": "\u2593", "block": "\u2588", "bne": "=\u20E5", "bnequiv": "\u2261\u20E5", "bnot": "\u2310", "bNot": "\u2AED", "bopf": "\u{1D553}", "Bopf": "\u{1D539}", "bot": "\u22A5", "bottom": "\u22A5", "bowtie": "\u22C8", "boxbox": "\u29C9", "boxdl": "\u2510", "boxdL": "\u2555", "boxDl": "\u2556", "boxDL": "\u2557", "boxdr": "\u250C", "boxdR": "\u2552", "boxDr": "\u2553", "boxDR": "\u2554", "boxh": "\u2500", "boxH": "\u2550", "boxhd": "\u252C", "boxhD": "\u2565", "boxHd": "\u2564", "boxHD": "\u2566", "boxhu": "\u2534", "boxhU": "\u2568", "boxHu": "\u2567", "boxHU": "\u2569", "boxminus": "\u229F", "boxplus": "\u229E", "boxtimes": "\u22A0", "boxul": "\u2518", "boxuL": "\u255B", "boxUl": "\u255C", "boxUL": "\u255D", "boxur": "\u2514", "boxuR": "\u2558", "boxUr": "\u2559", "boxUR": "\u255A", "boxv": "\u2502", "boxV": "\u2551", "boxvh": "\u253C", "boxvH": "\u256A", "boxVh": "\u256B", "boxVH": "\u256C", "boxvl": "\u2524", "boxvL": "\u2561", "boxVl": "\u2562", "boxVL": "\u2563", "boxvr": "\u251C", "boxvR": "\u255E", "boxVr": "\u255F", "boxVR": "\u2560", "bprime": "\u2035", "breve": "\u02D8", "Breve": "\u02D8", "brvbar": "\xA6", "bscr": "\u{1D4B7}", "Bscr": "\u212C", "bsemi": "\u204F", "bsim": "\u223D", "bsime": "\u22CD", "bsol": "\\", "bsolb": "\u29C5", "bsolhsub": "\u27C8", "bull": "\u2022", "bullet": "\u2022", "bump": "\u224E", "bumpe": "\u224F", "bumpE": "\u2AAE", "bumpeq": "\u224F", "Bumpeq": "\u224E", "cacute": "\u0107", "Cacute": "\u0106", "cap": "\u2229", "Cap": "\u22D2", "capand": "\u2A44", "capbrcup": "\u2A49", "capcap": "\u2A4B", "capcup": "\u2A47", "capdot": "\u2A40", "CapitalDifferentialD": "\u2145", "caps": "\u2229\uFE00", "caret": "\u2041", "caron": "\u02C7", "Cayleys": "\u212D", "ccaps": "\u2A4D", "ccaron": "\u010D", "Ccaron": "\u010C", "ccedil": "\xE7", "Ccedil": "\xC7", "ccirc": "\u0109", "Ccirc": "\u0108", "Cconint": "\u2230", "ccups": "\u2A4C", "ccupssm": "\u2A50", "cdot": "\u010B", "Cdot": "\u010A", "cedil": "\xB8", "Cedilla": "\xB8", "cemptyv": "\u29B2", "cent": "\xA2", "centerdot": "\xB7", "CenterDot": "\xB7", "cfr": "\u{1D520}", "Cfr": "\u212D", "chcy": "\u0447", "CHcy": "\u0427", "check": "\u2713", "checkmark": "\u2713", "chi": "\u03C7", "Chi": "\u03A7", "cir": "\u25CB", "circ": "\u02C6", "circeq": "\u2257", "circlearrowleft": "\u21BA", "circlearrowright": "\u21BB", "circledast": "\u229B", "circledcirc": "\u229A", "circleddash": "\u229D", "CircleDot": "\u2299", "circledR": "\xAE", "circledS": "\u24C8", "CircleMinus": "\u2296", "CirclePlus": "\u2295", "CircleTimes": "\u2297", "cire": "\u2257", "cirE": "\u29C3", "cirfnint": "\u2A10", "cirmid": "\u2AEF", "cirscir": "\u29C2", "ClockwiseContourIntegral": "\u2232", "CloseCurlyDoubleQuote": "\u201D", "CloseCurlyQuote": "\u2019", "clubs": "\u2663", "clubsuit": "\u2663", "colon": ":", "Colon": "\u2237", "colone": "\u2254", "Colone": "\u2A74", "coloneq": "\u2254", "comma": ",", "commat": "@", "comp": "\u2201", "compfn": "\u2218", "complement": "\u2201", "complexes": "\u2102", "cong": "\u2245", "congdot": "\u2A6D", "Congruent": "\u2261", "conint": "\u222E", "Conint": "\u222F", "ContourIntegral": "\u222E", "copf": "\u{1D554}", "Copf": "\u2102", "coprod": "\u2210", "Coproduct": "\u2210", "copy": "\xA9", "COPY": "\xA9", "copysr": "\u2117", "CounterClockwiseContourIntegral": "\u2233", "crarr": "\u21B5", "cross": "\u2717", "Cross": "\u2A2F", "cscr": "\u{1D4B8}", "Cscr": "\u{1D49E}", "csub": "\u2ACF", "csube": "\u2AD1", "csup": "\u2AD0", "csupe": "\u2AD2", "ctdot": "\u22EF", "cudarrl": "\u2938", "cudarrr": "\u2935", "cuepr": "\u22DE", "cuesc": "\u22DF", "cularr": "\u21B6", "cularrp": "\u293D", "cup": "\u222A", "Cup": "\u22D3", "cupbrcap": "\u2A48", "cupcap": "\u2A46", "CupCap": "\u224D", "cupcup": "\u2A4A", "cupdot": "\u228D", "cupor": "\u2A45", "cups": "\u222A\uFE00", "curarr": "\u21B7", "curarrm": "\u293C", "curlyeqprec": "\u22DE", "curlyeqsucc": "\u22DF", "curlyvee": "\u22CE", "curlywedge": "\u22CF", "curren": "\xA4", "curvearrowleft": "\u21B6", "curvearrowright": "\u21B7", "cuvee": "\u22CE", "cuwed": "\u22CF", "cwconint": "\u2232", "cwint": "\u2231", "cylcty": "\u232D", "dagger": "\u2020", "Dagger": "\u2021", "daleth": "\u2138", "darr": "\u2193", "dArr": "\u21D3", "Darr": "\u21A1", "dash": "\u2010", "dashv": "\u22A3", "Dashv": "\u2AE4", "dbkarow": "\u290F", "dblac": "\u02DD", "dcaron": "\u010F", "Dcaron": "\u010E", "dcy": "\u0434", "Dcy": "\u0414", "dd": "\u2146", "DD": "\u2145", "ddagger": "\u2021", "ddarr": "\u21CA", "DDotrahd": "\u2911", "ddotseq": "\u2A77", "deg": "\xB0", "Del": "\u2207", "delta": "\u03B4", "Delta": "\u0394", "demptyv": "\u29B1", "dfisht": "\u297F", "dfr": "\u{1D521}", "Dfr": "\u{1D507}", "dHar": "\u2965", "dharl": "\u21C3", "dharr": "\u21C2", "DiacriticalAcute": "\xB4", "DiacriticalDot": "\u02D9", "DiacriticalDoubleAcute": "\u02DD", "DiacriticalGrave": "`", "DiacriticalTilde": "\u02DC", "diam": "\u22C4", "diamond": "\u22C4", "Diamond": "\u22C4", "diamondsuit": "\u2666", "diams": "\u2666", "die": "\xA8", "DifferentialD": "\u2146", "digamma": "\u03DD", "disin": "\u22F2", "div": "\xF7", "divide": "\xF7", "divideontimes": "\u22C7", "divonx": "\u22C7", "djcy": "\u0452", "DJcy": "\u0402", "dlcorn": "\u231E", "dlcrop": "\u230D", "dollar": "$", "dopf": "\u{1D555}", "Dopf": "\u{1D53B}", "dot": "\u02D9", "Dot": "\xA8", "DotDot": "\u20DC", "doteq": "\u2250", "doteqdot": "\u2251", "DotEqual": "\u2250", "dotminus": "\u2238", "dotplus": "\u2214", "dotsquare": "\u22A1", "doublebarwedge": "\u2306", "DoubleContourIntegral": "\u222F", "DoubleDot": "\xA8", "DoubleDownArrow": "\u21D3", "DoubleLeftArrow": "\u21D0", "DoubleLeftRightArrow": "\u21D4", "DoubleLeftTee": "\u2AE4", "DoubleLongLeftArrow": "\u27F8", "DoubleLongLeftRightArrow": "\u27FA", "DoubleLongRightArrow": "\u27F9", "DoubleRightArrow": "\u21D2", "DoubleRightTee": "\u22A8", "DoubleUpArrow": "\u21D1", "DoubleUpDownArrow": "\u21D5", "DoubleVerticalBar": "\u2225", "downarrow": "\u2193", "Downarrow": "\u21D3", "DownArrow": "\u2193", "DownArrowBar": "\u2913", "DownArrowUpArrow": "\u21F5", "DownBreve": "\u0311", "downdownarrows": "\u21CA", "downharpoonleft": "\u21C3", "downharpoonright": "\u21C2", "DownLeftRightVector": "\u2950", "DownLeftTeeVector": "\u295E", "DownLeftVector": "\u21BD", "DownLeftVectorBar": "\u2956", "DownRightTeeVector": "\u295F", "DownRightVector": "\u21C1", "DownRightVectorBar": "\u2957", "DownTee": "\u22A4", "DownTeeArrow": "\u21A7", "drbkarow": "\u2910", "drcorn": "\u231F", "drcrop": "\u230C", "dscr": "\u{1D4B9}", "Dscr": "\u{1D49F}", "dscy": "\u0455", "DScy": "\u0405", "dsol": "\u29F6", "dstrok": "\u0111", "Dstrok": "\u0110", "dtdot": "\u22F1", "dtri": "\u25BF", "dtrif": "\u25BE", "duarr": "\u21F5", "duhar": "\u296F", "dwangle": "\u29A6", "dzcy": "\u045F", "DZcy": "\u040F", "dzigrarr": "\u27FF", "eacute": "\xE9", "Eacute": "\xC9", "easter": "\u2A6E", "ecaron": "\u011B", "Ecaron": "\u011A", "ecir": "\u2256", "ecirc": "\xEA", "Ecirc": "\xCA", "ecolon": "\u2255", "ecy": "\u044D", "Ecy": "\u042D", "eDDot": "\u2A77", "edot": "\u0117", "eDot": "\u2251", "Edot": "\u0116", "ee": "\u2147", "efDot": "\u2252", "efr": "\u{1D522}", "Efr": "\u{1D508}", "eg": "\u2A9A", "egrave": "\xE8", "Egrave": "\xC8", "egs": "\u2A96", "egsdot": "\u2A98", "el": "\u2A99", "Element": "\u2208", "elinters": "\u23E7", "ell": "\u2113", "els": "\u2A95", "elsdot": "\u2A97", "emacr": "\u0113", "Emacr": "\u0112", "empty": "\u2205", "emptyset": "\u2205", "EmptySmallSquare": "\u25FB", "emptyv": "\u2205", "EmptyVerySmallSquare": "\u25AB", "emsp": "\u2003", "emsp13": "\u2004", "emsp14": "\u2005", "eng": "\u014B", "ENG": "\u014A", "ensp": "\u2002", "eogon": "\u0119", "Eogon": "\u0118", "eopf": "\u{1D556}", "Eopf": "\u{1D53C}", "epar": "\u22D5", "eparsl": "\u29E3", "eplus": "\u2A71", "epsi": "\u03B5", "epsilon": "\u03B5", "Epsilon": "\u0395", "epsiv": "\u03F5", "eqcirc": "\u2256", "eqcolon": "\u2255", "eqsim": "\u2242", "eqslantgtr": "\u2A96", "eqslantless": "\u2A95", "Equal": "\u2A75", "equals": "=", "EqualTilde": "\u2242", "equest": "\u225F", "Equilibrium": "\u21CC", "equiv": "\u2261", "equivDD": "\u2A78", "eqvparsl": "\u29E5", "erarr": "\u2971", "erDot": "\u2253", "escr": "\u212F", "Escr": "\u2130", "esdot": "\u2250", "esim": "\u2242", "Esim": "\u2A73", "eta": "\u03B7", "Eta": "\u0397", "eth": "\xF0", "ETH": "\xD0", "euml": "\xEB", "Euml": "\xCB", "euro": "\u20AC", "excl": "!", "exist": "\u2203", "Exists": "\u2203", "expectation": "\u2130", "exponentiale": "\u2147", "ExponentialE": "\u2147", "fallingdotseq": "\u2252", "fcy": "\u0444", "Fcy": "\u0424", "female": "\u2640", "ffilig": "\uFB03", "fflig": "\uFB00", "ffllig": "\uFB04", "ffr": "\u{1D523}", "Ffr": "\u{1D509}", "filig": "\uFB01", "FilledSmallSquare": "\u25FC", "FilledVerySmallSquare": "\u25AA", "fjlig": "fj", "flat": "\u266D", "fllig": "\uFB02", "fltns": "\u25B1", "fnof": "\u0192", "fopf": "\u{1D557}", "Fopf": "\u{1D53D}", "forall": "\u2200", "ForAll": "\u2200", "fork": "\u22D4", "forkv": "\u2AD9", "Fouriertrf": "\u2131", "fpartint": "\u2A0D", "frac12": "\xBD", "frac13": "\u2153", "frac14": "\xBC", "frac15": "\u2155", "frac16": "\u2159", "frac18": "\u215B", "frac23": "\u2154", "frac25": "\u2156", "frac34": "\xBE", "frac35": "\u2157", "frac38": "\u215C", "frac45": "\u2158", "frac56": "\u215A", "frac58": "\u215D", "frac78": "\u215E", "frasl": "\u2044", "frown": "\u2322", "fscr": "\u{1D4BB}", "Fscr": "\u2131", "gacute": "\u01F5", "gamma": "\u03B3", "Gamma": "\u0393", "gammad": "\u03DD", "Gammad": "\u03DC", "gap": "\u2A86", "gbreve": "\u011F", "Gbreve": "\u011E", "Gcedil": "\u0122", "gcirc": "\u011D", "Gcirc": "\u011C", "gcy": "\u0433", "Gcy": "\u0413", "gdot": "\u0121", "Gdot": "\u0120", "ge": "\u2265", "gE": "\u2267", "gel": "\u22DB", "gEl": "\u2A8C", "geq": "\u2265", "geqq": "\u2267", "geqslant": "\u2A7E", "ges": "\u2A7E", "gescc": "\u2AA9", "gesdot": "\u2A80", "gesdoto": "\u2A82", "gesdotol": "\u2A84", "gesl": "\u22DB\uFE00", "gesles": "\u2A94", "gfr": "\u{1D524}", "Gfr": "\u{1D50A}", "gg": "\u226B", "Gg": "\u22D9", "ggg": "\u22D9", "gimel": "\u2137", "gjcy": "\u0453", "GJcy": "\u0403", "gl": "\u2277", "gla": "\u2AA5", "glE": "\u2A92", "glj": "\u2AA4", "gnap": "\u2A8A", "gnapprox": "\u2A8A", "gne": "\u2A88", "gnE": "\u2269", "gneq": "\u2A88", "gneqq": "\u2269", "gnsim": "\u22E7", "gopf": "\u{1D558}", "Gopf": "\u{1D53E}", "grave": "`", "GreaterEqual": "\u2265", "GreaterEqualLess": "\u22DB", "GreaterFullEqual": "\u2267", "GreaterGreater": "\u2AA2", "GreaterLess": "\u2277", "GreaterSlantEqual": "\u2A7E", "GreaterTilde": "\u2273", "gscr": "\u210A", "Gscr": "\u{1D4A2}", "gsim": "\u2273", "gsime": "\u2A8E", "gsiml": "\u2A90", "gt": ">", "Gt": "\u226B", "GT": ">", "gtcc": "\u2AA7", "gtcir": "\u2A7A", "gtdot": "\u22D7", "gtlPar": "\u2995", "gtquest": "\u2A7C", "gtrapprox": "\u2A86", "gtrarr": "\u2978", "gtrdot": "\u22D7", "gtreqless": "\u22DB", "gtreqqless": "\u2A8C", "gtrless": "\u2277", "gtrsim": "\u2273", "gvertneqq": "\u2269\uFE00", "gvnE": "\u2269\uFE00", "Hacek": "\u02C7", "hairsp": "\u200A", "half": "\xBD", "hamilt": "\u210B", "hardcy": "\u044A", "HARDcy": "\u042A", "harr": "\u2194", "hArr": "\u21D4", "harrcir": "\u2948", "harrw": "\u21AD", "Hat": "^", "hbar": "\u210F", "hcirc": "\u0125", "Hcirc": "\u0124", "hearts": "\u2665", "heartsuit": "\u2665", "hellip": "\u2026", "hercon": "\u22B9", "hfr": "\u{1D525}", "Hfr": "\u210C", "HilbertSpace": "\u210B", "hksearow": "\u2925", "hkswarow": "\u2926", "hoarr": "\u21FF", "homtht": "\u223B", "hookleftarrow": "\u21A9", "hookrightarrow": "\u21AA", "hopf": "\u{1D559}", "Hopf": "\u210D", "horbar": "\u2015", "HorizontalLine": "\u2500", "hscr": "\u{1D4BD}", "Hscr": "\u210B", "hslash": "\u210F", "hstrok": "\u0127", "Hstrok": "\u0126", "HumpDownHump": "\u224E", "HumpEqual": "\u224F", "hybull": "\u2043", "hyphen": "\u2010", "iacute": "\xED", "Iacute": "\xCD", "ic": "\u2063", "icirc": "\xEE", "Icirc": "\xCE", "icy": "\u0438", "Icy": "\u0418", "Idot": "\u0130", "iecy": "\u0435", "IEcy": "\u0415", "iexcl": "\xA1", "iff": "\u21D4", "ifr": "\u{1D526}", "Ifr": "\u2111", "igrave": "\xEC", "Igrave": "\xCC", "ii": "\u2148", "iiiint": "\u2A0C", "iiint": "\u222D", "iinfin": "\u29DC", "iiota": "\u2129", "ijlig": "\u0133", "IJlig": "\u0132", "Im": "\u2111", "imacr": "\u012B", "Imacr": "\u012A", "image": "\u2111", "ImaginaryI": "\u2148", "imagline": "\u2110", "imagpart": "\u2111", "imath": "\u0131", "imof": "\u22B7", "imped": "\u01B5", "Implies": "\u21D2", "in": "\u2208", "incare": "\u2105", "infin": "\u221E", "infintie": "\u29DD", "inodot": "\u0131", "int": "\u222B", "Int": "\u222C", "intcal": "\u22BA", "integers": "\u2124", "Integral": "\u222B", "intercal": "\u22BA", "Intersection": "\u22C2", "intlarhk": "\u2A17", "intprod": "\u2A3C", "InvisibleComma": "\u2063", "InvisibleTimes": "\u2062", "iocy": "\u0451", "IOcy": "\u0401", "iogon": "\u012F", "Iogon": "\u012E", "iopf": "\u{1D55A}", "Iopf": "\u{1D540}", "iota": "\u03B9", "Iota": "\u0399", "iprod": "\u2A3C", "iquest": "\xBF", "iscr": "\u{1D4BE}", "Iscr": "\u2110", "isin": "\u2208", "isindot": "\u22F5", "isinE": "\u22F9", "isins": "\u22F4", "isinsv": "\u22F3", "isinv": "\u2208", "it": "\u2062", "itilde": "\u0129", "Itilde": "\u0128", "iukcy": "\u0456", "Iukcy": "\u0406", "iuml": "\xEF", "Iuml": "\xCF", "jcirc": "\u0135", "Jcirc": "\u0134", "jcy": "\u0439", "Jcy": "\u0419", "jfr": "\u{1D527}", "Jfr": "\u{1D50D}", "jmath": "\u0237", "jopf": "\u{1D55B}", "Jopf": "\u{1D541}", "jscr": "\u{1D4BF}", "Jscr": "\u{1D4A5}", "jsercy": "\u0458", "Jsercy": "\u0408", "jukcy": "\u0454", "Jukcy": "\u0404", "kappa": "\u03BA", "Kappa": "\u039A", "kappav": "\u03F0", "kcedil": "\u0137", "Kcedil": "\u0136", "kcy": "\u043A", "Kcy": "\u041A", "kfr": "\u{1D528}", "Kfr": "\u{1D50E}", "kgreen": "\u0138", "khcy": "\u0445", "KHcy": "\u0425", "kjcy": "\u045C", "KJcy": "\u040C", "kopf": "\u{1D55C}", "Kopf": "\u{1D542}", "kscr": "\u{1D4C0}", "Kscr": "\u{1D4A6}", "lAarr": "\u21DA", "lacute": "\u013A", "Lacute": "\u0139", "laemptyv": "\u29B4", "lagran": "\u2112", "lambda": "\u03BB", "Lambda": "\u039B", "lang": "\u27E8", "Lang": "\u27EA", "langd": "\u2991", "langle": "\u27E8", "lap": "\u2A85", "Laplacetrf": "\u2112", "laquo": "\xAB", "larr": "\u2190", "lArr": "\u21D0", "Larr": "\u219E", "larrb": "\u21E4", "larrbfs": "\u291F", "larrfs": "\u291D", "larrhk": "\u21A9", "larrlp": "\u21AB", "larrpl": "\u2939", "larrsim": "\u2973", "larrtl": "\u21A2", "lat": "\u2AAB", "latail": "\u2919", "lAtail": "\u291B", "late": "\u2AAD", "lates": "\u2AAD\uFE00", "lbarr": "\u290C", "lBarr": "\u290E", "lbbrk": "\u2772", "lbrace": "{", "lbrack": "[", "lbrke": "\u298B", "lbrksld": "\u298F", "lbrkslu": "\u298D", "lcaron": "\u013E", "Lcaron": "\u013D", "lcedil": "\u013C", "Lcedil": "\u013B", "lceil": "\u2308", "lcub": "{", "lcy": "\u043B", "Lcy": "\u041B", "ldca": "\u2936", "ldquo": "\u201C", "ldquor": "\u201E", "ldrdhar": "\u2967", "ldrushar": "\u294B", "ldsh": "\u21B2", "le": "\u2264", "lE": "\u2266", "LeftAngleBracket": "\u27E8", "leftarrow": "\u2190", "Leftarrow": "\u21D0", "LeftArrow": "\u2190", "LeftArrowBar": "\u21E4", "LeftArrowRightArrow": "\u21C6", "leftarrowtail": "\u21A2", "LeftCeiling": "\u2308", "LeftDoubleBracket": "\u27E6", "LeftDownTeeVector": "\u2961", "LeftDownVector": "\u21C3", "LeftDownVectorBar": "\u2959", "LeftFloor": "\u230A", "leftharpoondown": "\u21BD", "leftharpoonup": "\u21BC", "leftleftarrows": "\u21C7", "leftrightarrow": "\u2194", "Leftrightarrow": "\u21D4", "LeftRightArrow": "\u2194", "leftrightarrows": "\u21C6", "leftrightharpoons": "\u21CB", "leftrightsquigarrow": "\u21AD", "LeftRightVector": "\u294E", "LeftTee": "\u22A3", "LeftTeeArrow": "\u21A4", "LeftTeeVector": "\u295A", "leftthreetimes": "\u22CB", "LeftTriangle": "\u22B2", "LeftTriangleBar": "\u29CF", "LeftTriangleEqual": "\u22B4", "LeftUpDownVector": "\u2951", "LeftUpTeeVector": "\u2960", "LeftUpVector": "\u21BF", "LeftUpVectorBar": "\u2958", "LeftVector": "\u21BC", "LeftVectorBar": "\u2952", "leg": "\u22DA", "lEg": "\u2A8B", "leq": "\u2264", "leqq": "\u2266", "leqslant": "\u2A7D", "les": "\u2A7D", "lescc": "\u2AA8", "lesdot": "\u2A7F", "lesdoto": "\u2A81", "lesdotor": "\u2A83", "lesg": "\u22DA\uFE00", "lesges": "\u2A93", "lessapprox": "\u2A85", "lessdot": "\u22D6", "lesseqgtr": "\u22DA", "lesseqqgtr": "\u2A8B", "LessEqualGreater": "\u22DA", "LessFullEqual": "\u2266", "LessGreater": "\u2276", "lessgtr": "\u2276", "LessLess": "\u2AA1", "lesssim": "\u2272", "LessSlantEqual": "\u2A7D", "LessTilde": "\u2272", "lfisht": "\u297C", "lfloor": "\u230A", "lfr": "\u{1D529}", "Lfr": "\u{1D50F}", "lg": "\u2276", "lgE": "\u2A91", "lHar": "\u2962", "lhard": "\u21BD", "lharu": "\u21BC", "lharul": "\u296A", "lhblk": "\u2584", "ljcy": "\u0459", "LJcy": "\u0409", "ll": "\u226A", "Ll": "\u22D8", "llarr": "\u21C7", "llcorner": "\u231E", "Lleftarrow": "\u21DA", "llhard": "\u296B", "lltri": "\u25FA", "lmidot": "\u0140", "Lmidot": "\u013F", "lmoust": "\u23B0", "lmoustache": "\u23B0", "lnap": "\u2A89", "lnapprox": "\u2A89", "lne": "\u2A87", "lnE": "\u2268", "lneq": "\u2A87", "lneqq": "\u2268", "lnsim": "\u22E6", "loang": "\u27EC", "loarr": "\u21FD", "lobrk": "\u27E6", "longleftarrow": "\u27F5", "Longleftarrow": "\u27F8", "LongLeftArrow": "\u27F5", "longleftrightarrow": "\u27F7", "Longleftrightarrow": "\u27FA", "LongLeftRightArrow": "\u27F7", "longmapsto": "\u27FC", "longrightarrow": "\u27F6", "Longrightarrow": "\u27F9", "LongRightArrow": "\u27F6", "looparrowleft": "\u21AB", "looparrowright": "\u21AC", "lopar": "\u2985", "lopf": "\u{1D55D}", "Lopf": "\u{1D543}", "loplus": "\u2A2D", "lotimes": "\u2A34", "lowast": "\u2217", "lowbar": "_", "LowerLeftArrow": "\u2199", "LowerRightArrow": "\u2198", "loz": "\u25CA", "lozenge": "\u25CA", "lozf": "\u29EB", "lpar": "(", "lparlt": "\u2993", "lrarr": "\u21C6", "lrcorner": "\u231F", "lrhar": "\u21CB", "lrhard": "\u296D", "lrm": "\u200E", "lrtri": "\u22BF", "lsaquo": "\u2039", "lscr": "\u{1D4C1}", "Lscr": "\u2112", "lsh": "\u21B0", "Lsh": "\u21B0", "lsim": "\u2272", "lsime": "\u2A8D", "lsimg": "\u2A8F", "lsqb": "[", "lsquo": "\u2018", "lsquor": "\u201A", "lstrok": "\u0142", "Lstrok": "\u0141", "lt": "<", "Lt": "\u226A", "LT": "<", "ltcc": "\u2AA6", "ltcir": "\u2A79", "ltdot": "\u22D6", "lthree": "\u22CB", "ltimes": "\u22C9", "ltlarr": "\u2976", "ltquest": "\u2A7B", "ltri": "\u25C3", "ltrie": "\u22B4", "ltrif": "\u25C2", "ltrPar": "\u2996", "lurdshar": "\u294A", "luruhar": "\u2966", "lvertneqq": "\u2268\uFE00", "lvnE": "\u2268\uFE00", "macr": "\xAF", "male": "\u2642", "malt": "\u2720", "maltese": "\u2720", "map": "\u21A6", "Map": "\u2905", "mapsto": "\u21A6", "mapstodown": "\u21A7", "mapstoleft": "\u21A4", "mapstoup": "\u21A5", "marker": "\u25AE", "mcomma": "\u2A29", "mcy": "\u043C", "Mcy": "\u041C", "mdash": "\u2014", "mDDot": "\u223A", "measuredangle": "\u2221", "MediumSpace": "\u205F", "Mellintrf": "\u2133", "mfr": "\u{1D52A}", "Mfr": "\u{1D510}", "mho": "\u2127", "micro": "\xB5", "mid": "\u2223", "midast": "*", "midcir": "\u2AF0", "middot": "\xB7", "minus": "\u2212", "minusb": "\u229F", "minusd": "\u2238", "minusdu": "\u2A2A", "MinusPlus": "\u2213", "mlcp": "\u2ADB", "mldr": "\u2026", "mnplus": "\u2213", "models": "\u22A7", "mopf": "\u{1D55E}", "Mopf": "\u{1D544}", "mp": "\u2213", "mscr": "\u{1D4C2}", "Mscr": "\u2133", "mstpos": "\u223E", "mu": "\u03BC", "Mu": "\u039C", "multimap": "\u22B8", "mumap": "\u22B8", "nabla": "\u2207", "nacute": "\u0144", "Nacute": "\u0143", "nang": "\u2220\u20D2", "nap": "\u2249", "napE": "\u2A70\u0338", "napid": "\u224B\u0338", "napos": "\u0149", "napprox": "\u2249", "natur": "\u266E", "natural": "\u266E", "naturals": "\u2115", "nbsp": "\xA0", "nbump": "\u224E\u0338", "nbumpe": "\u224F\u0338", "ncap": "\u2A43", "ncaron": "\u0148", "Ncaron": "\u0147", "ncedil": "\u0146", "Ncedil": "\u0145", "ncong": "\u2247", "ncongdot": "\u2A6D\u0338", "ncup": "\u2A42", "ncy": "\u043D", "Ncy": "\u041D", "ndash": "\u2013", "ne": "\u2260", "nearhk": "\u2924", "nearr": "\u2197", "neArr": "\u21D7", "nearrow": "\u2197", "nedot": "\u2250\u0338", "NegativeMediumSpace": "\u200B", "NegativeThickSpace": "\u200B", "NegativeThinSpace": "\u200B", "NegativeVeryThinSpace": "\u200B", "nequiv": "\u2262", "nesear": "\u2928", "nesim": "\u2242\u0338", "NestedGreaterGreater": "\u226B", "NestedLessLess": "\u226A", "NewLine": "\n", "nexist": "\u2204", "nexists": "\u2204", "nfr": "\u{1D52B}", "Nfr": "\u{1D511}", "nge": "\u2271", "ngE": "\u2267\u0338", "ngeq": "\u2271", "ngeqq": "\u2267\u0338", "ngeqslant": "\u2A7E\u0338", "nges": "\u2A7E\u0338", "nGg": "\u22D9\u0338", "ngsim": "\u2275", "ngt": "\u226F", "nGt": "\u226B\u20D2", "ngtr": "\u226F", "nGtv": "\u226B\u0338", "nharr": "\u21AE", "nhArr": "\u21CE", "nhpar": "\u2AF2", "ni": "\u220B", "nis": "\u22FC", "nisd": "\u22FA", "niv": "\u220B", "njcy": "\u045A", "NJcy": "\u040A", "nlarr": "\u219A", "nlArr": "\u21CD", "nldr": "\u2025", "nle": "\u2270", "nlE": "\u2266\u0338", "nleftarrow": "\u219A", "nLeftarrow": "\u21CD", "nleftrightarrow": "\u21AE", "nLeftrightarrow": "\u21CE", "nleq": "\u2270", "nleqq": "\u2266\u0338", "nleqslant": "\u2A7D\u0338", "nles": "\u2A7D\u0338", "nless": "\u226E", "nLl": "\u22D8\u0338", "nlsim": "\u2274", "nlt": "\u226E", "nLt": "\u226A\u20D2", "nltri": "\u22EA", "nltrie": "\u22EC", "nLtv": "\u226A\u0338", "nmid": "\u2224", "NoBreak": "\u2060", "NonBreakingSpace": "\xA0", "nopf": "\u{1D55F}", "Nopf": "\u2115", "not": "\xAC", "Not": "\u2AEC", "NotCongruent": "\u2262", "NotCupCap": "\u226D", "NotDoubleVerticalBar": "\u2226", "NotElement": "\u2209", "NotEqual": "\u2260", "NotEqualTilde": "\u2242\u0338", "NotExists": "\u2204", "NotGreater": "\u226F", "NotGreaterEqual": "\u2271", "NotGreaterFullEqual": "\u2267\u0338", "NotGreaterGreater": "\u226B\u0338", "NotGreaterLess": "\u2279", "NotGreaterSlantEqual": "\u2A7E\u0338", "NotGreaterTilde": "\u2275", "NotHumpDownHump": "\u224E\u0338", "NotHumpEqual": "\u224F\u0338", "notin": "\u2209", "notindot": "\u22F5\u0338", "notinE": "\u22F9\u0338", "notinva": "\u2209", "notinvb": "\u22F7", "notinvc": "\u22F6", "NotLeftTriangle": "\u22EA", "NotLeftTriangleBar": "\u29CF\u0338", "NotLeftTriangleEqual": "\u22EC", "NotLess": "\u226E", "NotLessEqual": "\u2270", "NotLessGreater": "\u2278", "NotLessLess": "\u226A\u0338", "NotLessSlantEqual": "\u2A7D\u0338", "NotLessTilde": "\u2274", "NotNestedGreaterGreater": "\u2AA2\u0338", "NotNestedLessLess": "\u2AA1\u0338", "notni": "\u220C", "notniva": "\u220C", "notnivb": "\u22FE", "notnivc": "\u22FD", "NotPrecedes": "\u2280", "NotPrecedesEqual": "\u2AAF\u0338", "NotPrecedesSlantEqual": "\u22E0", "NotReverseElement": "\u220C", "NotRightTriangle": "\u22EB", "NotRightTriangleBar": "\u29D0\u0338", "NotRightTriangleEqual": "\u22ED", "NotSquareSubset": "\u228F\u0338", "NotSquareSubsetEqual": "\u22E2", "NotSquareSuperset": "\u2290\u0338", "NotSquareSupersetEqual": "\u22E3", "NotSubset": "\u2282\u20D2", "NotSubsetEqual": "\u2288", "NotSucceeds": "\u2281", "NotSucceedsEqual": "\u2AB0\u0338", "NotSucceedsSlantEqual": "\u22E1", "NotSucceedsTilde": "\u227F\u0338", "NotSuperset": "\u2283\u20D2", "NotSupersetEqual": "\u2289", "NotTilde": "\u2241", "NotTildeEqual": "\u2244", "NotTildeFullEqual": "\u2247", "NotTildeTilde": "\u2249", "NotVerticalBar": "\u2224", "npar": "\u2226", "nparallel": "\u2226", "nparsl": "\u2AFD\u20E5", "npart": "\u2202\u0338", "npolint": "\u2A14", "npr": "\u2280", "nprcue": "\u22E0", "npre": "\u2AAF\u0338", "nprec": "\u2280", "npreceq": "\u2AAF\u0338", "nrarr": "\u219B", "nrArr": "\u21CF", "nrarrc": "\u2933\u0338", "nrarrw": "\u219D\u0338", "nrightarrow": "\u219B", "nRightarrow": "\u21CF", "nrtri": "\u22EB", "nrtrie": "\u22ED", "nsc": "\u2281", "nsccue": "\u22E1", "nsce": "\u2AB0\u0338", "nscr": "\u{1D4C3}", "Nscr": "\u{1D4A9}", "nshortmid": "\u2224", "nshortparallel": "\u2226", "nsim": "\u2241", "nsime": "\u2244", "nsimeq": "\u2244", "nsmid": "\u2224", "nspar": "\u2226", "nsqsube": "\u22E2", "nsqsupe": "\u22E3", "nsub": "\u2284", "nsube": "\u2288", "nsubE": "\u2AC5\u0338", "nsubset": "\u2282\u20D2", "nsubseteq": "\u2288", "nsubseteqq": "\u2AC5\u0338", "nsucc": "\u2281", "nsucceq": "\u2AB0\u0338", "nsup": "\u2285", "nsupe": "\u2289", "nsupE": "\u2AC6\u0338", "nsupset": "\u2283\u20D2", "nsupseteq": "\u2289", "nsupseteqq": "\u2AC6\u0338", "ntgl": "\u2279", "ntilde": "\xF1", "Ntilde": "\xD1", "ntlg": "\u2278", "ntriangleleft": "\u22EA", "ntrianglelefteq": "\u22EC", "ntriangleright": "\u22EB", "ntrianglerighteq": "\u22ED", "nu": "\u03BD", "Nu": "\u039D", "num": "#", "numero": "\u2116", "numsp": "\u2007", "nvap": "\u224D\u20D2", "nvdash": "\u22AC", "nvDash": "\u22AD", "nVdash": "\u22AE", "nVDash": "\u22AF", "nvge": "\u2265\u20D2", "nvgt": ">\u20D2", "nvHarr": "\u2904", "nvinfin": "\u29DE", "nvlArr": "\u2902", "nvle": "\u2264\u20D2", "nvlt": "<\u20D2", "nvltrie": "\u22B4\u20D2", "nvrArr": "\u2903", "nvrtrie": "\u22B5\u20D2", "nvsim": "\u223C\u20D2", "nwarhk": "\u2923", "nwarr": "\u2196", "nwArr": "\u21D6", "nwarrow": "\u2196", "nwnear": "\u2927", "oacute": "\xF3", "Oacute": "\xD3", "oast": "\u229B", "ocir": "\u229A", "ocirc": "\xF4", "Ocirc": "\xD4", "ocy": "\u043E", "Ocy": "\u041E", "odash": "\u229D", "odblac": "\u0151", "Odblac": "\u0150", "odiv": "\u2A38", "odot": "\u2299", "odsold": "\u29BC", "oelig": "\u0153", "OElig": "\u0152", "ofcir": "\u29BF", "ofr": "\u{1D52C}", "Ofr": "\u{1D512}", "ogon": "\u02DB", "ograve": "\xF2", "Ograve": "\xD2", "ogt": "\u29C1", "ohbar": "\u29B5", "ohm": "\u03A9", "oint": "\u222E", "olarr": "\u21BA", "olcir": "\u29BE", "olcross": "\u29BB", "oline": "\u203E", "olt": "\u29C0", "omacr": "\u014D", "Omacr": "\u014C", "omega": "\u03C9", "Omega": "\u03A9", "omicron": "\u03BF", "Omicron": "\u039F", "omid": "\u29B6", "ominus": "\u2296", "oopf": "\u{1D560}", "Oopf": "\u{1D546}", "opar": "\u29B7", "OpenCurlyDoubleQuote": "\u201C", "OpenCurlyQuote": "\u2018", "operp": "\u29B9", "oplus": "\u2295", "or": "\u2228", "Or": "\u2A54", "orarr": "\u21BB", "ord": "\u2A5D", "order": "\u2134", "orderof": "\u2134", "ordf": "\xAA", "ordm": "\xBA", "origof": "\u22B6", "oror": "\u2A56", "orslope": "\u2A57", "orv": "\u2A5B", "oS": "\u24C8", "oscr": "\u2134", "Oscr": "\u{1D4AA}", "oslash": "\xF8", "Oslash": "\xD8", "osol": "\u2298", "otilde": "\xF5", "Otilde": "\xD5", "otimes": "\u2297", "Otimes": "\u2A37", "otimesas": "\u2A36", "ouml": "\xF6", "Ouml": "\xD6", "ovbar": "\u233D", "OverBar": "\u203E", "OverBrace": "\u23DE", "OverBracket": "\u23B4", "OverParenthesis": "\u23DC", "par": "\u2225", "para": "\xB6", "parallel": "\u2225", "parsim": "\u2AF3", "parsl": "\u2AFD", "part": "\u2202", "PartialD": "\u2202", "pcy": "\u043F", "Pcy": "\u041F", "percnt": "%", "period": ".", "permil": "\u2030", "perp": "\u22A5", "pertenk": "\u2031", "pfr": "\u{1D52D}", "Pfr": "\u{1D513}", "phi": "\u03C6", "Phi": "\u03A6", "phiv": "\u03D5", "phmmat": "\u2133", "phone": "\u260E", "pi": "\u03C0", "Pi": "\u03A0", "pitchfork": "\u22D4", "piv": "\u03D6", "planck": "\u210F", "planckh": "\u210E", "plankv": "\u210F", "plus": "+", "plusacir": "\u2A23", "plusb": "\u229E", "pluscir": "\u2A22", "plusdo": "\u2214", "plusdu": "\u2A25", "pluse": "\u2A72", "PlusMinus": "\xB1", "plusmn": "\xB1", "plussim": "\u2A26", "plustwo": "\u2A27", "pm": "\xB1", "Poincareplane": "\u210C", "pointint": "\u2A15", "popf": "\u{1D561}", "Popf": "\u2119", "pound": "\xA3", "pr": "\u227A", "Pr": "\u2ABB", "prap": "\u2AB7", "prcue": "\u227C", "pre": "\u2AAF", "prE": "\u2AB3", "prec": "\u227A", "precapprox": "\u2AB7", "preccurlyeq": "\u227C", "Precedes": "\u227A", "PrecedesEqual": "\u2AAF", "PrecedesSlantEqual": "\u227C", "PrecedesTilde": "\u227E", "preceq": "\u2AAF", "precnapprox": "\u2AB9", "precneqq": "\u2AB5", "precnsim": "\u22E8", "precsim": "\u227E", "prime": "\u2032", "Prime": "\u2033", "primes": "\u2119", "prnap": "\u2AB9", "prnE": "\u2AB5", "prnsim": "\u22E8", "prod": "\u220F", "Product": "\u220F", "profalar": "\u232E", "profline": "\u2312", "profsurf": "\u2313", "prop": "\u221D", "Proportion": "\u2237", "Proportional": "\u221D", "propto": "\u221D", "prsim": "\u227E", "prurel": "\u22B0", "pscr": "\u{1D4C5}", "Pscr": "\u{1D4AB}", "psi": "\u03C8", "Psi": "\u03A8", "puncsp": "\u2008", "qfr": "\u{1D52E}", "Qfr": "\u{1D514}", "qint": "\u2A0C", "qopf": "\u{1D562}", "Qopf": "\u211A", "qprime": "\u2057", "qscr": "\u{1D4C6}", "Qscr": "\u{1D4AC}", "quaternions": "\u210D", "quatint": "\u2A16", "quest": "?", "questeq": "\u225F", "quot": '"', "QUOT": '"', "rAarr": "\u21DB", "race": "\u223D\u0331", "racute": "\u0155", "Racute": "\u0154", "radic": "\u221A", "raemptyv": "\u29B3", "rang": "\u27E9", "Rang": "\u27EB", "rangd": "\u2992", "range": "\u29A5", "rangle": "\u27E9", "raquo": "\xBB", "rarr": "\u2192", "rArr": "\u21D2", "Rarr": "\u21A0", "rarrap": "\u2975", "rarrb": "\u21E5", "rarrbfs": "\u2920", "rarrc": "\u2933", "rarrfs": "\u291E", "rarrhk": "\u21AA", "rarrlp": "\u21AC", "rarrpl": "\u2945", "rarrsim": "\u2974", "rarrtl": "\u21A3", "Rarrtl": "\u2916", "rarrw": "\u219D", "ratail": "\u291A", "rAtail": "\u291C", "ratio": "\u2236", "rationals": "\u211A", "rbarr": "\u290D", "rBarr": "\u290F", "RBarr": "\u2910", "rbbrk": "\u2773", "rbrace": "}", "rbrack": "]", "rbrke": "\u298C", "rbrksld": "\u298E", "rbrkslu": "\u2990", "rcaron": "\u0159", "Rcaron": "\u0158", "rcedil": "\u0157", "Rcedil": "\u0156", "rceil": "\u2309", "rcub": "}", "rcy": "\u0440", "Rcy": "\u0420", "rdca": "\u2937", "rdldhar": "\u2969", "rdquo": "\u201D", "rdquor": "\u201D", "rdsh": "\u21B3", "Re": "\u211C", "real": "\u211C", "realine": "\u211B", "realpart": "\u211C", "reals": "\u211D", "rect": "\u25AD", "reg": "\xAE", "REG": "\xAE", "ReverseElement": "\u220B", "ReverseEquilibrium": "\u21CB", "ReverseUpEquilibrium": "\u296F", "rfisht": "\u297D", "rfloor": "\u230B", "rfr": "\u{1D52F}", "Rfr": "\u211C", "rHar": "\u2964", "rhard": "\u21C1", "rharu": "\u21C0", "rharul": "\u296C", "rho": "\u03C1", "Rho": "\u03A1", "rhov": "\u03F1", "RightAngleBracket": "\u27E9", "rightarrow": "\u2192", "Rightarrow": "\u21D2", "RightArrow": "\u2192", "RightArrowBar": "\u21E5", "RightArrowLeftArrow": "\u21C4", "rightarrowtail": "\u21A3", "RightCeiling": "\u2309", "RightDoubleBracket": "\u27E7", "RightDownTeeVector": "\u295D", "RightDownVector": "\u21C2", "RightDownVectorBar": "\u2955", "RightFloor": "\u230B", "rightharpoondown": "\u21C1", "rightharpoonup": "\u21C0", "rightleftarrows": "\u21C4", "rightleftharpoons": "\u21CC", "rightrightarrows": "\u21C9", "rightsquigarrow": "\u219D", "RightTee": "\u22A2", "RightTeeArrow": "\u21A6", "RightTeeVector": "\u295B", "rightthreetimes": "\u22CC", "RightTriangle": "\u22B3", "RightTriangleBar": "\u29D0", "RightTriangleEqual": "\u22B5", "RightUpDownVector": "\u294F", "RightUpTeeVector": "\u295C", "RightUpVector": "\u21BE", "RightUpVectorBar": "\u2954", "RightVector": "\u21C0", "RightVectorBar": "\u2953", "ring": "\u02DA", "risingdotseq": "\u2253", "rlarr": "\u21C4", "rlhar": "\u21CC", "rlm": "\u200F", "rmoust": "\u23B1", "rmoustache": "\u23B1", "rnmid": "\u2AEE", "roang": "\u27ED", "roarr": "\u21FE", "robrk": "\u27E7", "ropar": "\u2986", "ropf": "\u{1D563}", "Ropf": "\u211D", "roplus": "\u2A2E", "rotimes": "\u2A35", "RoundImplies": "\u2970", "rpar": ")", "rpargt": "\u2994", "rppolint": "\u2A12", "rrarr": "\u21C9", "Rrightarrow": "\u21DB", "rsaquo": "\u203A", "rscr": "\u{1D4C7}", "Rscr": "\u211B", "rsh": "\u21B1", "Rsh": "\u21B1", "rsqb": "]", "rsquo": "\u2019", "rsquor": "\u2019", "rthree": "\u22CC", "rtimes": "\u22CA", "rtri": "\u25B9", "rtrie": "\u22B5", "rtrif": "\u25B8", "rtriltri": "\u29CE", "RuleDelayed": "\u29F4", "ruluhar": "\u2968", "rx": "\u211E", "sacute": "\u015B", "Sacute": "\u015A", "sbquo": "\u201A", "sc": "\u227B", "Sc": "\u2ABC", "scap": "\u2AB8", "scaron": "\u0161", "Scaron": "\u0160", "sccue": "\u227D", "sce": "\u2AB0", "scE": "\u2AB4", "scedil": "\u015F", "Scedil": "\u015E", "scirc": "\u015D", "Scirc": "\u015C", "scnap": "\u2ABA", "scnE": "\u2AB6", "scnsim": "\u22E9", "scpolint": "\u2A13", "scsim": "\u227F", "scy": "\u0441", "Scy": "\u0421", "sdot": "\u22C5", "sdotb": "\u22A1", "sdote": "\u2A66", "searhk": "\u2925", "searr": "\u2198", "seArr": "\u21D8", "searrow": "\u2198", "sect": "\xA7", "semi": ";", "seswar": "\u2929", "setminus": "\u2216", "setmn": "\u2216", "sext": "\u2736", "sfr": "\u{1D530}", "Sfr": "\u{1D516}", "sfrown": "\u2322", "sharp": "\u266F", "shchcy": "\u0449", "SHCHcy": "\u0429", "shcy": "\u0448", "SHcy": "\u0428", "ShortDownArrow": "\u2193", "ShortLeftArrow": "\u2190", "shortmid": "\u2223", "shortparallel": "\u2225", "ShortRightArrow": "\u2192", "ShortUpArrow": "\u2191", "shy": "\xAD", "sigma": "\u03C3", "Sigma": "\u03A3", "sigmaf": "\u03C2", "sigmav": "\u03C2", "sim": "\u223C", "simdot": "\u2A6A", "sime": "\u2243", "simeq": "\u2243", "simg": "\u2A9E", "simgE": "\u2AA0", "siml": "\u2A9D", "simlE": "\u2A9F", "simne": "\u2246", "simplus": "\u2A24", "simrarr": "\u2972", "slarr": "\u2190", "SmallCircle": "\u2218", "smallsetminus": "\u2216", "smashp": "\u2A33", "smeparsl": "\u29E4", "smid": "\u2223", "smile": "\u2323", "smt": "\u2AAA", "smte": "\u2AAC", "smtes": "\u2AAC\uFE00", "softcy": "\u044C", "SOFTcy": "\u042C", "sol": "/", "solb": "\u29C4", "solbar": "\u233F", "sopf": "\u{1D564}", "Sopf": "\u{1D54A}", "spades": "\u2660", "spadesuit": "\u2660", "spar": "\u2225", "sqcap": "\u2293", "sqcaps": "\u2293\uFE00", "sqcup": "\u2294", "sqcups": "\u2294\uFE00", "Sqrt": "\u221A", "sqsub": "\u228F", "sqsube": "\u2291", "sqsubset": "\u228F", "sqsubseteq": "\u2291", "sqsup": "\u2290", "sqsupe": "\u2292", "sqsupset": "\u2290", "sqsupseteq": "\u2292", "squ": "\u25A1", "square": "\u25A1", "Square": "\u25A1", "SquareIntersection": "\u2293", "SquareSubset": "\u228F", "SquareSubsetEqual": "\u2291", "SquareSuperset": "\u2290", "SquareSupersetEqual": "\u2292", "SquareUnion": "\u2294", "squarf": "\u25AA", "squf": "\u25AA", "srarr": "\u2192", "sscr": "\u{1D4C8}", "Sscr": "\u{1D4AE}", "ssetmn": "\u2216", "ssmile": "\u2323", "sstarf": "\u22C6", "star": "\u2606", "Star": "\u22C6", "starf": "\u2605", "straightepsilon": "\u03F5", "straightphi": "\u03D5", "strns": "\xAF", "sub": "\u2282", "Sub": "\u22D0", "subdot": "\u2ABD", "sube": "\u2286", "subE": "\u2AC5", "subedot": "\u2AC3", "submult": "\u2AC1", "subne": "\u228A", "subnE": "\u2ACB", "subplus": "\u2ABF", "subrarr": "\u2979", "subset": "\u2282", "Subset": "\u22D0", "subseteq": "\u2286", "subseteqq": "\u2AC5", "SubsetEqual": "\u2286", "subsetneq": "\u228A", "subsetneqq": "\u2ACB", "subsim": "\u2AC7", "subsub": "\u2AD5", "subsup": "\u2AD3", "succ": "\u227B", "succapprox": "\u2AB8", "succcurlyeq": "\u227D", "Succeeds": "\u227B", "SucceedsEqual": "\u2AB0", "SucceedsSlantEqual": "\u227D", "SucceedsTilde": "\u227F", "succeq": "\u2AB0", "succnapprox": "\u2ABA", "succneqq": "\u2AB6", "succnsim": "\u22E9", "succsim": "\u227F", "SuchThat": "\u220B", "sum": "\u2211", "Sum": "\u2211", "sung": "\u266A", "sup": "\u2283", "Sup": "\u22D1", "sup1": "\xB9", "sup2": "\xB2", "sup3": "\xB3", "supdot": "\u2ABE", "supdsub": "\u2AD8", "supe": "\u2287", "supE": "\u2AC6", "supedot": "\u2AC4", "Superset": "\u2283", "SupersetEqual": "\u2287", "suphsol": "\u27C9", "suphsub": "\u2AD7", "suplarr": "\u297B", "supmult": "\u2AC2", "supne": "\u228B", "supnE": "\u2ACC", "supplus": "\u2AC0", "supset": "\u2283", "Supset": "\u22D1", "supseteq": "\u2287", "supseteqq": "\u2AC6", "supsetneq": "\u228B", "supsetneqq": "\u2ACC", "supsim": "\u2AC8", "supsub": "\u2AD4", "supsup": "\u2AD6", "swarhk": "\u2926", "swarr": "\u2199", "swArr": "\u21D9", "swarrow": "\u2199", "swnwar": "\u292A", "szlig": "\xDF", "Tab": "	", "target": "\u2316", "tau": "\u03C4", "Tau": "\u03A4", "tbrk": "\u23B4", "tcaron": "\u0165", "Tcaron": "\u0164", "tcedil": "\u0163", "Tcedil": "\u0162", "tcy": "\u0442", "Tcy": "\u0422", "tdot": "\u20DB", "telrec": "\u2315", "tfr": "\u{1D531}", "Tfr": "\u{1D517}", "there4": "\u2234", "therefore": "\u2234", "Therefore": "\u2234", "theta": "\u03B8", "Theta": "\u0398", "thetasym": "\u03D1", "thetav": "\u03D1", "thickapprox": "\u2248", "thicksim": "\u223C", "ThickSpace": "\u205F\u200A", "thinsp": "\u2009", "ThinSpace": "\u2009", "thkap": "\u2248", "thksim": "\u223C", "thorn": "\xFE", "THORN": "\xDE", "tilde": "\u02DC", "Tilde": "\u223C", "TildeEqual": "\u2243", "TildeFullEqual": "\u2245", "TildeTilde": "\u2248", "times": "\xD7", "timesb": "\u22A0", "timesbar": "\u2A31", "timesd": "\u2A30", "tint": "\u222D", "toea": "\u2928", "top": "\u22A4", "topbot": "\u2336", "topcir": "\u2AF1", "topf": "\u{1D565}", "Topf": "\u{1D54B}", "topfork": "\u2ADA", "tosa": "\u2929", "tprime": "\u2034", "trade": "\u2122", "TRADE": "\u2122", "triangle": "\u25B5", "triangledown": "\u25BF", "triangleleft": "\u25C3", "trianglelefteq": "\u22B4", "triangleq": "\u225C", "triangleright": "\u25B9", "trianglerighteq": "\u22B5", "tridot": "\u25EC", "trie": "\u225C", "triminus": "\u2A3A", "TripleDot": "\u20DB", "triplus": "\u2A39", "trisb": "\u29CD", "tritime": "\u2A3B", "trpezium": "\u23E2", "tscr": "\u{1D4C9}", "Tscr": "\u{1D4AF}", "tscy": "\u0446", "TScy": "\u0426", "tshcy": "\u045B", "TSHcy": "\u040B", "tstrok": "\u0167", "Tstrok": "\u0166", "twixt": "\u226C", "twoheadleftarrow": "\u219E", "twoheadrightarrow": "\u21A0", "uacute": "\xFA", "Uacute": "\xDA", "uarr": "\u2191", "uArr": "\u21D1", "Uarr": "\u219F", "Uarrocir": "\u2949", "ubrcy": "\u045E", "Ubrcy": "\u040E", "ubreve": "\u016D", "Ubreve": "\u016C", "ucirc": "\xFB", "Ucirc": "\xDB", "ucy": "\u0443", "Ucy": "\u0423", "udarr": "\u21C5", "udblac": "\u0171", "Udblac": "\u0170", "udhar": "\u296E", "ufisht": "\u297E", "ufr": "\u{1D532}", "Ufr": "\u{1D518}", "ugrave": "\xF9", "Ugrave": "\xD9", "uHar": "\u2963", "uharl": "\u21BF", "uharr": "\u21BE", "uhblk": "\u2580", "ulcorn": "\u231C", "ulcorner": "\u231C", "ulcrop": "\u230F", "ultri": "\u25F8", "umacr": "\u016B", "Umacr": "\u016A", "uml": "\xA8", "UnderBar": "_", "UnderBrace": "\u23DF", "UnderBracket": "\u23B5", "UnderParenthesis": "\u23DD", "Union": "\u22C3", "UnionPlus": "\u228E", "uogon": "\u0173", "Uogon": "\u0172", "uopf": "\u{1D566}", "Uopf": "\u{1D54C}", "uparrow": "\u2191", "Uparrow": "\u21D1", "UpArrow": "\u2191", "UpArrowBar": "\u2912", "UpArrowDownArrow": "\u21C5", "updownarrow": "\u2195", "Updownarrow": "\u21D5", "UpDownArrow": "\u2195", "UpEquilibrium": "\u296E", "upharpoonleft": "\u21BF", "upharpoonright": "\u21BE", "uplus": "\u228E", "UpperLeftArrow": "\u2196", "UpperRightArrow": "\u2197", "upsi": "\u03C5", "Upsi": "\u03D2", "upsih": "\u03D2", "upsilon": "\u03C5", "Upsilon": "\u03A5", "UpTee": "\u22A5", "UpTeeArrow": "\u21A5", "upuparrows": "\u21C8", "urcorn": "\u231D", "urcorner": "\u231D", "urcrop": "\u230E", "uring": "\u016F", "Uring": "\u016E", "urtri": "\u25F9", "uscr": "\u{1D4CA}", "Uscr": "\u{1D4B0}", "utdot": "\u22F0", "utilde": "\u0169", "Utilde": "\u0168", "utri": "\u25B5", "utrif": "\u25B4", "uuarr": "\u21C8", "uuml": "\xFC", "Uuml": "\xDC", "uwangle": "\u29A7", "vangrt": "\u299C", "varepsilon": "\u03F5", "varkappa": "\u03F0", "varnothing": "\u2205", "varphi": "\u03D5", "varpi": "\u03D6", "varpropto": "\u221D", "varr": "\u2195", "vArr": "\u21D5", "varrho": "\u03F1", "varsigma": "\u03C2", "varsubsetneq": "\u228A\uFE00", "varsubsetneqq": "\u2ACB\uFE00", "varsupsetneq": "\u228B\uFE00", "varsupsetneqq": "\u2ACC\uFE00", "vartheta": "\u03D1", "vartriangleleft": "\u22B2", "vartriangleright": "\u22B3", "vBar": "\u2AE8", "Vbar": "\u2AEB", "vBarv": "\u2AE9", "vcy": "\u0432", "Vcy": "\u0412", "vdash": "\u22A2", "vDash": "\u22A8", "Vdash": "\u22A9", "VDash": "\u22AB", "Vdashl": "\u2AE6", "vee": "\u2228", "Vee": "\u22C1", "veebar": "\u22BB", "veeeq": "\u225A", "vellip": "\u22EE", "verbar": "|", "Verbar": "\u2016", "vert": "|", "Vert": "\u2016", "VerticalBar": "\u2223", "VerticalLine": "|", "VerticalSeparator": "\u2758", "VerticalTilde": "\u2240", "VeryThinSpace": "\u200A", "vfr": "\u{1D533}", "Vfr": "\u{1D519}", "vltri": "\u22B2", "vnsub": "\u2282\u20D2", "vnsup": "\u2283\u20D2", "vopf": "\u{1D567}", "Vopf": "\u{1D54D}", "vprop": "\u221D", "vrtri": "\u22B3", "vscr": "\u{1D4CB}", "Vscr": "\u{1D4B1}", "vsubne": "\u228A\uFE00", "vsubnE": "\u2ACB\uFE00", "vsupne": "\u228B\uFE00", "vsupnE": "\u2ACC\uFE00", "Vvdash": "\u22AA", "vzigzag": "\u299A", "wcirc": "\u0175", "Wcirc": "\u0174", "wedbar": "\u2A5F", "wedge": "\u2227", "Wedge": "\u22C0", "wedgeq": "\u2259", "weierp": "\u2118", "wfr": "\u{1D534}", "Wfr": "\u{1D51A}", "wopf": "\u{1D568}", "Wopf": "\u{1D54E}", "wp": "\u2118", "wr": "\u2240", "wreath": "\u2240", "wscr": "\u{1D4CC}", "Wscr": "\u{1D4B2}", "xcap": "\u22C2", "xcirc": "\u25EF", "xcup": "\u22C3", "xdtri": "\u25BD", "xfr": "\u{1D535}", "Xfr": "\u{1D51B}", "xharr": "\u27F7", "xhArr": "\u27FA", "xi": "\u03BE", "Xi": "\u039E", "xlarr": "\u27F5", "xlArr": "\u27F8", "xmap": "\u27FC", "xnis": "\u22FB", "xodot": "\u2A00", "xopf": "\u{1D569}", "Xopf": "\u{1D54F}", "xoplus": "\u2A01", "xotime": "\u2A02", "xrarr": "\u27F6", "xrArr": "\u27F9", "xscr": "\u{1D4CD}", "Xscr": "\u{1D4B3}", "xsqcup": "\u2A06", "xuplus": "\u2A04", "xutri": "\u25B3", "xvee": "\u22C1", "xwedge": "\u22C0", "yacute": "\xFD", "Yacute": "\xDD", "yacy": "\u044F", "YAcy": "\u042F", "ycirc": "\u0177", "Ycirc": "\u0176", "ycy": "\u044B", "Ycy": "\u042B", "yen": "\xA5", "yfr": "\u{1D536}", "Yfr": "\u{1D51C}", "yicy": "\u0457", "YIcy": "\u0407", "yopf": "\u{1D56A}", "Yopf": "\u{1D550}", "yscr": "\u{1D4CE}", "Yscr": "\u{1D4B4}", "yucy": "\u044E", "YUcy": "\u042E", "yuml": "\xFF", "Yuml": "\u0178", "zacute": "\u017A", "Zacute": "\u0179", "zcaron": "\u017E", "Zcaron": "\u017D", "zcy": "\u0437", "Zcy": "\u0417", "zdot": "\u017C", "Zdot": "\u017B", "zeetrf": "\u2128", "ZeroWidthSpace": "\u200B", "zeta": "\u03B6", "Zeta": "\u0396", "zfr": "\u{1D537}", "Zfr": "\u2128", "zhcy": "\u0436", "ZHcy": "\u0416", "zigrarr": "\u21DD", "zopf": "\u{1D56B}", "Zopf": "\u2124", "zscr": "\u{1D4CF}", "Zscr": "\u{1D4B5}", "zwj": "\u200D", "zwnj": "\u200C" };
      var decodeMapLegacy = { "aacute": "\xE1", "Aacute": "\xC1", "acirc": "\xE2", "Acirc": "\xC2", "acute": "\xB4", "aelig": "\xE6", "AElig": "\xC6", "agrave": "\xE0", "Agrave": "\xC0", "amp": "&", "AMP": "&", "aring": "\xE5", "Aring": "\xC5", "atilde": "\xE3", "Atilde": "\xC3", "auml": "\xE4", "Auml": "\xC4", "brvbar": "\xA6", "ccedil": "\xE7", "Ccedil": "\xC7", "cedil": "\xB8", "cent": "\xA2", "copy": "\xA9", "COPY": "\xA9", "curren": "\xA4", "deg": "\xB0", "divide": "\xF7", "eacute": "\xE9", "Eacute": "\xC9", "ecirc": "\xEA", "Ecirc": "\xCA", "egrave": "\xE8", "Egrave": "\xC8", "eth": "\xF0", "ETH": "\xD0", "euml": "\xEB", "Euml": "\xCB", "frac12": "\xBD", "frac14": "\xBC", "frac34": "\xBE", "gt": ">", "GT": ">", "iacute": "\xED", "Iacute": "\xCD", "icirc": "\xEE", "Icirc": "\xCE", "iexcl": "\xA1", "igrave": "\xEC", "Igrave": "\xCC", "iquest": "\xBF", "iuml": "\xEF", "Iuml": "\xCF", "laquo": "\xAB", "lt": "<", "LT": "<", "macr": "\xAF", "micro": "\xB5", "middot": "\xB7", "nbsp": "\xA0", "not": "\xAC", "ntilde": "\xF1", "Ntilde": "\xD1", "oacute": "\xF3", "Oacute": "\xD3", "ocirc": "\xF4", "Ocirc": "\xD4", "ograve": "\xF2", "Ograve": "\xD2", "ordf": "\xAA", "ordm": "\xBA", "oslash": "\xF8", "Oslash": "\xD8", "otilde": "\xF5", "Otilde": "\xD5", "ouml": "\xF6", "Ouml": "\xD6", "para": "\xB6", "plusmn": "\xB1", "pound": "\xA3", "quot": '"', "QUOT": '"', "raquo": "\xBB", "reg": "\xAE", "REG": "\xAE", "sect": "\xA7", "shy": "\xAD", "sup1": "\xB9", "sup2": "\xB2", "sup3": "\xB3", "szlig": "\xDF", "thorn": "\xFE", "THORN": "\xDE", "times": "\xD7", "uacute": "\xFA", "Uacute": "\xDA", "ucirc": "\xFB", "Ucirc": "\xDB", "ugrave": "\xF9", "Ugrave": "\xD9", "uml": "\xA8", "uuml": "\xFC", "Uuml": "\xDC", "yacute": "\xFD", "Yacute": "\xDD", "yen": "\xA5", "yuml": "\xFF" };
      var decodeMapNumeric = { "0": "\uFFFD", "128": "\u20AC", "130": "\u201A", "131": "\u0192", "132": "\u201E", "133": "\u2026", "134": "\u2020", "135": "\u2021", "136": "\u02C6", "137": "\u2030", "138": "\u0160", "139": "\u2039", "140": "\u0152", "142": "\u017D", "145": "\u2018", "146": "\u2019", "147": "\u201C", "148": "\u201D", "149": "\u2022", "150": "\u2013", "151": "\u2014", "152": "\u02DC", "153": "\u2122", "154": "\u0161", "155": "\u203A", "156": "\u0153", "158": "\u017E", "159": "\u0178" };
      var invalidReferenceCodePoints = [1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 64976, 64977, 64978, 64979, 64980, 64981, 64982, 64983, 64984, 64985, 64986, 64987, 64988, 64989, 64990, 64991, 64992, 64993, 64994, 64995, 64996, 64997, 64998, 64999, 65e3, 65001, 65002, 65003, 65004, 65005, 65006, 65007, 65534, 65535, 131070, 131071, 196606, 196607, 262142, 262143, 327678, 327679, 393214, 393215, 458750, 458751, 524286, 524287, 589822, 589823, 655358, 655359, 720894, 720895, 786430, 786431, 851966, 851967, 917502, 917503, 983038, 983039, 1048574, 1048575, 1114110, 1114111];
      var stringFromCharCode = String.fromCharCode;
      var object = {};
      var hasOwnProperty = object.hasOwnProperty;
      var has = function(object2, propertyName) {
        return hasOwnProperty.call(object2, propertyName);
      };
      var contains = function(array, value) {
        var index = -1;
        var length = array.length;
        while (++index < length) {
          if (array[index] == value) {
            return true;
          }
        }
        return false;
      };
      var merge = function(options, defaults) {
        if (!options) {
          return defaults;
        }
        var result = {};
        var key3;
        for (key3 in defaults) {
          result[key3] = has(options, key3) ? options[key3] : defaults[key3];
        }
        return result;
      };
      var codePointToSymbol = function(codePoint, strict) {
        var output = "";
        if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
          if (strict) {
            parseError("character reference outside the permissible Unicode range");
          }
          return "\uFFFD";
        }
        if (has(decodeMapNumeric, codePoint)) {
          if (strict) {
            parseError("disallowed character reference");
          }
          return decodeMapNumeric[codePoint];
        }
        if (strict && contains(invalidReferenceCodePoints, codePoint)) {
          parseError("disallowed character reference");
        }
        if (codePoint > 65535) {
          codePoint -= 65536;
          output += stringFromCharCode(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        output += stringFromCharCode(codePoint);
        return output;
      };
      var hexEscape = function(codePoint) {
        return "&#x" + codePoint.toString(16).toUpperCase() + ";";
      };
      var decEscape = function(codePoint) {
        return "&#" + codePoint + ";";
      };
      var parseError = function(message) {
        throw Error("Parse error: " + message);
      };
      var encode = function(string, options) {
        options = merge(options, encode.options);
        var strict = options.strict;
        if (strict && regexInvalidRawCodePoint.test(string)) {
          parseError("forbidden code point");
        }
        var encodeEverything = options.encodeEverything;
        var useNamedReferences = options.useNamedReferences;
        var allowUnsafeSymbols = options.allowUnsafeSymbols;
        var escapeCodePoint = options.decimal ? decEscape : hexEscape;
        var escapeBmpSymbol = function(symbol) {
          return escapeCodePoint(symbol.charCodeAt(0));
        };
        if (encodeEverything) {
          string = string.replace(regexAsciiWhitelist, function(symbol) {
            if (useNamedReferences && has(encodeMap, symbol)) {
              return "&" + encodeMap[symbol] + ";";
            }
            return escapeBmpSymbol(symbol);
          });
          if (useNamedReferences) {
            string = string.replace(/&gt;\u20D2/g, "&nvgt;").replace(/&lt;\u20D2/g, "&nvlt;").replace(/&#x66;&#x6A;/g, "&fjlig;");
          }
          if (useNamedReferences) {
            string = string.replace(regexEncodeNonAscii, function(string2) {
              return "&" + encodeMap[string2] + ";";
            });
          }
        } else if (useNamedReferences) {
          if (!allowUnsafeSymbols) {
            string = string.replace(regexEscape, function(string2) {
              return "&" + encodeMap[string2] + ";";
            });
          }
          string = string.replace(/&gt;\u20D2/g, "&nvgt;").replace(/&lt;\u20D2/g, "&nvlt;");
          string = string.replace(regexEncodeNonAscii, function(string2) {
            return "&" + encodeMap[string2] + ";";
          });
        } else if (!allowUnsafeSymbols) {
          string = string.replace(regexEscape, escapeBmpSymbol);
        }
        return string.replace(regexAstralSymbols, function($0) {
          var high = $0.charCodeAt(0);
          var low = $0.charCodeAt(1);
          var codePoint = (high - 55296) * 1024 + low - 56320 + 65536;
          return escapeCodePoint(codePoint);
        }).replace(regexBmpWhitelist, escapeBmpSymbol);
      };
      encode.options = {
        "allowUnsafeSymbols": false,
        "encodeEverything": false,
        "strict": false,
        "useNamedReferences": false,
        "decimal": false
      };
      var decode = function(html, options) {
        options = merge(options, decode.options);
        var strict = options.strict;
        if (strict && regexInvalidEntity.test(html)) {
          parseError("malformed character reference");
        }
        return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7, $8) {
          var codePoint;
          var semicolon;
          var decDigits;
          var hexDigits;
          var reference;
          var next;
          if ($1) {
            reference = $1;
            return decodeMap2[reference];
          }
          if ($2) {
            reference = $2;
            next = $3;
            if (next && options.isAttributeValue) {
              if (strict && next == "=") {
                parseError("`&` did not start a character reference");
              }
              return $0;
            } else {
              if (strict) {
                parseError(
                  "named character reference was not terminated by a semicolon"
                );
              }
              return decodeMapLegacy[reference] + (next || "");
            }
          }
          if ($4) {
            decDigits = $4;
            semicolon = $5;
            if (strict && !semicolon) {
              parseError("character reference was not terminated by a semicolon");
            }
            codePoint = parseInt(decDigits, 10);
            return codePointToSymbol(codePoint, strict);
          }
          if ($6) {
            hexDigits = $6;
            semicolon = $7;
            if (strict && !semicolon) {
              parseError("character reference was not terminated by a semicolon");
            }
            codePoint = parseInt(hexDigits, 16);
            return codePointToSymbol(codePoint, strict);
          }
          if (strict) {
            parseError(
              "named character reference was not terminated by a semicolon"
            );
          }
          return $0;
        });
      };
      decode.options = {
        "isAttributeValue": false,
        "strict": false
      };
      var escape3 = function(string) {
        return string.replace(regexEscape, function($0) {
          return escapeMap[$0];
        });
      };
      var he = {
        "version": "1.2.0",
        "encode": encode,
        "decode": decode,
        "escape": escape3,
        "unescape": decode
      };
      if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
        define(function() {
          return he;
        });
      } else if (freeExports && !freeExports.nodeType) {
        if (freeModule) {
          freeModule.exports = he;
        } else {
          for (var key2 in he) {
            has(he, key2) && (freeExports[key2] = he[key2]);
          }
        }
      } else {
        root.he = he;
      }
    })(exports);
  }
});

// node_modules/node-html-parser/dist/nodes/node.js
var require_node = __commonJS({
  "node_modules/node-html-parser/dist/nodes/node.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var he_1 = require_he();
    var Node4 = (
      /** @class */
      function() {
        function Node5(parentNode, range) {
          if (parentNode === void 0) {
            parentNode = null;
          }
          this.parentNode = parentNode;
          this.childNodes = [];
          Object.defineProperty(this, "range", {
            enumerable: false,
            writable: true,
            configurable: true,
            value: range !== null && range !== void 0 ? range : [-1, -1]
          });
        }
        Node5.prototype.remove = function() {
          var _this = this;
          if (this.parentNode) {
            var children = this.parentNode.childNodes;
            this.parentNode.childNodes = children.filter(function(child) {
              return _this !== child;
            });
            this.parentNode = null;
          }
          return this;
        };
        Object.defineProperty(Node5.prototype, "innerText", {
          get: function() {
            return this.rawText;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Node5.prototype, "textContent", {
          get: function() {
            return (0, he_1.decode)(this.rawText);
          },
          set: function(val) {
            this.rawText = (0, he_1.encode)(val);
          },
          enumerable: false,
          configurable: true
        });
        return Node5;
      }()
    );
    exports.default = Node4;
  }
});

// node_modules/node-html-parser/dist/nodes/type.js
var require_type = __commonJS({
  "node_modules/node-html-parser/dist/nodes/type.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NodeType;
    (function(NodeType2) {
      NodeType2[NodeType2["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
      NodeType2[NodeType2["TEXT_NODE"] = 3] = "TEXT_NODE";
      NodeType2[NodeType2["COMMENT_NODE"] = 8] = "COMMENT_NODE";
    })(NodeType || (NodeType = {}));
    exports.default = NodeType;
  }
});

// node_modules/node-html-parser/dist/nodes/comment.js
var require_comment = __commonJS({
  "node_modules/node-html-parser/dist/nodes/comment.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var node_1 = __importDefault(require_node());
    var type_1 = __importDefault(require_type());
    var CommentNode = (
      /** @class */
      function(_super) {
        __extends(CommentNode2, _super);
        function CommentNode2(rawText, parentNode, range) {
          if (parentNode === void 0) {
            parentNode = null;
          }
          var _this = _super.call(this, parentNode, range) || this;
          _this.rawText = rawText;
          _this.nodeType = type_1.default.COMMENT_NODE;
          return _this;
        }
        CommentNode2.prototype.clone = function() {
          return new CommentNode2(this.rawText, null);
        };
        Object.defineProperty(CommentNode2.prototype, "text", {
          /**
           * Get unescaped text value of current node and its children.
           * @return {string} text content
           */
          get: function() {
            return this.rawText;
          },
          enumerable: false,
          configurable: true
        });
        CommentNode2.prototype.toString = function() {
          return "<!--".concat(this.rawText, "-->");
        };
        return CommentNode2;
      }(node_1.default)
    );
    exports.default = CommentNode;
  }
});

// node_modules/domelementtype/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/domelementtype/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Doctype = exports.CDATA = exports.Tag = exports.Style = exports.Script = exports.Comment = exports.Directive = exports.Text = exports.Root = exports.isTag = exports.ElementType = void 0;
    var ElementType2;
    (function(ElementType3) {
      ElementType3["Root"] = "root";
      ElementType3["Text"] = "text";
      ElementType3["Directive"] = "directive";
      ElementType3["Comment"] = "comment";
      ElementType3["Script"] = "script";
      ElementType3["Style"] = "style";
      ElementType3["Tag"] = "tag";
      ElementType3["CDATA"] = "cdata";
      ElementType3["Doctype"] = "doctype";
    })(ElementType2 = exports.ElementType || (exports.ElementType = {}));
    function isTag4(elem) {
      return elem.type === ElementType2.Tag || elem.type === ElementType2.Script || elem.type === ElementType2.Style;
    }
    exports.isTag = isTag4;
    exports.Root = ElementType2.Root;
    exports.Text = ElementType2.Text;
    exports.Directive = ElementType2.Directive;
    exports.Comment = ElementType2.Comment;
    exports.Script = ElementType2.Script;
    exports.Style = ElementType2.Style;
    exports.Tag = ElementType2.Tag;
    exports.CDATA = ElementType2.CDATA;
    exports.Doctype = ElementType2.Doctype;
  }
});

// node_modules/domhandler/lib/node.js
var require_node2 = __commonJS({
  "node_modules/domhandler/lib/node.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cloneNode = exports.hasChildren = exports.isDocument = exports.isDirective = exports.isComment = exports.isText = exports.isCDATA = exports.isTag = exports.Element = exports.Document = exports.CDATA = exports.NodeWithChildren = exports.ProcessingInstruction = exports.Comment = exports.Text = exports.DataNode = exports.Node = void 0;
    var domelementtype_1 = require_lib2();
    var Node4 = (
      /** @class */
      function() {
        function Node5() {
          this.parent = null;
          this.prev = null;
          this.next = null;
          this.startIndex = null;
          this.endIndex = null;
        }
        Object.defineProperty(Node5.prototype, "parentNode", {
          // Read-write aliases for properties
          /**
           * Same as {@link parent}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.parent;
          },
          set: function(parent) {
            this.parent = parent;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Node5.prototype, "previousSibling", {
          /**
           * Same as {@link prev}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.prev;
          },
          set: function(prev) {
            this.prev = prev;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Node5.prototype, "nextSibling", {
          /**
           * Same as {@link next}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.next;
          },
          set: function(next) {
            this.next = next;
          },
          enumerable: false,
          configurable: true
        });
        Node5.prototype.cloneNode = function(recursive) {
          if (recursive === void 0) {
            recursive = false;
          }
          return cloneNode2(this, recursive);
        };
        return Node5;
      }()
    );
    exports.Node = Node4;
    var DataNode2 = (
      /** @class */
      function(_super) {
        __extends(DataNode3, _super);
        function DataNode3(data) {
          var _this = _super.call(this) || this;
          _this.data = data;
          return _this;
        }
        Object.defineProperty(DataNode3.prototype, "nodeValue", {
          /**
           * Same as {@link data}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.data;
          },
          set: function(data) {
            this.data = data;
          },
          enumerable: false,
          configurable: true
        });
        return DataNode3;
      }(Node4)
    );
    exports.DataNode = DataNode2;
    var Text5 = (
      /** @class */
      function(_super) {
        __extends(Text6, _super);
        function Text6() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.type = domelementtype_1.ElementType.Text;
          return _this;
        }
        Object.defineProperty(Text6.prototype, "nodeType", {
          get: function() {
            return 3;
          },
          enumerable: false,
          configurable: true
        });
        return Text6;
      }(DataNode2)
    );
    exports.Text = Text5;
    var Comment5 = (
      /** @class */
      function(_super) {
        __extends(Comment6, _super);
        function Comment6() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.type = domelementtype_1.ElementType.Comment;
          return _this;
        }
        Object.defineProperty(Comment6.prototype, "nodeType", {
          get: function() {
            return 8;
          },
          enumerable: false,
          configurable: true
        });
        return Comment6;
      }(DataNode2)
    );
    exports.Comment = Comment5;
    var ProcessingInstruction2 = (
      /** @class */
      function(_super) {
        __extends(ProcessingInstruction3, _super);
        function ProcessingInstruction3(name, data) {
          var _this = _super.call(this, data) || this;
          _this.name = name;
          _this.type = domelementtype_1.ElementType.Directive;
          return _this;
        }
        Object.defineProperty(ProcessingInstruction3.prototype, "nodeType", {
          get: function() {
            return 1;
          },
          enumerable: false,
          configurable: true
        });
        return ProcessingInstruction3;
      }(DataNode2)
    );
    exports.ProcessingInstruction = ProcessingInstruction2;
    var NodeWithChildren2 = (
      /** @class */
      function(_super) {
        __extends(NodeWithChildren3, _super);
        function NodeWithChildren3(children) {
          var _this = _super.call(this) || this;
          _this.children = children;
          return _this;
        }
        Object.defineProperty(NodeWithChildren3.prototype, "firstChild", {
          // Aliases
          /** First child of the node. */
          get: function() {
            var _a2;
            return (_a2 = this.children[0]) !== null && _a2 !== void 0 ? _a2 : null;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(NodeWithChildren3.prototype, "lastChild", {
          /** Last child of the node. */
          get: function() {
            return this.children.length > 0 ? this.children[this.children.length - 1] : null;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(NodeWithChildren3.prototype, "childNodes", {
          /**
           * Same as {@link children}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.children;
          },
          set: function(children) {
            this.children = children;
          },
          enumerable: false,
          configurable: true
        });
        return NodeWithChildren3;
      }(Node4)
    );
    exports.NodeWithChildren = NodeWithChildren2;
    var CDATA3 = (
      /** @class */
      function(_super) {
        __extends(CDATA4, _super);
        function CDATA4() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.type = domelementtype_1.ElementType.CDATA;
          return _this;
        }
        Object.defineProperty(CDATA4.prototype, "nodeType", {
          get: function() {
            return 4;
          },
          enumerable: false,
          configurable: true
        });
        return CDATA4;
      }(NodeWithChildren2)
    );
    exports.CDATA = CDATA3;
    var Document5 = (
      /** @class */
      function(_super) {
        __extends(Document6, _super);
        function Document6() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this.type = domelementtype_1.ElementType.Root;
          return _this;
        }
        Object.defineProperty(Document6.prototype, "nodeType", {
          get: function() {
            return 9;
          },
          enumerable: false,
          configurable: true
        });
        return Document6;
      }(NodeWithChildren2)
    );
    exports.Document = Document5;
    var Element4 = (
      /** @class */
      function(_super) {
        __extends(Element5, _super);
        function Element5(name, attribs, children, type) {
          if (children === void 0) {
            children = [];
          }
          if (type === void 0) {
            type = name === "script" ? domelementtype_1.ElementType.Script : name === "style" ? domelementtype_1.ElementType.Style : domelementtype_1.ElementType.Tag;
          }
          var _this = _super.call(this, children) || this;
          _this.name = name;
          _this.attribs = attribs;
          _this.type = type;
          return _this;
        }
        Object.defineProperty(Element5.prototype, "nodeType", {
          get: function() {
            return 1;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Element5.prototype, "tagName", {
          // DOM Level 1 aliases
          /**
           * Same as {@link name}.
           * [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
           */
          get: function() {
            return this.name;
          },
          set: function(name) {
            this.name = name;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(Element5.prototype, "attributes", {
          get: function() {
            var _this = this;
            return Object.keys(this.attribs).map(function(name) {
              var _a2, _b;
              return {
                name,
                value: _this.attribs[name],
                namespace: (_a2 = _this["x-attribsNamespace"]) === null || _a2 === void 0 ? void 0 : _a2[name],
                prefix: (_b = _this["x-attribsPrefix"]) === null || _b === void 0 ? void 0 : _b[name]
              };
            });
          },
          enumerable: false,
          configurable: true
        });
        return Element5;
      }(NodeWithChildren2)
    );
    exports.Element = Element4;
    function isTag4(node) {
      return (0, domelementtype_1.isTag)(node);
    }
    exports.isTag = isTag4;
    function isCDATA2(node) {
      return node.type === domelementtype_1.ElementType.CDATA;
    }
    exports.isCDATA = isCDATA2;
    function isText2(node) {
      return node.type === domelementtype_1.ElementType.Text;
    }
    exports.isText = isText2;
    function isComment2(node) {
      return node.type === domelementtype_1.ElementType.Comment;
    }
    exports.isComment = isComment2;
    function isDirective2(node) {
      return node.type === domelementtype_1.ElementType.Directive;
    }
    exports.isDirective = isDirective2;
    function isDocument2(node) {
      return node.type === domelementtype_1.ElementType.Root;
    }
    exports.isDocument = isDocument2;
    function hasChildren2(node) {
      return Object.prototype.hasOwnProperty.call(node, "children");
    }
    exports.hasChildren = hasChildren2;
    function cloneNode2(node, recursive) {
      if (recursive === void 0) {
        recursive = false;
      }
      var result;
      if (isText2(node)) {
        result = new Text5(node.data);
      } else if (isComment2(node)) {
        result = new Comment5(node.data);
      } else if (isTag4(node)) {
        var children = recursive ? cloneChildren2(node.children) : [];
        var clone_1 = new Element4(node.name, __assign({}, node.attribs), children);
        children.forEach(function(child) {
          return child.parent = clone_1;
        });
        if (node.namespace != null) {
          clone_1.namespace = node.namespace;
        }
        if (node["x-attribsNamespace"]) {
          clone_1["x-attribsNamespace"] = __assign({}, node["x-attribsNamespace"]);
        }
        if (node["x-attribsPrefix"]) {
          clone_1["x-attribsPrefix"] = __assign({}, node["x-attribsPrefix"]);
        }
        result = clone_1;
      } else if (isCDATA2(node)) {
        var children = recursive ? cloneChildren2(node.children) : [];
        var clone_2 = new CDATA3(children);
        children.forEach(function(child) {
          return child.parent = clone_2;
        });
        result = clone_2;
      } else if (isDocument2(node)) {
        var children = recursive ? cloneChildren2(node.children) : [];
        var clone_3 = new Document5(children);
        children.forEach(function(child) {
          return child.parent = clone_3;
        });
        if (node["x-mode"]) {
          clone_3["x-mode"] = node["x-mode"];
        }
        result = clone_3;
      } else if (isDirective2(node)) {
        var instruction = new ProcessingInstruction2(node.name, node.data);
        if (node["x-name"] != null) {
          instruction["x-name"] = node["x-name"];
          instruction["x-publicId"] = node["x-publicId"];
          instruction["x-systemId"] = node["x-systemId"];
        }
        result = instruction;
      } else {
        throw new Error("Not implemented yet: ".concat(node.type));
      }
      result.startIndex = node.startIndex;
      result.endIndex = node.endIndex;
      if (node.sourceCodeLocation != null) {
        result.sourceCodeLocation = node.sourceCodeLocation;
      }
      return result;
    }
    exports.cloneNode = cloneNode2;
    function cloneChildren2(childs) {
      var children = childs.map(function(child) {
        return cloneNode2(child, true);
      });
      for (var i = 1; i < children.length; i++) {
        children[i].prev = children[i - 1];
        children[i - 1].next = children[i];
      }
      return children;
    }
  }
});

// node_modules/domhandler/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/domhandler/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DomHandler = void 0;
    var domelementtype_1 = require_lib2();
    var node_js_1 = require_node2();
    __exportStar(require_node2(), exports);
    var defaultOpts2 = {
      withStartIndices: false,
      withEndIndices: false,
      xmlMode: false
    };
    var DomHandler2 = (
      /** @class */
      function() {
        function DomHandler3(callback, options, elementCB) {
          this.dom = [];
          this.root = new node_js_1.Document(this.dom);
          this.done = false;
          this.tagStack = [this.root];
          this.lastNode = null;
          this.parser = null;
          if (typeof options === "function") {
            elementCB = options;
            options = defaultOpts2;
          }
          if (typeof callback === "object") {
            options = callback;
            callback = void 0;
          }
          this.callback = callback !== null && callback !== void 0 ? callback : null;
          this.options = options !== null && options !== void 0 ? options : defaultOpts2;
          this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
        }
        DomHandler3.prototype.onparserinit = function(parser) {
          this.parser = parser;
        };
        DomHandler3.prototype.onreset = function() {
          this.dom = [];
          this.root = new node_js_1.Document(this.dom);
          this.done = false;
          this.tagStack = [this.root];
          this.lastNode = null;
          this.parser = null;
        };
        DomHandler3.prototype.onend = function() {
          if (this.done)
            return;
          this.done = true;
          this.parser = null;
          this.handleCallback(null);
        };
        DomHandler3.prototype.onerror = function(error) {
          this.handleCallback(error);
        };
        DomHandler3.prototype.onclosetag = function() {
          this.lastNode = null;
          var elem = this.tagStack.pop();
          if (this.options.withEndIndices) {
            elem.endIndex = this.parser.endIndex;
          }
          if (this.elementCB)
            this.elementCB(elem);
        };
        DomHandler3.prototype.onopentag = function(name, attribs) {
          var type = this.options.xmlMode ? domelementtype_1.ElementType.Tag : void 0;
          var element = new node_js_1.Element(name, attribs, void 0, type);
          this.addNode(element);
          this.tagStack.push(element);
        };
        DomHandler3.prototype.ontext = function(data) {
          var lastNode = this.lastNode;
          if (lastNode && lastNode.type === domelementtype_1.ElementType.Text) {
            lastNode.data += data;
            if (this.options.withEndIndices) {
              lastNode.endIndex = this.parser.endIndex;
            }
          } else {
            var node = new node_js_1.Text(data);
            this.addNode(node);
            this.lastNode = node;
          }
        };
        DomHandler3.prototype.oncomment = function(data) {
          if (this.lastNode && this.lastNode.type === domelementtype_1.ElementType.Comment) {
            this.lastNode.data += data;
            return;
          }
          var node = new node_js_1.Comment(data);
          this.addNode(node);
          this.lastNode = node;
        };
        DomHandler3.prototype.oncommentend = function() {
          this.lastNode = null;
        };
        DomHandler3.prototype.oncdatastart = function() {
          var text = new node_js_1.Text("");
          var node = new node_js_1.CDATA([text]);
          this.addNode(node);
          text.parent = node;
          this.lastNode = text;
        };
        DomHandler3.prototype.oncdataend = function() {
          this.lastNode = null;
        };
        DomHandler3.prototype.onprocessinginstruction = function(name, data) {
          var node = new node_js_1.ProcessingInstruction(name, data);
          this.addNode(node);
        };
        DomHandler3.prototype.handleCallback = function(error) {
          if (typeof this.callback === "function") {
            this.callback(error, this.dom);
          } else if (error) {
            throw error;
          }
        };
        DomHandler3.prototype.addNode = function(node) {
          var parent = this.tagStack[this.tagStack.length - 1];
          var previousSibling2 = parent.children[parent.children.length - 1];
          if (this.options.withStartIndices) {
            node.startIndex = this.parser.startIndex;
          }
          if (this.options.withEndIndices) {
            node.endIndex = this.parser.endIndex;
          }
          parent.children.push(node);
          if (previousSibling2) {
            node.prev = previousSibling2;
            previousSibling2.next = node;
          }
          node.parent = parent;
          this.lastNode = null;
        };
        return DomHandler3;
      }()
    );
    exports.DomHandler = DomHandler2;
    exports.default = DomHandler2;
  }
});

// node_modules/entities/lib/generated/decode-data-html.js
var require_decode_data_html = __commonJS({
  "node_modules/entities/lib/generated/decode-data-html.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new Uint16Array(
      // prettier-ignore
      '\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map(function(c) {
        return c.charCodeAt(0);
      })
    );
  }
});

// node_modules/entities/lib/generated/decode-data-xml.js
var require_decode_data_xml = __commonJS({
  "node_modules/entities/lib/generated/decode-data-xml.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new Uint16Array(
      // prettier-ignore
      "\u0200aglq	\x1B\u026D\0\0p;\u4026os;\u4027t;\u403Et;\u403Cuot;\u4022".split("").map(function(c) {
        return c.charCodeAt(0);
      })
    );
  }
});

// node_modules/entities/lib/decode_codepoint.js
var require_decode_codepoint = __commonJS({
  "node_modules/entities/lib/decode_codepoint.js"(exports) {
    "use strict";
    var _a2;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.replaceCodePoint = exports.fromCodePoint = void 0;
    var decodeMap2 = /* @__PURE__ */ new Map([
      [0, 65533],
      // C1 Unicode control character reference replacements
      [128, 8364],
      [130, 8218],
      [131, 402],
      [132, 8222],
      [133, 8230],
      [134, 8224],
      [135, 8225],
      [136, 710],
      [137, 8240],
      [138, 352],
      [139, 8249],
      [140, 338],
      [142, 381],
      [145, 8216],
      [146, 8217],
      [147, 8220],
      [148, 8221],
      [149, 8226],
      [150, 8211],
      [151, 8212],
      [152, 732],
      [153, 8482],
      [154, 353],
      [155, 8250],
      [156, 339],
      [158, 382],
      [159, 376]
    ]);
    exports.fromCodePoint = // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
    (_a2 = String.fromCodePoint) !== null && _a2 !== void 0 ? _a2 : function(codePoint) {
      var output = "";
      if (codePoint > 65535) {
        codePoint -= 65536;
        output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      output += String.fromCharCode(codePoint);
      return output;
    };
    function replaceCodePoint2(codePoint) {
      var _a3;
      if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
        return 65533;
      }
      return (_a3 = decodeMap2.get(codePoint)) !== null && _a3 !== void 0 ? _a3 : codePoint;
    }
    exports.replaceCodePoint = replaceCodePoint2;
    function decodeCodePoint2(codePoint) {
      return (0, exports.fromCodePoint)(replaceCodePoint2(codePoint));
    }
    exports.default = decodeCodePoint2;
  }
});

// node_modules/entities/lib/decode.js
var require_decode = __commonJS({
  "node_modules/entities/lib/decode.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeXML = exports.decodeHTMLStrict = exports.decodeHTMLAttribute = exports.decodeHTML = exports.determineBranch = exports.EntityDecoder = exports.DecodingMode = exports.BinTrieFlags = exports.fromCodePoint = exports.replaceCodePoint = exports.decodeCodePoint = exports.xmlDecodeTree = exports.htmlDecodeTree = void 0;
    var decode_data_html_js_1 = __importDefault(require_decode_data_html());
    exports.htmlDecodeTree = decode_data_html_js_1.default;
    var decode_data_xml_js_1 = __importDefault(require_decode_data_xml());
    exports.xmlDecodeTree = decode_data_xml_js_1.default;
    var decode_codepoint_js_1 = __importStar(require_decode_codepoint());
    exports.decodeCodePoint = decode_codepoint_js_1.default;
    var decode_codepoint_js_2 = require_decode_codepoint();
    Object.defineProperty(exports, "replaceCodePoint", { enumerable: true, get: function() {
      return decode_codepoint_js_2.replaceCodePoint;
    } });
    Object.defineProperty(exports, "fromCodePoint", { enumerable: true, get: function() {
      return decode_codepoint_js_2.fromCodePoint;
    } });
    var CharCodes3;
    (function(CharCodes4) {
      CharCodes4[CharCodes4["NUM"] = 35] = "NUM";
      CharCodes4[CharCodes4["SEMI"] = 59] = "SEMI";
      CharCodes4[CharCodes4["EQUALS"] = 61] = "EQUALS";
      CharCodes4[CharCodes4["ZERO"] = 48] = "ZERO";
      CharCodes4[CharCodes4["NINE"] = 57] = "NINE";
      CharCodes4[CharCodes4["LOWER_A"] = 97] = "LOWER_A";
      CharCodes4[CharCodes4["LOWER_F"] = 102] = "LOWER_F";
      CharCodes4[CharCodes4["LOWER_X"] = 120] = "LOWER_X";
      CharCodes4[CharCodes4["LOWER_Z"] = 122] = "LOWER_Z";
      CharCodes4[CharCodes4["UPPER_A"] = 65] = "UPPER_A";
      CharCodes4[CharCodes4["UPPER_F"] = 70] = "UPPER_F";
      CharCodes4[CharCodes4["UPPER_Z"] = 90] = "UPPER_Z";
    })(CharCodes3 || (CharCodes3 = {}));
    var TO_LOWER_BIT2 = 32;
    var BinTrieFlags2;
    (function(BinTrieFlags3) {
      BinTrieFlags3[BinTrieFlags3["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
      BinTrieFlags3[BinTrieFlags3["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
      BinTrieFlags3[BinTrieFlags3["JUMP_TABLE"] = 127] = "JUMP_TABLE";
    })(BinTrieFlags2 = exports.BinTrieFlags || (exports.BinTrieFlags = {}));
    function isNumber3(code) {
      return code >= CharCodes3.ZERO && code <= CharCodes3.NINE;
    }
    function isHexadecimalCharacter2(code) {
      return code >= CharCodes3.UPPER_A && code <= CharCodes3.UPPER_F || code >= CharCodes3.LOWER_A && code <= CharCodes3.LOWER_F;
    }
    function isAsciiAlphaNumeric2(code) {
      return code >= CharCodes3.UPPER_A && code <= CharCodes3.UPPER_Z || code >= CharCodes3.LOWER_A && code <= CharCodes3.LOWER_Z || isNumber3(code);
    }
    function isEntityInAttributeInvalidEnd2(code) {
      return code === CharCodes3.EQUALS || isAsciiAlphaNumeric2(code);
    }
    var EntityDecoderState2;
    (function(EntityDecoderState3) {
      EntityDecoderState3[EntityDecoderState3["EntityStart"] = 0] = "EntityStart";
      EntityDecoderState3[EntityDecoderState3["NumericStart"] = 1] = "NumericStart";
      EntityDecoderState3[EntityDecoderState3["NumericDecimal"] = 2] = "NumericDecimal";
      EntityDecoderState3[EntityDecoderState3["NumericHex"] = 3] = "NumericHex";
      EntityDecoderState3[EntityDecoderState3["NamedEntity"] = 4] = "NamedEntity";
    })(EntityDecoderState2 || (EntityDecoderState2 = {}));
    var DecodingMode2;
    (function(DecodingMode3) {
      DecodingMode3[DecodingMode3["Legacy"] = 0] = "Legacy";
      DecodingMode3[DecodingMode3["Strict"] = 1] = "Strict";
      DecodingMode3[DecodingMode3["Attribute"] = 2] = "Attribute";
    })(DecodingMode2 = exports.DecodingMode || (exports.DecodingMode = {}));
    var EntityDecoder2 = (
      /** @class */
      function() {
        function EntityDecoder3(decodeTree, emitCodePoint, errors) {
          this.decodeTree = decodeTree;
          this.emitCodePoint = emitCodePoint;
          this.errors = errors;
          this.state = EntityDecoderState2.EntityStart;
          this.consumed = 1;
          this.result = 0;
          this.treeIndex = 0;
          this.excess = 1;
          this.decodeMode = DecodingMode2.Strict;
        }
        EntityDecoder3.prototype.startEntity = function(decodeMode) {
          this.decodeMode = decodeMode;
          this.state = EntityDecoderState2.EntityStart;
          this.result = 0;
          this.treeIndex = 0;
          this.excess = 1;
          this.consumed = 1;
        };
        EntityDecoder3.prototype.write = function(str, offset) {
          switch (this.state) {
            case EntityDecoderState2.EntityStart: {
              if (str.charCodeAt(offset) === CharCodes3.NUM) {
                this.state = EntityDecoderState2.NumericStart;
                this.consumed += 1;
                return this.stateNumericStart(str, offset + 1);
              }
              this.state = EntityDecoderState2.NamedEntity;
              return this.stateNamedEntity(str, offset);
            }
            case EntityDecoderState2.NumericStart: {
              return this.stateNumericStart(str, offset);
            }
            case EntityDecoderState2.NumericDecimal: {
              return this.stateNumericDecimal(str, offset);
            }
            case EntityDecoderState2.NumericHex: {
              return this.stateNumericHex(str, offset);
            }
            case EntityDecoderState2.NamedEntity: {
              return this.stateNamedEntity(str, offset);
            }
          }
        };
        EntityDecoder3.prototype.stateNumericStart = function(str, offset) {
          if (offset >= str.length) {
            return -1;
          }
          if ((str.charCodeAt(offset) | TO_LOWER_BIT2) === CharCodes3.LOWER_X) {
            this.state = EntityDecoderState2.NumericHex;
            this.consumed += 1;
            return this.stateNumericHex(str, offset + 1);
          }
          this.state = EntityDecoderState2.NumericDecimal;
          return this.stateNumericDecimal(str, offset);
        };
        EntityDecoder3.prototype.addToNumericResult = function(str, start, end, base) {
          if (start !== end) {
            var digitCount = end - start;
            this.result = this.result * Math.pow(base, digitCount) + parseInt(str.substr(start, digitCount), base);
            this.consumed += digitCount;
          }
        };
        EntityDecoder3.prototype.stateNumericHex = function(str, offset) {
          var startIdx = offset;
          while (offset < str.length) {
            var char = str.charCodeAt(offset);
            if (isNumber3(char) || isHexadecimalCharacter2(char)) {
              offset += 1;
            } else {
              this.addToNumericResult(str, startIdx, offset, 16);
              return this.emitNumericEntity(char, 3);
            }
          }
          this.addToNumericResult(str, startIdx, offset, 16);
          return -1;
        };
        EntityDecoder3.prototype.stateNumericDecimal = function(str, offset) {
          var startIdx = offset;
          while (offset < str.length) {
            var char = str.charCodeAt(offset);
            if (isNumber3(char)) {
              offset += 1;
            } else {
              this.addToNumericResult(str, startIdx, offset, 10);
              return this.emitNumericEntity(char, 2);
            }
          }
          this.addToNumericResult(str, startIdx, offset, 10);
          return -1;
        };
        EntityDecoder3.prototype.emitNumericEntity = function(lastCp, expectedLength) {
          var _a2;
          if (this.consumed <= expectedLength) {
            (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
            return 0;
          }
          if (lastCp === CharCodes3.SEMI) {
            this.consumed += 1;
          } else if (this.decodeMode === DecodingMode2.Strict) {
            return 0;
          }
          this.emitCodePoint((0, decode_codepoint_js_1.replaceCodePoint)(this.result), this.consumed);
          if (this.errors) {
            if (lastCp !== CharCodes3.SEMI) {
              this.errors.missingSemicolonAfterCharacterReference();
            }
            this.errors.validateNumericCharacterReference(this.result);
          }
          return this.consumed;
        };
        EntityDecoder3.prototype.stateNamedEntity = function(str, offset) {
          var decodeTree = this.decodeTree;
          var current = decodeTree[this.treeIndex];
          var valueLength = (current & BinTrieFlags2.VALUE_LENGTH) >> 14;
          for (; offset < str.length; offset++, this.excess++) {
            var char = str.charCodeAt(offset);
            this.treeIndex = determineBranch2(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
            if (this.treeIndex < 0) {
              return this.result === 0 || // If we are parsing an attribute
              this.decodeMode === DecodingMode2.Attribute && // We shouldn't have consumed any characters after the entity,
              (valueLength === 0 || // And there should be no invalid characters.
              isEntityInAttributeInvalidEnd2(char)) ? 0 : this.emitNotTerminatedNamedEntity();
            }
            current = decodeTree[this.treeIndex];
            valueLength = (current & BinTrieFlags2.VALUE_LENGTH) >> 14;
            if (valueLength !== 0) {
              if (char === CharCodes3.SEMI) {
                return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
              }
              if (this.decodeMode !== DecodingMode2.Strict) {
                this.result = this.treeIndex;
                this.consumed += this.excess;
                this.excess = 0;
              }
            }
          }
          return -1;
        };
        EntityDecoder3.prototype.emitNotTerminatedNamedEntity = function() {
          var _a2;
          var _b = this, result = _b.result, decodeTree = _b.decodeTree;
          var valueLength = (decodeTree[result] & BinTrieFlags2.VALUE_LENGTH) >> 14;
          this.emitNamedEntityData(result, valueLength, this.consumed);
          (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.missingSemicolonAfterCharacterReference();
          return this.consumed;
        };
        EntityDecoder3.prototype.emitNamedEntityData = function(result, valueLength, consumed) {
          var decodeTree = this.decodeTree;
          this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags2.VALUE_LENGTH : decodeTree[result + 1], consumed);
          if (valueLength === 3) {
            this.emitCodePoint(decodeTree[result + 2], consumed);
          }
          return consumed;
        };
        EntityDecoder3.prototype.end = function() {
          var _a2;
          switch (this.state) {
            case EntityDecoderState2.NamedEntity: {
              return this.result !== 0 && (this.decodeMode !== DecodingMode2.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
            }
            case EntityDecoderState2.NumericDecimal: {
              return this.emitNumericEntity(0, 2);
            }
            case EntityDecoderState2.NumericHex: {
              return this.emitNumericEntity(0, 3);
            }
            case EntityDecoderState2.NumericStart: {
              (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
              return 0;
            }
            case EntityDecoderState2.EntityStart: {
              return 0;
            }
          }
        };
        return EntityDecoder3;
      }()
    );
    exports.EntityDecoder = EntityDecoder2;
    function getDecoder2(decodeTree) {
      var ret = "";
      var decoder = new EntityDecoder2(decodeTree, function(str) {
        return ret += (0, decode_codepoint_js_1.fromCodePoint)(str);
      });
      return function decodeWithTrie(str, decodeMode) {
        var lastIndex = 0;
        var offset = 0;
        while ((offset = str.indexOf("&", offset)) >= 0) {
          ret += str.slice(lastIndex, offset);
          decoder.startEntity(decodeMode);
          var len = decoder.write(
            str,
            // Skip the "&"
            offset + 1
          );
          if (len < 0) {
            lastIndex = offset + decoder.end();
            break;
          }
          lastIndex = offset + len;
          offset = len === 0 ? lastIndex + 1 : lastIndex;
        }
        var result = ret + str.slice(lastIndex);
        ret = "";
        return result;
      };
    }
    function determineBranch2(decodeTree, current, nodeIdx, char) {
      var branchCount = (current & BinTrieFlags2.BRANCH_LENGTH) >> 7;
      var jumpOffset = current & BinTrieFlags2.JUMP_TABLE;
      if (branchCount === 0) {
        return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
      }
      if (jumpOffset) {
        var value = char - jumpOffset;
        return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIdx + value] - 1;
      }
      var lo = nodeIdx;
      var hi = lo + branchCount - 1;
      while (lo <= hi) {
        var mid = lo + hi >>> 1;
        var midVal = decodeTree[mid];
        if (midVal < char) {
          lo = mid + 1;
        } else if (midVal > char) {
          hi = mid - 1;
        } else {
          return decodeTree[mid + branchCount];
        }
      }
      return -1;
    }
    exports.determineBranch = determineBranch2;
    var htmlDecoder2 = getDecoder2(decode_data_html_js_1.default);
    var xmlDecoder2 = getDecoder2(decode_data_xml_js_1.default);
    function decodeHTML2(str, mode) {
      if (mode === void 0) {
        mode = DecodingMode2.Legacy;
      }
      return htmlDecoder2(str, mode);
    }
    exports.decodeHTML = decodeHTML2;
    function decodeHTMLAttribute2(str) {
      return htmlDecoder2(str, DecodingMode2.Attribute);
    }
    exports.decodeHTMLAttribute = decodeHTMLAttribute2;
    function decodeHTMLStrict2(str) {
      return htmlDecoder2(str, DecodingMode2.Strict);
    }
    exports.decodeHTMLStrict = decodeHTMLStrict2;
    function decodeXML2(str) {
      return xmlDecoder2(str, DecodingMode2.Strict);
    }
    exports.decodeXML = decodeXML2;
  }
});

// node_modules/entities/lib/generated/encode-html.js
var require_encode_html = __commonJS({
  "node_modules/entities/lib/generated/encode-html.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function restoreDiff2(arr) {
      for (var i = 1; i < arr.length; i++) {
        arr[i][0] += arr[i - 1][0] + 1;
      }
      return arr;
    }
    exports.default = new Map(/* @__PURE__ */ restoreDiff2([[9, "&Tab;"], [0, "&NewLine;"], [22, "&excl;"], [0, "&quot;"], [0, "&num;"], [0, "&dollar;"], [0, "&percnt;"], [0, "&amp;"], [0, "&apos;"], [0, "&lpar;"], [0, "&rpar;"], [0, "&ast;"], [0, "&plus;"], [0, "&comma;"], [1, "&period;"], [0, "&sol;"], [10, "&colon;"], [0, "&semi;"], [0, { v: "&lt;", n: 8402, o: "&nvlt;" }], [0, { v: "&equals;", n: 8421, o: "&bne;" }], [0, { v: "&gt;", n: 8402, o: "&nvgt;" }], [0, "&quest;"], [0, "&commat;"], [26, "&lbrack;"], [0, "&bsol;"], [0, "&rbrack;"], [0, "&Hat;"], [0, "&lowbar;"], [0, "&DiacriticalGrave;"], [5, { n: 106, o: "&fjlig;" }], [20, "&lbrace;"], [0, "&verbar;"], [0, "&rbrace;"], [34, "&nbsp;"], [0, "&iexcl;"], [0, "&cent;"], [0, "&pound;"], [0, "&curren;"], [0, "&yen;"], [0, "&brvbar;"], [0, "&sect;"], [0, "&die;"], [0, "&copy;"], [0, "&ordf;"], [0, "&laquo;"], [0, "&not;"], [0, "&shy;"], [0, "&circledR;"], [0, "&macr;"], [0, "&deg;"], [0, "&PlusMinus;"], [0, "&sup2;"], [0, "&sup3;"], [0, "&acute;"], [0, "&micro;"], [0, "&para;"], [0, "&centerdot;"], [0, "&cedil;"], [0, "&sup1;"], [0, "&ordm;"], [0, "&raquo;"], [0, "&frac14;"], [0, "&frac12;"], [0, "&frac34;"], [0, "&iquest;"], [0, "&Agrave;"], [0, "&Aacute;"], [0, "&Acirc;"], [0, "&Atilde;"], [0, "&Auml;"], [0, "&angst;"], [0, "&AElig;"], [0, "&Ccedil;"], [0, "&Egrave;"], [0, "&Eacute;"], [0, "&Ecirc;"], [0, "&Euml;"], [0, "&Igrave;"], [0, "&Iacute;"], [0, "&Icirc;"], [0, "&Iuml;"], [0, "&ETH;"], [0, "&Ntilde;"], [0, "&Ograve;"], [0, "&Oacute;"], [0, "&Ocirc;"], [0, "&Otilde;"], [0, "&Ouml;"], [0, "&times;"], [0, "&Oslash;"], [0, "&Ugrave;"], [0, "&Uacute;"], [0, "&Ucirc;"], [0, "&Uuml;"], [0, "&Yacute;"], [0, "&THORN;"], [0, "&szlig;"], [0, "&agrave;"], [0, "&aacute;"], [0, "&acirc;"], [0, "&atilde;"], [0, "&auml;"], [0, "&aring;"], [0, "&aelig;"], [0, "&ccedil;"], [0, "&egrave;"], [0, "&eacute;"], [0, "&ecirc;"], [0, "&euml;"], [0, "&igrave;"], [0, "&iacute;"], [0, "&icirc;"], [0, "&iuml;"], [0, "&eth;"], [0, "&ntilde;"], [0, "&ograve;"], [0, "&oacute;"], [0, "&ocirc;"], [0, "&otilde;"], [0, "&ouml;"], [0, "&div;"], [0, "&oslash;"], [0, "&ugrave;"], [0, "&uacute;"], [0, "&ucirc;"], [0, "&uuml;"], [0, "&yacute;"], [0, "&thorn;"], [0, "&yuml;"], [0, "&Amacr;"], [0, "&amacr;"], [0, "&Abreve;"], [0, "&abreve;"], [0, "&Aogon;"], [0, "&aogon;"], [0, "&Cacute;"], [0, "&cacute;"], [0, "&Ccirc;"], [0, "&ccirc;"], [0, "&Cdot;"], [0, "&cdot;"], [0, "&Ccaron;"], [0, "&ccaron;"], [0, "&Dcaron;"], [0, "&dcaron;"], [0, "&Dstrok;"], [0, "&dstrok;"], [0, "&Emacr;"], [0, "&emacr;"], [2, "&Edot;"], [0, "&edot;"], [0, "&Eogon;"], [0, "&eogon;"], [0, "&Ecaron;"], [0, "&ecaron;"], [0, "&Gcirc;"], [0, "&gcirc;"], [0, "&Gbreve;"], [0, "&gbreve;"], [0, "&Gdot;"], [0, "&gdot;"], [0, "&Gcedil;"], [1, "&Hcirc;"], [0, "&hcirc;"], [0, "&Hstrok;"], [0, "&hstrok;"], [0, "&Itilde;"], [0, "&itilde;"], [0, "&Imacr;"], [0, "&imacr;"], [2, "&Iogon;"], [0, "&iogon;"], [0, "&Idot;"], [0, "&imath;"], [0, "&IJlig;"], [0, "&ijlig;"], [0, "&Jcirc;"], [0, "&jcirc;"], [0, "&Kcedil;"], [0, "&kcedil;"], [0, "&kgreen;"], [0, "&Lacute;"], [0, "&lacute;"], [0, "&Lcedil;"], [0, "&lcedil;"], [0, "&Lcaron;"], [0, "&lcaron;"], [0, "&Lmidot;"], [0, "&lmidot;"], [0, "&Lstrok;"], [0, "&lstrok;"], [0, "&Nacute;"], [0, "&nacute;"], [0, "&Ncedil;"], [0, "&ncedil;"], [0, "&Ncaron;"], [0, "&ncaron;"], [0, "&napos;"], [0, "&ENG;"], [0, "&eng;"], [0, "&Omacr;"], [0, "&omacr;"], [2, "&Odblac;"], [0, "&odblac;"], [0, "&OElig;"], [0, "&oelig;"], [0, "&Racute;"], [0, "&racute;"], [0, "&Rcedil;"], [0, "&rcedil;"], [0, "&Rcaron;"], [0, "&rcaron;"], [0, "&Sacute;"], [0, "&sacute;"], [0, "&Scirc;"], [0, "&scirc;"], [0, "&Scedil;"], [0, "&scedil;"], [0, "&Scaron;"], [0, "&scaron;"], [0, "&Tcedil;"], [0, "&tcedil;"], [0, "&Tcaron;"], [0, "&tcaron;"], [0, "&Tstrok;"], [0, "&tstrok;"], [0, "&Utilde;"], [0, "&utilde;"], [0, "&Umacr;"], [0, "&umacr;"], [0, "&Ubreve;"], [0, "&ubreve;"], [0, "&Uring;"], [0, "&uring;"], [0, "&Udblac;"], [0, "&udblac;"], [0, "&Uogon;"], [0, "&uogon;"], [0, "&Wcirc;"], [0, "&wcirc;"], [0, "&Ycirc;"], [0, "&ycirc;"], [0, "&Yuml;"], [0, "&Zacute;"], [0, "&zacute;"], [0, "&Zdot;"], [0, "&zdot;"], [0, "&Zcaron;"], [0, "&zcaron;"], [19, "&fnof;"], [34, "&imped;"], [63, "&gacute;"], [65, "&jmath;"], [142, "&circ;"], [0, "&caron;"], [16, "&breve;"], [0, "&DiacriticalDot;"], [0, "&ring;"], [0, "&ogon;"], [0, "&DiacriticalTilde;"], [0, "&dblac;"], [51, "&DownBreve;"], [127, "&Alpha;"], [0, "&Beta;"], [0, "&Gamma;"], [0, "&Delta;"], [0, "&Epsilon;"], [0, "&Zeta;"], [0, "&Eta;"], [0, "&Theta;"], [0, "&Iota;"], [0, "&Kappa;"], [0, "&Lambda;"], [0, "&Mu;"], [0, "&Nu;"], [0, "&Xi;"], [0, "&Omicron;"], [0, "&Pi;"], [0, "&Rho;"], [1, "&Sigma;"], [0, "&Tau;"], [0, "&Upsilon;"], [0, "&Phi;"], [0, "&Chi;"], [0, "&Psi;"], [0, "&ohm;"], [7, "&alpha;"], [0, "&beta;"], [0, "&gamma;"], [0, "&delta;"], [0, "&epsi;"], [0, "&zeta;"], [0, "&eta;"], [0, "&theta;"], [0, "&iota;"], [0, "&kappa;"], [0, "&lambda;"], [0, "&mu;"], [0, "&nu;"], [0, "&xi;"], [0, "&omicron;"], [0, "&pi;"], [0, "&rho;"], [0, "&sigmaf;"], [0, "&sigma;"], [0, "&tau;"], [0, "&upsi;"], [0, "&phi;"], [0, "&chi;"], [0, "&psi;"], [0, "&omega;"], [7, "&thetasym;"], [0, "&Upsi;"], [2, "&phiv;"], [0, "&piv;"], [5, "&Gammad;"], [0, "&digamma;"], [18, "&kappav;"], [0, "&rhov;"], [3, "&epsiv;"], [0, "&backepsilon;"], [10, "&IOcy;"], [0, "&DJcy;"], [0, "&GJcy;"], [0, "&Jukcy;"], [0, "&DScy;"], [0, "&Iukcy;"], [0, "&YIcy;"], [0, "&Jsercy;"], [0, "&LJcy;"], [0, "&NJcy;"], [0, "&TSHcy;"], [0, "&KJcy;"], [1, "&Ubrcy;"], [0, "&DZcy;"], [0, "&Acy;"], [0, "&Bcy;"], [0, "&Vcy;"], [0, "&Gcy;"], [0, "&Dcy;"], [0, "&IEcy;"], [0, "&ZHcy;"], [0, "&Zcy;"], [0, "&Icy;"], [0, "&Jcy;"], [0, "&Kcy;"], [0, "&Lcy;"], [0, "&Mcy;"], [0, "&Ncy;"], [0, "&Ocy;"], [0, "&Pcy;"], [0, "&Rcy;"], [0, "&Scy;"], [0, "&Tcy;"], [0, "&Ucy;"], [0, "&Fcy;"], [0, "&KHcy;"], [0, "&TScy;"], [0, "&CHcy;"], [0, "&SHcy;"], [0, "&SHCHcy;"], [0, "&HARDcy;"], [0, "&Ycy;"], [0, "&SOFTcy;"], [0, "&Ecy;"], [0, "&YUcy;"], [0, "&YAcy;"], [0, "&acy;"], [0, "&bcy;"], [0, "&vcy;"], [0, "&gcy;"], [0, "&dcy;"], [0, "&iecy;"], [0, "&zhcy;"], [0, "&zcy;"], [0, "&icy;"], [0, "&jcy;"], [0, "&kcy;"], [0, "&lcy;"], [0, "&mcy;"], [0, "&ncy;"], [0, "&ocy;"], [0, "&pcy;"], [0, "&rcy;"], [0, "&scy;"], [0, "&tcy;"], [0, "&ucy;"], [0, "&fcy;"], [0, "&khcy;"], [0, "&tscy;"], [0, "&chcy;"], [0, "&shcy;"], [0, "&shchcy;"], [0, "&hardcy;"], [0, "&ycy;"], [0, "&softcy;"], [0, "&ecy;"], [0, "&yucy;"], [0, "&yacy;"], [1, "&iocy;"], [0, "&djcy;"], [0, "&gjcy;"], [0, "&jukcy;"], [0, "&dscy;"], [0, "&iukcy;"], [0, "&yicy;"], [0, "&jsercy;"], [0, "&ljcy;"], [0, "&njcy;"], [0, "&tshcy;"], [0, "&kjcy;"], [1, "&ubrcy;"], [0, "&dzcy;"], [7074, "&ensp;"], [0, "&emsp;"], [0, "&emsp13;"], [0, "&emsp14;"], [1, "&numsp;"], [0, "&puncsp;"], [0, "&ThinSpace;"], [0, "&hairsp;"], [0, "&NegativeMediumSpace;"], [0, "&zwnj;"], [0, "&zwj;"], [0, "&lrm;"], [0, "&rlm;"], [0, "&dash;"], [2, "&ndash;"], [0, "&mdash;"], [0, "&horbar;"], [0, "&Verbar;"], [1, "&lsquo;"], [0, "&CloseCurlyQuote;"], [0, "&lsquor;"], [1, "&ldquo;"], [0, "&CloseCurlyDoubleQuote;"], [0, "&bdquo;"], [1, "&dagger;"], [0, "&Dagger;"], [0, "&bull;"], [2, "&nldr;"], [0, "&hellip;"], [9, "&permil;"], [0, "&pertenk;"], [0, "&prime;"], [0, "&Prime;"], [0, "&tprime;"], [0, "&backprime;"], [3, "&lsaquo;"], [0, "&rsaquo;"], [3, "&oline;"], [2, "&caret;"], [1, "&hybull;"], [0, "&frasl;"], [10, "&bsemi;"], [7, "&qprime;"], [7, { v: "&MediumSpace;", n: 8202, o: "&ThickSpace;" }], [0, "&NoBreak;"], [0, "&af;"], [0, "&InvisibleTimes;"], [0, "&ic;"], [72, "&euro;"], [46, "&tdot;"], [0, "&DotDot;"], [37, "&complexes;"], [2, "&incare;"], [4, "&gscr;"], [0, "&hamilt;"], [0, "&Hfr;"], [0, "&Hopf;"], [0, "&planckh;"], [0, "&hbar;"], [0, "&imagline;"], [0, "&Ifr;"], [0, "&lagran;"], [0, "&ell;"], [1, "&naturals;"], [0, "&numero;"], [0, "&copysr;"], [0, "&weierp;"], [0, "&Popf;"], [0, "&Qopf;"], [0, "&realine;"], [0, "&real;"], [0, "&reals;"], [0, "&rx;"], [3, "&trade;"], [1, "&integers;"], [2, "&mho;"], [0, "&zeetrf;"], [0, "&iiota;"], [2, "&bernou;"], [0, "&Cayleys;"], [1, "&escr;"], [0, "&Escr;"], [0, "&Fouriertrf;"], [1, "&Mellintrf;"], [0, "&order;"], [0, "&alefsym;"], [0, "&beth;"], [0, "&gimel;"], [0, "&daleth;"], [12, "&CapitalDifferentialD;"], [0, "&dd;"], [0, "&ee;"], [0, "&ii;"], [10, "&frac13;"], [0, "&frac23;"], [0, "&frac15;"], [0, "&frac25;"], [0, "&frac35;"], [0, "&frac45;"], [0, "&frac16;"], [0, "&frac56;"], [0, "&frac18;"], [0, "&frac38;"], [0, "&frac58;"], [0, "&frac78;"], [49, "&larr;"], [0, "&ShortUpArrow;"], [0, "&rarr;"], [0, "&darr;"], [0, "&harr;"], [0, "&updownarrow;"], [0, "&nwarr;"], [0, "&nearr;"], [0, "&LowerRightArrow;"], [0, "&LowerLeftArrow;"], [0, "&nlarr;"], [0, "&nrarr;"], [1, { v: "&rarrw;", n: 824, o: "&nrarrw;" }], [0, "&Larr;"], [0, "&Uarr;"], [0, "&Rarr;"], [0, "&Darr;"], [0, "&larrtl;"], [0, "&rarrtl;"], [0, "&LeftTeeArrow;"], [0, "&mapstoup;"], [0, "&map;"], [0, "&DownTeeArrow;"], [1, "&hookleftarrow;"], [0, "&hookrightarrow;"], [0, "&larrlp;"], [0, "&looparrowright;"], [0, "&harrw;"], [0, "&nharr;"], [1, "&lsh;"], [0, "&rsh;"], [0, "&ldsh;"], [0, "&rdsh;"], [1, "&crarr;"], [0, "&cularr;"], [0, "&curarr;"], [2, "&circlearrowleft;"], [0, "&circlearrowright;"], [0, "&leftharpoonup;"], [0, "&DownLeftVector;"], [0, "&RightUpVector;"], [0, "&LeftUpVector;"], [0, "&rharu;"], [0, "&DownRightVector;"], [0, "&dharr;"], [0, "&dharl;"], [0, "&RightArrowLeftArrow;"], [0, "&udarr;"], [0, "&LeftArrowRightArrow;"], [0, "&leftleftarrows;"], [0, "&upuparrows;"], [0, "&rightrightarrows;"], [0, "&ddarr;"], [0, "&leftrightharpoons;"], [0, "&Equilibrium;"], [0, "&nlArr;"], [0, "&nhArr;"], [0, "&nrArr;"], [0, "&DoubleLeftArrow;"], [0, "&DoubleUpArrow;"], [0, "&DoubleRightArrow;"], [0, "&dArr;"], [0, "&DoubleLeftRightArrow;"], [0, "&DoubleUpDownArrow;"], [0, "&nwArr;"], [0, "&neArr;"], [0, "&seArr;"], [0, "&swArr;"], [0, "&lAarr;"], [0, "&rAarr;"], [1, "&zigrarr;"], [6, "&larrb;"], [0, "&rarrb;"], [15, "&DownArrowUpArrow;"], [7, "&loarr;"], [0, "&roarr;"], [0, "&hoarr;"], [0, "&forall;"], [0, "&comp;"], [0, { v: "&part;", n: 824, o: "&npart;" }], [0, "&exist;"], [0, "&nexist;"], [0, "&empty;"], [1, "&Del;"], [0, "&Element;"], [0, "&NotElement;"], [1, "&ni;"], [0, "&notni;"], [2, "&prod;"], [0, "&coprod;"], [0, "&sum;"], [0, "&minus;"], [0, "&MinusPlus;"], [0, "&dotplus;"], [1, "&Backslash;"], [0, "&lowast;"], [0, "&compfn;"], [1, "&radic;"], [2, "&prop;"], [0, "&infin;"], [0, "&angrt;"], [0, { v: "&ang;", n: 8402, o: "&nang;" }], [0, "&angmsd;"], [0, "&angsph;"], [0, "&mid;"], [0, "&nmid;"], [0, "&DoubleVerticalBar;"], [0, "&NotDoubleVerticalBar;"], [0, "&and;"], [0, "&or;"], [0, { v: "&cap;", n: 65024, o: "&caps;" }], [0, { v: "&cup;", n: 65024, o: "&cups;" }], [0, "&int;"], [0, "&Int;"], [0, "&iiint;"], [0, "&conint;"], [0, "&Conint;"], [0, "&Cconint;"], [0, "&cwint;"], [0, "&ClockwiseContourIntegral;"], [0, "&awconint;"], [0, "&there4;"], [0, "&becaus;"], [0, "&ratio;"], [0, "&Colon;"], [0, "&dotminus;"], [1, "&mDDot;"], [0, "&homtht;"], [0, { v: "&sim;", n: 8402, o: "&nvsim;" }], [0, { v: "&backsim;", n: 817, o: "&race;" }], [0, { v: "&ac;", n: 819, o: "&acE;" }], [0, "&acd;"], [0, "&VerticalTilde;"], [0, "&NotTilde;"], [0, { v: "&eqsim;", n: 824, o: "&nesim;" }], [0, "&sime;"], [0, "&NotTildeEqual;"], [0, "&cong;"], [0, "&simne;"], [0, "&ncong;"], [0, "&ap;"], [0, "&nap;"], [0, "&ape;"], [0, { v: "&apid;", n: 824, o: "&napid;" }], [0, "&backcong;"], [0, { v: "&asympeq;", n: 8402, o: "&nvap;" }], [0, { v: "&bump;", n: 824, o: "&nbump;" }], [0, { v: "&bumpe;", n: 824, o: "&nbumpe;" }], [0, { v: "&doteq;", n: 824, o: "&nedot;" }], [0, "&doteqdot;"], [0, "&efDot;"], [0, "&erDot;"], [0, "&Assign;"], [0, "&ecolon;"], [0, "&ecir;"], [0, "&circeq;"], [1, "&wedgeq;"], [0, "&veeeq;"], [1, "&triangleq;"], [2, "&equest;"], [0, "&ne;"], [0, { v: "&Congruent;", n: 8421, o: "&bnequiv;" }], [0, "&nequiv;"], [1, { v: "&le;", n: 8402, o: "&nvle;" }], [0, { v: "&ge;", n: 8402, o: "&nvge;" }], [0, { v: "&lE;", n: 824, o: "&nlE;" }], [0, { v: "&gE;", n: 824, o: "&ngE;" }], [0, { v: "&lnE;", n: 65024, o: "&lvertneqq;" }], [0, { v: "&gnE;", n: 65024, o: "&gvertneqq;" }], [0, { v: "&ll;", n: new Map(/* @__PURE__ */ restoreDiff2([[824, "&nLtv;"], [7577, "&nLt;"]])) }], [0, { v: "&gg;", n: new Map(/* @__PURE__ */ restoreDiff2([[824, "&nGtv;"], [7577, "&nGt;"]])) }], [0, "&between;"], [0, "&NotCupCap;"], [0, "&nless;"], [0, "&ngt;"], [0, "&nle;"], [0, "&nge;"], [0, "&lesssim;"], [0, "&GreaterTilde;"], [0, "&nlsim;"], [0, "&ngsim;"], [0, "&LessGreater;"], [0, "&gl;"], [0, "&NotLessGreater;"], [0, "&NotGreaterLess;"], [0, "&pr;"], [0, "&sc;"], [0, "&prcue;"], [0, "&sccue;"], [0, "&PrecedesTilde;"], [0, { v: "&scsim;", n: 824, o: "&NotSucceedsTilde;" }], [0, "&NotPrecedes;"], [0, "&NotSucceeds;"], [0, { v: "&sub;", n: 8402, o: "&NotSubset;" }], [0, { v: "&sup;", n: 8402, o: "&NotSuperset;" }], [0, "&nsub;"], [0, "&nsup;"], [0, "&sube;"], [0, "&supe;"], [0, "&NotSubsetEqual;"], [0, "&NotSupersetEqual;"], [0, { v: "&subne;", n: 65024, o: "&varsubsetneq;" }], [0, { v: "&supne;", n: 65024, o: "&varsupsetneq;" }], [1, "&cupdot;"], [0, "&UnionPlus;"], [0, { v: "&sqsub;", n: 824, o: "&NotSquareSubset;" }], [0, { v: "&sqsup;", n: 824, o: "&NotSquareSuperset;" }], [0, "&sqsube;"], [0, "&sqsupe;"], [0, { v: "&sqcap;", n: 65024, o: "&sqcaps;" }], [0, { v: "&sqcup;", n: 65024, o: "&sqcups;" }], [0, "&CirclePlus;"], [0, "&CircleMinus;"], [0, "&CircleTimes;"], [0, "&osol;"], [0, "&CircleDot;"], [0, "&circledcirc;"], [0, "&circledast;"], [1, "&circleddash;"], [0, "&boxplus;"], [0, "&boxminus;"], [0, "&boxtimes;"], [0, "&dotsquare;"], [0, "&RightTee;"], [0, "&dashv;"], [0, "&DownTee;"], [0, "&bot;"], [1, "&models;"], [0, "&DoubleRightTee;"], [0, "&Vdash;"], [0, "&Vvdash;"], [0, "&VDash;"], [0, "&nvdash;"], [0, "&nvDash;"], [0, "&nVdash;"], [0, "&nVDash;"], [0, "&prurel;"], [1, "&LeftTriangle;"], [0, "&RightTriangle;"], [0, { v: "&LeftTriangleEqual;", n: 8402, o: "&nvltrie;" }], [0, { v: "&RightTriangleEqual;", n: 8402, o: "&nvrtrie;" }], [0, "&origof;"], [0, "&imof;"], [0, "&multimap;"], [0, "&hercon;"], [0, "&intcal;"], [0, "&veebar;"], [1, "&barvee;"], [0, "&angrtvb;"], [0, "&lrtri;"], [0, "&bigwedge;"], [0, "&bigvee;"], [0, "&bigcap;"], [0, "&bigcup;"], [0, "&diam;"], [0, "&sdot;"], [0, "&sstarf;"], [0, "&divideontimes;"], [0, "&bowtie;"], [0, "&ltimes;"], [0, "&rtimes;"], [0, "&leftthreetimes;"], [0, "&rightthreetimes;"], [0, "&backsimeq;"], [0, "&curlyvee;"], [0, "&curlywedge;"], [0, "&Sub;"], [0, "&Sup;"], [0, "&Cap;"], [0, "&Cup;"], [0, "&fork;"], [0, "&epar;"], [0, "&lessdot;"], [0, "&gtdot;"], [0, { v: "&Ll;", n: 824, o: "&nLl;" }], [0, { v: "&Gg;", n: 824, o: "&nGg;" }], [0, { v: "&leg;", n: 65024, o: "&lesg;" }], [0, { v: "&gel;", n: 65024, o: "&gesl;" }], [2, "&cuepr;"], [0, "&cuesc;"], [0, "&NotPrecedesSlantEqual;"], [0, "&NotSucceedsSlantEqual;"], [0, "&NotSquareSubsetEqual;"], [0, "&NotSquareSupersetEqual;"], [2, "&lnsim;"], [0, "&gnsim;"], [0, "&precnsim;"], [0, "&scnsim;"], [0, "&nltri;"], [0, "&NotRightTriangle;"], [0, "&nltrie;"], [0, "&NotRightTriangleEqual;"], [0, "&vellip;"], [0, "&ctdot;"], [0, "&utdot;"], [0, "&dtdot;"], [0, "&disin;"], [0, "&isinsv;"], [0, "&isins;"], [0, { v: "&isindot;", n: 824, o: "&notindot;" }], [0, "&notinvc;"], [0, "&notinvb;"], [1, { v: "&isinE;", n: 824, o: "&notinE;" }], [0, "&nisd;"], [0, "&xnis;"], [0, "&nis;"], [0, "&notnivc;"], [0, "&notnivb;"], [6, "&barwed;"], [0, "&Barwed;"], [1, "&lceil;"], [0, "&rceil;"], [0, "&LeftFloor;"], [0, "&rfloor;"], [0, "&drcrop;"], [0, "&dlcrop;"], [0, "&urcrop;"], [0, "&ulcrop;"], [0, "&bnot;"], [1, "&profline;"], [0, "&profsurf;"], [1, "&telrec;"], [0, "&target;"], [5, "&ulcorn;"], [0, "&urcorn;"], [0, "&dlcorn;"], [0, "&drcorn;"], [2, "&frown;"], [0, "&smile;"], [9, "&cylcty;"], [0, "&profalar;"], [7, "&topbot;"], [6, "&ovbar;"], [1, "&solbar;"], [60, "&angzarr;"], [51, "&lmoustache;"], [0, "&rmoustache;"], [2, "&OverBracket;"], [0, "&bbrk;"], [0, "&bbrktbrk;"], [37, "&OverParenthesis;"], [0, "&UnderParenthesis;"], [0, "&OverBrace;"], [0, "&UnderBrace;"], [2, "&trpezium;"], [4, "&elinters;"], [59, "&blank;"], [164, "&circledS;"], [55, "&boxh;"], [1, "&boxv;"], [9, "&boxdr;"], [3, "&boxdl;"], [3, "&boxur;"], [3, "&boxul;"], [3, "&boxvr;"], [7, "&boxvl;"], [7, "&boxhd;"], [7, "&boxhu;"], [7, "&boxvh;"], [19, "&boxH;"], [0, "&boxV;"], [0, "&boxdR;"], [0, "&boxDr;"], [0, "&boxDR;"], [0, "&boxdL;"], [0, "&boxDl;"], [0, "&boxDL;"], [0, "&boxuR;"], [0, "&boxUr;"], [0, "&boxUR;"], [0, "&boxuL;"], [0, "&boxUl;"], [0, "&boxUL;"], [0, "&boxvR;"], [0, "&boxVr;"], [0, "&boxVR;"], [0, "&boxvL;"], [0, "&boxVl;"], [0, "&boxVL;"], [0, "&boxHd;"], [0, "&boxhD;"], [0, "&boxHD;"], [0, "&boxHu;"], [0, "&boxhU;"], [0, "&boxHU;"], [0, "&boxvH;"], [0, "&boxVh;"], [0, "&boxVH;"], [19, "&uhblk;"], [3, "&lhblk;"], [3, "&block;"], [8, "&blk14;"], [0, "&blk12;"], [0, "&blk34;"], [13, "&square;"], [8, "&blacksquare;"], [0, "&EmptyVerySmallSquare;"], [1, "&rect;"], [0, "&marker;"], [2, "&fltns;"], [1, "&bigtriangleup;"], [0, "&blacktriangle;"], [0, "&triangle;"], [2, "&blacktriangleright;"], [0, "&rtri;"], [3, "&bigtriangledown;"], [0, "&blacktriangledown;"], [0, "&dtri;"], [2, "&blacktriangleleft;"], [0, "&ltri;"], [6, "&loz;"], [0, "&cir;"], [32, "&tridot;"], [2, "&bigcirc;"], [8, "&ultri;"], [0, "&urtri;"], [0, "&lltri;"], [0, "&EmptySmallSquare;"], [0, "&FilledSmallSquare;"], [8, "&bigstar;"], [0, "&star;"], [7, "&phone;"], [49, "&female;"], [1, "&male;"], [29, "&spades;"], [2, "&clubs;"], [1, "&hearts;"], [0, "&diamondsuit;"], [3, "&sung;"], [2, "&flat;"], [0, "&natural;"], [0, "&sharp;"], [163, "&check;"], [3, "&cross;"], [8, "&malt;"], [21, "&sext;"], [33, "&VerticalSeparator;"], [25, "&lbbrk;"], [0, "&rbbrk;"], [84, "&bsolhsub;"], [0, "&suphsol;"], [28, "&LeftDoubleBracket;"], [0, "&RightDoubleBracket;"], [0, "&lang;"], [0, "&rang;"], [0, "&Lang;"], [0, "&Rang;"], [0, "&loang;"], [0, "&roang;"], [7, "&longleftarrow;"], [0, "&longrightarrow;"], [0, "&longleftrightarrow;"], [0, "&DoubleLongLeftArrow;"], [0, "&DoubleLongRightArrow;"], [0, "&DoubleLongLeftRightArrow;"], [1, "&longmapsto;"], [2, "&dzigrarr;"], [258, "&nvlArr;"], [0, "&nvrArr;"], [0, "&nvHarr;"], [0, "&Map;"], [6, "&lbarr;"], [0, "&bkarow;"], [0, "&lBarr;"], [0, "&dbkarow;"], [0, "&drbkarow;"], [0, "&DDotrahd;"], [0, "&UpArrowBar;"], [0, "&DownArrowBar;"], [2, "&Rarrtl;"], [2, "&latail;"], [0, "&ratail;"], [0, "&lAtail;"], [0, "&rAtail;"], [0, "&larrfs;"], [0, "&rarrfs;"], [0, "&larrbfs;"], [0, "&rarrbfs;"], [2, "&nwarhk;"], [0, "&nearhk;"], [0, "&hksearow;"], [0, "&hkswarow;"], [0, "&nwnear;"], [0, "&nesear;"], [0, "&seswar;"], [0, "&swnwar;"], [8, { v: "&rarrc;", n: 824, o: "&nrarrc;" }], [1, "&cudarrr;"], [0, "&ldca;"], [0, "&rdca;"], [0, "&cudarrl;"], [0, "&larrpl;"], [2, "&curarrm;"], [0, "&cularrp;"], [7, "&rarrpl;"], [2, "&harrcir;"], [0, "&Uarrocir;"], [0, "&lurdshar;"], [0, "&ldrushar;"], [2, "&LeftRightVector;"], [0, "&RightUpDownVector;"], [0, "&DownLeftRightVector;"], [0, "&LeftUpDownVector;"], [0, "&LeftVectorBar;"], [0, "&RightVectorBar;"], [0, "&RightUpVectorBar;"], [0, "&RightDownVectorBar;"], [0, "&DownLeftVectorBar;"], [0, "&DownRightVectorBar;"], [0, "&LeftUpVectorBar;"], [0, "&LeftDownVectorBar;"], [0, "&LeftTeeVector;"], [0, "&RightTeeVector;"], [0, "&RightUpTeeVector;"], [0, "&RightDownTeeVector;"], [0, "&DownLeftTeeVector;"], [0, "&DownRightTeeVector;"], [0, "&LeftUpTeeVector;"], [0, "&LeftDownTeeVector;"], [0, "&lHar;"], [0, "&uHar;"], [0, "&rHar;"], [0, "&dHar;"], [0, "&luruhar;"], [0, "&ldrdhar;"], [0, "&ruluhar;"], [0, "&rdldhar;"], [0, "&lharul;"], [0, "&llhard;"], [0, "&rharul;"], [0, "&lrhard;"], [0, "&udhar;"], [0, "&duhar;"], [0, "&RoundImplies;"], [0, "&erarr;"], [0, "&simrarr;"], [0, "&larrsim;"], [0, "&rarrsim;"], [0, "&rarrap;"], [0, "&ltlarr;"], [1, "&gtrarr;"], [0, "&subrarr;"], [1, "&suplarr;"], [0, "&lfisht;"], [0, "&rfisht;"], [0, "&ufisht;"], [0, "&dfisht;"], [5, "&lopar;"], [0, "&ropar;"], [4, "&lbrke;"], [0, "&rbrke;"], [0, "&lbrkslu;"], [0, "&rbrksld;"], [0, "&lbrksld;"], [0, "&rbrkslu;"], [0, "&langd;"], [0, "&rangd;"], [0, "&lparlt;"], [0, "&rpargt;"], [0, "&gtlPar;"], [0, "&ltrPar;"], [3, "&vzigzag;"], [1, "&vangrt;"], [0, "&angrtvbd;"], [6, "&ange;"], [0, "&range;"], [0, "&dwangle;"], [0, "&uwangle;"], [0, "&angmsdaa;"], [0, "&angmsdab;"], [0, "&angmsdac;"], [0, "&angmsdad;"], [0, "&angmsdae;"], [0, "&angmsdaf;"], [0, "&angmsdag;"], [0, "&angmsdah;"], [0, "&bemptyv;"], [0, "&demptyv;"], [0, "&cemptyv;"], [0, "&raemptyv;"], [0, "&laemptyv;"], [0, "&ohbar;"], [0, "&omid;"], [0, "&opar;"], [1, "&operp;"], [1, "&olcross;"], [0, "&odsold;"], [1, "&olcir;"], [0, "&ofcir;"], [0, "&olt;"], [0, "&ogt;"], [0, "&cirscir;"], [0, "&cirE;"], [0, "&solb;"], [0, "&bsolb;"], [3, "&boxbox;"], [3, "&trisb;"], [0, "&rtriltri;"], [0, { v: "&LeftTriangleBar;", n: 824, o: "&NotLeftTriangleBar;" }], [0, { v: "&RightTriangleBar;", n: 824, o: "&NotRightTriangleBar;" }], [11, "&iinfin;"], [0, "&infintie;"], [0, "&nvinfin;"], [4, "&eparsl;"], [0, "&smeparsl;"], [0, "&eqvparsl;"], [5, "&blacklozenge;"], [8, "&RuleDelayed;"], [1, "&dsol;"], [9, "&bigodot;"], [0, "&bigoplus;"], [0, "&bigotimes;"], [1, "&biguplus;"], [1, "&bigsqcup;"], [5, "&iiiint;"], [0, "&fpartint;"], [2, "&cirfnint;"], [0, "&awint;"], [0, "&rppolint;"], [0, "&scpolint;"], [0, "&npolint;"], [0, "&pointint;"], [0, "&quatint;"], [0, "&intlarhk;"], [10, "&pluscir;"], [0, "&plusacir;"], [0, "&simplus;"], [0, "&plusdu;"], [0, "&plussim;"], [0, "&plustwo;"], [1, "&mcomma;"], [0, "&minusdu;"], [2, "&loplus;"], [0, "&roplus;"], [0, "&Cross;"], [0, "&timesd;"], [0, "&timesbar;"], [1, "&smashp;"], [0, "&lotimes;"], [0, "&rotimes;"], [0, "&otimesas;"], [0, "&Otimes;"], [0, "&odiv;"], [0, "&triplus;"], [0, "&triminus;"], [0, "&tritime;"], [0, "&intprod;"], [2, "&amalg;"], [0, "&capdot;"], [1, "&ncup;"], [0, "&ncap;"], [0, "&capand;"], [0, "&cupor;"], [0, "&cupcap;"], [0, "&capcup;"], [0, "&cupbrcap;"], [0, "&capbrcup;"], [0, "&cupcup;"], [0, "&capcap;"], [0, "&ccups;"], [0, "&ccaps;"], [2, "&ccupssm;"], [2, "&And;"], [0, "&Or;"], [0, "&andand;"], [0, "&oror;"], [0, "&orslope;"], [0, "&andslope;"], [1, "&andv;"], [0, "&orv;"], [0, "&andd;"], [0, "&ord;"], [1, "&wedbar;"], [6, "&sdote;"], [3, "&simdot;"], [2, { v: "&congdot;", n: 824, o: "&ncongdot;" }], [0, "&easter;"], [0, "&apacir;"], [0, { v: "&apE;", n: 824, o: "&napE;" }], [0, "&eplus;"], [0, "&pluse;"], [0, "&Esim;"], [0, "&Colone;"], [0, "&Equal;"], [1, "&ddotseq;"], [0, "&equivDD;"], [0, "&ltcir;"], [0, "&gtcir;"], [0, "&ltquest;"], [0, "&gtquest;"], [0, { v: "&leqslant;", n: 824, o: "&nleqslant;" }], [0, { v: "&geqslant;", n: 824, o: "&ngeqslant;" }], [0, "&lesdot;"], [0, "&gesdot;"], [0, "&lesdoto;"], [0, "&gesdoto;"], [0, "&lesdotor;"], [0, "&gesdotol;"], [0, "&lap;"], [0, "&gap;"], [0, "&lne;"], [0, "&gne;"], [0, "&lnap;"], [0, "&gnap;"], [0, "&lEg;"], [0, "&gEl;"], [0, "&lsime;"], [0, "&gsime;"], [0, "&lsimg;"], [0, "&gsiml;"], [0, "&lgE;"], [0, "&glE;"], [0, "&lesges;"], [0, "&gesles;"], [0, "&els;"], [0, "&egs;"], [0, "&elsdot;"], [0, "&egsdot;"], [0, "&el;"], [0, "&eg;"], [2, "&siml;"], [0, "&simg;"], [0, "&simlE;"], [0, "&simgE;"], [0, { v: "&LessLess;", n: 824, o: "&NotNestedLessLess;" }], [0, { v: "&GreaterGreater;", n: 824, o: "&NotNestedGreaterGreater;" }], [1, "&glj;"], [0, "&gla;"], [0, "&ltcc;"], [0, "&gtcc;"], [0, "&lescc;"], [0, "&gescc;"], [0, "&smt;"], [0, "&lat;"], [0, { v: "&smte;", n: 65024, o: "&smtes;" }], [0, { v: "&late;", n: 65024, o: "&lates;" }], [0, "&bumpE;"], [0, { v: "&PrecedesEqual;", n: 824, o: "&NotPrecedesEqual;" }], [0, { v: "&sce;", n: 824, o: "&NotSucceedsEqual;" }], [2, "&prE;"], [0, "&scE;"], [0, "&precneqq;"], [0, "&scnE;"], [0, "&prap;"], [0, "&scap;"], [0, "&precnapprox;"], [0, "&scnap;"], [0, "&Pr;"], [0, "&Sc;"], [0, "&subdot;"], [0, "&supdot;"], [0, "&subplus;"], [0, "&supplus;"], [0, "&submult;"], [0, "&supmult;"], [0, "&subedot;"], [0, "&supedot;"], [0, { v: "&subE;", n: 824, o: "&nsubE;" }], [0, { v: "&supE;", n: 824, o: "&nsupE;" }], [0, "&subsim;"], [0, "&supsim;"], [2, { v: "&subnE;", n: 65024, o: "&varsubsetneqq;" }], [0, { v: "&supnE;", n: 65024, o: "&varsupsetneqq;" }], [2, "&csub;"], [0, "&csup;"], [0, "&csube;"], [0, "&csupe;"], [0, "&subsup;"], [0, "&supsub;"], [0, "&subsub;"], [0, "&supsup;"], [0, "&suphsub;"], [0, "&supdsub;"], [0, "&forkv;"], [0, "&topfork;"], [0, "&mlcp;"], [8, "&Dashv;"], [1, "&Vdashl;"], [0, "&Barv;"], [0, "&vBar;"], [0, "&vBarv;"], [1, "&Vbar;"], [0, "&Not;"], [0, "&bNot;"], [0, "&rnmid;"], [0, "&cirmid;"], [0, "&midcir;"], [0, "&topcir;"], [0, "&nhpar;"], [0, "&parsim;"], [9, { v: "&parsl;", n: 8421, o: "&nparsl;" }], [44343, { n: new Map(/* @__PURE__ */ restoreDiff2([[56476, "&Ascr;"], [1, "&Cscr;"], [0, "&Dscr;"], [2, "&Gscr;"], [2, "&Jscr;"], [0, "&Kscr;"], [2, "&Nscr;"], [0, "&Oscr;"], [0, "&Pscr;"], [0, "&Qscr;"], [1, "&Sscr;"], [0, "&Tscr;"], [0, "&Uscr;"], [0, "&Vscr;"], [0, "&Wscr;"], [0, "&Xscr;"], [0, "&Yscr;"], [0, "&Zscr;"], [0, "&ascr;"], [0, "&bscr;"], [0, "&cscr;"], [0, "&dscr;"], [1, "&fscr;"], [1, "&hscr;"], [0, "&iscr;"], [0, "&jscr;"], [0, "&kscr;"], [0, "&lscr;"], [0, "&mscr;"], [0, "&nscr;"], [1, "&pscr;"], [0, "&qscr;"], [0, "&rscr;"], [0, "&sscr;"], [0, "&tscr;"], [0, "&uscr;"], [0, "&vscr;"], [0, "&wscr;"], [0, "&xscr;"], [0, "&yscr;"], [0, "&zscr;"], [52, "&Afr;"], [0, "&Bfr;"], [1, "&Dfr;"], [0, "&Efr;"], [0, "&Ffr;"], [0, "&Gfr;"], [2, "&Jfr;"], [0, "&Kfr;"], [0, "&Lfr;"], [0, "&Mfr;"], [0, "&Nfr;"], [0, "&Ofr;"], [0, "&Pfr;"], [0, "&Qfr;"], [1, "&Sfr;"], [0, "&Tfr;"], [0, "&Ufr;"], [0, "&Vfr;"], [0, "&Wfr;"], [0, "&Xfr;"], [0, "&Yfr;"], [1, "&afr;"], [0, "&bfr;"], [0, "&cfr;"], [0, "&dfr;"], [0, "&efr;"], [0, "&ffr;"], [0, "&gfr;"], [0, "&hfr;"], [0, "&ifr;"], [0, "&jfr;"], [0, "&kfr;"], [0, "&lfr;"], [0, "&mfr;"], [0, "&nfr;"], [0, "&ofr;"], [0, "&pfr;"], [0, "&qfr;"], [0, "&rfr;"], [0, "&sfr;"], [0, "&tfr;"], [0, "&ufr;"], [0, "&vfr;"], [0, "&wfr;"], [0, "&xfr;"], [0, "&yfr;"], [0, "&zfr;"], [0, "&Aopf;"], [0, "&Bopf;"], [1, "&Dopf;"], [0, "&Eopf;"], [0, "&Fopf;"], [0, "&Gopf;"], [1, "&Iopf;"], [0, "&Jopf;"], [0, "&Kopf;"], [0, "&Lopf;"], [0, "&Mopf;"], [1, "&Oopf;"], [3, "&Sopf;"], [0, "&Topf;"], [0, "&Uopf;"], [0, "&Vopf;"], [0, "&Wopf;"], [0, "&Xopf;"], [0, "&Yopf;"], [1, "&aopf;"], [0, "&bopf;"], [0, "&copf;"], [0, "&dopf;"], [0, "&eopf;"], [0, "&fopf;"], [0, "&gopf;"], [0, "&hopf;"], [0, "&iopf;"], [0, "&jopf;"], [0, "&kopf;"], [0, "&lopf;"], [0, "&mopf;"], [0, "&nopf;"], [0, "&oopf;"], [0, "&popf;"], [0, "&qopf;"], [0, "&ropf;"], [0, "&sopf;"], [0, "&topf;"], [0, "&uopf;"], [0, "&vopf;"], [0, "&wopf;"], [0, "&xopf;"], [0, "&yopf;"], [0, "&zopf;"]])) }], [8906, "&fflig;"], [0, "&filig;"], [0, "&fllig;"], [0, "&ffilig;"], [0, "&ffllig;"]]));
  }
});

// node_modules/entities/lib/escape.js
var require_escape = __commonJS({
  "node_modules/entities/lib/escape.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.escapeText = exports.escapeAttribute = exports.escapeUTF8 = exports.escape = exports.encodeXML = exports.getCodePoint = exports.xmlReplacer = void 0;
    exports.xmlReplacer = /["&'<>$\x80-\uFFFF]/g;
    var xmlCodeMap2 = /* @__PURE__ */ new Map([
      [34, "&quot;"],
      [38, "&amp;"],
      [39, "&apos;"],
      [60, "&lt;"],
      [62, "&gt;"]
    ]);
    exports.getCodePoint = // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    String.prototype.codePointAt != null ? function(str, index) {
      return str.codePointAt(index);
    } : (
      // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      function(c, index) {
        return (c.charCodeAt(index) & 64512) === 55296 ? (c.charCodeAt(index) - 55296) * 1024 + c.charCodeAt(index + 1) - 56320 + 65536 : c.charCodeAt(index);
      }
    );
    function encodeXML2(str) {
      var ret = "";
      var lastIdx = 0;
      var match;
      while ((match = exports.xmlReplacer.exec(str)) !== null) {
        var i = match.index;
        var char = str.charCodeAt(i);
        var next = xmlCodeMap2.get(char);
        if (next !== void 0) {
          ret += str.substring(lastIdx, i) + next;
          lastIdx = i + 1;
        } else {
          ret += "".concat(str.substring(lastIdx, i), "&#x").concat((0, exports.getCodePoint)(str, i).toString(16), ";");
          lastIdx = exports.xmlReplacer.lastIndex += Number((char & 64512) === 55296);
        }
      }
      return ret + str.substr(lastIdx);
    }
    exports.encodeXML = encodeXML2;
    exports.escape = encodeXML2;
    function getEscaper2(regex, map) {
      return function escape3(data) {
        var match;
        var lastIdx = 0;
        var result = "";
        while (match = regex.exec(data)) {
          if (lastIdx !== match.index) {
            result += data.substring(lastIdx, match.index);
          }
          result += map.get(match[0].charCodeAt(0));
          lastIdx = match.index + 1;
        }
        return result + data.substring(lastIdx);
      };
    }
    exports.escapeUTF8 = getEscaper2(/[&<>'"]/g, xmlCodeMap2);
    exports.escapeAttribute = getEscaper2(/["&\u00A0]/g, /* @__PURE__ */ new Map([
      [34, "&quot;"],
      [38, "&amp;"],
      [160, "&nbsp;"]
    ]));
    exports.escapeText = getEscaper2(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([
      [38, "&amp;"],
      [60, "&lt;"],
      [62, "&gt;"],
      [160, "&nbsp;"]
    ]));
  }
});

// node_modules/entities/lib/encode.js
var require_encode = __commonJS({
  "node_modules/entities/lib/encode.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.encodeNonAsciiHTML = exports.encodeHTML = void 0;
    var encode_html_js_1 = __importDefault(require_encode_html());
    var escape_js_1 = require_escape();
    var htmlReplacer = /[\t\n!-,./:-@[-`\f{-}$\x80-\uFFFF]/g;
    function encodeHTML2(data) {
      return encodeHTMLTrieRe(htmlReplacer, data);
    }
    exports.encodeHTML = encodeHTML2;
    function encodeNonAsciiHTML2(data) {
      return encodeHTMLTrieRe(escape_js_1.xmlReplacer, data);
    }
    exports.encodeNonAsciiHTML = encodeNonAsciiHTML2;
    function encodeHTMLTrieRe(regExp, str) {
      var ret = "";
      var lastIdx = 0;
      var match;
      while ((match = regExp.exec(str)) !== null) {
        var i = match.index;
        ret += str.substring(lastIdx, i);
        var char = str.charCodeAt(i);
        var next = encode_html_js_1.default.get(char);
        if (typeof next === "object") {
          if (i + 1 < str.length) {
            var nextChar = str.charCodeAt(i + 1);
            var value = typeof next.n === "number" ? next.n === nextChar ? next.o : void 0 : next.n.get(nextChar);
            if (value !== void 0) {
              ret += value;
              lastIdx = regExp.lastIndex += 1;
              continue;
            }
          }
          next = next.v;
        }
        if (next !== void 0) {
          ret += next;
          lastIdx = i + 1;
        } else {
          var cp = (0, escape_js_1.getCodePoint)(str, i);
          ret += "&#x".concat(cp.toString(16), ";");
          lastIdx = regExp.lastIndex += Number(cp !== char);
        }
      }
      return ret + str.substr(lastIdx);
    }
  }
});

// node_modules/entities/lib/index.js
var require_lib4 = __commonJS({
  "node_modules/entities/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLAttribute = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.DecodingMode = exports.EntityDecoder = exports.encodeHTML5 = exports.encodeHTML4 = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.escapeText = exports.escapeAttribute = exports.escapeUTF8 = exports.escape = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = exports.EncodingMode = exports.EntityLevel = void 0;
    var decode_js_1 = require_decode();
    var encode_js_1 = require_encode();
    var escape_js_1 = require_escape();
    var EntityLevel2;
    (function(EntityLevel3) {
      EntityLevel3[EntityLevel3["XML"] = 0] = "XML";
      EntityLevel3[EntityLevel3["HTML"] = 1] = "HTML";
    })(EntityLevel2 = exports.EntityLevel || (exports.EntityLevel = {}));
    var EncodingMode2;
    (function(EncodingMode3) {
      EncodingMode3[EncodingMode3["UTF8"] = 0] = "UTF8";
      EncodingMode3[EncodingMode3["ASCII"] = 1] = "ASCII";
      EncodingMode3[EncodingMode3["Extensive"] = 2] = "Extensive";
      EncodingMode3[EncodingMode3["Attribute"] = 3] = "Attribute";
      EncodingMode3[EncodingMode3["Text"] = 4] = "Text";
    })(EncodingMode2 = exports.EncodingMode || (exports.EncodingMode = {}));
    function decode(data, options) {
      if (options === void 0) {
        options = EntityLevel2.XML;
      }
      var level = typeof options === "number" ? options : options.level;
      if (level === EntityLevel2.HTML) {
        var mode = typeof options === "object" ? options.mode : void 0;
        return (0, decode_js_1.decodeHTML)(data, mode);
      }
      return (0, decode_js_1.decodeXML)(data);
    }
    exports.decode = decode;
    function decodeStrict(data, options) {
      var _a2;
      if (options === void 0) {
        options = EntityLevel2.XML;
      }
      var opts = typeof options === "number" ? { level: options } : options;
      (_a2 = opts.mode) !== null && _a2 !== void 0 ? _a2 : opts.mode = decode_js_1.DecodingMode.Strict;
      return decode(data, opts);
    }
    exports.decodeStrict = decodeStrict;
    function encode(data, options) {
      if (options === void 0) {
        options = EntityLevel2.XML;
      }
      var opts = typeof options === "number" ? { level: options } : options;
      if (opts.mode === EncodingMode2.UTF8)
        return (0, escape_js_1.escapeUTF8)(data);
      if (opts.mode === EncodingMode2.Attribute)
        return (0, escape_js_1.escapeAttribute)(data);
      if (opts.mode === EncodingMode2.Text)
        return (0, escape_js_1.escapeText)(data);
      if (opts.level === EntityLevel2.HTML) {
        if (opts.mode === EncodingMode2.ASCII) {
          return (0, encode_js_1.encodeNonAsciiHTML)(data);
        }
        return (0, encode_js_1.encodeHTML)(data);
      }
      return (0, escape_js_1.encodeXML)(data);
    }
    exports.encode = encode;
    var escape_js_2 = require_escape();
    Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function() {
      return escape_js_2.encodeXML;
    } });
    Object.defineProperty(exports, "escape", { enumerable: true, get: function() {
      return escape_js_2.escape;
    } });
    Object.defineProperty(exports, "escapeUTF8", { enumerable: true, get: function() {
      return escape_js_2.escapeUTF8;
    } });
    Object.defineProperty(exports, "escapeAttribute", { enumerable: true, get: function() {
      return escape_js_2.escapeAttribute;
    } });
    Object.defineProperty(exports, "escapeText", { enumerable: true, get: function() {
      return escape_js_2.escapeText;
    } });
    var encode_js_2 = require_encode();
    Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function() {
      return encode_js_2.encodeHTML;
    } });
    Object.defineProperty(exports, "encodeNonAsciiHTML", { enumerable: true, get: function() {
      return encode_js_2.encodeNonAsciiHTML;
    } });
    Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function() {
      return encode_js_2.encodeHTML;
    } });
    Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function() {
      return encode_js_2.encodeHTML;
    } });
    var decode_js_2 = require_decode();
    Object.defineProperty(exports, "EntityDecoder", { enumerable: true, get: function() {
      return decode_js_2.EntityDecoder;
    } });
    Object.defineProperty(exports, "DecodingMode", { enumerable: true, get: function() {
      return decode_js_2.DecodingMode;
    } });
    Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function() {
      return decode_js_2.decodeXML;
    } });
    Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function() {
      return decode_js_2.decodeHTML;
    } });
    Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function() {
      return decode_js_2.decodeHTMLStrict;
    } });
    Object.defineProperty(exports, "decodeHTMLAttribute", { enumerable: true, get: function() {
      return decode_js_2.decodeHTMLAttribute;
    } });
    Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function() {
      return decode_js_2.decodeHTML;
    } });
    Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function() {
      return decode_js_2.decodeHTML;
    } });
    Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function() {
      return decode_js_2.decodeHTMLStrict;
    } });
    Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function() {
      return decode_js_2.decodeHTMLStrict;
    } });
    Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function() {
      return decode_js_2.decodeXML;
    } });
  }
});

// node_modules/dom-serializer/lib/foreignNames.js
var require_foreignNames = __commonJS({
  "node_modules/dom-serializer/lib/foreignNames.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.attributeNames = exports.elementNames = void 0;
    exports.elementNames = new Map([
      "altGlyph",
      "altGlyphDef",
      "altGlyphItem",
      "animateColor",
      "animateMotion",
      "animateTransform",
      "clipPath",
      "feBlend",
      "feColorMatrix",
      "feComponentTransfer",
      "feComposite",
      "feConvolveMatrix",
      "feDiffuseLighting",
      "feDisplacementMap",
      "feDistantLight",
      "feDropShadow",
      "feFlood",
      "feFuncA",
      "feFuncB",
      "feFuncG",
      "feFuncR",
      "feGaussianBlur",
      "feImage",
      "feMerge",
      "feMergeNode",
      "feMorphology",
      "feOffset",
      "fePointLight",
      "feSpecularLighting",
      "feSpotLight",
      "feTile",
      "feTurbulence",
      "foreignObject",
      "glyphRef",
      "linearGradient",
      "radialGradient",
      "textPath"
    ].map(function(val) {
      return [val.toLowerCase(), val];
    }));
    exports.attributeNames = new Map([
      "definitionURL",
      "attributeName",
      "attributeType",
      "baseFrequency",
      "baseProfile",
      "calcMode",
      "clipPathUnits",
      "diffuseConstant",
      "edgeMode",
      "filterUnits",
      "glyphRef",
      "gradientTransform",
      "gradientUnits",
      "kernelMatrix",
      "kernelUnitLength",
      "keyPoints",
      "keySplines",
      "keyTimes",
      "lengthAdjust",
      "limitingConeAngle",
      "markerHeight",
      "markerUnits",
      "markerWidth",
      "maskContentUnits",
      "maskUnits",
      "numOctaves",
      "pathLength",
      "patternContentUnits",
      "patternTransform",
      "patternUnits",
      "pointsAtX",
      "pointsAtY",
      "pointsAtZ",
      "preserveAlpha",
      "preserveAspectRatio",
      "primitiveUnits",
      "refX",
      "refY",
      "repeatCount",
      "repeatDur",
      "requiredExtensions",
      "requiredFeatures",
      "specularConstant",
      "specularExponent",
      "spreadMethod",
      "startOffset",
      "stdDeviation",
      "stitchTiles",
      "surfaceScale",
      "systemLanguage",
      "tableValues",
      "targetX",
      "targetY",
      "textLength",
      "viewBox",
      "viewTarget",
      "xChannelSelector",
      "yChannelSelector",
      "zoomAndPan"
    ].map(function(val) {
      return [val.toLowerCase(), val];
    }));
  }
});

// node_modules/dom-serializer/lib/index.js
var require_lib5 = __commonJS({
  "node_modules/dom-serializer/lib/index.js"(exports) {
    "use strict";
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.render = void 0;
    var ElementType2 = __importStar(require_lib2());
    var entities_1 = require_lib4();
    var foreignNames_js_1 = require_foreignNames();
    var unencodedElements2 = /* @__PURE__ */ new Set([
      "style",
      "script",
      "xmp",
      "iframe",
      "noembed",
      "noframes",
      "plaintext",
      "noscript"
    ]);
    function replaceQuotes2(value) {
      return value.replace(/"/g, "&quot;");
    }
    function formatAttributes2(attributes2, opts) {
      var _a2;
      if (!attributes2)
        return;
      var encode = ((_a2 = opts.encodeEntities) !== null && _a2 !== void 0 ? _a2 : opts.decodeEntities) === false ? replaceQuotes2 : opts.xmlMode || opts.encodeEntities !== "utf8" ? entities_1.encodeXML : entities_1.escapeAttribute;
      return Object.keys(attributes2).map(function(key2) {
        var _a3, _b;
        var value = (_a3 = attributes2[key2]) !== null && _a3 !== void 0 ? _a3 : "";
        if (opts.xmlMode === "foreign") {
          key2 = (_b = foreignNames_js_1.attributeNames.get(key2)) !== null && _b !== void 0 ? _b : key2;
        }
        if (!opts.emptyAttrs && !opts.xmlMode && value === "") {
          return key2;
        }
        return "".concat(key2, '="').concat(encode(value), '"');
      }).join(" ");
    }
    var singleTag2 = /* @__PURE__ */ new Set([
      "area",
      "base",
      "basefont",
      "br",
      "col",
      "command",
      "embed",
      "frame",
      "hr",
      "img",
      "input",
      "isindex",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
    ]);
    function render2(node, options) {
      if (options === void 0) {
        options = {};
      }
      var nodes = "length" in node ? node : [node];
      var output = "";
      for (var i = 0; i < nodes.length; i++) {
        output += renderNode2(nodes[i], options);
      }
      return output;
    }
    exports.render = render2;
    exports.default = render2;
    function renderNode2(node, options) {
      switch (node.type) {
        case ElementType2.Root:
          return render2(node.children, options);
        case ElementType2.Doctype:
        case ElementType2.Directive:
          return renderDirective2(node);
        case ElementType2.Comment:
          return renderComment2(node);
        case ElementType2.CDATA:
          return renderCdata2(node);
        case ElementType2.Script:
        case ElementType2.Style:
        case ElementType2.Tag:
          return renderTag2(node, options);
        case ElementType2.Text:
          return renderText2(node, options);
      }
    }
    var foreignModeIntegrationPoints2 = /* @__PURE__ */ new Set([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext",
      "annotation-xml",
      "foreignObject",
      "desc",
      "title"
    ]);
    var foreignElements2 = /* @__PURE__ */ new Set(["svg", "math"]);
    function renderTag2(elem, opts) {
      var _a2;
      if (opts.xmlMode === "foreign") {
        elem.name = (_a2 = foreignNames_js_1.elementNames.get(elem.name)) !== null && _a2 !== void 0 ? _a2 : elem.name;
        if (elem.parent && foreignModeIntegrationPoints2.has(elem.parent.name)) {
          opts = __assign(__assign({}, opts), { xmlMode: false });
        }
      }
      if (!opts.xmlMode && foreignElements2.has(elem.name)) {
        opts = __assign(__assign({}, opts), { xmlMode: "foreign" });
      }
      var tag = "<".concat(elem.name);
      var attribs = formatAttributes2(elem.attribs, opts);
      if (attribs) {
        tag += " ".concat(attribs);
      }
      if (elem.children.length === 0 && (opts.xmlMode ? (
        // In XML mode or foreign mode, and user hasn't explicitly turned off self-closing tags
        opts.selfClosingTags !== false
      ) : (
        // User explicitly asked for self-closing tags, even in HTML mode
        opts.selfClosingTags && singleTag2.has(elem.name)
      ))) {
        if (!opts.xmlMode)
          tag += " ";
        tag += "/>";
      } else {
        tag += ">";
        if (elem.children.length > 0) {
          tag += render2(elem.children, opts);
        }
        if (opts.xmlMode || !singleTag2.has(elem.name)) {
          tag += "</".concat(elem.name, ">");
        }
      }
      return tag;
    }
    function renderDirective2(elem) {
      return "<".concat(elem.data, ">");
    }
    function renderText2(elem, opts) {
      var _a2;
      var data = elem.data || "";
      if (((_a2 = opts.encodeEntities) !== null && _a2 !== void 0 ? _a2 : opts.decodeEntities) !== false && !(!opts.xmlMode && elem.parent && unencodedElements2.has(elem.parent.name))) {
        data = opts.xmlMode || opts.encodeEntities !== "utf8" ? (0, entities_1.encodeXML)(data) : (0, entities_1.escapeText)(data);
      }
      return data;
    }
    function renderCdata2(elem) {
      return "<![CDATA[".concat(elem.children[0].data, "]]>");
    }
    function renderComment2(elem) {
      return "<!--".concat(elem.data, "-->");
    }
  }
});

// node_modules/domutils/lib/stringify.js
var require_stringify2 = __commonJS({
  "node_modules/domutils/lib/stringify.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.innerText = exports.textContent = exports.getText = exports.getInnerHTML = exports.getOuterHTML = void 0;
    var domhandler_1 = require_lib3();
    var dom_serializer_1 = __importDefault(require_lib5());
    var domelementtype_1 = require_lib2();
    function getOuterHTML2(node, options) {
      return (0, dom_serializer_1.default)(node, options);
    }
    exports.getOuterHTML = getOuterHTML2;
    function getInnerHTML2(node, options) {
      return (0, domhandler_1.hasChildren)(node) ? node.children.map(function(node2) {
        return getOuterHTML2(node2, options);
      }).join("") : "";
    }
    exports.getInnerHTML = getInnerHTML2;
    function getText3(node) {
      if (Array.isArray(node))
        return node.map(getText3).join("");
      if ((0, domhandler_1.isTag)(node))
        return node.name === "br" ? "\n" : getText3(node.children);
      if ((0, domhandler_1.isCDATA)(node))
        return getText3(node.children);
      if ((0, domhandler_1.isText)(node))
        return node.data;
      return "";
    }
    exports.getText = getText3;
    function textContent2(node) {
      if (Array.isArray(node))
        return node.map(textContent2).join("");
      if ((0, domhandler_1.hasChildren)(node) && !(0, domhandler_1.isComment)(node)) {
        return textContent2(node.children);
      }
      if ((0, domhandler_1.isText)(node))
        return node.data;
      return "";
    }
    exports.textContent = textContent2;
    function innerText2(node) {
      if (Array.isArray(node))
        return node.map(innerText2).join("");
      if ((0, domhandler_1.hasChildren)(node) && (node.type === domelementtype_1.ElementType.Tag || (0, domhandler_1.isCDATA)(node))) {
        return innerText2(node.children);
      }
      if ((0, domhandler_1.isText)(node))
        return node.data;
      return "";
    }
    exports.innerText = innerText2;
  }
});

// node_modules/domutils/lib/traversal.js
var require_traversal = __commonJS({
  "node_modules/domutils/lib/traversal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prevElementSibling = exports.nextElementSibling = exports.getName = exports.hasAttrib = exports.getAttributeValue = exports.getSiblings = exports.getParent = exports.getChildren = void 0;
    var domhandler_1 = require_lib3();
    function getChildren3(elem) {
      return (0, domhandler_1.hasChildren)(elem) ? elem.children : [];
    }
    exports.getChildren = getChildren3;
    function getParent3(elem) {
      return elem.parent || null;
    }
    exports.getParent = getParent3;
    function getSiblings3(elem) {
      var _a2, _b;
      var parent = getParent3(elem);
      if (parent != null)
        return getChildren3(parent);
      var siblings = [elem];
      var prev = elem.prev, next = elem.next;
      while (prev != null) {
        siblings.unshift(prev);
        _a2 = prev, prev = _a2.prev;
      }
      while (next != null) {
        siblings.push(next);
        _b = next, next = _b.next;
      }
      return siblings;
    }
    exports.getSiblings = getSiblings3;
    function getAttributeValue3(elem, name) {
      var _a2;
      return (_a2 = elem.attribs) === null || _a2 === void 0 ? void 0 : _a2[name];
    }
    exports.getAttributeValue = getAttributeValue3;
    function hasAttrib3(elem, name) {
      return elem.attribs != null && Object.prototype.hasOwnProperty.call(elem.attribs, name) && elem.attribs[name] != null;
    }
    exports.hasAttrib = hasAttrib3;
    function getName3(elem) {
      return elem.name;
    }
    exports.getName = getName3;
    function nextElementSibling3(elem) {
      var _a2;
      var next = elem.next;
      while (next !== null && !(0, domhandler_1.isTag)(next))
        _a2 = next, next = _a2.next;
      return next;
    }
    exports.nextElementSibling = nextElementSibling3;
    function prevElementSibling2(elem) {
      var _a2;
      var prev = elem.prev;
      while (prev !== null && !(0, domhandler_1.isTag)(prev))
        _a2 = prev, prev = _a2.prev;
      return prev;
    }
    exports.prevElementSibling = prevElementSibling2;
  }
});

// node_modules/domutils/lib/manipulation.js
var require_manipulation = __commonJS({
  "node_modules/domutils/lib/manipulation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prepend = exports.prependChild = exports.append = exports.appendChild = exports.replaceElement = exports.removeElement = void 0;
    function removeElement2(elem) {
      if (elem.prev)
        elem.prev.next = elem.next;
      if (elem.next)
        elem.next.prev = elem.prev;
      if (elem.parent) {
        var childs = elem.parent.children;
        var childsIndex = childs.lastIndexOf(elem);
        if (childsIndex >= 0) {
          childs.splice(childsIndex, 1);
        }
      }
      elem.next = null;
      elem.prev = null;
      elem.parent = null;
    }
    exports.removeElement = removeElement2;
    function replaceElement2(elem, replacement) {
      var prev = replacement.prev = elem.prev;
      if (prev) {
        prev.next = replacement;
      }
      var next = replacement.next = elem.next;
      if (next) {
        next.prev = replacement;
      }
      var parent = replacement.parent = elem.parent;
      if (parent) {
        var childs = parent.children;
        childs[childs.lastIndexOf(elem)] = replacement;
        elem.parent = null;
      }
    }
    exports.replaceElement = replaceElement2;
    function appendChild2(parent, child) {
      removeElement2(child);
      child.next = null;
      child.parent = parent;
      if (parent.children.push(child) > 1) {
        var sibling = parent.children[parent.children.length - 2];
        sibling.next = child;
        child.prev = sibling;
      } else {
        child.prev = null;
      }
    }
    exports.appendChild = appendChild2;
    function append4(elem, next) {
      removeElement2(next);
      var parent = elem.parent;
      var currNext = elem.next;
      next.next = currNext;
      next.prev = elem;
      elem.next = next;
      next.parent = parent;
      if (currNext) {
        currNext.prev = next;
        if (parent) {
          var childs = parent.children;
          childs.splice(childs.lastIndexOf(currNext), 0, next);
        }
      } else if (parent) {
        parent.children.push(next);
      }
    }
    exports.append = append4;
    function prependChild2(parent, child) {
      removeElement2(child);
      child.parent = parent;
      child.prev = null;
      if (parent.children.unshift(child) !== 1) {
        var sibling = parent.children[1];
        sibling.prev = child;
        child.next = sibling;
      } else {
        child.next = null;
      }
    }
    exports.prependChild = prependChild2;
    function prepend2(elem, prev) {
      removeElement2(prev);
      var parent = elem.parent;
      if (parent) {
        var childs = parent.children;
        childs.splice(childs.indexOf(elem), 0, prev);
      }
      if (elem.prev) {
        elem.prev.next = prev;
      }
      prev.parent = parent;
      prev.prev = elem.prev;
      prev.next = elem;
      elem.prev = prev;
    }
    exports.prepend = prepend2;
  }
});

// node_modules/domutils/lib/querying.js
var require_querying = __commonJS({
  "node_modules/domutils/lib/querying.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findAll = exports.existsOne = exports.findOne = exports.findOneChild = exports.find = exports.filter = void 0;
    var domhandler_1 = require_lib3();
    function filter2(test, node, recurse, limit) {
      if (recurse === void 0) {
        recurse = true;
      }
      if (limit === void 0) {
        limit = Infinity;
      }
      return find2(test, Array.isArray(node) ? node : [node], recurse, limit);
    }
    exports.filter = filter2;
    function find2(test, nodes, recurse, limit) {
      var result = [];
      var nodeStack = [nodes];
      var indexStack = [0];
      for (; ; ) {
        if (indexStack[0] >= nodeStack[0].length) {
          if (indexStack.length === 1) {
            return result;
          }
          nodeStack.shift();
          indexStack.shift();
          continue;
        }
        var elem = nodeStack[0][indexStack[0]++];
        if (test(elem)) {
          result.push(elem);
          if (--limit <= 0)
            return result;
        }
        if (recurse && (0, domhandler_1.hasChildren)(elem) && elem.children.length > 0) {
          indexStack.unshift(0);
          nodeStack.unshift(elem.children);
        }
      }
    }
    exports.find = find2;
    function findOneChild2(test, nodes) {
      return nodes.find(test);
    }
    exports.findOneChild = findOneChild2;
    function findOne3(test, nodes, recurse) {
      if (recurse === void 0) {
        recurse = true;
      }
      var elem = null;
      for (var i = 0; i < nodes.length && !elem; i++) {
        var node = nodes[i];
        if (!(0, domhandler_1.isTag)(node)) {
          continue;
        } else if (test(node)) {
          elem = node;
        } else if (recurse && node.children.length > 0) {
          elem = findOne3(test, node.children, true);
        }
      }
      return elem;
    }
    exports.findOne = findOne3;
    function existsOne3(test, nodes) {
      return nodes.some(function(checked) {
        return (0, domhandler_1.isTag)(checked) && (test(checked) || existsOne3(test, checked.children));
      });
    }
    exports.existsOne = existsOne3;
    function findAll3(test, nodes) {
      var result = [];
      var nodeStack = [nodes];
      var indexStack = [0];
      for (; ; ) {
        if (indexStack[0] >= nodeStack[0].length) {
          if (nodeStack.length === 1) {
            return result;
          }
          nodeStack.shift();
          indexStack.shift();
          continue;
        }
        var elem = nodeStack[0][indexStack[0]++];
        if (!(0, domhandler_1.isTag)(elem))
          continue;
        if (test(elem))
          result.push(elem);
        if (elem.children.length > 0) {
          indexStack.unshift(0);
          nodeStack.unshift(elem.children);
        }
      }
    }
    exports.findAll = findAll3;
  }
});

// node_modules/domutils/lib/legacy.js
var require_legacy = __commonJS({
  "node_modules/domutils/lib/legacy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getElementsByTagType = exports.getElementsByTagName = exports.getElementById = exports.getElements = exports.testElement = void 0;
    var domhandler_1 = require_lib3();
    var querying_js_1 = require_querying();
    var Checks2 = {
      tag_name: function(name) {
        if (typeof name === "function") {
          return function(elem) {
            return (0, domhandler_1.isTag)(elem) && name(elem.name);
          };
        } else if (name === "*") {
          return domhandler_1.isTag;
        }
        return function(elem) {
          return (0, domhandler_1.isTag)(elem) && elem.name === name;
        };
      },
      tag_type: function(type) {
        if (typeof type === "function") {
          return function(elem) {
            return type(elem.type);
          };
        }
        return function(elem) {
          return elem.type === type;
        };
      },
      tag_contains: function(data) {
        if (typeof data === "function") {
          return function(elem) {
            return (0, domhandler_1.isText)(elem) && data(elem.data);
          };
        }
        return function(elem) {
          return (0, domhandler_1.isText)(elem) && elem.data === data;
        };
      }
    };
    function getAttribCheck2(attrib, value) {
      if (typeof value === "function") {
        return function(elem) {
          return (0, domhandler_1.isTag)(elem) && value(elem.attribs[attrib]);
        };
      }
      return function(elem) {
        return (0, domhandler_1.isTag)(elem) && elem.attribs[attrib] === value;
      };
    }
    function combineFuncs2(a, b) {
      return function(elem) {
        return a(elem) || b(elem);
      };
    }
    function compileTest2(options) {
      var funcs = Object.keys(options).map(function(key2) {
        var value = options[key2];
        return Object.prototype.hasOwnProperty.call(Checks2, key2) ? Checks2[key2](value) : getAttribCheck2(key2, value);
      });
      return funcs.length === 0 ? null : funcs.reduce(combineFuncs2);
    }
    function testElement2(options, node) {
      var test = compileTest2(options);
      return test ? test(node) : true;
    }
    exports.testElement = testElement2;
    function getElements2(options, nodes, recurse, limit) {
      if (limit === void 0) {
        limit = Infinity;
      }
      var test = compileTest2(options);
      return test ? (0, querying_js_1.filter)(test, nodes, recurse, limit) : [];
    }
    exports.getElements = getElements2;
    function getElementById2(id, nodes, recurse) {
      if (recurse === void 0) {
        recurse = true;
      }
      if (!Array.isArray(nodes))
        nodes = [nodes];
      return (0, querying_js_1.findOne)(getAttribCheck2("id", id), nodes, recurse);
    }
    exports.getElementById = getElementById2;
    function getElementsByTagName2(tagName18, nodes, recurse, limit) {
      if (recurse === void 0) {
        recurse = true;
      }
      if (limit === void 0) {
        limit = Infinity;
      }
      return (0, querying_js_1.filter)(Checks2["tag_name"](tagName18), nodes, recurse, limit);
    }
    exports.getElementsByTagName = getElementsByTagName2;
    function getElementsByTagType2(type, nodes, recurse, limit) {
      if (recurse === void 0) {
        recurse = true;
      }
      if (limit === void 0) {
        limit = Infinity;
      }
      return (0, querying_js_1.filter)(Checks2["tag_type"](type), nodes, recurse, limit);
    }
    exports.getElementsByTagType = getElementsByTagType2;
  }
});

// node_modules/domutils/lib/helpers.js
var require_helpers = __commonJS({
  "node_modules/domutils/lib/helpers.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uniqueSort = exports.compareDocumentPosition = exports.DocumentPosition = exports.removeSubsets = void 0;
    var domhandler_1 = require_lib3();
    function removeSubsets3(nodes) {
      var idx = nodes.length;
      while (--idx >= 0) {
        var node = nodes[idx];
        if (idx > 0 && nodes.lastIndexOf(node, idx - 1) >= 0) {
          nodes.splice(idx, 1);
          continue;
        }
        for (var ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
          if (nodes.includes(ancestor)) {
            nodes.splice(idx, 1);
            break;
          }
        }
      }
      return nodes;
    }
    exports.removeSubsets = removeSubsets3;
    var DocumentPosition2;
    (function(DocumentPosition3) {
      DocumentPosition3[DocumentPosition3["DISCONNECTED"] = 1] = "DISCONNECTED";
      DocumentPosition3[DocumentPosition3["PRECEDING"] = 2] = "PRECEDING";
      DocumentPosition3[DocumentPosition3["FOLLOWING"] = 4] = "FOLLOWING";
      DocumentPosition3[DocumentPosition3["CONTAINS"] = 8] = "CONTAINS";
      DocumentPosition3[DocumentPosition3["CONTAINED_BY"] = 16] = "CONTAINED_BY";
    })(DocumentPosition2 = exports.DocumentPosition || (exports.DocumentPosition = {}));
    function compareDocumentPosition2(nodeA, nodeB) {
      var aParents = [];
      var bParents = [];
      if (nodeA === nodeB) {
        return 0;
      }
      var current = (0, domhandler_1.hasChildren)(nodeA) ? nodeA : nodeA.parent;
      while (current) {
        aParents.unshift(current);
        current = current.parent;
      }
      current = (0, domhandler_1.hasChildren)(nodeB) ? nodeB : nodeB.parent;
      while (current) {
        bParents.unshift(current);
        current = current.parent;
      }
      var maxIdx = Math.min(aParents.length, bParents.length);
      var idx = 0;
      while (idx < maxIdx && aParents[idx] === bParents[idx]) {
        idx++;
      }
      if (idx === 0) {
        return DocumentPosition2.DISCONNECTED;
      }
      var sharedParent = aParents[idx - 1];
      var siblings = sharedParent.children;
      var aSibling = aParents[idx];
      var bSibling = bParents[idx];
      if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
        if (sharedParent === nodeB) {
          return DocumentPosition2.FOLLOWING | DocumentPosition2.CONTAINED_BY;
        }
        return DocumentPosition2.FOLLOWING;
      }
      if (sharedParent === nodeA) {
        return DocumentPosition2.PRECEDING | DocumentPosition2.CONTAINS;
      }
      return DocumentPosition2.PRECEDING;
    }
    exports.compareDocumentPosition = compareDocumentPosition2;
    function uniqueSort2(nodes) {
      nodes = nodes.filter(function(node, i, arr) {
        return !arr.includes(node, i + 1);
      });
      nodes.sort(function(a, b) {
        var relative = compareDocumentPosition2(a, b);
        if (relative & DocumentPosition2.PRECEDING) {
          return -1;
        } else if (relative & DocumentPosition2.FOLLOWING) {
          return 1;
        }
        return 0;
      });
      return nodes;
    }
    exports.uniqueSort = uniqueSort2;
  }
});

// node_modules/domutils/lib/feeds.js
var require_feeds = __commonJS({
  "node_modules/domutils/lib/feeds.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFeed = void 0;
    var stringify_js_1 = require_stringify2();
    var legacy_js_1 = require_legacy();
    function getFeed2(doc) {
      var feedRoot = getOneElement2(isValidFeed2, doc);
      return !feedRoot ? null : feedRoot.name === "feed" ? getAtomFeed2(feedRoot) : getRssFeed2(feedRoot);
    }
    exports.getFeed = getFeed2;
    function getAtomFeed2(feedRoot) {
      var _a2;
      var childs = feedRoot.children;
      var feed = {
        type: "atom",
        items: (0, legacy_js_1.getElementsByTagName)("entry", childs).map(function(item) {
          var _a3;
          var children = item.children;
          var entry = { media: getMediaElements2(children) };
          addConditionally2(entry, "id", "id", children);
          addConditionally2(entry, "title", "title", children);
          var href2 = (_a3 = getOneElement2("link", children)) === null || _a3 === void 0 ? void 0 : _a3.attribs["href"];
          if (href2) {
            entry.link = href2;
          }
          var description = fetch2("summary", children) || fetch2("content", children);
          if (description) {
            entry.description = description;
          }
          var pubDate = fetch2("updated", children);
          if (pubDate) {
            entry.pubDate = new Date(pubDate);
          }
          return entry;
        })
      };
      addConditionally2(feed, "id", "id", childs);
      addConditionally2(feed, "title", "title", childs);
      var href = (_a2 = getOneElement2("link", childs)) === null || _a2 === void 0 ? void 0 : _a2.attribs["href"];
      if (href) {
        feed.link = href;
      }
      addConditionally2(feed, "description", "subtitle", childs);
      var updated = fetch2("updated", childs);
      if (updated) {
        feed.updated = new Date(updated);
      }
      addConditionally2(feed, "author", "email", childs, true);
      return feed;
    }
    function getRssFeed2(feedRoot) {
      var _a2, _b;
      var childs = (_b = (_a2 = getOneElement2("channel", feedRoot.children)) === null || _a2 === void 0 ? void 0 : _a2.children) !== null && _b !== void 0 ? _b : [];
      var feed = {
        type: feedRoot.name.substr(0, 3),
        id: "",
        items: (0, legacy_js_1.getElementsByTagName)("item", feedRoot.children).map(function(item) {
          var children = item.children;
          var entry = { media: getMediaElements2(children) };
          addConditionally2(entry, "id", "guid", children);
          addConditionally2(entry, "title", "title", children);
          addConditionally2(entry, "link", "link", children);
          addConditionally2(entry, "description", "description", children);
          var pubDate = fetch2("pubDate", children) || fetch2("dc:date", children);
          if (pubDate)
            entry.pubDate = new Date(pubDate);
          return entry;
        })
      };
      addConditionally2(feed, "title", "title", childs);
      addConditionally2(feed, "link", "link", childs);
      addConditionally2(feed, "description", "description", childs);
      var updated = fetch2("lastBuildDate", childs);
      if (updated) {
        feed.updated = new Date(updated);
      }
      addConditionally2(feed, "author", "managingEditor", childs, true);
      return feed;
    }
    var MEDIA_KEYS_STRING2 = ["url", "type", "lang"];
    var MEDIA_KEYS_INT2 = [
      "fileSize",
      "bitrate",
      "framerate",
      "samplingrate",
      "channels",
      "duration",
      "height",
      "width"
    ];
    function getMediaElements2(where) {
      return (0, legacy_js_1.getElementsByTagName)("media:content", where).map(function(elem) {
        var attribs = elem.attribs;
        var media = {
          medium: attribs["medium"],
          isDefault: !!attribs["isDefault"]
        };
        for (var _i = 0, MEDIA_KEYS_STRING_1 = MEDIA_KEYS_STRING2; _i < MEDIA_KEYS_STRING_1.length; _i++) {
          var attrib = MEDIA_KEYS_STRING_1[_i];
          if (attribs[attrib]) {
            media[attrib] = attribs[attrib];
          }
        }
        for (var _a2 = 0, MEDIA_KEYS_INT_1 = MEDIA_KEYS_INT2; _a2 < MEDIA_KEYS_INT_1.length; _a2++) {
          var attrib = MEDIA_KEYS_INT_1[_a2];
          if (attribs[attrib]) {
            media[attrib] = parseInt(attribs[attrib], 10);
          }
        }
        if (attribs["expression"]) {
          media.expression = attribs["expression"];
        }
        return media;
      });
    }
    function getOneElement2(tagName18, node) {
      return (0, legacy_js_1.getElementsByTagName)(tagName18, node, true, 1)[0];
    }
    function fetch2(tagName18, where, recurse) {
      if (recurse === void 0) {
        recurse = false;
      }
      return (0, stringify_js_1.textContent)((0, legacy_js_1.getElementsByTagName)(tagName18, where, recurse, 1)).trim();
    }
    function addConditionally2(obj, prop2, tagName18, where, recurse) {
      if (recurse === void 0) {
        recurse = false;
      }
      var val = fetch2(tagName18, where, recurse);
      if (val)
        obj[prop2] = val;
    }
    function isValidFeed2(value) {
      return value === "rss" || value === "feed" || value === "rdf:RDF";
    }
  }
});

// node_modules/domutils/lib/index.js
var require_lib6 = __commonJS({
  "node_modules/domutils/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasChildren = exports.isDocument = exports.isComment = exports.isText = exports.isCDATA = exports.isTag = void 0;
    __exportStar(require_stringify2(), exports);
    __exportStar(require_traversal(), exports);
    __exportStar(require_manipulation(), exports);
    __exportStar(require_querying(), exports);
    __exportStar(require_legacy(), exports);
    __exportStar(require_helpers(), exports);
    __exportStar(require_feeds(), exports);
    var domhandler_1 = require_lib3();
    Object.defineProperty(exports, "isTag", { enumerable: true, get: function() {
      return domhandler_1.isTag;
    } });
    Object.defineProperty(exports, "isCDATA", { enumerable: true, get: function() {
      return domhandler_1.isCDATA;
    } });
    Object.defineProperty(exports, "isText", { enumerable: true, get: function() {
      return domhandler_1.isText;
    } });
    Object.defineProperty(exports, "isComment", { enumerable: true, get: function() {
      return domhandler_1.isComment;
    } });
    Object.defineProperty(exports, "isDocument", { enumerable: true, get: function() {
      return domhandler_1.isDocument;
    } });
    Object.defineProperty(exports, "hasChildren", { enumerable: true, get: function() {
      return domhandler_1.hasChildren;
    } });
  }
});

// node_modules/css-select/lib/sort.js
var require_sort = __commonJS({
  "node_modules/css-select/lib/sort.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isTraversal = void 0;
    var css_what_1 = require_commonjs();
    var procedure2 = /* @__PURE__ */ new Map([
      [css_what_1.SelectorType.Universal, 50],
      [css_what_1.SelectorType.Tag, 30],
      [css_what_1.SelectorType.Attribute, 1],
      [css_what_1.SelectorType.Pseudo, 0]
    ]);
    function isTraversal2(token) {
      return !procedure2.has(token.type);
    }
    exports.isTraversal = isTraversal2;
    var attributes2 = /* @__PURE__ */ new Map([
      [css_what_1.AttributeAction.Exists, 10],
      [css_what_1.AttributeAction.Equals, 8],
      [css_what_1.AttributeAction.Not, 7],
      [css_what_1.AttributeAction.Start, 6],
      [css_what_1.AttributeAction.End, 6],
      [css_what_1.AttributeAction.Any, 5]
    ]);
    function sortByProcedure2(arr) {
      var procs = arr.map(getProcedure2);
      for (var i = 1; i < arr.length; i++) {
        var procNew = procs[i];
        if (procNew < 0)
          continue;
        for (var j = i - 1; j >= 0 && procNew < procs[j]; j--) {
          var token = arr[j + 1];
          arr[j + 1] = arr[j];
          arr[j] = token;
          procs[j + 1] = procs[j];
          procs[j] = procNew;
        }
      }
    }
    exports.default = sortByProcedure2;
    function getProcedure2(token) {
      var _a2, _b;
      var proc = (_a2 = procedure2.get(token.type)) !== null && _a2 !== void 0 ? _a2 : -1;
      if (token.type === css_what_1.SelectorType.Attribute) {
        proc = (_b = attributes2.get(token.action)) !== null && _b !== void 0 ? _b : 4;
        if (token.action === css_what_1.AttributeAction.Equals && token.name === "id") {
          proc = 9;
        }
        if (token.ignoreCase) {
          proc >>= 1;
        }
      } else if (token.type === css_what_1.SelectorType.Pseudo) {
        if (!token.data) {
          proc = 3;
        } else if (token.name === "has" || token.name === "contains") {
          proc = 0;
        } else if (Array.isArray(token.data)) {
          proc = Math.min.apply(Math, token.data.map(function(d) {
            return Math.min.apply(Math, d.map(getProcedure2));
          }));
          if (proc < 0) {
            proc = 0;
          }
        } else {
          proc = 2;
        }
      }
      return proc;
    }
  }
});

// node_modules/css-select/lib/attributes.js
var require_attributes = __commonJS({
  "node_modules/css-select/lib/attributes.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.attributeRules = void 0;
    var boolbase_1 = __importDefault(require_boolbase());
    var reChars2 = /[-[\]{}()*+?.,\\^$|#\s]/g;
    function escapeRegex2(value) {
      return value.replace(reChars2, "\\$&");
    }
    var caseInsensitiveAttributes2 = /* @__PURE__ */ new Set([
      "accept",
      "accept-charset",
      "align",
      "alink",
      "axis",
      "bgcolor",
      "charset",
      "checked",
      "clear",
      "codetype",
      "color",
      "compact",
      "declare",
      "defer",
      "dir",
      "direction",
      "disabled",
      "enctype",
      "face",
      "frame",
      "hreflang",
      "http-equiv",
      "lang",
      "language",
      "link",
      "media",
      "method",
      "multiple",
      "nohref",
      "noresize",
      "noshade",
      "nowrap",
      "readonly",
      "rel",
      "rev",
      "rules",
      "scope",
      "scrolling",
      "selected",
      "shape",
      "target",
      "text",
      "type",
      "valign",
      "valuetype",
      "vlink"
    ]);
    function shouldIgnoreCase2(selector, options) {
      return typeof selector.ignoreCase === "boolean" ? selector.ignoreCase : selector.ignoreCase === "quirks" ? !!options.quirksMode : !options.xmlMode && caseInsensitiveAttributes2.has(selector.name);
    }
    exports.attributeRules = {
      equals: function(next, data, options) {
        var adapter2 = options.adapter;
        var name = data.name;
        var value = data.value;
        if (shouldIgnoreCase2(data, options)) {
          value = value.toLowerCase();
          return function(elem) {
            var attr = adapter2.getAttributeValue(elem, name);
            return attr != null && attr.length === value.length && attr.toLowerCase() === value && next(elem);
          };
        }
        return function(elem) {
          return adapter2.getAttributeValue(elem, name) === value && next(elem);
        };
      },
      hyphen: function(next, data, options) {
        var adapter2 = options.adapter;
        var name = data.name;
        var value = data.value;
        var len = value.length;
        if (shouldIgnoreCase2(data, options)) {
          value = value.toLowerCase();
          return function hyphenIC(elem) {
            var attr = adapter2.getAttributeValue(elem, name);
            return attr != null && (attr.length === len || attr.charAt(len) === "-") && attr.substr(0, len).toLowerCase() === value && next(elem);
          };
        }
        return function hyphen(elem) {
          var attr = adapter2.getAttributeValue(elem, name);
          return attr != null && (attr.length === len || attr.charAt(len) === "-") && attr.substr(0, len) === value && next(elem);
        };
      },
      element: function(next, data, options) {
        var adapter2 = options.adapter;
        var name = data.name, value = data.value;
        if (/\s/.test(value)) {
          return boolbase_1.default.falseFunc;
        }
        var regex = new RegExp("(?:^|\\s)".concat(escapeRegex2(value), "(?:$|\\s)"), shouldIgnoreCase2(data, options) ? "i" : "");
        return function element(elem) {
          var attr = adapter2.getAttributeValue(elem, name);
          return attr != null && attr.length >= value.length && regex.test(attr) && next(elem);
        };
      },
      exists: function(next, _a2, _b) {
        var name = _a2.name;
        var adapter2 = _b.adapter;
        return function(elem) {
          return adapter2.hasAttrib(elem, name) && next(elem);
        };
      },
      start: function(next, data, options) {
        var adapter2 = options.adapter;
        var name = data.name;
        var value = data.value;
        var len = value.length;
        if (len === 0) {
          return boolbase_1.default.falseFunc;
        }
        if (shouldIgnoreCase2(data, options)) {
          value = value.toLowerCase();
          return function(elem) {
            var attr = adapter2.getAttributeValue(elem, name);
            return attr != null && attr.length >= len && attr.substr(0, len).toLowerCase() === value && next(elem);
          };
        }
        return function(elem) {
          var _a2;
          return !!((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.startsWith(value)) && next(elem);
        };
      },
      end: function(next, data, options) {
        var adapter2 = options.adapter;
        var name = data.name;
        var value = data.value;
        var len = -value.length;
        if (len === 0) {
          return boolbase_1.default.falseFunc;
        }
        if (shouldIgnoreCase2(data, options)) {
          value = value.toLowerCase();
          return function(elem) {
            var _a2;
            return ((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.substr(len).toLowerCase()) === value && next(elem);
          };
        }
        return function(elem) {
          var _a2;
          return !!((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.endsWith(value)) && next(elem);
        };
      },
      any: function(next, data, options) {
        var adapter2 = options.adapter;
        var name = data.name, value = data.value;
        if (value === "") {
          return boolbase_1.default.falseFunc;
        }
        if (shouldIgnoreCase2(data, options)) {
          var regex_1 = new RegExp(escapeRegex2(value), "i");
          return function anyIC(elem) {
            var attr = adapter2.getAttributeValue(elem, name);
            return attr != null && attr.length >= value.length && regex_1.test(attr) && next(elem);
          };
        }
        return function(elem) {
          var _a2;
          return !!((_a2 = adapter2.getAttributeValue(elem, name)) === null || _a2 === void 0 ? void 0 : _a2.includes(value)) && next(elem);
        };
      },
      not: function(next, data, options) {
        var adapter2 = options.adapter;
        var name = data.name;
        var value = data.value;
        if (value === "") {
          return function(elem) {
            return !!adapter2.getAttributeValue(elem, name) && next(elem);
          };
        } else if (shouldIgnoreCase2(data, options)) {
          value = value.toLowerCase();
          return function(elem) {
            var attr = adapter2.getAttributeValue(elem, name);
            return (attr == null || attr.length !== value.length || attr.toLowerCase() !== value) && next(elem);
          };
        }
        return function(elem) {
          return adapter2.getAttributeValue(elem, name) !== value && next(elem);
        };
      }
    };
  }
});

// node_modules/nth-check/lib/parse.js
var require_parse3 = __commonJS({
  "node_modules/nth-check/lib/parse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = void 0;
    var whitespace2 = /* @__PURE__ */ new Set([9, 10, 12, 13, 32]);
    var ZERO2 = "0".charCodeAt(0);
    var NINE2 = "9".charCodeAt(0);
    function parse6(formula) {
      formula = formula.trim().toLowerCase();
      if (formula === "even") {
        return [2, 0];
      } else if (formula === "odd") {
        return [2, 1];
      }
      var idx = 0;
      var a = 0;
      var sign = readSign();
      var number = readNumber();
      if (idx < formula.length && formula.charAt(idx) === "n") {
        idx++;
        a = sign * (number !== null && number !== void 0 ? number : 1);
        skipWhitespace();
        if (idx < formula.length) {
          sign = readSign();
          skipWhitespace();
          number = readNumber();
        } else {
          sign = number = 0;
        }
      }
      if (number === null || idx < formula.length) {
        throw new Error("n-th rule couldn't be parsed ('".concat(formula, "')"));
      }
      return [a, sign * number];
      function readSign() {
        if (formula.charAt(idx) === "-") {
          idx++;
          return -1;
        }
        if (formula.charAt(idx) === "+") {
          idx++;
        }
        return 1;
      }
      function readNumber() {
        var start = idx;
        var value = 0;
        while (idx < formula.length && formula.charCodeAt(idx) >= ZERO2 && formula.charCodeAt(idx) <= NINE2) {
          value = value * 10 + (formula.charCodeAt(idx) - ZERO2);
          idx++;
        }
        return idx === start ? null : value;
      }
      function skipWhitespace() {
        while (idx < formula.length && whitespace2.has(formula.charCodeAt(idx))) {
          idx++;
        }
      }
    }
    exports.parse = parse6;
  }
});

// node_modules/nth-check/lib/compile.js
var require_compile = __commonJS({
  "node_modules/nth-check/lib/compile.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generate = exports.compile = void 0;
    var boolbase_1 = __importDefault(require_boolbase());
    function compile4(parsed) {
      var a = parsed[0];
      var b = parsed[1] - 1;
      if (b < 0 && a <= 0)
        return boolbase_1.default.falseFunc;
      if (a === -1)
        return function(index) {
          return index <= b;
        };
      if (a === 0)
        return function(index) {
          return index === b;
        };
      if (a === 1)
        return b < 0 ? boolbase_1.default.trueFunc : function(index) {
          return index >= b;
        };
      var absA = Math.abs(a);
      var bMod = (b % absA + absA) % absA;
      return a > 1 ? function(index) {
        return index >= b && index % absA === bMod;
      } : function(index) {
        return index <= b && index % absA === bMod;
      };
    }
    exports.compile = compile4;
    function generate2(parsed) {
      var a = parsed[0];
      var b = parsed[1] - 1;
      var n = 0;
      if (a < 0) {
        var aPos_1 = -a;
        var minValue_1 = (b % aPos_1 + aPos_1) % aPos_1;
        return function() {
          var val = minValue_1 + aPos_1 * n++;
          return val > b ? null : val;
        };
      }
      if (a === 0)
        return b < 0 ? (
          // There are no result — always return `null`
          function() {
            return null;
          }
        ) : (
          // Return `b` exactly once
          function() {
            return n++ === 0 ? b : null;
          }
        );
      if (b < 0) {
        b += a * Math.ceil(-b / a);
      }
      return function() {
        return a * n++ + b;
      };
    }
    exports.generate = generate2;
  }
});

// node_modules/nth-check/lib/index.js
var require_lib7 = __commonJS({
  "node_modules/nth-check/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sequence = exports.generate = exports.compile = exports.parse = void 0;
    var parse_js_1 = require_parse3();
    Object.defineProperty(exports, "parse", { enumerable: true, get: function() {
      return parse_js_1.parse;
    } });
    var compile_js_1 = require_compile();
    Object.defineProperty(exports, "compile", { enumerable: true, get: function() {
      return compile_js_1.compile;
    } });
    Object.defineProperty(exports, "generate", { enumerable: true, get: function() {
      return compile_js_1.generate;
    } });
    function nthCheck2(formula) {
      return (0, compile_js_1.compile)((0, parse_js_1.parse)(formula));
    }
    exports.default = nthCheck2;
    function sequence(formula) {
      return (0, compile_js_1.generate)((0, parse_js_1.parse)(formula));
    }
    exports.sequence = sequence;
  }
});

// node_modules/css-select/lib/pseudo-selectors/filters.js
var require_filters = __commonJS({
  "node_modules/css-select/lib/pseudo-selectors/filters.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.filters = void 0;
    var nth_check_1 = __importDefault(require_lib7());
    var boolbase_1 = __importDefault(require_boolbase());
    function getChildFunc2(next, adapter2) {
      return function(elem) {
        var parent = adapter2.getParent(elem);
        return parent != null && adapter2.isTag(parent) && next(elem);
      };
    }
    exports.filters = {
      contains: function(next, text, _a2) {
        var adapter2 = _a2.adapter;
        return function contains(elem) {
          return next(elem) && adapter2.getText(elem).includes(text);
        };
      },
      icontains: function(next, text, _a2) {
        var adapter2 = _a2.adapter;
        var itext = text.toLowerCase();
        return function icontains(elem) {
          return next(elem) && adapter2.getText(elem).toLowerCase().includes(itext);
        };
      },
      // Location specific methods
      "nth-child": function(next, rule, _a2) {
        var adapter2 = _a2.adapter, equals = _a2.equals;
        var func = (0, nth_check_1.default)(rule);
        if (func === boolbase_1.default.falseFunc)
          return boolbase_1.default.falseFunc;
        if (func === boolbase_1.default.trueFunc)
          return getChildFunc2(next, adapter2);
        return function nthChild(elem) {
          var siblings = adapter2.getSiblings(elem);
          var pos = 0;
          for (var i = 0; i < siblings.length; i++) {
            if (equals(elem, siblings[i]))
              break;
            if (adapter2.isTag(siblings[i])) {
              pos++;
            }
          }
          return func(pos) && next(elem);
        };
      },
      "nth-last-child": function(next, rule, _a2) {
        var adapter2 = _a2.adapter, equals = _a2.equals;
        var func = (0, nth_check_1.default)(rule);
        if (func === boolbase_1.default.falseFunc)
          return boolbase_1.default.falseFunc;
        if (func === boolbase_1.default.trueFunc)
          return getChildFunc2(next, adapter2);
        return function nthLastChild(elem) {
          var siblings = adapter2.getSiblings(elem);
          var pos = 0;
          for (var i = siblings.length - 1; i >= 0; i--) {
            if (equals(elem, siblings[i]))
              break;
            if (adapter2.isTag(siblings[i])) {
              pos++;
            }
          }
          return func(pos) && next(elem);
        };
      },
      "nth-of-type": function(next, rule, _a2) {
        var adapter2 = _a2.adapter, equals = _a2.equals;
        var func = (0, nth_check_1.default)(rule);
        if (func === boolbase_1.default.falseFunc)
          return boolbase_1.default.falseFunc;
        if (func === boolbase_1.default.trueFunc)
          return getChildFunc2(next, adapter2);
        return function nthOfType(elem) {
          var siblings = adapter2.getSiblings(elem);
          var pos = 0;
          for (var i = 0; i < siblings.length; i++) {
            var currentSibling = siblings[i];
            if (equals(elem, currentSibling))
              break;
            if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === adapter2.getName(elem)) {
              pos++;
            }
          }
          return func(pos) && next(elem);
        };
      },
      "nth-last-of-type": function(next, rule, _a2) {
        var adapter2 = _a2.adapter, equals = _a2.equals;
        var func = (0, nth_check_1.default)(rule);
        if (func === boolbase_1.default.falseFunc)
          return boolbase_1.default.falseFunc;
        if (func === boolbase_1.default.trueFunc)
          return getChildFunc2(next, adapter2);
        return function nthLastOfType(elem) {
          var siblings = adapter2.getSiblings(elem);
          var pos = 0;
          for (var i = siblings.length - 1; i >= 0; i--) {
            var currentSibling = siblings[i];
            if (equals(elem, currentSibling))
              break;
            if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === adapter2.getName(elem)) {
              pos++;
            }
          }
          return func(pos) && next(elem);
        };
      },
      // TODO determine the actual root element
      root: function(next, _rule, _a2) {
        var adapter2 = _a2.adapter;
        return function(elem) {
          var parent = adapter2.getParent(elem);
          return (parent == null || !adapter2.isTag(parent)) && next(elem);
        };
      },
      scope: function(next, rule, options, context) {
        var equals = options.equals;
        if (!context || context.length === 0) {
          return exports.filters["root"](next, rule, options);
        }
        if (context.length === 1) {
          return function(elem) {
            return equals(context[0], elem) && next(elem);
          };
        }
        return function(elem) {
          return context.includes(elem) && next(elem);
        };
      },
      hover: dynamicStatePseudo2("isHovered"),
      visited: dynamicStatePseudo2("isVisited"),
      active: dynamicStatePseudo2("isActive")
    };
    function dynamicStatePseudo2(name) {
      return function dynamicPseudo(next, _rule, _a2) {
        var adapter2 = _a2.adapter;
        var func = adapter2[name];
        if (typeof func !== "function") {
          return boolbase_1.default.falseFunc;
        }
        return function active(elem) {
          return func(elem) && next(elem);
        };
      };
    }
  }
});

// node_modules/css-select/lib/pseudo-selectors/pseudos.js
var require_pseudos = __commonJS({
  "node_modules/css-select/lib/pseudo-selectors/pseudos.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.verifyPseudoArgs = exports.pseudos = void 0;
    exports.pseudos = {
      empty: function(elem, _a2) {
        var adapter2 = _a2.adapter;
        return !adapter2.getChildren(elem).some(function(elem2) {
          return adapter2.isTag(elem2) || adapter2.getText(elem2) !== "";
        });
      },
      "first-child": function(elem, _a2) {
        var adapter2 = _a2.adapter, equals = _a2.equals;
        if (adapter2.prevElementSibling) {
          return adapter2.prevElementSibling(elem) == null;
        }
        var firstChild = adapter2.getSiblings(elem).find(function(elem2) {
          return adapter2.isTag(elem2);
        });
        return firstChild != null && equals(elem, firstChild);
      },
      "last-child": function(elem, _a2) {
        var adapter2 = _a2.adapter, equals = _a2.equals;
        var siblings = adapter2.getSiblings(elem);
        for (var i = siblings.length - 1; i >= 0; i--) {
          if (equals(elem, siblings[i]))
            return true;
          if (adapter2.isTag(siblings[i]))
            break;
        }
        return false;
      },
      "first-of-type": function(elem, _a2) {
        var adapter2 = _a2.adapter, equals = _a2.equals;
        var siblings = adapter2.getSiblings(elem);
        var elemName = adapter2.getName(elem);
        for (var i = 0; i < siblings.length; i++) {
          var currentSibling = siblings[i];
          if (equals(elem, currentSibling))
            return true;
          if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === elemName) {
            break;
          }
        }
        return false;
      },
      "last-of-type": function(elem, _a2) {
        var adapter2 = _a2.adapter, equals = _a2.equals;
        var siblings = adapter2.getSiblings(elem);
        var elemName = adapter2.getName(elem);
        for (var i = siblings.length - 1; i >= 0; i--) {
          var currentSibling = siblings[i];
          if (equals(elem, currentSibling))
            return true;
          if (adapter2.isTag(currentSibling) && adapter2.getName(currentSibling) === elemName) {
            break;
          }
        }
        return false;
      },
      "only-of-type": function(elem, _a2) {
        var adapter2 = _a2.adapter, equals = _a2.equals;
        var elemName = adapter2.getName(elem);
        return adapter2.getSiblings(elem).every(function(sibling) {
          return equals(elem, sibling) || !adapter2.isTag(sibling) || adapter2.getName(sibling) !== elemName;
        });
      },
      "only-child": function(elem, _a2) {
        var adapter2 = _a2.adapter, equals = _a2.equals;
        return adapter2.getSiblings(elem).every(function(sibling) {
          return equals(elem, sibling) || !adapter2.isTag(sibling);
        });
      }
    };
    function verifyPseudoArgs2(func, name, subselect, argIndex) {
      if (subselect === null) {
        if (func.length > argIndex) {
          throw new Error("Pseudo-class :".concat(name, " requires an argument"));
        }
      } else if (func.length === argIndex) {
        throw new Error("Pseudo-class :".concat(name, " doesn't have any arguments"));
      }
    }
    exports.verifyPseudoArgs = verifyPseudoArgs2;
  }
});

// node_modules/css-select/lib/pseudo-selectors/aliases.js
var require_aliases = __commonJS({
  "node_modules/css-select/lib/pseudo-selectors/aliases.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.aliases = void 0;
    exports.aliases = {
      // Links
      "any-link": ":is(a, area, link)[href]",
      link: ":any-link:not(:visited)",
      // Forms
      // https://html.spec.whatwg.org/multipage/scripting.html#disabled-elements
      disabled: ":is(\n        :is(button, input, select, textarea, optgroup, option)[disabled],\n        optgroup[disabled] > option,\n        fieldset[disabled]:not(fieldset[disabled] legend:first-of-type *)\n    )",
      enabled: ":not(:disabled)",
      checked: ":is(:is(input[type=radio], input[type=checkbox])[checked], option:selected)",
      required: ":is(input, select, textarea)[required]",
      optional: ":is(input, select, textarea):not([required])",
      // JQuery extensions
      // https://html.spec.whatwg.org/multipage/form-elements.html#concept-option-selectedness
      selected: "option:is([selected], select:not([multiple]):not(:has(> option[selected])) > :first-of-type)",
      checkbox: "[type=checkbox]",
      file: "[type=file]",
      password: "[type=password]",
      radio: "[type=radio]",
      reset: "[type=reset]",
      image: "[type=image]",
      submit: "[type=submit]",
      parent: ":not(:empty)",
      header: ":is(h1, h2, h3, h4, h5, h6)",
      button: ":is(button, input[type=button])",
      input: ":is(input, textarea, select, button)",
      text: "input:is(:not([type!='']), [type=text])"
    };
  }
});

// node_modules/css-select/lib/pseudo-selectors/subselects.js
var require_subselects = __commonJS({
  "node_modules/css-select/lib/pseudo-selectors/subselects.js"(exports) {
    "use strict";
    var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.subselects = exports.getNextSiblings = exports.ensureIsTag = exports.PLACEHOLDER_ELEMENT = void 0;
    var boolbase_1 = __importDefault(require_boolbase());
    var sort_js_1 = require_sort();
    exports.PLACEHOLDER_ELEMENT = {};
    function ensureIsTag2(next, adapter2) {
      if (next === boolbase_1.default.falseFunc)
        return boolbase_1.default.falseFunc;
      return function(elem) {
        return adapter2.isTag(elem) && next(elem);
      };
    }
    exports.ensureIsTag = ensureIsTag2;
    function getNextSiblings2(elem, adapter2) {
      var siblings = adapter2.getSiblings(elem);
      if (siblings.length <= 1)
        return [];
      var elemIndex = siblings.indexOf(elem);
      if (elemIndex < 0 || elemIndex === siblings.length - 1)
        return [];
      return siblings.slice(elemIndex + 1).filter(adapter2.isTag);
    }
    exports.getNextSiblings = getNextSiblings2;
    function copyOptions2(options) {
      return {
        xmlMode: !!options.xmlMode,
        lowerCaseAttributeNames: !!options.lowerCaseAttributeNames,
        lowerCaseTags: !!options.lowerCaseTags,
        quirksMode: !!options.quirksMode,
        cacheResults: !!options.cacheResults,
        pseudos: options.pseudos,
        adapter: options.adapter,
        equals: options.equals
      };
    }
    var is3 = function(next, token, options, context, compileToken2) {
      var func = compileToken2(token, copyOptions2(options), context);
      return func === boolbase_1.default.trueFunc ? next : func === boolbase_1.default.falseFunc ? boolbase_1.default.falseFunc : function(elem) {
        return func(elem) && next(elem);
      };
    };
    exports.subselects = {
      is: is3,
      /**
       * `:matches` and `:where` are aliases for `:is`.
       */
      matches: is3,
      where: is3,
      not: function(next, token, options, context, compileToken2) {
        var func = compileToken2(token, copyOptions2(options), context);
        return func === boolbase_1.default.falseFunc ? next : func === boolbase_1.default.trueFunc ? boolbase_1.default.falseFunc : function(elem) {
          return !func(elem) && next(elem);
        };
      },
      has: function(next, subselect, options, _context, compileToken2) {
        var adapter2 = options.adapter;
        var opts = copyOptions2(options);
        opts.relativeSelector = true;
        var context = subselect.some(function(s) {
          return s.some(sort_js_1.isTraversal);
        }) ? (
          // Used as a placeholder. Will be replaced with the actual element.
          [exports.PLACEHOLDER_ELEMENT]
        ) : void 0;
        var compiled = compileToken2(subselect, opts, context);
        if (compiled === boolbase_1.default.falseFunc)
          return boolbase_1.default.falseFunc;
        var hasElement = ensureIsTag2(compiled, adapter2);
        if (context && compiled !== boolbase_1.default.trueFunc) {
          var _a2 = compiled.shouldTestNextSiblings, shouldTestNextSiblings_1 = _a2 === void 0 ? false : _a2;
          return function(elem) {
            if (!next(elem))
              return false;
            context[0] = elem;
            var childs = adapter2.getChildren(elem);
            var nextElements = shouldTestNextSiblings_1 ? __spreadArray(__spreadArray([], childs, true), getNextSiblings2(elem, adapter2), true) : childs;
            return adapter2.existsOne(hasElement, nextElements);
          };
        }
        return function(elem) {
          return next(elem) && adapter2.existsOne(hasElement, adapter2.getChildren(elem));
        };
      }
    };
  }
});

// node_modules/css-select/lib/pseudo-selectors/index.js
var require_pseudo_selectors = __commonJS({
  "node_modules/css-select/lib/pseudo-selectors/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compilePseudoSelector = exports.aliases = exports.pseudos = exports.filters = void 0;
    var css_what_1 = require_commonjs();
    var filters_js_1 = require_filters();
    Object.defineProperty(exports, "filters", { enumerable: true, get: function() {
      return filters_js_1.filters;
    } });
    var pseudos_js_1 = require_pseudos();
    Object.defineProperty(exports, "pseudos", { enumerable: true, get: function() {
      return pseudos_js_1.pseudos;
    } });
    var aliases_js_1 = require_aliases();
    Object.defineProperty(exports, "aliases", { enumerable: true, get: function() {
      return aliases_js_1.aliases;
    } });
    var subselects_js_1 = require_subselects();
    function compilePseudoSelector2(next, selector, options, context, compileToken2) {
      var _a2;
      var name = selector.name, data = selector.data;
      if (Array.isArray(data)) {
        if (!(name in subselects_js_1.subselects)) {
          throw new Error("Unknown pseudo-class :".concat(name, "(").concat(data, ")"));
        }
        return subselects_js_1.subselects[name](next, data, options, context, compileToken2);
      }
      var userPseudo = (_a2 = options.pseudos) === null || _a2 === void 0 ? void 0 : _a2[name];
      var stringPseudo = typeof userPseudo === "string" ? userPseudo : aliases_js_1.aliases[name];
      if (typeof stringPseudo === "string") {
        if (data != null) {
          throw new Error("Pseudo ".concat(name, " doesn't have any arguments"));
        }
        var alias = (0, css_what_1.parse)(stringPseudo);
        return subselects_js_1.subselects["is"](next, alias, options, context, compileToken2);
      }
      if (typeof userPseudo === "function") {
        (0, pseudos_js_1.verifyPseudoArgs)(userPseudo, name, data, 1);
        return function(elem) {
          return userPseudo(elem, data) && next(elem);
        };
      }
      if (name in filters_js_1.filters) {
        return filters_js_1.filters[name](next, data, options, context);
      }
      if (name in pseudos_js_1.pseudos) {
        var pseudo_1 = pseudos_js_1.pseudos[name];
        (0, pseudos_js_1.verifyPseudoArgs)(pseudo_1, name, data, 2);
        return function(elem) {
          return pseudo_1(elem, options, data) && next(elem);
        };
      }
      throw new Error("Unknown pseudo-class :".concat(name));
    }
    exports.compilePseudoSelector = compilePseudoSelector2;
  }
});

// node_modules/css-select/lib/general.js
var require_general = __commonJS({
  "node_modules/css-select/lib/general.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compileGeneralSelector = void 0;
    var attributes_js_1 = require_attributes();
    var index_js_1 = require_pseudo_selectors();
    var css_what_1 = require_commonjs();
    function getElementParent2(node, adapter2) {
      var parent = adapter2.getParent(node);
      if (parent && adapter2.isTag(parent)) {
        return parent;
      }
      return null;
    }
    function compileGeneralSelector2(next, selector, options, context, compileToken2) {
      var adapter2 = options.adapter, equals = options.equals;
      switch (selector.type) {
        case css_what_1.SelectorType.PseudoElement: {
          throw new Error("Pseudo-elements are not supported by css-select");
        }
        case css_what_1.SelectorType.ColumnCombinator: {
          throw new Error("Column combinators are not yet supported by css-select");
        }
        case css_what_1.SelectorType.Attribute: {
          if (selector.namespace != null) {
            throw new Error("Namespaced attributes are not yet supported by css-select");
          }
          if (!options.xmlMode || options.lowerCaseAttributeNames) {
            selector.name = selector.name.toLowerCase();
          }
          return attributes_js_1.attributeRules[selector.action](next, selector, options);
        }
        case css_what_1.SelectorType.Pseudo: {
          return (0, index_js_1.compilePseudoSelector)(next, selector, options, context, compileToken2);
        }
        case css_what_1.SelectorType.Tag: {
          if (selector.namespace != null) {
            throw new Error("Namespaced tag names are not yet supported by css-select");
          }
          var name_1 = selector.name;
          if (!options.xmlMode || options.lowerCaseTags) {
            name_1 = name_1.toLowerCase();
          }
          return function tag(elem) {
            return adapter2.getName(elem) === name_1 && next(elem);
          };
        }
        case css_what_1.SelectorType.Descendant: {
          if (options.cacheResults === false || typeof WeakSet === "undefined") {
            return function descendant(elem) {
              var current = elem;
              while (current = getElementParent2(current, adapter2)) {
                if (next(current)) {
                  return true;
                }
              }
              return false;
            };
          }
          var isFalseCache_1 = /* @__PURE__ */ new WeakSet();
          return function cachedDescendant(elem) {
            var current = elem;
            while (current = getElementParent2(current, adapter2)) {
              if (!isFalseCache_1.has(current)) {
                if (adapter2.isTag(current) && next(current)) {
                  return true;
                }
                isFalseCache_1.add(current);
              }
            }
            return false;
          };
        }
        case "_flexibleDescendant": {
          return function flexibleDescendant(elem) {
            var current = elem;
            do {
              if (next(current))
                return true;
            } while (current = getElementParent2(current, adapter2));
            return false;
          };
        }
        case css_what_1.SelectorType.Parent: {
          return function parent(elem) {
            return adapter2.getChildren(elem).some(function(elem2) {
              return adapter2.isTag(elem2) && next(elem2);
            });
          };
        }
        case css_what_1.SelectorType.Child: {
          return function child(elem) {
            var parent = adapter2.getParent(elem);
            return parent != null && adapter2.isTag(parent) && next(parent);
          };
        }
        case css_what_1.SelectorType.Sibling: {
          return function sibling(elem) {
            var siblings = adapter2.getSiblings(elem);
            for (var i = 0; i < siblings.length; i++) {
              var currentSibling = siblings[i];
              if (equals(elem, currentSibling))
                break;
              if (adapter2.isTag(currentSibling) && next(currentSibling)) {
                return true;
              }
            }
            return false;
          };
        }
        case css_what_1.SelectorType.Adjacent: {
          if (adapter2.prevElementSibling) {
            return function adjacent(elem) {
              var previous = adapter2.prevElementSibling(elem);
              return previous != null && next(previous);
            };
          }
          return function adjacent(elem) {
            var siblings = adapter2.getSiblings(elem);
            var lastElement;
            for (var i = 0; i < siblings.length; i++) {
              var currentSibling = siblings[i];
              if (equals(elem, currentSibling))
                break;
              if (adapter2.isTag(currentSibling)) {
                lastElement = currentSibling;
              }
            }
            return !!lastElement && next(lastElement);
          };
        }
        case css_what_1.SelectorType.Universal: {
          if (selector.namespace != null && selector.namespace !== "*") {
            throw new Error("Namespaced universal selectors are not yet supported by css-select");
          }
          return next;
        }
      }
    }
    exports.compileGeneralSelector = compileGeneralSelector2;
  }
});

// node_modules/css-select/lib/compile.js
var require_compile2 = __commonJS({
  "node_modules/css-select/lib/compile.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compileToken = exports.compileUnsafe = exports.compile = void 0;
    var css_what_1 = require_commonjs();
    var boolbase_1 = __importDefault(require_boolbase());
    var sort_js_1 = __importStar(require_sort());
    var general_js_1 = require_general();
    var subselects_js_1 = require_subselects();
    function compile4(selector, options, context) {
      var next = compileUnsafe2(selector, options, context);
      return (0, subselects_js_1.ensureIsTag)(next, options.adapter);
    }
    exports.compile = compile4;
    function compileUnsafe2(selector, options, context) {
      var token = typeof selector === "string" ? (0, css_what_1.parse)(selector) : selector;
      return compileToken2(token, options, context);
    }
    exports.compileUnsafe = compileUnsafe2;
    function includesScopePseudo2(t) {
      return t.type === css_what_1.SelectorType.Pseudo && (t.name === "scope" || Array.isArray(t.data) && t.data.some(function(data) {
        return data.some(includesScopePseudo2);
      }));
    }
    var DESCENDANT_TOKEN2 = { type: css_what_1.SelectorType.Descendant };
    var FLEXIBLE_DESCENDANT_TOKEN2 = {
      type: "_flexibleDescendant"
    };
    var SCOPE_TOKEN2 = {
      type: css_what_1.SelectorType.Pseudo,
      name: "scope",
      data: null
    };
    function absolutize2(token, _a2, context) {
      var adapter2 = _a2.adapter;
      var hasContext = !!(context === null || context === void 0 ? void 0 : context.every(function(e) {
        var parent = adapter2.isTag(e) && adapter2.getParent(e);
        return e === subselects_js_1.PLACEHOLDER_ELEMENT || parent && adapter2.isTag(parent);
      }));
      for (var _i = 0, token_1 = token; _i < token_1.length; _i++) {
        var t = token_1[_i];
        if (t.length > 0 && (0, sort_js_1.isTraversal)(t[0]) && t[0].type !== css_what_1.SelectorType.Descendant) {
        } else if (hasContext && !t.some(includesScopePseudo2)) {
          t.unshift(DESCENDANT_TOKEN2);
        } else {
          continue;
        }
        t.unshift(SCOPE_TOKEN2);
      }
    }
    function compileToken2(token, options, context) {
      var _a2;
      token.forEach(sort_js_1.default);
      context = (_a2 = options.context) !== null && _a2 !== void 0 ? _a2 : context;
      var isArrayContext = Array.isArray(context);
      var finalContext = context && (Array.isArray(context) ? context : [context]);
      if (options.relativeSelector !== false) {
        absolutize2(token, options, finalContext);
      } else if (token.some(function(t) {
        return t.length > 0 && (0, sort_js_1.isTraversal)(t[0]);
      })) {
        throw new Error("Relative selectors are not allowed when the `relativeSelector` option is disabled");
      }
      var shouldTestNextSiblings = false;
      var query2 = token.map(function(rules) {
        if (rules.length >= 2) {
          var first = rules[0], second = rules[1];
          if (first.type !== css_what_1.SelectorType.Pseudo || first.name !== "scope") {
          } else if (isArrayContext && second.type === css_what_1.SelectorType.Descendant) {
            rules[1] = FLEXIBLE_DESCENDANT_TOKEN2;
          } else if (second.type === css_what_1.SelectorType.Adjacent || second.type === css_what_1.SelectorType.Sibling) {
            shouldTestNextSiblings = true;
          }
        }
        return compileRules2(rules, options, finalContext);
      }).reduce(reduceRules2, boolbase_1.default.falseFunc);
      query2.shouldTestNextSiblings = shouldTestNextSiblings;
      return query2;
    }
    exports.compileToken = compileToken2;
    function compileRules2(rules, options, context) {
      var _a2;
      return rules.reduce(function(previous, rule) {
        return previous === boolbase_1.default.falseFunc ? boolbase_1.default.falseFunc : (0, general_js_1.compileGeneralSelector)(previous, rule, options, context, compileToken2);
      }, (_a2 = options.rootFunc) !== null && _a2 !== void 0 ? _a2 : boolbase_1.default.trueFunc);
    }
    function reduceRules2(a, b) {
      if (b === boolbase_1.default.falseFunc || a === boolbase_1.default.trueFunc) {
        return a;
      }
      if (a === boolbase_1.default.falseFunc || b === boolbase_1.default.trueFunc) {
        return b;
      }
      return function combine(elem) {
        return a(elem) || b(elem);
      };
    }
  }
});

// node_modules/css-select/lib/index.js
var require_lib8 = __commonJS({
  "node_modules/css-select/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.aliases = exports.pseudos = exports.filters = exports.is = exports.selectOne = exports.selectAll = exports.prepareContext = exports._compileToken = exports._compileUnsafe = exports.compile = void 0;
    var DomUtils = __importStar(require_lib6());
    var boolbase_1 = __importDefault(require_boolbase());
    var compile_js_1 = require_compile2();
    var subselects_js_1 = require_subselects();
    var defaultEquals2 = function(a, b) {
      return a === b;
    };
    var defaultOptions2 = {
      adapter: DomUtils,
      equals: defaultEquals2
    };
    function convertOptionFormats2(options) {
      var _a2, _b, _c, _d;
      var opts = options !== null && options !== void 0 ? options : defaultOptions2;
      (_a2 = opts.adapter) !== null && _a2 !== void 0 ? _a2 : opts.adapter = DomUtils;
      (_b = opts.equals) !== null && _b !== void 0 ? _b : opts.equals = (_d = (_c = opts.adapter) === null || _c === void 0 ? void 0 : _c.equals) !== null && _d !== void 0 ? _d : defaultEquals2;
      return opts;
    }
    function wrapCompile2(func) {
      return function addAdapter(selector, options, context) {
        var opts = convertOptionFormats2(options);
        return func(selector, opts, context);
      };
    }
    exports.compile = wrapCompile2(compile_js_1.compile);
    exports._compileUnsafe = wrapCompile2(compile_js_1.compileUnsafe);
    exports._compileToken = wrapCompile2(compile_js_1.compileToken);
    function getSelectorFunc2(searchFunc) {
      return function select(query2, elements, options) {
        var opts = convertOptionFormats2(options);
        if (typeof query2 !== "function") {
          query2 = (0, compile_js_1.compileUnsafe)(query2, opts, elements);
        }
        var filteredElements = prepareContext2(elements, opts.adapter, query2.shouldTestNextSiblings);
        return searchFunc(query2, filteredElements, opts);
      };
    }
    function prepareContext2(elems, adapter2, shouldTestNextSiblings) {
      if (shouldTestNextSiblings === void 0) {
        shouldTestNextSiblings = false;
      }
      if (shouldTestNextSiblings) {
        elems = appendNextSiblings2(elems, adapter2);
      }
      return Array.isArray(elems) ? adapter2.removeSubsets(elems) : adapter2.getChildren(elems);
    }
    exports.prepareContext = prepareContext2;
    function appendNextSiblings2(elem, adapter2) {
      var elems = Array.isArray(elem) ? elem.slice(0) : [elem];
      var elemsLength = elems.length;
      for (var i = 0; i < elemsLength; i++) {
        var nextSiblings = (0, subselects_js_1.getNextSiblings)(elems[i], adapter2);
        elems.push.apply(elems, nextSiblings);
      }
      return elems;
    }
    exports.selectAll = getSelectorFunc2(function(query2, elems, options) {
      return query2 === boolbase_1.default.falseFunc || !elems || elems.length === 0 ? [] : options.adapter.findAll(query2, elems);
    });
    exports.selectOne = getSelectorFunc2(function(query2, elems, options) {
      return query2 === boolbase_1.default.falseFunc || !elems || elems.length === 0 ? null : options.adapter.findOne(query2, elems);
    });
    function is3(elem, query2, options) {
      var opts = convertOptionFormats2(options);
      return (typeof query2 === "function" ? query2 : (0, compile_js_1.compile)(query2, opts))(elem);
    }
    exports.is = is3;
    exports.default = exports.selectAll;
    var index_js_1 = require_pseudo_selectors();
    Object.defineProperty(exports, "filters", { enumerable: true, get: function() {
      return index_js_1.filters;
    } });
    Object.defineProperty(exports, "pseudos", { enumerable: true, get: function() {
      return index_js_1.pseudos;
    } });
    Object.defineProperty(exports, "aliases", { enumerable: true, get: function() {
      return index_js_1.aliases;
    } });
  }
});

// node_modules/node-html-parser/dist/back.js
var require_back = __commonJS({
  "node_modules/node-html-parser/dist/back.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function arr_back(arr) {
      return arr[arr.length - 1];
    }
    exports.default = arr_back;
  }
});

// node_modules/node-html-parser/dist/matcher.js
var require_matcher = __commonJS({
  "node_modules/node-html-parser/dist/matcher.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var type_1 = __importDefault(require_type());
    function isTag4(node) {
      return node && node.nodeType === type_1.default.ELEMENT_NODE;
    }
    function getAttributeValue3(elem, name) {
      return isTag4(elem) ? elem.getAttribute(name) : void 0;
    }
    function getName3(elem) {
      return (elem && elem.rawTagName || "").toLowerCase();
    }
    function getChildren3(node) {
      return node && node.childNodes;
    }
    function getParent3(node) {
      return node ? node.parentNode : null;
    }
    function getText3(node) {
      return node.text;
    }
    function removeSubsets3(nodes) {
      var idx = nodes.length;
      var node;
      var ancestor;
      var replace2;
      while (--idx > -1) {
        node = ancestor = nodes[idx];
        nodes[idx] = null;
        replace2 = true;
        while (ancestor) {
          if (nodes.indexOf(ancestor) > -1) {
            replace2 = false;
            nodes.splice(idx, 1);
            break;
          }
          ancestor = getParent3(ancestor);
        }
        if (replace2) {
          nodes[idx] = node;
        }
      }
      return nodes;
    }
    function existsOne3(test, elems) {
      return elems.some(function(elem) {
        return isTag4(elem) ? test(elem) || existsOne3(test, getChildren3(elem)) : false;
      });
    }
    function getSiblings3(node) {
      var parent = getParent3(node);
      return parent ? getChildren3(parent) : [];
    }
    function hasAttrib3(elem, name) {
      return getAttributeValue3(elem, name) !== void 0;
    }
    function findOne3(test, elems) {
      var elem = null;
      for (var i = 0, l = elems === null || elems === void 0 ? void 0 : elems.length; i < l && !elem; i++) {
        var el = elems[i];
        if (test(el)) {
          elem = el;
        } else {
          var childs = getChildren3(el);
          if (childs && childs.length > 0) {
            elem = findOne3(test, childs);
          }
        }
      }
      return elem;
    }
    function findAll3(test, nodes) {
      var result = [];
      for (var i = 0, j = nodes.length; i < j; i++) {
        if (!isTag4(nodes[i]))
          continue;
        if (test(nodes[i]))
          result.push(nodes[i]);
        var childs = getChildren3(nodes[i]);
        if (childs)
          result = result.concat(findAll3(test, childs));
      }
      return result;
    }
    exports.default = {
      isTag: isTag4,
      getAttributeValue: getAttributeValue3,
      getName: getName3,
      getChildren: getChildren3,
      getParent: getParent3,
      getText: getText3,
      removeSubsets: removeSubsets3,
      existsOne: existsOne3,
      getSiblings: getSiblings3,
      hasAttrib: hasAttrib3,
      findOne: findOne3,
      findAll: findAll3
    };
  }
});

// node_modules/node-html-parser/dist/void-tag.js
var require_void_tag = __commonJS({
  "node_modules/node-html-parser/dist/void-tag.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var VoidTag = (
      /** @class */
      function() {
        function VoidTag2(addClosingSlash, tags) {
          if (addClosingSlash === void 0) {
            addClosingSlash = false;
          }
          this.addClosingSlash = addClosingSlash;
          if (Array.isArray(tags)) {
            this.voidTags = tags.reduce(function(set, tag) {
              return set.add(tag.toLowerCase());
            }, /* @__PURE__ */ new Set());
          } else {
            this.voidTags = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].reduce(function(set, tag) {
              return set.add(tag);
            }, /* @__PURE__ */ new Set());
          }
        }
        VoidTag2.prototype.formatNode = function(tag, attrs, innerHTML) {
          var addClosingSlash = this.addClosingSlash;
          var closingSpace = addClosingSlash && attrs && !attrs.endsWith(" ") ? " " : "";
          var closingSlash = addClosingSlash ? "".concat(closingSpace, "/") : "";
          return this.isVoidElement(tag.toLowerCase()) ? "<".concat(tag).concat(attrs).concat(closingSlash, ">") : "<".concat(tag).concat(attrs, ">").concat(innerHTML, "</").concat(tag, ">");
        };
        VoidTag2.prototype.isVoidElement = function(tag) {
          return this.voidTags.has(tag);
        };
        return VoidTag2;
      }()
    );
    exports.default = VoidTag;
  }
});

// node_modules/node-html-parser/dist/nodes/text.js
var require_text = __commonJS({
  "node_modules/node-html-parser/dist/nodes/text.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var he_1 = require_he();
    var node_1 = __importDefault(require_node());
    var type_1 = __importDefault(require_type());
    var TextNode = (
      /** @class */
      function(_super) {
        __extends(TextNode2, _super);
        function TextNode2(rawText, parentNode, range) {
          if (parentNode === void 0) {
            parentNode = null;
          }
          var _this = _super.call(this, parentNode, range) || this;
          _this.nodeType = type_1.default.TEXT_NODE;
          _this._rawText = rawText;
          return _this;
        }
        TextNode2.prototype.clone = function() {
          return new TextNode2(this._rawText, null);
        };
        Object.defineProperty(TextNode2.prototype, "rawText", {
          get: function() {
            return this._rawText;
          },
          /**
           * Set rawText and invalidate trimmed caches
           */
          set: function(text) {
            this._rawText = text;
            this._trimmedRawText = void 0;
            this._trimmedText = void 0;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(TextNode2.prototype, "trimmedRawText", {
          /**
           * Returns raw text with all whitespace trimmed except single leading/trailing non-breaking space
           */
          get: function() {
            if (this._trimmedRawText !== void 0)
              return this._trimmedRawText;
            this._trimmedRawText = trimText(this.rawText);
            return this._trimmedRawText;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(TextNode2.prototype, "trimmedText", {
          /**
           * Returns text with all whitespace trimmed except single leading/trailing non-breaking space
           */
          get: function() {
            if (this._trimmedText !== void 0)
              return this._trimmedText;
            this._trimmedText = trimText(this.text);
            return this._trimmedText;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(TextNode2.prototype, "text", {
          /**
           * Get unescaped text value of current node and its children.
           * @return {string} text content
           */
          get: function() {
            return (0, he_1.decode)(this.rawText);
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(TextNode2.prototype, "isWhitespace", {
          /**
           * Detect if the node contains only white space.
           * @return {boolean}
           */
          get: function() {
            return /^(\s|&nbsp;)*$/.test(this.rawText);
          },
          enumerable: false,
          configurable: true
        });
        TextNode2.prototype.toString = function() {
          return this.rawText;
        };
        return TextNode2;
      }(node_1.default)
    );
    exports.default = TextNode;
    function trimText(text) {
      var i = 0;
      var startPos;
      var endPos;
      while (i >= 0 && i < text.length) {
        if (/\S/.test(text[i])) {
          if (startPos === void 0) {
            startPos = i;
            i = text.length;
          } else {
            endPos = i;
            i = void 0;
          }
        }
        if (startPos === void 0)
          i++;
        else
          i--;
      }
      if (startPos === void 0)
        startPos = 0;
      if (endPos === void 0)
        endPos = text.length - 1;
      var hasLeadingSpace = startPos > 0 && /[^\S\r\n]/.test(text[startPos - 1]);
      var hasTrailingSpace = endPos < text.length - 1 && /[^\S\r\n]/.test(text[endPos + 1]);
      return (hasLeadingSpace ? " " : "") + text.slice(startPos, endPos + 1) + (hasTrailingSpace ? " " : "");
    }
  }
});

// node_modules/node-html-parser/dist/nodes/html.js
var require_html = __commonJS({
  "node_modules/node-html-parser/dist/nodes/html.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = exports.base_parse = void 0;
    var css_select_1 = require_lib8();
    var he_1 = __importDefault(require_he());
    var back_1 = __importDefault(require_back());
    var matcher_1 = __importDefault(require_matcher());
    var void_tag_1 = __importDefault(require_void_tag());
    var comment_1 = __importDefault(require_comment());
    var node_1 = __importDefault(require_node());
    var text_1 = __importDefault(require_text());
    var type_1 = __importDefault(require_type());
    function decode(val) {
      return JSON.parse(JSON.stringify(he_1.default.decode(val)));
    }
    var Htags = ["h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup"];
    var Dtags = ["details", "dialog", "dd", "div", "dt"];
    var Ftags = ["fieldset", "figcaption", "figure", "footer", "form"];
    var tableTags = ["table", "td", "tr"];
    var htmlTags = ["address", "article", "aside", "blockquote", "br", "hr", "li", "main", "nav", "ol", "p", "pre", "section", "ul"];
    var kBlockElements = /* @__PURE__ */ new Set();
    function addToKBlockElement() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      var addToSet = function(array) {
        for (var index = 0; index < array.length; index++) {
          var element = array[index];
          kBlockElements.add(element);
          kBlockElements.add(element.toUpperCase());
        }
      };
      for (var _a2 = 0, args_1 = args; _a2 < args_1.length; _a2++) {
        var arg = args_1[_a2];
        addToSet(arg);
      }
    }
    addToKBlockElement(Htags, Dtags, Ftags, tableTags, htmlTags);
    var DOMTokenList2 = (
      /** @class */
      function() {
        function DOMTokenList3(valuesInit, afterUpdate) {
          if (valuesInit === void 0) {
            valuesInit = [];
          }
          if (afterUpdate === void 0) {
            afterUpdate = function() {
              return null;
            };
          }
          this._set = new Set(valuesInit);
          this._afterUpdate = afterUpdate;
        }
        DOMTokenList3.prototype._validate = function(c) {
          if (/\s/.test(c)) {
            throw new Error("DOMException in DOMTokenList.add: The token '".concat(c, "' contains HTML space characters, which are not valid in tokens."));
          }
        };
        DOMTokenList3.prototype.add = function(c) {
          this._validate(c);
          this._set.add(c);
          this._afterUpdate(this);
        };
        DOMTokenList3.prototype.replace = function(c1, c2) {
          this._validate(c2);
          this._set.delete(c1);
          this._set.add(c2);
          this._afterUpdate(this);
        };
        DOMTokenList3.prototype.remove = function(c) {
          this._set.delete(c) && this._afterUpdate(this);
        };
        DOMTokenList3.prototype.toggle = function(c) {
          this._validate(c);
          if (this._set.has(c))
            this._set.delete(c);
          else
            this._set.add(c);
          this._afterUpdate(this);
        };
        DOMTokenList3.prototype.contains = function(c) {
          return this._set.has(c);
        };
        Object.defineProperty(DOMTokenList3.prototype, "length", {
          get: function() {
            return this._set.size;
          },
          enumerable: false,
          configurable: true
        });
        DOMTokenList3.prototype.values = function() {
          return this._set.values();
        };
        Object.defineProperty(DOMTokenList3.prototype, "value", {
          get: function() {
            return Array.from(this._set.values());
          },
          enumerable: false,
          configurable: true
        });
        DOMTokenList3.prototype.toString = function() {
          return Array.from(this._set.values()).join(" ");
        };
        return DOMTokenList3;
      }()
    );
    var HTMLElement2 = (
      /** @class */
      function(_super) {
        __extends(HTMLElement3, _super);
        function HTMLElement3(tagName18, keyAttrs, rawAttrs, parentNode, range, voidTag, _parseOptions) {
          if (rawAttrs === void 0) {
            rawAttrs = "";
          }
          if (parentNode === void 0) {
            parentNode = null;
          }
          if (voidTag === void 0) {
            voidTag = new void_tag_1.default();
          }
          if (_parseOptions === void 0) {
            _parseOptions = {};
          }
          var _this = _super.call(this, parentNode, range) || this;
          _this.rawAttrs = rawAttrs;
          _this.voidTag = voidTag;
          _this.nodeType = type_1.default.ELEMENT_NODE;
          _this.rawTagName = tagName18;
          _this.rawAttrs = rawAttrs || "";
          _this.id = keyAttrs.id || "";
          _this.childNodes = [];
          _this._parseOptions = _parseOptions;
          _this.classList = new DOMTokenList2(
            keyAttrs.class ? keyAttrs.class.split(/\s+/) : [],
            function(classList) {
              return _this.setAttribute("class", classList.toString());
            }
            // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          );
          if (keyAttrs.id) {
            if (!rawAttrs) {
              _this.rawAttrs = 'id="'.concat(keyAttrs.id, '"');
            }
          }
          if (keyAttrs.class) {
            if (!rawAttrs) {
              var cls = 'class="'.concat(_this.classList.toString(), '"');
              if (_this.rawAttrs) {
                _this.rawAttrs += " ".concat(cls);
              } else {
                _this.rawAttrs = cls;
              }
            }
          }
          return _this;
        }
        HTMLElement3.prototype.quoteAttribute = function(attr) {
          if (attr == null) {
            return "null";
          }
          return JSON.stringify(attr.replace(/"/g, "&quot;")).replace(/\\t/g, "	").replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\/g, "");
        };
        HTMLElement3.prototype.removeChild = function(node) {
          this.childNodes = this.childNodes.filter(function(child) {
            return child !== node;
          });
          return this;
        };
        HTMLElement3.prototype.exchangeChild = function(oldNode, newNode) {
          var children = this.childNodes;
          this.childNodes = children.map(function(child) {
            if (child === oldNode) {
              return newNode;
            }
            return child;
          });
          return this;
        };
        Object.defineProperty(HTMLElement3.prototype, "tagName", {
          get: function() {
            return this.rawTagName ? this.rawTagName.toUpperCase() : this.rawTagName;
          },
          set: function(newname) {
            this.rawTagName = newname.toLowerCase();
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "localName", {
          get: function() {
            return this.rawTagName.toLowerCase();
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "isVoidElement", {
          get: function() {
            return this.voidTag.isVoidElement(this.localName);
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "rawText", {
          /**
           * Get escpaed (as-it) text value of current node and its children.
           * @return {string} text content
           */
          get: function() {
            return this.childNodes.reduce(function(pre, cur) {
              return pre += cur.rawText;
            }, "");
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "textContent", {
          get: function() {
            return decode(this.rawText);
          },
          set: function(val) {
            var content = [new text_1.default(val, this)];
            this.childNodes = content;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "text", {
          /**
           * Get unescaped text value of current node and its children.
           * @return {string} text content
           */
          get: function() {
            return decode(this.rawText);
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "structuredText", {
          /**
           * Get structured Text (with '\n' etc.)
           * @return {string} structured text
           */
          get: function() {
            var currentBlock = [];
            var blocks = [currentBlock];
            function dfs(node) {
              if (node.nodeType === type_1.default.ELEMENT_NODE) {
                if (kBlockElements.has(node.rawTagName)) {
                  if (currentBlock.length > 0) {
                    blocks.push(currentBlock = []);
                  }
                  node.childNodes.forEach(dfs);
                  if (currentBlock.length > 0) {
                    blocks.push(currentBlock = []);
                  }
                } else {
                  node.childNodes.forEach(dfs);
                }
              } else if (node.nodeType === type_1.default.TEXT_NODE) {
                if (node.isWhitespace) {
                  currentBlock.prependWhitespace = true;
                } else {
                  var text = node.trimmedText;
                  if (currentBlock.prependWhitespace) {
                    text = " ".concat(text);
                    currentBlock.prependWhitespace = false;
                  }
                  currentBlock.push(text);
                }
              }
            }
            dfs(this);
            return blocks.map(function(block) {
              return block.join("").replace(/\s{2,}/g, " ");
            }).join("\n").replace(/\s+$/, "");
          },
          enumerable: false,
          configurable: true
        });
        HTMLElement3.prototype.toString = function() {
          var tag = this.rawTagName;
          if (tag) {
            var attrs = this.rawAttrs ? " ".concat(this.rawAttrs) : "";
            return this.voidTag.formatNode(tag, attrs, this.innerHTML);
          }
          return this.innerHTML;
        };
        Object.defineProperty(HTMLElement3.prototype, "innerHTML", {
          get: function() {
            return this.childNodes.map(function(child) {
              return child.toString();
            }).join("");
          },
          set: function(content) {
            var r = parse6(content, this._parseOptions);
            var nodes = r.childNodes.length ? r.childNodes : [new text_1.default(content, this)];
            resetParent(nodes, this);
            resetParent(this.childNodes, null);
            this.childNodes = nodes;
          },
          enumerable: false,
          configurable: true
        });
        HTMLElement3.prototype.set_content = function(content, options) {
          if (options === void 0) {
            options = {};
          }
          if (content instanceof node_1.default) {
            content = [content];
          } else if (typeof content == "string") {
            options = __assign(__assign({}, this._parseOptions), options);
            var r = parse6(content, options);
            content = r.childNodes.length ? r.childNodes : [new text_1.default(r.innerHTML, this)];
          }
          resetParent(this.childNodes, null);
          resetParent(content, this);
          this.childNodes = content;
          return this;
        };
        HTMLElement3.prototype.replaceWith = function() {
          var _this = this;
          var nodes = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            nodes[_i] = arguments[_i];
          }
          var parent = this.parentNode;
          var content = nodes.map(function(node) {
            if (node instanceof node_1.default) {
              return [node];
            } else if (typeof node == "string") {
              var r = parse6(node, _this._parseOptions);
              return r.childNodes.length ? r.childNodes : [new text_1.default(node, _this)];
            }
            return [];
          }).flat();
          var idx = parent.childNodes.findIndex(function(child) {
            return child === _this;
          });
          resetParent([this], null);
          parent.childNodes = __spreadArray(__spreadArray(__spreadArray([], parent.childNodes.slice(0, idx), true), resetParent(content, parent), true), parent.childNodes.slice(idx + 1), true);
          return this;
        };
        Object.defineProperty(HTMLElement3.prototype, "outerHTML", {
          get: function() {
            return this.toString();
          },
          enumerable: false,
          configurable: true
        });
        HTMLElement3.prototype.trimRight = function(pattern) {
          for (var i = 0; i < this.childNodes.length; i++) {
            var childNode = this.childNodes[i];
            if (childNode.nodeType === type_1.default.ELEMENT_NODE) {
              childNode.trimRight(pattern);
            } else {
              var index = childNode.rawText.search(pattern);
              if (index > -1) {
                childNode.rawText = childNode.rawText.substr(0, index);
                this.childNodes.length = i + 1;
              }
            }
          }
          return this;
        };
        Object.defineProperty(HTMLElement3.prototype, "structure", {
          /**
           * Get DOM structure
           * @return {string} strucutre
           */
          get: function() {
            var res = [];
            var indention = 0;
            function write(str) {
              res.push("  ".repeat(indention) + str);
            }
            function dfs(node) {
              var idStr = node.id ? "#".concat(node.id) : "";
              var classStr = node.classList.length ? ".".concat(node.classList.value.join(".")) : "";
              write("".concat(node.rawTagName).concat(idStr).concat(classStr));
              indention++;
              node.childNodes.forEach(function(childNode) {
                if (childNode.nodeType === type_1.default.ELEMENT_NODE) {
                  dfs(childNode);
                } else if (childNode.nodeType === type_1.default.TEXT_NODE) {
                  if (!childNode.isWhitespace) {
                    write("#text");
                  }
                }
              });
              indention--;
            }
            dfs(this);
            return res.join("\n");
          },
          enumerable: false,
          configurable: true
        });
        HTMLElement3.prototype.removeWhitespace = function() {
          var _this = this;
          var o = 0;
          this.childNodes.forEach(function(node) {
            if (node.nodeType === type_1.default.TEXT_NODE) {
              if (node.isWhitespace) {
                return;
              }
              node.rawText = node.trimmedRawText;
            } else if (node.nodeType === type_1.default.ELEMENT_NODE) {
              node.removeWhitespace();
            }
            _this.childNodes[o++] = node;
          });
          this.childNodes.length = o;
          return this;
        };
        HTMLElement3.prototype.querySelectorAll = function(selector) {
          return (0, css_select_1.selectAll)(selector, this, {
            xmlMode: true,
            adapter: matcher_1.default
          });
        };
        HTMLElement3.prototype.querySelector = function(selector) {
          return (0, css_select_1.selectOne)(selector, this, {
            xmlMode: true,
            adapter: matcher_1.default
          });
        };
        HTMLElement3.prototype.getElementsByTagName = function(tagName18) {
          var upperCasedTagName = tagName18.toUpperCase();
          var re = [];
          var stack = [];
          var currentNodeReference = this;
          var index = 0;
          while (index !== void 0) {
            var child = void 0;
            do {
              child = currentNodeReference.childNodes[index++];
            } while (index < currentNodeReference.childNodes.length && child === void 0);
            if (child === void 0) {
              currentNodeReference = currentNodeReference.parentNode;
              index = stack.pop();
              continue;
            }
            if (child.nodeType === type_1.default.ELEMENT_NODE) {
              if (tagName18 === "*" || child.tagName === upperCasedTagName)
                re.push(child);
              if (child.childNodes.length > 0) {
                stack.push(index);
                currentNodeReference = child;
                index = 0;
              }
            }
          }
          return re;
        };
        HTMLElement3.prototype.getElementById = function(id) {
          var stack = [];
          var currentNodeReference = this;
          var index = 0;
          while (index !== void 0) {
            var child = void 0;
            do {
              child = currentNodeReference.childNodes[index++];
            } while (index < currentNodeReference.childNodes.length && child === void 0);
            if (child === void 0) {
              currentNodeReference = currentNodeReference.parentNode;
              index = stack.pop();
              continue;
            }
            if (child.nodeType === type_1.default.ELEMENT_NODE) {
              if (child.id === id) {
                return child;
              }
              ;
              if (child.childNodes.length > 0) {
                stack.push(index);
                currentNodeReference = child;
                index = 0;
              }
            }
          }
          return null;
        };
        HTMLElement3.prototype.closest = function(selector) {
          var mapChild = /* @__PURE__ */ new Map();
          var el = this;
          var old = null;
          function findOne3(test, elems) {
            var elem = null;
            for (var i = 0, l = elems.length; i < l && !elem; i++) {
              var el_1 = elems[i];
              if (test(el_1)) {
                elem = el_1;
              } else {
                var child = mapChild.get(el_1);
                if (child) {
                  elem = findOne3(test, [child]);
                }
              }
            }
            return elem;
          }
          while (el) {
            mapChild.set(el, old);
            old = el;
            el = el.parentNode;
          }
          el = this;
          while (el) {
            var e = (0, css_select_1.selectOne)(selector, el, {
              xmlMode: true,
              adapter: __assign(__assign({}, matcher_1.default), { getChildren: function(node) {
                var child = mapChild.get(node);
                return child && [child];
              }, getSiblings: function(node) {
                return [node];
              }, findOne: findOne3, findAll: function() {
                return [];
              } })
            });
            if (e) {
              return e;
            }
            el = el.parentNode;
          }
          return null;
        };
        HTMLElement3.prototype.appendChild = function(node) {
          node.remove();
          this.childNodes.push(node);
          node.parentNode = this;
          return node;
        };
        Object.defineProperty(HTMLElement3.prototype, "firstChild", {
          /**
           * Get first child node
           * @return {Node} first child node
           */
          get: function() {
            return this.childNodes[0];
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "lastChild", {
          /**
           * Get last child node
           * @return {Node} last child node
           */
          get: function() {
            return (0, back_1.default)(this.childNodes);
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "attrs", {
          /**
           * Get attributes
           * @access private
           * @return {Object} parsed and unescaped attributes
           */
          get: function() {
            if (this._attrs) {
              return this._attrs;
            }
            this._attrs = {};
            var attrs = this.rawAttributes;
            for (var key2 in attrs) {
              var val = attrs[key2] || "";
              this._attrs[key2.toLowerCase()] = decode(val);
            }
            return this._attrs;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "attributes", {
          get: function() {
            var ret_attrs = {};
            var attrs = this.rawAttributes;
            for (var key2 in attrs) {
              var val = attrs[key2] || "";
              ret_attrs[key2] = decode(val);
            }
            return ret_attrs;
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "rawAttributes", {
          /**
           * Get escaped (as-is) attributes
           * @return {Object} parsed attributes
           */
          get: function() {
            if (this._rawAttrs) {
              return this._rawAttrs;
            }
            var attrs = {};
            if (this.rawAttrs) {
              var re = /([a-zA-Z()[\]#@$.?:][a-zA-Z0-9-_:()[\]#]*)(?:\s*=\s*((?:'[^']*')|(?:"[^"]*")|\S+))?/g;
              var match = void 0;
              while (match = re.exec(this.rawAttrs)) {
                var key2 = match[1];
                var val = match[2] || null;
                if (val && (val[0] === "'" || val[0] === '"'))
                  val = val.slice(1, val.length - 1);
                attrs[key2] = attrs[key2] || val;
              }
            }
            this._rawAttrs = attrs;
            return attrs;
          },
          enumerable: false,
          configurable: true
        });
        HTMLElement3.prototype.removeAttribute = function(key2) {
          var _this = this;
          var attrs = this.rawAttributes;
          delete attrs[key2];
          if (this._attrs) {
            delete this._attrs[key2];
          }
          this.rawAttrs = Object.keys(attrs).map(function(name) {
            var val = _this.quoteAttribute(attrs[name]);
            if (val === void 0 || val === "null") {
              return name;
            }
            return "".concat(name, "=").concat(val);
          }).join(" ");
          if (key2 === "id") {
            this.id = "";
          }
          return this;
        };
        HTMLElement3.prototype.hasAttribute = function(key2) {
          return key2.toLowerCase() in this.attrs;
        };
        HTMLElement3.prototype.getAttribute = function(key2) {
          return this.attrs[key2.toLowerCase()];
        };
        HTMLElement3.prototype.setAttribute = function(key2, value) {
          var _this = this;
          if (arguments.length < 2) {
            throw new Error("Failed to execute 'setAttribute' on 'Element'");
          }
          var k2 = key2.toLowerCase();
          var attrs = this.rawAttributes;
          for (var k in attrs) {
            if (k.toLowerCase() === k2) {
              key2 = k;
              break;
            }
          }
          attrs[key2] = String(value);
          if (this._attrs) {
            this._attrs[k2] = decode(attrs[key2]);
          }
          this.rawAttrs = Object.keys(attrs).map(function(name) {
            var val = _this.quoteAttribute(attrs[name]);
            if (val === "null" || val === '""')
              return name;
            return "".concat(name, "=").concat(val);
          }).join(" ");
          if (key2 === "id") {
            this.id = value;
          }
          return this;
        };
        HTMLElement3.prototype.setAttributes = function(attributes2) {
          var _this = this;
          if (this._attrs) {
            delete this._attrs;
          }
          if (this._rawAttrs) {
            delete this._rawAttrs;
          }
          this.rawAttrs = Object.keys(attributes2).map(function(name) {
            var val = attributes2[name];
            if (val === "null" || val === '""')
              return name;
            return "".concat(name, "=").concat(_this.quoteAttribute(String(val)));
          }).join(" ");
          return this;
        };
        HTMLElement3.prototype.insertAdjacentHTML = function(where, html) {
          var _a2, _b, _c;
          var _this = this;
          if (arguments.length < 2) {
            throw new Error("2 arguments required");
          }
          var p = parse6(html, this._parseOptions);
          if (where === "afterend") {
            var idx = this.parentNode.childNodes.findIndex(function(child) {
              return child === _this;
            });
            resetParent(p.childNodes, this.parentNode);
            (_a2 = this.parentNode.childNodes).splice.apply(_a2, __spreadArray([idx + 1, 0], p.childNodes, false));
          } else if (where === "afterbegin") {
            resetParent(p.childNodes, this);
            (_b = this.childNodes).unshift.apply(_b, p.childNodes);
          } else if (where === "beforeend") {
            p.childNodes.forEach(function(n) {
              _this.appendChild(n);
            });
          } else if (where === "beforebegin") {
            var idx = this.parentNode.childNodes.findIndex(function(child) {
              return child === _this;
            });
            resetParent(p.childNodes, this.parentNode);
            (_c = this.parentNode.childNodes).splice.apply(_c, __spreadArray([idx, 0], p.childNodes, false));
          } else {
            throw new Error("The value provided ('".concat(where, "') is not one of 'beforebegin', 'afterbegin', 'beforeend', or 'afterend'"));
          }
          return this;
        };
        Object.defineProperty(HTMLElement3.prototype, "nextSibling", {
          get: function() {
            if (this.parentNode) {
              var children = this.parentNode.childNodes;
              var i = 0;
              while (i < children.length) {
                var child = children[i++];
                if (this === child)
                  return children[i] || null;
              }
              return null;
            }
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "nextElementSibling", {
          get: function() {
            if (this.parentNode) {
              var children = this.parentNode.childNodes;
              var i = 0;
              var find2 = false;
              while (i < children.length) {
                var child = children[i++];
                if (find2) {
                  if (child instanceof HTMLElement3) {
                    return child || null;
                  }
                } else if (this === child) {
                  find2 = true;
                }
              }
              return null;
            }
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "previousSibling", {
          get: function() {
            if (this.parentNode) {
              var children = this.parentNode.childNodes;
              var i = children.length;
              while (i > 0) {
                var child = children[--i];
                if (this === child)
                  return children[i - 1] || null;
              }
              return null;
            }
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "previousElementSibling", {
          get: function() {
            if (this.parentNode) {
              var children = this.parentNode.childNodes;
              var i = children.length;
              var find2 = false;
              while (i > 0) {
                var child = children[--i];
                if (find2) {
                  if (child instanceof HTMLElement3) {
                    return child || null;
                  }
                } else if (this === child) {
                  find2 = true;
                }
              }
              return null;
            }
          },
          enumerable: false,
          configurable: true
        });
        Object.defineProperty(HTMLElement3.prototype, "classNames", {
          get: function() {
            return this.classList.toString();
          },
          enumerable: false,
          configurable: true
        });
        HTMLElement3.prototype.clone = function() {
          return parse6(this.toString(), this._parseOptions).firstChild;
        };
        return HTMLElement3;
      }(node_1.default)
    );
    exports.default = HTMLElement2;
    var kMarkupPattern = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][-.:0-9_a-zA-Z]*)((?:\s+[^>]*?(?:(?:'[^']*')|(?:"[^"]*"))?)*)\s*(\/?)>/g;
    var kAttributePattern = /(?:^|\s)(id|class)\s*=\s*((?:'[^']*')|(?:"[^"]*")|\S+)/gi;
    var kSelfClosingElements = {
      area: true,
      AREA: true,
      base: true,
      BASE: true,
      br: true,
      BR: true,
      col: true,
      COL: true,
      hr: true,
      HR: true,
      img: true,
      IMG: true,
      input: true,
      INPUT: true,
      link: true,
      LINK: true,
      meta: true,
      META: true,
      source: true,
      SOURCE: true,
      embed: true,
      EMBED: true,
      param: true,
      PARAM: true,
      track: true,
      TRACK: true,
      wbr: true,
      WBR: true
    };
    var kElementsClosedByOpening = {
      li: { li: true, LI: true },
      LI: { li: true, LI: true },
      p: { p: true, div: true, P: true, DIV: true },
      P: { p: true, div: true, P: true, DIV: true },
      b: { div: true, DIV: true },
      B: { div: true, DIV: true },
      td: { td: true, th: true, TD: true, TH: true },
      TD: { td: true, th: true, TD: true, TH: true },
      th: { td: true, th: true, TD: true, TH: true },
      TH: { td: true, th: true, TD: true, TH: true },
      h1: { h1: true, H1: true },
      H1: { h1: true, H1: true },
      h2: { h2: true, H2: true },
      H2: { h2: true, H2: true },
      h3: { h3: true, H3: true },
      H3: { h3: true, H3: true },
      h4: { h4: true, H4: true },
      H4: { h4: true, H4: true },
      h5: { h5: true, H5: true },
      H5: { h5: true, H5: true },
      h6: { h6: true, H6: true },
      H6: { h6: true, H6: true }
    };
    var kElementsClosedByClosing = {
      li: { ul: true, ol: true, UL: true, OL: true },
      LI: { ul: true, ol: true, UL: true, OL: true },
      a: { div: true, DIV: true },
      A: { div: true, DIV: true },
      b: { div: true, DIV: true },
      B: { div: true, DIV: true },
      i: { div: true, DIV: true },
      I: { div: true, DIV: true },
      p: { div: true, DIV: true },
      P: { div: true, DIV: true },
      td: { tr: true, table: true, TR: true, TABLE: true },
      TD: { tr: true, table: true, TR: true, TABLE: true },
      th: { tr: true, table: true, TR: true, TABLE: true },
      TH: { tr: true, table: true, TR: true, TABLE: true }
    };
    var frameflag = "documentfragmentcontainer";
    function base_parse(data, options) {
      var _a2, _b;
      if (options === void 0) {
        options = {};
      }
      var voidTag = new void_tag_1.default((_a2 = options === null || options === void 0 ? void 0 : options.voidTag) === null || _a2 === void 0 ? void 0 : _a2.closingSlash, (_b = options === null || options === void 0 ? void 0 : options.voidTag) === null || _b === void 0 ? void 0 : _b.tags);
      var elements = options.blockTextElements || {
        script: true,
        noscript: true,
        style: true,
        pre: true
      };
      var element_names = Object.keys(elements);
      var kBlockTextElements = element_names.map(function(it) {
        return new RegExp("^".concat(it, "$"), "i");
      });
      var kIgnoreElements = element_names.filter(function(it) {
        return elements[it];
      }).map(function(it) {
        return new RegExp("^".concat(it, "$"), "i");
      });
      function element_should_be_ignore(tag) {
        return kIgnoreElements.some(function(it) {
          return it.test(tag);
        });
      }
      function is_block_text_element(tag) {
        return kBlockTextElements.some(function(it) {
          return it.test(tag);
        });
      }
      var createRange = function(startPos, endPos) {
        return [startPos - frameFlagOffset, endPos - frameFlagOffset];
      };
      var root = new HTMLElement2(null, {}, "", null, [0, data.length], voidTag, options);
      var currentParent = root;
      var stack = [root];
      var lastTextPos = -1;
      var noNestedTagIndex = void 0;
      var match;
      data = "<".concat(frameflag, ">").concat(data, "</").concat(frameflag, ">");
      var lowerCaseTagName = options.lowerCaseTagName, fixNestedATags = options.fixNestedATags;
      var dataEndPos = data.length - (frameflag.length + 2);
      var frameFlagOffset = frameflag.length + 2;
      while (match = kMarkupPattern.exec(data)) {
        var matchText = match[0], leadingSlash = match[1], tagName18 = match[2], attributes2 = match[3], closingSlash = match[4];
        var matchLength = matchText.length;
        var tagStartPos = kMarkupPattern.lastIndex - matchLength;
        var tagEndPos = kMarkupPattern.lastIndex;
        if (lastTextPos > -1) {
          if (lastTextPos + matchLength < tagEndPos) {
            var text = data.substring(lastTextPos, tagStartPos);
            currentParent.appendChild(new text_1.default(text, currentParent, createRange(lastTextPos, tagStartPos)));
          }
        }
        lastTextPos = kMarkupPattern.lastIndex;
        if (tagName18 === frameflag)
          continue;
        if (matchText[1] === "!") {
          if (options.comment) {
            var text = data.substring(tagStartPos + 4, tagEndPos - 3);
            currentParent.appendChild(new comment_1.default(text, currentParent, createRange(tagStartPos, tagEndPos)));
          }
          continue;
        }
        if (lowerCaseTagName)
          tagName18 = tagName18.toLowerCase();
        if (!leadingSlash) {
          var attrs = {};
          for (var attMatch = void 0; attMatch = kAttributePattern.exec(attributes2); ) {
            var key2 = attMatch[1], val = attMatch[2];
            var isQuoted = val[0] === "'" || val[0] === '"';
            attrs[key2.toLowerCase()] = isQuoted ? val.slice(1, val.length - 1) : val;
          }
          var parentTagName = currentParent.rawTagName;
          if (!closingSlash && kElementsClosedByOpening[parentTagName]) {
            if (kElementsClosedByOpening[parentTagName][tagName18]) {
              stack.pop();
              currentParent = (0, back_1.default)(stack);
            }
          }
          if (fixNestedATags && (tagName18 === "a" || tagName18 === "A")) {
            if (noNestedTagIndex !== void 0) {
              stack.splice(noNestedTagIndex);
              currentParent = (0, back_1.default)(stack);
            }
            noNestedTagIndex = stack.length;
          }
          var tagEndPos_1 = kMarkupPattern.lastIndex;
          var tagStartPos_1 = tagEndPos_1 - matchLength;
          currentParent = currentParent.appendChild(
            // Initialize range (end position updated later for closed tags)
            new HTMLElement2(tagName18, attrs, attributes2.slice(1), null, createRange(tagStartPos_1, tagEndPos_1), voidTag, options)
          );
          stack.push(currentParent);
          if (is_block_text_element(tagName18)) {
            var closeMarkup = "</".concat(tagName18, ">");
            var closeIndex = lowerCaseTagName ? data.toLocaleLowerCase().indexOf(closeMarkup, kMarkupPattern.lastIndex) : data.indexOf(closeMarkup, kMarkupPattern.lastIndex);
            var textEndPos = closeIndex === -1 ? dataEndPos : closeIndex;
            if (element_should_be_ignore(tagName18)) {
              var text = data.substring(tagEndPos_1, textEndPos);
              if (text.length > 0 && /\S/.test(text)) {
                currentParent.appendChild(new text_1.default(text, currentParent, createRange(tagEndPos_1, textEndPos)));
              }
            }
            if (closeIndex === -1) {
              lastTextPos = kMarkupPattern.lastIndex = data.length + 1;
            } else {
              lastTextPos = kMarkupPattern.lastIndex = closeIndex + closeMarkup.length;
              leadingSlash = "/";
            }
          }
        }
        if (leadingSlash || closingSlash || kSelfClosingElements[tagName18]) {
          while (true) {
            if (noNestedTagIndex != null && (tagName18 === "a" || tagName18 === "A"))
              noNestedTagIndex = void 0;
            if (currentParent.rawTagName === tagName18) {
              currentParent.range[1] = createRange(-1, Math.max(lastTextPos, tagEndPos))[1];
              stack.pop();
              currentParent = (0, back_1.default)(stack);
              break;
            } else {
              var parentTagName = currentParent.tagName;
              if (kElementsClosedByClosing[parentTagName]) {
                if (kElementsClosedByClosing[parentTagName][tagName18]) {
                  stack.pop();
                  currentParent = (0, back_1.default)(stack);
                  continue;
                }
              }
              break;
            }
          }
        }
      }
      return stack;
    }
    exports.base_parse = base_parse;
    function parse6(data, options) {
      if (options === void 0) {
        options = {};
      }
      var stack = base_parse(data, options);
      var root = stack[0];
      var _loop_1 = function() {
        var last = stack.pop();
        var oneBefore = (0, back_1.default)(stack);
        if (last.parentNode && last.parentNode.parentNode) {
          if (last.parentNode === oneBefore && last.tagName === oneBefore.tagName) {
            if (options.parseNoneClosedTags !== true) {
              oneBefore.removeChild(last);
              last.childNodes.forEach(function(child) {
                oneBefore.parentNode.appendChild(child);
              });
              stack.pop();
            }
          } else {
            if (options.parseNoneClosedTags !== true) {
              oneBefore.removeChild(last);
              last.childNodes.forEach(function(child) {
                oneBefore.appendChild(child);
              });
            }
          }
        } else {
        }
      };
      while (stack.length > 1) {
        _loop_1();
      }
      return root;
    }
    exports.parse = parse6;
    function resetParent(nodes, parent) {
      return nodes.map(function(node) {
        node.parentNode = parent;
        return node;
      });
    }
  }
});

// node_modules/node-html-parser/dist/parse.js
var require_parse4 = __commonJS({
  "node_modules/node-html-parser/dist/parse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = void 0;
    var html_1 = require_html();
    Object.defineProperty(exports, "default", { enumerable: true, get: function() {
      return html_1.parse;
    } });
  }
});

// node_modules/node-html-parser/dist/valid.js
var require_valid = __commonJS({
  "node_modules/node-html-parser/dist/valid.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var html_1 = require_html();
    function valid(data, options) {
      if (options === void 0) {
        options = {};
      }
      var stack = (0, html_1.base_parse)(data, options);
      return Boolean(stack.length === 1);
    }
    exports.default = valid;
  }
});

// node_modules/node-html-parser/dist/index.js
var require_dist = __commonJS({
  "node_modules/node-html-parser/dist/index.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeType = exports.TextNode = exports.Node = exports.valid = exports.CommentNode = exports.HTMLElement = exports.parse = void 0;
    var comment_1 = __importDefault(require_comment());
    exports.CommentNode = comment_1.default;
    var html_1 = __importDefault(require_html());
    exports.HTMLElement = html_1.default;
    var node_1 = __importDefault(require_node());
    exports.Node = node_1.default;
    var text_1 = __importDefault(require_text());
    exports.TextNode = text_1.default;
    var type_1 = __importDefault(require_type());
    exports.NodeType = type_1.default;
    var parse_1 = __importDefault(require_parse4());
    var valid_1 = __importDefault(require_valid());
    exports.valid = valid_1.default;
    function parse6(data, options) {
      if (options === void 0) {
        options = {};
      }
      return (0, parse_1.default)(data, options);
    }
    exports.default = parse6;
    exports.parse = parse6;
    parse6.parse = parse_1.default;
    parse6.HTMLElement = html_1.default;
    parse6.CommentNode = comment_1.default;
    parse6.valid = valid_1.default;
    parse6.Node = node_1.default;
    parse6.TextNode = text_1.default;
    parse6.NodeType = type_1.default;
  }
});

// node_modules/node-html-markdown/dist/utilities.js
var require_utilities = __commonJS({
  "node_modules/node-html-markdown/dist/utilities.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.perfStop = exports.perfStart = exports.getChildNodes = exports.parseHTML = exports.truthyStr = exports.getTrailingWhitespaceInfo = exports.tagSurround = exports.splitSpecial = exports.isWhiteSpaceOnly = exports.surround = exports.trimNewLines = void 0;
    var config_1 = require_config();
    var trimNewLines = (s) => s.replace(/^\n+|\n+$/g, "");
    exports.trimNewLines = trimNewLines;
    var surround = (source, surroundStr) => `${surroundStr}${source}${surroundStr}`;
    exports.surround = surround;
    var isWhiteSpaceOnly = (s) => !/\S/.test(s);
    exports.isWhiteSpaceOnly = isWhiteSpaceOnly;
    function splitSpecial(s) {
      const lines = [];
      const strLen = s.length;
      for (let i = 0, startPos = 0; i < strLen; ++i) {
        let char = s.charAt(i);
        let newLineChar = "";
        if (char === "\r")
          newLineChar = s.charAt(i + 1) === "\n" ? "\r\n" : char;
        else if (char === "\n")
          newLineChar = char;
        const endPos = newLineChar ? i : i === strLen - 1 ? i + 1 : void 0;
        if (endPos === void 0)
          continue;
        lines.push({
          text: s.slice(startPos, endPos),
          newLineChar
        });
        startPos = endPos + newLineChar.length;
        if (newLineChar.length > 1)
          ++i;
      }
      return lines;
    }
    exports.splitSpecial = splitSpecial;
    function tagSurround(content, surroundStr) {
      const nestedSurroundStrIndex = content.indexOf(surroundStr);
      if (nestedSurroundStrIndex >= 0)
        content = content.replace(new RegExp(`([^\\\\])\\${surroundStr.split("").join("\\")}`, "gm"), "$1");
      const lines = splitSpecial(content);
      let res = "";
      for (const { text, newLineChar } of lines) {
        let i = 0;
        let startPos = void 0;
        let endPos = void 0;
        while (i >= 0 && i < text.length) {
          if (/[\S]/.test(text[i])) {
            if (startPos === void 0) {
              startPos = i;
              i = text.length;
            } else {
              endPos = i;
              i = NaN;
            }
          }
          if (startPos === void 0)
            ++i;
          else
            --i;
        }
        if (startPos === void 0) {
          res += text + newLineChar;
          continue;
        }
        if (endPos === void 0)
          endPos = text.length - 1;
        const leadingSpace = startPos > 0 ? text[startPos - 1] : "";
        const trailingSpace = endPos < text.length - 1 ? text[endPos + 1] : "";
        const slicedText = text.slice(startPos, endPos + 1);
        res += leadingSpace + surroundStr + slicedText + surroundStr + trailingSpace + newLineChar;
      }
      return res;
    }
    exports.tagSurround = tagSurround;
    var getTrailingWhitespaceInfo = (s) => {
      const res = { whitespace: 0, newLines: 0 };
      const minI = Math.max(s.length - 10, 0);
      for (let i = s.length - 1; i >= minI; --i) {
        const token = s.slice(i, i + 1);
        if (!/\s/.test(token))
          break;
        ++res.whitespace;
        if (["\r", "\n"].includes(token))
          ++res.newLines;
      }
      return res;
    };
    exports.getTrailingWhitespaceInfo = getTrailingWhitespaceInfo;
    var truthyStr = (v, value) => v ? value !== void 0 ? value : String(v) : "";
    exports.truthyStr = truthyStr;
    function tryParseWithNativeDom(html) {
      try {
        if (!((window === null || window === void 0 ? void 0 : window.DOMParser) && new window.DOMParser().parseFromString("", "text/html")))
          return void 0;
      } catch (_a2) {
        return void 0;
      }
      let doc;
      try {
        doc = document.implementation.createHTMLDocument("").open();
      } catch (e) {
        const { ActiveXObject } = window;
        if (ActiveXObject) {
          const doc2 = ActiveXObject("htmlfile");
          doc2.designMode = "on";
          return doc2.open();
        }
        throw e;
      }
      doc.write("<node-html-markdown>" + html + "</node-html-markdown>");
      doc.close();
      return doc.documentElement;
    }
    var getNodeHtmlParser = () => {
      try {
        return require_dist().parse;
      } catch (_a2) {
        return void 0;
      }
    };
    function parseHTML2(html, options) {
      let nodeHtmlParse;
      perfStart("parse");
      let el;
      if (options.preferNativeParser) {
        try {
          el = tryParseWithNativeDom(html);
        } catch (e) {
          nodeHtmlParse = getNodeHtmlParser();
          if (nodeHtmlParse)
            console.warn("Native DOM parser encountered an error during parse", e);
          else
            throw e;
        }
      } else
        nodeHtmlParse = getNodeHtmlParser();
      if (!el)
        el = nodeHtmlParse(html, config_1.nodeHtmlParserConfig);
      perfStop("parse");
      return el;
    }
    exports.parseHTML = parseHTML2;
    function getChildNodes(node) {
      if (!isNodeList(node.childNodes))
        return node.childNodes;
      const res = [];
      node.childNodes.forEach((n) => res.push(n));
      return res;
      function isNodeList(v) {
        return v != null || typeof v[Symbol.iterator] === "function";
      }
    }
    exports.getChildNodes = getChildNodes;
    function perfStart(label) {
      if (process.env.LOG_PERF)
        console.time(label);
    }
    exports.perfStart = perfStart;
    function perfStop(label) {
      if (process.env.LOG_PERF)
        console.timeEnd(label);
    }
    exports.perfStop = perfStop;
  }
});

// node_modules/node-html-markdown/dist/config.js
var require_config = __commonJS({
  "node_modules/node-html-markdown/dist/config.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nodeHtmlParserConfig = exports.aTagTranslatorConfig = exports.defaultCodeBlockTranslators = exports.tableCellTranslatorConfig = exports.tableRowTranslatorConfig = exports.tableTranslatorConfig = exports.defaultTranslators = exports.defaultOptions = exports.contentlessElements = exports.defaultIgnoreElements = exports.defaultBlockElements = void 0;
    var utilities_1 = require_utilities();
    var translator_1 = require_translator();
    exports.defaultBlockElements = [
      "ADDRESS",
      "ARTICLE",
      "ASIDE",
      "AUDIO",
      "BLOCKQUOTE",
      "BODY",
      "CANVAS",
      "CENTER",
      "DD",
      "DIR",
      "DIV",
      "DL",
      "DT",
      "FIELDSET",
      "FIGCAPTION",
      "FIGURE",
      "FOOTER",
      "FORM",
      "FRAMESET",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "HEADER",
      "HGROUP",
      "HR",
      "HTML",
      "ISINDEX",
      "LI",
      "MAIN",
      "MENU",
      "NAV",
      "NOFRAMES",
      "NOSCRIPT",
      "OL",
      "OUTPUT",
      "P",
      "PRE",
      "SECTION",
      "TABLE",
      "TBODY",
      "TD",
      "TFOOT",
      "TH",
      "THEAD",
      "TR",
      "UL"
    ];
    exports.defaultIgnoreElements = [
      "AREA",
      "BASE",
      "COL",
      "COMMAND",
      "EMBED",
      "HEAD",
      "INPUT",
      "KEYGEN",
      "LINK",
      "META",
      "PARAM",
      "SCRIPT",
      "SOURCE",
      "STYLE",
      "TRACK",
      "WBR"
    ];
    exports.contentlessElements = ["BR", "HR", "IMG"];
    exports.defaultOptions = Object.freeze({
      preferNativeParser: false,
      codeFence: "```",
      bulletMarker: "*",
      indent: "  ",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
      strongDelimiter: "**",
      strikeDelimiter: "~~",
      maxConsecutiveNewlines: 3,
      /**
       * Character:               Affects:                       Example:
       *
       *     \                      Escaping                        \-
       *     `                      Code                            `` code ``,  ```lang\n code block \n```
       *     *                      Bullet & Separators             * item,  ***
       *     _                      Bold, Italics, Separator        _italic_,  __bold__,  ^___
       *     ~                      Strikethrough, Code             ~~strike~~,  ~~~lang\n code block \n~~~
       *     [                      Url                             [caption](url)
       *     ]                      Url                             [caption](url)
       */
      globalEscape: [/[\\`*_~\[\]]/gm, "\\$&"],
      /**
       * Note:  The following compiled pattern was selected after perf testing various alternatives.
       *        Please be mindful of performance if updating/changing it.
       *
       * Sequence:                Affects:                        Example:
       *
       *    +(space)                Bullets                         + item
       *    =                       Heading                         heading\n====
       *    #{1,6}(space)           Heading                         ## Heading
       *    >                       Blockquote                      > quote
       *    -                       Bullet, Header, Separator       - item, heading\n---, ---
       *    \d+\.(space)            Numbered list item              1. Item
       */
      lineStartEscape: [
        /^(\s*?)((?:\+\s)|(?:[=>-])|(?:#{1,6}\s))|(?:(\d+)(\.\s))/gm,
        "$1$3\\$2$4"
      ],
      useInlineLinks: true
    });
    exports.defaultTranslators = {
      /* Pre-formatted text */
      "pre": { noEscape: true, preserveWhitespace: true },
      /* Line break */
      "br": { content: `  
`, recurse: false },
      /* Horizontal Rule*/
      "hr": { content: "---", recurse: false },
      /* Headings */
      "h1,h2,h3,h4,h5,h6": ({ node }) => ({
        prefix: "#".repeat(+node.tagName.charAt(1)) + " "
      }),
      /* Bold / Strong */
      "strong,b": {
        spaceIfRepeatingChar: true,
        postprocess: ({ content, options: { strongDelimiter } }) => (0, utilities_1.isWhiteSpaceOnly)(content) ? translator_1.PostProcessResult.RemoveNode : (0, utilities_1.tagSurround)(content, strongDelimiter)
      },
      /* Strikethrough */
      "del,s,strike": {
        spaceIfRepeatingChar: true,
        postprocess: ({ content, options: { strikeDelimiter } }) => (0, utilities_1.isWhiteSpaceOnly)(content) ? translator_1.PostProcessResult.RemoveNode : (0, utilities_1.tagSurround)(content, strikeDelimiter)
      },
      /* Italic / Emphasis */
      "em,i": {
        spaceIfRepeatingChar: true,
        postprocess: ({ content, options: { emDelimiter } }) => (0, utilities_1.isWhiteSpaceOnly)(content) ? translator_1.PostProcessResult.RemoveNode : (0, utilities_1.tagSurround)(content, emDelimiter)
      },
      /* Lists (ordered & unordered) */
      "ol,ul": ({ listKind }) => ({
        surroundingNewlines: listKind ? 1 : 2
      }),
      /* List Item */
      "li": ({ options: { bulletMarker }, indentLevel, listKind, listItemNumber }) => {
        const indentationLevel = +(indentLevel || 0);
        return {
          prefix: "   ".repeat(+(indentLevel || 0)) + (listKind === "OL" && listItemNumber !== void 0 ? `${listItemNumber}. ` : `${bulletMarker} `),
          surroundingNewlines: 1,
          postprocess: ({ content }) => (0, utilities_1.isWhiteSpaceOnly)(content) ? translator_1.PostProcessResult.RemoveNode : content.trim().replace(/([^\r\n])(?:\r?\n)+/g, `$1  
${"   ".repeat(indentationLevel)}`).replace(/(\S+?)[^\S\r\n]+$/gm, "$1  ")
        };
      },
      /* Block Quote */
      "blockquote": {
        postprocess: ({ content }) => (0, utilities_1.trimNewLines)(content).replace(/^(>*)[^\S\r\n]?/gm, `>$1 `)
      },
      /* Code (block / inline) */
      "code": ({ node, parent, options: { codeFence, codeBlockStyle }, visitor }) => {
        var _a2, _b;
        const isCodeBlock = ["PRE", "WRAPPED-PRE"].includes(parent === null || parent === void 0 ? void 0 : parent.tagName) && parent.childNodes.length < 2;
        if (!isCodeBlock)
          return {
            spaceIfRepeatingChar: true,
            noEscape: true,
            postprocess: ({ content }) => {
              var _a3, _b2;
              const delimiter = "`" + (((_b2 = (_a3 = content.match(/`+/g)) === null || _a3 === void 0 ? void 0 : _a3.sort((a, b) => b.length - a.length)) === null || _b2 === void 0 ? void 0 : _b2[0]) || "");
              const padding = delimiter.length > 1 ? " " : "";
              return (0, utilities_1.surround)((0, utilities_1.surround)(content, padding), delimiter);
            }
          };
        if (codeBlockStyle === "fenced") {
          const language = ((_b = (_a2 = node.getAttribute("class")) === null || _a2 === void 0 ? void 0 : _a2.match(/language-(\S+)/)) === null || _b === void 0 ? void 0 : _b[1]) || "";
          return {
            noEscape: true,
            prefix: codeFence + language + "\n",
            postfix: "\n" + codeFence,
            childTranslators: visitor.instance.codeBlockTranslators
          };
        } else {
          return {
            noEscape: true,
            postprocess: ({ content }) => content.replace(/^/gm, "    "),
            childTranslators: visitor.instance.codeBlockTranslators
          };
        }
      },
      /* Table */
      "table": ({ visitor }) => ({
        surroundingNewlines: 2,
        childTranslators: visitor.instance.tableTranslators,
        postprocess: ({ content, nodeMetadata, node }) => {
          const rawRows = (0, utilities_1.splitSpecial)(content).map(({ text }) => text.replace(/^(?:\|\s+)?(.+)\s*\|\s*$/, "$1"));
          const rows = [];
          let colWidth = [];
          for (const row of rawRows) {
            if (!row)
              continue;
            const cols = row.split(" |").map((c, i) => {
              c = c.trim();
              if (colWidth.length < i + 1 || colWidth[i] < c.length)
                colWidth[i] = c.length;
              return c;
            });
            rows.push(cols);
          }
          if (rows.length < 1)
            return translator_1.PostProcessResult.RemoveNode;
          const maxCols = colWidth.length;
          let res = "";
          const caption = nodeMetadata.get(node).tableMeta.caption;
          if (caption)
            res += caption + "\n";
          rows.forEach((cols, rowNumber) => {
            var _a2;
            res += "| ";
            for (let i = 0; i < maxCols; i++) {
              let c = (_a2 = cols[i]) !== null && _a2 !== void 0 ? _a2 : "";
              c += " ".repeat(Math.max(0, colWidth[i] - c.length));
              res += c + " |" + (i < maxCols - 1 ? " " : "");
            }
            res += "\n";
            if (rowNumber === 0)
              res += "|" + colWidth.map((w) => " " + "-".repeat(w) + " |").join("") + "\n";
          });
          return res;
        }
      }),
      /* Link */
      "a": ({ node, options, visitor }) => {
        const href = node.getAttribute("href");
        if (!href)
          return {};
        let encodedHref = "";
        for (const chr of href) {
          switch (chr) {
            case "(":
              encodedHref += "%28";
              break;
            case ")":
              encodedHref += "%29";
              break;
            case "_":
              encodedHref += "%5F";
              break;
            case "*":
              encodedHref += "%2A";
              break;
            default:
              encodedHref += chr;
          }
        }
        const title = node.getAttribute("title");
        if (node.textContent === href && options.useInlineLinks)
          return { content: `<${encodedHref}>` };
        return {
          postprocess: ({ content }) => content.replace(/(?:\r?\n)+/g, " "),
          childTranslators: visitor.instance.aTagTranslators,
          prefix: "[",
          postfix: "]" + (!options.useLinkReferenceDefinitions ? `(${encodedHref}${title ? ` "${title}"` : ""})` : `[${visitor.addOrGetUrlDefinition(encodedHref)}]`)
        };
      },
      /* Image */
      "img": ({ node, options }) => {
        const src = node.getAttribute("src") || "";
        if (!src || !options.keepDataImages && /^data:/i.test(src))
          return { ignore: true };
        const alt = node.getAttribute("alt") || "";
        const title = node.getAttribute("title") || "";
        return {
          content: `![${alt}](${src}${title && ` "${title}"`})`,
          recurse: false
        };
      }
    };
    exports.tableTranslatorConfig = {
      /* Table Caption */
      "caption": ({ visitor }) => ({
        surroundingNewlines: false,
        childTranslators: visitor.instance.tableCellTranslators,
        postprocess: ({ content, nodeMetadata, node }) => {
          const caption = content.replace(/(?:\r?\n)+/g, " ").trim();
          if (caption)
            nodeMetadata.get(node).tableMeta.caption = "__" + caption + "__";
          return translator_1.PostProcessResult.RemoveNode;
        }
      }),
      /* Table row */
      "tr": ({ visitor }) => ({
        surroundingNewlines: false,
        childTranslators: visitor.instance.tableRowTranslators,
        postfix: "\n",
        prefix: "| ",
        postprocess: ({ content }) => !/ \|\s*$/.test(content) ? translator_1.PostProcessResult.RemoveNode : content
      }),
      /* Table cell, (header cell) */
      "th,td": ({ visitor }) => ({
        surroundingNewlines: false,
        childTranslators: visitor.instance.tableCellTranslators,
        prefix: " ",
        postfix: " |",
        postprocess: ({ content }) => (0, utilities_1.trimNewLines)(content).replace("|", "\\|").replace(/(?:\r?\n)+/g, " ").trim()
      })
    };
    exports.tableRowTranslatorConfig = {
      "th,td": exports.tableTranslatorConfig["th,td"]
    };
    exports.tableCellTranslatorConfig = {
      "a": exports.defaultTranslators["a"],
      "strong,b": exports.defaultTranslators["strong,b"],
      "del,s,strike": exports.defaultTranslators["del,s,strike"],
      "em,i": exports.defaultTranslators["em,i"],
      "img": exports.defaultTranslators["img"]
    };
    exports.defaultCodeBlockTranslators = {
      "br": { content: `
`, recurse: false },
      "hr": { content: "---", recurse: false },
      "h1,h2,h3,h4,h5,h6": { prefix: "[", postfix: "]" },
      "ol,ul": exports.defaultTranslators["ol,ul"],
      "li": exports.defaultTranslators["li"],
      "tr": { surroundingNewlines: true },
      "img": { recurse: false }
    };
    exports.aTagTranslatorConfig = {
      "br": { content: "\n", recurse: false },
      "hr": { content: "\n", recurse: false },
      "pre": exports.defaultTranslators["pre"],
      "strong,b": exports.defaultTranslators["strong,b"],
      "del,s,strike": exports.defaultTranslators["del,s,strike"],
      "em,i": exports.defaultTranslators["em,i"],
      "img": exports.defaultTranslators["img"]
    };
    exports.nodeHtmlParserConfig = {
      lowerCaseTagName: false,
      comment: false,
      fixNestedATags: true,
      blockTextElements: {
        script: false,
        noscript: false,
        style: false
      }
    };
  }
});

// node_modules/node-html-markdown/dist/nodes.js
var require_nodes = __commonJS({
  "node_modules/node-html-markdown/dist/nodes.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isElementNode = exports.isCommentNode = exports.isTextNode = exports.CommentNode = exports.NodeType = void 0;
    var node_html_parser_1 = require_dist();
    Object.defineProperty(exports, "CommentNode", { enumerable: true, get: function() {
      return node_html_parser_1.CommentNode;
    } });
    Object.defineProperty(exports, "NodeType", { enumerable: true, get: function() {
      return node_html_parser_1.NodeType;
    } });
    var isTextNode = (node) => node.nodeType === node_html_parser_1.NodeType.TEXT_NODE;
    exports.isTextNode = isTextNode;
    var isCommentNode = (node) => node.nodeType === node_html_parser_1.NodeType.COMMENT_NODE;
    exports.isCommentNode = isCommentNode;
    var isElementNode = (node) => node.nodeType === node_html_parser_1.NodeType.ELEMENT_NODE;
    exports.isElementNode = isElementNode;
  }
});

// node_modules/node-html-markdown/dist/visitor.js
var require_visitor = __commonJS({
  "node_modules/node-html-markdown/dist/visitor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMarkdownForHtmlNodes = exports.Visitor = void 0;
    var nodes_1 = require_nodes();
    var utilities_1 = require_utilities();
    var translator_1 = require_translator();
    var config_1 = require_config();
    var Visitor = class {
      constructor(instance, rootNode, fileName) {
        this.instance = instance;
        this.rootNode = rootNode;
        this.fileName = fileName;
        this.nodeMetadata = /* @__PURE__ */ new Map();
        this.urlDefinitions = [];
        this.result = {
          text: "",
          trailingNewlineStats: {
            whitespace: 0,
            newLines: 0
          }
        };
        this.options = instance.options;
        this.optimizeTree(rootNode);
        this.visitNode(rootNode);
      }
      /* ********************************************************* */
      // region: Methods
      /* ********************************************************* */
      addOrGetUrlDefinition(url) {
        let id = this.urlDefinitions.findIndex((u) => u === url);
        if (id < 0)
          id = this.urlDefinitions.push(url) - 1;
        return id + 1;
      }
      appendResult(s, startPos, spaceIfRepeatingChar) {
        if (!s && startPos === void 0)
          return;
        const { result } = this;
        if (startPos !== void 0)
          result.text = result.text.substr(0, startPos);
        result.text += (spaceIfRepeatingChar && result.text.slice(-1) === s[0] ? " " : "") + s;
        result.trailingNewlineStats = (0, utilities_1.getTrailingWhitespaceInfo)(result.text);
      }
      appendNewlines(count) {
        const { newLines } = this.result.trailingNewlineStats;
        this.appendResult("\n".repeat(Math.max(0, +count - newLines)));
      }
      // endregion
      /* ********************************************************* */
      // region: Internal Methods
      /* ********************************************************* */
      /**
       * Optimize tree, flagging nodes that have usable content
       */
      optimizeTree(node) {
        (0, utilities_1.perfStart)("Optimize tree");
        const { translators } = this.instance;
        (function visit(node2) {
          let res = false;
          if ((0, nodes_1.isTextNode)(node2) || (0, nodes_1.isElementNode)(node2) && config_1.contentlessElements.includes(node2.tagName)) {
            res = true;
          } else {
            const childNodes = (0, utilities_1.getChildNodes)(node2);
            if (!childNodes.length) {
              const translator = translators[node2.tagName];
              if ((translator === null || translator === void 0 ? void 0 : translator.preserveIfEmpty) || typeof translator === "function")
                res = true;
            } else
              for (const child of childNodes) {
                if (!res)
                  res = visit(child);
                else
                  visit(child);
              }
          }
          return node2.preserve = res;
        })(node);
        (0, utilities_1.perfStop)("Optimize tree");
      }
      /**
       * Apply escaping and custom replacement rules
       */
      processText(text, metadata) {
        let res = text;
        if (!(metadata === null || metadata === void 0 ? void 0 : metadata.preserveWhitespace))
          res = res.replace(/\s+/g, " ");
        if (metadata === null || metadata === void 0 ? void 0 : metadata.noEscape)
          return res;
        const { lineStartEscape, globalEscape, textReplace } = this.options;
        res = res.replace(globalEscape[0], globalEscape[1]).replace(lineStartEscape[0], lineStartEscape[1]);
        if (textReplace)
          for (const [pattern, r] of textReplace)
            res = res.replace(pattern, r);
        return res;
      }
      visitNode(node, textOnly, metadata) {
        var _a2, _b, _c, _d;
        var _e, _f;
        const { result } = this;
        if (!node.preserve)
          return;
        if ((0, nodes_1.isTextNode)(node)) {
          if (node.wholeText) {
            (_a2 = (_e = node).text) !== null && _a2 !== void 0 ? _a2 : _e.text = node.wholeText;
            (_b = (_f = node).trimmedText) !== null && _b !== void 0 ? _b : _f.trimmedText = (0, utilities_1.trimNewLines)(node.wholeText);
          }
          return node.isWhitespace && !(metadata === null || metadata === void 0 ? void 0 : metadata.preserveWhitespace) ? !result.text.length || result.trailingNewlineStats.whitespace > 0 ? void 0 : this.appendResult(" ") : this.appendResult(this.processText((metadata === null || metadata === void 0 ? void 0 : metadata.preserveWhitespace) ? node.text : node.trimmedText, metadata));
        }
        if (textOnly || !(0, nodes_1.isElementNode)(node))
          return;
        const translatorCfgOrFactory = (metadata === null || metadata === void 0 ? void 0 : metadata.translators) ? metadata.translators[node.tagName] : this.instance.translators[node.tagName];
        switch (node.tagName) {
          case "UL":
          case "OL":
            metadata = Object.assign(Object.assign({}, metadata), { listItemNumber: 0, listKind: node.tagName, indentLevel: ((_c = metadata === null || metadata === void 0 ? void 0 : metadata.indentLevel) !== null && _c !== void 0 ? _c : -1) + 1 });
            break;
          case "LI":
            if ((metadata === null || metadata === void 0 ? void 0 : metadata.listKind) === "OL")
              metadata.listItemNumber = ((_d = metadata.listItemNumber) !== null && _d !== void 0 ? _d : 0) + 1;
            break;
          case "PRE":
            metadata = Object.assign(Object.assign({}, metadata), { preserveWhitespace: true });
            break;
          case "TABLE":
            metadata = Object.assign(Object.assign({}, metadata), { tableMeta: {
              node
            } });
        }
        if (metadata)
          this.nodeMetadata.set(node, metadata);
        if (!translatorCfgOrFactory) {
          for (const child of (0, utilities_1.getChildNodes)(node))
            this.visitNode(child, textOnly, metadata);
          return;
        }
        let cfg;
        let ctx;
        if (!(0, translator_1.isTranslatorConfig)(translatorCfgOrFactory)) {
          ctx = (0, translator_1.createTranslatorContext)(this, node, metadata, translatorCfgOrFactory.base);
          cfg = Object.assign(Object.assign({}, translatorCfgOrFactory.base), translatorCfgOrFactory(ctx));
        } else
          cfg = translatorCfgOrFactory;
        if (cfg.ignore)
          return;
        if (cfg.noEscape && !(metadata === null || metadata === void 0 ? void 0 : metadata.noEscape)) {
          metadata = Object.assign(Object.assign({}, metadata), { noEscape: cfg.noEscape });
          this.nodeMetadata.set(node, metadata);
        }
        if (cfg.childTranslators && cfg.childTranslators !== (metadata === null || metadata === void 0 ? void 0 : metadata.translators)) {
          metadata = Object.assign(Object.assign({}, metadata), { translators: cfg.childTranslators });
          this.nodeMetadata.set(node, metadata);
        }
        const startPosOuter = result.text.length;
        if (cfg.surroundingNewlines)
          this.appendNewlines(+cfg.surroundingNewlines);
        if (cfg.prefix)
          this.appendResult(cfg.prefix);
        if (typeof cfg.content === "string")
          this.appendResult(cfg.content, void 0, cfg.spaceIfRepeatingChar);
        else {
          const startPos = result.text.length;
          for (const child of (0, utilities_1.getChildNodes)(node))
            this.visitNode(child, cfg.recurse === false, metadata);
          if (cfg.postprocess) {
            const postRes = cfg.postprocess(Object.assign(Object.assign({}, ctx || (0, translator_1.createTranslatorContext)(this, node, metadata)), { content: result.text.substr(startPos) }));
            if (postRes === translator_1.PostProcessResult.RemoveNode) {
              if (node.tagName === "LI" && (metadata === null || metadata === void 0 ? void 0 : metadata.listItemNumber))
                --metadata.listItemNumber;
              return this.appendResult("", startPosOuter);
            }
            if (typeof postRes === "string")
              this.appendResult(postRes, startPos, cfg.spaceIfRepeatingChar);
          }
        }
        if (cfg.postfix)
          this.appendResult(cfg.postfix);
        if (cfg.surroundingNewlines)
          this.appendNewlines(+cfg.surroundingNewlines);
      }
    };
    exports.Visitor = Visitor;
    function getMarkdownForHtmlNodes(instance, rootNode, fileName) {
      (0, utilities_1.perfStart)("walk");
      const visitor = new Visitor(instance, rootNode, fileName);
      let result = visitor.result.text;
      (0, utilities_1.perfStop)("walk");
      if (instance.options.useLinkReferenceDefinitions) {
        if (/[^\r\n]/.test(result.slice(-1)))
          result += "\n";
        visitor.urlDefinitions.forEach((url, idx) => {
          result += `
[${idx + 1}]: ${url}`;
        });
      }
      const { maxConsecutiveNewlines } = instance.options;
      if (maxConsecutiveNewlines)
        result = result.replace(new RegExp(String.raw`(?:\r?\n\s*)+((?:\r?\n\s*){${maxConsecutiveNewlines}})`, "g"), "$1");
      return (0, utilities_1.trimNewLines)(result);
    }
    exports.getMarkdownForHtmlNodes = getMarkdownForHtmlNodes;
  }
});

// node_modules/node-html-markdown/dist/main.js
var require_main = __commonJS({
  "node_modules/node-html-markdown/dist/main.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeHtmlMarkdown = void 0;
    var translator_1 = require_translator();
    var config_1 = require_config();
    var utilities_1 = require_utilities();
    var visitor_1 = require_visitor();
    var NodeHtmlMarkdown = class _NodeHtmlMarkdown {
      constructor(options, customTranslators, customCodeBlockTranslators) {
        var _a2, _b, _c, _d;
        this.translators = new translator_1.TranslatorCollection();
        this.aTagTranslators = new translator_1.TranslatorCollection();
        this.codeBlockTranslators = new translator_1.TranslatorCollection();
        this.tableTranslators = new translator_1.TranslatorCollection();
        this.tableRowTranslators = new translator_1.TranslatorCollection();
        this.tableCellTranslators = new translator_1.TranslatorCollection();
        this.options = Object.assign(Object.assign({}, config_1.defaultOptions), options);
        const ignoredElements = (_b = (_a2 = this.options.ignore) === null || _a2 === void 0 ? void 0 : _a2.concat(config_1.defaultIgnoreElements)) !== null && _b !== void 0 ? _b : config_1.defaultIgnoreElements;
        const blockElements = (_d = (_c = this.options.blockElements) === null || _c === void 0 ? void 0 : _c.concat(config_1.defaultBlockElements)) !== null && _d !== void 0 ? _d : config_1.defaultBlockElements;
        ignoredElements === null || ignoredElements === void 0 ? void 0 : ignoredElements.forEach((el) => {
          this.translators.set(el, { ignore: true, recurse: false });
          this.codeBlockTranslators.set(el, { ignore: true, recurse: false });
        });
        blockElements === null || blockElements === void 0 ? void 0 : blockElements.forEach((el) => {
          this.translators.set(el, { surroundingNewlines: 2 });
          this.codeBlockTranslators.set(el, { surroundingNewlines: 2 });
        });
        for (const [elems, cfg] of Object.entries(Object.assign(Object.assign({}, config_1.defaultTranslators), customTranslators)))
          this.translators.set(elems, cfg, true);
        for (const [elems, cfg] of Object.entries(Object.assign(Object.assign({}, config_1.defaultCodeBlockTranslators), customCodeBlockTranslators)))
          this.codeBlockTranslators.set(elems, cfg, true);
        for (const [elems, cfg] of Object.entries(config_1.aTagTranslatorConfig))
          this.aTagTranslators.set(elems, cfg, true);
        for (const [elems, cfg] of Object.entries(config_1.tableTranslatorConfig))
          this.tableTranslators.set(elems, cfg, true);
        for (const [elems, cfg] of Object.entries(config_1.tableRowTranslatorConfig))
          this.tableRowTranslators.set(elems, cfg, true);
        for (const [elems, cfg] of Object.entries(config_1.tableCellTranslatorConfig))
          this.tableCellTranslators.set(elems, cfg, true);
        if (!this.options.textReplace)
          this.options.textReplace = [];
        this.options.textReplace.push([/^<!DOCTYPE.*>/gmi, ""]);
      }
      static translate(htmlOrFiles, opt, customTranslators, customCodeBlockTranslators) {
        return _NodeHtmlMarkdown.prototype.translateWorker.call(new _NodeHtmlMarkdown(opt, customTranslators, customCodeBlockTranslators), htmlOrFiles);
      }
      translate(htmlOrFiles) {
        return this.translateWorker(htmlOrFiles);
      }
      // endregion
      /* ********************************************************* */
      // region: Internal Methods
      /* ********************************************************* */
      translateWorker(htmlOrFiles) {
        const inputIsCollection = typeof htmlOrFiles !== "string";
        const inputFiles = !inputIsCollection ? { "default": htmlOrFiles } : htmlOrFiles;
        const outputFiles = {};
        for (const [fileName, html] of Object.entries(inputFiles)) {
          const parsedHtml = (0, utilities_1.parseHTML)(html, this.options);
          outputFiles[fileName] = (0, visitor_1.getMarkdownForHtmlNodes)(this, parsedHtml, fileName !== "default" ? fileName : void 0);
        }
        return inputIsCollection ? outputFiles : outputFiles["default"];
      }
    };
    exports.NodeHtmlMarkdown = NodeHtmlMarkdown;
  }
});

// node_modules/node-html-markdown/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/node-html-markdown/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PostProcessResult = exports.TranslatorCollection = exports.NodeHtmlMarkdown = void 0;
    var main_1 = require_main();
    Object.defineProperty(exports, "NodeHtmlMarkdown", { enumerable: true, get: function() {
      return main_1.NodeHtmlMarkdown;
    } });
    var translator_1 = require_translator();
    Object.defineProperty(exports, "TranslatorCollection", { enumerable: true, get: function() {
      return translator_1.TranslatorCollection;
    } });
    Object.defineProperty(exports, "PostProcessResult", { enumerable: true, get: function() {
      return translator_1.PostProcessResult;
    } });
  }
});

// index.ts
var chrome_exports = {};
__export(chrome_exports, {
  default: () => chrome_default
});
module.exports = __toCommonJS(chrome_exports);
var chrome_default = {
  name: "chrome",
  tokens: [
    {
      name: "current-page",
      description: "Google Chrome Current Page",
      args: [],
      color: "#f8bd13",
      render(_args) {
        return [];
      },
      async hydrate(mainHandle, args, prompt) {
        const { Readability } = await Promise.resolve().then(() => __toESM(require_readability()));
        const { parseHTML: parseHTML2 } = await Promise.resolve().then(() => (init_esm10(), esm_exports5));
        const { NodeHtmlMarkdown } = await Promise.resolve().then(() => __toESM(require_dist2()));
        let url, content;
        try {
          ({ url, content } = await mainHandle.sendMessageToExternalClient(
            "chrome-client",
            "get-current-page"
          ));
        } catch (e) {
          throw new Error("Chrome client failed to respond.");
        }
        if (!content) {
          prompt.appendContextItem({
            type: "text",
            title: url,
            content: "No content extracted from page"
          });
        } else {
          let { document: document2 } = parseHTML2(content);
          let reader = new Readability(document2);
          let article = reader.parse();
          if (article?.content) {
            const markdown = NodeHtmlMarkdown.translate(article.content);
            prompt.appendContextItem({
              type: "text",
              title: url,
              content: markdown
            });
          } else {
            const markdown = document2.body.textContent;
            prompt.appendContextItem({
              type: "text",
              title: url,
              content: markdown
            });
          }
        }
        prompt.appendText(url);
      }
    }
  ],
  actions: [],
  handlers: {
    main: {
      "chrome-client:new-page": async (handler4) => {
        handler4.sendMessageToRenderer("prioritize-tokens");
      }
    },
    renderer: {
      "prioritize-tokens": async (handler4) => {
        handler4.getTrackTokens().forEach((token) => {
          token.prioritize();
        });
      }
    }
  }
};
/*! Bundled license information:

he/he.js:
  (*! https://mths.be/he v1.2.0 by @mathias | MIT license *)
*/
