//  DOC: jrForm
//  
//  Handles overall form validation and submission.
//  Validation for inputs is handled by the jr-forminput direcive.
//
//  Usage:
//  <forn method="POST" action="/ajax/users_signin" jr-form={auto: true, feedback: '#form_feedback'}">
//
//  Args:
//    auto - (bool) (optional) Tells the jr-form to validate when link function runs
//                             * Useful for showing errors on page refresh
//    feedback - (jQuery selector) (optional) jQuery selector for displaying the form's overall feedback DOM element.
//
//  Notes:
//    * For an input to be included in form validation, the "required" attribute MUST be present.
//    * When a submit response is recieved, the event "formEvent" is broadcast to child scopes and
//      emit on $rootScope.  The event contains all of the data about the response and the form
//      that recieved it.

angular.module('jrForm', []).directive('jrForm', [function(){
  return {
    restrict: 'A',
    controller: ['$scope', '$rootScope', '$element', '$attrs', function($scope, $rootScope, $element, $attrs){
      
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: jr-form requires jQuery';
      
      // Detect options (if any)
      var _opts = $scope.$eval($attrs.jrForm);
      $scope.opts = _opts !== undefined ? _opts : {feedback: '', auto: false}; //set defaults if not set on the view
      var $feedback = $($scope.opts.feedback); // set $feedback selector here so it doesn't have to be set on other functions
      
      // Detect all requried fields and inputs in this form.  
      $scope.fields = [];
      $.each($element.find('input[required]'), function(index, value) {
        $scope.fields.push($(value));
      });
      // Find the submit button for later
      $scope.submitBtn = $element.find('button[type=submit]');
      
      $element.on('submit', function(e) {
        e.preventDefault();
        $scope.submitBtn.prop('disabled', true); // prevent submit spamming
        $scope.validate();
      });
      
      // Form validation
      $scope.validate = function(){
        $feedback.hide();
        $scope.$broadcast('formEvent', {type: 'validate'});
        setTimeout(function(){ // wait half a second for fields to validate.
          var ready = true;
          for (var i = 0; i < $scope.fields.length; i++) {
            if ($scope.fields[i].attr('data-isvalid') !== 'true') ready = false;
          }
          if (ready) { 
            $scope.submit();
          } else {
            $scope.submitBtn.prop('disabled', false); // allow users to submit the form again
          }
        }, 500);
      }
      
      // Ajax post
      $scope.submit = function() {
        var _data = $element.serialize();
        // Use jQuery to circumvent Angular's $http transformations to the data
        $.post($attrs.action, _data, function (response) {
          if (response.success) {
            var _next = $element.children('input[name=next]').val();
            if (_next !== undefined) window.location = _next;
          } else {
            $feedback.html(response.message).show();
            $scope.submitBtn.prop('disabled', false); // allow users to submit the form again
          }
          $scope.publishResponse(response);
        }, 'JSON');
      }
      
      // Convey response to other directives.
      $scope.publishResponse = function(_response){
        var _response = {
          type: 'response',
          form: $element,
          response: _response
        }
        $rootScope.$emit('formEvent', _response); // only reaches $rootScope
        $scope.$broadcast('formEvent', _response); // only reaches child directives
      }
      
      // If jr-form="{auto: true}" the form will be validated when Angular travels back up the DOM.
      // (Essentially doc.ready)
      $scope.auto = function(){
        if ($scope.opts.auto) $scope.validate();
      }
      
    }],
    link: function($scope) {
      $scope.auto();
    }
  }
}]);
