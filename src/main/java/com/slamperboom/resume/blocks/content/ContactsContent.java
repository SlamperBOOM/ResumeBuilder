package com.slamperboom.resume.blocks.content;

import com.slamperboom.resume.blocks.common.IContent;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;
import java.util.Objects;

public class ContactsContent implements IContent {
    private static final String EMAIL_KEY = "email";
    private static final String PHONE_NUMBER_KEY = "phone_number";
    private static final String SOCIAL_NETS_KEY = "social_nets";

    private String email;
    private String phoneNumber;
    private List<SocialNet> socialNets;

    @Override
    public JSONObject getJson() {
        JSONObject jsonObject = new JSONObject();
        jsonObject
                .put(EMAIL_KEY, email)
                .put(PHONE_NUMBER_KEY, phoneNumber)
                .put(SOCIAL_NETS_KEY, socialNets.stream().map(SocialNet::getJson).toList());
        return jsonObject;
    }

    @Override
    public void updateContent(JSONObject content) {
        this.email = content.optString(EMAIL_KEY, null);
        this.phoneNumber = content.optString(PHONE_NUMBER_KEY, null);
        if (content.has(SOCIAL_NETS_KEY)) {
            this.socialNets = content.getJSONArray(SOCIAL_NETS_KEY).toList()
                    .stream().map(o -> SocialNet.parseJson((JSONObject) o)).filter(Objects::nonNull)
                    .toList();
        } else {
            this.socialNets = null;
        }
    }

    private static class SocialNet {
        private static final String NAME_KEY = "social_net_name";
        private static final String PROFILE_LINK_KEY = "social_net_profile_link";

        private String socialNetName;
        private String socialNetProfileLink;

        private JSONObject getJson() {
            JSONObject jsonObject = new JSONObject();
            jsonObject
                    .put(NAME_KEY, socialNetName)
                    .put(PROFILE_LINK_KEY, socialNetProfileLink);
            return jsonObject;
        }

        private static SocialNet parseJson(JSONObject jsonObject) {
            try {
                SocialNet socialNet = new SocialNet();
                socialNet.socialNetName = jsonObject.getString(NAME_KEY);
                socialNet.socialNetProfileLink = jsonObject.getString(PROFILE_LINK_KEY);
                return socialNet;
            } catch (JSONException e){
                return null;
            }
        }
    }
}
