package com.slamperboom.htmlConverter;

import com.slamperboom.exceptions.StartupException;
import com.slamperboom.exceptions.StartupExceptionHolder;
import freemarker.template.Configuration;
import freemarker.template.DefaultObjectWrapperBuilder;
import freemarker.template.Template;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

public class HTMLTemplateManager {
    private static HTMLTemplateManager templateManagerInstance;
    private static final String TEMPLATES_PATH = "templates/";

    public static HTMLTemplateManager getInstance() {
        if (templateManagerInstance == null) {
            templateManagerInstance = new HTMLTemplateManager();
        }
        return templateManagerInstance;
    }

    private final Properties templateMap;
    private final Configuration templateConfiguration;

    private HTMLTemplateManager() {
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

    public Template getTemplate(com.slamperboom.htmlConverter.Template templateName) throws IOException {
        String templateFileName = templateMap.getProperty(templateName.toString());
        return templateConfiguration.getTemplate(templateFileName, StandardCharsets.UTF_8.name());
    }

    public Template getTemplate(String templateName) throws IOException {
        String templateFileName = templateMap.getProperty(templateName);
        return templateConfiguration.getTemplate(templateFileName, StandardCharsets.UTF_8.name());
    }
}
