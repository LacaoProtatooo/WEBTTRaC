import mongoose from 'mongoose';

/**
 * Tracking Record Model - GPS Trip Recording
 * 
 * Stores complete trip data with coordinate arrays for relive/playback
 * Supports geospatial queries for route analysis
 */

// Individual coordinate point schema
const coordinateSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  altitude: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number,
    default: 0,
  },
  speed: {
    type: Number, // m/s
    default: 0,
  },
  heading: {
    type: Number, // degrees 0-360
    default: 0,
  },
  timestamp: {
    type: Date,
    required: true,
  },
}, { _id: false });

// GeoJSON Point for geospatial queries
const geoPointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
}, { _id: false });

const trackingRecordSchema = new mongoose.Schema({
  // Unique trip identifier
  tripId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  // User who recorded the trip (can be guest or logged-in user)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  // Device identifier for anonymous tracking
  deviceId: {
    type: String,
    default: null,
  },

  // Optional associations
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  tricycleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tricycle',
    default: null,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },

  // Trip metadata
  name: {
    type: String,
    default: null, // e.g., "Morning Commute" or auto-generated
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'paused'],
    default: 'active',
    index: true,
  },

  // The GPS coordinates array - main data
  coordinates: [coordinateSchema],

  // Summary statistics (calculated on trip end)
  totalDistance: {
    type: Number, // meters
    default: 0,
  },
  duration: {
    type: Number, // seconds
    default: 0,
  },
  avgSpeed: {
    type: Number, // km/h
    default: 0,
  },
  maxSpeed: {
    type: Number, // km/h
    default: 0,
  },
  elevationGain: {
    type: Number, // meters
    default: 0,
  },

  // Bounding box for quick area queries
  bounds: {
    north: { type: Number, default: null },
    south: { type: Number, default: null },
    east: { type: Number, default: null },
    west: { type: Number, default: null },
  },

  // Start/End points for geospatial queries
  startLocation: geoPointSchema,
  endLocation: geoPointSchema,

  // GPX export info
  gpxFileUrl: {
    type: String,
    default: null,
  },
  gpxPublicId: {
    type: String,
    default: null, // Cloudinary public_id for deletion
  },

  // Sync tracking
  lastSyncAt: {
    type: Date,
    default: null,
  },
  syncCount: {
    type: Number,
    default: 0,
  },

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Geospatial indexes for location queries
trackingRecordSchema.index({ startLocation: '2dsphere' });
trackingRecordSchema.index({ endLocation: '2dsphere' });

// Compound indexes for common queries
trackingRecordSchema.index({ userId: 1, startTime: -1 });
trackingRecordSchema.index({ deviceId: 1, startTime: -1 });
trackingRecordSchema.index({ driverId: 1, startTime: -1 });
trackingRecordSchema.index({ status: 1, startTime: -1 });

// Virtual for formatted duration
trackingRecordSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
});

// Virtual for distance in km
trackingRecordSchema.virtual('distanceKm').get(function() {
  return this.totalDistance ? (this.totalDistance / 1000).toFixed(2) : '0.00';
});

// Method to calculate trip statistics
trackingRecordSchema.methods.calculateStats = function() {
  if (!this.coordinates || this.coordinates.length < 2) {
    return;
  }

  let totalDistance = 0;
  let maxSpeed = 0;
  let totalSpeed = 0;
  let speedCount = 0;
  let elevationGain = 0;
  let lastAltitude = null;

  const bounds = {
    north: -90,
    south: 90,
    east: -180,
    west: 180,
  };

  for (let i = 0; i < this.coordinates.length; i++) {
    const coord = this.coordinates[i];

    // Update bounds
    bounds.north = Math.max(bounds.north, coord.latitude);
    bounds.south = Math.min(bounds.south, coord.latitude);
    bounds.east = Math.max(bounds.east, coord.longitude);
    bounds.west = Math.min(bounds.west, coord.longitude);

    // Calculate distance from previous point
    if (i > 0) {
      const prev = this.coordinates[i - 1];
      const dist = haversineMeters(prev, coord);
      totalDistance += dist;
    }

    // Track speed
    if (coord.speed && coord.speed > 0) {
      const speedKph = coord.speed * 3.6; // m/s to km/h
      maxSpeed = Math.max(maxSpeed, speedKph);
      totalSpeed += speedKph;
      speedCount++;
    }

    // Track elevation gain
    if (coord.altitude != null && lastAltitude != null) {
      const diff = coord.altitude - lastAltitude;
      if (diff > 0) {
        elevationGain += diff;
      }
    }
    if (coord.altitude != null) {
      lastAltitude = coord.altitude;
    }
  }

  // Set calculated values
  this.totalDistance = Math.round(totalDistance);
  this.maxSpeed = Math.round(maxSpeed * 10) / 10;
  this.avgSpeed = speedCount > 0 ? Math.round((totalSpeed / speedCount) * 10) / 10 : 0;
  this.elevationGain = Math.round(elevationGain);
  this.bounds = bounds;

  // Duration
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000);
  } else if (this.coordinates.length >= 2) {
    const first = this.coordinates[0].timestamp;
    const last = this.coordinates[this.coordinates.length - 1].timestamp;
    if (first && last) {
      this.duration = Math.round((new Date(last) - new Date(first)) / 1000);
    }
  }

  // Set start/end locations
  const firstCoord = this.coordinates[0];
  const lastCoord = this.coordinates[this.coordinates.length - 1];
  
  this.startLocation = {
    type: 'Point',
    coordinates: [firstCoord.longitude, firstCoord.latitude],
  };
  this.endLocation = {
    type: 'Point',
    coordinates: [lastCoord.longitude, lastCoord.latitude],
  };
};

// Helper function for haversine distance calculation
function haversineMeters(a, b) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  const φ1 = toRad(a.latitude);
  const φ2 = toRad(b.latitude);
  const Δφ = toRad(b.latitude - a.latitude);
  const Δλ = toRad(b.longitude - a.longitude);
  const aa = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

export default mongoose.model('TrackingRecord', trackingRecordSchema);
