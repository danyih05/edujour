package com.gradquest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class GradQuestApplication {

    public static void main(String[] args) {
        SpringApplication.run(GradQuestApplication.class, args);
    }
}
