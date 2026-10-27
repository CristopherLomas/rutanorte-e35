package com.transporte.interparroquial.features.auth.repository;

import com.transporte.interparroquial.features.auth.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByCedula(String cedula);

    @Query("SELECT u FROM UserEntity u WHERE u.email = :identifier OR u.cedula = :identifier")
    Optional<UserEntity> findByIdentifier(@Param("identifier") String identifier);

    boolean existsByEmail(String email);

    boolean existsByCedula(String cedula);
}
