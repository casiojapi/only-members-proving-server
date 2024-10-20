import express from 'express';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import circuit from './membership/target/circuit.json' assert { type: 'json' };

const app = express();
const port = 8080;

app.use(express.json());

// Initialize Noir backend
const backend = new BarretenbergBackend(circuit);
const noir = new Noir(circuit);

async function generateProof(input) {
	try {
		const { witness } = await noir.execute(input);
		const proof = await backend.generateProof(witness);
		return proof.proof;
	} catch (error) {
		console.error('Error generating proof:', error);
		throw error;
	}
}

// API endpoint to generate proof
app.post('/generate-proof', async (req, res) => {
	const { member, expected_member } = req.body;

	if (!member) {
		return res.status(400).json({ error: 'Missing member' });
	}

	if (!expected_member) {
		return res.status(400).json({ error: 'Missing expected_member' });
	}

	try {
		const input = { member: member, expected_member: expected_member };
		const proof = await generateProof(input);
		res.json({ proof });
	} catch (error) {
		res.status(500).json({ error: 'Failed to generate proof' });
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
