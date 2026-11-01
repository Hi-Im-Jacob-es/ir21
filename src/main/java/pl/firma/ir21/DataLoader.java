package pl.firma.ir21;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final PartnerRepository repo;
    private final Ir21Importer importer;

    public DataLoader(PartnerRepository repo, Ir21Importer importer) {
        this.repo = repo;
        this.importer = importer;
    }

    @Override
    public void run(String... args) {
        // partner z pliku IR.21
        importer.importFromClasspath("ir21/ir21_doc.xml");

        // partnerzy wpisani ręcznie
        Partner plus = new Partner("Plus", "26001");
        plus.addContact(new Contact(ContactType.NOC_24x7, "NOC Plus", "noc@plus.example", "+48 600 000 001"));
        plus.addContact(new Contact(ContactType.ROAMING_COORDINATOR, "Jan Kowalski", "roaming@plus.example", null));
        repo.save(plus);

        repo.save(new Partner("T-Mobile Polska", "26002"));
        repo.save(new Partner("Orange Polska", "26003"));
        repo.save(new Partner("Play", "26006"));
    }
}