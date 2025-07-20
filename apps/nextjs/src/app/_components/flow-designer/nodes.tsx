import { Handle, Position } from "@xyflow/react";
import { Circle, Clock, Diamond, Settings, Square, Play, Cog, File, HelpCircle } from "lucide-react";

// Start/End Node (Circle)
export function StartNode({ data }: { data: { label: string } }) {
	return (
		<div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-green-500 bg-green-100 dark:border-green-400 dark:bg-green-900/20">
			<Handle className="h-3 w-3" position={Position.Right} type="source" />
			<div className="text-center">
				<Play className="mx-auto mb-1 h-8 w-8 text-green-600 dark:text-green-400" />
				<div className="font-medium text-green-700 text-xs dark:text-green-300">
					{data.label}
				</div>
			</div>
		</div>
	);
}

export function EndNode({ data }: { data: { label: string } }) {
	return (
		<div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-red-500 bg-red-100 dark:border-red-400 dark:bg-red-900/20">
			<Handle className="h-3 w-3" position={Position.Left} type="target" />
			<div className="text-center">
				<Square className="mx-auto mb-1 h-8 w-8 text-red-600 dark:text-red-400" />
				<div className="font-medium text-red-700 text-xs dark:text-red-300">
					{data.label}
				</div>
			</div>
		</div>
	);
}

// Process Node (Rectangle)
export function ProcessNode({ data }: { data: { label: string } }) {
	return (
		<div className="flex h-16 w-32 items-center justify-center rounded-md border-2 border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/20">
			<Handle className="h-3 w-3" position={Position.Left} type="target" />
			<div className="text-center">
				<Cog className="mx-auto mb-1 h-6 w-6 text-blue-600 dark:text-blue-400" />
				<div className="font-medium text-blue-700 text-xs dark:text-blue-300">
					{data.label}
				</div>
			</div>
			<Handle className="h-3 w-3" position={Position.Right} type="source" />
		</div>
	);
}

// Decision Node (Diamond)
export function DecisionNode({ data }: { data: { label: string } }) {
	return (
		<div
			className="relative h-24 w-24"
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{/* Diamond border using SVG */}
			<svg className="absolute inset-0 h-full w-full" viewBox="0 0 96 96">
				<title>Decision Node</title>
				<defs>
					<linearGradient
						id="diamondGradient"
						x1="0%"
						x2="100%"
						y1="0%"
						y2="100%"
					>
						<stop offset="0%" stopColor="rgb(234 179 8)" />
						<stop offset="100%" stopColor="rgb(234 179 8)" />
					</linearGradient>
				</defs>
				<polygon
					className="dark:fill-yellow-900/20 dark:stroke-yellow-400"
					fill="rgb(254 243 199)"
					points="48,0 96,48 48,96 0,48"
					stroke="rgb(234 179 8)"
					strokeWidth="2"
				/>
			</svg>

			{/* Content */}
			<div className="relative z-10 text-center">
				<HelpCircle className="mx-auto mb-1 h-6 w-6 text-yellow-600 dark:text-yellow-400" />
				<div className="font-medium text-xs text-yellow-700 dark:text-yellow-300">
					{data.label}
				</div>
			</div>

			{/* Handles positioned at diamond points */}
			<Handle
				className="z-20 h-3 w-3"
				position={Position.Left}
				style={{ left: "-6px", top: "50%", transform: "translateY(-50%)" }}
				type="target"
			/>
			<Handle
				className="z-20 h-3 w-3"
				position={Position.Right}
				style={{ right: "-6px", top: "50%", transform: "translateY(-50%)" }}
				type="source"
			/>
			<Handle
				className="z-20 h-3 w-3"
				position={Position.Top}
				style={{ top: "-6px", left: "50%", transform: "translateX(-50%)" }}
				type="source"
			/>
			<Handle
				className="z-20 h-3 w-3"
				position={Position.Bottom}
				style={{ bottom: "-6px", left: "50%", transform: "translateX(-50%)" }}
				type="source"
			/>
		</div>
	);
}

// Document Node (Rectangle with folded corner)
export function DocumentNode({ data }: { data: { label: string } }) {
	return (
		<div className="relative flex h-20 w-32 items-center justify-center rounded-md border-2 border-orange-500 bg-orange-100 dark:border-orange-400 dark:bg-orange-900/20">
			<Handle className="h-3 w-3" position={Position.Left} type="target" />
			<div className="text-center">
				<File className="mx-auto mb-1 h-6 w-6 text-orange-600 dark:text-orange-400" />
				<div className="font-medium text-orange-700 text-xs dark:text-orange-300">
					{data.label}
				</div>
			</div>
			<Handle className="h-3 w-3" position={Position.Right} type="source" />
			<div className="-translate-y-2 absolute top-0 right-0 h-4 w-4 translate-x-2 rotate-45 transform bg-orange-500 dark:bg-orange-400" />
		</div>
	);
}

// Delay Node
export function DelayNode({ data }: { data: { label: string } }) {
	return (
		<div
			className="relative h-16 w-32 border-2 border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/20"
			style={{
				borderRadius: "8px 50% 50% 8px",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Handle className="h-3 w-3" position={Position.Left} type="target" />
			<div className="text-center">
				<Clock className="mx-auto mb-1 h-6 w-6 text-blue-600 dark:text-blue-400" />
				<div className="font-medium text-blue-700 text-xs dark:text-blue-300">
					{data.label}
				</div>
			</div>
			<Handle className="h-3 w-3" position={Position.Right} type="source" />
		</div>
	);
}
