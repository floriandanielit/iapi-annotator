var context = 'choose_iapi_source'; // Keeps track of the state of the application
var sidebar_width = 300;
var modified_elements = new Array();
var adding_more_attributes = false;

var selected = new Array();
var selected_highlight = new Array();
var selected_iapi_source_highlight;
var selected_iapi_items_highlight;
var selected_iapi_attribute_highlight_collection = new Array();

var selected_iapi_source;
var iapi_source_type;
var iapi_source_label;
var selected_iapi_items = new Array();
var iapi_items_label;
var selected_iapi_attribute_collection = new Array();
var iapi_attribute_label_collection = new Array();

/**
 * Get full CSS path of any element
 *
 * Returns a jQuery-style CSS path, with IDs, classes and ':nth-child' pseudo-selectors.
 *
 * Can either build a full CSS path, from 'html' all the way to ':nth-child()', or a
 * more optimised short path, stopping at the first parent with a specific ID,
 * eg. "#content .top p" instead of "html body #main #content .top p:nth-child(3)"
 */
function cssPath(el) {
	var fullPath = 0, // Set to 1 to build ultra-specific full CSS-path, or 0 for optimised selector
	useNthChild = 0, // Set to 1 to use ":nth-child()" pseudo-selectors to match the given element
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

		// Build a unique identifier for this parent node:
		if (cssId) {
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

		// Go up to the next parent node:
		el = el.parentNode !== document ? el.parentNode : false;

	}// endwhile

	// Build the CSS path string from the parent tag selectors:
	for ( i = 0; i < parentSelectors.length; i++) {
		cssPathStr += ' ' + parentSelectors[i];
		// + ' ' + cssPathStr;

		// If using ":nth-child()" selectors and this selector has no ID / isn't the html or body tag:
		if (useNthChild && !parentSelectors[i].match(/#/) && !parentSelectors[i].match(/^(html|body)$/)) {

			// If there's no CSS class, or if the semi-complete CSS selector path matches multiple elements:
			if (!parentSelectors[i].match(/\./) || $(cssPathStr).length > 1) {

				// Count element's previous siblings for ":nth-child" pseudo-selector:
				for ( nth = 1, c = el; c.previousElementSibling; c = c.previousElementSibling, nth++);

				// Append ":nth-child()" to CSS path:
				cssPathStr += ":nth-child(" + nth + ")";
			}
		}

	}

	// Return trimmed full CSS path:
	return cssPathStr.replace(/^[ \t]+|[ \t]+$/, '');
}

// Show green highlight on MouseOver
function inspectorMouseOver(e) {
	var element = e.target;
	
	switch(context) {
		case "choose_iapi_source":
			if (!is_iapi_menu(element) && !is_body(element)) {
				show_annotator_highlight(element);
			}
			break;
		case "choose_source_type":
			if(is_children_of_iapi_source(element)) {
				show_annotator_highlight(element);
			}
			break;
		case "add_label_to_source":
			if(is_children_of_iapi_source(element)) {
				show_annotator_highlight(element);
			}
			break;
		case "choose_iapi_item":
			if(is_children_of_iapi_source(element)) {
				show_annotator_highlight(element);
			}
			break;
		case "add_label_to_item":
			if(is_children_of_iapi_source(element)) {
				show_annotator_highlight(element);
			}
			break;
		case "choose_iapi_attribute":
			var element_is_valid = false;
			selected_iapi_items.forEach(function(target) {
				if(is_children_of_iapi_item(element, target)) {
					element_is_valid = true;
				}
			});
			if(element_is_valid) show_annotator_highlight(element);
			break;
		case "add_label_to_attribute":
			var element_is_valid = false;
			selected_iapi_items.forEach(function(target) {
				if(is_children_of_iapi_item(element, target)) {
					element_is_valid = true;
				}
			});
			if(element_is_valid) show_annotator_highlight(element);
			break;
		case "attribute_annotation_done":
			if (!is_iapi_menu(element) && !is_body(element)) {
				show_annotator_highlight(element);
			}
			break;
		case "new_iapi_attribute":
			var element_is_valid = false;
			selected_iapi_items.forEach(function(target) {
				if(is_children_of_iapi_item(element, target)) {
					element_is_valid = true;
				}
			});
			if(element_is_valid) show_annotator_highlight(element);
			break;
	}

}


function show_annotator_highlight(element) {

	var offset = $(element).offset();
	$('#iapi_annotator_highlight').show();

	$('#iapi_annotator_highlight').width($(element).outerWidth());
	$('#iapi_annotator_highlight').height($(element).outerHeight());

	$('#iapi_annotator_highlight').offset({
		top : offset.top,
		left : offset.left
	});
}


function is_iapi_menu(el) {
	var el_id = $(el).attr('id');
	if (el_id == 'iapi_annotator_window') {
		return true;
	} else if ($(el).is('body')) {
		return false;
	}
	return is_iapi_menu($(el).parent());
}

function is_children_of_iapi_source(el) {
	if ($(el).parent().is(selected_iapi_source)) {
		return true;
	} else if ($(el).is('body')) {
		return false;
	}
	return is_children_of_iapi_source($(el).parent());
}

function is_children_of_iapi_item(el, target) {
	if ($(el).parent().is(target)) {
		return true;
	} else if ($(el).is('body')) {
		return false;
	}
	return is_children_of_iapi_item($(el).parent(), target);
}

function is_body(el) {
	if ($(el).is('body')) {
		return true;
	} else {
		return false;
	}
}

function loadAnnotatorCSS(id, src) {
	if (!document.getElementById(id)) {
		var head  = document.getElementsByTagName('head')[0];
	    var link  = document.createElement('link');
	    link.id   = id;
	    link.rel  = 'stylesheet';
	    link.type = 'text/css';
	    link.href = chrome.extension.getURL(src);
	    link.media = 'all';
	    head.appendChild(link);
	}
}

function addAnnotatorWindow() {
	
	loadAnnotatorCSS('iapi_annotator_window_css', 'css/iapi_annotator_window.css');
	loadAnnotatorCSS('iapi_annotator_highlights_css', 'css/iapi_annotator_highlights.css');
	
	var annotator_highlight = document.getElementById('iapi_annotator_highlight');
	if (!annotator_highlight) {
		annotator_highlight = "<div id='iapi_annotator_highlight'></div>";
		$('body').append(annotator_highlight);
	}

	var iapi_annotator_window = document.getElementById('iapi_annotator_window');
	if (!iapi_annotator_window) {
		$.get(chrome.extension.getURL('html/iapi_annotator_window.html'),prepareWindowContent);
	}
	
}

function prepareWindowContent(iapi_window) {
	
	$('body').append(iapi_window);
	$('#annotator_window_bar').dragsParent();
	
	var paragraph = document.getElementById('annotator_window_paragraph');
	if (!paragraph) {
		paragraph = "<span id='annotator_window_paragraph' style='box-sizing: initial'><p id='annotator_window_title'></p> <p id='annotator_window_text'></p></span>";
		$('#annotator_window_content').append(paragraph);
	}
	
	$('#iapi_annotator_window p').css({
		'display' : 'block',
		'unicode-bidi' : 'embed',
		'margin' : '1.12em 0',
		'padding' : '0',
		'line-height' : '128%',
		'direction' : 'ltr',
		'box-sizing' : 'content-box'
	});
	
	$('#annotator_window_title').css({
		'font-weight' : 'bold'
	});

	switch(context) {
		case "choose_iapi_source":
			$('#annotator_window_title').empty();
			$('#annotator_window_title').append(
				'CHOOSE SOURCE ELEMENT'
			);
		
			$('#annotator_window_text').empty();
			$('#annotator_window_text').append(
				'Please choose the element you want to qualify as <span style="color: green">iAPI source</span> by clicking on it (an <span style="color: green">iAPI source</span> should be the container of one or more <span style="color: green">iAPI items</span>).'
			);
			
			$('#annotator_window_previous').css({'color' : '#ccc'});
			$('#annotator_window_next').css({'color' : '#ccc'});
			
			prepareBehaviour(context);
			break;
		case "choose_source_type":
			$('#annotator_window_title').empty();
			$('#annotator_window_title').append(
				'CHOOSE SOURCE TYPE'
			);
		
			$('#annotator_window_text').empty();
			$('#annotator_window_text').append(
				'<form action=""><fieldset> data <input type="radio" name="iapi_source_type" value="data"/><br> form  <input type="radio" name="iapi_source_type" value="form"/><br> UI <input type="radio" name="iapi_source_type" value="UI"/></fieldset></form>'
			);
			
			$('#annotator_window_previous').css({'color' : '#000'});
			$('#annotator_window_next').css({'color' : '#ccc'});
			
			prepareBehaviour(context);
			break;
		case "add_label_to_source":
			$('#annotator_window_title').empty();
			$('#annotator_window_title').append(
				'ADD A LABEL TO THE SOURCE'
			);
		
			$('#annotator_window_text').empty();
			$('#annotator_window_text').append(
				'<input type="text" name="iapi_source_label">'
			);
			
			$('#annotator_window_previous').css({'color' : '#000'});
			$('#annotator_window_next').css({'color' : '#ccc'});
			
			prepareBehaviour(context);
			break;
		case "choose_iapi_item":
			$('#annotator_window_title').empty();
			$('#annotator_window_title').append(
				'CHOOSE ITEMS'
			);
		
			$('#annotator_window_text').empty();
			$('#annotator_window_text').append(
				'Please choose the elements you want to qualify as <span style="color: green">iAPI items</span> by clicking on them (an <span style="color: green">iAPI item</span> should be the container of one or more <span style="color: green">iAPI attributes</span>).'
			);
			
			$('#annotator_window_previous').css({'color' : '#000'});
			$('#annotator_window_next').css({'color' : '#ccc'});
			
			prepareBehaviour(context);
			break;
		case "add_label_to_item":
			$('#annotator_window_title').empty();
			$('#annotator_window_title').append(
				'ADD A LABEL TO THE ITEMS'
			);
		
			$('#annotator_window_text').empty();
			$('#annotator_window_text').append(
				'<input type="text" name="iapi_items_label">'
			);
			
			$('#annotator_window_previous').css({'color' : '#000'});
			$('#annotator_window_next').css({'color' : '#ccc'});
			
			prepareBehaviour(context);
			break;
		case "choose_iapi_attribute":
			$('#annotator_window_title').empty();
			$('#annotator_window_title').append(
				'CHOOSE AN ATTRIBUTE'
			);
		
			$('#annotator_window_text').empty();
			$('#annotator_window_text').append(
				'Please choose the element you want to qualify as <span style="color: green">iAPI attribute</span> by clicking on it.'
			);
			
			$('#annotator_window_previous').css({'color' : '#000'});
			$('#annotator_window_next').css({'color' : '#ccc'});
			
			prepareBehaviour(context);
			break;
		case "add_label_to_attribute":
			$('#annotator_window_title').empty();
			$('#annotator_window_title').append(
				'ADD A LABEL TO THE ATTRIBUTE'
			);
		
			$('#annotator_window_text').empty();
			$('#annotator_window_text').append(
				'<input type="text" name="iapi_attribute_label">'
			);
			
			$('#annotator_window_previous').css({'color' : '#000'});
			$('#annotator_window_next').css({'color' : '#ccc'});
			
			prepareBehaviour(context);
			break;
		case "attribute_annotation_done":
			$('#annotator_window_title').empty();
			$('#annotator_window_title').append(
				'DONE'
			);
		
			$('#annotator_window_text').empty();
			$('#annotator_window_text').append(
				'You can add or remove attributes by clicking on ATTRIBUTES. To exit or to start a new annotation click DONE.'
			);
			
			$('#annotator_window_previous').text('ATTRIBUTES');
			$('#annotator_window_next').text('DONE');
			
			$('#annotator_window_previous').css({'color' : '#000'});
			$('#annotator_window_next').css({'color' : '#000'});
			
			prepareBehaviour(context);
			break;
		case "new_iapi_attribute":
			$('#annotator_window_title').empty();
			$('#annotator_window_title').append(
				'ADD OR REMOVE ATTRIBUTES'
			);
		
			$('#annotator_window_text').empty();
			
			if(iapi_attribute_label_collection.length > 0) {
				$('#annotator_window_text').append(
					'ADDED ATTRIBUTES:<br>'
				);
				iapi_attribute_label_collection.forEach(function(element) {
					$('#annotator_window_text').append(
						element + '<br>'
					);
				});
			} else {
				$('#annotator_window_text').append(
					'There are no <span style="color: green">iAPI attributes</span> for the <span style="color: green">iAPI items</span> you selected.'
				);
			}
			
			$('#annotator_window_previous').text('DONE');
			$('#annotator_window_next').text('ADD');
			
			$('#annotator_window_previous').css({'color' : '#000'});
			$('#annotator_window_next').css({'color' : '#000'});
			
			prepareBehaviour(context);
			break;
	}
	
}

function prepareBehaviour() {
	
	switch(context) {
		case "choose_iapi_source":
			document.addEventListener("click", selectCurrentElement, true);
			break;
		case "choose_source_type":
			document.removeEventListener("click", selectCurrentElement, true);
			
			$("input[type='radio'][name='iapi_source_type']").change(function() {
				$('#annotator_window_next').css({'color' : '#000'});
			});
			
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'choose_iapi_source';
				$('.annotator_selected_highlight').each(function() {
					$(this).remove();
				});
				selected = new Array();
				selected_highlight = new Array();
				prepareWindowContent();
			});
			
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				var selected = $("input[type='radio'][name='iapi_source_type']:checked");
				if (selected.length > 0) {
				    iapi_source_type = selected.val();
				    if(iapi_source_type === 'data') {
					    context = 'add_label_to_source';
					    prepareWindowContent();
				    }
				}
			});
			break;
		case "add_label_to_source":
			document.removeEventListener("click", selectCurrentElement, true);
			$("input[type='text'][name='iapi_source_label']").keyup(function() {
				if($("input[type='text'][name='iapi_source_label']").val() != '') {
					$('#annotator_window_next').css({'color' : '#000'});
				} else {
					$('#annotator_window_next').css({'color' : '#ccc'});
				}
			});
		
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'choose_source_type';
				prepareWindowContent();
			});
			
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				iapi_source_label = $("input[type='text'][name='iapi_source_label']").val();
				if(iapi_source_label != '') {
					context = 'choose_iapi_item';
					selected_iapi_source_highlight.css({
						'border' : '3px solid grey',
					});
					prepareWindowContent();
				}
			});
			break;
		case "choose_iapi_item":
			document.addEventListener("click", selectCurrentElement, true);
			
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'add_label_to_source';
				selected_highlight.forEach(function(element) {
					$(element).remove();
				});
				selected_iapi_source_highlight.css({
					'border' : '3px solid green',
				});
				selected = new Array();
				selected_highlight = new Array();
				prepareWindowContent();
			});
			
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				context = 'add_label_to_item';
				prepareWindowContent();
			});
			
			break;
		case "add_label_to_item":
			document.removeEventListener("click", selectCurrentElement, true);
			$("input[type='text'][name='iapi_items_label']").keyup(function() {
				if($("input[type='text'][name='iapi_items_label']").val() != '') {
					$('#annotator_window_next').css({'color' : '#000'});
				} else {
					$('#annotator_window_next').css({'color' : '#ccc'});
				}
			});
		
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'choose_iapi_item';
				prepareWindowContent();
			});
			
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				iapi_items_label = $("input[type='text'][name='iapi_items_label']").val();
				if(iapi_items_label != '') {
					selected_iapi_items = selected;
					selected_iapi_items_highlight = selected_highlight;
					selected = new Array();
					selected_highlight = new Array();
					
					selected_iapi_items_highlight.forEach(function(element) {
						$(element).css({
							'border' : '3px solid grey',
						});
					});
					
					context = 'choose_iapi_attribute';
					prepareWindowContent();
				}
			});
			break;
		case "choose_iapi_attribute":
			document.addEventListener("click", selectCurrentElement, true);
			
			$('#annotator_window_previous').unbind();
			if(adding_more_attributes) {
				$('#annotator_window_previous').click(function() {
					context = 'new_iapi_attribute';
					selected_highlight.forEach(function(element) {
						$(element).remove();
					});
					selected = new Array();
					selected_highlight = new Array();
					prepareWindowContent();
				});
			} else {
				$('#annotator_window_previous').click(function() {
					context = 'add_label_to_item';
					selected_highlight.forEach(function(element) {
						$(element).remove();
					});
					selected_iapi_items_highlight.forEach(function(element) {
							$(element).css({
								'border' : '3px solid green',
							});
						});
					selected = selected_iapi_items;
					selected_highlight = selected_iapi_items_highlight;
					prepareWindowContent();
				});
			}
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				context = 'add_label_to_attribute';
				prepareWindowContent();
			});
			
			break;
		case "add_label_to_attribute":
			document.removeEventListener("click", selectCurrentElement, true);
			$("input[type='text'][name='iapi_attribute_label']").keyup(function() {
				if($("input[type='text'][name='iapi_attribute_label']").val() != '') {
					$('#annotator_window_next').css({'color' : '#000'});
				} else {
					$('#annotator_window_next').css({'color' : '#ccc'});
				}
			});
		
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'choose_iapi_attribute';
				prepareWindowContent();
			});
			
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				var temp_label = $("input[type='text'][name='iapi_attribute_label']").val();
				iapi_attribute_label_collection.push(temp_label);
				if(temp_label != '') {
					selected_iapi_attribute_collection.push(selected);
					selected_iapi_attribute_highlight_collection.push(selected_highlight);
					selected = new Array();
					selected_highlight = new Array();
					
					selected_iapi_attribute_highlight_collection[selected_iapi_attribute_highlight_collection.length-1].forEach(function(element) {
						$(element).css({
							'border' : '3px solid grey',
						});
					});
					
					context = 'attribute_annotation_done';
					prepareWindowContent();
				}
			});
			break;
		case "attribute_annotation_done":
			document.removeEventListener("click", selectCurrentElement, true);
			
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'new_iapi_attribute';
				$('#annotator_window_previous').text('PREVIOUS');
				$('#annotator_window_next').text('NEXT');
				adding_more_attributes = true;
				prepareWindowContent();
			});
			
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				finalize();
			});
			break;
		case "new_iapi_attribute":
			document.removeEventListener("click", selectCurrentElement, true);
			
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'attribute_annotation_done';
				prepareWindowContent();
			});
			
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				context = 'choose_iapi_attribute';
				$('#annotator_window_previous').text('PREVIOUS');
				$('#annotator_window_next').text('NEXT');
				prepareWindowContent();
			});
			break;
	}
	
}

function selectCurrentElement(e) {
	var element = e.target;
	var is_iapi_menu_or_body = true;
	var element_is_valid = true;
	
	if(context != 'choose_iapi_source') {
		if(is_children_of_iapi_source(element)) {
			element_is_valid = true;
		} else {
			element_is_valid = false;
		}
	}
	
	if(context === 'choose_iapi_attribute') {
		element_is_valid = false;
		selected_iapi_items.forEach(function(target) {
			if(is_children_of_iapi_item(element, target)) {
				element_is_valid = true;
			}
		});
	}

	if (!is_iapi_menu(element) && !is_body(element) && element_is_valid) {

		var annotator_selected_highlight = "<div class='annotator_selected_highlight'></div>";
		
		var element_index = selected.indexOf(element);
		
		if(element_index > -1) { // The element is already selected
			selected.splice(element_index, 1);
			
			$(selected_highlight[element_index]).remove();
			
			selected_highlight.splice(element_index, 1);
		} else { // The element is NOT already selected
			$('body').append(annotator_selected_highlight);

			$('.annotator_selected_highlight').last().css({
				'position' : 'absolute',
				'overflow' : 'hidden',
				'pointer-events' : 'none',
				'display' : 'none',
				'border' : '3px solid green',
				'z-index' : 2147483646,
			});
	
			var offset = $(element).offset();
			$('.annotator_selected_highlight').last().show();
	
			$('.annotator_selected_highlight').last().width($(element).outerWidth() - 6);
			$('.annotator_selected_highlight').last().height($(element).outerHeight() - 6);
	
			$('.annotator_selected_highlight').last().offset({
				top : offset.top,
				left : offset.left
			});
			
			selected.push(element);
			selected_highlight.push($('.annotator_selected_highlight').last());
		}
		
		switch(context) {
			case "choose_iapi_source":
				selected_iapi_source = selected[0];
				selected_iapi_source_highlight = selected_highlight[0];
				selected = new Array();
				selected_highlight = new Array();
				
				context = 'choose_source_type';
				prepareWindowContent();
				break;
			case "choose_iapi_item":
				if(selected.length > 0) {
					$('#annotator_window_next').css({'color' : '#000'});
				} else {
					$('#annotator_window_next').css({'color' : '#ccc'});
				}
				break;
			case "choose_iapi_attribute":
				if(selected.length > 0) {
					$('#annotator_window_next').css({'color' : '#000'});
				} else {
					$('#annotator_window_next').css({'color' : '#ccc'});
				}
				break;
		}
	}
}

function finalize() {
	$(selected_iapi_source).addClass('iapi ' + iapi_source_type + ':' + iapi_source_label);

	selected_iapi_items.forEach(function(element) {
		$(element).addClass(iapi_source_type + 'item:' + iapi_items_label);
	});
	
	
	for(var i = 0; i<selected_iapi_attribute_collection.length; i++) {
		selected_iapi_attribute_collection[i].forEach(function(element) {
			$(element).addClass(iapi_source_type + 'attribute:' + iapi_attribute_label_collection[i]);
		});
	}
	
	for(var i = 0; i<selected_iapi_attribute_highlight_collection.length; i++) {
		selected_iapi_attribute_highlight_collection[i].forEach(function(element) {
			$(element).remove();
		});
	}
	
	selected_iapi_items_highlight.forEach(function(element) {
		$(element).remove();
	});
	
	$(selected_iapi_source_highlight).remove();

	$('#iapi_annotator_window').remove();
	
	$('#iapi_annotator_highlight').hide();
	
	document.removeEventListener("mouseover", inspectorMouseOver, true);
	document.removeEventListener("click", preventDefaultClick, true);
	
}

function preventDefaultClick(e) {
	var element = e.target;
	if (!is_iapi_menu(element)) {
		e.preventDefault();
	}
}


// add the annotator window to the current page
addAnnotatorWindow(prepareWindowContent);

/**
 * Add event listeners for DOM-inspectors actions
 */
if (document.addEventListener) {
	document.addEventListener("click", preventDefaultClick, true);
	document.addEventListener("mouseover", inspectorMouseOver, true);
}
