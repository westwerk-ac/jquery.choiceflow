/* ************************************************ *
 * choiceflow                                       *
 * https://github.com/westwerk-ac/jquery.choiceflow *
 * ************************************************ */

(function($) {

	var choiceflow = {

		// groups and values
		'groups': {},

		// function to display each block of a value
		'show': function(value) {
			value.blocks.trigger('choiceflow:beforeShow');
			value.blocks.each(function() {
				var returnValues = { 'doDefault': true };
				$(this).trigger('choiceflow:show', returnValues);
				if (returnValues.doDefault) {
					$(this).show();
				}
			});
			value.blocks.addClass('choiceflow-block-active');
			$(value.elements).addClass('choiceflow-active');
			value.blocks.trigger('choiceflow:afterShow');
		},

		// function to hide each block of a value
		'hide': function(value) {
			value.blocks.trigger('choiceflow:beforeHide');
			value.blocks.each(function() {
				var returnValues = { 'doDefault': true };
				$(this).trigger('choiceflow:hide', returnValues);
				if (returnValues.doDefault) {
					$(this).hide();
				}
			});
			value.blocks.removeClass('choiceflow-block-active');
			$(value.elements).removeClass('choiceflow-active');
			value.blocks.trigger('choiceflow:afterHide');
		},

		// displays the group's blocks of the given value and hides other blocks
		'display': function(group, values) {
			values = $.makeArray(values);
			group = this.groups[group];

			// is currently not active
			//console.log(group.active, values);
			if (group.active != values) {

				// hide previously active
				if (group.active != null) {
					for (var a in group.active) {
						this.hide(group.values[group.active[a]]);
					}
				}

				// display now active
				for (var v in values) {
					this.show(group.values[values[v]]);
				}
				group.active = values;

			}
		},

		// initializes a link
		'initLink': function(link) {

			// gather data
			var choiceflow = this;
			link = $(link); // the choiceflow link
			var group = link.data('choiceflowGroup');
			var value = link.data('choiceflowValue');
			var active = link.data('choiceflowActive');
			var blocks = $('.choiceflow-block-' + group + '-' + value);

			// create group entry
			if (!(group in choiceflow.groups)) {
				this.groups[group] = {
					'values': {},
					'active': []
				}
			}
			var groupObject = choiceflow.groups[group];

			// create value entry
			if (!(value in groupObject.values)) {
				groupObject.values[value] = {
					'elements': [],
					'blocks': blocks
				};
			}
			var valueObject = groupObject.values[value];

			// add choiceflow link to value entry
			valueObject.elements.push(link);

			// visibility
			if (active == "1") {
				choiceflow.show(valueObject);
				groupObject.active.push(value);
			} else if ($.inArray(value, groupObject.active.inArray) < 0) {
				choiceflow.hide(valueObject);
			}

			// when clicking a choiceflow link
			link.click(function(group, value) {
				return function() {
					choiceflow.display(group, value);
				}
			}(group, value));
		}
	};

	// global jQuery choiceflow() function
	$.choiceflow = function(action) {
		if (action === "init") {
			$('[data-choiceflow-group]').choiceflow('init-link');
		}
		return this;
	};

	// jQuery object choiceflow() function
	$.fn.choiceflow = function(action) {
		if (action === "init-link") {
			this.each(function() {
				choiceflow.initLink(this);
			});
		}
		return this;
	};

	$(function() {
		$.choiceflow("init");
	});

}(jQuery));
