package pl.firma.ir21;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity 
public class Partner {
  
  @Id 
  @GeneratedValue 
  private Long id;

  private String name;
  private String mccMnc;

  @JsonIgnore 
  @OneToMany(mappedBy = "partner",cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Contact> contacts = new ArrayList<>();

  protected Partner() {

  }

  public Partner(String name, String mccMnc) {
    this.name = name;
    this.mccMnc = mccMnc;
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getMccMnc() {
    return mccMnc;
  }

  public void setName(String name) {
    this.name = name;
  }

  public void addContact(Contact contact) {
    contacts.add(contact);
    contact.setPartner(this);
  }

  public List<Contact> getContacts() {
    return contacts;
  }

}
