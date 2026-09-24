import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../config.dart';
import '../models/gps_model.dart';
import '../services/gps_service.dart';
import '../widgets/device_marker.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final _gpsService = GpsService();
  final _mapController = MapController();
  GpsModel? _currentLocation;
  bool _isLive = false;

  late final StreamSubscription<GpsModel> _streamSub;

  @override
  void initState() {
    super.initState();
    _subscribeLocation();
  }

  void _subscribeLocation() {
    const deviceId = kTrackerDeviceId;
    _isLive = true;
    _streamSub = _gpsService.streamLocation(deviceId).listen((location) {
      setState(() {
        _currentLocation = location;
      });
      if (_mapController.ready) {
        _mapController.move(LatLng(location.latitude, location.longitude), 16);
      }
    }, onError: (error) {
      debugPrint('Falha streamLocation: $error');
      setState(() {
        _isLive = false;
      });
    });
  }

  @override
  void dispose() {
    _streamSub.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Stack(
        children: [
          _buildMap(),
          _buildTopBar(theme),
          _buildStatsCard(theme),
        ],
      ),
    );
  }

  Widget _buildMap() {
    final center = _currentLocation != null
        ? LatLng(_currentLocation!.latitude, _currentLocation!.longitude)
        : const LatLng(-5.364, -49.117);

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        center: center,
        zoom: 15,
        maxZoom: 18,
        minZoom: 4,
        interactiveFlags: InteractiveFlag.all,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          subdomains: const ['a', 'b', 'c'],
          userAgentPackageName: 'br.com.cirio.localizaberlinda',
        ),
        if (_currentLocation != null) 
          MarkerLayer(
            markers: [
              Marker(
                point: center,
                width: 90,
                height: 90,
                builder: (context) => DeviceMarker(
                  heading: _currentLocation?.course ?? 0,
                ),
              ),
            ],
          ),
      ],
    );
  }

  Widget _buildTopBar(ThemeData theme) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF5A341C),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.circle,
                    size: 12,
                    color: _isLive ? const Color(0xFF22C55E) : const Color(0xFFF87171),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _isLive ? 'Ao Vivo' : 'Offline',
                    style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF5A341C),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                _currentLocation != null
                    ? 'Atualizado: ${TimeOfDay.fromDateTime(_currentLocation!.timestamp).format(context)}'
                    : 'Aguardando...',
                style: theme.textTheme.bodyMedium?.copyWith(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCard(ThemeData theme) {
    return Positioned(
      left: 16,
      right: 16,
      bottom: 22,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFF5A341C).withOpacity(0.96),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFD4A24C), width: 1.2),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildInfoTile('Velocidade', _currentLocation != null ? '${_currentLocation!.speed.toStringAsFixed(1)} km/h' : '--', theme),
            _buildInfoTile('Status', _currentLocation != null && _currentLocation!.online ? 'Online' : 'Offline', theme),
            _buildInfoTile('IMEI', _currentLocation?.deviceId ?? 'device01', theme),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(String title, String value, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: theme.textTheme.bodyMedium?.copyWith(color: const Color(0xFFD4A24C), fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        Text(value, style: theme.textTheme.titleLarge),
      ],
    );
  }
}
