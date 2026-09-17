package com.talentiq.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.talentiq.backend.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    @JsonProperty("name")
    @JsonAlias({"name", "Name"})
    private String name;
    private String email;
    private String password;
    private Role role;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
