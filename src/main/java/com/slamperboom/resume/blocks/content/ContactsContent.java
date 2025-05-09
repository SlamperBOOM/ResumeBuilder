package com.slamperboom.resume.blocks.content;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.slamperboom.resume.blocks.common.ContentType;
import com.slamperboom.resume.blocks.common.IContent;

import java.util.List;

public class ContactsContent implements IContent {
    @JsonProperty("email")
    private String email;

    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("social_nets")
    private List<SocialNet> socialNets;

    @Override
    public ContentType getContentType() {
        return ContentType.CONTACTS;
    }

    private static class SocialNet {
        @JsonProperty("social_net_name")
        private String socialNetName;

        @JsonProperty("social_net_profile_link")
        private String socialNetProfileLink;
    }
}
