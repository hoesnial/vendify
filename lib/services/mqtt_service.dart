import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';

class MqttService {
  static final MqttService _instance = MqttService._internal();
  factory MqttService() => _instance;
  MqttService._internal();

  MqttServerClient? _client;
  bool _isConnected = false;

  // Stream controllers for MQTT events
  final _dispenseResultController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _statusUpdateController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _telemetryController =
      StreamController<Map<String, dynamic>>.broadcast();

  // Getters for streams
  Stream<Map<String, dynamic>> get dispenseResultStream =>
      _dispenseResultController.stream;
  Stream<Map<String, dynamic>> get statusUpdateStream =>
      _statusUpdateController.stream;
  Stream<Map<String, dynamic>> get telemetryStream =>
      _telemetryController.stream;

  bool get isConnected => _isConnected;

  // MQTT Configuration - HiveMQ Cloud (same as backend)
  // MQTT Configuration - HiveMQ Cloud
  // PENTING: Isi dengan Hostname SAJA (tanpa mqtts:// dan tanpa :port)
  static const String defaultBroker =
      '9fde2eecc93040ba86ea98e093528087.s1.eu.hivemq.cloud';
  static const int defaultPort = 8883; // TLS/SSL port

  // ISI USERNAME & PASSWORD HIVEMQ DISINI
  static const String defaultUsername = 'hoescodes';
  static const String defaultPassword = '010702Bdg';

  static const String machineId = 'VM01';

  Future<bool> connect({
    String? brokerUrl,
    int? port,
    String? username,
    String? password,
  }) async {
    try {
      var broker = brokerUrl ?? defaultBroker;
      final brokerPort = port ?? defaultPort;
      final user = username ?? defaultUsername;
      final pass = password ?? defaultPassword;

      // Sanitize broker URL (remove protocol and port if pasted by mistake)
      broker = broker.replaceAll('mqtts://', '').replaceAll('mqtt://', '');
      if (broker.contains(':')) {
        broker = broker.split(':')[0];
      }

      print('🔌 Connecting to MQTT broker: $broker:$brokerPort');

      // Create unique client ID
      final clientId =
          'flutter_vending_${DateTime.now().millisecondsSinceEpoch}';

      _client = MqttServerClient.withPort(broker, clientId, brokerPort);
      _client!.logging(on: true); // Enable logging for debugging
      _client!.keepAlivePeriod = 60;
      _client!.autoReconnect = true;
      _client!.secure = true; // Enable TLS for secure connection
      _client!.securityContext = SecurityContext.defaultContext;
      _client!.onAutoReconnect = () {
        print('🔄 MQTT Auto-reconnecting...');
      };
      _client!.onAutoReconnected = () {
        print('✅ MQTT Auto-reconnected');
        _isConnected = true;
        _setupSubscriptions();
      };
      _client!.onDisconnected = () {
        print('🔌 MQTT Disconnected');
        _isConnected = false;
      };
      _client!.onConnected = () {
        print('✅ MQTT Connected');
        _isConnected = true;
      };

      // Set connection message
      final connMessage = MqttConnectMessage()
          .withClientIdentifier(clientId)
          .withWillTopic('vm/$machineId/status')
          .withWillMessage(
            '{"status":"offline","timestamp":"${DateTime.now().toIso8601String()}"}',
          )
          .startClean()
          .withWillQos(MqttQos.atLeastOnce)
          .authenticateAs(user, pass); // Always authenticate with HiveMQ

      _client!.connectionMessage = connMessage;

      // Connect with credentials
      try {
        await _client!.connect(user, pass);
      } on NoConnectionException catch (e) {
        print('❌ MQTT Connection Exception: $e');
        _client!.disconnect();
        return false;
      } on SocketException catch (e) {
        print('❌ MQTT Socket Exception: $e');
        _client!.disconnect();
        return false;
      }

      if (_client!.connectionStatus!.state == MqttConnectionState.connected) {
        print('✅ MQTT client connected successfully');
        _setupSubscriptions();
        _setupMessageListener();
        return true;
      } else {
        print('❌ MQTT connection failed: ${_client!.connectionStatus}');
        _client!.disconnect();
        return false;
      }
    } catch (e) {
      print('❌ MQTT connection error: $e');
      return false;
    }
  }

  void _setupSubscriptions() {
    if (_client == null || !_isConnected) {
      print('⚠️ Cannot setup subscriptions - not connected');
      return;
    }

    // Subscribe to machine topics
    final topics = [
      'vm/$machineId/dispense_result',
      'vm/$machineId/status',
      'vm/$machineId/telemetry',
    ];

    for (final topic in topics) {
      _client!.subscribe(topic, MqttQos.atLeastOnce);
      print('📡 Subscribed to: $topic');
    }
  }

  void _setupMessageListener() {
    _client!.updates!.listen((List<MqttReceivedMessage<MqttMessage>> messages) {
      for (final message in messages) {
        final topic = message.topic;
        final MqttPublishMessage receivedMessage =
            message.payload as MqttPublishMessage;
        final payload = MqttPublishPayload.bytesToStringAsString(
          receivedMessage.payload.message,
        );

        print('📥 MQTT Message [$topic]: $payload');

        try {
          final data = jsonDecode(payload) as Map<String, dynamic>;
          _handleMessage(topic, data);
        } catch (e) {
          print('❌ Error parsing MQTT message: $e');
        }
      }
    });
  }

  void _handleMessage(String topic, Map<String, dynamic> data) {
    if (topic.contains('dispense_result')) {
      _dispenseResultController.add(data);
    } else if (topic.contains('status')) {
      _statusUpdateController.add(data);
    } else if (topic.contains('telemetry')) {
      _telemetryController.add(data);
    }
  }

  // Publish dispense command
  bool publishDispenseCommand({required String orderId, required int slot}) {
    if (!_isConnected || _client == null) {
      print('❌ Cannot publish - MQTT not connected');
      return false;
    }

    try {
      final topic = 'vm/$machineId/dispend';
      final payload = jsonEncode({
        'cmd': 'dispense',
        'orderId': orderId,
        'slot': slot,
        'timestamp': DateTime.now().toIso8601String(),
      });

      final builder = MqttClientPayloadBuilder();
      builder.addString(payload);

      _client!.publishMessage(topic, MqttQos.atLeastOnce, builder.payload!);

      print('📤 Published dispense command to $topic: $payload');
      return true;
    } catch (e) {
      print('❌ Error publishing dispense command: $e');
      return false;
    }
  }

  // Publish status update
  bool publishStatus(String status) {
    if (!_isConnected || _client == null) {
      return false;
    }

    try {
      final topic = 'vm/$machineId/mobile_status';
      final payload = jsonEncode({
        'status': status,
        'timestamp': DateTime.now().toIso8601String(),
      });

      final builder = MqttClientPayloadBuilder();
      builder.addString(payload);

      _client!.publishMessage(topic, MqttQos.atLeastOnce, builder.payload!);
      return true;
    } catch (e) {
      print('❌ Error publishing status: $e');
      return false;
    }
  }

  // Publish Simulated Dispense Result (For Dev/Testing without ESP32)
  bool publishSimulatedDispenseResult({
    required String orderId,
    required int slot,
  }) {
    if (!_isConnected || _client == null) {
      return false;
    }

    try {
      final topic = 'vm/$machineId/dispense_result';
      final payload = jsonEncode({
        'orderId': orderId,
        'slot': slot,
        'success': true,
        'dropDetected': true,
        'timestamp': DateTime.now().toIso8601String(),
        'message': 'Simulated dispense success',
      });

      final builder = MqttClientPayloadBuilder();
      builder.addString(payload);

      _client!.publishMessage(topic, MqttQos.atLeastOnce, builder.payload!);
      print('🧪 Published SIMULATED SUCCESS to $topic: $payload');
      return true;
    } catch (e) {
      print('❌ Error publishing simulated result: $e');
      return false;
    }
  }

  void disconnect() {
    _client?.disconnect();
    _isConnected = false;
    print('🔌 MQTT Disconnected');
  }

  void dispose() {
    disconnect();
    _dispenseResultController.close();
    _statusUpdateController.close();
    _telemetryController.close();
  }
}
