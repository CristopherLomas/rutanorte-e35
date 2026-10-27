package com.transporte.interparroquial.features.routes.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stops", indexes = {
    @Index(name = "idx_stop_order", columnList = "stopOrder")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StopEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String province; // Carchi o Imbabura

    @Column(nullable = false, unique = true)
    private Integer stopOrder; // 1: Tulcán ... 8: Ibarra

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private Double kmFromStart; // 0.0, 21.5, 28.0, 42.0, 61.0, 85.0, 94.0, 125.0

    @Column(length = 255)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;
}
