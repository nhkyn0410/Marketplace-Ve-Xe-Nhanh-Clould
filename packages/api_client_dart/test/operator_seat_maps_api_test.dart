import 'package:test/test.dart';
import 'package:api_client_dart/api_client_dart.dart';


/// tests for OperatorSeatMapsApi
void main() {
  final instance = ApiClientDart().getOperatorSeatMapsApi();

  group(OperatorSeatMapsApi, () {
    //Future<SeatMapResponseDtoOutput> seatMapControllerCreate(SeatMapInputDto seatMapInputDto) async
    test('test seatMapControllerCreate', () async {
      // TODO
    });

    //Future<SeatMapResponseDtoOutput> seatMapControllerGet(String seatMapId) async
    test('test seatMapControllerGet', () async {
      // TODO
    });

    //Future<SeatMapListResponseDtoOutput> seatMapControllerList({ String cursor, num limit }) async
    test('test seatMapControllerList', () async {
      // TODO
    });

    //Future<SeatMapResponseDtoOutput> seatMapControllerUpdate(String seatMapId, SeatMapInputDto seatMapInputDto) async
    test('test seatMapControllerUpdate', () async {
      // TODO
    });

  });
}
