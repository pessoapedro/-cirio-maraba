import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'screens/map_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const CirioApp());
}

class CirioApp extends StatelessWidget {
  const CirioApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Localiza a Berlinda',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF23140D),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFD4A24C),
          secondary: Color(0xFFD4A24C),
          background: Color(0xFF23140D),
          surface: Color(0xFF5A341C),
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onBackground: Colors.white,
          onSurface: Colors.white,
        ),
        cardColor: const Color(0xFF5A341C),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Colors.white),
          bodyMedium: TextStyle(color: Colors.white),
          titleLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      home: const MapScreen(),
    );
  }
}
