/* 
 * TODO:
 * - make sure user can't click next if requirements are not met.
 */

/* Keep track of the state of the application */
var context = 'choose_iapi_source';
/* Change the default behavior to allow for additional attributes to be added to the selected items */
var adding_more_attributes = false;
/* Make sure a context acts differently when coming back to it if needed */
var coming_back = false;
/* When selecting an element try and look for similar ones to select automatically */
var select_similar = true;

/* Contains temporarily selected elements */
var selected = new Array();
/* Contains temporarily created highlights */
var selected_highlight = new Array();
/* Contains the selected iapi_source highlight */
var selected_iapi_source_highlight;
/* Contains the selected iapi_items highlights */
var selected_iapi_items_highlight;
/* Contains arrays of the selected iapi_attribute highlights */
var selected_iapi_attribute_highlight_collection = new Array();

/* Contains the selected iapi_source */
var selected_iapi_source;
/* Contains the chosen iapi_source type */
var iapi_source_type;
/* Contains the chosen iapi_source label */
var iapi_source_label;
/* Contains the selected iapi_items */
var selected_iapi_items = new Array();
/* Contains the chosen iapi_items label */
var iapi_items_label;
/* Contains arrays of the selected iapi_attributes */
var selected_iapi_attribute_collection = new Array();
/* Contains the selected iapi_attribute label for each array in 'selected_iapi_attribute_collection' */
var iapi_attribute_label_collection = new Array();

/* Contains the selected iapi_form_elements highlights */
var selected_form_element_highlight = new Array();
/* Contains the selected iapi_form_elements */
var selected_form_element = new Array();
/* Contains the selected iapi_form_element type */
var selected_form_element_type = new Array();
/* Contains the selected iapi_form_element type */
var form_element_label = new Array();

/* Check if the element is a piece of the annotator_window */
function isAnnotatorWindowElement(el) {
	var el_id = $(el).attr('id');
	if (el_id == 'iapi_annotator_window') {
		return true; 
	}
	else if ($(el).is('body') || $(el).is('html')) {
		return false;
	}
	return isAnnotatorWindowElement($(el).parent());
}

/* Check if the element is a children of the selected iapi_source */
function isChildrenOfIapiSource(el) {
	if ($(el).parent().is(selected_iapi_source)) {
		return true;
	}
	else if ($(el).is('body')) {
		return false;
	}
	return isChildrenOfIapiSource($(el).parent());
}

/* Check if the element is a children of the 'item' */
function isChildrenOfIapiItem(el, item) {
	if ($(el).parent().is(item)) {
		return true;
	}
	else if ($(el).is('body')) {
		return false;
	}
	return isChildrenOfIapiItem($(el).parent(), item);
}

/* Show a highlight on the 'element' by getting its position and offset */
function showAnnotatorHighlight(element) {
	if(context == "choose_iapi_item" && $(element).is('td')) {
		element = $(element).parent();
	}
	var offset = $(element).offset();
	$('#iapi_annotator_highlight').show();

	$('#iapi_annotator_highlight').width($(element).outerWidth());
	$('#iapi_annotator_highlight').height($(element).outerHeight());

	$('#iapi_annotator_highlight').offset({
		top : offset.top,
		left : offset.left
	});
	
}

/* Check depending on 'context' which element can be highlighted */
function highlightOnMouseOver(e) {
	var element = e.target;
	switch(context) {
		case "choose_iapi_source":
			if (!isAnnotatorWindowElement(element) && !$(element).is('body')) {
				showAnnotatorHighlight(element);
			}
			break;
		case "choose_source_type":
			if(isChildrenOfIapiSource(element)) {
				showAnnotatorHighlight(element);
			}
			break;
		case "add_label_to_source":
			if(isChildrenOfIapiSource(element)) {
				showAnnotatorHighlight(element);
			}
			break;
		case "choose_iapi_item":
			if(isChildrenOfIapiSource(element)) {
				showAnnotatorHighlight(element);
			}
			break;
		case "choose_form_element":
			if(isChildrenOfIapiSource(element)) {
				showAnnotatorHighlight(element);
			}
			break;
		case "add_label_to_item":
			if(isChildrenOfIapiSource(element)) {
				showAnnotatorHighlight(element);
			}
			break;
		case "choose_iapi_attribute":
			var element_is_valid = false;
			selected_iapi_items.forEach(function(target) {
				if(isChildrenOfIapiItem(element, target)) {
					element_is_valid = true;
				}
			});
			if(element_is_valid) showAnnotatorHighlight(element);
			break;
		case "add_label_to_attribute":
			var element_is_valid = false;
			selected_iapi_items.forEach(function(target) {
				if(isChildrenOfIapiItem(element, target)) {
					element_is_valid = true;
				}
			});
			if(element_is_valid) showAnnotatorHighlight(element);
			break;
		case "attribute_annotation_done":
			if (!isAnnotatorWindowElement(element) && !$(element).is('body')) {
				showAnnotatorHighlight(element);
			}
			break;
		case "new_iapi_attribute":
			var element_is_valid = false;
			selected_iapi_items.forEach(function(target) {
				if(isChildrenOfIapiItem(element, target)) {
					element_is_valid = true;
				}
			});
			if(element_is_valid) showAnnotatorHighlight(element);
			break;
	}
}

/* Load custom CSS from 'src' and add an 'id' */
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

/* Modify the window content */
function modifyWindow(title, description, input_name, previous_text, next_text, is_radio_input, is_previous_active, is_next_active) {
	$('#annotator_window_title').empty();
	$('#annotator_window_text').empty();
	$('#annotator_window_title').append(title);
	
	if(description != null) {
		$('#annotator_window_text').append(description);
	}
	
	if(input_name != null) {
		if(is_radio_input) {
			$('#annotator_window_text').append(
				'<form action="" style="margin-top: 10px;"><fieldset> Data annotation <input type="radio" name="'+input_name+'" value="data"/><br> Form annotation <input type="radio" name="'+input_name+'" value="form"/><br> UI annotation <input type="radio" name="'+input_name+'" value="UI"/></fieldset></form>'
			);
		} else {
			$('#annotator_window_text').append(
				'<input type="text" name="'+input_name+'">'
			);
		}
	}

	if(is_previous_active) {
		$('#annotator_window_previous').css({'color' : '#000'});
	} else {
		$('#annotator_window_previous').css({'color' : '#ccc'});
	}
	if(is_next_active) {
		$('#annotator_window_next').css({'color' : '#000'});
	} else {
		$('#annotator_window_next').css({'color' : '#ccc'});
	}
	if(previous_text != null) {
		$('#annotator_window_previous').text(previous_text);
	}
	if(next_text != null) {
		$('#annotator_window_next').text(next_text);
	}
}

/* Prevent default click events from triggering while annotating the page */
function preventDefaultClick(e) {
	var element = e.target;
	if (!isAnnotatorWindowElement(element)) {
		e.preventDefault();
	}
}

function is_already_selected(element) {
	$(selected).each(function(target) {
		if($(element).is(target)) {
			return true;
		}
	});
	return false;
} 

function selectSimilarElements(element) {
	switch(context) {
		case "choose_iapi_item":
			var iapi_source_path = cssPath(selected_iapi_source);
			var path = iapi_source_path + ' ' + cssPathOfSibling(element, selected_iapi_source, true);
			//path = cssPath(element, selected_iapi_source, true, 'ul');
			var similar_items = $(path);
			/* Look through the items found */
			for(var i = 0; i < similar_items.length; ++i) {
				/* Make sure the item is not the one the user clicked and make sure it is inside the iapi_source */
				if(!$(similar_items[i]).is(element) && isChildrenOfIapiSource(similar_items[i])) {
					if(similar_items[i]) {
						/* Look for the clicked item between the items which are already selected */
						var already_selected = is_already_selected(similar_items[i]);
						var text = $(similar_items[i]).text();
						text = text.trim();
						/* Check if the item was already selected: if not add it to the selection */
						if (!already_selected && text !== '') {
							addSelection(similar_items[i]);
						}
					}
				}
			}
			break;
		case "choose_iapi_attribute":
			var this_iapi_item;
			// find the parent item
			selected_iapi_items.forEach(function(target) {
				if(isChildrenOfIapiItem(element, target)) {
					this_iapi_item = target;
				}
			});
		
			var attributePath = cssPathOfAttribute(element, this_iapi_item);
			
			selected_iapi_items.forEach(function(target) {
				var iapi_item_path = cssPath(target);
				var path = iapi_item_path + attributePath;
				
				var similar_attribute = $(path);
				/* Make sure the item is not the one the user clicked */
				if(similar_attribute[0] && !$(similar_attribute[0]).is(element)) {
					/* Look for the clicked item between the items which are already selected */
					var already_selected = is_already_selected(similar_attribute[0]);
					/* Check if the item was already selected: if not add it to the selection */
					if (!already_selected && $(similar_attribute[0]).text()) {
						addSelection(similar_attribute[0]);
					}
				}
			});
			break;
	}
}

function addSelection(element) {
	var annotator_selected_highlight = "<div class='annotator_selected_highlight'></div>";
	/* The element was not already selected */
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
	/* Add the element to the array of the selected ones */
	selected.push(element);
	selected_highlight.push($('.annotator_selected_highlight').last()); 
}

/* Select the clicked element by adding a border to it or deselect if the clicked element is already selected */
function selectCurrentElement(e) {
	var element = e.target;
	var isAnnotatorWindowElement_or_body = true;
	var element_is_valid = true;
	
	if(context == "choose_iapi_item" && $(element).is('td')) {
		element = $(element).parent();
	}
	if(context == "choose_iapi_item" && $(element).is('th')) {
		element = $(element).parent();
	}
	
	/* If the user selected an iapi_source make sure he can't select an element which is not a child of the iapi_source' */
	if(context != 'choose_iapi_source') {
		if(isChildrenOfIapiSource(element)) element_is_valid = true;
		else element_is_valid = false;
	}
	
	/* If the user selected an iapi_item make sure he can't select an element which is not a child of the iapi_item' */
	if(context === 'choose_iapi_attribute') {
		element_is_valid = false;
		selected_iapi_items.forEach(function(target) {
			if(isChildrenOfIapiItem(element, target)) {
				element_is_valid = true;
			}
		});
	}

	/* Make sure the clicked element is not part of the annotator window, is not the body and is valid */
	if (!isAnnotatorWindowElement(element) && !$(element).is('body') && element_is_valid) {
		/* Look for the clicked item between the items which are already selected */
		var element_index = selected.indexOf(element);
		//TODO: ADD THIS BIT TO addSelection();
		if (element_index > -1) {
			/* Remove the element from the selected ones */
			selected.splice(element_index, 1);
			$(selected_highlight[element_index]).remove();
			selected_highlight.splice(element_index, 1);
		//TODO: stop here
		} else {
			addSelection(element);
			if(select_similar) {
				selectSimilarElements(element);
			}
		}
		switch(context) {
			/* When iapi_source is selected proceed automatically */
			case "choose_iapi_source":
				selected_iapi_source = selected[0];
				selected_iapi_source_highlight = selected_highlight[0];
				selected = new Array();
				selected_highlight = new Array();
				
				context = 'choose_source_type';
				updateAnnotatorState();
				break;
			/* When a form_element is selected proceed automatically */
			case "choose_form_element":
				selected_form_element.push(selected[0]);
				selected_form_element_highlight.push(selected_highlight[0]);
				selected = new Array();
				selected_highlight = new Array();
				$('#annotator_window_next').text('NEXT');
				
				context = 'choose_form_element_type';
				updateAnnotatorState();
				break;
			/* Change the color of the next button if elements have been selected */
			case "choose_iapi_item":
				if(selected.length > 0) {
					$('#annotator_window_next').css({'color' : '#000'});
				} else {
					$('#annotator_window_next').css({'color' : '#ccc'});
				}
				break;
			/* Change the color of the next button if elements have been selected */
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

/* Update behavior of window and mouse events depending on which 'context' is active */
function prepareBehavior() {
	switch(context) {
		case "choose_iapi_source":
			/* Prevent default click events */
			document.addEventListener("click", preventDefaultClick, true);
			/* Make sure this works when coming back from another context */
			$('.annotator_selected_highlight').each(function() {
				$(this).remove();
			});
			if(selected_iapi_source_highlight) {
				selected_iapi_source_highlight.css({
					'border' : '3px solid green',
				});
			}
			/* Add selection on click and highlight on mouse over */
			document.addEventListener("mouseover", highlightOnMouseOver, true);
			document.addEventListener("click", selectCurrentElement, true);
			break;
		case "choose_source_type":
			/* Make sure this works when coming back from another context */
			selected_iapi_source_highlight.css({
				'border' : '3px solid green',
			});
			/* Remove selection */
			document.removeEventListener("click", selectCurrentElement, true);
			/* React on text input */
			$("input[type='radio'][name='iapi_source_type']").change(function() {
				$('#annotator_window_next').css({'color' : '#000'});
			});
			/* Change the behavior of the previous button: change context, remove current highlights, reset selected elements */
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'choose_iapi_source';
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: change context if a choice has been submitted by the user */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				var selected = $("input[type='radio'][name='iapi_source_type']:checked");
				if (selected.length > 0) {
				    iapi_source_type = selected.val();
				    if(iapi_source_type === 'data') {
					    context = 'choose_iapi_item';
					    selected_iapi_source_highlight.css({
							'border' : '3px solid grey',
						});
					    updateAnnotatorState();
				    } else if(iapi_source_type === 'form') {
				    	context = 'choose_form_element';
					    selected_iapi_source_highlight.css({
							'border' : '3px solid grey',
						});
					    updateAnnotatorState();
				    } else if(iapi_source_type === 'UI') {
				    	
				    }
				}
			});
			break;
		case "add_label_to_source":
			/* Remove selection */
			document.removeEventListener("click", selectCurrentElement, true);
			/* React on text input */
			$("input[type='text'][name='iapi_source_label']").keyup(function() {
				if($("input[type='text'][name='iapi_source_label']").val() != '') {
					$('#annotator_window_next').css({'color' : '#000'});
				} else {
					$('#annotator_window_next').css({'color' : '#ccc'});
				}
			});
			/* Change the behavior of the previous button: change context */
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				if(iapi_source_type === 'data') {
					context = 'new_iapi_attribute';
				} else if(iapi_source_type === 'form') {
					context = 'choose_form_element';
				} else if(iapi_source_type === 'UI') {
					
				}
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: change context if a label has been submitted by the user, change color of previously selected elements */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				iapi_source_label = $("input[type='text'][name='iapi_source_label']").val();
				if(iapi_source_label != '') {
					if(iapi_source_type === 'data') {
						context = 'add_label_to_item';
					} else if(iapi_source_type === 'form') {
						context = 'label_form_element';
					} else if(iapi_source_type === 'UI') {
						
					}
					updateAnnotatorState();
				}
			});
			break;
		case "choose_iapi_item":
			/* Make sure this works when coming back from another context */
			selected = new Array();
			selected_highlight = new Array();
			if(selected_iapi_items.length > 0) {
				selected = selected_iapi_items;
				selected_highlight = selected_iapi_items_highlight;
				selected_iapi_items_highlight.forEach(function(element) {
					$(element).css({
						'border' : '3px solid green',
					});
				});
				if(selected.length > 0) {
					$('#annotator_window_next').css({'color' : '#000'});
				}
			}
			// check the state of the automatic_selection
			if(select_similar) {
				$('#iapi_autoselect').prop('checked', true);
			} else {
				$('#iapi_autoselect').prop('checked', false);
			}
			// add automatic selection listener
			$("input[type='checkbox'][name='iapi_automatic_selection']").change(function() {
				select_similar = $('#iapi_autoselect').prop('checked');
			});
			document.addEventListener("click", selectCurrentElement, true);
			/* Change the behavior of the previous button: change context, remove or restore previous highlights, reset selected elements */
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'choose_source_type';
				if(selected_highlight) {
					selected_highlight.forEach(function(element) {
						$(element).remove();
					});
				}
				selected_iapi_items = new Array();
				selected_iapi_items_highlight = new Array();
				selected = new Array();
				selected_highlight = new Array();
				updateAnnotatorState();
			});
			
			/* Change the behavior of the next button: change context */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				if (selected.length > 0) {
					selected_iapi_items = selected;
					selected_iapi_items_highlight = selected_highlight;
					selected_iapi_items_highlight.forEach(function(element) {
						$(element).css({
							'border' : '3px solid grey',
						});
					});
					selected = new Array();
					selected_highlight = new Array();
					context = 'choose_iapi_attribute';
					updateAnnotatorState();
				}
			});
			
			break;
		case "add_label_to_item":
			/* Remove selection */
			document.removeEventListener("click", selectCurrentElement, true);
			/* React on text input */
			$("input[type='text'][name='iapi_items_label']").keyup(function() {
				if($("input[type='text'][name='iapi_items_label']").val() != '') {
					$('#annotator_window_next').css({'color' : '#000'});
				} else {
					$('#annotator_window_next').css({'color' : '#ccc'});
				}
			});
			/* Change the behavior of the previous button: change context */
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'add_label_to_source';
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: change context if a label has been submitted by the user, save selected elements, change color of previously selected elements */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				iapi_items_label = $("input[type='text'][name='iapi_items_label']").val();
				if(iapi_items_label != '') {
					context = 'add_label_to_attribute';
					updateAnnotatorState();
				}
			});
			break;
		case "choose_iapi_attribute":
			/* Make sure this works when coming back from another context NEXT CONTEXT NEEDS TO IMPLEMENT THE COMING_BACK VARIABLE*/
			if(coming_back) {
				selected = selected_iapi_attribute_collection[selected_iapi_attribute_collection.length-1];
				selected_highlight = selected_iapi_attribute_highlight_collection[selected_iapi_attribute_highlight_collection.length-1];
				selected_iapi_attribute_highlight_collection[selected_iapi_attribute_highlight_collection.length-1].forEach(function(element) {
					$(element).css({
						'border' : '3px solid green',
					});
				});
				if(selected.length > 0) {
					$('#annotator_window_next').css({'color' : '#000'});
				}
				selected_iapi_attribute_collection.splice(selected_iapi_attribute_collection.length-1, 1);
				selected_iapi_attribute_highlight_collection.splice(selected_iapi_attribute_highlight_collection.length-1, 1);
				coming_back = false;
			}
			// check the state of the automatic_selection
			if(select_similar) {
				$('#iapi_autoselect').prop('checked', true);
			} else {
				$('#iapi_autoselect').prop('checked', false);
			}
			// add automatic selection listener
			$("input[type='checkbox'][name='iapi_automatic_selection']").change(function() {
				select_similar = $('#iapi_autoselect').prop('checked');
			});
			document.addEventListener("click", selectCurrentElement, true);
			$('#annotator_window_previous').unbind();
			/* Change the behavior of the previous button: change context, remove current highlights, reset selected elements */
			$('#annotator_window_previous').click(function() {
				if(selected_highlight) {
					selected_highlight.forEach(function(element) {
						$(element).remove();
					});
				}
				selected = new Array();
				selected_highlight = new Array();
				if(adding_more_attributes || selected_iapi_attribute_collection.length>0) {
					context = 'new_iapi_attribute';
					adding_more_attributes = false;
				} else {
					context = 'choose_iapi_item';
				}
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: change context */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				if (selected.length > 0) {
					selected_iapi_attribute_collection.push(selected);
					selected_iapi_attribute_highlight_collection.push(selected_highlight);
					selected_iapi_attribute_highlight_collection[selected_iapi_attribute_highlight_collection.length-1].forEach(function(element) {
						$(element).css({
							'border' : '3px solid grey',
						});
					});
					selected = new Array();
					selected_highlight = new Array();
					context = 'new_iapi_attribute';
					updateAnnotatorState();
				}
			});
			
			break;
		case "add_label_to_attribute":
			/* Highlight attributes that are being labeled */
			selected_iapi_attribute_highlight_collection[iapi_attribute_label_collection.length].forEach(function(element) {
				$(element).css({
					'border' : '3px solid green',
				});
			});
			/* Remove selection */
			document.removeEventListener("click", selectCurrentElement, true);
			$('#annotator_window_title').append(': #' + (iapi_attribute_label_collection.length+1));
			/* React on text input */
			$("input[type='text'][name='iapi_attribute_label']").keyup(function() {
				if($("input[type='text'][name='iapi_attribute_label']").val() != '') {
					$('#annotator_window_next').css({'color' : '#000'});
				} else {
					$('#annotator_window_next').css({'color' : '#ccc'});
				}
			});
			/* Change the behavior of the previous button: change context */
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				if(iapi_attribute_label_collection.length < 1) {
					context = 'add_label_to_item';
				} else {
					iapi_attribute_label_collection.pop();
					context = 'add_label_to_attribute';
				}
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: change context if a label has been submitted by the user, save selected elements, change color of previously selected elements */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				var temp_label = $("input[type='text'][name='iapi_attribute_label']").val();
				if(temp_label != '') {
					selected_iapi_attribute_highlight_collection[iapi_attribute_label_collection.length].forEach(function(element) {
						$(element).css({
							'border' : '3px solid grey',
						});
					});
					iapi_attribute_label_collection.push(temp_label);
					/* Keep asking for labels for each attribute added */
					if(iapi_attribute_label_collection.length < selected_iapi_attribute_collection.length) {
						context = 'add_label_to_attribute';
						updateAnnotatorState();
					} else {
						context = 'attribute_annotation_done';
						convert();
						updateAnnotatorState();
					}
				}
			});
			break;
		case "attribute_annotation_done":
			/* Remove selection */
			document.removeEventListener("click", selectCurrentElement, true);
			/* Change the behavior of the previous button: change context, change next and previous button's text */
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				context = 'choose_iapi_attribute';
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: end annotation */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				context = 'new_iapi_attribute';
				updateAnnotatorState();
			});
			break;
		case "new_iapi_attribute":
			/* Remove selection */
			document.removeEventListener("click", selectCurrentElement, true);
			/* Change the behavior of the previous button: change context */
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				coming_back = true;
				context = 'choose_iapi_attribute'; 
				$('#annotator_window_next').text('NEXT');
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: change context, change text of buttons */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				/* Finalize: add labels to elements */
				context = 'add_label_to_source';
				$('#annotator_window_next').text('NEXT');
				updateAnnotatorState();
			});
			$('#iapi_add_more').click(function() {
				adding_more_attributes = true;
				context = 'choose_iapi_attribute';
				$('#annotator_window_next').text('NEXT');
				updateAnnotatorState();
			});
			$('#iapi_remove').click(function() {
				// TODO
			});
			break;
		case "choose_form_element": 
			if((selected_form_element.length) == 0) {
				$('#annotator_window_next').css({'color' : '#ccc'});
			}
			/* Prevent default click events */
			document.addEventListener("click", preventDefaultClick, true);
			/* Add selection on click */
			document.addEventListener("click", selectCurrentElement, true);
			/* Make sure this works when coming back from another context */
			selected = new Array();
			selected_highlight = new Array();
			if(selected_form_element.length > 0 && coming_back) {
				selected_form_element.pop();
				selected_form_element_highlight[selected_form_element_highlight.length-1].remove();
				selected_form_element_highlight.pop();
				$('#annotator_window_next').css({'color' : '#ccc'});
				
				coming_back = false;
			}
			/* Change the behavior of the previous button: change context */
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				$('#annotator_window_next').text('NEXT');
				if(selected_form_element.length < 1) {
					context = 'choose_source_type';
				} else {
					if(selected_highlight) {
						selected_highlight.forEach(function(element) {
							$(element).remove();
						});
					}
					selected = new Array();
					selected_highlight = new Array();
					coming_back = true;
					context = 'choose_form_element_type';
				}
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: change context, change text of buttons */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				if(selected_form_element.length > 0) {
					$('#annotator_window_next').text('NEXT');
					/* Finalize: add labels to elements */
					context = 'add_label_to_source';
					updateAnnotatorState();
				}
			});
			break;
		case "choose_form_element_type":
			if(coming_back) {
				selected_form_element_type.pop();
				coming_back = false;
			}
			selected_form_element_highlight[(selected_form_element_highlight.length)-1].css({
				'border' : '3px solid green',
			});
			document.removeEventListener("click", selectCurrentElement, true);
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				coming_back = true;
				$('#annotator_window_next').text('NEXT');
				context = 'choose_form_element';
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: change context, change text of buttons */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				var selected = $("#iapi_form_elements").val();
				if (selected) {
				    selected_form_element_type.push(selected);
				    context = 'choose_form_element';
				    selected_form_element_highlight[selected_form_element_highlight.length-1].css({
						'border' : '3px solid grey',
					});
				    updateAnnotatorState();
				}
			});
			break;
		case "label_form_element": 
			/* Highlight elements that are being labeled */
			$(selected_form_element_highlight[form_element_label.length]).css({
				'border' : '3px solid green',
			});
			/* Remove selection */
			document.removeEventListener("click", selectCurrentElement, true);
			/* React on text input */
			$("input[type='text'][name='iapi_form_element_label']").keyup(function() {
				if($("input[type='text'][name='iapi_form_element_label']").val() != '') {
					$('#annotator_window_next').css({'color' : '#000'});
				} else {
					$('#annotator_window_next').css({'color' : '#ccc'});
				}
			});
			/* Change the behavior of the previous button: change context */
			$('#annotator_window_previous').unbind();
			$('#annotator_window_previous').click(function() {
				/* Highlight elements that are being labeled */
				$(selected_form_element_highlight[form_element_label.length]).css({
					'border' : '3px solid grey',
				});
				if(form_element_label.length < 1) {
					context = 'add_label_to_source';
				} else {
					form_element_label.pop();
					context = 'label_form_element';
				}
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: change context if a label has been submitted by the user, save selected elements, change color of previously selected elements */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				var temp_label = $("input[type='text'][name='iapi_form_element_label']").val();
				if(temp_label != '') {
					$(selected_form_element_highlight[form_element_label.length]).css({
						'border' : '3px solid grey',
					});
					form_element_label.push(temp_label);
					/* Keep asking for labels for each attribute added */
					if(form_element_label.length < selected_form_element.length) {
						context = 'label_form_element';
						updateAnnotatorState();
					} else {
						context = 'attribute_annotation_done';
						convert();
						updateAnnotatorState();
					}
				}
			});
			break;
		case "label_form_element":
			document.removeEventListener("click", selectCurrentElement, true);
			$('#annotator_window_previous').unbind();
			$('#annotator_window_next').unbind();
			break;
		case "attribute_annotation_done":
			document.removeEventListener("click", selectCurrentElement, true);
			$('#annotator_window_previous').unbind();
			$('#annotator_window_next').unbind();
			break;
	}
	
}

function updateAnnotatorState() {
	/* Change title and content depending on the context in which the user finds himself */
	switch(context) {
		case "choose_iapi_source":
			var title = 'CHOOSE SOURCE ELEMENT';
			var description = 'Please choose the element you want to qualify as <span style="color: green">iAPI source</span> by clicking on it (an <span style="color: green">iAPI source</span> should be the container of all other <span style="color: green">iAPI elements</span>).';
			modifyWindow(title, description, null, null, null, false, false, false);
			break;
		case "choose_source_type":
			var title = 'CHOOSE ANNOTATION TYPE';
			var description = 'What kind of annotation are you performing?';
			var input_name = 'iapi_source_type';
			modifyWindow(title, description, input_name, null, null, true, true, false);
			break;
		case "add_label_to_source":
			var title = 'ADD A LABEL TO THE SOURCE';
			var input_name = 'iapi_source_label';
			modifyWindow(title, null, input_name, null, null, false, true, false);
			break;
		case "choose_iapi_item":
			var title = 'CHOOSE ITEMS';
			var description = 'Please choose the elements you want to qualify as <span style="color: green">iAPI items</span> by clicking on them (each <span style="color: green">iAPI item</span> should be the container of one or more <span style="color: green">iAPI attributes</span>).'
							+ '<br><br><form><input type="checkbox" id="iapi_autoselect" name="iapi_automatic_selection" value="automatic" checked>  Select similar elements automatically.</form>';
			modifyWindow(title, description, null, null, null, false, true, false);
			break;
		case "add_label_to_item":
			var title = 'ADD A LABEL TO THE ITEMS';
			var input_name = 'iapi_items_label';
			modifyWindow(title, null, input_name, null, null, false, true, false);
			break;
		case "choose_iapi_attribute":
			var title = 'CHOOSE AN ATTRIBUTE';
			var description = 'Please choose the element you want to qualify as <span style="color: green">iAPI attribute</span> by clicking on it.'
							+ '<br><br><form><input type="checkbox" id="iapi_autoselect" name="iapi_automatic_selection" value="automatic" checked>  Select similar elements automatically.</form>';
			modifyWindow(title, description, null, null, null, false, true, false);
			break;
		case "add_label_to_attribute":
			var title = 'ADD A LABEL TO THE HIGHLIGHTED ATTRIBUTE';
			var input_name = 'iapi_attribute_label';
			modifyWindow(title, description, input_name, null, null, false, true, false);
			break;
		case "attribute_annotation_done":
			var title = 'DONE';
			var description = '<br><br>Your annotations have been saved.<br><br> The page will automatically refresh in 5 seconds.';
			modifyWindow(title, description, null, null, null, false, false, false);
			break;
		case "new_iapi_attribute":
			var title = 'ADD ATTRIBUTES OR FINALIZE';			
			var content = '';
			if(selected_iapi_attribute_collection.length > 0) {
				content = 'You added ' + selected_iapi_attribute_collection.length + ' attribute';
				if(selected_iapi_attribute_collection.length > 1) {
					content += 's';
				}
				content += '.'
						+ '<br><br><br> Click + to add more attributes.<br> Click FINALIZE to complete this annotation.'
						+ '<a href="javascript:void(0)" id="iapi_add_more" style="font-size: 20px;"> + </a>';
			} else {
				content = 'There are no <span style="color: green">iAPI attributes</span> for the <span style="color: green">iAPI items</span> you selected.'
						+ '<br><br><br> Click + to add more attributes.<br> Click FINALIZE to complete this annotation.'
						+ '<a href="javascript:void(0)" id="iapi_add_more" style="font-size: 20px;"> + </a>';
			}
			modifyWindow(title, content, null, null, 'FINALIZE', false, true, true);
			break;
		case "choose_form_element":
			var title = 'CHOOSE FORM ELEMENT';
			var description = 'Please choose the element you want to qualify as <span style="color: green">iAPI element</span>' 
							+ ' by clicking on it (an iAPI element can be input, button, checkbox, computation result etc.)';
			if((selected_form_element.length) > 0) {
				title += ' OR FINALIZE';
				description += '<br><br> Or click FINALIZE to complete this annotation.';
				flag_finalize = true;
			} else {
				flag_finalize = false;
			}
			modifyWindow(title, description, null, null, 'FINALIZE', false, true, flag_finalize);
			break;
		case "choose_form_element_type":
			var title = 'CHOOSE FORM ELEMENT TYPE';
			var description = 'Please choose the type of the element you just selected out of those specified in the following list:<br><br>' 
							+ '<select id="iapi_form_elements"><option value="text">Text Input</option><option value="password">Password Input</option><option value="file">File Input</option>' 
							+ '<option value="button">Button</option><option value="radiobutton">Radiobutton</option><option value="image">Image Input</option>'
							+ '<option value="reset">Reset Button</option><option value="checkbox">Checkbox</option><option value="result">Computation Result</option>'
							+ '<option value="submit">Form Submission</option></select>';
			modifyWindow(title, description, null, null, null, false, true, true);
			break;
		case "label_form_element":
			var title = 'ADD A LABEL TO THE HIGHLIGHTED ELEMENT';
			var input_name = 'iapi_form_element_label';
			modifyWindow(title, description, input_name, null, null, false, true, false);
			break;
	}
	
	/* Change behavior depending on the context in which the user finds himself */
	prepareBehavior();
}

function addAnnotatorWindow() {
	/* Load custom CSS */
	loadAnnotatorCSS('iapi_annotator_window_css', 'css/iapi_annotator_window.css');
	loadAnnotatorCSS('iapi_annotator_highlights_css', 'css/iapi_annotator_highlights.css');
	/* Check if annotator_highlight is already present. If not present create it */
	var annotator_highlight = document.getElementById('iapi_annotator_highlight');
	if (!annotator_highlight) {
		annotator_highlight = "<div id='iapi_annotator_highlight'></div>";
		$('body').append(annotator_highlight);
	}
	/* Check if iapi_annotator_window is already present. If not present create it using the html file */
	var iapi_annotator_window = document.getElementById('iapi_annotator_window');
	if (!iapi_annotator_window) {
		$.get(chrome.extension.getURL('html/iapi_annotator_window.html'),function(iapi_window) {
			/* If iapi_annotator_window creation is successful append it to body and setup content and behavior */
			$('body').append(iapi_window);
			$('#annotator_window_bar').dragsParent();
			updateAnnotatorState();
		});
	}
}

function findBestId(target) {
	var iapi_id = $(target).attr('id');
	if(iapi_id == null) {
		var iapi_id = 'annotation_1';
		var highest_id = 0;
		$('[id^="annotation_"]').each(function (index) {
			var element_id = $(this).attr('id');
			var splitted_id = element_id.split('_');
			var number = splitted_id[1];
			
			if(number > highest_id) highest_id = number;
		});
		highest_id++;
		iapi_id = 'annotation_'+highest_id;
	}
	return iapi_id;
}

/* TODO: end the annotation and save */
function convert() {
	if(iapi_source_type === 'data') {
		prepare_data();
		
		var temp_id = findBestId(selected_iapi_source);
		var temp_path = cssPath(selected_iapi_source);
		var temp_value = 'iapi ' + iapi_source_type + ':' + iapi_source_label;
		collect_data(temp_id, temp_path, temp_value);
		
		selected_iapi_items.forEach(function(element) {
			temp_path = cssPath(element);
			temp_value = iapi_source_type + 'item:' + iapi_items_label;
			collect_data('null', temp_path, temp_value);
		});
		
		for(var i = 0; i<selected_iapi_attribute_collection.length; i++) {
			selected_iapi_attribute_collection[i].forEach(function(element) {
				temp_path = cssPath(element);
				temp_value = iapi_source_type + 'attribute:' + iapi_attribute_label_collection[i];
				collect_data('null', temp_path, temp_value);
			});
		}
		
		send_data();
	} else if(iapi_source_type === 'form') {
		prepare_data();
		
		var temp_id = findBestId(selected_iapi_source);
		var temp_path = cssPath(selected_iapi_source);
		var temp_value = 'h-iapi ' + 'e-form' + ':' + iapi_source_label;
		collect_data(temp_id, temp_path, temp_value);
		
		selected_form_element.forEach(function(element) {
			temp_path = cssPath(element);
			temp_value = 'i-' + selected_form_element_type + ':' + form_element_label;
			collect_data('null', temp_path, temp_value);
		});
		
		send_data();
	} else if(iapi_source_type === 'UI') {
		
	}

	setTimeout(function () {
        location.reload();
    }, 5000);
	
	
}

/* Add a draggable window to the current page */
addAnnotatorWindow();
