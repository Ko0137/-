package com.lira.assistant;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class TransactionsAdapter extends RecyclerView.Adapter<TransactionsAdapter.ViewHolder> {
    private final List<TransactionItem> transactions;

    public TransactionsAdapter(List<TransactionItem> transactions) {
        this.transactions = transactions;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_transaction, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        TransactionItem item = transactions.get(position);
        holder.tvTitle.setText(item.getTitle());
        holder.tvDate.setText(item.getDate() + " • " + item.getCategory());

        if (item.isIncome()) {
            holder.tvAmount.setText("+" + (int)item.getAmount() + " ₽");
            holder.tvAmount.setTextColor(Color.parseColor("#00E676"));
            holder.tvIcon.setText("💰");
        } else {
            holder.tvAmount.setText("-" + (int)item.getAmount() + " ₽");
            holder.tvAmount.setTextColor(Color.parseColor("#FF1744"));
            holder.tvIcon.setText("💳");
        }
    }

    @Override
    public int getItemCount() {
        return transactions.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvIcon, tvTitle, tvDate, tvAmount;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvIcon = itemView.findViewById(R.id.tv_category_icon);
            tvTitle = itemView.findViewById(R.id.tv_title);
            tvDate = itemView.findViewById(R.id.tv_date);
            tvAmount = itemView.findViewById(R.id.tv_amount);
        }
    }
}
