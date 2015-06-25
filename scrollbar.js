(function(window, $) {

	'use strict';

	function Scrollbar(element, options) {
		var defaults = {
			wheelSpeed: 		1,
		    wheelPropagation: 	false,
		    swipePropagation: 	true,
		    minScrollbarLength: null,
		    maxScrollbarLength: null,
		    useBothWheelAxes: 	false,
		    useKeyboard: 		true,
		    suppressScrollX: 	false,
		    suppressScrollY: 	false,
		    scrollXMarginOffset: 0,
		    scrollYMarginOffset: 0
		};

		this.settings = $.extend(defaults, options);
		this.element = document.querySelector(element);
		this.$element = $(element);
		
		this._init();
		this._bindHandler();

		// Create a plugin instance.
		//var i = instances.add(document.getElementsByClassName(wrapper)[0]);

  		this.updateGeometry();
	}

	Scrollbar.prototype = {
		_init: function() {

			this.$element.addClass('ps-container');

			this.containerWidth = null;
			this.containerHeight = null;
			this.contentWidth = null;
			this.contentHeight = null;

			this.isRtl = this.$element.css('direction') === 'rtl';
			this.ownerDocument = this.element.ownerDocument || document;
			this.$ownerDocument = $(this.ownerDocument);

			this.scrollbarXRail = $('<div class="ps-scrollbar-x-rail"></div>').appendTo(this.$element);
			this.scrollbarX = $('<div class="ps-scrollbar-x"></div>').appendTo(this.scrollbarXRail);
			this.scrollbarXActive = null;
			this.scrollbarXWidth = null;
			this.scrollbarXLeft = null;
			this.scrollbarXBottom = parseInt(this.scrollbarXRail.css('bottom'));
			this.isScrollbarXUsingBottom = this.scrollbarXBottom === this.scrollbarXBottom; // !isNaN
			this.scrollbarXTop = this.isScrollbarXUsingBottom ? null : parseInt(this.scrollbarXRail.css('top'));
			this.railBorderXWidth = parseInt(this.scrollbarXRail.css('borderLeftWidth')) + parseInt(this.scrollbarXRail.css('borderRightWidth'));
			this.scrollbarXRail.css('display', 'block');// Set rail to display:block to calculate margins
			this.railXMarginWidth = parseInt(this.scrollbarXRail.css('marginLeft')) + parseInt(this.scrollbarXRail.css('marginRight'));
			this.scrollbarXRail.css('display', '');
			this.railXWidth = null;
			this.railXRatio = null;

			this.scrollbarYRail = $('<div class="ps-scrollbar-y-rail"></div>').appendTo(this.$element);
			this.scrollbarY = $('<div class="ps-scrollbar-y"></div>').appendTo(this.scrollbarYRail);
			this.scrollbarYActive = null;
			this.scrollbarYHeight = null;
			this.scrollbarYTop = null;
			this.scrollbarYRight = parseInt(this.scrollbarYRail.css('right'));
			this.isScrollbarYUsingRight = this.scrollbarYRight === this.scrollbarYRight; // !isNaN
			this.scrollbarYLeft = this.isScrollbarYUsingRight ? null : parseInt(this.scrollbarYRail.css('left'));
			this.scrollbarYOuterWidth = this.isRtl ? outerWidth(this.scrollbarY) : null;/////////
			this.railBorderYWidth = parseInt(this.scrollbarYRail.css('borderTopWidth')) + parseInt(this.scrollbarYRail.css('borderBottomWidth'));
			this.scrollbarYRail.css('display', 'block');// Set rail to display:block to calculate margins
			this.railYMarginHeight = parseInt(this.scrollbarYRail.css('marginTop')) + parseInt(this.scrollbarYRail.css('marginBottom'));
			this.scrollbarYRail.css('display', '');
			this.railYHeight = null;
			this.railYRatio = null;

			var outerWidth = function (element) {
				return parseInt($(element).css('width')) +
					parseInt($(element).css('paddingLeft')) +
					parseInt($(element).css('paddingRight')) +
					parseInt($(element).css('borderLeftWidth')) +
					parseInt($(element).css('borderRightWidth'));
			};
		},

		updateGeometry: function() {
			this.containerWidth = this.element.clientWidth;
			this.containerHeight = this.element.clientHeight;
			this.contentWidth = this.element.scrollWidth;
			this.contentHeight = this.element.scrollHeight;

			/*if (!this.element.contains(this.scrollbarXRail[0])) {
				$(this.scrollbarXRail).appendTo(this.$element);
			}
			if (!this.element.contains(this.scrollbarYRail[0])) {
				$(this.scrollbarYRail).appendTo(this.$element);
			}*/

			if (!this.settings.suppressScrollX && this.containerWidth + this.settings.scrollXMarginOffset < this.contentWidth) {
				this.scrollbarXActive = true;
				this.railXWidth = this.containerWidth - this.railXMarginWidth;
				this.railXRatio = this.containerWidth / this.railXWidth;
				this.scrollbarXWidth = this._getThumbSize(parseInt(this.railXWidth * this.containerWidth / this.contentWidth));
				this.scrollbarXLeft = parseInt(this.element.scrollLeft * (this.railXWidth - this.scrollbarXWidth) / (this.contentWidth - this.containerWidth));
			} else {
				this.scrollbarXActive = false;
				this.scrollbarXWidth = 0;
				this.scrollbarXLeft = 0;
				this.$element.scrollLeft = 0;
			}

			if (!this.settings.suppressScrollY && this.containerHeight + this.settings.scrollYMarginOffset < this.contentHeight) {
				this.scrollbarYActive = true;
				this.railYHeight = this.containerHeight - this.railYMarginHeight;
				this.railYRatio = this.containerHeight / this.railYHeight;
				this.scrollbarYHeight = this._getThumbSize(parseInt(this.railYHeight * this.containerHeight / this.contentHeight));
				this.scrollbarYTop = parseInt(this.element.scrollTop * (this.railYHeight - this.scrollbarYHeight) / (this.contentHeight - this.containerHeight));
			} else {
				this.scrollbarYActive = false;
				this.scrollbarYHeight = 0;
				this.scrollbarYTop = 0;
				this.element.scrollTop = 0;
			}

			if (this.scrollbarXLeft >= this.railXWidth - this.scrollbarXWidth) {
				this.scrollbarXLeft = this.railXWidth - this.scrollbarXWidth;
			}
			if (this.scrollbarYTop >= this.railYHeight - this.scrollbarYHeight) {
				this.scrollbarYTop = this.railYHeight - this.scrollbarYHeight;
			}

			this._updateCss();

			this.scrollbarXActive ? this.$element.addClass('ps-active-x') : this.$element.removeClass('ps-active-x');
			this.scrollbarYActive ? this.$element.addClass('ps-active-y') : this.$element.removeClass('ps-active-y');
		},

		_getThumbSize: function(thumbSize) {
		  	if (this.settings.minScrollbarLength) {
		    	thumbSize = Math.max(thumbSize, this.settings.minScrollbarLength);
		  	}
		  	if (this.settings.maxScrollbarLength) {
		    	thumbSize = Math.min(thumbSize, this.settings.maxScrollbarLength);
		  	}
		  	return thumbSize;
		},

		 _updateCss: function() {
		  	var xRailOffset = {width: this.railXWidth};
		  	if (this.isRtl) {
		    	xRailOffset.left = this.element.scrollLeft + this.containerWidth - this.contentWidth;///??
		  	} else {
		    	xRailOffset.left = this.element.scrollLeft;
		  	}
		  	if (this.isScrollbarXUsingBottom) {
		    	xRailOffset.bottom = this.scrollbarXBottom - this.element.scrollTop;
		  	} else {
		    	xRailOffset.top = this.scrollbarXTop + this.element.scrollTop;
		  	}
		  	$(this.scrollbarXRail).css(xRailOffset);

		  	var yRailOffset = {top: this.element.scrollTop, height: this.railYHeight};
		  	if (this.isScrollbarYUsingRight) {
		    	if (this.isRtl) {
		      		yRailOffset.right = this.contentWidth - this.element.scrollLeft - this.scrollbarYRight - this.scrollbarYOuterWidth;
		    	} else {
		      		yRailOffset.right = this.scrollbarYRight - this.element.scrollLeft;
		    	}
		  	} else {
		    	if (this.isRtl) {
		      		yRailOffset.left = this.element.scrollLeft + this.containerWidth * 2 - this.contentWidth - this.scrollbarYLeft - this.scrollbarYOuterWidth;
		    	} else {
		      		yRailOffset.left = this.scrollbarYLeft + this.element.scrollLeft;
		    	}
		  	}
		  	$(this.scrollbarYRail).css(yRailOffset);

		  	$(this.scrollbarX).css({left: this.scrollbarXLeft, width: this.scrollbarXWidth - this.railBorderXWidth});
		  	$(this.scrollbarY).css({top: this.scrollbarYTop, height: this.scrollbarYHeight - this.railBorderYWidth});
		},

		_bindHandler: function() {
			this._bindMousewheelHandler();
			this._bindClickRailHandler();
			this._bindMouseScrollXHandler();	//drag-scrollbar
			this._bindMouseScrollYHandler();	//drag-scrollbar
			this._bindKeyboardHandler();
			this._bindNativeScrollHandler();
			/*this._bindSelectionHandler();
			this._bindTouchHandler();*/
		},

		_bindMousewheelHandler: function() {

			if (typeof window.onwheel !== "undefined") {
			    this.element.onwheel = mousewheelHandler;
			} else if (typeof window.onmousewheel !== "undefined") {
			    this.element.onmousewheel = mousewheelHandler;
			}

			var _self = this;
  			var shouldPrevent = false;

  			function mousewheelHandler(e) {
			    var delta = getDeltaFromEvent(e);

			    var deltaX = delta[0];
			    var deltaY = delta[1];

			    shouldPrevent = false;
			    if (!_self.settings.useBothWheelAxes) {
			      	// deltaX will only be used for horizontal scrolling and deltaY will
			      	// only be used for vertical scrolling - this is the default
			      	_self.element.scrollTop = _self.element.scrollTop - (deltaY * _self.settings.wheelSpeed);
			      	_self.element.scrollLeft = _self.element.scrollLeft + (deltaX * _self.settings.wheelSpeed);
			    } else if (_self.scrollbarYActive && !_self.scrollbarXActive) {
			      	// only vertical scrollbar is active and useBothWheelAxes option is
			      	// active, so let's scroll vertical bar using both mouse wheel axes
			      	if (deltaY) {
			        	_self.element.scrollTop = _self.element.scrollTop - (deltaY * _self.settings.wheelSpeed);
			      	} else {
			        	_self.element.scrollTop = _self.element.scrollTop + (deltaX * _self.settings.wheelSpeed);
			      	}
			      	shouldPrevent = true;
			    } else if (_self.scrollbarXActive && !_self.scrollbarYActive) {
			      	// useBothWheelAxes and only horizontal bar is active, so use both
			      	// wheel axes for horizontal bar
			      	if (deltaX) {
			        	_self.element.scrollLeft = _self.element.scrollLeft + (deltaX * _self.settings.wheelSpeed);
			      	} else {
			        	_self.element.scrollLeft = _self.element.scrollLeft - (deltaY * _self.settings.wheelSpeed);
			      	}
			      	shouldPrevent = true;
			    }

			    _self.updateGeometry();

			    shouldPrevent = (shouldPrevent || shouldPreventDefault(deltaX, deltaY));
			    if (shouldPrevent) {
			      	e.stopPropagation();
			      	e.preventDefault();
			    }
			}

			function getDeltaFromEvent(e) {//////
			    var deltaX = e.deltaX;
			    var deltaY = -1 * e.deltaY;

			    if (typeof deltaX === "undefined" || typeof deltaY === "undefined") {
			      	// OS X Safari
			      	deltaX = -1 * e.wheelDeltaX / 6;
			      	deltaY = e.wheelDeltaY / 6;
			    }

			    if (e.deltaMode && e.deltaMode === 1) {
			      	// Firefox in deltaMode 1: Line scrolling
			      	deltaX *= 10;
			      	deltaY *= 10;
			    }

			    if (deltaX !== deltaX && deltaY !== deltaY/* NaN checks */) {
			      	// IE in some mouse drivers
			      	deltaX = 0;
			      	deltaY = e.wheelDelta;
			    }

			    return [deltaX, deltaY];
			}

			function shouldPreventDefault(deltaX, deltaY) {////////////
			    var scrollTop = _self.element.scrollTop;
			    if (deltaX === 0) {
			      	if (!_self.scrollbarYActive) {
			        	return false;
			    	}
				    if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= _self.contentHeight - _self.containerHeight && deltaY < 0)) {
				        return !_self.settings.wheelPropagation;
				    }
				}

	    		var scrollLeft = _self.element.scrollLeft;
	    		if (deltaY === 0) {
	      			if (!_self.scrollbarXActive) {
	        			return false;
	      			}
		      		if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= _self.contentWidth - _self.containerWidth && deltaX > 0)) {
		        		return !_self.settings.wheelPropagation;
		      		}
		    	}
		    	return true;
		  	}			
		},

		_bindClickRailHandler: function() {
			var _self = this;

			this.scrollbarY.click(function(e) {
			  	e.stopPropagation;
			});
			this.scrollbarYRail.click(function(e) {
			    var halfOfScrollbarLength = parseInt(_self.scrollbarYHeight / 2);
			    var positionTop = _self.railYRatio * (e.pageY - window.scrollY - pageOffset(_self.scrollbarYRail[0]).top - halfOfScrollbarLength);
			    var maxPositionTop = _self.railYRatio * (_self.railYHeight - _self.scrollbarYHeight);
			    var positionRatio = positionTop / maxPositionTop;

			    if (positionRatio < 0) {
			      	positionRatio = 0;
			    } else if (positionRatio > 1) {
			      	positionRatio = 1;
			    }

			    _self.element.scrollTop = (_self.contentHeight - _self.containerHeight) * positionRatio;
			    _self.updateGeometry();

			    e.stopPropagation();
		  	});

			this.scrollbarX.click(function(e) {
			  	e.stopPropagation;
			});
			this.scrollbarXRail.click(function(e) {
			    var halfOfScrollbarLength = parseInt(_self.scrollbarXWidth / 2);
			    var positionLeft = _self.railXRatio * (e.pageX - window.scrollX - pageOffset(_self.scrollbarXRail[0]).left - halfOfScrollbarLength);
			    var maxPositionLeft = _self.railXRatio * (_self.railXWidth - _self.scrollbarXWidth);
			    var positionRatio = positionLeft / maxPositionLeft;

			    if (positionRatio < 0) {
			      positionRatio = 0;
			    } else if (positionRatio > 1) {
			      positionRatio = 1;
			    }

			    _self.element.scrollLeft = (_self.contentWidth - _self.containerWidth) * positionRatio;
			    _self.updateGeometry();

			    e.stopPropagation();
		  	});
		},

		startScrolling: function (axis) {
		  	this.$element.addClass('ps-in-scrolling');
		  	if (typeof axis !== 'undefined') {
		   		this.$element.addClass('ps-' + axis);
		  	} else {
			    this.$element.addClass('ps-x');
			    this.$element.addClass('ps-y');
		  	}
		},
		stopScrolling: function (axis) {
		  	this.$element.removeClass('ps-in-scrolling');
		  	if (typeof axis !== 'undefined') {
		    	this.$element.removeClass('ps-' + axis);
		  	} else {
		    	this.$element.removeClass('ps-x');
		    	this.$element.removeClass('ps-y');
		  	}
		},

		_bindMouseScrollXHandler: function() {
			var _self = this;
			var currentLeft = null;
		  	var currentPageX = null;

			function updateScrollLeft(deltaX) {
			    var newLeft = currentLeft + (deltaX * _self.railXRatio);
			    var maxLeft = _self.scrollbarXRail[0].getBoundingClientRect(_self.scrollbarXRail).left + (_self.railXRatio * (_self.railXWidth - _self.scrollbarXWidth));

			    if (newLeft < 0) {
			      	_self.scrollbarXLeft = 0;
			    } else if (newLeft > maxLeft) {
			      	_self.scrollbarXLeft = maxLeft;
			    } else {
			      	_self.scrollbarXLeft = newLeft;
			    }

			    var scrollLeft = parseInt(_self.scrollbarXLeft * (_self.contentWidth - _self.containerWidth) / (_self.containerWidth - (_self.railXRatio * _self.scrollbarXWidth)));
			    _self.element.scrollLeft = scrollLeft;
			}

			var mouseMoveHandler = function (e) {
			    updateScrollLeft(e.pageX - currentPageX);
			    _self.updateGeometry();
			    e.stopPropagation();
			    e.preventDefault();
			};

			var mouseUpHandler = function () {
			    _self.stopScrolling('x');
			    _self.$ownerDocument.unbind('mousemove', mouseMoveHandler);
			};

			this.scrollbarX.bind('mousedown', function (e) {
			    currentPageX = e.pageX;
			    currentLeft = parseInt(_self.scrollbarX.css('left')) * _self.railXRatio;
			    _self.startScrolling('x');

			    _self.$ownerDocument.bind('mousemove', mouseMoveHandler);
			    _self.$ownerDocument.one('mouseup', mouseUpHandler);

			    e.stopPropagation();
			    e.preventDefault();
			});
		},

		_bindMouseScrollYHandler: function() {
			var _self = this;
			var currentTop = null;
			var currentPageY = null;

			function updateScrollTop(deltaY) {
			    var newTop = currentTop + (deltaY * _self.railYRatio);
			    var maxTop = _self.scrollbarYRail[0].getBoundingClientRect().top + (_self.railYRatio * (_self.railYHeight - _self.scrollbarYHeight));

			    if (newTop < 0) {
			      _self.scrollbarYTop = 0;
			    } else if (newTop > maxTop) {
			      _self.scrollbarYTop = maxTop;
			    } else {
			      _self.scrollbarYTop = newTop;
			    }

			    var scrollTop = parseInt(_self.scrollbarYTop * (_self.contentHeight - _self.containerHeight) / (_self.containerHeight - (_self.railYRatio * _self.scrollbarYHeight)));
			    _self.element.scrollTop = scrollTop;
			}

			var mouseMoveHandler = function (e) {
			    updateScrollTop(e.pageY - currentPageY);
			    _self.updateGeometry();
			    e.stopPropagation();
			    e.preventDefault();
			};

			var mouseUpHandler = function () {
			    _self.stopScrolling('y');
			    _self.$ownerDocument.unbind('mousemove', mouseMoveHandler);
			};

			this.scrollbarY.bind('mousedown', function (e) {
			    currentPageY = e.pageY;
			    currentTop = parseInt(_self.scrollbarY.css('top')) * _self.railYRatio;
			    _self.startScrolling('y');

			    _self.$ownerDocument.bind('mousemove', mouseMoveHandler);
			    _self.$ownerDocument.one('mouseup', mouseUpHandler);

			    e.stopPropagation();
			    e.preventDefault();
			});
		},

		_isEditable: function(el) {
			return this._matches(el, "input,[contenteditable]") ||
				this._matches(el, "select,[contenteditable]") ||
				this._matches(el, "textarea,[contenteditable]") ||
				this._matches(el, "button,[contenteditable]");
		},
		_matches: function (element, query) {
			if (typeof element.matches !== 'undefined') {
				return element.matches(query);
			} else {
				if (typeof element.matchesSelector !== 'undefined') {
					return element.matchesSelector(query);
				} else if (typeof element.webkitMatchesSelector !== 'undefined') {
					return element.webkitMatchesSelector(query);
				} else if (typeof element.mozMatchesSelector !== 'undefined') {
					return element.mozMatchesSelector(query);
				} else if (typeof element.msMatchesSelector !== 'undefined') {
					return element.msMatchesSelector(query);
				}
			}
			
		},
		_bindKeyboardHandler: function() {
			var _self = this;
			var hovered = false;
			this.$element.bind('mouseenter', function () {
			    hovered = true;
			});
			this.$element.bind('mouseleave', function () {
			    hovered = false;
			});

			var shouldPrevent = false;
			function shouldPreventDefault(deltaX, deltaY) {
			    var scrollTop = _self.element.scrollTop;
			    if (deltaX === 0) {
			      	if (!_self.scrollbarYActive) {
			        	return false;
			    	}
			      	if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= _self.contentHeight - _self.containerHeight && deltaY < 0)) {
			        	return !_self.settings.wheelPropagation;
			      	}
			    }

			    var scrollLeft = _self.element.scrollLeft;
			    if (deltaY === 0) {
			      	if (!_self.scrollbarXActive) {
			        	return false;
			      	}
			      	if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= _self.contentWidth - _self.containerWidth && deltaX > 0)) {
			        	return !_self.settings.wheelPropagation;
			      	}
			    }
			    return true;
			}

			this.$ownerDocument.bind('keydown', function (e) {
			    if (e.isDefaultPrevented && e.isDefaultPrevented()) {
			      	return;
			    }

			    if (!hovered) {
			      	return;
			    }

			    var activeElement = document.activeElement ? document.activeElement : _self.ownerDocument.activeElement;
			    if (activeElement) {
			      	// go deeper if element is a webcomponent
			      	while (activeElement.shadowRoot) {
			        	activeElement = activeElement.shadowRoot.activeElement;
			      	}
			      	if (_self._isEditable(activeElement)) {
			        	return;
			      	}
			    }

			    var deltaX = 0;
			    var deltaY = 0;

			    switch (e.which) {
			    case 37: // left
			      	deltaX = -30;
			      	break;
			    case 38: // up
			      	deltaY = 30;
			      	break;
			    case 39: // right
			      	deltaX = 30;
			      	break;
			    case 40: // down
			      	deltaY = -30;
			      	break;
			    case 33: // page up
			      	deltaY = 90;
			      	break;
			    case 32: // space bar
			    case 34: // page down
			      	deltaY = -90;
			      	break;
			    case 35: // end
				    if (e.ctrlKey) {
				        deltaY = -_self.contentHeight;
				    } else {
				        deltaY = -_self.containerHeight;
				    }
			      	break;
			    case 36: // home
			      	if (e.ctrlKey) {
			        	deltaY = _self.element.scrollTop;
			      	} else {
			        	deltaY = _self.containerHeight;
			      	}
			      	break;
			    default:
			      	return;
			    }

			    _self.element.scrollTop = _self.element.scrollTop - deltaY;
			    _self.element.scrollLeft = _self.element.scrollLeft + deltaX;
			    _self.updateGeometry();

			    shouldPrevent = shouldPreventDefault(deltaX, deltaY);
			    if (shouldPrevent) {
			      	e.preventDefault();
			    }
			});
		},

		_bindNativeScrollHandler: function() {
			var _self = this;
			this.$element.bind('scroll', function() {
		    	_self.updateGeometry();
			});
		}


	};

	window.Scrollbar = Scrollbar;

	$.fn.scrollbar = function() {

	}

})(window, jQuery);