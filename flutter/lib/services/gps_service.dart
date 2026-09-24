import 'dart:async';

import 'package:firebase_database/firebase_database.dart';
import '../config.dart';
import '../models/gps_model.dart';

class GpsService {
  static const String _rootPath = kGpsFirebaseRoot;
  final DatabaseReference _rootRef = FirebaseDatabase.instance.ref(_rootPath);

  Stream<GpsModel> streamLocation(String deviceId) {
    final ref = _rootRef.child(deviceId);
    return ref.onValue
        .map((event) {
          final data = event.snapshot.value as Map<dynamic, dynamic>?;
          if (data == null) throw StateError('GPS data vazio');
          return GpsModel.fromMap(data, deviceId);
        })
        .where((model) => model.latitude != 0 || model.longitude != 0);
  }
}
