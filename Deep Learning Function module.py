# Related third party imports.
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns

def find_best_batch_size_and_epoch(X_train, y_train, X_test, y_test, batch_sizes):
    """Trains a model with different batch sizes and returns the 
    best batch size based on validation accuracy.

    Args:
        X_train: Training features.
        y_train: Training labels.
        X_test: Testing features.
        y_test: Testing labels.
        batch_sizes: A list of batch sizes to try. Defaults to [16, 20, 32, 64, 128].

    Returns:
        A tuple containing:
            - The best batch size based on validation accuracy.
            - A dictionary containing training histories for each batch size.
            - The minimum training loss and its corresponding batch size.
            - The maximum training accuracy and its corresponding batch size.
            - The minimum validation loss and its corresponding batch size.
            - The maximum validation accuracy and its corresponding batch size.
    """
    global histories, min_loss_train, max_acc_train, min_loss_val, max_acc_val, min_train_batchsize, max_train_batchsize, min_loss_batchsize, max_acc_batchsize, model, history
    histories = {}
    min_loss_train = float('inf')
    max_acc_train = 0
    min_loss_val = float('inf')
    max_acc_val = 0
    min_train_batchsize = None
    max_train_batchsize = None
    min_loss_batchsize = None
    max_acc_batchsize = None

    for batch_size in batch_sizes:
        print(f"Training with batch size = {batch_size}")

        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')  # Change output activation based on task
        ])
        model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])

        history = model.fit(X_train, y_train, epochs=100, batch_size=batch_size, validation_data=(X_test, y_test))

        histories[batch_size] = history

        train_loss = round(np.min(history.history['loss']) * 100, 2)
        train_accuracy = round(np.max(history.history['accuracy']) * 100, 2)
        val_loss_min = round(np.min(history.history['val_loss']) * 100, 2)
        val_acc_max = round(np.max(history.history['val_accuracy']) * 100, 2)

        if train_loss < min_loss_train:
            min_loss_train = train_loss
            min_train_batchsize = batch_size
        if val_loss_min < min_loss_val:
            min_loss_val = val_loss_min
            min_loss_batchsize = batch_size
        if train_accuracy > max_acc_train:
            max_acc_train = train_accuracy
            max_train_batchsize = batch_size
        if val_acc_max > max_acc_val:
            max_acc_val = val_acc_max
            max_acc_batchsize = batch_size

    # Print identified batch sizes and Epoach
    print('\nBatch size with minimum training loss: ', min_train_batchsize)
    print('Minimum training loss: ', min_loss_train, '%')
    print('\nBatch size with minimum validation loss: ' , min_loss_batchsize)
    print('Minimum validation loss: ', min_loss_val)
    print('\nBatch size with training accuracy: ', max_train_batchsize)
    print('Maximum training accuracy: ', max_acc_train, '%')
    print('\nBatch size with maximum validation accuracy: ', max_acc_batchsize)
    print('Maximum validation accuracy: ', max_acc_val)

    # Plot graphs for each batch size
    for batch_size, history in histories.items():

        plt.figure(figsize=(12, 6))

        # Plot loss
        plt.subplot(1, 2, 1)
        plt.plot(history.history['loss'], label='Training Loss')
        plt.plot(history.history['val_loss'], label='Validation Loss')
        plt.title(f"Model Loss with Batch Size {batch_size}")
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()

        # Plot accuracy
        plt.subplot(1, 2, 2)
        plt.plot(history.history['accuracy'], label='Training Accuracy')
        plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
        plt.title(f"Model Accuracy with Batch Size {batch_size}")
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()

        plt.show()

    # Extract validation loss values
    val_loss_values = history.history['val_loss']

    # Find the epoch with the minimum validation loss
    global best_epoch
    best_epoch = val_loss_values.index(min(val_loss_values))

    # Plot the validation loss at Epoch
    print('Best number of epoch:', best_epoch) 
    plt.plot(val_loss_values, label='Validation Loss')
    plt.title('Validation Loss vs. Epoch')
    plt.xlabel('Epoch')
    plt.ylabel('Validation Loss')
    plt.axvline(x=best_epoch, color='r', linestyle='--', label='Best Epoch')
    plt.legend()
    plt.show()

    return model, history, max_acc_batchsize, histories, min_loss_train, min_train_batchsize, min_loss_val, min_loss_batchsize, max_acc_val, max_acc_batchsize, best_epoch


def model_training_module(X_train, y_train, X_test, y_test, epoch, batchsize):

    """Trains a model with different batch sizes and returns the 
       best batch size based on validation accuracy.

   Args:
       X_train: Training features.
       y_train: Training labels.
       X_test: Testing features.
       y_test: Testing labels.
       batch_sizes: A list of batch sizes to try. Defaults to [16, 20, 32, 64, 128].
    """

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

    # Call Best Batch size analysis module
    batch_sizes=[20, 32, 64, 128] # Delclare Batch size list in range 16, 20, 32, 64 and 128
    find_best_batch_size_and_epoch(X_train, y_train, X_test, y_test, batch_sizes)

    # Declare Model Training module hyperparameter values
    batch_size = max_acc_batchsize
    epoch = best_epoch

    # Call model training funtion module
    model, history = model_training_module(X_train, y_train, X_test, y_test, epoch, batch_size) # Model fit

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