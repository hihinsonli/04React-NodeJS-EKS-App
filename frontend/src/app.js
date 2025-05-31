import React, { useState, useEffect } from 'react';
import './app.css';

function App() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Making API request to /api/mycats');
        const response = await fetch('/api/mycats', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const text = await response.text();
          console.error('Error response:', text);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new TypeError("Oops, we haven't got JSON!");
        }

        const data = await response.json();
        console.log('Received data:', data);
        setItems(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch items: ' + err.message);
      }
    };

    fetchData();
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
