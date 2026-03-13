const FOCUSABLE_LIST_DEBUG = false;
const FOCUSABLE_LIST_CLASS = "focusable";

class FocusableList {
  constructor(list, rootMargin, threshold, stylesFocused, stylesUnfocused) {
    this.list = list;
    this.rootMargin = rootMargin;
    this.threshold = threshold;
    this.stylesFocused = stylesFocused;
    this.stylesUnfocused = stylesUnfocused;
  }

  list = null; // HTMLUListListElement or HTMLOListElement
  rootMargin = null; // String - item intersection area
  threshold = null; // Array - item intersection ratios with the intersection area 
  stylesFocused = null; // String - styles for focused display 
  stylesUnfocused = null; // String - styles for unfocused display (optional)

  print() {
    console.log("List: " + this.list + "\n" +
      "Root Margin: " + this.rootMargin + "\n" +
      "Threshold: " + this.threshold + "\n" +
      "Styles Focused: " + this.stylesFocused + "\n" + 
      "Styles Unfocused: " + this.stylesUnfocused);
  }

  addFocusableClass() {
    this.list.classList.add(FOCUSABLE_LIST_CLASS);
  }

  generateListItemIntersectionObservers(){
    const focusableListItems = Array.from(this.list.querySelectorAll("li"));
    if(FOCUSABLE_LIST_DEBUG)console.log("number of focusable list items for " + this.list.classList + ": " + focusableListItems.length);

    var index = 0;
    focusableListItems.forEach((listItem) => {
      const thisIndex = index;
  
      // Define the IntersectionObserver functionality for each list item
      const observerListItem = new IntersectionObserver(
        ([e]) => {
          if(e.isIntersecting)
          {
            // Add focus to intersecting list item
            if(FOCUSABLE_LIST_DEBUG)console.log("listItemIntersectRatios[" + thisIndex + "] intersecting: " + e.intersectionRatio);
            focusableListItems[thisIndex].classList.remove(this.stylesUnfocused);
            focusableListItems[thisIndex].classList.add(this.stylesFocused);
  
            // Remove focus from all other list items
            for(var i = 0; i<focusableListItems.length; i++) {
              if(i != thisIndex) {
                focusableListItems[i].classList.remove(this.stylesFocused);
                focusableListItems[i].classList.add(this.stylesUnfocused);
              }
            }
          }
          else {
            // Remove focus from list item
            if(FOCUSABLE_LIST_DEBUG)console.log("listItemIntersectRatios[" + thisIndex + "] not intersecting.");
            focusableListItems[thisIndex].classList.remove(this.stylesFocused);
            focusableListItems[thisIndex].classList.add(this.stylesUnfocused);
          }
        },{threshold: this.threshold, root:document, rootMargin: this.rootMargin}
      );
      observerListItem.observe(listItem);
      index ++;
    });
  }
}

export function createFocusableList(list, rootMargin, threshold, stylesFocused, stylesUnfocused) {
  var focusableList = new FocusableList(list, rootMargin, threshold, stylesFocused, stylesUnfocused);
  // focusableList.addFocusableClass();
  focusableList.generateListItemIntersectionObservers();
}