package pl.firma.ir21;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partners")
public class PartnerController {

    private final PartnerService service;

    public PartnerController(PartnerService service) {
        this.service = service;
    }

    @GetMapping("/{mccMnc}/contacts")
    public List<Contact> contacts(@PathVariable String mccMnc) {
        return service.getContacts(mccMnc);
    }

    @PostMapping("/{mccMnc}/contacts")
    @ResponseStatus (HttpStatus.CREATED)
    public Contact addContact(@PathVariable String mccMnc, @RequestBody ContactRequest req) {
        return service.addContact(mccMnc, req);
    }

    @GetMapping
    public List<Partner> all() {
        return service.getAll();
    }

    @GetMapping("/{mccMnc}")
    public Partner one(@PathVariable String mccMnc) {
        return service.getByMccMnc(mccMnc);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Partner create(@RequestBody PartnerRequest req) {
        return service.create(req);
    }

    @DeleteMapping("/{mccMnc}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String mccMnc) {
        service.deleteByMccMnc(mccMnc); 
      }

    @PutMapping("/{mccMnc}")  
    public Partner update(@PathVariable String mccMnc, @RequestBody PartnerRequest req) {
        return service.update(mccMnc, req);
    }

    
}