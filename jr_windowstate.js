// DOC: jrWindowstate
//
// Assumes jQuery, since it's a requirement for Bootstrap
//
// USAGE:
// <jr-windowstate></jr-windowstate>
//
//
// POSSIBLE OUTPUTS: 'iOS', 'Android', 'Desktop'
//
// Tracks changes in window state like resize and orientation.

angular.module('jrWindowstate', []).directive('jrWindowstate', ['$rootScope', function(){
  return {
    // Restricted to an element because this directive doesn't need to be an attribute.
    // This means that the directive shouldn't conflict with other directives.
    // Only one instance of this directive is necessariy per page.
    restrict: 'E',
    controller: ['$scope', '$rootScope', function($scope, $rootScope) {
      // make sure this directive is only instantiated once
      if (document.getElementsByTagName('jr-windowstate').length > 1) throw 'ERROR: More than one <jr-windowstate> tag exists on the page.';
      
      // Some broadcasts, like resize, have a delay before firing.
      // Save the most recent event data here, event if the delay is running.
      $scope.evtData = {};
      
      // Handle each event type one a case by case basis
      $scope.handleEvt = function (event) {
        $scope.evtData = event; // preserve event data
        
        switch (event.type) {
          case 'resize':
            $scope.broadcastResize();
            break;
          case 'orientationchange':
            $scope.broadcastResize();
            break;
          default:
            console.warn('WARNING: Unhandled window event occured on jr-windowstate: ' + event.type);
            break;
        }
      }
      
      // Prevents event spamming
      $scope.evtLock = false;
      $scope.isSafe = function() {
        if (this.evtLock === true) {
          return false;
        } else {
          return true;
        }
      }
      
      // Gather data about the window
      $scope.getData = function () {
        var mostRecent = $scope.evtData; // pull in preserved data from most recent event
        var data = {};
        data.width = $(window).innerWidth();
        data.height = $(window).innerHeight();
        data.type = mostRecent.type;
        return data;
      }
      
      $scope.broadcastResize = function () {
        // Since resize events happen so quickly, wait 300ms before
        // broadcasting the new window data to avoid spamming.
        if (this.isSafe()) { // Only fire if no broadcast is pending
          this.evtLock = true; // Prevent further broadcasts
          setTimeout(function(){
            $rootScope.$broadcast('windowstate', $scope.getData());
            $scope.evtLock = false; // Allow further broadcasts again
          }, 300);
        }
      }
    }],
    link: function ($scope, element, attrs) {
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: jr-windowstate requires jQuery';
      
      // Bind event handlers
      $(window).on('resize orientationchange', function(e) {
        $scope.handleEvt(e);
      });
    },
  }
}]);