package com.kiwihirecoach.backend.repository;

import com.kiwihirecoach.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}