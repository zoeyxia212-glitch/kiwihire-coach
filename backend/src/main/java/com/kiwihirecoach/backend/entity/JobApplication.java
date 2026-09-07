package com.kiwihirecoach.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String company;
    private LocalDateTime createdAt;
    private LocalDate closingDate;
    private String roleTitle;
    private String location;
    private String status;
    private String source;
    private String workMode;
    private String workRightsRequirement;
    private String salaryRange;
    private String contactPerson;
    private String jobUrl;
    private String careerLevel;
    private String employmentType;
    private Boolean graduateFriendly;
    private Boolean sponsorshipAvailable;
    private String industry;
    private String decision;
    @Lob
    private String decisionReason;
    @Lob
    private String strongestFit;
    @Lob
    private String mainConcern;
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean archived;
    @Lob
    private String jobDescription;
    private LocalDateTime submittedAt;
    private String submittedResumeName;
    @Lob
    private String submittedJobDescription;
    @Lob
    private String submittedResumeContent;
    @Lob
    private String submittedAnswers;
    @Lob
    private String submittedEvidence;

    @ManyToOne
    private User user;

    @ManyToMany
    @JoinTable(
            name = "application_evidence",
            joinColumns = @JoinColumn(name = "application_id"),
            inverseJoinColumns = @JoinColumn(name = "evidence_item_id")
    )
    private Set<EvidenceItem> evidenceItems = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "job_application_answers",
            joinColumns = @JoinColumn(name = "application_id"),
            inverseJoinColumns = @JoinColumn(name = "application_answer_id")
    )
    private Set<ApplicationAnswer> applicationAnswers = new LinkedHashSet<>();

    public JobApplication() {
    }

    public JobApplication(
           String company,
        String roleTitle,
        String location,
        String status,
        String jobDescription,
        LocalDate closingDate,
        User user
    ) {
        this(
                company,
            roleTitle,
            location,
            status,
            jobDescription,
            closingDate,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            user
        );
    }

    public JobApplication(
            String company,
            String roleTitle,
            String location,
            String status,
            String jobDescription,
            LocalDate closingDate,
            String source,
            String workMode,
            String workRightsRequirement,
            String salaryRange,
            String contactPerson,
            String jobUrl,
            String careerLevel,
            String employmentType,
            Boolean graduateFriendly,
            Boolean sponsorshipAvailable,
            String industry,
            User user
    ) {
        this.company = company;
        this.roleTitle = roleTitle;
        this.location = location;
        this.status = status;
        this.jobDescription = jobDescription;
        this.source = source;
        this.workMode = workMode;
        this.workRightsRequirement = workRightsRequirement;
        this.salaryRange = salaryRange;
        this.contactPerson = contactPerson;
        this.jobUrl = jobUrl;
        this.careerLevel = careerLevel;
        this.employmentType = employmentType;
        this.graduateFriendly = graduateFriendly;
        this.sponsorshipAvailable = sponsorshipAvailable;
        this.industry = industry;
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.closingDate = closingDate;
    }

    public Long getId() {
        return id;
    }

    public String getCompany() {
        return company;
    }

    public String getRoleTitle() {
        return roleTitle;
    }

    public String getLocation() {
        return location;
    }

    public String getStatus() {
        return status;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public String getSource() {
        return source;
    }

    public String getWorkMode() {
        return workMode;
    }

    public String getWorkRightsRequirement() {
        return workRightsRequirement;
    }

    public String getSalaryRange() {
        return salaryRange;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public String getCareerLevel() {
        return careerLevel;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public Boolean getGraduateFriendly() {
        return graduateFriendly;
    }

    public Boolean getSponsorshipAvailable() {
        return sponsorshipAvailable;
    }

    public String getIndustry() {
        return industry;
    }

    public String getDecision() { return decision; }
    public String getDecisionReason() { return decisionReason; }
    public String getStrongestFit() { return strongestFit; }
    public String getMainConcern() { return mainConcern; }
    public Set<EvidenceItem> getEvidenceItems() { return evidenceItems; }
    public Set<ApplicationAnswer> getApplicationAnswers() { return applicationAnswers; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public String getSubmittedResumeName() { return submittedResumeName; }
    public String getSubmittedJobDescription() { return submittedJobDescription; }
    public String getSubmittedResumeContent() { return submittedResumeContent; }
    public String getSubmittedAnswers() { return submittedAnswers; }
    public String getSubmittedEvidence() { return submittedEvidence; }

    public void updateDecision(
            String decision,
            String decisionReason,
            String strongestFit,
            String mainConcern
    ) {
        this.decision = decision;
        this.decisionReason = decisionReason;
        this.strongestFit = strongestFit;
        this.mainConcern = mainConcern;
    }

    public void replaceEvidenceItems(Set<EvidenceItem> evidenceItems) {
        this.evidenceItems.clear();
        this.evidenceItems.addAll(evidenceItems);
    }

    public void replaceApplicationAnswers(Set<ApplicationAnswer> applicationAnswers) {
        this.applicationAnswers.clear();
        this.applicationAnswers.addAll(applicationAnswers);
    }

    public void createSubmissionSnapshot(
            String resumeName,
            String resumeContent,
            String answers,
            String evidence
    ) {
        if (submittedAt != null) {
            throw new IllegalArgumentException("A submission snapshot already exists.");
        }
        this.submittedAt = LocalDateTime.now();
        this.submittedJobDescription = jobDescription;
        this.submittedResumeName = resumeName;
        this.submittedResumeContent = resumeContent;
        this.submittedAnswers = answers;
        this.submittedEvidence = evidence;
        this.status = "Applied";
    }

    public void restoreSubmissionSnapshot(
            LocalDateTime submittedAt,
            String resumeName,
            String jobDescription,
            String resumeContent,
            String answers,
            String evidence
    ) {
        if (this.submittedAt != null) {
            throw new IllegalArgumentException("A submission snapshot already exists.");
        }
        this.submittedAt = submittedAt;
        this.submittedResumeName = resumeName;
        this.submittedJobDescription = jobDescription;
        this.submittedResumeContent = resumeContent;
        this.submittedAnswers = answers;
        this.submittedEvidence = evidence;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public User getUser() {
        return user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public void setRoleTitle(String roleTitle) {
        this.roleTitle = roleTitle;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public void setWorkMode(String workMode) {
        this.workMode = workMode;
    }

    public void setWorkRightsRequirement(String workRightsRequirement) {
        this.workRightsRequirement = workRightsRequirement;
    }

    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }

    public void setCareerLevel(String careerLevel) {
        this.careerLevel = careerLevel;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public void setGraduateFriendly(Boolean graduateFriendly) {
        this.graduateFriendly = graduateFriendly;
    }

    public void setSponsorshipAvailable(Boolean sponsorshipAvailable) {
        this.sponsorshipAvailable = sponsorshipAvailable;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public LocalDate getClosingDate() {
        return closingDate;
    }

    public void setClosingDate(LocalDate closingDate) {
        this.closingDate = closingDate;
    }
}
