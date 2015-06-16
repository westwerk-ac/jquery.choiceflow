# jquery.choiceflow

Choiceflow is a jQuery plugin that provides you with an easy way to display and hide parts of your website.
It can be used for step-by-step forms with a linear or decision based path.
The most basic configuration relies on html attributes and does not require you to write JavaScript.

## Overview

1. [Install](#install)
2. [Usage](#usage)
  1. [A basic flow](#usage-basic)
  2. [Multiple flows](#usage-multiple)
  3. [Active blocks and links](#usage-links)
  4. [Customize showing and hiding of blocks](#usage-customize)
3. [Events](#events)
  1. [`choiceflow:display`](#events-display)
  2. [`choiceflow:canHide`](#events-can-hide)
  3. [`choiceflow:canShow`](#events-can-show)
  4. [`choiceflow:show` and `choiceflow:hide`](#events-show-hide)
  5. [`choiceflow:afterShow` and `choiceflow:afterHide`](#events-after-show-hide)
  6. [`choiceflow:afterDisplay`](#events-after-display)
4. [Options](#options)
  1. [`beforeLinkAction` and `afterLinkAction`](#options-link-action)
5. [Examples](#examples)
  1. [Basic linear flow](#examples-basic)

## <a name="install"></a>1. Install

```shell
bower install westwerk-ac/jquery.choiceflow
```

## <a name="usage"></a>2. Usage

### <a name="usage-basic"></a>i. A basic flow

To build a flow you need only two things: links and blocks.

* A **link** is a html element the user can click to display an block.
* A **block** is a html element that can be shown by clicking links.

A link can look like this:

```html
<span data-choiceflow-value="block2">Next</span>
```

Or like this if you use bootstrap:

```html
<button type="button" class="btn btn-primary" data-choiceflow-value="block2">Next</button>
```

The corresponding block could be this:

```html
<div id="choiceflow-block-default-block2"></div>
```

When clicking a link with `data-choiceflow-value="foo"` the element with `id="choiceflow-block-default-foo"` is shown.
All other blocks are hidden.

You cannot have blocks with identical ids. But you can display several blocks using one link with `data-choiceflow-value="foo,bar"`.

### <a name="usage-multiple"></a>ii. Multiple flows

You can group flows using the `data-choiceflow-group` attribute:

```html
<span data-choiceflow-group="foo1" data-choiceflow-value="bar2">Next</span>
<div id="choiceflow-block-foo1-bar2"></div>
```

Defining no group is the same as having `data-choiceflow-group="default"`.

When clicking a link, only other blocks of the same group are hidden.

### <a name="usage-links"></a>iii. Active blocks and links

An element can only be a block if there is a corresponding link. All blocks are hidden per default.
To have a block shown per default, add `data-choiceflow-active="1"` to at least one link that references the block.

```html
<span data-choiceflow-value="block1" data-choiceflow-active="1">Next</span>
```

Sometimes you have a block that should be visible at first, but you don't want to link back to it.
You can achieve this by having a hidden link inside the block:

```html
<div id="choiceflow-block-default-block1">
	<span data-choiceflow-value="block1" data-choiceflow-active="1" style="display: none;"></span>
</div>
```

Alternatively if you want to use JS:

```js
jQuery(function($) {
	$('#choiceflow-block-default-block1').choiceflow('display');
});
```

Active blocks have the `choiceflow-block-active` class set. Active links the `choiceflow-active` class.

You can check whether a block is active or not:

```js
if ($('choiceflow-block-foo-bar').choiceflow('is-active')) {
	// stuff
}
```

### <a name="usage-customize"></a>iv. Customize showing and hiding of blocks

Per default choiceflow uses jQuery's `show()` and `hide()`. You can overwrite those with the `choiceflow:show|hide' events.

If you want to add checks to determine if a block should be displayed use the `choiceflow:display|canShow|canHide` events instead.

## <a name="events"></a>3. Events

When clicking a link or using js to display a block the following event are fired in that order:

| Event | Fired | Can be used to ... |
| ----- | ----- | ------------------ |
| [`choiceflow:display`](#events-display) | before displaying | ... validate and prevent the action. |
| [`choiceflow:canHide`](#events-can-hide) | before displaying | ... validate and prevent the action. |
| [`choiceflow:canShow`](#events-can-show) | before displaying | ... validate and prevent the action. |
| [`choiceflow:hide`](#events-show-hide) | before hiding a block | ... overwrite how the block is hidden. |
| [`choiceflow:afterHide`](#events-after-show-hide) | after hiding a block | ... save changes and change styles. |
| [`choiceflow:show`](#events-show-hide) | before showing a block | ... overwrite how the block is shown. |
| [`choiceflow:afterShow`](#events-after-show-hide) | after showing a block | ... change styles. |
| [`choiceflow:afterDisplay`](#events-after-display) | after displaying | ... set focus, etc. |

### <a name="events-display"></a>i. `choiceflow:display`

This event is fired before anything else on *each* block that is going to be displayed, even if the block is already visible.

This event is called with 4 arguments: `(event, blocks, group, aborted)`.

| Argument | Type | Description |
| -------- | ---- | ----------- |
| event | object | The default event object. |
| blocks | array | The blocks that will be displayed. |
| group | string | The group of the blocks. |
| aborted | bool | Whether another event aborted this action. |

If you return `false`, the action is aborted for all blocks. The events `choiceflow:display`, `choiceflow:canHide` and `choiceflow:canShow` are still fired, but their results cannot change that the action is aborted.

Be careful with overlapping events. The return value of the last event counts.

### <a name="events-can-hide"></a>ii. `choiceflow:canHide`

This event is identical with `choiceflow:display`, except that it is called on visible blocks that are going to be hidden.

This event suites great for form validation.

#### Example

In the following scenario the block `choiceflow-block-foo-bar` can only be hidden if the user filled all inputs.
All attempts to move to another block will fail if this returns `false`;

```js
$('#choiceflow-block-foo-bar').on('choiceflow:canHide', function() {
	var ok = true;
	$(this).find('input').each(function() {
		if ($(this).val() == "")
			ok = false;
	});
	return ok;
});
```

### <a name="events-can-show"></a>iii. `choiceflow:canShow`

This event is identical with `choiceflow:display`, except that it is called on hidden blocks that are going to be shown.

#### Example

In the following scenario the block `choiceflow-block-foo-bar` can only be shown if the user entered something in the input field with the id `inputName`.

```js
$('#choiceflow-block-foo-bar').on('choiceflow:canShow', function() {
	return $('#inputName').val() != "";
});
```

### <a name="events-show-hide"></a>iv. `choiceflow:show` and `choiceflow:hide`

These events are fired on *each* block that is definitely going to be shown or hidden.

This event is called with 3 arguments: `(event, block, group)`.

| Argument | Type | Description |
| -------- | ---- | ----------- |
| event | object | The default event object. |
| block | string | The block that will be shown/hidden. |
| group | string | The group of the block. |

You can use these events to overwrite the default show/hide action if you return `false`.

You should not try to prevent displaying here. Use the `choiceflow:display|canShow|canHide` events for that.

#### Example

This will make the blocks smoothly slide up and down.

```js
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
```

### <a name="events-after-show-hide"></a>v. `choiceflow:afterShow` and `choiceflow:afterHide`

These events are fired on *each* block immediately after it was shown or hidden. If multiple blocks are shown/hidden the `choiceflow:afterShow|afterHide` event is called before the next block's `choiceflow:show|hide` event.

This event is called with 3 arguments: `(event, block, group)`.

| Argument | Type | Description |
| -------- | ---- | ----------- |
| event | object | The default event object. |
| block | string | The block that was shown/hidden. |
| group | string | The group of the block. |

You can use these events to apply css, set the focus, scoll to the block, etc.

#### Example

This will focus on the first input element of the shown block.

```js
$('[id^="choiceflow-block-"]').on('choiceflow:afterShow', function() {
	$(this).find('input').filter(':first').focus();
});
```

### <a name="events-after-display"></a>vi. `choiceflow:afterDisplay`

This event is fired after each show and hide action is performed.
It is fired on *each* block that was displayed, even if it was visible before.

This event is called with 4 arguments: `(event, blocks, hiddenBlocks, group)`.

| Argument | Type | Description |
| -------- | ---- | ----------- |
| event | object | The default event object. |
| blocks | array | The blocks that were displayed. |
| hiddenBlocks | array | The blocks that were hidden. |
| group | string | The group of the block. |

If a link action is not performed, due to the `choiceflow:display|canShow|canHide` events, this event is not fired.

If a link does has no effect, because the blocks to show and hide were already shown or hidden, this event still fires.

## <a name="options"></a>4. Options

Define options like this:

```js
$.choiceflow({
	'foo': 'bar'
});
```

Available options:

| Option | Type | Description |
| ------ | ---- | ----------- |
| [beforeLinkAction](#options-link-action) | function | Called when a link is clicked. |
| [afterLinkAction](#options-link-action) | function | Called after a link action was performed. |

### <a name="options-link-action"></a>i. `beforeLinkAction` and `afterLinkAction`

This options take a function with the following arguments:

| Argument | Type | Description |
| -------- | ---- | ----------- |
| blocks | array | The blocks that the link reveals. |
| show | array | The blocks that are going to be shown and were hidden before. |
| hide | array | The blocks that are going to be hidden and were shown before. |
| group | string | The group of the link. |

You can return `false` from the `beforeLinkAction` function to prevent the link action.

## <a name="examples"></a>5. Examples

### <a name="examples-basic"></a>i. Basic linear flow

Step by step through 3 blocks.

```html
<div id="choiceflow-block-default-1">
	<!-- make block 1 active -->
	<span style="display: none;" data-choiceflow-value="1" data-choiceflow-active="1"></span>
	BLOCK 1
	<!-- link to block 2 -->
	<span data-choiceflow-value="2">Next</span>
</div>
<div id="choiceflow-block-default-2">
	BLOCK 2
	<!-- link to block 3 -->
	<span data-choiceflow-value="3">Next</span>
</div>
<div id="choiceflow-block-default-3">
	BLOCK 3
</div>
```

