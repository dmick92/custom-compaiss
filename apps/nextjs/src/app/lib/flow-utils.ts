export interface FlowData {
  name: string;
  nodes: unknown[];
  edges: unknown[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export const saveFlow = (flowData: FlowData) => {
  // Create a unique key for the flow
  const flowKey = `flow_${flowData.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}`;
  localStorage.setItem(flowKey, JSON.stringify(flowData));

  // Also save to the legacy key for backward compatibility
  localStorage.setItem("savedFlow", JSON.stringify(flowData));

  return flowKey;
};

export const loadFlows = (): FlowData[] => {
  try {
    const flows: FlowData[] = [];

    // Load from legacy key
    const savedFlow = localStorage.getItem("savedFlow");
    if (savedFlow) {
      const flowData = JSON.parse(savedFlow) as FlowData;
      flows.push(flowData);
    }

    // Load from all flow keys
    const allKeys = Object.keys(localStorage);
    const flowKeys = allKeys.filter((key) => key.startsWith("flow_"));

    for (const key of flowKeys) {
      try {
        const flowData = JSON.parse(
          localStorage.getItem(key) ?? "",
        ) as FlowData;
        //if (flowData && !flows.find((f) => f.name === flowData.name)) {
        flows.push(flowData);
        //}
      } catch {
        continue;
      }
    }

    return flows;
  } catch {
    return [];
  }
};

export const deleteFlow = (flowName: string) => {
  // Remove from legacy key if it matches
  const savedFlow = localStorage.getItem("savedFlow");
  if (savedFlow) {
    const flowData = JSON.parse(savedFlow) as FlowData;
    if (flowData.name === flowName) {
      localStorage.removeItem("savedFlow");
    }
  }

  // Remove from all matching flow keys
  const allKeys = Object.keys(localStorage);
  const flowKeys = allKeys.filter((key) => key.startsWith("flow_"));

  for (const key of flowKeys) {
    try {
      //const flowData = JSON.parse(localStorage.getItem(key) ?? "") as FlowData;
      //if (flowData && flowData.name === flowName) {
      localStorage.removeItem(key);
      //}
    } catch {
      return;
    }
  }
};

export const getFlowOverview = (flow: FlowData) => {
  const nodeCount = flow.nodes.length;
  const edgeCount = flow.edges.length;
  const nodeTypes = [
    ...new Set(flow.nodes.map((node) => (node as { type: string }).type)),
  ];

  let complexity: string;
  if (nodeCount + edgeCount > 10) {
    complexity = "High";
  } else if (nodeCount + edgeCount > 5) {
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
