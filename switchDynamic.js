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




import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.io.HttpClientResponseHandler;
import org.apache.hc.core5.http.ClassicHttpResponse;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class HtmlContentUtil {

    private static final Logger LOG = LoggerFactory.getLogger(HtmlContentUtil.class);

    /**
     * Fetches HTML content from the given request's URL.
     *
     * @param httpRequest the original HTTP request to set WCMMode
     * @return            the HTML content as a String, or null if retrieval fails
     */
    public static String getHtmlContent(HttpServletRequest httpRequest) {
        String url = httpRequest.getRequestURL().toString();

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet httpGet = new HttpGet(url);
            httpGet.setHeader("Accept", "text/html");

            HttpClientResponseHandler<String> responseHandler = (ClassicHttpResponse response) -> {
                if (response.getCode() == 200) {
                    return EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                } else {
                    LOG.error("Failed to retrieve HTML content. Status code: {}", response.getCode());
                    return null;
                }
            };

            return httpClient.execute(httpGet, responseHandler);
        } catch (IOException e) {
            LOG.error("Error while fetching HTML content: {}", e.getMessage(), e);
            return null;
        }
    }
}

import org.apache.sling.api.request.builder.RequestBuilder;
import org.apache.sling.api.response.builder.ResponseBuilder;

public static String getHtmlContent(HttpServletRequest httpRequest, ResourceResolver resolver, SlingRequestProcessor requestProcessor) {
    String htmlContent = null;
    WCMMode.DISABLED.toRequest(httpRequest);

    try (ByteArrayOutputStream htmlByteArrayOutputStream = new ByteArrayOutputStream()) {
        HttpServletRequest processedRequest = RequestBuilder.create()
                .withRequest(httpRequest)
                .build();

        HttpServletResponse processedResponse = ResponseBuilder.create()
                .withOutputStream(htmlByteArrayOutputStream)
                .build();

        requestProcessor.processRequest(processedRequest, processedResponse, resolver);
        processedResponse.getWriter().flush();
        htmlContent = htmlByteArrayOutputStream.toString(StandardCharsets.UTF_8);

    } catch (ServletException | IOException e) {
        LOG.error("Could not generate HTML content: {}", e.getMessage());
    }

    return htmlContent;
}

optimized code

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.api.servlets.HttpConstants;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.apache.sling.servlets.annotations.SlingServletResourceTypes;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.day.cq.dam.api.Asset;
import com.day.cq.dam.api.Rendition;
import com.day.cq.wcm.api.policies.ContentPolicy;
import com.day.cq.wcm.api.policies.ContentPolicyManager;
import com.day.image.Layer;

@Component(service = { Servlet.class })
@SlingServletResourceTypes(
        methods = { HttpConstants.METHOD_GET },
        resourceTypes = { "your/resource/type" },
        selectors = { "img" },
        extensions = { "jpg", "jpeg", "png", "gif" }
)
public class OptimizedAdaptiveImageServlet extends SlingSafeMethodsServlet {

    private static final long serialVersionUID = 1L;
    private static final Logger LOGGER = LoggerFactory.getLogger(OptimizedAdaptiveImageServlet.class);
    private static final String DEFAULT_MIME_TYPE = "image/jpeg";
    private static final int CACHE_MAX_AGE = 86400; // Cache for 1 day

    @Reference
    private transient AdaptiveImageService adaptiveImageService;

    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response)
            throws ServletException, IOException {
        String[] selectors = request.getRequestPathInfo().getSelectors();
        
        if (selectors.length != 1 && selectors.length != 2) {
            LOGGER.error("Invalid selector count: {}. Expected 1 or 2.", Arrays.toString(selectors));
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        
        int requestedWidth = selectors.length == 2 ? parseWidth(selectors[1]) : adaptiveImageService.getImageRendition();

        Resource imageResource = request.getResource();
        Asset asset = getAssetFromResource(imageResource, request.getResourceResolver());
        
        if (asset == null) {
            LOGGER.error("No asset found at path: {}", imageResource.getPath());
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Asset not found.");
            return;
        }

        if (handleIfModifiedSinceHeader(request, response, asset)) {
            return;
        }

        List<Integer> allowedWidths = getAllowedWidths(request);
        requestedWidth = closestAllowedWidth(requestedWidth, allowedWidths);
        Rendition bestRendition = getBestRendition(asset, requestedWidth);

        if (bestRendition != null) {
            streamRendition(response, bestRendition);
        } else {
            LOGGER.warn("No suitable rendition found for width: {}px. Serving original rendition.", requestedWidth);
            response.sendRedirect(request.getResourceResolver().map(asset.getPath() + "/jcr:content/renditions/original"));
        }
    }

    /**
     * Retrieves the Asset from the DAM, following Adobe’s best practice of using high-level APIs.
     */
    private Asset getAssetFromResource(Resource resource, ResourceResolver resolver) {
        String fileReference = resource.getValueMap().get("fileReference", String.class);
        if (fileReference != null) {
            Resource assetResource = resolver.getResource(fileReference);
            if (assetResource != null) {
                return assetResource.adaptTo(Asset.class);
            } else {
                LOGGER.warn("Referenced asset not accessible at path: {}", fileReference);
            }
        } else {
            LOGGER.warn("No fileReference property found in resource at path: {}", resource.getPath());
        }
        return null;
    }

    /**
     * Retrieves allowed widths from the content policy, ensuring adherence to configuration.
     */
    private List<Integer> getAllowedWidths(SlingHttpServletRequest request) {
        ContentPolicyManager policyManager = request.getResourceResolver().adaptTo(ContentPolicyManager.class);
        if (policyManager != null) {
            ContentPolicy policy = policyManager.getPolicy(request.getResource());
            if (policy != null) {
                return Arrays.asList(policy.getProperties().get("allowedWidths", new Integer[] {128, 256, 512, 1024}));
            }
        }
        LOGGER.info("No content policy defined; using default allowed widths.");
        return Arrays.asList(128, 256, 512, 1024);
    }

    /**
     * Finds the closest allowed width based on the requested width, improving rendering performance.
     */
    private int closestAllowedWidth(int requestedWidth, List<Integer> allowedWidths) {
        int closest = allowedWidths.get(0);
        for (int width : allowedWidths) {
            if (Math.abs(width - requestedWidth) < Math.abs(closest - requestedWidth)) {
                closest = width;
            }
        }
        return closest;
    }

    /**
     * Sets caching headers and responds with a 304 if the asset hasn’t been modified since the client’s last request.
     */
    private boolean handleIfModifiedSinceHeader(SlingHttpServletRequest request, SlingHttpServletResponse response, Asset asset) {
        long lastModified = asset.getLastModified();
        response.setDateHeader("Last-Modified", lastModified);
        response.setHeader("Cache-Control", "public, max-age=" + CACHE_MAX_AGE);

        long ifModifiedSince = request.getDateHeader("If-Modified-Since");
        if (ifModifiedSince != -1 && lastModified <= ifModifiedSince) {
            response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
            return true;
        }
        return false;
    }

    /**
     * Selects the best matching rendition for the requested width, optimizing for pre-generated renditions.
     */
    private Rendition getBestRendition(Asset asset, int requestedWidth) {
        for (Rendition rendition : asset.getRenditions()) {
            if (rendition.getName().contains("cq5dam.thumbnail." + requestedWidth)) {
                return rendition;
            }
        }
        return asset.getOriginal();
    }

    /**
     * Parses the width selector to an integer, defaulting to 0 on failure.
     */
    private int parseWidth(String widthSelector) {
        try {
            return Integer.parseInt(widthSelector);
        } catch (NumberFormatException e) {
            LOGGER.warn("Invalid width selector '{}', using default width.", widthSelector);
            return 0;
        }
    }

    /**
     * Streams the specified rendition directly to the response, using a try-with-resources block.
     */
    private void streamRendition(SlingHttpServletResponse response, Rendition rendition) throws IOException {
        response.setContentType(rendition.getMimeType());
        try (InputStream is = rendition.getStream()) {
            IOUtils.copy(is, response.getOutputStream());
        } catch (Exception e) {
            LOGGER.error("Error streaming rendition: {}", rendition.getPath(), e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error streaming rendition.");
        }
    }
}


