import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/flashcards';

const App = () => {
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [form, setForm] = useState({ question: '', answer: '' });
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        axios.get(API_URL)
            .then((response) => {
                setFlashcards(response.data);
            })
            .catch((error) => console.error('Error fetching flashcards:', error));
    }, []);

    const nextCard = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    };

    const prevCard = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    };

    const handleFlip = () => {
        const updatedFlashcards = [...flashcards];
        updatedFlashcards[currentIndex].flipped = !updatedFlashcards[currentIndex].flipped;
        setFlashcards(updatedFlashcards);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            axios.put(`${API_URL}/${editing.id}`, form)
                .then(() => {
                    setFlashcards(flashcards.map(fc => fc.id === editing.id ? { ...fc, ...form } : fc));
                    setEditing(null);
                })
                .catch((error) => console.error('Error updating flashcard:', error));
        } else {
            axios.post(API_URL, form)
                .then((response) => {
                    setFlashcards([...flashcards, { ...form, id: response.data.id, flipped: false }]);
                })
                .catch((error) => console.error('Error adding flashcard:', error));
        }
        setForm({ question: '', answer: '' });
    };

    const handleEdit = (flashcard) => {
        setForm(flashcard);
        setEditing(flashcard);
    };

    const handleDelete = (id) => {
        axios.delete(`${API_URL}/${id}`)
            .then(() => {
                setFlashcards(flashcards.filter(fc => fc.id !== id));
            })
            .catch((error) => console.error('Error deleting flashcard:', error));
    };

    return (
        <div className="app">
            <h1>Flashcard Learning Tool</h1>

            {/* Flashcard Display */}
            {flashcards.length > 0 && (
                <div className="flashcard-container">
                    <div className={`flashcard ${flashcards[currentIndex].flipped ? 'flipped' : ''}`} onClick={handleFlip}>
                        <div className="front">{flashcards[currentIndex].question}</div>
                        <div className="back">{flashcards[currentIndex].answer}</div>
                    </div>
                    <button onClick={prevCard}>Previous</button>
                    <button onClick={nextCard}>Next</button>
                </div>
            )}

            {/* Admin Dashboard */}
            <div className="dashboard">
                <h2>{editing ? 'Edit Flashcard' : 'Add Flashcard'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Question"
                        value={form.question}
                        onChange={(e) => setForm({ ...form, question: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Answer"
                        value={form.answer}
                        onChange={(e) => setForm({ ...form, answer: e.target.value })}
                        required
                    />
                    <button type="submit">{editing ? 'Update' : 'Add'}</button>
                </form>

                {/* Flashcard List with Edit/Delete Options */}
                <h2>Manage Flashcards</h2>
                <ul>
                    {flashcards.map((flashcard) => (
                        <li key={flashcard.id}>
                            <strong>{flashcard.question}</strong>
                            <button onClick={() => handleEdit(flashcard)}>Edit</button>
                            <button onClick={() => handleDelete(flashcard.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default App;


