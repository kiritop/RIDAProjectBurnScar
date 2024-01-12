# Related third party imports.
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import lightgbm as lgb
from lightgbm import LGBMClassifier
from sklearn import metrics
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold, KFold
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier

def k_nearest_neighbor(x_train, y_train, x_test, y_test):
    """ Perform K Nearest Neighbor Classification with K value is 10 """

    # Model Parameters
    neighbors = 10
    metric='euclidean'

    # Initialize KNN classifier
    global knn
    knn = KNeighborsClassifier(n_neighbors=neighbors, metric=metric)

    # Training with KNN model
    knn.fit(x_train, y_train)

    # Prediction on Test Dataset
    knn_pred = knn.predict(x_test)

    # Calculate Accuracy
    knn_accuracy = accuracy_score(y_test, knn_pred)

    # Calculating precision, recall, and F1-score
    report = classification_report(y_test, knn_pred, output_dict=True)

    # Convert result to Table format with Pandas
    knn_report = []
    knn_report.append({
        'Classifier': 'KNN',
        'Precision': report['macro avg']['precision'],
        'Recall': report['macro avg']['recall'],
        'F1-Score': report['macro avg']['f1-score']
    })

    knn_report_df = pd.DataFrame(knn_report)

    # Generate Confusion Matrix
    knn_cm = confusion_matrix(y_test, knn_pred)

    plt.figure(figsize=(6, 4))
    sns.heatmap(knn_cm, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title(f'Confusion Matrix - K Nearest Neighbor (KNN)')
    plt.xlabel('Actual')
    plt.ylabel('Predicted')
    plt.show()

    return knn, knn_accuracy, knn_report_df

def random_forest(x_train, y_train, x_test, y_test):
    """ Perform Random Forest Classification with Max-Depth is 10, 
    Number of Tree is 100 and Random seed is 42 """

    # Model Parameters
    tree_number = 100
    random_seed = 42
    max_depth_value = 10

    # Initialize Random Forest
    global rdf
    rdf = RandomForestClassifier(n_estimators=tree_number, max_depth=max_depth_value, random_state=random_seed)

    # Training with Random Forest model
    rdf.fit(x_train, y_train)

    # Prediction on Test Dataset
    rdf_pred = rdf.predict(x_test)

    # Calculate Accuracy
    rdf_accuracy = accuracy_score(y_test, rdf_pred)

    # Calculating precision, recall, and F1-score
    report = classification_report(y_test, rdf_pred, output_dict=True)

    # Convert result to Table format with Pandas
    rdf_report = []
    rdf_report.append({
        'Classifier': 'Random Forest',
        'Precision': report['macro avg']['precision'],
        'Recall': report['macro avg']['recall'],
        'F1-Score': report['macro avg']['f1-score']
    })

    rdf_report_df = pd.DataFrame(rdf_report)

    # Generate Confusion Matrix
    rdf_cm = confusion_matrix(y_test, rdf_pred)

    plt.figure(figsize=(6, 4))
    sns.heatmap(rdf_cm, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title(f'Confusion Matrix - Random Forest')
    plt.xlabel('Actual')
    plt.ylabel('Predicted')
    plt.show()

    return rdf, rdf_accuracy, rdf_report_df

def train_lightgbm(x_train, y_train, x_test, y_test):
    ''' Deploy Light Gradient Boosting Machine(Light GBM) 
    contain with max-depth value is 100 and Learning rate is 0.05 '''
    
    # Model Parameters
    global params
    params = {
        'boosting_type': 'gbdt',
        'objective': 'binary',  # Change this based on your problem (e.g., 'multiclass', 'regression', etc.)
        'metric': 'binary_error',  # Change this metric as needed
        'max_depth': 15,
        'learning_rate': 0.05,
        'random_state': 42,
        'verbose': -1
    }

    # Implement a LightGBM classifier and fit it to the training data
    global light_gbm
    light_gbm = lgb.LGBMClassifier(**params)

    # Training with LightGBM classifier
    light_gbm.fit(x_train, y_train)

    # Prediction on Test Dataset
    light_gbm_pred = light_gbm.predict(x_test)

    # Calculate Accuracy
    light_gbm_accuracy = accuracy_score(y_test, light_gbm_pred)

    # Calculating precision, recall, and F1-score
    report = classification_report(y_test, light_gbm_pred, output_dict=True)

    # Convert result to Table format with Pandas
    light_gbm_report = []
    light_gbm_report.append({
        'Classifier': 'Light GBM',
        'Precision': report['macro avg']['precision'],
        'Recall': report['macro avg']['recall'],
        'F1-Score': report['macro avg']['f1-score']
    })

    light_gbm_report_df = pd.DataFrame(light_gbm_report)

    # Generate Confusion Matrix
    light_gbm_cm = confusion_matrix(y_test, light_gbm_pred)

    plt.figure(figsize=(6, 4))
    sns.heatmap(light_gbm_cm, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title(f'Confusion Matrix - Light GBM')
    plt.xlabel('Actual')
    plt.ylabel('Predicted')
    plt.show()

    return light_gbm, light_gbm_accuracy, light_gbm_report_df

def support_vector_machine(x_train, y_train, x_test, y_test):
    """ This module to perform Support Vector Machine 
    Classifier with C value is 10 """

    # Model Parameter
    c = 10
    gamma = 'auto'

    # Initialize Support Vector Machine (SVM)
    global svm
    svm=SVC(C=c, gamma=gamma)

    # Training with Support Vector Machine classifier
    svm.fit(x_train, y_train)

    # Prediction on Test Dataset
    svm_pred = svm.predict(x_test)

    # Calculate Accuracy
    svm_accuracy = accuracy_score(y_test, svm_pred)

    # Calculating precision, recall, and F1-score
    report = classification_report(y_test, svm_pred, output_dict=True)

    # Convert result to Table format with Pandas
    svm_report = []
    svm_report.append({
        'Classifier': 'Support Vector Machine',
        'Precision': report['macro avg']['precision'],
        'Recall': report['macro avg']['recall'],
        'F1-Score': report['macro avg']['f1-score']
    })

    svm_report_df = pd.DataFrame(svm_report)

    # Generate Confusion Matrix
    svm_cm = confusion_matrix(y_test, svm_pred)

    plt.figure(figsize=(6, 4))
    sns.heatmap(svm_cm, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title(f'Confusion Matrix - Support Vector Machine (SVM)')
    plt.xlabel('Actual')
    plt.ylabel('Predicted')
    plt.show()

    return svm, svm_accuracy, svm_report_df

def gaussian_nb(x_train, y_train, x_test, y_test):
    """ This module will be deploy Gaussian Naive Bayes 
    Classification with Probability """

    # Initialize model
    global gnb
    gnb = GaussianNB()

    # Traning with train dataset
    gnb.fit(x_train, y_train)

    # Perform Prediction with Test Data
    gnb_pred = gnb.predict(x_test)

    # Calculate Accuracy
    gnb_accuracy = accuracy_score(y_test, gnb_pred)

    # Calculating precision, recall, and F1-score
    report = classification_report(y_test, gnb_pred, output_dict=True)

    # Convert result to Table format with Pandas
    gnb_report = []
    gnb_report.append({
        'Classifier': 'Gaussian Naive Bayes',
        'Precision': report['macro avg']['precision'],
        'Recall': report['macro avg']['recall'],
        'F1-Score': report['macro avg']['f1-score']
    })

    gnb_report_df = pd.DataFrame(gnb_report)

    # Generate Confusion Matrix
    gnb_cm = confusion_matrix(y_test, gnb_pred)

    plt.figure(figsize=(6, 4))
    sns.heatmap(gnb_cm, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title(f'Confusion Matrix - Gaussian Naive Bayes')
    plt.xlabel('Actual')
    plt.ylabel('Predicted')
    plt.show()

    return gnb, gnb_accuracy, gnb_report_df

def multi_layer_perceptron(x_train, y_train, x_test, y_test):
    """ This module will be deploy Multi-Layer Perceptron (MLP) with 
    number of neurons is 30 in hidden layer """

    # Model Parameter
    hidden_layer_sizes = 30
    activation = 'relu'
    solver = 'adam'
    learning_rate = 'constant'

    # Initialize model
    global mlp
    mlp = MLPClassifier(hidden_layer_sizes=hidden_layer_sizes,
                        activation=activation,
                        solver=solver,
                        learning_rate=learning_rate)
    
    # Traning with train dataset
    mlp.fit(x_train, y_train)

    # Perform Prediction with Test Data
    mlp_pred = mlp.predict(x_test)

    # Calculate Accuracy
    mlp_accuracy = accuracy_score(y_test, mlp_pred)

    # Calculate Accuracy
    gnb_accuracy = accuracy_score(y_test, mlp_pred)

    # Calculating precision, recall, and F1-score
    report = classification_report(y_test, mlp_pred, output_dict=True)

    # Convert result to Table format with Pandas
    mlp_report = []
    mlp_report.append({
        'Classifier': 'Multi-Layer Perceptron (MLP)',
        'Precision': report['macro avg']['precision'],
        'Recall': report['macro avg']['recall'],
        'F1-Score': report['macro avg']['f1-score']
    })

    mlp_report_df = pd.DataFrame(mlp_report)

    # Generate Confusion Matrix
    mlp_cm = confusion_matrix(y_test, mlp_pred)

    plt.figure(figsize=(6, 4))
    sns.heatmap(mlp_cm, annot=True, fmt='d', cmap='Blues', cbar=False)
    plt.title(f'Confusion Matrix - Multi-Layer Perceptron (MLP)')
    plt.xlabel('Actual')
    plt.ylabel('Predicted')
    plt.show()

    return mlp, mlp_accuracy, mlp_report_df

def main():
    # Local File import
    df = pd.read_csv('Sentinel_2.csv')

    # Seperate Label from Dataframe
    x = df.iloc[:, 0:len(df.columns)-1].values ## Training Data
    y = df.iloc[:, len(df.columns)-1].values ## Label

    # Spilt Train & Test Data
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size = 0.2)

    # Call function and display accuracy result
    knn_trained, knn_accuracy, knn_report_df = k_nearest_neighbor(x_train, y_train, x_test, y_test)
    print('KNN Accuracy : ', knn_accuracy)
    print('\n', knn_report_df)

    rdf_trained, rdf_accuracy, rdf_report_df = random_forest(x_train, y_train, x_test, y_test)
    print(rdf_accuracy)
    print('\n', rdf_report_df)

    lightgbm_trained, light_gbm_accuracy, light_gbm_report_df = train_lightgbm(x_train, y_train, x_test, y_test)
    print('\nLight GBM Accuracy : ', light_gbm_accuracy)
    print('\n', light_gbm_report_df)

    svm_trained, svm_accuracy, svm_report_df = support_vector_machine(x_train, y_train, x_test, y_test)
    print('\nSVM Accuracy : ', svm_accuracy)
    print('\n', svm_report_df)

    gnb_trained, gnb_accuracy, gnb_report_df = gaussian_nb(x_train, y_train, x_test, y_test)
    print('\nGaussian Naive Bayes : ', gnb_accuracy)
    print('\n', gnb_report_df)

    mlp_trained, mlp_accuracy, mlp_report_df = multi_layer_perceptron(x_train, y_train, x_test, y_test)
    print('\nMulti-Layer Perceptrons Accuracy : ', mlp_accuracy)
    print('\n', mlp_report_df)

# For running in a script mode
if __name__ == "__main__":
    main()