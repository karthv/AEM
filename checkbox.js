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

mvn -B archetype:generate -D archetypeGroupId=com.adobe.aem -D archetypeArtifactId=aem-project-archetype -D archetypeVersion=40 -D appTitle="core" -D appId="aem-library" -D groupId="de.volkswagen.coe.aem" -D aemVersion=cloud -DsdkVersion=latest -DartifactId="core" -DfrontendModule=none -D includeExamples=y         

