import React, { useState, useEffect } from 'react';
import api from '../services/api';

function StudentDashboard() {
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingProjectId, setUploadingProjectId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, subRes, evalRes, facRes] = await Promise.all([
        api.get('/projects'),
        api.get('/submissions/student'),
        api.get('/evaluations/student'),
        api.get('/auth/faculties')
      ]);
      setProjects(projRes.data);
      setSubmissions(subRes.data);
      setEvaluations(evalRes.data);
      setFaculties(facRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (projectId) => {
    if (!selectedFile) return alert('Please select a file');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('projectId', projectId);

    setUploadingProjectId(projectId);
    try {
      await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Project submitted successfully!');
      fetchData();
    } catch (error) {
      setMessage('Upload failed. Try again.');
    }
    setUploadingProjectId(null);
    setSelectedFile(null);
  };

  const getSubmissionStatus = (projectId) => {
    const sub = submissions.find(s => s.projectId._id === projectId);
    return sub ? sub.status : 'Not Submitted';
  };

  const getEvaluation = (projectId) => {
    const sub = submissions.find(s => s.projectId._id === projectId);
    if (!sub) return null;
    return evaluations.find(e => e.submissionId._id === sub._id);
  };

  const renderProjectCard = (project) => {
    const status = getSubmissionStatus(project._id);
    const evaluation = getEvaluation(project._id);
    const isPastDeadline = new Date(project.deadline) < new Date();
    
    // Status display logic
    let displayStatus = status;
    let badgeClass = 'pending';
    
    if (status === 'submitted' || status === 'evaluated') {
      badgeClass = 'success';
    } else if (status === 'late') {
      badgeClass = 'warning'; // or use 'error' if warning class isn't defined
      displayStatus = 'Late Submission';
    } else if (status === 'Not Submitted' && isPastDeadline) {
      displayStatus = 'Missed (Late Allowed)';
      badgeClass = 'error';
    }

    return (
      <div key={project._id} className="card project-card">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="meta">
          <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
          <span className={`badge ${badgeClass}`}>
            {displayStatus}
          </span>
        </div>
        
        {status !== 'evaluated' && (
          <div className="upload-section mt-2">
            <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
            <button 
              onClick={() => handleUpload(project._id)} 
              disabled={uploadingProjectId === project._id}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.5rem' }}
            >
              {uploadingProjectId === project._id ? 'Uploading...' : 
                (status !== 'Not Submitted' ? 'Update Submission' : (isPastDeadline ? 'Submit Late' : 'Upload'))}
            </button>
          </div>
        )}

        {evaluation && (
          <div className="evaluation-box glass">
            <h4>Feedback:</h4>
            <p>{evaluation.feedback}</p>
            <strong>Marks: <span className="grade">{evaluation.grade}/100</span></strong>
          </div>
        )}
      </div>
    );
  };

  const [activeSection, setActiveSection] = useState('pending');

  const filteredProjects = selectedFaculty 
    ? projects.filter(p => p.createdBy && p.createdBy._id === selectedFaculty) 
    : projects;

  const submittedProjects = filteredProjects.filter(p => getSubmissionStatus(p._id) !== 'Not Submitted');
  const notSubmittedProjects = filteredProjects.filter(p => getSubmissionStatus(p._id) === 'Not Submitted' && new Date(p.deadline) >= new Date());
  const missedProjects = filteredProjects.filter(p => getSubmissionStatus(p._id) === 'Not Submitted' && new Date(p.deadline) < new Date());

  return (
    <div className="container dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="title" style={{ marginBottom: 0 }}>Student Dashboard</h1>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '200px' }}>
            <select 
              value={selectedFaculty} 
              onChange={(e) => setSelectedFaculty(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', width: '100%' }}
            >
              <option value="">All Faculties</option>
              {faculties.map(faculty => (
                <option key={faculty._id} value={faculty._id}>{faculty.name}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: '200px' }}>
            <select 
              value={activeSection} 
              onChange={(e) => setActiveSection(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', width: '100%' }}
            >
              <option value="pending">Pending Submissions ({notSubmittedProjects.length})</option>
              <option value="submitted">Submitted Projects ({submittedProjects.length})</option>
              <option value="missed">Missed Deadlines ({missedProjects.length})</option>
            </select>
          </div>
        </div>
      </div>

      {message && <div className="alert success">{message}</div>}

      <div>
        {filteredProjects.length === 0 ? (
          <div className="card glass">
            <p className="text-gray text-center">No projects available at the moment.</p>
          </div>
        ) : (
          <>
            {activeSection === 'pending' && (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>Pending Submissions</h2>
                <div className="grid">
                  {notSubmittedProjects.length > 0 ? notSubmittedProjects.map(renderProjectCard) : <p className="text-gray">No pending projects.</p>}
                </div>
              </div>
            )}
            {activeSection === 'submitted' && (
              <div>
                <h2 style={{ marginBottom: '1rem' }}>Submitted Projects</h2>
                <div className="grid">
                  {submittedProjects.length > 0 ? submittedProjects.map(renderProjectCard) : <p className="text-gray">No submitted projects.</p>}
                </div>
              </div>
            )}
            {activeSection === 'missed' && (
              <div>
                <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Missed Deadlines</h2>
                <div className="grid">
                  {missedProjects.length > 0 ? missedProjects.map(renderProjectCard) : <p className="text-gray">No missed deadlines.</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
