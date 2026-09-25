import 'package:test/test.dart';
import 'package:api_client_dart/api_client_dart.dart';


/// tests for OperatorStopPointsApi
void main() {
  final instance = ApiClientDart().getOperatorStopPointsApi();

  group(OperatorStopPointsApi, () {
    //Future<OperatorStopPointResponseDtoOutput> stopPointControllerCreate(OperatorStopPointInputDto operatorStopPointInputDto) async
    test('test stopPointControllerCreate', () async {
      // TODO
    });

    //Future<OperatorStopPointResponseDtoOutput> stopPointControllerGet(String stopPointId) async
    test('test stopPointControllerGet', () async {
      // TODO
    });

    //Future<OperatorStopPointListResponseDtoOutput> stopPointControllerList({ String status, String cursor, num limit }) async
    test('test stopPointControllerList', () async {
      // TODO
    });

    //Future<OperatorStopPointResponseDtoOutput> stopPointControllerUpdate(String stopPointId, OperatorStopPointInputDto operatorStopPointInputDto) async
    test('test stopPointControllerUpdate', () async {
      // TODO
    });

  });
}
