require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const client = new MongoClient(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

let subscribers;

app.get('/api/subscribers', async (req, res) => {
    try {
        const records = await subscribers.find({}).toArray();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch subscribers' });
    }
});

app.post('/api/subscribers', async (req, res) => {
    try {
        const { name, plan } = req.body;

        if (typeof name !== 'string' || !name.trim() ||
            typeof plan !== 'string' || !plan.trim()) {
            return res.status(400).json({
                error: 'Name and plan are required'
            });
        }

        const subscriber = {
            name: name.trim(),
            plan: plan.trim()
        };

        const result = await subscribers.insertOne(subscriber);
        res.status(201).json({
            _id: result.insertedId,
            ...subscriber
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to add subscriber' });
    }
});

app.put('/api/subscribers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, plan } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid subscriber ID' });
        }

        if (typeof name !== 'string' || !name.trim() ||
            typeof plan !== 'string' || !plan.trim()) {
            return res.status(400).json({
                error: 'Name and plan are required'
            });
        }

        const result = await subscribers.updateOne(
            { _id: new ObjectId(id) },
            { $set: {
                name: name.trim(),
                plan: plan.trim()
            }}
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }

        res.json({ message: 'Subscriber updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to update subscriber' });
    }
});

app.delete('/api/subscribers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid subscriber ID' });
        }

        const result = await subscribers.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }

        res.json({ message: 'Subscriber deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete subscriber' });
    }
});

async function startServer() {
    try {
        await client.connect();

        const db = client.db('FinanceBlogDB');
        subscribers = db.collection('Subscribers');

        app.listen(process.env.PORT || 5000, () => {
            console.log('Backend running on port 5000');
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

startServer();
