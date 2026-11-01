package pl.firma.ir21;

import java.io.InputStream;
import javax.xml.parsers.DocumentBuilderFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

@Component
public class Ir21Importer {

    private final PartnerRepository repo;

    public Ir21Importer(PartnerRepository repo) {
        this.repo = repo;
    }

    public Partner importFromClasspath(String path) {
        try (InputStream in = new ClassPathResource(path).getInputStream()) {

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            // bezpieczeństwo: blokujemy DOCTYPE, czyli atak XXE z obcych plików XML
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            Document doc = factory.newDocumentBuilder().parse(in);

            // <organisation> → nazwa operatora, <network> → MCC + MNC
            Element organisation = first(doc.getDocumentElement(), "organisation");
            Element network = first(organisation, "network");

            String name = text(organisation, "name");
            String mccMnc = text(network, "mcc") + text(network, "mnc");
            Partner partner = new Partner(name, mccMnc);

            // każdy <contact type="..."> → obiekt Contact
            NodeList contacts = doc.getElementsByTagName("contact");
            for (int i = 0; i < contacts.getLength(); i++) {
                Element c = (Element) contacts.item(i);
                partner.addContact(new Contact(
                        ContactType.valueOf(c.getAttribute("type")),
                        text(c, "name"),
                        text(c, "email"),
                        text(c, "phone")));   // brak <phone> → null
            }

            return repo.save(partner);   // zapisze partnera razem z kontaktami (cascade)

        } catch (Exception e) {
            throw new IllegalStateException("Nie udało się zaimportować IR.21: " + path, e);
        }
    }

    // pierwszy element o danej nazwie wewnątrz rodzica
    private static Element first(Element parent, String tag) {
        return (Element) parent.getElementsByTagName(tag).item(0);
    }

    // tekst pierwszego elementu o danej nazwie albo null, jeśli go nie ma
    private static String text(Element parent, String tag) {
        NodeList list = parent.getElementsByTagName(tag);
        return list.getLength() == 0 ? null : list.item(0).getTextContent().trim();
    }
}