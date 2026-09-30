import 'package:test/test.dart';
import 'package:api_client_dart/api_client_dart.dart';


/// tests for OperatorFaresApi
void main() {
  final instance = ApiClientDart().getOperatorFaresApi();

  group(OperatorFaresApi, () {
    //Future<FareResponseDtoOutput> fareControllerCreate(FareCreateInputDto fareCreateInputDto) async
    test('test fareControllerCreate', () async {
      // TODO
    });

    //Future<FareResponseDtoOutput> fareControllerGet(String fareId) async
    test('test fareControllerGet', () async {
      // TODO
    });

    //Future<FareListResponseDtoOutput> fareControllerList({ String routeId, String status, String cursor, num limit }) async
    test('test fareControllerList', () async {
      // TODO
    });

    //Future<FareRevisionListResponseDtoOutput> fareControllerRevisions(String fareId, { DateTime cursor, num limit }) async
    test('test fareControllerRevisions', () async {
      // TODO
    });

    //Future<FareResponseDtoOutput> fareControllerUpdate(String fareId, FareUpdateInputDto fareUpdateInputDto) async
    test('test fareControllerUpdate', () async {
      // TODO
    });

  });
}
