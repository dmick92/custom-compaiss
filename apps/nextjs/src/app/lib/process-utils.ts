export interface ProcessData {
	name: string;
	nodes: unknown[];
	edges: unknown[];
	createdAt: string;
	updatedAt: string;
	description: string | null;
}

export const saveProcess = (processData: ProcessData) => {
	// Create a unique key for the process
	const processKey = `process_${processData.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}`;
	localStorage.setItem(processKey, JSON.stringify(processData));

	// Also save to the legacy key for backward compatibility
	localStorage.setItem("savedProcess", JSON.stringify(processData));

	return processKey;
};

export const loadProcesses = (): ProcessData[] => {
	try {
		const processes: ProcessData[] = [];

		// Load from legacy key
		const savedProcess = localStorage.getItem("savedProcess");
		if (savedProcess) {
			const processData = JSON.parse(savedProcess);
			processes.push(processData);
		}

		// Load from all process keys
		const allKeys = Object.keys(localStorage);
		const processKeys = allKeys.filter((key) => key.startsWith("process_"));

		for (const key of processKeys) {
			try {
				const processData = JSON.parse(localStorage.getItem(key) || "");
				if (
					processData &&
					!processes.find((f) => f.name === processData.name)
				) {
					processes.push(processData);
				}
			} catch (_error) { }
		}

		return processes;
	} catch (_error) {
		return [];
	}
};

export const deleteProcess = (processName: string) => {
	// Remove from legacy key if it matches
	const savedProcess = localStorage.getItem("savedProcess");
	if (savedProcess) {
		const processData = JSON.parse(savedProcess);
		if (processData.name === processName) {
			localStorage.removeItem("savedProcess");
		}
	}

	// Remove from all matching process keys
	const allKeys = Object.keys(localStorage);
	const processKeys = allKeys.filter((key) => key.startsWith("process_"));

	for (const key of processKeys) {
		try {
			const processData = JSON.parse(localStorage.getItem(key) || "");
			if (processData && processData.name === processName) {
				localStorage.removeItem(key);
			}
		} catch (_error) { }
	}
};

export const getProcessOverview = (process: ProcessData) => {
	const nodeCount = process.nodes.length;
	const edgeCount = process.edges.length;
	const nodeTypes = [
		...new Set(process.nodes.map((node) => (node as { type: string }).type)),
	];

	let complexity: string;
	const total = nodeCount + edgeCount;
	if (total > 10) {
		complexity = "High";
	} else if (total > 5) {
		complexity = "Medium";
	} else {
		complexity = "Low";
	}
	return {
		nodeCount,
		edgeCount,
		nodeTypes,
		complexity,
	};
};
