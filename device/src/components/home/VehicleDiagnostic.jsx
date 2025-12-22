import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, Line, Ellipse, G, Defs, LinearGradient, Stop, Text as SvgText, Polygon } from 'react-native-svg';
import { spacing } from '../common/theme';

const { width: screenWidth } = Dimensions.get('window');

// Get color based on wear percentage
export const getWearColor = (progress) => {
	if (progress < 30) return '#4ade80'; // Good - Green
	if (progress < 60) return '#a3e635'; // Fair - Light Green
	if (progress < 80) return '#fbbf24'; // Worn - Yellow
	if (progress < 100) return '#f87171'; // Critical - Red
	return '#dc2626'; // Overdue - Dark Red
};

// Realistic Motorcycle Diagnostic Display
const VehicleDiagnostic = ({ partsStatus }) => {
	const getPartColor = (key) => {
		const progress = partsStatus[key]?.progress || 0;
		return getWearColor(progress);
	};

	const svgWidth = screenWidth - 32;
	const svgHeight = 340;

	// Label with pointer line component - neutral colors, status shown on parts
	const PartLabel = ({ x, y, labelX, labelY, label, align = 'start' }) => {
		return (
			<G>
				{/* Pointer line */}
				<Line x1={x} y1={y} x2={labelX} y2={labelY} stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
				{/* Dot at part */}
				<Circle cx={x} cy={y} r="3" fill="#94a3b8" />
				{/* Label background */}
				<Rect 
					x={align === 'end' ? labelX - 62 : labelX - 2} 
					y={labelY - 10} 
					width="64" 
					height="14" 
					rx="3" 
					fill="#1e293b" 
					opacity="0.95"
				/>
				{/* Label text */}
				<SvgText 
					x={align === 'end' ? labelX - 5 : labelX} 
					y={labelY} 
					fontSize="8" 
					fill="#94a3b8" 
					textAnchor={align}
					fontWeight="500"
				>
					{label}
				</SvgText>
			</G>
		);
	};

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Ionicons name="speedometer" size={20} color="#60a5fa" />
				<Text style={styles.title}>Vehicle Diagnostic</Text>
			</View>
			<Text style={styles.subtitle}>Real-time parts condition overview</Text>
			
			<View style={styles.svgContainer}>
				<Svg width={svgWidth} height={svgHeight} viewBox="0 0 380 320">
					<Defs>
						{/* Gradients */}
						<LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0" stopColor="#0c1929" stopOpacity="1" />
							<Stop offset="1" stopColor="#0a1628" stopOpacity="1" />
						</LinearGradient>
						<LinearGradient id="tireGrad" x1="0" y1="0" x2="1" y2="1">
							<Stop offset="0" stopColor="#1f2937" stopOpacity="1" />
							<Stop offset="1" stopColor="#111827" stopOpacity="1" />
						</LinearGradient>
						<LinearGradient id="chromeGrad" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0" stopColor="#9ca3af" stopOpacity="1" />
							<Stop offset="0.5" stopColor="#6b7280" stopOpacity="1" />
							<Stop offset="1" stopColor="#4b5563" stopOpacity="1" />
						</LinearGradient>
						<LinearGradient id="engineGrad" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0" stopColor="#374151" stopOpacity="1" />
							<Stop offset="1" stopColor="#1f2937" stopOpacity="1" />
						</LinearGradient>
						<LinearGradient id="tankGrad" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0" stopColor="#1e40af" stopOpacity="1" />
							<Stop offset="0.5" stopColor="#1e3a8a" stopOpacity="1" />
							<Stop offset="1" stopColor="#172554" stopOpacity="1" />
						</LinearGradient>
						<LinearGradient id="seatGrad" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0" stopColor="#292524" stopOpacity="1" />
							<Stop offset="1" stopColor="#1c1917" stopOpacity="1" />
						</LinearGradient>
					</Defs>
					
					{/* Background */}
					<Rect x="0" y="0" width="380" height="320" fill="url(#bgGrad)" rx="8" />
					
					{/* Subtle grid */}
					{[50, 100, 150, 200, 250].map(y => (
						<Line key={`h${y}`} x1="0" y1={y} x2="380" y2={y} stroke="#1e3a5f" strokeWidth="0.3" strokeOpacity="0.2" />
					))}
					
					{/* Ground shadow */}
					<Ellipse cx="190" cy="265" rx="130" ry="8" fill="#000" opacity="0.3" />
					
					{/* === REAR WHEEL === */}
					<G>
						{/* Outer tire with tread */}
						<Circle cx="85" cy="210" r="48" fill="url(#tireGrad)" />
						{/* Status indicator ring on tire */}
						<Circle cx="85" cy="210" r="46" fill="none" stroke={getPartColor('tire_pressure')} strokeWidth="3" opacity="0.8" />
						<Circle cx="85" cy="210" r="44" fill="none" stroke="#374151" strokeWidth="6" />
						{/* Tread pattern */}
						{[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
							<Line 
								key={`rtread${i}`}
								x1={85 + 40 * Math.cos(angle * Math.PI / 180)}
								y1={210 + 40 * Math.sin(angle * Math.PI / 180)}
								x2={85 + 48 * Math.cos(angle * Math.PI / 180)}
								y2={210 + 48 * Math.sin(angle * Math.PI / 180)}
								stroke="#4b5563"
								strokeWidth="3"
							/>
						))}
						{/* Rim - chrome effect */}
						<Circle cx="85" cy="210" r="32" fill="none" stroke="url(#chromeGrad)" strokeWidth="3" />
						<Circle cx="85" cy="210" r="28" fill="none" stroke="#6b7280" strokeWidth="1" />
						{/* Spokes */}
						{[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, i) => (
							<Line 
								key={`rspoke${i}`}
								x1={85 + 8 * Math.cos(angle * Math.PI / 180)}
								y1={210 + 8 * Math.sin(angle * Math.PI / 180)}
								x2={85 + 28 * Math.cos(angle * Math.PI / 180)}
								y2={210 + 28 * Math.sin(angle * Math.PI / 180)}
								stroke="#9ca3af"
								strokeWidth="1.5"
							/>
						))}
						{/* Hub with status color */}
						<Circle cx="85" cy="210" r="10" fill={getPartColor('tire_pressure')} opacity="0.9" />
						<Circle cx="85" cy="210" r="6" fill="#374151" stroke="#6b7280" strokeWidth="1" />
						{/* Axle bolt */}
						<Circle cx="85" cy="210" r="3" fill="#9ca3af" />
					</G>
					
					{/* === FRONT WHEEL === */}
					<G>
						{/* Outer tire */}
						<Circle cx="295" cy="210" r="48" fill="url(#tireGrad)" />
						<Circle cx="295" cy="210" r="44" fill="none" stroke="#374151" strokeWidth="8" />
						{/* Tread */}
						{[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
							<Line 
								key={`ftread${i}`}
								x1={295 + 40 * Math.cos(angle * Math.PI / 180)}
								y1={210 + 40 * Math.sin(angle * Math.PI / 180)}
								x2={295 + 48 * Math.cos(angle * Math.PI / 180)}
								y2={210 + 48 * Math.sin(angle * Math.PI / 180)}
								stroke="#4b5563"
								strokeWidth="3"
							/>
						))}
						{/* Rim */}
						<Circle cx="295" cy="210" r="32" fill="none" stroke="url(#chromeGrad)" strokeWidth="3" />
						<Circle cx="295" cy="210" r="28" fill="none" stroke="#6b7280" strokeWidth="1" />
						{/* Brake disc - colored by status */}
						<Circle cx="295" cy="210" r="22" fill="none" stroke={getPartColor('brake_check')} strokeWidth="4" opacity="0.9" />
						<Circle cx="295" cy="210" r="17" fill="none" stroke="#71717a" strokeWidth="1" strokeDasharray="3,2" />
						{/* Spokes */}
						{[0, 60, 120, 180, 240, 300].map((angle, i) => (
							<Line 
								key={`fspoke${i}`}
								x1={295 + 6 * Math.cos(angle * Math.PI / 180)}
								y1={210 + 6 * Math.sin(angle * Math.PI / 180)}
								x2={295 + 28 * Math.cos(angle * Math.PI / 180)}
								y2={210 + 28 * Math.sin(angle * Math.PI / 180)}
								stroke="#9ca3af"
								strokeWidth="1.5"
							/>
						))}
						{/* Hub with brake status */}
						<Circle cx="295" cy="210" r="8" fill={getPartColor('brake_check')} opacity="0.8" />
						<Circle cx="295" cy="210" r="4" fill="#374151" stroke="#6b7280" strokeWidth="1" />
					</G>
					
					{/* === FRAME === */}
					<G>
						{/* Main backbone - colored by wiring status */}
						<Path 
							d="M 115,210 L 130,165 L 145,140 L 200,120 L 255,115 L 280,155" 
							fill="none" 
							stroke={getPartColor('wiring_harness')} 
							strokeWidth="8" 
							strokeLinecap="round"
							strokeLinejoin="round"
							opacity="0.9"
						/>
						{/* Down tube */}
						<Path 
							d="M 145,140 L 160,195" 
							fill="none" 
							stroke={getPartColor('wiring_harness')} 
							strokeWidth="6" 
							strokeLinecap="round"
							opacity="0.9"
						/>
						{/* Rear subframe */}
						<Path 
							d="M 130,165 L 100,160 L 95,130" 
							fill="none" 
							stroke="#52525b" 
							strokeWidth="5" 
							strokeLinecap="round"
						/>
						{/* Swingarm */}
						<Path 
							d="M 160,195 L 115,210 L 85,210" 
							fill="none" 
							stroke="#6b7280" 
							strokeWidth="6" 
							strokeLinecap="round"
						/>
					</G>
					
					{/* === ENGINE === */}
					<G>
						{/* Crankcase - colored by engine oil status */}
						<Path 
							d="M 145,165 L 145,200 L 200,200 L 200,160 L 175,145 L 145,155 Z" 
							fill={getPartColor('engine_oil')} 
							stroke="#4b5563" 
							strokeWidth="1"
							opacity="0.85"
						/>
						{/* Cylinder */}
						<Rect x="155" y="130" width="35" height="30" rx="2" fill="#374151" stroke="#4b5563" strokeWidth="1" />
						{/* Cylinder head - spark plug indicator */}
						<Rect x="158" y="122" width="29" height="12" rx="2" fill={getPartColor('spark_plug')} stroke="#52525b" strokeWidth="1" opacity="0.9" />
						{/* Cooling fins */}
						{[135, 140, 145, 150, 155].map((y, i) => (
							<Line key={`fin${i}`} x1="150" y1={y} x2="195" y2={y} stroke="#52525b" strokeWidth="2" />
						))}
						{/* Engine details */}
						<Circle cx="172" cy="180" r="12" fill="none" stroke="#4b5563" strokeWidth="2" />
						<Circle cx="172" cy="180" r="5" fill={getPartColor('engine_oil')} stroke="#52525b" strokeWidth="1" />
						{/* Oil drain */}
						<Rect x="165" y="195" width="14" height="6" rx="1" fill="#374151" stroke="#52525b" strokeWidth="1" />
					</G>
					
					{/* === FUEL TANK === */}
					<G>
						<Path 
							d="M 175,108 Q 200,90 240,95 Q 265,100 268,115 Q 265,130 240,135 Q 200,138 175,125 Q 168,118 175,108" 
							fill={getPartColor('clutch_plates')}
							stroke="#1e3a8a"
							strokeWidth="1"
							opacity="0.9"
						/>
						{/* Tank highlight */}
						<Path d="M 190,100 Q 215,92 240,98" fill="none" stroke="#fff" strokeWidth="2" opacity="0.2" />
						{/* Fuel cap */}
						<Circle cx="220" cy="102" r="6" fill="#374151" stroke="#52525b" strokeWidth="2" />
						<Circle cx="220" cy="102" r="3" fill="#4b5563" />
					</G>
					
					{/* === SEAT === */}
					<G>
						<Path 
							d="M 100,125 Q 110,115 140,112 Q 175,108 175,118 L 170,128 Q 140,135 100,135 Q 95,132 100,125" 
							fill="url(#seatGrad)"
							stroke="#44403c"
							strokeWidth="1"
						/>
						{/* Seat stitching */}
						<Path d="M 110,122 Q 130,118 160,120" fill="none" stroke="#57534e" strokeWidth="0.5" strokeDasharray="3,2" />
					</G>
					
					{/* === BATTERY === */}
					<G>
						<Rect x="115" y="145" width="22" height="18" rx="2" fill={getPartColor('battery_water')} opacity="0.9" />
						<Rect x="117" y="147" width="18" height="14" rx="1" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
						{/* Terminals */}
						<Rect x="119" y="142" width="4" height="4" rx="1" fill={getPartColor('battery_water')} />
						<Rect x="129" y="142" width="4" height="4" rx="1" fill={getPartColor('battery_water')} />
					</G>
					
					{/* === AIR FILTER === */}
					<G>
						<Ellipse cx="215" cy="135" rx="12" ry="8" fill={getPartColor('air_filter_clean')} opacity="0.9" />
						<Ellipse cx="215" cy="135" rx="8" ry="5" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
					</G>
					
					{/* === CARBURETOR === */}
					<G>
						<Rect x="200" y="150" width="14" height="18" rx="2" fill={getPartColor('carburetor')} opacity="0.9" />
						<Rect x="202" y="152" width="10" height="14" rx="1" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
						{/* Intake manifold */}
						<Rect x="214" y="155" width="8" height="6" rx="1" fill={getPartColor('carburetor')} opacity="0.8" />
					</G>
					
					{/* === FRONT FORK === */}
					<G>
						{/* Fork tubes - colored by suspension status */}
						<Rect x="278" y="130" width="6" height="80" rx="2" fill={getPartColor('suspension')} opacity="0.9" />
						<Rect x="290" y="130" width="6" height="80" rx="2" fill={getPartColor('suspension')} opacity="0.9" />
						{/* Fork sliders */}
						<Rect x="276" y="175" width="10" height="35" rx="2" fill="#52525b" />
						<Rect x="288" y="175" width="10" height="35" rx="2" fill="#52525b" />
						{/* Triple clamp */}
						<Rect x="272" y="125" width="30" height="10" rx="3" fill="#4b5563" stroke="#6b7280" strokeWidth="1" />
						<Rect x="275" y="155" width="24" height="6" rx="2" fill="#4b5563" />
					</G>
					
					{/* === HANDLEBAR === */}
					<G>
						<Path 
							d="M 268,118 Q 280,105 295,108 L 315,100 L 325,105 L 320,112 L 300,115 Q 285,118 275,120" 
							fill="none" 
							stroke={getPartColor('cables')} 
							strokeWidth="5" 
							strokeLinecap="round"
							opacity="0.9"
						/>
						{/* Left grip */}
						<Rect x="262" y="115" width="12" height="8" rx="3" fill="#1f2937" stroke="#374151" strokeWidth="1" />
						{/* Right grip */}
						<Rect x="318" y="100" width="14" height="8" rx="3" fill="#1f2937" stroke="#374151" strokeWidth="1" />
						{/* Brake lever */}
						<Path d="M 325,102 L 335,98 L 338,100" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
					</G>
					
					{/* === HEADLIGHT === */}
					<G>
						<Circle cx="320" cy="125" r="12" fill="#fef3c7" stroke="#d4d4d8" strokeWidth="2" />
						<Circle cx="320" cy="125" r="8" fill="#fef9c3" />
						<Circle cx="320" cy="125" r="4" fill="#fefce8" />
					</G>
					
					{/* === TAILLIGHT === */}
					<G>
						<Rect x="88" y="120" width="12" height="8" rx="2" fill="#fca5a5" stroke="#f87171" strokeWidth="1" />
						<Rect x="90" y="122" width="3" height="4" rx="1" fill="#ef4444" />
						<Rect x="95" y="122" width="3" height="4" rx="1" fill="#ef4444" />
					</G>
					
					{/* === EXHAUST === */}
					<G>
						{/* Header pipe */}
						<Path 
							d="M 155,195 Q 140,200 120,205 Q 90,210 70,210" 
							fill="none" 
							stroke="#71717a" 
							strokeWidth="4" 
							strokeLinecap="round"
						/>
						{/* Muffler */}
						<Ellipse cx="55" cy="210" rx="18" ry="10" fill="#52525b" stroke="#71717a" strokeWidth="1" />
						<Ellipse cx="55" cy="210" rx="14" ry="7" fill="#4b5563" />
						{/* Exhaust tip */}
						<Ellipse cx="38" cy="210" rx="4" ry="6" fill="#1f2937" stroke="#4b5563" strokeWidth="1" />
					</G>
					
					{/* === CHAIN === */}
					<G>
						{/* Rear sprocket - colored by chain status */}
						<Circle cx="85" cy="210" r="16" fill="none" stroke={getPartColor('chain')} strokeWidth="4" opacity="0.9" />
						{/* Sprocket teeth */}
						{[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
							<Line 
								key={`rtooth${i}`}
								x1={85 + 14 * Math.cos(angle * Math.PI / 180)}
								y1={210 + 14 * Math.sin(angle * Math.PI / 180)}
								x2={85 + 18 * Math.cos(angle * Math.PI / 180)}
								y2={210 + 18 * Math.sin(angle * Math.PI / 180)}
								stroke={getPartColor('chain')}
								strokeWidth="2"
								opacity="0.8"
							/>
						))}
						{/* Front sprocket */}
						<Circle cx="160" cy="195" r="10" fill={getPartColor('chain')} stroke="#6b7280" strokeWidth="2" opacity="0.8" />
						{/* Chain links - top */}
						<Path 
							d="M 100,207 L 150,193" 
							fill="none" 
							stroke={getPartColor('chain')} 
							strokeWidth="4"
							strokeDasharray="4,2"
							opacity="0.9"
						/>
						{/* Chain links - bottom */}
						<Path 
							d="M 70,215 Q 110,225 150,200" 
							fill="none" 
							stroke={getPartColor('chain')} 
							strokeWidth="3"
							strokeDasharray="4,2"
							opacity="0.7"
						/>
					</G>
					
					{/* === LABELS WITH POINTERS === */}
					
					{/* Tire Pressure - rear wheel */}
					<PartLabel x={85} y={240} labelX={25} labelY={280} label="TIRE PRESSURE" align="start" />
					
					{/* Brakes - front wheel disc */}
					<PartLabel x={295} y={195} labelX={355} labelY={175} label="BRAKES" align="end" />
					
					{/* Engine Oil */}
					<PartLabel x={172} y={180} labelX={230} labelY={230} label="ENGINE OIL" align="start" />
					
					{/* Chain */}
					<PartLabel x={125} y={200} labelX={75} labelY={240} label="CHAIN" align="start" />
					
					{/* Battery */}
					<PartLabel x={126} y={154} labelX={60} labelY={130} label="BATTERY" align="start" />
					
					{/* Spark Plug */}
					<PartLabel x={172} y={125} labelX={125} labelY={95} label="SPARK PLUG" align="start" />
					
					{/* Air Filter */}
					<PartLabel x={215} y={135} labelX={250} labelY={75} label="AIR FILTER" align="start" />
					
					{/* Carburetor */}
					<PartLabel x={207} y={159} labelX={255} labelY={185} label="CARBURETOR" align="start" />
					
					{/* Suspension */}
					<PartLabel x={287} y={155} labelX={340} labelY={130} label="SUSPENSION" align="end" />
					
					{/* Cables */}
					<PartLabel x={295} y={110} labelX={350} labelY={85} label="CABLES" align="end" />
					
					{/* Clutch / Tank */}
					<PartLabel x={240} y={115} labelX={295} labelY={55} label="CLUTCH/TANK" align="end" />
					
					{/* Wiring */}
					<PartLabel x={200} y={120} labelX={175} labelY={55} label="WIRING" align="start" />
					
				</Svg>
			</View>
			
			{/* Status Legend */}
			<View style={styles.legend}>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: '#4ade80' }]} />
					<Text style={styles.legendText}>Good</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: '#a3e635' }]} />
					<Text style={styles.legendText}>Fair</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: '#fbbf24' }]} />
					<Text style={styles.legendText}>Worn</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: '#f87171' }]} />
					<Text style={styles.legendText}>Critical</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#0f172a',
		borderRadius: 16,
		marginBottom: spacing.medium,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#1e3a5f',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: spacing.medium,
		gap: 8,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
		color: '#60a5fa',
	},
	subtitle: {
		fontSize: 11,
		color: '#64748b',
		textAlign: 'center',
		marginBottom: spacing.small,
	},
	svgContainer: {
		alignItems: 'center',
		padding: spacing.small,
	},
	legend: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingVertical: spacing.small,
		paddingHorizontal: spacing.medium,
		backgroundColor: '#1e293b',
		borderTopWidth: 1,
		borderTopColor: '#334155',
	},
	legendItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	legendDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 6,
	},
	legendText: {
		color: '#90caf9',
		fontSize: 11,
	},
});

export default VehicleDiagnostic;
