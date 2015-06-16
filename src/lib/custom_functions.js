// this function makes the parent of the selected element draggable
$.fn.dragsParent = function(opt) {

	opt = $.extend({
		handle : "",
		cursor : "move"
	}, opt);

	if (opt.handle === "") {
		var $el = this;
	} else {
		var $el = this.find(opt.handle);
	}

	return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
		if (opt.handle === "") {
			var $drag = $(this).parent().addClass('draggable');
		} else {
			var $drag = $(this).parent().addClass('active-handle').parent().addClass('draggable');
		}
		var z_idx = $drag.css('z-index'), drg_h = $drag.outerHeight(), drg_w = $drag.outerWidth(), pos_y = $drag.offset().top + drg_h - e.pageY, pos_x = $drag.offset().left + drg_w - e.pageX;
		$drag.css('z-index', 2147483647).parents().on("mousemove", function(e) {
			$('.draggable').offset({
				top : e.pageY + pos_y - drg_h,
				left : e.pageX + pos_x - drg_w
			}).on("mouseup", function() {
				$(this).parent().removeClass('draggable').css('z-index', z_idx);
			});
		});
		e.preventDefault();
		// disable selection
	}).on("mouseup", function() {
		if (opt.handle === "") {
			$(this).parent().removeClass('draggable');
		} else {
			$(this).parent().removeClass('active-handle').parent().removeClass('draggable');
		}
	});

};

function cssPath(element) {
	var HTMLtag = $(element).prop("tagName");
	
	HTMLtag = HTMLtag.toLowerCase();
	var HTMLid = $(element).attr('id');
	var CSSpath = "";
	
	if($(element).is('body')) {
		return CSSpath = HTMLtag;
	}
	if(HTMLid != null) {
		return CSSpath = HTMLtag + '#' + HTMLid;
	} else {
		var HTMLclass = $(element).attr('class');
		var parent = $(element).parent();
		var filtered_siblings;
		
		if(HTMLclass) {
			//remove spaces, add dots.
			HTMLclass = HTMLclass.trim();
			HTMLclass = HTMLclass.replace(/\s/g, '.');
			// check dots, if 2 remove 1.
			HTMLclass = HTMLclass.replace(/\.\./g, '.');
			filtered_siblings = parent.children(HTMLtag + '.' + HTMLclass);
		} else {
			filtered_siblings = parent.children(HTMLtag);
		}
		
		if(filtered_siblings.length > 1) {
			var siblings = parent.children(HTMLtag).each(function(index, el) {
				var count = index+1;
			    if ($(el).is($(element))) {
			    	CSSpath = HTMLtag + ':nth-of-type(' + count + ')';
			    }
			});
		} else {
			if(HTMLclass) {
				CSSpath = HTMLtag + '.' + HTMLclass;
			} else {
				CSSpath = HTMLtag;
			}
		}
		
		return cssPath($(element).parent()) + " " + CSSpath;
	}
}

function cssPathOfSibling(element, iapisource, flag) {
	var HTMLtag = $(element).prop("tagName");
	
	HTMLtag = HTMLtag.toLowerCase();
	var HTMLid = $(element).attr('id');
	var CSSpath = "";
	
	if($(element).is(iapisource)) {
		return CSSpath = '';
	}
	if(HTMLid != null) {
		return CSSpath = HTMLtag + '#' + HTMLid;
	} else {
		var HTMLclass = $(element).attr('class');
		if(HTMLclass && flag) {
			HTMLclass = HTMLclass.trim();
			HTMLclass = HTMLclass.replace(/\s/g, '.');
			// check dots, if 2 remove 1.
			HTMLclass = HTMLclass.replace(/\.\./g, '.');
			
			var parent = $(element).parent();
			var filtered_siblings;
			
			// find the Greatest common divisor of sibling HTML element by class
			var HTMLclasses = HTMLclass.split('.');
			for(var i = HTMLclasses.length; i>0; i--) {
				var newHTMLclass = '';
				for(var k = 0; k<i; k++) {
					newHTMLclass += '.' + HTMLclasses[k];
				}
				filtered_siblings = parent.children(HTMLtag + newHTMLclass);
				if(filtered_siblings.length > 1) {
					CSSpath = HTMLtag + newHTMLclass;
					return cssPathOfSibling($(element).parent(), iapisource, false) + " " + CSSpath;
				}
			}	
		}	
		CSSpath = '> ' + HTMLtag;
		return cssPathOfSibling($(element).parent(), iapisource, true) + " " + CSSpath;
	}
}

function cssPathOfAttribute(element, iapi_item) {
	var HTMLtag = $(element).prop("tagName");
	
	HTMLtag = HTMLtag.toLowerCase();
	var HTMLid = $(element).attr('id');
	var CSSpath = "";
	
	if($(element).is(iapi_item)) {
		return CSSpath = '';
	}
	if($(element).is('body')) {
		return CSSpath = HTMLtag;
	}
	if(HTMLid != null) {
		return CSSpath = HTMLtag + '#' + HTMLid;
	} else {
		var HTMLclass = $(element).attr('class');
		var parent = $(element).parent();
		var filtered_siblings;
		
		if(HTMLclass) {
			//remove spaces, add dots.
			HTMLclass = HTMLclass.trim();
			HTMLclass = HTMLclass.replace(/\s/g, '.');
			// check dots, if 2 remove 1.
			HTMLclass = HTMLclass.replace(/\.\./g, '.');
			filtered_siblings = parent.children(HTMLtag + '.' + HTMLclass);
		} else {
			filtered_siblings = parent.children(HTMLtag);
		}
		
		if(filtered_siblings.length > 1) {
			var siblings = parent.children(HTMLtag).each(function(index, el) {
				var count = index+1;
			    if ($(el).is($(element))) {
			    	CSSpath = HTMLtag + ':nth-of-type(' + count + ')';
			    }
			});
		} else {
			if(HTMLclass) {
				CSSpath = HTMLtag + '.' + HTMLclass;
			} else {
				CSSpath = HTMLtag;
			}
		}
		
		return cssPathOfAttribute($(element).parent(), iapi_item) + " " + CSSpath;
	}
}
