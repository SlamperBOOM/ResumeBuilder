package com.slamperboom;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.slamperboom.resume.blocks.common.IContent;
import com.slamperboom.resume.blocks.content.MainBlockContent;
import org.json.JSONObject;

public class Main {
    public static void main(String[] args) throws JsonProcessingException {
        System.out.println("Hello world!");
        var mapper = new ObjectMapper();
        mapper.disable(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES);

        MainBlockContent content = new MainBlockContent();
        content.updateContent(new JSONObject().put("desired_position", "dolboeb").put("employment", "full_time"));

        String str = mapper.writeValueAsString(content);
        System.out.println(str);
        //content.updateContent(new JSONObject(str));
        content = mapper.readValue(str, MainBlockContent.class);
        System.out.println(mapper.writeValueAsString(content));

    }
}