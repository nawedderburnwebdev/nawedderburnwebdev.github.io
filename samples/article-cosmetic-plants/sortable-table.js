/*
 *  File:   sortable-table.js
 *
 *  Description:   Adds sorting to a HTML data table that implements ARIA Authoring Practices
 * 
 * 
 *  Original files downloaded from: 
 *    https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table
 *    https://www.w3.org/WAI/content-assets/wai-aria-practices/patterns/table/examples/js/sortable-table.js
 *
 *  Original files licensing:    
 *    This content is licensed according to the W3C Software License at
 *    https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */

'use strict';

const DEBUG = true;

// Aria sort constants
const ARIA_SORT = "aria-sort";
const ARIA_SORT_ORDER_ASCENDING = "ascending";
const ARIA_SORT_ORDER_DESCENDING ="descending";
const ARIA_SORT_ORDER_VALUES = [ARIA_SORT_ORDER_ASCENDING, ARIA_SORT_ORDER_DESCENDING];

class SortableTable {
  // Element attribute constants
  static get ATTR_DATA_COLUMN_INDEX () { return "data-column-index"; }
  static get ATTR_TABLE_SORTED () { return "table-sorted"};
  static get ATTR_HIGHLIGHT_SORTED_COLUMN () {return "highlight-sorted-column"};
  static get ATTR_SORT_ORDER () {return "sort-order"};

  // Class name constants
  static get CLASS_SORTABLE_LOADER () { return "sortable-loader"; };
  static get CLASS_SORTER () { return "sorter"; }
  static get CLASS_SORTER_TRIGGER () { return "sorter_trigger"; }
  static get CLASS_SORTER_TRIGGER_DIRECTION_INDICATOR () { return "sorter_trigger_direction-indicator"; }
  static get CLASS_CLEAR_SORT_BUTTON_CONTAINER () { return ".clear-sort"; }
  static get CLASS_CELL_HIGHLIGHT () { return "highlight"; }
  static get CLASS_TABLE_BODY_IS_MODIFIED () { return "is-modified" };
  static get CLASS_TABLE_SORTED () { return "sorted" };
  static get CLASS_TABLE_LOADED () { return "loaded" };
  static get CLASS_TABLE_SORT_READY () { return "sort-ready" };

  // Other constants
  static get SORTABLE_LOADER_TIMEOUT () { return 2000; }


  /**
   * @constructor
   * @param {*} tableNode 
   * @param {*} buttonClearSortContainer 
   */
  constructor(tableNode, buttonClearSortContainer) {
    this.tableNode = tableNode;
    this.columnHeaders = tableNode.querySelectorAll('thead th');
    this.sortColumns = [];

    if(DEBUG) console.log("SortableTable Constructor: table [" +this.tableNode.id + "].");

    if(this.columnHeaders.length < 1) {
      throw new Error("Table [" +this.tableNode.id + "] has no column headers.");
    }

    // Add "sorter" component elements to sortable column headers
    for (var i = 0; i < this.columnHeaders.length; i++) {
      var columnHeader = this.columnHeaders[i];
      
      // Add "sorter" class to column header
      columnHeader.classList.add(SortableTable.CLASS_SORTER);
      
      // Retrieve column header contents as HTML and plain text without extraneous spaces
      let headingDataHTML = columnHeader.innerHTML;
      let headingDataPlainText = removeExtraSpaces(columnHeader.textContent);

      // Delete column header contents for replacement
      columnHeader.innerHTML = "";

      // Create "sorter_trigger" button with direction indicator and add to column header
      var sorterTrigger = document.createElement("button");
      sorterTrigger.classList.add(SortableTable.CLASS_SORTER_TRIGGER);
      sorterTrigger.title = headingDataPlainText;
      sorterTrigger.ariaLabel = headingDataPlainText;
      sorterTrigger.setAttribute(SortableTable.ATTR_DATA_COLUMN_INDEX, i);
      sorterTrigger.setAttribute(SortableTable.ATTR_TABLE_SORTED, true);
      sorterTrigger.setAttribute(SortableTable.ATTR_HIGHLIGHT_SORTED_COLUMN, true);
      sorterTrigger.addEventListener('click', this.handleClick.bind(this));
      sorterTrigger.innerHTML = headingDataHTML;
      var sorterTriggerDirectionIndicator = document.createElement("span");
      sorterTriggerDirectionIndicator.ariaHidden = true;
      sorterTriggerDirectionIndicator.classList.add(SortableTable.CLASS_SORTER_TRIGGER_DIRECTION_INDICATOR);
      sorterTrigger.appendChild(sorterTriggerDirectionIndicator);
      columnHeader.appendChild(sorterTrigger);
      
      // Add sortable columns to SortableTable object
      this.sortColumns.push(i);
    }

    // Add clear sort button
    if(buttonClearSortContainer) {
      if(DEBUG) console.log("Creating clear sort button for table [" +this.tableNode.id + "].");
      var clearSortButton = document.createElement("button");
      clearSortButton.innerHTML = buttonClearSortContainer.getAttribute("data-desc");
      clearSortButton.setAttribute(SortableTable.ATTR_DATA_COLUMN_INDEX, 0);
      clearSortButton.setAttribute(SortableTable.ATTR_TABLE_SORTED, false);
      clearSortButton.setAttribute(SortableTable.ATTR_HIGHLIGHT_SORTED_COLUMN, false);
      clearSortButton.setAttribute(SortableTable.ATTR_SORT_ORDER, ARIA_SORT_ORDER_ASCENDING);
      clearSortButton.addEventListener('click', this.handleClick.bind(this));
      buttonClearSortContainer.appendChild(clearSortButton);
    }

    // Sort table by header column
    if(DEBUG) console.log("Sorting table by header column.");
    try {
      this.setColumnHeaderSort(0, ARIA_SORT_ORDER_ASCENDING, false);
    }
    catch(e) {
      console.error("SortableTable Constructor: an error occurred while sorting table [" +this.tableNode.id + "]. Error: " + e.message);
    }    
  }


  /**
   * Initiate sort of selected column and add sort indicator.
   * Remove sort indicator from previously sorted columns.
   * 
   * @param {number} columnIndex 
   * @param {string} sortOrder 
   * @param {string} highlightSorted 
   * @returns 
   */
  setColumnHeaderSort(columnIndex, sortOrder, highlightSorted) {
    if(DEBUG) console.group("SortableTable.setColumnHeaderSort()");

    // Parse columnIndex into an integer if it is not a number.
    if (typeof columnIndex !== 'number') {
      if(DEBUG) console.log ("typeof columnIndex '" + columnIndex + "' is " + typeof columnIndex + ".  Parse as integer.");
      let parsedColumnIndex = parseInt(columnIndex);
      if(Number.isNaN(parsedColumnIndex)) {
        throw new Error("Invalid value for sort column index: " + columnIndex + ".  Sort column index must be a number.");
      }
      else {
        columnIndex = parsedColumnIndex;
      }
    }

    for (var i = 0; i < this.columnHeaders.length; i++) {
      var columnHeader = this.columnHeaders[i];
      var numericalColumn = columnHeader.classList.contains('num');

      if (i === columnIndex) {
        //  Initiate sort of the selected column and add sort indicator.
        if(sortOrder && ARIA_SORT_ORDER_VALUES.includes(sortOrder)) {
          if(DEBUG) console.log("Initiate " + sortOrder + " sort of column " + i + " using provided sort order.");
          if (sortOrder === ARIA_SORT_ORDER_DESCENDING) {
            columnHeader.setAttribute(ARIA_SORT, ARIA_SORT_ORDER_DESCENDING);
            this.sortColumn(columnIndex, ARIA_SORT_ORDER_DESCENDING, numericalColumn, highlightSorted);
          } else {
            columnHeader.setAttribute(ARIA_SORT, ARIA_SORT_ORDER_ASCENDING);
            this.sortColumn(columnIndex, ARIA_SORT_ORDER_ASCENDING, numericalColumn, highlightSorted);
          }
        } else {
          // Initiate toggle sort of the selected column and add sort indicator
          var sortOrderFromAttr = columnHeader.getAttribute(ARIA_SORT);
          if(DEBUG) console.log("Toggle " + sortOrderFromAttr + " sort of column " + i + ".");
          if (sortOrderFromAttr === ARIA_SORT_ORDER_DESCENDING) {
            columnHeader.setAttribute(ARIA_SORT, ARIA_SORT_ORDER_ASCENDING);
            this.sortColumn(columnIndex, ARIA_SORT_ORDER_ASCENDING, numericalColumn, highlightSorted);
          } else {
            columnHeader.setAttribute(ARIA_SORT, ARIA_SORT_ORDER_DESCENDING);
            this.sortColumn(columnIndex, ARIA_SORT_ORDER_DESCENDING, numericalColumn, highlightSorted);
          }
        }
      } else {
        // Remove sort indicator from previously sorted columns.
        if (columnHeader.hasAttribute(ARIA_SORT)) {
          if(DEBUG) console.log("Remove sort indicator on column " + i + ".");
          columnHeader.removeAttribute(ARIA_SORT);
        }
      }
    }
    
    if(DEBUG) console.groupEnd();
  }


  /**
   * Execute table column sort.
   * 
   * @param {number} columnIndex 
   * @param {string} sortOrder 
   * @param {boolean} isNumber 
   * @param {string} highlightSorted 
   */
  sortColumn(columnIndex, sortOrder, isNumber, highlightSorted) {
    function compareValues(a, b) {
      if (sortOrder === ARIA_SORT_ORDER_ASCENDING) {
        if (a.value === b.value) {
          return 0;
        } else {
          if (isNumber) {
            return a.value - b.value;
          } else {
            return a.value < b.value ? -1 : 1;
          }
        }
      } else {
        if (a.value === b.value) {
          return 0;
        } else {
          if (isNumber) {
            return b.value - a.value;
          } else {
            return a.value > b.value ? -1 : 1;
          }
        }
      }
    }

    if (typeof isNumber !== 'boolean') {
      isNumber = false;
    }

    try {
      var tbodyNode = this.tableNode.querySelector('tbody');

      // Create a clone of the original table body to be used if
      // the sort fails
      var tbodyNodeClone = tbodyNode.cloneNode(true);

      // Remove the table body's modified indicator.
      // It will be added at the end of the sort function to
      // trigger an update notification.
      tbodyNode.classList.remove(SortableTable.CLASS_TABLE_BODY_IS_MODIFIED);

      var rowNodes = [];
      var dataCells = [];
      var rowNode = tbodyNode.firstElementChild;

      var index = 0;
      while (rowNode) {
        rowNodes.push(rowNode);
        var rowCells = rowNode.querySelectorAll('th, td');

        // Remove the highlight class from all row cells
        rowCells.forEach(element => {
          element.classList.remove(SortableTable.CLASS_CELL_HIGHLIGHT);
        });

        // Get the data cell associated the column being sorted
        var dataCell = rowCells[columnIndex];

        // Add the highlight class to the column cells that will be sorted
        if(highlightSorted == "true") {
          dataCell.classList.add(SortableTable.CLASS_CELL_HIGHLIGHT);
        }

        var data = {};
        data.index = index;
        data.value = dataCell.innerText.toLowerCase().trim();
        
        if (isNumber) {
          data.value = parseFloat(data.value);
        }

        dataCells.push(data);
        rowNode = rowNode.nextElementSibling;
        index += 1;
      }

      dataCells.sort(compareValues);

      // Remove table body rows
      while (tbodyNode.firstChild) {
        tbodyNode.removeChild(tbodyNode.lastChild);
      }

      // Add sorted table body rows
      for (var i = 0; i < dataCells.length; i += 1) {
        tbodyNode.appendChild(rowNodes[dataCells[i].index]);
      }

      // Add the table body's modified indicator 
      // to trigger update animation.
      tbodyNode.classList.add(SortableTable.CLASS_TABLE_BODY_IS_MODIFIED);
    }
    catch(e) {
      // Replace partially sorted table body with the original table body
      this.tableNode.removeChild(tbodyNode);
      this.tableNode.appendChild(tbodyNodeClone);

      // Throw the failed sort error to be handled by the calling function
      throw e;
    }
  }




  /* EVENT HANDLERS */

  handleClick(event) {
    try {
      var tgt = event.currentTarget;

      // Execute the table sort with parameters for data column, desired sort order, desired sorted column highlight
      this.setColumnHeaderSort(
        tgt.getAttribute(SortableTable.ATTR_DATA_COLUMN_INDEX), 
        tgt.getAttribute(SortableTable.ATTR_SORT_ORDER),
        tgt.getAttribute(SortableTable.ATTR_HIGHLIGHT_SORTED_COLUMN));

      // Add or remove table sorted indicator class
      var tableSorted = tgt.getAttribute(SortableTable.ATTR_TABLE_SORTED);
      if(tableSorted == "true") {
        this.tableNode.classList.add(SortableTable.CLASS_TABLE_SORTED);
      } else {
        this.tableNode.classList.remove(SortableTable.CLASS_TABLE_SORTED);
      }
    }
    catch(e) {
      console.error("Sort failed.  Error: " + e.message);
      alert("An error has occurred. Unable to sort the table.");
    }
  }




   /* STATIC METHODS */

  /**
   * Asynchronously generate a SortableTable object.
   * 
   * @param {HTMLElement} tableElement 
   * @param {HTMLElement} buttonClearSortContainer 
   * @returns 
   */
  static generateSortableTable (tableElement, buttonClearSortContainer) {
    return new Promise((resolve, reject) => {
      setTimeout (() => {
        try {
          resolve(new SortableTable(tableElement, buttonClearSortContainer));
        }
        catch(e) {
          reject(new Error("SortableTable object for table [" + tableElement.id + "] could not be created. Error: " + e.message));
        }
      }, SortableTable.SORTABLE_LOADER_TIMEOUT);
    });
  }


  /**
   * Revert a Sortable table.
   * 
   * @param {HTMLElement} sortableTable 
   * @param {HTMLElement} buttonClearSortContainer 
   */
  static revertSortableTable (sortableTable, buttonClearSortContainer) {
    if(DEBUG) console.group("Reverting SortableTable ["+ sortableTable.id +"]...");

    // Remove any generated sorter elements
    let sorters = sortableTable.querySelectorAll('thead th.sorter');
    if(sorters && sorters.length > 0) {
      if(DEBUG) console.log("Replacing " + sorters.length + " sort buttons(s)" + " in SortableTable ["+ sortableTable.id +"].");
      sorters.forEach(sorter => {
        // Retrieve original column headings from the sorter trigger button child nodes
        let sorterTrigger = sorter.querySelector('button.sorter_trigger');
        if(sorterTrigger && sorterTrigger.childNodes) {
          let origHeaderColumnData = "";
          sorterTrigger.childNodes.forEach( node => {
            // Concatenate text nodes
            if (node.nodeType === Node.TEXT_NODE) {
              origHeaderColumnData += removeExtraSpaces(node.textContent);
            }
            // Concatenate element node contents, except the sort direction indicator
            else if(node.nodeType === Node.ELEMENT_NODE && !node.classList.contains("sorter_trigger_direction-indicator")) {
              origHeaderColumnData += node.outerHTML;
            }
          });

          // Replace sorter with original contents
          sorterTrigger.remove();
          sorter.innerHTML = origHeaderColumnData;
          sorter.classList.remove('sorter');
        }
      });
    }
    else if(DEBUG) {
      console.log("No sort buttons found in SortableTable ["+ sortableTable.id +"].");
    }

    // Remove clear sort button
    if(buttonClearSortContainer) {
      var buttonClearSort = buttonClearSortContainer.querySelector("button");
      if(buttonClearSort) {
        if(DEBUG) console.log("Removing 'clear sort' button associated with Sortable table ["+ sortableTable.id +"].");
        buttonClearSortContainer.removeChild(buttonClearSort);
      }
        else if(DEBUG) {
        console.log("No clear sort button found in SortableTable ["+ sortableTable.id +"].");
      }
    }
    
    if(DEBUG) console.log("Revert complete for SortableTable ["+ sortableTable.id +"]...");
    if(DEBUG) console.groupEnd();
  }

  
  /**
   * Initialize all sortable tables
   */
  static init () {
    var sortableTables = document.querySelectorAll('table.sortable');
    if(DEBUG && sortableTables.length > 0) console.log("Generating " + sortableTables.length + " sortable table(s)...");

    for (var i = 0; i < sortableTables.length; i++) {
      let newTable = sortableTables[i];

      // Create and add the table's loader to the table's parent element
      if(DEBUG) console.log("Adding table ["+ newTable.id +"] loader...");
      let loader = document.createElement("div");
      loader.classList.add(SortableTable.CLASS_SORTABLE_LOADER);
      let tableParent = newTable.parentElement;
      tableParent.appendChild(loader);

      // Retrieve the table's clear-sort button container
      let buttonClearSortContainer = tableParent.querySelector(SortableTable.CLASS_CLEAR_SORT_BUTTON_CONTAINER)

      // Construct a SortableTable from the table
      SortableTable.generateSortableTable(newTable, buttonClearSortContainer).then(() => {
        if(DEBUG) console.log("Sortable table ["+ newTable.id +"] generated successfully.");
        newTable.classList.add(SortableTable.CLASS_TABLE_SORT_READY);
      })
      .catch(error => {
        console.error(error.message);
        SortableTable.revertSortableTable(newTable, buttonClearSortContainer);
      })
      .finally(() => {
        // Remove table's loader from its parent element
        if(DEBUG) console.log("Removing loader from table ["+ newTable.id +"]...");
        tableParent.removeChild(loader);

        // Reveal the table
        if(DEBUG) console.log("Revealing table ["+ newTable.id +"]...");
        newTable.classList.add(SortableTable.CLASS_TABLE_LOADED);
      });
    }
  }
}


/**
 * Removes extra spaces from a string.
 * 
 * @param {string} myString 
 * @returns string
 */
function removeExtraSpaces(myString) {
  return myString.replace(/\s+/g, ' ').trim();
}




// Initialize sortable tables
window.addEventListener('DOMContentLoaded', function () {
  SortableTable.init();
});