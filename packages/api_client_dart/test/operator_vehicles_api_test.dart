import 'package:test/test.dart';
import 'package:api_client_dart/api_client_dart.dart';


/// tests for OperatorVehiclesApi
void main() {
  final instance = ApiClientDart().getOperatorVehiclesApi();

  group(OperatorVehiclesApi, () {
    //Future<VehicleResponseDtoOutput> vehicleControllerCreate(VehicleInputDto vehicleInputDto) async
    test('test vehicleControllerCreate', () async {
      // TODO
    });

    //Future<VehicleResponseDtoOutput> vehicleControllerGet(String vehicleId) async
    test('test vehicleControllerGet', () async {
      // TODO
    });

    //Future<VehicleListResponseDtoOutput> vehicleControllerList({ String status, String cursor, num limit }) async
    test('test vehicleControllerList', () async {
      // TODO
    });

    //Future<VehicleResponseDtoOutput> vehicleControllerUpdate(String vehicleId, VehicleInputDto vehicleInputDto) async
    test('test vehicleControllerUpdate', () async {
      // TODO
    });

  });
}
