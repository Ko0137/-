package com.lira.assistant;

import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class LiraFragment extends Fragment {
    private RecyclerView rvChat;
    private ChatAdapter chatAdapter;
    private List<ChatMessage> messageList;
    private EditText etMessage;
    private ImageButton btnSend;
    private FloatingActionButton fabMic;
    private TextView tvStatus;

    private DatabaseHelper dbHelper;
    private SpeechRecognizer speechRecognizer;
    private CommandProcessor commandProcessor;
    private boolean isListening = false;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_lira, container, false);

        rvChat = view.findViewById(R.id.rv_chat);
        etMessage = view.findViewById(R.id.et_message);
        btnSend = view.findViewById(R.id.btn_send);
        fabMic = view.findViewById(R.id.fab_mic);
        tvStatus = view.findViewById(R.id.tv_status);

        dbHelper = new DatabaseHelper(requireContext());
        messageList = dbHelper.getChatMessages();
        chatAdapter = new ChatAdapter(messageList);

        rvChat.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvChat.setAdapter(chatAdapter);
        if (!messageList.isEmpty()) {
            rvChat.scrollToPosition(messageList.size() - 1);
        }

        if (getActivity() instanceof MainActivity) {
            MainActivity mainActivity = (MainActivity) getActivity();
            commandProcessor = new CommandProcessor(requireContext(), mainActivity.getFlashlightHelper(), mainActivity.getAppLauncherHelper());
        } else {
            commandProcessor = new CommandProcessor(requireContext(), new FlashlightHelper(requireContext()), new AppLauncherHelper(requireContext()));
        }

        btnSend.setOnClickListener(v -> sendMessage());
        fabMic.setOnClickListener(v -> toggleListening());

        return view;
    }

    private void sendMessage() {
        String text = etMessage.getText().toString().trim();
        if (text.isEmpty()) return;

        etMessage.setText("");
        addMessage(text, true);

        String reply = commandProcessor.processCommand(text);
        addMessage(reply, false);
    }

    private void addMessage(String text, boolean isUser) {
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
        String time = sdf.format(new Date());

        ChatMessage msg = new ChatMessage(String.valueOf(System.currentTimeMillis()), text, isUser, time);
        messageList.add(msg);
        dbHelper.addChatMessage(msg);

        chatAdapter.notifyItemInserted(messageList.size() - 1);
        rvChat.scrollToPosition(messageList.size() - 1);
    }

    private void initSpeechRecognizer() {
        try {
            if (getContext() != null && SpeechRecognizer.isRecognitionAvailable(requireContext())) {
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(requireContext());
                speechRecognizer.setRecognitionListener(new RecognitionListener() {
                    @Override
                    public void onReadyForSpeech(Bundle params) {
                        if (tvStatus != null) tvStatus.setText("🎙️ Слушаю вас...");
                    }

                    @Override
                    public void onBeginningOfSpeech() {}

                    @Override
                    public void onRmsChanged(float rmsdB) {}

                    @Override
                    public void onBufferReceived(byte[] buffer) {}

                    @Override
                    public void onEndOfSpeech() {
                        if (tvStatus != null) tvStatus.setText("🟢 L.I.R.A.: Обработка...");
                    }

                    @Override
                    public void onError(int error) {
                        isListening = false;
                        if (tvStatus != null) tvStatus.setText("🟢 L.I.R.A.: Нажмите микрофон");
                    }

                    @Override
                    public void onResults(Bundle results) {
                        isListening = false;
                        if (tvStatus != null) tvStatus.setText("🟢 L.I.R.A.: Готова к командам");
                        if (results != null) {
                            ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                String spokenText = matches.get(0);
                                addMessage(spokenText, true);
                                String reply = commandProcessor.processCommand(spokenText);
                                addMessage(reply, false);
                            }
                        }
                    }

                    @Override
                    public void onPartialResults(Bundle partialResults) {}

                    @Override
                    public void onEvent(int eventType, Bundle params) {}
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void toggleListening() {
        android.content.SharedPreferences prefs = requireContext().getSharedPreferences("lira_settings", android.content.Context.MODE_PRIVATE);
        boolean isMicEnabled = prefs.getBoolean("pref_mic", false);

        if (!isMicEnabled) {
            Toast.makeText(requireContext(), "Включите переключатель 'Запись голоса' в Настройках ⚙️", Toast.LENGTH_LONG).show();
            if (getActivity() != null) {
                new SettingsDialog(getActivity()).show();
            }
            return;
        }

        if (ContextCompat.checkSelfPermission(requireContext(), android.Manifest.permission.RECORD_AUDIO) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{android.Manifest.permission.RECORD_AUDIO}, 100);
            Toast.makeText(requireContext(), "Разрешите микрофон в появившемся окне", Toast.LENGTH_SHORT).show();
            return;
        }

        if (speechRecognizer == null) {
            initSpeechRecognizer();
            if (speechRecognizer == null) {
                Toast.makeText(requireContext(), "Голосовой ввод недоступен на данном устройстве", Toast.LENGTH_SHORT).show();
                return;
            }
        }

        try {
            if (!isListening) {
                isListening = true;
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ru-RU");
                speechRecognizer.startListening(intent);
            } else {
                isListening = false;
                speechRecognizer.stopListening();
                if (tvStatus != null) tvStatus.setText("🟢 L.I.R.A.: Готова к командам");
            }
        } catch (Exception e) {
            isListening = false;
            if (tvStatus != null) tvStatus.setText("🟢 L.I.R.A.: Готова к командам");
            Toast.makeText(requireContext(), "Ошибка запуска микрофона", Toast.LENGTH_SHORT).show();
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }
    }
}
