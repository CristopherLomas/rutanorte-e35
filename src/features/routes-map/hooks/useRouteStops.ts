"use client";

import { useState, useMemo, useEffect } from "react";
import {
  TULCAN_IBARRA_STOPS,
  Stop,
  calculateFare,
  calculateDistanceKm,
} from "@/core/mocks/tulcanIbarraData";
import { routesService } from "../services/routes.service";

export function useRouteStops() {
  const [stopsList, setStopsList] = useState<Stop[]>(TULCAN_IBARRA_STOPS);
  const [originOrder, setOriginOrder] = useState<number>(1); // Tulcán por defecto
  const [destinationOrder, setDestinationOrder] = useState<number>(8); // Ibarra por defecto
  const [activeStop, setActiveStop] = useState<Stop>(TULCAN_IBARRA_STOPS[0]);
  const [isLoadingStops, setIsLoadingStops] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingStops(true);
    routesService
      .getStops()
      .then((data) => {
        if (isMounted && data.length > 0) {
          setStopsList(data);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingStops(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const originStop = useMemo(
    () => stopsList.find((s) => s.stopOrder === originOrder) || stopsList[0],
    [stopsList, originOrder]
  );

  const destinationStop = useMemo(
    () => stopsList.find((s) => s.stopOrder === destinationOrder) || stopsList[stopsList.length - 1],
    [stopsList, destinationOrder]
  );

  const distanceKm = useMemo(
    () => calculateDistanceKm(originOrder, destinationOrder),
    [originOrder, destinationOrder]
  );

  const estimatedFare = useMemo(
    () => calculateFare(originOrder, destinationOrder),
    [originOrder, destinationOrder]
  );

  const estimatedDurationMinutes = useMemo(() => {
    return Math.max(15, Math.round((distanceKm / 50) * 60));
  }, [distanceKm]);

  return {
    stops: stopsList,
    originOrder,
    destinationOrder,
    setOriginOrder,
    setDestinationOrder,
    originStop,
    destinationStop,
    distanceKm,
    estimatedFare,
    estimatedDurationMinutes,
    activeStop,
    setActiveStop,
    isLoadingStops,
  };
}
