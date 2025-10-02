package com.slamperboom.htmlConverter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.slamperboom.resume.saves.IResume;
import com.slamperboom.translations.TranslationsManager;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.jsoup.Jsoup;
import org.jsoup.helper.W3CDom;
import org.jsoup.nodes.Document;

import java.io.*;
import java.util.HashMap;
import java.util.Map;

public class HTMLConverter {
    private HTMLConverter(){}

    /**
     * Converts constructed resume to HTML document for showing to user
     * or for further converting to PDF
     * @param resume Resume class
     * @return HTML document as String
     */
    public static String processHTMLTemplate(IResume resume){
        Template template;
        try {
            template = HTMLTemplateManager.getInstance().getTemplate(resume.getTemplateName());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        HashMap jsonRepresentation;
        try {
            ObjectMapper mapper = new ObjectMapper();
            jsonRepresentation = mapper.treeToValue(resume.getTranslatedJson(), HashMap.class);
            jsonRepresentation.put(
                    "translations",
                    mapper.treeToValue(
                            TranslationsManager.getInstance().getResumeTranslations(),
                            HashMap.class
                    )
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        StringWriter writer = new StringWriter();
        try {
            template.process(jsonRepresentation, writer);
            writer.flush();
        } catch (TemplateException | IOException e) {
            throw new RuntimeException(e);
        }
        return writer.toString();
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
//            builder.withW3cDocument(new W3CDom().fromJsoup(htmlDoc), new File(".").toURI().toString());
            FontsManager.getInstance().registerFonts(builder);
            builder.useDefaultPageSize(210, 297, BaseRendererBuilder.PageSizeUnits.MM); // A4

            builder.useFastMode();
            builder.toStream(outputStream);
            builder.run();
        }
    }
}
