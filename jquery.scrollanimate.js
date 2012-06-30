/*
Plugin: jQuery Scroll Animation
Version: 0.1.0
Author: Tyler Akins
Author URL: http://github.com/fidian/jquery-scrollanimate

Dual licensed under the MIT and GPL licenses:
http://www.opensource.org/licenses/mit-license.php
http://www.gnu.org/licenses/gpl.html
*/

'use strict';

(function ($, undefined){
	var watches = [],
		$window = $(window),
		windowHeight = $window.height(),
		windowWidth = $window.width();

	var findWatcherFor = function (element) {
		for (var i = 0; i < watches.length; i ++) {
			if (watches[i].element === element) {
				return watches[i];
			}
		}

		watches.push({
			element: element,
			jElement: $(element),
			actions: []
		});
		return watches[watches.length - 1];
	};

	var makeDiffFunction = function (diff) {
		if (typeof diff != 'object') {
			return function () {
				return diff;
			};
		}

		if (typeof diff == 'function') {
			return diff;
		}

		if (diff.type === undefined) {
			diff.type = 'linear';
		}

		switch (diff.type) {
			default:  // linear
				if (diff.speed == undefined) {
					diff.speed = 0.1;
				}

				if (diff.adjust) {
					return function (scroll) {
						return Math.round((scroll + diff.adjust) * diff.speed);
					};
				}

				return function (scroll) {
					return Math.round(scroll * diff.speed);
				};
		}
	};

	var update = function () {
		var scrollTop = $window.scrollTop(),
			scrollLeft = $window.scrollLeft();

		for (var i = 0; i < watches.length; i ++) {
			var $element = watches[i].jElement,
				eOffset = $element.offset(),
				eHeight = $element.outerHeight(true),
				eWidth = $element.outerWidth(true);

			// Ignore if totally to any side of the viewport
			if (eOffset.top + eHeight >= scrollTop && // not entirely above
				eOffset.top <= scrollTop + windowHeight && // below
				eOffset.left + eWidth >= scrollLeft && // left ... or right
				eOffset.left <= scrollLeft + windowWidth) {
				// We could maybe see it, so animate things
				var actions = watches[i].actions,
					relativeX = scrollLeft - eOffset.left,
					relativeY = scrollTop - eOffset.top;

				for (var j = 0; j < actions.length; j ++) {
					actions[j](relativeX, relativeY);
				}
			}
		}
	};

	$window.bind('scroll', update).resize(function () {
			windowHeight = $window.height();
			windowWidth = $window.width();
			update();
		});


	$.fn.saBackgroundPosition = function (diffX, diffY) {
		var $this = $(this),
			xFunc = makeDiffFunction(diffX),
			yFunc = makeDiffFunction(diffY);

		$this.each(function () {
			var $target = $(this);
			$target.scrollAnimate(function (relativeX, relativeY) {
				$target.css('backgroundPosition', xFunc(- relativeX) + " " + yFunc(- relativeY));
			});
		});

		return $this;
	};

	$.fn.saPosition = function (diffX, diffY, viewport) {
		var $this = $(this),
			xFunc = makeDiffFunction(diffX),
			yFunc = makeDiffFunction(diffY),
			$viewport;

		if (viewport === undefined) {
			$viewport = $this;
		} else {
			$viewport = $(viewport);
		}

		$this.each(function () {
			var $target = $(this);
			$viewport.scrollAnimate(function (relativeX, relativeY) {
				$target.offset({
					top: yFunc(relativeY),
					left: xFunc(relativeX)
				});
			});
		});

		return $this;
	};

	$.fn.scrollAnimate = function (action) {
		var viewer = $(this);

		if (! viewer.length) {
			return viewer;  // Need a viewport, even if it is $('body')
		}

		var watcher = findWatcherFor(viewer.get(0));
		watcher.actions.push(action);
		return viewer;
	};

	$.fn.parallax = function (xpos, adjust, speed) {
		if (xpos === undefined || xpos === null) {
			xpos = "50%";
		}

		return $(this).saBackgroundPosition(xpos, {
			speed: speed,
			adjust: adjust
		});
	};
})(jQuery);
