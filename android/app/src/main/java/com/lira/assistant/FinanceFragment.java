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
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class FinanceFragment extends Fragment {
    private TextView tvBalance, tvIncome, tvExpense;
    private Button btnAddTransaction;
    private RecyclerView rvTransactions;

    private DatabaseHelper dbHelper;
    private TransactionsAdapter adapter;
    private List<TransactionItem> transactionList;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_finance, container, false);

        tvBalance = view.findViewById(R.id.tv_balance);
        tvIncome = view.findViewById(R.id.tv_income);
        tvExpense = view.findViewById(R.id.tv_expense);
        btnAddTransaction = view.findViewById(R.id.btn_add_transaction);
        rvTransactions = view.findViewById(R.id.rv_transactions);

        dbHelper = new DatabaseHelper(requireContext());
        transactionList = dbHelper.getTransactions();

        adapter = new TransactionsAdapter(transactionList);
        rvTransactions.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvTransactions.setAdapter(adapter);

        updateTotals();

        btnAddTransaction.setOnClickListener(v -> showAddTransactionDialog());

        return view;
    }

    private void updateTotals() {
        double totalInc = 0;
        double totalExp = 0;

        for (TransactionItem item : transactionList) {
            if (item.isIncome()) {
                totalInc += item.getAmount();
            } else {
                totalExp += item.getAmount();
            }
        }

        double balance = totalInc - totalExp;

        tvBalance.setText(String.format(Locale.getDefault(), "%.0f ₽", balance));
        tvIncome.setText(String.format(Locale.getDefault(), "+%.0f ₽", totalInc));
        tvExpense.setText(String.format(Locale.getDefault(), "-%.0f ₽", totalExp));
    }

    private void showAddTransactionDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        builder.setTitle("Новая Операция");

        final EditText etTitle = new EditText(requireContext());
        etTitle.setHint("Название (например: Продукты)");
        final EditText etAmount = new EditText(requireContext());
        etAmount.setHint("Сумма (₽)");
        etAmount.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);

        android.widget.LinearLayout layout = new android.widget.LinearLayout(requireContext());
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setPadding(32, 16, 32, 16);
        layout.addView(etTitle);
        layout.addView(etAmount);

        builder.setView(layout);

        builder.setPositiveButton("Доход (+)", (dialog, which) -> {
            addOp(etTitle.getText().toString(), etAmount.getText().toString(), true);
        });
        builder.setNegativeButton("Расход (-)", (dialog, which) -> {
            addOp(etTitle.getText().toString(), etAmount.getText().toString(), false);
        });
        builder.show();
    }

    private void addOp(String title, String amountStr, boolean isIncome) {
        if (title == null || title.trim().isEmpty() || amountStr == null || amountStr.trim().isEmpty()) return;
        try {
            double amount = Double.parseDouble(amountStr.trim());
            SimpleDateFormat sdf = new SimpleDateFormat("d MMMM", Locale.getDefault());
            String date = sdf.format(new Date());

            dbHelper.addTransaction(title.trim(), isIncome ? "Доходы" : "Расходы", amount, isIncome, date);
            transactionList.clear();
            transactionList.addAll(dbHelper.getTransactions());
            adapter.notifyDataSetChanged();
            updateTotals();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
