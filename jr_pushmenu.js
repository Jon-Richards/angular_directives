// DOC: jrPushMenu
//
// Assumes jQuery, since it's a requirement for Bootstrap
//
// USAGE:
// <div jr-pushmenu="{ options }">
//   <menu content here> 
// </div>
//
// options {}
//   side      : (string) if the menu should enter from the 'left' or 'right' side of the page
//                        * The menu must be placed off screen on this side beforehand.
//   open_btn  : (jQuey selector) the element(s) that show the menu when clicked.
//   close_btn : (jQuery selector) the element(s) that close the menu
//   moves     : (array) elements (jQuery selectors) that should move aside for the menu
//   millisecs : (num) the speed in milliseconds for the open/close animation

angular.module('jrPushmenu', []).directive('jrPushmenu', [function(){
  return {
    restrict: 'A',
    scope: {
      opts: '=jrPushmenu' // pulls in options declaired as the directive's value
    },
    controller: ['$scope', '$element', function($scope, $element) {
      // The controller function is like a "class".The buisiness logic
      // and responses to $broadcast events should be placed here.
      
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: jr-pushmenu requires jQuery';
      
      // store the opposite of opts.side for use in animations
      $scope.otherSide = $scope.opts.side === 'left' ? 'right' : 'left';
      
      // track if menu is open
      $scope.isOpen = false;
      
      // ---------- Animations ---------- //
      $scope.toggleMenu = function(bool, snap) {
        // set timing based on snap
        var duration = snap ? 0 : this.opts.millisecs;
        
        // determine the direction for opts.moves and the element to move
        var moves_dir = bool ? $(window).innerWidth() + 'px' : '0px';
        var element_dir = bool ? '0px' : '100%';
        
        // build animation object with a dynamic key
        var animation = {}
        animation[this.opts.side] = moves_dir;
        
        // animates page elements that move OFF screen when the meny moves on screen
        $.each(this.opts.moves, function(index, value) {
          $(value).animate(animation, duration);
        });
        
        // animates the push menu with the same technique as above
        var otherAnimation = {}
        otherAnimation[this.otherSide] = element_dir;
        $element.animate(otherAnimation, duration);
        
        $scope.isOpen = bool;
      }
      
      // ---------- Events ---------- //
      $scope.$on('windowstate', function(e, args){
        $scope.toggleMenu($scope.isOpen, true);
      });
    }],
    link: function (scope, element, attrs) {
      // The link function runs after Angular has recompiled the DOM.
      // It "links" html to the various controllers.  This is a good
      // place to bind click handlers.
      
      // Bind click handlers
      $(scope.opts.open_btn).on('click', function (e) { scope.toggleMenu(true, false) });
      $(scope.opts.close_btn).on('click', function (e) { scope.toggleMenu(false, false) });
      
    },
  }
}]);