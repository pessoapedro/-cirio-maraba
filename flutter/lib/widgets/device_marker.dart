import 'package:flutter/material.dart';

class DeviceMarker extends StatelessWidget {
  final double heading;
  const DeviceMarker({super.key, required this.heading});

  @override
  Widget build(BuildContext context) {
    return Transform.rotate(
      angle: heading * (3.141592653589793 / 180),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0x33D4A24C),
              boxShadow: [
                BoxShadow(
                  color: const Color(0x66D4A24C),
                  blurRadius: 18,
                  spreadRadius: 4,
                ),
              ],
            ),
          ),
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFD4A24C),
              border: Border.all(color: Colors.white, width: 3),
            ),
            child: const Center(
              child: Icon(
                Icons.location_pin,
                color: Colors.white,
                size: 32,
              ),
            ),
          ),
          Container(
            width: 18,
            height: 18,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
