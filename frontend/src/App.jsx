import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:5000/api/subscribers';

function App() {
    const [subscribers, setSubscribers] = useState([]);
    const [name, setName] = useState('');
    const [plan, setPlan] = useState('');
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState('');

    async function loadSubscribers() {
        try {
            const response = await fetch(API);
            if (!response.ok) throw new Error('Unable to load subscribers');
            setSubscribers(await response.json());
        } catch (error) {
            setMessage(error.message);
        }
    }

    useEffect(() => {
        loadSubscribers();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage('');

        try {
            const response = await fetch(
                editId ? `${API}/${editId}` : API,
                {
                    method: editId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, plan })
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setName('');
            setPlan('');
            setEditId(null);
            setMessage(data.message || 'Subscriber added successfully');
            await loadSubscribers();
        } catch (error) {
            setMessage(error.message || 'Request failed');
        }
    }

    function editSubscriber(subscriber) {
        setEditId(subscriber._id);
        setName(subscriber.name);
        setPlan(subscriber.plan);
        setMessage('');
    }

    async function deleteSubscriber(id) {
        if (!window.confirm('Delete this subscriber?')) return;

        try {
            const response = await fetch(`${API}/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setMessage(data.message);
            await loadSubscribers();
        } catch (error) {
            setMessage(error.message);
        }
    }

    return (
        <main className="container">
            <h1>Finance &amp; Investment Blog - Subscriber Management System</h1>
            <p>Frontend: React.js · Backend: Node.js · Database: MongoDB</p>

            <h2>Add Subscriber</h2>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Subscriber Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />

                <input
                    placeholder="Plan"
                    value={plan}
                    onChange={e => setPlan(e.target.value)}
                    required
                />

                <button type="submit">
                    {editId ? 'Update Subscriber' : 'Add Subscriber'}
                </button>

                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setName('');
                            setPlan('');
                        }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {message && <p role="status">{message}</p>}

            <h2>Subscriber Records</h2>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Plan</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {subscribers.map(subscriber => (
                        <tr key={subscriber._id}>
                            <td>{subscriber.name}</td>
                            <td>{subscriber.plan}</td>
                            <td>
                                <button
                                    onClick={() => editSubscriber(subscriber)}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteSubscriber(subscriber._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}

export default App;
