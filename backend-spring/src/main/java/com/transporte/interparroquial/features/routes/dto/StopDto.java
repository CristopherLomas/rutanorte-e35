package com.transporte.interparroquial.features.routes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StopDto {
    private Long id;
    private String name;
    private String province;
    private Integer stopOrder;
    private Double latitude;
    private Double longitude;
    private Double kmFromStart;
    private String imageUrl;
    private String description;
}
