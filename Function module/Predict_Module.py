# Related third party imports.
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
from sklearn.preprocessing import MinMaxScaler
from sklearn import metrics
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

def preprocess(data_path, random_state, drop_columns = [9, 10, 11, 12]):
    """
    Preprocess the data for classification tasks.

    Args:
        data_path (str): Path to the CSV file containing the data.
        random_state (int, optional): Random state for reproducibility. Default is 1.
        drop_columns (list, optional): List of column indices to drop from the feature data.
            If not provided, the function will drop columns with indices 9, 10, 11, and 12.

    Returns:
        tuple: A tuple containing:
            - df_nor (pandas.DataFrame): Normalized feature data.
            - LABEL (pandas.DataFrame): Target variable.
    """
    df = pd.read_csv(data_path)

    # Down Sampling
    df_class_1 = df.query("Label == 1")
    df_class_0 = df.query("Label == 0").sample(n=len(df_class_1), replace=False, random_state=random_state)
    df_set = pd.concat([df_class_0, df_class_1])
    df_set = df_set.sample(len(df_class_0) + len(df_class_1))
    df_set = df_set.reset_index(drop=True)


    # Drop Label Column from Dataset
    label = df_set[['Label']]
    df = df_set.drop(columns=['Label'])

    # Normalize data
    df_nor = MinMaxScaler().fit_transform(df)  # MinMax Scaler
    df_nor = pd.DataFrame(df_nor, columns=df.columns)  # Convert Normalize data as Dataframe

    # Rename Features
    Available_Features = ['Band_3_Post',
                          'Band_4_Post',
                          'Band_5_Post',
                          'Band_6_Post',
                          'Band_7_Post',
                          'Band_8_Post',
                          'Band_8A_Post',
                          'Band_9_Post',
                          'Band_12_Post',
                          'PostNBR_data',
                          'NDVI',
                          'NDWI',
                          'dNBR']

    df_rename = df_nor.rename(columns=dict(zip(df_nor.columns, Available_Features)))  # Efficient renaming
        
    df_rename.drop(df_rename.columns[drop_columns], axis=1, inplace=True)
    print(df_rename)

    return df_rename, label

def load_models(models_to_load):
    """
    Load pre-trained models from pickle files.

    Args:
        models_to_load (list): List of file names for the pre-trained models.

    Returns:
        dict: A dictionary containing the loaded models, with file names as keys and loaded models as values.
    """
    model_defs = {}
    
    for filename in models_to_load:
        loaded_model = pickle.load(open(filename, 'rb'))
        print(loaded_model)
        model_defs[filename] = loaded_model
    
    return model_defs

def make_predictions(model_defs, df_rename):
    """
    Make predictions using the loaded models.

    Args:
        model_defs (dict): A dictionary containing the loaded models.
        df_rename (pandas.DataFrame): The input data for making predictions.

    Returns:
        list: A list of NumPy arrays containing the predictions from each model.
    """
    y_preds = []
    
    for filename, loaded_model in model_defs.items():
        y_pred = loaded_model.predict(df_rename)
        print(f"Predictions from {filename}:")
        print(y_pred)
        y_preds.append(y_pred)
    
    return y_preds

def classification_reports(model_defs, y_preds, y_true):
    """
    Evaluate the performance of the loaded models and save the results to a CSV file.

    Args:
        model_defs (dict): A dictionary containing the loaded models.
        y_preds (list): A list of NumPy arrays containing the predictions from each model.
        y_true (pandas.Series): The ground truth labels.

    Returns:
        None
    """

    results = []

    for filename, y_pred in zip(model_defs.keys(), y_preds):
        model_def = model_defs[filename]
        report = classification_report(y_true, y_pred, output_dict=True)
        cm = metrics.confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = cm.ravel()

        results.append({
            'Classifier': filename,
            'Model Definition': model_def,
            'Class 0 - Precision': report['0']['precision'],
            'Class 0 - Recall': report['0']['recall'],
            'Class 0 - F1-Score': report['0']['f1-score'],
            'Class 1 - Precision': report['1']['precision'],
            'Class 1 - Recall': report['1']['recall'],
            'Class 1 - F1-Score': report['1']['f1-score'],
            'Average - Precision': report['macro avg']['precision'],
            'Average - Recall': report['macro avg']['recall'],
            'Average - F1-Score': report['macro avg']['f1-score'],
            'Accuracy': report['accuracy'] * 100,
            'Confusion Matrix': cm,
            'TN': tn,
            'FP': fp,
            'FN': fn,
            'TP': tp
        })

    results_df = pd.DataFrame(results)
    print(results_df)

def confusion_matrix(model_defs, y_preds, y_true):
    for filename, y_pred in zip(model_defs.keys(), y_preds):
        # Confusion Matrix
        cm = metrics.confusion_matrix(y_true, y_pred)
        name = filename.replace('.sav', '')  # Extract model name from filename
        plt.figure(figsize=(6, 4))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
        print(f'\nTrue Positives(TP) - {name} = ', cm[0, 0])
        print(f'\nTrue Negatives(TN) - {name} = ', cm[1, 1])
        print(f'\nFalse Positives(FP) - {name} = ', cm[0, 1])
        print(f'\nFalse Negatives(FN) - {name} = ', cm[1, 0])
        plt.title(f'Confusion Matrix - {name}')
        plt.xlabel('Predicted')
        plt.ylabel('True')
        plt.show()

def export_predictions_as_csv(df_rename, y_preds, models_to_load, filename):
    """
    Concatenate the predicted results with the original dataframe and export it as a CSV file.

    Args:
        df_rename (pandas.DataFrame): The original dataframe.
        y_preds (list): The list of predicted results.
        models_to_load (list): List of file names for the pre-trained models.
        filename (str): The name of the CSV file to export.
    """
    # Concatenate the predicted results with the original dataframe
    df_with_predictions = df_rename.copy()

    # Iterate over the list of predictions and model names
    for y_pred, model_name in zip(y_preds, models_to_load):
        model_type = model_name.split('_')[2]
        column_name = f"{model_type}_Label"
        df_with_predictions[column_name] = y_pred

    # Export the dataframe as a CSV file
    df_with_predictions.to_csv(filename, index=False)

def main():

    # Using default values for random_state and drop_columns
    data_path = 'CSV\Mae Ai\MaeAI_T47QNC_20230419T034531_part_195.csv'
    random_state = 42

    # drop_columns = [5, 8, 11]
    df_rename, label = preprocess(data_path, random_state)
    y_true = label # Ground Truth
    print(y_true)

    # Loaded models and Make Prediction
    models_to_load = [
        'Optimal_Model_KNN.sav',
        'Optimal_Model_RDF.sav',
        'Optimal_Model_LGBM.sav',
        'Optimal_Model_SVM.sav',
        'Optimal_Model_GNB.sav',
        'Optimal_Model_MLP.sav'
    ]

    model_defs = load_models(models_to_load)
    y_preds = make_predictions(model_defs, df_rename)

    # Evaluate Model
    classification_reports(model_defs, y_preds, y_true)
    confusion_matrix(model_defs, y_preds, y_true) ## Confusion matrix

    # Export Predict result as CSV and SHAPE File
    export_predictions_as_csv(df_rename, y_preds, models_to_load, 'Burn_Area_Predictions.csv')

# For running in a script mode
if __name__ == "__main__":
    main()