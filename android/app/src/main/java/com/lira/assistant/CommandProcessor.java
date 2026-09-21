package com.lira.assistant;

import android.content.Context;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CommandProcessor {
    private final Context context;
    private final FlashlightHelper flashlightHelper;
    private final AppLauncherHelper appLauncherHelper;
    private final DatabaseHelper dbHelper;

    public CommandProcessor(Context context, FlashlightHelper flashlightHelper, AppLauncherHelper appLauncherHelper) {
        this.context = context;
        this.flashlightHelper = flashlightHelper;
        this.appLauncherHelper = appLauncherHelper;
        this.dbHelper = new DatabaseHelper(context);
    }

    public String processCommand(String text) {
        String lower = text.toLowerCase().trim();

        // 1. Flashlight command
        if (lower.contains("фонарик") || lower.contains("включи свет") || lower.contains("выключи свет")) {
            boolean isOn = flashlightHelper.toggleFlashlight();
            return isOn ? "🔦 Фонарик успешно включен!" : "💡 Фонарик выключен.";
        }

        // 2. Add Transaction (Expense / Income)
        if (lower.contains("расход") || lower.contains("потратил") || lower.contains("добавь расход") || lower.contains("добавил расход")) {
            return parseAndAddTransaction(text, false);
        }
        if (lower.contains("доход") || lower.contains("получил") || lower.contains("добавь доход") || lower.contains("добавил доход")) {
            return parseAndAddTransaction(text, true);
        }

        // 3. Request Balance
        if (lower.equals("баланс") || lower.contains("какой баланс") || lower.contains("сколько денег") || lower.contains("счет")) {
            return getNativeBalanceSummary();
        }

        // 4. Add Habit
        if (lower.contains("добавь привычку") || lower.contains("новая привычка") || lower.startsWith("привычка ")) {
            return parseAndAddHabit(text);
        }

        // 5. Habits List
        if (lower.equals("привычки") || lower.contains("список привычек") || lower.contains("мои привычки")) {
            return getHabitsSummary();
        }

        // 6. App launch command
        if (lower.startsWith("открой") || lower.startsWith("запусти") || lower.contains("открыть") || lower.contains("запустить")) {
            String appQuery = lower.replace("открой", "").replace("запусти", "").replace("открыть", "").replace("запустить", "").trim();
            boolean success = appLauncherHelper.launchAppByName(appQuery);
            if (success) {
                return "🚀 Запускаю приложение «" + appQuery + "» на телефоне...";
            } else {
                return "⚠️ Не удалось найти приложение «" + appQuery + "» на вашем Pixel 8.";
            }
        }

        // 7. Time / Date command
        if (lower.contains("время") || lower.contains("который час") || lower.contains("дата")) {
            SimpleDateFormat sdf = new SimpleDateFormat("HH:mm, EEEE, d MMMM", new Locale("ru"));
            return "🕒 Сейчас: " + sdf.format(new Date());
        }

        // 8. Help / Commands list
        if (lower.contains("помощь") || lower.contains("справка") || lower.contains("умеешь")) {
            return "💡 Команды L.I.R.A.:\n" +
                   "• \"включи фонарик\" / \"выключи\"\n" +
                   "• \"открой [приложение]\"\n" +
                   "• \"время\" / \"дата\"\n" +
                   "• \"расход 150 на кофе\"\n" +
                   "• \"доход 50000 зарплата\"\n" +
                   "• \"баланс\"\n" +
                   "• \"добавь привычку бег\"\n" +
                   "• \"привычки\"";
        }

        // 9. Default Assistant Response
        return "⚡ L.I.R.A.: Принята команда «" + text + "». Все нативные модули Pixel 8 функционируют штатно!";
    }

    private String parseAndAddTransaction(String text, boolean isIncome) {
        try {
            Pattern pattern = Pattern.compile("\\d+");
            Matcher matcher = pattern.matcher(text);
            double amount = 0;
            if (matcher.find()) {
                amount = Double.parseDouble(matcher.group());
            } else {
                return "⚠️ Не удалось распознать сумму. Пример: \"расход 150 на кофе\"";
            }

            String title = text.replaceAll("(?i)(добавь|добавил|расход|доход|потратил|получил|рублей|рубли|руб|\\d+|на|за|от)", "").trim();
            if (title.isEmpty()) {
                title = isIncome ? "Прочие доходы" : "Прочие расходы";
            }

            SimpleDateFormat sdf = new SimpleDateFormat("d MMMM", Locale.getDefault());
            String date = sdf.format(new Date());

            dbHelper.addTransaction(title, isIncome ? "Доходы" : "Расходы", amount, isIncome, date);

            return "✅ Успешно записано:\n" + (isIncome ? "📈 Доход: +" : "📉 Расход: -") + String.format(Locale.getDefault(), "%.0f ₽", amount) + " (" + title + ")";
        } catch (Exception e) {
            return "⚠️ Ошибка парсинга финансов: " + e.getMessage();
        }
    }

    private String getNativeBalanceSummary() {
        try {
            List<TransactionItem> list = dbHelper.getTransactions();
            double totalInc = 0;
            double totalExp = 0;
            for (TransactionItem item : list) {
                if (item.isIncome()) {
                    totalInc += item.getAmount();
                } else {
                    totalExp += item.getAmount();
                }
            }
            double balance = totalInc - totalExp;
            return "📊 Финансовый статус L.I.R.A.:\n" +
                   "• Текущий Баланс: " + String.format(Locale.getDefault(), "%.0f ₽", balance) + "\n" +
                   "• Всего Доходов: +" + String.format(Locale.getDefault(), "%.0f ₽", totalInc) + "\n" +
                   "• Всего Расходов: -" + String.format(Locale.getDefault(), "%.0f ₽", totalExp);
        } catch (Exception e) {
            return "⚠️ Не удалось получить финансовую сводку.";
        }
    }

    private String parseAndAddHabit(String text) {
        try {
            String title = text.replaceAll("(?i)(добавь|привычку|привычка|добавь привычку|новую привычку|новая привычка)", "").trim();
            if (title.isEmpty()) {
                return "⚠️ Назовите привычку. Пример: \"добавь привычку пить воду\"";
            }

            dbHelper.addHabit(title, "Ежедневно");
            return "✅ Привычка «" + title + "» успешно добавлена в трекер!";
        } catch (Exception e) {
            return "⚠️ Ошибка добавления привычки: " + e.getMessage();
        }
    }

    private String getHabitsSummary() {
        try {
            List<HabitItem> list = dbHelper.getHabits();
            if (list.isEmpty()) {
                return "📝 У вас пока нет привычек. Скажите: \"добавь привычку пить воду\"";
            }

            StringBuilder sb = new StringBuilder("🗓️ Мои Привычки L.I.R.A.:\n");
            for (HabitItem item : list) {
                sb.append(item.isCompleted() ? "✅ " : "⬜ ")
                  .append(item.getTitle())
                  .append(" (серия: ")
                  .append(item.getStreak())
                  .append(" дн.)\n");
            }
            return sb.toString().trim();
        } catch (Exception e) {
            return "⚠️ Не удалось загрузить список привычек.";
        }
    }
}
