import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, Line, Ellipse, G, Defs, LinearGradient, Stop, Text as SvgText, Polygon } from 'react-native-svg';
import { colors, spacing, fonts } from '../../components/common/theme';
import Constants from 'expo-constants';
import { getToken } from '../../utils/jwtStorage';
import { useAsyncSQLiteContext } from '../../utils/asyncSQliteProvider';

const { width: screenWidth } = Dimensions.get('window');

// Get color based on wear percentage
const getWearColor = (progress) => {
	if (progress < 30) return '#4ade80'; // Good - Green
	if (progress < 60) return '#a3e635'; // Fair - Light Green
	if (progress < 80) return '#fbbf24'; // Worn - Yellow
	if (progress < 100) return '#f87171'; // Critical - Red
	return '#dc2626'; // Overdue - Dark Red
};

// Get glow color for parts
const getGlowColor = (progress) => {
	if (progress < 30) return '#22c55e';
	if (progress < 60) return '#84cc16';
	if (progress < 80) return '#f59e0b';
	return '#ef4444';
};

// Motorcycle Blueprint Component - Realistic Side View
const MotorcycleBlueprint = ({ partsStatus, onPartPress }) => {
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
		<View style={blueprintStyles.container}>
			{/* Header */}
			<View style={blueprintStyles.header}>
				<Ionicons name="construct" size={20} color="#60a5fa" />
				<Text style={blueprintStyles.title}>Vehicle Diagnostic</Text>
			</View>
			<Text style={blueprintStyles.subtitle}>Tap parts to mark as serviced</Text>
			
			<View style={blueprintStyles.svgContainer}>
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
			<View style={blueprintStyles.legend}>
				<View style={blueprintStyles.legendItem}>
					<View style={[blueprintStyles.legendDot, { backgroundColor: '#4ade80' }]} />
					<Text style={blueprintStyles.legendText}>Good</Text>
				</View>
				<View style={blueprintStyles.legendItem}>
					<View style={[blueprintStyles.legendDot, { backgroundColor: '#a3e635' }]} />
					<Text style={blueprintStyles.legendText}>Fair</Text>
				</View>
				<View style={blueprintStyles.legendItem}>
					<View style={[blueprintStyles.legendDot, { backgroundColor: '#fbbf24' }]} />
					<Text style={blueprintStyles.legendText}>Worn</Text>
				</View>
				<View style={blueprintStyles.legendItem}>
					<View style={[blueprintStyles.legendDot, { backgroundColor: '#f87171' }]} />
					<Text style={blueprintStyles.legendText}>Critical</Text>
				</View>
			</View>
		</View>
	);
};

const blueprintStyles = StyleSheet.create({
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

const BACKEND = (Constants?.expoConfig?.extra?.BACKEND_URL) || (Constants?.manifest?.extra?.BACKEND_URL) || 'http://192.168.254.105:5000';
const STORAGE_KEY = 'maintenance_data_v1';

// same key used in BackgroundLocationTask
const KM_KEY = 'vehicle_current_km_v1';

const defaultSchedule = [
	{
		id: 'weekly',
		title: 'Weekly (or every 300–500 km)',
		intervalKm: 500,
		items: [
			{ key: 'tire_pressure', name: 'Tire pressure', notes: 'Recheck and inflate, check for uneven wear' },
			{ key: 'chain', name: 'Chain', notes: 'Clean, lubricate, and adjust' },
			{ key: 'battery_water', name: 'Battery water', notes: 'Top up with distilled water (non-MF)' },
			{ key: 'air_filter_clean', name: 'Air filter (clean)', notes: 'Clean using compressed air' },
			{ key: 'brake_check', name: 'Brake system', notes: 'Check pads/shoes for wear' },
			{ key: 'cables', name: 'Cables', notes: 'Lubricate clutch/throttle cables' },
		],
	},
	{
		id: '1000',
		title: 'Every 1,000 km (monthly heavy use)',
		intervalKm: 1000,
		items: [
			{ key: 'engine_oil', name: 'Engine oil', notes: 'Replace (SAE 10W-40 or 20W-50)' },
			{ key: 'spark_plug', name: 'Spark plug', notes: 'Inspect/clean or replace; gap 0.7–0.8 mm' },
			{ key: 'carburetor', name: 'Carburetor', notes: 'Check idle & mixture' },
			{ key: 'chain_sprockets', name: 'Chain & sprockets', notes: 'Inspect for wear' },
		],
	},
	{
		id: '3000-5000',
		title: 'Every 3,000–5,000 km',
		intervalKm: 4000,
		items: [
			{ key: 'oil_filter', name: 'Oil filter', notes: 'Replace if equipped' },
			{ key: 'air_filter_replace', name: 'Air filter (replace)', notes: 'Replace if dusty/oily' },
			{ key: 'valve_clearance', name: 'Valve clearance', notes: 'Adjust per spec' },
			{ key: 'battery_test', name: 'Battery', notes: 'Test voltage; replace if weak' },
		],
	},
	{
		id: '10000',
		title: 'Every 10,000–12,000 km (or annually)',
		intervalKm: 11000,
		items: [
			{ key: 'brake_fluid_flush', name: 'Brake fluid (flush)', notes: 'Flush & replace' },
			{ key: 'clutch_plates', name: 'Clutch plates', notes: 'Inspect & replace if slipping' },
			{ key: 'suspension', name: 'Suspension', notes: 'Inspect fork oil & shocks' },
		],
	},
	{
		id: '20000',
		title: 'Major service — Every 20,000 km',
		intervalKm: 20000,
		items: [
			{ key: 'engine_overhaul', name: 'Engine overhaul', notes: 'Check rings, valves, gaskets' },
			{ key: 'transmission_oil', name: 'Transmission oil', notes: 'Replace if applicable' },
			{ key: 'wiring_harness', name: 'Wiring harness', notes: 'Replace brittle wiring' },
		],
	},
];

const MaintenanceTracker = ({ tricycleId, serverHistory }) => {
    const db = useAsyncSQLiteContext();
	const [currentKm, setCurrentKm] = useState('');
	const [data, setData] = useState({}); // { itemKey: lastServiceKm }
	const [loaded, setLoaded] = useState(false);
	const [odometerKm, setOdometerKm] = useState(null);

	useEffect(() => {
        loadData();
	}, [tricycleId, serverHistory]);

    const loadData = async () => {
        try {
            // 1. Calculate state from serverHistory
            let serverState = {};
            if (serverHistory && Array.isArray(serverHistory)) {
                serverHistory.forEach(log => {
                    if (serverState[log.itemKey] === undefined || log.lastServiceKm > serverState[log.itemKey]) {
                        serverState[log.itemKey] = log.lastServiceKm;
                    }
                });
            }

            // 2. Load local cache (keyed by tricycleId)
            const key = tricycleId ? `maintenance_data_${tricycleId}` : 'maintenance_data_local';
            const saved = await AsyncStorage.getItem(key);
            let localState = saved ? JSON.parse(saved) : {};

            // 3. Merge (prefer server if available, or max?)
            const merged = { ...localState };
            Object.keys(serverState).forEach(k => {
                if (merged[k] === undefined || serverState[k] > merged[k]) {
                    merged[k] = serverState[k];
                }
            });
            
            setData(merged);
            
            const km = await AsyncStorage.getItem(KM_KEY);
            if (km) setCurrentKm(km);
        } catch (e) {
            console.warn('MaintenanceTracker load error', e);
        } finally {
            setLoaded(true);
        }
    };

	// load once and then poll AsyncStorage so odometer reflects realtime updates
	useEffect(() => {
		let mounted = true;
		const loadOdometer = async () => {
			try {
				const raw = await AsyncStorage.getItem(KM_KEY);
				if (!mounted) return;
				setOdometerKm(raw ? Number(raw) : 0);
			} catch (e) {
				// ignore
			}
		};
		loadOdometer();
		const interval = setInterval(loadOdometer, 2000); // poll every 2s
		return () => { mounted = false; clearInterval(interval); };
	}, []);

	const saveKm = async () => {
		try {
			const v = String(parseInt(currentKm || '0', 10));
			await AsyncStorage.setItem(KM_KEY, v);
			setCurrentKm(v);
			Alert.alert('Saved', `Current odometer set to ${v} km`);
		} catch (e) {
			console.warn('saveKm error', e);
		}
	};

    // Function to save to server
    const saveToServer = async (itemKey, lastServiceKm, notes) => {
        if (!tricycleId || !db) return;
        try {
            const token = await getToken(db);
            await fetch(`${BACKEND}/api/tricycles/${tricycleId}/maintenance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    itemKey,
                    lastServiceKm,
                    notes
                })
            });
        } catch (error) {
            console.error("Failed to sync maintenance to server", error);
        }
    };

	const markDone = async (itemKey) => {
		try {
			const kmNum = parseInt(odometerKm || currentKm || '0', 10);
			const next = { ...data, [itemKey]: kmNum };
            
            // Save to dynamic key
            const key = tricycleId ? `maintenance_data_${tricycleId}` : 'maintenance_data_local';
			await AsyncStorage.setItem(key, JSON.stringify(next));
			setData(next);

            // Sync to server
            await saveToServer(itemKey, kmNum, "Completed via app");
			
			Alert.alert('Success', `${itemKey.replace(/_/g, ' ')} marked as maintained at ${kmNum} km`);
		} catch (e) {
			console.warn('markDone error', e);
		}
	};

	const progressFor = (lastKm, intervalKm) => {
		const cur = parseInt(odometerKm || currentKm || '0', 10);
		const last = parseInt(lastKm || '0', 10);
		const diff = Math.max(0, cur - last);
		const pct = Math.min(100, Math.round((diff / intervalKm) * 100));
		return pct;
	};
	
	// Build parts status for blueprint
	const partsStatus = {};
	defaultSchedule.forEach(group => {
		group.items.forEach(item => {
			const last = data[item.key] || 0;
			const progress = progressFor(last, group.intervalKm);
			partsStatus[item.key] = {
				progress,
				lastService: last,
				nextService: last + group.intervalKm,
				name: item.name
			};
		});
	});

	if (!loaded) return null;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Maintenance Tracker</Text>

            {/* Realtime odometer */}
            <View style={styles.odometerRow}>
                <Text style={styles.odometerLabel}>Odometer</Text>
                <Text style={styles.odometerValue}>{odometerKm !== null ? `${odometerKm.toFixed(3)} km` : '—'}</Text>
            </View>

            {!tricycleId && (
                <Text style={{color: 'red', marginBottom: 10, fontSize: 12}}>
                    No tricycle assigned. Data will be saved locally only.
                </Text>
            )}

			<ScrollView
				nestedScrollEnabled={true}
				contentContainerStyle={{ paddingBottom: spacing.large }}
				showsVerticalScrollIndicator={false}
			>
				{/* Motorcycle Blueprint View */}
				<MotorcycleBlueprint partsStatus={partsStatus} onPartPress={markDone} />
				
				{/* Detailed List View */}
				<Text style={styles.sectionTitle}>Maintenance Schedule Details</Text>
				
				{defaultSchedule.map((group) => (
					<View key={group.id} style={styles.group}>
						<Text style={styles.groupTitle}>{group.title}</Text>
						{group.items.map((it) => {
							const last = data[it.key] || 0;
							const progress = progressFor(last, group.intervalKm);
							const dueKm = last + group.intervalKm;
							const color = getWearColor(progress);
							
							return (
								<View key={it.key} style={styles.card}>
									<View style={[styles.statusIndicator, { backgroundColor: color }]} />
									
									<View style={styles.cardLeft}>
										<Text style={styles.itemName}>{it.name}</Text>
										<Text style={styles.itemNotes}>{it.notes}</Text>
										<Text style={styles.small}>Last: {last} km · Next: {dueKm} km</Text>

										<View style={styles.barBackground}>
											<View style={[styles.barFill, { width: `${progress}%`, backgroundColor: color }]} />
										</View>
										<Text style={[styles.small, { color }]}>{progress}% - {progress < 30 ? 'Good' : progress < 60 ? 'Fair' : progress < 80 ? 'Worn' : 'Critical'}</Text>
									</View>

									<View style={styles.cardRight}>
										<TouchableOpacity style={styles.doneBtn} onPress={() => markDone(it.key)}>
											<Ionicons name="checkmark-done-outline" size={20} color={colors.ivory1} />
										</TouchableOpacity>
									</View>
								</View>
							);
						})}
					</View>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.ivory4,
		padding: spacing.medium,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
		color: colors.orangeShade7,
		marginBottom: spacing.small,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: colors.orangeShade6,
		marginTop: spacing.medium,
		marginBottom: spacing.small,
	},
	kmRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: spacing.small,
	},
	kmInput: {
		flex: 1,
		backgroundColor: colors.ivory1,
		padding: spacing.small,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.ivory3,
	},
	saveBtn: {
		marginLeft: spacing.small,
		backgroundColor: colors.primary,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
	},
	saveText: {
		color: colors.ivory1,
		marginLeft: 6,
		fontWeight: '600',
	},
	group: {
		marginTop: spacing.medium,
	},
	groupTitle: {
		fontSize: 14,
		fontWeight: '700',
		color: colors.orangeShade6,
		marginBottom: spacing.small,
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.ivory1,
		padding: spacing.small,
		borderRadius: 10,
		marginBottom: spacing.small,
		borderWidth: 1,
		borderColor: colors.ivory3,
		position: 'relative',
	},
	statusIndicator: {
		width: 4,
		height: '100%',
		position: 'absolute',
		left: 0,
		top: 0,
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 10,
	},
	cardLeft: { flex: 1, paddingLeft: 8 },
	cardRight: {
		marginLeft: spacing.small,
		alignItems: 'center',
	},
	itemName: { fontWeight: '700', color: colors.orangeShade7 },
	itemNotes: { fontSize: 12, color: colors.orangeShade5, marginBottom: 6 },
	small: { fontSize: 12, color: colors.orangeShade5 },
	barBackground: {
		height: 8,
		backgroundColor: '#eee',
		borderRadius: 6,
		overflow: 'hidden',
		marginTop: spacing.small,
		marginBottom: spacing.xsmall,
	},
	barFill: {
		height: 8,
		backgroundColor: colors.primary,
	},
	doneBtn: {
		backgroundColor: '#28a745',
		padding: 8,
		borderRadius: 8,
	},
	odometerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.ivory1,
		padding: spacing.small,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.ivory3,
		marginBottom: spacing.medium,
	},
	odometerLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: colors.orangeShade6,
	},
	odometerValue: {
		fontSize: 16,
		fontWeight: '700',
		color: colors.orangeShade7,
	},
});

export default MaintenanceTracker;