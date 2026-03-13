import {createFocusableList} from "./FocusableList.js";
import {generateFooterMain} from "./FooterMain.js";
import {generateTableOfContents, toggleNavigable, expandSection, collapseSection} from "./TableOfContents.js";

// Create auto-focused list items for home page qualifications list
const qualificationsList = document.querySelector("#page-home .qualifications-list");
if(qualificationsList) {
  createFocusableList(qualificationsList, "-25% 0% -65% 0%", [.1], "focused", "unfocused");
}

// Generate main footer functionality
generateFooterMain();



// Generate Table of Contents
window._TableOfContents = { generateTableOfContents, toggleNavigable, expandSection, collapseSection };
window._TableOfContents.generateTableOfContents();

let appContainer = document.getElementById("app-container");
let appContainerCurrentScrollPosition = 0;
let appContainerLastScrollPosition = 0;
let pathName = document.location.pathname;

appContainer.onscroll = function() {
  appContainerLastScrollPosition = appContainerCurrentScrollPosition;
  // console.log('app-container last scroll position:', appContainerLastScrollPosition);

  appContainerCurrentScrollPosition = appContainer.scrollTop;
  // console.log('app-container current scroll position:', appContainerCurrentScrollPosition);
};

window.onhashchange = function() {
  if(window.location.hash) {
    console.log("onhashchange: hash is " + window.location.hash)
    window.location.href = window.location.href;

    const newFragment = window.location.hash
    var fragmentSection = document.getElementById(newFragment.slice(1));
    console.log('Fragment id:', fragmentSection.id);
    toggleNavigable(fragmentSection.id);
    // expandSection(fragmentSection, true, true);
  }
  else {
    // Collapse all sections
    var sectionsToCollapse = document.querySelectorAll(".navigable > section.is-expanded");
    console.log("onhashchange: no hash found. collapse all " + sectionsToCollapse.length + " expanded sections.");

    if(sectionsToCollapse) {
      sectionsToCollapse.forEach(section => {
        collapseSection(section);
      });
    }

    // Scroll to last position
    appContainer.scrollTo(0, appContainerLastScrollPosition);
  }
};


window.onload = function() {
  setTimeout(function(){
    let appContainerMain = document.querySelector("main");
    console.log("main " + appContainerMain);
    appContainerMain.style.setProperty("--main-loader-display", "none");
    appContainerMain.classList.add("is-loaded");
  }, 500); 
}

window.onpageshow = function() {
  if(window.location.hash) {
    console.log("onpageshow: hash is " + window.location.hash);

    const newFragment = window.location.hash
    var fragmentSection = document.getElementById(newFragment.slice(1));
    console.log('Fragment id:', fragmentSection.id);
    expandSection(fragmentSection, true, true);
    // toggleNavigable(fragmentSection.id);
  }

  const savedScrollPos = sessionStorage.getItem('scrollPos_'+ pathName);
  console.log("onpageshow: savedScrollPos for " + pathName + " is " + savedScrollPos);
  if (savedScrollPos) {
    const entry = performance.getEntriesByType("navigation")[0];
    if (entry && entry.type === 'back_forward') {
      console.log("onpageshow: loaded from history traversal (back/forward button).");
      console.log("onpageshow: scrolling to savedScrollPos 0," + savedScrollPos);
      appContainer.scrollTo(0, parseInt(savedScrollPos));
    }

    sessionStorage.removeItem('scrollPos_'+ pathName);
  }
}

window.onpagehide = function() {
  sessionStorage.setItem('scrollPos_'+ pathName, appContainerCurrentScrollPosition);
}

// window.addEventListener('hashchange', () => {
//   const newFragment = window.location.hash;
//   console.log('Fragment changed to:', newFragment);
//   if(newFragment && newFragment != "") {
//     var fragmentSection = document.getElementById(newFragment.slice(1));
//     console.log('Fragment id:', fragmentSection.id);
//     expandSection(fragmentSection, true);
//   }
// });

// document.addEventListener('focus', () => {
//   console.log(document.activeElement);
//   var closestElem = document.activeElement.closest(".navigable section.toc-ignore");
//   console.log("closest: " + closestElem);
//   if(closestElem) {
//     console.log("closest elem id: " + closestElem.id);
//     expandSection(closestElem.parentElement, false);
//   }
// }, true);

// document.addEventListener('focusin', function(event) {
//   // This function will be called whenever any element within the document gains focus
//   console.log('Element focused:', event.target);
//   console.log('Element focused parent:', event.target.parentElement);
//   console.log('Element focused classlist:', event.target.parentElement.classList);
//   // Add your logic here to handle the focus event
// }, true);

// document.addEventListener('focusin', (event) => {
//   console.log("active element " + document.activeElement);
//   console.log("focused target: " + event.target);
//   console.log("focused target classlist: " + event.target.classList);
//   // if(event.target.classList.contains("navigable"))
//   //   console.log("focused on navigable element: " + event.target);
  
//   // if (!event.target.classList.contains('allow-focus')) {
//   //   event.target.blur();
//   // }
// }, true);