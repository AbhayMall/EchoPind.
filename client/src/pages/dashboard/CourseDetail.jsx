import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [watchedMaterials, setWatchedMaterials] = useState([]);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Fetch course details
    api.get(`/courses/${id}`)
      .then(r => {
        setCourse(r.data.data);
        // Fetch user's progress for this course
        return api.get('/progress/me');
      })
      .then(progressRes => {
        const courseProgress = progressRes.data.data.find(p => p.course?._id === id);
        setProgress(courseProgress);
        if (courseProgress) {
          setWatchedMaterials(courseProgress.completedMaterials || []);
        }
      })
      .catch(() => setError('Failed to load course details'))
      .finally(() => setLoading(false));
  }, [id]);
const handleWatchMaterial = async (materialId) => {
  if (watchedMaterials.includes(materialId)) return;
  
  try {
    await api.post(`/progress/course/${id}/material`, { materialId });
    // Add ecoPoints
    await api.post('/gamification/complete-content', { 
      courseId: id, 
      points: 10 
    });
    
    alert('Marked complete. +10 ecoPoints!');
    setWatchedMaterials([...watchedMaterials, materialId]);
    
    // Refresh progress
    const progressRes = await api.get('/progress/me');
    const courseProgress = progressRes.data.data.find(p => p.course?._id === id);
    setProgress(courseProgress);
  } catch (error) {
    console.error("Failed to mark material as complete:", error);
    alert('Failed to mark material as complete');
  }
};
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div style={{padding: '20px', maxWidth: '1000px', margin: '0 auto'}}>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      
      {course.imageUrl && (
        <div style={{marginBottom: '20px'}}>
          <img 
            src={course.imageUrl} 
            alt={course.title}
            style={{maxWidth: '100%', borderRadius: '8px'}}
          />
        </div>
      )}
      
      {course.videoUrl && (
        <div style={{marginBottom: '20px'}}>
          <video width="100%" controls src={course.videoUrl}></video>
        </div>
      )}
      
      {progress ? (
        <div style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px'}}>
          <strong>Your Progress:</strong> {progress.progressPercent}% complete
        </div>
      ) : (
        <button 
          onClick={() => api.post(`/courses/${id}/enroll`).then(() => {
            alert('Enrolled successfully!');
            window.location.reload();
          })}
          style={{marginBottom: '20px'}}
        >
          Enroll in this course
        </button>
      )}
      
      <h3>Course Materials</h3>
      {course.materials && course.materials.length > 0 ? (
        <ul style={{listStyle: 'none', padding: 0}}>
          {course.materials.map((m, i) => (
            <li key={i} style={{
              padding: '15px', 
              marginBottom: '10px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              backgroundColor: watchedMaterials.includes(m._id) ? '#f0f9ff' : 'white'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <strong>[{m.type.toUpperCase()}] {m.title || m.filename}</strong>
                  {m.description && <p style={{margin: '5px 0', color: '#6b7280'}}>{m.description}</p>}
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <a 
                    href={`/api/files/${m.fileId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    View
                  </a>
                  
                  {progress && (
                    <label style={{display: 'flex', alignItems: 'center'}}>
                      <input
                        type="checkbox"
                        checked={watchedMaterials.includes(m._id)}
                        onChange={() => handleWatchMaterial(m._id)}
                        style={{marginRight: '5px'}}
                      />
                      Complete
                    </label>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No materials available for this course yet.</p>
      )}
      
      <h3>Quizzes</h3>
      {course.quizzes && course.quizzes.length > 0 ? (
        <ul style={{listStyle: 'none', padding: 0}}>
          {course.quizzes.map(q => (
            <li key={q._id} style={{
              padding: '15px', 
              marginBottom: '10px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <strong>{q.title}</strong>
                  {q.description && <p style={{margin: '5px 0', color: '#6b7280'}}>{q.description}</p>}
                </div>
                <Link 
                  to={`/app/quiz/${q._id}`} 
                  onClick={() => sessionStorage.setItem('current_quiz', JSON.stringify(q))}
                  className="btn"
                >
                  Start Quiz
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No quizzes available for this course yet.</p>
      )}
      
      <h3>Assignments</h3>
      {course.assignments && course.assignments.length > 0 ? (
        <ul style={{listStyle: 'none', padding: 0}}>
          {course.assignments.map(a => (
            <li key={a._id} style={{
              padding: '15px', 
              marginBottom: '10px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <strong>{a.title}</strong>
                  {a.description && <p style={{margin: '5px 0', color: '#6b7280'}}>{a.description}</p>}
                  {a.dueDate && (
                    <p style={{margin: '5px 0', color: '#6b7280'}}>
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Link 
                  to={`/app/assignments/${a._id}/submit`} 
                  className="btn"
                >
                  Submit Assignment
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No assignments available for this course yet.</p>
      )}
    </div>
  );
}