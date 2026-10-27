package com.transporte.interparroquial.features.routes.repository;

import com.transporte.interparroquial.features.routes.entity.StopEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StopRepository extends JpaRepository<StopEntity, Long> {

    List<StopEntity> findAllByOrderByStopOrderAsc();

    Optional<StopEntity> findByStopOrder(Integer stopOrder);
}
