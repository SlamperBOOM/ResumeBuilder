package com.slamperboom.htmlConverter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.slamperboom.exceptions.ErrorCode;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.translations.TranslationsManager;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.*;
import java.util.Base64;
import java.util.HashMap;

public class HTMLConverter {
    private HTMLConverter(){}

    /**
     * Converts constructed resume to HTML document for showing to user
     * or for further converting to PDF
     * @param resume Resume class
     * @param templateName Name of template
     * @return HTML document as String
     */
    private static String processResumeToHTML(IResume resume, String templateName) throws UserException {
        Template template;
        try {
            template = HTMLTemplateManager.getInstance().getTemplate(templateName);
        } catch (IOException e) {
            throw new UserException(ErrorCode.UNABLE_TO_SAVE_PDF, e);
        }
        HashMap jsonRepresentation;
        try {
            ObjectMapper mapper = new ObjectMapper();
            jsonRepresentation = mapper.treeToValue(resume.getTranslatedJson(), HashMap.class);
            jsonRepresentation.put(
                    "translations",
                    mapper.treeToValue(
                            TranslationsManager.getInstance().getResumeTranslations(resume),
                            HashMap.class
                    )
            );
        } catch (JsonProcessingException e) {
            throw new UserException(ErrorCode.UNABLE_TO_SAVE_PDF, e);
        }

        StringWriter writer = new StringWriter();
        try {
            template.process(jsonRepresentation, writer);
            writer.flush();
        } catch (TemplateException | IOException e) {
            throw new UserException(ErrorCode.UNABLE_TO_SAVE_PDF, e);
        }
        return writer.toString();
    }

    public static String processResumeToHTML(IResume resume) throws UserException {
        return processResumeToHTML(resume, resume.getTemplateName());
    }

    public static String processResumeToHTMLWithTemplate(
            IResume resume,
            com.slamperboom.htmlConverter.Template template
    ) throws UserException {
        return processResumeToHTML(resume, template.toString());
    }

    /**
     * Converts HTML representation of constructed resume to PDF document
     * @param htmlString HTML representation of resume
     * @param savePath Where to store PDF document
     */
    public static void saveHTMLtoPDF(String htmlString, String savePath) throws IOException {
        Document htmlDoc = Jsoup.parse(htmlString);
        htmlDoc.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
        htmlDoc.outputSettings().charset("UTF-16");

        File pdfFile = new File(savePath);
        if (!pdfFile.exists() && !pdfFile.createNewFile()) {
            throw new IOException("Unable to create file to store PDF");
        }
        try (OutputStream outputStream = new FileOutputStream(pdfFile)) {
            PdfRendererBuilder builder = new PdfRendererBuilder();

            builder.withHtmlContent(htmlDoc.html(), new File(".").toURI().toString());
            FontsManager.getInstance().registerFonts(builder);
            builder.useDefaultPageSize(210, 297, BaseRendererBuilder.PageSizeUnits.MM); // A4

            builder.useFastMode();
            builder.toStream(outputStream);
            builder.run();
        }
    }

    public static String saveHTMLtoPDFBase64(String htmlString) throws IOException {
        Document htmlDoc = Jsoup.parse(htmlString);
        htmlDoc.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
        htmlDoc.outputSettings().charset("UTF-16");

        ByteArrayOutputStream stream = new ByteArrayOutputStream(512*1024); // 512 Kb
        try (OutputStream outputStream = stream) {
            PdfRendererBuilder builder = new PdfRendererBuilder();

            builder.withHtmlContent(htmlDoc.html(), new File(".").toURI().toString());
            FontsManager.getInstance().registerFonts(builder);
            builder.useDefaultPageSize(210, 297, BaseRendererBuilder.PageSizeUnits.MM); // A4

            builder.useFastMode();
            builder.toStream(outputStream);
            builder.run();
        }
        return "data:application/pdf;base64," + Base64.getEncoder().encodeToString(stream.toByteArray());
    }
}
