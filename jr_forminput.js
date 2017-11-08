//  DOC: jr-form
//
//  * Handles validation for inidivual input fields, checkboxes etc.
//  * Should be nested within a jr-form directive.
//
//  Usage:
//    <input 
//      type="text" 
//      required 
//      jr-forminput="{
//                    settings: {
//                      trigger: 'blur, 'keyup', - (string) (optional) jQuery events to trigger the field.
//                                                                    * null if left out
//                      valid: 'input_valid', - (jQuery selector) CSS class for valid state
//                      invalid: 'input_invalid', - (jQuery selector) CSS clas for invalid state
//                      feedback: '#input_feedback' - (jQuery selector) DOM element for feedback messages.  (Shown and hidden by the directive.)
//                      },
//                    validators: {
//                      min: [3, 'value must be more than 3 characters'],
//                      empty: [null, 'This field is required']
//                    }
//                   }">
//
//  Notes:
//    * ALL validators have at least two params. [value, 'feedback message string'].
//    * If a value (or other param) isn't applicable, null should be accepted.
//      * The validator will throw an error if it isn't.
//    * For a full list of validators, scroll further down in this directove.

angular.module('jrForminput', []).directive('jrForminput', [function(){
  return {
    restrict: 'A',
    scope: {
      opts: "=jrForminput"
    },
    controller: ['$scope', '$element', function($scope, $element){
      
      // -----  Setup  ----- //
      
      // Check dependancies
      if (!window.jQuery) throw 'ERROR: jr-forminput requires jQuery';
      
      // Variables
      var $settings = $scope.opts.settings;
      var $validators = []; // All validators used for this input
      var $valid = null; // Validation state
      var $message = ''; // Feedback message
      
      // Check which validators have been set and add them to $validators
      for (var key in $scope.opts.validators) {
        $validators.push(key.toString());
      }
      
      // Set trigger for validation
      if (!$settings.hasOwnProperty('trigger')) $settings.trigger = null; 
      if ($settings.trigger !== null) {
        $element.on($settings.trigger, function(e) {
          $scope.validate();
        });
      }
      
      
      // -----  Validation  ----- //
      
      // +++++++++++++++++++++++++++++++++++++++++++++++++ //
      
      // Validation functions.
      // * Functions must follow the "validate_<validator name>" scheme
      // * Each function should return TRUE or FALSE
      
      $scope.validate_format = function (_format) {
        var reg = '';
        if (_format == 'email') {
          reg = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
        } else if (_format == 'alphanumeric') {
          reg = /^[a-zA-Z0-9_@\.]+$/;
        }
        return reg.test($element.val());
      }
      
      $scope.validate_max = function (_max) {
        return $element.val().length < _max + 1;
      }
      
      $scope.validate_min = function (_min) {
        return $element.val().length > _min - 1;
      }
      
      $scope.validate_empty = function () {
        return $element.val().length ? true : false;
      }
      
      $scope.validate_checkbox = function (_checked) {
        if (_checked == 'unchecked') { // will pass if box is unchecked instead of checked
          return !$element.prop('checked');
        } else {
          return $element.prop('checked');
        }
      }
      
      // +++++++++++++++++++++++++++++++++++++++++++++++++ //
      
      
      // Iterate through the validators
      $scope.validate = function() {
        var _opts = $scope.opts.validators;
        for (var v = 0; v < $validators.length; v ++) {
          if ($valid !== false) { // don't run this if a validator has already failed
            var _v = $validators[v];
            $valid = $scope['validate_' + _v](_opts[_v][0]); // matches validate function naming conventions
            $message = _opts[_v][1];
          }
        }
        $scope.publishStatus();
      }
      
      // Response Validation
      //
      // This is fired when the form recieves a response
      // after submission.  If this field matches an
      // invalid field's name, the status is set to invalid
      // and a custom message (obtained from the response)
      // is displayed.
      $scope.validate_response = function (_data) {
      }
      
      
      // -----  State Handling  ----- //
      
      $scope.publishStatus = function(){
        // avoid css conflicts
        $element.removeClass($settings.invalid).removeClass($settings.valid);
        
        // make adjustments to the DOM
        if ($valid) {
          $element.addClass($settings.valid);
          $($settings.feedback).hide();
        } else {
          $element.addClass($settings.invalid);
          $($settings.feedback).text($message).show();
        }
        $element.attr('data-isvalid', $valid);
        
        $valid = null; // Reset valid status so that validors can run again
      }
      
      
      // -----  External Events  ----- //
      
      $scope.$on('formEvent', function(event, data) {
        if (data.type == 'validate') {
          $scope.validate();
        } else if (data.type == 'response') {
        }
      });
    }]
  }
}]);