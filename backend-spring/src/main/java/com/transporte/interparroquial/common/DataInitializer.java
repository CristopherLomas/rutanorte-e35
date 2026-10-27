package com.transporte.interparroquial.common;

import com.transporte.interparroquial.features.auth.entity.RoleEnum;
import com.transporte.interparroquial.features.auth.entity.UserEntity;
import com.transporte.interparroquial.features.auth.repository.UserRepository;
import com.transporte.interparroquial.features.booking.entity.PaymentMethod;
import com.transporte.interparroquial.features.booking.entity.ScheduleEntity;
import com.transporte.interparroquial.features.booking.entity.TicketEntity;
import com.transporte.interparroquial.features.booking.entity.TicketStatus;
import com.transporte.interparroquial.features.booking.repository.ScheduleRepository;
import com.transporte.interparroquial.features.booking.repository.TicketRepository;
import com.transporte.interparroquial.features.routes.entity.StopEntity;
import com.transporte.interparroquial.features.routes.repository.StopRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final StopRepository stopRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedStops();
        seedSchedulesAndTickets();
        seedUsers();
    }

    private void seedStops() {
        if (stopRepository.count() == 0) {
            log.info("Inicializando las 8 paradas oficiales del Corredor Panamericana E35...");
            List<StopEntity> stops = List.of(
                    StopEntity.builder().name("Tulcán").province("Carchi").stopOrder(1).latitude(0.81230).longitude(-77.71780).kmFromStart(0.0).imageUrl("/images/stops/tulcan.jpg").description("Terminal Terrestre Tulcán, Centinela del Norte y portal fronterizo.").build(),
                    StopEntity.builder().name("Julio Andrade").province("Carchi").stopOrder(2).latitude(0.66250).longitude(-77.72190).kmFromStart(21.5).imageUrl("/images/stops/julio-andrade.jpg").description("Principal emporio agrícola y de lácteos del Carchi.").build(),
                    StopEntity.builder().name("Huaca").province("Carchi").stopOrder(3).latitude(0.63190).longitude(-77.72580).kmFromStart(28.0).imageUrl("/images/stops/huaca.jpg").description("Tierra mariana con el Santuario de la Virgen de la Purita.").build(),
                    StopEntity.builder().name("San Gabriel").province("Carchi").stopOrder(4).latitude(0.59640).longitude(-77.83060).kmFromStart(42.0).imageUrl("/images/stops/san-gabriel.jpg").description("Pueblo Mágico del Ecuador, célebre por su arquitectura colonial.").build(),
                    StopEntity.builder().name("Bolívar").province("Carchi").stopOrder(5).latitude(0.50580).longitude(-77.90420).kmFromStart(61.0).imageUrl("/images/stops/bolivar.jpg").description("Centro cantonal del Carchi y portal de descenso hacia el valle.").build(),
                    StopEntity.builder().name("El Juncal / Chota").province("Imbabura").stopOrder(6).latitude(0.46820).longitude(-78.02640).kmFromStart(85.0).imageUrl("/images/stops/el-juncal.jpg").description("Entrada a Imbabura, valle cálido y cuna de destacados deportistas.").build(),
                    StopEntity.builder().name("Ambuquí").province("Imbabura").stopOrder(7).latitude(0.44390).longitude(-78.02860).kmFromStart(94.0).imageUrl("/images/stops/ambuqui.jpg").description("Parroquia rural de clima templado y huertos de ciruela y ovo.").build(),
                    StopEntity.builder().name("Ibarra").province("Imbabura").stopOrder(8).latitude(0.35170).longitude(-78.12230).kmFromStart(125.0).imageUrl("/images/stops/ibarra.jpg").description("Terminal Terrestre Ibarra, la Ciudad Blanca de Imbabura.").build()
            );
            stopRepository.saveAll(stops);
            log.info("8 paradas del Carchi e Imbabura creadas con éxito.");
        }
    }

    private void seedSchedulesAndTickets() {
        if (scheduleRepository.count() == 0) {
            log.info("Inicializando flota y horarios de transporte E35...");
            ScheduleEntity s1 = ScheduleEntity.builder()
                    .busNumber("Disco 24 - El Centinela")
                    .cooperativeName("Pullman Carchi")
                    .plate("CBA-1845")
                    .departureTime(LocalTime.of(6, 15))
                    .estimatedArrivalTime(LocalTime.of(8, 45))
                    .totalSeats(40)
                    .driverName("Segundo Benavides")
                    .build();

            ScheduleEntity s2 = ScheduleEntity.builder()
                    .busNumber("Disco 12 - Fronterizo")
                    .cooperativeName("Expreso Tulcán")
                    .plate("CBB-2034")
                    .departureTime(LocalTime.of(7, 30))
                    .estimatedArrivalTime(LocalTime.of(9, 50))
                    .totalSeats(40)
                    .driverName("Wilson Bolaños")
                    .build();

            ScheduleEntity s3 = ScheduleEntity.builder()
                    .busNumber("Disco 08 - Ciudad Blanca")
                    .cooperativeName("Transportes Unidos")
                    .plate("IAA-3341")
                    .departureTime(LocalTime.of(9, 0))
                    .estimatedArrivalTime(LocalTime.of(11, 30))
                    .totalSeats(40)
                    .driverName("Jaime Ipiales")
                    .build();

            List<ScheduleEntity> saved = scheduleRepository.saveAll(List.of(s1, s2, s3));
            ScheduleEntity activeSchedule = saved.get(2); // Disco 08

            // Crear boletos iniciales para pruebas de abordaje y control
            TicketEntity t1 = TicketEntity.builder()
                    .scheduleId(activeSchedule.getId())
                    .seatNumber(19)
                    .originStopId(2L)
                    .destinationStopId(8L)
                    .originOrder(2)
                    .destOrder(8)
                    .passengerName("Carlos Villarreal")
                    .passengerCedula("0401829341")
                    .passengerPhone("0998341920")
                    .basePrice(BigDecimal.valueOf(4.15))
                    .discountApplied(BigDecimal.ZERO)
                    .finalPrice(BigDecimal.valueOf(4.15))
                    .paymentMethod(PaymentMethod.ONLINE_CARD)
                    .status(TicketStatus.PAID)
                    .qrCodeHash("E35-327414")
                    .build();

            TicketEntity t2 = TicketEntity.builder()
                    .scheduleId(activeSchedule.getId())
                    .seatNumber(7)
                    .originStopId(2L)
                    .destinationStopId(8L)
                    .originOrder(2)
                    .destOrder(8)
                    .passengerName("Silvia Portilla")
                    .passengerCedula("1002394851")
                    .passengerPhone("0987123456")
                    .basePrice(BigDecimal.valueOf(4.15))
                    .discountApplied(BigDecimal.ZERO)
                    .finalPrice(BigDecimal.valueOf(4.15))
                    .paymentMethod(PaymentMethod.CASH_CONTROLLER)
                    .status(TicketStatus.PENDING_CASH)
                    .qrCodeHash("E35-842109")
                    .build();

            TicketEntity t3 = TicketEntity.builder()
                    .scheduleId(activeSchedule.getId())
                    .seatNumber(18)
                    .originStopId(1L)
                    .destinationStopId(8L)
                    .originOrder(1)
                    .destOrder(8)
                    .passengerName("Lucía Montalvo")
                    .passengerCedula("1719283401")
                    .passengerPhone("0991122334")
                    .basePrice(BigDecimal.valueOf(5.00))
                    .discountApplied(BigDecimal.ZERO)
                    .finalPrice(BigDecimal.valueOf(5.00))
                    .paymentMethod(PaymentMethod.ONLINE_CARD)
                    .status(TicketStatus.BOARDED)
                    .qrCodeHash("E35-776655")
                    .build();

            ticketRepository.saveAll(List.of(t1, t2, t3));
            log.info("Horarios y boletos iniciales inicializados con éxito.");
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Creando usuarios demo para la sustentación...");
            UserEntity clientSenior = UserEntity.builder()
                    .cedula("0400192834")
                    .fullName("Segundo Benavides")
                    .email("segundo.benavides@carchi.ec")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .birthDate(LocalDate.of(1956, 3, 10)) // 68 años (Tercera Edad)
                    .isPreferential(true)
                    .role(RoleEnum.CLIENT)
                    .build();

            UserEntity controller = UserEntity.builder()
                    .cedula("0401827365")
                    .fullName("Wilson Bolaños")
                    .email("controlador.e35@pullmancarchi.ec")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .birthDate(LocalDate.of(1985, 7, 22))
                    .isPreferential(false)
                    .role(RoleEnum.CONTROLLER)
                    .cooperativeName("Disco 08 - Ciudad Blanca")
                    .build();

            UserEntity admin = UserEntity.builder()
                    .cedula("1002938471")
                    .fullName("Ing. Ramiro Cárdenas")
                    .email("admin.operaciones@rutanorte.ec")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .birthDate(LocalDate.of(1978, 11, 5))
                    .isPreferential(false)
                    .role(RoleEnum.ADMIN)
                    .build();

            userRepository.saveAll(List.of(clientSenior, controller, admin));
            log.info("Usuarios demo creados: Cliente (Tercera Edad), Controlador y Administrador.");
        }
    }
}
