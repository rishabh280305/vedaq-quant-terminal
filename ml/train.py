"""Cloud/local reproducible walk-forward baseline for user-supplied dated OHLCV CSV data.

No model metrics are checked into the repository. Run this against a lawfully obtained
CSV with date, open, high, low, close and volume columns; outputs include the split
metrics, feature names and serialized models used to produce them.
"""
import argparse, json
from pathlib import Path
import joblib, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.model_selection import TimeSeriesSplit

def features(frame: pd.DataFrame):
    data=frame.sort_values("date").copy()
    data["return_1"]=data.close.pct_change(); data["return_5"]=data.close.pct_change(5)
    data["volume_z"]=(data.volume-data.volume.rolling(20).mean())/data.volume.rolling(20).std()
    data["ma_gap"]=data.close/data.close.rolling(20).mean()-1
    data["target"]=(data.close.shift(-1)>data.close).astype(int)
    return data.dropna().iloc[:-1], ["return_1","return_5","volume_z","ma_gap"]

def main():
    parser=argparse.ArgumentParser(); parser.add_argument("csv"); parser.add_argument("--out",default="artifacts"); args=parser.parse_args()
    data,names=features(pd.read_csv(args.csv)); splitter=TimeSeriesSplit(n_splits=5); metrics=[]; models={}
    candidates={"random_forest":RandomForestClassifier(n_estimators=300,max_depth=6,random_state=42,class_weight="balanced")}
    try:
        from xgboost import XGBClassifier
        candidates["xgboost"]=XGBClassifier(n_estimators=250,max_depth=4,learning_rate=.04,subsample=.8,colsample_bytree=.8,random_state=42)
    except ImportError: pass
    for name,model in candidates.items():
        fold=[]
        for train_idx,test_idx in splitter.split(data):
            model.fit(data.iloc[train_idx][names],data.iloc[train_idx].target); prediction=model.predict(data.iloc[test_idx][names]); truth=data.iloc[test_idx].target
            fold.append({"accuracy":accuracy_score(truth,prediction),"precision":precision_score(truth,prediction,zero_division=0),"recall":recall_score(truth,prediction,zero_division=0)})
        model.fit(data[names],data.target); models[name]=model; metrics.append({"model":name,"folds":fold})
    target=Path(args.out); target.mkdir(parents=True,exist_ok=True)
    for name,model in models.items(): joblib.dump(model,target/f"{name}.joblib")
    (target/"metrics.json").write_text(json.dumps({"method":"expanding time-series splits","rows":len(data),"features":names,"models":metrics},indent=2))

if __name__=="__main__": main()
