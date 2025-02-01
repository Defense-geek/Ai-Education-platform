//app\editor-button\page.tsx
"use client";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CodeEditorPage from '../editor/page';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<CodeEditorPage />} />
      </Routes>
    </Router>
  );
}

function Home() {
  return <h1>Go to Editor</h1>;
}

export default App;
