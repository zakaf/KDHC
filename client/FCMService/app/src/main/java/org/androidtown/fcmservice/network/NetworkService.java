package org.androidtown.fcmservice.network;

import org.androidtown.fcmservice.TokenId;

import retrofit.Call;
import retrofit.http.Body;
import retrofit.http.Headers;
import retrofit.http.POST;

/**
 * Created by Hosan on 2017-01-06.
 * 요청정보를 기술한 인터페이스
 * Retrofit 2.0 사용(http://square.github.io/retrofit/ 참고)
 */

public interface NetworkService {

    @Headers("Content-Type: application/json")

    //TokenId 객체를 DB에 insert 하기 위해 서버에 있는 sendid.js에 post 요청을 보내는 method
    @POST("/sendid")
    Call<TokenId> newTokenId(@Body TokenId tokenid);

    @POST("/login")
    Call<String> login(@Body String token);


}
