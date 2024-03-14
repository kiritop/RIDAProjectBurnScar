# Related third party imports.
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
from sklearn.preprocessing import MinMaxScaler
from sklearn import metrics
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold, KFold, cross_val_predict
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier
from lightgbm import LGBMClassifier

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
    DF_CLASS_1 = df.query("Label == 1")
    DF_CLASS_0 = df.query("Label == 0").sample(n=len(DF_CLASS_1), replace=False, random_state=random_state)
    DF_SET = pd.concat([DF_CLASS_0, DF_CLASS_1])
    DF_SET = DF_SET.sample(len(DF_CLASS_0) + len(DF_CLASS_1))
    DF_SET = DF_SET.reset_index(drop=True)

    # Drop Label Column from Dataset
    LABEL = DF_SET[['Label']]
    df = DF_SET.drop(columns=['Label'])

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
        
    # Remove specified columns from feature data
    #if drop_columns is None:
        #drop_columns = [9, 10, 11, 12]  # Default columns to drop
        
    df_rename.drop(df_rename.columns[drop_columns], axis=1, inplace=True)
    df_rename = pd.concat([df_rename, LABEL], axis=1, sort=False)
    print(df_rename)

    return df_rename, LABEL

def knn(X, Y, cv, cv_test_scores, std_test_scores):
    """
    Performs K-Nearest Neighbors (KNN) classification and finds the optimal K value.

    Args:
        X (numpy.ndarray): Feature data.
        Y (numpy.ndarray): Target variable.
        cv (object): Cross-validation object (e.g., StratifiedKFold, KFold).
        cv_test_scores (list): List to store cross-validation scores for testing.
        std_test_scores (list): List to store standard deviations of cross-validation scores for testing.

    Returns:
        tuple: A tuple containing:
            - knn_model (KNeighborsClassifier): Trained KNN model with the optimal K value.
            - optimal_k (int): Optimal K value based on cross-validation.
    """
    # Find the optimal K value
    k_range = list(range(1, 11))
    score_cv = []
    std_cv = []

    for k in k_range:
        knn = KNeighborsClassifier(n_neighbors=k, metric='euclidean')
        score = cross_val_score(knn, X, Y, cv=cv)
        score_cv.append(score.mean())
        std_cv.append(score.std())

    plt.plot(k_range, score_cv, 'y', dashes=[6, 2], label="Mean of CV accuracy",
             color='blue', linestyle='dashed', marker='o', markerfacecolor='red', markersize='5')
    plt.legend(bbox_to_anchor=(1.05, 1), loc=2, borderaxespad=0.)
    plt.xlabel('Optimal K Value for KNN')
    plt.ylabel('Accuracy Rate')
    plt.title('Accuracy Rates for each K (CV-Train-Validation)')
    plt.show()

    _index = score_cv.index(np.amax(score_cv))
    optimal_k = _index + 1
    print('KNN Train Result')
    print('Optimal K Value is ', optimal_k, ' with CV\'s score ', round(score_cv[_index] * 100, 2), ' %')
    print('>Standard deviation ', round(std_cv[_index], 9))
    print('>Best CV\'s score ', round(np.amax(score_cv) * 100, 2), ' %')
    print('>Average CV\'s score ', round((sum(score_cv) / len(score_cv)) * 100, 2), ' %')
    print('>Worst CV\'s score ', round(np.amin(score_cv) * 100, 2), ' %')

    # Train with the optimal K value
    knn_model = KNeighborsClassifier(n_neighbors=optimal_k, metric='euclidean')
    knn_model.fit(X, Y)
    scores_cv = cross_val_score(knn_model, X, Y, cv=cv)
    print(f"Cross validation score: {round(scores_cv.mean() * 100, 2)} %")
    print(f"Standard deviation: {round(scores_cv.std(), 9)}")

    cv_test_scores[0] = round(scores_cv.mean() * 100, 3)
    std_test_scores[0] = round(scores_cv.std() * 100, 3)

    print('KNN CV score each Fold')
    indx = 1
    for _ in scores_cv:
        if _ == np.amax(scores_cv):
            print(f'\033[91m Accuracy in fold {indx} : {round(_ * 100, 2)} %\033[90m')
        else:
            print(f'Accuracy in fold {indx} : {round(_ * 100, 2)} %')
        indx += 1

    return knn_model

def random_forest(X, Y, cv, random_forest_estimator_num, random_state=42, 
                  cv_test_scores=None, std_test_scores=None):
    """
    Performs Random Forest classification and finds the optimal max_depth value.

    Args:
        X (numpy.ndarray): Feature data.
        Y (numpy.ndarray): Target variable.
        cv (object): Cross-validation object (e.g., StratifiedKFold, KFold).
        random_forest_estimator_num (int, optional): Number of trees in the Random Forest. Default is 100.
        random_state (int, optional): Random state for reproducibility. Default is 42.
        cv_test_scores (list, optional): List to store cross-validation scores for testing. Default is None.
        std_test_scores (list, optional): List to store standard deviations of cross-validation scores for testing. Default is None.

    Returns:
        tuple: A tuple containing:
            - rdf_model (RandomForestClassifier): Trained Random Forest model with the optimal max_depth value.
            - optimal_max_depth (int): Optimal max_depth value based on cross-validation.
    """
    # Find the optimal max_depth value
    max_depth_range = list(range(2, 11))
    scores_cv = []
    std_cv = []

    for max_depth in max_depth_range:
        rdf = RandomForestClassifier(n_estimators=random_forest_estimator_num, max_depth=max_depth, random_state=random_state)
        scores = cross_val_score(rdf, X, Y, cv=cv)
        scores_cv.append(scores.mean())
        std_cv.append(scores.std())

    plt.plot(max_depth_range, scores_cv, 'y', dashes=[6, 2], label="Prediction accuracy",
             color='blue', linestyle='dashed', marker='o', markerfacecolor='red', markersize='5')
    plt.legend(bbox_to_anchor=(1.05, 1), loc=2, borderaxespad=0.)
    plt.xlabel('Optimal Max-depth for Random Forest')
    plt.ylabel('Accuracy Rate')
    plt.title('Accuracy Rates for each Max-depth')
    plt.show()

    _index = scores_cv.index(np.amax(scores_cv))
    optimal_max_depth = _index + 2
    print('Random Forest Train Result')
    print('Optimal Max-depth is ', optimal_max_depth, ' with CV\'s score ', round(scores_cv[_index] * 100, 2), ' %')
    print('>Standard deviation ', round(std_cv[_index], 9))
    print('>Best CV\'s score ', round(np.amax(scores_cv) * 100, 2), ' %')
    print('>Average CV\'s score ', round((sum(scores_cv) / len(scores_cv)) * 100, 2), ' %')
    print('>Worst CV\'s score ', round(np.amin(scores_cv) * 100, 2), ' %')

    # Train with the optimal max_depth
    rdf_model = RandomForestClassifier(n_estimators=random_forest_estimator_num, max_depth=optimal_max_depth, random_state=random_state)
    rdf_model.fit(X, Y)
    scores_cv = cross_val_score(rdf_model, X, Y, cv=cv)
    print(f"Cross validation score: {round(scores_cv.mean() * 100, 2)} %")
    print(f"Standard deviation: {round(scores_cv.std(), 9)}")

    if cv_test_scores is not None and std_test_scores is not None:
        cv_test_scores[1] = round(scores_cv.mean() * 100, 3)
        std_test_scores[1] = round(scores_cv.std() * 100, 3)

    print('Random Forest CV score each Fold')
    indx = 1
    for _ in scores_cv:
        if _ == np.amax(scores_cv):
            print(f'\033[91m Accuracy in fold {indx} : {round(_ * 100, 2)} %\033[90m')
        else:
            print(f'Accuracy in fold {indx} : {round(_ * 100, 2)} %')
        indx += 1

    return rdf_model

def light_gbm(X, Y, cv, lgbm_learning_rate=0.05, lgbm_epocs=100, random_state=42, 
              cv_test_scores=None, std_test_scores=None):
    """
    Performs LightGBM classification and finds the optimal max_depth value.

    Args:
        X (numpy.ndarray): Feature data.
        Y (numpy.ndarray): Target variable.
        cv (int): Number of cross-validation folds.
        lgbm_learning_rate (float, optional): Learning rate for LightGBM. Default is 0.05.
        random_state (int, optional): Random state for reproducibility. Default is 42.
        cv_test_scores (list, optional): List to store cross-validation scores for testing. Default is None.
        std_test_scores (list, optional): List to store standard deviations of cross-validation scores for testing. Default is None.

    Returns:
        tuple: A tuple containing:
            - lgb_model (LGBMClassifier): Trained LightGBM model with the optimal max_depth value.
            - optimal_max_depth (int): Optimal max_depth value based on cross-validation.
    """
    params = {}
    params['verbose'] = -1
    params['learning_rate'] = lgbm_learning_rate
    params['boosting_type'] = 'gbdt'
    params['objective'] = 'binary'
    params['metric'] = 'auc'
    params['max_depth'] = 100
    params['random_state'] = random_state

    lgb = LGBMClassifier(**params)

    # Find the optimal max_depth value
    max_depth_range = list(range(2, 30))
    scores_cv = []
    std_cv = []

    for max_depth in max_depth_range:
        skf = StratifiedKFold(n_splits=cv, shuffle=True, random_state=random_state)
        params['max_depth'] = max_depth
        lst_accu_stratified = []

        for train_index, test_index in skf.split(X, Y):
            x_train_fold, x_test_fold = X[train_index], X[test_index]
            y_train_fold, y_test_fold = Y[train_index], Y[test_index]
            clf = lgb.fit(x_train_fold, y_train_fold)
            lgb_predictions = clf.predict_proba(x_test_fold)
            lgb_pred = np.argmax(lgb_predictions, axis=1)
            lst_accu_stratified.append(accuracy_score(y_test_fold, lgb_pred))

        scores_cv.append(sum(lst_accu_stratified) / len(lst_accu_stratified))
        std_cv.append(np.std(np.array(lst_accu_stratified)))

    plt.plot(max_depth_range, scores_cv, 'y', dashes=[6, 2], label="Prediction accuracy",
             color='blue', linestyle='dashed', marker='o', markerfacecolor='red', markersize='5')
    plt.legend(bbox_to_anchor=(1.05, 1), loc=2, borderaxespad=0.)
    plt.xlabel('Optimal Max-depth for Light GBM')
    plt.ylabel('Accuracy Rate')
    plt.title('Accuracy Rates for each Max-depth')
    plt.show()

    _index = scores_cv.index(np.amax(scores_cv))
    optimal_max_depth = _index + 2
    print('Light GBM Train Result')
    print('Optimal Max-depth is ', optimal_max_depth, ' with CV\'s score ', round(scores_cv[_index] * 100, 2), ' %')
    print('>Standard deviation ', round(std_cv[_index], 9))
    print('>Best CV\'s score ', round(np.amax(scores_cv) * 100, 2), ' %')
    print('>Average CV\'s score ', round((sum(scores_cv) / len(scores_cv)) * 100, 2), ' %')
    print('>Worst CV\'s score ', round(np.amin(scores_cv) * 100, 2), ' %')

    # Train with the optimal max_depth
    scores_cv = []
    params['max_depth'] = optimal_max_depth
    skf = StratifiedKFold(n_splits=cv, shuffle=True, random_state=random_state)

    for train_index, test_index in skf.split(X, Y):
        x_train_fold, x_test_fold = X[train_index], X[test_index]
        y_train_fold, y_test_fold = Y[train_index], Y[test_index]
        clf = lgb.fit(x_train_fold, y_train_fold)
        lgb_predictions = clf.predict_proba(x_test_fold)
        lgb_pred = np.argmax(lgb_predictions, axis=1)
        scores_cv.append(accuracy_score(y_test_fold, lgb_pred))

    print(f"Cross validation score: {round((sum(scores_cv) / len(scores_cv)) * 100, 2)} %")
    print(f"Standard deviation: {round(np.std(np.array(scores_cv)), 9)}")

    if cv_test_scores is not None and std_test_scores is not None:
        cv_test_scores[2] = round((sum(scores_cv) / len(scores_cv)) * 100, 3)
        std_test_scores[2] = round(np.std(np.array(scores_cv)) * 100, 3)

    print('Light GBM CV score each Fold')
    indx = 1
    for _ in scores_cv:
        if _ == np.amax(scores_cv):
            print(f'\033[91m Accuracy in fold {indx} : {round(_ * 100, 2)} %\033[90m')
        else:
            print(f'Accuracy in fold {indx} : {round(_ * 100, 2)} %')
        indx += 1

    lgb_model = LGBMClassifier(**params)
    lgb_model.fit(X, Y)

    return lgb_model

def gaussian_naive_bayes(X, Y, cv, cv_test_scores=None, std_test_scores=None):
    """
    Performs Gaussian Naive Bayes classification and evaluates the cross-validation scores.

    Args:
        X (numpy.ndarray): Feature data.
        Y (numpy.ndarray): Target variable.
        cv (object): Cross-validation object (e.g., StratifiedKFold, KFold).
        cv_test_scores (list, optional): List to store cross-validation scores for testing. Default is None.
        std_test_scores (list, optional): List to store standard deviations of cross-validation scores for testing. Default is None.

    Returns:
        tuple: A tuple containing:
            - gnb_model (GaussianNB): Trained Gaussian Naive Bayes model.
            - scores_cv (list): List of cross-validation scores.
    """
    gnb_model = GaussianNB()
    gnb_model.fit(X, Y)
    scores_cv = cross_val_score(gnb_model, X, Y, cv=cv)

    print(f"Cross validation score: {round(scores_cv.mean() * 100, 2)} %")
    print(f"Standard deviation: {round(scores_cv.std(), 9)}")

    if cv_test_scores is not None and std_test_scores is not None:
        cv_test_scores[3] = round(scores_cv.mean() * 100, 3)
        std_test_scores[3] = round(scores_cv.std() * 100, 3)

    print('GNB CV score each Fold')
    indx = 1
    for _ in scores_cv:
        if _ == np.amax(scores_cv):
            print(f'\033[91m Accuracy in fold {indx} : {round(_ * 100, 2)} %\033[90m')
        else:
            print(f'Accuracy in fold {indx} : {round(_ * 100, 2)} %')
        indx += 1

    return gnb_model

def support_vector_machine(X, Y, cv, cv_test_scores=None, std_test_scores=None):
    """
    Performs Support Vector Machine (SVM) classification and finds the optimal C value.

    Args:
        X (numpy.ndarray): Feature data.
        Y (numpy.ndarray): Target variable.
        cv (object): Cross-validation object (e.g., StratifiedKFold, KFold).
        cv_test_scores (list, optional): List to store cross-validation scores for testing. Default is None.
        std_test_scores (list, optional): List to store standard deviations of cross-validation scores for testing. Default is None.

    Returns:
        tuple: A tuple containing:
            - svm_model (SVC): Trained SVM model with the optimal C value.
            - optimal_c (int): Optimal C value based on cross-validation.
    """
    # Find the optimal C value
    regularization_range = list(range(1, 11))
    scores_cv = []
    std_cv = []

    for c_value in regularization_range:
        svm = SVC(C=c_value, gamma='auto')
        scores = cross_val_score(svm, X, Y, cv=cv)
        scores_cv.append(scores.mean())
        std_cv.append(scores.std())

    plt.plot(regularization_range, scores_cv, 'y', dashes=[6, 2], label="Prediction accuracy",
             color='blue', linestyle='dashed', marker='o', markerfacecolor='red', markersize='5')
    plt.legend(bbox_to_anchor=(1.05, 1), loc=2, borderaxespad=0.)
    plt.xlabel('Optimal C value for SVM')
    plt.ylabel('Accuracy Rate')
    plt.title('Accuracy Rates for each C value')
    plt.show()

    _index = scores_cv.index(np.amax(scores_cv))
    optimal_c = _index + 1
    print('Optimal C value is ', optimal_c, ' with CV\'s score ', round(scores_cv[_index] * 100, 2), ' %')
    print('>Standard deviation ', round(std_cv[_index], 9))
    print('>Best CV\'s score ', round(np.amax(scores_cv) * 100, 2), ' %')
    print('>Average CV\'s score ', round((sum(scores_cv) / len(scores_cv)) * 100, 2), ' %')
    print('>Worst CV\'s score ', round(np.amin(scores_cv) * 100, 2), ' %')

    # Train with the optimal C value
    svm_model = SVC(C=optimal_c, gamma='auto')
    svm_model.fit(X, Y)
    scores_cv = cross_val_score(svm_model, X, Y, cv=cv)
    print(f"Cross validation score: {round(scores_cv.mean() * 100, 2)} %")
    print(f"Standard deviation: {round(scores_cv.std(), 9)}")

    if cv_test_scores is not None and std_test_scores is not None:
        cv_test_scores[4] = round(scores_cv.mean() * 100, 3)
        std_test_scores[4] = round(scores_cv.std() * 100, 3)

    print('SVM CV score each Fold')
    indx = 1
    for _ in scores_cv:
        if _ == np.amax(scores_cv):
            print(f'\033[91m Accuracy in fold {indx} : {round(_ * 100, 2)} %\033[90m')
        else:
            print(f'Accuracy in fold {indx} : {round(_ * 100, 2)} %')
        indx += 1

    return svm_model

def multi_layer_perceptron(X, Y, cv, cv_test_scores=None, std_test_scores=None):
    """
    Performs Multi-Layer Perceptron (MLP) classification and finds the optimal hidden layer size.

    Args:
        X (numpy.ndarray): Feature data.
        Y (numpy.ndarray): Target variable.
        cv (int): Number of cross-validation folds.
        cv_test_scores (list, optional): List to store cross-validation scores for testing. Default is None.
        std_test_scores (list, optional): List to store standard deviations of cross-validation scores for testing. Default is None.

    Returns:
        tuple: A tuple containing:
            - mlp_model (MLPClassifier): Trained MLP model with the optimal hidden layer size.
            - optimal_hidden_layer_size (int): Optimal hidden layer size based on cross-validation.
    """
    # Find the optimal hidden layer size
    hidden_layer_sizes = list(range(20, 31))
    accuracies = []

    for hidden_layer_size in hidden_layer_sizes:
        kfold = StratifiedKFold(n_splits=cv, shuffle=True, random_state=42)
        fold_accuracies = []

        for train_index, test_index in kfold.split(X, Y):
            X_train, X_test = X[train_index], X[test_index]
            y_train, y_test = Y[train_index], Y[test_index]

            # Create the neural network with the specified hidden layer size
            clf = MLPClassifier(hidden_layer_sizes=(hidden_layer_size,), activation='relu', max_iter=500, random_state=42)
            clf.fit(X_train, y_train)

            # Make predictions on the test set
            y_pred = clf.predict(X_test)

            # Calculate accuracy for the fold
            fold_accuracy = accuracy_score(y_test, y_pred)
            fold_accuracies.append(fold_accuracy)

        # Calculate mean accuracy across folds
        mean_accuracy = np.mean(fold_accuracies)
        accuracies.append(mean_accuracy)

    # Plot the accuracies for each hidden layer size
    plt.plot(hidden_layer_sizes, accuracies, 'y', dashes=[6, 2], label="Prediction accuracy",
             color='blue', linestyle='dashed', marker='o', markerfacecolor='red', markersize='5')
    plt.xlabel("Hidden Layer Size for MLP")
    plt.ylabel("Accuracy Rate")
    plt.title("Accuracy rate in each Hidden Layer Size")
    plt.show()

    _index = accuracies.index(np.amax(accuracies))
    optimal_hidden_layer_size = hidden_layer_sizes[_index]
    print("Optimal Hidden Layer Size:", optimal_hidden_layer_size, 'with CV\'s score', round(accuracies[_index] * 100, 2), ' %')
    print('>Standard deviation ', round(accuracies[_index], 9))
    print('>Best CV\'s score ', round(np.amax(accuracies) * 100, 2), ' %')
    print('>Average CV\'s score ', round((sum(accuracies) / len(accuracies)) * 100, 2), ' %')
    print('>Worst CV\'s score ', round(np.amin(accuracies) * 100, 2), ' %')

    # Train with the optimal hidden layer size
    mlp_model = MLPClassifier(hidden_layer_sizes=(optimal_hidden_layer_size,), activation='relu')
    mlp_model.fit(X, Y)
    scores_cv = cross_val_score(mlp_model, X, Y, cv=cv)
    print(f"Cross validation score: {round(scores_cv.mean() * 100, 2)} %")
    print(f"Standard deviation: {round(scores_cv.std(), 9)}")

    if cv_test_scores is not None and std_test_scores is not None:
        cv_test_scores[5] = round(scores_cv.mean() * 100, 3)
        std_test_scores[5] = round(scores_cv.std() * 100, 3)

    print('MLP CV score each Fold')
    indx = 1
    for _ in scores_cv:
        if _ == np.amax(scores_cv):
            print(f'\033[91m Accuracy in fold {indx} : {round(_ * 100, 2)} %\033[90m')
        else:
            print(f'Accuracy in fold {indx} : {round(_ * 100, 2)} %')
        indx += 1

    return mlp_model

def show_accuracy(cv_test_scores, std_test_scores):
    plt.figure(figsize=(10, 6))
    plt.title('Cross Validation Accuracy')
    no_of_models = len(cv_test_scores)
    model_labels = ['KNN', 'RandomForest', 'LightGBM', 'NB', 'SVM', 'MLP']
    plt.bar(range(no_of_models), cv_test_scores, color='lightblue', align='center', yerr=std_test_scores)
    plt.xticks(range(no_of_models), model_labels)
    plt.xlim([-1, no_of_models])
    for i, v in enumerate(cv_test_scores):
        plt.text(i+0.03, v+0.03, str(round(v,3)), color='blue', fontweight='bold')
    plt.tight_layout()
    plt.show()

def print_classification_report(model_defs, X, Y, cv):
    """
    Evaluates a list of classifiers and returns performance metrics.

    Args:
        classifiers: A list of scikit-learn classifier objects.
        classifier_names: A list of corresponding classifier names (strings).
        X: Training features.
        Y: Training labels.
        y_pred: cross validation predict.

    Returns:
        A list of dictionaries, each containing classifier name and performance metrics.
    """

    results = []

    for model_name, model in model_defs.items():
        y_pred = cross_val_predict(model, X, Y, cv=cv)
        report = classification_report(Y, y_pred, output_dict=True)
        cm = confusion_matrix(Y, y_pred)
        tn, fp, fn, tp = cm.ravel()
        #plot_cm(cm)
        results.append({
            'Classifier': model_name,
            'Model Definiton': model,
            'Class 0 - Precision': report['0']['precision'],
            'Class 0 - Recall': report['0']['recall'],
            'Class 0 - F1-Score': report['0']['f1-score'],
            'Class 1 - Precision': report['1']['precision'],
            'Class 1 - Recall': report['1']['recall'],
            'Class 1 - F1-Score': report['1']['f1-score'],
            'Average - Precision': report['macro avg']['precision'],
            'Average - Recall': report['macro avg']['recall'],
            'Average - F1-Score': report['macro avg']['f1-score'],
            'Accuracy': report['accuracy'],
            'Confusion Matrix': cm,
            'TN': tn,
            'FP': fp,
            'FN': fn,
            'TP': tp
    })
        
    result_df = pd.DataFrame(results)
    print(result_df)

    return result_df

def plot_confusion_matrix(model_defs, X, Y, cv):
    """
    Plot the confusion matrix for a given classifier.

    Args:
        model (object): Trained classifier object.
        X (numpy.ndarray): Test feature data.
        Y (numpy.ndarray): Test target variable.
        model_name (str): Name of the classifier.

    Returns:
        None
    """

    for model_name, model in model_defs.items():
        y_pred = cross_val_predict(model, X, Y, cv=cv)
        cm = confusion_matrix(Y, y_pred)
        plt.figure(figsize=(6, 4))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
        plt.title(f'Confusion Matrix - {model_name}')
        plt.xlabel('Predicted')
        plt.ylabel('True')
        plt.show()

def save_optimal_model(knn_model, rdf_model, lgb_model, gnb_model, svm_model, mlp_model, X, Y):
    """
    Save the optimal model based on the cross-validation scores.

    Args:
        cv_test_scores (list): List of cross-validation scores for each model.
        cv_optimal_k (int): Optimal K value for KNN.
        cv_rdf_optimal_max_depth (int): Optimal max_depth value for Random Forest.
        cv_optimal_c (int): Optimal C value for SVM.
        cv_lgbm_optimal_max_depth (int): Optimal max_depth value for LightGBM.
        best_hidden_layer_size (int): Optimal hidden layer size for MLP.
        X (numpy.ndarray): Feature data.
        Y (numpy.ndarray): Target variable.
        random_forest_estimator_num (int): Number of estimators for Random Forest.
        random_state (int): Random state for reproducibility.
        lgb (LGBMClassifier): LightGBM classifier object.
        params (dict): Parameters for LightGBM.
        lgbm_epochs (int): Number of epochs for LightGBM training.

    Returns:
        None
    """
    selected_model = []

    #cv_test_scores[0] == np.amax(cv_test_scores)
    knn = knn_model
    selected_model = knn.fit(X, Y)
    knn_filename_model = 'Optimal_Model_KNN.sav'
    pickle.dump(selected_model, open(knn_filename_model, 'wb'))

    #cv_test_scores[1] == np.amax(cv_test_scores)
    rdf = rdf_model
    selected_model = rdf.fit(X, Y)
    rdf_filename_model = 'Optimal_Model_RDF.sav'
    pickle.dump(selected_model, open(rdf_filename_model, 'wb'))
    
    #cv_test_scores[2] == np.amax(cv_test_scores)
    #params['max_depth']= cv_lgbm_optimal_max_depth
    selected_model = lgb_model.fit(X, Y)
    lgbm_filename_model = 'Optimal_Model_LGBM.sav'
    pickle.dump(selected_model, open(lgbm_filename_model, 'wb'))
    
    #cv_test_scores[3] == np.amax(cv_test_scores)
    gnb = gnb_model
    selected_model = gnb.fit(X, Y)
    gnb_filename_model = 'Optimal_Model_GNB.sav'
    pickle.dump(selected_model, open(gnb_filename_model, 'wb'))

    #cv_test_scores[4] == np.amax(cv_test_scores)
    svm = svm_model
    selected_model = svm.fit(X, Y)
    svm_filename_model = 'Optimal_Model_SVM.sav'
    pickle.dump(selected_model, open(svm_filename_model, 'wb'))
    
    #cv_test_scores[5] == np.amax(cv_test_scores)
    mlp = mlp_model
    selected_model = mlp.fit(X, Y)
    mlp_filename_model = 'Optimal_Model_MLP.sav'
    pickle.dump(selected_model, open(mlp_filename_model, 'wb'))

def main():

    # Using default values for random_state and drop_columns
    data_path = 'CSV\Forest Fire Dataframe.csv'
    random_state = 42
    df_rename, LABEL = preprocess(data_path, random_state)
    
    # Seperate Label from Dataframe
    X = df_rename.iloc[:, 0:len(df_rename.columns)-1].values ## Training Data
    Y = df_rename.iloc[:, len(df_rename.columns)-1].values ## Label

    # Create list to store score
    cv_test_scores = [0,1,2,3,4,5]
    std_test_scores = [0,1,2,3,4,5]

    # Cross Validation
    cv = 10

    # Call models Module
    ## KNN
    knn_model = knn(X, Y, cv, cv_test_scores, std_test_scores)

    ## Ramdom Forest
    random_forest_estimator_num=100
    rdf_model = random_forest(X, Y, cv, random_forest_estimator_num=random_forest_estimator_num, 
                              cv_test_scores=cv_test_scores, std_test_scores=std_test_scores)

    ## Light GBM
    params = {}  # Define params dictionary for LightGBM
    lgbm_epochs = 100
    lgb_model = light_gbm(X, Y, cv, cv_test_scores=cv_test_scores, 
                          std_test_scores=std_test_scores)

    ## GNB
    gnb_model = gaussian_naive_bayes(X, Y, cv, cv_test_scores=cv_test_scores, 
                                     std_test_scores=std_test_scores)

    ## SVM
    svm_model = support_vector_machine(X, Y, cv, cv_test_scores=cv_test_scores, 
                                       std_test_scores=std_test_scores)

    ## MLP
    mlp_model = multi_layer_perceptron(X, Y, cv, cv_test_scores=cv_test_scores, 
                                       std_test_scores=std_test_scores)

    model_defs = {
       "KNN": knn_model,
       "Random Forest": rdf_model,
       "Light GBM": lgb_model,
        "Gaussian Naive Bayes": gnb_model,
        "Support Vector Machine": svm_model,
        "Multi-Layer Perceptron": mlp_model
    } ## Dictionary for store Models name and Models Definitions

    # Show Accuracy
    show_accuracy(cv_test_scores, std_test_scores)

    # Classification Report
    print_classification_report(model_defs, X, Y, cv)

    ## Confusion Matrix
    plot_confusion_matrix(model_defs, X, Y, cv)

    ## Export model with pickle
    save_optimal_model(knn_model, rdf_model, lgb_model, gnb_model, svm_model, mlp_model, X, Y)
    
# For running in a script mode
if __name__ == "__main__":
    main()