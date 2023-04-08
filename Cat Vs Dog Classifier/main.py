from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
import cv2
import base64

app = Flask(__name__)

# Load the saved TensorFlow model
model = tf.saved_model.load('C:/Users/djadh/Desktop/DL/files/Saved Models')

# Define a function to preprocess the image before making a prediction
def preprocess_image(image):
    image = cv2.resize(image, (224, 224))
    image = image.astype("float32") / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.route('/')
def index():
    predicted_class = None
    return render_template('index.html', predicted_class=predicted_class)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/predict_image', methods=['POST'])  # Changed endpoint to '/predict'
@app.route('/predict_image', methods=['POST'])
def predict_image():
    # Get the file from the POST request
    file = request.files['image']
    
    # Read the image
    image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
    
    # Preprocess the image
    preprocessed_image = preprocess_image(image)
    
    # Make a prediction
    prediction = model(preprocessed_image)
    prediction = np.argmax(prediction, axis=1)
    predicted_class = 'dog' if prediction[0] == 1 else 'cat'
    
    # Pass the uploaded image file to the HTML template
    _, img_encoded = cv2.imencode('.jpg', image)
    image_data = base64.b64encode(img_encoded).decode('utf-8')
    
    # Render the same template with the predicted class and image data as arguments
    return render_template('index.html', predicted_class=predicted_class, image_data=image_data)

if __name__ == '__main__':
    app.run(debug=True)
