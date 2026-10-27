"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BusTrip,
  isSeatAvailableForSegment,
  calculateFare,
} from "@/core/mocks/tulcanIbarraData";

export function useSeatSelection(
  currentTrip: BusTrip | null,
  fromStopOrder: number,
  toStopOrder: number,
  overrideFare?: number
) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const farePerSeat = useMemo(
    () => (overrideFare !== undefined ? overrideFare : calculateFare(fromStopOrder, toStopOrder)),
    [fromStopOrder, toStopOrder, overrideFare]
  );

  const toggleSeat = useCallback(
    (seatNumber: number) => {
      if (!currentTrip) return;

      const isAvailable = isSeatAvailableForSegment(
        currentTrip.bookedSegments,
        seatNumber,
        fromStopOrder,
        toStopOrder
      );

      if (!isAvailable) return; // Asiento ocupado en este tramo

      setSelectedSeats((prev) =>
        prev.includes(seatNumber)
          ? prev.filter((s) => s !== seatNumber)
          : [...prev, seatNumber]
      );
    },
    [currentTrip, fromStopOrder, toStopOrder]
  );

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  const totalAmount = useMemo(
    () => selectedSeats.length * farePerSeat,
    [selectedSeats.length, farePerSeat]
  );

  return {
    selectedSeats,
    toggleSeat,
    clearSelection,
    farePerSeat,
    totalAmount,
  };
}
