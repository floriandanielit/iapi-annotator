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