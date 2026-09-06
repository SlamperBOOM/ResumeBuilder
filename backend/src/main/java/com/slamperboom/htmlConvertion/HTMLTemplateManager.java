package com.slamperboom.htmlConvertion;

import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;
import freemarker.template.Configuration;
import freemarker.template.DefaultObjectWrapperBuilder;
import freemarker.template.Template;
import jakarta.enterprise.context.ApplicationScoped;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

@ApplicationScoped
public class HTMLTemplateManager {
    private static final String TEMPLATES_PATH = "templates/";
    private static final String DEFAULT_TEMPLATE = "simple_template";

    private final Properties templateMap;
    private final Configuration templateConfiguration;

    HTMLTemplateManager() {
        templateConfiguration = new Configuration(Configuration.VERSION_2_3_31);
        templateConfiguration.setDefaultEncoding(StandardCharsets.UTF_8.name());
        templateConfiguration.setClassLoaderForTemplateLoading(Thread.currentThread().getContextClassLoader(), TEMPLATES_PATH);
        DefaultObjectWrapperBuilder objectWrapperBuilder = new DefaultObjectWrapperBuilder(Configuration.VERSION_2_3_31);
        objectWrapperBuilder.setIterableSupport(true);
        templateConfiguration.setObjectWrapper(objectWrapperBuilder.build());

        templateMap = new Properties();
        try {
            templateMap.load(
                    Thread.currentThread().getContextClassLoader()
                            .getResourceAsStream(TEMPLATES_PATH + "templates.properties")
            );
        } catch (IOException e) {
            String message = "Unable to read templates";
            StartupExceptionHolder.addException(message);
            throw new StartupException(message);
        }
    }

    public static String getDefaultTemplateName() {
        return DEFAULT_TEMPLATE;
    }

    public Template getTemplate(com.slamperboom.htmlConvertion.Template templateName) throws IOException {
        String templateFileName = templateMap.getProperty(templateName.toString());
        return templateConfiguration.getTemplate(templateFileName, StandardCharsets.UTF_8.name());
    }

    public Template getTemplate(String templateName) throws IOException {
        String templateFileName = templateMap.getProperty(templateName);
        var template = templateConfiguration.getTemplate(templateFileName, StandardCharsets.UTF_8.name());
        if (template == null) {
            template = templateConfiguration.getTemplate(getDefaultTemplateName(), StandardCharsets.UTF_8.name());
        }
        return template;
    }
}
