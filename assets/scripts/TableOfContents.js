const TOC_DEBUG = false;

const tocClass = "table-of-contents";
const tocContainerElement = "#app-supplemental";
const classIsInteractive = "is-interactive";
const classIsSectionSelected = "isSelected";
const classParentIsSectionSelected = "isParentSelected";
var sectionIntersectRatios = [];
var tocListItems = [];
var observableSectionsIndex = 0;
const minimumVisibility = .35;


// Generate a TOC using the headers for each navigable section
function generateTOC( navigableSections) {
  let fragment = new DocumentFragment();

  // Create TOC navigation element
  let tocNav = document.createElement("nav");
  tocNav.classList.add(tocClass);
  tocNav.role = "navigation";
  tocNav.ariaLabel = "Table of Contents";
  let tocTitle = document.createElement("h2");
  tocTitle.ariaLabel = "Table of Contents";
  tocTitle.innerText = "Contents";
  tocNav.appendChild(tocTitle);

  // Generate the TOC list of hyperlinks
  var tocList = createOrderedList(navigableSections, 2);
  if(TOC_DEBUG)console.log("generated tocList " + tocList);
    
  // Add list of TOC hyperlinks to TOC section
  tocNav.appendChild(tocList);

  // Add TOC navigation element to fragment and return
  fragment.appendChild(tocNav);

  // Add TOC to DOM
  const tocContainer = document.querySelector(tocContainerElement);
  tocContainer.appendChild(fragment);
}

// function generateAccordionAnchorsNew(sections, hLevel) {
//   sections.forEach(section => {
//     // heading
//     let heading = document.querySelector("#" + section.id + " h" + hLevel);

//     // setup new heading buttons
//     let newButton  = document.createElement('button');
//     let buttonText =  document.querySelector("#" + section.id + " h" + hLevel + " .heading-text").innerText;
//     newButton.setAttribute('type', 'button');
//     // newButton.setAttribute('aria-controls', targetID);
//     // newButton.setAttribute('id', targetID + '_trigger');
//     // newButton.classList.add(widgetTriggerClass);

//     // Add the Button & previous heading text
// 		heading.appendChild(newButton);
// 		newButton.appendChild(document.createTextNode(buttonText));

//     newButton.addEventListener("click", (event) => {
//       event.preventDefault();
//       console.log("accordionAnchor.onClick: hash is " + window.location.hash);

//       if(window.location.hash && window.location.hash == "#"+section.id) {
//         console.log("accordionAnchor.onClick: hash is " + window.location.hash + " and this section ID is " + section.id + ". Toggle this section.");
//         toggleNavigable(section.id);
//       }
//       else {
//         window.location.href = "#"+section.id;
//       }
      
      
//     });

//   });
// }



// Generate accordion expand/collapse anchors for each 
// navigable section
function generateAccordionAnchors(sections, hLevel) {
  sections.forEach(section => {
    // let heading = document.querySelector("#" + section.id + " h" + hLevel);
    // let accordionAnchor = document.createElement("a");
    // accordionAnchor.href = "#" + section.id;
    // accordionAnchor.innerText = "Expand/Collapse Section: " + heading.innerText;
    // accordionAnchor.addEventListener("click", (event) => {
    //   console.log("accordionAnchor.onClick: hash is " + window.location.hash);
    //   if(window.location.hash && window.location.hash == "#"+section.id) {
    //     console.log("accordionAnchor.onClick: hash is " + window.location.hash + " and this section ID is " + section.id + ". Toggle this section.");
    //     toggleNavigable(section.id);
    //   }
    //   setTimeout(function(){
    //     accordionAnchor.focus();
    //   }, 80);
      
    // });
    
    // heading.appendChild(accordionAnchor);

    // section.classList.add("is-collapsed");
    section.setAttribute("aria-expanded", false);

    // heading
    let heading = document.querySelector("#" + section.id + " h" + hLevel);

    // Create a accordion anchor button
    let accordionButton = document.createElement("a");
    accordionButton.role = "button";
    accordionButton.href = "#" + section.id;
    accordionButton.className = "navigable__heading-button";
    // accordionButton.innerText = "Expand/Collapse Section: " + document.querySelector("#" + section.id + " h" + hLevel + " .heading-text").innerText;
    accordionButton.innerText = document.querySelector("#" + section.id + " h" + hLevel + " .heading-text").innerText;
    accordionButton.setAttribute("aria-expanded", false);

    // accordion button icon
    let accordionButtonIcon = document.createElement("span");
    accordionButtonIcon.innerText = "+";
    accordionButtonIcon.ariaHidden = true;
    accordionButtonIcon.className = "navigable__heading-button-icon";
    
    accordionButton.appendChild(accordionButtonIcon);
    
    heading.classList.add("section-heading");
    heading.appendChild(accordionButton);
    // heading.appendChild(accordionButtonIcon);

    accordionButton.addEventListener("click", (event) => {
      console.log("accordionAnchor.onClick: hash is " + window.location.hash);
      
      if(window.location.hash && window.location.hash == "#"+section.id) {
        event.preventDefault();
        console.log("accordionAnchor.onClick: hash is " + window.location.hash + " and this section ID is " + section.id + ". Toggle this section.");
        toggleNavigable(section.id);
      }
      setTimeout(function(){
        accordionButton.focus();
      }, 80);
      
    });




    // add child elements
    let thisSectionSubsections = document.querySelectorAll("#" + section.id + " > section:not(.toc-ignore)");
    if(thisSectionSubsections.length > 0) {
      if(TOC_DEBUG)console.log("found " + thisSectionSubsections.length + " sub-sections for " + section.id);
      generateAccordionAnchors(thisSectionSubsections, hLevel+1);
    }
  });
}


function createOrderedList(sections, hLevel) {
  if(TOC_DEBUG)console.log("creating list elements at heading level " + hLevel);
  let tocList = document.createElement("ol");
  tocList.classList.add("toc-list");
  tocList.role = "list";

  sections.forEach(section => {
    let tocListItem = document.createElement("li");
    if(TOC_DEBUG)console.log("creating a list element for " + section.id);
    tocListItem.id = "link-" + section.id;

    let tocLink  = document.createElement("a");
    // tocLink.href="javascript:document.getElementById(\"" + section.id + "\").scrollIntoView();";
    tocLink.href="#" + section.id;
    let tocLinkText = document.querySelector("#" + section.id + " h" + hLevel + " .heading-text");
    if(tocLinkText)
      tocLink.textContent = document.querySelector("#" + section.id + " h" + hLevel + " .heading-text").innerText;
    else
      tocLink.textContent = "Unknown";
    tocListItem.appendChild(tocLink);

    // add child elements or create Intersection Observer for end node
    let thisSectionSubsections = document.querySelectorAll("#" + section.id + " > section:not(.toc-ignore)");
    if(thisSectionSubsections.length > 0) {
      if(TOC_DEBUG)console.log("found " + thisSectionSubsections.length + " sub-sections for " + section.id);
      tocListItem.appendChild(createOrderedList(thisSectionSubsections, hLevel+1));
    }
    else {
      //create observer for element for end node
      createSectionObserver(section, tocListItem, observableSectionsIndex, hLevel);
      observableSectionsIndex++;
    }

    tocList.appendChild(tocListItem);
  });

  if(TOC_DEBUG)console.log("generated tocList in OL " + tocList);

  return tocList;
}


function createSectionObserver(navigableSection, navigableSectionListItem, index) {
  if(TOC_DEBUG)console.log("creating Intersection Observer for section " + navigableSection.id + " at index " + index + " with associated list item " + navigableSectionListItem);
  
  
  // Initialize each item in intersection ratios array
  sectionIntersectRatios[index] = 0;
  if(TOC_DEBUG)console.log("sectionIntersectRatios[" + index + "] = " + sectionIntersectRatios[index]);
  tocListItems[index] = navigableSectionListItem;
  if(TOC_DEBUG)console.log("tocListItems[" + index + "] = " + tocListItems[index]);

  // Define the IntersectionObserver functionality for each navigable section
  const observerNavigableSection = new IntersectionObserver(
    ([e]) => {
      var thisIntersectionRatio = e.intersectionRatio;
      sectionIntersectRatios[index] = thisIntersectionRatio;
      if(TOC_DEBUG)console.log("sectionIntersectRatios[" + index + "]: " + thisIntersectionRatio);

      var largestIntersectIndex = indexOfMax(sectionIntersectRatios);
      if(TOC_DEBUG)console.log("largest ratio index: " + largestIntersectIndex);

      // Deselect all sections in TOC
      for(var i = 0; i<sectionIntersectRatios.length; i++) {
        // if(TOC_DEBUG)console.log("tocListItems size = " + tocListItems.length);
        // if(TOC_DEBUG)console.log("tocListItems[" + i + "] = " + tocListItems[i]);
        tocListItems[i].classList.remove(classIsSectionSelected);
        // tocListItems[i].parentElement.parentElement.classList.remove(classParentIsSectionSelected);
        toggleParentIsSelected(tocListItems[i], false);
      }

      // Select the section with the largest intersection ratio in TOC
      if(largestIntersectIndex >= 0) {
        tocListItems[largestIntersectIndex].classList.add(classIsSectionSelected);
        if(TOC_DEBUG)console.log("parent of " + tocListItems[largestIntersectIndex].id + " is " + tocListItems[largestIntersectIndex].parentElement.parentElement.id);
        // tocListItems[largestIntersectIndex].parentElement.parentElement.classList.add(classParentIsSectionSelected);
        toggleParentIsSelected(tocListItems[largestIntersectIndex], true);
      }
    }, { threshold: [0, minimumVisibility] }
  );
  observerNavigableSection.observe(navigableSection);
}

function toggleParentIsSelected(listItem, add) {
  if(TOC_DEBUG)console.log("toggleParentIsSelected: listItem " + listItem.id);
  if(listItem && listItem.parentElement && listItem.parentElement.parentElement) {
    var listItemParent = listItem.parentElement.parentElement;
    if(listItemParent instanceof HTMLLIElement) {
      if(add) {
        if(TOC_DEBUG)console.log("adding classParentIsSectionSelected to " + listItemParent.id);
        listItemParent.classList.add(classParentIsSectionSelected);
      }
      else {
        if(TOC_DEBUG)console.log("removing classParentIsSectionSelected from " + listItemParent.id);
        listItemParent.classList.remove(classParentIsSectionSelected);
      }
      
      toggleParentIsSelected(listItemParent, add);
    }
  }
}


function indexOfMax(arr) {
  const maxValue = Math.max(...arr);
  if(maxValue > 0)
    return arr.indexOf(maxValue);
  else
    return -1;
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  if(TOC_DEBUG)console.log("isInViewport: " + element.id + ": rect.top=" + rect.top);
  return (
      rect.top >= 0
      //  &&
      // rect.left >= 0 &&
      // rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      // rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function generateTableOfContents() {
  // Retrieve the top level sections in the navigable element
  var navigableSections = document.querySelectorAll(".navigable > section:not(.toc-ignore)");   
  if(TOC_DEBUG)console.log("number of top level navigableSections: " + navigableSections.length);

   // Generate TOC if there is more than 1 navigable section
  if(navigableSections && navigableSections.length > 1) {
    generateTOC(navigableSections);
    generateAccordionAnchors(navigableSections, 2);

    document.querySelector(".navigable").classList.add(classIsInteractive);
  }
}

function collapseSection(section) {
  console.log("collapseSection: collapsing section " + section.id);

  var childrenToCollapse = document.querySelectorAll("#" + section.id + " > section.is-expanded");
  if(childrenToCollapse) {
    childrenToCollapse.forEach(section => {
      collapseSection(section);
    });
  }

  // section.classList.remove("is-expanded", "showAnimation");
  section.classList.remove("is-expanded");

  // section.classList.add("is-collapsed", "showAnimation");
  section.classList.add("is-collapsed");

  section.setAttribute('aria-expanded', false);

  let sectionHeadingButton = section.querySelector(".section-heading .navigable__heading-button");
  console.log("collapseSection: heading to mark as collapsed: " + sectionHeadingButton);
  sectionHeadingButton.setAttribute('aria-expanded', false);
}

function collapseSiblings(section) {
  // Using the parent section of the current section, 
  // collapse the expanded sibling sections of the 
  // the current section.

  var parent = section.parentElement;
  console.log("parent is " + parent.id);
  var sectionsToCollapse;
  if(parent.id == null || parent.id == "") {
    sectionsToCollapse = document.querySelectorAll(".navigable > section:not(#"+ section.id +").is-expanded");
  }
  else {
    sectionsToCollapse = document.querySelectorAll("#" + parent.id + " > section:not(#"+ section.id +").is-expanded");
  }

  if(sectionsToCollapse) {
    sectionsToCollapse.forEach(section => {
      collapseSection(section);
    });
  }
}

function collapseChildren(section) {
  var childrenToCollapse = document.querySelectorAll("#" + section.id + " > section.is-expanded");
  if(childrenToCollapse) {
    childrenToCollapse.forEach(section => {
      collapseSection(section);
    });
  }
}


function expandSection(section, expandAncestors, scrollToTop) {
  console.log("expandSection: expanding section " + section.id);

  if(section) {
    console.log("expandSection: section exists with classList: " + section.classList);
  }

  if(section && !section.classList.contains("navigable")) {
    // section.classList.remove("is-collapsed", "showAnimation");
    section.classList.remove("is-collapsed");
    
    // section.classList.add("is-expanded", "showAnimation");
    section.classList.add("is-expanded");

    section.setAttribute('aria-expanded', true);

    let sectionHeadingButton = section.querySelector(".section-heading .navigable__heading-button");
    console.log("expandSection: heading to mark as expanded: " + sectionHeadingButton);
    sectionHeadingButton.setAttribute('aria-expanded', true);

    collapseSiblings(section);

    if(expandAncestors)
      expandSection(section.parentElement, true);

    setTimeout(function(){
      if(!isInViewport(section) && scrollToTop) {
        if(TOC_DEBUG)console.log("toggleNavigable: section " + id + " has been expanded, but is not visible - scroll into view.");
        sectionHeadingButton.focus();
        section.scrollIntoView({behavior: "smooth"});
        
      }
    }, 805);
  }
}

// function expandSectionID(sectionID) {
//   console.log("expandSectionID: expanding section " + sectionID);

//   expandSection(document.getElementById(sectionID), true);

// }




function toggleNavigable(id) {
  var section = document.getElementById(id);
  console.log("toggleNavigable: section = " + section.id);

  if(section.classList.contains("is-expanded") ? collapseSection(section) : expandSection(section, true, true));
}


export { generateTableOfContents, toggleNavigable, expandSection, collapseSection };