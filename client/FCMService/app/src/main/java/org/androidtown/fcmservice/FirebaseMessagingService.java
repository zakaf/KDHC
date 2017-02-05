package org.androidtown.fcmservice;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.PowerManager;
import android.support.v4.app.NotificationCompat;

import com.google.firebase.messaging.RemoteMessage;

/**
 * Created by Hosan on 2016-11-29.
 * Firebase Cloud Messaging 서비스 사용 시 푸시 메시지를 받았을 때 처리에 대한 클래스
 */

public class FirebaseMessagingService extends com.google.firebase.messaging.FirebaseMessagingService {
    private static final String TAG = "FirebaseMsgService";

    // push 를 받았을 때의 처리를 다루는 부분
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        //push 온 json 에서 title부분과 message부분에 대한 데이터를 가져와서 sendPushNotification 메서드에서 처리
        sendPushNotification(remoteMessage.getData().get("title"), remoteMessage.getData().get("message"));
    }

    //Push 받은 정보(json)에 대한 notification 처리하는 method,
    /*
        현재의 경우 서버에서
        { data: {
        title : '...',
        message: '...'
        }
        와 같은 json 형식을 push로 보냄,

     */
    private void sendPushNotification(String title, String message) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent,
                PendingIntent.FLAG_ONE_SHOT);

        //push가 왔을 때 notification 을 설정해주는 부분
        Uri defaultSoundUri= RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this)
                .setSmallIcon(R.drawable.noti).setLargeIcon(BitmapFactory.decodeResource(getResources(),R.mipmap.ic_launcher) )  //notification 왼쪽에 뜨는 아이콘 설정
                .setContentTitle(title) //notification의 타이틀 설정
               .setContentText(message) //notification의 text 설정
                .setAutoCancel(true)
               // .setVibrate(new long[] { 1000, 1000, 1000, 1000, 1000 })
                .setSound(defaultSoundUri).setLights(000000255,500,2000) //notification 에 대한 소리 설정(진동모드면 진동으로)
                .setContentIntent(pendingIntent);

        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        //스크린이 꺼져있거나 단말기 잠겨있을 때도 push를 받기위한 처리를 하는 부분
        PowerManager pm = (PowerManager) this.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakelock = pm.newWakeLock(PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "TAG");
        wakelock.acquire(5000);

        notificationManager.notify(0 /* ID of notification */, notificationBuilder.build());
    }




}
