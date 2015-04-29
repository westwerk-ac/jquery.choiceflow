# jquery.choiceflow

Choiceflow is a jQuery plugin that provides you with an easy way to display and hide parts of your website.
It can be used for step-by-step forms with a linear or decision based path.
The most basic configuration relies on html attributes and does not require you to write JavaScript.

## Install

	bower install westwerk-ac/jquery.choiceflow

## Usage

### A basic flow

To build a flow you need only two things: links and blocks.

* A **link** is a html element the user can click to display an block.
* A **block** is a html element that can be shown by clicking links.

A link can look like this:

	<span data-choiceflow-value="block2">Next</span>

Or like this if you use bootstrap:

	<button type="button" class="btn btn-primary" data-choiceflow-value="block2">Next</button>

The corresponding block could be this:

	<div id="choiceflow-block-default-block2"></div>

When clicking a link with `data-choiceflow-value="foo"` the element with `id="choiceflow-block-default-foo"` is shown.
All other blocks are hidden.

You cannot have blocks with identical ids. But you can display several blocks using one link with `data-choiceflow-value="foo,bar"`.

### Multiple flows

You can group flows using the `data-choiceflow-group` attribute:

	<span data-choiceflow-group="foo1" data-choiceflow-value="bar2">Next</span>
	<div id="choiceflow-block-foo1-bar2"></div>

Defining no group is the same as having `data-choiceflow-group="default"`.

When clicking a link, only other blocks of the same group are hidden.

### Active blocks and links

An element can only be a block if there is a corresponding link. All blocks are hidden per default.
To have a block shown per default, add `data-choiceflow-active="1"` to at least one link that references the block.

	<span data-choiceflow-value="block1" data-choiceflow-active="1">Next</span>

Sometimes you have a block that should be visible at first, but you don't want to link back to it.
You can achieve this by having a hidden link inside the block:

	<div id="choiceflow-block-default-block1">
		<span data-choiceflow-value="block1" data-choiceflow-active="1" style="display: none;"></span>
	</div>

Alternatively if you want to use JS:

	jQuery(function($) {
		$('#choiceflow-block-default-block1').choiceflow('display');
	});

Active blocks have the `choiceflow-block-active` class set. Active links the `choiceflow-active` class.

You can check whether a block is active or not:
	
	if ($('choiceflow-block-foo-bar').choiceflow('is-active')) {
		// stuff
	}

### Customize showing and hiding of blocks

Per default choiceflow uses jQuery's `show()` and `hide()`. You can overwrite those with events:

	$('[id^="choiceflow-block-"]')
		
		// overwrite show event
    	.on('choiceflow:show', function() {
			// show it smooth
			$(this).slideDown();
			// don't do the normal show stuff
			return false;
		})
		
		// overwrite hide event
		.on('choiceflow:hide', function() {
			// hide it smooth
			$(this).slideUp();
			// don't do the normal hide stuff
			return false;
		});

If you want to add checks to determine if a block should be displayed use the `choiceflow:display` event instead.

## Events

Three examples that are identical:

Example 1:

	$('[id^="choiceflow-block-"]').on('choiceflow:display', function(event, block, group) {
		if (group == "foo" && block == "bar") {
			// do some check
		}
		return true;
	});

Example 2:

	$('[id^="choiceflow-block-foo"]').on('choiceflow:display', function(event, block) {
		if (block == "bar") {
			// do some check
		}
		return true;
	});

Example 3:

	$('#choiceflow-block-foo-bar').on('choiceflow:display', function() {
		// do some check
		return true;
	});

### The `choiceflow:display`, `choiceflow:canShow` and `choiceflow:canHide` event and conditions

The events `choiceflow:display|canShow|canHide` take four arguments: `(event, blocks, group, aborted)`.
The event `choiceflow:display` is fired on the block elements in `data-choiceflow-value`, even if these blocks are already shown.
The event `choiceflow:canShow` is fired on the block elements that are going to be shown, but is not yet.
The event `choiceflow:canHide` is fired on the block elements that are going to be hidden, but are not yet.
The `event` is the default event object.
The `blocks` (array) refers to the `data-choiceflow-value` blocks and the `group` to the `data-choiceflow-group`.
The `aborted` (bool) tells you whether some other event has already aborted the displaying.
You can omit all four arguments.

In the following scenario the block `choiceflow-block-foo-bar` can only be displayed if the user entered something in the input field with the id `inputName`.

	$('#choiceflow-block-foo-bar').on('choiceflow:display', function() {
		return $('#inputName').val() != "";
	});

If you return `false` on the event, the link that was clicked has no effect.
If a link would display multiple blocks and any of those blocks' `choiceflow:display` event would return `false`, the link has also no effect.

But be careful with overlapping events. The return value of the last event counts.

### The `choiceflow:show` and `choiceflow:hide` events

The events `choiceflow:show|hide` take three arguments: `(event, block, group)`.
The events are fired on the block element.
The `event` is the default event object.
The `block` refers to a single `data-choiceflow-value` block and the `group` to the `data-choiceflow-group`.
You can omit all three arguments.

These events are fired when a block is going to be shown or hidden.

You can use these events to overwrite the default action like above.

You should not try to prevent displaying here. Use the `choiceflow:display` event for that.

### The `choiceflow:afterShow` and `choiceflow:afterHide` events

The events `choiceflow:afterShow|afterHide` take three arguments: `(event, block, group)`.
The events are fired on the block element.
The `event` is the default event object.
The `block` refers to a single `data-choiceflow-value` block and the `group` to the `data-choiceflow-group`.
You can omit all three arguments.

These events are fired right after a block was shown or hidden.

You can use these events for example to set the focus to a field in the shown block.

### The `choiceflow:afterDisplay` event

The event `choiceflow:afterDisplay` takes four arguments: `(event, blocks, hiddenBlocks, group)`.
The event is fired on the block element.
The `event` is the default event object.
The `blocks` (array) refers to the blocks in the `data-choiceflow-value` attribute.
The `hiddenBlocks` (array) refers to the blocks that were hidden.
The `group` refers to the `data-choiceflow-group`.
You can omit all four arguments.

This event is fired when a link is clicked after all block hide and show actions are performed.

If a link action is not performed, due to the `choiceflow:display` event, this event is not fired.

If a link does has no effect, because the blocks to show and hide were already shown or hidden, the event still fires.

## Examples

### Basic linear flow

Step by step through 3 blocks.

	<div id="choiceflow-block-default-1">
		<!-- make block 1 active --> <span style="display: none;" data-choiceflow-value="1" data-choiceflow-active="1"></span>
		BLOCK 1
		<!-- link to block 2 --> <span data-choiceflow-value="2">Next</span>
	</div>
	<div id="choiceflow-block-default-2">
		BLOCK 2
		<!-- link to block 3 --> <span data-choiceflow-value="3">Next</span>
	</div>
	<div id="choiceflow-block-default-3">
		BLOCK 3
	</div>

