package pl.firma.ir21;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartnerRepository extends JpaRepository<Partner, Long> {
  Optional<Partner> findByMccMnc(String mccMnc);
}
