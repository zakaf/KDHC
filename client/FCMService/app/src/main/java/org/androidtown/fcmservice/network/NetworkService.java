package org.androidtown.fcmservice.network;

import org.androidtown.fcmservice.TokenId;

import retrofit.Call;
import retrofit.http.Body;
import retrofit.http.Headers;
import retrofit.http.POST;

/**
 * Created by Hosan on 2017-01-06.
 */

public interface NetworkService {

    @Headers("Content-Type: application/json")

    @POST("/sendid")
    Call<TokenId> newTokenId(@Body TokenId tokenid);
}
