const FOOTER_MAIN_DEBUG = false;
const FOOTER_MAIN_ID = "footer-main";
const FOOTER_MAIN_CONNECT_CLASS = "connect";
const FOOTER_MAIN_CONNECT_MAXIMIZED_STYLES = "is-maximized";
const FOOTER_MAIN_CONNECT_MINIMIZED_STYLE = "is-minimized-no";
const FOOTER_MAIN_CONNECT_CLONE_REVEAL = "reveal-connect";
const FOOTER_MAIN_VISIBILITY_MIN = 0.35;
const FOOTER_MAIN_VISIBILITY_MAX = 0.75;

class FooterMain {
  constructor() {
    this.footer = document.querySelector("#" + FOOTER_MAIN_ID);
    this.connectElement = this.footer.querySelector("." + FOOTER_MAIN_CONNECT_CLASS);
  }

  footer = null; // HTMLElement - footer object
  connectElement = null; // HTMLElement - connect element object
  connectElementClone = null; // HTMLElement - connect element clone object

  print() {
    console.log("Footer: " + this.footer + "\n" +
      "Connect Element: " + this.connectElement + "\n" +
      "Connect Element Clone: " + this.connectElementClone);
  }


  // The connection element is moved in and out of the document flow so
  // a duplicate connection element is added to maintain the height
  // of the element's container.  Prefer this implementation rather than
  // attempting to retrieve updated height on user directed zoom or font 
  // size change. The duplicate's contents are transparent, but
  // the container can serve as a visual element in the UI design.
  // Anchors in the duplicate are disabled.
  addConnectElementClone() {
    this.connectElementClone = this.connectElement.cloneNode(true);
    this.connectElementClone.classList.add("clone");
    this.connectElementClone.classList.remove(FOOTER_MAIN_CONNECT_MINIMIZED_STYLE);
    this.connectElementClone.classList.remove(FOOTER_MAIN_CONNECT_MAXIMIZED_STYLES);
    this.connectElementClone.setAttribute("aria-hidden", "true");

    var footerMainConnectCloneAnchors = this.connectElementClone.querySelectorAll("a");
    footerMainConnectCloneAnchors.forEach((footerMainConnectCloneAnchor) => {
      footerMainConnectCloneAnchor.setAttribute("aria-disabled", "true");
      footerMainConnectCloneAnchor.setAttribute("tabindex", "-1");
    }); 
    this.connectElement.before(this.connectElementClone);
  }


  generateFocusListener() {
    document.addEventListener('focus', () => {
      if(document.activeElement.closest("#" + FOOTER_MAIN_ID + " ." + FOOTER_MAIN_CONNECT_CLASS)) {
        if(FOOTER_MAIN_DEBUG)console.log(document.activeElement + ", a descendant of the connect element, is focused. Scroll to bottom of app-container.");
        var appContainer = document.querySelector("#app-container");
        appContainer.scrollTo(0, appContainer.scrollHeight);
      }
    }, true);
  }


  // Generate an Intersection Observer to minimize and maximize the 
  // connect section of the footer.
  generateIntersectionObserver() {
    var thisConnectElementClone = this.connectElementClone;
    var thisConnectElement = this.connectElement;

    const intersectionObserverFooterMain = new IntersectionObserver(function(entries) {
      let intersectionRatio = entries[0].intersectionRatio;
      if(FOOTER_MAIN_DEBUG)console.log("footer-main is " + intersectionRatio * 100 + "% visible.");

      if(intersectionRatio >= FOOTER_MAIN_VISIBILITY_MAX) {
        if(FOOTER_MAIN_DEBUG)console.log("footer-main is >= " + FOOTER_MAIN_VISIBILITY_MAX * 100 + "% visible. Show Connect maximized.");
        thisConnectElementClone.classList.add(FOOTER_MAIN_CONNECT_CLONE_REVEAL);
        thisConnectElement.classList.remove(FOOTER_MAIN_CONNECT_MINIMIZED_STYLE);
        thisConnectElement.classList.add(FOOTER_MAIN_CONNECT_MAXIMIZED_STYLES);
      }
      
      if(intersectionRatio < FOOTER_MAIN_VISIBILITY_MIN) {
        if(FOOTER_MAIN_DEBUG)console.log("footer-main is < " + FOOTER_MAIN_VISIBILITY_MIN * 100 + "% visible. Show Connect minimized.");
        thisConnectElementClone.classList.remove(FOOTER_MAIN_CONNECT_CLONE_REVEAL);
        thisConnectElement.classList.remove(FOOTER_MAIN_CONNECT_MAXIMIZED_STYLES);
        thisConnectElement.classList.add(FOOTER_MAIN_CONNECT_MINIMIZED_STYLE);
      }
    }, { threshold: [FOOTER_MAIN_VISIBILITY_MIN, FOOTER_MAIN_VISIBILITY_MAX] });

    intersectionObserverFooterMain.observe(this.footer);
  }
}

export function generateFooterMain() {
  var footerMain = new FooterMain();
  footerMain.addConnectElementClone();
  footerMain.generateIntersectionObserver();
  // footerMain.generateFocusListener();
}