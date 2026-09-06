package com.slamperboom.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.slamperboom.settings.DynamicSettings;
import io.vertx.core.http.HttpServerRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;
import org.jboss.resteasy.reactive.server.ServerResponseFilter;

import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@ApplicationScoped
public class RequestResponseLoggingFilter {
    private static final String[] MASKED_FIELD_SUBSTRINGS = {"preview", "photo"};

    private final Logger logger = Logger.getLogger(this.getClass());
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Masks a response entity for logging only — never mutates the entity itself,
     * since that same object is still on its way to being serialized into the
     * actual HTTP response sent to the frontend.
     */
    private String maskEntity(Object entity) {
        if (entity instanceof Optional<?> optional) {
            entity = optional.orElse(null);
        }
        if (entity == null) {
            return "(empty)";
        }
        if (entity instanceof JsonNode node) {
            return maskJson(node.deepCopy()).toString();
        }
        // Not a JsonNode (e.g. a plain String) — fall back to text-based masking.
        return maskRawJson(String.valueOf(entity));
    }

    /**
     * Parses a raw JSON string, masks it, and returns the masked JSON text.
     * If the text isn't valid JSON, it's returned unchanged.
     */
    private String maskRawJson(String rawText) {
        try {
            return maskJson(objectMapper.readTree(rawText)).toString();
        } catch (Exception e) {
            return rawText;
        }
    }

    /**
     * Recursively replaces the value of any object field whose name contains one
     * of MASKED_FIELD_SUBSTRINGS (case-insensitive) with a short placeholder.
     * Mutates and returns the given node in place.
     */
    private JsonNode maskJson(JsonNode node) {
        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = ((ObjectNode) node).fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                if (isMaskedField(field.getKey())) {
                    field.setValue(maskPlaceholder(field.getValue()));
                } else {
                    maskJson(field.getValue());
                }
            }
        } else if (node.isArray()) {
            for (JsonNode item : node) {
                maskJson(item);
            }
        }
        return node;
    }

    private boolean isMaskedField(String fieldName) {
        String lower = fieldName.toLowerCase(Locale.ROOT);
        for (String substring : MASKED_FIELD_SUBSTRINGS) {
            if (lower.contains(substring)) {
                return true;
            }
        }
        return false;
    }

    private TextNode maskPlaceholder(JsonNode value) {
        String shape;
        if (value.isTextual()) {
            shape = "string, " + value.textValue().length() + " chars";
        } else if (value.isArray()) {
            shape = "array, " + value.size() + " items";
        } else if (value.isObject()) {
            shape = "object, " + value.size() + " keys";
        } else {
            shape = value.getNodeType().toString().toLowerCase(Locale.ROOT);
        }
        return TextNode.valueOf("[masked: " + shape + "]");
    }

    private String truncate(String body) {
        int maxResponseBodyLength = DynamicSettings.getInstance().getMaxResponseBodyLength();
        if (body.length() <= maxResponseBodyLength) {
            return body;
        }
        return body.substring(0, maxResponseBodyLength) + "... [truncated, " + body.length() + " chars total]";
    }

    @ServerRequestFilter(preMatching = true)
    public void logRequest(HttpServerRequest request, ContainerRequestContext context) {
        String baseInfo = String.format("-> %s %s", request.method(), request.uri());
        if (!context.hasEntity()) {
            logger.info(baseInfo);
            return;
        }
        // Body is read reactively: a blocking read here would throw on the Vert.x IO thread.
        request.body()
                .onSuccess(buffer -> logger.infof("%s%nBody: %s", baseInfo, truncate(maskRawJson(buffer.toString()))))
                .onFailure(cause -> logger.infof(cause, "%s (failed to read body)", baseInfo));
    }

    @ServerResponseFilter
    public void logResponse(HttpServerRequest request, ContainerResponseContext context) {
        String baseInfo = String.format("<- %s %s [%d]", request.method(), request.uri(), context.getStatus());
        if (!context.hasEntity()) {
            logger.info(baseInfo);
            return;
        }
        logger.infof("%s%nBody: %s", baseInfo, truncate(maskEntity(context.getEntity())));
    }
}
