// src/HabitManager.jsx

import React, { useState, useEffect } from "react";

function HabitManager() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // --- READ: Load habits when the component mounts ---
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const items = await window.electronAPI.readItems();
        setHabits(items);
      } catch (error) {
        console.error("Failed to load habits:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHabits();
  }, []);

  // --- CREATE: Add a new habit ---
  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const newHabit = { name: newHabitName, completed: false };
      const addedHabit = await window.electronAPI.createItem(newHabit);
      setHabits([...habits, addedHabit]); // Update UI optimistically
      setNewHabitName("");
    } catch (error) {
      console.error("Failed to add habit:", error);
    }
  };

  // --- UPDATE: Toggle habit completion ---
  const handleToggleComplete = async (habit) => {
    try {
      const updatedHabit = { ...habit, completed: !habit.completed };
      await window.electronAPI.updateItem(updatedHabit);
      setHabits(habits.map((h) => (h.id === habit.id ? updatedHabit : h)));
    } catch (error) {
      console.error("Failed to update habit:", error);
    }
  };

  // --- DELETE: Remove a habit ---
  const handleDeleteHabit = async (id) => {
    try {
      await window.electronAPI.deleteItem(id);
      setHabits(habits.filter((h) => h.id !== id));
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  if (isLoading) {
    return <div>Loading habits...</div>;
  }

  return (
    <div>
      <h1>Habit Evaluator</h1>
      <form onSubmit={handleAddHabit}>
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="New habit name"
        />
        <button type="submit">Add Habit</button>
      </form>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>
            <span
              style={{
                textDecoration: habit.completed ? "line-through" : "none",
              }}
              onClick={() => handleToggleComplete(habit)}
            >
              {habit.name}
            </span>
            <button onClick={() => handleDeleteHabit(habit.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HabitManager;
