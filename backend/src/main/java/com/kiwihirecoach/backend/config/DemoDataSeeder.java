package com.kiwihirecoach.backend.config;

import com.kiwihirecoach.backend.entity.ApplicationEvent;
import com.kiwihirecoach.backend.entity.JobApplication;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.repository.ApplicationEventRepository;
import com.kiwihirecoach.backend.repository.JobApplicationRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates one demo account with sample applications so a visitor can explore
 * the product without registering. Disabled unless app.demo.enabled=true.
 * The sample companies and roles are fictional.
 */
@Component
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final JobApplicationRepository applications;
    private final ApplicationEventRepository events;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public DemoDataSeeder(
            UserRepository users,
            JobApplicationRepository applications,
            ApplicationEventRepository events,
            PasswordEncoder passwordEncoder,
            @Value("${app.demo.email:demo@kiwihire.example}") String email,
            @Value("${app.demo.password:}") String password
    ) {
        this.users = users;
        this.applications = applications;
        this.events = events;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (password.isBlank() || users.findByEmailIgnoreCase(email).isPresent()) {
            return;
        }

        User user = users.save(new User(
                email, passwordEncoder.encode(password), LocalDateTime.now()));

        seed(user, "Harbour Analytics", "Junior Data Engineer", "Auckland", "Saved", "SEEK", null, 0);
        seed(user, "Kauri Software", "Graduate Software Developer", "Auckland", "Saved", "LinkedIn", null, 0);
        seed(user, "Pōhutukawa Payments", "Junior Backend Developer", "Wellington", "Applied", "Company site", "Hiring team", 6);
        seed(user, "Tūī Health Tech", "Graduate Full Stack Developer", "Auckland", "Applied", "SEEK", "Recruiter", 9);
        seed(user, "Southern Cross Cloud", "Junior Cloud Engineer", "Auckland", "Recruiter Screen", "LinkedIn", "Sam (Talent)", 12);
        seed(user, "Fernleaf Logistics", "Junior Developer", "Hamilton", "First Interview", "Referral", "Alex (Engineering)", 20);
        seed(user, "Mānuka Labs", "Graduate Software Engineer", "Auckland", "Technical Interview", "Company site", "Jordan", 26);
        seed(user, "Kiwi Retail Group", "Junior Support Engineer", "Auckland", "Offer", "SEEK", "Taylor (HR)", 34);
        seed(user, "Pacific Freight Systems", "Junior Java Developer", "Christchurch", "Rejected", "SEEK", "Hiring team", 30);
        seed(user, "Ngāio Data", "Graduate Data Analyst", "Remote (NZ)", "Rejected", "LinkedIn", "Hiring team", 28);
        seed(user, "Waitematā Digital", "Junior Web Developer", "Auckland", "Withdrawn", "SEEK", null, 22);
    }

    private void seed(
            User user, String company, String role, String location,
            String status, String source, String contact, int daysAgo
    ) {
        JobApplication application = applications.save(new JobApplication(
                company, role, location, status,
                "Sample job description for " + role + ". Fictional demo data.",
                LocalDate.now().plusDays(10), source, "Hybrid", "NZ work rights required",
                null, contact, null, "Graduate", "Full-time", true, false,
                "Technology", user));

        if (!"Saved".equals(status)) {
            events.save(new ApplicationEvent(
                    application, "Applied", LocalDateTime.now().minusDays(daysAgo),
                    contact, "Submitted application (demo data).",
                    "Follow up in a week", null));
            if (!"Applied".equals(status)) {
                events.save(new ApplicationEvent(
                        application, status, LocalDateTime.now().minusDays(Math.max(daysAgo - 5, 1)),
                        contact, "Moved to " + status + " (demo data).", "", null));
            }
        }
    }
}
