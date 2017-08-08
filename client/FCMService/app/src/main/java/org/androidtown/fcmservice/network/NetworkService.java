package org.androidtown.fcmservice.network;

import org.androidtown.fcmservice.TokenId;

import retrofit.Call;
import retrofit.http.Body;
import retrofit.http.Headers;
import retrofit.http.POST;

/**
 * Created by Hosan on 2017-01-06.
 * 요청정보를 기술한 인터페이스
 * REST API 를 쉽게 이용하게 해주는 라이브러리인 Retrofit 2.0 사용(http://square.github.io/retrofit/ 참고)
 * https://www.androidtutorialpoint.com/networking/retrofit-android-tutorial/도 참고하였음
 */

public interface NetworkService {

    @Headers("Content-Type: application/json")

    //TokenId 객체를 DB에 insert 하기 위해 서버에 있는 sendid.js에 post 요청을 보내는 method
    //@Body 로 보내주는 값을 js 파일 내에서 처리할 수 있음,
    @POST("/sendid")
    Call<TokenId> newTokenId(@Body TokenId tokenid);

    //현재 구현중
    @POST("/login")
    Call<String> login(@Body String token);


}
