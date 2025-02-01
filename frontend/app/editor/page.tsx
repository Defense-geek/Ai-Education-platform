//app\editor\page.tsx
"use client";
import React, { useState } from 'react';

function CodeEditorPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div style={{ height: '100vh', margin: 0, padding: 0, position: 'relative' }}>
      {/* Arrow Icon in the Top Left */}
      <div
        onClick={toggleMenu}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          cursor: 'pointer',
          fontSize: '30px',
          color: 'blue',
        }}
      >
        &#8594; {/* Right Arrow Symbol */}
      </div>

      {/* Menu */}
      {isMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '10px',
            width: '50%',   // Fixed width for the menu
            background: '#333',
            color: '#fff',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            height: 'calc(100vh - 50px)', // Fill the screen height minus the top bar
            overflowY: 'auto', // Allows scrolling if content overflows
          }}
        >
          <h3>Title</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>
              <strong>Question</strong>
              <p>This is where you can describe the question in detail.</p>
            </li>
            <li>
              <strong>Input Format:</strong>
              <p>Describe the input format for the problem here.</p>
            </li>
            <li>
              <strong>Output Format:</strong>
              <p>Explain the expected output format for the solution.</p>
            </li>
            <li>
              <strong>Examples:</strong>
              <pre>
                Input: <code>2 3</code>
                Output: <code>5</code>
              </pre>
              <pre>
                Input: <code>10 20</code>
                Output: <code>30</code>
              </pre>
            </li>
            <li>
              <strong>Description:</strong>
              <p>Provide a detailed explanation of how to solve the problem here.</p>
            </li>
          </ul>
        </div>
      )}

      {/* Hidden Header */}
      <h1 style={{ display: 'none' }}>Integrated Code Editor</h1>

      {/* The Code Editor iframe */}
      <iframe
        src="http://localhost:3001"
        title="Code Editor"
        style={{
          width: '100%',
          height: '100vh',  // Occupy full viewport height
          border: 'none',   // Remove iframe border
        }}
      />
    </div>
  );
}

export default CodeEditorPage;
