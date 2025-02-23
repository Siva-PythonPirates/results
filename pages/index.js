import { useState } from 'react';

export default function Home() {
  const [rollNumbers, setRollNumbers] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Split the input string into an array of roll numbers
    const rolls = rollNumbers.split(',').map(r => r.trim()).filter(Boolean);
    setLoading(true);
    try {
      const res = await fetch('/api/getResults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumbers: rolls })
      });
      const data = await res.json();
      setResults(data.results);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>CTF Examination Results</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Roll Numbers (comma separated):
          <br />
          <input
            type="text"
            value={rollNumbers}
            onChange={(e) => setRollNumbers(e.target.value)}
            style={{ width: '300px', margin: '10px 0', padding: '8px' }}
            placeholder="e.g., 210701252, 210701253"
          />
        </label>
        <br />
        <button type="submit" style={{ padding: '8px 16px' }}>Get Results</button>
      </form>
      {loading && <p>Loading results...</p>}
      {results.length > 0 && (
        <div>
          <h2>Results</h2>
          {results.map((item, index) => (
            <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
              <h3>Roll Number: {item.rollNo}</h3>
              {item.error ? (
                <p style={{ color: 'red' }}>Error: {item.error}</p>
              ) : (
                <>
                  <p>PersonId: {item.personId}</p>
                  <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Semester</th>
                        <th>Code</th>
                        <th>Subject</th>
                        <th>Grade</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.result.map((r, idx) => (
                        <tr key={idx}>
                          <td>{r.Semester}</td>
                          <td>{r.Code}</td>
                          <td>{r.Subject}</td>
                          <td>{r.Grade}</td>
                          <td>{r.Result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
