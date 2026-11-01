package pl.firma.ir21;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final PartnerRepository repo;

    public DataLoader(PartnerRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        repo.save(new Partner("Plus", "26001"));
        repo.save(new Partner("T-Mobile Polska", "26002"));
        repo.save(new Partner("Orange Polska", "26003"));
        repo.save(new Partner("Play", "26006"));
    }
}