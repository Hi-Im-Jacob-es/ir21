package pl.firma.ir21;

public record ContactRequest(ContactType type, String name, String email, String phone) {}