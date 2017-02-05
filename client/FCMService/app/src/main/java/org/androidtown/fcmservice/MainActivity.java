package org.androidtown.fcmservice;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.FirebaseMessaging;

import org.androidtown.fcmservice.component.ApplicationController;
import org.androidtown.fcmservice.network.NetworkService;

import retrofit.Call;
import retrofit.Callback;
import retrofit.Response;
import retrofit.Retrofit;

public class MainActivity extends AppCompatActivity {

    TextView tokenId;
    Button sendButton;
    Button loginButton;
    EditText editTextName;
    NetworkService networkService;
    String ip = "35.164.30.147";
    String loginString;
    int port = 3000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        init();
        initNetwork();


        tokenId.setText(FirebaseInstanceId.getInstance().getToken());
        Log.i("로그",FirebaseInstanceId.getInstance().getToken());
        getIntent().getExtras();

        FirebaseMessaging.getInstance().subscribeToTopic("test");
        sendData();
        login();
    }

    private void login() {
        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                TokenId tokenid = new TokenId("");
                tokenid.setToken(FirebaseInstanceId.getInstance().getToken());
                Call<String> login = networkService.login(tokenid.getToken());
                login.enqueue(new Callback<String>() {
                    @Override
                    public void onResponse(Response<String> response, Retrofit retrofit) {
                        if (response.isSuccess()) {
                            loginString = response.body();
                            Log.i("MyTag", "로그인값: " + loginString);

                        } else {
                            int statusCode = response.code();
                            Log.i("MyTag", "응답코드: " + statusCode);
                        }
                    }

                    @Override
                    public void onFailure(Throwable t) {
                        Log.i("MyTag", "에러내용: " + t.getMessage());

                    }
                });
            }
        });
    }

    private void sendData() {
        sendButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                TokenId tokenid = new TokenId("");
                tokenid.setName(editTextName.getText().toString());
                tokenid.setToken(FirebaseInstanceId.getInstance().getToken());
                Call<TokenId> tokenIdCall = networkService.newTokenId(tokenid);
                tokenIdCall.enqueue(new Callback<TokenId>() {
                    @Override
                    public void onResponse(Response<TokenId> response, Retrofit retrofit) {
                        if (response.isSuccess()) {

                            Toast.makeText(getApplicationContext(), "성공", Toast.LENGTH_LONG);

                        } else {
                            int statusCode = response.code();
                            if(statusCode==503){
                                Toast.makeText(getApplicationContext(), "이미 등록된 token 값입니다", Toast.LENGTH_LONG).show();
                            }
                            Log.i("MyTag", "응답코드: " + statusCode);
                        }
                    }

                    @Override
                    public void onFailure(Throwable t) {
                        if(t.getMessage().contains("failed")){
                            Toast.makeText(getApplicationContext(), "서버에 연결되지 않았습니다", Toast.LENGTH_LONG).show();
                        }

                        Log.i("MyTag", "에러내용: " + t.getMessage());
                    }
                });
            }
        });
    }
    private void init(){
        tokenId = (TextView)findViewById(R.id.tokenId);
        sendButton = (Button)findViewById(R.id.sendButton);
        loginButton = (Button)findViewById(R.id.loginButton);
        editTextName = (EditText)findViewById(R.id.editTextName);


    }

    private void initNetwork(){
        ApplicationController application = ApplicationController.getInstance();
        application.buildNetworkService(ip, port);
        networkService = ApplicationController.getInstance().getNetworkService();
        Log.i("로그", "연결성공");

    }
}
