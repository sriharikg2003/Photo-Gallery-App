import React, { useState } from 'react';
import axios from 'axios';

function Form({ onUploadSuccess }) {
  const [uploadBy, setUploadBy] = useState('');
  const [files, setFiles] = useState([]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('uploadBy', uploadBy);
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await axios.post('http://localhost:1000/upload', formData);
      setUploadBy("")
      console.log('Success');
      onUploadSuccess(); // Trigger re-fetch of images

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    setFiles(selectedFiles);
  };

  return (
    <div className="row">
      <div className="col-md-6 m-auto">
        <h1 className="text-center display-4 my-4">My Gallery</h1>
        <form encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="uploadBy">Title</label>
            <input
            
              required
              type="text"
              name="uploadBy"
              id="uploadBy"
              className="form-control"
              value={uploadBy}
              onChange={(e) => setUploadBy(e.target.value)}
            />
          </div>
          <div className="custom-file mb-3">
            <input
              type="file"
              required
              name="files"
              id="files"
              className="custom-file-input"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="files" className="custom-file-label">
              Choose File
            </label>
          </div>
          <button type="button" onClick={handleUpload} className="btn btn-primary btn-block">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Form;
