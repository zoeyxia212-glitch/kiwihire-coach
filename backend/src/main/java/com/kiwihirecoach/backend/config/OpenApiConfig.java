package com.kiwihirecoach.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER = "bearerAuth";

    @Bean
    public OpenAPI kiwiHireOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("KiwiHire Coach API")
                        .description("REST API for job applications, resume "
                                + "reviews, interview preparation and "
                                + "follow-ups. Log in at /api/auth/login, "
                                + "then authorize with the returned token.")
                        .version("1.0"))
                .components(new Components().addSecuritySchemes(
                        BEARER,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER));
    }
}
