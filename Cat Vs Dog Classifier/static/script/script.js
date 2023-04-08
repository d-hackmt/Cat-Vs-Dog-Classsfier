function previewImage(event) {
  const reader = new FileReader();
  const image = document.getElementById('image-preview');
  const error = document.getElementById('image-error');

  reader.onload = function () {
    image.src = reader.result;
  };

  const file = event.target.files[0];
  const fileSize = file.size / 1024 / 1024; // in MB

  if (fileSize > 5) {
    error.innerHTML = 'File size must be less than 5 MB';
    image.src = '';
    return;
  } else {
    error.innerHTML = '';
  }

  if (file) {
    reader.readAsDataURL(file);
  } else {
    image.src = '';
  }
}

function validateForm() {
  const imageUpload = document.getElementById('image-upload');
  const error = document.getElementById('image-error');

  if (imageUpload.value === '') {
    error.innerHTML = 'Please choose an image';
    return false;
  } else {
    error.innerHTML = '';
    return true;
  }
}

function b64encode(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
      if (encoded.length % 4 > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = error => reject(error);
  });
}

const form = document.getElementById('prediction-form');
form.addEventListener('submit', async event => {
  event.preventDefault();

  const imageUpload = document.getElementById('image-upload');
  const image = imageUpload.files[0];

  const isValid = validateForm();
  if (!isValid) {
    return;
  }

  const predictedClass = document.getElementById('prediction');

  try {
    const encodedImage = await b64encode(image);
    const response = await fetch('/predict_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'image_data': encodedImage
      })
    });
    const data = await response.json();
    predictedClass.innerHTML = `<p> WOW! This is such an amazing picture of a ${data.predicted_class} <i class="fas fa-heart"></i></p>`;
  } catch (error) {
    console.error(error);
  }
});
