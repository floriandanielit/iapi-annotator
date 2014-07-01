/**
 * Get full CSS path of any element
 *
 * Returns a jQuery-style CSS path, with IDs, classes and ':nth-child' pseudo-selectors.
 *
 * Can either build a full CSS path, from 'html' all the way to ':nth-child()', or a
 * more optimised short path, stopping at the first parent with a specific ID,
 * eg. "#content .top p" instead of "html body #main #content .top p:nth-child(3)"
 */

/* 
 * el = element of which we need the path
 * limit = element used to stop calculating the path if not null
 * ignore_id = if true ignore ids
 * child_filter = specify which element should specify ":nth-child"
 */
function cssPath(el, limit, ignore_id, child_filter) {
	var fullPath = 0, // Set to 1 to build ultra-specific full CSS-path, or 0 for optimised selector
	useNthChild = 1, // Set to 1 to use ":nth-child()" pseudo-selectors to match the given element
	cssPathStr = '', testPath = '', parents = [], parentSelectors = [], tagName, cssId, cssClass, tagSelector, vagueMatch, nth, i, c;

	// Go up the list of parent nodes and build unique identifier for each:
	while (el) {
		vagueMatch = 0;

		// Get the node's HTML tag name in lowercase:
		tagName = el.nodeName.toLowerCase();

		// Get node's ID attribute, adding a '#':
		cssId = (el.id ) ? ('#' + el.id ) : false;

		// Get node's CSS classes, replacing spaces with '.':
		cssClass = (el.className ) ? ('.' + el.className.replace(/\s+/g, ".") ) : '';
		// Make sure class doesn't contain double dots
		cssClass = (el.className ) ? (cssClass.replace(/\.\./g, ".") ) : '';
		

		// Build a unique identifier for this parent node:
		if (cssId && !ignore_id) {
			// Matched by ID:
			tagSelector = tagName + cssId + cssClass;
		} else if (cssClass) {
			// Matched by class (will be checked for multiples afterwards):
			tagSelector = tagName + cssClass;
		} else {
			// Couldn't match by ID or class, so use ":nth-child()" instead:
			vagueMatch = 1;
			tagSelector = tagName;
		}

		// Add this full tag selector to the parentSelectors array:
		parentSelectors.unshift(tagSelector);

		// If doing short/optimised CSS paths and this element has an ID, stop here:
		if (cssId && !fullPath)
			break;

		if(limit) {
			// Go up to the next parent node:
			el = el.parentNode !== limit ? el.parentNode : false;
		} else {
			// Go up to the next parent node:
			el = el.parentNode !== document ? el.parentNode : false;
		}

	}// endwhile

	// Build the CSS path string from the parent tag selectors:
	for ( i = 0; i < parentSelectors.length; i++) {
		cssPathStr += ' ' + parentSelectors[i];
		// + ' ' + cssPathStr;

		// If using ":nth-child()" selectors and this selector has no ID / isn't the html or body tag:
		if (useNthChild && !parentSelectors[i].match(/#/) && !parentSelectors[i].match(/^(html|body)$/)) {

			// If there's no CSS class, or if the semi-complete CSS selector path matches multiple elements:
			if (!parentSelectors[i].match(/\./) || $(cssPathStr).length > 1) {
				var filter = new RegExp(child_filter);
				if(parentSelectors[i].match(filter) || parentSelectors[i].match(/li/)) {
					// Count element's previous siblings for ":nth-child" pseudo-selector:
					for ( nth = 1, c = el; c.previousElementSibling; c = c.previousElementSibling, nth++);
	
					// Append ":nth-child()" to CSS path:
					cssPathStr += ":nth-child(" + nth + ")";
				}
			}
		}

	}

	var temp_path = cssPathStr.replace(/^[ \t]+|[ \t]+$/, '');
	if(temp_path.slice(-1) === '.') temp_path = temp_path.substring(0, temp_path.length-1);;
	// Return trimmed full CSS path:
	return temp_path;
}