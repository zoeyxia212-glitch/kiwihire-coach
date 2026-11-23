package com.kiwihirecoach.backend.service;

import com.kiwihirecoach.backend.dto.CandidateProfileResponse;
import com.kiwihirecoach.backend.dto.SaveCandidateProfileRequest;
import com.kiwihirecoach.backend.entity.CandidateProfile;
import com.kiwihirecoach.backend.entity.User;
import com.kiwihirecoach.backend.repository.CandidateProfileRepository;
import com.kiwihirecoach.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CandidateProfileServiceTest {

    private static final Long USER_ID = 1L;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CandidateProfileService candidateProfileService;

    private SaveCandidateProfileRequest request(String spokenLanguages) {
        return new SaveCandidateProfileRequest(
                "Zoey", "Junior Developer", "Student visa", "Auckland",
                "Graduate", "Java, React", "Built KiwiHire Coach", "",
                spokenLanguages
        );
    }

    @Test
    void getProfileReturnsEmptyLanguagesWhenNoProfileExists() {
        when(candidateProfileRepository.findByUserId(USER_ID))
                .thenReturn(Optional.empty());

        CandidateProfileResponse response =
                candidateProfileService.getProfile(USER_ID);

        assertEquals("", response.spokenLanguages());
    }

    @Test
    void saveProfileTrimsAndStoresSpokenLanguages() {
        User user = new User(
                "zoey@example.com", "password-hash", LocalDateTime.now()
        );
        when(candidateProfileRepository.findByUserId(USER_ID))
                .thenReturn(Optional.empty());
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(candidateProfileRepository.save(any(CandidateProfile.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CandidateProfileResponse response = candidateProfileService
                .saveProfile(request("  English, Mandarin  "), USER_ID);

        assertEquals("English, Mandarin", response.spokenLanguages());
    }

    @Test
    void saveProfileTreatsMissingLanguagesAsEmpty() {
        User user = new User(
                "zoey@example.com", "password-hash", LocalDateTime.now()
        );
        when(candidateProfileRepository.findByUserId(USER_ID))
                .thenReturn(Optional.empty());
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(candidateProfileRepository.save(any(CandidateProfile.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Backups made before this field existed have no spokenLanguages.
        CandidateProfileResponse response = candidateProfileService
                .saveProfile(request(null), USER_ID);

        assertEquals("", response.spokenLanguages());
    }
}
