import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, Line, Ellipse, G, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
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

// Motorcycle Blueprint Component - Realistic Side View
const VehicleDiagnostic = ({ partsStatus, onPartPress }) => {
	const getPartColor = (key) => {
		const progress = partsStatus[key]?.progress || 0;
		return getWearColor(progress);
	};
	
	const getPartProgress = (key) => {
		return partsStatus[key]?.progress || 0;
	};

	const svgWidth = screenWidth - 32;
	const svgHeight = 280;

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Ionicons name="construct" size={20} color="#60a5fa" />
				<Text style={styles.title}>Vehicle Diagnostic</Text>
			</View>
			<Text style={styles.subtitle}>Tap parts to mark as serviced</Text>
			
			<View style={styles.svgContainer}>
				<Svg width={svgWidth} height={svgHeight} viewBox="0 0 380 260">
					<Defs>
						{/* Gradients */}
						<LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0" stopColor="#1e3a5f" stopOpacity="1" />
							<Stop offset="1" stopColor="#0f172a" stopOpacity="1" />
						</LinearGradient>
						<LinearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
							<Stop offset="0" stopColor="#64748b" stopOpacity="1" />
							<Stop offset="1" stopColor="#334155" stopOpacity="1" />
						</LinearGradient>
						<LinearGradient id="tireGrad" x1="0" y1="0" x2="1" y2="1">
							<Stop offset="0" stopColor="#374151" stopOpacity="1" />
							<Stop offset="1" stopColor="#1f2937" stopOpacity="1" />
						</LinearGradient>
					</Defs>
					
					{/* Background */}
					<Rect x="0" y="0" width="380" height="260" fill="url(#bgGrad)" rx="8" />
					
					{/* Grid lines */}
					{[40, 80, 120, 160, 200, 240].map(y => (
						<Line key={`h${y}`} x1="0" y1={y} x2="380" y2={y} stroke="#1e40af" strokeWidth="0.3" strokeOpacity="0.3" />
					))}
					{[40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => (
						<Line key={`v${x}`} x1={x} y1="0" x2={x} y2="260" stroke="#1e40af" strokeWidth="0.3" strokeOpacity="0.3" />
					))}
					
					{/* Ground line */}
					<Line x1="20" y1="220" x2="360" y2="220" stroke="#475569" strokeWidth="1" strokeDasharray="8,4" />
					
					{/* === REAR WHEEL - tire_pressure === */}
					<G onPress={() => onPartPress('tire_pressure')}>
						{/* Outer tire */}
						<Circle cx="85" cy="175" r="42" fill="url(#tireGrad)" stroke={getPartColor('tire_pressure')} strokeWidth="3" />
						{/* Tire tread pattern */}
						<Circle cx="85" cy="175" r="38" fill="none" stroke="#4b5563" strokeWidth="4" strokeDasharray="6,4" />
						{/* Rim */}
						<Circle cx="85" cy="175" r="28" fill="none" stroke="#94a3b8" strokeWidth="2" />
						<Circle cx="85" cy="175" r="20" fill="none" stroke="#64748b" strokeWidth="1" />
						{/* Hub */}
						<Circle cx="85" cy="175" r="8" fill={getPartColor('tire_pressure')} />
						{/* Spokes */}
						{[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
							<Line 
								key={`rspoke${i}`}
								x1={85 + 10 * Math.cos(angle * Math.PI / 180)}
								y1={175 + 10 * Math.sin(angle * Math.PI / 180)}
								x2={85 + 26 * Math.cos(angle * Math.PI / 180)}
								y2={175 + 26 * Math.sin(angle * Math.PI / 180)}
								stroke="#94a3b8"
								strokeWidth="1.5"
							/>
						))}
						{/* Wear indicator */}
						{getPartProgress('tire_pressure') > 50 && (
							<>
								<Path d="M 70,160 Q 75,155 80,162" fill="none" stroke="#92400e" strokeWidth="2" opacity="0.7" />
								<Path d="M 95,185 Q 100,180 98,190" fill="none" stroke="#92400e" strokeWidth="1.5" opacity="0.6" />
							</>
						)}
						{/* Label */}
						<SvgText x="85" y="235" fontSize="8" fill="#94a3b8" textAnchor="middle">REAR TIRE</SvgText>
					</G>
					
					{/* === FRONT WHEEL - brake_check === */}
					<G onPress={() => onPartPress('brake_check')}>
						{/* Outer tire */}
						<Circle cx="295" cy="175" r="42" fill="url(#tireGrad)" stroke={getPartColor('brake_check')} strokeWidth="3" />
						{/* Tire tread */}
						<Circle cx="295" cy="175" r="38" fill="none" stroke="#4b5563" strokeWidth="4" strokeDasharray="6,4" />
						{/* Rim */}
						<Circle cx="295" cy="175" r="28" fill="none" stroke="#94a3b8" strokeWidth="2" />
						<Circle cx="295" cy="175" r="20" fill="none" stroke="#64748b" strokeWidth="1" />
						{/* Brake disc */}
						<Circle cx="295" cy="175" r="16" fill="none" stroke={getPartColor('brake_check')} strokeWidth="3" />
						{/* Hub */}
						<Circle cx="295" cy="175" r="6" fill={getPartColor('brake_check')} />
						{/* Spokes */}
						{[0, 60, 120, 180, 240, 300].map((angle, i) => (
							<Line 
								key={`fspoke${i}`}
								x1={295 + 8 * Math.cos(angle * Math.PI / 180)}
								y1={175 + 8 * Math.sin(angle * Math.PI / 180)}
								x2={295 + 26 * Math.cos(angle * Math.PI / 180)}
								y2={175 + 26 * Math.sin(angle * Math.PI / 180)}
								stroke="#94a3b8"
								strokeWidth="1.5"
							/>
						))}
						{/* Wear - brake marks */}
						{getPartProgress('brake_check') > 50 && (
							<Circle cx="295" cy="175" r="14" fill="none" stroke="#713f12" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
						)}
						<SvgText x="295" y="235" fontSize="8" fill="#94a3b8" textAnchor="middle">BRAKES</SvgText>
					</G>
					
					{/* === MAIN FRAME - wiring_harness === */}
					<G onPress={() => onPartPress('wiring_harness')}>
						{/* Main frame tubes */}
						<Path 
							d="M 115,175 L 135,130 L 200,100 L 260,95 L 285,130" 
							fill="none" 
							stroke={getPartColor('wiring_harness')} 
							strokeWidth="6" 
							strokeLinecap="round"
						/>
						<Path 
							d="M 135,130 L 150,175" 
							fill="none" 
							stroke={getPartColor('wiring_harness')} 
							strokeWidth="5" 
							strokeLinecap="round"
						/>
						{/* Down tube */}
						<Path 
							d="M 200,100 L 175,165" 
							fill="none" 
							stroke={getPartColor('wiring_harness')} 
							strokeWidth="4" 
							strokeLinecap="round"
						/>
						{/* Wiring harness effect */}
						{getPartProgress('wiring_harness') > 60 && (
							<>
								<Circle cx="170" cy="115" r="3" fill="#fbbf24" opacity="0.8" />
								<Circle cx="230" cy="98" r="2" fill="#fbbf24" opacity="0.7" />
							</>
						)}
					</G>
					
					{/* === ENGINE BLOCK - engine_oil === */}
					<G onPress={() => onPartPress('engine_oil')}>
						{/* Engine casing */}
						<Rect x="145" y="130" width="55" height="45" rx="4" fill={getPartColor('engine_oil')} opacity="0.9" />
						<Rect x="148" y="133" width="49" height="39" rx="3" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
						{/* Cylinder head */}
						<Rect x="155" y="118" width="35" height="15" rx="2" fill={getPartColor('engine_oil')} />
						{/* Cooling fins */}
						{[120, 124, 128, 132].map((y, i) => (
							<Line key={`fin${i}`} x1="152" y1={y} x2="193" y2={y} stroke="#334155" strokeWidth="1" />
						))}
						{/* Oil fill cap */}
						<Circle cx="185" cy="155" r="5" fill="#334155" stroke="#fff" strokeWidth="1" />
						{/* Engine details */}
						<Circle cx="160" cy="152" r="8" fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
						{/* Wear - oil stains */}
						{getPartProgress('engine_oil') > 50 && (
							<>
								<Ellipse cx="155" cy="172" rx="8" ry="3" fill="#78350f" opacity="0.5" />
								<Circle cx="190" cy="168" r="4" fill="#78350f" opacity="0.4" />
							</>
						)}
						<SvgText x="172" y="190" fontSize="8" fill="#94a3b8" textAnchor="middle">ENGINE</SvgText>
					</G>
					
					{/* === CHAIN - chain === */}
					<G onPress={() => onPartPress('chain')}>
						{/* Rear sprocket */}
						<Circle cx="85" cy="175" r="14" fill="none" stroke={getPartColor('chain')} strokeWidth="3" />
						{/* Front sprocket */}
						<Circle cx="155" cy="165" r="10" fill="none" stroke={getPartColor('chain')} strokeWidth="3" />
						{/* Chain path */}
						<Path 
							d="M 99,175 L 145,165" 
							fill="none" 
							stroke={getPartColor('chain')} 
							strokeWidth="4"
							strokeDasharray="4,2"
						/>
						<Path 
							d="M 71,175 Q 100,190 145,175 L 165,165" 
							fill="none" 
							stroke={getPartColor('chain')} 
							strokeWidth="3"
							strokeDasharray="4,2"
							opacity="0.7"
						/>
						{/* Wear - rust */}
						{getPartProgress('chain') > 50 && (
							<Path d="M 110,170 L 130,167" stroke="#a16207" strokeWidth="3" opacity="0.6" />
						)}
					</G>
					
					{/* === FUEL TANK - clutch_plates === */}
					<G onPress={() => onPartPress('clutch_plates')}>
						<Path 
							d="M 185,85 Q 210,70 245,75 Q 265,80 265,95 Q 260,105 235,108 Q 200,110 185,100 Z" 
							fill={getPartColor('clutch_plates')}
							stroke="#fff"
							strokeWidth="1"
							opacity="0.9"
						/>
						{/* Tank cap */}
						<Circle cx="220" cy="82" r="5" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
						{/* Highlight */}
						<Path d="M 200,82 Q 215,75 235,78" fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
						<SvgText x="225" y="115" fontSize="7" fill="#94a3b8" textAnchor="middle">TANK</SvgText>
					</G>
					
					{/* === SEAT === */}
					<Path 
						d="M 175,95 Q 195,85 230,87 Q 250,90 250,98 L 245,102 Q 210,105 175,100 Z" 
						fill="#1f2937"
						stroke="#374151"
						strokeWidth="1"
					/>
					
					{/* === CARBURETOR - carburetor === */}
					<G onPress={() => onPartPress('carburetor')}>
						<Rect x="195" y="135" width="18" height="22" rx="2" fill={getPartColor('carburetor')} />
						<Rect x="198" y="138" width="12" height="16" rx="1" fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
						{/* Intake */}
						<Rect x="213" y="142" width="12" height="8" rx="1" fill={getPartColor('carburetor')} opacity="0.8" />
						<SvgText x="210" y="167" fontSize="6" fill="#94a3b8" textAnchor="middle">CARB</SvgText>
					</G>
					
					{/* === AIR FILTER - air_filter_clean === */}
					<G onPress={() => onPartPress('air_filter_clean')}>
						<Ellipse cx="235" cy="140" rx="15" ry="10" fill={getPartColor('air_filter_clean')} />
						<Ellipse cx="235" cy="140" rx="11" ry="7" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
						{/* Filter element lines */}
						{[-6, -3, 0, 3, 6].map((offset, i) => (
							<Line key={`filt${i}`} x1={229 + offset} y1="134" x2={229 + offset} y2="146" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
						))}
						{/* Dirty filter */}
						{getPartProgress('air_filter_clean') > 50 && (
							<Ellipse cx="235" cy="140" rx="10" ry="6" fill="#78350f" opacity="0.4" />
						)}
					</G>
					
					{/* === SPARK PLUG - spark_plug === */}
					<G onPress={() => onPartPress('spark_plug')}>
						<Rect x="167" y="105" width="8" height="14" rx="1" fill={getPartColor('spark_plug')} />
						<Rect x="169" y="100" width="4" height="6" fill={getPartColor('spark_plug')} />
						{/* Spark effect when good */}
						{getPartProgress('spark_plug') < 30 && (
							<>
								<Line x1="165" y1="98" x2="160" y2="93" stroke="#fbbf24" strokeWidth="1.5" />
								<Line x1="177" y1="98" x2="182" y2="93" stroke="#fbbf24" strokeWidth="1.5" />
								<Line x1="171" y1="97" x2="171" y2="90" stroke="#fbbf24" strokeWidth="1.5" />
							</>
						)}
					</G>
					
					{/* === BATTERY - battery_water === */}
					<G onPress={() => onPartPress('battery_water')}>
						<Rect x="130" y="95" width="28" height="20" rx="2" fill={getPartColor('battery_water')} />
						<Rect x="133" y="98" width="22" height="14" rx="1" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
						{/* Terminals */}
						<Rect x="137" y="91" width="4" height="5" fill={getPartColor('battery_water')} />
						<Rect x="149" y="91" width="4" height="5" fill={getPartColor('battery_water')} />
						<SvgText x="139" y="107" fontSize="6" fill="#fff" fontWeight="bold">+</SvgText>
						<SvgText x="151" y="107" fontSize="6" fill="#fff" fontWeight="bold">-</SvgText>
						{/* Low battery indicator */}
						{getPartProgress('battery_water') > 60 && (
							<Path d="M 135,112 L 155,100" stroke="#dc2626" strokeWidth="2" opacity="0.7" />
						)}
					</G>
					
					{/* === FRONT FORK/SUSPENSION - suspension === */}
					<G onPress={() => onPartPress('suspension')}>
						{/* Fork tubes */}
						<Rect x="280" y="100" width="6" height="75" rx="2" fill={getPartColor('suspension')} />
						<Rect x="290" y="100" width="6" height="75" rx="2" fill={getPartColor('suspension')} />
						{/* Fork spring detail */}
						<Path d="M 283,110 L 283,165 M 293,110 L 293,165" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
						{/* Triple clamp */}
						<Rect x="276" y="95" width="24" height="8" rx="2" fill="#64748b" />
						{/* Wear - oil leak */}
						{getPartProgress('suspension') > 60 && (
							<Ellipse cx="288" cy="172" rx="6" ry="2" fill="#78350f" opacity="0.5" />
						)}
					</G>
					
					{/* === HANDLEBAR & CABLES - cables === */}
					<G onPress={() => onPartPress('cables')}>
						{/* Handlebar */}
						<Path 
							d="M 275,85 Q 288,75 300,80 L 310,75 L 315,80 L 310,85" 
							fill="none" 
							stroke={getPartColor('cables')} 
							strokeWidth="4" 
							strokeLinecap="round"
						/>
						{/* Grips */}
						<Rect x="305" y="72" width="12" height="8" rx="2" fill="#1f2937" />
						<Rect x="270" y="82" width="10" height="6" rx="2" fill="#1f2937" />
						{/* Cables */}
						<Path d="M 285,88 Q 270,100 260,130" fill="none" stroke={getPartColor('cables')} strokeWidth="1.5" opacity="0.7" />
						{/* Cable wear */}
						{getPartProgress('cables') > 60 && (
							<Circle cx="275" cy="100" r="3" fill="#a16207" opacity="0.7" />
						)}
					</G>
					
					{/* === HEADLIGHT === */}
					<Circle cx="315" cy="95" r="10" fill="#fef3c7" stroke="#94a3b8" strokeWidth="2" />
					<Circle cx="315" cy="95" r="6" fill="#fef9c3" />
					
					{/* === TAILLIGHT === */}
					<Rect x="90" y="105" width="15" height="8" rx="2" fill="#fca5a5" stroke="#94a3b8" strokeWidth="1" />
					
					{/* === EXHAUST === */}
					<Path 
						d="M 145,170 L 80,175 L 70,178 Q 55,180 50,175 L 50,172 Q 55,168 70,170 L 145,165" 
						fill="#475569" 
						stroke="#64748b" 
						strokeWidth="1"
					/>
					<Ellipse cx="50" cy="174" rx="4" ry="5" fill="#1f2937" />
					
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
