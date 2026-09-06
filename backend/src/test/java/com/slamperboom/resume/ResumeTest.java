package com.slamperboom.resume;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import com.slamperboom.exceptions.UserException;
import com.slamperboom.resume.blocks.common.ContentMapper;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.resume.blocks.content.AboutContent;
import com.slamperboom.resume.saves.Resume;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.EnumMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * {@link Resume} depends on the real {@link com.slamperboom.settings.Settings} singleton,
 * which only ever reads the bundled read-only "global_settings.json" resource, so no test
 * file isolation is needed here (unlike {@link ResumeManagerTest}).
 */
class ResumeTest {

    private Resume resume;

    @BeforeEach
    void setUp() {
        resume = new Resume("resume-1");
        Map<ContentType, IContent> blocks = new EnumMap<>(ContentType.class);
        for (ContentType type : ContentType.values()) {
            blocks.put(type, ContentMapper.mapContent(type));
        }
        resume.setBlocks(blocks);
    }

    @Test
    void newResume_isNotSavedByDefault() {
        assertFalse(resume.isSaved());
    }

    @Test
    void save_marksResumeAsSaved() {
        resume.save();

        assertTrue(resume.isSaved());
    }

    @Test
    void updateContent_withValidPayload_replacesBlockAndMarksUnsaved() throws Exception {
        resume.save();
        ObjectMapper mapper = new ObjectMapper();
        JsonNode aboutPayload = mapper.readTree("{\"@type\":\"AboutContent\",\"about_text\":\"hello\"}");

        resume.updateContent(ContentType.ABOUT, aboutPayload);

        assertFalse(resume.isSaved());
        assertInstanceOf(AboutContent.class, resume.getBlocks().get(ContentType.ABOUT));
    }

    @Test
    void updateContent_withPayloadThatCannotBeMapped_throwsUserExceptionAndLeavesStateUnchanged() {
        resume.save();
        IContent originalAboutBlock = resume.getBlocks().get(ContentType.ABOUT);
        // A JSON string can't be deserialized into an AboutContent object
        JsonNode invalidPayload = TextNode.valueOf("not a content object");

        assertThrows(UserException.class, () -> resume.updateContent(ContentType.ABOUT, invalidPayload));
        assertSame(originalAboutBlock, resume.getBlocks().get(ContentType.ABOUT));
        assertTrue(resume.isSaved(), "a failed update should not silently mark the resume as unsaved");
    }

    @Test
    void updateResumeInformation_withCompletePayload_updatesFieldsAndMarksUnsaved() throws Exception {
        resume.save();
        ObjectMapper mapper = new ObjectMapper();
        JsonNode info = mapper.readTree(
                "{\"resume_name\":\"My resume\",\"template_name\":\"simple_template\",\"resume_locale\":\"en\"}");

        resume.updateResumeInformation(info);

        assertEquals("My resume", resume.getName());
        assertEquals("simple_template", resume.getTemplateName());
        assertEquals("en", resume.getResumeLocale());
        assertFalse(resume.isSaved());
    }

    @Test
    void updateResumeInformation_withMissingField_currentlyThrowsNullPointerException() throws Exception {
        // Documents existing behaviour: updateResumeInformation() uses JsonNode#get (which
        // returns null for a missing field) instead of #path(), so an incomplete payload
        // blows up with an NPE rather than a graceful validation error. See review notes.
        ObjectMapper mapper = new ObjectMapper();
        JsonNode incompleteInfo = mapper.readTree("{\"template_name\":\"simple_template\"}");

        assertThrows(UserException.class, () -> resume.updateResumeInformation(incompleteInfo));
    }

    @Test
    void getJson_includesResumeIdAndName() {
        resume.setResumeName("My resume");

        JsonNode json = resume.getJson();

        assertEquals("resume-1", json.get("resume_id").asText());
        assertEquals("My resume", json.get("resume_name").asText());
        assertTrue(json.get("blocks").get("ABOUT").has("@type"));
    }

    @Test
    void getJson_thenReparsingIntoAResume_roundTripsTheAboutBlock() throws Exception {
        // AboutContent declares @JsonTypeName("About_Content"), which does not match the
        // "AboutContent" name it is registered under in IContent's @JsonSubTypes. This test
        // checks whether a resume can actually be saved and reloaded (as ResumeManager does
        // on every startup) despite that mismatch. See review notes on AboutContent.
        resume.setResumeName("My resume");
        resume.setResumeLocale("en");
        resume.setTemplateName("simple_template");
        JsonNode json = resume.getJson();

        ObjectMapper mapper = new ObjectMapper();
        Resume reloaded = mapper.treeToValue(json, Resume.class);

        assertInstanceOf(AboutContent.class, reloaded.getBlocks().get(ContentType.ABOUT));
    }
}
