import React, { useState, useEffect } from 'react';
import api from '../services/api';

function FacultyDashboard() {
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  
  // Evaluation Modal State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projRes = await api.get('/projects');
      setProjects(projRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, { title, description, deadline });
        setEditingProject(null);
      } else {
        await api.post('/projects', { title, description, deadline });
      }
      setTitle(''); setDescription(''); setDeadline('');
      fetchData();
    } catch (error) {
      console.error('Failed to submit project');
    }
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description);
    // Format date for input type="date"
    setDeadline(new Date(project.deadline).toISOString().split('T')[0]);
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setDeadline('');
  };

  const viewSubmissions = async (projectId) => {
    try {
      const res = await api.get(`/submissions/project/${projectId}`);
      setSubmissions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const submitEvaluation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/evaluations', {
        submissionId: selectedSubmission._id,
        grade: Number(grade),
        feedback
      });
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      // Refresh submissions
      viewSubmissions(selectedSubmission.projectId._id);
    } catch (error) {
      console.error('Failed to evaluate');
    }
  };

  return (
    <div className="container dashboard">
      <h1 className="title">Faculty Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="card glass">
          <h2>{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
          <form onSubmit={handleSubmitProject}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
              {editingProject && (
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card projects-list">
          <h2>Your Projects</h2>
          <ul>
            {projects.map(project => (
              <li key={project._id} className="project-item" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>{project.title}</strong>
                  <p className="text-sm text-gray">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                  <p className="text-sm" style={{ marginTop: '0.25rem', color: 'var(--primary)' }}>
                    Submissions: <strong>{project.submissionCount || 0}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => viewSubmissions(project._id)} className="btn btn-secondary btn-sm">View Submissions</button>
                  <button onClick={() => handleEditClick(project)} className="btn btn-primary btn-sm">Edit</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {submissions.length > 0 && (
        <div className="card mt-2">
          <h2>Submissions</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>File</th>
                <th>Status</th>
                {submissions.some(sub => sub.status !== 'evaluated') && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub._id}>
                  <td>{sub.studentId.name}</td>
                  <td><a href={`http://localhost:5000/${sub.fileUrl}`} target="_blank" rel="noreferrer" className="link">View File</a></td>
                  <td><span className={`badge ${sub.status === 'evaluated' ? 'success' : 'pending'}`}>{sub.status}</span></td>
                  {submissions.some(s => s.status !== 'evaluated') && (
                    <td>
                      {sub.status !== 'evaluated' ? (
                        <button onClick={() => setSelectedSubmission(sub)} className="btn btn-primary btn-sm">Evaluate</button>
                      ) : (
                        <span className="text-gray">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="modal-content card glass">
            <h3>Evaluate Submission</h3>
            <p>Student: {selectedSubmission.studentId.name}</p>
            <form onSubmit={submitEvaluation}>
              <div className="form-group">
                <label>Marks (0-100)</label>
                <input type="number" min="0" max="100" value={grade} onChange={e => setGrade(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Feedback</label>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} required />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Submit Evaluation</button>
                <button type="button" onClick={() => setSelectedSubmission(null)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyDashboard;
