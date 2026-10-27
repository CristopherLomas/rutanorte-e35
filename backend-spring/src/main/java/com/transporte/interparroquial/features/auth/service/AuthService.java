package com.transporte.interparroquial.features.auth.service;

import com.transporte.interparroquial.features.auth.dto.AuthResponse;
import com.transporte.interparroquial.features.auth.dto.LoginRequest;
import com.transporte.interparroquial.features.auth.dto.RegisterRequest;
import com.transporte.interparroquial.features.auth.entity.RoleEnum;
import com.transporte.interparroquial.features.auth.entity.UserEntity;
import com.transporte.interparroquial.features.auth.repository.UserRepository;
import com.transporte.interparroquial.features.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El correo electrónico ya se encuentra registrado.");
        }
        if (userRepository.existsByCedula(request.getCedula())) {
            throw new IllegalArgumentException("El número de cédula ya se encuentra registrado.");
        }

        // Regla de Negocio: Ley Orgánica del Adulto Mayor (>= 65 años)
        int age = Period.between(request.getBirthDate(), LocalDate.now()).getYears();
        boolean isPreferential = age >= 65;

        UserEntity user = UserEntity.builder()
                .cedula(request.getCedula().trim())
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .birthDate(request.getBirthDate())
                .isPreferential(isPreferential)
                .role(RoleEnum.CLIENT)
                .build();

        UserEntity savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser);

        String benefitMsg = isPreferential
                ? "Registro exitoso. Se detectó edad de " + age + " años: Beneficio de Tercera Edad (50% de descuento) activado de por vida."
                : "Registro exitoso en la plataforma E35.";

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .cedula(savedUser.getCedula())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .isPreferential(savedUser.getIsPreferential())
                .message(benefitMsg)
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();
        UserEntity user = userRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas: usuario o contraseña incorrectos."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas: usuario o contraseña incorrectos.");
        }

        String token = jwtTokenProvider.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .cedula(user.getCedula())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .isPreferential(user.getIsPreferential())
                .message("Sesión iniciada con éxito.")
                .build();
    }
}
