import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';
import Form from './Form';

function Gallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:1000/files');
      const { files } = response.data;
      setImages(files);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteImage = async (filename) => {
    try {
      await axios.delete(`http://localhost:1000/file/${filename}`);
      fetchImages(); // Fetch updated images after deletion
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUploadSuccess = () => {
    fetchImages(); // Fetch updated images after upload
  };

  return (
    <div className="container">
          <Form onUploadSuccess={handleUploadSuccess} /> {/* Pass the callback function */}


      <div className="row">
        {images.map((image) => (
          <div key={image._id} className="col-md-4 mb-4">
            <img
              src={`http://localhost:1000/stream/${image.filename}`}
              alt={image.metadata.originalname}
              className="image"
            />
            <button
              onClick={() => deleteImage(image.filename)}
              className="btn btn-danger mt-2"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
