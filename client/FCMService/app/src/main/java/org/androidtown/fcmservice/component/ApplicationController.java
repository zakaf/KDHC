package org.androidtown.fcmservice.component;

import android.app.Application;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.androidtown.fcmservice.network.NetworkService;

import retrofit.GsonConverterFactory;
import retrofit.Retrofit;

/**
 * Created by Hosan on 2017-01-06.
 */

public class ApplicationController extends Application {

    private static ApplicationController instance;

    public static ApplicationController getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        ApplicationController.instance = this;
    }

    private NetworkService networkService;

    public NetworkService getNetworkService() {
        return networkService;
    }

    private String baseUrl;

    public void buildNetworkService(String ip, int port) {
        synchronized (ApplicationController.class) {
            if (networkService == null) {
                baseUrl = String.format("http://%s:%d", ip, port);
                Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").create();
                GsonConverterFactory factory = GsonConverterFactory.create(gson);
                Retrofit retrofit = new Retrofit.Builder().baseUrl(baseUrl).addConverterFactory(factory).build();
                networkService = retrofit.create(NetworkService.class);
            }
        }
    }
}
