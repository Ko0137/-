package com.lira.assistant;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class HabitsAdapter extends RecyclerView.Adapter<HabitsAdapter.ViewHolder> {
    private final List<HabitItem> habits;
    private final OnHabitToggleListener listener;

    public interface OnHabitToggleListener {
        void onToggle(HabitItem habit, boolean isChecked);
    }

    public HabitsAdapter(List<HabitItem> habits, OnHabitToggleListener listener) {
        this.habits = habits;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_habit, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        HabitItem habit = habits.get(position);
        holder.tvTitle.setText(habit.getTitle());
        holder.tvTarget.setText(habit.getTarget());
        holder.tvStreak.setText("🔥 " + habit.getStreak() + " дн.");
        holder.cbHabit.setChecked(habit.isCompleted());

        holder.cbHabit.setOnCheckedChangeListener((buttonView, isChecked) -> {
            habit.setCompleted(isChecked);
            listener.onToggle(habit, isChecked);
        });
    }

    @Override
    public int getItemCount() {
        return habits.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        CheckBox cbHabit;
        TextView tvTitle, tvTarget, tvStreak;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            cbHabit = itemView.findViewById(R.id.cb_habit);
            tvTitle = itemView.findViewById(R.id.tv_title);
            tvTarget = itemView.findViewById(R.id.tv_target);
            tvStreak = itemView.findViewById(R.id.tv_streak);
        }
    }
}
