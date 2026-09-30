import 'package:test/test.dart';
import 'package:api_client_dart/api_client_dart.dart';


/// tests for OperatorTripsApi
void main() {
  final instance = ApiClientDart().getOperatorTripsApi();

  group(OperatorTripsApi, () {
    //Future<TripResponseDtoOutput> tripControllerCreate(TripInputDto tripInputDto) async
    test('test tripControllerCreate', () async {
      // TODO
    });

    //Future<TripResponseDtoOutput> tripControllerGet(String tripId) async
    test('test tripControllerGet', () async {
      // TODO
    });

    //Future<TripListResponseDtoOutput> tripControllerList({ String routeId, String vehicleId, String status, DateTime departureFrom, DateTime departureTo, String cursor, num limit }) async
    test('test tripControllerList', () async {
      // TODO
    });

    //Future<TripResponseDtoOutput> tripControllerUpdate(String tripId, TripInputDto tripInputDto) async
    test('test tripControllerUpdate', () async {
      // TODO
    });

  });
}
