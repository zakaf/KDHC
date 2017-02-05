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

        sendData();
        login();
    }

    //로그인 버튼 클릭시 해당 기기의 tokenid 검증 후 로그인을 하기 위한 메서드, 아직 미구현
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
                            //login.js 에서 처리된 값(쿼리에 대한 결과 값)을 받아오는 부분
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

    //회원가입 버튼 클릭시 사용자 name, tokenid를 DB에 저장시켜주기 위한 메서드
    private void sendData() {
        sendButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                TokenId tokenid = new TokenId("");
                tokenid.setName(editTextName.getText().toString());
                tokenid.setToken(FirebaseInstanceId.getInstance().getToken());
                //DB에 insert를 위하여 post request(networkservice 인터페이스 내의 newTokenId) 날리는 부분
                Call<TokenId> tokenIdCall = networkService.newTokenId(tokenid);
                tokenIdCall.enqueue(new Callback<TokenId>() {
                    @Override
                    public void onResponse(Response<TokenId> response, Retrofit retrofit) {
                        if (response.isSuccess()) {
                            Toast.makeText(getApplicationContext(), "회원가입 성공", Toast.LENGTH_LONG).show();

                        } else {
                            int statusCode = response.code();
                            //503 에러에 대한 처리, 중복된 tokenid insert 시 503에러 발생
                           if(statusCode==503){
                                Toast.makeText(getApplicationContext(), "이미 등록된 token 값입니다", Toast.LENGTH_LONG).show();
                            }
                            Log.i("MyTag", "응답코드: " + statusCode);
                        }
                    }

                    @Override
                    public void onFailure(Throwable t) {
                        //서버에 연결되지 않을 때 처리
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
    //application controller 초기화 및 ip, port 설정을 위한 메서드
    private void initNetwork(){
        ApplicationController application = ApplicationController.getInstance();
        application.buildNetworkService(ip, port);
        networkService = ApplicationController.getInstance().getNetworkService();
        Log.i("로그", "연결성공");

    }
}
