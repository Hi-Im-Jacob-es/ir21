package pl.firma.ir21;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity 
public class Partner {
  
  @Id 
  @GeneratedValue 
  private Long id;

  private String name;
  private String mccMnc;

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

}
