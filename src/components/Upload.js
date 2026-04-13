import { useState } from 'react';
import { uploadFile } from '../services/api';

function Upload({ token, roles }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const isAdmin = roles.includes('ADMIN');

  if (!isAdmin) {
    return null;
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile || isUploading) {
      return;
    }

    setSuccessMessage('');
    setErrorMessage('');
    setIsUploading(true);

    try {
      await uploadFile(selectedFile, token);
      setSuccessMessage('File uploaded successfully.');
      setSelectedFile(null);
      event.target.reset();
    } catch (uploadError) {
      setErrorMessage('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="chat-card upload-card">
      <header className="chat-header">
        <p className="chat-eyebrow">Admin Upload</p>
        <h1>Upload document</h1>
        <p className="chat-subtitle">
          Add a document so it can be used by the assistant.
        </p>
      </header>

      <form className="upload-form" onSubmit={handleUpload}>
        <label className="form-field">
          <span>Select file</span>
          <input type="file" onChange={handleFileChange} required />
        </label>

        {selectedFile ? (
          <p className="upload-file-name">Selected: {selectedFile.name}</p>
        ) : null}

        {successMessage ? <p className="form-success">{successMessage}</p> : null}
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button
          className="primary-button"
          type="submit"
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </section>
  );
}

export default Upload;
