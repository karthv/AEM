(function(document, $) {
  "use strict";

  var TOGGLE_ATTRIBUTE_PREFIX = "data-toggle-";
  var MASTER_ATTRIBUTE_SUFFIX = "_master";
  var SLAVE_ATTRIBUTE_SUFFIX = "_slave";
  var DIALOG_CONTENT_SELECTOR = ".cq-dialog-content";

  // Define the generateToggles function
  function generateToggles($dialog) {
    var toggles = [];

    // Get all the master switches in the dialog
    var $masters = $dialog.find("[data-sly-resource$='master']");

    $masters.each(function(index) {
      var toggleName = "toggle" + (index + 1);
      var toggleObj = {
        name: toggleName,
        updateFunction: function(master, $slaves) {
          var isChecked = master[0].hasAttribute("checked");
          $slaves.each(function() {
            if (isChecked.toString() !== $(this).attr(getAttributes("checked").slave)) {
              $(this).addClass("hide");
            } else {
              $(this).removeClass("hide");
            }
          });
        }
      };
      toggles.push(toggleObj);
    });

    return toggles;
  }

  /**
   * Build the master and slave attribute names from the toggle name.
   * @param {string} toggleName
   */
  function getAttributes(toggleName) {
    return {
      master: TOGGLE_ATTRIBUTE_PREFIX + toggleName + MASTER_ATTRIBUTE_SUFFIX,
      slave: TOGGLE_ATTRIBUTE_PREFIX + toggleName + SLAVE_ATTRIBUTE_SUFFIX
    };
  }

  /**
   * Builds the master and slave selectors from the toggle name.
   * @param {string} toggleName
   */
  function getSelectors(toggleName) {
    var attributes = getAttributes(toggleName);
    return {
      master: "[" + attributes.master + "]",
      slave: "[" + attributes.slave + "]"
    };
  }

  $(document).on("foundation-contentloaded", function(e) {
    var $dialog = $(e.target);
    var toggles = generateToggles($dialog);

    var selectors = {};
    toggles.forEach(function(toggle) {
      var toggleSelectors = getSelectors(toggle.name);
      selectors[toggle.name] = toggleSelectors;
    });

    // Init all slaves
    toggles.forEach(function(toggle) {
      var $master = $dialog.find(selectors[toggle.name].master);
      if ($master.length > 0) {
        var $slaves = $dialog.find(selectors[toggle.name].slave);
        toggle.updateFunction($master, $slaves);
      }
    });

    // When a value is changed, trigger update
    $(document).on("change", function(e) {
      var $master = $(e.target);
      var $dialog = $master.parents(DIALOG_CONTENT_SELECTOR);

      toggles.forEach(function(toggle) {
        if ($master.is(selectors[toggle.name].master)) {
          var $slaves = $dialog.find(selectors[toggle.name].slave);
          toggle.updateFunction($master, $slaves);
        }
      });
    });
  });
})(document, Granite.$);
