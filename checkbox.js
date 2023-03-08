(function ($, $document, Granite) {
  "use strict";

  $document.on("foundation-contentloaded", function (e) {
    // if there is already an initial value make sure the according target elements become visible
    checkboxShowHideHandler($(".cq-dialog-checkbox-showhide", e.target));
  });

  $document.on("change", ".cq-dialog-checkbox-showhide", function (e) {
    checkboxShowHideHandler($(this));
  });

  function checkboxShowHideHandler(el) {
    el.each(function (i, element) {
      if ($(element).is("coral-checkbox")) {
        // handle Coral3 base checkbox
        Coral.commons.ready(element, function (component) {
          showHide(component, element);
          component.on("change", function () {
            showHide(component, element);
          });
        });
      } else {
        // handle Coral2 based checkbox
        var component = $(element).data("checkbox");
        if (component) {
          showHide(component, element);
        }
      }
    });
  }

  function showHide(component, element) {
    console.log("showing");

    // get the selectors to find the target elements. they are stored as data attributes on the checkbox
    var targets = $(element).data("cqDialogCheckboxShowhideTargets");
    var targetMap = {};
    if (targets) {
      targets = targets.split(",");
      for (var i = 0; i < targets.length; i++) {
        var target = targets[i].trim();
        targetMap[target] = $(target);
      }
    }

    // hide all targets
    for (var targetSelector in targetMap) {
      targetMap[targetSelector].addClass("hide");
    }

    // show targets that match checkbox value
    var targetValue = component.value;
    var targetSelectors = $(element).data("cqDialogCheckboxShowhideTarget-" + targetValue);
    if (targetSelectors) {
      targetSelectors = targetSelectors.split(",");
      for (var i = 0; i < targetSelectors.length; i++) {
        var targetSelector = targetSelectors[i].trim();
        if (targetMap[targetSelector]) {
          targetMap[targetSelector].removeClass("hide");
        }
      }
    }
  }
})($, $(document), Granite);
Here are the main changes made to the code:

Added a new data attribute "cqDialogCheckboxShowhideTargets" to each checkbox, which will hold a comma-separated list of all target selectors for that checkbox.
Modified the "showHide" function to parse the "cqDialogCheckboxShowhideTargets" attribute and store each target selector in a map for faster lookup.
Modified the "showHide" function to hide all targets before showing the ones that match the checkbox value.
Added new data attributes to each checkbox to specify the target selectors to show for each checkbox value. These attributes have the format "cqDialogCheckboxShowhideTarget-{value}", where {value} is the checkbox value. Multiple target selectors can be specified for each value, separated by commas.
With these changes, you can specify multiple target selectors for each checkbox value, and the code will show/hide them appropriately.





