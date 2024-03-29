(function(document, $) {
  "use strict";

  var TOGGLE_ATTRIBUTE_PREFIX = "data-toggle-";
  var MASTER_ATTRIBUTE_SUFFIX = "_master";
  var SLAVE_ATTRIBUTE_SUFFIX = "_slave";
  var DIALOG_CONTENT_SELECTOR = ".cq-dialog-content";

  var toggles = [
    {
      name: "toggle1",
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
    },
    {
      name: "toggle2",
      updateFunction: function(master, $slaves) {
        // update logic for toggle2
      }
    },
    // add more toggle objects as needed
  ];

  // Define the generateToggles function
  function generateToggles(numToggles) {
    var toggles = [];
    for (var i = 1; i <= numToggles; i++) {
      var toggleName = "toggle" + i;
      var toggleObj = {
        name: toggleName,
        updateFunction: function(master, $slaves) {
          // update logic for this toggle
          console.log("Updating " + toggleName);
        }
      };
      toggles.push(toggleObj);
    }
    return toggles;
  }

  // Call generateToggles with the desired number of toggles
  var numToggles = 2;
  var toggles = generateToggles(numToggles);

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

  var selectors = {};
  toggles.forEach(function(toggle) {
    var toggleSelectors = getSelectors(toggle.name);
    selectors[toggle.name] = toggleSelectors;
  });

  // When the dialog is loaded, init all slaves
  $(document).on("foundation-contentloaded", function(e) {
    var $dialog = $(e.target);

    toggles.forEach(function(toggle) {
      var $master = $dialog.find(selectors[toggle.name].master);
      if ($master.length > 0) {
        var $slaves = $dialog.find(selectors[toggle.name].slave);
        toggle.updateFunction($master, $slaves);
      }
    });
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
})(document, Granite.$);
