(function(ionic) {
'use strict';

  ionic.views.Scroll = function(opts) {
    var _this = this;

    // Extend the options with our defaults
    ionic.Utils.extend(opts, {
      decelerationRate: ionic.views.Scroll.prototype.DECEL_RATE_NORMAL,
      dragThresholdY: 10,
      resistance: 2
    });

    this.el = opts.el;
    this.decelerationRate = opts.decelerationRate;
    this.dragThresholdY = opts.dragThresholdY;
    this.resistance = opts.resistance;

    // Listen for drag and release events
    window.ionic.onGesture('drag', function(e) {
      _this._handleDrag(e);
    }, this.el);
    window.ionic.onGesture('release', function(e) {
      _this._handleEndDrag(e);
    }, this.el);
  };

  ionic.views.Scroll.prototype = {
    DECEL_RATE_NORMAL: 0.998,
    DECEL_RATE_FAST: 0.99,

    /**
     * Scroll to the given X and Y point, taking 
     * the given amount of time, with the given
     * easing function defined as a CSS3 timing function.
     *
     * @param {float} the x position to scroll to (CURRENTLY NOT SUPPORTED!)
     * @param {float} the y position to scroll to
     * @param {float} the time to take scrolling to the new position
     * @param {easing} the animation function to use for easing
     */
    scrollTo: function(x, y, time, easing) {
      easing = easing || 'cubic-bezier(0.1, 0.57, 0.1, 1)';

      var el = this.el;

      el.style.webkitTransitionTimingFunction = easing;
      el.style.webkitTransitionDuration = time;
      el.style.webkitTransform = 'translate3d(0,' + y + 'px, 0)';
    },


    _initDrag: function() {
      this._isDragging = false;
      this._drag = null;
      this.el.classList.remove('scroll-scrolling');
      this.el.style.webkitTransitionDuration = '0';

    },

    /**
     * Initialize a drag by grabbing the content area to drag, and any other
     * info we might need for the dragging.
     */
    _startDrag: function(e) {
      var offsetX, content;

      this._initDrag();

      var scrollTop = parseFloat(this.el.style.webkitTransform.replace('translate3d(', '').split(',')[1]) || 0;

      this._drag = {
        startY: scrollTop,
        resist: 1,
        startTime: +(new Date)
      };
    },

    /**
     * Process the drag event to move the item to the left or right.
     */
    _handleDrag: function(e) {
      var _this = this;

      window.requestAnimationFrame(function() {
        var content;

        // We really aren't dragging
        if(!_this._drag) {
          _this._startDrag(e);
        }

        // Stop any default events during the drag
        e.preventDefault();

        // Check if we should start dragging. Check if we've dragged past the threshold.
        if(!_this._isDragging && (Math.abs(e.gesture.deltaY) > _this.dragThresholdY)) {
          _this._isDragging = true;
        }

        if(_this._isDragging) {
          var totalHeight = _this.el.offsetHeight;
          var parentHeight = _this.el.parentNode.offsetHeight;

          var newY = _this._drag.startY + e.gesture.deltaY;

          // Check if the dragging is beyond the bottom or top
          if(newY > 0 || (-newY + parentHeight) > totalHeight) {
            // Rubber band
            newY = newY + e.gesture.deltaY / (-_this.resistance);
          }
          // Update the new translated Y point of the container
          _this.el.style.webkitTransform = 'translate3d(0,' + newY + 'px, 0)';
        }
      });
    },

    _handleEndDrag: function(e) {
      var _this = this;

      // We didn't have a drag, so just init and leave
      if(!_this._drag) {
        _this._initDrag();
        return;
      }

      // Animate to the finishing point
        _this._animateToStop(e);
        // Cleanup
        _this._initDrag();

    },


    _animateToStop: function(e) {
      var _this = this;

      var totalHeight = this.el.offsetHeight;
      var parentHeight = this.el.parentNode.offsetHeight;
      var scrollTop = parseFloat(this.el.style.webkitTransform.replace('translate3d(', '').split(',')[1]) || 0;
      var duration = +(new Date) - this._drag.startTime;

      var newY = scrollTop;

      if(e.gesture.velocityY) {
        // Get the final resting point
        var vy = e.gesture.velocityY;
        var speed = Math.abs(e.gesture.deltaY) / duration;
        //newY = newY + (vy * vy) / (0.05 * this.decelerationRate);

		    var destination = newY + ( speed * speed ) / ( 2 * (1-_this.decelerationRate)) * ( e.gesture.deltaY < 0 ? -1 : 1 );
        var dur = speed / (1-_this.decelerationRate);

        if((-destination + parentHeight) > totalHeight) {
          destination = -(totalHeight - parentHeight);
        } else if(destination > 0) {
          destination = 0;
        }

        console.log('Ending at velocity and point', speed, vy, destination, dur);


        var el = this.el;
          
        window.requestAnimationFrame(function() {
          _this.scrollTo(0, destination, dur);
        });
      }

      /*
      // Check if the dragging is beyond the bottom or top
      */

      /*
      setTimeout(function() {
        window.requestAnimationFrame(function() {
          _this.el.style.webkitTransform = 'translate3d(0,' + newY + 'px, 0)';
        });
      }, 50);
      */

      // Turn on animation
      this.el.classList.add('scroll-scrolling');

    }
  };

})(ionic);