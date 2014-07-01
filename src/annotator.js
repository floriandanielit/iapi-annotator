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

/* Check if the element is a piece of the annotator_window */
function isAnnotatorWindowElement(el) {
	var el_id = $(el).attr('id');
	if (el_id == 'iapi_annotator_window') {
		return true; 
	}
	else if ($(el).is('body')) {
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
				'<form action=""><fieldset> data <input type="radio" name="'+input_name+'" value="data"/><br> form  <input type="radio" name="'+input_name+'" value="form"/><br> UI <input type="radio" name="'+input_name+'" value="UI"/></fieldset></form>'
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

function selectSimilarElements(element) {
	select_similar = false;
	var path = '';
	path = cssPath(element, selected_iapi_source, true, 'ul');
	var similar_items = document.querySelectorAll(path);
	alert(path);

	switch(context) {
		case "choose_iapi_item":
			/* Look through the items found */
			for(var i = 0; i < similar_items.length; ++i) {
				/* Make sure the item is not the one the user clicked and make sure it is inside the iapi_source */
				if(similar_items[i] !== element && isChildrenOfIapiSource(similar_items[i])) {
					/* Look for the clicked item between the items which are already selected */
					var element_index = selected.indexOf(similar_items[i]);
					/* Check if the item was already selected: if not add it to the selection */
					if (element_index <= -1) {
						addSelection(similar_items[i]);
					}
				}
			}
			break;
		case "choose_iapi_attribute":
			/* Look through the attributes found */
			for(var i = 0; i < similar_items.length; ++i) {
				/* Make sure the attribute is not the one the user clicked */
				selected_iapi_items.forEach(function(target) {
					/* Make sure the attribute is inside one of the selected items */
					if (isChildrenOfIapiItem(similar_items[i], target) && similar_items[i] !== element) {
						/* Look for the clicked item between the items which are already selected */
						var element_index = selected.indexOf(similar_items[i]);
						/* Check if the item was already selected: if not add it to the selection */
						if (element_index <= -1) {
							addSelection(similar_items[i]);
						}
					}
				});
			}
			break;
	}
	select_similar = true;
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
			/* Prevent default click events */
			document.addEventListener("click", preventDefaultClick, true);
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
				context = 'new_iapi_attribute';
				updateAnnotatorState();
			});
			/* Change the behavior of the next button: change context if a label has been submitted by the user, change color of previously selected elements */
			$('#annotator_window_next').unbind();
			$('#annotator_window_next').click(function() {
				iapi_source_label = $("input[type='text'][name='iapi_source_label']").val();
				if(iapi_source_label != '') {
					context = 'add_label_to_item';
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
				context = 'choose_iapi_attribute';
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
						finalize();
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
	}
	
}

function updateAnnotatorState() {
	/* Change title and content depending on the context in which the user finds himself */
	switch(context) {
		case "choose_iapi_source":
			var title = 'CHOOSE SOURCE ELEMENT';
			var description = 'Please choose the element you want to qualify as <span style="color: green">iAPI source</span> by clicking on it (an <span style="color: green">iAPI source</span> should be the container of one or more <span style="color: green">iAPI items</span>).';
			modifyWindow(title, description, null, null, null, false, false, false);
			break;
		case "choose_source_type":
			var title = 'CHOOSE SOURCE TYPE';
			var input_name = 'iapi_source_type';
			modifyWindow(title, null, input_name, null, null, true, true, false);
			break;
		case "add_label_to_source":
			var title = 'ADD A LABEL TO THE SOURCE';
			var input_name = 'iapi_source_label';
			modifyWindow(title, null, input_name, null, null, false, true, false);
			break;
		case "choose_iapi_item":
			var title = 'CHOOSE ITEMS';
			var description = 'Please choose the elements you want to qualify as <span style="color: green">iAPI items</span> by clicking on them (an <span style="color: green">iAPI item</span> should be the container of one or more <span style="color: green">iAPI attributes</span>).';
			modifyWindow(title, description, null, null, null, false, true, false);
			break;
		case "add_label_to_item":
			var title = 'ADD A LABEL TO THE ITEMS';
			var input_name = 'iapi_items_label';
			modifyWindow(title, null, input_name, null, null, false, true, false);
			break;
		case "choose_iapi_attribute":
			var title = 'CHOOSE AN ATTRIBUTE';
			var description = 'Please choose the element you want to qualify as <span style="color: green">iAPI attribute</span> by clicking on it.';
			modifyWindow(title, description, null, null, null, false, true, false);
			break;
		case "add_label_to_attribute":
			var title = 'ADD A LABEL TO THE HIGHLIGHTED ATTRIBUTE';
			var input_name = 'iapi_attribute_label';
			modifyWindow(title, description, input_name, null, null, false, true, false);
			break;
		case "attribute_annotation_done":
			var title = 'DONE';
			var description = 'To add more attributes, exit or start a new annotation click NEXT.';
			modifyWindow(title, description, null, null, null, false, true, true);
			break;
		case "new_iapi_attribute":
			var title = 'ADD OR REMOVE ATTRIBUTES';			
			var content = '';
			if(selected_iapi_attribute_collection.length > 0) {
				content = 'You added ' + selected_iapi_attribute_collection.length + ' attribute';
				if(selected_iapi_attribute_collection.length > 1) {
					content += 's';
				}
				content += '.<a href="javascript:void(0)" id="iapi_add_more"> + </a><a href="javascript:void(0)" id="iapi_remove"> - </a>' 
						+ '<br><br> Click + to add more attributes or - to remove one.<br> Click FINALIZE to complete this annotation.';
			} else {
				content = 'There are no <span style="color: green">iAPI attributes</span> for the <span style="color: green">iAPI items</span> you selected.';
			}
			modifyWindow(title, content, null, null, 'FINALIZE', false, true, true);
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
			/* If iapi_annotator_window creation is successfull append it to body and setup content and behaviour */
			$('body').append(iapi_window);
			$('#annotator_window_bar').dragsParent();
			updateAnnotatorState();
		});
	}
}

/* TODO: end the annotation and save */
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
	
	document.removeEventListener("mouseover", highlightOnMouseOver, true);
	document.removeEventListener("click", preventDefaultClick, true);
	
}

/* Add a draggable window to the current page */
addAnnotatorWindow();