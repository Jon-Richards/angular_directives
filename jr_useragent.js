// DOC: jr-useragent
//
// This directive publishes the user's operating system ('ios', 'android', 'desktop')
// to $rootScope where it can be used by other directives.  Only one instance of this
// directive should appear on the page to save memory.
//
// Usage: <jr-useragent></jr-useragent>

angular.module('jrUseragent', []).directive('jrUseragent', ['$rootScope', function() {
  return {
    restrict: 'E',
    controller: ['$scope', '$rootScope', function($scope, $rootScope) {
      
      // make sure this directive is instantiated only once
      if (document.getElementsByTagName('jr-useragent').length > 1) throw 'ERROR: More than one <jr-useragent> tag exists on the page.';
      
      var ua = navigator.userAgent;

      // Matches user agent against a platorm (iOS, Android, or Desktop)
      $scope.checkUA = function() {
        if(/iPad|iPhone|iPod/.test(ua)) {
          return 'iOS';
        } else if (ua.indexOf('Android') > -1) {
          return 'Android';
        }
        return 'Desktop';
      }
      
      // Publish the platform to $rootScope
      $rootScope.userAgent = $scope.checkUA();
      $scope.userAgent == 'Desktop' ? $scope.isDesktop = true : $scope.isDesktop = false;

    }]
  }
}]);