import sys
import json
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
from datetime import datetime

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (pd.Timestamp, datetime)):
            return obj.isoformat()
        return super().default(obj)

input_json = sys.stdin.read()
try:
    data = json.loads(input_json)
    if not isinstance(data, list) or not data:
        print(json.dumps({
            "label": "No data",
            "trend": "No data available for analysis.",
            "topCategory": "None",
            "suggestions": [],
            "anomalies": []
        }))
        sys.exit(0)
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)

df = pd.DataFrame(data)

if df.empty:
    print(json.dumps({"message": "No expenses found"}))
    sys.exit()

df['expense_date'] = pd.to_datetime(df['expense_date'], errors='coerce')

monthly_avg = df.groupby('user_id')['amount'].mean()
essentials = ['food', 'utilities', 'health']
ess_ratio = df[df['category'].isin(essentials)].groupby('user_id')['amount'].sum() / df.groupby('user_id')['amount'].sum()

user_id = df['user_id'].iloc[0]
user_label = "Balanced"
if monthly_avg[user_id] < 10000 and ess_ratio[user_id] > 0.7:
    user_label = "Saver"
elif monthly_avg[user_id] > 20000 and ess_ratio[user_id] < 0.5:
    user_label = "Spender"

df['month'] = df['expense_date'].dt.to_period('M')
monthly = df.groupby(['user_id', 'month'])['amount'].sum().reset_index()
user_data = monthly[monthly['user_id'] == user_id]
X_time = (user_data['month'].astype(str).astype('category').cat.codes).values.reshape(-1, 1)
y_time = user_data['amount'].values
model = LinearRegression().fit(X_time, y_time)
slope = model.coef_[0]
if slope > 0:
    trend = "Your expenses are increasing over time. Review your budget."
elif slope < 0:
    trend = "Your expenses are decreasing. Great job!"
else:
    trend = "Your expenses are stable."

clf = IsolationForest(random_state=42)
df['is_anomaly'] = clf.fit_predict(df[['amount']]) == -1
anomaly_cols = ['expense_date', 'amount', 'category']
if 'description' in df.columns:
    anomaly_cols.append('description')

anomalies = df[df['is_anomaly']][anomaly_cols].to_dict(orient='records')

top_category = df.groupby('category')['amount'].sum().idxmax()

suggestions = []

discretionary_categories = ['entertainment', 'gifts', 'miscellaneous', 'subscriptions', 'items']
if top_category in discretionary_categories:
    suggestions.append(f"You seem to spend a lot on {top_category}. Consider setting a monthly limit for this category.")

non_essential_ratio = 1 - ess_ratio[user_id]
if non_essential_ratio > 0.5:
    suggestions.append("Over half of your spending goes to non-essentials. Consider prioritizing savings or reducing discretionary purchases.")

if 'pay_method' in df.columns and df['pay_method'].notnull().any():
    pay_method_ratio = df['pay_method'].value_counts(normalize=True)
    if pay_method_ratio.get('cash', 0) > 0.6:
        suggestions.append("You mostly use cash. Switching to digital payments (UPI/Card) can help you track expenses more easily.")
    elif pay_method_ratio.get('upi', 0) > 0.7:
        suggestions.append("You're doing well using UPI — it's easier to track and manage compared to cash.")

if len(anomalies) > 2:
    suggestions.append(f"We noticed {len(anomalies)} irregular transactions. Review these to ensure they were intentional.")

daily_counts = df.groupby('expense_date').size()
if (daily_counts > 3).sum() > 5:
    suggestions.append("You're making frequent small purchases. Try combining or planning ahead to reduce impulse buys.")

if user_label == "Saver" and slope <= 0:
    suggestions.append("Excellent financial behavior! You're spending wisely and consistently.")
elif user_label == "Balanced" and slope <= 0:
    suggestions.append("Great job maintaining a stable budget across categories.")

if not suggestions:
    suggestions.append("You're doing well! Continue tracking and refining your spending habits.")

result = {
    "userId": user_id,
    "topCategory": top_category,
    "label": user_label,
    "trend": trend,
    "suggestions": suggestions,
    "anomalies": anomalies
}

print(json.dumps(result, cls=CustomJSONEncoder))
