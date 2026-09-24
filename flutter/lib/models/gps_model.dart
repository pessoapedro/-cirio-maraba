class GpsModel {
  final String deviceId;
  final double latitude;
  final double longitude;
  final double speed;
  final double course;
  final bool online;
  final DateTime timestamp;

  GpsModel({
    required this.deviceId,
    required this.latitude,
    required this.longitude,
    required this.speed,
    required this.course,
    required this.online,
    required this.timestamp,
  });

  factory GpsModel.fromMap(Map<dynamic, dynamic> map, String deviceId) {
    return GpsModel(
      deviceId: deviceId,
      latitude: (map['latitude'] ?? map['lat'] ?? 0).toDouble(),
      longitude: (map['longitude'] ?? map['lng'] ?? map['lon'] ?? 0).toDouble(),
      speed: (map['speed'] ?? map['velocidade'] ?? 0).toDouble(),
      course: (map['course'] ?? map['curso'] ?? map['direction'] ?? 0).toDouble(),
      online: map['online'] == false ? false : true,
      timestamp: DateTime.fromMillisecondsSinceEpoch((map['timestamp'] ?? map['time'] ?? DateTime.now().millisecondsSinceEpoch) as int),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'deviceId': deviceId,
      'latitude': latitude,
      'longitude': longitude,
      'speed': speed,
      'course': course,
      'online': online,
      'timestamp': timestamp.millisecondsSinceEpoch,
    };
  }
}
