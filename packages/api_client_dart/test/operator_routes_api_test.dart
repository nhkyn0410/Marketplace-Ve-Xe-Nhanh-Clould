import 'package:test/test.dart';
import 'package:api_client_dart/api_client_dart.dart';


/// tests for OperatorRoutesApi
void main() {
  final instance = ApiClientDart().getOperatorRoutesApi();

  group(OperatorRoutesApi, () {
    //Future<RouteResponseDtoOutput> routeControllerCreate(RouteInputDto routeInputDto) async
    test('test routeControllerCreate', () async {
      // TODO
    });

    //Future<RouteResponseDtoOutput> routeControllerGet(String routeId) async
    test('test routeControllerGet', () async {
      // TODO
    });

    //Future<RouteListResponseDtoOutput> routeControllerList({ String status, String cursor, num limit }) async
    test('test routeControllerList', () async {
      // TODO
    });

    //Future<RouteResponseDtoOutput> routeControllerUpdate(String routeId, RouteInputDto routeInputDto) async
    test('test routeControllerUpdate', () async {
      // TODO
    });

  });
}
