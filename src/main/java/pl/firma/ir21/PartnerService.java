package pl.firma.ir21;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service 
public class PartnerService {
  
  private final PartnerRepository repo;

  public PartnerService(PartnerRepository repo) {
    this.repo = repo;
  }

  public List<Partner> getAll() {
    return repo.findAll();
  }

  public Partner getByMccMnc(String mccMnc) {  //format: 223.10  "number.number"
    return repo.findByMccMnc(mccMnc)
            .orElseThrow(() -> new ResponseStatusException (
              HttpStatus.NOT_FOUND, "Brak partnera dla mccMnc: [" + mccMnc + "]"));
  }

  public Partner create(PartnerRequest req) {
    if (repo.findByMccMnc(req.mccMnc()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Partner z mccMnc: [" + req.mccMnc() + "] już istnieje");
    }
    return repo.save(new Partner(req.name(), req.mccMnc()));
  }

  public void deleteByMccMnc(String mccMnc) {
    Partner partner = getByMccMnc(mccMnc);
    repo.delete(partner);
  }

  public Partner update(String mccMnc, PartnerRequest req) {
    Partner partner = getByMccMnc(mccMnc);
    partner.setName(req.name());
    return repo.save(partner);
  }

}
