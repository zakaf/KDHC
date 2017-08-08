package org.androidtown.fcmservice;

/**
 * Created by Hosan on 2017-01-06.
 */

public class TokenId {
   private String token;
   private String name;

   public String getToken() {
      return token;
   }

   public void setToken(String token) {
      this.token = token;
   }

   public String getName() {
      return name;
   }

   public void setName(String name) {
      this.name = name;
   }

   public TokenId(String token){
      this.token =token;
   }
}
