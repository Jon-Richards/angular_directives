// DOC: jr-accordion
//
// Turns a nested, unordered list into an accordion style UI widget.
// * Accordions are also nestable
//
// Usage: <ul jr-accordion="{
//                            trigger: 'span' // Required (jQuery Selector) - opens/closes the accordion element when clicked.
//                            speed  : 150    // Optional (Num) - Speed of the accordion animation in milleseconds, default is 300.
//                          }">
//          <li>
//            <span>Item 1's Trigger/Title Element</span>
//            <ul>
//              <li>Child Item</li>
//              <li>Child Item</li>
//              <li>Child Item</li>
//            </ul>
//          </li>
//          <li>
//            <span>Item 2's Trigger/Title Element</span>
//            <ul>
//              <li>Child Item</li>
//              <li>Child Item</li>
//            </ul>
//          </li>
//        </ul>

angular.module('jrAccordion', []).directive('jrAccordion', [function() {
  return {
    restrict: 'A',
    scope: {},
    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: jr-accordion requires jQuery.';
      
      // Pull options from DOM node.
      $scope.opts = $scope.$eval($attrs.jrAccordion);
      
      // Make sure a "trigger" element is specified so users can interact with the accordion
      // This is dynamic in case devs need to use links, H tags, etc. as triggers.
      if ($scope.opts !== undefined && $scope.opts.hasOwnProperty('trigger')) {
        $scope.trigger = $scope.opts.trigger;
      } else {
        throw 'ERROR: jr-accordion requires a trigger element to be specified.'
      }
      
      // Set animation speed (defualt is 300ms).
      $scope.speed = $scope.opts !== undefined && $scope.opts.hasOwnProperty('speed') ? $scope.opts.speed : 300;
      
      // Check if this widget is nested within another jr-accordion directive
      // Make sure the parent directive displays properly when this directive is interacted with.
      var nested = $element.parent().parent().attr('jr-accordion'); // since jQuery doesn't have a 'hasAttr' function
      if (typeof nested !== typeof undefined && nested !== false) $scope.nested = true;
      
      $scope.toggleItem = function( $targ ) {
        // Closes old items and open news ones simultaniously
        // Better UX than a for loop
        $.each($element.children('li').children('ul'), function (index, value) {
          var $value = $(value);
          if ($targ.is(value) && ($value.attr('data-open') == 'false')) {
            $scope.openItem($value); // Since jQuery doesn't allow you to animate to an "auto" pixel value
            $value.attr('data-open', true);
          } else {
            $value.animate({'height': '0em'}, $scope.speed);
            $value.attr('data-open', false);
          }
        });
        
        // make sure the opened item is visible in case of a nested accordion
        if ($scope.nested !== undefined) $element.css({'height':'auto'});
      }
      
      // Animate $value's height to 'auto' by capturing auto as an explicit pixel value
      // We use this method so to ensure that nested accordion widgets display properly
      $scope.openItem = function(_targ) {
        // (This block should happen too fast for the user to see.)
        var current = _targ.height() + 'px'; // store $value's current height
        _targ.css({'height': 'auto'}); // snap $value's height to auto
        var auto = _targ.height() + 'px'; // store $value's 'auto' height in pixels
        _targ.css({'height': current}); // snap $value back to its original height
        
        _targ.animate({'height': auto}, $scope.speed); // animate $value to the stored auto height (wooooo)
      }
      
    }],
    link: function($scope, $element) {
      // Setup
      $.each($element.children('li'), function(index, value) {
        var $this  = $(this);
        var $ul    = $this.children('ul');
        
        $ul // store the list's height in a data attribute and set its open/closed status with another
          .attr('data-open', false)
          .css({ // set the list's height to 0 and hide any overflow. (Height is animated to show and hide the list.)
            'height': '0em', 
            'overflow-y': 'hidden'
          });
        
        // bind click event to each list's "title" element
        $this.children( $scope.trigger ).on('click', function(e) {
          e.preventDefault();
          $scope.toggleItem($ul);
        });
      });
    }
  }
}]);