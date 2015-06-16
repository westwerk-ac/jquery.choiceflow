/* ************************************************ *
 * choiceflow                                       *
 * https://github.com/westwerk-ac/jquery.choiceflow *
 * ************************************************ */

(function($) {

	var choiceflow = {

        // options
        'options': {
            'beforeLinkAction': function() {
                return true;
            },
            'afterLinkAction': function() {}
        },

		// groups and values
		'groups': {},

		// function to display the block of a value
		'show': function(valueObject) {

            // trigger event on the block and let the event disable the default functionality
            if (valueObject.block.triggerHandler('choiceflow:show', [valueObject.name, valueObject.group]) !== false) {
                valueObject.block.show();
            }

            // add class to block
            valueObject.block.addClass('choiceflow-block-active');

            // add class to links
			$(valueObject.links).addClass('choiceflow-active');

            // after show event
            valueObject.block.triggerHandler('choiceflow:afterShow', [valueObject.name, valueObject.group]);

		},

		// function to hide the block of a value
		'hide': function(valueObject) {

            // trigger event on the block and let the event disable the default functionality
            if (valueObject.block.triggerHandler('choiceflow:hide', [valueObject.name, valueObject.group]) !== false) {
                valueObject.block.hide();
            }

            // remove class from block
            valueObject.block.removeClass('choiceflow-block-active');

            // remove class from link
			$(valueObject.links).removeClass('choiceflow-active');

            // after show event
            valueObject.block.triggerHandler('choiceflow:afterHide', [valueObject.name, valueObject.group]);

		},

		// displays the blocks for the given group and values and hide all other blocks
		'display': function(group, values) {
			groupObject = this.groups[group];
            var hide = $(groupObject.active).not(values).toArray();
            var show = $(values).not(groupObject.active).toArray();

            // check if can display the values
            var aborted = false;
            if (false === this.options.beforeLinkAction(values, show, hide, group)) {
                aborted = true;
            }
            for (var v = 0; v < values.length; ++v) {
                if (groupObject.values[values[v]].block.triggerHandler('choiceflow:display', [values, group, aborted]) === false) {
                    aborted = true;
                }
            }
            for (v = 0; v < hide.length; ++v) {
                var value = hide[v];
                if (groupObject.values[value].block.triggerHandler('choiceflow:canHide', [value, group, aborted]) === false) {
                    aborted = true;
                }
            }
            for (v = 0; v < show.length; ++v) {
                value = show[v];
                if (groupObject.values[value].block.triggerHandler('choiceflow:canShow', [value, group, aborted]) === false) {
                    aborted = true;
                }
            }
            if (aborted) {
                return;
            }

            // hide previously active
            for (var h = 0; h < hide.length; ++h) {
                this.hide(groupObject.values[hide[h]]);
            }

            // display now active
            for (var s = 0; s < show.length; ++s) {
                this.show(groupObject.values[show[s]]);
            }

            // set active values
            groupObject.active = values;

            // after display event
            for (v = 0; v < values.length; ++v) {
                groupObject.values[values[v]].block.triggerHandler('choiceflow:afterDisplay', [values, hide, group]);
            }
            this.options.afterLinkAction(values, show, hide, group)

		},

		// initializes a link
		'initLink': function(link) {

			// gather data
			var choiceflow = this;
			link = $(link); // the choiceflow link
			var group = link.data('choiceflowGroup');
            if (group == undefined) group = 'default';
			var values = link.data('choiceflowValue').toString().split(',');
			var active = link.data('choiceflowActive');

			// create group entry
			if (!(group in choiceflow.groups)) {
				this.groups[group] = {
                    'name': group,
					'values': {},
					'active': []
				}
			}
			var groupObject = choiceflow.groups[group];

            for (var v = 0; v < values.length; ++v) {
                var value = values[v];

                // create value entry
                if (!(value in groupObject.values)) {
                    groupObject.values[value] = {
                        'name': value,
                        'group': group,
                        'links': [],
                        'block': $('#choiceflow-block-' + group + '-' + value)
                    };
                }
                var valueObject = groupObject.values[value];

                // add choiceflow link to value entry
                valueObject.links.push(link);

                // visibility
                if (active == "1") {
                    choiceflow.show(valueObject);
                    groupObject.active.push(value);
                } else if ($.inArray(value, groupObject.active) < 0) {
                    choiceflow.hide(valueObject);
                }

            }

            // cursor = pointer
            link.css({'cursor': 'pointer'});

            // when clicking a choiceflow link
            link.click(function(group, values) {
                return function() {
                    choiceflow.display(group, values);
                }
            }(group, values));
        }
	};

	// jQuery object choiceflow() function
	$.fn.choiceflow = function(action) {
        switch (action) {

            // whether the choiceflow block is active
            case 'is-active':
                return this.is('.choiceflow-block-active');

            // display a choiceflow block
            case 'display':
                var id = this.attr('id').split('-');
                choiceflow.display(id[2], [id[3]]);
                break;

            // initialize a choiceflow link
            case 'init-link':
                this.each(function() {
                    choiceflow.initLink(this);
                });
                break;

        }
		return this;
	};

    // global jQuery choiceflow() function
    $.choiceflow = function(action) {
        // init all choiceflow links
        if (action === "init") {
            $('[data-choiceflow-value]').choiceflow('init-link');
        }
        // set options (action is an options object)
        else if (action !== null && typeof action === 'object') {
            $.extend(choiceflow.options, action);
        }
        return this;
    };

    // init all choiceflow links when the page is ready
	$(function() {
		$.choiceflow("init");
	});

}(jQuery));
