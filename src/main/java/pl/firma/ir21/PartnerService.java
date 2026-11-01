package pl.firma.ir21;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.transaction.annotation.Transactional;

@Service 
public class PartnerService {
  
  private final PartnerRepository repo;
  private final ContactRepository contactRepo;

  public PartnerService(PartnerRepository repo, ContactRepository contactRepo) {
    this.repo = repo;
    this.contactRepo = contactRepo;
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

  @Transactional(readOnly = true)
    public List<Contact> getContacts(String mccMnc) {
        return List.copyOf(getByMccMnc(mccMnc).getContacts());
    }

    @Transactional
    public Contact addContact(String mccMnc, ContactRequest req) {
        Partner partner = getByMccMnc(mccMnc);
        Contact contact = new Contact(req.type(), req.name(), req.email(), req.phone());
        partner.addContact(contact);
        return contactRepo.save(contact);
    }

    public Partner update(String mccMnc, PartnerRequest req) {
        Partner partner = getByMccMnc(mccMnc);
        partner.setName(req.name());
        return repo.save(partner);
    }

}
