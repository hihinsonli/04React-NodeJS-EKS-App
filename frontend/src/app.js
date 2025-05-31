import React, { useState, useEffect } from 'react';
import './app.css';

function App() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/mycats`)
      .then(response => response.json())
      .then(data => setItems(data))
      .catch(err => setError('Failed to fetch items: ' + err.message));
  }, []);

  return (
    <div className="center-container">
      <div className="card">
        <h1>Hinson's Cats</h1>
        {error ? (
          <p className="error">{error}</p>
        ) : (
          <ul>
            {items.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
