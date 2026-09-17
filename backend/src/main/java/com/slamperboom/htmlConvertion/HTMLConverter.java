package com.slamperboom.htmlConvertion;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.slamperboom.exceptions.ErrorCode;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.exceptions.UserExceptionFactory;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.managers.TranslationsManager;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.*;
import java.util.Base64;
import java.util.Map;

@ApplicationScoped
public class HTMLConverter {
    private final Logger logger = Logger.getLogger(this.getClass());

    private final FontsManager fontsManager;
    private final HTMLTemplateManager htmlTemplateManager;
    private final TranslationsManager translationsManager;

    HTMLConverter(FontsManager fontsManager, HTMLTemplateManager htmlTemplateManager, TranslationsManager translationsManager) {
        this.fontsManager = fontsManager;
        this.htmlTemplateManager = htmlTemplateManager;
        this.translationsManager = translationsManager;
    }

    /**
     * Converts constructed resume to HTML document for showing to user
     * or for further converting to PDF
     * @param resume Resume class
     * @param templateName Name of template
     * @return HTML document as String
     */
    private String renderTemplate(String templateName, Map<String, Object> data) throws IOException, TemplateException {
        Template template = htmlTemplateManager.getTemplate(templateName);
        StringWriter writer = new StringWriter();
        template.process(data, writer);
        return writer.toString();
    }

    private String processResumeToHTML(IResume resume, String templateName) throws UserException {
        Map<String, Object> jsonRepresentation;
        try {
            ObjectMapper mapper = new ObjectMapper();
            // Class<T> erases generics, so treeToValue(node, HashMap.class) can only ever
            // return a raw HashMap - every subsequent typed use of it is an unchecked
            // operation. JavaType built from a TypeReference carries the full Map<String,
            // Object> shape, so treeToValue() returns a properly parameterized map instead.
            JavaType stringObjectMapType = mapper.constructType(new TypeReference<Map<String, Object>>() {});
            jsonRepresentation = mapper.treeToValue(resume.getTranslatedJson(), stringObjectMapType);
            jsonRepresentation.put(
                    "translations",
                    mapper.treeToValue(
                            translationsManager.getResumeTranslations(resume),
                            stringObjectMapType
                    )
            );
        } catch (JsonProcessingException e) {
            logger.errorf(e, "Unable to build JSON representation for resume %s", resume.getId());
            throw UserExceptionFactory.construct(ErrorCode.UNABLE_TO_SAVE_PDF, e);
        }

        try {
            return renderTemplate(templateName, jsonRepresentation);
        } catch (TemplateException | IOException e) {
            logger.errorf(e, "Unable to render template %s for resume %s", templateName, resume.getId());
            throw UserExceptionFactory.construct(ErrorCode.UNABLE_TO_SAVE_PDF, e);
        }
    }

    /**
     * Renders a page that is only shown on screen (e.g. help), never converted to PDF,
     * so its template is free of the openhtmltopdf CSS limitations
     * @param templateName Key of the template in templates.properties
     * @param data Template data model
     * @return HTML document as String
     */
    public String renderStaticPage(String templateName, JsonNode data) throws UserException {
        try {
            return renderTemplate(templateName, new ObjectMapper().convertValue(data, new TypeReference<Map<String, Object>>() {}));
        } catch (TemplateException | IOException e) {
            logger.errorf(e, "Unable to render page %s", templateName);
            throw UserExceptionFactory.construct(ErrorCode.UNABLE_TO_PERFORM_ACTION, e);
        }
    }

    public String processResumeToHTML(IResume resume) throws UserException {
        return processResumeToHTML(resume, resume.getTemplateName());
    }

    public String processResumeToHTMLWithTemplate(
            IResume resume,
            com.slamperboom.htmlConvertion.Template template
    ) throws UserException {
        return processResumeToHTML(resume, template.toString());
    }

    private void renderToStream(String htmlString, OutputStream outputStream) throws IOException {
        Document htmlDoc = Jsoup.parse(htmlString);
        htmlDoc.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
        htmlDoc.outputSettings().charset("UTF-16");

        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.withHtmlContent(htmlDoc.html(), new File(".").toURI().toString());
        fontsManager.registerFonts(builder);
        builder.useDefaultPageSize(210, 297, BaseRendererBuilder.PageSizeUnits.MM);
        builder.useFastMode();
        builder.toStream(outputStream);
        builder.run();
    }

    /**
     * Converts HTML representation of constructed resume to PDF document
     * @param htmlString HTML representation of resume
     * @param savePath Where to store PDF document
     */
    public void saveHTMLtoPDF(String htmlString, String savePath) throws IOException {
        File pdfFile = new File(savePath);
        if (!pdfFile.exists() && !pdfFile.createNewFile()) {
            throw new IOException("Unable to create file to store PDF");
        }
        try (OutputStream outputStream = new FileOutputStream(pdfFile)) {
            renderToStream(htmlString, outputStream);
        }
        logger.debugf("Rendered PDF to %s", savePath);
    }

    /**
     * Converts HTML representation of constructed resume to PDF document and returns it in Base64
     * @param htmlString HTML representation of resume
     */
    public String saveHTMLtoPDFBase64(String htmlString) throws IOException {
        ByteArrayOutputStream stream = new ByteArrayOutputStream(512 * 1024);
        renderToStream(htmlString, stream);
        logger.debug("Rendered PDF to base64");
        return "data:application/pdf;base64," + Base64.getEncoder().encodeToString(stream.toByteArray());
    }
}
