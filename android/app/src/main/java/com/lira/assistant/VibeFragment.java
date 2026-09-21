package com.lira.assistant;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;
import java.util.Locale;

public class VibeFragment extends Fragment {
    private TextView tvStepCount, tvCalories, tvDistance;
    private Button btnResetPedometer, btnAddHabit;
    private RecyclerView rvHabits;

    private PedometerHelper pedometerHelper;
    private DatabaseHelper dbHelper;
    private HabitsAdapter habitsAdapter;
    private List<HabitItem> habitList;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vibe, container, false);

        tvStepCount = view.findViewById(R.id.tv_step_count);
        tvCalories = view.findViewById(R.id.tv_calories);
        tvDistance = view.findViewById(R.id.tv_distance);
        btnResetPedometer = view.findViewById(R.id.btn_reset_pedometer);
        btnAddHabit = view.findViewById(R.id.btn_add_habit);
        rvHabits = view.findViewById(R.id.rv_habits);

        dbHelper = new DatabaseHelper(requireContext());
        habitList = dbHelper.getHabits();

        habitsAdapter = new HabitsAdapter(habitList, (habit, isChecked) -> {
            dbHelper.updateHabitCompletion(habit.getId(), isChecked);
        });

        rvHabits.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvHabits.setAdapter(habitsAdapter);

        pedometerHelper = new PedometerHelper(requireContext());

        btnResetPedometer.setOnClickListener(v -> {
            if (pedometerHelper != null) pedometerHelper.resetSteps();
        });
        btnAddHabit.setOnClickListener(v -> showAddHabitDialog());

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        checkAndStartPedometer();
    }

    private void checkAndStartPedometer() {
        try {
            android.content.SharedPreferences prefs = requireContext().getSharedPreferences("lira_settings", android.content.Context.MODE_PRIVATE);
            boolean isEnabled = prefs.getBoolean("pref_pedometer", false);
            
            boolean hasPermission = true;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                hasPermission = androidx.core.content.ContextCompat.checkSelfPermission(requireContext(), android.Manifest.permission.ACTIVITY_RECOGNITION) == android.content.pm.PackageManager.PERMISSION_GRANTED;
            }

            if (isEnabled && hasPermission) {
                pedometerHelper.startListening((steps, calories, distanceKm) -> {
                    if (isAdded() && getActivity() != null) {
                        requireActivity().runOnUiThread(() -> {
                            try {
                                if (tvStepCount != null) tvStepCount.setText(String.valueOf(steps));
                                if (tvCalories != null) tvCalories.setText(String.format(Locale.getDefault(), "%.0f ккал", calories));
                                if (tvDistance != null) tvDistance.setText(String.format(Locale.getDefault(), "%.2f км", distanceKm));
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        });
                    }
                });
            } else {
                if (tvStepCount != null) tvStepCount.setText("Выкл (Настройки)");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void showAddHabitDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        builder.setTitle("Новая Привычка");

        final EditText etTitle = new EditText(requireContext());
        etTitle.setHint("Название (например: Прогулка 30 минут)");
        builder.setView(etTitle);

        builder.setPositiveButton("Добавить", (dialog, which) -> {
            String title = etTitle.getText().toString().trim();
            if (!title.isEmpty()) {
                dbHelper.addHabit(title, "Ежедневно");
                habitList.clear();
                habitList.addAll(dbHelper.getHabits());
                habitsAdapter.notifyDataSetChanged();
            }
        });
        builder.setNegativeButton("Отмена", null);
        builder.show();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (pedometerHelper != null) {
            pedometerHelper.stopListening();
        }
    }
}
