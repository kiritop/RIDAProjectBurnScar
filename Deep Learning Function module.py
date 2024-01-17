# Related third party imports.
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns

def model_training_module(X_train, y_train, X_test, y_test, epoch, batchsize):

    # Create the model
    global model
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])

    # Compile the model
    model.compile(loss='binary_crossentropy',
                  optimizer='adam',
                  metrics=['accuracy'])

    # Train the model
    global history
    history = model.fit(X_train, y_train, epochs=epoch, batch_size=batchsize, 
                        validation_data=(X_test, y_test))

    # Return relevant outputs (e.g., trained model, history object)
    return model, history  # Adjust return values as needed

def loss_accuracy_plot(loss, val_loss, accuracy, val_accuracy):
    # Plot the loss
    plt.plot(loss, label='Training Loss')
    plt.plot(val_loss, label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.show()
    print('Maximum Training Loss ', round(np.max(loss)*100,2), '%')
    print('Maximum Validation Loss ', round(np.max(val_loss)*100,2), '%')
    print('Minimum Training Loss ', round(np.min(loss)*100,2), '%')
    print('Minimum Validation Loss ', round(np.min(val_loss)*100,2), '%')

    # Plot the accuracy
    plt.plot(accuracy, label='Training Accuracy')
    plt.plot(val_accuracy, label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.show()
    print('Maximum Training Accuracy ', round(np.max(accuracy)*100,2), '%')
    print('Maximum Validation Accuracy ', round(np.max(val_accuracy)*100,2), '%')
    print('Minimum Training Accuracy ', round(np.min(accuracy)*100,2), '%')
    print('Minimum Validation Accuracy ', round(np.min(val_accuracy)*100,2), '%')

def main():
    # Local File import
    data_path = "CSV/Sentinel_2.csv"
    df = pd.read_csv(data_path)

    # Seperate Label from Dataframe
    X = df.iloc[:, :-1].values
    y = df.iloc[:, -1].values

    # Spilt Train & Test Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state=42)

    # Declare hyperparameter values
    epoch = 92
    batchsize = 20


    # Call model funtion module
    model, history = model_training_module(X_train, y_train, X_test, y_test, epoch, batchsize) # Model fit

    # Extract loss and accuracy from training and validation sets
    loss = history.history['loss']
    val_loss = history.history['val_loss']
    accuracy = history.history['accuracy']
    val_accuracy = history.history['val_accuracy']

    # Call Graph plot module
    loss_accuracy_plot(loss, val_loss, accuracy, val_accuracy)

# For running in a script mode
if __name__ == "__main__":
    main()