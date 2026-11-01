package pl.firma.ir21;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity 
public class Contact {
  
  @Id 
  @GeneratedValue 
  private Long id;

  @Enumerated(EnumType.STRING)
  private ContactType type;

  private String name;
  private String email;
  private String phone;

  @JsonIgnore 
  @ManyToOne 
  @JoinColumn(name = "partner_id")
  private Partner partner;

  protected Contact() {}

  public Contact(ContactType type, String name, String email, String phone) {
    this.type = type;
    this.name = name;
    this.email = email;
    this.phone = phone;
  }

  void setPartner(Partner partner) {
    this.partner = partner;
  }

  public long getId() {
    return id;
  }

  public ContactType getType() {
    return type;
  }

  public String getName() {
    return name;
  }

  public String getEmail() {
    return email;
  }

  public String getPhone() {
    return phone;
  }
  

}
